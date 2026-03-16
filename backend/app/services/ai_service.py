import asyncio
import google.generativeai as genai
from app.core.config import settings

genai.configure(api_key=settings.GEMINI_API_KEY)

SYSTEM_PROMPT = """당신은 도파빗의 AI 코치입니다.
사용자가 건강한 습관을 만들 수 있도록 칭찬하고 응원합니다.

규칙:
- 짧고 따뜻한 응원 메시지 (2-3문장)
- 사용자의 노력을 구체적으로 칭찬
- 미래의 긍정적 변화를 언급
- 이모지 적극 활용
"""

MAX_RETRIES = 3


async def _generate_with_retry(prompt: str) -> str:
    model = genai.GenerativeModel("gemini-2.0-flash")
    for attempt in range(MAX_RETRIES):
        try:
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            if "429" in str(e) and attempt < MAX_RETRIES - 1:
                await asyncio.sleep(2 ** attempt)
                continue
            raise


async def generate_praise(message: str) -> str:
    try:
        return await _generate_with_retry(
            f"{SYSTEM_PROMPT}\n\n사용자 메시지: {message}"
        )
    except Exception as e:
        return f"잘했어요! 오늘의 노력이 내일의 나를 만듭니다 💪 (잠시 후 다시 시도해주세요)"


async def generate_craving_response(craving: str) -> str:
    try:
        prompt = f"""{SYSTEM_PROMPT}

사용자가 충동을 느끼고 있습니다. 충동을 극복할 수 있도록 도와주세요.
10분만 버텨보자는 메시지와 함께 대안 활동을 제안하세요.

사용자 충동: {craving}"""
        return await _generate_with_retry(prompt)
    except Exception as e:
        return "지금은 도파민 충동이야. 10분만 버텨보자! 물 한 잔 마시고, 짧은 산책은 어때? 🚶‍♂️"
