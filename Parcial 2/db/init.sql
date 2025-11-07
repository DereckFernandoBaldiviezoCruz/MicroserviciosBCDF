CREATE DATABASE IF NOT EXISTS logistics;
USE logistics;
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  correo VARCHAR(120) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL
);
INSERT INTO usuarios (correo, password) VALUES ('admin@logi.com','admin123');
CREATE TABLE IF NOT EXISTS envios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  vehiculo_id VARCHAR(64) NOT NULL,
  origen VARCHAR(120) NOT NULL,
  destino VARCHAR(120) NOT NULL,
  fecha_envio DATETIME NOT NULL,
  estado VARCHAR(40) NOT NULL
);
