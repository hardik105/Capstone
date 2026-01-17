package evidence

import scala.meta._

/**
 * EvidenceExtractor: Layer 3 - Evidence Extraction
 * 
 * Walks the AST and extracts raw evidence about code structure.
 * This does NOT make decisions about what the code means.
 * It only observes and records what it sees.
 */
object EvidenceExtractor {
  
  /**
   * Extracts evidence from a parsed Scala AST.
   * Returns a list of Evidence objects representing observations.
   */
  def extract(ast: Source, fileName: String): List[Evidence] = {
    var evidenceList: List[Evidence] = List.empty
    
    /**
     * Recursively traverses the AST tree and collects evidence.
     * @param tree The AST node to traverse
     * @param parentContext The context from the parent method call (if any)
     */
    def traverse(tree: Tree, parentContext: List[String] = List.empty): Unit = {
      tree match {
        // Method calls: Term.Apply represents method invocations
        case Term.Apply(fun, args) =>
          val methodName = extractMethodName(fun)
          val context = buildContext(fun)
          
          evidenceList = evidenceList :+ Evidence(
            fileName = fileName,
            location = getLocation(tree),
            evidenceType = "METHOD_CALL",
            value = Some(methodName),
            origin = "UNKNOWN", // We don't know if it's a literal or variable yet
            context = context
          )
          
          // Traverse arguments with the parent method context
          // This links STRING_LITERAL arguments to their parent method calls
          args.foreach(arg => traverse(arg, context))
          traverse(fun, parentContext)
        
        // String literals: Lit.String represents string literals
        // If found as an argument to a method call, attach parent context
        case Lit.String(value) =>
          evidenceList = evidenceList :+ Evidence(
            fileName = fileName,
            location = getLocation(tree),
            evidenceType = "STRING_LITERAL",
            value = Some(value),
            origin = "LITERAL",
            context = parentContext  // Link to parent method call context
          )
        
        // Method call chains: Term.Select represents selections like foo.bar
        case Term.Select(qual, name) =>
          val chain = extractCallChain(tree)
          if (chain.nonEmpty) {
            evidenceList = evidenceList :+ Evidence(
              fileName = fileName,
              location = getLocation(tree),
              evidenceType = "METHOD_CALL_CHAIN",
              value = Some(chain),
              origin = "UNKNOWN",
              context = List.empty
            )
          }
          traverse(qual, parentContext)
        
        // Recursively traverse all children
        case _ =>
          tree.children.foreach(child => traverse(child, parentContext))
      }
    }
    
    traverse(ast)
    evidenceList
  }
  
  /**
   * Extracts a method name from a function tree.
   * Handles different forms like simple names, selects, etc.
   */
  private def extractMethodName(fun: Tree): String = {
    fun match {
      case Term.Name(name) => name
      case Term.Select(_, name) => name.value
      case _ => fun.toString.takeWhile(_ != '(')
    }
  }
  
  /**
   * Builds context information from a function tree.
   * Returns a list of method names in the call chain.
   */
  private def buildContext(fun: Tree): List[String] = {
    fun match {
      case Term.Name(name) => List(name)
      case Term.Select(qual, name) => buildContext(qual) :+ name.value
      case _ => List.empty
    }
  }
  
  /**
   * Extracts a full call chain from a Term.Select tree.
   * Returns a string like "foo.bar.baz"
   */
  private def extractCallChain(tree: Tree): String = {
    tree match {
      case Term.Select(qual, name) =>
        val qualChain = extractCallChain(qual)
        if (qualChain.isEmpty) name.value else s"$qualChain.${name.value}"
      case Term.Name(name) => name
      case _ => ""
    }
  }
  
  /**
   * Safely extracts location information from a tree.
   * Returns line number if available, "unknown" otherwise.
   */
  private def getLocation(tree: Tree): String = {
    try {
      if (tree.pos != null && tree.pos != Position.None) {
        tree.pos.startLine.toString
      } else {
        "unknown"
      }
    } catch {
      case _: Exception => "unknown"
    }
  }
}

