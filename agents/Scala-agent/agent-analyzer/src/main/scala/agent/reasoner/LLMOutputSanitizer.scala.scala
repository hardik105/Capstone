package agent.reasoner

import evidence.Evidence
import agent.classifier.ClassifiedLineage

object LLMOutputSanitizer {

  def sanitize(
    fileName: String,
    rawResponse: String,
    evidence: List[Evidence]
  ): ClassifiedLineage = {

    val stringEvidence =
      evidence.filter(_.evidenceType == "STRING_LITERAL")

    val reads = stringEvidence.collect {
      case ev
        if ev.context.exists(_.toLowerCase.contains("read")) =>
        ev.value.get
    }.distinct

    val writes = stringEvidence.collect {
      case ev
        if ev.context.exists(_.toLowerCase.contains("write")) ||
           ev.context.exists(_.toLowerCase.contains("save")) =>
        ev.value.get
    }.distinct

    val all = stringEvidence.flatMap(_.value).distinct

    val unknowns =
      all.filterNot(v => reads.contains(v) || writes.contains(v))

    ClassifiedLineage(
      file = fileName,
      reads = reads,
      writes = writes,
      unknowns = unknowns
    )
  }
}
