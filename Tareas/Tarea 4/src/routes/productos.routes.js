const express = require("express");
const router = express.Router();
const { AppDataSource } = require("../data-source");
const { getPagination } = require("../middlewares");
const repo = () => AppDataSource.getRepository("Producto");

/**
 * @swagger
 * tags:
 *   name: Productos
 *   description: Gestión de productos
 */

/**
 * @swagger
 * /productos:
 *   get:
 *     summary: Listar productos (paginado y filtros por marca/nombre)
 *     tags: [Productos]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: marca
 *         schema:
 *           type: string
 *       - in: query
 *         name: nombre
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista paginada de productos
 */
router.get("/", async (req, res, next) => {
  try {
    const { skip, limit } = getPagination(req);
    const qb = repo().createQueryBuilder("p").skip(skip).take(limit);

    if (req.query.marca) qb.andWhere("p.marca LIKE :m", { m: `%${req.query.marca}%` });
    if (req.query.nombre) qb.andWhere("p.nombre LIKE :n", { n: `%${req.query.nombre}%` });

    const [data, total] = await qb.getManyAndCount();
    res.json({ total, data });
  } catch (e) { next(e); }
});

/**
 * @swagger
 * /productos/{id}:
 *   get:
 *     summary: Obtener un producto por ID
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Producto encontrado
 *       404:
 *         description: Producto no encontrado
 */
router.get("/:id", async (req, res, next) => {
  try {
    const prod = await repo().findOneBy({ id: Number(req.params.id) });
    if (!prod) return res.status(404).json({ message: "Producto no encontrado" });
    res.json(prod);
  } catch (e) { next(e); }
});

/**
 * @swagger
 * /productos:
 *   post:
 *     summary: Crear un producto
 *     tags: [Productos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Mouse"
 *               descripcion:
 *                 type: string
 *                 example: "Inalámbrico"
 *               marca:
 *                 type: string
 *                 example: "Logi"
 *               stock:
 *                 type: integer
 *                 example: 50
 *             required:
 *               - nombre
 *               - stock
 *     responses:
 *       201:
 *         description: Producto creado
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
 * /productos/{id}:
 *   put:
 *     summary: Actualizar un producto
 *     tags: [Productos]
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
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               marca:
 *                 type: string
 *               stock:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Producto actualizado
 *       404:
 *         description: Producto no encontrado
 */
router.put("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const existente = await repo().findOneBy({ id });
    if (!existente) return res.status(404).json({ message: "Producto no encontrado" });
    repo().merge(existente, req.body);
    const actualizado = await repo().save(existente);
    res.json(actualizado);
  } catch (e) { next(e); }
});

/**
 * @swagger
 * /productos/{id}:
 *   delete:
 *     summary: Eliminar un producto
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Producto eliminado
 *       404:
 *         description: Producto no encontrado
 */
router.delete("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const r = await repo().delete({ id });
    if (!r.affected) return res.status(404).json({ message: "Producto no encontrado" });
    res.status(204).send();
  } catch (e) { next(e); }
});

module.exports = router;
