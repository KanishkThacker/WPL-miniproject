const API_ROOT = '/api/events'

async function request(path = '', options = {}) {
  const response = await fetch(`${API_ROOT}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  })
  const result = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(result.message || `Request failed (${response.status})`)
  }

  return result
}

export function getMissionEvents() {
  return request()
}

export function createMissionEvent(event) {
  return request('', { method: 'POST', body: JSON.stringify(event) })
}

export function updateMissionEvent(id, event) {
  return request(`/${id}`, { method: 'PATCH', body: JSON.stringify(event) })
}

export function deleteMissionEvent(id) {
  return request(`/${id}`, { method: 'DELETE' })
}
