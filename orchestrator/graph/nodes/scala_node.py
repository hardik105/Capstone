import subprocess, os, shutil, tempfile, re
from orchestrator.graph.state import GraphState

def scala_node(state: GraphState) -> GraphState:
    """
    Bridge using 'sbt run' for better processing efficiency.
    Supports folders and multi-file lineage extraction.
    """
    agent_dir = os.path.abspath(os.path.join(
        os.path.dirname(__file__), 
        "../../../agents/Scala-agent/agent-analyzer"
    ))
    # Path where the Scala agent writes its results report
    output_file_path = os.path.join(agent_dir, "lineage-output.txt")
    
    # Ensure a fresh start by removing any old output file
    if os.path.exists(output_file_path): 
        os.remove(output_file_path)
    
    temp_repo_dir = tempfile.mkdtemp()
    
    try:
        # 1. Separate Scala files from all files
        # Only .scala files will be processed by the agent for lineage
        # All files are preserved in state for summary context
        scala_files = [f for f in state["files"] if f["filename"].endswith(".scala")]
        all_files = state["files"]  # Preserve all files for summary context
        
        print(f"📁 Total files uploaded: {len(all_files)}")
        print(f"📝 Scala files to analyze: {len(scala_files)}")
        if len(all_files) > len(scala_files):
            non_scala = [f["filename"] for f in all_files if not f["filename"].endswith(".scala")]
            print(f"📄 Other files (preserved for context): {', '.join(non_scala)}")
        
        # 2. Write ONLY Scala files to temp directory for agent processing
        for file_entry in scala_files:
            file_path = os.path.join(temp_repo_dir, file_entry["filename"])
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            with open(file_path, "w") as f: 
                f.write(file_entry["content"])

        # 3. Execute via sbt run (Your preferred method for speed)
        env = os.environ.copy()
        env["USE_LLM"] = "true"
        # Add this to your env dictionary in scala_node.py
        # env["SBT_OPTS"] = "-Xmx4G -XX:+UseG1GC"
        command = f'sbt "run {temp_repo_dir}"'
        
        print(f"--- [Node] Executing via sbt run (processing {len(scala_files)} Scala file(s)) ---")
        # Standard timeout for sbt startup + LLM processing
        subprocess.run(command, cwd=agent_dir, env=env, shell=True, timeout=300)

        # 4. Parse results for all files from the generated report
        if os.path.exists(output_file_path):
            with open(output_file_path, "r") as f:
                content = f.read()
            
            all_lineage = []
            # Split by 'File:' to extract reports for every file in the folder
            sections = re.split(r"File:\s*", content)
            for section in sections[1:]: # Skip initial split
                lines = section.strip().split('\n')
                filename = lines[0].strip()
                
                # Regex for READS and WRITES labels matching your Scala output
                reads_match = re.search(r"READS:\s*(.*)", section)
                writes_match = re.search(r"WRITES:\s*(.*)", section)
                
                def clean_list(text): 
                    if not text or "(none)" in text.lower(): return []
                    return [item.strip() for item in text.split(",")]
                
                all_lineage.append({
                    "file": filename,
                    "reads": clean_list(reads_match.group(1) if reads_match else ""),
                    "writes": clean_list(writes_match.group(1) if writes_match else "")
                })
            state["lineage"] = all_lineage
            print(f"✅ Successfully extracted lineage for {len(all_lineage)} Scala file(s).")
        
        # 5. Ensure all files remain in state (for summary component)
        # This preserves non-Scala files (build.sbt, config files, etc.) for context
        state["files"] = all_files
        
    except Exception as e:
        print(f"❌ Python Bridge failed: {e}")
        # Still preserve all files even if agent fails
        state["files"] = all_files
    finally:
        shutil.rmtree(temp_repo_dir)
        
    return state