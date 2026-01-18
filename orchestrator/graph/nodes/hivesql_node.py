import subprocess, os, shutil, tempfile, re
from orchestrator.graph.state import GraphState

def hivesql_node(state: GraphState) -> dict:
    """
    Bridge for the HiveSQL Agent. 
    Returns ONLY the new lineage data to be merged by the state reducer.
    """
    agent_dir = os.path.abspath(os.path.join(
        os.path.dirname(__file__), 
        "../../../agents/hiveSQL-agent/agent-analyzer"
    ))
    output_file_path = os.path.join(agent_dir, "lineage-output.txt")
    
    if os.path.exists(output_file_path): 
        os.remove(output_file_path)
    
    temp_repo_dir = tempfile.mkdtemp()
    
    try:
        # 1. Filter for HiveSQL files
        hive_files = [f for f in state["files"] if f["filename"].endswith((".sql", ".hql"))]
        
        if not hive_files:
            print("ℹ️ No HiveSQL files detected. Skipping node.")
            return {"lineage": []}

        # 2. Write files to temp repo
        for file_entry in hive_files:
            file_path = os.path.join(temp_repo_dir, file_entry["filename"])
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            with open(file_path, "w") as f: 
                f.write(file_entry["content"])

        # 3. Execute Standalone Agent
        command = f'sbt "run {temp_repo_dir}"'
        print(f"--- [HiveNode] Analyzing {len(hive_files)} HiveSQL file(s) ---")
        subprocess.run(command, cwd=agent_dir, shell=True, timeout=300)

        # 4. Parse Results
        hive_lineage = []
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
                
                hive_lineage.append({
                    "file": filename,
                    "reads": clean_list(reads_match.group(1) if reads_match else ""),
                    "writes": clean_list(writes_match.group(1) if writes_match else "")
                })
            
            print(f"✅ Extracted lineage for {len(hive_lineage)} HiveSQL file(s).")

        # 5. Return ONLY the new data. LangGraph handles the merge.
        return {"lineage": hive_lineage}
            
    except Exception as e:
        print(f"❌ Hive Bridge failed: {e}")
        return {"lineage": []}
    finally:
        shutil.rmtree(temp_repo_dir)