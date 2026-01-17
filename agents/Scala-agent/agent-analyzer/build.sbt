name := "agent-analyzer"

version := "0.1.0"

scalaVersion := "2.13.12"

libraryDependencies += "org.scalameta" %% "scalameta" % "4.8.0"

// Add these lines to the bottom of your build.sbt
assembly / assemblyMergeStrategy := {
  case PathList("META-INF", xs @ _*) => MergeStrategy.discard
  case x => MergeStrategy.first
}

assembly / assemblyJarName := "scala-agent-assembly.jar"