object SimpleWrite {
  def main(args: Array[String]): Unit = {
    val df = spark.createDataFrame(Seq.empty)
    df.write.saveAsTable("customers_clean")
  }
}

