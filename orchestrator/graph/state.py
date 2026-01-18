import operator
from typing import TypedDict, List, Dict, Optional, Any, Annotated

class FileData(TypedDict):
    filename: str
    content: str

class LineageData(TypedDict):
    file: str
    reads: List[str]
    writes: List[str]

class GraphState(TypedDict):
    # Core Metadata
    language: str
    files: List[FileData]
    active_paths: List[str]
    
    # CRITICAL: Annotated with operator.add handles parallel agent updates
    lineage: Annotated[List[LineageData], operator.add] 
    
    # Visualization
    visualization: Optional[str]
    
    # --- Summary & Highlighter Fields ---
    enhanced_mode: bool  
    projectSummary: Optional[str]
    fileDetails: Optional[List[Dict]]
    highlights: Optional[Dict[str, Dict]]
    # Dictionary mapping Filename -> Full Code Content
    sourceFiles: Optional[Dict[str, str]]