import os
import json
import time
from google import genai
from google.genai import types
from dotenv import load_dotenv
from langsmith import traceable
from langsmith.run_helpers import get_current_run_tree

# Load the API key from your .env file
load_dotenv()

# The 2026 Unified Client handles the latest Gemini 2.5 and 3.0 models
client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))
MODEL_NAME = os.getenv("SUMMARIZER_MODEL_NAME", "gemini-2.5-flash")

@traceable(run_type="llm")

def call_gemini(prompt: str, retries: int = 3):
    """
    Calls Gemini 2.5 Flash with automatic retry logic for rate limits.
    Flash models are optimized for high-speed code analysis.
    """
    for attempt in range(retries):
        try:
            # Using gemini-2.5-flash as seen in your dashboard
            response = client.models.generate_content(
                model=MODEL_NAME, 
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    # Temperature 0 ensures consistent line number identification
                    temperature=0.0 
                )
            )
            run = get_current_run_tree()
            if run and response.usage_metadata:
                run.metadata.update({
                    "usage": {
                        "prompt_tokens": response.usage_metadata.prompt_token_count,
                        "completion_tokens": response.usage_metadata.candidates_token_count,
                        "total_tokens": response.usage_metadata.total_token_count
                    },
                    "ls_model_name": MODEL_NAME,
                    "ls_provider": "google"
                })
            
            if not response.text:
                return {}
                
            return json.loads(response.text)
            
        except Exception as e:
            # Handle rate limiting (429) by waiting and retrying
            if "429" in str(e) and attempt < retries - 1:
                wait_time = (attempt + 1) * 10
                print(f"⚠️ Rate limit reached. Retrying in {wait_time}s...")
                time.sleep(wait_time)
                continue
                
            print(f"Gemini API Error: {e}")
            return {}

# Alias for compatibility with other nodes
call_qwen = call_gemini