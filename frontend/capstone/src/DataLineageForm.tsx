"use client";
import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import * as dagreD3 from "dagre-d3";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SparklesCore } from "@/ui/sparkles";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Clock,
  CheckCircle,
  Folder,
  FileText,
  Zap,
  X,
  Globe,
  BarChart3,
  ArrowLeft,
  Maximize2,
  Minimize2,
} from "lucide-react";

const ANALYSIS_PHASES = [
  { time: 0, message: "Parsing source code and creating AST trees..." },
  { time: 9, message: "Optimizing context and passing to LLM Agents..." },
  {
    time: 13,
    message: "Agents generating lineage output and analyzing flows...",
  },
  { time: 18, message: "Synthesizing results and creating project summary..." },
  { time: 25, message: "Finalizing graph visualization..." },
];

interface FileDetail {
  filename: string;
  summary?: string;
  reads?: string[];
  writes?: string[];
}

interface LineageItem {
  file: string;
  reads: string[];
  writes: string[];
}

interface Highlights {
  readLines: number[];
  writeLines: number[];
}

interface AnalysisData {
  job_id?: string;
  status?: string;
  error?: string;
  projectSummary?: string;
  fileDetails?: FileDetail[];
  lineage?: LineageItem[];
  sourceFiles?: { [key: string]: string };
  highlights?: { [key: string]: Highlights };
}

const DataLineageForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [fileQueue, setFileQueue] = useState<File[]>([]);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const graphContainerRef = useRef<HTMLDivElement>(null);
  const [globalData, setGlobalData] = useState<AnalysisData | null>(null);
  const [statusMessage, setStatusMessage] = useState(
    ANALYSIS_PHASES[0].message,
  );
  const [loading, setLoading] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [completionMessage, setCompletionMessage] = useState("");
  const [enhancedAnalysis, setEnhancedAnalysis] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("auto");
  const [repoUrl, setRepoUrl] = useState("");
  const [resultReady, setResultReady] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalFilename, setModalFilename] = useState("");
  const [modalContent, setModalContent] = useState<string[]>([]);
  const [modalHighlights, setModalHighlights] = useState<Highlights>({
    readLines: [],
    writeLines: [],
  });

  const svgRef = useRef<SVGSVGElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const styleId = "lineage-graph-styles";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.innerHTML = `
        .node.file rect { fill: #3182ce !important; stroke: #2b6cb0; stroke-width: 1.5px; }
        .node.table rect { fill: #38a169 !important; stroke: #2f855a; stroke-width: 1.5px; }
        .node text { fill: #ffffff !important; font-weight: 600; font-family: 'Inter', sans-serif; font-size: 12px; }
        .edgePath path { stroke: #a0aec0 !important; stroke-width: 2px !important; fill: none; }
        .edgeLabel text { fill: #e5e7eb !important; font-size: 10px; font-weight: bold; }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const addToQueue = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files);
    setFileQueue((prev) => {
      const combined = [...prev];
      newFiles.forEach((file) => {
        if (
          !combined.some((f) => f.name === file.name && f.size === file.size)
        ) {
          combined.push(file);
        }
      });
      return combined;
    });
  };

  const removeFile = (index: number) => {
    setFileQueue((prev) => prev.filter((_, i) => i !== index));
  };

  const getButtonText = () => {
    if (fileQueue.length > 0) {
      return `Analyze ${fileQueue.length} Files`;
    } else if (repoUrl.trim() !== "") {
      return "Analyze Repository";
    }
    return "Analyze 0 Files";
  };

  const isButtonDisabled = fileQueue.length === 0 && repoUrl.trim() === "";

  const pollStatus = async (job_id: string, startTime: number) => {
    const poll = setInterval(async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/status/${job_id}`);
        const data: AnalysisData = await res.json();

        if (data.status === "completed") {
          clearInterval(poll);
          if (timerRef.current) clearInterval(timerRef.current);
          setGlobalData(data);
          setLoading(false);
          setResultReady(true);

          const totalTime = Math.round((Date.now() - startTime) / 1000);
          setCompletionMessage(
            `Analysis Completed! \n Total Time: ${totalTime} seconds`,
          );
        } else if (data.status === "failed") {
          clearInterval(poll);
          if (timerRef.current) clearInterval(timerRef.current);
          setLoading(false);
          alert("Analysis failed: " + (data.error || "Unknown error"));
        }
      } catch (e) {
        console.error("Polling error:", e);
      }
    }, 3000);
  };

  const handleUpload = async () => {
    setLoading(true);
    setResultReady(false);
    setCompletionMessage("");
    setGlobalData(null);
    setElapsedTime(0);
    setStatusMessage(ANALYSIS_PHASES[0].message);

    const startTime = Date.now();
    timerRef.current = setInterval(() => {
      const seconds = Math.round((Date.now() - startTime) / 1000);
      setElapsedTime(seconds);

      const currentPhase = [...ANALYSIS_PHASES]
        .reverse()
        .find((phase) => seconds >= phase.time);

      if (currentPhase) {
        setStatusMessage(currentPhase.message);
      }
    }, 1000);

    const formData = new FormData();
    let apiUrl = `http://127.0.0.1:8000/analyze/${selectedLanguage}?enhanced=${enhancedAnalysis}`;

    if (repoUrl.trim() !== "") {
      apiUrl += `&repo_url=${encodeURIComponent(repoUrl)}`;
    } else {
      fileQueue.forEach((f) => formData.append("files", f));
    }

    try {
      const fetchOptions: RequestInit = {
        method: "POST",
        body: repoUrl.trim() !== "" ? null : formData,
      };

      const res = await fetch(apiUrl, fetchOptions);
      if (!res.ok) throw new Error("Server error occurred");

      const { job_id } = await res.json();
      pollStatus(job_id, startTime);
    } catch (e) {
      if (timerRef.current) clearInterval(timerRef.current);
      setLoading(false);
      alert("Upload failed: " + (e as Error).message);
    }
  };

  const openCodeViewer = (filename: string) => {
    const content = globalData?.sourceFiles?.[filename];
    const highlights = globalData?.highlights?.[filename] || {
      readLines: [],
      writeLines: [],
    };

    if (!content) {
      alert("Source code not available for this file.");
      return;
    }

    setModalFilename(filename);
    setModalContent(content.split("\n"));
    setModalHighlights(highlights);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  useEffect(() => {
    // Only attempt to render if we have data AND we are physically on Step 3
    if (currentStep === 3 && globalData?.lineage && svgRef.current) {
      // Small timeout (100ms) ensures the SVG container is fully mounted and has width/height
      const timer = setTimeout(() => {
        console.log("🎨 Rendering Graph...");
        renderGraph(globalData);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [globalData, currentStep]); // Added currentStep here to trigger when you switch tabs

  const renderGraph = (data: AnalysisData) => {
    if (!svgRef.current || !data.lineage) return;

    const g = new dagreD3.graphlib.Graph().setGraph({
      rankdir: "LR",
      marginx: 40,
      marginy: 40,
      nodesep: 60,
      ranksep: 120,
    });

    data.lineage.forEach((item) => {
      g.setNode(item.file, {
        label: item.file,
        class: "file",
        rx: 8,
        ry: 8,
        padding: 15,
      });

      item.reads.forEach((t) => {
        g.setNode(t, { label: t, class: "table", rx: 12, ry: 12, padding: 10 });
        g.setEdge(t, item.file, {
          label: "READ",
          curve: d3.curveBasis,
          style: "stroke: #cbd5e0; fill: none; stroke-width: 2px;",
        });
      });

      item.writes.forEach((t) => {
        g.setNode(t, { label: t, class: "table", rx: 12, ry: 12, padding: 10 });
        g.setEdge(item.file, t, {
          label: "WRITE",
          curve: d3.curveBasis,
          style: "stroke: #cbd5e0; fill: none; stroke-width: 2px;",
        });
      });
    });

    const svg = d3.select(svgRef.current);
    const inner = svg.select("g");
    inner.selectAll("*").remove();

    const render = new dagreD3.render();
    render(inner as any, g as any);

    const zoom = d3.zoom().on("zoom", (event) => {
      inner.attr("transform", event.transform);
    });
    svg.call(zoom as any);

    const initialScale = 0.75;
    svg.call(
      zoom.transform as any,
      d3.zoomIdentity.translate(50, 50).scale(initialScale),
    );
  };

  return (
    <div className="relative min-h-screen bg-black text-white p-6 md:p-10">
      <div className="absolute inset-0 w-full h-full z-0">
        <SparklesCore
          id="sparkles"
          background="rgba(0, 0, 0, 0)"
          particleColor="#ffffff"
          particleDensity={80}
          speed={2}
          minSize={0.8}
          maxSize={2}
        />
      </div>
      <div className="relative z-10 max-w-4xl mx-auto">
        <Card className="mb-6 bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white">
              Multi-Agent Data Lineage
            </CardTitle>
            <CardDescription className="text-neutral-400">
              Add project folders, individual files, or a Git repository URL.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Progress Indicator */}
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center gap-2">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${currentStep === 1 ? "bg-white text-black" : "bg-neutral-700 text-white"}`}
                >
                  1
                </div>
                <div
                  className={`w-24 h-1 ${currentStep >= 2 ? "bg-white" : "bg-neutral-700"}`}
                ></div>
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${currentStep === 2 ? "bg-white text-black" : currentStep > 2 ? "bg-white text-black" : "bg-neutral-700 text-neutral-400"}`}
                >
                  2
                </div>
                <div
                  className={`w-24 h-1 ${currentStep === 3 ? "bg-white" : "bg-neutral-700"}`}
                ></div>
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${currentStep === 3 ? "bg-white text-black" : "bg-neutral-700 text-neutral-400"}`}
                >
                  3
                </div>
              </div>
            </div>

            {/* Step 1: Language Selection */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-white">
                    Select Target Language
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: "auto", label: "Auto-Detect (Hybrid)" },
                      { value: "scala", label: "Scala" },
                      { value: "hivesql", label: "HiveSQL" },
                      { value: "pyspark", label: "PySpark" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setSelectedLanguage(option.value)}
                        className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                          selectedLanguage === option.value
                            ? "bg-white text-black border-2 border-white shadow-lg shadow-white/30"
                            : "bg-neutral-800 text-white border-2 border-neutral-700 hover:border-neutral-600 hover:bg-neutral-700"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  className="w-full bg-white text-black hover:bg-neutral-200"
                  onClick={() => setCurrentStep(2)}
                >
                  Next: Add Files
                </Button>
              </div>
            )}

            {/* Step 2: File Upload & Analysis */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(1)}
                    className="flex items-center gap-2 border-neutral-700 text-black hover:bg-neutral-200"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </Button>
                  <span className="text-sm text-neutral-400">
                    Target:{" "}
                    <span className="font-semibold text-white">
                      {selectedLanguage === "auto"
                        ? "Auto-Detect"
                        : selectedLanguage.toUpperCase()}
                    </span>
                  </span>
                </div>

                <Card className="border-dashed border-2 border-neutral-700 bg-neutral-900">
                  <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
                      <Button
                        variant="default"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 bg-white text-black hover:bg-neutral-200"
                      >
                        <FileText className="w-4 h-4" />
                        Add Single Files
                      </Button>
                      <input
                        ref={folderInputRef}
                        type="file"
                        webkitdirectory=""
                        multiple
                        className="hidden"
                        onChange={(e) => addToQueue(e.target.files)}
                      />

                      <Button
                        variant="outline"
                        onClick={() => folderInputRef.current?.click()}
                        className="flex items-center gap-2 border-neutral-700 text-black hover:bg-neutral-200"
                      >
                        <Folder className="w-4 h-4" />
                        Add Project Folder
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        className="hidden"
                        onChange={(e) => addToQueue(e.target.files)}
                      />
                    </div>

                    {fileQueue.length > 0 && (
                      <Card className="mb-4 bg-neutral-800 border-neutral-700">
                        <CardContent className="p-3">
                          <div className="space-y-2">
                            {fileQueue.map((file, index) => (
                              <div
                                key={index}
                                className="flex justify-between items-center p-2 border-b border-neutral-700 last:border-b-0 text-sm text-white"
                              >
                                <span className="flex items-center gap-2">
                                  <FileText className="w-4 h-4" />
                                  {file.name}
                                  <span className="text-neutral-500 text-xs">
                                    ({(file.size / 1024).toFixed(1)} KB)
                                  </span>
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFile(index)}
                                  className="text-neutral-500 hover:text-neutral-300"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    <div className="space-y-3">
                      <Label
                        htmlFor="repoUrl"
                        className="flex items-center gap-2 text-white"
                      >
                        <Globe className="w-4 h-4" />
                        Analyze from GitHub / Bitbucket URL:
                      </Label>
                      <Input
                        id="repoUrl"
                        type="text"
                        placeholder="https://github.com/user/repository.git"
                        value={repoUrl}
                        onChange={(e) => setRepoUrl(e.target.value)}
                        className="bg-neutral-800 border-2 border-neutral-700 text-white placeholder-neutral-400 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/20"
                      />
                    </div>

                    <div className="flex items-center space-x-2 mt-6 p-4 bg-neutral-800 rounded-lg border-2 border-neutral-700 hover:border-neutral-600 transition-colors">
                      <Checkbox
                        id="enhanced"
                        checked={enhancedAnalysis}
                        onCheckedChange={setEnhancedAnalysis}
                        className="border-2 border-neutral-400"
                      />
                      <Label
                        htmlFor="enhanced"
                        className="flex items-center gap-2 text-sm font-semibold cursor-pointer text-white"
                      >
                        <Zap className="w-4 h-4" />
                        Enable Enhanced Analysis (Summaries & Highlighting)
                      </Label>
                    </div>

                    <Button
                      className="w-full mt-6 bg-white text-black hover:bg-neutral-200"
                      onClick={handleUpload}
                      disabled={isButtonDisabled || loading}
                    >
                      {getButtonText()}
                    </Button>
                  </CardContent>
                </Card>

                {loading && (
                  <Card className="bg-neutral-800 border-neutral-700">
                    <CardContent className="pt-8 pb-8">
                      <div className="flex flex-col items-center text-center space-y-4">
                        <div className="relative">
                          <div className="absolute inset-0 rounded-full bg-white/5 animate-ping"></div>
                          <div className="relative bg-neutral-900 p-3 rounded-full border border-neutral-700 shadow-sm">
                            <Clock
                              className="w-6 h-6 text-white animate-spin"
                              style={{ animationDuration: "3s" }}
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <p className="text-lg font-bold tracking-tight text-white">
                            {statusMessage}
                          </p>
                          <p className="text-sm text-neutral-400 tabular-nums">
                            Processing for {elapsedTime} seconds
                          </p>
                        </div>

                        <div className="w-full max-w-xs bg-neutral-700 h-1.5 rounded-full overflow-hidden mt-2">
                          <div
                            className="bg-white h-full transition-all duration-1000 ease-linear"
                            style={{
                              width: `${Math.min((elapsedTime / 45) * 100, 98)}%`,
                            }}
                          ></div>
                        </div>

                        <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">
                          Multi-Agent Pipeline Active
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {resultReady && (
                  <Card className="bg-neutral-800 border-green-500 border-2 shadow-lg shadow-green-500/20">
                    <CardContent className="pt-6 text-center space-y-4">
                      <div className="flex items-center justify-center gap-2 text-green-400">
                        <CheckCircle className="w-6 h-6" />
                        <span className="font-bold text-lg">
                          Analysis Ready!
                        </span>
                      </div>
                      <Button
                        className="w-full bg-white text-black hover:bg-neutral-200 font-bold h-12"
                        onClick={() => setCurrentStep(3)}
                      >
                        Go to Results
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Step 3: Results View */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCurrentStep(2);
                      setResultReady(false);
                    }}
                    className="border-neutral-700 text-black hover:bg-neutral-800"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" /> New Analysis
                  </Button>
                  <span className="text-sm font-medium text-green-400 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> Analysis Complete
                  </span>
                </div>

                {globalData?.projectSummary && (
                  <Card className="bg-neutral-900 border-neutral-800">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <BarChart3 className="w-5 h-5" />
                        Project Overview
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="leading-relaxed text-neutral-400">
                        {globalData.projectSummary}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {globalData?.fileDetails &&
                  globalData.fileDetails.length > 0 && (
                    <div className="mb-6">
                      <h3 className="flex items-center gap-2 text-xl font-semibold mb-4 text-white">
                        <Folder className="w-5 h-5" />
                        File Analysis
                      </h3>
                      <div className="space-y-4">
                        {globalData.fileDetails.map((file, index) => (
                          <Card
                            key={index}
                            className="border-l-4 border-l-white hover:shadow-lg transition-shadow bg-neutral-900 border-neutral-800"
                          >
                            <CardHeader>
                              <div className="flex justify-between items-center">
                                <CardTitle className="text-lg text-white">
                                  {file.filename}
                                </CardTitle>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openCodeViewer(file.filename)}
                                  className="border-neutral-700 text-black hover:bg-neutral-800"
                                >
                                  See Code
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm text-neutral-400 mb-3">
                                {file.summary ||
                                  "Summary generation in progress..."}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {file.reads &&
                                  file.reads.length > 0 &&
                                  file.reads.map((r, i) => (
                                    <span
                                      key={i}
                                      className="inline-block px-2 py-1 rounded text-xs font-semibold bg-neutral-700 text-neutral-100"
                                    >
                                      Read: {r}
                                    </span>
                                  ))}
                                {file.writes &&
                                  file.writes.length > 0 &&
                                  file.writes.map((w, i) => (
                                    <span
                                      key={i}
                                      className="inline-block px-2 py-1 rounded text-xs font-semibold bg-neutral-300 text-white"
                                    >
                                      Write: {w}
                                    </span>
                                  ))}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                {globalData?.lineage && (
                  <Card className="mb-6 bg-neutral-900 border-neutral-800">
                    <CardHeader>
                      <CardTitle className="text-white">
                        Data Lineage Graph
                      </CardTitle>
                      <CardDescription className="text-sm text-neutral-400">
                        Drag canvas to Pan | Scroll to Zoom
                      </CardDescription>
                    </CardHeader>

                    {/* Added relative, overflow-hidden, and the Ref */}
                    <CardContent className="p-0 relative overflow-hidden" ref={graphContainerRef}>
                      
                      {/* The Full Screen Button - Placed at the top right */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevents clicking the button from moving the graph
                          toggleFullScreen();
                        }}
                        className="absolute top-4 right-4 z-[100] bg-neutral-900/90 hover:bg-neutral-800 text-white border border-neutral-700 shadow-xl"
                      >
                        {isFullScreen ? (
                          <Minimize2 className="w-5 h-5" />
                        ) : (
                          <Maximize2 className="w-5 h-5" />
                        )}
                      </Button>

                      <svg
                        ref={svgRef}
                        className={`w-full cursor-grab bg-neutral-800 transition-all ${
                          isFullScreen ? "h-screen" : "h-[500px]"
                        }`}
                        style={{
                          backgroundImage:
                            "radial-gradient(#404040 1px, transparent 1px)",
                          backgroundSize: "20px 20px",
                        }}
                      >
                        <g />
                      </svg>
                    </CardContent>
                  </Card>
                )}

                {globalData && (
                  <Card className="bg-black border-neutral-800">
                    <CardContent className="p-0">
                      <pre className="text-green-400 p-5 overflow-x-auto text-xs">
                        {JSON.stringify(globalData, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div
          className="fixed z-50 left-0 top-0 w-full h-full bg-black bg-opacity-80 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="bg-neutral-900 my-8 mx-auto w-11/12 max-w-5xl h-5/6 rounded-xl flex flex-col overflow-hidden border border-neutral-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-neutral-800 p-5 bg-neutral-900">
              <h3 className="m-0 font-semibold text-lg text-white">
                {modalFilename}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeModal}
                className="text-neutral-500 hover:text-neutral-300"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="bg-black text-neutral-300 p-5 flex-grow overflow-y-auto font-mono text-sm leading-relaxed">
              {modalContent.map((line, i) => {
                const lineNum = i + 1;
                let highlightClass = "";
                if (modalHighlights.readLines?.includes(lineNum)) {
                  highlightClass =
                    "bg-neutral-800 bg-opacity-50 border-l-4 border-neutral-300";
                } else if (modalHighlights.writeLines?.includes(lineNum)) {
                  highlightClass =
                    "bg-neutral-700 bg-opacity-50 border-l-4 border-neutral-300";
                }

                const escapedLine = line
                  .replace(/&/g, "&amp;")
                  .replace(/</g, "&lt;")
                  .replace(/>/g, "&gt;");

                return (
                  <div
                    key={i}
                    className={`block whitespace-pre-wrap px-2 rounded-sm ${highlightClass}`}
                  >
                    <span className="text-neutral-700 inline-block w-10 text-right mr-5 select-none border-r border-neutral-800 pr-2">
                      {lineNum}
                    </span>
                    <span
                      dangerouslySetInnerHTML={{ __html: escapedLine || " " }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataLineageForm;
