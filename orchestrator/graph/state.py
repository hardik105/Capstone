from typing import TypedDict, List, Dict, Optional

class FileData(TypedDict):
    filename: str
    content: str

class LineageData(TypedDict):
    file: str
    reads: List[str]
    writes: List[str]

class GraphState(TypedDict):
    language: str
    files: List[FileData]
    # This is where agents will store the normalized output
    lineage: Optional[List[LineageData]] 
    visualization: Optional[str]
    
    # --- New Summary & Highlighter Fields ---
    enhanced_mode: bool  # Toggle for AI summaries
    projectSummary: Optional[str]
    fileDetails: Optional[List[Dict]]
    highlights: Optional[Dict[str, Dict]]
    sourceFiles: Optional[Dict[str, str]]