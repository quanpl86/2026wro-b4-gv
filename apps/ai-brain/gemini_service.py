import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

class GeminiService:
    def __init__(self):
        # Thu thập tất cả các API Key có sẵn
        self.api_keys = []
        for i in range(1, 7):
            key = os.getenv(f"GEMINI_API_KEY_{i}")
            if key:
                self.api_keys.append(key)
        
        # fallback cho key mặc định nếu có
        default_key = os.getenv("GEMINI_API_KEY")
        if default_key and default_key not in self.api_keys:
            self.api_keys.insert(0, default_key)
            
        self.current_key_index = 0
        self.primary_model = "gemini-2.0-flash" # Note: Adjusted to 2.0 as 2.5 is not yet public, but can use user's string
        self.fallback_model = "gemini-1.5-pro" # Note: Adjusted to 1.5-pro as 3 is not yet public
        
        # Override with exact user requests
        self.primary_model = "gemini-2.5-flash"
        self.fallback_model = "gemini-3-pro-preview"
        
        if not self.api_keys:
            print("⚠️ WARNING: No Gemini API keys found in .env")

    def _rotate_key(self):
        """Xoay vòng API key để tránh vượt quota"""
        if not self.api_keys:
            return
        self.current_key_index = (self.current_key_index + 1) % len(self.api_keys)
        genai.configure(api_key=self.api_keys[self.current_key_index])

    async def get_response(self, user_input, lang="vi-VN", history=[]):
        if not self.api_keys:
            return None

        self._rotate_key()
        
        system_prompt = f"""
        Role: 'Heritage Keeper' AI for WRO 2026.
        Constraint: Short responses (1-2 sentences). Strict JSON output.
        Language: {lang}.

        JSON Schema:
        {{
            "text": "spoken response",
            "robot_move": "forward" | "backward" | "stop" | null,
            "emotion": "happy" | "thinking" | "sad" | "neutral"
        }}
        """

        # Construct full prompt with history
        contents = [
            {"role": "user", "parts": [system_prompt]}
        ]
        
        # Add valid history
        if history and isinstance(history, list):
            for turn in history:
                if "role" in turn and "parts" in turn:
                    contents.append(turn)

        # Add current user input
        contents.append({"role": "user", "parts": [f"User: {user_input}"]})

        try:
            # 🚀 Thử với model Flash trước
            model = genai.GenerativeModel(self.primary_model)
            response = model.generate_content(contents)
            return self._parse_json(response.text)
        except Exception as e:
            import traceback
            print(f"❌ Gemini Flash Error: {e}")
            
            # 🔄 Fallback sang model Pro nếu Flash lỗi (404 hoặc quota)
            if "404" in str(e) or "quota" in str(e).lower():
                try:
                    print(f"🔄 Falling back to {self.fallback_model}...")
                    model_pro = genai.GenerativeModel(self.fallback_model)
                    response = model_pro.generate_content(contents)
                    return self._parse_json(response.text)
                except Exception as e2:
                    print(f"❌ Gemini Fallback Error: {e2}")
                    traceback.print_exc()

            traceback.print_exc()
            return {
                "text": "Xin lỗi, tôi gặp chút trục trặc khi suy nghĩ.",
                "robot_move": None
            } if "vi" in lang else {
                "text": "Sorry, I had a little trouble thinking.",
                "robot_move": None
            }

    def _parse_json(self, text):
        """Trích xuất JSON từ phản hồi của AI"""
        try:
            clean_text = text
            if "```json" in text:
                clean_text = text.split("```json")[1].split("```")[0].strip()
            elif "```" in text:
                clean_text = text.split("```")[1].split("```")[0].strip()
            return json.loads(clean_text)
        except Exception as e:
            print(f"⚠️ JSON Parse Error: {e}")
            # Fallback nếu AI trả text trần
            return {"text": text[:200], "robot_move": None}

gemini_service = GeminiService()
