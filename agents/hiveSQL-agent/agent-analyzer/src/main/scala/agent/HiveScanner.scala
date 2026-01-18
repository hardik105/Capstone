package hive.scanner

import java.io.File
import scala.io.Source

object HiveScanner {
  /**
   * Recursively scans for SQL and HQL files and reads their content.
   */
  def scan(directoryPath: String): Map[String, String] = {
    val dir = new File(directoryPath)
    if (!dir.exists || !dir.isDirectory) return Map.empty

    def listFiles(d: File): List[File] = {
      val (dirs, files) = d.listFiles.partition(_.isDirectory)
      files.toList.filter(f => f.getName.endsWith(".sql") || f.getName.endsWith(".hql")) ++ 
      dirs.flatMap(listFiles)
    }

    listFiles(dir).map { file =>
      file.getName -> Source.fromFile(file).getLines().mkString("\n")
    }.toMap
  }
}