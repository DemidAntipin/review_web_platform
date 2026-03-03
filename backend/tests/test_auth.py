import unittest
import os
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from src.core.database import BaseDBModel
from src.core.dependencies import CurrentUser, get_current_user, get_db_session
from src.models.user.user import User
from src.models.user.user_role import UserRole
from src.core.security import get_password_hash
from src.dtos.auth.user import UserUpdateDTO
from main import app

class test_auth(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        test_db_url = os.getenv(
            "TEST_DATABASE_URL",
            "postgresql://app_user:secure_password@db:5432/review_platform_test"
        )
        cls.engine = create_engine(test_db_url, echo=False)
        BaseDBModel.metadata.create_all(cls.engine)
        cls.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=cls.engine)

        def override_get_db():
            db = cls.SessionLocal()
            try:
                yield db
            finally:
                db.close()

        app.dependency_overrides[get_db_session] = override_get_db
        cls.client = TestClient(app)

    @classmethod
    def tearDownClass(cls):
        app.dependency_overrides.clear()
        BaseDBModel.metadata.drop_all(cls.engine)
        cls.engine.dispose()

    def setUp(self):
        self.session = self.SessionLocal()

    def tearDown(self):
        self.session.rollback()
        for table in BaseDBModel.metadata.sorted_tables:
            self.session.execute(text(f'TRUNCATE TABLE "{table.name}" RESTART IDENTITY CASCADE;'))
        self.session.commit()
        self.session.close()

    # проверить регистрацию пользователя. Успешная регистрация.
    def test_register_success_user(self):
        # Подготовка
        json = {
            "username": "test",
            "email": "test@test.com",
            "role": UserRole.author,
            "password": "test"
        }
        # Действия
        response = self.client.post("/auth/register", json=json)
        # Проверки
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert "username" in data
        assert data["username"] == json["username"]
        assert "email" in data
        assert data["email"] == json["email"]
        assert "role" in data
        assert data["role"] == json["role"]

    # проверить регистрацию пользователя. Ошибка при пропуске обязательного поля - username.
    def test_register_missing_username_user(self):
        # Подготовка
        json = {
            "email": "test@test.com",
            "role": UserRole.author,
            "password": "test"
        }
        # Действия
        response = self.client.post("/auth/register", json=json)
        # Проверки
        assert response.status_code == 422
        data = response.json()["detail"][0]
        assert "msg" in data
        assert data["msg"] == "Field required"
        assert "loc" in data
        assert data["loc"] == ["body", "username"]

    # проверить регистрацию пользователя. Ошибка при пропуске обязательного поля - email.
    def test_register_missing_email_user(self):
        # Подготовка
        json = {
            "username": "test",
            "role": UserRole.author,
            "password": "test"
        }
        # Действия
        response = self.client.post("/auth/register", json=json)
        # Проверки
        assert response.status_code == 422
        data = response.json()["detail"][0]
        assert "msg" in data
        assert data["msg"] == "Field required"
        assert "loc" in data
        assert data["loc"] == ["body", "email"]

    # проверить регистрацию пользователя. Ошибка при пропуске обязательного поля - role.
    def test_register_missing_role_user(self):
        # Подготовка
        json = {
            "username": "test",
            "email": "test@test.com",
            "password": "test"
        }
        # Действия
        response = self.client.post("/auth/register", json=json)
        # Проверки
        assert response.status_code == 422
        data = response.json()["detail"][0]
        assert "msg" in data
        assert data["msg"] == "Field required"
        assert "loc" in data
        assert data["loc"] == ["body", "role"]

    # проверить регистрацию пользователя. Ошибка при пропуске обязательного поля - password.
    def test_register_missing_password_user(self):
        # Подготовка
        json = {
            "username": "test",
            "email": "test@test.com",
            "role": UserRole.author
        }
        # Действия
        response = self.client.post("/auth/register", json=json)
        # Проверки
        assert response.status_code == 422
        data = response.json()["detail"][0]
        assert "msg" in data
        assert data["msg"] == "Field required"
        assert "loc" in data
        assert data["loc"] == ["body", "password"]

    # проверить регистрацию пользователя. Ошибка уникальности username.
    def test_register_unique_username_error_user(self):
        # Подготовка
        json = {
            "username": "test",
            "email": "test@test.com",
            "role": UserRole.author,
            "password": "test"
        }
        json2 = {
            "username": "test",
            "email": "test2@test.com",
            "role": UserRole.coauthor,
            "password": "test2"
        }
        # Действия
        response = self.client.post("/auth/register", json=json)
        response2 = self.client.post("/auth/register", json=json2)
        # Проверки
        assert response.status_code == 200
        assert response2.status_code == 400
        assert "detail" in response2.json()
        assert response2.json()["detail"] == "Email или username уже зарегистрированы"

    # проверить регистрацию пользователя. Ошибка уникальности email.
    def test_register_unique_email_error_user(self):
        # Подготовка
        json = {
            "username": "test",
            "email": "test@test.com",
            "role": UserRole.author,
            "password": "test"
        }
        json2 = {
            "username": "test2",
            "email": "test@test.com",
            "role": UserRole.coauthor,
            "password": "test2"
        }
        # Действия
        response = self.client.post("/auth/register", json=json)
        response2 = self.client.post("/auth/register", json=json2)
        # Проверки
        assert response.status_code == 200
        assert response2.status_code == 400
        assert "detail" in response2.json()
        assert response2.json()["detail"] == "Email или username уже зарегистрированы"

    # проверить авторизацию пользователя. Успешная авторизация.
    def test_auth_success_user(self):
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
        response = self.client.post("/auth/register", json=json_register)
        response = self.client.post("/auth/login", data=json_login)
        # Проверки
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert isinstance(data["access_token"], str)
        assert "token_type" in data
        assert data["token_type"] == "bearer"

    # проверить авторизацию пользователя. Ошибка авторизации, неверный логин.
    def test_auth_invalid_username_user(self):
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
        response = self.client.post("/auth/register", json=json_register)
        response = self.client.post("/auth/login", data=json_login)
        # Проверки
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
        assert data["detail"] == "Неверное имя пользователя или пароль"

    # проверить авторизацию пользователя. Ошибка авторизации, неверный пароль.
    def test_auth_invalid_password_user(self):
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
        response = self.client.post("/auth/register", json=json_register)
        response = self.client.post("/auth/login", data=json_login)
        # Проверки
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
        assert data["detail"] == "Неверное имя пользователя или пароль"

    # проверить обновление пользователя. Ошибка при запросе от неавторизированного пользователя.
    def test_update_anauthorized_user(self):
        # Подготовка
        json_update = {
            "username": "test",
            "email": "test@test.com",
            "role": UserRole.author,
            "password": "test",
            "new_password": "test2"}
        # Действия
        response = self.client.patch("/auth/update", json=json_update)
        # Проверки
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
        assert data["detail"] == "Not authenticated"

    # проверить обновление пользователя. Ошибка при несовпадении пароля.
    def test_update_invalid_password_user(self):
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
        json_update = {"password": "invalid_password"}
        # Действия
        response = self.client.post("/auth/register", json=json_register)
        response = self.client.post("/auth/login", data=json_login)
        token = response.json()["access_token"]
        response = self.client.patch("/auth/update", json=json_update, headers={"Authorization": f"Bearer {token}"})
        # Проверки
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
        assert data["detail"] == "Неверный пароль"

    # проверить обновление пользователя. Успешное обновление данных.
    def test_update_success_user(self):
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
        json_update = {"password": "test", "username":"test2", "new_password": "test2"}
        # Действия
        response = self.client.post("/auth/register", json=json_register)
        response = self.client.post("/auth/login", data=json_login)
        token = response.json()["access_token"]
        response = self.client.patch("/auth/update", json=json_update, headers={"Authorization": f"Bearer {token}"})
        json_login["username"]="test2"
        json_login["password"]="test2"
        response2 = self.client.post("/auth/login", data=json_login)
        # Проверки
        assert response.status_code == 200
        data = response.json()
        assert "username" in data
        assert data["username"] == "test2"
        assert response2.status_code == 200

    # проверить обновление пользователя. Ошибка уникальности usernama при обновлении данных.
    def test_update_unique_username_user(self):
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
        json_update = {"password": "test", "username":"test2"}
        # Действия
        response = self.client.post("/auth/register", json=json_register)
        json_register["username"] = "test2"
        json_register["email"] = "test2@test.com"
        response = self.client.post("/auth/register", json=json_register)
        response = self.client.post("/auth/login", data=json_login)
        token = response.json()["access_token"]
        response = self.client.patch("/auth/update", json=json_update, headers={"Authorization": f"Bearer {token}"})
        # Проверки
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
        assert data["detail"] == "Имя пользователя уже занято"

    # проверить обновление пользователя. Ошибка уникальности email при обновлении данных.
    def test_update_unique_email_user(self):
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
        json_update = {"password": "test", "email":"test2@test.com"}
        # Действия
        response = self.client.post("/auth/register", json=json_register)
        json_register["username"] = "test2"
        json_register["email"] = "test2@test.com"
        response = self.client.post("/auth/register", json=json_register)
        response = self.client.post("/auth/login", data=json_login)
        token = response.json()["access_token"]
        response = self.client.patch("/auth/update", json=json_update, headers={"Authorization": f"Bearer {token}"})
        # Проверки
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
        assert data["detail"] == "Email уже используется"