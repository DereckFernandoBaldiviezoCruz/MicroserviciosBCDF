const express = require("express");
const router = express.Router();
const { AppDataSource } = require("../data-source");
const repo = () => AppDataSource.getRepository("Cliente");
const facturaRepo = () => AppDataSource.getRepository("Factura");
const { getPagination } = require("../middlewares");

/**
 * @swagger
 * tags:
 *   name: Clientes
 *   description: Gestión de clientes
 */

/**
 * @swagger
 * /clientes:
 *   get:
 *     summary: Listar clientes (paginado y filtro por ci)
 *     tags: [Clientes]
 *     parameters:
 *       - in: query
 *         name: ci
 *         schema:
 *           type: string
 *         description: Filtrar por número de CI
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
 *         description: Lista de clientes
 */
router.get("/", async (req, res, next) => {
  try {
    const { skip, limit } = getPagination(req);
    const qb = repo().createQueryBuilder("c").skip(skip).take(limit);
    if (req.query.ci) qb.andWhere("c.ci LIKE :ci", { ci: `%${req.query.ci}%` });
    const [data, total] = await qb.getManyAndCount();
    res.json({ total, data });
  } catch (e) { next(e); }
});

/**
 * @swagger
 * /clientes/{id}:
 *   get:
 *     summary: Obtener un cliente por ID (con facturas)
 *     tags: [Clientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Cliente con facturas
 *       404:
 *         description: Cliente no encontrado
 */
router.get("/:id", async (req, res, next) => {
  try {
    const cli = await repo().findOne({
      where: { id: Number(req.params.id) },
      relations: ["facturas"],
    });
    if (!cli) return res.status(404).json({ message: "Cliente no encontrado" });
    res.json(cli);
  } catch (e) { next(e); }
});

/**
 * @swagger
 * /clientes:
 *   post:
 *     summary: Crear un nuevo cliente
 *     tags: [Clientes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ci:
 *                 type: string
 *                 example: "12345678"
 *               nombres:
 *                 type: string
 *                 example: "Juan"
 *               apellidos:
 *                 type: string
 *                 example: "Pérez"
 *               sexo:
 *                 type: string
 *                 enum: [M, F]
 *                 example: "M"
 *             required:
 *               - ci
 *               - nombres
 *               - apellidos
 *     responses:
 *       201:
 *         description: Cliente creado correctamente
 */
router.post("/", async (req, res, next) => {
  try {
    const nuevo = repo().create(req.body);
    const guardado = await repo().save(nuevo);
    res.status(201).json(guardado);
  } catch (e) { next(e); }
});

/**
 * @swagger
 * /clientes/{id}:
 *   put:
 *     summary: Actualizar un cliente existente
 *     tags: [Clientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ci:
 *                 type: string
 *               nombres:
 *                 type: string
 *               apellidos:
 *                 type: string
 *               sexo:
 *                 type: string
 *                 enum: [M, F]
 *     responses:
 *       200:
 *         description: Cliente actualizado correctamente
 *       404:
 *         description: Cliente no encontrado
 */
router.put("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const existente = await repo().findOneBy({ id });
    if (!existente) return res.status(404).json({ message: "Cliente no encontrado" });
    repo().merge(existente, req.body);
    res.json(await repo().save(existente));
  } catch (e) { next(e); }
});

/**
 * @swagger
 * /clientes/{id}:
 *   delete:
 *     summary: Eliminar un cliente
 *     tags: [Clientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Cliente eliminado correctamente
 *       404:
 *         description: Cliente no encontrado
 */
router.delete("/:id", async (req, res, next) => {
  try {
    const r = await repo().delete({ id: Number(req.params.id) });
    if (!r.affected) return res.status(404).json({ message: "Cliente no encontrado" });
    res.status(204).send();
  } catch (e) { next(e); }
});

/**
 * @swagger
 * /clientes/{id}/facturas:
 *   get:
 *     summary: Obtener facturas de un cliente específico
 *     tags: [Clientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de facturas del cliente
 */
router.get("/:id/facturas", async (req, res, next) => {
  try {
    const facturas = await facturaRepo().find({
      where: { cliente: { id: Number(req.params.id) } },
      relations: ["detalles"],
    });
    res.json(facturas);
  } catch (e) { next(e); }
});

module.exports = router;
