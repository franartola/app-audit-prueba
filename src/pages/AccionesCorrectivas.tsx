import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useAccionesCorrectivas, AccionCorrectiva } from '../contexts/AccionesCorrectivasContext';
import { useListasVerificacion } from '../contexts/ListasVerificacionContext';



const AccionesCorrectivas: React.FC = () => {
  const { accionesCorrectivas, agregarAccionCorrectiva, editarAccionCorrectiva, eliminarAccionCorrectiva } = useAccionesCorrectivas();
  const { listas } = useListasVerificacion();

  // Obtener todos los hallazgos de las ejecuciones de auditorías
  const hallazgosDisponibles = listas.flatMap(ejecucion => 
    ejecucion.hallazgos?.map(hallazgo => ({
      id: `${ejecucion.id}-${hallazgo.id}`,
      numero: hallazgo.numero,
      descripcion: hallazgo.descripcion,
      recomendacion: hallazgo.recomendacion,
      severidad: hallazgo.severidad,
      ejecucionNombre: ejecucion.nombre,
      ejecucionId: ejecucion.id
    })) || []
  );

  const [openDialog, setOpenDialog] = useState(false);
  const [editingAccion, setEditingAccion] = useState<AccionCorrectiva | null>(null);
  const [formData, setFormData] = useState<Partial<AccionCorrectiva>>({
    prioridad: 'Media' as 'Alta' | 'Media' | 'Baja',
  });

  const handleOpenDialog = (accion?: AccionCorrectiva) => {
    if (accion) {
      setEditingAccion(accion);
      setFormData(accion);
    } else {
      setEditingAccion(null);
      setFormData({});
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingAccion(null);
      setFormData({});
  };

  const handleSave = () => {
    if (editingAccion) {
      editarAccionCorrectiva(editingAccion.id, formData);
    } else {
      agregarAccionCorrectiva(formData as Omit<AccionCorrectiva, 'id' | 'fechaCreacion'>);
    }
    handleCloseDialog();
  };

  const handleDelete = (id: number) => {
    eliminarAccionCorrectiva(id);
  };



  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Regularizada':
      case 'Verificada':
        return 'success';
      case 'En Proceso':
        return 'warning';
      case 'Pendiente':
        return 'error';
      default:
        return 'default';
    }
  };



  const getDiasRestantes = (fechaLimite: Date) => {
    const hoy = new Date();
    const diffTime = fechaLimite.getTime() - hoy.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const columns: GridColDef[] = [
    { 
      field: 'hallazgoDescripcion', 
      headerName: 'Hallazgo Relacionado', 
      flex: 1, 
      minWidth: 300 
    },
    { 
      field: 'fechaLimite', 
      headerName: 'Fecha de Regularización', 
      width: 180,
      valueFormatter: (params) => params.value.toLocaleDateString('es-ES'),
    },
    { 
      field: 'estado', 
      headerName: 'Estado', 
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={getEstadoColor(params.value) as any}
          size="small"
        />
      ),
    },
    {
      field: 'progreso',
      headerName: 'Progreso',
      width: 150,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <Box sx={{ width: '100%', mr: 1 }}>
            <LinearProgress 
              variant="determinate" 
              value={params.value} 
              sx={{ height: 8, borderRadius: 5 }}
            />
          </Box>
          <Box sx={{ minWidth: 35 }}>
            <Typography variant="body2" color="text.secondary">
              {`${Math.round(params.value)}%`}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Acciones',
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Editar"
          onClick={() => handleOpenDialog(params.row)}
        />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Eliminar"
          onClick={() => handleDelete(params.row.id)}
        />,
      ],
    },
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Seguimiento de Observaciones</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nueva Acción
        </Button>
      </Box>

      {/* Resumen de métricas */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Acciones
              </Typography>
                              <Typography variant="h4">{accionesCorrectivas.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Regularizadas
              </Typography>
              <Typography variant="h4" color="success.main">
                {accionesCorrectivas.filter(a => a.estado === 'Regularizada').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                En Proceso
              </Typography>
              <Typography variant="h4" color="warning.main">
                {accionesCorrectivas.filter(a => a.estado === 'En Proceso').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Pendientes
              </Typography>
              <Typography variant="h4" color="error.main">
                {accionesCorrectivas.filter(a => a.estado === 'Pendiente').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ height: 600, width: '100%', mb: 3 }}>
        <DataGrid
          rows={accionesCorrectivas}
          columns={columns}
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          disableRowSelectionOnClick
        />
      </Paper>

      {/* Vista detallada de acciones */}
      <Grid container spacing={3}>
        {accionesCorrectivas.map((accion) => (
          <Grid item xs={12} key={accion.id}>
            <Paper sx={{ p: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Box>
                  <Typography variant="h6">Seguimiento de Observación #{accion.id}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Fecha de Regularización: {accion.fechaLimite.toLocaleDateString('es-ES')}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <Chip
                    label={accion.estado}
                    color={getEstadoColor(accion.estado) as any}
                  />
                  <IconButton onClick={() => handleOpenDialog(accion)}>
                    <EditIcon />
                  </IconButton>
                </Box>
              </Box>

              <Grid container spacing={2} mb={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>Hallazgo Relacionado</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {accion.hallazgoDescripcion}
                  </Typography>
                </Grid>
              </Grid>

              <Box mb={2}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="subtitle2">Progreso</Typography>
                  <Typography variant="body2">
                    {accion.progreso}% • {getDiasRestantes(accion.fechaLimite)} días restantes
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={accion.progreso} 
                  sx={{ height: 10, borderRadius: 5 }}
                />
              </Box>

              {accion.comentarios && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Acciones realizadas</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {accion.comentarios}
                  </Typography>
                </Box>
              )}

              {accion.fechaCompletado && (
                <Box mt={2}>
                  <Typography variant="subtitle2" color="success.main">
                    ✓ Regularizada el {accion.fechaCompletado.toLocaleDateString('es-ES')}
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Dialog para Acción Correctiva */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingAccion ? 'Editar Seguimiento de Observación' : 'Nueva Acción'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Hallazgo Relacionado</InputLabel>
                <Select
                  value={formData.hallazgoRelacionado || ''}
                  label="Hallazgo Relacionado"
                  onChange={(e) => {
                    const hallazgoId = e.target.value as string;
                    const hallazgoSeleccionado = hallazgosDisponibles.find(h => h.id === hallazgoId);
                    setFormData({ 
                      ...formData, 
                      hallazgoRelacionado: hallazgoId,
                      hallazgoDescripcion: hallazgoSeleccionado?.descripcion || '',
                      auditoriaId: hallazgoSeleccionado?.ejecucionId || 0,
                      auditoriaNombre: hallazgoSeleccionado?.ejecucionNombre || ''
                    });
                  }}
                >
                  <MenuItem value="">
                    <em>Seleccionar hallazgo</em>
                  </MenuItem>
                  {hallazgosDisponibles.map((hallazgo) => (
                    <MenuItem key={hallazgo.id} value={hallazgo.id}>
                      Hallazgo #{hallazgo.numero}: {hallazgo.descripcion} ({hallazgo.ejecucionNombre})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Acciones realizadas"
                multiline
                rows={4}
                value={formData.comentarios || ''}
                onChange={(e) => setFormData({ ...formData, comentarios: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <DatePicker
                label="Fecha de Modificación"
                value={formData.fechaLimite || null}
                onChange={(date) => setFormData({ ...formData, fechaLimite: date || undefined })}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            {editingAccion && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Progreso (%)"
                  type="number"
                  value={formData.progreso || 0}
                  onChange={(e) => {
                    const progreso = parseInt(e.target.value) || 0;
                    setFormData({ ...formData, progreso: Math.min(100, Math.max(0, progreso)) });
                  }}
                  inputProps={{ min: 0, max: 100 }}
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained">
            {editingAccion ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AccionesCorrectivas;
