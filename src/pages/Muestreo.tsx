import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  Grid,
  Card,
  CardContent,
  Alert,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Calculate as CalculateIcon,
  Shuffle as ShuffleIcon,
  Numbers as NumbersIcon,
  Percent as PercentIcon,
} from '@mui/icons-material';

interface MuestreoResultado {
  universo: number;
  porcentaje: number;
  tamanoMuestra: number;
  elementosSeleccionados: number[];
  fechaCalculo: Date;
}

const Muestreo: React.FC = () => {
  const [universo, setUniverso] = useState<number | ''>('');
  const [porcentaje, setPorcentaje] = useState<number | ''>('');
  const [resultado, setResultado] = useState<MuestreoResultado | null>(null);
  const [error, setError] = useState<string>('');

  const calcularMuestreo = () => {
    // Limpiar errores previos
    setError('');
    
    // Validaciones
    if (universo === '' || universo <= 0) {
      setError('El universo debe ser un número mayor a 0');
      return;
    }
    
    if (porcentaje === '' || porcentaje <= 0 || porcentaje > 100) {
      setError('El porcentaje debe ser un número entre 0 y 100');
      return;
    }

    // Calcular tamaño de muestra
    const tamanoMuestra = Math.ceil((universo * porcentaje) / 100);
    
    // Generar números aleatorios únicos
    const elementosSeleccionados: number[] = [];
    const maxIntentos = universo * 2; // Límite para evitar bucles infinitos
    let intentos = 0;
    
    while (elementosSeleccionados.length < tamanoMuestra && intentos < maxIntentos) {
      const numeroAleatorio = Math.floor(Math.random() * universo) + 1;
      if (!elementosSeleccionados.includes(numeroAleatorio)) {
        elementosSeleccionados.push(numeroAleatorio);
      }
      intentos++;
    }
    
    // Ordenar los elementos seleccionados
    elementosSeleccionados.sort((a, b) => a - b);
    
    const nuevoResultado: MuestreoResultado = {
      universo: universo as number,
      porcentaje: porcentaje as number,
      tamanoMuestra,
      elementosSeleccionados,
      fechaCalculo: new Date(),
    };
    
    setResultado(nuevoResultado);
  };

  const limpiarFormulario = () => {
    setUniverso('');
    setPorcentaje('');
    setResultado(null);
    setError('');
  };

  const formatearFecha = (fecha: Date) => {
    return fecha.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Muestreo Aleatorio</Typography>
        <Typography variant="body2" color="textSecondary">
          Herramienta para calcular muestreo estadístico
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Formulario */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              <CalculateIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Parámetros del Muestreo
            </Typography>
            
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Universo"
                  type="number"
                  value={universo}
                  onChange={(e) => setUniverso(e.target.value ? parseInt(e.target.value) : '')}
                  placeholder="Ej: 1000"
                  helperText="Número total de elementos en la población"
                  InputProps={{
                    startAdornment: <NumbersIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Porcentaje de Muestreo"
                  type="number"
                  value={porcentaje}
                  onChange={(e) => setPorcentaje(e.target.value ? parseFloat(e.target.value) : '')}
                  placeholder="Ej: 10"
                  helperText="Porcentaje de la población a muestrear (0-100%)"
                  InputProps={{
                    startAdornment: <PercentIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    endAdornment: '%',
                  }}
                />
              </Grid>
            </Grid>

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            <Box display="flex" gap={2} sx={{ mt: 3 }}>
              <Button
                variant="contained"
                startIcon={<ShuffleIcon />}
                onClick={calcularMuestreo}
                disabled={universo === '' || porcentaje === ''}
                fullWidth
              >
                Calcular Muestreo
              </Button>
              <Button
                variant="outlined"
                onClick={limpiarFormulario}
                fullWidth
              >
                Limpiar
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Resultados */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              <ShuffleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Resultado del Muestreo
            </Typography>
            
            {resultado ? (
              <Box>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={6}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center', py: 2 }}>
                        <Typography variant="h4" color="primary">
                          {resultado.tamanoMuestra}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Elementos a Muestrear
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center', py: 2 }}>
                        <Typography variant="h4" color="secondary">
                          {resultado.porcentaje}%
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Porcentaje Aplicado
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle1" gutterBottom>
                  Información del Cálculo:
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <NumbersIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Universo" 
                      secondary={`${resultado.universo} elementos`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <PercentIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Porcentaje" 
                      secondary={`${resultado.porcentaje}%`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CalculateIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Tamaño de Muestra" 
                      secondary={`${resultado.tamanoMuestra} elementos (${((resultado.tamanoMuestra / resultado.universo) * 100).toFixed(2)}%)`}
                    />
                  </ListItem>
                </List>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle1" gutterBottom>
                  Elementos Seleccionados:
                </Typography>
                <Box sx={{ maxHeight: 200, overflow: 'auto', border: 1, borderColor: 'divider', borderRadius: 1, p: 1 }}>
                  <Box display="flex" flexWrap="wrap" gap={0.5}>
                    {resultado.elementosSeleccionados.map((elemento, index) => (
                      <Chip
                        key={index}
                        label={elemento}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>

                <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                  Calculado el {formatearFecha(resultado.fechaCalculo)}
                </Typography>
              </Box>
            ) : (
              <Box textAlign="center" py={4}>
                <ShuffleIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body1" color="textSecondary">
                  Complete los parámetros y haga clic en "Calcular Muestreo" para ver los resultados
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Información adicional */}
      <Paper sx={{ p: 3, mt: 3, backgroundColor: 'grey.50' }}>
        <Typography variant="h6" gutterBottom>
          Información sobre el Muestreo Aleatorio
        </Typography>
        <Typography variant="body2" paragraph>
          El muestreo aleatorio es una técnica estadística que permite seleccionar una muestra representativa 
          de una población más grande. Cada elemento de la población tiene la misma probabilidad de ser seleccionado.
        </Typography>
        <Typography variant="body2" paragraph>
          <strong>Ventajas:</strong>
        </Typography>
        <ul>
          <li>Elimina el sesgo en la selección</li>
          <li>Permite hacer inferencias sobre la población total</li>
          <li>Es fácil de implementar y entender</li>
          <li>Reduce costos y tiempo en auditorías</li>
        </ul>
        <Typography variant="body2">
          <strong>Nota:</strong> Los elementos seleccionados se generan de forma aleatoria y se ordenan 
          numéricamente para facilitar su identificación durante la auditoría.
        </Typography>
      </Paper>
    </Box>
  );
};

export default Muestreo;
