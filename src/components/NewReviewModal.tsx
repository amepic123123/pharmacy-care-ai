import { useState, useRef, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { 
  X, Upload, FileText, Sparkles, CheckCircle2, AlertTriangle,
  Brain, Pill, FileSearch, Shield, Loader2
} from "lucide-react";
import { uploadPatientPDF, type UploadResult } from "@/lib/api";
import { usePatients } from "@/contexts/PatientContext";

type UploadState = "idle" | "uploading" | "processing" | "success" | "error";

const PROCESSING_STEPS = [
  { label: "Uploading document…", icon: Upload, threshold: 0 },
  { label: "Extracting text via OCR…", icon: FileSearch, threshold: 25 },
  { label: "Identifying patient demographics…", icon: FileText, threshold: 45 },
  { label: "Parsing lab results & medications…", icon: Pill, threshold: 60 },
  { label: "Running AI drug interaction analysis…", icon: Brain, threshold: 75 },
  { label: "Generating clinical alerts…", icon: Shield, threshold: 90 },
];

export function NewReviewModal({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const { addPatient } = usePatients();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [state, setState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentStep = PROCESSING_STEPS.filter(s => s.threshold <= progress).pop() || PROCESSING_STEPS[0];

  const handleFile = useCallback((file: File) => {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("Only PDF files are supported.");
      setState("error");
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setError("File size must be under 50 MB.");
      setState("error");
      return;
    }
    setSelectedFile(file);
    setError(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleUpload = useCallback(async () => {
    if (!selectedFile) return;

    setState("uploading");
    setProgress(0);

    try {
      const uploadResult = await uploadPatientPDF(selectedFile, (pct) => {
        setProgress(pct);
        if (pct > 50) setState("processing");
      });
      
      setResult(uploadResult);
      addPatient(uploadResult.patient);
      setState("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
      setState("error");
    }
  }, [selectedFile, addPatient]);

  const handleViewPatient = useCallback(() => {
    if (result) {
      navigate({ 
        to: "/patient/$patientId", 
        params: { patientId: result.patient.id }    ,
        search: { tab: "overview" },
      });
      onClose();
    }
  }, [result, navigate, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
        <div 
          className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-elevated overflow-hidden animate-in fade-in zoom-in-95 duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-xl bg-primary/15 flex items-center justify-center">
                <Sparkles className="size-4 text-primary" />
              </div>
              <div>
                <h2 className="text-base font-semibold">New Clinical Review</h2>
                <p className="text-xs text-muted-foreground">Upload a patient PDF for AI analysis</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="size-8 rounded-lg flex items-center justify-center hover:bg-accent transition"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5">
            {state === "idle" && (
              <div className="space-y-4 animate-in fade-in duration-300">
                {/* Drop zone */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-300 ${
                    dragActive 
                      ? "border-primary bg-primary/5 scale-[1.02]"
                      : selectedFile
                        ? "border-success/50 bg-success-soft"
                        : "border-border hover:border-primary/50 hover:bg-accent/20"
                  }`}
                >
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept=".pdf" 
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFile(file);
                    }}
                  />
                  
                  {selectedFile ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="size-14 rounded-xl bg-success/15 flex items-center justify-center">
                        <FileText className="size-6 text-success" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-foreground">{selectedFile.name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB · Ready to upload
                        </div>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                        className="text-[10px] font-bold text-muted-foreground hover:text-foreground uppercase tracking-wide"
                      >
                        Change file
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <div className={`size-14 rounded-xl flex items-center justify-center transition-all ${
                        dragActive ? "bg-primary/20 scale-110" : "bg-muted"
                      }`}>
                        <Upload className={`size-6 transition-colors ${dragActive ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          {dragActive ? "Drop your PDF here" : "Drag & drop a patient PDF"}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          or <span className="text-primary font-medium">click to browse</span> · PDF up to 50 MB
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="rounded-lg border border-info/30 bg-info-soft p-3">
                  <div className="text-[10px] uppercase tracking-wider text-info font-bold mb-1.5 flex items-center gap-1.5">
                    <Brain className="size-3" /> What happens next
                  </div>
                  <ul className="text-xs text-foreground/80 space-y-1">
                    <li className="flex items-start gap-2">
                      <span className="text-info mt-0.5">•</span>
                      AI extracts patient demographics, lab results, and medications
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-info mt-0.5">•</span>
                      Drug interaction analysis runs automatically
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-info mt-0.5">•</span>
                      Clinical alerts are generated and ready for review
                    </li>
                  </ul>
                </div>

                {/* Upload button */}
                <button
                  onClick={handleUpload}
                  disabled={!selectedFile}
                  className="w-full rounded-xl bg-primary text-primary-foreground text-sm font-semibold py-3 hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Sparkles className="size-4" /> Start AI Review
                </button>
              </div>
            )}

            {(state === "uploading" || state === "processing") && (
              <div className="space-y-5 py-4 animate-in fade-in duration-300">
                {/* Progress ring area */}
                <div className="flex flex-col items-center gap-4">
                  <div className="relative size-24">
                    <svg className="size-24 -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="42" fill="none" strokeWidth="6" className="stroke-muted" />
                      <circle
                        cx="50" cy="50" r="42" fill="none" strokeWidth="6"
                        strokeDasharray={`${2 * Math.PI * 42}`}
                        strokeDashoffset={`${2 * Math.PI * 42 * (1 - progress / 100)}`}
                        strokeLinecap="round"
                        className="stroke-primary transition-all duration-500"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl font-bold">{progress}%</span>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-sm font-semibold flex items-center gap-2 justify-center">
                      <Loader2 className="size-4 animate-spin text-primary" />
                      {currentStep.label}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{selectedFile?.name}</div>
                  </div>
                </div>

                {/* Step indicators */}
                <div className="space-y-2">
                  {PROCESSING_STEPS.map((step, i) => {
                    const isComplete = progress > step.threshold + 10;
                    const isCurrent = step === currentStep;
                    const StepIcon = step.icon;
                    
                    return (
                      <div 
                        key={i}
                        className={`flex items-center gap-3 text-xs rounded-lg px-3 py-2 transition-all duration-300 ${
                          isComplete 
                            ? "text-success bg-success-soft" 
                            : isCurrent 
                              ? "text-primary bg-primary/5 ring-1 ring-primary/20"
                              : "text-muted-foreground"
                        }`}
                      >
                        {isComplete ? (
                          <CheckCircle2 className="size-3.5 shrink-0" />
                        ) : isCurrent ? (
                          <Loader2 className="size-3.5 shrink-0 animate-spin" />
                        ) : (
                          <StepIcon className="size-3.5 shrink-0 opacity-40" />
                        )}
                        <span className={isComplete || isCurrent ? "font-medium" : ""}>{step.label.replace("…", "")}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {state === "success" && result && (
              <div className="space-y-4 py-2 animate-in fade-in zoom-in-95 duration-500">
                <div className="flex flex-col items-center gap-3">
                  <div className="size-16 rounded-full bg-success/15 flex items-center justify-center">
                    <CheckCircle2 className="size-8 text-success" />
                  </div>
                  <div className="text-center">
                    <div className="text-base font-semibold">Patient Record Created</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{result.patient.name} · MRN {result.patient.mrn}</div>
                  </div>
                </div>

                {/* Extraction summary */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Document Pages", value: result.extractedData.documentPages, icon: FileText },
                    { label: "Labs Extracted", value: result.extractedData.labsFound, icon: FileSearch },
                    { label: "Medications Found", value: result.extractedData.medicationsFound, icon: Pill },
                    { label: "Alerts Generated", value: result.extractedData.alertsGenerated, icon: AlertTriangle },
                  ].map((item) => (
                    <div key={item.label} className="rounded-lg border border-border bg-surface p-3 flex items-center gap-2.5">
                      <div className="size-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                        <item.icon className="size-3.5 text-primary" />
                      </div>
                      <div>
                        <div className="text-lg font-bold leading-none">{item.value}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">{item.label}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={onClose}
                    className="rounded-xl border border-border bg-surface-elevated text-sm font-medium py-3 hover:bg-accent transition"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleViewPatient}
                    className="rounded-xl bg-primary text-primary-foreground text-sm font-semibold py-3 hover:opacity-90 transition flex items-center justify-center gap-2"
                  >
                    <FileText className="size-4" /> View Patient
                  </button>
                </div>
              </div>
            )}

            {state === "error" && (
              <div className="space-y-4 py-4 animate-in fade-in duration-300">
                <div className="flex flex-col items-center gap-3">
                  <div className="size-14 rounded-full bg-critical/15 flex items-center justify-center">
                    <AlertTriangle className="size-7 text-critical" />
                  </div>
                  <div className="text-center">
                    <div className="text-base font-semibold">Upload Failed</div>
                    <div className="text-xs text-muted-foreground mt-1 max-w-[300px]">{error}</div>
                  </div>
                </div>
                <button
                  onClick={() => { setState("idle"); setError(null); setSelectedFile(null); }}
                  className="w-full rounded-xl border border-border bg-surface-elevated text-sm font-medium py-3 hover:bg-accent transition"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
