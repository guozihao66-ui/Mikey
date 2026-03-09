# NOTES

## Assumptions used in this prototype

1. Okeanos is an Ontario-based fiberglass pool company serving the GTA market.
2. The main users are the internal marketing team.
3. The platform is intended to support decision-making, drafting, routing, and reporting.
4. The approval model is human-in-the-loop: AI drafts, humans approve.
5. The current tool stack is not finalized, so this prototype uses local mock data and local response logic.
6. The highest-value prototype workflows are:
   - weekly reporting
   - work summaries
   - social / reputation management
   - lead-response drafting
7. The preferred brand direction is:
   - engineer credibility
   - high quality
   - practical value
   - low-friction lead generation

## Recommended next steps

1. Connect the Reporting Agent to real GA4 / ad platform exports.
2. Connect the Lead Response Agent to real lead intake events from the website.
3. Add role-based views for marketing manager vs. coordinator.
4. Add approval actions such as Approve / Revise / Reject.
5. Add saved templates for review responses, lead follow-up, and weekly reporting.
6. Add persistence using a lightweight backend or database.
7. Add a real LLM service later for production-quality drafting.
