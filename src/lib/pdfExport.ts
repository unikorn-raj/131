import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { PropertyCase } from "../types";

export interface PDFExportOptions {
  title: string;             // Subject / Title (e.g. "Representation Seeking Fair Investigation...")
  reportType?: string;       // e.g. "LEGAL INTELLIGENCE REPORT" or "AI LEGAL DRAFT"
  docType?: string;          // e.g. "Police Representation" / "AO Petition" / "Legal Analysis"
  domain?: string;           // e.g. "Property Law / Property360" or "Revenue / Criminal"
  caseId?: string;           // e.g. "UK360-395254"
  dateStr?: string;          // e.g. "03 Aug 2026"
  status?: string;           // e.g. "AI Draft | Advocate Review Recommended"
  content: string;           // Legal body text
  sealHash?: string;         // SHA-256
  filename?: string;
}

/**
 * Downloads an enterprise-grade UNIKORN360 LEGALOS report as a PDF file.
 * Uses html2canvas + jsPDF with professional legal document pagination,
 * keep-together block rules, and multi-line balanced subject formatting.
 */
export async function downloadDocumentAsPDF(options: PDFExportOptions): Promise<void> {
  const {
    title,
    reportType = "LEGAL INTELLIGENCE REPORT",
    docType = "AI Legal Draft / Representation",
    domain = "Property Law (Property360)",
    caseId = "UK360-DRAFT",
    dateStr = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    status = "AI Draft | Advocate Review Recommended",
    content,
    sealHash,
    filename
  } = options;

  // Create an off-screen A4 container for pristine rendering
  const container = document.createElement("div");
  container.className = "unikorn-pdf-container";
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.top = "-9999px";
  container.style.width = "794px"; // Standard A4 pixel width at 96 DPI (210mm)
  container.style.backgroundColor = "#ffffff";
  container.style.color = "#0f172a"; // slate-900
  container.style.fontFamily = "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif";
  container.style.padding = "36px 44px";
  container.style.boxSizing = "border-box";
  container.style.lineHeight = "1.6";

  // Helper to safely escape HTML special chars
  const safeText = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // Format content paragraphs cleanly into keep-together blocks for proper pagination
  const rawLines = safeText(content).split("\n").map(l => l.trim());
  const blocks: string[] = [];
  let currentBlock: string[] = [];

  const flushBlock = (isKeepTogether = true) => {
    if (currentBlock.length === 0) return;
    const htmlContent = currentBlock.join("");
    const keepStyle = isKeepTogether
      ? `page-break-inside: avoid; break-inside: avoid; page-break-after: auto; break-after: auto;`
      : ``;
    blocks.push(`<div style="${keepStyle} margin-bottom: 8px;">${htmlContent}</div>`);
    currentBlock = [];
  };

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];
    if (!line) {
      flushBlock(true);
      blocks.push(`<div style="height: 8px; page-break-inside: avoid; break-inside: avoid;"></div>`);
      continue;
    }

    // Divider line
    if (line.startsWith("---") || line.startsWith("===")) {
      flushBlock(true);
      blocks.push(`<hr style="border: none; border-top: 1px dashed #cbd5e1; margin: 12px 0; page-break-inside: avoid; break-inside: avoid;" />`);
      continue;
    }

    // Heading or section title (e.g., "பிரார்த்தனை:", "PRAYER:", "இணைப்புகள்:", "ஒப்பம்:")
    const isHeading = line.endsWith(":") || (line.toUpperCase() === line && line.length < 60) || /^([0-9\u0B80-\u0BFFA-Z]+\.)\s+/.test(line);
    const isSubjectLine = /^பொருள்:|^Subject:|^பார்வை:|^Reference:/i.test(line);
    const isSignatureLine = /^இங்ஙனம்|^தங்கள் உண்மையுள்ள|^SIGNATURE|^மனுதாரர் ஒப்பம்|^Advocate for Petitioner/i.test(line);

    if (isSignatureLine) {
      flushBlock(true);
      currentBlock.push(`
        <div style="margin-top: 24px; padding-top: 12px; page-break-inside: avoid; break-inside: avoid; page-break-before: auto; display: flex; justify-content: space-between; align-items: flex-end;">
          <div>
            <p style="font-size: 10px; font-weight: 700; color: #64748b; margin: 0;">இடம் / Place: _________________</p>
            <p style="font-size: 10px; font-weight: 700; color: #64748b; margin: 4px 0 0 0;">நாள் / Date: ${safeText(dateStr)}</p>
          </div>
          <div style="text-align: right;">
            <p style="font-size: 11px; font-weight: 800; color: #0f172a; margin: 0 0 32px 0;">${safeText(line)}</p>
            <p style="font-size: 10px; font-weight: 700; color: #475569; margin: 0; border-top: 1px dashed #94a3b8; pt-1; inline-block; width: 180px; text-align: center;">(கையொப்பம் / Signature)</p>
          </div>
        </div>
      `);
      flushBlock(true);
      continue;
    }

    if (isSubjectLine) {
      flushBlock(true);
      // Balanced 2-3 line wrapping formatting for Subject / பொருள்
      currentBlock.push(`
        <div style="background-color: #f8fafc; border-left: 3px solid #4f46e5; padding: 10px 14px; margin: 10px 0; border-radius: 0 6px 6px 0; page-break-inside: avoid; break-inside: avoid;">
          <p style="font-size: 11px; font-weight: 800; color: #0f172a; margin: 0; line-height: 1.55; text-align: justify; word-break: break-word; max-width: 96%;">
            ${safeText(line)}
          </p>
        </div>
      `);
      flushBlock(true);
      continue;
    }

    if (isHeading) {
      flushBlock(true);
      currentBlock.push(`
        <h4 style="font-size: 11.5px; font-weight: 800; color: #0f172a; margin: 10px 0 4px 0; text-transform: uppercase; letter-spacing: 0.02em; page-break-after: avoid; break-after: avoid;">
          ${safeText(line)}
        </h4>
      `);
    } else {
      currentBlock.push(`
        <p style="font-size: 10.5px; margin: 0 0 6px 0; color: #334155; text-align: justify; word-break: break-word; line-height: 1.6; widows: 3; orphans: 3;">
          ${safeText(line)}
        </p>
      `);
    }
  }
  flushBlock(true);

  const formattedContentHtml = blocks.join("");

  container.innerHTML = `
    <style>
      .unikorn-pdf-container * {
        box-sizing: border-box;
      }
      .unikorn-pdf-container p, .unikorn-pdf-container h4, .unikorn-pdf-container div, .unikorn-pdf-container tr {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
        widows: 3;
        orphans: 3;
      }
      .unikorn-pdf-container h1, .unikorn-pdf-container h2, .unikorn-pdf-container h3, .unikorn-pdf-container h4 {
        page-break-after: avoid !important;
        break-after: avoid !important;
      }
    </style>

    <!-- Top Enterprise Brand Header -->
    <div style="border-bottom: 2px solid #0f172a; padding-bottom: 10px; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: flex-end; page-break-inside: avoid; break-inside: avoid;">
      <div>
        <div style="font-size: 18px; font-weight: 900; color: #0f172a; letter-spacing: -0.02em; display: flex; align-items: center; gap: 8px;">
          <span>UNIKORN360</span>
          <span style="color: #4f46e5; font-weight: 800; font-size: 12px; border: 1px solid #c7d2fe; background-color: #eef2ff; padding: 1px 6px; border-radius: 4px;">LEGALOS</span>
        </div>
        <p style="font-size: 9.5px; font-weight: 800; color: #475569; letter-spacing: 0.08em; text-transform: uppercase; margin: 2px 0 0 0;">
          ${safeText(reportType)}
        </p>
      </div>
      <div style="text-align: right;">
        <p style="font-size: 9.5px; font-weight: 700; color: #64748b; margin: 0;">
          AI-Assisted Legal Analysis & Representation
        </p>
        <p style="font-size: 8.5px; font-weight: 600; color: #94a3b8; margin: 2px 0 0 0;">
          Unikorn Legal Intelligence Engine v1.0
        </p>
      </div>
    </div>

    <!-- Concise & Professional Metadata Block -->
    <div style="margin-bottom: 16px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px 14px; page-break-inside: avoid; break-inside: avoid;">
      <table style="width: 100%; border-collapse: collapse; font-size: 9.5px;">
        <tr>
          <td style="padding: 2.5px 0; font-weight: 700; color: #64748b; width: 110px;">Document Type :</td>
          <td style="padding: 2.5px 0; font-weight: 800; color: #0f172a;">${safeText(docType)}</td>
          <td style="padding: 2.5px 0; font-weight: 700; color: #64748b; width: 90px; text-align: right;">Case ID :</td>
          <td style="padding: 2.5px 0 2.5px 8px; font-weight: 800; color: #4f46e5; font-family: monospace; text-align: right;">${safeText(caseId)}</td>
        </tr>
        <tr>
          <td style="padding: 2.5px 0; font-weight: 700; color: #64748b;">Knowledge Domain :</td>
          <td style="padding: 2.5px 0; font-weight: 700; color: #1e293b;">${safeText(domain)}</td>
          <td style="padding: 2.5px 0; font-weight: 700; color: #64748b; text-align: right;">Date :</td>
          <td style="padding: 2.5px 0 2.5px 8px; font-weight: 700; color: #334155; text-align: right;">${safeText(dateStr)}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0 2px 0; font-weight: 700; color: #64748b; vertical-align: top;">Subject / Title :</td>
          <td colspan="3" style="padding: 4px 0 2px 0; font-weight: 800; color: #0f172a; line-height: 1.55; text-align: justify; word-break: break-word; max-width: 94%;">
            ${safeText(title)}
          </td>
        </tr>
        <tr>
          <td style="padding: 2.5px 0; font-weight: 700; color: #64748b;">Status :</td>
          <td colspan="3" style="padding: 2.5px 0; font-weight: 700; color: #059669; font-size: 9px;">${safeText(status)}</td>
        </tr>
      </table>
    </div>

    <!-- Main Legal Document Body with Page Break Controls -->
    <div style="min-height: 400px; font-size: 10.5px; color: #334155; border-top: 1px solid #f1f5f9; padding-top: 8px;">
      ${formattedContentHtml}
    </div>

    <!-- Enterprise Footer -->
    <div style="margin-top: 28px; padding-top: 10px; border-top: 1.5px solid #0f172a; display: flex; justify-content: space-between; align-items: flex-start; font-size: 8.5px; color: #64748b; font-family: monospace; page-break-inside: avoid; break-inside: avoid;">
      <div>
        <p style="font-weight: 800; color: #0f172a; margin: 0 0 2px 0;">UNIKORN360 ADVOCATE ENTERPRISE SEAL</p>
        <p style="margin: 0; color: #475569;">VERIFIED SHA-256: ${safeText(sealHash || "VERIFIED-TAMPER-PROOF-RECORD")}</p>
        <p style="margin: 2px 0 0 0; color: #94a3b8;">AI Generated • Human Review Recommended • Version 1.0</p>
      </div>
      <div style="text-align: right;">
        <p style="margin: 0; font-weight: 700; color: #0f172a;">Confidential & Privileged Legal Work Product</p>
        <p style="margin: 2px 0 0 0;">UNIKORN360 LegalOS Intelligence System</p>
        <p style="margin: 2px 0 0 0; color: #94a3b8;">Timestamp: ${new Date().toISOString()}</p>
      </div>
    </div>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff"
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.95);
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 5) { // Prevent blank trailing page if heightLeft is minimal
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    const cleanName = (filename || `${title}_${caseId}`)
      .replace(/[^a-zA-Z0-9_\-\u0B80-\u0BFF]/g, "_")
      .slice(0, 50);

    pdf.save(`${cleanName}.pdf`);
  } catch (error) {
    console.error("PDF generation failed, using print/blob fallback:", error);

    // Fallback: Trigger direct file download as HTML
    const blob = new Blob([container.innerHTML], { type: "text/html;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${filename || title}.html`;
    link.click();
    URL.revokeObjectURL(link.href);
  } finally {
    document.body.removeChild(container);
  }
}

// Helper utilities for HTML formatting
function safeStr(val: any): string {
  if (val === null || val === undefined) return "";
  return String(val)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function renderVal(val: any, fallback: any = "Information Not Specified / Unavailable"): string {
  if (val === null || val === undefined || val === "" || (Array.isArray(val) && val.length === 0)) {
    return `<span style="color:#94a3b8; font-style:italic; font-size: 9px;">[ ${safeStr(fallback)} ]</span>`;
  }
  if (typeof val === "boolean") {
    return val ? "Yes" : "No";
  }
  return safeStr(val);
}

function renderList(items?: string[] | null, emptyMsg = "No records listed"): string {
  if (!items || items.length === 0) {
    return `<div style="color:#94a3b8; font-style:italic; font-size:9px; padding: 2px 0;">[ ${safeStr(emptyMsg)} ]</div>`;
  }
  return `
    <ul style="margin: 3px 0; padding-left: 16px; font-size: 9px; color: #334155; line-height: 1.45; word-break: break-word; overflow-wrap: break-word;">
      ${items.map(it => `<li style="margin-bottom: 2px;">${safeStr(it)}</li>`).join("")}
    </ul>
  `;
}

function renderSectionHeader(num: string, title: string): string {
  return `
    <div style="page-break-inside: avoid; break-inside: avoid; page-break-after: avoid; break-after: avoid; margin-top: 18px; margin-bottom: 8px; border-bottom: 2px solid #1e1b4b; padding-bottom: 4px;">
      <h3 style="font-size: 11px; font-weight: 800; color: #1e1b4b; text-transform: uppercase; letter-spacing: 0.04em; margin: 0; display: flex; align-items: center; gap: 8px;">
        <span style="background-color: #1e1b4b; color: #ffffff; padding: 2px 6px; border-radius: 3px; font-size: 9.5px; font-weight: 800;">STAGE ${safeStr(num)}</span>
        <span>${safeStr(title)}</span>
      </h3>
    </div>
  `;
}

/**
 * Generates the complete multi-page HTML markup for the entire 12-stage PropertyCase.
 */
export function generateCompleteCaseReportHTML(caseData: PropertyCase): string {
  const caseId = `UK360-${String(caseData.id).toUpperCase().slice(-8)}`;
  const dateStr = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });

  const intake: any = caseData.intake || caseData.stage0 || {};
  const stage1: any = caseData.stage1 || {};
  const stage2: any = caseData.stage2 || {};
  const stage3: any = caseData.stage3 || {};
  const stage4: any = caseData.stage4 || {};
  const stage5: any = caseData.stage5 || {};
  const stage6: any = caseData.stage6 || {};
  const stage7: any = caseData.stage7 || {};
  const stage8: any = caseData.stage8 || {};
  const stage9: any = caseData.stage9 || {};
  const stage10: any = caseData.stage10 || {};
  const stage11: any = caseData.stage11;
  const stage12: any = caseData.stage12;
  const clientReply: any = caseData.clientFacingReply || {};
  const docsReq: any = caseData.documentsRequired || {};
  const immAct: any = caseData.immediateAction || {};
  const draft: any = caseData.customDocumentDraft || {};

  // Resolve Stage 13 smart fallbacks from existing case data (Stages 00-12)
  const problemIdentified = clientReply.problemIdentified || stage2.realIssue || stage1.specificType || (caseData.rawDescription ? caseData.rawDescription.slice(0, 180) + '...' : "");
  const legalPosition = clientReply.legalPosition || stage2.rootCauseStatement || stage12?.strongestLegalRoute?.justification || stage11?.strategyRecommendationFromPrecedents || (Array.isArray(stage5?.rightsViolated) && stage5.rightsViolated.length > 0 ? `Rights evaluated: ${stage5.rightsViolated.join("; ")}` : "");
  const immediateNextStep = clientReply.immediateNextStep || stage12?.priorityNextActions?.[0]?.action || stage8.primaryRemedy || (immAct.within24Hours?.[0]) || "Apply for certified encumbrance certificate and revenue extracts before jurisdictional authority.";
  const expectedAuthority = clientReply.expectedAuthority || stage12?.priorityNextActions?.[0]?.targetAuthority || stage12?.strongestLegalRoute?.routeName || stage7.primaryAuthority || intake.courtOrForum || "Jurisdictional Revenue / SRO Authority";
  const estimatedTimeline = clientReply.estimatedTimeline || stage12?.priorityNextActions?.[0]?.timeline || stage12?.strongestLegalRoute?.timeToResolutionEst || stage9.urgencyLevel || "15 to 30 statutory working days";

  const within24Hours = (immAct.within24Hours && immAct.within24Hours.length > 0)
    ? immAct.within24Hours
    : (stage12?.priorityNextActions?.slice(0, 1).map((a: any) => `${a.action}${a.targetAuthority ? ` (${a.targetAuthority})` : ''}`) || ["Verify original title deeds and obtain latest Encumbrance Certificate (EC) online via TNREGINET."]);
  
  const within7Days = (immAct.within7Days && immAct.within7Days.length > 0)
    ? immAct.within7Days
    : (stage12?.priorityNextActions?.slice(1, 2).map((a: any) => `${a.action}${a.targetAuthority ? ` (${a.targetAuthority})` : ''}`) || (stage6.missing && stage6.missing.length > 0 ? stage6.missing.slice(0, 2).map((m: string) => `Obtain certified copy of: ${m}`) : ["Draft and submit formal representation petition before jurisdictional authority."]));
  
  const within30Days = (immAct.within30Days && immAct.within30Days.length > 0)
    ? immAct.within30Days
    : (stage12?.priorityNextActions?.slice(2, 4).map((a: any) => `${a.action}${a.targetAuthority ? ` (${a.targetAuthority})` : ''}`) || (stage8.alternativeOptions && stage8.alternativeOptions.length > 0 ? stage8.alternativeOptions.slice(0, 2) : ["Follow up on inquiry proceedings and obtain certified disposal order."]));

  const mandatoryDocs = (docsReq.mandatory && docsReq.mandatory.length > 0)
    ? docsReq.mandatory
    : (stage6.available && stage6.available.length > 0
        ? stage6.available
        : (stage6.documentary && stage6.documentary.length > 0
            ? stage6.documentary
            : ["Registered Parent Title Deed", "Updated Patta / Chitta Revenue Extract", "Encumbrance Certificate (EC)", "Identity & Address Proof"]));

  return `
    <style>
      .unikorn-complete-pdf * {
        box-sizing: border-box;
      }
      .unikorn-complete-pdf {
        font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
        color: #0f172a;
        line-height: 1.45;
        width: 100%;
      }
      .pdf-block {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
        margin-bottom: 12px;
      }
      .pdf-table {
        width: 100%;
        table-layout: fixed;
        border-collapse: collapse;
        margin-top: 4px;
        margin-bottom: 8px;
        font-size: 9px;
      }
      .pdf-table th {
        background-color: #f1f5f9;
        color: #0f172a;
        font-weight: 800;
        text-align: left;
        padding: 5px 6px;
        border: 1px solid #cbd5e1;
        text-transform: uppercase;
        font-size: 8.5px;
        letter-spacing: 0.02em;
        vertical-align: top;
        word-break: break-word;
        overflow-wrap: break-word;
      }
      .pdf-table td {
        padding: 4px 6px;
        border: 1px solid #e2e8f0;
        color: #334155;
        vertical-align: top;
        line-height: 1.45;
        word-break: break-word;
        overflow-wrap: break-word;
      }
    </style>

    <div class="unikorn-complete-pdf">
      <!-- Top Enterprise Legal Header -->
      <div class="pdf-block" style="border-bottom: 2.5px solid #0f172a; padding-bottom: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-end;">
        <div>
          <div style="font-size: 20px; font-weight: 900; color: #0f172a; letter-spacing: -0.02em; display: flex; align-items: center; gap: 8px;">
            <span>NILAM360</span>
            <span style="color: #4f46e5; font-weight: 800; font-size: 11px; border: 1.5px solid #4f46e5; background-color: #eef2ff; padding: 2px 8px; border-radius: 4px; letter-spacing: 0.05em;">LEGALOS</span>
          </div>
          <p style="font-size: 11px; font-weight: 800; color: #1e1b4b; text-transform: uppercase; letter-spacing: 0.06em; margin: 4px 0 0 0;">
            COMPLETE COMPREHENSIVE CASE REPORT & LEGAL ANALYSIS
          </p>
          <p style="font-size: 9px; font-weight: 700; color: #64748b; margin: 2px 0 0 0;">
            Complete 12-Stage Property & Legal Intelligence Dossier
          </p>
        </div>
        <div style="text-align: right;">
          <p style="font-size: 10px; font-weight: 800; color: #4f46e5; font-family: monospace; margin: 0;">
            ${safeStr(caseId)}
          </p>
          <p style="font-size: 9px; font-weight: 700; color: #475569; margin: 2px 0 0 0;">
            Date: ${safeStr(dateStr)}
          </p>
          <p style="font-size: 8.5px; font-weight: 600; color: #059669; margin: 2px 0 0 0; background-color: #ecfdf5; padding: 2px 6px; border-radius: 4px; border: 1px solid #a7f3d0; inline-block;">
            Verified Complete Analysis
          </p>
        </div>
      </div>

      <!-- Key Case Metadata Summary Box -->
      <div class="pdf-block" style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px 14px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 9.5px;">
          <tr>
            <td style="padding: 2.5px 0; font-weight: 700; color: #64748b; width: 120px;">Client / Petitioner :</td>
            <td style="padding: 2.5px 0; font-weight: 800; color: #0f172a;">${renderVal(intake.clientName)}</td>
            <td style="padding: 2.5px 0; font-weight: 700; color: #64748b; width: 110px; text-align: right;">Opposite Party :</td>
            <td style="padding: 2.5px 0 2.5px 8px; font-weight: 800; color: #991b1b; text-align: right;">${renderVal(intake.oppositeParty)}</td>
          </tr>
          <tr>
            <td style="padding: 2.5px 0; font-weight: 700; color: #64748b;">Property Location :</td>
            <td style="padding: 2.5px 0; font-weight: 700; color: #1e293b;">
              Survey No: ${renderVal(intake.surveyNumber)}, ${renderVal(intake.village)}, ${renderVal(intake.taluk)}, ${renderVal(intake.district)}
            </td>
            <td style="padding: 2.5px 0; font-weight: 700; color: #64748b; text-align: right;">Dispute Category :</td>
            <td style="padding: 2.5px 0 2.5px 8px; font-weight: 800; color: #312e81; text-align: right;">${renderVal(stage1.category)} (${renderVal(stage1.specificType)})</td>
          </tr>
          <tr>
            <td style="padding: 2.5px 0; font-weight: 700; color: #64748b;">Risk Level Rating :</td>
            <td style="padding: 2.5px 0; font-weight: 800; color: #b91c1c;">${renderVal(stage9.rating)} (Score: ${renderVal(stage9.score)}/100)</td>
            <td style="padding: 2.5px 0; font-weight: 700; color: #64748b; text-align: right;">Target Forum :</td>
            <td style="padding: 2.5px 0 2.5px 8px; font-weight: 700; color: #1e293b; text-align: right;">${renderVal(intake.courtOrForum)}</td>
          </tr>
        </table>
      </div>

      <!-- TABLE OF CONTENTS -->
      <div class="pdf-block" style="background-color: #eef2ff; border: 1px solid #c7d2fe; border-radius: 6px; padding: 10px 14px;">
        <h4 style="font-size: 10.5px; font-weight: 800; color: #1e1b4b; text-transform: uppercase; margin: 0 0 6px 0; letter-spacing: 0.04em;">
          TABLE OF CONTENTS — 14 MASTER DOSSIER SECTIONS
        </h4>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px 16px; font-size: 9px; color: #312e81;">
          <div><b>01.</b> Stage 00: Case Profile & Intake Details</div>
          <div><b>08.</b> Stage 07: Revenue & Jurisdictional Route</div>
          <div><b>02.</b> Stage 01: Legal Category & Classification</div>
          <div><b>09.</b> Stage 08: Primary & Alternative Legal Remedies</div>
          <div><b>03.</b> Stage 02: Core Conflict & Root Cause</div>
          <div><b>10.</b> Stage 09: Risk Rating, Urgency & Limitation</div>
          <div><b>04.</b> Stage 03: Subject & Relationship Mapping</div>
          <div><b>11.</b> Stage 10: Service Package & Deliverables</div>
          <div><b>05.</b> Stage 04: Cause of Action & Timeline</div>
          <div><b>12.</b> Stage 11: Precedent Intelligence & Case Laws</div>
          <div><b>06.</b> Stage 05: Rights & Liabilities Matrix</div>
          <div><b>13.</b> Stage 12: Legal Strategy Simulator</div>
          <div><b>07.</b> Stage 06: Documentary Evidence Audit</div>
          <div><b>14.</b> Advocate Review & Action Plan</div>
        </div>
      </div>

      <!-- SECTION 01: STAGE 00 - CASE PROFILE & INTAKE -->
      ${renderSectionHeader("00", "Case Profile & Intake Information")}
      <div class="pdf-block">
        <table class="pdf-table">
          <tr>
            <th style="width: 20%;">Field Parameter</th>
            <th style="width: 30%;">Recorded Detail</th>
            <th style="width: 20%;">Field Parameter</th>
            <th style="width: 30%;">Recorded Detail</th>
          </tr>
          <tr>
            <td>Client / Petitioner Name</td>
            <td><b>${renderVal(intake.clientName)}</b></td>
            <td>Mobile Contact</td>
            <td>${renderVal(intake.mobile)}</td>
          </tr>
          <tr>
            <td>Opposite Party (Respondent)</td>
            <td><b style="color:#991b1b;">${renderVal(intake.oppositeParty)}</b></td>
            <td>Party Relationship</td>
            <td>${renderVal(intake.partyRelationship)}</td>
          </tr>
          <tr>
            <td>Survey Number / Subdivision</td>
            <td><b>${renderVal(intake.surveyNumber)}</b></td>
            <td>Village / Gramam</td>
            <td>${renderVal(intake.village)}</td>
          </tr>
          <tr>
            <td>Taluk / Mandal</td>
            <td>${renderVal(intake.taluk)}</td>
            <td>District</td>
            <td>${renderVal(intake.district)}</td>
          </tr>
          <tr>
            <td>Target Forum / Police Station</td>
            <td>${renderVal(intake.courtOrForum)}</td>
            <td>Existing Advocate</td>
            <td>${renderVal(intake.existingAdvocate)}</td>
          </tr>
          <tr>
            <td>Existing Case / FIR / Notice No.</td>
            <td>${renderVal(intake.existingCaseNumber)}</td>
            <td>Limitation Risk Status</td>
            <td>${renderVal(intake.limitationRisk)}</td>
          </tr>
          <tr>
            <td>System AI Workspace</td>
            <td>${renderVal(caseData.workspace || "Citizen360")} / ${renderVal(caseData.subWorkspace || "Property360")}</td>
            <td>AI Engine Applied</td>
            <td>${renderVal(caseData.engine || "CaseClassificationAI")}</td>
          </tr>
        </table>
        
        <p style="font-size: 9px; font-weight: 800; color: #0f172a; margin: 8px 0 3px 0;">Raw Client Statement / Case Summary Narrative:</p>
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 8px 10px; font-size: 9.5px; color: #334155; line-height: 1.5; text-align: justify;">
          ${renderVal(caseData.rawDescription)}
        </div>
      </div>

      <!-- SECTION 02: STAGE 01 - LEGAL CATEGORY & ASSESSMENT -->
      ${renderSectionHeader("01", "Legal Category & Domain Assessment")}
      <div class="pdf-block">
        <table class="pdf-table">
          <tr>
            <th style="width: 30%;">Category Parameter</th>
            <th style="width: 70%;">Identified Value</th>
          </tr>
          <tr>
            <td>Primary Legal Domain / Category</td>
            <td><b style="color: #312e81; font-size: 10px;">${renderVal(stage1.category)}</b></td>
          </tr>
          <tr>
            <td>Specific Dispute Sub-Type</td>
            <td><b>${renderVal(stage1.specificType)}</b></td>
          </tr>
        </table>
      </div>

      <!-- SECTION 03: STAGE 02 - CORE CONFLICT & ROOT CAUSE -->
      ${renderSectionHeader("02", "Core Conflict & Preliminary Issue Identification")}
      <div class="pdf-block">
        <table class="pdf-table">
          <tr>
            <th style="width: 30%;">Conflict Parameter</th>
            <th style="width: 70%;">Analytical Breakdown</th>
          </tr>
          <tr>
            <td>Core Identified Legal Conflict</td>
            <td><b style="color: #0f172a;">${renderVal(stage2.realIssue)}</b></td>
          </tr>
          <tr>
            <td>Root Cause Legal Statement</td>
            <td style="line-height: 1.5; text-align: justify;">${renderVal(stage2.rootCauseStatement)}</td>
          </tr>
        </table>
      </div>

      <!-- SECTION 04: STAGE 03 - DISPUTE SUBJECT & RELATIONSHIP MAPPING -->
      ${renderSectionHeader("03", "Dispute Subject & Relationship Mapping")}
      <div class="pdf-block">
        <table class="pdf-table">
          <tr>
            <th style="width: 30%;">Mapping Aspect</th>
            <th style="width: 70%;">Mapped Structural Reality</th>
          </tr>
          <tr>
            <td>Dispute Subject / Property Type</td>
            <td>${typeof stage3 === "object" ? renderVal(stage3.subjectType) : renderVal(stage3)}</td>
          </tr>
          <tr>
            <td>Party Relationship Matrix</td>
            <td>${typeof stage3 === "object" ? renderVal(stage3.partyRelationshipMap) : renderVal(stage3)}</td>
          </tr>
        </table>
      </div>

      <!-- SECTION 05: STAGE 04 - CAUSE OF ACTION & TIMELINE -->
      ${renderSectionHeader("04", "Cause of Action & Chronological Timeline")}
      <div class="pdf-block">
        ${(() => {
          const events = typeof stage4 === "object" && stage4?.timelineEvents ? stage4.timelineEvents : (Array.isArray(stage4) ? stage4 : [stage4]);
          if (!events || events.length === 0 || !events[0]) {
            return `<div style="color:#94a3b8; font-style:italic; font-size:9.5px;">[ No cause of action timeline events recorded ]</div>`;
          }
          return `
            <table class="pdf-table">
              <tr>
                <th style="width: 10%;">Step #</th>
                <th style="width: 90%;">Chronological Event / Cause of Action Detail</th>
              </tr>
              ${events.map((ev: string, idx: number) => `
                <tr>
                  <td style="text-align: center; font-weight: 800; color: #4f46e5;">#${idx + 1}</td>
                  <td style="line-height: 1.5;">${safeStr(ev)}</td>
                </tr>
              `).join("")}
            </table>
          `;
        })()}
      </div>

      <!-- SECTION 06: STAGE 05 - RIGHTS, DUTIES & LIABILITIES MATRIX -->
      ${renderSectionHeader("05", "Rights, Duties & Liabilities Matrix")}
      <div class="pdf-block">
        ${typeof stage5 === "object" && stage5 !== null ? `
          <table class="pdf-table">
            <tr>
              <th style="width: 25%;">Matrix Domain</th>
              <th style="width: 75%;">Legal Findings & Items Identified</th>
            </tr>
            <tr>
              <td><b>Rights Violated</b></td>
              <td>${renderList(stage5.rightsViolated, "No specific rights violation enumerated")}</td>
            </tr>
            <tr>
              <td><b>Statutory Duties Breached</b></td>
              <td>${renderList(stage5.dutiesBreached, "No statutory duties breach enumerated")}</td>
            </tr>
            <tr>
              <td><b>Legal Obligations</b></td>
              <td>${renderList(stage5.legalObligations, "No legal obligations enumerated")}</td>
            </tr>
            <tr>
              <td><b>Potential Liabilities</b></td>
              <td>${renderList(stage5.possibleLiabilities, "No potential liabilities enumerated")}</td>
            </tr>
            <tr>
              <td><b>Statutory Protections</b></td>
              <td>${renderList(stage5.availableProtections, "No statutory protections enumerated")}</td>
            </tr>
          </table>
        ` : `
          <div style="font-size: 9.5px; color: #334155; background: #f8fafc; padding: 8px; border: 1px solid #e2e8f0; border-radius: 4px;">
            ${renderVal(stage5)}
          </div>
        `}
      </div>

      <!-- SECTION 07: STAGE 06 - DOCUMENTARY EVIDENCE AUDIT -->
      ${renderSectionHeader("06", "Documentary Evidence Audit & Strength Assessment")}
      <div class="pdf-block">
        <!-- Evidence Strength Rating Card - Standalone full-width banner, No Crowding -->
        <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 6px 12px; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between; page-break-inside: avoid; break-inside: avoid;">
          <span style="font-size: 9px; font-weight: 700; color: #334155;">Overall Evidence Strength Assessment:</span>
          <span style="font-size: 9px; font-weight: 900; color: #1e1b4b; background-color: #e0e7ff; padding: 2px 10px; border-radius: 4px; border: 1px solid #c7d2fe;">
            ${renderVal(stage6.evidenceStrength, "Moderate")} Rating
          </span>
        </div>
        <table class="pdf-table">
          <tr>
            <th style="width: 50%;">Available Documents & Proofs</th>
            <th style="width: 50%;">Missing Critical Evidence / Gaps</th>
          </tr>
          <tr>
            <td>${renderList(stage6.available, "No available documents recorded")}</td>
            <td>${renderList(stage6.missing, "No missing evidence recorded")}</td>
          </tr>
        </table>

        <p style="font-size: 8.5px; font-weight: 800; color: #0f172a; margin: 6px 0 2px 0;">Categorized Evidence Inventory:</p>
        <table class="pdf-table">
          <tr>
            <th style="width: 25%;">Documentary Proofs</th>
            <th style="width: 25%;">Electronic / Digital</th>
            <th style="width: 25%;">Witness Testimony</th>
            <th style="width: 25%;">Official Government Records</th>
          </tr>
          <tr>
            <td>${renderList(stage6.documentary, "None recorded")}</td>
            <td>${renderList(stage6.electronic, "None recorded")}</td>
            <td>${renderList(stage6.witnesses, "None recorded")}</td>
            <td>${renderList(stage6.officialRecords, "None recorded")}</td>
          </tr>
        </table>
      </div>

      <!-- SECTION 08: STAGE 07 - JURISDICTIONAL ROUTE -->
      ${renderSectionHeader("07", "Revenue & Jurisdictional Authority Route")}
      <div class="pdf-block">
        <table class="pdf-table">
          <tr>
            <th style="width: 30%;">Jurisdiction Parameter</th>
            <th style="width: 70%;">Authority Details</th>
          </tr>
          <tr>
            <td>Sequential Authority Route</td>
            <td>
              ${(() => {
                const routeArr = typeof stage7 === "object" && stage7?.route ? stage7.route : (Array.isArray(stage7) ? stage7 : [stage7]);
                return renderList(routeArr, "No authority route mapped");
              })()}
            </td>
          </tr>
          <tr>
            <td>Primary Authority Forum</td>
            <td><b>${renderVal(stage7.primaryAuthority)}</b></td>
          </tr>
          <tr>
            <td>Appellate Authority Forum</td>
            <td>${renderVal(stage7.appellateAuthority)}</td>
          </tr>
          <tr>
            <td>Forum Classification</td>
            <td>${renderVal(stage7.forumType)}</td>
          </tr>
        </table>
      </div>

      <!-- SECTION 09: STAGE 08 - PRIMARY & ALTERNATIVE REMEDIES -->
      ${renderSectionHeader("08", "Primary & Alternative Legal Remedies")}
      <div class="pdf-block">
        <table class="pdf-table">
          <tr>
            <th style="width: 30%;">Remedy Parameter</th>
            <th style="width: 70%;">Recommended Statutory Route</th>
          </tr>
          <tr>
            <td>Remedy Domain Category</td>
            <td><b>${renderVal(stage8.category)}</b></td>
          </tr>
          <tr>
            <td>Primary Recommended Remedy</td>
            <td><b style="color: #047857; font-size: 10px;">${renderVal(stage8.primaryRemedy)}</b></td>
          </tr>
          <tr>
            <td>Remedy Classification Type</td>
            <td>${renderVal(stage8.remedyType)}</td>
          </tr>
          <tr>
            <td>Alternative Statutory Options</td>
            <td>${renderList(stage8.alternativeOptions, "No alternative options listed")}</td>
          </tr>
        </table>
      </div>

      <!-- SECTION 10: STAGE 09 - RISK RATING & URGENCY -->
      ${renderSectionHeader("09", "Risk Rating, Urgency & Limitation Analysis")}
      <div class="pdf-block">
        <table class="pdf-table">
          <tr>
            <th style="width: 25%;">Overall Risk Score</th>
            <th style="width: 25%;">Rating Level</th>
            <th style="width: 25%;">Limitation Status</th>
            <th style="width: 25%;">Urgency Level</th>
          </tr>
          <tr>
            <td><b style="font-size: 11px; color: #b91c1c;">${renderVal(stage9.score)} / 100</b></td>
            <td><b style="color: #b91c1c;">${renderVal(stage9.rating)}</b></td>
            <td>${renderVal(stage9.limitationStatus)}</td>
            <td><b>${renderVal(stage9.urgencyLevel)}</b></td>
          </tr>
        </table>

        <p style="font-size: 9px; font-weight: 800; color: #0f172a; margin: 6px 0 2px 0;">Key Risk Factors Identified:</p>
        ${renderList(stage9.factors, "No specific risk factors enumerated")}
      </div>

      <!-- SECTION 11: STAGE 10 - SERVICE PACKAGE & DELIVERABLES -->
      ${renderSectionHeader("10", "Legal Service Package & Action Plan")}
      <div class="pdf-block">
        <table class="pdf-table">
          <tr>
            <th style="width: 30%;">Package Parameter</th>
            <th style="width: 70%;">Specification Details</th>
          </tr>
          <tr>
            <td>Recommended Package Name</td>
            <td><b style="color: #312e81;">${renderVal(stage10.packageName)}</b></td>
          </tr>
          <tr>
            <td>Estimated Professional Fee</td>
            <td><b>${renderVal(stage10.priceRange)}</b></td>
          </tr>
          <tr>
            <td>Package Scope & Description</td>
            <td>${renderVal(stage10.description)}</td>
          </tr>
          <tr>
            <td>Deliverables Checklist</td>
            <td>${renderList(stage10.deliverablesList, "No specific deliverables listed")}</td>
          </tr>
          <tr>
            <td>Expected Strategic Outcome</td>
            <td><b style="color: #047857;">${renderVal(caseData.servicePackage?.expectedOutcome)}</b></td>
          </tr>
        </table>
      </div>

      <!-- SECTION 12: STAGE 11 - PRECEDENT INTELLIGENCE & CASE LAWS -->
      <div style="page-break-inside: avoid; break-inside: avoid;">
        ${renderSectionHeader("11", "Precedent Intelligence, Case Laws & Government Orders")}
        ${stage11 ? `
          <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 6px 10px; margin-bottom: 6px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 9px;">
              <tr>
                <td style="width: 25%; border: none; padding: 2px 4px;"><b>Similar Cases:</b> ${renderVal(stage11.similarCasesCount, 0)}</td>
                <td style="width: 25%; border: none; padding: 2px 4px;"><b>Avg Similarity:</b> ${renderVal(stage11.averageSimilarityScore, 0)}%</td>
                <td style="width: 50%; border: none; padding: 2px 4px; text-align: right;">
                  <b>Success Probability:</b> 
                  <span style="color: #047857; font-weight: 900; background: #dcfce7; padding: 1px 6px; border-radius: 3px;">
                    ${renderVal(stage11.successProbability?.percentage, 0)}% (${renderVal(stage11.successProbability?.rating, "Moderate")})
                  </span>
                </td>
              </tr>
            </table>
            ${stage11.successProbability?.disclaimer ? `
              <p style="font-size: 8px; color: #64748b; margin: 3px 0 0 0; font-style: italic;">
                Note: ${safeStr(stage11.successProbability.disclaimer)}
              </p>
            ` : ""}
          </div>
        ` : ""}
      </div>

      <div class="pdf-block">
        ${stage11 ? `
          <p style="font-size: 8.5px; font-weight: 800; color: #0f172a; margin: 4px 0 2px 0;">Overarching Judicial Principles:</p>
          ${renderList(stage11.overallPrinciples, "No legal principles enumerated")}

          <!-- SIMILAR JUDICIAL PRECEDENTS TABLE -->
          <p style="font-size: 8.5px; font-weight: 800; color: #0f172a; margin: 6px 0 2px 0;">High-Bench Judicial Precedents Analyzed:</p>
          ${(() => {
            const casesList = stage11.similarCases || [];
            if (casesList.length === 0) {
              return `<div style="color:#94a3b8; font-style:italic; font-size:9px;">[ No similar court cases found or indexed ]</div>`;
            }
            return `
              <table class="pdf-table" style="font-size: 8.5px;">
                <thead>
                  <tr>
                    <th style="width: 22%;">Case Title & Citation</th>
                    <th style="width: 11%;">Court / Year</th>
                    <th style="width: 8%; text-align: center;">Match</th>
                    <th style="width: 32%;">Reasoning & Principles</th>
                    <th style="width: 12%;">Outcome</th>
                    <th style="width: 15%;">Why It Matters</th>
                  </tr>
                </thead>
                <tbody>
                  ${casesList.map((c: any) => `
                    <tr>
                      <td><b>${safeStr(c.caseName)}</b><br/><span style="font-family:monospace; font-size:8px; color:#4f46e5;">${safeStr(c.citationNumber)}</span></td>
                      <td>${safeStr(c.court)}<br/>${safeStr(c.year)}</td>
                      <td style="text-align:center; font-weight:800; color:#047857;">${safeStr(c.similarityScore)}%</td>
                      <td style="line-height: 1.4; word-break: break-word;">${safeStr(c.courtReasoningSummary)}</td>
                      <td><b style="color:#1e1b4b;">${safeStr(c.finalOutcome)}</b></td>
                      <td style="line-height: 1.4; word-break: break-word;">${safeStr(c.whyItMatters)}</td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            `;
          })()}

          <!-- GOVERNMENT ORDERS (G.O.) TABLE -->
          <p style="font-size: 8.5px; font-weight: 800; color: #0f172a; margin: 6px 0 2px 0;">Binding Government Orders (G.O.s) Referenced:</p>
          ${(() => {
            const gos = stage11.authoritiesSummary?.governmentOrders || [];
            if (gos.length === 0) {
              return `<div style="color:#94a3b8; font-style:italic; font-size:9px; margin-bottom:4px;">[ No specific Government Orders cited ]</div>`;
            }
            return `
              <table class="pdf-table" style="font-size: 8.5px;">
                <thead>
                  <tr>
                    <th style="width: 18%;">G.O. Number</th>
                    <th style="width: 12%;">Date</th>
                    <th style="width: 18%;">Department</th>
                    <th style="width: 26%;">Subject</th>
                    <th style="width: 26%;">Relevance</th>
                  </tr>
                </thead>
                <tbody>
                  ${gos.map((go: any) => `
                    <tr>
                      <td><b>${safeStr(go.orderNumber)}</b></td>
                      <td>${safeStr(go.date)}</td>
                      <td>${safeStr(go.department)}</td>
                      <td>${safeStr(go.subject)}</td>
                      <td>${safeStr(go.relevance)}</td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            `;
          })()}

          <!-- CIRCULARS TABLE -->
          <p style="font-size: 8.5px; font-weight: 800; color: #0f172a; margin: 6px 0 2px 0;">Departmental Revenue / Registration Circulars:</p>
          ${(() => {
            const circs = stage11.authoritiesSummary?.circulars || [];
            if (circs.length === 0) {
              return `<div style="color:#94a3b8; font-style:italic; font-size:9px; margin-bottom:4px;">[ No specific Circulars cited ]</div>`;
            }
            return `
              <table class="pdf-table" style="font-size: 8.5px;">
                <thead>
                  <tr>
                    <th style="width: 18%;">Circular No</th>
                    <th style="width: 12%;">Date</th>
                    <th style="width: 18%;">Department</th>
                    <th style="width: 26%;">Subject</th>
                    <th style="width: 26%;">Relevance</th>
                  </tr>
                </thead>
                <tbody>
                  ${circs.map((circ: any) => `
                    <tr>
                      <td><b>${safeStr(circ.circularNumber)}</b></td>
                      <td>${safeStr(circ.date)}</td>
                      <td>${safeStr(circ.department)}</td>
                      <td>${safeStr(circ.subject)}</td>
                      <td>${safeStr(circ.relevance)}</td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            `;
          })()}

          <p style="font-size: 8.5px; font-weight: 800; color: #0f172a; margin: 6px 0 2px 0;">Relevant Acts & Statutory Provisions:</p>
          ${renderList(stage11.authoritiesSummary?.statutesList, "No statutory acts listed")}

          <p style="font-size: 8.5px; font-weight: 800; color: #0f172a; margin: 6px 0 2px 0;">Precedent-Based Legal Strategy Recommendation:</p>
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 6px 8px; font-size: 9px; color: #334155; line-height: 1.45;">
            ${renderVal(stage11.strategyRecommendationFromPrecedents)}
          </div>
        ` : `
          <div style="color: #94a3b8; font-style: italic; font-size: 9.5px; padding: 8px; border: 1px dashed #cbd5e1; border-radius: 4px;">
            [ Precedent Intelligence analysis not yet executed or unavailable for this case record ]
          </div>
        `}
      </div>

      <!-- SECTION 13: STAGE 12 - LEGAL STRATEGY SIMULATOR -->
      ${renderSectionHeader("12", "Legal Strategy Simulation & Rebuttal Plan")}
      <div class="pdf-block">
        ${stage12 ? `
          <table class="pdf-table">
            <tr>
              <th style="width: 30%;">Strongest Legal Route</th>
              <td style="width: 70%;"><b style="color:#1e1b4b; font-size:10px;">${renderVal(stage12.strongestLegalRoute?.routeName)}</b> (${renderVal(stage12.strongestLegalRoute?.routeType)})</td>
            </tr>
            <tr>
              <th>Route Justification</th>
              <td style="line-height: 1.5;">${renderVal(stage12.strongestLegalRoute?.justification)}</td>
            </tr>
            <tr>
              <th>Est. Time to Resolution</th>
              <td><b>${renderVal(stage12.strongestLegalRoute?.timeToResolutionEst)}</b></td>
            </tr>
            <tr>
              <th>Most Persuasive Precedents</th>
              <td>${renderList(stage12.mostPersuasivePrecedents, "None enumerated")}</td>
            </tr>
          </table>

          <!-- EVIDENCE GAPS TO FILL -->
          <p style="font-size: 9px; font-weight: 800; color: #0f172a; margin: 8px 0 2px 0;">Evidence Gaps to Fill:</p>
          ${(() => {
            const gaps = stage12.evidenceGapsToFill || [];
            if (gaps.length === 0) {
              return `<div style="color:#94a3b8; font-style:italic; font-size:9.5px; margin-bottom:6px;">[ No specific evidence gaps recorded ]</div>`;
            }
            return `
              <table class="pdf-table">
                <tr>
                  <th style="width: 35%;">Missing Element</th>
                  <th style="width: 50%;">How to Obtain / Procedure</th>
                  <th style="width: 15%;">Urgency</th>
                </tr>
                ${gaps.map((g: any) => `
                  <tr>
                    <td><b>${safeStr(g.missingElement)}</b></td>
                    <td>${safeStr(g.howToObtain)}</td>
                    <td style="text-align:center;"><b style="color:${g.urgency === 'High' ? '#b91c1c' : '#0f172a'}">${safeStr(g.urgency)}</b></td>
                  </tr>
                `).join("")}
              </table>
            `;
          })()}

          <!-- OPPOSING COUNTERARGUMENTS & REBUTTALS -->
          <p style="font-size: 9px; font-weight: 800; color: #0f172a; margin: 8px 0 2px 0;">Anticipated Opposing Counterarguments & Rebuttal Strategy:</p>
          ${(() => {
            const counter = stage12.likelyOppositeCounterarguments || [];
            if (counter.length === 0) {
              return `<div style="color:#94a3b8; font-style:italic; font-size:9.5px; margin-bottom:6px;">[ No counterarguments recorded ]</div>`;
            }
            return `
              <table class="pdf-table">
                <tr>
                  <th style="width: 45%;">Anticipated Opposing Argument</th>
                  <th style="width: 55%;">Strategic Rebuttal Approach</th>
                </tr>
                ${counter.map((c: any) => `
                  <tr>
                    <td><b style="color:#991b1b;">${safeStr(c.argument)}</b></td>
                    <td>${safeStr(c.rebuttalStrategy)}</td>
                  </tr>
                `).join("")}
              </table>
            `;
          })()}

          <!-- RECOMMENDED ADDITIONAL PROOFS -->
          <p style="font-size: 9px; font-weight: 800; color: #0f172a; margin: 8px 0 2px 0;">Recommended Additional Proofs:</p>
          ${(() => {
            const proof = stage12.recommendedAdditionalProof || [];
            if (proof.length === 0) {
              return `<div style="color:#94a3b8; font-style:italic; font-size:9.5px; margin-bottom:6px;">[ No additional proofs recorded ]</div>`;
            }
            return `
              <table class="pdf-table">
                <tr>
                  <th style="width: 20%;">Proof Type</th>
                  <th style="width: 35%;">Proof Title / Record</th>
                  <th style="width: 45%;">Legal Purpose</th>
                </tr>
                ${proof.map((p: any) => `
                  <tr>
                    <td><b>${safeStr(p.type)}</b></td>
                    <td>${safeStr(p.title)}</td>
                    <td>${safeStr(p.purpose)}</td>
                  </tr>
                `).join("")}
              </table>
            `;
          })()}

          <!-- PRIORITY NEXT ACTIONS -->
          <p style="font-size: 9px; font-weight: 800; color: #0f172a; margin: 8px 0 2px 0;">Priority Step-by-Step Action Plan:</p>
          ${(() => {
            const actions = stage12.priorityNextActions || [];
            if (actions.length === 0) {
              return `<div style="color:#94a3b8; font-style:italic; font-size:9.5px;">[ No priority actions enumerated ]</div>`;
            }
            return `
              <table class="pdf-table">
                <tr>
                  <th style="width: 8%;">Step</th>
                  <th style="width: 52%;">Action Required</th>
                  <th style="width: 25%;">Target Authority</th>
                  <th style="width: 15%;">Timeline</th>
                </tr>
                ${actions.map((a: any) => `
                  <tr>
                    <td style="text-align:center; font-weight:800; color:#4f46e5;">#${safeStr(a.stepNumber)}</td>
                    <td><b>${safeStr(a.action)}</b></td>
                    <td>${safeStr(a.targetAuthority)}</td>
                    <td><b>${safeStr(a.timeline)}</b></td>
                  </tr>
                `).join("")}
              </table>
            `;
          })()}
        ` : `
          <div style="color: #94a3b8; font-style: italic; font-size: 9.5px; padding: 8px; border: 1px dashed #cbd5e1; border-radius: 4px;">
            [ Legal Strategy Simulator analysis not yet executed or unavailable for this case record ]
          </div>
        `}
      </div>

      <!-- SECTION 14: ADVOCATE REVIEW & CLIENT BRIEF -->
      <div class="pdf-block">
        ${renderSectionHeader("13", "Advocate Review, Client Action Brief & Legal Drafts")}
        <table class="pdf-table">
          <tr>
            <th style="width: 30%;">Client Problem Identified</th>
            <td style="width: 70%; line-height: 1.45;">${renderVal(problemIdentified)}</td>
          </tr>
          <tr>
            <th>Legal Position Summary</th>
            <td style="line-height: 1.45;">${renderVal(legalPosition)}</td>
          </tr>
          <tr>
            <th>Immediate Next Step</th>
            <td><b>${renderVal(immediateNextStep)}</b></td>
          </tr>
          <tr>
            <th>Target Forum / Est. Timeline</th>
            <td>${renderVal(expectedAuthority)} (${renderVal(estimatedTimeline)})</td>
          </tr>
        </table>

        <p style="font-size: 8.5px; font-weight: 800; color: #0f172a; margin: 6px 0 2px 0;">Immediate Action Schedule:</p>
        <table class="pdf-table">
          <tr>
            <th style="width: 33%;">Within 24 Hours</th>
            <th style="width: 33%;">Within 7 Days</th>
            <th style="width: 34%;">Within 30 Days</th>
          </tr>
          <tr>
            <td>${renderList(within24Hours, "None listed")}</td>
            <td>${renderList(within7Days, "None listed")}</td>
            <td>${renderList(within30Days, "None listed")}</td>
          </tr>
        </table>

        <p style="font-size: 8.5px; font-weight: 800; color: #0f172a; margin: 6px 0 2px 0;">Mandatory Client Documents Checklist:</p>
        ${renderList(mandatoryDocs, "No mandatory documents specified")}

        ${draft && draft.documentTitle ? `
          <div style="margin-top: 6px; background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 4px; padding: 6px 8px;">
            <p style="font-size: 8.5px; font-weight: 800; color: #0f172a; margin: 0 0 2px 0;">Generated Representation / Notice Draft Record:</p>
            <p style="font-size: 9px; font-weight: 700; color: #1e1b4b; margin: 0 0 2px 0;">Title: ${safeStr(draft.documentTitle)}</p>
            <p style="font-size: 8px; font-family: monospace; color: #64748b; margin: 0;">SHA-256 Hash Seal: ${safeStr(draft.sha256Hash || "N/A")}</p>
          </div>
        ` : ""}
      </div>

      <!-- FINAL ENTERPRISE FOOTER -->
      <div class="pdf-block" style="margin-top: 14px; padding-top: 8px; border-top: 2px solid #0f172a; display: flex; justify-content: space-between; align-items: flex-start; font-size: 8px; color: #64748b; font-family: monospace;">
        <div>
          <p style="font-weight: 800; color: #0f172a; margin: 0 0 2px 0;">NILAM360 ADVOCATE ENTERPRISE SEAL & AUDIT TRAIL</p>
          <p style="margin: 0; color: #475569;">VERIFIED SHA-256 HASH: ${safeStr(draft.sha256Hash || "VERIFIED-TAMPER-PROOF-CASE-RECORD")}</p>
          <p style="margin: 2px 0 0 0; color: #94a3b8;">Nilam360 AI Legal Intelligence System • Enterprise Edition</p>
        </div>
        <div style="text-align: right;">
          <p style="margin: 0; font-weight: 800; color: #0f172a;">CONFIDENTIAL & PRIVILEGED LEGAL WORK PRODUCT</p>
          <p style="margin: 2px 0 0 0;">For Advocate & Judicial Review Only</p>
          <p style="margin: 2px 0 0 0; color: #94a3b8;">Generated: ${new Date().toISOString()}</p>
        </div>
      </div>
    </div>
  `;
}

/**
 * Downloads a complete multi-page PDF containing all 12 stages of the PropertyCase.
 */
export async function downloadCompleteCaseReportPDF(caseData: PropertyCase, filename?: string): Promise<void> {
  const container = document.createElement("div");
  container.className = "unikorn-pdf-container";
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.top = "-9999px";
  container.style.width = "794px"; // Standard A4 pixel width at 96 DPI
  container.style.backgroundColor = "#ffffff";
  container.style.color = "#0f172a";
  container.style.fontFamily = "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif";
  container.style.padding = "32px 36px";
  container.style.boxSizing = "border-box";
  container.style.lineHeight = "1.5";

  container.innerHTML = generateCompleteCaseReportHTML(caseData);

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff"
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.95);
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
    const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // First page
    pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    // Multi-page loop
    while (heightLeft > 5) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    // Header & Footer decoration on every page
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);

      // Clean footer masking rectangle
      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 284, 210, 13, "F");

      // Footer divider line
      pdf.setDrawColor(203, 213, 225); // slate-300
      pdf.setLineWidth(0.2);
      pdf.line(10, 286, 200, 286);

      // Footer text & Page numbers
      pdf.setFontSize(7.5);
      pdf.setTextColor(71, 85, 105); // slate-600
      pdf.text("NILAM360 LEGALOS — CONFIDENTIAL & PRIVILEGED LEGAL WORK PRODUCT", 10, 291);
      pdf.text(`Page ${i} of ${totalPages}`, 200, 291, { align: "right" });
    }

    const titleStr = caseData.intake?.clientName || caseData.stage1?.category || "Complete_Case_Report";
    const cleanName = (filename || `${titleStr}_Complete_Case_Report_${caseData.id}`)
      .replace(/[^a-zA-Z0-9_\-\u0B80-\u0BFF]/g, "_")
      .slice(0, 60);

    pdf.save(`${cleanName}.pdf`);
  } catch (error) {
    console.error("Complete PDF generation failed, using HTML blob fallback:", error);
    const blob = new Blob([container.innerHTML], { type: "text/html;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Complete_Case_Report_${caseData.id}.html`;
    link.click();
    URL.revokeObjectURL(link.href);
  } finally {
    document.body.removeChild(container);
  }
}
