# Usar una imagen base de Node.js
FROM node:20-alpine

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar los archivos necesarios al contenedor
COPY package.json ./
COPY app.js index.html ./

# Instalar las dependencias
RUN npm install

# exponer puerto
EXPOSE 8080

# Comando para iniciar el servidor
CMD ["node", "app.js"]
