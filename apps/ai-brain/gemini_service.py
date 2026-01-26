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
        self.model_name = "gemini-1.5-flash" # Sử dụng flash cho tốc độ nhanh nhất
        
        if not self.api_keys:
            print("⚠️ WARNING: No Gemini API keys found in .env")

    def _rotate_key(self):
        """Xoay vòng API key để tránh vượt quota"""
        if not self.api_keys:
            return
        self.current_key_index = (self.current_key_index + 1) % len(self.api_keys)
        genai.configure(api_key=self.api_keys[self.current_key_index])

    async def get_response(self, user_input, lang="vi-VN"):
        if not self.api_keys:
            return None

        self._rotate_key()
        model = genai.GenerativeModel(self.model_name)
        
        system_prompt = f"""
        You are the 'Heritage Keeper', a smart AI guide for the World Robot Olympiad (WRO) 2026.
        Your goal is to provide concise, engaging facts about world heritage sites (like Trang An, Hanoi Flag Tower) 
        and help control the robot if requested.

        RULES:
        1. Keep responses short (max 2-3 sentences) for speech synthesis.
        2. Language: Response MUST be in {lang}.
        3. If the user wants to move (forward, back, stop), specify the action in JSON.
        
        RESPONSE FORMAT (JSON ONLY):
        {{
            "text": "Your spoken response here",
            "robot_move": "forward" | "backward" | "stop" | null
        }}
        """

        try:
            # Note: generate_content_async is not always available depending on version, 
            # using synchronous for reliability in this specific environment setup
            response = model.generate_content(
                f"{system_prompt}\n\nUser: {user_input}",
                generation_config=genai.types.GenerationConfig(
                    response_mime_type="application/json",
                )
            )
            data = json.loads(response.text)
            return data
        except Exception as e:
            print(f"❌ Gemini Error: {e}")
            return {{
                "text": "Xin lỗi, tôi gặp chút trục trặc khi suy nghĩ.",
                "robot_move": None
            }} if "vi" in lang else {{
                "text": "Sorry, I had a little trouble thinking.",
                "robot_move": None
            }}

gemini_service = GeminiService()
