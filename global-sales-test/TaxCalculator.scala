object TaxCalculator {
  def main(args: Array[String]): Unit = {
    // READ: Regional Configs
    val config = Source.fromFile("configs/tax_rates.csv")
    // WRITE: Tax Reports
    val writer = new PrintWriter(new File("output/tax_report_2026.txt"))
    writer.write("Calculated Tax: $500")
    writer.close()
  }
}