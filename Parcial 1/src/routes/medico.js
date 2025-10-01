const express = require("express");
const router = express.Router();
const { AppDataSource } = require("../data-source");

const repo = () => AppDataSource.getRepository("Medico");

router.get("/", async (_req, res) => {
  const medicos = await repo().find();
  res.json(medicos);
});

router.post("/", async (req, res) => {
  try {
    const medico = repo().create(req.body);
    const guardado = await repo().save(medico);
    res.status(201).json(guardado);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.put("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const existe = await repo().findOneBy({ id });
  if (!existe) return res.status(404).json({ message: "No encontrado" });

  repo().merge(existe, req.body);
  const actualizado = await repo().save(existe);
  res.json(actualizado);
});

router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const r = await repo().delete(id);
  if (r.affected === 0) return res.status(404).json({ message: "No encontrado" });
  res.json({ message: "Eliminado" });
});

module.exports = router;