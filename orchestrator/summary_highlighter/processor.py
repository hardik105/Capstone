from . import context_builder
from . import summarizer

def process_summaries(files, lineage, language):
    """
    OPTIMIZED ONE-SHOT Orchestrator.
    Consolidates multiple LLM calls into a single context-rich request 
    to prevent 'RESOURCE_EXHAUSTED' errors and reduce total time.
    """
    # 1. Build project-level context (Project Structure)
    # This identifies how files are nested and related (Fast)
    project_context = context_builder.build_project_context(files, lineage, language)
    
    # 2. Generate project summary (Fast, low token usage)
    # This creates a "global understanding" that helps the next step
    project_summary = summarizer.get_project_summary(files, lineage, language, project_context)
    
    # 3. ONE-SHOT Analysis: Send all files to Gemini simultaneously
    # Instead of looping, we let Gemini process all files in its 1M+ token window
    # This reduces API round-trips from 7+ down to just 1
    batch_results = summarizer.get_all_file_details_one_shot(
        files, 
        lineage, 
        project_summary, 
        language
    )
    
    # 4. Assemble the final dictionary for the LangGraph state
    # This structure is what your frontend 'renderUI' function expects
    return {
        "projectSummary": project_summary,
        "fileDetails": batch_results.get("fileDetails", []),
        "highlights": batch_results.get("highlights", {}),
        "sourceFiles": batch_results.get("sourceFiles", {})
    }