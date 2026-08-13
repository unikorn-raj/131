import { 
  PropertyCase, 
  Stage1Data, 
  Stage2Data, 
  Stage3LegalMap, 
  Stage4Timeline, 
  Stage5RightsMatrix, 
  Stage6Data, 
  Stage7JurisdictionMap, 
  Stage8Data, 
  Stage9Data, 
  Stage10Data, 
  Stage11PrecedentIntelligence, 
  Stage12StrategySimulator, 
  CaseHistoryEntry, 
  ClientFacingReply, 
  DocumentsRequired, 
  ImmediateAction, 
  ServicePackage, 
  CustomDocumentDraft,
  CaseUpdateEvent,
  CaseAnalysisVersion
} from "../types";

/**
 * Normalizes raw/legacy PropertyCase objects from Supabase or localStorage
 * into a fully structurally safe PropertyCase.
 *
 * IMPORTANT: Preserves all existing valid data and only repairs missing
 * or malformed nested structures to prevent React runtime rendering errors.
 */
export function normalizePropertyCase(rawCase: any): PropertyCase {
  if (!rawCase || typeof rawCase !== "object") {
    return createDefaultCase("empty_case");
  }

  // Basic metadata
  const id = String(rawCase.id || `case_${Date.now()}`);
  const createdAt = typeof rawCase.createdAt === "string" ? rawCase.createdAt : (typeof rawCase.created_at === "string" ? rawCase.created_at : new Date().toISOString());
  const rawDescription = typeof rawCase.rawDescription === "string" ? rawCase.rawDescription : (typeof rawCase.description === "string" ? rawCase.description : "");
  
  const languageMode = (rawCase.languageMode === "en" || rawCase.languageMode === "dual" || rawCase.languageMode === "ta")
    ? rawCase.languageMode
    : "ta";

  // Helper to ensure array of strings
  const ensureStringArray = (val: any): string[] => {
    if (Array.isArray(val)) {
      return val.map(v => String(v ?? "")).filter(s => s.length > 0);
    }
    if (typeof val === "string" && val.trim()) {
      return [val.trim()];
    }
    return [];
  };

  // Intake / Stage0 (always object)
  const rawIntake = (rawCase.intake && typeof rawCase.intake === "object") 
    ? rawCase.intake 
    : ((rawCase.stage0 && typeof rawCase.stage0 === "object") ? rawCase.stage0 : {});

  const stage0 = {
    clientName: typeof rawIntake.clientName === "string" && rawIntake.clientName ? rawIntake.clientName : "வாடிக்கையாளர் / Client",
    mobile: typeof rawIntake.mobile === "string" ? rawIntake.mobile : "",
    surveyNumber: typeof rawIntake.surveyNumber === "string" ? rawIntake.surveyNumber : "",
    village: typeof rawIntake.village === "string" ? rawIntake.village : "",
    taluk: typeof rawIntake.taluk === "string" ? rawIntake.taluk : "",
    district: typeof rawIntake.district === "string" && rawIntake.district ? rawIntake.district : "தமிழ்நாடு / Tamil Nadu",
    oppositeParty: typeof rawIntake.oppositeParty === "string" ? rawIntake.oppositeParty : "",
    partyRelationship: typeof rawIntake.partyRelationship === "string" ? rawIntake.partyRelationship : "",
    courtOrForum: typeof rawIntake.courtOrForum === "string" ? rawIntake.courtOrForum : "",
    existingAdvocate: typeof rawIntake.existingAdvocate === "string" ? rawIntake.existingAdvocate : "",
    existingCaseNumber: typeof rawIntake.existingCaseNumber === "string" ? rawIntake.existingCaseNumber : "",
    limitationRisk: typeof rawIntake.limitationRisk === "string" ? rawIntake.limitationRisk : "Medium",
    workspace: rawIntake.workspace || rawCase.workspace,
    subWorkspace: rawIntake.subWorkspace || rawCase.subWorkspace,
    module: rawIntake.module || rawCase.module,
    engine: rawIntake.engine || rawCase.engine,
  };
  const intake = { ...stage0 };

  // Stage 1 (always object, category & specificType string fallbacks)
  const rawStage1 = (rawCase.stage1 && typeof rawCase.stage1 === "object") ? rawCase.stage1 : {};
  const stage1: Stage1Data = {
    category: typeof rawStage1.category === "string" ? rawStage1.category : (typeof rawCase.stage1 === "string" ? rawCase.stage1 : "வருவாய் / Revenue"),
    specificType: typeof rawStage1.specificType === "string" ? rawStage1.specificType : "",
  };

  // Stage 2 (always object)
  const rawStage2 = (rawCase.stage2 && typeof rawCase.stage2 === "object") ? rawCase.stage2 : {};
  const stage2: Stage2Data = {
    realIssue: typeof rawStage2.realIssue === "string" ? rawStage2.realIssue : (typeof rawCase.stage2 === "string" ? rawCase.stage2 : ""),
    rootCauseStatement: typeof rawStage2.rootCauseStatement === "string" ? rawStage2.rootCauseStatement : "",
  };

  // Stage 3 (preserve legacy string or normalize structured object)
  let stage3: string | Stage3LegalMap;
  if (typeof rawCase.stage3 === "object" && rawCase.stage3 !== null) {
    stage3 = {
      subjectType: typeof rawCase.stage3.subjectType === "string" ? rawCase.stage3.subjectType : "நிலம் / Property",
      partyRelationshipMap: typeof rawCase.stage3.partyRelationshipMap === "string" ? rawCase.stage3.partyRelationshipMap : "",
    };
  } else if (typeof rawCase.stage3 === "string" && rawCase.stage3.trim()) {
    stage3 = rawCase.stage3;
  } else {
    stage3 = "நிலம் / Property";
  }

  // Stage 4 (if object: timelineEvents string[]; if string: legacy string or wrap)
  let stage4: string | Stage4Timeline;
  if (typeof rawCase.stage4 === "object" && rawCase.stage4 !== null) {
    stage4 = {
      timelineEvents: ensureStringArray(rawCase.stage4.timelineEvents),
    };
  } else if (typeof rawCase.stage4 === "string" && rawCase.stage4.trim()) {
    stage4 = {
      timelineEvents: [rawCase.stage4],
    };
  } else {
    stage4 = {
      timelineEvents: [],
    };
  }

  // Stage 5 (rightsViolated, dutiesBreached, legalObligations, possibleLiabilities, availableProtections always string[])
  let stage5: Stage5RightsMatrix;
  if (typeof rawCase.stage5 === "object" && rawCase.stage5 !== null) {
    stage5 = {
      rightsViolated: ensureStringArray(rawCase.stage5.rightsViolated),
      dutiesBreached: ensureStringArray(rawCase.stage5.dutiesBreached),
      legalObligations: ensureStringArray(rawCase.stage5.legalObligations),
      possibleLiabilities: ensureStringArray(rawCase.stage5.possibleLiabilities),
      availableProtections: ensureStringArray(rawCase.stage5.availableProtections),
    };
  } else if (typeof rawCase.stage5 === "string" && rawCase.stage5.trim()) {
    stage5 = {
      rightsViolated: [rawCase.stage5],
      dutiesBreached: [],
      legalObligations: [],
      possibleLiabilities: [],
      availableProtections: [],
    };
  } else {
    stage5 = {
      rightsViolated: [],
      dutiesBreached: [],
      legalObligations: [],
      possibleLiabilities: [],
      availableProtections: [],
    };
  }

  // Stage 6 (all array fields always string[])
  const rawStage6 = (rawCase.stage6 && typeof rawCase.stage6 === "object") ? rawCase.stage6 : {};
  const stage6: Stage6Data = {
    available: ensureStringArray(rawStage6.available),
    missing: ensureStringArray(rawStage6.missing),
    documentary: ensureStringArray(rawStage6.documentary),
    electronic: ensureStringArray(rawStage6.electronic),
    witnesses: ensureStringArray(rawStage6.witnesses),
    officialRecords: ensureStringArray(rawStage6.officialRecords),
    evidenceStrength: typeof rawStage6.evidenceStrength === "string" ? rawStage6.evidenceStrength : "Moderate",
  };

  // Stage 7 (preserve array, structured object route: string[], or legacy string to route: [string])
  let stage7: string[] | Stage7JurisdictionMap;
  if (Array.isArray(rawCase.stage7)) {
    stage7 = ensureStringArray(rawCase.stage7);
  } else if (typeof rawCase.stage7 === "object" && rawCase.stage7 !== null) {
    stage7 = {
      route: ensureStringArray(rawCase.stage7.route),
      primaryAuthority: typeof rawCase.stage7.primaryAuthority === "string" ? rawCase.stage7.primaryAuthority : "",
      appellateAuthority: typeof rawCase.stage7.appellateAuthority === "string" ? rawCase.stage7.appellateAuthority : "",
      forumType: typeof rawCase.stage7.forumType === "string" ? rawCase.stage7.forumType : "",
    };
  } else if (typeof rawCase.stage7 === "string" && rawCase.stage7.trim()) {
    stage7 = [rawCase.stage7.trim()];
  } else {
    stage7 = [];
  }

  // Stage 8 (always object, primaryRemedy string fallback, alternativeOptions string[])
  const rawStage8 = (rawCase.stage8 && typeof rawCase.stage8 === "object") ? rawCase.stage8 : {};
  const stage8: Stage8Data = {
    category: typeof rawStage8.category === "string" ? rawStage8.category : "",
    primaryRemedy: typeof rawStage8.primaryRemedy === "string" && rawStage8.primaryRemedy 
      ? rawStage8.primaryRemedy 
      : (typeof rawCase.stage8 === "string" ? rawCase.stage8 : "பரிகார மனு / Legal Petition"),
    remedyType: typeof rawStage8.remedyType === "string" ? rawStage8.remedyType : "",
    alternativeOptions: ensureStringArray(rawStage8.alternativeOptions),
  };

  // Stage 9 (factors always string[], score numeric fallback, rating string fallback)
  const rawStage9 = (rawCase.stage9 && typeof rawCase.stage9 === "object") ? rawCase.stage9 : {};
  const stage9: Stage9Data = {
    factors: ensureStringArray(rawStage9.factors),
    score: typeof rawStage9.score === "number" ? rawStage9.score : (Number(rawStage9.score) || 45),
    rating: typeof rawStage9.rating === "string" && rawStage9.rating ? rawStage9.rating : "Medium",
    limitationStatus: typeof rawStage9.limitationStatus === "string" ? rawStage9.limitationStatus : "",
    urgencyLevel: typeof rawStage9.urgencyLevel === "string" ? rawStage9.urgencyLevel : "",
  };

  // Stage 10 (always object, deliverablesList string[])
  const rawStage10 = (rawCase.stage10 && typeof rawCase.stage10 === "object") ? rawCase.stage10 : {};
  const stage10: Stage10Data = {
    packageName: typeof rawStage10.packageName === "string" ? rawStage10.packageName : "Professional Legal Package",
    priceRange: typeof rawStage10.priceRange === "string" ? rawStage10.priceRange : "Standard",
    description: typeof rawStage10.description === "string" ? rawStage10.description : "",
    deliverablesList: ensureStringArray(rawStage10.deliverablesList),
  };

  // Stage 11 (similarCases, governmentOrders, circulars, factsComparison, issuesCompared, legalPrinciples must be arrays)
  let stage11: Stage11PrecedentIntelligence | undefined = undefined;
  if (rawCase.stage11 && typeof rawCase.stage11 === "object") {
    const rawS11 = rawCase.stage11;
    const rawSimilarCases = Array.isArray(rawS11.similarCases) ? rawS11.similarCases : [];
    
    const similarCases = rawSimilarCases.map((sc: any) => {
      if (!sc || typeof sc !== "object") return sc;
      return {
        ...sc,
        keyLegalHoldings: ensureStringArray(sc.keyLegalHoldings),
        factsComparison: Array.isArray(sc.factsComparison) ? sc.factsComparison : [],
        issuesCompared: Array.isArray(sc.issuesCompared) ? sc.issuesCompared : [],
        legalPrinciples: ensureStringArray(sc.legalPrinciples),
      };
    });

    const rawAuth = (rawS11.authoritiesSummary && typeof rawS11.authoritiesSummary === "object") 
      ? rawS11.authoritiesSummary 
      : {};

    const governmentOrders = Array.isArray(rawAuth.governmentOrders) ? rawAuth.governmentOrders : [];
    const circulars = Array.isArray(rawAuth.circulars) ? rawAuth.circulars : [];

    stage11 = {
      ...rawS11,
      similarCases,
      averageSimilarityScore: typeof rawS11.averageSimilarityScore === "number" ? rawS11.averageSimilarityScore : 85,
      relevantStatutes: ensureStringArray(rawS11.relevantStatutes),
      authoritiesSummary: {
        ...rawAuth,
        governmentOrders,
        circulars,
      },
    };
  }

  // Stage 12 (all array fields must be arrays, all nested objects have safe defaults)
  let stage12: Stage12StrategySimulator | undefined = undefined;
  if (rawCase.stage12 && typeof rawCase.stage12 === "object") {
    const rawS12 = rawCase.stage12;
    stage12 = {
      ...rawS12,
      riskMitigationSteps: ensureStringArray(rawS12.riskMitigationSteps),
      evidenceGapsToFill: ensureStringArray(rawS12.evidenceGapsToFill),
      anticipatedCounterarguments: ensureStringArray(rawS12.anticipatedCounterarguments),
      timelineMilestones: Array.isArray(rawS12.timelineMilestones) ? rawS12.timelineMilestones : [],
      nextSteps: ensureStringArray(rawS12.nextSteps),
      strongestLegalRoute: (rawS12.strongestLegalRoute && typeof rawS12.strongestLegalRoute === "object") 
        ? rawS12.strongestLegalRoute 
        : {
            routeName: "High Court Writ Petition / Administrative Appeal",
            justification: "Strong legal standing based on procedural violation.",
            routeType: "Constitutional / Administrative",
            successProbabilityPercentage: 85,
            timeToResolutionEst: "3-6 months",
          },
    };
  }

  // documentsRequired (all array fields always arrays)
  const rawDocsReq = (rawCase.documentsRequired && typeof rawCase.documentsRequired === "object") ? rawCase.documentsRequired : {};
  const documentsRequired: DocumentsRequired = {
    available: ensureStringArray(rawDocsReq.available),
    missing: ensureStringArray(rawDocsReq.missing),
    optional: ensureStringArray(rawDocsReq.optional),
  };

  // immediateAction (all array fields always arrays)
  const rawAction = (rawCase.immediateAction && typeof rawCase.immediateAction === "object") ? rawCase.immediateAction : {};
  const immediateAction: ImmediateAction = {
    authorityToApproach: typeof rawAction.authorityToApproach === "string" ? rawAction.authorityToApproach : "",
    nextSteps: ensureStringArray(rawAction.nextSteps),
    timeframe: typeof rawAction.timeframe === "string" ? rawAction.timeframe : "",
  };

  // servicePackage (deliverables arrays always arrays)
  const rawServicePkg = (rawCase.servicePackage && typeof rawCase.servicePackage === "object") ? rawCase.servicePackage : {};
  const servicePackage: ServicePackage = {
    deliverables: ensureStringArray(rawServicePkg.deliverables),
    feeRange: typeof rawServicePkg.feeRange === "string" ? rawServicePkg.feeRange : "",
    recommendedTrack: typeof rawServicePkg.recommendedTrack === "string" ? rawServicePkg.recommendedTrack : "",
  };

  // customDocumentDraft
  const rawDraft = (rawCase.customDocumentDraft && typeof rawCase.customDocumentDraft === "object") ? rawCase.customDocumentDraft : {};
  const customDocumentDraft: CustomDocumentDraft = {
    title: typeof rawDraft.title === "string" ? rawDraft.title : "சட்ட பத்திரம் / Legal Draft",
    category: typeof rawDraft.category === "string" ? rawDraft.category : "",
    content: typeof rawDraft.content === "string" ? rawDraft.content : "",
    sha256Hash: typeof rawDraft.sha256Hash === "string" ? rawDraft.sha256Hash : "",
    sections: Array.isArray(rawDraft.sections) ? rawDraft.sections : [],
  };

  // clientFacingReply
  const rawReply = (rawCase.clientFacingReply && typeof rawCase.clientFacingReply === "object") ? rawCase.clientFacingReply : {};
  const clientFacingReply: ClientFacingReply = {
    summary: typeof rawReply.summary === "string" ? rawReply.summary : "",
    actionableAdvice: typeof rawReply.actionableAdvice === "string" ? rawReply.actionableAdvice : "",
    keyFindings: ensureStringArray(rawReply.keyFindings),
  };

  // history (always array, preserve existing entries)
  const history: CaseHistoryEntry[] = Array.isArray(rawCase.history)
    ? rawCase.history.filter((h: any) => h && typeof h === "object")
    : [];

  // updates (always array)
  const updates: CaseUpdateEvent[] = Array.isArray(rawCase.updates)
    ? rawCase.updates.filter((u: any) => u && typeof u === "object")
    : [];

  // versions (always array)
  const versions: CaseAnalysisVersion[] = Array.isArray(rawCase.versions)
    ? rawCase.versions.filter((v: any) => v && typeof v === "object")
    : [];

  // translatedVariants (default to {}, recursively normalize if present)
  const translatedVariants: any = {};
  if (rawCase.translatedVariants && typeof rawCase.translatedVariants === "object") {
    for (const lang of ["ta", "en", "dual"] as const) {
      if (rawCase.translatedVariants[lang] && typeof rawCase.translatedVariants[lang] === "object") {
        translatedVariants[lang] = normalizePropertyCase(rawCase.translatedVariants[lang]);
      }
    }
  }

  return {
    id,
    createdAt,
    rawDescription,
    workspace: rawCase.workspace,
    subWorkspace: rawCase.subWorkspace,
    module: rawCase.module,
    engine: rawCase.engine,
    intake,
    stage0,
    stage1,
    stage2,
    stage3,
    stage4,
    stage5,
    stage6,
    stage7,
    stage8,
    stage9,
    stage10,
    stage11,
    stage12,
    clientFacingReply,
    documentsRequired,
    immediateAction,
    servicePackage,
    customDocumentDraft,
    languageMode,
    translatedVariants,
    history,
    updates,
    versions,
  };
}

function createDefaultCase(id: string): PropertyCase {
  const now = new Date().toISOString();
  return {
    id,
    createdAt: now,
    rawDescription: "",
    intake: { clientName: "வாடிக்கையாளர்", mobile: "", district: "தமிழ்நாடு", oppositeParty: "", existingAdvocate: "", existingCaseNumber: "", limitationRisk: "Medium" },
    stage0: { clientName: "வாடிக்கையாளர்", mobile: "", district: "தமிழ்நாடு", oppositeParty: "", existingAdvocate: "", existingCaseNumber: "", limitationRisk: "Medium" },
    stage1: { category: "வருவாய் / Revenue", specificType: "" },
    stage2: { realIssue: "", rootCauseStatement: "" },
    stage3: "நிலம் / Property",
    stage4: { timelineEvents: [] },
    stage5: { rightsViolated: [], dutiesBreached: [], legalObligations: [], possibleLiabilities: [], availableProtections: [] },
    stage6: { available: [], missing: [], documentary: [], electronic: [], witnesses: [], officialRecords: [], evidenceStrength: "Moderate" },
    stage7: [],
    stage8: { category: "", primaryRemedy: "பரிகார மனு", alternativeOptions: [] },
    stage9: { factors: [], score: 45, rating: "Medium" },
    stage10: { packageName: "Standard", priceRange: "Standard", description: "", deliverablesList: [] },
    clientFacingReply: { summary: "", actionableAdvice: "", keyFindings: [] },
    documentsRequired: { available: [], missing: [], optional: [] },
    immediateAction: { authorityToApproach: "", nextSteps: [], timeframe: "" },
    servicePackage: { deliverables: [], feeRange: "", recommendedTrack: "" },
    customDocumentDraft: { title: "சட்ட பத்திரம்", category: "", content: "", sections: [] },
    languageMode: "ta",
    translatedVariants: {},
    history: [],
    updates: [],
    versions: [],
  };
}
