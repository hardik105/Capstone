package scanner

import java.io.File
import scala.io.Source

/**
 * FileScanner: Layer 1 - File Ingestion
 * 
 * Recursively scans a directory for Scala source files and reads their content.
 * This is the entry point for the agent - it finds and loads source files.
 */
object FileScanner {
  
  case class ScannedFile(
    fileName: String,
    path: String,
    content: String
  )
  
  /**
   * Scans a directory recursively for .scala files.
   * Returns a list of ScannedFile objects containing file metadata and content.
   */
  def scanDirectory(directoryPath: String): List[ScannedFile] = {
    val dir = new File(directoryPath)
    
    if (!dir.exists() || !dir.isDirectory) {
      throw new IllegalArgumentException(s"Directory does not exist: $directoryPath")
    }
    
    scanDirectoryRecursive(dir)
  }
  
  /**
   * Recursively scans a directory and its subdirectories.
   * Only includes files with .scala extension.
   */
  private def scanDirectoryRecursive(dir: File): List[ScannedFile] = {
    val files = dir.listFiles()
    
    if (files == null) {
      return List.empty
    }
    
    files.flatMap { file =>
      if (file.isDirectory) {
        scanDirectoryRecursive(file)
      } else if (file.getName.endsWith(".scala")) {
        try {
          val content = Source.fromFile(file).mkString
          Some(ScannedFile(
            fileName = file.getName,
            path = file.getAbsolutePath,
            content = content
          ))
        } catch {
          case e: Exception =>
            println(s"Warning: Could not read file ${file.getAbsolutePath}: ${e.getMessage}")
            None
        }
      } else {
        None
      }
    }.toList
  }
}

