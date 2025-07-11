# 💪 Fit Finance

Sistema de gestión de pagos para gimnasios desarrollado con NestJS, TypeScript y MySQL.

## 📋 Descripción

Fit Finance es una API REST para la gestión integral de un gimnasio que incluye:

- 👥 **Gestión de estudiantes**: Registro y administración de miembros
- 💰 **Control de pagos**: Seguimiento de cuotas y estados de pago
- 🏃‍♂️ **Deportes**: Gestión de diferentes disciplinas deportivas
- 👑 **Roles y autenticación**: Sistema de permisos y autenticación JWT
- 📊 **Fees**: Administración de tarifas y precios

## 🏗️ Arquitectura

El proyecto está construido con:

- **Backend**: NestJS + TypeScript
- **Base de datos**: MySQL 8.0
- **ORM**: TypeORM
- **Autenticación**: JWT
- **Contenedores**: Docker & Docker Compose

## 🚀 Inicio Rápido

### Prerrequisitos

- [Node.js](https://nodejs.org/) (v16 o superior)
- [Docker](https://www.docker.com/) y [Docker Compose](https://docs.docker.com/compose/)
- [Git](https://git-scm.com/)

### 1. Clonar el repositorio

```bash
git clone https://github.com/mauro8792/fit-finance.git
cd fit-finance
```

### 2. Configurar variables de entorno

```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar las variables según tu entorno (opcional)
# Las variables por defecto están listas para usar con Docker
```

### 3. Levantar la base de datos con Docker

```bash
# Levantar MySQL y phpMyAdmin
docker-compose up -d

# Verificar que los servicios estén corriendo
docker-compose ps
```

### 4. Instalar dependencias

```bash
# Usar npm (recomendado)
npm install

# O usar yarn si lo prefieres
yarn install
```

### 5. Ejecutar la aplicación

```bash
# Modo desarrollo
npm run start:dev

# O con yarn
yarn start:dev
```

### 6. Ejecutar el seed (opcional)

Para poblar la base de datos con datos iniciales:

```bash
# Ejecutar seed con el script
npm run seed

# O via HTTP (requiere autenticación)
# GET http://localhost:3000/seed
```

¡Listo! 🎉 Tu aplicación estará corriendo en `http://localhost:3000`

## 🐳 Servicios Docker

| Servicio       | URL                     | Credenciales                                                      |
| -------------- | ----------------------- | ----------------------------------------------------------------- |
| **MySQL**      | `localhost:3306`        | User: `fitfinance`<br>Pass: `password123`<br>DB: `fit_finance_db` |
| **phpMyAdmin** | `http://localhost:8080` | User: `fitfinance`<br>Pass: `password123`                         |

## 📦 Instalación

### Instalación manual (sin Docker)

Si prefieres usar una base de datos MySQL local:

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de MySQL local

# Ejecutar la aplicación
npm run start:dev
```

## 🏃‍♂️ Ejecutar la aplicación

```bash
# Desarrollo (con hot-reload)
npm run start:dev

# Desarrollo sin hot-reload
npm run start

# Producción
npm run start:prod

# Ejecutar seed de datos iniciales
npm run seed
```

## 🧪 Testing

```bash
# Tests unitarios
npm run test

# Tests e2e
npm run test:e2e

# Cobertura de tests
npm run test:cov
```

## 💰 Sistema de Pagos Secuenciales

El sistema implementa **validación de pagos secuenciales** para asegurar que los estudiantes paguen sus cuotas en orden cronológico.

### Funcionalidad

✅ **Validación automática**: No se puede pagar una cuota futura si hay cuotas anteriores pendientes  
✅ **Mensajes informativos**: El sistema indica exactamente qué cuotas están pendientes  
✅ **Generación automática**: Cron job diario que genera nuevas cuotas para estudiantes activos  
✅ **Consulta de pendientes**: Endpoints para verificar estado de cuotas

### Endpoints de validación

```bash
# Consultar cuotas pendientes de un estudiante
GET /fees/student/{studentId}/unpaid

# Validar si se puede pagar una cuota específica
GET /fees/student/{studentId}/validate-payment/{feeId}

# Ejecutar generación manual de cuotas (solo admins)
POST /cron/generate-fees
```

### Ejemplo de uso

```json
// Respuesta de cuotas pendientes
{
  "studentId": 1,
  "unpaidFeesCount": 2,
  "unpaidFees": [
    {
      "id": 1,
      "month": 7,
      "year": 2025,
      "monthName": "Julio",
      "value": 15000,
      "amountPaid": 0,
      "remainingAmount": 15000,
      "startDate": "2025-07-11",
      "endDate": "2025-08-10"
    }
  ]
}
```

## 🤖 Automatización con Cron Jobs

El sistema incluye un **cron job diario** que se ejecuta a las 9:00 AM para:

- Verificar todos los estudiantes activos
- Generar automáticamente nuevas cuotas si tienen menos de 2 cuotas futuras
- Mantener continuidad en las fechas de las cuotas
- Registrar logs de todas las operaciones

## 📁 Estructura del proyecto

```
src/
├── auth/              # Autenticación y autorización
├── common/            # DTOs y tipos comunes
├── fee/               # Gestión de tarifas
├── payment/           # Procesamiento de pagos
├── roles/             # Roles de usuario
├── seed/              # Datos de prueba
├── sport/             # Gestión de deportes
├── student/           # Gestión de estudiantes
└── users/             # Gestión de usuarios
```

## 🔧 Variables de entorno

Copia `.env.example` a `.env` y configura las siguientes variables:

```env
# Base de datos
DB_HOST=localhost
DB_PORT=3306
DB_NAME=fit_finance_db
DB_USERNAME=fitfinance
DB_PASSWORD=password123
DB_ROOT_PASSWORD=rootpassword

# JWT
JWT_SECRET=your-super-secret-jwt-key-here

# Aplicación
PORT=3000
NODE_ENV=development
```

## 🚨 Troubleshooting

### Error: Puerto 3306 ya está en uso

```bash
# Ver qué proceso usa el puerto
netstat -ano | findstr :3306

# Cambiar el puerto en docker-compose.yml o .env
DB_PORT=3307
```

### Error: No se puede conectar a MySQL

```bash
# Verificar que Docker esté corriendo
docker ps

# Verificar logs de MySQL
docker-compose logs mysql

# Reiniciar servicios
docker-compose restart mysql
```

### Warning de múltiples lockfiles

```bash
# Eliminar yarn.lock si usas npm
rm yarn.lock

# O eliminar package-lock.json si usas yarn
rm package-lock.json
```

## 📚 Documentación adicional

- [Configuración de Docker](./DOCKER.md)
- [Diagrama de base de datos](./der.txt)

## 🤝 Contribuir

1. Fork del proyecto
2. Crear una rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit de los cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request
