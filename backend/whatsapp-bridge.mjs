import { handleTeamLeaderMessage } from './lib/engine.mjs'

const message = process.argv.slice(2).join(' ').trim()
if (!message) {
  console.error('Usage: node backend/whatsapp-bridge.mjs "your message here"')
  process.exit(1)
}

const result = handleTeamLeaderMessage(message, 'whatsapp')
console.log(result.reply)
