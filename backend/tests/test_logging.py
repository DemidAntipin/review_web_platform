import os
import asyncio
import unittest
from httpx import AsyncClient, ASGITransport
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from main import app
from src.models.user.user_role import UserRole
from src.models.activity_log import ActivityLog
from src.core.security import create_access_token
import time
from src.core.database import BaseDBModel, get_db_session
from src.models.user.user_role import UserRole
from datetime import datetime
from src.models.project.project import Project, ProjectStatus
from src.core.events.event_type import EventType
from src.core.events.listeners.activity_log_listener import ActivityLogListener
from src.core.events.event_dispatcher import EventDispatcher
from unittest.mock import patch

import logging
logging.getLogger('asyncio').setLevel(logging.WARNING)

import uvloop
asyncio.set_event_loop_policy(uvloop.EventLoopPolicy())

class TestLogging(unittest.IsolatedAsyncioTestCase):

    @classmethod
    def setUpClass(cls):
        cls.test_db_url = os.getenv(
            "TEST_DATABASE_URL",
            "postgresql+asyncpg://app_user:secure_password@db:5432/review_platform_test"
        )
        temp_engine = create_async_engine(cls.test_db_url, echo=False)
        async def create_tables():
            async with temp_engine.begin() as conn:
                await conn.run_sync(BaseDBModel.metadata.create_all)
        asyncio.run(create_tables())
        asyncio.run(temp_engine.dispose())

    async def asyncSetUp(self):
        self.engine = create_async_engine(self.test_db_url, echo=False, pool_size=5, max_overflow=0, pool_pre_ping=True)
        self.cleanup_engine = create_async_engine(self.test_db_url, echo=False, pool_size=1)
        self.AsyncSessionLocal = async_sessionmaker(self.engine, expire_on_commit=False)
        async def override_get_db():
            async with self.AsyncSessionLocal() as session:
                yield session
        app.dependency_overrides[get_db_session] = override_get_db      
        self.db_patcher = patch("src.core.events.listeners.activity_log_listener.DBSession", self.AsyncSessionLocal)
        self.db_patcher.start()
        EventDispatcher.add(ActivityLogListener())
        self.client = AsyncClient(transport=ASGITransport(app=app), base_url="http://test")
        author_data = {
            "username": "author",
            "email": "author@test.com",
            "role": UserRole.author,
            "password": "test"
        }
        admin_data = {
            "username": "admin",
            "email": "admin@test.com",
            "role": UserRole.admin,
            "password": "test"
        }
        self.author = (await self.client.post("/auth/register", json=author_data)).json()
        self.admin = (await self.client.post("/auth/register", json=admin_data)).json()
        author_token = (await self.client.post("/auth/login", data={"username": author_data["username"], "password": author_data["password"]})).json()["access_token"]
        admin_token = (await self.client.post("/auth/login", data={"username": admin_data["username"], "password": admin_data["password"]})).json()["access_token"]
        self.author_headers = {"Authorization": f"Bearer {author_token}"}
        self.admin_headers = {"Authorization": f"Bearer {admin_token}"}

    async def asyncTearDown(self):
        async with self.cleanup_engine.connect() as conn:
            async with conn.begin():
                for table in reversed(BaseDBModel.metadata.sorted_tables):
                    await conn.execute(text(f'TRUNCATE TABLE "{table.name}" RESTART IDENTITY CASCADE;'))
        app.dependency_overrides.clear()
        self.db_patcher.stop()
        EventDispatcher._EventDispatcher__listeners = []
        await self.client.aclose()
        await self.engine.dispose()
        await self.cleanup_engine.dispose()

    # Проверить логирование проекта. Логируется создание проекта автором.
    async def test_project_create_logging(self):
        # Подготовка
        project_data = {
            "title": "test",
            "journal": "test",
            "deadline": datetime.now().isoformat()
        }
        # Действия
        response = (await self.client.post("/projects/create_project", json=project_data, headers=self.author_headers)).json()
        async with self.AsyncSessionLocal() as session:
            result = await session.execute(select(ActivityLog))
            logs = result.scalars().all()
        # Проверки
            assert len(logs) > 0
            assert logs[0].action_type == EventType.PROJECT_CREATED.value
            assert logs[0].description == f"Создан проект '{response["title"]}' в журнале '{response["journal"]}'"
            assert logs[0].user_id == self.author["id"]
            assert logs[0].project_id == response["id"]

    # Проверить логирование проекта. Логируется присоединеник к команде проекта.
    async def test_project_member_added_logging(self):
        # Подготовка
        project_data = {
            "title": "test",
            "journal": "test",
            "deadline": datetime.now().isoformat()
        }
        response = await self.client.post("/projects/create_project", json=project_data, headers=self.author_headers)
        project_id = response.json()["id"]
        member_data = {"project_id": project_id, "user_id": self.admin["id"], "role": UserRole.coauthor}
        # Действия
        response = await self.client.post(f"/projects/{project_id}/members/add", json=member_data, headers=self.author_headers)
        async with self.AsyncSessionLocal() as session:
            result = await session.execute(select(ActivityLog).order_by(ActivityLog.created_at.desc()))
            logs = result.scalars().all()
        # Проверки
            assert len(logs) > 0
            assert logs[0].action_type == EventType.MEMBER_ADDED.value
            assert logs[0].description == f"В команду добавлен пользователь с id {self.admin["id"]}, роль {UserRole.coauthor.name})"
            assert logs[0].user_id == self.author["id"]
            assert logs[0].project_id == project_id

    # Проверить логирование проекта. Логируется выход из команды проекта.
    async def test_project_member_leave_logging(self):
        # Подготовка
        project_data = {
            "title": "test",
            "journal": "test",
            "deadline": datetime.now().isoformat()
        }
        response = await self.client.post("/projects/create_project", json=project_data, headers=self.author_headers)
        project_id = response.json()["id"]
        # Действия
        response = await self.client.delete(f"/projects/{project_id}/members/leave", headers=self.author_headers)
        async with self.AsyncSessionLocal() as session:
            result = await session.execute(select(ActivityLog).order_by(ActivityLog.created_at.desc()))
            logs = result.scalars().all()
        # Проверки
            assert len(logs) > 0
            assert logs[0].action_type == EventType.MEMBER_REMOVED.value
            assert logs[0].description == f"Из команды удалён пользователь с id {self.author["id"]}, роль {UserRole.author.name})"
            assert logs[0].user_id == self.author["id"]
            assert logs[0].project_id == project_id

    # Проверить логирование проекта. Логируется изгнание из команды проекта.
    async def test_project_member_kick_logging(self):
        # Подготовка
        project_data = {
            "title": "test",
            "journal": "test",
            "deadline": datetime.now().isoformat()
        }
        response = await self.client.post("/projects/create_project", json=project_data, headers=self.author_headers)
        project_id = response.json()["id"]
        member_data = {"project_id": project_id, "user_id": self.admin["id"], "role": UserRole.coauthor}
        response = await self.client.post(f"/projects/{project_id}/members/add", json=member_data, headers=self.author_headers)
        # Действия
        response = await self.client.delete(f"/projects/{project_id}/members/{self.admin["id"]}", headers=self.author_headers)
        async with self.AsyncSessionLocal() as session:
            result = await session.execute(select(ActivityLog).order_by(ActivityLog.created_at.desc()))
            logs = result.scalars().all()
        # Проверки
            assert len(logs) > 0
            assert logs[0].action_type == EventType.MEMBER_REMOVED.value
            assert logs[0].description == f"Из команды удалён пользователь с id {self.admin["id"]}, роль {UserRole.coauthor.name})"
            assert logs[0].user_id == self.author["id"]
            assert logs[0].project_id == project_id

    # Проверить логирование проекта. Логируется архивирование проекта.
    async def test_project_archive_logging(self):
        # Подготовка
        project_data = {
            "title": "test",
            "journal": "test",
            "deadline": datetime.now().isoformat()
        }
        response = await self.client.post("/projects/create_project", json=project_data, headers=self.author_headers)
        project_id = response.json()["id"]
        # Действия
        response = await self.client.delete(f"/projects/{project_id}", headers=self.author_headers)
        async with self.AsyncSessionLocal() as session:
            result = await session.execute(select(ActivityLog).order_by(ActivityLog.created_at.desc()))
            logs = result.scalars().all()
        # Проверки
            assert len(logs) > 0
            assert logs[0].action_type == EventType.PROJECT_ARCHIVED.value
            assert logs[0].description == f"Проект перемещён в архив"
            assert logs[0].user_id == self.author["id"]
            assert logs[0].project_id == project_id

    # Проверить логирование проекта. Логируется обновление проекта.
    async def test_project_update_logging(self):
        # Подготовка
        project_data = {
            "title": "test",
            "journal": "test",
            "deadline": datetime.now().isoformat()
        }
        response = await self.client.post("/projects/create_project", json=project_data, headers=self.author_headers)
        project_id = response.json()["id"]
        update_data = {"title": "new_title", "journal": "new_journal", "status": ProjectStatus.done}
        # Действия
        response = await self.client.patch(f"/projects/{project_id}", json=update_data, headers=self.author_headers)
        async with self.AsyncSessionLocal() as session:
            result = await session.execute(select(ActivityLog).order_by(ActivityLog.created_at.desc()))
            logs = result.scalars().all()
        # Проверки
            assert len(logs) > 0
            assert logs[0].action_type == EventType.PROJECT_UPDATED.value
            assert logs[0].description == f"Обновлены поля проекта: {list(update_data.keys())}"
            assert logs[0].user_id == self.author["id"]
            assert logs[0].project_id == project_id

    # Проверить логирование проекта. Администратор может читать логи.
    async def test_logging_get_logs_admin(self):
        # Подготовка
        project_data = {
            "title": "test",
            "journal": "test",
            "deadline": datetime.now().isoformat()
        }
        response = await self.client.post("/projects/create_project", json=project_data, headers=self.author_headers)
        project = response.json()
        # Действия
        response = await self.client.post(f"/logs/", json={}, headers=self.admin_headers)
        # Проверки
        assert response.status_code == 200
        logs = response.json()
        assert len(logs) > 0
        assert logs[0]["description"] == f"Создан проект '{project["title"]}' в журнале '{project["journal"]}'"
        assert logs[0]["user_id"] == self.author["id"]
        assert logs[0]["project_id"] == project["id"]

    # Проверить логирование проекта. Ошибка при недостатке прав на выполнение операции.
    async def test_logging_get_logs_others(self):
        # Подготовка
        project_data = {
            "title": "test",
            "journal": "test",
            "deadline": datetime.now().isoformat()
        }
        response = await self.client.post("/projects/create_project", json=project_data, headers=self.author_headers)
        # Действия
        response = await self.client.post(f"/logs/", json={}, headers=self.author_headers)
        # Проверки
        assert response.status_code == 403
        assert response.json()["detail"] == "Недостаточно прав для выполнения операции"

    # Проверить логирование проекта. Ошибка при запросе не авторизованного пользователя.
    async def test_logging_get_logs_unauthorized(self):
        # Подготовка
        project_data = {
            "title": "test",
            "journal": "test",
            "deadline": datetime.now().isoformat()
        }
        response = await self.client.post("/projects/create_project", json=project_data, headers=self.author_headers)
        project = response.json()
        # Действия
        response = await self.client.post(f"/logs/", json={})
        # Проверки
        assert response.status_code == 401
        assert response.json()["detail"] == "Not authenticated"

    # Проверить логирование проекта. Фильтрация логов по времени.
    async def test_logging_filters_datetime(self):
        # Подготовка
        project_data = {
            "title": "test",
            "journal": "test",
            "deadline": datetime.now().isoformat()
        }
        response = await self.client.post("/projects/create_project", json=project_data, headers=self.author_headers)
        project = response.json()
        # Действия
        response_include = await self.client.post(f"/logs/", json={"start_period": datetime(2020, 5, 12).isoformat(), "end_period": datetime(2027, 5, 12).isoformat()}, headers=self.admin_headers)
        response_after = await self.client.post(f"/logs/", json={"start_period": datetime(2027, 5, 12).isoformat()}, headers=self.admin_headers)
        response_before = await self.client.post(f"/logs/", json={"end_period": datetime(2020, 5, 12).isoformat()}, headers=self.admin_headers)
        # Проверки
        assert response_include.status_code == 200
        assert response_before.status_code == 200
        assert response_after.status_code == 200
        assert len(response_before.json()) == 0
        assert len(response_after.json()) == 0
        assert len(response_include.json()) == 1


    # Проверить логирование проекта. Фильтрация логов по пользователю.
    async def test_logging_filters_users(self):
        # Подготовка
        project_data = {
            "title": "test",
            "journal": "test",
            "deadline": datetime.now().isoformat()
        }
        response = await self.client.post("/projects/create_project", json=project_data, headers=self.author_headers)
        project_id = response.json()["id"]
        update_data = {"title": "new_title", "journal": "new_journal", "status": ProjectStatus.done}
        response = await self.client.patch(f"/projects/{project_id}", json=update_data, headers=self.admin_headers)
        # Действия
        response_unfiltered = await self.client.post(f"/logs/", json={}, headers=self.admin_headers)
        response_author = await self.client.post(f"/logs/", json={"user_ids": [self.author["id"]]}, headers=self.admin_headers)
        response_admin = await self.client.post(f"/logs/", json={"user_ids": [self.admin["id"]]}, headers=self.admin_headers)
        # Проверки
        assert response_unfiltered.status_code == 200
        assert response_author.status_code == 200
        assert response_admin.status_code == 200
        assert len(response_unfiltered.json()) == 2
        assert len(response_author.json()) == 1
        assert len(response_admin.json()) == 1
        assert response_admin.json()[0] in response_unfiltered.json()
        assert response_author.json()[0] in response_unfiltered.json()

    # Проверить логирование проекта. Фильтрация логов по проектам.
    async def test_logging_filters_projects(self):
        # Подготовка
        project_data = {
            "title": "test",
            "journal": "test",
            "deadline": datetime.now().isoformat()
        }
        project_data2 = {
            "title": "test2",
            "journal": "test2",
            "deadline": datetime.now().isoformat()
        }
        response = await self.client.post("/projects/create_project", json=project_data, headers=self.author_headers)
        response = await self.client.post("/projects/create_project", json=project_data2, headers=self.author_headers)
        # Действия
        response_unfiltered = await self.client.post(f"/logs/", json={}, headers=self.admin_headers)
        response = await self.client.post(f"/logs/", json={"project_ids": [1]}, headers=self.admin_headers)
        response2 = await self.client.post(f"/logs/", json={"project_ids": [2]}, headers=self.admin_headers)
        # Проверки
        assert response_unfiltered.status_code == 200
        assert response.status_code == 200
        assert response2.status_code == 200
        assert len(response_unfiltered.json()) == 2
        assert len(response.json()) == 1
        assert len(response2.json()) == 1
        assert response.json()[0] in response_unfiltered.json()
        assert response2.json()[0] in response_unfiltered.json()

if __name__ == "__main__":
    unittest.main()