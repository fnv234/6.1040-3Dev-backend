# Syncs for Concepts

## Report Generation Syncs

### GenerateFormTemplateReportRequest

**Purpose**: Coordinate FormTemplate, AccessCode, and ReportSynthesis concepts to generate a privacy-preserving report without violating concept independence.

**when**
- Requesting.request (path: "/ReportSynthesis/generateFormTemplateReport", formTemplateId, createdBy, anonymityFlag, kThreshold): (request)

**where**
- Query FormTemplate for template details
- Query AccessCode for all form responses
- Transform responses into ReportSynthesis format

**then**
- ReportSynthesis.generateCompleteReport (formTemplateId, responses, anonymityFlag, kThreshold): (report)

**Notes**: This sync replaces the violating `ReportSynthesis.generateFormTemplateReport` method that was directly importing and calling other concepts.

-----

### GenerateFormTemplateReportResponse

**Purpose**: Respond to the request with the generated report after successful generation.

**when**
- Requesting.request (path: "/ReportSynthesis/generateFormTemplateReport"): (request)
- ReportSynthesis.generateCompleteReport (): (report)

**then**
- Requesting.respond (request, report)

-----

### GenerateFormTemplateReportError

**Purpose**: Handle errors during report generation.

**when**
- Requesting.request (path: "/ReportSynthesis/generateFormTemplateReport"): (request)
- ReportSynthesis.generateCompleteReport (): (error)

**then**
- Requesting.respond (request, error)

-----

## Workflow Coordination Syncs

### generateDrafts

**Purpose**: Automatically draft summaries using LLM after themes are extracted.

**when**
- ReportSynthesis.extractThemes (responseSet): (themes)

**then**
- ReportSynthesis.draftSummaryLLM (responseSet, themes)

-----

### finalizeReports

**Purpose**: Finalize reports after summary approval.

**when**
- ReportSynthesis.approveSummary (responseSet, finalText, keyQuotes)

**then**
- ReportSynthesis.getFinalReport (responseSet)

-----