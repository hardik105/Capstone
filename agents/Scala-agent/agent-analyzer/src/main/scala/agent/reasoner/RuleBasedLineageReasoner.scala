package agent.reasoner

import evidence.Evidence
import agent.classifier.ClassifiedLineage

/**
 * RuleBasedLineageReasoner: Rule-based implementation of LineageReasoningEngine
 * 
 * This component reasons over Evidence objects to produce lineage classifications.
 * It does NOT traverse AST - it only reasons over extracted Evidence.
 * 
 * Simple heuristic:
 * - If Evidence.evidenceType == "STRING_LITERAL" AND context contains "read" → READ
 * - If context contains "write" or "save" → WRITE
 * - Otherwise → UNKNOWN
 */
object RuleBasedLineageReasoner extends LineageReasoningEngine {
  
  /**
   * Reasons over Evidence objects to produce lineage classifications.
   * Groups evidence by file and applies simple heuristics.
   */
  def reason(evidenceList: List[Evidence]): List[ClassifiedLineage] = {
    // Group evidence by file
    val evidenceByFile = evidenceList.groupBy(_.fileName)
    
    evidenceByFile.map { case (fileName, evidence) =>
      reasonFile(fileName, evidence)
    }.toList
  }
  
  /**
   * Reasons over evidence for a single file.
   * Applies simple heuristics to classify values.
   * 
   * Heuristics:
   * - READ: STRING_LITERAL with context containing "read"
   * - WRITE: context containing "write" OR "save"
   * - UNKNOWN: everything else
   */
  private def reasonFile(fileName: String, evidence: List[Evidence]): ClassifiedLineage = {
    var reads: List[String] = List.empty
    var writes: List[String] = List.empty
    var unknowns: List[String] = List.empty
    
    evidence.foreach { ev =>
      val valueOpt = ev.value
      val contextLower = ev.context.map(_.toLowerCase)
      
      // Check for read/write/save patterns in context
      val hasRead = contextLower.exists(_.contains("read"))
      val hasWrite = contextLower.exists(_.contains("write"))
      val hasSave = contextLower.exists(_.contains("save"))
      
      valueOpt match {
        case Some(value) =>
          // Heuristic: STRING_LITERAL + "read" in context → READ
          if (ev.evidenceType == "STRING_LITERAL" && hasRead) {
            reads = reads :+ value
          }
          // Heuristic: "write" or "save" in context → WRITE
          // (Works for STRING_LITERAL and other evidence types)
          else if (hasWrite || hasSave) {
            writes = writes :+ value
          }
          else {
            unknowns = unknowns :+ value
          }
        
        case None =>
          // No value to classify
          unknowns = unknowns :+ s"[${ev.evidenceType}]"
      }
    }
    
    // Deduplicate and preserve UNKNOWNs
    ClassifiedLineage(
      file = fileName,
      reads = reads.distinct,
      writes = writes.distinct,
      unknowns = unknowns.distinct
    )
  }
}

