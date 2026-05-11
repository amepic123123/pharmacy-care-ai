export interface Patient {
  id: string;
  name: string;
  mrn: string;
  dept: string;
  risk: "HIGH" | "MED" | "LOW";
  alerts: number;
  age: string;
  gender: string;
  dob: string;
  phone: string;
  bloodType: string;
  weight: string;
  height: string;
  diagnosis: string;
  allergies: string[];
  conditions: string[];
  medications: string[];
  lastVisit: string;
}

export const mockPatients: Patient[] = [
  {
    id: "1",
    name: "Margaret R. Collins",
    mrn: "847201",
    dept: "Nephrology",
    risk: "HIGH",
    alerts: 2,
    age: "78Y",
    gender: "Female",
    dob: "12 Mar 1948",
    phone: "+1 (555) 231-9876",
    bloodType: "O+",
    weight: "62 kg",
    height: "158 cm",
    diagnosis: "Chronic Kidney Disease (CKD Stage 4)",
    allergies: ["Penicillin (Rash)"],
    conditions: ["Diabetes Mellitus", "Hypertension", "Anemia"],
    medications: ["Warfarin", "Metformin", "Lisinopril", "Furosemide", "Atorvastatin"],
    lastVisit: "08 May 2026",
  },
  {
    id: "2",
    name: "James O. Mendez",
    mrn: "847188",
    dept: "Cardiology",
    risk: "MED",
    alerts: 1,
    age: "64Y",
    gender: "Male",
    dob: "24 May 1960",
    phone: "+1 (555) 442-1092",
    bloodType: "A-",
    weight: "88 kg",
    height: "182 cm",
    diagnosis: "Atrial Fibrillation",
    allergies: ["Sulfa drugs"],
    conditions: ["Hypertension", "Type 2 Diabetes"],
    medications: ["Apixaban", "Metoprolol", "Amlodipine"],
    lastVisit: "10 May 2026",
  },
  {
    id: "3",
    name: "Aisha Patel",
    mrn: "847150",
    dept: "Oncology",
    risk: "HIGH",
    alerts: 3,
    age: "52Y",
    gender: "Female",
    dob: "15 Sep 1973",
    phone: "+1 (555) 883-2210",
    bloodType: "B+",
    weight: "54 kg",
    height: "162 cm",
    diagnosis: "Breast Cancer (Stage II)",
    allergies: ["None"],
    conditions: ["Lymphedema"],
    medications: ["Tamoxifen", "Cyclophosphamide"],
    lastVisit: "09 May 2026",
  },
  {
    id: "4",
    name: "Robert Hayashi",
    mrn: "847102",
    dept: "Internal Med",
    risk: "LOW",
    alerts: 0,
    age: "71Y",
    gender: "Male",
    dob: "02 Feb 1955",
    phone: "+1 (555) 123-4567",
    bloodType: "O-",
    weight: "75 kg",
    height: "175 cm",
    diagnosis: "Gastroesophageal Reflux Disease",
    allergies: ["Latex"],
    conditions: ["Hyperlipidemia"],
    medications: ["Omeprazole", "Simvastatin"],
    lastVisit: "05 May 2026",
  },
  {
    id: "5",
    name: "Elena Costa",
    mrn: "847011",
    dept: "Endocrinology",
    risk: "MED",
    alerts: 1,
    age: "45Y",
    gender: "Female",
    dob: "12 Aug 1980",
    phone: "+1 (555) 998-0012",
    bloodType: "AB+",
    weight: "68 kg",
    height: "165 cm",
    diagnosis: "Hashimoto's Thyroiditis",
    allergies: ["Dairy"],
    conditions: ["Hypothyroidism", "PCOS"],
    medications: ["Levothyroxine", "Metformin"],
    lastVisit: "07 May 2026",
  },
];
