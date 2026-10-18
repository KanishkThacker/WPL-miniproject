import 'dotenv/config'
import mongoose from 'mongoose'

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/somsat_mission_ops'
const eventSchema = new mongoose.Schema({
  title: String,
  type: String,
  priority: String,
  status: String,
  description: String,
  eventTime: Date,
}, { timestamps: true, collection: 'mission_events' })
const MissionEvent = mongoose.model('MissionEvent', eventSchema)

try {
  await mongoose.connect(mongoUri)
  if (await MissionEvent.estimatedDocumentCount() === 0) {
    const now = Date.now()
    await MissionEvent.insertMany([
      { title: 'Ground station contact established', type: 'Communications', priority: 'Normal', status: 'Resolved', description: 'Vashi station acquired a stable downlink during the scheduled pass.', eventTime: new Date(now - 1000 * 60 * 28) },
      { title: 'Battery charge returned to nominal', type: 'Telemetry', priority: 'Low', status: 'Resolved', description: 'Solar charging restored the bus voltage after eclipse exit.', eventTime: new Date(now - 1000 * 60 * 14) },
      { title: 'TT&C packet queued for next pass', type: 'AI decision', priority: 'High', status: 'Monitoring', description: 'Housekeeping packet assigned first position in the transmission queue.', eventTime: new Date(now - 1000 * 60 * 3) },
    ])
    console.log('Inserted three sample mission events.')
  } else {
    console.log('Mission events already exist; no sample records were added.')
  }
} catch (error) {
  console.error(`Could not seed mission events: ${error.message}`)
  process.exitCode = 1
} finally {
  await mongoose.disconnect()
}
