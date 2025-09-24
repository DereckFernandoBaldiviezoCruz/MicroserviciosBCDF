// server.js (ESM)
import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Utilidades de ruta
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar proto
const PROTO_PATH = path.join(__dirname, "proto", "universidad.proto");
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const proto = grpc.loadPackageDefinition(packageDefinition).universidad;

// ===== "Base de datos" en memoria =====
/** @type {Map<string, Estudiante>} */
const estudiantes = new Map();
/** @type {Map<string, Curso>} */
const cursos = new Map();
/** @type {Map<string, Set<string>>} ci -> set(codigo) */
const inscripcionesPorEstudiante = new Map();
/** @type {Map<string, Set<string>>} codigo -> set(ci) */
const inscripcionesPorCurso = new Map();

// Helpers
function ensureEstudiante(ci) {
  const e = estudiantes.get(ci);
  if (!e) {
    const err = {
      code: grpc.status.NOT_FOUND,
      message: `Estudiante con CI '${ci}' no existe`,
    };
    throw err;
  }
  return e;
}

function ensureCurso(codigo) {
  const c = cursos.get(codigo);
  if (!c) {
    const err = {
      code: grpc.status.NOT_FOUND,
      message: `Curso con código '${codigo}' no existe`,
    };
    throw err;
  }
  return c;
}

// Implementación de servicios
const serviceImpl = {
  AgregarEstudiante: (call, callback) => {
    const e = call.request; // {ci, nombres, apellidos, carrera}
    if (!e.ci) {
      return callback(
        { code: grpc.status.INVALID_ARGUMENT, message: "ci es requerido" },
        null
      );
    }
    if (estudiantes.has(e.ci)) {
      return callback(
        { code: grpc.status.ALREADY_EXISTS, message: "El estudiante ya existe" },
        null
      );
    }
    estudiantes.set(e.ci, e);
    callback(null, { estudiante: e });
  },

  AgregarCurso: (call, callback) => {
    const c = call.request; // {codigo, nombre, docente}
    if (!c.codigo) {
      return callback(
        { code: grpc.status.INVALID_ARGUMENT, message: "codigo es requerido" },
        null
      );
    }
    if (cursos.has(c.codigo)) {
      return callback(
        { code: grpc.status.ALREADY_EXISTS, message: "El curso ya existe" },
        null
      );
    }
    cursos.set(c.codigo, c);
    callback(null, { curso: c });
  },

  InscribirEstudiante: (call, callback) => {
    const { ci, codigo } = call.request;

    try {
      ensureEstudiante(ci);
      ensureCurso(codigo);
    } catch (err) {
      return callback(err, null);
    }

    // Inicializar sets si no existen
    if (!inscripcionesPorEstudiante.has(ci)) inscripcionesPorEstudiante.set(ci, new Set());
    if (!inscripcionesPorCurso.has(codigo)) inscripcionesPorCurso.set(codigo, new Set());

    const setCursos = inscripcionesPorEstudiante.get(ci);
    if (setCursos.has(codigo)) {
      return callback(
        { code: grpc.status.ALREADY_EXISTS, message: "El estudiante ya está inscrito en ese curso" },
        null
      );
    }

    // Registrar inscripción
    setCursos.add(codigo);
    inscripcionesPorCurso.get(codigo).add(ci);

    callback(null, { ok: true, message: "Inscripción realizada" });
  },

  ListarCursosDeEstudiante: (call, callback) => {
    const { ci } = call.request;
    try {
      ensureEstudiante(ci);
    } catch (err) {
      return callback(err, null);
    }

    const codigos = Array.from(inscripcionesPorEstudiante.get(ci) ?? []);
    const lista = codigos.map((cod) => cursos.get(cod)).filter(Boolean);
    callback(null, { cursos: lista });
  },

  ListarEstudiantesDeCurso: (call, callback) => {
    const { codigo } = call.request;
    try {
      ensureCurso(codigo);
    } catch (err) {
      return callback(err, null);
    }

    const cis = Array.from(inscripcionesPorCurso.get(codigo) ?? []);
    const lista = cis.map((id) => estudiantes.get(id)).filter(Boolean);
    callback(null, { estudiantes: lista });
  },
};

// Levantar servidor
const server = new grpc.Server();
server.addService(proto.EstudianteCursoService.service, serviceImpl);

const PORT = process.env.PORT ?? "50051";
server.bindAsync(
  `0.0.0.0:${PORT}`,
  grpc.ServerCredentials.createInsecure(),
  (err, bindPort) => {
    if (err) {
      console.error("Error al iniciar el servidor:", err);
      return;
    }
    console.log(`Servidor gRPC escuchando en ${bindPort}`);
    server.start();
  }
);
