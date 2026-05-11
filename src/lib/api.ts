/**
 * SmartPharm AI — API Client
 * 
 * Every function tries a real backend fetch first.
 * If the backend is unreachable or returns an error, it falls back to mock data.
 * This ensures the app is always functional during development and demo.
 */

import { mockPatients, type Patient } from "./mock-data";

// ─── Configuration ──────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_URL || "/api";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`);
  return res.json();
}

// ─── Patients ───────────────────────────────────────────────────

export async function fetchPatients(): Promise<Patient[]> {
  try {
    return await apiFetch<Patient[]>("/patients");
  } catch {
    console.warn("[API] fetchPatients failed — using mock data");
    return mockPatients;
  }
}

export async function fetchPatientById(id: string): Promise<Patient | undefined> {
  try {
    return await apiFetch<Patient>(`/patients/${id}`);
  } catch {
    console.warn(`[API] fetchPatientById(${id}) failed — using mock data`);
    return mockPatients.find(p => p.id === id);
  }
}

// ─── Drug Alerts ────────────────────────────────────────────────

export interface DrugAlert {
  id?: string;
  severity: "critical" | "warning";
  title: string;
  drugs: string[];
  why: string;
  rec: string;
  open: boolean;
}

const mockDrugAlerts: Record<string, DrugAlert[]> = {
  "1": [
    {
      id: "da-1",
      severity: "critical",
      title: "Contraindicated Drug Combination",
      drugs: ["Metformin 1000mg", "Contrast Dye (Iohexol)"],
      why: "This patient's severely reduced kidney function (eGFR 28) means their body cannot eliminate metformin fast enough. Combining it with contrast dye — used in the scheduled CT scan — dramatically increases the risk of lactic acidosis, a rare but life-threatening buildup of lactic acid in the blood.",
      rec: "Hold metformin 48 hours before the procedure and restart only after kidney function is re-checked and confirmed stable.",
      open: true,
    },
    {
      id: "da-2",
      severity: "critical",
      title: "Dangerous Bleeding Risk",
      drugs: ["Warfarin 5mg", "Ibuprofen 400mg"],
      why: "Concurrent use significantly increases gastrointestinal bleeding risk in elderly patients on chronic anticoagulation.",
      rec: "Discontinue ibuprofen. Use acetaminophen for pain control and reassess INR within 48 hours.",
      open: false,
    },
    {
      id: "da-3",
      severity: "warning",
      title: "Elevated Potassium Level",
      drugs: ["Lisinopril 20mg", "Spironolactone 25mg"],
      why: "Potassium is high (5.8 mEq/L). Monitor closely and review medications.",
      rec: "Reduce ACE inhibitor dose, recheck potassium in 24h.",
      open: false,
    },
  ],
  "2": [
    {
      id: "da-4",
      severity: "critical",
      title: "Recent AFib Episode Detected",
      drugs: ["Apixaban 5mg", "Aspirin 81mg"],
      why: "Dual antithrombotic therapy increases major bleeding risk without clear benefit in stable AFib patients.",
      rec: "Discontinue aspirin unless recent coronary stent. Apixaban monotherapy is preferred.",
      open: true,
    },
  ],
  "3": [
    {
      id: "da-5",
      severity: "critical",
      title: "Immunosuppression Risk",
      drugs: ["Cyclophosphamide 100mg", "Tamoxifen 20mg"],
      why: "Cyclophosphamide causes significant immunosuppression. Monitor WBC and adjust dose accordingly.",
      rec: "Check CBC before next cycle. Consider G-CSF prophylaxis if neutrophils < 1.5.",
      open: true,
    },
    {
      id: "da-6",
      severity: "warning",
      title: "Hepatotoxicity Monitoring Required",
      drugs: ["Tamoxifen 20mg"],
      why: "Tamoxifen can cause hepatic steatosis and elevated liver enzymes over prolonged use.",
      rec: "Recheck ALT/AST in 4 weeks. Consider imaging if enzymes remain elevated.",
      open: false,
    },
    {
      id: "da-7",
      severity: "warning",
      title: "Thromboembolic Risk",
      drugs: ["Tamoxifen 20mg"],
      why: "Tamoxifen increases risk of deep vein thrombosis and pulmonary embolism.",
      rec: "Educate patient on warning signs. Avoid prolonged immobility.",
      open: false,
    },
  ],
  "5": [
    {
      id: "da-8",
      severity: "warning",
      title: "Thyroid-Metformin Interaction",
      drugs: ["Levothyroxine 75mcg", "Metformin 500mg"],
      why: "Metformin may alter TSH levels in hypothyroid patients, potentially requiring levothyroxine dose adjustment.",
      rec: "Recheck TSH in 6-8 weeks after metformin initiation or dose change.",
      open: true,
    },
  ],
};

export async function fetchDrugAlerts(patientId: string): Promise<DrugAlert[]> {
  try {
    return await apiFetch<DrugAlert[]>(`/patients/${patientId}/drug-alerts`);
  } catch {
    console.warn(`[API] fetchDrugAlerts(${patientId}) failed — using mock data`);
    return mockDrugAlerts[patientId] || [];
  }
}

export async function resolveAlertApi(patientId: string, alertId: string): Promise<void> {
  try {
    await apiFetch(`/patients/${patientId}/drug-alerts/${alertId}/resolve`, { method: "POST" });
  } catch {
    console.warn(`[API] resolveAlert failed — operating locally`);
  }
}

export async function unresolveAlertApi(patientId: string, alertId: string): Promise<void> {
  try {
    await apiFetch(`/patients/${patientId}/drug-alerts/${alertId}/unresolve`, { method: "POST" });
  } catch {
    console.warn(`[API] unresolveAlert failed — operating locally`);
  }
}

// ─── Lab Results ────────────────────────────────────────────────

export interface LabResult {
  name: string;
  value: string;
  unit: string;
  tone: "critical" | "warning" | "success";
}

const mockLabs: Record<string, LabResult[]> = {
  "1": [
    { name: "eGFR", value: "28", unit: "mL/min/1.73m²", tone: "critical" },
    { name: "ALT", value: "142", unit: "U/L", tone: "warning" },
    { name: "AST", value: "118", unit: "U/L", tone: "warning" },
    { name: "Total Bilirubin", value: "1.1", unit: "mg/dL", tone: "success" },
    { name: "Creatinine", value: "3.4", unit: "mg/dL", tone: "critical" },
    { name: "Potassium", value: "5.8", unit: "mEq/L", tone: "critical" },
    { name: "INR", value: "1.9", unit: "0.9 – 1.1 normal", tone: "warning" },
    { name: "Hemoglobin", value: "9.2", unit: "g/dL", tone: "warning" },
  ],
  "2": [
    { name: "INR", value: "2.4", unit: "target 2.0–3.0", tone: "success" },
    { name: "Creatinine", value: "1.1", unit: "mg/dL", tone: "success" },
    { name: "BNP", value: "450", unit: "pg/mL", tone: "warning" },
    { name: "Potassium", value: "4.2", unit: "mEq/L", tone: "success" },
    { name: "Hemoglobin", value: "13.1", unit: "g/dL", tone: "success" },
  ],
  "3": [
    { name: "WBC", value: "3.2", unit: "×10³/µL", tone: "warning" },
    { name: "Hemoglobin", value: "10.8", unit: "g/dL", tone: "warning" },
    { name: "Platelets", value: "145", unit: "×10³/µL", tone: "warning" },
    { name: "ALT", value: "62", unit: "U/L", tone: "warning" },
    { name: "Creatinine", value: "0.9", unit: "mg/dL", tone: "success" },
  ],
};

export async function fetchLabs(patientId: string): Promise<LabResult[]> {
  try {
    return await apiFetch<LabResult[]>(`/patients/${patientId}/labs`);
  } catch {
    console.warn(`[API] fetchLabs(${patientId}) failed — using mock data`);
    return mockLabs[patientId] || mockLabs["1"]!;
  }
}

// ─── Dashboard ──────────────────────────────────────────────────

export interface DashboardMetrics {
  activePatients: { value: number; change: string };
  criticalAlerts: { value: number; change: string };
  aiReviews: { value: number; accuracy: string };
  avgReviewTime: { value: string; change: string };
}

export interface DashboardAlert {
  severity: "critical" | "warning";
  title: string;
  patientId: string;
  patientName: string;
  detail: string;
  time: string;
}

export interface InsightItem {
  text: string;
}

export interface ActivityItem {
  who: string;
  what: string;
  when: string;
}

const mockDashboardAlerts: DashboardAlert[] = [
  { severity: "critical", title: "Contraindicated Drug Combination", patientId: "1", patientName: "Margaret R. Collins", detail: "Metformin + Contrast Dye — eGFR 28", time: "2m ago" },
  { severity: "critical", title: "Dangerous Bleeding Risk", patientId: "2", patientName: "James O. Mendez", detail: "Warfarin + Ibuprofen co-administration", time: "14m ago" },
  { severity: "warning", title: "Elevated Potassium Level", patientId: "1", patientName: "Margaret R. Collins", detail: "K+ 5.8 mEq/L — review ACE inhibitor dose", time: "31m ago" },
  { severity: "warning", title: "Renal Dose Adjustment Needed", patientId: "3", patientName: "Aisha Patel", detail: "Vancomycin trough 24 µg/mL", time: "1h ago" },
];

const mockInsights: InsightItem[] = [
  { text: "12 patients on metformin require eGFR re-check this week." },
  { text: "3 cardiology patients show INR drift — consider warfarin clinic referral." },
  { text: "New evidence: SGLT2 inhibitors recommended for CKD Stage 3 with diabetes." },
];

const mockActivity: ActivityItem[] = [
  { who: "Dr. A. Chen", what: "Signed override for Margaret R. Collins", when: "14:28" },
  { who: "Pharm. K. Liu", what: "Verified vancomycin dose for Aisha Patel", when: "13:55" },
  { who: "AI Assistant", what: "Flagged 4 new interactions in morning rounds", when: "08:12" },
  { who: "Dr. M. Okafor", what: "Updated care plan for James O. Mendez", when: "Yesterday" },
];

export async function fetchDashboardMetrics(fallbackAlertCount: number): Promise<DashboardMetrics> {
  try {
    return await apiFetch<DashboardMetrics>("/dashboard/metrics");
  } catch {
    console.warn("[API] fetchDashboardMetrics failed — using mock data");
    return {
      activePatients: { value: 248, change: "+12" },
      criticalAlerts: { value: fallbackAlertCount, change: "-3 today" },
      aiReviews: { value: 1284, accuracy: "98.7% accuracy" },
      avgReviewTime: { value: "2.3m", change: "-18% vs last week" },
    };
  }
}

export async function fetchDashboardAlerts(): Promise<DashboardAlert[]> {
  try {
    return await apiFetch<DashboardAlert[]>("/alerts/recent?limit=10");
  } catch {
    console.warn("[API] fetchDashboardAlerts failed — using mock data");
    return mockDashboardAlerts;
  }
}

export async function fetchInsights(): Promise<InsightItem[]> {
  try {
    return await apiFetch<InsightItem[]>("/insights");
  } catch {
    console.warn("[API] fetchInsights failed — using mock data");
    return mockInsights;
  }
}

export async function fetchActivity(): Promise<ActivityItem[]> {
  try {
    return await apiFetch<ActivityItem[]>("/activity?limit=20");
  } catch {
    console.warn("[API] fetchActivity failed — using mock data");
    return mockActivity;
  }
}

// ─── Patient Vitals & Trends ────────────────────────────────────

export interface VitalsSummary {
  bloodPressure: string;
  heartRate: string;
}

export interface TrendDataPoint {
  label: string;
  value: number;
}

const mockVitals: Record<string, VitalsSummary> = {
  "1": { bloodPressure: "138/82", heartRate: "88 bpm" },
  "2": { bloodPressure: "125/78", heartRate: "72 bpm" },
  "3": { bloodPressure: "118/72", heartRate: "80 bpm" },
};

const mockTrends: Record<string, TrendDataPoint[]> = {
  "1": [
    { label: "May 06", value: 35 },
    { label: "May 07", value: 32 },
    { label: "May 08", value: 28 },
    { label: "May 09", value: 26 },
    { label: "Today", value: 28 },
  ],
  "2": [
    { label: "May 06", value: 2.1 },
    { label: "May 07", value: 2.3 },
    { label: "May 08", value: 2.4 },
    { label: "May 09", value: 2.2 },
    { label: "Today", value: 2.4 },
  ],
};

export async function fetchVitals(patientId: string): Promise<VitalsSummary> {
  try {
    return await apiFetch<VitalsSummary>(`/patients/${patientId}/vitals/current`);
  } catch {
    console.warn(`[API] fetchVitals(${patientId}) failed — using mock data`);
    return mockVitals[patientId] || { bloodPressure: "120/80", heartRate: "75 bpm" };
  }
}

export async function fetchTrends(patientId: string): Promise<TrendDataPoint[]> {
  try {
    return await apiFetch<TrendDataPoint[]>(`/patients/${patientId}/vitals/trends?metric=eGFR&days=5`);
  } catch {
    console.warn(`[API] fetchTrends(${patientId}) failed — using mock data`);
    return mockTrends[patientId] || mockTrends["1"]!;
  }
}

// ─── Visit History ──────────────────────────────────────────────

export interface VisitEntry {
  date: string;
  event: string;
  detail: string;
}

export async function fetchVisitHistory(patientId: string, patient: Patient): Promise<VisitEntry[]> {
  try {
    return await apiFetch<VisitEntry[]>(`/patients/${patientId}/encounters`);
  } catch {
    console.warn(`[API] fetchVisitHistory(${patientId}) failed — using mock data`);
    return [
      { date: patient.lastVisit, event: "Last Clinical Encounter", detail: `Follow-up visit regarding ${patient.diagnosis}.` },
      { date: "12 Apr 2026", event: "Routine Review", detail: "General health screening and medication reconciliation." },
      { date: "05 Jan 2026", event: "Historical Entry", detail: "Initial baseline assessment performed." },
    ];
  }
}

// ─── User / Auth ────────────────────────────────────────────────

export interface UserProfile {
  name: string;
  credentials: string;
  title: string;
  initials: string;
}

export async function fetchCurrentUser(): Promise<UserProfile> {
  try {
    return await apiFetch<UserProfile>("/auth/me");
  } catch {
    console.warn("[API] fetchCurrentUser failed — using mock data");
    return {
      name: "Dr. A. Chen",
      credentials: "MD",
      title: "Attending Physician",
      initials: "AC",
    };
  }
}

// ─── TopBar Notifications ───────────────────────────────────────

export interface TopBarNotification {
  type: "critical" | "warning";
  msg: string;
  time: string;
}

const mockNotifications: Record<string, TopBarNotification[]> = {
  "1": [
    { type: "critical", msg: "Potassium levels rising (5.8 mEq/L)", time: "2m ago" },
    { type: "critical", msg: "Contraindicated: Metformin + Contrast", time: "15m ago" },
    { type: "warning", msg: "Lisinopril dosage review required", time: "1h ago" },
  ],
  "2": [
    { type: "critical", msg: "Recent AFib episode detected", time: "5m ago" },
    { type: "warning", msg: "INR check required", time: "30m ago" },
  ],
};

export async function fetchNotifications(patientId: string, patientName: string): Promise<TopBarNotification[]> {
  try {
    return await apiFetch<TopBarNotification[]>(`/patients/${patientId}/notifications`);
  } catch {
    console.warn(`[API] fetchNotifications(${patientId}) failed — using mock data`);
    return mockNotifications[patientId] || [
      { type: "critical", msg: `New clinical event for ${patientName}`, time: "10m ago" },
      { type: "warning", msg: "Medication review due", time: "2h ago" },
    ];
  }
}

// ─── PDF Upload / New Review ────────────────────────────────────

export interface UploadResult {
  patient: Patient;
  extractedData: {
    labsFound: number;
    medicationsFound: number;
    alertsGenerated: number;
    documentPages: number;
  };
}

export async function uploadPatientPDF(
  file: File,
  onProgress?: (pct: number) => void
): Promise<UploadResult> {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const result = await new Promise<UploadResult>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${API_BASE}/patients/upload`);

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress(Math.round((e.loaded / e.total) * 50));
        }
      });

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error(`Upload failed: ${xhr.status}`));
        }
      };

      xhr.onerror = () => reject(new Error("Network error during upload"));
      xhr.send(formData);
    });

    return result;
  } catch {
    console.warn("[API] uploadPatientPDF failed — simulating with mock data");

    for (let i = 0; i <= 50; i += 10) {
      onProgress?.(i);
      await new Promise(r => setTimeout(r, 200));
    }

    for (let i = 50; i <= 90; i += 5) {
      onProgress?.(i);
      await new Promise(r => setTimeout(r, 300));
    }

    const baseName = file.name.replace(/\.pdf$/i, "").replace(/[_-]/g, " ");
    const mockId = (Date.now() % 10000).toString();
    
    const newPatient: Patient = {
      id: mockId,
      name: baseName.length > 3
        ? baseName.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ")
        : `Patient ${mockId}`,
      mrn: (800000 + Math.floor(Math.random() * 99999)).toString(),
      dept: ["Cardiology", "Nephrology", "Internal Med", "Oncology", "Endocrinology"][Math.floor(Math.random() * 5)],
      risk: (["HIGH", "MED", "LOW"] as const)[Math.floor(Math.random() * 3)],
      alerts: Math.floor(Math.random() * 3),
      age: `${Math.floor(Math.random() * 40 + 30)}Y`,
      gender: Math.random() > 0.5 ? "Male" : "Female",
      dob: "01 Jan 1970",
      phone: "+1 (555) 000-0000",
      bloodType: ["O+", "A-", "B+", "AB+", "O-"][Math.floor(Math.random() * 5)],
      weight: `${Math.floor(Math.random() * 40 + 50)} kg`,
      height: `${Math.floor(Math.random() * 30 + 155)} cm`,
      diagnosis: "Pending AI Review",
      allergies: ["Pending Review"],
      conditions: ["Pending Review"],
      medications: ["Pending Review"],
      lastVisit: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    };

    onProgress?.(100);
    await new Promise(r => setTimeout(r, 400));

    return {
      patient: newPatient,
      extractedData: {
        labsFound: Math.floor(Math.random() * 8 + 3),
        medicationsFound: Math.floor(Math.random() * 5 + 1),
        alertsGenerated: newPatient.alerts,
        documentPages: Math.floor(Math.random() * 10 + 1),
      },
    };
  }
}
