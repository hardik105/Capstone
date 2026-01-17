object WriteOnly {
  def main(args: Array[String]): Unit = {
    val df = spark.createDataFrame(Seq.empty)
    df.write.saveAsTable("empty_table")
  }
}

