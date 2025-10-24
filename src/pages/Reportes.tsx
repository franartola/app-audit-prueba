import React, { useState, useEffect } from 'react';
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
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { useReportes, ReporteAuditoria, HallazgoReporte } from '../contexts/ReportesContext';
import { useListasVerificacion } from '../contexts/ListasVerificacionContext';
import jsPDF from 'jspdf';



const Reportes: React.FC = () => {
  const { 
    reportes, 
    agregarReporte, 
    editarReporte, 
    eliminarReporte,
    agregarHallazgo,
    editarHallazgo,
    eliminarHallazgo
  } = useReportes();
  const { listas } = useListasVerificacion();
    

  const [openDialog, setOpenDialog] = useState(false);
  const [openHallazgoDialog, setOpenHallazgoDialog] = useState(false);
  const [editingReporte, setEditingReporte] = useState<ReporteAuditoria | null>(null);
  const [editingHallazgo, setEditingHallazgo] = useState<HallazgoReporte | null>(null);
  const [formData, setFormData] = useState<Partial<ReporteAuditoria>>({
    estado: 'Borrador' as 'Borrador' | 'En Revisión' | 'Aprobado' | 'Finalizado',
  });
  const [hallazgoFormData, setHallazgoFormData] = useState<Partial<HallazgoReporte>>({
    severidad: 'Mayor' as 'Crítico' | 'Mayor' | 'Menor',
  });
  const [selectedReporteId, setSelectedReporteId] = useState<number | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'info' | 'warning' | 'error'>('info');

  const showSnackbar = (message: string, severity: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };
  const handleCloseSnackbar = () => setSnackbarOpen(false);
  
  // Monitorear cambios en el estado del formulario de hallazgos
  useEffect(() => {
    console.log('Estado del formulario de hallazgos actualizado:', {
      openHallazgoDialog,
      selectedReporteId,
      editingHallazgo,
      hallazgoFormData
    });
  }, [openHallazgoDialog, selectedReporteId, editingHallazgo, hallazgoFormData]);
  
  // Usar ejecuciones de auditorías del contexto
  const auditoriasDisponibles = listas.map(ejecucion => ({
    id: ejecucion.id,
    nombre: ejecucion.auditoriaNombre || ejecucion.nombre,
    tipo: ejecucion.categoria,
    planAuditoria: new Date().getFullYear(), // Usar año actual como plan
    observaciones: ejecucion.observaciones,
    recomendaciones: ejecucion.recomendaciones,
  }));

  const handleOpenDialog = (reporte?: ReporteAuditoria) => {
    if (reporte) {
      setEditingReporte(reporte);
      setFormData(reporte);
    } else {
      setEditingReporte(null);
      setFormData({});
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingReporte(null);
    setFormData({});
  };

  const handleOpenHallazgoDialog = (hallazgo?: HallazgoReporte, reporteId?: number) => {
    console.log('=== handleOpenHallazgoDialog llamado ===');
    console.log('reporteId recibido:', reporteId);
    console.log('hallazgo recibido:', hallazgo);
    console.log('Estado actual - openHallazgoDialog:', openHallazgoDialog);
    console.log('Estado actual - selectedReporteId:', selectedReporteId);
    
    if (hallazgo) {
      console.log('Editando hallazgo existente');
      setEditingHallazgo(hallazgo);
      setHallazgoFormData(hallazgo);
    } else {
      console.log('Creando nuevo hallazgo');
      setEditingHallazgo(null);
      const initialData = { severidad: 'Mayor' as 'Crítico' | 'Mayor' | 'Menor' };
      console.log('Datos iniciales del formulario:', initialData);
      setHallazgoFormData(initialData);
    }
    
    console.log('Estableciendo selectedReporteId:', reporteId);
    setSelectedReporteId(reporteId || null);
    console.log('Abriendo diálogo...');
    setOpenHallazgoDialog(true);
    
    console.log('=== Fin handleOpenHallazgoDialog ===');
  };

  const handleCloseHallazgoDialog = () => {
    setOpenHallazgoDialog(false);
    setEditingHallazgo(null);
    setHallazgoFormData({ severidad: 'Mayor' as 'Crítico' | 'Mayor' | 'Menor' });
    setSelectedReporteId(null);
  };

  const handleSave = () => {
    if (editingReporte) {
      editarReporte(editingReporte.id, formData);
    } else {
      agregarReporte(formData as Omit<ReporteAuditoria, 'id' | 'fechaCreacion'>);
    }
    handleCloseDialog();
  };

  const generatePDF = (reporte: ReporteAuditoria) => {
    const doc = new jsPDF();
    
    // Configurar fuente y tamaño
    doc.setFont('helvetica');
    doc.setFontSize(16);
    
    // Título del informe
    doc.text('INFORME DE AUDITORÍA', 105, 20, { align: 'center' });
    
    // Información básica
    doc.setFontSize(12);
    doc.text(`Título: ${reporte.titulo || 'Sin título'}`, 20, 40);
    doc.text(`Auditoría Asociada: ${reporte.auditoriaNombre || 'Sin asociar'}`, 20, 50);
    doc.text(`Fecha de Creación: ${reporte.fechaCreacion.toLocaleDateString('es-ES')}`, 20, 60);
    doc.text(`Estado: ${reporte.estado}`, 20, 70);
    
    if (reporte.fechaRevision) {
      doc.text(`Fecha de Revisión: ${reporte.fechaRevision.toLocaleDateString('es-ES')}`, 20, 80);
    }
    
    // Resumen
    if (reporte.resumen) {
      doc.setFontSize(14);
      doc.text('RESUMEN', 20, 100);
      doc.setFontSize(10);
      const resumenLines = doc.splitTextToSize(reporte.resumen, 170);
      doc.text(resumenLines, 20, 110);
    }
    
    // Alcance
    if (reporte.alcance) {
      doc.setFontSize(14);
      doc.text('ALCANCE', 20, 140);
      doc.setFontSize(10);
      const alcanceLines = doc.splitTextToSize(reporte.alcance, 170);
      doc.text(alcanceLines, 20, 150);
    }
    
    // Metodología
    if (reporte.metodologia) {
      doc.setFontSize(14);
      doc.text('METODOLOGÍA', 20, 180);
      doc.setFontSize(10);
      const metodologiaLines = doc.splitTextToSize(reporte.metodologia, 170);
      doc.text(metodologiaLines, 20, 190);
    }
    
    // Conclusiones
    if (reporte.conclusiones) {
      doc.setFontSize(14);
      doc.text('CONCLUSIONES', 20, 220);
      doc.setFontSize(10);
      const conclusionesLines = doc.splitTextToSize(reporte.conclusiones, 170);
      doc.text(conclusionesLines, 20, 230);
    }
    
    // Observaciones
    if (reporte.observaciones) {
      doc.setFontSize(14);
      doc.text('OBSERVACIONES', 20, 260);
      doc.setFontSize(10);
      const observacionesLines = doc.splitTextToSize(reporte.observaciones, 170);
      doc.text(observacionesLines, 20, 270);
    }
    
    // Recomendaciones
    if (reporte.recomendaciones) {
      doc.setFontSize(14);
      doc.text('RECOMENDACIONES', 20, 300);
      doc.setFontSize(10);
      const recomendacionesLines = doc.splitTextToSize(reporte.recomendaciones, 170);
      doc.text(recomendacionesLines, 20, 310);
    }
    
    // Hallazgos
    if (reporte.hallazgos && reporte.hallazgos.length > 0) {
      doc.setFontSize(14);
      doc.text('HALLAZGOS', 20, 340);
      doc.setFontSize(10);
      
      let yPosition = 350;
      reporte.hallazgos.forEach((hallazgo, index) => {
        const hallazgoText = `Hallazgo #${hallazgo.numero}: ${hallazgo.descripcion}`;
        const recomendacionText = `Recomendación: ${hallazgo.recomendacion}`;
        const severidadText = `Severidad: ${hallazgo.severidad}`;
        
        const lines = doc.splitTextToSize(`${hallazgoText}\n${recomendacionText}\n${severidadText}`, 170);
        doc.text(lines, 20, yPosition);
        yPosition += lines.length * 5 + 10;
        
        // Si se sale de la página, agregar nueva página
        if (yPosition > 280) {
          doc.addPage();
          yPosition = 20;
        }
      });
    }
    
    // Guardar el PDF
    const fileName = `Informe_${reporte.titulo?.replace(/[^a-zA-Z0-9]/g, '_') || 'Auditoria'}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  const handleSaveHallazgo = () => {
    console.log('=== handleSaveHallazgo llamado ===');
    console.log('selectedReporteId:', selectedReporteId);
    console.log('editingHallazgo:', editingHallazgo);
    console.log('hallazgoFormData:', hallazgoFormData);
    console.log('openHallazgoDialog:', openHallazgoDialog);
    console.log('================================');
    
    if (!selectedReporteId) {
      console.log('Error: selectedReporteId es null');
      showSnackbar('No se ha seleccionado un informe', 'error');
      return;
    }

    // Validar campos requeridos
    if (!hallazgoFormData.descripcion || hallazgoFormData.descripcion.trim() === '') {
      console.log('Error: Descripción es requerida');
      showSnackbar('La descripción es requerida', 'error');
      return;
    }

    if (!hallazgoFormData.severidad) {
      console.log('Error: Severidad es requerida');
      showSnackbar('La severidad es requerida', 'error');
      return;
    }

    if (!hallazgoFormData.recomendacion || hallazgoFormData.recomendacion.trim() === '') {
      console.log('Error: Recomendación es requerida');
      showSnackbar('La recomendación es requerida', 'error');
      return;
    }

    if (editingHallazgo) {
      console.log('Editando hallazgo existente');
      editarHallazgo(selectedReporteId, editingHallazgo.id, hallazgoFormData);
    } else {
      console.log('Agregando nuevo hallazgo');
      agregarHallazgo(selectedReporteId, hallazgoFormData as Omit<HallazgoReporte, 'id' | 'numero'>);
    }

    handleCloseHallazgoDialog();
  };

  const handleDelete = (id: number) => {
    eliminarReporte(id);
  };

  const handleDeleteHallazgo = (reporteId: number, hallazgoId: number) => {
    eliminarHallazgo(reporteId, hallazgoId);
  };

  const getSeveridadColor = (severidad: string) => {
    switch (severidad) {
      case 'Crítico':
        return 'error';
      case 'Mayor':
        return 'warning';
      case 'Menor':
        return 'info';
      default:
        return 'default';
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Finalizado':
        return 'success';
      case 'Aprobado':
        return 'success';
      case 'En Revisión':
        return 'warning';
      case 'Borrador':
        return 'default';
      default:
        return 'default';
    }
  };

  const columns: GridColDef[] = [
    { field: 'titulo', headerName: 'Título', flex: 1, minWidth: 250 },
    { field: 'auditoriaNombre', headerName: 'Auditoría', width: 200 },
    { 
      field: 'fechaCreacion', 
      headerName: 'Fecha Creación', 
      width: 150,
      valueFormatter: (params) => params.value.toLocaleDateString('es-ES'),
    },
    { field: 'auditor', headerName: 'Auditor', width: 150 },
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
      field: 'actions',
      type: 'actions',
      headerName: 'Acciones',
      width: 160,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Editar"
          onClick={() => handleOpenDialog(params.row)}
        />,
        <GridActionsCellItem
          icon={<DownloadIcon />}
          label="Descargar PDF"
          onClick={() => generatePDF(params.row)}
        />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Eliminar"
          onClick={() => handleDelete(params.row.id)}
        />,
      ],
    },
  ];

  console.log('Renderizando componente Reportes');
  console.log('Estado actual:', { openHallazgoDialog, selectedReporteId, editingHallazgo });
  
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">Informes de Auditoría</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Nuevo Informe
          </Button>
        </Box>

      <Paper sx={{ height: 600, width: '100%', mb: 3 }}>
        <DataGrid
          rows={reportes}
          columns={columns}
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          disableRowSelectionOnClick
        />
      </Paper>

      {/* Vista detallada de informes */}
      <Grid container spacing={3}>
        {reportes.map((reporte) => (
          <Grid item xs={12} key={reporte.id}>
            <Paper sx={{ p: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Box>
                  <Typography variant="h6">{reporte.titulo}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {reporte.auditoriaNombre} • {reporte.fechaCreacion.toLocaleDateString('es-ES')}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <Chip
                    label={reporte.estado}
                    color={getEstadoColor(reporte.estado) as any}
                  />
                  <Button
                    size="small"
                    startIcon={<DownloadIcon />}
                    variant="outlined"
                  >
                    Exportar
                  </Button>
                  <IconButton onClick={() => handleOpenHallazgoDialog(undefined, reporte.id)}>
                    <AddIcon />
                  </IconButton>
                </Box>
              </Box>

              <Grid container spacing={2} mb={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>Resumen</Typography>
                  <Typography variant="body2">{reporte.resumen}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>Conclusiones</Typography>
                  <Typography variant="body2">{reporte.conclusiones}</Typography>
                </Grid>
              </Grid>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Hallazgos ({reporte.hallazgos?.length || 0})</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <List>
                    {reporte.hallazgos?.map((hallazgo) => (
                      <ListItem key={hallazgo.id} divider>
                        <ListItemIcon>
                          {hallazgo.severidad === 'Crítico' ? <ErrorIcon color="error" /> :
                           hallazgo.severidad === 'Mayor' ? <WarningIcon color="warning" /> :
                           <InfoIcon color="info" />}
                        </ListItemIcon>
                        <ListItemText
                          primary={hallazgo.descripcion}
                          secondary={`Hallazgo #${hallazgo.numero} • Fecha límite: ${hallazgo.fechaLimite ? hallazgo.fechaLimite.toLocaleDateString('es-ES') : 'No definida'}`}
                        />
                        <Box display="flex" gap={1} alignItems="center">
                          <Chip
                            label={hallazgo.severidad}
                            color={getSeveridadColor(hallazgo.severidad) as any}
                            size="small"
                          />

                          <IconButton
                            size="small"
                            onClick={() => handleOpenHallazgoDialog(hallazgo, reporte.id)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteHallazgo(reporte.id, hallazgo.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Dialog para Reporte */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingReporte ? 'Editar Informe' : 'Nuevo Informe'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Auditoría Asociada</InputLabel>
                <Select
                  value={formData.auditoriaId || ''}
                  label="Auditoría Asociada"
                  onChange={(e) => {
                    const auditoriaId = e.target.value as number;
                    const auditoria = auditoriasDisponibles.find(a => a.id === auditoriaId);
                    
                    // Buscar la ejecución correspondiente para obtener los hallazgos
                    const ejecucionSeleccionada = listas.find(lista => lista.id === auditoriaId);
                    
                    // Generar texto de hallazgos para observaciones
                    let textoHallazgos = '';
                    let textoRecomendaciones = '';
                    
                    if (ejecucionSeleccionada && ejecucionSeleccionada.hallazgos && ejecucionSeleccionada.hallazgos.length > 0) {
                      // Separar hallazgos y recomendaciones
                      const hallazgosTexto = ejecucionSeleccionada.hallazgos.map(hallazgo => 
                        `HALLAZGO #${hallazgo.numero}:\nDescripción: ${hallazgo.descripcion}\nImpacto: ${hallazgo.severidad}\n\n`
                      ).join('');
                      
                      const recomendacionesTexto = ejecucionSeleccionada.hallazgos.map(hallazgo => 
                        `RECOMENDACIÓN #${hallazgo.numero}:\n${hallazgo.recomendacion}\n\n`
                      ).join('');
                      
                      textoHallazgos = hallazgosTexto;
                      textoRecomendaciones = recomendacionesTexto;
                    } else {
                      textoHallazgos = 'No se encontraron hallazgos en esta ejecución de auditoría.';
                      textoRecomendaciones = 'No se encontraron recomendaciones en esta ejecución de auditoría.';
                    }
                    
                    setFormData({ 
                      ...formData, 
                      auditoriaId: auditoriaId || 0,
                      auditoriaNombre: auditoria?.nombre || '',
                      titulo: auditoria ? `Informe - ${auditoria.nombre}` : '',
                      observaciones: textoHallazgos,
                      recomendaciones: textoRecomendaciones
                    });
                  }}
                >
                  <MenuItem value="">
                    <em>Sin asociar</em>
                  </MenuItem>
                  {auditoriasDisponibles.map((auditoria) => (
                    <MenuItem key={auditoria.id} value={auditoria.id}>
                      {auditoria.nombre} ({auditoria.planAuditoria})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <DatePicker
                label="Fecha de Revisión"
                value={formData.fechaRevision || null}
                onChange={(date) => setFormData({ ...formData, fechaRevision: date || undefined })}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={formData.estado || ''}
                  label="Estado"
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value as 'Borrador' | 'En Revisión' | 'Aprobado' | 'Finalizado' })}
                >
                  <MenuItem value="Borrador">Borrador</MenuItem>
                  <MenuItem value="En Revisión">En Revisión</MenuItem>
                  <MenuItem value="Aprobado">Aprobado</MenuItem>
                  <MenuItem value="Finalizado">Finalizado</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Resumen"
                multiline
                rows={3}
                value={formData.resumen || ''}
                onChange={(e) => setFormData({ ...formData, resumen: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Alcance"
                multiline
                rows={2}
                value={formData.alcance || ''}
                onChange={(e) => setFormData({ ...formData, alcance: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Metodología"
                multiline
                rows={2}
                value={formData.metodologia || ''}
                onChange={(e) => setFormData({ ...formData, metodologia: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Conclusiones"
                multiline
                rows={3}
                value={formData.conclusiones || ''}
                onChange={(e) => setFormData({ ...formData, conclusiones: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Observaciones"
                multiline
                rows={3}
                value={formData.observaciones || ''}
                onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Recomendaciones"
                multiline
                rows={3}
                value={formData.recomendaciones || ''}
                onChange={(e) => setFormData({ ...formData, recomendaciones: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained">
            {editingReporte ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para Hallazgo */}
      <Dialog 
        open={openHallazgoDialog} 
        onClose={handleCloseHallazgoDialog} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          {editingHallazgo ? 'Editar Hallazgo' : 'Nuevo Hallazgo'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descripción"
                multiline
                rows={3}
                value={hallazgoFormData.descripcion || ''}
                onChange={(e) => setHallazgoFormData({ ...hallazgoFormData, descripcion: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Severidad</InputLabel>
                <Select
                  value={hallazgoFormData.severidad || ''}
                  label="Severidad"
                  onChange={(e) => setHallazgoFormData({ ...hallazgoFormData, severidad: e.target.value as 'Crítico' | 'Mayor' | 'Menor' })}
                >
                  <MenuItem value="Crítico">Crítico</MenuItem>
                  <MenuItem value="Mayor">Mayor</MenuItem>
                  <MenuItem value="Menor">Menor</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <DatePicker
                label="Fecha Límite"
                value={hallazgoFormData.fechaLimite || null}
                onChange={(date) => setHallazgoFormData({ ...hallazgoFormData, fechaLimite: date || undefined })}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Recomendación"
                multiline
                rows={3}
                value={hallazgoFormData.recomendacion || ''}
                onChange={(e) => setHallazgoFormData({ ...hallazgoFormData, recomendacion: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseHallazgoDialog}>Cancelar</Button>
          <Button 
            onClick={() => {
              console.log('Botón CREAR/Actualizar clickeado');
              handleSaveHallazgo();
            }} 
            variant="contained"
            color="primary"
          >
            {editingHallazgo ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <MuiAlert onClose={handleCloseSnackbar} severity={snackbarSeverity} elevation={6} variant="filled">
          {snackbarMessage}
        </MuiAlert>
      </Snackbar>
      </Box>
    </LocalizationProvider>
  );
};

export default Reportes;
