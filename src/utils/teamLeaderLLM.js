export async function tryBackendTeamLeader(message) {
  const apiBase = import.meta.env.VITE_TEAM_LEADER_API_BASE || 'http://127.0.0.1:8787'

  try {
    const response = await fetch(`${apiBase}/api/team-leader/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, channel: 'web' }),
    })

    if (!response.ok) return null
    const data = await response.json()
    return {
      intent: data.intent || 'general',
      message: data.reply || data.message || 'No response returned.',
      routedAgent: data.createdTask?.assignedTo || data.routedAgent || null,
      newTask: data.createdTask || null,
      extraTasks: data.extraTasks || [],
      newApproval: data.createdApproval || null,
      mode: data.mode || 'backend',
    }
  } catch {
    return null
  }
}
