import scala.annotation.tailrec

case class Node(name: String, children: List[Node])

object MetadataCrawler {
  
  // Complex feature: Tail-recursive search through nested metadata
  @tailrec
  def findLeafNode(nodes: List[Node], target: String): Option[Node] = {
    nodes match {
      case Nil => None
      case head :: tail if head.name == target => Some(head)
      case head :: tail => findLeafNode(head.children ++ tail, target)
    }
  }

  def logLineage(root: Node)(implicit spark: SparkSession): Unit = {
    // Simulated Write to an Audit table
    val lineageData = Seq((root.name, "MAPPED"))
    import spark.implicits._
    lineageData.toDF("node_name", "status").write.insertInto("audit.lineage_logs")
  }
}