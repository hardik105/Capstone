import subprocess, os, shutil, tempfile, re
from orchestrator.graph.state import GraphState

def scala_node(state: GraphState) -> dict:
    """
    Bridge using 'sbt run' for processing Scala files.
    Returns only the extracted lineage for merging in the parallel graph flow.
    """
    agent_dir = os.path.abspath(os.path.join(
        os.path.dirname(__file__), 
        "../../../agents/Scala-agent/agent-analyzer"
    ))
    output_file_path = os.path.join(agent_dir, "lineage-output.txt")
    
    if os.path.exists(output_file_path): 
        os.remove(output_file_path)
    
    temp_repo_dir = tempfile.mkdtemp()
    
    try:
        # 1. Separate Scala files
        scala_files = [f for f in state.get("files", []) if f["filename"].endswith(".scala")]
        
        if not scala_files:
            print("ℹ️ No Scala files detected. Skipping node.")
            return {"lineage": []}
        
        # 2. Write Scala files to temp directory
        for file_entry in scala_files:
            file_path = os.path.join(temp_repo_dir, file_entry["filename"])
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            with open(file_path, "w") as f: 
                f.write(file_entry["content"])

        # 3. Execute via sbt run
        env = os.environ.copy()
        env["USE_LLM"] = "true"
        command = f'sbt "run {temp_repo_dir}"'
        
        print(f"--- [ScalaNode] Executing sbt run for {len(scala_files)} file(s) ---")
        subprocess.run(command, cwd=agent_dir, env=env, shell=True, timeout=300)

        # 4. Parse results from the generated report
        all_lineage = []
        if os.path.exists(output_file_path):
            with open(output_file_path, "r") as f:
                content = f.read()
            
            sections = re.split(r"File:\s*", content)
            for section in sections[1:]:
                lines = section.strip().split('\n')
                filename = lines[0].strip()
                
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
            print(f"✅ Successfully extracted lineage for {len(all_lineage)} Scala file(s).")
        
        # 5. Return only the update dictionary
        return {"lineage": all_lineage}
        
    except Exception as e:
        print(f"❌ Scala Bridge failed: {e}")
        return {"lineage": []}
    finally:
        shutil.rmtree(temp_repo_dir)