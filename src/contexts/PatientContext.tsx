import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { mockPatients as initialPatients, Patient } from "@/lib/mock-data";
import { fetchPatients } from "@/lib/api";

interface PatientContextType {
  patients: Patient[];
  isLoading: boolean;
  isBackendConnected: boolean;
  resolveAlert: (patientId: string) => void;
  unresolveAlert: (patientId: string) => void;
  addPatient: (patient: Patient) => void;
  refetch: () => void;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export function PatientProvider({ children }: { children: React.ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [isLoading, setIsLoading] = useState(true);
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  const loadPatients = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchPatients();
      // If we got data and it's different from the initial mock, the backend is connected
      const fromBackend = data !== initialPatients && data.length > 0;
      setIsBackendConnected(fromBackend);
      setPatients(data);
    } catch {
      console.warn("[PatientContext] Failed to load patients, using mock data");
      setPatients(initialPatients);
      setIsBackendConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

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

  const addPatient = useCallback((patient: Patient) => {
    setPatients(prev => [patient, ...prev]);
  }, []);

  return (
    <PatientContext.Provider value={{ patients, isLoading, isBackendConnected, resolveAlert, unresolveAlert, addPatient, refetch: loadPatients }}>
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
