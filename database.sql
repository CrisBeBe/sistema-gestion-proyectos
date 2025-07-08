-- Crear base de datos
CREATE DATABASE IF NOT EXISTS sistema_proyectos;
USE sistema_proyectos;

-- Tabla de usuarios
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    avatar VARCHAR(500) NULL,
    INDEX idx_email (email)
);

-- Tabla de proyectos
CREATE TABLE proyectos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_limite DATE NULL,
    estado ENUM('activo', 'completado', 'pausado') DEFAULT 'activo',
    creador_id INT NOT NULL,
    presupuesto DECIMAL(15,2) NULL,
    FOREIGN KEY (creador_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_creador (creador_id),
    INDEX idx_estado (estado),
    INDEX idx_fecha_creacion (fecha_creacion)
);

-- Tabla de miembros del proyecto
CREATE TABLE proyecto_miembros (
    id INT AUTO_INCREMENT PRIMARY KEY,
    proyecto_id INT NOT NULL,
    usuario_id INT NOT NULL,
    rol ENUM('admin', 'colaborador') DEFAULT 'colaborador',
    fecha_union TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    UNIQUE KEY unique_proyecto_usuario (proyecto_id, usuario_id),
    INDEX idx_proyecto (proyecto_id),
    INDEX idx_usuario (usuario_id)
);

-- Tabla de tareas
CREATE TABLE tareas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    estado ENUM('pendiente', 'en_progreso', 'completada') DEFAULT 'pendiente',
    prioridad ENUM('baja', 'media', 'alta') DEFAULT 'media',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_limite DATE NULL,
    proyecto_id INT NOT NULL,
    creador_id INT NOT NULL,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    FOREIGN KEY (creador_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_proyecto (proyecto_id),
    INDEX idx_creador (creador_id),
    INDEX idx_estado (estado),
    INDEX idx_prioridad (prioridad),
    INDEX idx_fecha_creacion (fecha_creacion)
);

-- Tabla de asignaciones de tareas
CREATE TABLE tarea_asignaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tarea_id INT NOT NULL,
    usuario_id INT NOT NULL,
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tarea_id) REFERENCES tareas(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    UNIQUE KEY unique_tarea_usuario (tarea_id, usuario_id),
    INDEX idx_tarea (tarea_id),
    INDEX idx_usuario (usuario_id)
);

-- Tabla de comentarios
CREATE TABLE comentarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    contenido TEXT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tarea_id INT NOT NULL,
    usuario_id INT NOT NULL,
    FOREIGN KEY (tarea_id) REFERENCES tareas(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_tarea (tarea_id),
    INDEX idx_usuario (usuario_id),
    INDEX idx_fecha_creacion (fecha_creacion)
);

-- Tabla de invitaciones
CREATE TABLE invitaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    proyecto_id INT NOT NULL,
    email VARCHAR(255) NOT NULL,
    estado ENUM('pendiente', 'aceptada', 'rechazada') DEFAULT 'pendiente',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    INDEX idx_proyecto (proyecto_id),
    INDEX idx_email (email),
    INDEX idx_estado (estado)
);

-- Tabla de archivos de proyecto
CREATE TABLE proyecto_archivos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    proyecto_id INT NOT NULL,
    nombre_archivo VARCHAR(255) NOT NULL,
    nombre_original VARCHAR(255) NOT NULL,
    tipo_archivo VARCHAR(100) NOT NULL,
    tamaño INT NOT NULL,
    ruta_archivo VARCHAR(500) NOT NULL,
    subido_por INT NOT NULL,
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    FOREIGN KEY (subido_por) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_proyecto (proyecto_id),
    INDEX idx_subido_por (subido_por),
    INDEX idx_fecha_subida (fecha_subida)
);

-- Tabla de archivos de tarea
CREATE TABLE tarea_archivos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tarea_id INT NOT NULL,
    nombre_archivo VARCHAR(255) NOT NULL,
    nombre_original VARCHAR(255) NOT NULL,
    tipo_archivo VARCHAR(100) NOT NULL,
    tamaño INT NOT NULL,
    ruta_archivo VARCHAR(500) NOT NULL,
    subido_por INT NOT NULL,
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tarea_id) REFERENCES tareas(id) ON DELETE CASCADE,
    FOREIGN KEY (subido_por) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_tarea (tarea_id),
    INDEX idx_subido_por (subido_por),
    INDEX idx_fecha_subida (fecha_subida)
);

-- Tabla de archivos de comentario
CREATE TABLE comentario_archivos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    comentario_id INT NOT NULL,
    nombre_archivo VARCHAR(255) NOT NULL,
    nombre_original VARCHAR(255) NOT NULL,
    tipo_archivo VARCHAR(100) NOT NULL,
    tamaño INT NOT NULL,
    ruta_archivo VARCHAR(500) NOT NULL,
    subido_por INT NOT NULL,
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (comentario_id) REFERENCES comentarios(id) ON DELETE CASCADE,
    FOREIGN KEY (subido_por) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_comentario (comentario_id),
    INDEX idx_subido_por (subido_por),
    INDEX idx_fecha_subida (fecha_subida)
);

-- Insertar datos de ejemplo
INSERT INTO usuarios (nombre, email, password) VALUES
('Admin Usuario', 'admin@ejemplo.com', '$2b$10$example_hash_1'),
('Juan Pérez', 'juan@ejemplo.com', '$2b$10$example_hash_2'),
('María García', 'maria@ejemplo.com', '$2b$10$example_hash_3'),
('Carlos López', 'carlos@ejemplo.com', '$2b$10$example_hash_4');

INSERT INTO proyectos (nombre, descripcion, creador_id, presupuesto) VALUES
('Sistema de Gestión', 'Desarrollo de sistema de gestión de proyectos', 1, 50000.00),
('App Móvil', 'Aplicación móvil para clientes', 2, 30000.00),
('Sitio Web Corporativo', 'Rediseño del sitio web de la empresa', 1, 15000.00);

INSERT INTO proyecto_miembros (proyecto_id, usuario_id, rol) VALUES
(1, 1, 'admin'),
(1, 2, 'colaborador'),
(1, 3, 'colaborador'),
(2, 2, 'admin'),
(2, 4, 'colaborador'),
(3, 1, 'admin'),
(3, 3, 'colaborador');

INSERT INTO tareas (titulo, descripcion, proyecto_id, creador_id, prioridad) VALUES
('Diseño de base de datos', 'Crear el esquema de la base de datos', 1, 1, 'alta'),
('Desarrollo del frontend', 'Implementar la interfaz de usuario', 1, 1, 'media'),
('Configurar servidor', 'Configurar el servidor de producción', 1, 1, 'baja'),
('Diseño de mockups', 'Crear mockups de la aplicación móvil', 2, 2, 'alta'),
('Desarrollo de API', 'Implementar la API REST', 2, 2, 'media');

INSERT INTO tarea_asignaciones (tarea_id, usuario_id) VALUES
(1, 2),
(1, 3),
(2, 3),
(3, 2),
(4, 4),
(5, 2);

INSERT INTO comentarios (contenido, tarea_id, usuario_id) VALUES
('He comenzado con el diseño inicial', 1, 2),
('Necesito más información sobre los requerimientos', 2, 3),
('El servidor está casi listo', 3, 2),
('Los mockups están en revisión', 4, 4);
