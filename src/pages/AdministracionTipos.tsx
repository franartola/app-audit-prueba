import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Paper,
  Popover,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ColorLens as ColorLensIcon,
  Assessment as AssessmentIcon,
  Build as BuildIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useAuditoriaTipos, TipoAuditoria } from '../contexts/AuditoriaTiposContext';
import { useAuditorias } from '../contexts/AuditoriasContext';
import { useAccionesCorrectivas } from '../contexts/AccionesCorrectivasContext';
import { useListasVerificacion } from '../contexts/ListasVerificacionContext';
import { useReportes } from '../contexts/ReportesContext';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { ChromePicker, ColorResult } from 'react-color';

const AdministracionTipos: React.FC = () => {
  const { tipos, agregarTipo, editarTipo, eliminarTipo, toggleActivo, limpiarTodosLosTipos, debugEstado } = useAuditoriaTipos();
  const { auditorias, eliminarAuditoria, limpiarTodasLasAuditorias, debugEstado: debugAuditorias } = useAuditorias();
  const { accionesCorrectivas, eliminarAccionCorrectiva, limpiarTodasLasAcciones, debugEstado: debugAcciones } = useAccionesCorrectivas();
  const { listas, eliminarLista, limpiarTodasLasListas, debugEstado: debugListas } = useListasVerificacion();
  const { reportes, eliminarReporte, limpiarTodosLosReportes, debugEstado: debugReportes } = useReportes();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTipo, setEditingTipo] = useState<TipoAuditoria | null>(null);
  const [formData, setFormData] = useState<Partial<TipoAuditoria>>({
    nombre: '',
    descripcion: '',
    color: '#1976d2',
    activo: true,
  });
  
  // Estado para las pestañas
  const [currentTab, setCurrentTab] = useState(0);

  // Estado para selector de color
  const [colorAnchorEl, setColorAnchorEl] = useState<HTMLElement | null>(null);
  const isColorPickerOpen = Boolean(colorAnchorEl);

  const handleOpenColorPicker = (event: React.MouseEvent<HTMLElement>) => {
    setColorAnchorEl(event.currentTarget);
  };

  const handleCloseColorPicker = () => {
    setColorAnchorEl(null);
  };

  const handleColorChange = (color: ColorResult) => {
    setFormData({ ...formData, color: color.hex });
  };


  const handleOpenDialog = (tipo?: TipoAuditoria) => {
    if (tipo) {
      setEditingTipo(tipo);
      setFormData(tipo);
    } else {
      setEditingTipo(null);
      setFormData({
        nombre: '',
        descripcion: '',
        color: '#1976d2',
        activo: true,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTipo(null);
    setFormData({
      nombre: '',
      descripcion: '',
      color: '#1976d2',
      activo: true,
    });

  };

  const isValidHexColor = (color: string) => {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
  };

  const handleSave = () => {
    if (!formData.nombre?.trim()) {
      return;
    }

    if (formData.color && !isValidHexColor(formData.color)) {
      alert('Por favor ingresa un código hexadecimal válido (ej: #1976d2)');
      return;
    }

    if (editingTipo) {
      editarTipo(editingTipo.id, formData);
    } else {
      agregarTipo(formData as Omit<TipoAuditoria, 'id' | 'fechaCreacion'>);
    }
    handleCloseDialog();
  };

  const handleDelete = (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este tipo de auditoría?')) {
      eliminarTipo(id);
    }
  };

  const handleDeleteAuditoria = (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta auditoría? Esta acción no se puede deshacer.')) {
      eliminarAuditoria(id);
    }
  };

  const handleDeleteAccionCorrectiva = (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta acción correctiva? Esta acción no se puede deshacer.')) {
      eliminarAccionCorrectiva(id);
    }
  };

  const handleDeleteEjecucion = (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta ejecución? Esta acción no se puede deshacer.')) {
      eliminarLista(id);
    }
  };

  const handleDeleteReporte = (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este reporte? Esta acción no se puede deshacer.')) {
      eliminarReporte(id);
    }
  };



  // Columnas para el DataGrid de auditorías
  const auditoriaColumns: GridColDef[] = [
    { field: 'nombre', headerName: 'Nombre', flex: 1, minWidth: 200, resizable: true },
    { field: 'tipo', headerName: 'Tipo', width: 150, resizable: true },
    { field: 'planAuditoria', headerName: 'Plan', width: 100, resizable: true },
    { 
      field: 'fechaInicio', 
      headerName: 'Fecha Inicio', 
      width: 120,
      resizable: true,
      valueFormatter: (params) => params.value.toLocaleDateString('es-ES'),
    },
    { 
      field: 'fechaFin', 
      headerName: 'Fecha Fin', 
      width: 120,
      resizable: true,
      valueFormatter: (params) => params.value.toLocaleDateString('es-ES'),
    },
    { field: 'auditor', headerName: 'Auditor', width: 150, resizable: true },
    { field: 'facultadDependencia', headerName: 'Facultad/Dependencia', width: 180, resizable: true },
    { 
      field: 'estado', 
      headerName: 'Estado', 
      width: 120,
      resizable: true,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={
            params.value === 'Completada' ? 'success' :
            params.value === 'En Proceso' ? 'warning' : 'error'
          }
          size="small"
        />
      ),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Acciones',
      width: 100,
      resizable: true,
      getActions: (params) => [
        <IconButton
          key="delete"
          onClick={() => handleDeleteAuditoria(params.row.id)}
          color="error"
          size="small"
        >
          <DeleteIcon />
        </IconButton>,
      ],
    },
  ];

  // Columnas para el DataGrid de seguimiento de observaciones
  const accionCorrectivaColumns: GridColDef[] = [
    { field: 'titulo', headerName: 'Título', flex: 1, minWidth: 200, resizable: true },
    { field: 'responsable', headerName: 'Responsable', width: 150, resizable: true },
    { 
      field: 'fechaLimite', 
      headerName: 'Fecha Límite', 
      width: 120,
      resizable: true,
      valueFormatter: (params) => params.value.toLocaleDateString('es-ES'),
    },
    { 
      field: 'estado', 
      headerName: 'Estado', 
      width: 120,
      resizable: true,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={
            params.value === 'Regularizada' ? 'success' :
            params.value === 'Verificada' ? 'success' :
            params.value === 'En Proceso' ? 'warning' : 'error'
          }
          size="small"
        />
      ),
    },
    { 
      field: 'prioridad', 
      headerName: 'Prioridad', 
      width: 100,
      resizable: true,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={
            params.value === 'Alta' ? 'error' :
            params.value === 'Media' ? 'warning' : 'info'
          }
          size="small"
        />
      ),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Acciones',
      width: 100,
      resizable: true,
      getActions: (params) => [
        <IconButton
          key="delete"
          onClick={() => handleDeleteAccionCorrectiva(params.row.id)}
          color="error"
          size="small"
        >
          <DeleteIcon />
        </IconButton>,
      ],
    },
  ];

  // Columnas para el DataGrid de ejecuciones
  const ejecucionColumns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70, resizable: true },
    { field: 'nombre', headerName: 'Nombre', width: 200, resizable: true },
    { field: 'categoria', headerName: 'Categoría', width: 150, resizable: true },
    { field: 'auditoriaNombre', headerName: 'Auditoría Asociada', width: 200, resizable: true },
    { field: 'estado', headerName: 'Estado', width: 120, resizable: true },
    { field: 'fechaCreacion', headerName: 'Fecha Creación', width: 120, resizable: true, 
        valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString('es-ES') : '' },
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 100,
      resizable: true,
      sortable: false,
      renderCell: (params) => (
        <IconButton
          size="small"
          color="error"
          onClick={() => handleDeleteEjecucion(params.row.id)}
        >
          <DeleteIcon />
        </IconButton>
      ),
    },
  ];

  // Columnas para el DataGrid de informes
  const reporteColumns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70, resizable: true },
    { field: 'titulo', headerName: 'Título', width: 250, resizable: true },
    { field: 'auditoriaNombre', headerName: 'Auditoría', width: 200, resizable: true },
    { field: 'estado', headerName: 'Estado', width: 120, resizable: true },
    { field: 'auditor', headerName: 'Auditor', width: 150, resizable: true },
    { field: 'fechaCreacion', headerName: 'Fecha Creación', width: 120, resizable: true, 
        valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString('es-ES') : '' },
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 100,
      resizable: true,
      sortable: false,
      renderCell: (params) => (
        <IconButton
          size="small"
          color="error"
          onClick={() => handleDeleteReporte(params.row.id)}
        >
          <DeleteIcon />
        </IconButton>
      ),
    },
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Administración</Typography>
        {currentTab === 0 && (
          <Box display="flex" gap={2}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Nuevo Tipo
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={() => {
                if (window.confirm('¿Estás seguro de que quieres eliminar TODOS los tipos de auditoría? Esta acción no se puede deshacer.')) {
                  limpiarTodosLosTipos();
                }
              }}
            >
              Limpiar Todos
            </Button>
            <Button
              variant="outlined"
              color="info"
              onClick={debugEstado}
            >
              Debug Estado
            </Button>
          </Box>
        )}
      </Box>

      {/* Pestañas */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={currentTab} onChange={(e, newValue) => setCurrentTab(newValue)}>
          <Tab 
            icon={<ColorLensIcon />} 
            label="Tipos de Auditoría" 
            iconPosition="start"
          />
          <Tab 
            icon={<AssessmentIcon />} 
            label="Gestión de Auditorías" 
            iconPosition="start"
          />
          <Tab 
            icon={<BuildIcon />} 
            label="Seguimiento de Observaciones" 
            iconPosition="start"
          />
          <Tab 
            icon={<SettingsIcon />} 
            label="Gestión de Ejecuciones" 
            iconPosition="start"
          />
          <Tab 
            icon={<AssessmentIcon />} 
            label="Gestión de Informes" 
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {/* Contenido de las pestañas */}
      {currentTab === 0 && (
        <Grid container spacing={3}>
        {tipos.map((tipo) => (
          <Grid item xs={12} sm={6} md={4} key={tipo.id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        backgroundColor: tipo.color,
                        border: '2px solid #fff',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      }}
                    />
                    <Typography variant="h6">{tipo.nombre}</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={tipo.activo}
                          onChange={() => toggleActivo(tipo.id)}
                          size="small"
                        />
                      }
                      label=""
                    />
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(tipo)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(tipo.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>

                <Typography variant="body2" color="textSecondary" mb={2}>
                  {tipo.descripcion}
                </Typography>

                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Chip
                    label={tipo.activo ? 'Activo' : 'Inactivo'}
                    color={tipo.activo ? 'success' : 'default'}
                    size="small"
                  />
                  <Typography variant="caption" color="textSecondary">
                    Creado: {tipo.fechaCreacion.toLocaleDateString('es-ES')}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
        </Grid>
      )}

      {currentTab === 1 && (
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              Gestión de Auditorías - Eliminación
            </Typography>
            <Box display="flex" gap={2}>
              <Button
                variant="outlined"
                color="info"
                onClick={debugAuditorias}
              >
                Debug Estado
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={() => {
                  if (window.confirm('¿Estás seguro de que quieres eliminar TODAS las auditorías? Esta acción no se puede deshacer.')) {
                    limpiarTodasLasAuditorias();
                  }
                }}
              >
                Limpiar Todas
              </Button>
            </Box>
          </Box>
          <Typography variant="body2" color="textSecondary" mb={3}>
            Desde aquí puedes eliminar auditorías existentes. Ten en cuenta que esta acción no se puede deshacer.
          </Typography>
          <Paper sx={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={auditorias}
              columns={auditoriaColumns}
              pageSizeOptions={[10, 25, 50]}
              initialState={{
                pagination: { paginationModel: { pageSize: 10 } },
              }}
              disableRowSelectionOnClick
            />
          </Paper>
        </Box>
      )}

      {currentTab === 2 && (
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              Gestión de Seguimiento de Observaciones - Eliminación
            </Typography>
            <Box display="flex" gap={2}>
              <Button
                variant="outlined"
                color="info"
                onClick={debugAcciones}
              >
                Debug Estado
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={() => {
                  if (window.confirm('¿Estás seguro de que quieres eliminar TODOS los seguimientos de observaciones? Esta acción no se puede deshacer.')) {
                    limpiarTodasLasAcciones();
                  }
                }}
              >
                Limpiar Todas
              </Button>
            </Box>
          </Box>
          <Typography variant="body2" color="textSecondary" mb={3}>
            Desde aquí puedes eliminar seguimientos de observaciones existentes. Ten en cuenta que esta acción no se puede deshacer.
          </Typography>
          <Paper sx={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={accionesCorrectivas}
              columns={accionCorrectivaColumns}
              pageSizeOptions={[10, 25, 50]}
              initialState={{
                pagination: { paginationModel: { pageSize: 10 } },
              }}
              disableRowSelectionOnClick
            />
          </Paper>
        </Box>
      )}

      {currentTab === 3 && (
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              Gestión de Ejecuciones - Eliminación
            </Typography>
            <Box display="flex" gap={2}>
              <Button
                variant="outlined"
                color="info"
                onClick={debugListas}
              >
                Debug Estado
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={() => {
                  if (window.confirm('¿Estás seguro de que quieres eliminar TODAS las ejecuciones? Esta acción no se puede deshacer.')) {
                    limpiarTodasLasListas();
                  }
                }}
              >
                Limpiar Todas
              </Button>
            </Box>
          </Box>
          <Typography variant="body2" color="textSecondary" mb={3}>
            Desde aquí puedes eliminar ejecuciones de auditorías existentes. Ten en cuenta que esta acción no se puede deshacer.
          </Typography>
          <Paper sx={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={listas}
              columns={ejecucionColumns}
              pageSizeOptions={[10, 25, 50]}
              initialState={{
                pagination: { paginationModel: { pageSize: 10 } },
              }}
              disableRowSelectionOnClick
            />
          </Paper>
        </Box>
      )}

      {currentTab === 4 && (
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              Gestión de Informes - Eliminación
            </Typography>
            <Box display="flex" gap={2}>
              <Button
                variant="outlined"
                color="info"
                onClick={debugReportes}
              >
                Debug Estado
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={() => {
                  if (window.confirm('¿Estás seguro de que quieres eliminar TODOS los informes? Esta acción no se puede deshacer.')) {
                    limpiarTodosLosReportes();
                  }
                }}
              >
                Limpiar Todos
              </Button>
            </Box>
          </Box>
          <Typography variant="body2" color="textSecondary" mb={3}>
            Desde aquí puedes eliminar informes de auditorías existentes. Ten en cuenta que esta acción no se puede deshacer.
          </Typography>
          <Paper sx={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={reportes}
              columns={reporteColumns}
              pageSizeOptions={[10, 25, 50]}
              initialState={{
                pagination: { paginationModel: { pageSize: 10 } },
              }}
              disableRowSelectionOnClick
            />
          </Paper>
        </Box>
      )}

      {/* Dialog para crear/editar tipo */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingTipo ? 'Editar Tipo de Auditoría' : 'Nuevo Tipo de Auditoría'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nombre"
                value={formData.nombre || ''}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descripción"
                multiline
                rows={3}
                value={formData.descripcion || ''}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <Box display="flex" alignItems="center" gap={2}>
                <TextField
                  label="Color (código hexadecimal)"
                  value={formData.color || '#1976d2'}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="#1976d2"
                  sx={{ flexGrow: 1 }}
                />
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 1,
                    backgroundColor: formData.color || '#1976d2',
                    border: '2px solid #ddd',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    '&:hover': {
                      borderColor: 'primary.main',
                    },
                  }}
                  title="Previsualización del color"
                  onClick={handleOpenColorPicker}
                >
                  <ColorLensIcon sx={{ color: 'white', filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.5))' }} />
                </Box>
              </Box>
              <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                Ingresa un código hexadecimal válido (ej: #1976d2, #ff0000, #00ff00)
              </Typography>
              <Popover
                open={isColorPickerOpen}
                anchorEl={colorAnchorEl}
                onClose={handleCloseColorPicker}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
              >
                <Box sx={{ p: 2 }}>
                  <ChromePicker
                    color={formData.color || '#1976d2'}
                    onChange={handleColorChange}
                    onChangeComplete={handleColorChange}
                  />
                </Box>
              </Popover>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.activo || false}
                    onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                  />
                }
                label="Tipo activo"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button 
            onClick={handleSave} 
            variant="contained"
            disabled={!formData.nombre?.trim()}
          >
            {editingTipo ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdministracionTipos;
