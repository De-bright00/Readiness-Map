# Lafiya Reach
> Where care is actually available.

A readiness map of primary health facilities in FCT, Lagos and Kano. It shows who lives near a facility that is ready today, not just one that exists.

**Team:** Looplearn  
**Entry:** YDP Datathon 2026, Health track

---

## Links

- **Live site:** [https://lafiya-reach.vercel.app/](https://lafiya-reach.vercel.app/)
- **Video demo:** [https://youtu.be/YrmtrY71INs](https://youtu.be/YrmtrY71INs)
- **Project folder (Google Drive):** [Google Drive Folder](https://drive.google.com/drive/folders/12qjwGe1O9XcntPcZH4XGe4JmhsttBwG9?usp=sharing)
- **Write-up:** [docs/Lafiya-Reach-writeup.pdf](https://claude.ai/chat/docs/Lafiya-Reach-writeup.pdf)
- **One-page summary:** [docs/SUMMARY.md](https://claude.ai/chat/docs/SUMMARY.md)

---

## At a Glance

- **3 states**, **70 LGAs**, **3,645 primary health facilities**
- **9 key items tracked:** malaria drugs and tests, oxytocin, RUTF, ORS and zinc, iron and folic acid, vitamin A, measles and pentavalent vaccines.

---

## The Problem

Primary health centres are where most Nigerians first meet the health system. Each facility is meant to report its stock and staff up to the LGA. Many report late, report only part, or stop. Planners then restock and post staff on old or missing numbers, and a shortage can go unnoticed until a patient arrives and the medicine is not there.

---

## What It Does

A facility can be on the map and still be unable to treat anyone that day. Lafiya Reach asks two questions for every LGA:

1. **How many people live within 5 km of any facility?**
2. **How many people live within 5 km of a facility that is ready today?**

The difference between the two is the gap the site shows. Each facility is scored from its stock of nine key items and whether a midwife was present, and is placed in one of four groups: **Ready**, **At risk**, **Not ready**, or **Unknown (silent)**. A facility that has stopped reporting is shown as Unknown. It is not treated as fine.

---

## What Is Real and What Is Simulated

| What | Status |
| --- | --- |
| **Facility locations, FCT and Kano (2,158 primary-level facilities)** | Real, from GRID3 |
| **LGA boundaries (70 LGAs)** | Real, from geoBoundaries |
| **Population (2020, 100 m)** | Real modelled estimate, from WorldPop |
| **State health indicators** | Real, from the 2024 NDHS. Used to guide planning, not as an input to the score |
| **Facility locations, Lagos (1,487)** | Placeholders. The count is anchored to a published Lagos State figure. The coordinates are not real facilities |
| **Monthly stock, deliveries, midwife cover and reporting, Sep 2024 to Aug 2026** | Simulated, from assumptions written down in the write-up |

*The results show how the method works. They are not findings about the stock in any real facility, and no accuracy figure is reported.*

---

## What Is in This Repository

- `app/`, `components/`, `public/` — The website (Next.js, React, Tailwind, Framer Motion, Leaflet)
- `data/` — The data files the website reads, and the NDHS extract
- `pipeline/` — The Python code that builds the simulated records, the scores and the access figures
- `docs/` — The write-up and the one-page summary

---

## Run the Website

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

---

## Re-run the Analysis

```bash
cd pipeline
pip install pandas numpy scipy geopandas shapely
python generate_data.py # builds 24 months of simulated records (fixed random seed)
python readiness_score.py # scores every facility and works out access by LGA
```

---

## Data Sources

- **GRID3 Nigeria Health Facilities, v3.0**
- **geoBoundaries, Nigeria ADM2**
- **WorldPop, Nigeria 2020, 100 m constrained population estimate (R2025A)**
- **Nigeria Demographic and Health Survey 2023-24**, final report (FR395), The DHS Program

*Each source has its own terms of use and attribution requirements. Please see the source before reusing its data.*

---

## Author

**Team Looplearn.** Toheeb Adewale Abdulraheem (De_bright), Registered Dietitian Nutritionist, Nigeria.
