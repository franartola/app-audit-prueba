import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useAuditorias } from '../contexts/AuditoriasContext';
import { useAccionesCorrectivas } from '../contexts/AccionesCorrectivasContext';
import { useListasVerificacion } from '../contexts/ListasVerificacionContext';

const Dashboard: React.FC = () => {
  const { auditorias } = useAuditorias();
  const { accionesCorrectivas } = useAccionesCorrectivas();
  const { listas } = useListasVerificacion();
  
  // Calcular métricas basadas en los datos reales del contexto
  const metrics = {
    totalAuditorias: auditorias.length,
    auditoriasCompletadas: auditorias.filter(a => a.estado === 'Completada').length,
    auditoriasEnProceso: auditorias.filter(a => a.estado === 'En Proceso').length,
    auditoriasPendientes: auditorias.filter(a => a.estado === 'Pendiente').length,
    // Calcular hallazgos totales desde todas las listas de verificación
            hallazgosCriticos: listas.reduce((total, lista) => 
          total + lista.hallazgos.filter(h => h.severidad === 'Alto').length, 0),
        hallazgosMayores: listas.reduce((total, lista) => 
          total + lista.hallazgos.filter(h => h.severidad === 'Medio').length, 0),
        hallazgosMenores: listas.reduce((total, lista) => 
          total + lista.hallazgos.filter(h => h.severidad === 'Bajo').length, 0),
    // Calcular seguimientos de observaciones totales
    accionesCorrectivas: accionesCorrectivas.length,
    accionesCompletadas: accionesCorrectivas.filter(a => a.estado === 'Regularizada').length,
  };

  // Obtener las auditorías más recientes
  // IMPORTANTE: Usar spread operator ([...auditorias]) para crear una copia antes de sort()
  // ya que los arrays del contexto son inmutables
  const recentAuditorias = [...auditorias]
    .sort((a, b) => new Date(b.fechaInicio).getTime() - new Date(a.fechaInicio).getTime())
    .slice(0, 3)
    .map(auditoria => ({
      id: auditoria.id,
      nombre: auditoria.nombre,
      fecha: auditoria.fechaInicio.toLocaleDateString('es-ES'),
      estado: auditoria.estado,
      auditor: auditoria.auditor,
      // Calcular hallazgos reales para esta auditoría específica
      hallazgos: listas
        .filter(lista => lista.auditoriaId === auditoria.id)
        .reduce((total, lista) => total + lista.hallazgos.length, 0),
    }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completada':
        return 'success';
      case 'En Proceso':
        return 'warning';
      case 'Pendiente':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard de Auditoría Interna
      </Typography>
      
      {/* Métricas principales */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <AssessmentIcon color="primary" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Auditorías
                  </Typography>
                  <Typography variant="h4">{metrics.totalAuditorias}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <CheckCircleIcon color="success" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Completadas
                  </Typography>
                  <Typography variant="h4">{metrics.auditoriasCompletadas}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <WarningIcon color="warning" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    En Proceso
                  </Typography>
                  <Typography variant="h4">{metrics.auditoriasEnProceso}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <ErrorIcon color="error" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Hallazgos de Alto Impacto
                  </Typography>
                  <Typography variant="h4">{metrics.hallazgosCriticos}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Resumen de hallazgos y acciones */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Resumen de Hallazgos
            </Typography>
            <Box display="flex" justifyContent="space-around" alignItems="center">
              <Box textAlign="center">
                <Typography variant="h3" color="error">
                  {metrics.hallazgosCriticos}
                </Typography>
                <Typography variant="body2">Alto Impacto</Typography>
              </Box>
              <Box textAlign="center">
                <Typography variant="h3" color="warning.main">
                  {metrics.hallazgosMayores}
                </Typography>
                <Typography variant="body2">Medio Impacto</Typography>
              </Box>
              <Box textAlign="center">
                <Typography variant="h3" color="info.main">
                  {metrics.hallazgosMenores}
                </Typography>
                <Typography variant="body2">Bajo Impacto</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Seguimiento de Observaciones
            </Typography>
            <Box display="flex" justifyContent="space-around" alignItems="center">
              <Box textAlign="center">
                <Typography variant="h3" color="success.main">
                  {metrics.accionesCompletadas}
                </Typography>
                <Typography variant="body2">Completadas</Typography>
              </Box>
              <Box textAlign="center">
                <Typography variant="h3" color="warning.main">
                  {metrics.accionesCorrectivas - metrics.accionesCompletadas}
                </Typography>
                <Typography variant="body2">Pendientes</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Auditorías recientes */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Auditorías Recientes
        </Typography>
        <List>
          {recentAuditorias.map((auditoria) => (
            <ListItem key={auditoria.id} divider>
              <ListItemIcon>
                <AssessmentIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary={auditoria.nombre}
                secondary={`${auditoria.fecha} • ${auditoria.auditor} • ${auditoria.hallazgos} hallazgos`}
              />
              <Chip
                label={auditoria.estado}
                color={getStatusColor(auditoria.estado) as any}
                size="small"
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default Dashboard;
