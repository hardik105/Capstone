import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import * as dagreD3 from "dagre-d3";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
} from "lucide-react";

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

const DataLineageDashboard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [fileQueue, setFileQueue] = useState<File[]>([]);
  const [globalData, setGlobalData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [completionMessage, setCompletionMessage] = useState("");
  const [enhancedAnalysis, setEnhancedAnalysis] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("auto");
  const [repoUrl, setRepoUrl] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalFilename, setModalFilename] = useState("");
  const [modalContent, setModalContent] = useState<string[]>([]);
  const [modalHighlights, setModalHighlights] = useState<Highlights>({
    readLines: [],
    writeLines: [],
  });
  // Add this block to inject the old CSS styles into your React app
  useEffect(() => {
    const styleId = "lineage-graph-styles";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.innerHTML = `
        /* Exact colors and styles from your old index.html */
        .node.file rect { fill: #3182ce !important; stroke: #2b6cb0; stroke-width: 1.5px; }
        .node.table rect { fill: #38a169 !important; stroke: #2f855a; stroke-width: 1.5px; }
        
        /* White text styling for readability */
        .node text { fill: #ffffff !important; font-weight: 600; font-family: 'Inter', sans-serif; font-size: 12px; }
        
        /* Edge and Label styling */
        .edgePath path { stroke: #a0aec0 !important; stroke-width: 2px !important; fill: none; }
        .edgeLabel text { fill: #4a5568 !important; font-size: 10px; font-weight: bold; }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const svgRef = useRef<SVGSVGElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setCompletionMessage("");
    setGlobalData(null);

    const startTime = Date.now();
    timerRef.current = setInterval(() => {
      setElapsedTime(Math.round((Date.now() - startTime) / 1000));
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
    if (globalData?.lineage && svgRef.current) {
      renderGraph(globalData);
    }
  }, [globalData]);

  const renderGraph = (data: AnalysisData) => {
    if (!svgRef.current || !data.lineage) return;

    // 1. Initialize the Dagre Graph (Horizontal Layout)
    const g = new dagreD3.graphlib.Graph().setGraph({
      rankdir: "LR", // Left to Right
      marginx: 40,
      marginy: 40,
      nodesep: 60,
      ranksep: 120
    });

    // 2. Add Nodes and Edges
    data.lineage.forEach((item) => {
      // BLUE nodes for Files
      g.setNode(item.file, { 
        label: item.file, 
        class: "file", 
        rx: 8, ry: 8,
        padding: 15
      });

      item.reads.forEach((t) => {
        // GREEN nodes for Tables
        g.setNode(t, { label: t, class: "table", rx: 12, ry: 12, padding: 10 });
        g.setEdge(t, item.file, { 
          label: "READ", 
          curve: d3.curveBasis,
          style: "stroke: #cbd5e0; fill: none; stroke-width: 2px;" 
        });
      });

      item.writes.forEach((t) => {
        g.setNode(t, { label: t, class: "table", rx: 12, ry: 12, padding: 10 });
        g.setEdge(item.file, t, { 
          label: "WRITE", 
          curve: d3.curveBasis,
          style: "stroke: #cbd5e0; fill: none; stroke-width: 2px;" 
        });
      });
    });

    // 3. Render logic
    const svg = d3.select(svgRef.current);
    const inner = svg.select("g");
    inner.selectAll("*").remove();

    const render = new dagreD3.render();
    render(inner as any, g as any);

    // 4. Zoom and Pan
    const zoom = d3.zoom().on("zoom", (event) => {
      inner.attr("transform", event.transform);
    });
    svg.call(zoom as any);

    // Auto-center the graph initially
    const initialScale = 0.75;
    svg.call(zoom.transform as any, d3.zoomIdentity.translate(50, 50).scale(initialScale));
  };

  return (
    <div className="min-h-screen bg-white p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              Multi-Agent Data Lineage
            </CardTitle>
            <CardDescription>
              Add project folders, individual files, or a Git repository URL.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Progress Indicator */}
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center gap-2">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${currentStep === 1 ? "bg-black text-white" : "bg-gray-400 text-white"}`}
                >
                  1
                </div>
                <div
                  className={`w-24 h-1 ${currentStep === 2 ? "bg-black" : "bg-gray-300"}`}
                ></div>
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${currentStep === 2 ? "bg-black text-white" : "bg-gray-300 text-gray-600"}`}
                >
                  2
                </div>
              </div>
            </div>

            {/* Step 1: Language Selection */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Select Target Language
                  </h3>
                  <RadioGroup
                    value={selectedLanguage}
                    onValueChange={setSelectedLanguage}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-100 cursor-pointer">
                        <RadioGroupItem value="auto" id="auto" />
                        <Label htmlFor="auto" className="cursor-pointer flex-1">
                          Auto-Detect (Hybrid)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-100 cursor-pointer">
                        <RadioGroupItem value="scala" id="scala" />
                        <Label
                          htmlFor="scala"
                          className="cursor-pointer flex-1"
                        >
                          Scala
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-100 cursor-pointer">
                        <RadioGroupItem value="hivesql" id="hivesql" />
                        <Label
                          htmlFor="hivesql"
                          className="cursor-pointer flex-1"
                        >
                          HiveSQL
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-100 cursor-pointer">
                        <RadioGroupItem value="pyspark" id="pyspark" />
                        <Label
                          htmlFor="pyspark"
                          className="cursor-pointer flex-1"
                        >
                          PySpark
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <Button className="w-full" onClick={() => setCurrentStep(2)}>
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
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Target:{" "}
                    <span className="font-semibold">
                      {selectedLanguage === "auto"
                        ? "Auto-Detect"
                        : selectedLanguage.toUpperCase()}
                    </span>
                  </span>
                </div>

                <Card className="border-dashed border-2">
                  <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
                      <Button
                        variant="default"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2"
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
                        className="flex items-center gap-2"
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
                      <Card className="mb-4">
                        <CardContent className="p-3">
                          <div className="space-y-2">
                            {fileQueue.map((file, index) => (
                              <div
                                key={index}
                                className="flex justify-between items-center p-2 border-b last:border-b-0 text-sm"
                              >
                                <span className="flex items-center gap-2">
                                  <FileText className="w-4 h-4" />
                                  {file.name}
                                  <span className="text-muted-foreground text-xs">
                                    ({(file.size / 1024).toFixed(1)} KB)
                                  </span>
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFile(index)}
                                  className="text-gray-500 hover:text-gray-700"
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
                        className="flex items-center gap-2"
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
                      />
                    </div>

                    <div className="flex items-center space-x-2 mt-6 p-4 bg-gray-100 rounded-lg border">
                      <Checkbox
                        id="enhanced"
                        checked={enhancedAnalysis}
                        onCheckedChange={setEnhancedAnalysis}
                      />
                      <Label
                        htmlFor="enhanced"
                        className="flex items-center gap-2 text-sm font-semibold cursor-pointer"
                      >
                        <Zap className="w-4 h-4" />
                        Enable Enhanced Analysis (Summaries & Highlighting)
                      </Label>
                    </div>

                    <Button
                      className="w-full mt-6"
                      onClick={handleUpload}
                      disabled={isButtonDisabled || loading}
                    >
                      {getButtonText()}
                    </Button>
                  </CardContent>
                </Card>

                {loading && (
                  <Card className="bg-gray-100 border-gray-300">
                    <CardContent className="pt-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Clock className="w-5 h-5 text-gray-800" />
                        <p className="text-gray-800 font-semibold">
                          Processing Multi-Agent Workflow...
                        </p>
                      </div>
                      <p className="text-gray-700 text-sm mt-2">
                        Elapsed: {elapsedTime}s
                      </p>
                    </CardContent>
                  </Card>
                )}

                {completionMessage && (
                  <Card className="bg-gray-200 border-gray-400">
                    <CardContent className="pt-6 text-center">
                      <p className="text-gray-800 font-semibold whitespace-pre-line">
                        {completionMessage}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Section */}
        {globalData?.projectSummary && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Project Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="leading-relaxed text-muted-foreground">
                {globalData.projectSummary}
              </p>
            </CardContent>
          </Card>
        )}

        {globalData?.fileDetails && globalData.fileDetails.length > 0 && (
          <div className="mb-6">
            <h3 className="flex items-center gap-2 text-xl font-semibold mb-4">
              <Folder className="w-5 h-5" />
              File Analysis
            </h3>
            <div className="space-y-4">
              {globalData.fileDetails.map((file, index) => (
                <Card
                  key={index}
                  className="border-l-4 border-l-black hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">{file.filename}</CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openCodeViewer(file.filename)}
                      >
                        See Code
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      {file.summary || "Summary generation in progress..."}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {file.reads &&
                        file.reads.length > 0 &&
                        file.reads.map((r, i) => (
                          <span
                            key={i}
                            className="inline-block px-2 py-1 rounded text-xs font-semibold bg-gray-300 text-gray-800"
                          >
                            Read: {r}
                          </span>
                        ))}
                      {file.writes &&
                        file.writes.length > 0 &&
                        file.writes.map((w, i) => (
                          <span
                            key={i}
                            className="inline-block px-2 py-1 rounded text-xs font-semibold bg-gray-700 text-white"
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
          <Card className="mb-6">
            <CardHeader>
              <CardDescription className="text-sm">
                Drag canvas to Pan | Scroll to Zoom
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <svg
                ref={svgRef}
                className="w-full h-96 cursor-grab bg-white"
                style={{
                  backgroundImage:
                    "radial-gradient(#d1d5db 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                }}
              >
                <g />
              </svg>
            </CardContent>
          </Card>
        )}

        {globalData && (
          <Card className="bg-black">
            <CardContent className="p-0">
              <pre className="text-green-400 p-5 overflow-x-auto text-xs">
                {JSON.stringify(globalData, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div
          className="fixed z-50 left-0 top-0 w-full h-full bg-black bg-opacity-80 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="bg-white my-8 mx-auto w-11/12 max-w-5xl h-5/6 rounded-xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-gray-300 p-5 bg-white">
              <h3 className="m-0 font-semibold text-lg text-black">
                {modalFilename}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="bg-black text-gray-300 p-5 flex-grow overflow-y-auto font-mono text-sm leading-relaxed">
              {modalContent.map((line, i) => {
                const lineNum = i + 1;
                let highlightClass = "";
                if (modalHighlights.readLines?.includes(lineNum)) {
                  highlightClass =
                    "bg-gray-700 bg-opacity-50 border-l-4 border-gray-500";
                } else if (modalHighlights.writeLines?.includes(lineNum)) {
                  highlightClass =
                    "bg-gray-600 bg-opacity-50 border-l-4 border-gray-400";
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
                    <span className="text-gray-600 inline-block w-10 text-right mr-5 select-none border-r border-gray-700 pr-2">
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

export default DataLineageDashboard;
