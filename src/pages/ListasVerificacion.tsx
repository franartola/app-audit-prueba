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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  IconButton,
} from '@mui/material';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { Tooltip } from '@mui/material';
import { useListasVerificacion, ListaVerificacion, ElementoVerificacion, Hallazgo } from '../contexts/ListasVerificacionContext';
import { useAuditorias } from '../contexts/AuditoriasContext';
import { useAuditoriaTipos } from '../contexts/AuditoriaTiposContext';



const ListasVerificacion: React.FC = () => {
    const {
    listas,
    agregarLista,
    editarLista,
    eliminarLista,
    agregarElemento,
    editarElemento,
    eliminarElemento,
    agregarHallazgo,
    editarHallazgo,
    eliminarHallazgo,
    toggleCumplimiento,
    restaurarDatosIniciales,
    limpiarRegistroEliminados,
    debugEstado
  } = useListasVerificacion();
  const { auditorias } = useAuditorias();
  const { getTiposActivos } = useAuditoriaTipos();

  const [openDialog, setOpenDialog] = useState(false);
  const [openElementoDialog, setOpenElementoDialog] = useState(false);
  const [openHallazgoDialog, setOpenHallazgoDialog] = useState(false);
  const [editingLista, setEditingLista] = useState<ListaVerificacion | null>(null);
  const [editingElemento, setEditingElemento] = useState<ElementoVerificacion | null>(null);
  const [editingHallazgo, setEditingHallazgo] = useState<Hallazgo | null>(null);
  const [formData, setFormData] = useState<Partial<ListaVerificacion>>({
    auditoriaId: null,
    auditoriaNombre: null,
    hallazgos: [],
  });
  const [elementoFormData, setElementoFormData] = useState<Partial<ElementoVerificacion>>({});
  const [hallazgoFormData, setHallazgoFormData] = useState<Partial<Hallazgo>>({
    severidad: 'Bajo',
  });
  const [selectedListaId, setSelectedListaId] = useState<number | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'info' | 'warning' | 'error'>('info');

  const showSnackbar = (message: string, severity: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };
  const handleCloseSnackbar = () => setSnackbarOpen(false);
  
  // Monitorear cambios en selectedListaId
  useEffect(() => {
    console.log('selectedListaId cambió a:', selectedListaId);
  }, [selectedListaId]);
  
  // Usar auditorías del contexto en lugar de datos estáticos
  const auditoriasDisponibles = auditorias.map(auditoria => ({
    id: auditoria.id,
    nombre: auditoria.nombre,
    tipo: auditoria.tipo,
    planAuditoria: auditoria.planAuditoria,
  }));

  const handleOpenDialog = (lista?: ListaVerificacion) => {
    if (lista) {
      setEditingLista(lista);
      setFormData({
        ...lista,
        // Asegurar que los arrays se copien correctamente
        elementos: [...lista.elementos],
        hallazgos: [...lista.hallazgos],
      });
    } else {
      setEditingLista(null);
      setFormData({
        auditoriaId: null,
        auditoriaNombre: null,
        hallazgos: [],
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingLista(null);
    setFormData({
      auditoriaId: null,
      auditoriaNombre: null,
      hallazgos: [],
    });
  };

  const handleOpenElementoDialog = (elemento?: ElementoVerificacion, listaId?: number) => {
    if (elemento) {
      setEditingElemento(elemento);
      setElementoFormData(elemento);
    } else {
      setEditingElemento(null);
      setElementoFormData({});
    }
    setSelectedListaId(listaId || null);
    setOpenElementoDialog(true);
  };

  const handleCloseElementoDialog = () => {
    setOpenElementoDialog(false);
    setEditingElemento(null);
    setElementoFormData({});
    setSelectedListaId(null);
  };

  const handleOpenHallazgoDialog = (hallazgo?: Hallazgo, listaId?: number | null) => {
    console.log('=== handleOpenHallazgoDialog (ListasVerificacion) llamado ===');
    console.log('hallazgo recibido:', hallazgo);
    console.log('listaId recibido:', listaId);
    console.log('Estado actual - openHallazgoDialog:', openHallazgoDialog);
    console.log('Estado actual - selectedListaId:', selectedListaId);
    
    if (hallazgo) {
      console.log('Editando hallazgo existente');
      setEditingHallazgo(hallazgo);
      setHallazgoFormData(hallazgo);
    } else {
      console.log('Creando nuevo hallazgo');
      setEditingHallazgo(null);
      const initialData = { severidad: 'Bajo' as 'Alto' | 'Medio' | 'Bajo' };
      console.log('Datos iniciales del formulario:', initialData);
      setHallazgoFormData(initialData);
    }
    
    console.log('Estableciendo selectedListaId:', listaId);
    setSelectedListaId(listaId || null);
    console.log('Abriendo diálogo de hallazgo...');
    setOpenHallazgoDialog(true);
    
    // Verificar que el estado se estableció correctamente
    setTimeout(() => {
      console.log('Estado después de establecer - selectedListaId:', selectedListaId);
      console.log('Estado después de establecer - openHallazgoDialog:', openHallazgoDialog);
    }, 100);
    
    console.log('=== Fin handleOpenHallazgoDialog ===');
  };

  const handleCloseHallazgoDialog = () => {
    setOpenHallazgoDialog(false);
    setEditingHallazgo(null);
    setHallazgoFormData({ severidad: 'Bajo' as 'Alto' | 'Medio' | 'Bajo' });
    setSelectedListaId(null);
  };

  const handleSave = () => {
    // Generar nombre automáticamente basado en la auditoría asociada
    let nombreGenerado = 'Ejecución de Auditoría';
    if (formData.auditoriaNombre) {
      nombreGenerado = `Ejecución - ${formData.auditoriaNombre}`;
    } else if (formData.categoria) {
      nombreGenerado = `Ejecución - ${formData.categoria}`;
    }

    const datosCompletos = {
      ...formData,
      nombre: nombreGenerado
    };

    if (editingLista) {
      editarLista(editingLista.id, datosCompletos);
    } else {
      agregarLista(datosCompletos as Omit<ListaVerificacion, 'id' | 'fechaCreacion'>);
    }
    handleCloseDialog();
  };

  const handleSaveElemento = () => {
    if (!selectedListaId) return;

    if (editingElemento) {
      editarElemento(selectedListaId, editingElemento.id, elementoFormData);
    } else {
      agregarElemento(selectedListaId, elementoFormData as Omit<ElementoVerificacion, 'id'>);
    }

    handleCloseElementoDialog();
  };


  const handleSaveHallazgo = () => {
    console.log('=== handleSaveHallazgo (ListasVerificacion) llamado ===');
    console.log('selectedListaId:', selectedListaId);
    console.log('editingHallazgo:', editingHallazgo);
    console.log('hallazgoFormData:', hallazgoFormData);
    console.log('openHallazgoDialog:', openHallazgoDialog);
    
    if (!selectedListaId) {
      console.log('Error: selectedListaId es null');
      showSnackbar('No se ha seleccionado una lista de verificación', 'error');
      return;
    }

    // Validar campos requeridos
    if (!hallazgoFormData.descripcion || hallazgoFormData.descripcion.trim() === '') {
      console.log('Error: Descripción es requerida');
      showSnackbar('La descripción del hallazgo es requerida', 'error');
      return;
    }

    if (!hallazgoFormData.severidad) {
      console.log('Error: Impacto es requerido');
      showSnackbar('El impacto es requerido', 'error');
      return;
    }

    if (!hallazgoFormData.recomendacion || hallazgoFormData.recomendacion.trim() === '') {
      console.log('Error: Recomendación es requerida');
      showSnackbar('La recomendación es requerida', 'error');
      return;
    }

    // Si es un ID temporal (-1), manejar hallazgos temporales
    if (selectedListaId === -1) {
      const hallazgosActuales = formData.hallazgos || [];
      
      if (editingHallazgo) {
        // Editando hallazgo temporal existente
        console.log('Editando hallazgo temporal existente');
        const hallazgosActualizados = hallazgosActuales.map(h => 
          h.id === editingHallazgo.id 
            ? { ...h, ...hallazgoFormData }
            : h
        );
        setFormData({
          ...formData,
          hallazgos: hallazgosActualizados
        });
        console.log('Hallazgo temporal actualizado en formData');
        showSnackbar('Hallazgo temporal actualizado. Se guardará al guardar la ejecución.', 'success');
      } else {
        // Agregando nuevo hallazgo temporal
        console.log('Agregando hallazgo temporal al formData');
        const nuevoHallazgo: Hallazgo = {
          id: Date.now(), // ID temporal
          numero: hallazgosActuales.length + 1,
          descripcion: hallazgoFormData.descripcion,
          severidad: hallazgoFormData.severidad,
          recomendacion: hallazgoFormData.recomendacion
        };
        
        setFormData({
          ...formData,
          hallazgos: [...hallazgosActuales, nuevoHallazgo]
        });
        
        console.log('Hallazgo temporal agregado al formData');
        showSnackbar('Hallazgo agregado temporalmente. Se guardará al guardar la ejecución.', 'success');
      }
    } else {
      // Para ejecuciones existentes, usar el contexto
      if (editingHallazgo) {
        console.log('Editando hallazgo existente');
        editarHallazgo(selectedListaId, editingHallazgo.id, hallazgoFormData);
      } else {
        console.log('Agregando nuevo hallazgo');
        agregarHallazgo(selectedListaId, hallazgoFormData as Omit<Hallazgo, 'id' | 'numero'>);
      }
    }

    handleCloseHallazgoDialog();
  };

  const handleDelete = (id: number) => {
    eliminarLista(id);
  };

  const handleDeleteElemento = (listaId: number, elementoId: number) => {
    eliminarElemento(listaId, elementoId);
  };

  const handleDeleteHallazgo = (listaId: number, hallazgoId: number) => {
    eliminarHallazgo(listaId, hallazgoId);
  };

  const handleToggleCumplimiento = (listaId: number, elementoId: number) => {
    toggleCumplimiento(listaId, elementoId);
  };

  const getCumplimientoPorcentaje = (elementos: ElementoVerificacion[] | undefined) => {
    if (!elementos || elementos.length === 0) return 0;
    const cumplidos = elementos.filter(e => e.cumplimiento).length;
    return Math.round((cumplidos / elementos.length) * 100);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Ejecución de Auditorías</Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            onClick={debugEstado}
            sx={{ color: 'orange' }}
          >
            🔍 Debug Estado
          </Button>
          <Button
            variant="outlined"
            onClick={restaurarDatosIniciales}
            sx={{ color: 'green' }}
          >
            🔄 Restaurar Datos
          </Button>
          <Button
            variant="outlined"
            onClick={limpiarRegistroEliminados}
            sx={{ color: 'blue' }}
          >
            🗑️ Limpiar Eliminados
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            EJECUCIÓN
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {listas.map((lista) => (
          <Grid item xs={12} key={lista.id}>
            <Paper sx={{ p: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Box>
                  <Typography variant="h6">{lista.nombre}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {lista.categoria} • {lista.fechaCreacion.toLocaleDateString('es-ES')}
                  </Typography>
                  {lista.auditoriaNombre && (
                    <Typography variant="body2" color="primary" sx={{ mt: 0.5 }}>
                      📋 Asociada a: {lista.auditoriaNombre}
                    </Typography>
                  )}
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <Chip
                    label={`${getCumplimientoPorcentaje(lista.elementos)}% Cumplido`}
                    color={getCumplimientoPorcentaje(lista.elementos) === 100 ? 'success' : 'warning'}
                  />
                  <Tooltip title="Agregar Elemento de Verificación">
                    <IconButton onClick={() => handleOpenElementoDialog(undefined, lista.id)}>
                      <AddIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Agregar Hallazgo">
                    <IconButton onClick={() => {
                      console.log('=== CLIC EN AGREGAR HALLAZGO ===');
                      console.log('lista:', lista);
                      console.log('lista.id:', lista.id);
                      console.log('Tipo de lista.id:', typeof lista.id);
                      handleOpenHallazgoDialog(undefined, lista.id);
                    }}>
                      <AddIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Editar Ejecución">
                    <IconButton onClick={() => handleOpenDialog(lista)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Eliminar Ejecución">
                    <IconButton onClick={() => handleDelete(lista.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              
              <Typography variant="body2" mb={2}>
                {lista.descripcion}
              </Typography>

              {/* Sección de Hallazgos */}
              {lista.hallazgos && lista.hallazgos.length > 0 && (
                <Box mb={2}>
                  <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                    🚨 Hallazgos ({lista.hallazgos.length})
                  </Typography>
                  <Box>
                    {lista.hallazgos.map((hallazgo) => (
                      <Paper key={hallazgo.id} sx={{ p: 1.5, mb: 1, backgroundColor: '#fff3e0' }}>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                          <Box flex={1}>
                            <Typography variant="body2" fontWeight="bold">
                              Hallazgo #{hallazgo.numero}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                              {hallazgo.descripcion}
                            </Typography>
                            <Box display="flex" alignItems="center" gap={1} sx={{ mt: 0.5 }}>
                              <Typography variant="caption" color="textSecondary">
                                Impacto:
                              </Typography>
                              <Chip 
                                label={hallazgo.severidad} 
                                size="small" 
                                color={
                                  hallazgo.severidad === 'Alto' ? 'error' :
                                  hallazgo.severidad === 'Medio' ? 'warning' : 'success'
                                }
                              />
                            </Box>
                          </Box>
                          <Box display="flex" gap={0.5}>
                            <IconButton 
                              size="small" 
                              onClick={() => {
                                console.log('Editando hallazgo desde lista principal');
                                console.log('lista.id:', lista.id);
                                console.log('hallazgo:', hallazgo);
                                handleOpenHallazgoDialog(hallazgo, lista.id);
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              onClick={() => handleDeleteHallazgo(lista.id, hallazgo.id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      </Paper>
                    ))}
                  </Box>
                </Box>
              )}

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Elementos de Verificación ({lista.elementos?.length || 0})</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <List>
                    {lista.elementos?.map((elemento) => (
                      <ListItem key={elemento.id} divider>
                        <ListItemIcon>
                          <Checkbox
                            checked={elemento.cumplimiento}
                            onChange={() => handleToggleCumplimiento(lista.id, elemento.id)}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={elemento.descripcion}
                          secondary={
                            elemento.observaciones && `Observaciones: ${elemento.observaciones}`
                          }
                        />
                        <Box display="flex" gap={1}>
                          <IconButton
                            size="small"
                            onClick={() => handleOpenElementoDialog(elemento, lista.id)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteElemento(lista.id, elemento.id)}
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

      {/* Dialog para Lista de Verificación */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingLista ? 'Editar Ejecución' : 'EJECUCIÓN'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Auditoría Asociada</InputLabel>
                <Select
                  value={formData.auditoriaId || ''}
                  label="Auditoría Asociada"
                  onChange={(e) => {
                    const auditoriaId = e.target.value as number;
                    const auditoria = auditoriasDisponibles.find(a => a.id === auditoriaId);
                    setFormData({ 
                      ...formData, 
                      auditoriaId: auditoriaId || null,
                      auditoriaNombre: auditoria?.nombre || null,
                      categoria: auditoria?.tipo || formData.categoria
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
              <FormControl fullWidth>
                <InputLabel>Categoría</InputLabel>
                <Select
                  value={formData.categoria || ''}
                  label="Categoría"
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                >
                  {getTiposActivos().map((tipo) => (
                    <MenuItem key={tipo.id} value={tipo.nombre}>
                      {tipo.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Hallazgos</Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    console.log('Abriendo diálogo de hallazgo desde EJECUCIÓN');
                    console.log('editingLista:', editingLista);
                    console.log('editingLista?.id:', editingLista?.id);
                    
                    // Si estamos editando una lista existente, usar su ID
                    // Si estamos creando una nueva, usar un ID temporal
                    if (editingLista?.id) {
                      handleOpenHallazgoDialog(undefined, editingLista.id);
                    } else {
                      // Para nuevas ejecuciones, usar un ID temporal
                      handleOpenHallazgoDialog(undefined, -1);
                    }
                  }}
                >
                  Agregar Hallazgo
                </Button>
              </Box>
              {formData.hallazgos && formData.hallazgos.length > 0 ? (
                <Box>
                  {formData.hallazgos.map((hallazgo, index) => (
                    <Paper key={hallazgo.id} sx={{ p: 2, mb: 2, backgroundColor: '#f5f5f5' }}>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Box flex={1}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            Hallazgo #{hallazgo.numero}
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            <strong>Descripción:</strong> {hallazgo.descripcion}
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            <strong>Impacto:</strong> 
                            <Chip 
                              label={hallazgo.severidad} 
                              size="small" 
                              color={
                                hallazgo.severidad === 'Alto' ? 'error' :
                                hallazgo.severidad === 'Medio' ? 'warning' : 'success'
                              }
                              sx={{ ml: 1 }}
                            />
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            <strong>Recomendación:</strong> {hallazgo.recomendacion}
                          </Typography>
                        </Box>
                        <Box display="flex" gap={1}>
                          <IconButton 
                            size="small" 
                            onClick={() => {
                              if (editingLista?.id) {
                                handleOpenHallazgoDialog(hallazgo, editingLista.id);
                              } else {
                                // Para hallazgos temporales, usar ID temporal
                                handleOpenHallazgoDialog(hallazgo, -1);
                              }
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            onClick={() => {
                              if (editingLista?.id) {
                                handleDeleteHallazgo(editingLista.id, hallazgo.id);
                              } else {
                                // Para hallazgos temporales, eliminarlos del formData
                                const hallazgosActuales = formData.hallazgos || [];
                                const hallazgosFiltrados = hallazgosActuales.filter(h => h.id !== hallazgo.id);
                                setFormData({
                                  ...formData,
                                  hallazgos: hallazgosFiltrados
                                });
                                showSnackbar('Hallazgo temporal eliminado', 'info');
                              }
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic' }}>
                  No hay hallazgos registrados. Haz clic en "Agregar Hallazgo" para comenzar.
                </Typography>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained">
            {editingLista ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para Elemento de Verificación */}
      <Dialog open={openElementoDialog} onClose={handleCloseElementoDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingElemento ? 'Editar Elemento' : 'Nuevo Elemento de Verificación'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descripción"
                multiline
                rows={3}
                value={elementoFormData.descripcion || ''}
                onChange={(e) => setElementoFormData({ ...elementoFormData, descripcion: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Observaciones"
                multiline
                rows={2}
                value={elementoFormData.observaciones || ''}
                onChange={(e) => setElementoFormData({ ...elementoFormData, observaciones: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Evidencia"
                value={elementoFormData.evidencia || ''}
                onChange={(e) => setElementoFormData({ ...elementoFormData, evidencia: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseElementoDialog}>Cancelar</Button>
          <Button onClick={handleSaveElemento} variant="contained">
            {editingElemento ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para Hallazgo */}
      <Dialog open={openHallazgoDialog} onClose={handleCloseHallazgoDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingHallazgo ? 'Editar Hallazgo' : 'Nuevo Hallazgo'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descripción del Hallazgo"
                multiline
                rows={3}
                value={hallazgoFormData.descripcion || ''}
                onChange={(e) => setHallazgoFormData({ ...hallazgoFormData, descripcion: e.target.value })}
                placeholder="Describe el hallazgo encontrado durante la auditoría..."
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Impacto</InputLabel>
                <Select
                  value={hallazgoFormData.severidad || 'Bajo'}
                  label="Impacto"
                  onChange={(e) => setHallazgoFormData({ ...hallazgoFormData, severidad: e.target.value as 'Alto' | 'Medio' | 'Bajo' })}
                >
                  <MenuItem value="Alto">Alto</MenuItem>
                  <MenuItem value="Medio">Medio</MenuItem>
                  <MenuItem value="Bajo">Bajo</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Recomendación"
                multiline
                rows={3}
                value={hallazgoFormData.recomendacion || ''}
                onChange={(e) => setHallazgoFormData({ ...hallazgoFormData, recomendacion: e.target.value })}
                placeholder="Proporciona recomendaciones para resolver este hallazgo..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseHallazgoDialog}>Cancelar</Button>
          <Button 
            onClick={() => {
              console.log('Botón CREAR/Actualizar clickeado en ListasVerificacion');
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
  );
};

export default ListasVerificacion;
