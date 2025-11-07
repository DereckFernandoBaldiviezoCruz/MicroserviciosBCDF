import express from "express"
import jwt from "jsonwebtoken"
import mysql from "mysql2/promise"
import cors from "cors"
import bodyParser from "body-parser"

const app = express()
app.use(cors())
app.use(bodyParser.json())

const DB_HOST = process.env.DB_HOST || "mysql"
const DB_USER = process.env.DB_USER || "root"
const DB_PASS = process.env.DB_PASS || "root"
const DB_NAME = process.env.DB_NAME || "logistics"
const JWT_SECRET = process.env.JWT_SECRET || "secret"
const PORT = process.env.PORT || 3001

let pool

async function waitDb(max = 60) {
  let i = 0
  while (i < max) {
    try {
      pool = mysql.createPool({
        host: DB_HOST,
        user: DB_USER,
        password: DB_PASS,
        database: DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      })
      const conn = await pool.getConnection()
      await conn.ping()
      conn.release()
      return
    } catch (e) {
      await new Promise(r => setTimeout(r, 1000))
      i++
    }
  }
  process.exit(1)
}

app.post("/login", async (req,res)=>{
  try {
    const { correo, password } = req.body || {}
    if(!correo || !password) return res.status(400).json({error:"datos invalidos"})
    const [rows] = await pool.query("SELECT id,correo,password FROM usuarios WHERE correo=? LIMIT 1",[correo])
    if(!rows.length) return res.status(401).json({error:"credenciales"})
    const user = rows[0]
    if(user.password !== password) return res.status(401).json({error:"credenciales"})
    const token = jwt.sign({ sub:user.id, correo:user.correo }, JWT_SECRET, { expiresIn:"2h" })
    res.json({ token })
  } catch (e) {
    res.status(503).json({ error: "db" })
  }
})

waitDb().then(()=> app.listen(PORT, ()=>{}))
