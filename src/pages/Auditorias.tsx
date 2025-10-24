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
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useAuditoriaTipos } from '../contexts/AuditoriaTiposContext';
import { useAuditorias, Auditoria } from '../contexts/AuditoriasContext';



const Auditorias: React.FC = () => {
  const { getTiposActivos } = useAuditoriaTipos();
  const { auditorias, agregarAuditoria, editarAuditoria, eliminarAuditoria } = useAuditorias();

  const [openDialog, setOpenDialog] = useState(false);
  const [editingAuditoria, setEditingAuditoria] = useState<Auditoria | null>(null);
  const [formData, setFormData] = useState<Partial<Auditoria>>({
    estado: 'Pendiente' as 'Pendiente' | 'En Proceso' | 'Completada',
    facultadDependencia: '',
    planAuditoria: new Date().getFullYear(),
    procedimientos: '',
  });

  const handleOpenDialog = (auditoria?: Auditoria) => {
    if (auditoria) {
      setEditingAuditoria(auditoria);
      setFormData(auditoria);
    } else {
      setEditingAuditoria(null);
      setFormData({});
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingAuditoria(null);
    setFormData({});
  };

  const handleSave = () => {
    if (editingAuditoria) {
      editarAuditoria(editingAuditoria.id, formData);
    } else {
      agregarAuditoria(formData as Omit<Auditoria, 'id'>);
    }
    handleCloseDialog();
  };

  const handleDelete = (id: number) => {
    eliminarAuditoria(id);
  };

  const columns: GridColDef[] = [
    { field: 'nombre', headerName: 'Nombre', flex: 1, minWidth: 200, resizable: true },
    { 
      field: 'tipo', 
      headerName: 'Tipo', 
      width: 150,
      resizable: true,
      renderCell: (params) => {
        const tipo = getTiposActivos().find(t => t.nombre === params.value);
        return (
          <Box display="flex" alignItems="center" gap={1}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: tipo?.color || '#ccc',
              }}
            />
            <Typography variant="body2">{params.value}</Typography>
          </Box>
        );
      },
    },
    { field: 'planAuditoria', headerName: 'Plan de Auditoría', width: 150, resizable: true },
    { 
      field: 'fechaInicio', 
      headerName: 'Fecha Inicio', 
      width: 150,
      resizable: true,
      valueFormatter: (params) => params.value.toLocaleDateString('es-ES'),
    },
    { 
      field: 'fechaFin', 
      headerName: 'Fecha Fin', 
      width: 150,
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
        <Typography variant="h4">Gestión de Auditorías</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nueva Auditoría
        </Button>
      </Box>

      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={auditorias}
          columns={columns}
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          disableRowSelectionOnClick
          columnVisibilityModel={{
            // Asegurar que todas las columnas sean visibles
          }}
        />
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingAuditoria ? 'Editar Auditoría' : 'Nueva Auditoría'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nombre"
                value={formData.nombre || ''}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
                              <FormControl fullWidth>
                  <InputLabel>Tipo</InputLabel>
                  <Select
                    value={formData.tipo || ''}
                    label="Tipo"
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  >
                    {getTiposActivos().map((tipo) => (
                      <MenuItem key={tipo.id} value={tipo.nombre}>
                        {tipo.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Plan de Auditoría"
                type="number"
                value={formData.planAuditoria || ''}
                onChange={(e) => setFormData({ ...formData, planAuditoria: parseInt(e.target.value) || new Date().getFullYear() })}
                placeholder="Ej: 2025"
                inputProps={{ min: 2000, max: 2100 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Fecha Inicio"
                value={formData.fechaInicio || null}
                onChange={(date) => setFormData({ ...formData, fechaInicio: date || undefined })}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Fecha Fin"
                value={formData.fechaFin || null}
                onChange={(date) => setFormData({ ...formData, fechaFin: date || undefined })}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Auditor"
                value={formData.auditor || ''}
                onChange={(e) => setFormData({ ...formData, auditor: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={formData.estado || ''}
                  label="Estado"
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                >
                  <MenuItem value="Pendiente">Pendiente</MenuItem>
                  <MenuItem value="En Proceso">En Proceso</MenuItem>
                  <MenuItem value="Completada">Completada</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Facultad o Dependencia"
                value={formData.facultadDependencia || ''}
                onChange={(e) => setFormData({ ...formData, facultadDependencia: e.target.value })}
                placeholder="Ej: Facultad de Ingeniería, Departamento de Finanzas"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Objeto"
                multiline
                rows={3}
                value={formData.descripcion || ''}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Alcance"
                value={formData.alcance || ''}
                onChange={(e) => setFormData({ ...formData, alcance: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Procedimientos"
                multiline
                rows={3}
                value={formData.procedimientos || ''}
                onChange={(e) => setFormData({ ...formData, procedimientos: e.target.value })}
                placeholder="Describa los procedimientos de la auditoría"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained">
            {editingAuditoria ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Auditorias;
