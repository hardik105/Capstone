package agent.reasoner

import evidence.Evidence

/**
 * Builds a clean, minimal prompt for the LLM.
 *
 * IMPORTANT DESIGN PRINCIPLES:
 * - Only STRING_LITERAL evidence is included
 * - Context is merged into a single readable path
 * - No method-call or chain noise
 * - Prompt is deterministic and grounded
 */
object EvidencePromptBuilder {

  def buildPrompt(fileName: String, evidence: List[Evidence]): String = {

    // Keep ONLY string literals
    val stringEvidence = evidence.filter(_.evidenceType == "STRING_LITERAL")

    val sb = new StringBuilder

    sb.append(s"You are analyzing a Scala source file named: $fileName\n\n")
    sb.append(
      "Below are string literals found in the code, along with the method-call context " +
      "in which each string literal appears.\n\n"
    )

    sb.append("Observed string literals and their contexts:\n")

    if (stringEvidence.isEmpty) {
      sb.append("- (no string literals related to data operations were found)\n")
    } else {
      stringEvidence.foreach { ev =>
        val value = ev.value.getOrElse("")
        val context =
          if (ev.context.nonEmpty) ev.context.mkString(".")
          else "(no context)"

        sb.append(s"""- "$value" appeared in context: $context\n""")
      }
    }

    sb.append(
      """

Your task:
- Identify which string literals represent INPUT datasets (READ)
- Identify which string literals represent OUTPUT datasets (WRITE)

Guidelines:
- A string literal is a READ if its context indicates reading data
  (e.g., read, load, source, input).
- A string literal is a WRITE if its context indicates writing or saving data
  (e.g., write, save, output, sink).
- Ignore string literals unrelated to data movement
  (e.g., logging, printing, messages).
- If no datasets are found, return empty lists.
- Exclude technical operation modes and formats from dataset lists 
  (e.g., "overwrite", "append", "ignore", "parquet", "delta", "json").

CRITICAL INSTRUCTIONS (MUST FOLLOW EXACTLY):
- Output MUST be a single JSON object
- Output MUST start with '{' and end with '}'
- Do NOT include explanations
- Do NOT include markdown
- Do NOT include text before or after JSON
- Do NOT include comments
- Do NOT repeat the prompt
- If unsure, still return valid JSON with empty lists

FORBIDDEN STRINGS (NEVER INCLUDE THESE IN THE JSON LISTS):
- SaveModes: "overwrite", "append", "ignore", "errorifexists"
- File Formats: "parquet", "delta", "json", "csv", "text", "orc", "avro"
- Technical: "true", "false", "checkpoint", "path", "format", "mode"
- Non-Data: Any logging, printing, or status messages.

STRICT OUTPUT FORMAT:
{"reads": ["..."], "writes": ["..."]}

FAILURE TO FOLLOW THESE RULES IS A BUG.
"""
    )

    sb.toString()
  }
}
