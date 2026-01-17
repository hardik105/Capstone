object SimpleRead {
  def main(args: Array[String]): Unit = {
    val df = spark.read.table("customers")
  }
}

