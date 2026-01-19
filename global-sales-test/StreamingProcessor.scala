object StreamAgent {
  // READ: Kafka Topic "order-events"
  val stream = spark.readStream.format("kafka").option("subscribe", "order-events").load()
  // WRITE: Cassandra Table "realtime.orders"
  stream.writeStream.outputMode("append").table("realtime.orders")
}