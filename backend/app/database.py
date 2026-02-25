import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://app_user:secure_password@localhost/review_platform")
engine = create_engine(DATABASE_URL)

DBSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)

BaseDBModel = declarative_base()
