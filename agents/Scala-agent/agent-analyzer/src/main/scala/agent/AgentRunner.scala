package agent

import scanner.FileScanner
import parser.ScalaAstParser
import evidence.{Evidence, EvidenceExtractor}
import agent.classifier.ClassifiedLineage
import agent.reasoner.{
  LineageReasoningEngine,
  RuleBasedLineageReasoner,
  LLMBasedLineageReasoner
}

/**
 * AgentRunner: Orchestrates the multi-layer agent pipeline
 *
 * Pipeline:
 * 1. FileScanner        → Finds and reads Scala files
 * 2. ScalaAstParser     → Parses Scala source into AST
 * 3. EvidenceExtractor → Extracts raw Evidence from AST
 * 4. LineageReasoningEngine → Reasons over Evidence to infer lineage
 *
 * IMPORTANT:
 * - This file contains NO business logic
 * - It only wires components together
 */
object AgentRunner {

  /**
   * Container for full agent output.
   * Includes both raw evidence (for explainability)
   * and inferred lineage (for user-facing results).
   */
  case class AgentResult(
    evidence: List[Evidence],
    lineage: List[ClassifiedLineage]
  )

  /**
   * Runs the agent pipeline on a directory path.
   */
  def run(directoryPath: String): AgentResult = {
    println(s"\n[AgentRunner] Scanning directory: $directoryPath")

    // --------------------------------------------------
    // Layer 1: File Ingestion
    // --------------------------------------------------
    val files = FileScanner.scanDirectory(directoryPath)
    println(s"[AgentRunner] Found ${files.length} Scala file(s)")

    // --------------------------------------------------
    // Layer 2 & 3: AST Parsing + Evidence Extraction
    // --------------------------------------------------
    val allEvidence: List[Evidence] = files.flatMap { file =>
      println(s"\n[AgentRunner] Processing file: ${file.fileName}")

      ScalaAstParser.parse(file.content) match {
        case Some(ast) =>
          val evidence = EvidenceExtractor.extract(ast, file.fileName)
          println(s"[AgentRunner] Extracted ${evidence.length} evidence item(s)")
          evidence

        case None =>
          println(s"[AgentRunner] Failed to parse ${file.fileName}, skipping")
          Nil
      }
    }

    // --------------------------------------------------
    // Layer 4: Agent Reasoning (THE BRAIN)
    // --------------------------------------------------
    val useLLM = sys.env.get("USE_LLM").contains("true")

    val reasoningEngine: LineageReasoningEngine =
      if (useLLM) {
        println("[AgentRunner] Using LLM-based reasoning engine")
        LLMBasedLineageReasoner
      } else {
        println("[AgentRunner] Using rule-based reasoning engine")
        RuleBasedLineageReasoner
      }

    println(s"\n[AgentRunner] Reasoning over evidence...")
    val lineage: List[ClassifiedLineage] =
      reasoningEngine.reason(allEvidence)

    println(s"[AgentRunner] Produced lineage for ${lineage.length} file(s)")

    // --------------------------------------------------
    // TEMPORARY DEBUG OUTPUT (INTENTIONAL)
    // --------------------------------------------------
    val evidenceByFile = allEvidence.groupBy(_.fileName)

    evidenceByFile.foreach { case (fileName, fileEvidence) =>
      println(s"\n==== RAW EVIDENCE ($fileName) ====")
      fileEvidence.foreach { ev =>
        val valueStr   = ev.value.getOrElse("NONE")
        val contextStr =
          if (ev.context.nonEmpty) ev.context.mkString(".") else "(no context)"

        println(
          s"  ${ev.evidenceType} | value: $valueStr | context: $contextStr"
        )
      }
    }

    println("\n==== AGENT REASONING ====")
    lineage.foreach { lin =>
      println(s"\nFile: ${lin.file}")

      println("READS:")
      if (lin.reads.nonEmpty) lin.reads.foreach(r => println(s"  - $r"))
      else println("  (none)")

      println("WRITES:")
      if (lin.writes.nonEmpty) lin.writes.foreach(w => println(s"  - $w"))
      else println("  (none)")

      println("UNKNOWNS:")
      if (lin.unknowns.nonEmpty) lin.unknowns.foreach(u => println(s"  - $u"))
      else println("  (none)")
    }

    AgentResult(
      evidence = allEvidence,
      lineage  = lineage
    )
  }
}
