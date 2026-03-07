import os
import time
import unittest
from unittest.mock import patch
import asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy import text
from src.core.database import BaseDBModel, get_db_session
from src.models.user.user_role import UserRole
from datetime import datetime
from main import app
from src.models.project.project_status import ProjectStatus
from sqlalchemy import select
from src.models.project_member import ProjectMember
from src.models.project.project import Project

import uvloop
asyncio.set_event_loop_policy(uvloop.EventLoopPolicy())

class TestProjects(unittest.IsolatedAsyncioTestCase):

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
        coauthor_data = {
            "username": "coauthor",
            "email": "coauthor@test.com",
            "role": UserRole.coauthor,
            "password": "test"
        }
        self.author = (await self.client.post("/auth/register", json=author_data)).json()
        self.coauthor = (await self.client.post("/auth/register", json=coauthor_data)).json()
        self.admin = (await self.client.post("/auth/register", json=admin_data)).json()
        author_token = (await self.client.post("/auth/login", data={"username": author_data["username"], "password": author_data["password"]})).json()["access_token"]
        coauthor_token = (await self.client.post("/auth/login", data={"username": coauthor_data["username"], "password": coauthor_data["password"]})).json()["access_token"]
        admin_token = (await self.client.post("/auth/login", data={"username": admin_data["username"], "password": admin_data["password"]})).json()["access_token"]
        self.author_headers = {"Authorization": f"Bearer {author_token}"}
        self.coauthor_headers = {"Authorization": f"Bearer {coauthor_token}"}
        self.admin_headers = {"Authorization": f"Bearer {admin_token}"}

    async def asyncTearDown(self):
        async with self.cleanup_engine.connect() as conn:
            async with conn.begin():
                for table in reversed(BaseDBModel.metadata.sorted_tables):
                    await conn.execute(text(f'TRUNCATE TABLE "{table.name}" RESTART IDENTITY CASCADE;'))
        app.dependency_overrides.clear()
        await self.client.aclose()
        await self.engine.dispose()
        await self.cleanup_engine.dispose()

    # Проверить создание проекта. Успех.
    async def test_create_project_success(self):
        # Подготовка
        data = {
            "title": "test",
            "journal": "test",
            "deadline": datetime.now().isoformat()
        }
        # Действия
        response = await self.client.post("/projects/create_project", json=data, headers=self.author_headers)
        # Проверки
        assert response.status_code == 200
        project = response.json()
        assert project["title"] == data["title"]
        assert project["journal"] == data["journal"]
        assert project["status"] == ProjectStatus.in_progress
        assert project["deadline"] == data["deadline"]
        assert "id" in project

    # Проверить создание проекта. Ошибка при запросе от неавторизированного пользователя.
    async def test_create_project_unauthorized(self):
        # Подготовка
        data = {
            "title": "test",
            "journal": "test",
            "deadline": datetime.now().isoformat()
        }
        # Действия
        response = await self.client.post("/projects/create_project", json=data)
        # Проверки
        assert response.status_code == 401
        assert response.json()["detail"] == "Not authenticated"

    # Проверить создание проекта. Ошибка при пропуске обязательного поля - заголовка проекта.
    async def test_create_project_missing_title(self):
        # Подготовка
        data = {"journal": "test", "deadline": datetime.now().isoformat()}
        # Действия
        response = await self.client.post("/projects/create_project", json=data, headers=self.author_headers)
        # Проверки
        assert response.status_code == 422
        assert "title" in str(response.json()["detail"])
        
    # Проверить создание проекта. Ошибка при пропуске обязательного поля - научного журнала.
    async def test_create_project_missing_journal(self):
        # Подготовка
        data = {"title": "test", "deadline": datetime.now().isoformat()}
        # Действия
        response = await self.client.post("/projects/create_project", json=data, headers=self.author_headers)
        # Проверки
        assert response.status_code == 422
        assert "journal" in str(response.json()["detail"])

    # Проверить создание проекта. Ошибка при пропуске обязательного поля - дедлайна проекта.
    async def test_create_project_missing_deadline(self):
        # Подготовка
        data = {"title": "test", "title": "test"}
        # Действия
        response = await self.client.post("/projects/create_project", json=data, headers=self.author_headers)
        # Проверки
        assert response.status_code == 422
        assert "deadline" in str(response.json()["detail"])

    # Проверить список проектов пользователя. У пользователя нет проектов -> возвращается пустой список
    async def test_projects_list_empty(self):
        # Подготовка
        # Действия
        response = await self.client.get("/projects/my_projects", headers=self.author_headers)
        # Проверки
        assert response.status_code == 200
        assert isinstance(response.json(), list)
        assert len(response.json()) == 0

    # Проверить список проектов пользователя. Пользователь получает список своих проектов.
    async def test_projects_list_not_empty(self):
        # Подготовка
        data = {"title": "test", "journal": "test", "deadline": datetime.now().isoformat()}
        response = await self.client.post("/projects/create_project", json=data, headers=self.author_headers)
        # Действия
        response = await self.client.get("/projects/my_projects", headers=self.author_headers)
        # Проверки
        assert response.status_code == 200
        assert isinstance(response.json(), list)
        assert len(response.json()) == 1
        project = response.json()[0]
        assert project["title"] == data["title"]
        assert project["journal"] == data["journal"]

    # Проверить список проектов пользователя. Ошибка при запросе от неавторизированного пользователя.
    async def test_projects_list_unauthorized(self):
        # Подготовка
        # Действия
        response = await self.client.get("/projects/my_projects")
        # Проверки
        assert response.status_code == 401
        assert response.json()["detail"] == "Not authenticated"

    # Проверить доступ к проекту. Успешное получение проекта для участника (к которым автоматически присоединяется автор).
    async def test_get_project_success(self):
        # Подготовка
        data = {"title": "test", "journal": "test", "deadline": datetime.now().isoformat()}
        response = await self.client.post("/projects/create_project", json=data, headers=self.author_headers)
        project_id = response.json()["id"]
        # Действия  
        response = await self.client.get(f"/projects/{project_id}", headers=self.author_headers)
        # Проверки
        assert response.status_code == 200
        assert response.json()["title"] == "test"
        assert response.json()["journal"] == "test"

    # Проверить доступ к проекту. Ошибка при запросе несуществующего проекта.
    async def test_get_project_invalid_project(self):
        # Подготовка
        project_id = 999999
        # Действия  
        response = await self.client.get(f"/projects/{project_id}", headers=self.author_headers)
        # Проверки
        assert response.status_code == 404
        assert response.json()["detail"] == "Проект не найден"


    # Проверить доступ к проекту. Ошибка при запросе от неавторизированного пользователя.
    async def test_get_project_unauthorized(self):
        # Подготовка
        data = {"title": "test", "journal": "test", "deadline": datetime.now().isoformat()}
        response = await self.client.post("/projects/create_project", json=data, headers=self.author_headers)
        project_id = response.json()["id"]
        # Действия  
        response = await self.client.get(f"/projects/{project_id}")
        # Проверки
        assert response.status_code == 401
        assert response.json()["detail"] == "Not authenticated"

    # Проверить доступ к проекту. Успешное получение проекта для администратора.
    async def test_get_project_admin(self):
        # Подготовка
        data = {"title": "test", "journal": "test", "deadline": datetime.now().isoformat()}
        response = await self.client.post("/projects/create_project", json=data, headers=self.author_headers)
        project_id = response.json()["id"]
        # Действия  
        response = await self.client.get(f"/projects/{project_id}", headers=self.admin_headers)
        # Проверки
        assert response.status_code == 200
        assert response.json()["title"] == "test"
        assert response.json()["journal"] == "test"

    # Проверить доступ к проекту. Ошибка при получении проекта не для участника.
    async def test_get_project_not_member_error(self):
        # Подготовка
        data = {"title": "test", "journal": "test", "deadline": datetime.now().isoformat()}
        response = await self.client.post("/projects/create_project", json=data, headers=self.author_headers)
        project_id = response.json()["id"]
        # Действия  
        response = await self.client.get(f"/projects/{project_id}", headers=self.coauthor_headers)
        # Проверки
        assert response.status_code == 403
        assert response.json()["detail"] == "Недостаточно прав для выполнения операции"

    # Проверить добавление участника в проект. Успешное добавление участника.
    async def test_add_member_success(self):
        # Подготовка
        data = {"title": "test", "journal": "test", "deadline": datetime.now().isoformat()}
        response = await self.client.post("/projects/create_project", json=data, headers=self.author_headers)
        project_id = response.json()["id"]
        member_data = {"project_id": project_id, "user_id": self.coauthor["id"], "role": UserRole.coauthor}
        # Действие
        response = await self.client.post(f"/projects/{project_id}/members/add", json=member_data, headers=self.author_headers)
        # Проверки
        assert response.status_code == 200
        assert response.json()["user_id"] == self.coauthor["id"]
        assert response.json()["project_id"] == project_id
        assert response.json()["role"] == UserRole.coauthor
        response = await self.client.get(f"/projects/{project_id}", headers=self.coauthor_headers)
        assert response.status_code == 200

    # Проверить добавление участника в проект. Добавление участника от лица администратора.
    async def test_add_member_as_admin(self):
        # Подготовка
        data = {"title": "test", "journal": "test", "deadline": datetime.now().isoformat()}
        response = await self.client.post("/projects/create_project", json=data, headers=self.author_headers)
        project_id = response.json()["id"]
        member_data = {"project_id": project_id, "user_id": self.coauthor["id"], "role": UserRole.coauthor}
        # Действие
        response = await self.client.post(f"/projects/{project_id}/members/add", json=member_data, headers=self.admin_headers)
        # Проверки
        assert response.status_code == 200
        assert response.json()["user_id"] == self.coauthor["id"]
        assert response.json()["project_id"] == project_id
        assert response.json()["role"] == UserRole.coauthor
        response = await self.client.get(f"/projects/{project_id}", headers=self.coauthor_headers)
        assert response.status_code == 200

    # Проверить добавление участника в проект. Ошибка при недостатке прав на выполнение операции.
    async def test_add_member_without_permission(self):
        # Подготовка
        data = {"title": "test", "journal": "test", "deadline": datetime.now().isoformat()}
        response = await self.client.post("/projects/create_project", json=data, headers=self.author_headers)
        project_id = response.json()["id"]
        member_data = {"project_id": project_id, "user_id": self.coauthor["id"], "role": UserRole.coauthor}
        # Действие
        response = await self.client.post(f"/projects/{project_id}/members/add", json=member_data, headers=self.coauthor_headers)
        # Проверки
        assert response.status_code == 403
        assert response.json()["detail"] == "Недостаточно прав для выполнения операции"

    # Проверить добавление участника в проект. Ошибка при запросе от неавторизированного пользователя.
    async def test_add_member_unauthorized(self):
        # Подготовка
        data = {"title": "test", "journal": "test", "deadline": datetime.now().isoformat()}
        response = await self.client.post("/projects/create_project", json=data, headers=self.author_headers)
        project_id = response.json()["id"]
        member_data = {"project_id": project_id, "user_id": self.coauthor["id"], "role": UserRole.coauthor}
        # Действие
        response = await self.client.post(f"/projects/{project_id}/members/add", json=member_data)
        # Проверки
        assert response.status_code == 401
        assert response.json()["detail"] == "Not authenticated"

    # Проверить добавление участника в проект. Ошибка при запросе несуществующего проекта.
    async def test_add_member_invalid_project(self):
        # Подготовка
        project_id = 999999
        member_data = {"project_id": project_id, "user_id": self.coauthor["id"], "role": UserRole.coauthor}
        # Действие
        response = await self.client.post(f"/projects/{project_id}/members/add", json=member_data, headers=self.author_headers)
        # Проверки
        assert response.status_code == 404
        assert response.json()["detail"] == "Проект не найден"

    # Проверить добавление участника в проект. Ошибка при запросе несуществующего пользователя.
    async def test_add_member_invalid_user(self):
        # Подготовка
        data = {"title": "test", "journal": "test", "deadline": datetime.now().isoformat()}
        response = await self.client.post("/projects/create_project", json=data, headers=self.author_headers)
        project_id = response.json()["id"]
        member_data = {"project_id": project_id, "user_id": 999999, "role": UserRole.coauthor}
        # Действие
        response = await self.client.post(f"/projects/{project_id}/members/add", json=member_data, headers=self.author_headers)
        # Проверки
        assert response.status_code == 404
        assert response.json()["detail"] == "Пользователь не найден"

    # Проверить добавление участника в проект. Ошибка при попытке добавить пользователя, уже являющегося участником проекта.
    async def test_add_member_already_member(self):
        # Подготовка
        data = {"title": "test", "journal": "test", "deadline": datetime.now().isoformat()}
        response = await self.client.post("/projects/create_project", json=data, headers=self.author_headers)
        project_id = response.json()["id"]
        member_data = {"project_id": project_id, "user_id": self.coauthor["id"], "role": UserRole.coauthor}
        # Действие
        response = await self.client.post(f"/projects/{project_id}/members/add", json=member_data, headers=self.author_headers)
        response = await self.client.post(f"/projects/{project_id}/members/add", json=member_data, headers=self.author_headers)
        # Проверки
        assert response.status_code == 400
        assert response.json()["detail"] == "Пользователь уже является участником проекта"

    # Проверить добавление участника в проект. Ошибка при пропуске обязательного поля - id проекта.
    async def test_add_member_missing_project(self):
        # Подготовка
        data = {"title": "test", "journal": "test", "deadline": datetime.now().isoformat()}
        response = await self.client.post("/projects/create_project", json=data, headers=self.author_headers)
        project_id = response.json()["id"]
        member_data = {"user_id": self.coauthor["id"], "role": UserRole.coauthor}
        # Действие
        response = await self.client.post(f"/projects/{project_id}/members/add", json=member_data, headers=self.author_headers)
        # Проверки
        assert response.status_code == 422
        assert "project_id" in str(response.json()["detail"])

    # Проверить добавление участника в проект. Ошибка при пропуске обязательного поля - id пользователя.
    async def test_add_member_missing_user(self):
        # Подготовка
        data = {"title": "test", "journal": "test", "deadline": datetime.now().isoformat()}
        response = await self.client.post("/projects/create_project", json=data, headers=self.author_headers)
        project_id = response.json()["id"]
        member_data = {"project_id": project_id, "role": UserRole.coauthor}
        # Действие
        response = await self.client.post(f"/projects/{project_id}/members/add", json=member_data, headers=self.author_headers)
        # Проверки
        assert response.status_code == 422
        assert "user_id" in str(response.json()["detail"])

    # Проверить добавление участника в проект. Ошибка при пропуске обязательного поля - роли пользователя в проекте.
    async def test_add_member_missing_role(self):
        # Подготовка
        data = {"title": "test", "journal": "test", "deadline": datetime.now().isoformat()}
        response = await self.client.post("/projects/create_project", json=data, headers=self.author_headers)
        project_id = response.json()["id"]
        member_data = {"project_id": project_id, "user_id": self.coauthor["id"]}
        # Действие
        response = await self.client.post(f"/projects/{project_id}/members/add", json=member_data, headers=self.author_headers)
        # Проверки
        assert response.status_code == 422
        assert "role" in str(response.json()["detail"])

    # Проверить исключение из участников проекта. Пользователь успешно выходит из проекта.
    async def test_leave_project_success(self):
        # Подготовка
        data = {"title": "test", "journal": "test", "deadline": datetime.now().isoformat()}
        response = await self.client.post("/projects/create_project", json=data, headers=self.author_headers)
        project_id = response.json()["id"]
        # Действие
        response = await self.client.delete(f"/projects/{project_id}/members/leave", headers=self.author_headers)
        # Проверки
        assert response.status_code == 200
        assert response.json()["message"] == "Вы успешно покинули проект"

    # Проверить исключение из участников проекта. Ошибка при попытке выйти, не являясь участником проекта.
    async def test_leave_project_not_member(self):
        # Подготовка
        data = {"title": "test", "journal": "test", "deadline": datetime.now().isoformat()}
        response = await self.client.post("/projects/create_project", json=data, headers=self.author_headers)
        project_id = response.json()["id"]
        # Действие
        response = await self.client.delete(f"/projects/{project_id}/members/leave", headers=self.author_headers)
        response = await self.client.delete(f"/projects/{project_id}/members/leave", headers=self.author_headers)
        # Проверки
        assert response.status_code == 404
        assert response.json()["detail"] == "Вы не являетесь участником этого проекта"

    # Проверить исключение из участников проекта. Ошибка при попытке выйти, из несуществующего проекта.
    async def test_leave_project_invalid_project(self):
        # Подготовка
        project_id = 999999
        # Действие
        response = await self.client.delete(f"/projects/{project_id}/members/leave", headers=self.author_headers)
        # Проверки
        assert response.status_code == 404
        assert response.json()["detail"] == "Проект не найден"

    # Проверить исключение из участников проекта. Ошибка при запросе от неавторизированного пользователя.
    async def test_leave_project_unauthorized(self):
        # Подготовка
        data = {"title": "test", "journal": "test", "deadline": datetime.now().isoformat()}
        response = await self.client.post("/projects/create_project", json=data, headers=self.author_headers)
        project_id = response.json()["id"]
        # Действие
        response = await self.client.delete(f"/projects/{project_id}/members/leave")
        # Проверки
        assert response.status_code == 401
        assert response.json()["detail"] == "Not authenticated"

    # Проверить исключение из участников проекта. Проверка мягкого удаления участников проекта.
    async def test_soft_delete_project_member(self):
        # Подготовка
        data = {"title": "test", "journal": "test", "deadline": datetime.now().isoformat()}
        response = await self.client.post("/projects/create_project", json=data, headers=self.author_headers)
        project_id = response.json()["id"]
        # Действие
        response = await self.client.delete(f"/projects/{project_id}/members/leave", headers=self.author_headers)
        async with self.AsyncSessionLocal() as session:
            query = select(ProjectMember).where(ProjectMember.project_id == project_id, ProjectMember.user_id == self.author["id"])
            result = await session.execute(query)
            member = result.scalar_one()
        # Проверки
        assert member is not None
        assert isinstance(member.left_at, datetime)

    # Проверить восстановление участника после мягкого удаления.
    async def test_restore_project_member(self):
        # Подготовка
        data = {"title": "test", "journal": "test", "deadline": datetime.now().isoformat()}
        response = await self.client.post("/projects/create_project", json=data, headers=self.author_headers)
        project_id = response.json()["id"]
        response = await self.client.delete(f"/projects/{project_id}/members/leave", headers=self.author_headers)
        member_data = {"project_id": project_id, "user_id": self.author["id"], "role": UserRole.author}
        # Действие
        response = await self.client.post(f"/projects/{project_id}/members/add", json=member_data, headers=self.admin_headers)
        # Проверки
        assert response.status_code == 200
        assert response.json()["user_id"] == self.author["id"]
        assert response.json()["project_id"] == project_id
        assert response.json()["role"] == UserRole.author
        response = await self.client.get(f"/projects/{project_id}", headers=self.author_headers)
        assert response.status_code == 200

    # Проверить исключение участника проекта. Успешное исключение из команды.
    async def test_remove_project_member_success(self):
        # Подготовка
        data = {"title": "test", "journal": "test", "deadline": datetime.now().isoformat()}
        response = await self.client.post("/projects/create_project", json=data, headers=self.author_headers)
        project_id = response.json()["id"]
        member_data = {"project_id": project_id, "user_id": self.coauthor["id"], "role": UserRole.coauthor}
        response = await self.client.post(f"/projects/{project_id}/members/add", json=member_data, headers=self.author_headers)
        # Действие
        response = await self.client.delete(f"/projects/{project_id}/members/{self.coauthor["id"]}", headers=self.author_headers)
        # Проверки
        assert response.status_code == 200
        assert response.json()["message"] == "Пользователь исключён из команды проекта"

    # Проверить исключение участника проекта. Ошибка при попытке исключить не участника команды проекта.
    async def test_remove_project_member_not_member(self):
        # Подготовка
        data = {"title": "test", "journal": "test", "deadline": datetime.now().isoformat()}
        response = await self.client.post("/projects/create_project", json=data, headers=self.author_headers)
        project_id = response.json()["id"]
        # Действие
        response = await self.client.delete(f"/projects/{project_id}/members/{self.coauthor["id"]}", headers=self.author_headers)
        # Проверки
        assert response.status_code == 404
        assert response.json()["detail"] == "Пользователь не является участником проекта"

    # Проверить исключение участника проекта. Ошибка при запросе несуществующего проекта.
    async def test_remove_project_member_invalid_project(self):
        # Подготовка
        project_id = 999999
        # Действие
        response = await self.client.delete(f"/projects/{project_id}/members/{self.coauthor["id"]}", headers=self.author_headers)
        # Проверки
        assert response.status_code == 404
        assert response.json()["detail"] == "Проект не найден"

    # Проверить исключение участника проекта. Ошибка при запросе несуществующего пользователя.
    async def test_remove_project_member_invalid_user(self):
        # Подготовка
        data = {"title": "test", "journal": "test", "deadline": datetime.now().isoformat()}
        response = await self.client.post("/projects/create_project", json=data, headers=self.author_headers)
        project_id = response.json()["id"]
        # Действие
        response = await self.client.delete(f"/projects/{project_id}/members/{999999}", headers=self.author_headers)
        # Проверки
        assert response.status_code == 404
        assert response.json()["detail"] == "Пользователь не найден"

    # Проверить исключение участника проекта. Ошибка при запросе не авторизованного пользователя.
    async def test_remove_project_member_unauthorized(self):
        # Подготовка
        data = {"title": "test", "journal": "test", "deadline": datetime.now().isoformat()}
        response = await self.client.post("/projects/create_project", json=data, headers=self.author_headers)
        project_id = response.json()["id"]
        member_data = {"project_id": project_id, "user_id": self.coauthor["id"], "role": UserRole.coauthor}
        response = await self.client.post(f"/projects/{project_id}/members/add", json=member_data, headers=self.author_headers)
        # Действие
        response = await self.client.delete(f"/projects/{project_id}/members/{self.coauthor["id"]}")
        # Проверки
        assert response.status_code == 401
        assert response.json()["detail"] == "Not authenticated"

    # Проверить исключение участника проекта. Успешное исключение из команды от лица администратора.
    async def test_remove_project_member_as_admin(self):
        # Подготовка
        data = {"title": "test", "journal": "test", "deadline": datetime.now().isoformat()}
        response = await self.client.post("/projects/create_project", json=data, headers=self.author_headers)
        project_id = response.json()["id"]
        member_data = {"project_id": project_id, "user_id": self.coauthor["id"], "role": UserRole.coauthor}
        response = await self.client.post(f"/projects/{project_id}/members/add", json=member_data, headers=self.author_headers)
        # Действие
        response = await self.client.delete(f"/projects/{project_id}/members/{self.coauthor["id"]}", headers=self.admin_headers)
        # Проверки
        assert response.status_code == 200
        assert response.json()["message"] == "Пользователь исключён из команды проекта"

    # Проверить исключение участника проекта. Ошибка при недостатке прав на выполнение операции.
    async def test_remove_project_member_without_permission(self):
        # Подготовка
        data = {"title": "test", "journal": "test", "deadline": datetime.now().isoformat()}
        response = await self.client.post("/projects/create_project", json=data, headers=self.author_headers)
        project_id = response.json()["id"]
        member_data = {"project_id": project_id, "user_id": self.coauthor["id"], "role": UserRole.coauthor}
        response = await self.client.post(f"/projects/{project_id}/members/add", json=member_data, headers=self.author_headers)
        # Действие
        response = await self.client.delete(f"/projects/{project_id}/members/{self.coauthor["id"]}", headers=self.coauthor_headers)
        # Проверки
        assert response.status_code == 403
        assert response.json()["detail"] == "Недостаточно прав для выполнения операции"

    # Проверить архивирование проекта. Успешное архивирование проекта.
    async def test_achive_project_success(self):
        # Подготовка
        data = {"title": "test", "journal": "test", "deadline": datetime.now().isoformat()}
        response = await self.client.post("/projects/create_project", json=data, headers=self.author_headers)
        project_id = response.json()["id"]
        # Действия
        response = await self.client.delete(f"/projects/{project_id}", headers=self.author_headers)
        # Проверки
        assert response.status_code == 200
        assert response.json()["message"] == "Проект перемещён в архив"

    # Проверить архивирование проекта. Ошибка при недостатке прав на выполнение операции.
    async def test_archive_project_without_permission(self):
        # Подготовка
        data = {"title": "test", "journal": "test", "deadline": datetime.now().isoformat()}
        response = await self.client.post("/projects/create_project", json=data, headers=self.author_headers)
        project_id = response.json()["id"]
        # Действие
        response = await self.client.delete(f"/projects/{project_id}", headers=self.coauthor_headers)
        # Проверки
        assert response.status_code == 403
        assert response.json()["detail"] == "Недостаточно прав для выполнения операции"

    # Проверить архивирование проекта. Успешное архивирование проекта от лица администратора.
    async def test_achive_project_as_admin(self):
        # Подготовка
        data = {"title": "test", "journal": "test", "deadline": datetime.now().isoformat()}
        response = await self.client.post("/projects/create_project", json=data, headers=self.author_headers)
        project_id = response.json()["id"]
        # Действия
        response = await self.client.delete(f"/projects/{project_id}", headers=self.admin_headers)
        # Проверки
        assert response.status_code == 200
        assert response.json()["message"] == "Проект перемещён в архив"

    # Проверить архивирование проекта. Ошибка при запросе не авторизованного пользователя.
    async def test_achive_project_unauthorized(self):
        # Подготовка
        data = {"title": "test", "journal": "test", "deadline": datetime.now().isoformat()}
        response = await self.client.post("/projects/create_project", json=data, headers=self.author_headers)
        project_id = response.json()["id"]
        # Действия
        response = await self.client.delete(f"/projects/{project_id}")
        # Проверки
        assert response.status_code == 401
        assert response.json()["detail"] == "Not authenticated"

    # Проверить архивирование проекта. Ошибка при запросе несуществующего проекта
    async def test_achive_project_invalid_project(self):
        # Подготовка
        # Действия
        response = await self.client.delete(f"/projects/{999999}", headers=self.author_headers)
        # Проверки
        assert response.status_code == 404
        assert response.json()["detail"] == "Проект не найден"

    # Проверить архивирование проекта. Проверка мягкого удаления проекта.
    async def test_soft_delete_project(self):
        # Подготовка
        data = {"title": "test", "journal": "test", "deadline": datetime.now().isoformat()}
        response = await self.client.post("/projects/create_project", json=data, headers=self.author_headers)
        project_id = response.json()["id"]
        # Действие
        response = await self.client.delete(f"/projects/{project_id}", headers=self.author_headers)
        async with self.AsyncSessionLocal() as session:
            query = select(Project).where(Project.id == project_id)
            result = await session.execute(query)
            project = result.scalar_one()
        # Проверки
        assert project is not None
        assert isinstance(project.deleted_at, datetime)

    # Проверить обновление проекта. Успешное обновление проекта.
    async def test_update_project_success(self):
        # Подготовка
        data = {"title": "test", "journal": "test", "deadline": datetime.now().isoformat()}
        response = await self.client.post("/projects/create_project", json=data, headers=self.author_headers)
        project_id = response.json()["id"]
        update_data = {"title": "new_title", "journal": "new_journal", "status": ProjectStatus.done}
        # Действие
        response = await self.client.patch(f"/projects/{project_id}", json=update_data, headers=self.author_headers)
        # Проверки
        assert response.status_code == 200
        assert response.json()["title"] == "new_title"
        assert response.json()["journal"] == "new_journal"
        assert response.json()["status"] == ProjectStatus.done
        assert "id" in str(response.json())

    # Проверить обновление проекта. Успешное обновление проекта от лица администратора.
    async def test_update_project_as_admin(self):
        # Подготовка
        data = {"title": "test", "journal": "test", "deadline": datetime.now().isoformat()}
        response = await self.client.post("/projects/create_project", json=data, headers=self.author_headers)
        project_id = response.json()["id"]
        update_data = {"title": "new_title", "journal": "new_journal", "status": ProjectStatus.done}
        # Действие
        response = await self.client.patch(f"/projects/{project_id}", json=update_data, headers=self.admin_headers)
        # Проверки
        assert response.status_code == 200
        assert response.json()["title"] == "new_title"
        assert response.json()["journal"] == "new_journal"
        assert response.json()["status"] == ProjectStatus.done
        assert "id" in str(response.json())

    # Проверить обновление проекта. Ошибка при запросе не авторизованного пользователя.
    async def test_update_project_unauthorized(self):
        # Подготовка
        data = {"title": "test", "journal": "test", "deadline": datetime.now().isoformat()}
        response = await self.client.post("/projects/create_project", json=data, headers=self.author_headers)
        project_id = response.json()["id"]
        update_data = {"title": "new_title", "journal": "new_journal", "status": ProjectStatus.done}
        # Действие
        response = await self.client.patch(f"/projects/{project_id}", json=update_data)
        # Проверки
        assert response.status_code == 401
        assert response.json()["detail"] == "Not authenticated"

    # Проверить обновление проекта. Ошибка при запросе несуществующего проекта
    async def test_update_project_invalid_project(self):
        # Подготовка
        update_data = {"title": "new_title", "journal": "new_journal", "status": ProjectStatus.done}
        # Действие
        response = await self.client.patch(f"/projects/{999999}", json=update_data, headers=self.author_headers)
        # Проверки
        assert response.status_code == 404
        assert response.json()["detail"] == "Проект не найден"

    # Проверить обновление проекта. Ошибка при недостатке прав на выполнение операции.
    async def test_update_project_without_permission(self):
        # Подготовка
        data = {"title": "test", "journal": "test", "deadline": datetime.now().isoformat()}
        response = await self.client.post("/projects/create_project", json=data, headers=self.author_headers)
        project_id = response.json()["id"]
        update_data = {"title": "new_title", "journal": "new_journal", "status": ProjectStatus.done}
        # Действие
        response = await self.client.patch(f"/projects/{project_id}", json=update_data, headers=self.coauthor_headers)
        # Проверки
        assert response.status_code == 403
        assert response.json()["detail"] == "Недостаточно прав для выполнения операции"
    
    # Проверить производительность. 100 одновременных запросов на получение информации о проекте должны обработаться не более чем за 1 секуду.
    async def test_performance_projects(self):
        # Подготовка
        num_projects = 100
        projects_data = [{"title": f"Project {i}", "journal": f"Journal {i}", "deadline": datetime.now().isoformat()} for i in range(num_projects)]
        # Действия
        responses = await asyncio.gather(*[self.client.post("/projects/create_project", json=data, headers=self.author_headers) for data in projects_data])
        project_ids = [r.json()["id"] for r in responses]
        start = time.perf_counter()
        responses = await asyncio.gather(*[self.client.get(f"/projects/{project_id}", headers=self.author_headers) for project_id in project_ids])
        duration = time.perf_counter() - start
        # Проверки
        for r in responses:
            assert r.status_code == 200
        assert duration < 1.0


if __name__ == "__main__":
    unittest.main()