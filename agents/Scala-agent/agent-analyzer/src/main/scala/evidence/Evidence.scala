package evidence

/**
 * Evidence represents raw observations extracted from Scala source code.
 * This is NOT a decision about data lineage or operations - it's just evidence.
 * 
 * The agent collects evidence, and later layers will interpret it.
 */
case class Evidence(
  fileName: String,           // Name of the source file
  location: String,          // Line number or "unknown" if not available
  evidenceType: String,      // Type of evidence: METHOD_CALL, STRING_LITERAL, etc.
  value: Option[String],     // The actual value if present (e.g., string literal content)
  origin: String,            // Where the value came from: LITERAL, VARIABLE, UNKNOWN
  context: List[String]      // Method names or other contextual hints
)

