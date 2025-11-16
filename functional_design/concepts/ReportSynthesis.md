# concept: ReportSynthesis[Employee, FeedbackForm, Response]

  **purpose**

    generate privacy-preserving, optionally anonymous synthesized feedback reports 
    using structured responses, k-anonymity constraints, and optional LLM-assisted summarization.

  **principle**

    for each completed feedback cycle, the system collects all responses for a target employee;
    applies anonymity settings and k-anonymity thresholds to determine what can be shown verbatim;
    aggregates qualitative and quantitative responses into themes;
    optionally uses an LLM to draft summaries with human-in-the-loop review;
    and produces a final report that the manager and/or employee can view.

  **state**

    a set of ResponseSets with
      a target Employee
      a form FeedbackForm
      a set of responses Responses
      an anonymityFlag Flag
      a kThreshold Number
      a synthesizedReport optional Report

    a set of Reports with
      a target Employee
      a textSummary Text
      a set of keyQuotes Texts
      a set of metrics Aggregates

  **actions**

    ingestResponses (target: Employee, form: FeedbackForm, responses: Set<Response>): (responseSet: ResponseSet)
      **requires** target exists and responses correspond to the form
      **effects** create a new ResponseSet with anonymityFlag and kThreshold inherited from the form

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
