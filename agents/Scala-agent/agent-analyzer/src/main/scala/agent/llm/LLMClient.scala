package agent.llm

import scala.sys.process._
import scala.util.Try

object LLMClient {

  // Replace this with your actual API key or load it from an environment variable
  private val apiKey = sys.env.getOrElse("GOOGLE_API_KEY", "YOUR_API_KEY_HERE")
  
  // Using gemini-2.0-flash for high-speed lineage extraction
  private val model  = sys.env.getOrElse("SCALA_MODEL_NAME", "gemini-2.0-flash")
  private val apiUrl = s"https://generativelanguage.googleapis.com/v1beta/models/$model:generateContent?key=$apiKey"

  def call(prompt: String): String = {

    // Gemini expects a different JSON structure than Ollama
    val payload =
      s"""
         |{
         |  "contents": [{
         |    "parts":[{"text": ${jsonEscape(prompt)}}]
         |  }]
         |}
       """.stripMargin

    val cmd = Seq(
      "curl", "-s",
      "-X", "POST",
      apiUrl,
      "-H", "Content-Type: application/json",
      "-d", payload
    )

    val raw = Try(cmd.!!).getOrElse("")

    println("\n===== RAW GEMINI RESPONSE =====")
    println(raw)
    println("===============================\n")

    extractResponse(raw)
  }

  // Updated to parse Gemini's deeply nested JSON structure
  private def extractResponse(json: String): String = {
    // Regex targets: "text": "extracted_content"
    val pattern = """"text"\s*:\s*"([^"]*)"""".r
    pattern
      .findFirstMatchIn(json)
      .map(_.group(1)
        .replace("\\n", "\n")
        .replace("\\\"", "\"")
      )
      .getOrElse("")
  }

  private def jsonEscape(str: String): String =
    "\"" + str
      .replace("\\", "\\\\")
      .replace("\"", "\\\"")
      .replace("\n", "\\n") + "\""
}