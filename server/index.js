import 'dotenv/config'
import express from 'express'
import mongoose from 'mongoose'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const app = express()
const port = Number(process.env.PORT || 4000)
const host = process.env.HOST || '127.0.0.1'
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/somsat_mission_ops'
const currentDir = path.dirname(fileURLToPath(import.meta.url))
const clientBuild = path.resolve(currentDir, '../dist')

const missionEventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 90 },
  type: { type: String, required: true, enum: ['Deployment', 'Telemetry', 'Communications', 'AI decision', 'Operations'] },
  priority: { type: String, required: true, enum: ['Low', 'Normal', 'High', 'Critical'], default: 'Normal' },
  status: { type: String, required: true, enum: ['Monitoring', 'Active', 'Resolved'], default: 'Monitoring' },
  description: { type: String, required: true, trim: true, maxlength: 500 },
  eventTime: { type: Date, default: Date.now },
}, { timestamps: true, collection: 'mission_events' })

const MissionEvent = mongoose.model('MissionEvent', missionEventSchema)

app.use(express.json({ limit: '16kb' }))

// Generate an event description with the locally running Ollama model.
app.post('/api/generate-description', async (request, response) => {
  const { title, type, priority, status } = request.body || {}
  if (![title, type, priority, status].every((value) => typeof value === 'string' && value.trim())) {
    return response.status(400).json({ message: 'Enter the title, type, priority, and status first.' })
  }
  // Bound inputs to prevent unexpectedly large prompts.
  const safeTitle = title.trim().slice(0, 90)
  const safeType = type.trim().slice(0, 40)
  const safePriority = priority.trim().slice(0, 20)
  const safeStatus = status.trim().slice(0, 20)
  const prompt = `Write a concise, professional mission-operations event description. Use 1-3 sentences and no more than 80 words. Do not invent measurements, causes, or actions. Return only the description.\n\nEvent title: ${safeTitle}\nType: ${safeType}\nPriority: ${safePriority}\nStatus: ${safeStatus}`
  try {
    const ollamaResponse = await fetch(`${process.env.OLLAMA_URL || 'http://127.0.0.1:11434'}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: process.env.OLLAMA_MODEL || 'llama3.2', prompt, stream: false }),
      signal: AbortSignal.timeout(60000),
    })
    const result = await ollamaResponse.json().catch(() => ({}))
    if (!ollamaResponse.ok) {
      return response.status(502).json({ message: result.error || 'Ollama could not generate the description. Check the model name.' })
    }
    const description = result.response?.trim()
    if (!description) return response.status(502).json({ message: 'Ollama returned an empty description.' })
    return response.json({ description: description.slice(0, 500) })
  } catch (error) {
    const message = error.name === 'TimeoutError'
      ? 'Ollama took too long to respond. Try again.'
      : 'Cannot connect to Ollama. Make sure Ollama is running and the model is installed.'
    return response.status(503).json({ message })
  }
})


function databaseReady(_request, response, next) {
  if (mongoose.connection.readyState !== 1) {
    return response.status(503).json({ message: 'MongoDB is not connected. Start MongoDB and try again.' })
  }
  return next()
}

function eventFields(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return {}
  const fields = ['title', 'type', 'priority', 'status', 'description']
  return Object.fromEntries(fields.filter((field) => Object.hasOwn(body, field)).map((field) => [field, body[field]]))
}

function sendRouteError(response, error) {
  if (error.name === 'ValidationError') {
    const message = Object.values(error.errors).map((entry) => entry.message).join(' ')
    return response.status(400).json({ message })
  }
  if (error.name === 'CastError') {
    return response.status(400).json({ message: 'Invalid mission event identifier.' })
  }
  console.error('Mission event request failed:', error.message)
  return response.status(500).json({ message: 'The mission records request failed.' })
}

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' })
})

app.get('/api/events', databaseReady, async (_request, response) => {
  try {
    const events = await MissionEvent.find().sort({ eventTime: -1, createdAt: -1 }).lean()
    return response.json({ events })
  } catch (error) {
    return sendRouteError(response, error)
  }
})

app.post('/api/events', databaseReady, async (request, response) => {
  try {
    const event = await MissionEvent.create(eventFields(request.body))
    return response.status(201).json({ event })
  } catch (error) {
    return sendRouteError(response, error)
  }
})

app.get('/api/events/:id', databaseReady, async (request, response) => {
  if (!mongoose.isValidObjectId(request.params.id)) {
    return response.status(400).json({ message: 'Invalid mission event identifier.' })
  }
  try {
    const event = await MissionEvent.findById(request.params.id).lean()
    if (!event) return response.status(404).json({ message: 'Mission event not found.' })
    return response.json({ event })
  } catch (error) {
    return sendRouteError(response, error)
  }
})

app.patch('/api/events/:id', databaseReady, async (request, response) => {
  if (!mongoose.isValidObjectId(request.params.id)) {
    return response.status(400).json({ message: 'Invalid mission event identifier.' })
  }
  const updates = eventFields(request.body)
  if (Object.keys(updates).length === 0) {
    return response.status(400).json({ message: 'Provide at least one event field to update.' })
  }
  try {
    const event = await MissionEvent.findByIdAndUpdate(request.params.id, updates, { returnDocument: 'after', runValidators: true })
    if (!event) return response.status(404).json({ message: 'Mission event not found.' })
    return response.json({ event })
  } catch (error) {
    return sendRouteError(response, error)
  }
})

app.delete('/api/events/:id', databaseReady, async (request, response) => {
  if (!mongoose.isValidObjectId(request.params.id)) {
    return response.status(400).json({ message: 'Invalid mission event identifier.' })
  }
  try {
    const event = await MissionEvent.findByIdAndDelete(request.params.id)
    if (!event) return response.status(404).json({ message: 'Mission event not found.' })
    return response.json({ message: 'Mission event deleted.', id: event.id })
  } catch (error) {
    return sendRouteError(response, error)
  }
})

app.use('/api', (_request, response) => response.status(404).json({ message: 'API endpoint not found.' }))
app.use(express.static(clientBuild))
app.use((request, response, next) => {
  if (request.method !== 'GET') return next()
  response.sendFile(path.join(clientBuild, 'index.html'), (error) => error && next())
})

app.use((error, _request, response, _next) => {
  if (error instanceof SyntaxError && 'body' in error) {
    return response.status(400).json({ message: 'Request body must be valid JSON.' })
  }
  console.error('Unhandled server error:', error.message)
  return response.status(500).json({ message: 'Internal server error.' })
})

app.listen(port, host, () => {
  console.log(`SomSat API listening on http://${host}:${port}`)
  mongoose.connect(mongoUri)
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error(`MongoDB connection failed: ${error.message}`))
})
