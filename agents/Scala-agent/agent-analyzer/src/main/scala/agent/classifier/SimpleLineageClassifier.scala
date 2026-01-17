package agent.classifier

import evidence.Evidence

/**
 * SimpleLineageClassifier: Step 2 - Basic Rule-Based Classification
 * 
 * This is a VERY SIMPLE prototype classifier that converts Evidence into
 * basic lineage classifications (READ/WRITE/UNKNOWN).
 * 
 * LOGIC (naive, rule-based):
 * - If Evidence.context contains "read" AND value is literal → READ
 * - If Evidence.context contains "write" AND value is literal → WRITE
 * - Otherwise → UNKNOWN
 * 
 * IMPORTANT: This is a PROTOTYPE only. The logic is intentionally simple
 * and should be replaced with more sophisticated classification later.
 */
object SimpleLineageClassifier {
  
  /**
   * Classifies a list of Evidence objects into lineage categories.
   * Groups evidence by file and applies simple rules.
   */
  def classify(evidenceList: List[Evidence]): List[ClassifiedLineage] = {
    // Group evidence by file
    val evidenceByFile = evidenceList.groupBy(_.fileName)
    
    evidenceByFile.map { case (fileName, evidence) =>
      classifyFile(fileName, evidence)
    }.toList
  }
  
  /**
   * Classifies evidence for a single file.
   * Applies simple rule-based logic to categorize values.
   */
  private def classifyFile(fileName: String, evidence: List[Evidence]): ClassifiedLineage = {
    var reads: List[String] = List.empty
    var writes: List[String] = List.empty
    var unknowns: List[String] = List.empty
    
    evidence.foreach { ev =>
      // Extract value if present
      val valueOpt = ev.value
      
      // TODO: This logic is very naive - only checks for "read"/"write" in context
      // TODO: Should consider more sophisticated pattern matching (e.g., regex, exact matches)
      // TODO: Should handle method name patterns, not just substring matching
      val contextLower = ev.context.map(_.toLowerCase)  // Case-insensitive matching
      val hasRead = contextLower.exists(_.contains("read"))
      val hasWrite = contextLower.exists(_.contains("write"))
      val isLiteral = ev.origin == "LITERAL"
      
      valueOpt match {
        case Some(value) =>
          if (hasRead && isLiteral) {
            reads = reads :+ value
          } else if (hasWrite && isLiteral) {
            writes = writes :+ value
          } else {
            unknowns = unknowns :+ value
          }
        
        case None =>
          // No value to classify
          unknowns = unknowns :+ s"[${ev.evidenceType}]"
      }
    }
    
    ClassifiedLineage(
      file = fileName,
      reads = reads.distinct,      // Remove duplicates
      writes = writes.distinct,
      unknowns = unknowns.distinct
    )
  }
}

