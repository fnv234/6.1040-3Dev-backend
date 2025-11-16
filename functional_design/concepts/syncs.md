# Syncs for Concepts

**sync buildReviewers**

  *when*

    ReviewCycle.autoBuildReviewers (cycle, target)

    OrgGraph.getManager (target): (manager)

    OrgGraph.getPeers (target): (peers)

    OrgGraph.getDirectReports (target): (reports)

  *then*

    ReviewCycle.configureAssignments.addReviewers (

      cycle: cycle,

      target: target,
      
      reviewers: {manager} ∪ peers ∪ reports
    )
-----
**sync ingestAndSanitize**

  *when*

    ReviewCycle.submitFeedback (cycle, target, reviewer, responses)
    
    ReportSynthesis.ingestResponses (target, form, responses): (responseSet)

  *then*

    ReportSynthesis.applyKAnonymity (responseSet)
-----
**sync prepareForSummary**

  *when*

    ReviewCycle.close (cycle)

    ReviewCycle.exportForSynthesis (cycle): (responseSets)

  *then*

    for each responseSet in responseSets:

      ReportSynthesis.extractThemes (responseSet)
-----
**sync generateDrafts**

  *when*

    ReportSynthesis.extractThemes (responseSet): (themes)

  *then*

    ReportSynthesis.draftSummaryLLM (responseSet, themes)
-----
**sync finalizeReports**

  *when*

    ReportSynthesis.draftSummaryLLM (responseSet, draft): (draft)

    ReportSynthesis.approveSummary (responseSet, finalText, keyQuotes)

  *then*
  
    ReportSynthesis.getFinalReport (responseSet)

