import os

class PySparkScanner:
    @staticmethod
    def scan(directory_path: str) -> dict:
        """
        Recursively scans for Python files and reads their content.
        """
        scripts = {}
        if not os.path.isdir(directory_path):
            return scripts

        for root, _, files in os.walk(directory_path):
            for file in files:
                if file.endswith(".py"):
                    full_path = os.path.join(root, file)
                    with open(full_path, "r", encoding="utf-8") as f:
                        scripts[file] = f.read()
        return scripts