const express = require("express");
const router = express.Router();
const { AppDataSource } = require("../data-source");
const repo = () => AppDataSource.getRepository("Factura");
const clienteRepo = () => AppDataSource.getRepository("Cliente");
const { getPagination } = require("../middlewares");

/**
 * @swagger
 * tags:
 *   name: Facturas
 *   description: Gestión de facturas
 */

/**
 * @swagger
 * /facturas:
 *   get:
 *     summary: Listar facturas (paginado)
 *     tags: [Facturas]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de facturas
 */
router.get("/", async (req, res, next) => {
  try {
    const { skip, limit } = getPagination(req);
    const [data, total] = await repo().findAndCount({
      relations: ["cliente", "detalles"],
      skip, take: limit,
      order: { id: "DESC" },
    });
    res.json({ total, data });
  } catch (e) { next(e); }
});

/**
 * @swagger
 * /facturas/{id}:
 *   get:
 *     summary: Obtener una factura por ID (con cliente y detalles)
 *     tags: [Facturas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Factura encontrada
 *       404:
 *         description: Factura no encontrada
 */
router.get("/:id", async (req, res, next) => {
  try {
    const fac = await repo().findOne({
      where: { id: Number(req.params.id) },
      relations: ["cliente", "detalles"],
    });
    if (!fac) return res.status(404).json({ message: "Factura no encontrada" });
    res.json(fac);
  } catch (e) { next(e); }
});

/**
 * @swagger
 * /facturas:
 *   post:
 *     summary: Crear una nueva factura (asociada a un cliente)
 *     tags: [Facturas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fecha:
 *                 type: string
 *                 format: date
 *                 example: "2025-09-05"
 *               cliente_id:
 *                 type: integer
 *                 example: 1
 *             required:
 *               - fecha
 *               - cliente_id
 *     responses:
 *       201:
 *         description: Factura creada
 *       400:
 *         description: Cliente inválido
 */
router.post("/", async (req, res, next) => {
  try {
    const { fecha, cliente_id } = req.body;
    const cliente = await clienteRepo().findOneBy({ id: Number(cliente_id) });
    if (!cliente) return res.status(400).json({ message: "Cliente inválido" });

    const nueva = repo().create({ fecha, cliente });
    const guardada = await repo().save(nueva);
    res.status(201).json(guardada);
  } catch (e) { next(e); }
});

/**
 * @swagger
 * /facturas/{id}:
 *   put:
 *     summary: Actualizar una factura (fecha y/o cliente)
 *     tags: [Facturas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fecha:
 *                 type: string
 *                 format: date
 *               cliente_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Factura actualizada
 *       404:
 *         description: Factura no encontrada
 *       400:
 *         description: Cliente inválido
 */
router.put("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const existente = await repo().findOneBy({ id });
    if (!existente) return res.status(404).json({ message: "Factura no encontrada" });

    if (req.body.cliente_id) {
      const cliente = await AppDataSource.getRepository("Cliente")
        .findOneBy({ id: Number(req.body.cliente_id) });
      if (!cliente) return res.status(400).json({ message: "Cliente inválido" });
      existente.cliente = cliente;
    }
    if (req.body.fecha) existente.fecha = req.body.fecha;

    res.json(await repo().save(existente));
  } catch (e) { next(e); }
});

/**
 * @swagger
 * /facturas/{id}:
 *   delete:
 *     summary: Eliminar una factura
 *     tags: [Facturas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Factura eliminada
 *       404:
 *         description: Factura no encontrada
 */
router.delete("/:id", async (req, res, next) => {
  try {
    const r = await repo().delete({ id: Number(req.params.id) });
    if (!r.affected) return res.status(404).json({ message: "Factura no encontrada" });
    res.status(204).send();
  } catch (e) { next(e); }
});

module.exports = router;
