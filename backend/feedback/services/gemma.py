from django.utils import text
from google import genai
from google.genai import errors
import os
import json
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

MODELS = [
    "gemma-4-26b-a4b-it",
    "gemini-2.5-flash",
    "gemini-2.0-flash",
]
DEPARTMENT_MAPPING = {
    "Healthcare": "Department of Health Services",
    "Water": "Department of Water & Sanitation",
    "Roads": "Department of Roads & Public Works",
    "Education": "Department of Education",
    "Security": "Department of Public Safety",
    "Environment": "Department of Environment & Natural Resources",
    "Agriculture": "Department of Agriculture",
    "Other": "Department of Public Works",
}
def analyze_feedback(feedback_text):
    prompt = f"""
You are an AI assistant helping county governments analyze citizen feedback for constituency development planning.

Analyze the citizen's feedback and return ONLY valid JSON.

Citizen Feedback:
"{feedback_text}"

You MUST choose exactly ONE category from this list:
- Healthcare
- Water
- Roads
- Education
- Security
- Environment
- Agriculture
- Other

DO NOT invent new category names.
DO NOT return categories like "Healthcare / Medical Supplies" or "Road Infrastructure".
Choose the closest matching category from the list above.

Priority must be exactly one of:
- Low
- Medium
- High

Generate:

- A short summary (maximum 30 words)

- One practical recommendation.

- Choose exactly ONE responsible department from this list:

• Department of Roads & Public Works
• Department of Health Services
• Department of Water & Sanitation
• Department of Education
• Department of Agriculture
• Department of Environment & Natural Resources
• Department of Public Safety
• Other

- Generate exactly THREE short action steps the department should take.
RETURN ONLY valid JSON in this format:
{{
    "category": "",
    "priority": "",
    "summary": "",
    "recommendation": "",
    "department": "",
    "action_plan": [
        "",
        "",
        ""
    ]
}}
"""

    last_error = None

    for model in MODELS:
        try:
            response = client.models.generate_content(
                model=model,
                contents=prompt,
            )

            text = response.text.replace("```json", "").replace("```", "").strip()

            result = json.loads(text)

            result["department"] = DEPARTMENT_MAPPING.get(
                result["category"],
                "Public Works"
            )

            return result
        except Exception as e:
            print(f"{model} failed: {e}")
            last_error = e

    if last_error is not None:
        raise last_error
    raise RuntimeError("Failed to analyze feedback")