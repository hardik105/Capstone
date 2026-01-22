# Multi-Agent Data Lineage System

A comprehensive data lineage analysis platform that automatically detects and visualizes data flow across multiple programming languages and data processing frameworks. This system intelligently routes code analysis to specialized agents based on file types and generates visual lineage graphs with optional AI-powered summaries.

---

## 📋 Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Running the Project](#running-the-project)
- [How It Works](#how-it-works)
- [Components](#components)
- [API Endpoints](#api-endpoints)
- [Supported Languages](#supported-languages)
- [Features](#features)
- [Development](#development)

---

## 📌 Overview

The Multi-Agent Data Lineage System is designed to analyze data processing pipelines written in different languages and frameworks:

- **Scala** for Spark applications
- **HiveSQL/SQL** for warehouse queries
- **PySpark** for Python-based data processing

The system automatically:
1. Detects the type of code files uploaded
2. Routes them to appropriate specialized agents
3. Analyzes data lineage (how data flows from source to destination)
4. Generates interactive visualizations
5. Provides AI-powered summaries of data transformations (optional)

This is particularly useful for understanding complex ETL pipelines, data dependencies, and tracing data lineage across multi-language data warehouses.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   React Frontend                         │
│  (TypeScript/Vite - Interactive UI for Analysis)        │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP/REST Requests
                       ▼
┌─────────────────────────────────────────────────────────┐
│         FastAPI Backend (Orchestrator)                  │
│  - /analyze/{language} endpoint                         │
│  - Accepts file uploads or Git repo URLs               │
│  - Background task processing                          │
└──────────────────────┬──────────────────────────────────┘
                       │
                ┌──────┴──────┐
                ▼             ▼
        ┌──────────────┐  ┌──────────────────────┐
        │  LangGraph   │  │  Multi-Agent Router  │
        │  Orchestrator│  │  (Auto-detection)    │
        └──────┬───────┘  └──────────────────────┘
               │
        ┌──────┴──────┬──────────┐
        ▼             ▼          ▼
    ┌────────┐  ┌──────────┐  ┌─────────┐
    │ Scala  │  │ HiveSQL  │  │PySpark  │
    │ Agent  │  │  Agent   │  │ Agent   │
    └────────┘  └──────────┘  └─────────┘
        │             │           │
        └─────────────┬───────────┘
                      ▼
        ┌──────────────────────────┐
        │  Visualization Engine    │
        │  (Graph Rendering)       │
        └────────────┬─────────────┘
                     │
        ┌────────────▼───────────┐
        │  Optional: AI Summary  │
        │  (Google Generative AI)│
        └────────────────────────┘
```

---

## 📁 Project Structure

```
capstone/
├── README.md                           # This file
├── frontend/                           # React frontend application
│   └── capstone/
│       ├── src/
│       │   ├── App.tsx                # Main app routing
│       │   ├── LandingPage.tsx        # Landing page
│       │   ├── DataLineageForm.tsx    # Analysis form component
│       │   ├── components/            # Reusable UI components
│       │   ├── lib/                   # Utility functions
│       │   ├── ui/                    # UI component library
│       │   ├── assets/                # Images, icons, etc.
│       │   └── main.tsx               # Entry point
│       ├── package.json               # Dependencies
│       ├── vite.config.ts             # Vite configuration
│       ├── tsconfig.json              # TypeScript config
│       └── index.html
│
├── orchestrator/                       # FastAPI backend
│   ├── api/
│   │   └── main.py                    # FastAPI app with endpoints
│   ├── graph/
│   │   ├── graph.py                   # LangGraph workflow definition
│   │   ├── state.py                   # State management
│   │   └── nodes/
│   │       ├── router.py              # Language router
│   │       ├── scala_node.py          # Scala analysis agent
│   │       ├── hivesql_node.py        # HiveSQL analysis agent
│   │       ├── pyspark_node.py        # PySpark analysis agent
│   │       ├── visualization_node.py  # Graph visualization
│   │       ├── summary_node.py        # AI summary generation
│   │       └── __init__.py
│   ├── summary_highlighter/           # AI Summary module
│   │   ├── llm_client.py              # LLM integration
│   │   ├── summarizer.py              # Summary logic
│   │   ├── context_builder.py         # Context preparation
│   │   └── processor.py
│   ├── requirements.txt               # Python dependencies
│   └── __init__.py
│
├── agents/                            # Language-specific analyzers
│   ├── hiveSQL-agent/                # HiveSQL lineage analyzer
│   │   └── agent-analyzer/
│   │       ├── src/
│   │       ├── build.sbt
│   │       └── test-repo/
│   ├── Scala-agent/                  # Scala lineage analyzer
│   │   └── agent-analyzer/
│   │       ├── src/
│   │       ├── build.sbt
│   │       └── test-repo/
│   └── PySpark-agent/                # PySpark lineage analyzer
│       └── agent-analyzer/
│           ├── src/
│           ├── run_analyzer.py
│           └── test-repo/
│
└── global-sales-test/                # Test data repository
    ├── *.sql, *.hql, *.scala, *.py   # Sample data pipeline files
    └── configs/
```

---

## 📦 Prerequisites

Before setting up the project, ensure you have:

### System Requirements
- **macOS/Linux/Windows** with terminal access
- **Python 3.10+** installed
- **Node.js 18+** and **npm** installed
- **Java 11+** (for Scala agent analysis)
- **Git** installed

### API Keys (Optional but recommended)
- **Google Generative AI API Key** (for enhanced AI summaries)
  - Get it from: https://ai.google.dev/
  - Set as environment variable: `GOOGLE_API_KEY`

---

## 🚀 Installation & Setup

### Step 1: Clone and Navigate to Project

```bash
cd /Users/hardikagrawal/Documents/capstone
```

### Step 2: Backend Setup (Python/FastAPI)

#### Create Virtual Environment
```bash
cd orchestrator
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

#### Install Python Dependencies
```bash
pip install -r requirements.txt
```

#### Configure Environment Variables
Create a `.env` file in the `orchestrator/` directory:

```bash
cat > .env << EOF
GOOGLE_API_KEY=your_google_api_key_here
# Add other environment variables as needed
EOF
```

**Key Python Dependencies:**
- `fastapi` - Web framework
- `uvicorn` - ASGI server
- `langgraph` - Agent orchestration
- `langchain` - LLM integration
- `google-genai` - Google AI integration
- `GitPython` - Git repository handling

### Step 3: Frontend Setup (React/TypeScript)

```bash
cd ../frontend/capstone
npm install
```

**Key Frontend Dependencies:**
- `react` - UI framework
- `typescript` - Type safety
- `vite` - Build tool & dev server
- `react-router-dom` - Client-side routing
- `d3` & `dagre-d3` - Graph visualization
- `tailwindcss` - Styling
- `lucide-react` - Icons

---

## 🎯 Running the Project

### Terminal 1: Start the Backend

```bash
# Navigate to orchestrator directory
cd /Users/hardikagrawal/Documents/capstone/orchestrator

# Activate virtual environment
source .venv/bin/activate

# Start FastAPI server with auto-reload
uvicorn orchestrator.api.main:api --reload --host 0.0.0.0 --port 8000
```

**Expected Output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
```

The API will be available at:
- **Main API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs (Swagger UI)
- **Alternative Docs**: http://localhost:8000/redoc (ReDoc)

### Terminal 2: Start the Frontend

```bash
# Navigate to frontend directory
cd /Users/hardikagrawal/Documents/capstone/frontend/capstone

# Install dependencies (if not done already)
npm install

# Start development server
npm run dev
```

**Expected Output:**
```
  VITE v... dev server running at:

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

The application will be available at: http://localhost:5173

---

## ⚙️ How It Works

### 1. **User Uploads Files or Repository**

Users can:
- Upload individual code files (`.scala`, `.sql`, `.hql`, `.py`)
- Provide a Git repository URL (GitHub, Bitbucket, GitLab)
- Select analysis language or use auto-detection

### 2. **Request Processing**

```
POST /analyze/{language}
├── language: "scala" | "hivesql" | "pyspark" | "auto" | "multi"
├── files: [uploaded files] (optional)
└── repo_url: "https://github.com/user/repo" (optional)
```

### 3. **Intelligent Routing**

The **Router Node** automatically:
- Scans uploaded files for language indicators (`.scala`, `.sql`, `.py`)
- Standardizes language input
- Determines which agents to activate
- Supports parallel multi-language analysis

### 4. **Parallel Agent Execution**

Based on detected files, appropriate agents run in parallel:

**Scala Agent:**
- Analyzes `.scala` files
- Extracts data sources, transformations, sinks
- Generates lineage graph
- Detects Spark operations

**HiveSQL Agent:**
- Parses SQL/HQL queries
- Identifies table joins and dependencies
- Traces column-level lineage
- Detects DDL and DML operations

**PySpark Agent:**
- Analyzes `.py` files with PySpark code
- Extracts RDD/DataFrame transformations
- Maps data sources and destinations
- Identifies custom transformations

### 5. **Visualization Generation**

The **Visualization Node** combines results:
- Merges lineage data from all agents
- Generates a directed acyclic graph (DAG)
- Creates interactive D3/Dagre visualization
- Outputs JSON and visual formats

### 6. **Optional AI Summary (Enhanced Mode)**

If `enhanced=true`, the **Summary Node**:
- Builds analysis context
- Sends to Google Generative AI
- Generates human-readable summary
- Explains data transformations in plain English

### 7. **Response to Frontend**

Backend returns:
```json
{
  "job_id": "uuid",
  "status": "completed",
  "lineage": { ... },
  "visualization": { ... },
  "summary": "..." (if enhanced mode)
}
```

---

## 🔧 Components

### Frontend Components

| Component | Purpose |
|-----------|---------|
| `LandingPage.tsx` | Homepage with project intro and CTA |
| `DataLineageForm.tsx` | Main analysis form with file/repo upload |
| `AceternityNavbar.tsx` | Navigation bar |
| `PricingSection.tsx` | Pricing/features display |
| `Footer.tsx` | Footer section |

### Backend Nodes

| Node | Responsibility |
|------|-----------------|
| `router.py` | Language detection & path activation |
| `scala_node.py` | Scala code analysis |
| `hivesql_node.py` | SQL/HQL query analysis |
| `pyspark_node.py` | PySpark code analysis |
| `visualization_node.py` | DAG creation & graph rendering |
| `summary_node.py` | AI-powered summary generation |

### State Management

The `state.py` file defines:
```python
GraphState = {
    "job_id": str,
    "language": str,
    "files": List[Dict],
    "repo_url": Optional[str],
    "enhanced_mode": bool,
    "active_paths": List[str],
    "lineage_results": Dict,
    "visualization": Dict,
    "summary": str,
    "error": Optional[str]
}
```

---

## 📡 API Endpoints

### Health Check
```
GET /
Response: { "status": "online", "message": "Asynchronous Lineage API active" }
```

### Analyze Code (Main Endpoint)
```
POST /analyze/{language}

Parameters:
- language: str (required) - "scala", "hivesql", "pyspark", "auto", or "multi"
- files: List[UploadFile] (optional) - Code files to analyze
- repo_url: str (optional) - Git repository URL
- enhanced: bool (optional, default=false) - Enable AI summary

Response:
{
  "job_id": "uuid",
  "status": "completed|processing|error",
  "lineage": { ... },
  "visualization": { ... },
  "summary": "..." (if enhanced=true)
}
```

### Get Job Status (Background Processing)
```
GET /jobs/{job_id}
Response: { "status": "...", "progress": 0-100 }
```

---

## 🗣️ Supported Languages

### 1. **Scala** (Apache Spark)
- **File Extensions**: `.scala`, `.sbt`
- **Capabilities**:
  - RDD operations
  - DataFrame transformations
  - SQL context queries
  - Custom UDFs

### 2. **HiveSQL/SQL**
- **File Extensions**: `.sql`, `.hql`
- **Capabilities**:
  - JOIN operations
  - Subquery tracking
  - Table dependencies
  - Partition analysis

### 3. **PySpark**
- **File Extensions**: `.py` (PySpark code)
- **Capabilities**:
  - PySpark DataFrame API
  - RDD transformations
  - Custom transformations
  - Nested operations

### Auto-Detection Mode
When `language=auto` or `multi`:
- System scans all uploaded files
- Automatically activates relevant agents
- Allows mixed-language analysis in single request

---

## ✨ Features

### Core Features
✅ **Multi-Language Support**: Scala, SQL, PySpark  
✅ **Automatic Language Detection**: No manual selection needed  
✅ **Parallel Processing**: Multiple agents run simultaneously  
✅ **Interactive Visualization**: D3/Dagre graph rendering  
✅ **Git Integration**: Clone and analyze GitHub/GitLab repos  
✅ **Background Processing**: Async job handling with IDs  

### Advanced Features
✅ **AI-Powered Summaries**: Google Generative AI integration  
✅ **Column-Level Lineage**: Trace data at granular level  
✅ **Dependency Analysis**: Identify all data sources and sinks  
✅ **Error Handling**: Graceful failures with detailed messages  
✅ **CORS Support**: Frontend-backend communication  

---

## 👨‍💻 Development

### Running Tests

#### Backend Tests
```bash
cd orchestrator
source .venv/bin/activate
python -m pytest tests/
```

#### Frontend Tests
```bash
cd frontend/capstone
npm run test
```

### Building for Production

#### Backend
The FastAPI server is production-ready. For deployment:
```bash
# Remove --reload flag
uvicorn orchestrator.api.main:api --host 0.0.0.0 --port 8000
```

#### Frontend
```bash
cd frontend/capstone
npm run build
# Output: dist/ folder ready for deployment
```

### Debugging

#### Backend Debugging
```bash
source orchestrator/.venv/bin/activate
python -m debugpy --listen 5678 -m uvicorn orchestrator.api.main:api
```

#### Frontend Debugging
Use Chrome DevTools:
1. Open http://localhost:5173
2. Press F12 to open DevTools
3. Use Sources tab for breakpoints

### Environment Variables

Create `orchestrator/.env`:
```bash
# Google AI Configuration
GOOGLE_API_KEY=your_api_key_here

# Optional: Database URLs, API keys, etc.
DATABASE_URL=your_db_url
OPENAI_API_KEY=your_openai_key

# Optional: Logging level
LOG_LEVEL=INFO
```

---

## 🐛 Troubleshooting

### Backend Won't Start

**Error**: `ModuleNotFoundError: No module named 'orchestrator'`
```bash
# Solution: Ensure you're in the right directory and venv is activated
cd /Users/hardikagrawal/Documents/capstone/orchestrator
source .venv/bin/activate
python -c "import orchestrator"
```

**Error**: `Port 8000 already in use`
```bash
# Solution: Use different port
uvicorn orchestrator.api.main:api --reload --port 8001
```

### Frontend Won't Connect to Backend

**Error**: `CORS error` or `Connection refused`
```bash
# Ensure backend is running on http://localhost:8000
# Check DataLineageForm.tsx for correct API endpoint
# Verify CORS middleware is enabled in main.py
```

**Error**: `npm install fails`
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Slow Analysis

**Cause**: Large files or complex repositories
**Solution**: 
- Use specific language parameter instead of "auto"
- Upload smaller subsets of files
- Check system memory usage

---

## 📚 Learning Resources

- **LangGraph Documentation**: https://python.langchain.com/docs/concepts/langgraph/
- **FastAPI Guide**: https://fastapi.tiangolo.com/
- **React + TypeScript**: https://react.dev/
- **Vite**: https://vitejs.dev/

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review API documentation at http://localhost:8000/docs
3. Check console/terminal for error messages
4. Review logs in the backend terminal

---

## 📄 License

This project is part of a capstone project.

---

## 🚀 Next Steps

1. **Start Backend**: Run `source orchestrator/.venv/bin/activate && uvicorn orchestrator.api.main:api --reload`
2. **Start Frontend**: Run `npm install && npm run dev` in `frontend/capstone/`
3. **Open Browser**: Navigate to http://localhost:5173
4. **Upload Code**: Use the form to upload files or Git repo URLs
5. **View Results**: Analyze the generated lineage visualization

---

**Happy Data Lineage Analyzing! 🎉**
