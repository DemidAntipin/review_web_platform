import unittest
from unittest.mock import patch
import os
import time
import unittest
from unittest.mock import patch
import asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy import text

import uvloop
asyncio.set_event_loop_policy(uvloop.EventLoopPolicy())

from src.core.database import BaseDBModel, get_db_session
from src.models.user.user_role import UserRole
from main import app
import httpx

class test_auth(unittest.IsolatedAsyncioTestCase):

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

    async def asyncTearDown(self):
        async with self.cleanup_engine.connect() as conn:
            async with conn.begin():
                for table in reversed(BaseDBModel.metadata.sorted_tables):
                    await conn.execute(
                        text(f'TRUNCATE TABLE "{table.name}" RESTART IDENTITY CASCADE;')
                    )
        app.dependency_overrides.clear()
        await self.client.aclose()
        await self.engine.dispose()
        await self.cleanup_engine.dispose()

    # проверить регистрацию пользователя. Успешная регистрация.
    async def test_register_success_user(self):
        # Подготовка
        json_data = {
            "username": "test",
            "email": "test@test.com",
            "role": UserRole.author,
            "password": "test"
        }
        # Действия
        response = await self.client.post("/auth/register", json=json_data)
        # Проверки
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert "username" in data
        assert data["username"] == json_data["username"]
        assert "email" in data
        assert data["email"] == json_data["email"]
        assert "role" in data
        assert data["role"] == json_data["role"]

    # проверить регистрацию пользователя. Ошибка при пропуске обязательного поля - username.
    async def test_register_missing_username_user(self):
        # Подготовка
        json_data = {
            "email": "test@test.com",
            "role": UserRole.author,
            "password": "test"
        }
        # Действия
        response = await self.client.post("/auth/register", json=json_data)
        # Проверки
        assert response.status_code == 422
        error = response.json()["detail"][0]
        assert error["msg"] == "Field required"
        assert error["loc"] == ["body", "username"]

    # проверить регистрацию пользователя. Ошибка при пропуске обязательного поля - email.
    async def test_register_missing_email_user(self):
        # Подготовка
        json_data = {
            "username": "test",
            "role": UserRole.author,
            "password": "test"
        }
        # Действия
        response = await self.client.post("/auth/register", json=json_data)
        # Проверки
        assert response.status_code == 422
        error = response.json()["detail"][0]
        assert error["msg"] == "Field required"
        assert error["loc"] == ["body", "email"]

    # проверить регистрацию пользователя. Ошибка при пропуске обязательного поля - role.
    async def test_register_missing_role_user(self):
        # Подготовка
        json_data = {
            "username": "test",
            "email": "test@test.com",
            "password": "test"
        }
        # Действия
        response = await self.client.post("/auth/register", json=json_data)
        # Проверки
        assert response.status_code == 422
        error = response.json()["detail"][0]
        assert error["msg"] == "Field required"
        assert error["loc"] == ["body", "role"]

    # проверить регистрацию пользователя. Ошибка при пропуске обязательного поля - password.
    async def test_register_missing_password_user(self):
        # Подготовка
        json_data = {
            "username": "test",
            "email": "test@test.com",
            "role": UserRole.author
        }
        # Действия
        response = await self.client.post("/auth/register", json=json_data)
        # Проверки
        assert response.status_code == 422
        error = response.json()["detail"][0]
        assert error["msg"] == "Field required"
        assert error["loc"] == ["body", "password"]

    # проверить регистрацию пользователя. Ошибка уникальности username.
    async def test_register_unique_username_error_user(self):
        # Подготовка
        json_data1 = {
            "username": "test",
            "email": "test@test.com",
            "role": UserRole.author,
            "password": "test"
        }
        json_data2 = {
            "username": "test",
            "email": "test2@test.com",
            "role": UserRole.coauthor.value,
            "password": "test2"
        }
        # Действия
        response1 = await self.client.post("/auth/register", json=json_data1)
        response2 = await self.client.post("/auth/register", json=json_data2)
        # Проверки
        assert response1.status_code == 200
        assert response2.status_code == 400
        assert response2.json()["detail"] == "Email или username уже зарегистрированы"

    # проверить регистрацию пользователя. Ошибка уникальности email.
    async def test_register_unique_email_error_user(self):
        # Подготовка
        json_data1 = {
            "username": "test",
            "email": "test@test.com",
            "role": UserRole.author,
            "password": "test"
        }
        json_data2 = {
            "username": "test2",
            "email": "test@test.com",
            "role": UserRole.coauthor.value,
            "password": "test2"
        }
        # Действия
        response1 = await self.client.post("/auth/register", json=json_data1)
        response2 = await self.client.post("/auth/register", json=json_data2)
        # Проверки
        assert response1.status_code == 200
        assert response2.status_code == 400
        assert response2.json()["detail"] == "Email или username уже зарегистрированы"

    # проверить авторизацию пользователя. Успешная авторизация.
    async def test_auth_success_user(self):
        # Подготовка
        json_register = {
            "username": "test",
            "email": "test@test.com",
            "role": UserRole.author,
            "password": "test"
        }
        json_login = {
            "username": "test",
            "password": "test"
        }
        # Действия
        await self.client.post("/auth/register", json=json_register)
        response = await self.client.post("/auth/login", data=json_login)
        # Проверки
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert isinstance(data["access_token"], str)
        assert "token_type" in data
        assert data["token_type"] == "bearer"

    # проверить авторизацию пользователя. Ошибка авторизации, неверный логин.
    async def test_auth_invalid_username_user(self):
        # Подготовка
        json_register = {
            "username": "test",
            "email": "test@test.com",
            "role": UserRole.author,
            "password": "test"
        }
        json_login = {
            "username": "not_user",
            "password": "test"
        }
        # Действия
        await self.client.post("/auth/register", json=json_register)
        response = await self.client.post("/auth/login", data=json_login)
        # Проверки
        assert response.status_code == 400
        assert response.json()["detail"] == "Неверное имя пользователя или пароль"

    # проверить авторизацию пользователя. Ошибка авторизации, неверный пароль.
    async def test_auth_invalid_password_user(self):
        # Подготовка
        json_register = {
            "username": "test",
            "email": "test@test.com",
            "role": UserRole.author,
            "password": "test"
        }
        json_login = {
            "username": "test",
            "password": "invalid_password"
        }
        # Действия
        await self.client.post("/auth/register", json=json_register)
        response = await self.client.post("/auth/login", data=json_login)
        # Проверки
        assert response.status_code == 400
        assert response.json()["detail"] == "Неверное имя пользователя или пароль"

    # проверить обновление пользователя. Ошибка при запросе от неавторизированного пользователя.
    async def test_update_unauthorized_user(self):
        # Подготовка
        json_update = {
            "username": "test",
            "email": "test@test.com",
            "role": UserRole.author,
            "password": "test",
            "new_password": "test2"
        }
        # Действия
        response = await self.client.patch("/auth/update", json=json_update)
        # Проверки
        assert response.status_code == 401
        assert response.json()["detail"] == "Not authenticated"

    # проверить обновление пользователя. Ошибка при несовпадении пароля.
    async def test_update_invalid_password_user(self):
        # Подготовка
        json_register = {
            "username": "test",
            "email": "test@test.com",
            "role": UserRole.author,
            "password": "test"
        }
        json_login = {"username": "test", "password": "test"}
        json_update = {"password": "invalid_password"}

        # Действия
        await self.client.post("/auth/register", json=json_register)
        login_resp = await self.client.post("/auth/login", data=json_login)
        token = login_resp.json()["access_token"]
        response = await self.client.patch(
            "/auth/update",
            json=json_update,
            headers={"Authorization": f"Bearer {token}"}
        )
        # Проверки
        assert response.status_code == 400
        assert response.json()["detail"] == "Неверный пароль"

    # проверить обновление пользователя. Успешное обновление данных.
    async def test_update_success_user(self):
        # Подготовка
        json_register = {
            "username": "test",
            "email": "test@test.com",
            "role": UserRole.author,
            "password": "test"
        }
        json_login = {"username": "test", "password": "test"}
        json_update = {"password": "test", "username": "test2", "new_password": "test2"}

        # Действия
        await self.client.post("/auth/register", json=json_register)
        login_resp = await self.client.post("/auth/login", data=json_login)
        token = login_resp.json()["access_token"]
        response = await self.client.patch(
            "/auth/update",
            json=json_update,
            headers={"Authorization": f"Bearer {token}"}
        )
        # Проверки
        assert response.status_code == 200
        data = response.json()
        assert data["username"] == "test2"
        json_login2 = {"username": "test2", "password": "test2"}
        response2 = await self.client.post("/auth/login", data=json_login2)
        assert response2.status_code == 200

    # проверить обновление пользователя. Ошибка уникальности username при обновлении данных.
    async def test_update_unique_username_user(self):
        # Подготовка
        json_register1 = {
            "username": "test",
            "email": "test@test.com",
            "role": UserRole.author,
            "password": "test"
        }
        json_register2 = {
            "username": "test2",
            "email": "test2@test.com",
            "role": UserRole.author,
            "password": "test"
        }
        json_login = {
            "username": "test",
            "password": "test"
        }
        json_update = {"password": "test", "username": "test2"}

        # Действия
        await self.client.post("/auth/register", json=json_register1)
        await self.client.post("/auth/register", json=json_register2)
        login_resp = await self.client.post("/auth/login", data=json_login)
        token = login_resp.json()["access_token"]
        response = await self.client.patch(
            "/auth/update",
            json=json_update,
            headers={"Authorization": f"Bearer {token}"}
        )
        # Проверки
        assert response.status_code == 400
        assert response.json()["detail"] == "Имя пользователя уже занято"

    # проверить обновление пользователя. Ошибка уникальности email при обновлении данных.
    async def test_update_unique_email_user(self):
        # Подготовка
        json_register1 = {
            "username": "test",
            "email": "test@test.com",
            "role": UserRole.author,
            "password": "test"
        }
        json_register2 = {
            "username": "test2",
            "email": "test2@test.com",
            "role": UserRole.author,
            "password": "test"
        }
        json_login = {
            "username": "test",
            "password": "test"
        }
        json_update = {"password": "test", "email": "test2@test.com"}

        # Действия
        await self.client.post("/auth/register", json=json_register1)
        await self.client.post("/auth/register", json=json_register2)
        login_resp = await self.client.post("/auth/login", data=json_login)
        token = login_resp.json()["access_token"]
        response = await self.client.patch(
            "/auth/update",
            json=json_update,
            headers={"Authorization": f"Bearer {token}"}
        )
        # Проверки
        assert response.status_code == 400
        assert response.json()["detail"] == "Email уже используется"

    # Проверить производительность. 100 одновременных запросов на авторизацию должны обработаться не более чем за 1 секуду.
    async def test_performance_auth(self):
        # Подготовка
        num_users = 100
        users_data = [
            {
                "username": f"user{i}",
                "email": f"user{i}@example.com",
                "role": UserRole.author,
                "password": "test"
            } for i in range(num_users)]
        with patch("src.routers.auth.get_password_hash", side_effect=lambda x: f"hash_{x}"), \
            patch("src.routers.auth.check_password", return_value=True), \
            patch("src.routers.auth.create_access_token", return_value="fake_token"):
            async def register_user(data):
                return await self.client.post("/auth/register", json=data)
            async def login_user(data):
                return await self.client.post("/auth/login", data={"username": data["username"], "password": data["password"]})
            # Действия
            reg_responses = await asyncio.gather(*[register_user(d) for d in users_data])
            start = time.perf_counter()
            responses = await asyncio.gather(*[login_user(d) for d in users_data])
            duration = time.perf_counter() - start
            # Проверки
            for r in reg_responses:
                assert r.status_code == 200
            for r in responses:
                assert r.status_code == 200
            assert duration < 1