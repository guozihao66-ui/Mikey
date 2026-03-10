# Okeanos Marketing AI Team Platform Prototype

A polished internal prototype for an **Okeanos Marketing AI Team Platform**.

## Prototype scope

This version is intentionally compact and demo-friendly.

It is designed to show a believable **marketing AI operating model** without becoming too large or too complex to explain in a meeting.

## Included AI team

This prototype uses exactly **6 agents**:

1. AI Team Leader
2. Social & Reputation Agent
3. Content Strategist Agent
4. Lead Response Agent
5. Reporting Agent
6. Growth Ops Agent

### What the Growth Ops Agent covers

- CRM nurture support
- website conversion support
- campaign operations coordination
- workflow and approvals support

## What this prototype includes

- Executive-style dashboard overview
- AI Team Leader chat interface
- Task queue
- Approvals queue
- Reports area
- Team view
- Simple playbooks / workflow area
- Local mocked interaction logic (no external AI API required)

## Core interactions

The AI Team Leader can respond to requests for:

- weekly marketing reports
- work summaries
- social / reputation tasks
- lead response tasks
- content / SEO tasks
- CRM / conversion / campaign ops tasks
- general clarification requests

## Operating model

This prototype follows an **AI drafts, humans approve** workflow.

That means:
- AI can interpret requests
- AI can route tasks
- AI can draft content and summaries
- humans must approve before anything is published, sent, or executed

## Run locally

```bash
npm install
npm run dev
```

Then open the local Vite URL shown in the terminal, usually:

```bash
http://localhost:5173
```

## Optional: enable a real LLM-powered Team Leader

By default, the frontend still works in mock mode.

If you want the Team Leader to use a real model instead of only mocked routing logic, start the backend and provide an API key:

### PowerShell

```powershell
$env:OPENAI_API_KEY="your_api_key_here"
$env:TEAM_LEADER_MODEL="gpt-4o-mini"
npm run server
```

Then run the frontend normally:

```bash
npm run dev
```

When the backend is reachable, the frontend will try the backend first and fall back to mock mode if the backend is unavailable.

## Build validation

```bash
npm run build
```

## Deployment

This project is suitable for static deployment (for example Vercel) because it is a frontend-only prototype.

## Notes

- This is a prototype for internal team workflows.
- All outputs are mock / simulated.
- No external publishing or lead messaging is executed automatically.
- The purpose is to demonstrate how a compact marketing AI team could operate for Okeanos.
