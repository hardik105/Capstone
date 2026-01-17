package agent.output

import agent.classifier.ClassifiedLineage
import java.nio.file.{Files, Paths}
import java.nio.charset.StandardCharsets

object LineageTextWriter {

  def write(
      outputPath: String,
      results: List[ClassifiedLineage]
  ): Unit = {

    val content = results.map { r =>
      // Define keywords to exclude from the lineage lists
      val toExclude = Set("overwrite", "append")

      // Filter the reads and writes to remove identified keywords
      val filteredReads = r.reads.filterNot(item => toExclude.contains(item.toLowerCase))
      val filteredWrites = r.writes.filterNot(item => toExclude.contains(item.toLowerCase))

      val reads =
        if (filteredReads.nonEmpty) filteredReads.mkString(", ")
        else "(none)"

      val writes =
        if (filteredWrites.nonEmpty) filteredWrites.mkString(", ")
        else "(none)"

      s"""File: ${r.file}
READS: $reads
WRITES: $writes
"""
    }.mkString("\n")

    Files.write(
      Paths.get(outputPath),
      content.getBytes(StandardCharsets.UTF_8)
    )
  }
}