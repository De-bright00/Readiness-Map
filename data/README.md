# Data schema

**stats.json** — real, full-dataset aggregate counts (3,645 facilities total) for headline numbers.
FCT and Kano facility counts/locations are real (GRID3 NGA Health Facility Registry). Lagos facility *locations* are population-weighted placeholders (the count, 1,487, is a real published figure) — always label Lagos facility points as simulated in the UI.

**facility-sample.json** — a representative sample (60 facilities, stratified across state x status) for the interactive map. Fields: id, name, state, lga, lat, lon, pop (catchment population), score (0-1 readiness score), status (one of 'Ready' | 'At risk' | 'Not ready' | 'Unknown (silent)'), shortItems (array of {item, daysOut} for tracer items currently out of stock — empty array if none).

Status color meaning (use exactly these, this is a medical/health-data color convention):
- Ready: green
- At risk: amber/yellow
- Not ready: red
- Unknown (silent): grey (this status means the facility hasn't reported recently or its data looks unreliable — NOT that it's necessarily doing badly, we just don't know)

**lga-access.json** — REAL, full data, all 70 LGAs across FCT/Lagos/Kano. This is the core finding of the project: for each LGA, population, % of that population within 5km of ANY facility ('access on paper'), % within 5km of a facility that is currently status=Ready ('real access'), and the gap between the two in percentage points. Sorted descending by gap — the top rows (rural Kano LGAs like Tudun Wada, Kibiya, Ajingi at 17-21 point gaps) are the headline finding: a facility-count map looks fine but real, usable care is much further away than it appears.

**silence-story.json** — REAL simulated timeline for one real facility (Zago Health Post, Dambatta LGA, Kano) over 24 months (Sep 2024 - Aug 2026). Shows the demo narrative: reported normally for 6 months, then reports mostly stopped (reported=0) for several months while stock quietly ran down, hit a full stockout, then reporting and stock recovered. Fields: month, reported (1/0), report_late_days (null if not reported that month), stock_score (0-1, null if not reported).