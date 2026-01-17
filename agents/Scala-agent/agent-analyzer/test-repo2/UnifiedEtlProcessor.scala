import org.apache.spark.sql.{Dataset, SparkSession}

trait Transformer[A, B] {
  def transform(ds: Dataset[A]): Dataset[B]
}

case class Transaction(id: String, amount: Double, currency: String)
case class Payment(paymentId: String, value: BigDecimal, status: String)

object UnifiedEtlProcessor {
  // Complex feature: Implicit Spark Session and Type Bounds
  def run[T <: Transaction](path: String)(implicit spark: SparkSession): Unit = {
    import spark.implicits._

    val rawData: Dataset[Transaction] = spark.read.table("raw_transactions").as[Transaction]

    // Functional transformation using pattern matching
    val processed = rawData.map {
      case Transaction(id, amt, "USD") => Payment(id, BigDecimal(amt), "CLEARED")
      case Transaction(id, amt, _)     => Payment(id, BigDecimal(amt), "PENDING_FX")
    }

    processed.write.mode("append").saveAsTable("processed_payments")
  }
}