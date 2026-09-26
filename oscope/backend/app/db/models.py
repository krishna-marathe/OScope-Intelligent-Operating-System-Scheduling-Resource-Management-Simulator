from sqlalchemy import Column, Integer, String, JSON, DateTime
import datetime
from .database import Base

class Experiment(Base):
    __tablename__ = "experiments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, default="Untitled Experiment")
    algorithm = Column(String, index=True)
    time_quantum = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    # store full json strings or dicts
    processes = Column(JSON)
    simulation_result = Column(JSON)
