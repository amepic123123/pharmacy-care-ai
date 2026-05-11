# SmartPharm AI — Backend Mock Data Replacement Guide

> [!IMPORTANT]
> This document catalogs **every piece of mock, hardcoded, or static data** in the SmartPharm AI frontend that must be replaced by real backend API endpoints. It is organized by data domain and maps each item to the exact file and line where it is consumed.

---

## Table of Contents

1. [Patient Records (Core Entity)](#1-patient-records-core-entity)
2. [Drug Interaction Alerts](#2-drug-interaction-alerts)
3. [Laboratory Results](#3-laboratory-results)
4. [Clinical Documents (Admission Notes)](#4-clinical-documents-admission-notes)
5. [Dashboard Metrics & KPIs](#5-dashboard-metrics--kpis)
6. [Dashboard Alerts Feed](#6-dashboard-alerts-feed)
7. [AI-Generated Clinical Insights](#7-ai-generated-clinical-insights)
8. [Activity Timeline / Audit Log](#8-activity-timeline--audit-log)
9. [TopBar Notifications (Per-Patient)](#9-topbar-notifications-per-patient)
10. [Patient Metrics / Vitals Trends](#10-patient-metrics--vitals-trends)
11. [Patient Visit History / Timeline](#11-patient-visit-history--timeline)
12. [User / Clinician Identity](#12-user--clinician-identity)
13. [Session & State Management](#13-session--state-management)
14. [Suggested API Endpoints](#14-suggested-api-endpoints)

---

## 1. Patient Records (Core Entity)

**Source file:** [mock-data.ts](file:///c:/Users/USER/Desktop/aipharmacy-front/src/lib/mock-data.ts)
**Consumed by:** Every page in the application via `PatientContext`

This is the **single most important** mock to replace. The `Patient` interface defines the schema that the entire frontend expects.

### TypeScript Interface (current contract)

```typescript
interface Patient {
  id: string;
  name: string;
  mrn: string;           // Medical Record Number
  dept: string;          // Department (e.g. "Nephrology", "Cardiology")
  risk: "HIGH" | "MED" | "LOW";
  alerts: number;        // Count of active drug interaction alerts
  age: string;           // Formatted as "78Y"
  gender: string;        // "Male" | "Female"
  dob: string;           // Formatted as "12 Mar 1948"
  phone: string;
  bloodType: string;     // e.g. "O+", "A-", "AB+"
  weight: string;        // e.g. "62 kg"
  height: string;        // e.g. "158 cm"
  diagnosis: string;     // Primary diagnosis text
  allergies: string[];   // e.g. ["Penicillin (Rash)"]
  conditions: string[];  // Chronic conditions list
  medications: string[]; // Active medication names
  lastVisit: string;     // Formatted as "08 May 2026"
}
```

### Current Mock Data (5 patients)

| ID | Name | MRN | Dept | Risk | Alerts | Diagnosis |
|---|---|---|---|---|---|---|
| 1 | Margaret R. Collins | 847201 | Nephrology | HIGH | 2 | CKD Stage 4 |
| 2 | James O. Mendez | 847188 | Cardiology | MED | 1 | Atrial Fibrillation |
| 3 | Aisha Patel | 847150 | Oncology | HIGH | 3 | Breast Cancer (Stage II) |
| 4 | Robert Hayashi | 847102 | Internal Med | LOW | 0 | GERD |
| 5 | Elena Costa | 847011 | Endocrinology | MED | 1 | Hashimoto's Thyroiditis |

### Where this data is consumed

| Component | File | What it uses |
|---|---|---|
| `PatientContext` (global state) | [PatientContext.tsx](file:///c:/Users/USER/Desktop/aipharmacy-front/src/contexts/PatientContext.tsx) | Full patient array, alert counts |
| Dashboard patient list | [index.tsx](file:///c:/Users/USER/Desktop/aipharmacy-front/src/routes/index.tsx#L172) | `patients.slice(0, 5)` — name, mrn, dept, age, risk, alerts |
| Patient Directory table | [patient.index.tsx](file:///c:/Users/USER/Desktop/aipharmacy-front/src/routes/patient.index.tsx) | Full patient array with filtering |
| Patient Detail header | [patient.$patientId.tsx](file:///c:/Users/USER/Desktop/aipharmacy-front/src/routes/patient.$patientId.tsx#L117) | All fields |
| TopBar session tabs | [TopBar.tsx](file:///c:/Users/USER/Desktop/aipharmacy-front/src/components/TopBar.tsx#L122) | name, mrn, id |

### Backend replacement

```
GET /api/patients                    → Patient[]
GET /api/patients/:id                → Patient
GET /api/patients?search=&risk=      → Patient[] (filtered)
PATCH /api/patients/:id/alerts       → { alerts: number } (resolve/unresolve)
```

---

## 2. Drug Interaction Alerts

**Source file:** [patient.$patientId.tsx](file:///c:/Users/USER/Desktop/aipharmacy-front/src/routes/patient.$patientId.tsx#L53-L78)
**Consumed by:** Patient detail page → "Drug Alerts" tab

### Schema

```typescript
interface DrugAlert {
  severity: "critical" | "warning";
  title: string;                    // e.g. "Contraindicated Drug Combination"
  drugs: string[];                  // e.g. ["Metformin 1000mg", "Contrast Dye (Iohexol)"]
  why: string;                      // Clinical explanation (plain text, multi-sentence)
  rec: string;                      // AI recommendation text
  open: boolean;                    // Whether the accordion is initially expanded
}
```

### Current Mock Data (3 alerts, hardcoded for all patients)

| # | Severity | Title | Drugs Involved |
|---|---|---|---|
| 1 | critical | Contraindicated Drug Combination | Metformin 1000mg, Contrast Dye (Iohexol) |
| 2 | critical | Dangerous Bleeding Risk | Warfarin 5mg, Ibuprofen 400mg |
| 3 | warning | Elevated Potassium Level | Lisinopril 20mg, Spironolactone 25mg |

> [!WARNING]
> These alerts are currently **static and shared across all patients**. The backend must return **patient-specific** alerts based on their actual medication profile and lab results.

### Backend replacement

```
GET /api/patients/:id/drug-alerts    → DrugAlert[]
POST /api/patients/:id/drug-alerts/:alertId/resolve   → { status: "resolved" }
POST /api/patients/:id/drug-alerts/:alertId/unresolve → { status: "active" }
```

---

## 3. Laboratory Results

**Source file:** [patient.$patientId.tsx](file:///c:/Users/USER/Desktop/aipharmacy-front/src/routes/patient.$patientId.tsx#L31-L40)
**Consumed by:** Patient detail page → sidebar lab panel + admission document lab table

### Schema

```typescript
interface LabResult {
  name: string;        // e.g. "eGFR"
  value: string;       // e.g. "28"
  unit: string;        // e.g. "mL/min/1.73m²"
  tone: "critical" | "warning" | "success";  // Abnormality severity
}
```

### Current Mock Data (8 lab results, hardcoded for all patients)

| Test | Value | Unit | Status |
|---|---|---|---|
| eGFR | 28 | mL/min/1.73m² | critical |
| ALT | 142 | U/L | warning |
| AST | 118 | U/L | warning |
| Total Bilirubin | 1.1 | mg/dL | normal |
| Creatinine | 3.4 | mg/dL | critical |
| Potassium | 5.8 | mEq/L | critical |
| INR | 1.9 | 0.9–1.1 normal | warning |
| Hemoglobin | 9.2 | g/dL | warning |

### Also embedded in the admission note document (lines 312–318)

The same lab values appear a second time as inline text within the admission note HTML:

```
eGFR       → 28 mL/min/1.73m²  (L)
Creatinine → 3.4 mg/dL         (H)
Potassium  → 5.8 mEq/L         (H)
ALT        → 142 U/L           (H)
AST        → 118 U/L           (H)
Total Bilirubin → 1.1 mg/dL    (N)
```

### Backend replacement

```
GET /api/patients/:id/labs           → LabResult[]
GET /api/patients/:id/labs/trends    → { test: string, values: { date: string, value: number }[] }[]
```

---

## 4. Clinical Documents (Admission Notes)

**Source file:** [patient.$patientId.tsx](file:///c:/Users/USER/Desktop/aipharmacy-front/src/routes/patient.$patientId.tsx#L265-L338)
**Consumed by:** Patient detail page → left panel document viewer

### Hardcoded Content

| Field | Value | Line |
|---|---|---|
| Document title | "ADMISSION NOTE" | 268 |
| Date | 10/05/2026 | 270 |
| Time | 09:14 AM | 271 |
| Chief Complaint | "Pt. c/o increased fatigue and decreased urine output." | 295 |
| Vital Signs | "BP: 138/82 mmHg · HR: 88 bpm · RR: 18/min · Temp: 98.4 °F · SpO₂: 97% (RA)" | 305 |
| Doctor's Note | "Dr. Chen — Pt. c/o increased fatigue + SOB. Hold nephrotoxic agents. Renal consult ordered." | 337 |
| Page count | "Page 1 of 3" | 229 |
| AI extraction banner | "AI extracted 8 clinical metrics from this document — including handwritten annotations." | 238–239 |

> [!NOTE]
> The document viewer currently simulates a single static document. In production, this should render real clinical documents (potentially as PDF previews or structured HTML from an OCR/NLP pipeline). The "AI extracted" banner should reflect actual AI processing status.

### Backend replacement

```
GET /api/patients/:id/documents                → Document[] (list)
GET /api/patients/:id/documents/:docId         → { content, metadata, aiExtractions }
GET /api/patients/:id/documents/:docId/pages   → { pageNumber, totalPages, content }
```

---

## 5. Dashboard Metrics & KPIs

**Source file:** [index.tsx](file:///c:/Users/USER/Desktop/aipharmacy-front/src/routes/index.tsx#L79-L108)
**Consumed by:** Dashboard page → metrics cards

### Current Mock Values

| Metric | Value | Change Indicator | Dynamic? |
|---|---|---|---|
| Active Patients | `"248"` | `"+12"` | ❌ Hardcoded |
| Critical Alerts | `patients.reduce(...)` | `"-3 today"` | ✅ Partially (count from context, but change text is hardcoded) |
| AI Reviews Today | `"1,284"` | `"98.7% accuracy"` | ❌ Hardcoded |
| Avg. Review Time | `"2.3m"` | `"-18% vs last week"` | ❌ Hardcoded |

### Also hardcoded in the header text (line 118):

```
"{X} critical alerts across 248 active patients · AI reviewed 1,284 orders today"
```

The `248` and `1,284` are static strings.

### Backend replacement

```
GET /api/dashboard/metrics → {
  activePatients: { value: number, change: string },
  criticalAlerts: { value: number, change: string },
  aiReviews:      { value: number, accuracy: string },
  avgReviewTime:  { value: string, change: string }
}
```

---

## 6. Dashboard Alerts Feed

**Source file:** [index.tsx](file:///c:/Users/USER/Desktop/aipharmacy-front/src/routes/index.tsx#L32-L61)
**Consumed by:** Dashboard page → "Recent Critical Alerts" panel

### Schema

```typescript
interface DashboardAlert {
  severity: "critical" | "warning";
  title: string;
  patient: string;      // Patient full name (used to look up patient ID)
  detail: string;       // Clinical detail string
  time: string;         // Relative time like "2m ago", "1h ago"
}
```

### Current Mock Data (4 alerts)

| Severity | Title | Patient | Detail | Time |
|---|---|---|---|---|
| critical | Contraindicated Drug Combination | Margaret R. Collins | Metformin + Contrast Dye — eGFR 28 | 2m ago |
| critical | Dangerous Bleeding Risk | James O. Mendez | Warfarin + Ibuprofen co-administration | 14m ago |
| warning | Elevated Potassium Level | Margaret R. Collins | K+ 5.8 mEq/L — review ACE inhibitor dose | 31m ago |
| warning | Renal Dose Adjustment Needed | Aisha Patel | Vancomycin trough 24 µg/mL | 1h ago |

> [!WARNING]
> The dashboard currently resolves patient IDs by matching the `patient` name string against the patient array index (`findIndex + 1`). This is fragile. The backend should return `patientId` directly alongside each alert.

### Backend replacement

```
GET /api/alerts/recent?limit=10 → {
  id: string,
  severity: "critical" | "warning",
  title: string,
  patientId: string,
  patientName: string,
  detail: string,
  createdAt: string  // ISO timestamp (frontend formats to relative time)
}[]
```

---

## 7. AI-Generated Clinical Insights

**Source file:** [index.tsx](file:///c:/Users/USER/Desktop/aipharmacy-front/src/routes/index.tsx#L63-L67)
**Consumed by:** Dashboard page → "AI-Generated Clinical Insights" panel

### Current Mock Data (3 strings)

```typescript
const insights = [
  "12 patients on metformin require eGFR re-check this week.",
  "3 cardiology patients show INR drift — consider warfarin clinic referral.",
  "New evidence: SGLT2 inhibitors recommended for CKD Stage 3 with diabetes.",
];
```

The "Updated 5 min ago" timestamp on line 277 is also hardcoded.

### Backend replacement

```
GET /api/insights → {
  insights: { text: string, category?: string }[],
  lastUpdated: string  // ISO timestamp
}
```

---

## 8. Activity Timeline / Audit Log

**Source file:** [index.tsx](file:///c:/Users/USER/Desktop/aipharmacy-front/src/routes/index.tsx#L69-L74)
**Consumed by:** Dashboard page → "Activity Timeline" panel

### Schema

```typescript
interface ActivityEntry {
  who: string;      // Actor name + role (e.g. "Dr. A. Chen")
  what: string;     // Action description
  when: string;     // Time string (e.g. "14:28", "Yesterday")
}
```

### Current Mock Data (4 entries)

| Who | Action | When |
|---|---|---|
| Dr. A. Chen | Signed override for Margaret R. Collins | 14:28 |
| Pharm. K. Liu | Verified vancomycin dose for Aisha Patel | 13:55 |
| AI Assistant | Flagged 4 new interactions in morning rounds | 08:12 |
| Dr. M. Okafor | Updated care plan for James O. Mendez | Yesterday |

### Backend replacement

```
GET /api/activity?limit=20 → {
  id: string,
  actorName: string,
  actorRole: "physician" | "pharmacist" | "ai" | "nurse",
  action: string,
  patientId?: string,
  timestamp: string  // ISO timestamp
}[]
```

---

## 9. TopBar Notifications (Per-Patient)

**Source file:** [TopBar.tsx](file:///c:/Users/USER/Desktop/aipharmacy-front/src/components/TopBar.tsx#L49-L67)
**Consumed by:** TopBar → alert dropdown when a patient tab is active

### Schema

```typescript
interface TopBarNotification {
  type: "critical" | "warning";
  msg: string;
  time: string;
}
```

### Current Mock Data (hardcoded per patient ID)

**Patient ID 1 (Margaret R. Collins):**
| Type | Message | Time |
|---|---|---|
| critical | Potassium levels rising (5.8 mEq/L) | 2m ago |
| critical | Contraindicated: Metformin + Contrast | 15m ago |
| warning | Lisinopril dosage review required | 1h ago |

**Patient ID 2 (James O. Mendez):**
| Type | Message | Time |
|---|---|---|
| critical | Recent AFib episode detected | 5m ago |
| warning | INR check required | 30m ago |

**All other patients (fallback):**
| Type | Message | Time |
|---|---|---|
| critical | New clinical event for {name} | 10m ago |
| warning | Medication review due | 2h ago |

> [!IMPORTANT]
> This is the same conceptual data as the drug alerts in section 2, but formatted differently for the TopBar dropdown. The backend should have a single alerts API that both the TopBar and the patient detail page consume.

### Backend replacement

```
GET /api/patients/:id/notifications → TopBarNotification[]
```

Or unify with the drug alerts endpoint.

---

## 10. Patient Metrics / Vitals Trends

**Source file:** [patient.$patientId.tsx](file:///c:/Users/USER/Desktop/aipharmacy-front/src/routes/patient.$patientId.tsx#L415-L451)
**Consumed by:** Patient detail page → "Patient Metrics" tab

### Hardcoded Data

**Kidney Function Trend (eGFR bar chart):**

```typescript
const eGFRTrend = [35, 32, 28, 26, 28]; // Values for May 06–10
const dates = ["May 06", "May 07", "May 08", "May 09", "Today"];
```

**Vitals Summary:**

| Vital | Value |
|---|---|
| Blood Pressure | 138/82 |
| Heart Rate | 88 bpm |

> [!NOTE]
> These values are completely static and identical for every patient. They should be patient-specific time-series data from the backend.

### Backend replacement

```
GET /api/patients/:id/vitals/current → {
  bloodPressure: { systolic: number, diastolic: number },
  heartRate: number,
  respiratoryRate: number,
  temperature: number,
  spO2: number
}

GET /api/patients/:id/vitals/trends?metric=eGFR&days=5 → {
  metric: string,
  dataPoints: { date: string, value: number }[]
}
```

---

## 11. Patient Visit History / Timeline

**Source file:** [patient.$patientId.tsx](file:///c:/Users/USER/Desktop/aipharmacy-front/src/routes/patient.$patientId.tsx#L470-L485)
**Consumed by:** Patient detail page → "History" tab

### Current Mock Data (3 entries, partially dynamic)

| Date | Event | Detail |
|---|---|---|
| `{patient.lastVisit}` | Last Clinical Encounter | `Follow-up visit regarding {patient.diagnosis}.` |
| 12 Apr 2026 | Routine Review | General health screening and medication reconciliation. |
| 05 Jan 2026 | Historical Entry | Initial baseline assessment performed. |

The first entry uses dynamic patient data; the other two are fully hardcoded.

### Backend replacement

```
GET /api/patients/:id/encounters → {
  id: string,
  date: string,
  type: "admission" | "follow_up" | "routine" | "emergency",
  title: string,
  summary: string,
  clinicianId: string,
  clinicianName: string
}[]
```

---

## 12. User / Clinician Identity

**Source files:**
- [TopBar.tsx](file:///c:/Users/USER/Desktop/aipharmacy-front/src/components/TopBar.tsx#L181-L183) — Doctor name and title
- [index.tsx](file:///c:/Users/USER/Desktop/aipharmacy-front/src/routes/index.tsx#L116) — Greeting

### Hardcoded Values

| Location | Value |
|---|---|
| TopBar name | `"Dr. A. Chen, MD"` |
| TopBar subtitle | `"Attending Physician"` |
| TopBar avatar initials | `"AC"` |
| Dashboard greeting | `"Good afternoon, Dr. Chen"` |
| TopBar date display | `"10 May 2026"` |

### Backend replacement

```
GET /api/auth/me → {
  id: string,
  name: string,
  credentials: string,      // "MD", "PharmD", etc.
  title: string,            // "Attending Physician"
  initials: string,
  avatarUrl?: string
}
```

The greeting time-of-day logic (`"Good afternoon"`) should be computed on the frontend from `new Date()`. The date display should use `Intl.DateTimeFormat`.

---

## 13. Session & State Management

**Source file:** [PatientContext.tsx](file:///c:/Users/USER/Desktop/aipharmacy-front/src/contexts/PatientContext.tsx)
**Also:** [TopBar.tsx](file:///c:/Users/USER/Desktop/aipharmacy-front/src/components/TopBar.tsx#L14-L17) — `localStorage("recent_patients")`

### Current Implementation

| Storage Key | Purpose | Current Backend |
|---|---|---|
| `smartpharm_patients` | Full patient array with mutated alert counts | localStorage (no backend) |
| `recent_patients` | Array of patient IDs for open TopBar tabs | localStorage (no backend) |

### What must change

The `PatientContext` currently:
1. Loads the full patient list from `localStorage` (fallback: hardcoded mock)
2. Mutates alert counts in-memory when alerts are resolved
3. Persists back to `localStorage`

This entire flow should be replaced with:
- **Fetch patients** from `GET /api/patients` on mount
- **Resolve alerts** via `POST /api/patients/:id/drug-alerts/:alertId/resolve`
- **Session tabs** can remain in `localStorage` (purely a UI preference) or be synced via `PUT /api/users/me/preferences`

---

## 14. Suggested API Endpoints

Here is the complete list of endpoints the backend needs to implement:

### Core Resources

```
GET    /api/auth/me
GET    /api/patients
GET    /api/patients?search=&risk=&dept=&page=&limit=
GET    /api/patients/:id
```

### Patient Clinical Data

```
GET    /api/patients/:id/drug-alerts
POST   /api/patients/:id/drug-alerts/:alertId/resolve
POST   /api/patients/:id/drug-alerts/:alertId/unresolve
GET    /api/patients/:id/labs
GET    /api/patients/:id/labs/trends?metric=&days=
GET    /api/patients/:id/vitals/current
GET    /api/patients/:id/vitals/trends?metric=&days=
GET    /api/patients/:id/medications
GET    /api/patients/:id/encounters
GET    /api/patients/:id/documents
GET    /api/patients/:id/documents/:docId
```

### Dashboard Aggregates

```
GET    /api/dashboard/metrics
GET    /api/alerts/recent?limit=
GET    /api/insights
GET    /api/activity?limit=
```

### User Preferences (optional)

```
GET    /api/users/me/preferences
PUT    /api/users/me/preferences
```

---

## Files That Need Modification

When the backend is ready, these files need to be updated:

| File | What to change |
|---|---|
| [mock-data.ts](file:///c:/Users/USER/Desktop/aipharmacy-front/src/lib/mock-data.ts) | **Delete entirely** — replaced by API calls |
| [PatientContext.tsx](file:///c:/Users/USER/Desktop/aipharmacy-front/src/contexts/PatientContext.tsx) | Replace `localStorage` init with `useQuery` / `fetch` calls to `/api/patients` |
| [index.tsx](file:///c:/Users/USER/Desktop/aipharmacy-front/src/routes/index.tsx) | Replace `alerts`, `insights`, `activity` constants with API data; make all metrics dynamic |
| [patient.$patientId.tsx](file:///c:/Users/USER/Desktop/aipharmacy-front/src/routes/patient.$patientId.tsx) | Replace `labs`, `drugAlerts` constants with per-patient API calls; replace document content with real document renderer |
| [TopBar.tsx](file:///c:/Users/USER/Desktop/aipharmacy-front/src/components/TopBar.tsx) | Replace `notifications` useMemo with API call; make user identity dynamic |
| [patient.index.tsx](file:///c:/Users/USER/Desktop/aipharmacy-front/src/routes/patient.index.tsx) | Already uses context — will work once context fetches from API |

> [!TIP]
> The project already has `@tanstack/react-query` installed and configured in `__root.tsx`. Use `useQuery` / `useMutation` hooks to replace all mock data with API calls. The `queryClient` is already available via route context.
