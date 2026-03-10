import http from 'node:http'
import { readStore, writeStore } from './lib/store.mjs'
import { handleTeamLeaderMessage } from './lib/engine.mjs'

const PORT = process.env.PORT || 8787

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  })
  res.end(JSON.stringify(payload))
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return sendJson(res, 200, { ok: true })

  if (req.method === 'GET' && req.url === '/api/bootstrap') {
    return sendJson(res, 200, readStore())
  }

  if (req.method === 'POST' && req.url === '/api/team-leader/message') {
    let body = ''
    req.on('data', (chunk) => (body += chunk))
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body || '{}')
        const message = parsed.message || ''
        Promise.resolve(handleTeamLeaderMessage(message, parsed.channel || 'web'))
          .then((result) => sendJson(res, 200, result))
          .catch((error) => sendJson(res, 500, { error: String(error) }))
      } catch (error) {
        sendJson(res, 500, { error: String(error) })
      }
    })
    return
  }

  if (req.method === 'POST' && req.url === '/api/approvals/action') {
    let body = ''
    req.on('data', (chunk) => (body += chunk))
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body || '{}')
        const store = readStore()
        store.approvals = store.approvals.map((item) => item.id === parsed.id ? { ...item, resolved: parsed.action } : item)
        if (parsed.action === 'approved') {
          const match = store.approvals.find((item) => item.id === parsed.id)
          if (match) {
            store.tasks = store.tasks.map((t) => t.id === match.taskId ? { ...t, status: 'in-progress', updatedAt: new Date().toISOString() } : t)
          }
        }
        writeStore(store)
        sendJson(res, 200, { ok: true })
      } catch (error) {
        sendJson(res, 500, { error: String(error) })
      }
    })
    return
  }

  sendJson(res, 404, { error: 'Not found' })
})

server.listen(PORT, () => {
  console.log(`Okeanos AI Team backend listening on http://127.0.0.1:${PORT}`)
})
