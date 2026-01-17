import org.apache.spark.sql.functions._

// Complex feature: Type Class Pattern
trait Validator[T] {
  def isValid(value: T): Boolean
}

object DataQualityGuard {
  implicit val stringValidator: Validator[String] = (s: String) => s.nonEmpty && s.length < 255

  // Higher-order function with Context Bound
  def validateAndWrite[T: Validator](tableName: String, data: List[T])(implicit spark: SparkSession): Unit = {
    val validator = implicitly[Validator[T]]
    val filteredData = data.filter(validator.isValid)

    import spark.implicits._
    val ds = spark.createDataset(filteredData)
    
    // Logic: Reading from staging to check delta, then writing
    val staging = spark.read.table("staging_events")
    ds.join(staging, "id").write.saveAsTable("validated_events")
  }
}