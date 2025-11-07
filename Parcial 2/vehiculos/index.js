import express from "express"
import cors from "cors"
import bodyParser from "body-parser"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"
import swaggerUi from "swagger-ui-express"
import swaggerJSDoc from "swagger-jsdoc"
import grpc from "@grpc/grpc-js"
import protoLoader from "@grpc/proto-loader"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(cors())
app.use(bodyParser.json())

const JWT_SECRET = process.env.JWT_SECRET || "secret"
const MONGO_URI = (process.env.MONGO_URI || "mongodb://localhost:27017/vehiculosdb") + "?directConnection=true"
const PORT = process.env.PORT || 3002
const GRPC_PORT = process.env.GRPC_PORT || 50051

let Vehiculo

async function connectMongoWithRetry() {
  let intento = 0
  while (true) {
    try {
      await mongoose.connect(MONGO_URI)
      const schema = new mongoose.Schema({
        placa: { type:String, unique:true, required:true },
        tipo: { type:String, required:true },
        capacidad: { type:Number, required:true },
        estado: { type:String, required:true }
      }, { timestamps:true, collection: "vehiculos" })
      Vehiculo = mongoose.models.Vehiculo || mongoose.model("Vehiculo", schema)
      break
    } catch (e) {
      intento++
      await new Promise(r => setTimeout(r, Math.min(5000, 500 * intento)))
    }
  }
}

function auth(req,res,next){
  const h = req.headers.authorization || ""
  const t = h.startsWith("Bearer ") ? h.slice(7) : null
  if(!t) return res.status(401).json({error:"no token"})
  try{ jwt.verify(t, JWT_SECRET); next() } catch(e){ res.status(401).json({error:"token"}) }
}

const swaggerSpec = swaggerJSDoc({
  definition:{ openapi:"3.0.0", info:{ title:"Vehiculos API", version:"1.0.0"} },
  apis:[path.join(__dirname,"index.js")]
})
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))

app.get("/vehiculos", auth, async (req,res)=>{ res.json(await Vehiculo.find().lean()) })
app.post("/vehiculos", auth, async (req,res)=>{
  try{ const v = await new Vehiculo(req.body).save(); res.status(201).json(v) }
  catch(e){ res.status(400).json({error:"invalido_o_duplicado"}) }
})
app.put("/vehiculos/:id", auth, async (req,res)=>{
  const v = await Vehiculo.findByIdAndUpdate(req.params.id, req.body, {new:true})
  if(!v) return res.status(404).json({error:"no_encontrado"})
  res.json(v)
})
app.delete("/vehiculos/:id", auth, async (req,res)=>{
  const r = await Vehiculo.findByIdAndDelete(req.params.id)
  if(!r) return res.status(404).json({error:"no_encontrado"})
  res.status(204).end()
})

const packageDef = protoLoader.loadSync(path.join(__dirname,"proto/vehiculos.proto"),{keepCase:true, longs:String, enums:String, defaults:true, oneofs:true})
const vehProto = grpc.loadPackageDefinition(packageDef).vehiculos
const grpcServer = new grpc.Server()
grpcServer.addService(vehProto.VehiculosService.service, {
  VerificarDisponibilidad: async (call, callback)=>{
    try{
      const { vehiculo_id } = call.request
      const v = await Vehiculo.findById(vehiculo_id).lean()
      if(!v) return callback(null,{disponible:false, estado:"no_encontrado"})
      const d = (v.estado || "").toLowerCase() === "disponible"
      callback(null,{disponible:d, estado:v.estado})
    }catch(e){
      callback({ code: grpc.status.INTERNAL, message:"error" })
    }
  }
})

async function start() {
  await connectMongoWithRetry()
  await new Promise(res => grpcServer.bindAsync(`0.0.0.0:${GRPC_PORT}`, grpc.ServerCredentials.createInsecure(), () => { grpcServer.start(); res() }))
  app.listen(PORT, ()=>{})
}
start()
