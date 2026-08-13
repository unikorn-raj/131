import React, { useState } from "react";
import { PropertyCase } from "../types";
import { useLanguage } from "../lib/languageContext";
import { 
  Copy, Check, FileText, AlertCircle, Sparkles, Send, 
  Calendar, CheckSquare, Layers, UserCheck, Inbox, MessageSquare 
} from "lucide-react";

interface ClientReplyPanelProps {
  key?: any;
  caseData: PropertyCase;
}

export function ClientReplyPanel({ caseData }: ClientReplyPanelProps) {
  const { t } = useLanguage();
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const getBriefMessage = () => {
    const { problemIdentified, legalPosition, immediateNextStep, expectedAuthority, estimatedTimeline } = caseData.clientFacingReply || {};
    return `*${t("நிலம்360 சொத்து சட்ட விளக்கம்", "Nilam360 Property Legal Brief")}*
----------------------------------------
${t("அன்பான", "Dear")} ${caseData.stage0?.clientName || t("வாடிக்கையாளர்", "Client")},

${t("உங்களது சர்வே எண்.", "Regarding Survey No.")} ${caseData.stage0?.surveyNumber || "N/A"} (${caseData.stage0?.village || "N/A"} ${t("கிராமம்", "Village")}, ${caseData.stage0?.district || "N/A"} ${t("மாவட்டம்", "District")}) ${t("சொத்துத் தகராறு தொடர்பான தொழில்முறை மதிப்பீட்டு அறிக்கை கீழே கொடுக்கப்பட்டுள்ளது:", "property dispute report:")}

🔴 *${t("கண்டறியப்பட்ட பிரச்சனை", "Problem Identified")}:*
${problemIdentified || t("வருவாய் / பத்திரப்பதிவு முரண்பாடுகள் கண்டறியப்பட்டுள்ளன.", "Revenue or registration inconsistencies identified.")}

⚖️ *${t("சட்ட ரீதியான நிலை", "Legal Standing")}:*
${legalPosition || t("தமிழ்நாடு நிலச் சட்டங்களின் கீழ் ஆய்வு செய்யப்படுகிறது.", "Evaluated under Tamil Nadu property statutes.")}

📌 *${t("உடனடி அடுத்த கட்ட நடவடிக்கை", "Immediate Next Step")}:*
${immediateNextStep || t("தேவையான சான்றளிக்கப்பட்ட சொத்து நகல்களைப் பெற வேண்டும்.", "Obtain certified property copies.")}

🏢 *${t("அணுக வேண்டிய அதிகாரி / மன்றம்", "Target Forum / Authority")}:*
${expectedAuthority || t("தொடர்புடைய வருவாய்த் துறை / சார்பதிவாளர் அலுவலகம்.", "Concerned Revenue / SRO Office.")}

⏳ *${t("மதிப்பிடப்பட்ட கால அளவு", "Estimated Timeline")}:*
${estimatedTimeline || t("அரசு நடைமுறை கால வரம்பிற்கு உட்பட்டது.", "As per statutory procedure timeline.")}

${t("வாழ்த்துக்களுடன்,", "Warm regards,")}
*${t("நிலம்360 சொத்து ஆலோசனை குழு", "Nilam360 Legal Intelligence Team")}*`;
  };

  const rReply = caseData.clientFacingReply || {} as any;
  const rDocs = caseData.documentsRequired || { mandatory: [], revenue: [], family: [], court: [], other: [] };
  const rAction = caseData.immediateAction || { within24Hours: [], within7Days: [], within30Days: [] };
  const rPackage = caseData.servicePackage || { recommendedPackage: "", deliverables: [], professionalFee: "", expectedOutcome: "" };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      {/* Left Column: Client Facing Brief (7 cols) */}
      <div className="lg:col-span-7 space-y-6">
        
        {/* Client Brief Message */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-indigo-600" />
          
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4 pl-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                <MessageSquare className="h-4 w-4" />
              </div>
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest font-display">
                {t("வாடிக்கையாளர் தகவல் கையேடு", "Client Action Brief & Communication")}
              </h3>
            </div>
            
            <button
              onClick={() => handleCopy(getBriefMessage(), "brief")}
              className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-250 text-xs font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300 transition flex items-center gap-1.5 cursor-pointer shadow-3xs print:hidden no-print"
            >
              {copiedText === "brief" ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-extrabold text-[11px]">{t("நகலெடுக்கப்பட்டது!", "Copied!")}</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-slate-500" />
                  <span className="text-[11px]">{t("WhatsApp-இல் பகிர நகலெடு", "Copy Brief for WhatsApp")}</span>
                </>
              )}
            </button>
          </div>

          <div className="space-y-4 text-xs leading-relaxed text-slate-600 pl-2">
            {/* Card 1: Problem */}
            <div className="p-3.5 bg-slate-50/50 rounded-xl border border-slate-150">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                {t("அ. கண்டறியப்பட்ட பிரச்சனை", "A. Identified Core Dispute")}
              </span>
              <p className="text-slate-800 font-extrabold text-sm">{rReply.problemIdentified}</p>
            </div>

            {/* Card 2: Legal Position */}
            <div className="p-3.5 bg-slate-50/50 rounded-xl border border-slate-150">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                {t("ஆ. சட்ட ரீதியான நிலை", "B. Statutory & Legal Standing")}
              </span>
              <p className="text-slate-600 font-semibold">{rReply.legalPosition}</p>
            </div>

            {/* Card 3: Next Steps */}
            <div className="p-3.5 bg-indigo-50/20 rounded-xl border border-indigo-100">
              <span className="text-[9px] font-black text-indigo-500 uppercase tracking-wider block mb-1">
                {t("இ. உடனடி அடுத்த கட்ட நடவடிக்கை", "C. Immediate Recommended Step")}
              </span>
              <p className="text-indigo-950 font-black text-sm leading-tight">{rReply.immediateNextStep}</p>
            </div>

            {/* Grid for Authority & Timeline */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-150">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                  {t("ஈ. அணுக வேண்டிய அதிகாரி", "D. Target Forum / Authority")}
                </span>
                <p className="font-extrabold text-slate-800 text-xs">{rReply.expectedAuthority}</p>
              </div>
              <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-150">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                  {t("உ. மதிப்பிடப்பட்ட கால அளவு", "E. Estimated Timeline")}
                </span>
                <p className="font-extrabold text-indigo-700 text-xs">{rReply.estimatedTimeline}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Chronological Action Lists */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-amber-500" />
          
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 pl-2">
            <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
              <Calendar className="h-4 w-4" />
            </div>
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest font-display">
              {t("காலவரிசைப்படி நடவடிக்கை திட்டம்", "Chronological Action Roadmap")}
            </h3>
          </div>

          <div className="space-y-4.5 pl-2">
            {/* 24 Hours */}
            <div className="border-l-3 border-emerald-500 pl-4 space-y-1.5">
              <span className="text-[10px] font-black text-emerald-600 tracking-widest uppercase block">
                {t("24 மணி நேரத்திற்குள் (அவசரமானவை)", "Within 24 Hours (Urgent)")}
              </span>
              <ul className="space-y-1">
                {(rAction.within24Hours || []).map((act: string, idx: number) => (
                  <li key={idx} className="text-xs text-slate-600 flex items-start gap-2 font-medium">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 7 Days */}
            <div className="border-l-3 border-indigo-500 pl-4 space-y-1.5">
              <span className="text-[10px] font-black text-indigo-600 tracking-widest uppercase block">
                {t("7 நாட்களுக்குள் (வழிமுறைகள்)", "Within 7 Days (Procedural)")}
              </span>
              <ul className="space-y-1">
                {(rAction.within7Days || []).map((act: string, idx: number) => (
                  <li key={idx} className="text-xs text-slate-600 flex items-start gap-2 font-medium">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 30 Days */}
            <div className="border-l-3 border-slate-400 pl-4 space-y-1.5">
              <span className="text-[10px] font-black text-slate-500 tracking-widest uppercase block">
                {t("30 நாட்களுக்குள் (தீர்வு)", "Within 30 Days (Resolution)")}
              </span>
              <ul className="space-y-1">
                {(rAction.within30Days || []).map((act: string, idx: number) => (
                  <li key={idx} className="text-xs text-slate-600 flex items-start gap-2 font-medium">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

      </div>

      {/* Right Column: Documents Required & Service Proposal (5 cols) */}
      <div className="lg:col-span-5 space-y-6">
        
        {/* Documents Required Categorized List */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-sky-500" />
          
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 pl-2">
            <div className="p-1.5 bg-sky-50 text-sky-600 rounded-lg">
              <Layers className="h-4 w-4" />
            </div>
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest font-display">
              {t("தேவையான சொத்து ஆவணங்கள் கையேடு", "Required Property Document Checklist")}
            </h3>
          </div>

          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 pl-2">
            {/* Mandatory Docs */}
            {rDocs.mandatory?.length > 0 && (
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  {t("நிலை 1 - கட்டாய ஆவணங்கள்", "Stage 1 - Primary Title Documents")}
                </span>
                <div className="space-y-1">
                  {rDocs.mandatory.map((doc: string, idx: number) => (
                    <div key={idx} className="text-xs text-slate-700 font-semibold bg-slate-50 border border-slate-150 p-2.5 rounded-xl flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                      <span className="truncate">{doc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Revenue Docs */}
            {rDocs.revenue?.length > 0 && (
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  {t("நிலை 2 - நில வருவாய் ஆவணங்கள்", "Stage 2 - Revenue & Survey Records")}
                </span>
                <div className="space-y-1">
                  {rDocs.revenue.map((doc: string, idx: number) => (
                    <div key={idx} className="text-xs text-slate-700 font-semibold bg-slate-50 border border-slate-150 p-2.5 rounded-xl flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                      <span className="truncate">{doc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Family Docs */}
            {rDocs.family?.length > 0 && (
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  {t("நிலை 3 - குடும்பம் & வாரிசுரிமை ஆவணங்கள்", "Stage 3 - Family & Heirship Proofs")}
                </span>
                <div className="space-y-1">
                  {rDocs.family.map((doc: string, idx: number) => (
                    <div key={idx} className="text-xs text-slate-700 font-semibold bg-slate-50 border border-slate-150 p-2.5 rounded-xl flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                      <span className="truncate">{doc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Court / Litigation */}
            {rDocs.court?.length > 0 && (
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  {t("நிலை 4 - நீதிமன்ற வழக்கு ஆவணங்கள்", "Stage 4 - Court & Litigation Papers")}
                </span>
                <div className="space-y-1">
                  {rDocs.court.map((doc: string, idx: number) => (
                    <div key={idx} className="text-xs text-slate-700 font-semibold bg-slate-50 border border-slate-150 p-2.5 rounded-xl flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0" />
                      <span className="truncate">{doc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Deliverable & Retainer Proposal Service Package */}
        <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
          
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <div className="p-1.5 bg-indigo-950 text-indigo-400 rounded-lg">
              <Sparkles className="h-4 w-4" />
            </div>
            <h3 className="text-xs font-black uppercase tracking-widest font-display">
              {t("பரிந்துரைக்கப்படும் சேவை முன்மொழிவு", "Recommended Service Package Proposal")}
            </h3>
          </div>

          <div className="space-y-3.5">
            <div>
              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block mb-0.5">
                {t("சேவைப் பிரிவு", "Service Package")}
              </span>
              <span className="text-sm font-black text-indigo-300">{rPackage.recommendedPackage}</span>
            </div>

            <div className="bg-slate-950 border border-slate-800/80 p-3.5 rounded-xl flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                {t("ஆலோசனை கட்டணம் (தோராயமாக)", "Estimated Retainer Fee")}
              </span>
              <span className="text-lg font-black text-amber-400">{rPackage.professionalFee}</span>
            </div>

            <div>
              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1.5">
                {t("வழங்கப்படும் சேவைகள்:", "Package Deliverables:")}
              </span>
              <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                {(rPackage.deliverables || []).map((deliv: string, idx: number) => (
                  <div key={idx} className="text-xs text-slate-300 flex items-start gap-1.5">
                    <UserCheck className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                    <span>{deliv}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80">
              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block mb-0.5">
                {t("எதிர்பார்க்கப்படும் முடிவு", "Expected Legal Outcome")}
              </span>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                "{rPackage.expectedOutcome}"
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
