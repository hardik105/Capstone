package agent.reasoner

import evidence.Evidence
import agent.classifier.ClassifiedLineage

/**
 * LLMReasoningEngine
 *
 * Interface for any LLM-powered lineage reasoner.
 * Takes extracted Evidence and produces final lineage.
 */
trait LLMReasoningEngine {

  def reason(evidence: List[Evidence]): List[ClassifiedLineage]

}
