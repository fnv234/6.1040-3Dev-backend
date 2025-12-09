# concept: ReportSynthesis

  **purpose**

    generate privacy-preserving, optionally anonymous synthesized feedback reports 
    using structured responses, k-anonymity constraints, and optional LLM-assisted summarization.

  **principle**

    for each completed feedback cycle, the system collects all responses for a form template;
    applies anonymity settings and k-anonymity thresholds to determine what can be shown verbatim;
    aggregates qualitative and quantitative responses into themes;
    optionally uses an LLM to draft summaries with human-in-the-loop review;
    and produces a final report that the manager and/or employee can view.

  **state**

    a set of ResponseSets with
      an id ResponseSetID
      a formTemplate FormTemplateID
      a set of responses Responses
      an anonymityFlag Boolean
      a kThreshold Number
      an optional synthesizedReport ReportID

    a set of Reports with
      an id ReportID
      a formTemplate FormTemplateID
      a textSummary Text
      a keyThemes Text[]
      a keyQuotes Text[]
      a metrics Record<String, Number | Record<String, Number>>
      a createdAt String

    a set of Responses with
      a questionIndex Number
      a questionText String
      a response String
      a respondent Respondent
      an optional respondentRole String

  **actions**

    ingestResponses (formTemplate: FormTemplateID, responses: Set<Response>, anonymityFlag?: Boolean, kThreshold?: Number): (responseSet: ResponseSet)
      **requires** formTemplate exists and responses correspond to the form template
      **effects** create a new ResponseSet with anonymityFlag and kThreshold for aggregating all form responses

    applyKAnonymity (responseSet: ResponseSet)
      **requires** responseSet exists
      **effects** remove or degrade any response categories with fewer than kThreshold contributors

    extractThemes (responseSet: ResponseSet): (themes: Set<Text>)
      **requires** responseSet exists
      **effects** analyze sanitized responses and return thematic clusters

    draftSummaryLLM (responseSet: ResponseSet, themes: Set<Text>): (draft: Text)
      **requires** responseSet exists
      **effects** generate an LLM-assisted narrative summary highlighting themes and metrics

    approveSummary (responseSet: ResponseSet, finalText: Text, keyQuotes: Set<Text>)
      **requires** responseSet exists
      **effects** create or update a synthesizedReport for the responseSet with the approved summary and quotes

    getFinalReport (responseSet: ResponseSet): (report: Report)
      **requires** responseSet exists and has synthesizedReport
      **effects** return the synthesizedReport

    getResponseSet (responseSet: ResponseSetID): (responseSetData: ResponseSet)
      **requires** responseSet exists
      **effects** return the response set data

    getReportByFormTemplate (formTemplate: FormTemplateID): (report: Report | null)
      **requires** formTemplate exists
      **effects** return the most recent report for the form template, or null if none exists

    getAllReports (): (reports: Report[])
      **effects** return all synthesized reports

    generateCompleteReport (formTemplateId: FormTemplateID, responses: Set<Response>, anonymityFlag?: Boolean, kThreshold?: Number): (report: Report)
      **requires** user is the creator of the form template
      **effects** creates response set, applies anonymity, extracts themes, generates summary, and returns complete report

    **note**: generateFormTemplateReport action removed - report generation is now 
    coordinated via synchronizations in src/syncs/report_generation.sync.ts that 
    maintain concept independence while orchestrating FormTemplate, AccessCode, 
    and ReportSynthesis concepts

    extractKeyQuotes (responses: FormResponseDoc[], maxQuotes?: Number, minLength?: Number): (keyQuotes: String[])
      **effects** extracts meaningful quotes from responses

    generateTeamSummary (teamId: String, teamName: String, members: Array<{name: String, role: String}>): (summary: String)
      **requires** team information
      **effects** generate a professional team summary using the existing LLM infrastructure
