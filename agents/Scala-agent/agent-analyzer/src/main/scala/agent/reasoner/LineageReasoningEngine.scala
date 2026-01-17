package agent.reasoner

import evidence.Evidence
import agent.classifier.ClassifiedLineage

/**
 * LineageReasoningEngine: Interface for lineage reasoning components.
 * 
 * This trait allows the system to swap different reasoning implementations
 * (e.g., RuleBasedLineageReasoner, LLMReasoner) without changing other code.
 * 
 * Input: List[Evidence] - Raw evidence extracted from source code
 * Output: List[ClassifiedLineage] - Classified lineage per file
 */
trait LineageReasoningEngine {
  /**
   * Reasons over Evidence objects to produce lineage classifications.
   * 
   * @param evidenceList List of evidence extracted from source files
   * @return List of classified lineage, grouped by file
   */
  def reason(evidenceList: List[Evidence]): List[ClassifiedLineage]
}

