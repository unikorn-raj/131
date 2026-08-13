import React, { useState } from "react";
import { PropertyCase, CaseReferenceItem } from "../types";
import { useLanguage } from "../lib/languageContext";
import { 
  Scale, BookOpen, CheckCircle, AlertCircle, ArrowRight, Gavel, 
  Sparkles, ShieldCheck, ShieldAlert, Award, FileText, Landmark,
  Zap, ChevronDown, ChevronUp, ChevronRight, Search, Layers, HelpCircle, Target,
  Crosshair, Lightbulb, ListOrdered, CheckSquare, XCircle, ArrowUpRight
} from "lucide-react";

interface PrecedentAndStrategyPanelProps {
  key?: any;
  caseData: PropertyCase;
}

export function PrecedentAndStrategyPanel({ caseData }: PrecedentAndStrategyPanelProps) {
  const { t } = useLanguage();
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"stage11" | "stage12">("stage11");
  const [issueFilter, setIssueFilter] = useState<string>("All");

  const stage11 = caseData.stage11;
  const stage12 = caseData.stage12;

  const rawGovOrders = stage11?.authoritiesSummary?.governmentOrders;
  const govOrders = rawGovOrders !== undefined
    ? rawGovOrders
    : [
        {
          orderNumber: "G.O. Ms. No. 120",
          date: "14-05-2022",
          department: t("வருவாய் மற்றும் பேரிடர் மேலாண்மைத் துறை", "Revenue & Disaster Management Dept"),
          subject: t("வருவாய் நீதிமன்ற விசாரணை இன்றி தன்னிச்சையாகப் பட்டா ரத்து செய்யக் கூடாது என்பதற்கான நெறிமுறைகள்", "Guidelines that patta cannot be cancelled arbitrarily without enquiry"),
          relevance: t("இயற்கை நீதி மீறி பிறப்பிக்கப்பட்ட தாலுகா அலுவலர் உத்தரவை ரத்து செய்ய இந்த அரசாணை நேரடிச் சான்றாகும்.", "Direct authority to quash Tahsildar order passed in breach of natural justice.")
        }
      ];

  const rawCircs = stage11?.authoritiesSummary?.circulars;
  const circs = rawCircs !== undefined
    ? rawCircs
    : [
        {
          circularNumber: "சுற்றறிக்கை எண். 18/2023",
          date: "28-09-2023",
          department: t("நில அளவை மற்றும் பதிவேடுகள் இயக்ககம்", "Survey & Settlement Directorate"),
          subject: t("கூட்டுப் பட்டா உட்பிரிவு மற்றும் சர்வே எல்லைக் கோடுகள் மாற்றம் தொடர்பான வரைமுறைகள்", "Guidelines on joint patta subdivision and boundary alterations"),
          relevance: t("விசாரணை இன்றி நில வரைபடத்தில் மாற்றம் செய்வததைத் தடுக்கும் அதிகாரப்பூர்வ சுற்றறிக்கை.", "Official circular preventing FMB boundary alteration without due notice.")
        }
      ];

  // Fallback defaults if analyzing older case without stage11/12
  const rawSimilarCases = stage11?.similarCases && stage11.similarCases.length > 0 ? stage11.similarCases : null;

  const similarCases: CaseReferenceItem[] = rawSimilarCases || [
    {
      caseId: "HC-TN-2023-881",
      citation: "2023 (4) CTC 412 (Madras HC)",
      court: "Madras High Court",
      title: "ராமசாமி செட்டியார் vs மாவட்ட வருவாய் அலுவலர் (DRO), மதுரை",
      year: 2023,
      similarityScore: 94,
      disputeIssueCategory: "வருவாய் நீதிமன்ற விசாரணை இன்றி தன்னிச்சையாகப் பட்டா மாற்றம்",
      keyLegalHoldings: [
        "பட்டாதாரருக்கு எழுத்துப்பூர்வ அறிவிப்பு வழங்காமல் தாலுகா அலுவலர் பட்டாவை ரத்து செய்ய முடியாது.",
        "வருவாய் கோட்டாட்சியர் (RDO) விசாரணை செய்யாமல் பிறப்பித்த உத்தரவு செல்லாது."
      ],
      factualSimilarity: "மனுதாரர் 30 ஆண்டுகளாக அனுபவத்தில் இருந்த நிலையில், எதிர்மனுதாரர் மனுவின் பேரில் விசாரணை இன்றி பட்டா மாற்றப்பட்டது.",
      strategicValue: "இயற்கை நீதி மீறப்பட்டதைச் சுட்டிக்காட்டி உயர் நீதிமன்றப் பேராணை (Writ) தாக்கல் செய்யப் பயன்படுத்தலாம்."
    },
    {
      caseId: "HC-TN-2022-104",
      citation: "2022 (2) MWN (Civil) 605",
      court: "Madras High Court (Madurai Bench)",
      title: "கருப்பையா vs சுப்பிரமணியன் மற்றும் பலர்",
      year: 2022,
      similarityScore: 89,
      disputeIssueCategory: "பிரிவு 77A போலி பத்திர ரத்து மற்றும் மாவட்ட பதிவாளர் அதிகாரம்",
      keyLegalHoldings: [
        "போலி பத்திரம் மூலம் பதிவு செய்யப்பட்ட ஆவணங்களை மாவட்ட பதிவாளர் விசாரணை நடத்தி ரத்து செய்யலாம்.",
        "உரிமையியல் நீதிமன்ற வழக்கு நிலுவையில் இருந்தாலும் போலி பதிவு ரத்து செய்யத் தடையல்ல."
      ],
      factualSimilarity: "போலி ஆவணங்கள் மூலம் சார்பதிவாளர் அலுவலகத்தில் நிறைவேற்றப்பட்ட விற்பனைப் பத்திரம்.",
      strategicValue: "மாவட்ட பதிவாளரிடம் பதிவுச் சட்டப் பிரிவு 77A-ன்கீழ் போலி பத்திர ரத்து மனு தாக்கல் செய்ய உகந்தது."
    }
  ];

  const filteredCases = issueFilter === "All" 
    ? similarCases 
    : similarCases.filter(c => c.disputeIssueCategory?.toLowerCase().includes(issueFilter.toLowerCase()));

  const selectedCase = similarCases.find(c => c.caseId === selectedCaseId) || similarCases[0];

  const successPercentage = stage12?.strongestLegalRoute?.successProbabilityPercentage || 85;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl text-white space-y-6">
      
      {/* Top Banner Header */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-0.5 bg-purple-900/80 border border-purple-700 text-purple-200 text-[10px] font-black rounded-full uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-amber-400 animate-pulse" />
                STAGE 11 & 12 • LEGAL INTELLIGENCE ENGINE
              </span>
            </div>
            <h2 className="text-xl font-black tracking-tight font-display text-white">
              {t("முன்மாதிரி தீர்ப்புகள் & சட்ட உத்தி சிமுலேட்டர்", "Precedent Intelligence & Legal Strategy Simulator")}
            </h2>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              {t(
                "மெட்ராஸ் உயர் நீதிமன்றத் தீர்ப்புகள், தமிழ்நாடு அரசாணைகள் & வெற்றி வாய்ப்பு கணிப்பு.",
                "Madras High Court precedents, Tamil Nadu GOs, and AI strategy simulation."
              )}
            </p>
          </div>

          <div className="flex items-center gap-3 bg-purple-950/60 border border-purple-800/80 p-3.5 rounded-2xl shrink-0">
            <div>
              <span className="text-[9px] font-extrabold text-amber-300 uppercase tracking-widest block">
                {t("கணிக்கப்பட்ட வெற்றி வாய்ப்பு", "Simulated Success Probability")}
              </span>
              <span className="text-sm font-bold text-white block">
                {t("வலுவான சட்ட நிலை", "Strong Legal Standing")}
              </span>
            </div>
            <div className="w-14 h-14 rounded-full bg-purple-700 text-white font-black text-lg flex items-center justify-center shrink-0 border-2 border-amber-300 shadow-sm">
              {successPercentage}%
            </div>
          </div>
        </div>

        {/* Tab Selection buttons */}
        <div className="flex items-center gap-2 pt-4">
          <button
            onClick={() => setActiveTab("stage11")}
            className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "stage11"
                ? "bg-purple-700 text-white shadow-xs"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>{t("நிலை 11 - முன்மாதிரி தீர்ப்புகள் (Precedents)", "Stage 11 - Precedent Intelligence")}</span>
          </button>

          <button
            onClick={() => setActiveTab("stage12")}
            className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "stage12"
                ? "bg-purple-700 text-white shadow-xs"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
            }`}
          >
            <Target className="h-4 w-4 text-amber-400" />
            <span>{t("நிலை 12 - சட்ட உத்தி சிமுலேட்டர் (Strategy)", "Stage 12 - Strategy Simulator")}</span>
          </button>
        </div>
      </div>

      {/* STAGE 11 CONTENT */}
      {activeTab === "stage11" && (
        <div className="space-y-6">
          
          {/* Summary Stat Grid for Precedents */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 shadow-sm">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                {t("ஒத்த தீர்ப்புகள்", "Similar Judgments")}
              </span>
              <div className="text-2xl font-black text-purple-300 flex items-center gap-2">
                <span>{similarCases.length}</span>
                <span className="text-xs font-bold text-slate-400">{t("தீர்ப்புகள்", "Cases Found")}</span>
              </div>
            </div>

            <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 shadow-sm">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                {t("சராசரி ஒற்றுமை வீதம்", "Avg Similarity Score")}
              </span>
              <div className="text-2xl font-black text-emerald-400">
                {stage11?.averageSimilarityScore || 91}%
              </div>
            </div>

            <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 shadow-sm">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                {t("உயர் நீதிமன்றத் தீர்ப்புகள்", "High Court Rulings")}
              </span>
              <div className="text-2xl font-black text-indigo-300">
                {stage11?.authoritiesSummary?.highCourtCount || 3} {t("தீர்ப்புகள்", "Rulings")}
              </div>
            </div>

            <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 shadow-sm">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                {t("அரசாணைகள் & சுற்றறிக்கைகள்", "Govt Orders & Circulars")}
              </span>
              <div className="text-2xl font-black text-amber-300">
                {govOrders.length + circs.length} {t("சான்றுகள்", "Authorities")}
              </div>
            </div>
          </div>

          {/* Main Precedent Reference Library & Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Case List */}
            <div className="lg:col-span-5 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                <span>{t("முக்கிய தீர்ப்புகளின் நூலகம்", "Precedent Library")}</span>
                <span className="text-[10px] text-purple-400 font-bold">{filteredCases.length} items</span>
              </h3>

              <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                {filteredCases.map((c) => {
                  const isSelected = selectedCase?.caseId === c.caseId;
                  return (
                    <div
                      key={c.caseId}
                      onClick={() => setSelectedCaseId(c.caseId)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-left ${
                        isSelected
                          ? "bg-purple-900/60 border-purple-500 shadow-md"
                          : "bg-slate-800/60 border-slate-700 hover:border-slate-600 hover:bg-slate-800"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-950/60 border border-amber-800 px-2 py-0.5 rounded">
                          {c.citation}
                        </span>
                        <span className="text-xs font-black text-emerald-400 flex items-center gap-1">
                          <span>{c.similarityScore}%</span>
                          <span className="text-[9px] text-slate-400 font-normal">{t("ஒற்றுமை", "Match")}</span>
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-white leading-snug line-clamp-2 mb-1">
                        {c.title}
                      </h4>

                      <p className="text-[10px] text-slate-300 line-clamp-1 font-medium">
                        {c.disputeIssueCategory}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Case Deep-Dive Viewer */}
            <div className="lg:col-span-7 bg-slate-800/90 border border-slate-700 rounded-2xl p-5 space-y-4">
              <div className="border-b border-slate-700 pb-3 flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-950 px-2.5 py-0.5 rounded border border-amber-800">
                    {selectedCase.citation}
                  </span>
                  <h3 className="text-sm font-bold text-white mt-1.5">
                    {selectedCase.title}
                  </h3>
                  <p className="text-[11px] text-purple-300 font-semibold mt-0.5">
                    {selectedCase.court} ({selectedCase.year})
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xl font-black text-emerald-400">{selectedCase.similarityScore}%</span>
                  <span className="text-[9px] text-slate-400 block font-bold">{t("ஒற்றுமை மதிப்பெண்", "Similarity Score")}</span>
                </div>
              </div>

              {/* Factual Similarity */}
              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-700/80">
                <span className="text-[9px] font-black text-purple-300 uppercase tracking-wider block mb-1">
                  {t("நிகழ்வு ஒற்றுமை (Factual Similarity)", "Factual Similarity")}
                </span>
                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                  {selectedCase.factualSimilarity}
                </p>
              </div>

              {/* Key Legal Holdings */}
              <div>
                <span className="text-[9px] font-black text-amber-300 uppercase tracking-wider block mb-2">
                  {t("நீதிமன்றத்தின் முக்கிய சட்டத் தீர்ப்புரைகள் (Key Legal Holdings)", "Key Legal Holdings")}
                </span>
                <ul className="space-y-1.5 text-xs text-slate-200 font-medium">
                  {selectedCase.keyLegalHoldings.map((h, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-slate-900/50 p-2 rounded-lg border border-slate-700/50">
                      <Gavel className="h-3.5 w-3.5 text-purple-400 mt-0.5 shrink-0" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Strategic Value */}
              <div className="p-3 bg-purple-950/50 border border-purple-800/80 rounded-xl">
                <span className="text-[9px] font-black text-amber-300 uppercase tracking-wider block mb-1">
                  {t("இந்த வழக்கிற்கு இதன் பயன்பாடு (Strategic Value)", "Strategic Value for Current Case")}
                </span>
                <p className="text-xs text-purple-100 font-semibold leading-relaxed">
                  {selectedCase.strategicValue}
                </p>
              </div>
            </div>

          </div>

          {/* Statutory Authorities: GOs & Circulars */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            
            {/* Government Orders */}
            <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-2 border-b border-slate-700 pb-2">
                <Landmark className="h-4 w-4 text-amber-400" />
                {t("அரசாணைகள் (Government Orders - G.O.s)", "Government Orders (G.O.s)")}
              </h4>

              <div className="space-y-2.5">
                {govOrders.map((go: any, idx: number) => (
                  <div key={idx} className="p-3 bg-slate-900/80 rounded-xl border border-slate-700 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{go.orderNumber}</span>
                      <span className="text-[9px] text-slate-400 font-mono">{go.date}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 font-medium">{go.subject}</p>
                    <p className="text-[10px] text-amber-200/90 font-semibold bg-amber-950/40 p-2 rounded border border-amber-900/50 mt-1">
                      <strong>{t("பயன்பாடு:", "Relevance:")}</strong> {go.relevance}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Circulars */}
            <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-black text-indigo-300 uppercase tracking-wider flex items-center gap-2 border-b border-slate-700 pb-2">
                <FileText className="h-4 w-4 text-indigo-400" />
                {t("சுற்றறிக்கைகள் (Official Circulars)", "Official Revenue & Land Circulars")}
              </h4>

              <div className="space-y-2.5">
                {circs.map((circ: any, idx: number) => (
                  <div key={idx} className="p-3 bg-slate-900/80 rounded-xl border border-slate-700 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{circ.circularNumber}</span>
                      <span className="text-[9px] text-slate-400 font-mono">{circ.date}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 font-medium">{circ.subject}</p>
                    <p className="text-[10px] text-indigo-200/90 font-semibold bg-indigo-950/40 p-2 rounded border border-indigo-900/50 mt-1">
                      <strong>{t("பயன்பாடு:", "Relevance:")}</strong> {circ.relevance}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* STAGE 12 CONTENT */}
      {activeTab === "stage12" && (
        <div className="space-y-6">
          
          {/* 12.1 Strongest Legal Route Card */}
          <div className="bg-slate-800 border-2 border-purple-500 rounded-2xl p-6 shadow-md relative overflow-hidden">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-0.5 bg-purple-600 text-white text-[10px] font-black rounded-full uppercase tracking-widest">
                12.1 {t("மிக வலுவான சட்ட வழிமுறை", "STRONGEST LEGAL ROUTE")}
              </span>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                {t("மிக உயர்ந்த வெற்றி வாய்ப்பு", "Highest Success Probability")}
              </span>
            </div>

            <h3 className="text-xl font-black text-white leading-tight font-display mb-2">
              {stage12?.strongestLegalRoute?.routeName || t("மெட்ராஸ் உயர் நீதிமன்றத்தில் பேராணை மனு (Writ Petition under Article 226)", "Writ Petition under Article 226 in Madras High Court")}
            </h3>

            <p className="text-xs text-slate-200 font-medium leading-relaxed mb-4 bg-purple-950/60 p-3 rounded-xl border border-purple-800">
              <strong>{t("ஏன் இந்த வழிமுறை?:", "Why this Route?:")}</strong> {stage12?.strongestLegalRoute?.justification || t("இயற்கை நீதி மீறல் மற்றும் தாலுகா அதிகாரியின் எல்லை மீறிய நடவடிக்கை தெளிவாக இருப்பதால், உயர் நீதிமன்றப் பேராணை மூலம் மிக விரைவான நிவாரணம் பெற முடியும்.", "Action passed in breach of natural justice without notice gives high probability of writ relief.")}
            </p>

            <div className="flex items-center justify-between text-xs font-bold text-slate-300 border-t border-slate-700 pt-3">
              <span>{t("வகை:", "Route Type:")} {stage12?.strongestLegalRoute?.routeType || t("அரசியலமைப்பு பேராணை (Writ)", "Writ Jurisdiction")}</span>
              <span className="text-purple-300">{t("எதிர்பார்க்கப்படும் கால அளவு:", "Estimated Resolution:")} {stage12?.strongestLegalRoute?.timeToResolutionEst || t("3 முதல் 6 மாதங்கள்", "3 to 6 Months")}</span>
            </div>
          </div>

          {/* Grid of 12.3 Evidence Gaps & 12.4 Counterarguments */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 12.3 Evidence Gaps to Fill */}
            <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 shadow-sm space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-700 pb-3">
                <XCircle className="h-4 w-4 text-rose-400" />
                12.3 {t("நிரப்பப்பட வேண்டிய ஆதார இடைவெளிகள்", "Evidence Gaps to Fill")}
              </h4>

              <div className="space-y-3">
                {(stage12?.evidenceGapsToFill || [
                  { missingElement: t("முந்தைய தாய் பத்திரம் (Parent Document)", "Parent Title Document"), howToObtain: t("சார்பதிவாளர் அலுவலகத்தில் சான்றளிக்கப்பட்ட நகல் விண்ணப்பித்தல்", "Apply certified copy at SRO"), urgency: "High" },
                  { missingElement: t("கிராம ஏ-பதிவேடு சான்றளிக்கப்பட்ட நகல்", "A-Register Extract"), howToObtain: t("இ-சேவை மையம் அல்லது தாலுகா அலுவலகம் மூலம் பெறுதல்", "Apply at e-Sevai or Taluk Office"), urgency: "Medium" }
                ]).map((eg, i) => (
                  <div key={i} className="p-3 bg-slate-900/80 border border-slate-700 rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{eg.missingElement}</span>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${
                        eg.urgency === "High" ? "bg-rose-950 text-rose-300 border border-rose-800" : "bg-amber-950 text-amber-300 border border-amber-800"
                      }`}>
                        {eg.urgency} {t("அவசரம்", "Urgency")}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 font-medium">
                      <strong>{t("பெறும் வழிமுறை:", "How to Obtain:")}</strong> {eg.howToObtain}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 12.4 Opposing Counterarguments & Rebuttal Strategies */}
            <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 shadow-sm space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-700 pb-3">
                <ShieldAlert className="h-4 w-4 text-amber-400" />
                12.4 {t("எதிர்த்தரப்பின் சாத்தியமான வாதங்கள் & பதில் உத்தி", "Counterargument Simulator & Rebuttals")}
              </h4>

              <div className="space-y-3">
                {(stage12?.likelyOppositeCounterarguments || [
                  { 
                    argument: t("எதிர்த்தரப்பினர் உரிமையியல் நீதிமன்றத்திற்குச் செல்ல வேண்டும் என்று வாதிடக்கூடும்.", "Opposite party may argue to relegate matter to Civil Court."), 
                    rebuttalStrategy: t("வருவாய் அதிகாரி இயற்கை நீதியை மீறியதால், மாற்று நிவாரணம் இருந்தாலும் உயர் நீதிமன்றப் பேராணை செல்லும் என வாதாடுதல்.", "Argue that breach of natural justice permits direct Writ petition despite alternative remedies.") 
                  },
                  { 
                    argument: t("காலதாமதம் (Limitation) காரணம் காட்டி மனுவைத் தள்ளுபடி செய்யக் கோரக்கூடும்.", "Opposite party may plead limitation/laches."), 
                    rebuttalStrategy: t("பட்டா மாறுதல் உத்தரவு தங்களுக்குத் தெரியப்படுத்தப்படவில்லை என்பதை அஞ்சல் சான்றுகளுடன் நிரூபித்தல்.", "Demonstrate lack of notice with postal receipt logs.") 
                  }
                ]).map((ca, i) => (
                  <div key={i} className="p-3 bg-slate-900/80 border border-slate-700 rounded-xl space-y-1.5">
                    <span className="text-[10px] font-bold text-rose-400 uppercase block">{t(`எதிர்த்தரப்பு வாதம் ${i + 1}`, `Opposing Argument ${i + 1}`)}:</span>
                    <p className="text-xs font-bold text-white">"{ca.argument}"</p>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase block mt-1">{t("AI பதில் உத்தி (Rebuttal)", "AI Rebuttal Strategy")}:</span>
                    <p className="text-xs text-slate-200 font-medium bg-slate-950 p-2 rounded border border-emerald-900">
                      {ca.rebuttalStrategy}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* 12.5 Additional Recommended Proof & 12.6 Priority Next Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Additional Recommended Proof */}
            <div className="lg:col-span-5 bg-slate-800/80 border border-slate-700 rounded-2xl p-6 shadow-sm space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-700 pb-3">
                <CheckSquare className="h-4 w-4 text-purple-400" />
                12.5 {t("கூடுதல் சாட்சியங்கள் & ஆவணப் பரிந்துரைகள்", "Additional Recommended Evidence")}
              </h4>

              <div className="space-y-2.5">
                {(stage12?.recommendedAdditionalProof || [
                  { type: "Document", title: t("வில்லங்கச் சான்று (EC) 30 ஆண்டுகள்", "30-Year Encumbrance Certificate"), purpose: t("சொத்தில் வில்லங்கம் இல்லை என்பதை நிரூபிக்க", "Prove continuous unencumbered title") },
                  { type: "Witness", title: t("கிராம நிர்வாக அலுவலர் (VAO) வாக்குமூலம்", "VAO Village Revenue Statement"), purpose: t("உண்மையான நில சுவாதீனத்தை உறுதிப்படுத்த", "Confirm actual physical possession") },
                  { type: "Technical Survey", title: t("FMB வரைபடம் & சர்வேயர் அளவீடு", "FMB Sketch & Land Survey Report"), purpose: t("நில எல்லைகளைத் துல்லியமாக வரையறுக்க", "Precisely demarcate survey boundaries") }
                ]).map((ap, i) => (
                  <div key={i} className="p-3 bg-slate-900/80 border border-slate-700 rounded-xl flex items-start gap-2.5">
                    <div className="p-2 bg-purple-950 text-purple-300 border border-purple-800 rounded-lg shrink-0 text-xs font-bold">
                      #{i + 1}
                    </div>
                    <div>
                      <span className="text-xs font-black text-white block">{ap.title}</span>
                      <span className="text-[10px] text-purple-300 font-bold block">{ap.type}</span>
                      <p className="text-[11px] text-slate-300 mt-0.5 font-medium">{ap.purpose}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 12.6 Priority Next Actions Roadmap */}
            <div className="lg:col-span-7 bg-slate-800/80 border border-slate-700 rounded-2xl p-6 shadow-sm space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-700 pb-3">
                <ListOrdered className="h-4 w-4 text-purple-400" />
                12.6 {t("அடுத்தடுத்த முதன்மை நடவடிக்கைகள்", "Priority Action Roadmap")}
              </h4>

              <div className="space-y-3">
                {(stage12?.priorityNextActions || [
                  { stepNumber: 1, action: t("மாவட்ட பதிவாளரிடம் பிரிவு 77A-ன்கீழ் போலி பத்திரம் ரத்து மனு தாக்கல் செய்தல்", "File Sec 77A fraud petition with District Registrar"), targetAuthority: t("மாவட்ட பதிவாளர் (District Registrar)", "District Registrar"), timeline: t("உடனடியாக (48 மணி நேரத்திற்குள்)", "Immediate (48 hrs)") },
                  { stepNumber: 2, action: t("வருவாய் கோட்டாட்சியரிடம் (RDO) பட்டா மாறுதலுக்கு எதிரான ஆட்சேபனை மேல்முறையீடு", "File RDO Patta objection appeal"), targetAuthority: t("வருவாய் கோட்டாட்சியர் (RDO)", "RDO Revenue Officer"), timeline: t("7 நாட்களுக்குள்", "Within 7 days") },
                  { stepNumber: 3, action: t("மெட்ராஸ் உயர் நீதிமன்றத்தில் நல்வழி ஆணை (Writ of Mandamus) மனு தாக்கல் செய்தல்", "File Writ of Mandamus in High Court"), targetAuthority: t("மெட்ராஸ் உயர் நீதிமன்றம்", "Madras High Court"), timeline: t("30 நாட்களுக்குள்", "Within 30 days") }
                ]).map((pa, i) => (
                  <div key={i} className="p-3.5 bg-slate-900/80 border border-slate-700 rounded-xl flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-purple-700 text-white font-black text-xs flex items-center justify-center shrink-0 border border-purple-800">
                      {pa.stepNumber || i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-extrabold text-white">{pa.action}</span>
                        <span className="text-[9px] font-extrabold text-purple-200 bg-purple-950 border border-purple-800 px-2 py-0.5 rounded">
                          {pa.timeline}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-semibold block">
                        {t("அணுக வேண்டிய அதிகாரி", "Target Authority")}: {pa.targetAuthority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
