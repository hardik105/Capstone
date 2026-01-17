package parser

import scala.meta._

/**
 * ScalaAstParser: Layer 2 - AST Parsing
 * 
 * Converts Scala source code (text) into a scala.meta AST.
 * This layer is responsible for parsing only - no interpretation.
 */
object ScalaAstParser {
  
  /**
   * Parses Scala source code into a scala.meta Source AST.
   * Returns None if parsing fails.
   */
  def parse(content: String): Option[Source] = {
    try {
      val source = content.parse[Source]
      source match {
        case Parsed.Success(tree) => Some(tree)
        case Parsed.Error(_, message, _) =>
          println(s"Parse error: $message")
          None
      }
    } catch {
      case e: Exception =>
        println(s"Exception during parsing: ${e.getMessage}")
        None
    }
  }
}

