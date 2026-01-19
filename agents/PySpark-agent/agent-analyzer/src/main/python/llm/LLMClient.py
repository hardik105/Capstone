import os
import time
import random
from google import genai
from dotenv import load_dotenv

# Path logic: Go up to the 'capstone' root folder
current_file = os.path.abspath(__file__)
project_root = current_file
for _ in range(8): 
    project_root = os.path.dirname(project_root)

load_dotenv(os.path.join(project_root, ".env"))

class LLMClient:
    @staticmethod
    def call(prompt: str) -> str:
        api_key = os.getenv("GOOGLE_API_KEY")
        model_name = os.getenv("PYSPARK_MODEL_NAME", "gemini-2.5-flash-lite")
        
        if not api_key:
            print("❌ [LLMClient] Error: GOOGLE_API_KEY not found.")
            return ""

        client = genai.Client(api_key=api_key)
        
        # Exponential backoff logic for 2026 rate limits
        for attempt in range(5):
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=prompt
                )
                return response.text if response.text else ""
                
            except Exception as e:
                error_str = str(e).upper()
                if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
                    # Wait starts at 20s and increases (free tier limit is now ~5 RPM)
                    wait_time = (20 * (2 ** attempt)) + random.uniform(0, 5)
                    print(f"⚠️ [LLMClient] Quota hit. Waiting {int(wait_time)}s (Attempt {attempt+1}/5)...")
                    time.sleep(wait_time)
                    continue
                
                print(f"❌ [LLMClient] API Error: {e}")
                break
        return ""