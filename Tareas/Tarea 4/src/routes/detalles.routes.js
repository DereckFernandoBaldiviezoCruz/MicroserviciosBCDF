const express = require("express");
const router = express.Router();
const { AppDataSource } = require("../data-source");
const repo = () => AppDataSource.getRepository("DetalleFactura");
const facturaRepo = () => AppDataSource.getRepository("Factura");
const productoRepo = () => AppDataSource.getRepository("Producto");

/**
 * @swagger
 * tags:
 *   name: Detalles
 *   description: Gestión de detalles de facturas
 */

/**
 * @swagger
 * /facturas/{facturaId}/detalles:
 *   get:
 *     summary: Obtener detalles de una factura específica
 *     tags: [Detalles]
 *     parameters:
 *       - in: path
 *         name: facturaId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de detalles de la factura
 *       404:
 *         description: Factura no encontrada
 */
router.get("/facturas/:facturaId/detalles", async (req, res, next) => {
  try {
    // verificar que la factura exista (opcional)
    const factura = await facturaRepo().findOneBy({ id: Number(req.params.facturaId) });
    if (!factura) return res.status(404).json({ message: "Factura no encontrada" });

    const detalles = await repo().find({
      where: { factura: { id: Number(req.params.facturaId) } },
      relations: ["producto", "factura"],
    });
    res.json(detalles);
  } catch (e) { next(e); }
});

/**
 * @swagger
 * /facturas/{facturaId}/detalles:
 *   post:
 *     summary: Añadir detalle (producto, cantidad, precio) a una factura existente
 *     tags: [Detalles]
 *     parameters:
 *       - in: path
 *         name: facturaId
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
 *               producto_id:
 *                 type: integer
 *               cantidad:
 *                 type: integer
 *               precio:
 *                 type: number
 *             required:
 *               - producto_id
 *               - cantidad
 *               - precio
 *     responses:
 *       201:
 *         description: Detalle agregado
 *       400:
 *         description: Factura o producto inválido
 */
router.post("/facturas/:facturaId/detalles", async (req, res, next) => {
  try {
    const factura = await facturaRepo().findOneBy({ id: Number(req.params.facturaId) });
    if (!factura) return res.status(400).json({ message: "Factura inválida" });

    const { producto_id, cantidad, precio } = req.body;
    const producto = await productoRepo().findOneBy({ id: Number(producto_id) });
    if (!producto) return res.status(400).json({ message: "Producto inválido" });

    const detalle = repo().create({ cantidad, precio, factura, producto });
    const guardado = await repo().save(detalle);
    res.status(201).json(guardado);
  } catch (e) { next(e); }
});

/**
 * @swagger
 * /detalles/{id}:
 *   get:
 *     summary: Obtener un detalle por ID
 *     tags: [Detalles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalle encontrado
 *       404:
 *         description: Detalle no encontrado
 */
router.get("/detalles/:id", async (req, res, next) => {
  try {
    const det = await repo().findOne({
      where: { id: Number(req.params.id) },
      relations: ["producto", "factura"],
    });
    if (!det) return res.status(404).json({ message: "Detalle no encontrado" });
    res.json(det);
  } catch (e) { next(e); }
});

/**
 * @swagger
 * /detalles/{id}:
 *   put:
 *     summary: Actualizar un detalle de factura
 *     tags: [Detalles]
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
 *               producto_id:
 *                 type: integer
 *               cantidad:
 *                 type: integer
 *               precio:
 *                 type: number
 *     responses:
 *       200:
 *         description: Detalle actualizado
 *       404:
 *         description: Detalle no encontrado
 *       400:
 *         description: Producto inválido
 */
router.put("/detalles/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const det = await repo().findOneBy({ id });
    if (!det) return res.status(404).json({ message: "Detalle no encontrado" });

    if (req.body.producto_id) {
      const p = await productoRepo().findOneBy({ id: Number(req.body.producto_id) });
      if (!p) return res.status(400).json({ message: "Producto inválido" });
      det.producto = p;
    }
    if (req.body.cantidad != null) det.cantidad = req.body.cantidad;
    if (req.body.precio != null) det.precio = req.body.precio;

    const actualizado = await repo().save(det);
    res.json(actualizado);
  } catch (e) { next(e); }
});

/**
 * @swagger
 * /detalles/{id}:
 *   delete:
 *     summary: Eliminar un detalle de factura
 *     tags: [Detalles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Detalle eliminado
 *       404:
 *         description: Detalle no encontrado
 */
router.delete("/detalles/:id", async (req, res, next) => {
  try {
    const r = await repo().delete({ id: Number(req.params.id) });
    if (!r.affected) return res.status(404).json({ message: "Detalle no encontrado" });
    res.status(204).send();
  } catch (e) { next(e); }
});

module.exports = router;
