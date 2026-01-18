name := "hive-lineage-agent"
version := "1.0"
scalaVersion := "2.12.15"

libraryDependencies ++= Seq(
  "io.github.cdimascio" % "dotenv-java" % "2.2.0" // Loads .env locally
)