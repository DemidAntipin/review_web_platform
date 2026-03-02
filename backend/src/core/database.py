import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from src.core.config import DATABASE_URL

engine = create_engine(DATABASE_URL)

DBSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)

BaseDBModel = declarative_base()

def get_db_session():
	session = DBSession()
	try:
		yield session
	finally:
		session.close()
