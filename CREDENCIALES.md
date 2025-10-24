# 🔐 Credenciales de Acceso - Sistema de Auditoría Interna

## 👥 Usuarios Disponibles

### 1. **Administrador**
- **Usuario**: `admin`
- **Contraseña**: `123456`
- **Rol**: Administrador
- **Permisos**: Acceso completo a todas las funcionalidades

### 2. **Auditor**
- **Usuario**: `auditor1`
- **Contraseña**: `123456`
- **Rol**: Auditor
- **Permisos**: 
  - Gestión de auditorías
  - Ejecución de auditorías
  - Informes
  - Acciones correctivas

### 3. **Supervisor**
- **Usuario**: `supervisor1`
- **Contraseña**: `123456`
- **Rol**: Supervisor
- **Permisos**:
  - Gestión de auditorías
  - Informes
  - Acciones correctivas

## 🚀 Cómo Acceder

1. **Abrir la aplicación** en el navegador
2. **Serás redirigido** a la página de login
3. **Ingresar credenciales** usando cualquiera de los usuarios arriba
4. **Hacer clic en "Iniciar Sesión"**
5. **Serás redirigido** al dashboard principal

## 🔒 Características de Seguridad

- **Autenticación requerida** para todas las páginas
- **Persistencia de sesión** usando localStorage
- **Redirección automática** a login si no estás autenticado
- **Logout automático** al cerrar sesión
- **Protección de rutas** para usuarios no autenticados

## 📱 Funcionalidades por Rol

### Administrador
- ✅ Acceso completo a todas las funcionalidades
- ✅ Gestión de usuarios (futuro)
- ✅ Configuración del sistema (futuro)

### Auditor
- ✅ Crear y gestionar auditorías
- ✅ Crear ejecución de auditorías
- ✅ Generar informes
- ✅ Gestionar acciones correctivas

### Supervisor
- ✅ Revisar auditorías
- ✅ Aprobar informes
- ✅ Supervisar acciones correctivas

## 🚨 Notas Importantes

- **Contraseñas temporales**: Las contraseñas `123456` son solo para demostración
- **En producción**: Implementar autenticación real con base de datos
- **Seguridad**: Agregar encriptación de contraseñas y tokens JWT
- **Sesiones**: Implementar expiración de sesiones y renovación de tokens

## 🔧 Personalización

Para agregar nuevos usuarios, modifica el archivo `src/contexts/AuthContext.tsx`:

```typescript
const mockUsers: User[] = [
  // ... usuarios existentes
  {
    id: 4,
    username: 'nuevo_usuario',
    name: 'Nuevo Usuario',
    email: 'nuevo@empresa.com',
    role: 'auditor',
    permissions: ['auditorias', 'listas'],
  },
];
```

## 📞 Soporte

Si tienes problemas para acceder:
1. Verificar que las credenciales sean correctas
2. Limpiar el localStorage del navegador
3. Recargar la página
4. Contactar al equipo de desarrollo

---

**⚠️ Recuerda: Estas credenciales son solo para desarrollo y demostración**

