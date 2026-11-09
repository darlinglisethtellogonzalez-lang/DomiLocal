from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Ruta de conexión oficial a tu MySQL local
DATABASE_URL = "mysql+pymysql://root:@localhost:3306/domilocal"

# Crear el motor de la base de datos
engine = create_engine(DATABASE_URL)

# Crear la sesión para hacer consultas
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base para los modelos de datos
Base = declarative_base()

# Función para obtener la base de datos en las rutas
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()