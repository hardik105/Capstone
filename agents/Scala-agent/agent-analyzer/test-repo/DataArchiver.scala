object DataArchiver {
  def archive() = {
    spark.read.table("enriched_transactions").write.saveAsTable("archive_transactions_2025")
    spark.read.table("audit_logs").write.saveAsTable("archive_audit_history")
  }
}