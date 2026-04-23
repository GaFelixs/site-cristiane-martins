CREATE DATABASE IF NOT EXISTS galeria_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE galeria_db;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  role ENUM('admin', 'client') NOT NULL DEFAULT 'client',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ensaios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT NOT NULL,
  titulo VARCHAR(200) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE photos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ensaio_id INT NOT NULL,
  client_id INT NOT NULL,
  filename VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ensaio_id) REFERENCES ensaios(id) ON DELETE CASCADE,
  FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE selections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT NOT NULL,
  photo_id INT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_selection (client_id, photo_id),
  FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (photo_id) REFERENCES photos(id) ON DELETE CASCADE
);

-- Criar usuário admin (trocar a senha após primeiro acesso)
-- Senha padrão: admin123
INSERT INTO users (nome, email, senha, role) VALUES
('Administrador', 'admin@galeria.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'admin');
