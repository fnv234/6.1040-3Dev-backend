# Syncs for Concepts

## Report Generation Syncs

### GenerateFormTemplateReportRequest

**Purpose**: Coordinate FormTemplate, AccessCode, OrgGraph, and ReportSynthesis concepts to generate a privacy-preserving, narrative-style report without violating concept independence.

**when**
- Requesting.request (path: "/ReportSynthesis/generateFormTemplateReport", formTemplateId, createdBy, anonymityFlag, kThreshold): (request)

**where**
- Query FormTemplate for template details
- Query AccessCode for all form responses
- Query OrgGraph for team information (if template has teamId)
- Transform responses into ReportSynthesis format
- Calculate metrics for role distribution and response counts
- Pass team context (name, role distribution, total responses) to LLM

**then**
- ReportSynthesis.generateCompleteReport (formTemplateId, responses, anonymityFlag, kThreshold, teamName): (report)

**Notes**: 
- This sync replaces the violating `ReportSynthesis.generateFormTemplateReport` method that was directly importing and calling other concepts
- Enhanced to fetch team context from OrgGraph for narrative report generation
- Passes team information to LLM to generate insightful, team-specific narratives instead of generic templates
- Includes role distribution and response metrics for richer context

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

**Purpose**: Automatically draft narrative summaries using LLM after themes are extracted.

**when**
- ReportSynthesis.extractThemes (responseSet): (themes)

**then**
- ReportSynthesis.draftSummaryLLM (responseSet, themes, teamName, roleDistribution, totalResponses)

**Notes**: Enhanced to generate team-specific narrative summaries instead of generic templates. Accepts team context parameters for richer, more personalized report generation.

-----

### finalizeReports

**Purpose**: Finalize reports after summary approval.

**when**
- ReportSynthesis.approveSummary (responseSet, finalText, keyQuotes)

**then**
- ReportSynthesis.getFinalReport (responseSet)

-----