# Estructura de Base de Datos - Finanzas Personales

## Backend: Hono + Turso (SQLite)

Sistema de finanzas personales con cuentas maestras, permisos de usuario y comprobantes fotográficos.

## Esquema de Tablas

### 1. Cuentas Maestras

```sql
CREATE TABLE cuentas_maestras (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    email_admin TEXT UNIQUE NOT NULL,
    configuracion JSON DEFAULT '{}',
    activa BOOLEAN DEFAULT true,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Usuarios

```sql
CREATE TABLE usuarios (
    id TEXT PRIMARY KEY,
    cuenta_maestra_id TEXT NOT NULL,
    email TEXT NOT NULL,
    nombre_completo TEXT,
    foto_url TEXT,
    tipo_permiso TEXT CHECK(tipo_permiso IN ('lectura', 'escritura')) DEFAULT 'lectura',
    activo BOOLEAN DEFAULT true,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cuenta_maestra_id) REFERENCES cuentas_maestras(id) ON DELETE CASCADE,
    UNIQUE(cuenta_maestra_id, email)
);
```

### 3. Cuentas Financieras

```sql
CREATE TABLE cuentas (
    id TEXT PRIMARY KEY,
    cuenta_maestra_id TEXT NOT NULL,
    nombre TEXT NOT NULL,
    saldo DECIMAL(15,2) DEFAULT 0.00,
    tipo TEXT DEFAULT 'efectivo',
    color TEXT DEFAULT '#3B82F6',
    icono TEXT DEFAULT 'Wallet',
    activa BOOLEAN DEFAULT true,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cuenta_maestra_id) REFERENCES cuentas_maestras(id) ON DELETE CASCADE,
    CHECK (saldo >= 0)
);
```

### 4. Categorías

```sql
CREATE TABLE categorias (
    id TEXT PRIMARY KEY,
    cuenta_maestra_id TEXT NOT NULL,
    nombre TEXT NOT NULL,
    tipo TEXT CHECK(tipo IN ('ingreso', 'gasto')) NOT NULL,
    icono TEXT NOT NULL DEFAULT 'Tag',
    color TEXT NOT NULL DEFAULT 'blue',
    activa BOOLEAN DEFAULT true,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cuenta_maestra_id) REFERENCES cuentas_maestras(id) ON DELETE CASCADE
);
```

### 5. Transacciones

```sql
CREATE TABLE transacciones (
    id TEXT PRIMARY KEY,
    cuenta_maestra_id TEXT NOT NULL,
    usuario_id TEXT NOT NULL,
    tipo TEXT CHECK(tipo IN ('ingreso', 'gasto')) NOT NULL,
    monto DECIMAL(15,2) NOT NULL CHECK (monto > 0),
    categoria_id TEXT NOT NULL,
    cuenta_id TEXT NOT NULL,
    fecha DATE NOT NULL,
    notas TEXT,
    foto_comprobante_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cuenta_maestra_id) REFERENCES cuentas_maestras(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id),
    FOREIGN KEY (cuenta_id) REFERENCES cuentas(id)
);
```

## Datos Iniciales

### Categorías Predeterminadas (Ingresos)
- Salario
- Honorarios/Freelance
- Venta por apps
- Apoyos gubernamentales
- Remesas
- Bonos

### Categorías Predeterminadas (Gastos)
- Despensa/Súper
- Comida a domicilio
- Transporte público
- Gasolina
- Servicios
- Internet/Telefonía
- Renta/Hipoteca
- Entretenimiento
- Salud
- Educación

## Endpoints API (Hono)

### Autenticación
- `POST /auth/login` - Iniciar sesión
- `POST /auth/logout` - Cerrar sesión

### Cuentas Maestras
- `POST /cuentas-maestras` - Crear cuenta maestra
- `GET /cuentas-maestras/:id` - Obtener cuenta maestra

### Usuarios
- `POST /usuarios` - Crear usuario (solo admin)
- `GET /usuarios` - Listar usuarios de la cuenta
- `PATCH /usuarios/:id` - Actualizar permisos (solo admin)
- `DELETE /usuarios/:id` - Eliminar usuario (solo admin)

### Transacciones
- `GET /transacciones` - Listar transacciones
- `POST /transacciones` - Crear transacción (requiere permiso escritura)
- `PATCH /transacciones/:id` - Actualizar transacción (requiere permiso escritura)
- `DELETE /transacciones/:id` - Eliminar transacción (requiere permiso escritura)
- `POST /transacciones/:id/comprobante` - Subir foto comprobante

### Cuentas
- `GET /cuentas` - Listar cuentas
- `POST /cuentas` - Crear cuenta (requiere permiso escritura)
- `PATCH /cuentas/:id` - Actualizar cuenta (requiere permiso escritura)

### Categorías
- `GET /categorias` - Listar categorías
- `POST /categorias` - Crear categoría (requiere permiso escritura)
- `PATCH /categorias/:id` - Actualizar categoría (requiere permiso escritura)

### Reportes
- `GET /reportes/resumen` - Resumen financiero
- `GET /reportes/gastos-categoria` - Gastos por categoría

## Middleware de Permisos

```typescript
// Verificar que el usuario tenga permisos de escritura
const requireWritePermission = async (c, next) => {
  const user = c.get('user')
  if (user.tipo_permiso !== 'escritura') {
    return c.json({ error: 'Permisos insuficientes' }, 403)
  }
  await next()
}

// Verificar que el usuario sea admin de la cuenta maestra
const requireAdmin = async (c, next) => {
  const user = c.get('user')
  const cuentaMaestra = await db.select().from(cuentasMaestras)
    .where(eq(cuentasMaestras.email_admin, user.email))

  if (!cuentaMaestra.length) {
    return c.json({ error: 'Acceso denegado' }, 403)
  }
  await next()
}
```