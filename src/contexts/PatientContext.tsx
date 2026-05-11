import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { mockPatients as initialPatients, Patient } from "@/lib/mock-data";

interface PatientContextType {
  patients: Patient[];
  resolveAlert: (patientId: string) => void;
  unresolveAlert: (patientId: string) => void;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export function PatientProvider({ children }: { children: React.ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>(() => {
    if (typeof window === "undefined") return initialPatients;
    const saved = localStorage.getItem("smartpharm_patients");
    return saved ? JSON.parse(saved) : initialPatients;
  });

  useEffect(() => {
    localStorage.setItem("smartpharm_patients", JSON.stringify(patients));
  }, [patients]);

  const resolveAlert = useCallback((patientId: string) => {
    setPatients(prev => prev.map(p => 
      p.id === patientId 
        ? { ...p, alerts: Math.max(0, p.alerts - 1) } 
        : p
    ));
  }, []);

  const unresolveAlert = useCallback((patientId: string) => {
    setPatients(prev => prev.map(p => 
      p.id === patientId 
        ? { ...p, alerts: p.alerts + 1 } 
        : p
    ));
  }, []);

  return (
    <PatientContext.Provider value={{ patients, resolveAlert, unresolveAlert }}>
      {children}
    </PatientContext.Provider>
  );
}

export function usePatients() {
  const context = useContext(PatientContext);
  if (context === undefined) {
    throw new Error("usePatients must be used within a PatientProvider");
  }
  return context;
}
