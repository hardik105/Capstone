package agent.classifier

/**
 * ClassifiedLineage: Simple lineage classification result
 * 
 * This is a PROTOTYPE model for basic lineage classification.
 * It groups evidence values into READ, WRITE, or UNKNOWN categories.
 * 
 * TODO: This is a naive classification - replace with more sophisticated logic later.
 */
case class ClassifiedLineage(
  file: String,              // Source file name
  reads: List[String],       // Values classified as READ operations
  writes: List[String],      // Values classified as WRITE operations
  unknowns: List[String]     // Values that couldn't be classified
)

