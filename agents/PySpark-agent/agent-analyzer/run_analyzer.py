import sys
import os

# 1. Calculate the path to 'src/main/python'
current_dir = os.path.dirname(os.path.abspath(__file__))
python_base = os.path.join(current_dir, "src", "main", "python")

# 2. Add it to the Python path if it's not already there
if python_base not in sys.path:
    sys.path.insert(0, python_base)

# 3. Now use absolute imports starting from the 'python' folder
from agent.PySparkLineageAgent import PySparkLineageAgent

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python run_analyzer.py <directory_path>")
    else:
        target_dir = sys.argv[1]
        print(f"🚀 Starting analysis on: {target_dir}")
        PySparkLineageAgent.run(target_dir)