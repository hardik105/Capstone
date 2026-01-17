def build_project_context(all_files, lineage_data, language):
    """
    Creates a structured overview of the project for the LLM.
    """
    context = f"Project Language: {language}\n\n"
    context += "FILE LIST:\n"
    for f in all_files:
        context += f"- {f['filename']}\n"
        
    context += "\nIDENTIFIED DATA FLOW (LINEAGE):\n"
    for lin in lineage_data:
        context += f"File {lin['file']} reads from {lin['reads']} and writes to {lin['writes']}\n"
        
    return context