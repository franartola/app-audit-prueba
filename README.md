# Sistema de Auditoría Interna

Una aplicación web moderna para la gestión integral de auditorías internas, desarrollada con React, TypeScript y Material-UI.

## 🚀 Características

### 📊 Dashboard Principal
- Métricas en tiempo real de auditorías
- Resumen de hallazgos por severidad
- Estado de acciones correctivas
- Auditorías recientes con estado visual

### 🔍 Gestión de Auditorías
- Crear, editar y eliminar auditorías
- Asignar auditores y fechas
- Seguimiento de estado (Pendiente, En Proceso, Completada)
- Categorización por tipo (Seguridad, RRHH, Finanzas, etc.)

### ✅ Ejecución de Auditorías
- Checklists personalizables por categoría
- Elementos de verificación con cumplimiento
- Observaciones y evidencia
- Porcentaje de cumplimiento automático

### 📋 Informes de Auditoría
- Generación de informes detallados
- Gestión de hallazgos con clasificación de severidad
- Estados de revisión y aprobación
- Exportación de informes

### 🛠️ Acciones Correctivas
- Seguimiento de acciones derivadas de hallazgos
- Control de progreso y fechas límite
- Priorización (Alta, Media, Baja)
- Asignación de responsables

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React 18 + TypeScript
- **UI Framework**: Material-UI (MUI) v5
- **Componentes de Datos**: MUI X Data Grid
- **Selector de Fechas**: MUI X Date Pickers
- **Enrutamiento**: React Router v6
- **Manejo de Fechas**: date-fns
- **Estilos**: Emotion (CSS-in-JS)

## 📦 Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd auditoria_app
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Ejecutar la aplicación**
   ```bash
   npm start
   ```

4. **Abrir en el navegador**
   ```
   http://localhost:3000
   ```

## 🏗️ Estructura del Proyecto

```
src/
├── components/
│   └── Layout.tsx              # Navegación principal y estructura
├── pages/
│   ├── Dashboard.tsx           # Página principal con métricas
│   ├── Auditorias.tsx          # Gestión de auditorías
│   ├── ListasVerificacion.tsx  # Ejecución de auditorías
│   ├── Reportes.tsx            # Informes y hallazgos
│   └── AccionesCorrectivas.tsx # Seguimiento de acciones
├── App.tsx                     # Componente principal y enrutamiento
└── index.tsx                   # Punto de entrada
```

## 🎯 Funcionalidades Principales

### Gestión de Auditorías
- **CRUD completo** de auditorías
- **Estados de auditoría** con flujo de trabajo
- **Asignación de auditores** y fechas
- **Categorización** por tipo de auditoría

### Ejecución de Auditorías
- **Checklists personalizables** por categoría
- **Elementos de verificación** con cumplimiento
- **Observaciones y evidencia** para cada elemento
- **Cálculo automático** de porcentaje de cumplimiento

### Informes y Hallazgos
- **Generación de informes** estructurados
- **Clasificación de hallazgos** por severidad
- **Estados de revisión** (Borrador, En Revisión, Aprobado, Finalizado)
- **Gestión de recomendaciones** y responsables

### Acciones Correctivas
- **Seguimiento de acciones** derivadas de hallazgos
- **Control de progreso** con barras visuales
- **Priorización** y fechas límite
- **Asignación de recursos** y comentarios

## 🎨 Interfaz de Usuario

- **Diseño responsive** que se adapta a diferentes dispositivos
- **Tema personalizado** con colores corporativos
- **Navegación lateral** con menú desplegable
- **Componentes Material-UI** para consistencia visual
- **Iconografía intuitiva** para mejor usabilidad

## 📱 Responsive Design

- **Desktop**: Navegación lateral fija con contenido principal
- **Tablet**: Navegación adaptativa con menú hamburguesa
- **Mobile**: Navegación optimizada para pantallas pequeñas

## 🔧 Personalización

### Temas
La aplicación utiliza Material-UI theming para personalización:
- Colores primarios y secundarios
- Tipografía personalizada
- Espaciado y componentes consistentes

### Componentes
- **DataGrid**: Tablas de datos con paginación y filtros
- **DatePicker**: Selector de fechas con localización en español
- **Dialogs**: Formularios modales para CRUD operations
- **Chips**: Indicadores visuales de estado y prioridad

## 🚀 Despliegue

### Build de Producción
```bash
npm run build
```

### Servidor de Producción
```bash
npm install -g serve
serve -s build
```

## 📋 Próximas Funcionalidades

- [ ] **Autenticación y autorización** de usuarios
- [ ] **Base de datos** persistente (PostgreSQL/MongoDB)
- [ ] **API REST** para integración con otros sistemas
- [ ] **Notificaciones** por email y push
- [ ] **Dashboard avanzado** con gráficos y métricas
- [ ] **Exportación** a PDF y Excel
- [ **Auditoría de cambios** y logs de actividad
- [ ] **Integración** con sistemas de tickets
- [ ] **Módulo de capacitación** para auditores

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

Para soporte técnico o preguntas sobre la implementación:
- Crear un issue en el repositorio
- Contactar al equipo de desarrollo

## 🎉 Agradecimientos

- Material-UI por el excelente framework de componentes
- React Team por la biblioteca de interfaz de usuario
- Comunidad de TypeScript por el tipado estático
- Equipo de date-fns por el manejo de fechas

---

**Desarrollado con ❤️ para mejorar los procesos de auditoría interna**

