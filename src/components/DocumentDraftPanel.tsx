import React, { useState, useEffect, useRef } from "react";
import { PropertyCase } from "../types";
import { 
  FileText, Copy, Check, Sparkles, Send, RefreshCw, 
  ChevronRight, CornerDownRight, HelpCircle, ShieldCheck, QrCode, Download, CheckCircle2, Cloud
} from "lucide-react";
import { generateDocumentSeal, DocumentSealInfo } from "../lib/security";
import { supabase } from "../lib/supabase";
import { downloadDocumentAsPDF } from "../lib/pdfExport";
import { useLanguage } from "../lib/languageContext";

interface DocumentDraftPanelProps {
  key?: any;
  caseData: PropertyCase;
  onUpdateDraft: (newTitle: string, newContent: string, historyDesc?: string) => void;
}

export function DocumentDraftPanel({ caseData, onUpdateDraft }: DocumentDraftPanelProps) {
  const { langMode, t } = useLanguage();
  
  const initialTitle = caseData.customDocumentDraft?.documentTitle || caseData.customDocumentDraft?.title || "சட்ட அறிவிப்பு / மனு";
  const initialContent = caseData.customDocumentDraft?.documentContent || caseData.customDocumentDraft?.content || "";

  const [draftTitle, setDraftTitle] = useState(() => initialTitle);
  const [draftContent, setDraftContent] = useState(() => initialContent);
  const [originalTitle, setOriginalTitle] = useState(() => initialTitle);
  const [originalContent, setOriginalContent] = useState(() => initialContent);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("saved");
  
  const [instructions, setInstructions] = useState("");
  const [isRefining, setIsRefining] = useState(false);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sealInfo, setSealInfo] = useState<DocumentSealInfo | null>(null);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync state if caseData changes from outside (e.g. cloud sync or different case selected)
  useEffect(() => {
    const nextTitle = caseData.customDocumentDraft?.documentTitle || caseData.customDocumentDraft?.title || "சட்ட அறிவிப்பு / மனு";
    const nextContent = caseData.customDocumentDraft?.documentContent || caseData.customDocumentDraft?.content || "";

    // Only update if fundamentally different and user is not currently in an active debounce
    if (nextTitle !== originalTitle && !debounceTimerRef.current) {
      setDraftTitle(nextTitle);
      setOriginalTitle(nextTitle);
    }
    if (nextContent !== originalContent && !debounceTimerRef.current) {
      setDraftContent(nextContent);
      setOriginalContent(nextContent);
    }
  }, [caseData.id, caseData.updatedAt]);

  useEffect(() => {
    if (caseData.id && draftContent) {
      generateDocumentSeal(caseData.id, draftContent).then(setSealInfo);
    }
  }, [caseData.id, draftContent]);

  // Clean up debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const triggerSave = (titleToSave: string, contentToSave: string, desc?: string) => {
    setSaveStatus("saving");
    try {
      onUpdateDraft(titleToSave, contentToSave, desc);
      setOriginalTitle(titleToSave);
      setOriginalContent(contentToSave);
      setTimeout(() => setSaveStatus("saved"), 350);
    } catch {
      setSaveStatus("idle");
    }
  };

  const handleTitleChange = (newTitle: string) => {
    setDraftTitle(newTitle);
    setSaveStatus("saving");
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      triggerSave(newTitle, draftContent, `வரைவுத் தலைப்பு மாற்றப்பட்டது: "${newTitle}"`);
      debounceTimerRef.current = null;
    }, 1200);
  };

  const handleContentChange = (newContent: string) => {
    setDraftContent(newContent);
    setSaveStatus("saving");
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      triggerSave(draftTitle, newContent, "வரைவு உள்ளடக்கங்கள் மாற்றப்பட்டது");
      debounceTimerRef.current = null;
    }, 1200);
  };

  const handleTitleBlur = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    if (draftTitle !== originalTitle) {
      triggerSave(draftTitle, draftContent, `வரைவுத் தலைப்பு மாற்றப்பட்டது: "${draftTitle}"`);
    }
  };

  const handleContentBlur = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    if (draftContent !== originalContent) {
      triggerSave(draftTitle, draftContent, "வரைவு உள்ளடக்கங்கள் கைமுறையாக மாற்றப்பட்டது");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(draftContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = async () => {
    setIsDownloadingPDF(true);
    try {
      await downloadDocumentAsPDF({
        title: draftTitle || "சட்ட வரைவு மனு (Legal Draft Petition)",
        reportType: "AI LEGAL DRAFT",
        docType: caseData.stage1?.category ? `${caseData.stage1.category} / Representation` : "Police / Legal Representation",
        domain: "Property Law (Property360 Intelligence)",
        caseId: `UK360-${String(caseData.id).toUpperCase().slice(-6)}`,
        status: "AI Draft | Advocate Review Recommended",
        content: draftContent || "சட்ட வரைவு விவரங்கள் இல்லை.",
        sealHash: sealInfo?.sha256Hash,
        filename: `${draftTitle || "AO_Draft"}_${caseData.id}`
      });
    } catch (err) {
      console.error("PDF Download failed:", err);
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  const handleRefine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instructions.trim()) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    setIsRefining(true);
    setErrorMessage(null);

    try {
      let authToken = "";
      try {
        const { data: { session } } = await supabase.auth.getSession();
        authToken = session?.access_token || "";
      } catch (err) {
        console.warn("Failed to get Supabase Auth Token:", err);
      }

      const response = await fetch("/api/draft", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(authToken ? { "Authorization": `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify({
          caseData,
          documentTitle: draftTitle,
          instructions,
          languageMode: langMode
        })
      });

      const responseText = await response.text();
      let data: any = null;
      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch {
          // Non-JSON response
        }
      }

      if (!response.ok) {
        const errorMsg = data?.error || responseText || "வரைவை மேம்படுத்துவதில் தோல்வி அடைந்தது.";
        throw new Error(errorMsg);
      }

      if (!data) {
        throw new Error("வரைவு எஞ்சின் செல்லுபடியாகும் தரவு வழங்கவில்லை.");
      }
      
      const newTitle = data.documentTitle || draftTitle;
      const newContent = data.documentContent || draftContent;

      setDraftTitle(newTitle);
      setDraftContent(newContent);
      
      const instrSnippet = instructions.length > 35 
        ? instructions.slice(0, 35) + "..." 
        : instructions;
      
      triggerSave(newTitle, newContent, `AI மூலம் வரைவு மேம்படுத்தப்பட்டது: "${instrSnippet}"`);
      setInstructions(""); // clear instructions
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "ஆவணத்தை மேம்படுத்துவதில் ஏதோ தவறு நிகழ்ந்துள்ளது.");
    } finally {
      setIsRefining(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      {/* Left Column: Interactive drafting viewer/editor (8 cols) */}
      <div className="lg:col-span-8 flex flex-col space-y-4 print:w-full print:border-none print:shadow-none">
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col min-h-[580px] overflow-hidden print:min-h-0 print:border-none print:shadow-none print:overflow-visible">
          
          {/* Draft header */}
          <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 print:bg-white print:border-b-2 print:border-slate-800 print:px-0">
            <div className="flex items-center gap-2 flex-1 min-w-[240px]">
              <span className="w-1.5 h-3.5 bg-purple-700 rounded mr-1"></span>
              <FileText className="h-4 w-4 text-purple-700 print:hidden no-print shrink-0" />
              <input 
                type="text" 
                value={draftTitle} 
                onChange={(e) => handleTitleChange(e.target.value)}
                onBlur={handleTitleBlur}
                className="font-bold text-slate-900 text-xs bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-purple-200 rounded px-1.5 py-0.5 w-full max-w-[420px] font-display print:text-lg print:text-slate-900"
              />
            </div>

            <div className="flex items-center gap-2 print:hidden no-print">
              {/* Real-time Save Status Indicator */}
              <div className="flex items-center gap-1 px-2 py-1 rounded bg-slate-100 border border-slate-200 text-[10px] font-semibold text-slate-600">
                {saveStatus === "saving" ? (
                  <>
                    <RefreshCw className="h-3 w-3 animate-spin text-purple-600" />
                    <span>{t("சேமிக்கப்படுகிறது...", "Saving...")}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                    <span>{t("சேமிக்கப்பட்டது", "Saved")}</span>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={handleDownloadPDF}
                disabled={isDownloadingPDF}
                className="btn-primary-purple !py-1.5 !px-3 !text-[11px] disabled:opacity-50"
                title="AO வரைவை PDF கோப்பாக பதிவிறக்கவும் (Download Draft as PDF)"
              >
                {isDownloadingPDF ? (
                  <>
                    <RefreshCw className="animate-spin h-3.5 w-3.5 text-white" />
                    <span className="font-bold">{t("PDF உருவாகிறது...", "Generating PDF...")}</span>
                  </>
                ) : (
                  <>
                    <Download className="h-3.5 w-3.5 text-white" />
                    <span className="font-bold">{t("PDF பதிவிறக்கம்", "Download PDF")}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleCopy}
                className="btn-secondary-white !py-1.5 !px-3 !text-[11px]"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">{t("நகலெடுக்கப்பட்டது!", "Copied!")}</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-slate-500" />
                    <span>{t("நகலெடு", "Copy Text")}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Draft editor text area */}
          <div className="flex-1 p-5 relative bg-slate-50/50 flex flex-col print:bg-white print:p-0">
            {isRefining && (
              <div className="absolute inset-0 bg-white/85 backdrop-blur-xs flex flex-col items-center justify-center gap-3 z-10 print:hidden no-print">
                <RefreshCw className="animate-spin h-8 w-8 text-purple-700" />
                <span className="text-xs font-bold text-slate-700">சட்ட அளவுருக்களுடன் மீண்டும் வரைவு செய்யப்படுகிறது...</span>
              </div>
            )}
            <textarea
              value={draftContent}
              onChange={(e) => handleContentChange(e.target.value)}
              onBlur={handleContentBlur}
              className="w-full min-h-[420px] flex-1 font-mono text-[11px] text-slate-800 p-4 bg-white border border-slate-200 rounded-xl leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-600 transition shadow-3xs print:hidden"
              placeholder="வழக்கு மதிப்பீடு வரைவு இங்கே தோன்றும்..."
            />

            {sealInfo && (
              <div className="mt-3 p-3 bg-slate-900 text-white rounded-xl flex items-center justify-between text-[10px] print:mt-6 print:border print:border-slate-300 print:text-slate-900 print:bg-slate-50">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-bold tracking-wider text-slate-200 uppercase font-mono">UNIKORN360 SHA-256 VERIFIABLE LEGAL SEAL</p>
                    <p className="text-slate-400 font-mono text-[9px] mt-0.5">HASH: {sealInfo.sha256Hash} • TIME: {new Date(sealInfo.timestamp).toLocaleDateString("ta-IN")}</p>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded border border-slate-700 text-emerald-300 font-mono text-[9px]">
                  <QrCode className="h-3.5 w-3.5" />
                  <span>TAMPER-PROOF RECORD</span>
                </div>
              </div>
            )}

            <div className="hidden print:block font-mono text-xs whitespace-pre-wrap leading-relaxed text-slate-900 bg-white p-2 border border-transparent min-h-[400px]">
              {draftContent || "ஆவண வரைவு இன்னும் உருவாக்கப்படவில்லை."}
              {sealInfo && (
                <div className="mt-8 pt-4 border-t border-slate-400 text-[10px] font-mono text-slate-700 flex justify-between items-center">
                  <div>
                    <p className="font-bold">VERIFIABLE LEGAL RECORD SEAL • UNIKORN360 ENTERPRISE</p>
                    <p>CASE ID: {sealInfo.caseId} | SHA-256 HASH: {sealInfo.sha256Hash}</p>
                  </div>
                  <p className="text-right">{new Date().toLocaleString("ta-IN")}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: AI Refiner and Instructions panel (4 cols) */}
      <div className="lg:col-span-4 space-y-6 print:hidden no-print">
        
        {/* AI Prompt Refiner Box */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
            <span className="w-1.5 h-3.5 bg-purple-700 rounded mr-1"></span>
            <div className="p-1.5 bg-purple-50 text-purple-800 rounded-lg">
              <Sparkles className="h-4 w-4" />
            </div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-display">மனுவை மேம்படுத்தும் AI</h3>
          </div>

          <div className="space-y-4">
            <p className="text-xs text-slate-500 leading-normal font-medium">
              சட்டப்பிரிவுகளைச் சேர்க்க, தொனியை மாற்ற அல்லது வாடிக்கையாளரின் குறிப்பிட்ட நிபந்தனைகளைச் சேர்க்க எளிய தமிழில் கட்டளைகளை வழங்கவும். ஜெமினி உடனடியாக முழு வரைவையும் மாற்றி எழுதும்.
            </p>

            <form onSubmit={handleRefine} className="space-y-3.5">
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows={4}
                placeholder="எ.கா: 'எதிர்த்தரப்பினர் போலியாகப் பதிவு செய்தால் குற்றவியல் நடவடிக்கை எடுக்கப்படும் என எச்சரிக்கும் பத்தியைச் சேர்க்கவும்.'"
                className="w-full p-3 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-purple-100 focus:border-purple-600 transition"
              />
              {errorMessage && (
                <p className="text-xs text-rose-600 font-bold">{errorMessage}</p>
              )}
              <button
                type="submit"
                disabled={isRefining || !instructions.trim()}
                className="btn-primary-purple w-full !py-2.5 text-xs flex items-center justify-center gap-1.5"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isRefining ? 'animate-spin' : ''}`} />
                <span>மனுவின் வரைவை மேம்படுத்து</span>
              </button>
            </form>
          </div>
        </div>

        {/* Guidance Reference Panel */}
        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3.5">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-3.5 bg-purple-700 rounded mr-1"></span>
            <h4 className="text-[10px] font-bold text-slate-600 uppercase tracking-wider font-display">பயனுள்ள சட்டப்பிரிவுகள் (ஆலோசனைகள்):</h4>
          </div>
          
          <div className="space-y-2.5 text-xs text-slate-700">
            <div className="flex items-start gap-1.5">
              <ChevronRight className="h-4 w-4 text-purple-700 shrink-0 mt-0.5" />
              <span className="font-medium"><strong>பிரிவு 77A (பத்திரப்பதிவு சட்டம்):</strong> போலி ஆவணங்களை ரத்து செய்ய பதிவாளர்களுக்கு அதிகாரம் அளித்தல்.</span>
            </div>
            <div className="flex items-start gap-1.5">
              <ChevronRight className="h-4 w-4 text-purple-700 shrink-0 mt-0.5" />
              <span className="font-medium"><strong>UDR சர்வே பிழை திருத்தம்:</strong> வருவாய் கோட்டாட்சியரை (RDO) நேரடியாக அணுகலாம்.</span>
            </div>
            <div className="flex items-start gap-1.5">
              <ChevronRight className="h-4 w-4 text-purple-700 shrink-0 mt-0.5" />
              <span className="font-medium"><strong>வழக்கு சட்டம் பிரிவு 34 (Specific Relief Act):</strong> சொத்துரிமையை நிலைநாட்ட உரிமையியல் நீதிமன்றத்தில் பிரகடன வழக்கு.</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
