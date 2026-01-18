package agent.llm

import io.github.cdimascio.dotenv.Dotenv
import scala.sys.process._
import scala.util.Try

object LLMClient {
  private val dotenv = Dotenv.configure()
    .directory(".") // Explicitly looks in agent-analyzer/
    .ignoreIfMalformed()
    .ignoreIfMissing()
    .load()

  private val apiKey = dotenv.get("GOOGLE_API_KEY", "NOT_FOUND")
  private val model  = dotenv.get("HIVE_MODEL_NAME", "gemini-2.0-flash")
  private val apiUrl = s"https://generativelanguage.googleapis.com/v1beta/models/$model:generateContent?key=$apiKey"

  def call(prompt: String): String = {
    // DEBUG: Check if key is loaded (shows first 4 chars only for safety)
    val keyStatus = if (apiKey == "NOT_FOUND") "❌ MISSING" else s"✅ LOADED (${apiKey.take(4)}...)"
    println(s"[LLMClient] Using Model: $model | API Key: $keyStatus")

    val payload = s"""{"contents": [{"parts":[{"text": ${jsonEscape(prompt)}}]}]}"""

    val cmd = Seq("curl", "-s", "-X", "POST", apiUrl, "-H", "Content-Type: application/json", "-d", payload)

    val raw = Try(cmd.!!).getOrElse("")

    if (raw.contains("error")) {
      println(s"\n❌ API ERROR DETECTED:\n$raw")
      return ""
    }

    extractResponse(raw)
  }

  private def extractResponse(json: String): String = {
    // More flexible regex to find the 'text' field contents
    val pattern = """(?s)"text"\s*:\s*"(.*?)(?<!\\)"""".r
    pattern.findFirstMatchIn(json) match {
      case Some(m) => m.group(1).replace("\\n", "\n").replace("\\\"", "\"")
      case None => 
        println("⚠️ Parser Warning: Could not find 'text' block in JSON response.")
        ""
    }
  }

  private def jsonEscape(str: String): String =
    "\"" + str.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n") + "\""
}