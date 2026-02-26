import unittest
import os
from datetime import datetime

from sqlalchemy import create_engine
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import sessionmaker

from src.core.database import BaseDBModel
from src.models.user.user import User
from src.models.user.user_role import UserRole
from src.models.project.project import Project
from src.models.project.project_status import ProjectStatus
from src.models.project_member import ProjectMember
from src.models.reviewer import Reviewer
from src.models.response import Response
from src.models.attachment import Attachment
from src.models.activity_log import ActivityLog
from src.models.task.task import Task
from src.models.task.task_type import TaskType
from src.models.task.task_status import TaskStatus
from src.models.comment.comment import Comment
from src.models.comment.comment_priority import CommentPriority
from src.models.comment.comment_status import CommentStatus
from src.models.comment.comment_type import CommentType


class test_database(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        test_db_url = os.getenv(
            "TEST_DATABASE_URL",
            "postgresql://app_user:secure_password@db:5432/review_platform_test"
        )
        cls.engine = create_engine(test_db_url, echo=False)
        BaseDBModel.metadata.create_all(cls.engine)
        cls.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=cls.engine)

    @classmethod
    def tearDownClass(cls):
        BaseDBModel.metadata.drop_all(cls.engine)
        cls.engine.dispose()

    def setUp(self):
        self.session = self.SessionLocal()

    def tearDown(self):
        self.session.rollback()
        self.session.close()


    # проверить элементы перечисления UserRole
    def test_user_role_members(self):
        # Подготовка
        # Действия
        # Проверки
        assert UserRole.author.name == "author"
        assert UserRole.coauthor.name == "coauthor"
        assert UserRole.editor.name =="editor"
        assert UserRole.admin.name == "admin"

    # проверить ошибку при невалидном UserRole
    def test_invalid_user_role(self):
        # Подготовка
        # Действия
        # Проверки
        with self.assertRaises(ValueError):
            UserRole("invalid_role")

    # проверить элементы перечисления ProjectStatus
    def test_project_status_members(self):
        # Подготовка
        # Действия
        # Проверки
        assert ProjectStatus.in_progress.name == "in_progress"
        assert ProjectStatus.done.name == "done"
        assert ProjectStatus.accepted.name == "accepted"

    # проверить ошибку при невалидном ProjectStatus
    def test_invalid_project_status(self):
        # Подготовка
        # Действия
        # Проверки
        with self.assertRaises(ValueError):
            ProjectStatus("invalid_status")

    # проверить элементы перечисления TaskStatus
    def test_task_status_members(self):
        # Подготовка
        # Действия
        # Проверки
        assert TaskStatus.todo.name == "todo"
        assert TaskStatus.in_progress.name == "in_progress"
        assert TaskStatus.completed.name == "completed"
        assert TaskStatus.ready_to_review.name == "ready_to_review"
        assert TaskStatus.closed.name == "closed"

    # проверить ошибку при невалидном TaskStatus
    def test_invalid_task_status(self):
        # Подготовка
        # Действия
        # Проверки
        with self.assertRaises(ValueError):
            TaskStatus("invalid_status")

    # проверить элементы перечисления TaskType
    def test_task_type_members(self):
        # Подготовка
        # Действия
        # Проверки
        assert TaskType.text_change.name == "text_change"
        assert TaskType.experiment.name == "experiment"
        assert TaskType.analysis.name == "analysis"
        assert TaskType.source.name == "source"
        assert TaskType.question.name == "question"

    # проверить ошибку при невалидном TaskType
    def test_invalid_task_type(self):
        # Подготовка
        # Действия
        # Проверки
        with self.assertRaises(ValueError):
            TaskType("invalid_type")

    # проверить элементы перечисления CommentType
    def test_comment_type_members(self):
        # Подготовка
        # Действия
        # Проверки
        assert CommentType.text_change.name == "text_change"
        assert CommentType.experiment.name == "experiment"
        assert CommentType.analysis.name == "analysis"
        assert CommentType.source.name == "source"
        assert CommentType.question.name == "question"

    # проверить ошибку при невалидном CommentType
    def test_invalid_comment_type(self):
        # Подготовка
        # Действия
        # Проверки
        with self.assertRaises(ValueError):
            CommentType("invalid_type")

    # проверить элементы перечисления CommentPriority
    def test_comment_priority_members(self):
        # Подготовка
        # Действия
        # Проверки
        assert CommentPriority.low.name == "low"
        assert CommentPriority.medium.name == "medium"
        assert CommentPriority.high.name == "high"

    # проверить ошибку при невалидном CommentPriority
    def test_invalid_comment_priority(self):
        # Подготовка
        # Действия
        # Проверки
        with self.assertRaises(ValueError):
            CommentPriority("invalid_priority")

    # проверить элементы перечисления CommentStatus
    def test_comment_status_members(self):
        # Подготовка
        # Действия
        # Проверки
        assert CommentStatus.new.name == "new"
        assert CommentStatus.in_progress.name == "in_progress"
        assert CommentStatus.completed.name == "completed"
        assert CommentStatus.ready_to_review.name == "ready_to_review"
        assert CommentStatus.closed.name == "closed"

    # проверить ошибку при невалидном CommentStatus
    def test_invalid_comment_status(self):
        # Подготовка
        # Действия
        # Проверки
        with self.assertRaises(ValueError):
            CommentStatus("invalid_status")
    
    # проверить создание основной модели User - данные пустые
    def test_create_empty_user(self):
        # Подготовка
        model = User()
        # Действия
        # Проверки
        assert model.id is None
        assert model.username is None
        assert model.email is None
        assert model.hashed_password is None
        assert model.role is None
        assert model.created_at is None

    # проверить создание основной модели User - данные не пустые
    def test_create_not_empty_user(self):
        # Подготовка
        model = User()
        # Действия
        model.username = "test"
        model.email = "test@test.ru"
        model.hashed_password = "hash"
        model.role = UserRole.admin
        # Проверки
        assert model.username == "test"
        assert model.email == "test@test.ru"
        assert model.hashed_password == "hash"
        assert model.role == UserRole.admin

    # проверить создание основной модели Project - данные пустые
    def test_create_empty_project(self):
        # Подготовка
        model = Project()
        # Действия
        # Проверки
        assert model.id is None
        assert model.title is None
        assert model.journal is None
        assert model.deadline is None
        assert model.status is None
        assert model.created_at is None
        assert model.updated_at is None

    # проверить создание основной модели Project - данные не пустые
    def test_create_not_empty_project(self):
        # Подготовка
        model = Project()
        # Действия
        model.title = "Test Project"
        model.journal = "Nature"
        model.deadline = datetime(2026, 12, 31)
        model.status = ProjectStatus.accepted
        # Проверки
        assert model.title == "Test Project"
        assert model.journal == "Nature"
        assert model.status == ProjectStatus.accepted

    # проверить создание основной модели ProjectMember - данные пустые
    def test_create_empty_project_member(self):
        # Подготовка
        model = ProjectMember()
        # Действия
        # Проверки
        assert model.id is None
        assert model.project_id is None
        assert model.user_id is None
        assert model.role is None
        assert model.joined_at is None

    # проверить создание основной модели ProjectMember - данные не пустые
    def test_create_not_empty_project_member(self):
        # Подготовка
        model = ProjectMember()
        # Действия
        model.project_id = 42
        model.user_id = 7
        model.role = UserRole.coauthor
        # Проверки
        assert model.project_id == 42
        assert model.user_id == 7
        assert model.role == UserRole.coauthor

    # проверить создание основной модели Reviewer - данные пустые
    def test_create_empty_reviewer(self):
        # Подготовка
        model = Reviewer()
        # Действия
        # Проверки
        assert model.id is None
        assert model.project_id is None
        assert model.name is None
        assert model.general_comment is None
        assert model.created_at is None

    # проверить создание основной модели Reviewer - данные не пустые
    def test_create_not_empty_reviewer(self):
        # Подготовка
        model = Reviewer()
        # Действия
        model.project_id = 1
        model.name = "test"
        model.general_comment = "test"
        # Проверки
        assert model.project_id, 1
        assert model.name == "test"
        assert model.general_comment == "test"

    # проверить создание основной модели Response - данные пустые
    def test_create_empty_response(self):
        # Подготовка
        model = Response()
        # Действия
        # Проверки
        assert model.id is None
        assert model.comment_id is None
        assert model.response_md is None
        assert model.approved is None
        assert model.created_at is None

    # проверить создание основной модели Response - данные не пустые
    def test_create_not_empty_response(self):
        # Подготовка
        model = Response()
        # Действия
        model.comment_id = 1
        model.response_md = "test"
        model.approved = True
        # Проверки
        assert model.comment_id == 1
        assert model.response_md == "test"
        assert model.approved

    # проверить создание основной модели Attachment - данные пустые
    def test_create_empty_attachment(self):
        # Подготовка
        model = Attachment()
        # Действия
        # Проверки
        assert model.id is None
        assert model.task_id is None
        assert model.file_url is None
        assert model.file_type is None
        assert model.uploaded_at is None

    # проверить создание основной модели Attachment - данные не пустые
    def test_create_not_empty_attachment(self):
        # Подготовка
        model = Attachment()
        # Действия
        model.task_id = 8
        model.file_url = "test"
        model.file_type = "application/pdf"
        # Проверки
        assert model.task_id == 8
        assert model.file_url == "test"

    # проверить создание основной модели ActivityLog - данные пустые
    def test_create_empty_activity_log(self):
        # Подготовка
        model = ActivityLog()
        # Действия
        # Проверки
        assert model.id is None
        assert model.user_id is None
        assert model.project_id is None
        assert model.action_type is None
        assert model.description is None
        assert model.created_at is None

    # проверить создание основной модели ActivityLog - данные не пустые
    def test_create_not_empty_activity_log(self):
        # Подготовка
        model = ActivityLog()
        # Действия
        model.user_id = 1
        model.project_id = 1
        model.action_type = "test"
        model.description = "test"
        # Проверки
        assert model.user_id == 1
        assert model.project_id == 1

    # проверить создание основной модели Task - данные пустые
    def test_create_empty_task(self):
        # Подготовка
        model = Task()
        # Действия
        # Проверки
        assert model.id is None
        assert model.comment_id is None
        assert model.assignee_id is None
        assert model.title is None
        assert model.description_md is None
        assert model.type is None
        assert model.status is None
        assert model.created_at is None
        assert model.completed_at is None

    # проверить создание основной модели Task - данные не пустые
    def test_create_not_empty_task(self):
        # Подготовка
        model = Task()
        # Действия
        model.comment_id = 1
        model.assignee_id = 1
        model.title = "test"
        model.description_md = "test"
        model.type = TaskType.text_change
        model.status = TaskStatus.in_progress
        # Проверки
        assert model.comment_id == 1
        assert model.assignee_id == 1
        assert model.description_md == "test"
        assert model.title == "test"
        assert model.type == TaskType.text_change
        assert model.status == TaskStatus.in_progress

    # проверить создание основной модели Comment - данные пустые
    def test_create_empty_comment(self):
        # Подготовка
        model = Comment()
        # Действия
        # Проверки
        assert model.id is None
        assert model.reviewer_id is None
        assert model.content_md is None
        assert model.type is None
        assert model.priority is None
        assert model.status is None
        assert model.created_at is None

    # проверить создание основной модели Comment - данные не пустые
    def test_create_not_empty_comment(self):
        # Подготовка
        model = Comment()
        # Действия
        model.reviewer_id = 2
        model.content_md = "test"
        model.type = CommentType.text_change
        model.priority = CommentPriority.high
        # Проверки
        assert model.reviewer_id == 2
        assert model.content_md == "test"
        assert model.type == CommentType.text_change
        assert model.priority == CommentPriority.high
    
    # проверить сохранение пользователя в базу данных. Установка значений по умолчанию.
    def test_add_valid_user_in_db(self):
        # Подготовка
        user = User(username="dbuser", email="db@example.com", hashed_password="dbhash")
        # Действия
        self.session.add(user)
        self.session.flush()
        # Проверки
        assert isinstance(user.id, int)
        assert isinstance(user.role, UserRole)
        assert isinstance(user.created_at, datetime)

    # проверить сохранение пользователя в базу данных. Ошибка уникальности имени пользователя
    def test_duplicate_username_raises_integrity_error(self):
        # Подготовка
        u1 = User(username="duplicate", email="u1@ex.com", hashed_password="h1")
        u2 = User(username="duplicate", email="u2@ex.com", hashed_password="h2")
        # Действия
        self.session.add(u1)
        self.session.flush()
        self.session.add(u2)
        # Проверки
        with self.assertRaises(IntegrityError):
            self.session.flush()

    # проверить сохранение пользователя в базу данных. Ошибка уникальности почты пользователя
    def test_duplicate_email_raises_integrity_error(self):
        # Подготовка
        u1 = User(username="u1", email="duplicate@ex.com", hashed_password="h1")
        u2 = User(username="u2", email="duplicate@ex.com", hashed_password="h2")
        # Действия
        self.session.add(u1)
        self.session.flush()
        self.session.add(u2)
        # Проверки
        with self.assertRaises(IntegrityError):
            self.session.flush()

    # проверить сохранение проекта в базу данных. Установка значений по умолчанию.
    def test_add_valid_project_in_db(self):
        # Подготовка
        project = Project(title="test_project", journal="test")
        # Действия
        self.session.add(project)
        self.session.flush()
        # Проверки
        assert isinstance(project.id, int)
        assert project.deadline is None
        assert project.status == ProjectStatus.in_progress
        assert isinstance(project.created_at, datetime)
        assert isinstance(project.updated_at, datetime)

    # проверить сохранение проекта в базу данных. Ошибка при пропуске обязательного аргумента - title.
    def test_project_missing_title_raises_integrity_error(self):
        # Подготовка
        project = Project(journal="test")
        # Действия
        self.session.add(project)
        # Проверки
        with self.assertRaises(IntegrityError):
            self.session.flush()

    # проверить сохранение проекта в базу данных. Ошибка при пропуске обязательного аргумента - journal.
    def test_project_missing_journal_raises_integrity_error(self):
        # Подготовка
        project = Project(title="test")
        # Действия
        self.session.add(project)
        # Проверки
        with self.assertRaises(IntegrityError):
            self.session.flush()

    # проверить сохранение участников проекта в базу данных. Установка значений по умолчанию.
    def test_persist_valid_project_member_in_db(self):
        # Подготовка
        project = Project(title="test_project", journal="test")
        user = User(username="test_user", email="test@test.com", hashed_password="hash")
        # Действия
        self.session.add_all([project, user])
        self.session.flush()
        member = ProjectMember(project_id=project.id, user_id=user.id, role=UserRole.coauthor)
        self.session.add(member)
        self.session.flush()
        # Проверки
        assert isinstance(member.id, int)
        assert member.project_id == project.id
        assert member.user_id == user.id
        assert member.role == UserRole.coauthor
        assert isinstance(member.joined_at, datetime)

    # проверить сохранение участников проекта в базу данных. Ошибка при пропуске обязательного аргумента - роли.
    def test_project_member_missing_role_raises_integrity_error(self):
        # Подготовка
        project = Project(title="test_project", journal="test")
        user = User(username="test_user", email="test@test.com", hashed_password="hash")
        # Действия
        self.session.add_all([project, user])
        self.session.flush()
        member = ProjectMember(project_id=project.id, user_id=user.id)
        self.session.add(member)
        # Проверки
        with self.assertRaises(IntegrityError):
            self.session.flush()

    # проверить сохранение участников проекта в базу данных. Ошибка при передачи внешнего ключа несуществующего проекта.
    def test_project_member_invalid_project_id_raises_integrity_error(self):
        # Подготовка
        user = User(username="test_user", email="test@test.com", hashed_password="hash")
        # Действия
        self.session.add(user)
        self.session.flush()
        member = ProjectMember(project_id=999999, user_id=user.id, role=UserRole.author)
        self.session.add(member)
        # Проверки
        with self.assertRaises(IntegrityError):
            self.session.flush()

    # проверить сохранение участников проекта в базу данных. Ошибка при передачи внешнего ключа несуществующего пользователя.
    def test_project_member_invalid_user_id_raises_integrity_error(self):
        # Подготовка
        project = Project(title="test_project", journal="test")
        # Действия
        self.session.add(project)
        self.session.flush()
        member = ProjectMember(project_id=project.id, user_id=999999, role=UserRole.author)
        self.session.add(member)
        # Проверки
        with self.assertRaises(IntegrityError):
            self.session.flush()

    # проверить сохранение рецензента проекта в базу данных. Установка значений по умолчанию.
    def test_persist_valid_reviewer_in_db(self):
        # Подготовка
        project = Project(title="test_project", journal="test")
        # Действия
        self.session.add(project)
        self.session.flush()
        reviewer = Reviewer(project_id=project.id, name="test", general_comment="test")
        self.session.add(reviewer)
        self.session.flush()
        # Проверки
        assert isinstance(reviewer.id, int)
        assert reviewer.project_id == project.id
        assert reviewer.name == "test"
        assert reviewer.general_comment == "test"
        assert isinstance(reviewer.created_at, datetime)

    # проверить сохранение рецензента проекта в базу данных. Ошибка при пропуске обязательного аргумента - имени рецензента.
    def test_reviewer_missing_name_raises_integrity_error(self):
        # Подготовка
        project = Project(title="test_project", journal="test")
        # Действия
        self.session.add(project)
        self.session.flush()
        reviewer = Reviewer(project_id=project.id, general_comment="test")
        self.session.add(reviewer)
        # Проверки
        with self.assertRaises(IntegrityError):
            self.session.flush()

    # проверить сохранение рецензента проекта в базу данных. Ошибка при передачи внешнего ключа несуществующего проекта.
    def test_reviewer_invalid_project_id_raises_integrity_error(self):
        # Подготовка
        reviewer = Reviewer(project_id=999999, name="test", general_comment="test")
        # Действия
        self.session.add(reviewer)
        # Проверки
        with self.assertRaises(IntegrityError):
            self.session.flush()

    # проверить сохранение замечания проекта в базу данных. Установка значений по умолчанию.
    def test_persist_valid_comment_in_db(self):
        # Подготовка
        project = Project(title="test_project", journal="test")
        # Действия
        self.session.add(project)
        self.session.flush()
        reviewer = Reviewer(project_id=project.id, name="test", general_comment="test")
        self.session.add(reviewer)
        self.session.flush()
        comment = Comment(reviewer_id=reviewer.id, content_md="Fix this", type=CommentType.text_change, priority=CommentPriority.medium)
        self.session.add(comment)
        self.session.flush()
        # Проверки
        assert isinstance(comment.id, int)
        assert comment.reviewer_id == reviewer.id
        assert comment.content_md == "Fix this"
        assert comment.type == CommentType.text_change
        assert comment.priority == CommentPriority.medium
        assert comment.status == CommentStatus.new
        assert isinstance(comment.created_at, datetime)

    # проверить сохранение замечания проекта в базу данных. Ошибка при пропуске обязательного аргумента - описания замечания.
    def test_comment_missing_content_md_raises_integrity_error(self):
        # Подготовка
        project = Project(title="P", journal="J")
        # Действия
        self.session.add(project)
        self.session.flush()
        reviewer = Reviewer(project_id=project.id, name="R", general_comment="GC")
        self.session.add(reviewer)
        self.session.flush()
        comment = Comment(reviewer_id=reviewer.id, type=CommentType.text_change, priority=CommentPriority.low)
        self.session.add(comment)
        # Проверки
        with self.assertRaises(IntegrityError):
            self.session.flush()

    # проверить сохранение замечания проекта в базу данных. Ошибка при передачи внешнего ключа несуществующего рецензента проекта.
    def test_comment_invalid_reviewer_id_raises_integrity_error(self):
        # Подготовка
        comment = Comment(reviewer_id=999999, content_md="Text", type=CommentType.text_change, priority=CommentPriority.low)
        # Действия
        self.session.add(comment)
        # Проверки
        with self.assertRaises(IntegrityError):
            self.session.flush()

    # проверить сохранение задачи проекта в базу данных. Установка значений по умолчанию.
    def test_persist_valid_task_in_db(self):
        # Подготовка
        project = Project(title="test_project", journal="test")
        user = User(username="test_user", email="test@test.com", hashed_password="hash")
        # Действия
        self.session.add(project)
        self.session.add(user)
        self.session.flush()
        reviewer = Reviewer(project_id=project.id, name="test", general_comment="test")
        self.session.add(reviewer)
        self.session.flush()
        comment = Comment(reviewer_id=reviewer.id, content_md="Fix", type=CommentType.text_change, priority=CommentPriority.medium)
        self.session.add(comment)
        self.session.flush()
        task = Task(comment_id=comment.id, assignee_id=user.id, title="Fix", description_md="Fix", type=TaskType.text_change)
        self.session.add(task)
        self.session.flush()
        # Проверки
        assert isinstance(task.id, int)
        assert task.assignee_id == user.id
        assert task.comment_id == comment.id
        assert task.title == "Fix"
        assert task.description_md == "Fix"
        assert task.type == TaskType.text_change
        assert task.status == TaskStatus.todo
        assert isinstance(task.created_at, datetime)
        assert task.completed_at is None

    # проверить сохранение задачи проекта в базу данных. Ошибка при пропуске обязательного аргумента - названия задачи.
    def test_task_missing_title_raises_integrity_error(self):
        # Подготовка
        project = Project(title="test_project", journal="test")
        user = User(username="test_user", email="test@test.com", hashed_password="hash")
        # Действия
        self.session.add(project)
        self.session.add(user)
        self.session.flush()
        reviewer = Reviewer(project_id=project.id, name="test", general_comment="test")
        self.session.add(reviewer)
        self.session.flush()
        comment = Comment(reviewer_id=reviewer.id, content_md="Fix", type=CommentType.text_change, priority=CommentPriority.medium)
        self.session.add(comment)
        self.session.flush()
        task = Task(comment_id=comment.id, assignee_id=user.id, description_md="Fix", type=TaskType.text_change)
        self.session.add(task)
        # Проверки
        with self.assertRaises(IntegrityError):
            self.session.flush()

    # проверить сохранение задачи проекта в базу данных. Ошибка при передачи внешнего ключа несуществующего замечания проекта.
    def test_task_invalid_comment_id_raises_integrity_error(self):
        # Подготовка
        user = User(username="test_user", email="test@test.com", hashed_password="hash")
        # Действия
        self.session.add(user)
        self.session.flush()
        task = Task(comment_id=999999, assignee_id=user.id, title="Fix", description_md="Fix", type=TaskType.text_change)
        self.session.add(task)
        # Проверки
        with self.assertRaises(IntegrityError):
            self.session.flush()

    # проверить сохранение задачи проекта в базу данных. Ошибка при передачи внешнего ключа несуществующего исполнителя задачи.
    def test_task_invalid_asignee_id_raises_integrity_error(self):
        # Подготовка
        project = Project(title="test_project", journal="test")
        # Действия
        self.session.add(project)
        self.session.flush()
        reviewer = Reviewer(project_id=project.id, name="test", general_comment="test")
        self.session.add(reviewer)
        self.session.flush()
        comment = Comment(reviewer_id=reviewer.id, content_md="Fix", type=CommentType.text_change, priority=CommentPriority.medium)
        self.session.add(comment)
        task = Task(comment_id=comment.id, assignee_id=9999999, title="Fix", description_md="Fix", type=TaskType.text_change)
        self.session.flush()
        self.session.add(task)
        # Проверки
        with self.assertRaises(IntegrityError):
            self.session.flush()

    # проверить сохранение ответа на замечание проекта в базу данных. Установка значений по умолчанию.
    def test_persist_valid_response_in_db(self):
        # Подготовка
        project = Project(title="test_project", journal="test")
        # Действия
        self.session.add(project)
        self.session.flush()
        reviewer = Reviewer(project_id=project.id, name="test", general_comment="test")
        self.session.add(reviewer)
        self.session.flush()
        comment = Comment(reviewer_id=reviewer.id, content_md="Fix", type=CommentType.text_change, priority=CommentPriority.medium)
        self.session.add(comment)
        self.session.flush()
        response = Response(comment_id=comment.id, response_md="test")
        self.session.add(response)
        self.session.flush()
        # Проверки
        assert isinstance(response.id, int)
        assert response.comment_id == comment.id
        assert isinstance(response.approved, bool)
        assert response.approved == False
        assert response.response_md == "test"
        assert isinstance(response.created_at, datetime)

    # проверить сохранение ответа на замечание проекта в базу данных. Ошибка при пропуске обязательного аргумента - содержания ответа.
    def test_response_missing_response_md_raises_integrity_error(self):
        # Подготовка
        project = Project(title="test_project", journal="test")
        # Действия
        self.session.add(project)
        self.session.flush()
        reviewer = Reviewer(project_id=project.id, name="test", general_comment="test")
        self.session.add(reviewer)
        self.session.flush()
        comment = Comment(reviewer_id=reviewer.id, content_md="Fix", type=CommentType.text_change, priority=CommentPriority.medium)
        self.session.add(comment)
        self.session.flush()
        response = Response(comment_id=comment.id)
        self.session.add(response)
        # Проверки
        with self.assertRaises(IntegrityError):
            self.session.flush()

    # проверить сохранение ответа на замечание проекта в базу данных. Ошибка при передачи внешнего ключа несуществующего замечания.
    def test_response_invalid_comment_id_raises_integrity_error(self):
        # Подготовка
        response = Response(response_md="test", comment_id=999999)
        # Действия
        self.session.add(response)
        # Проверки
        with self.assertRaises(IntegrityError):
            self.session.flush()

    # проверить сохранение вложения к заданию в базу данных. Установка значений по умолчанию.
    def test_persist_valid_attachment_in_db(self):
        # Подготовка
        project = Project(title="test_project", journal="test")
        user = User(username="test_user", email="test@test.com", hashed_password="hash")
        # Действия
        self.session.add(project)
        self.session.add(user)
        self.session.flush()
        reviewer = Reviewer(project_id=project.id, name="test", general_comment="test")
        self.session.add(reviewer)
        self.session.flush()
        comment = Comment(reviewer_id=reviewer.id, content_md="Fix", type=CommentType.text_change, priority=CommentPriority.medium)
        self.session.add(comment)
        self.session.flush()
        task = Task(comment_id=comment.id, assignee_id=user.id, title="Fix", description_md="Fix", type=TaskType.text_change)
        self.session.add(task)
        self.session.flush()
        attachment = Attachment(task_id=task.id, file_url="test.pdf", file_type="application/pdf")
        self.session.add(attachment)
        self.session.flush()
        # Проверки
        assert isinstance(attachment.id, int)
        assert attachment.task_id == task.id
        assert attachment.file_type == "application/pdf"
        assert attachment.file_url == "test.pdf"
        assert isinstance(attachment.uploaded_at, datetime)

    # проверить сохранение вложения к заданию в базу данных. Ошибка при пропуске обязательного аргумента - url вложения.
    def test_attachment_missing_file_url_raises_integrity_error(self):
        # Подготовка
        project = Project(title="test_project", journal="test")
        user = User(username="test_user", email="test@test.com", hashed_password="hash")
        # Действия
        self.session.add(project)
        self.session.add(user)
        self.session.flush()
        reviewer = Reviewer(project_id=project.id, name="test", general_comment="test")
        self.session.add(reviewer)
        self.session.flush()
        comment = Comment(reviewer_id=reviewer.id, content_md="Fix", type=CommentType.text_change, priority=CommentPriority.medium)
        self.session.add(comment)
        self.session.flush()
        task = Task(comment_id=comment.id, assignee_id=user.id, title="Fix", description_md="Fix", type=TaskType.text_change)
        self.session.add(task)
        self.session.flush()
        attachment = Attachment(task_id=task.id, file_type="application/pdf")
        self.session.add(attachment)
        # Проверки
        with self.assertRaises(IntegrityError):
            self.session.flush()

    # проверить сохранение вложения к заданию в базу данных. Ошибка при пропуске обязательного аргумента - типа вложения.
    def test_attachment_missing_file_type_raises_integrity_error(self):
        # Подготовка
        project = Project(title="test_project", journal="test")
        user = User(username="test_user", email="test@test.com", hashed_password="hash")
        # Действия
        self.session.add(project)
        self.session.add(user)
        self.session.flush()
        reviewer = Reviewer(project_id=project.id, name="test", general_comment="test")
        self.session.add(reviewer)
        self.session.flush()
        comment = Comment(reviewer_id=reviewer.id, content_md="Fix", type=CommentType.text_change, priority=CommentPriority.medium)
        self.session.add(comment)
        self.session.flush()
        task = Task(comment_id=comment.id, assignee_id=user.id, title="Fix", description_md="Fix", type=TaskType.text_change)
        self.session.add(task)
        self.session.flush()
        attachment = Attachment(task_id=task.id, file_url="test.pdf")
        self.session.add(attachment)
        # Проверки
        with self.assertRaises(IntegrityError):
            self.session.flush()

    # проверить сохранение вложения к заданию в базу данных. Ошибка при передачи внешнего ключа несуществующего задания.
    def test_attachment_invalid_task_id_raises_integrity_error(self):
        # Подготовка
        attachment = Attachment(task_id=999999, file_url="test.pdf", file_type="application/pdf")
        # Действия
        self.session.add(attachment)
        # Проверки
        with self.assertRaises(IntegrityError):
            self.session.flush()

    # проверить сохранение логов в базу данных. Установка значений по умолчанию.
    def test_persist_valid_activity_log_in_db(self):
        # Подготовка
        project = Project(title="test_project", journal="test")
        user = User(username="test_user", email="test@test.com", hashed_password="hash")
        # Действия
        self.session.add_all([project, user])
        self.session.flush()
        log = ActivityLog(user_id=user.id, project_id=project.id, action_type="test", description="test")
        self.session.add(log)
        self.session.flush()
        # Проверки
        assert isinstance(log.id, int)
        assert log.project_id == project.id
        assert log.user_id == user.id
        assert log.action_type == "test"
        assert log.description == "test"
        assert isinstance(log.created_at, datetime)

    # проверить сохранение логов в базу данных. Ошибка при пропуске обязательного аргумента - типа действия.
    def test_activity_log_missing_action_type_raises_integrity_error(self):
        # Подготовка
        project = Project(title="test_project", journal="test")
        user = User(username="test_user", email="test@test.com", hashed_password="hash")
        # Действия
        self.session.add_all([project, user])
        self.session.flush()
        log = ActivityLog(user_id=user.id, project_id=project.id, description="test")
        self.session.add(log)
        # Проверки
        with self.assertRaises(IntegrityError):
            self.session.flush()
    
    # проверить сохранение логов в базу данных. Ошибка при пропуске обязательного аргумента - описания.
    def test_activity_log_missing_description_raises_integrity_error(self):
        # Подготовка
        project = Project(title="test_project", journal="test")
        user = User(username="test_user", email="test@test.com", hashed_password="hash")
        # Действия
        self.session.add_all([project, user])
        self.session.flush()
        log = ActivityLog(user_id=user.id, project_id=project.id, action_type="test")
        self.session.add(log)
        # Проверки
        with self.assertRaises(IntegrityError):
            self.session.flush()

    # проверить сохранение логов в базу данных. Ошибка при передачи внешнего ключа несуществующего проекта.
    def test_activity_log_invalid_project_id_raises_integrity_error(self):
        # Подготовка
        user = User(username="test_user", email="test@test.com", hashed_password="hash")
        # Действия
        self.session.add(user)
        self.session.flush()
        log = ActivityLog(user_id=user.id, project_id=999999, action_type="test", description="test")
        self.session.add(log)
        # Проверки
        with self.assertRaises(IntegrityError):
            self.session.flush()

    # проверить сохранение логов в базу данных. Ошибка при передачи внешнего ключа несуществующего пользователя.
    def test_activity_log_invalid_user_id_raises_integrity_error(self):
        # Подготовка
        project = Project(title="test_project", journal="test")
        # Действия
        self.session.add(project)
        self.session.flush()
        log = ActivityLog(user_id=999999, project_id=project.id, action_type="test", description="test")
        self.session.add(log)
        # Проверки
        with self.assertRaises(IntegrityError):
            self.session.flush()

    # проверить связь участников проекта с проектами и пользователями.
    def test_project_project_member_relationship(self):
        # Подготовка
        project = Project(title="test_project", journal="test")
        user = User(username="test_user", email="test@test.com", hashed_password="hash")
        member = ProjectMember(role=UserRole.coauthor)
        # Действия
        member.project = project
        member.user = user
        self.session.add_all([project, user, member])
        self.session.flush()
        # Проверки
        assert len(project.members) == 1
        assert project.members[0] == member
        assert member.project == project
        assert len(user.projects) == 1
        assert user.projects[0] == member
        assert member.user == user

    # проверить связь рецензента с проектами и замечаниями
    def test_project_reviewer_comment_relationships(self):
        # Подготовка
        project = Project(title="test_project", journal="test")
        reviewer = Reviewer(project=project, name="test", general_comment="test")
        comment = Comment(reviewer=reviewer, content_md="Test comment", type=CommentType.text_change, priority=CommentPriority.medium)
        # Действия
        self.session.add_all([project, reviewer, comment])
        self.session.flush()
        # Проверки
        assert len(project.reviewers) == 1
        assert project.reviewers[0] == reviewer
        assert reviewer.project == project
        assert len(reviewer.comments) == 1
        assert reviewer.comments[0] == comment
        assert comment.reviewer == reviewer

    # проверить связь замечания с ответом
    def test_comment_response_one_to_one_relationship(self):
        # Подготовка
        project = Project(title="test_project", journal="test")
        reviewer = Reviewer(project=project, name="test", general_comment="test")
        comment = Comment(reviewer=reviewer, content_md="Test comment", type=CommentType.text_change, priority=CommentPriority.medium)
        response = Response(comment=comment, response_md="test")
        # Действия
        self.session.add_all([project, reviewer, comment, response])
        self.session.flush()
        # Проверки
        assert isinstance(comment.response, Response)
        assert comment.response == response
        assert response.comment == comment

    # проверить связи задачи с замечаниями и вложениями
    def test_comment_task_attachment_relationships(self):
        # Подготовка
        project = Project(title="test_project", journal="test")
        reviewer = Reviewer(project=project, name="test", general_comment="test")
        comment = Comment(reviewer=reviewer, content_md="Test comment", type=CommentType.text_change, priority=CommentPriority.medium)
        user = User(username="test_user", email="test@test.com", hashed_password="hash")
        task = Task(comment=comment, assignee=user, title="Test task", description_md="test", type=TaskType.text_change)
        attachment = Attachment(task=task, file_url="test.png", file_type="image/png")
        # Действия
        self.session.add_all([project, reviewer, comment, user, task, attachment])
        self.session.flush()
        # Проверки
        assert len(comment.tasks) == 1
        assert comment.tasks[0] == task
        assert task.comment == comment
        assert task.assignee == user
        assert len(task.attachments) == 1
        assert task.attachments[0] == attachment
        assert attachment.task == task

if __name__ == "__main__":
    unittest.main()