from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from src.core.config import DATABASE_URL

engine = create_async_engine(DATABASE_URL)

DBSession = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

BaseDBModel = declarative_base()

async def get_db_session() -> AsyncSession:
    async with DBSession() as session:
        yield session
