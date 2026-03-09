# Okeanos Marketing AI Team Platform Prototype

A local prototype for an internal **Okeanos Marketing AI Team Platform**.

## What this prototype includes

- Dashboard overview for the internal marketing team
- AI Team Leader chat interface
- Visible specialist agent roster
- Task routing and task status panel
- Weekly report and work summary views
- Local mocked interaction logic (no external AI API required)

## Included agents

- AI Team Leader
- Social & Reputation Agent
- Content Strategist Agent
- Lead Response Agent
- Reporting Agent

## Core prototype interactions

The AI Team Leader can respond to requests for:

- weekly marketing reports
- work summaries
- social / reputation tasks
- lead response tasks
- general clarification requests

## Run locally

```bash
npm install
npm run dev
```

Then open the local Vite URL shown in the terminal, usually:

```bash
http://localhost:5173
```

## Build validation

```bash
npm run build
```

## Notes

- This is a prototype for internal team workflows.
- All outputs are mock / simulated.
- The operating model is **AI drafts, humans approve**.
- No external publishing or lead messaging is executed automatically.
