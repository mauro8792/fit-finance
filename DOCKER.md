# Docker Compose para Fit Finance

Este proyecto incluye un archivo `docker-compose.yml` para ejecutar MySQL y phpMyAdmin localmente.

## Servicios incluidos

- **MySQL 8.0**: Base de datos principal
- **phpMyAdmin**: Interfaz web para administrar la base de datos

## Cómo usar

1. **Copiar variables de entorno:**

   ```bash
   cp .env.example .env
   ```

2. **Iniciar los servicios:**

   ```bash
   docker-compose up -d
   ```

3. **Detener los servicios:**

   ```bash
   docker-compose down
   ```

4. **Ver logs:**
   ```bash
   docker-compose logs mysql
   docker-compose logs phpmyadmin
   ```

## Acceso a los servicios

- **MySQL**: `localhost:3306`
- **phpMyAdmin**: `http://localhost:8080`

## Configuración por defecto

- **Base de datos**: `fit_finance_db`
- **Usuario**: `fitfinance`
- **Contraseña**: `password123`
- **Root password**: `rootpassword`

## Variables de entorno

Puedes modificar las variables en el archivo `.env`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=fit_finance_db
DB_USERNAME=fitfinance
DB_PASSWORD=password123
DB_ROOT_PASSWORD=rootpassword
```

## Comandos útiles

```bash
# Recrear los contenedores
docker-compose up --build -d

# Eliminar volúmenes (esto borrará todos los datos)
docker-compose down -v

# Ejecutar solo MySQL
docker-compose up mysql -d

# Backup de la base de datos
docker exec fit-finance-mysql mysqldump -u fitfinance -ppassword123 fit_finance_db > backup.sql

# Restaurar backup
docker exec -i fit-finance-mysql mysql -u fitfinance -ppassword123 fit_finance_db < backup.sql
```
