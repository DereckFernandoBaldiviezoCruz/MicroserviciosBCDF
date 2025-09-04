const { AppDataSource } = require("../data-source");

const resolvers = {
  Query: {
    getLibros: async () => {
      return await AppDataSource.getRepository("Libro").find({
        relations: ["prestamos"],
      });
    },
    getPrestamos: async () => {
      return await AppDataSource.getRepository("Prestamo").find({
        relations: ["libro"],
      });
    },
    getPrestamoById: async (_, { id }) => {
      return await AppDataSource.getRepository("Prestamo").findOne({
        where: { id },
        relations: ["libro"],
      });
    },
    getPrestamosByUsuario: async (_, { usuario }) => {
      return await AppDataSource.getRepository("Prestamo").find({
        where: { usuario },
        relations: ["libro"],
      });
    },
  },

  Mutation: {
    createLibro: async (_, { titulo, autor, isbn, anio_publicacion }) => {
      const repo = AppDataSource.getRepository("Libro");
      const libro = repo.create({ titulo, autor, isbn, anio_publicacion });
      return await repo.save(libro);
    },
    createPrestamo: async (
      _,
      { usuario, fecha_prestamo, fecha_devolucion, libroId }
    ) => {
      const repoPrestamo = AppDataSource.getRepository("Prestamo");
      const repoLibro = AppDataSource.getRepository("Libro");

      const libro = await repoLibro.findOneBy({ id: libroId });
      if (!libro) throw new Error("Libro no encontrado");

      const prestamo = repoPrestamo.create({
        usuario,
        fecha_prestamo,
        fecha_devolucion,
        libro,
      });

      return await repoPrestamo.save(prestamo);
    },
  },
};

module.exports = resolvers;
