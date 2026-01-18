package agent

import hive.scanner.HiveScanner
import agent.llm.LLMClient
import java.io.{PrintWriter, File}

/**
 * HiveLineageAgent: Performs batch "One-Shot" lineage analysis on HiveSQL scripts.
 * Updated to match the "Pure Text" format of the Scala agent.
 */
object HiveLineageAgent {

  def main(args: Array[String]): Unit = {
    if (args.length != 1) {
      println("Usage: sbt \"run <directory-path>\"")
      sys.exit(1)
    }

    val directoryPath = args(0)
    val scripts = HiveScanner.scan(directoryPath)

    if (scripts.isEmpty) {
      println("No HiveSQL (.sql/.hql) files found.")
      return
    }

    val batchPrompt = buildPrompt(scripts)

    println("\n===== HIVE BATCH PROMPT =====")
    println(batchPrompt)
    
    // Call LLM
    val response = LLMClient.call(batchPrompt)

    println("\n===== HIVE BATCH RESPONSE =====")
    println(response)

    if (response.nonEmpty) {
      // Clean up markdown if Gemini adds it
      val cleanOutput = response
        .replaceAll("```text", "")
        .replaceAll("```", "")
        .trim

      println("\n==== AGENT REASONING ====")
      println(cleanOutput)

      // Save the PURE text to the file
      saveOutputFile("lineage-output.txt", cleanOutput)
      println(s"\n✅ Pure lineage results saved to lineage-output.txt")
    } else {
      println("❌ Error: Received empty response from Gemini.")
    }
  }

  private def saveOutputFile(path: String, content: String): Unit = {
    val writer = new PrintWriter(new File(path))
    try {
      writer.write(content)
    } finally {
      writer.close()
    }
  }

  private def buildPrompt(scripts: Map[String, String]): String = {
    val scriptDetails = scripts.map { case (name, code) =>
      s"FILE: $name\nCODE:\n$code"
    }.mkString("\n---\n")

    s"""
       |Analyze these HiveSQL files and identify the READ and WRITE tables.
       |
       |$scriptDetails
       |
       |Your task:
       |- Identify READ datasets (FROM, JOIN, subqueries).
       |- Identify WRITE datasets (INSERT INTO, CREATE TABLE AS).
       |- Exclude temporary views and local CTEs.
       |
       |CRITICAL INSTRUCTION:
       |RETURN ONLY the following plain text format for each file. 
       |Do NOT include JSON, markdown, or explanations.
       |
       |STRICT OUTPUT FORMAT:
       |File: filename.sql
       |READS: table1, table2
       |WRITES: table3
       |
       |File: next_file.hql
       |READS: table_a
       |WRITES: table_b
       |""".stripMargin
  }
}