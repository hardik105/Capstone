package agent.reasoner

import evidence.Evidence
import agent.classifier.ClassifiedLineage

object LLMBasedLineageReasoner extends LineageReasoningEngine {

  override def reason(evidenceList: List[Evidence]): List[ClassifiedLineage] = {
    // 1. Group all evidence by filename
    val grouped = evidenceList.groupBy(_.fileName)
    
    // 2. Build one big prompt containing ALL files' evidence
    val batchPrompt = buildBatchPrompt(grouped)

    println("\n===== BATCH LLM PROMPT =====")
    println(batchPrompt)
    println("============================\n")

    // 3. Make ONE single API call for the entire project
    val rawResponse = agent.llm.LLMClient.call(batchPrompt)

    println("\n===== BATCH LLM RESPONSE =====")
    println(rawResponse)
    println("==============================\n")

    // 4. Parse the response back into individual file results
    parseBatchResponse(rawResponse, grouped)
  }

  private def buildBatchPrompt(grouped: Map[String, List[Evidence]]): String = {
    val projectDetails = grouped.map { case (fileName, evidence) =>
      val fileEvidence = evidence.map(ev => 
        s"- ${ev.evidenceType} | value: ${ev.value.getOrElse("NONE")} | context: ${ev.context.mkString(".")}"
      ).mkString("\n")
      s"FILE: $fileName\nEVIDENCE:\n$fileEvidence"
    }.mkString("\n---\n")

    s"""
       |TASK: You are a Data Lineage Agent. Analyze the evidence for multiple files below.
       |For EACH file, identify the READ and WRITE tables.
       |
       |$projectDetails
       |
       |RETURN ONLY a valid JSON object:
       |{
       |  "results": {
       |    "FileName.scala": { "reads": ["table1"], "writes": ["table2"] }
       |  }
       |}
       |""".stripMargin
  }

  private def parseBatchResponse(raw: String, grouped: Map[String, List[Evidence]]): List[ClassifiedLineage] = {
    // For now, we reuse your sanitizer by extracting the relevant file segment from the JSON.
    // If the LLM returns the structured JSON, you can parse it or keep it simple:
    grouped.map { case (fileName, evidence) =>
      LLMOutputSanitizer.sanitize(
        fileName = fileName,
        rawResponse = raw, // The sanitizer will find the relevant section for this file
        evidence = evidence
      )
    }.toList
  }
}