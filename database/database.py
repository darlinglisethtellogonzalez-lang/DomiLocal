
import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.engine import URL

# Ruta principal del proyecto
PROJECT_DIR = Path(__file__).resolve().parent.parent

# Cargar variables locales del archivo .env
load_dotenv(PROJECT_DIR / ".env")

# Ubicación del certificado de TiDB
CA_CERT_PATH = (
    PROJECT_DIR
    / "backend"
    / "isrgrootx1 (1).pem"
)

# Datos de conexión a la base de datos
DATABASE_URL = URL.create(
    drivername="mysql+pymysql",
    username=os.getenv("DB_USER", "root"),
    password=os.getenv("DB_PASSWORD"),
    host=os.getenv("DB_HOST", "localhost"),
    port=int(os.getenv("DB_PORT", "3306")),
    database=os.getenv("DB_NAME", "domilocal"),
)

# Configuración de conexión segura TLS
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    connect_args={
        "ssl": {
            "ca": str(CA_CERT_PATH),
            "check_hostname": True,
        }
    },
)

# Crear sesiones
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

# Base de los modelos
Base = declarative_base()


# Proporcionar sesiones a FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

