from typing import List
from fastapi import HTTPException
from openai import AsyncOpenAI
from src.core.config import AI_API_KEY, AI_MODEL, AI_URL
from src.core.utils.prompt_builder import PromptBuilder
from src.models.comment.comment import Comment
from src.models.project.project import Project
from src.models.task.task import Task

class AIService:
    def __init__(self):
        self.client = AsyncOpenAI(
            api_key=AI_API_KEY,
            base_url=AI_URL,
            timeout=120.0,
            max_retries=2,
        )
        self.model = AI_MODEL

    async def generate_template(self, project: Project, comment: Comment, tasks: List[Task]):
        user_prompt = PromptBuilder.build_user_prompt(project, comment, tasks)

        try:        
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": PromptBuilder.get_system_prompt()},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=0.1,
                top_p=1,
                frequency_penalty=0.1,
                presence_penalty=0.0,
                stream=False,
                extra_body={"reasoning": {"enabled": True}}
            )

            return response.choices[0].message.content
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"AI service error: {e}")