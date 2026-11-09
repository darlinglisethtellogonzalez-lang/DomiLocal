from database.database import engine
from sqlalchemy import text

with engine.begin() as db:

    usuario = db.execute(
        text("""
            SELECT id FROM usuarios
            WHERE email = :email
        """),
        {"email": "prueba@domilocal.local"}
    ).fetchone()

    if usuario is None:
        resultado = db.execute(
            text("""
                INSERT INTO usuarios
                (nombre, email, password, rol)
                VALUES
                (:nombre, :email, :password, :rol)
            """),
            {
                "nombre": "Administrador de prueba",
                "email": "prueba@domilocal.local",
                "password": "temporal123",
                "rol": "negocio"
            }
        )
        usuario_id = resultado.lastrowid
    else:
        usuario_id = usuario.id

    negocio = db.execute(
        text("""
            SELECT id FROM negocios
            WHERE nombre_negocio = :nombre
        """),
        {"nombre": "DomiLocal Restaurante"}
    ).fetchone()

    if negocio is None:
        db.execute(
            text("""
                INSERT INTO negocios
                (usuario_id, nombre_negocio, categoria)
                VALUES
                (:usuario_id, :nombre, :categoria)
            """),
            {
                "usuario_id": usuario_id,
                "nombre": "DomiLocal Restaurante",
                "categoria": "Comidas rápidas"
            }
        )

    print("Usuario y negocio verificados correctamente.")