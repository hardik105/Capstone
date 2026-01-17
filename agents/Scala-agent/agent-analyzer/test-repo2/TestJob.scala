object TestJob {
  def main(args: Array[String]): Unit = {
    val df = spark.read.table("users")
    df.write.saveAsTable("users_clean")
  }
}

