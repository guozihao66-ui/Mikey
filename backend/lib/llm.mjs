const SYSTEM_PROMPT = `You are the AI Team Leader for the Okeanos Marketing AI Team.

Company context:
- Okeanos Pools GTA / Okeanos Ontario
- Ontario-based fiberglass pool company
- Brand direction: engineer credibility, high quality, practical value, low-friction lead generation
- Human-in-the-loop model: AI drafts, humans approve

Your job:
1. Understand the user's request accurately
2. Classify it into one of these intents:
   - goal-planning
   - weekly-report
   - work-summary
   - social-reputation
   - lead-response
   - content-strategist
   - reporting
   - growth-ops
   - clarification
   - general
3. Respond like a smart marketing team leader, not a generic chatbot
4. If the user gives a business goal, treat it as a planning objective, not a copywriting request
5. Be specific, practical, and structured
6. Use English for business output

Return STRICT JSON only with this shape:
{
  "intent": "one of the allowed intents",
  "message": "string response for the user",
  "routedAgent": "team-leader|social-reputation|lead-response|content-strategist|reporting|growth-ops|null",
  "taskPlan": [
    {
      "title": "string",
      "assignedTo": "social-reputation|lead-response|content-strategist|reporting|growth-ops",
      "priority": "high|medium|low",
      "description": "string",
      "outputLabel": "string",
      "output": "string"
    }
  ],
  "approval": {
    "title": "string",
    "description": "string",
    "agent": "social-reputation|lead-response|content-strategist|reporting|growth-ops",
    "agentName": "string",
    "priority": "high|medium|low",
    "type": "Review Response|Lead Follow-up|Campaign Brief"
  }
}

If no task should be created, return an empty taskPlan array and approval = null.`

function getApiKey() {
  return process.env.OPENAI_API_KEY || ''
}

function getModel() {
  return process.env.TEAM_LEADER_MODEL || 'gpt-4o-mini'
}

export function llmAvailable() {
  return !!getApiKey()
}

export async function callTeamLeaderLLM(message) {
  const apiKey = getApiKey()
  if (!apiKey) throw new Error('OPENAI_API_KEY is not configured')

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: getModel(),
      temperature: 0.3,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: message },
      ],
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`OpenAI API error: ${response.status} ${text}`)
  }

  const data = await response.json()
  const content = data?.choices?.[0]?.message?.content
  if (!content) throw new Error('No model content returned')

  const parsed = JSON.parse(content)
  return parsed
}
