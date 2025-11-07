from flask import Flask, request, jsonify
from ariadne import QueryType, MutationType, make_executable_schema, graphql_sync, gql
from ariadne.constants import PLAYGROUND_HTML
from sqlalchemy import create_engine, text
import os
import grpc
import vehiculos_pb2 as pb2
import vehiculos_pb2_grpc as pb2_grpc

type_defs = gql("""
type Envio { id: ID!, usuario_id: Int!, vehiculo_id: String!, origen: String!, destino: String!, fecha_envio: String!, estado: String! }
type Query { envios: [Envio!]!, envio(id: ID!): Envio }
type Mutation {
  crearEnvio(usuario_id:Int!, vehiculo_id:String!, origen:String!, destino:String!, fecha_envio:String!): Envio
  actualizarEnvio(id:ID!, estado:String!): Envio
  eliminarEnvio(id:ID!): Boolean
}
""")

query = QueryType()
mutation = MutationType()

DB_HOST = os.getenv("DB_HOST","localhost")
DB_USER = os.getenv("DB_USER","root")
DB_PASS = os.getenv("DB_PASS","")
DB_NAME = os.getenv("DB_NAME","logistics")
ENGINE = create_engine(
    f"mysql+pymysql://{DB_USER}:{DB_PASS}@{DB_HOST}/{DB_NAME}",
    pool_pre_ping=True
)
GRPC_HOST = os.getenv("VEHICULOS_GRPC_HOST","localhost")
GRPC_PORT = os.getenv("VEHICULOS_GRPC_PORT","50051")
grpc_channel = grpc.insecure_channel(f"{GRPC_HOST}:{GRPC_PORT}")
grpc_client = pb2_grpc.VehiculosServiceStub(grpc_channel)

@query.field("envios")
def resolve_envios(*_):
    with ENGINE.connect() as c:
        rows = c.execute(text("SELECT id,usuario_id,vehiculo_id,origen,destino,DATE_FORMAT(fecha_envio,'%Y-%m-%d %H:%i:%s') as fecha_envio,estado FROM envios ORDER BY id DESC")).mappings().all()
        return [dict(r) for r in rows]

@query.field("envio")
def resolve_envio(*_, id):
    with ENGINE.connect() as c:
        r = c.execute(text("SELECT id,usuario_id,vehiculo_id,origen,destino,DATE_FORMAT(fecha_envio,'%Y-%m-%d %H:%i:%s') as fecha_envio,estado FROM envios WHERE id=:id"),{"id":id}).mappings().first()
        return dict(r) if r else None

@mutation.field("crearEnvio")
def resolve_crear_envio(*_, usuario_id, vehiculo_id, origen, destino, fecha_envio):
    resp = grpc_client.VerificarDisponibilidad(pb2.DisponibilidadRequest(vehiculo_id=vehiculo_id))
    if not resp.disponible:
        raise Exception("vehiculo_no_disponible")
    with ENGINE.begin() as c:
        c.execute(text("INSERT INTO envios (usuario_id, vehiculo_id, origen, destino, fecha_envio, estado) VALUES (:u,:v,:o,:d,:f,'ASIGNADO')"),{"u":usuario_id,"v":vehiculo_id,"o":origen,"d":destino,"f":fecha_envio})
        r = c.execute(text("SELECT id,usuario_id,vehiculo_id,origen,destino,DATE_FORMAT(fecha_envio,'%Y-%m-%d %H:%i:%s') as fecha_envio,estado FROM envios ORDER BY id DESC LIMIT 1")).mappings().first()
        return dict(r)

@mutation.field("actualizarEnvio")
def resolve_actualizar_envio(*_, id, estado):
    with ENGINE.begin() as c:
        c.execute(text("UPDATE envios SET estado=:e WHERE id=:id"),{"e":estado,"id":id})
        r = c.execute(text("SELECT id,usuario_id,vehiculo_id,origen,destino,DATE_FORMAT(fecha_envio,'%Y-%m-%d %H:%i:%s') as fecha_envio,estado FROM envios WHERE id=:id"),{"id":id}).mappings().first()
        return dict(r) if r else None

@mutation.field("eliminarEnvio")
def resolve_eliminar_envio(*_, id):
    with ENGINE.begin() as c:
        c.execute(text("DELETE FROM envios WHERE id=:id"),{"id":id})
        return True

schema = make_executable_schema(type_defs, query, mutation)
app = Flask(__name__)

@app.route("/graphql", methods=["GET"])
def graphql_playground():
    return PLAYGROUND_HTML, 200

@app.route("/graphql", methods=["POST"])
def graphql_server():
    data = request.get_json()
    success, result = graphql_sync(schema, data, context_value=request, debug=False)
    status_code = 200 if success else 400
    return jsonify(result), status_code

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT","3003")))
