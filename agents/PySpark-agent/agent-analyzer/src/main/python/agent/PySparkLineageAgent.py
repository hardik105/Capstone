import os
from agent.PySparkScanner import PySparkScanner
from llm.LLMClient import LLMClient

class PySparkLineageAgent:
    @staticmethod
    def run(directory_path: str):
        # 1. Scan for files
        scripts = PySparkScanner.scan(directory_path)
        
        if not scripts:
            print(f"No PySpark (.py) files found in {directory_path}")
            return

        final_results = []
        print(f"📂 Found {len(scripts)} files. Starting individual analysis...")

        # 2. Sequential processing to manage 2026 API quotas
        for filename, code in scripts.items():
            if not code.strip():
                print(f"⚠️ Skipping empty file: {filename}")
                continue

            print(f"🔍 Analyzing: {filename}...")
            
            # System instructions for clean, dashboard-ready lineage
            prompt = f"""
            Analyze this PySpark file and identify the READ and WRITE datasets.
            
            FILE: {filename}
            CODE:
            {code}

            STRICT CLEANING RULES:
            1. Extract ONLY table names (e.g., 'dbo.transactions') and ignore JDBC prefixes.
            2. For storage paths (s3://, /mnt/...), keep the full string.
            3. Return ONLY the requested format. No conversational text.

            STRICT OUTPUT FORMAT:
            File: {filename}
            READS: table1, table2
            WRITES: table3
            """

            # 3. Call LLM with built-in retry logic
            response = LLMClient.call(prompt)
            
            if response:
                # Remove markdown artifacts
                clean_output = response.replace("```text", "").replace("```", "").strip()
                final_results.append(clean_output)
            else:
                final_results.append(f"File: {filename}\nREADS: [Analysis Failed]\nWRITES: [Analysis Failed]")

        # 4. Consolidate and Save
        full_output = "\n\n".join(final_results)
        output_file = "lineage-output.txt"
        
        with open(output_file, "w") as f:
            f.write(full_output)
        
        print("\n" + "="*35)
        print("✅ PYSPARK ANALYSIS COMPLETE")
        print("="*35)
        print(f"\n📝 Final results saved to: {os.path.abspath(output_file)}")