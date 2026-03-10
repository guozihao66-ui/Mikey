# NOTES

## Assumptions used in this prototype

1. Okeanos is an Ontario-based fiberglass pool company serving the GTA market.
2. The main users are the internal marketing team.
3. The platform is intended to support decision-making, drafting, routing, approvals, and reporting.
4. The approval model is human-in-the-loop: AI drafts, humans approve.
5. The current tool stack is not finalized, so this prototype uses local mock data and local response logic.
6. The prototype should stay compact enough to explain clearly in a live demo.
7. The preferred brand direction is:
   - engineer credibility
   - high quality
   - practical value
   - low-friction lead generation

## Why the team is limited to 6 agents

This prototype intentionally avoids creating too many specialist agents.

The goal is to keep the concept easy to present while still covering the highest-value marketing functions:
- reputation
- content
- lead response
- reporting
- growth operations
- orchestration through the Team Leader

## Included workflows represented in the prototype

- negative review handling
- fast website lead follow-up
- weekly reporting
- campaign / conversion operations

## Recommended next steps

1. Connect the Reporting Agent to real GA4 / ad platform exports.
2. Connect the Lead Response Agent to real website lead intake events.
3. Add persistent storage for tasks, approvals, and conversations.
4. Add role-based views for marketing manager vs. coordinator.
5. Add richer approval actions such as approve, revise, reject, and comment.
6. Add a real LLM service later for stronger production-quality drafting.
7. Decide whether Growth Ops should later split into separate CRM and Conversion roles in a more advanced version.
