-- Script de inicialización para la base de datos fit_finance_db
-- Este script se ejecuta automáticamente cuando se crea el contenedor de MySQL

-- Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS fit_finance_db;

-- Usar la base de datos
USE fit_finance_db;

-- Configurar zona horaria
SET time_zone = '-03:00';

-- Configurar charset
ALTER DATABASE fit_finance_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
