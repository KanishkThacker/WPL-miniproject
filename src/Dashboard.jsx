
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Activity, AlertTriangle, ArrowDownRight, ArrowLeft, Battery, Bell,
  Check, ChevronDown, Clock3, Cpu, Edit2,
  Moon, Plus, RefreshCw, Search, Signal, Sparkles, Sun,
  Thermometer, Trash2, X, Zap,
} from 'lucide-react'
import {
  createMissionEvent,
  deleteMissionEvent,
  getMissionEvents,
  updateMissionEvent,
} from './api'
import './Dashboard.css'

const emptyEvent = {
  title: '',
  type: 'Telemetry',
  priority: 'Normal',
  status: 'Monitoring',
  description: '',
  solution: '',
}

const eventTypes = [
  'Deployment',
  'Telemetry',
  'Communications',
  'AI decision',
  'Operations',
]

const priorities = ['Low', 'Normal', 'High', 'Critical']
const statuses = ['Monitoring', 'Active', 'Resolved']

function dateLabel(value) {
  if (!value) return 'Just now'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return 'Just now'

  return new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function EventDialog({ event, onClose, onSave, saving }) {
  const [form, setForm] = useState(() => ({
    ...emptyEvent,
    ...(event || {}),
  }))

  const [generatingSolution, setGeneratingSolution] = useState(false)
  const [solutionError, setSolutionError] = useState('')

  const editing = Boolean(event?._id)

  useEffect(() => {
    const handleEscape = (keyEvent) => {
      if (keyEvent.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleEscape)

    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  function change(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  async function generateSolution() {
    const { title, type, priority, status } = form

    if (![title, type, priority, status].every(
      (value) => String(value || '').trim()
    )) {
      setSolutionError(
        'Fill in the event title, type, priority, and status first.'
      )
      return
    }

    setGeneratingSolution(true)
    setSolutionError('')

    try {
      const response = await fetch('/api/generate-solution', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          type,
          priority,
          status,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || 'Solution generation failed.'
        )
      }

      if (!data.solution) {
        throw new Error('Ollama returned an empty solution.')
      }

      change('solution', data.solution)
    } catch (error) {
      setSolutionError(
        error.message || 'Unable to generate a solution.'
      )
    } finally {
      setGeneratingSolution(false)
    }
  }

  function submit(formEvent) {
    formEvent.preventDefault()

    onSave({
      ...form,
      solution: form.solution || '',
    })
  }

  return (
    <div
      className="dialog-backdrop"
      onMouseDown={(event) =>
        event.target === event.currentTarget && onClose()
      }
    >
      <section
        className="event-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-dialog-title"
      >
        <div className="dialog-heading">
          <div>
            <p className="dash-eyebrow">MISSION RECORD</p>
            <h2 id="event-dialog-title">
              {editing ? 'Edit event' : 'Add event'}
            </h2>
          </div>

          <button
            className="icon-button"
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={submit}>
          <label className="field-label">
            Event title
            <input
              autoFocus
              required
              maxLength={90}
              value={form.title}
              onChange={(event) =>
                change('title', event.target.value)
              }
              placeholder="e.g. Battery voltage below threshold"
            />
          </label>

          <div className="form-row">
            <label className="field-label">
              Type
              <select
                value={form.type}
                onChange={(event) =>
                  change('type', event.target.value)
                }
              >
                {eventTypes.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </label>

            <label className="field-label">
              Priority
              <select
                value={form.priority}
                onChange={(event) =>
                  change('priority', event.target.value)
                }
              >
                {priorities.map((priority) => (
                  <option key={priority}>{priority}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="form-row">
            <label className="field-label">
              Status
              <select
                value={form.status}
                onChange={(event) =>
                  change('status', event.target.value)
                }
              >
                {statuses.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </label>

            <label className="field-label">
              Description
              <textarea
                required
                maxLength={500}
                value={form.description}
                onChange={(event) =>
                  change('description', event.target.value)
                }
                placeholder="Write the event description manually"
                rows={3}
              />
            </label>
          </div>

          <div className="solution-section">
            <label className="field-label">
              AI-generated solution
              <textarea
                value={form.solution || ''}
                onChange={(event) =>
                  change('solution', event.target.value)
                }
                placeholder="Generate a recommended solution using Llama 3.2"
                rows={5}
              />
            </label>

            <button
              type="button"
              className="quiet-button ollama-generate-button"
              onClick={generateSolution}
              disabled={generatingSolution || !form.title.trim()}
            >
              <Sparkles size={14} />
              {generatingSolution
                ? 'Generating solution…'
                : 'Generate Solution with Llama 3.2'}
            </button>

            {solutionError && (
              <small className="ollama-error" role="alert">
                {solutionError}
              </small>
            )}
          </div>

          <div className="dialog-actions">
            <button
              type="button"
              className="quiet-button"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              className="accent-button"
              disabled={saving || generatingSolution}
            >
              {saving
                ? 'Saving…'
                : editing
                  ? 'Save changes'
                  : 'Create event'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

function Dashboard() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [dialogEvent, setDialogEvent] = useState(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All events')
  const [syncTime, setSyncTime] = useState(null)
  const [toast, setToast] = useState('')
  const [theme, setTheme] = useState(
    document.documentElement.dataset.theme || 'dark'
  )

  const loadEvents = useCallback(async () => {
    setLoading(true)

    try {
      const result = await getMissionEvents()

      setEvents(result.events || [])
      setError('')
      setSyncTime(new Date())
    } catch (requestError) {
      setError(
        requestError.message ||
        'Unable to connect to the mission records API.'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  useEffect(() => {
    if (!toast) return undefined

    const timeout = window.setTimeout(() => setToast(''), 3200)

    return () => window.clearTimeout(timeout)
  }, [toast])

  const filteredEvents = useMemo(
    () =>
      events.filter((event) => {
        const matchesQuery = [
          event.title,
          event.type,
          event.description,
          event.solution,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(search.toLowerCase())

        const matchesFilter =
          filter === 'All events' ||
          event.status === filter ||
          event.priority === filter

        return matchesQuery && matchesFilter
      }),
    [events, filter, search]
  )

  const activeAlerts = events.filter(
    (event) =>
      event.priority === 'Critical' &&
      event.status !== 'Resolved'
  ).length

  const activeRecords = events.filter(
    (event) => event.status !== 'Resolved'
  ).length

  const currentDate = new Intl.DateTimeFormat('en', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date()).toUpperCase()

  async function saveEvent(form) {
    setSaving(true)

    try {
      if (dialogEvent?._id) {
        await updateMissionEvent(dialogEvent._id, form)
        setToast('Mission event updated')
      } else {
        await createMissionEvent(form)
        setToast('Mission event created')
      }

      setDialogOpen(false)
      setDialogEvent(null)

      await loadEvents()
    } catch (requestError) {
      setError(
        requestError.message ||
        'Unable to save this mission event.'
      )
    } finally {
      setSaving(false)
    }
  }

  async function removeEvent(event) {
    if (
      !window.confirm(
        `Delete “${event.title}” from the mission log?`
      )
    ) {
      return
    }

    try {
      await deleteMissionEvent(event._id)
      setToast('Mission event deleted')
      await loadEvents()
    } catch (requestError) {
      setError(
        requestError.message ||
        'Unable to delete this mission event.'
      )
    }
  }

  function openCreateDialog() {
    setDialogEvent(null)
    setDialogOpen(true)
  }

  function openEditDialog(event) {
    setDialogEvent(event)
    setDialogOpen(true)
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="breadcrumb">
            <a href="/">Mission operations</a>
            <span>/</span>
            <strong>Overview</strong>
          </div>

          <div className="topbar-actions">
            <span className="api-indicator">
              <i className={error ? 'offline' : ''} />
              {error
                ? 'API offline'
                : loading
                  ? 'Syncing'
                  : 'API connected'}
            </span>

            <button
              className="icon-button"
              aria-label="Notifications"
            >
              <Bell size={17} />
            </button>

            <button
              className="icon-button theme-switch"
              onClick={() =>
                setTheme(theme === 'dark' ? 'light' : 'dark')
              }
              aria-label="Toggle color mode"
            >
              {theme === 'dark' ? (
                <Sun size={17} />
              ) : (
                <Moon size={17} />
              )}
            </button>

            <span className="operator-avatar" title="Mission operator">
              MO
            </span>
          </div>
        </header>

        <main className="dashboard-content">
          <section className="dashboard-title-row" id="overview">
            <div>
              <p className="dash-eyebrow">
                {currentDate} <span>·</span> MISSION OPS
              </p>
              <h1>Mission overview</h1>
              <p className="dashboard-subtitle">
                A clear view of spacecraft health, mission activity,
                and ground contact.
              </p>
            </div>

            <button
              className="quiet-button sync-button"
              onClick={loadEvents}
              disabled={loading}
            >
              <RefreshCw
                size={15}
                className={loading ? 'spin' : ''}
              />
              Sync records
            </button>
          </section>

          <section className="mission-banner" id="ground-station">
            <div className="mission-emblem">
              <span className="emblem-orbit" />
              <span className="emblem-center">
                <Cpu size={23} />
              </span>
            </div>

            <div className="mission-banner-copy">
              <span className="mission-kicker">
                CURRENT MISSION · DEMO DATA
              </span>
              <h2>
                SomaiyaSat
                <span className="mission-live">
                  <i /> NOMINAL
                </span>
              </h2>
              <p>
                PocketQube · Low Earth Orbit · Mission day 018
              </p>
            </div>

            <div className="mission-banner-meta">
              <span>MISSION PHASE</span>
              <strong>Commissioning</strong>
              <small>Last telemetry · 42 sec ago</small>
            </div>

            <div className="mission-banner-meta station-meta">
              <span>NEXT GROUND PASS</span>
              <strong>In 00:18:24</strong>
              <small>Vashi · 18° 42′ N</small>
            </div>

            <div className="banner-line" />
          </section>

          <section className="dashboard-stats" aria-label="Mission metrics">
            <article className="dashboard-stat">
              <div className="stat-top">
                <span>SPACECRAFT STATUS</span>
                <span className="stat-icon">
                  <Activity size={15} />
                </span>
              </div>
              <strong className="stat-main">
                <i className="state-dot" />Nominal
              </strong>
              <small>All subsystems responding</small>
              <div className="stat-foot">
                <span>UPTIME</span>
                <b>18d 06h 42m</b>
              </div>
            </article>

            <article className="dashboard-stat">
              <div className="stat-top">
                <span>BATTERY LEVEL</span>
                <span className="stat-icon">
                  <Battery size={15} />
                </span>
              </div>
              <strong className="stat-main">
                83.4<span className="stat-unit">%</span>
              </strong>
              <small>+2.1% from previous orbit</small>
              <div className="metric-track">
                <i style={{ width: '83.4%' }} />
              </div>
            </article>

            <article className="dashboard-stat">
              <div className="stat-top">
                <span>LINK QUALITY</span>
                <span className="stat-icon">
                  <Signal size={15} />
                </span>
              </div>
              <strong className="stat-main">
                91.4<span className="stat-unit">%</span>
              </strong>
              <small>Strong signal · SNR 12.8 dB</small>
              <div
                className="mini-bars"
                aria-label="Recent link quality"
              >
                {Array.from({ length: 12 }, (_, index) => (
                  <i key={index} />
                ))}
              </div>
            </article>

            <article className="dashboard-stat">
              <div className="stat-top">
                <span>ACTIVE ALERTS</span>
                <span className="stat-icon">
                  <AlertTriangle size={15} />
                </span>
              </div>
              <strong className="stat-main">
                {activeAlerts.toString().padStart(2, '0')}
              </strong>
              <small>{activeRecords} open mission records</small>
              <div className="stat-foot">
                <span>MISSION LOG</span>
                <b>{events.length} total events</b>
              </div>
            </article>
          </section>

          <section className="dashboard-middle" id="telemetry">
            <article className="dashboard-panel telemetry-panel">
              <div className="panel-heading">
                <div>
                  <p className="dash-eyebrow">SPACECRAFT HEALTH</p>
                  <h2>Telemetry snapshot</h2>
                </div>
                <span className="demo-chip">
                  <i /> SIMULATED
                </span>
              </div>

              <div className="telemetry-chart-wrap">
                <div className="chart-side-labels">
                  <span>16.0</span>
                  <span>12.0</span>
                  <span>8.0</span>
                </div>

                <div className="telemetry-chart">
                  <div className="chart-grid-lines">
                    <i /><i /><i /><i />
                  </div>

                  <div className="chart-bars">
                    {[34, 43, 39, 57, 48, 66, 51, 75, 63, 70, 82, 72, 91, 80, 88, 76, 95, 84, 100, 89].map(
                      (height, index) => (
                        <i
                          key={index}
                          style={{ height: `${height}%` }}
                        />
                      )
                    )}
                  </div>

                  <div className="chart-time-labels">
                    <span>16:00</span>
                    <span>16:30</span>
                    <span>17:00</span>
                    <span>17:30</span>
                    <span>18:00</span>
                  </div>
                </div>
              </div>

              <div className="telemetry-readings">
                <div>
                  <span><Battery size={14} /> BUS VOLTAGE</span>
                  <strong>3.82 <small>V</small></strong>
                </div>
                <div>
                  <span><Thermometer size={14} /> TEMPERATURE</span>
                  <strong>18.6 <small>°C</small></strong>
                </div>
                <div>
                  <span><Zap size={14} /> VELOCITY</span>
                  <strong>7.66 <small>km/s</small></strong>
                </div>
              </div>
            </article>

            <article className="dashboard-panel decision-panel">
              <div className="panel-heading">
                <div>
                  <p className="dash-eyebrow">AUTONOMOUS ROUTING</p>
                  <h2>AI decision engine</h2>
                </div>
                <span className="active-chip">
                  <i /> ACTIVE
                </span>
              </div>

              <div className="decision-summary">
                <div className="decision-icon">
                  <Zap size={18} />
                </div>
                <div>
                  <span>NEXT RECOMMENDED ACTION</span>
                  <strong>Transmit TT&C packet</strong>
                  <small>Priority queue · Housekeeping</small>
                </div>
                <b>98.4%</b>
              </div>

              <div className="decision-factors">
                <span>DECISION FACTORS</span>
                <div>
                  <span>Power budget <b>Good</b></span>
                  <span>Link stability <b>Strong</b></span>
                  <span>Payload queue <b>4 items</b></span>
                </div>
              </div>

              <a className="panel-link" href="#records">
                Review mission activity <ArrowDownRight size={14} />
              </a>
            </article>
          </section>

          <section className="dashboard-panel records-panel" id="records">
            <div className="records-heading">
              <div>
                <p className="dash-eyebrow">OPERATOR ACTIVITY</p>
                <h2>Mission event log</h2>
                <p>
                  Review and manage operational events stored in the
                  mission database.
                </p>
              </div>

              <button
                className="accent-button"
                onClick={openCreateDialog}
              >
                <Plus size={16} />Add event
              </button>
            </div>

            {error && (
              <div className="api-error" role="alert">
                <AlertTriangle size={16} />
                <span>
                  <strong>Mission records unavailable.</strong>{' '}
                  {error} Start MongoDB and the API server, then sync again.
                </span>
                <button className="text-action" onClick={loadEvents}>
                  Retry
                </button>
              </div>
            )}

            <div className="records-toolbar">
              <label className="record-search">
                <Search size={16} />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search mission events"
                  aria-label="Search mission events"
                />
              </label>

              <label className="filter-select">
                <span className="sr-only">Filter events</span>
                <select
                  value={filter}
                  onChange={(event) => setFilter(event.target.value)}
                >
                  <option>All events</option>
                  <option>Critical</option>
                  <option>High</option>
                  <option>Monitoring</option>
                  <option>Active</option>
                  <option>Resolved</option>
                </select>
                <ChevronDown size={14} />
              </label>

              <span className="records-count">
                {filteredEvents.length} RECORDS
              </span>
            </div>

            <div className="records-table-wrap">
              <table className="records-table">
                <thead>
                  <tr>
                    <th>EVENT</th>
                    <th>TYPE</th>
                    <th>PRIORITY</th>
                    <th>STATUS</th>
                    <th>RECORDED</th>
                    <th><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>

                <tbody>
                  {loading && events.length === 0 ? (
                    <tr>
                      <td className="table-state" colSpan="6">
                        <RefreshCw size={16} className="spin" />
                        Loading mission records…
                      </td>
                    </tr>
                  ) : filteredEvents.length === 0 ? (
                    <tr>
                      <td className="table-state" colSpan="6">
                        {events.length
                          ? 'No events match this search.'
                          : 'No mission events yet. Add a record to start the log.'}
                      </td>
                    </tr>
                  ) : (
                    filteredEvents.map((event) => (
                      <tr key={event._id}>
                        <td>
                          <div className="event-title">
                            <span
                              className={`event-mark ${(
                                event.priority || 'normal'
                              ).toLowerCase()}`}
                            >
                              <Activity size={14} />
                            </span>
                            <span>
                              <strong>{event.title}</strong>
                              <small>{event.description}</small>
                            </span>
                          </div>
                        </td>

                        <td>
                          <span className="type-label">{event.type}</span>
                        </td>

                        <td>
                          <span
                            className={`priority-label ${(
                              event.priority || 'normal'
                            ).toLowerCase()}`}
                          >
                            <i />{event.priority}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`status-label ${(
                              event.status || 'monitoring'
                            ).toLowerCase()}`}
                          >
                            {event.status}
                          </span>
                        </td>

                        <td>
                          <span className="event-date">
                            <Clock3 size={13} />
                            {dateLabel(event.eventTime || event.createdAt)}
                          </span>
                        </td>

                        <td>
                          <div className="row-actions">
                            <button
                              onClick={() => openEditDialog(event)}
                              aria-label={`Edit ${event.title}`}
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => removeEvent(event)}
                              aria-label={`Delete ${event.title}`}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="records-footer">
              <span>
                <span className="footer-status-dot" />
                {error
                  ? 'Waiting for database connection'
                  : 'Connected to mission database'}
              </span>
              <span>
                {syncTime
                  ? `Last synced ${new Intl.DateTimeFormat('en', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    }).format(syncTime)}`
                  : 'Waiting to sync'}
              </span>
            </div>
          </section>

          <footer className="dashboard-footer">
            <span>SomSat Mission Operations</span>
            <span>
              Spacecraft metrics and pass details are simulated; event
              records come from MongoDB.
            </span>
            <a href="/">
              Back to mission site <ArrowLeft size={13} />
            </a>
          </footer>
        </main>
      </div>

      {dialogOpen && (
        <EventDialog
          event={dialogEvent}
          onClose={() => {
            setDialogOpen(false)
            setDialogEvent(null)
          }}
          onSave={saveEvent}
          saving={saving}
        />
      )}

      {toast && (
        <div className="dashboard-toast" role="status">
          <Check size={15} />{toast}
        </div>
      )}
    </div>
  )
}

export default Dashboard
