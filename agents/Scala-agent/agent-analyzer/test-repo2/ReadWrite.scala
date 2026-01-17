object ReadWrite {
  def main(args: Array[String]): Unit = {
    val df = spark.read.table("orders")
    df.write.saveAsTable("orders_clean")
  }
}