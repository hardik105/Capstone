package agent

import evidence.Evidence
import agent.classifier.ClassifiedLineage
import agent.output.LineageTextWriter

/**
 * Main: Entry point for the static analysis agent
 * 
 * Usage: sbt "run <directory-path>"
 * 
 * The agent scans Scala files, parses them, extracts evidence,
 * and classifies it into basic lineage categories.
 */
object Main {
  
  def main(args: Array[String]): Unit = {
    if (args.length != 1) {
      println("Usage: sbt \"run <directory-path>\"")
      println("Example: sbt \"run /path/to/scala/files\"")
      sys.exit(1)
    }
    
    val directoryPath = args(0)
    
    val separator = "=" * 60  // StringOps provides * method
    println(separator)
    println("Static Analysis Agent - Evidence Extraction & Classification")
    println(separator)
    
    try {
      // Run the agent pipeline
      val result = AgentRunner.run(directoryPath)
      // Write lineage output to text file
      LineageTextWriter.write(
        outputPath = "lineage-output.txt",
        results = result.lineage
      )

println(s"\nLineage written to lineage-output.txt")

      
      // Print raw evidence
      println("\n" + separator)
      println("RAW EVIDENCE")
      println(separator)
      println(s"Total Evidence Extracted: ${result.evidence.length}")
      
      if (result.evidence.isEmpty) {
        println("No evidence found.")
      } else {
        result.evidence.foreach { ev =>
          printEvidence(ev)
        }
      }
      
      // Print classified lineage
      println("\n" + separator)
      println("CLASSIFIED LINEAGE")
      println(separator)
      println(s"Total Files Classified: ${result.lineage.length}")
      
      if (result.lineage.isEmpty) {
        println("No lineage classification available.")
      } else {
        result.lineage.foreach { lineage =>
          printLineage(lineage)
        }
      }
      
    } catch {
      case e: Exception =>
        println(s"Error: ${e.getMessage}")
        e.printStackTrace()
        sys.exit(1)
    }
  }
  
  /**
   * Prints a single Evidence object in a readable format.
   */
  private def printEvidence(ev: Evidence): Unit = {
    println(s"\n[${ev.evidenceType}] ${ev.fileName}:${ev.location}")
    ev.value.foreach { v =>
      println(s"  Value: $v")
    }
    println(s"  Origin: ${ev.origin}")
    if (ev.context.nonEmpty) {
      println(s"  Context: ${ev.context.mkString(" -> ")}")
    }
  }
  
  /**
   * Prints a ClassifiedLineage object in a readable format.
   */
  private def printLineage(lineage: ClassifiedLineage): Unit = {
    println(s"\nFile: ${lineage.file}")
    
    if (lineage.reads.nonEmpty) {
      println(s"  READS (${lineage.reads.length}):")
      lineage.reads.foreach { read =>
        println(s"    - $read")
      }
    }
    
    if (lineage.writes.nonEmpty) {
      println(s"  WRITES (${lineage.writes.length}):")
      lineage.writes.foreach { write =>
        println(s"    - $write")
      }
    }
    
    if (lineage.unknowns.nonEmpty) {
      println(s"  UNKNOWNS (${lineage.unknowns.length}):")
      lineage.unknowns.foreach { unknown =>
        println(s"    - $unknown")
      }
    }
    
    if (lineage.reads.isEmpty && lineage.writes.isEmpty && lineage.unknowns.isEmpty) {
      println("  (No classified values)")
    }
  }
}