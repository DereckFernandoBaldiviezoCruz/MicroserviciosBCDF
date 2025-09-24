// client.js (ESM)
import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import path from "node:path";
import { fileURLToPath } from "node:url";

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

// Crear cliente
const client = new proto.EstudianteCursoService(
  "localhost:50051",
  grpc.credentials.createInsecure()
);

// Helpers promisificados
function rpc(method, payload) {
  return new Promise((resolve, reject) => {
    client[method](payload, (err, resp) => (err ? reject(err) : resolve(resp)));
  });
}

async function main() {
  try {
    // 1) Registrar un estudiante
    const estudiante = {
      ci: "12345",
      nombres: "Carlos",
      apellidos: "Montellano",
      carrera: "Sistemas",
    };
    const r1 = await rpc("AgregarEstudiante", estudiante);
    console.log("Estudiante agregado:", r1.estudiante);

    // 2) Registrar dos cursos
    const curso1 = { codigo: "INF101", nombre: "Programación I", docente: "Ing. Pérez" };
    const curso2 = { codigo: "INF202", nombre: "Estructuras de Datos", docente: "Ing. Gómez" };

    const r2 = await rpc("AgregarCurso", curso1);
    console.log("Curso agregado:", r2.curso);
    const r3 = await rpc("AgregarCurso", curso2);
    console.log("Curso agregado:", r3.curso);

    // 3) Inscribir al estudiante en ambos cursos
    const i1 = await rpc("InscribirEstudiante", { ci: "12345", codigo: "INF101" });
    console.log("InscribirEstudiante:", i1);

    const i2 = await rpc("InscribirEstudiante", { ci: "12345", codigo: "INF202" });
    console.log("InscribirEstudiante:", i2);

    // (Opcional) Probar inscribir duplicado para ver ALREADY_EXISTS
    try {
      await rpc("InscribirEstudiante", { ci: "12345", codigo: "INF101" });
    } catch (e) {
      console.log("Esperado (duplicado):", e.code, e.message);
    }

    // 4) Consultar cursos del estudiante
    const lc = await rpc("ListarCursosDeEstudiante", { ci: "12345" });
    console.log("Cursos del estudiante:", lc.cursos);

    // 5) Consultar estudiantes de un curso
    const le = await rpc("ListarEstudiantesDeCurso", { codigo: "INF101" });
    console.log("Estudiantes de INF101:", le.estudiantes);
  } catch (err) {
    console.error("Error en el cliente:", err);
  }
}

main();
