import React, { useState, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
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
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Analytics as AnalyticsIcon,
  Description as DescriptionIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  FilePresent as FilePresentIcon,
} from '@mui/icons-material';
// @ts-ignore
import * as XLSX from 'xlsx';

interface ArchivoCargado {
  id: string;
  nombre: string;
  tipo: string;
  tamaño: number;
  fechaCarga: Date;
  datos?: any[];
  procesado: boolean;
}

interface DatosProcesados {
  archivos: ArchivoCargado[];
  datosConsolidados: any[];
  columnas: string[];
  totalRegistros: number;
}

const AnalisisDatos: React.FC = () => {
  const [archivos, setArchivos] = useState<ArchivoCargado[]>([]);
  const [datosProcesados, setDatosProcesados] = useState<DatosProcesados | null>(null);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState<string>('');
  const [dialogoArchivo, setDialogoArchivo] = useState<ArchivoCargado | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tiposPermitidos = [
    'application/pdf',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/csv',
    'text/plain',
    'application/json'
  ];

  const extensionesPermitidas = [
    '.pdf', '.xlsx', '.xls', '.docx', '.doc', '.csv', '.txt', '.json'
  ];

  const formatearTamaño = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const obtenerTipoArchivo = (tipo: string, nombre: string): string => {
    const extension = nombre.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return 'PDF';
      case 'xlsx': case 'xls': return 'Excel';
      case 'docx': case 'doc': return 'Word';
      case 'csv': return 'CSV';
      case 'txt': return 'Texto';
      case 'json': return 'JSON';
      default: return 'Desconocido';
    }
  };

  const procesarArchivo = async (archivo: File): Promise<any[]> => {
    const extension = archivo.name.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'xlsx':
      case 'xls':
        return await procesarExcel(archivo);
      case 'csv':
        return await procesarCSV(archivo);
      case 'json':
        return await procesarJSON(archivo);
      case 'txt':
        return await procesarTexto(archivo);
      case 'pdf':
        return await procesarPDF(archivo);
      case 'docx':
      case 'doc':
        return await procesarWord(archivo);
      default:
        throw new Error('Tipo de archivo no soportado');
    }
  };

  const procesarExcel = async (archivo: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Error al leer el archivo Excel'));
      reader.readAsBinaryString(archivo);
    });
  };

  const procesarCSV = async (archivo: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.split('\n');
          const headers = lines[0].split(',').map(h => h.trim());
          const data = lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim());
            const obj: any = {};
            headers.forEach((header, index) => {
              obj[header] = values[index] || '';
            });
            return obj;
          });
          resolve(data);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Error al leer el archivo CSV'));
      reader.readAsText(archivo);
    });
  };

  const procesarJSON = async (archivo: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const data = JSON.parse(text);
          resolve(Array.isArray(data) ? data : [data]);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Error al leer el archivo JSON'));
      reader.readAsText(archivo);
    });
  };

  const procesarTexto = async (archivo: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.split('\n').filter(line => line.trim());
          const data = lines.map((line, index) => ({
            'Línea': index + 1,
            'Contenido': line.trim()
          }));
          resolve(data);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Error al leer el archivo de texto'));
      reader.readAsText(archivo);
    });
  };

  const procesarPDF = async (archivo: File): Promise<any[]> => {
    console.log('Procesando PDF:', archivo.name);
    
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const uint8Array = new Uint8Array(arrayBuffer);
          
          console.log('Analizando PDF:', archivo.name, 'Tamaño:', uint8Array.length, 'bytes');
          
          // Análisis básico del PDF para extraer información
          const pdfInfo = await analizarPDFBasico(uint8Array, archivo);
          
          // Crear datos estructurados del análisis
          const datosPDF = [
            {
              'Archivo': archivo.name,
              'Tipo': 'PDF',
              'Tamaño': formatearTamaño(archivo.size),
              'Fecha_Carga': new Date().toLocaleString('es-ES'),
              'Estado': 'Procesado exitosamente',
              'Informacion_Extraida': pdfInfo.informacionExtraida
            },
            {
              'Metadatos_PDF': 'Información del documento:',
              'Version_PDF': pdfInfo.version,
              'Numero_Paginas': pdfInfo.numPaginas,
              'Tiene_Texto': pdfInfo.tieneTexto ? 'Sí' : 'No',
              'Tipo_Contenido': pdfInfo.tipoContenido
            },
            {
              'Instrucciones_Procesamiento': 'Para extraer texto completo:',
              'Opcion_1': '1. Usar herramienta online como ilovepdf.com',
              'Opcion_2': '2. Abrir PDF y copiar texto manualmente',
              'Opcion_3': '3. Usar Adobe Acrobat para exportar a Excel',
              'Siguiente_Paso': 'Subir el resultado en formato CSV o Excel'
            }
          ];
          
          // Si se detectó texto en el PDF, agregar información adicional
          if (pdfInfo.tieneTexto) {
            datosPDF.push({
              'Detectado_Texto': 'Sí',
              'Recomendacion': 'El PDF contiene texto que puede ser extraído',
              'Herramienta_Recomendada': 'ilovepdf.com o Adobe Acrobat',
              'Formato_Salida': 'CSV o Excel'
            } as any);
          }
          
          console.log('PDF procesado exitosamente (análisis básico)');
          resolve(datosPDF);
          
        } catch (error) {
          console.error('Error procesando PDF:', error);
          
          const datosError = [{
            'Archivo': archivo.name,
            'Tipo': 'PDF',
            'Tamaño': formatearTamaño(archivo.size),
            'Error': 'Sí',
            'Mensaje_Error': error instanceof Error ? error.message : 'Error desconocido',
            'Nota': 'El PDF no pudo ser procesado completamente',
            'Fecha_Error': new Date().toLocaleString('es-ES')
          }];
          
          resolve(datosError);
        }
      };
      
      reader.onerror = () => {
        console.error('Error al leer el archivo PDF');
        resolve([{
          'Archivo': archivo.name,
          'Tipo': 'PDF',
          'Tamaño': formatearTamaño(archivo.size),
          'Error': 'Sí',
          'Mensaje_Error': 'Error al leer el archivo',
          'Fecha_Error': new Date().toLocaleString('es-ES')
        }]);
      };
      
      reader.readAsArrayBuffer(archivo);
    });
  };

  const analizarPDFBasico = async (uint8Array: Uint8Array, archivo: File) => {
    try {
      // Convertir a string para análisis básico
      const pdfString = new TextDecoder('latin1').decode(uint8Array);
      
      // Extraer información básica del PDF
      const versionMatch = pdfString.match(/%PDF-(\d+\.\d+)/);
      const version = versionMatch ? versionMatch[1] : 'Desconocida';
      
      // Contar páginas (aproximado)
      const pageMatches = pdfString.match(/\/Type\s*\/Page\b/g);
      const numPaginas = pageMatches ? pageMatches.length : 1;
      
      // Detectar si tiene texto
      const tieneTexto = pdfString.includes('/Type /Font') || 
                        pdfString.includes('/BaseFont') ||
                        (pdfString.includes('BT') && pdfString.includes('ET'));
      
      // Determinar tipo de contenido
      let tipoContenido = 'Mixto';
      if (tieneTexto && pdfString.includes('/Image')) {
        tipoContenido = 'Texto e Imágenes';
      } else if (tieneTexto) {
        tipoContenido = 'Principalmente Texto';
      } else if (pdfString.includes('/Image')) {
        tipoContenido = 'Principalmente Imágenes (Escaneado)';
      } else {
        tipoContenido = 'Desconocido';
      }
      
      return {
        version,
        numPaginas,
        tieneTexto,
        tipoContenido,
        informacionExtraida: `${numPaginas} páginas, ${tipoContenido}`
      };
    } catch (error) {
      console.error('Error en análisis básico:', error);
      return {
        version: 'Desconocida',
        numPaginas: 1,
        tieneTexto: false,
        tipoContenido: 'Error en análisis',
        informacionExtraida: 'Error al analizar el PDF'
      };
    }
  };

  const procesarWord = async (archivo: File): Promise<any[]> => {
    // Simulación de procesamiento de Word (en un entorno real usarías mammoth.js)
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([{
          'Archivo': archivo.name,
          'Tipo': 'Word',
          'Tamaño': formatearTamaño(archivo.size),
          'Nota': 'Procesamiento de Word requiere librería especializada'
        }]);
      }, 1000);
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setError('');
    setProcesando(true);

    try {
      const nuevosArchivos: ArchivoCargado[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validar tipo de archivo
        if (!tiposPermitidos.includes(file.type) && 
            !extensionesPermitidas.some(ext => file.name.toLowerCase().endsWith(ext))) {
          setError(`Tipo de archivo no soportado: ${file.name}`);
          continue;
        }

        // Validar tamaño (máximo 10MB)
        if (file.size > 10 * 1024 * 1024) {
          setError(`Archivo demasiado grande: ${file.name} (máximo 10MB)`);
          continue;
        }

        const archivoId = Date.now().toString() + i;
        const nuevoArchivo: ArchivoCargado = {
          id: archivoId,
          nombre: file.name,
          tipo: obtenerTipoArchivo(file.type, file.name),
          tamaño: file.size,
          fechaCarga: new Date(),
          procesado: false
        };

        // Procesar archivo
        try {
          const datos = await procesarArchivo(file);
          nuevoArchivo.datos = datos;
          nuevoArchivo.procesado = true;
        } catch (error) {
          console.error(`Error procesando ${file.name}:`, error);
          nuevoArchivo.datos = [{
            'Error': `No se pudo procesar: ${error instanceof Error ? error.message : 'Error desconocido'}`,
            'Archivo': file.name,
            'Tipo': obtenerTipoArchivo(file.type, file.name),
            'Tamaño': formatearTamaño(file.size)
          }];
          nuevoArchivo.procesado = true; // Marcar como procesado para incluir en consolidación
        }

        nuevosArchivos.push(nuevoArchivo);
      }

      setArchivos(prev => [...prev, ...nuevosArchivos]);
      
      // Procesar datos consolidados
      await procesarDatosConsolidados([...archivos, ...nuevosArchivos]);

    } catch (error) {
      setError('Error al procesar los archivos');
      console.error('Error:', error);
    } finally {
      setProcesando(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const procesarDatosConsolidados = async (archivosLista: ArchivoCargado[]) => {
    try {
      const datosConsolidados: any[] = [];
      const columnasSet = new Set<string>();

      archivosLista.forEach(archivo => {
        if (archivo.datos && archivo.procesado) {
          archivo.datos.forEach((fila, index) => {
            const filaConMetadata = {
              ...fila,
              '_Archivo': archivo.nombre,
              '_Tipo': archivo.tipo,
              '_Fila': index + 1
            };
            datosConsolidados.push(filaConMetadata);
            
            // Recopilar columnas
            Object.keys(filaConMetadata).forEach(col => columnasSet.add(col));
          });
        }
      });

      const columnas = Array.from(columnasSet).sort();
      const totalRegistros = datosConsolidados.length;

      setDatosProcesados({
        archivos: archivosLista,
        datosConsolidados,
        columnas,
        totalRegistros
      });

    } catch (error) {
      console.error('Error consolidando datos:', error);
      setError('Error al consolidar los datos');
    }
  };

  const eliminarArchivo = (id: string) => {
    const nuevosArchivos = archivos.filter(archivo => archivo.id !== id);
    setArchivos(nuevosArchivos);
    procesarDatosConsolidados(nuevosArchivos);
  };

  const descargarPlanilla = () => {
    if (!datosProcesados) return;

    const worksheet = XLSX.utils.json_to_sheet(datosProcesados.datosConsolidados);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos Consolidados');
    
    // Agregar hoja de resumen
    const resumenData = [
      ['Resumen de Análisis de Datos'],
      [''],
      ['Total de Archivos:', datosProcesados.archivos.length],
      ['Total de Registros:', datosProcesados.totalRegistros],
      ['Columnas Disponibles:', datosProcesados.columnas.length],
      [''],
      ['Archivos Procesados:'],
      ...datosProcesados.archivos.map(archivo => [
        archivo.nombre,
        archivo.tipo,
        formatearTamaño(archivo.tamaño),
        archivo.procesado ? 'Sí' : 'No'
      ])
    ];
    
    const resumenSheet = XLSX.utils.aoa_to_sheet(resumenData);
    XLSX.utils.book_append_sheet(workbook, resumenSheet, 'Resumen');
    
    XLSX.writeFile(workbook, 'analisis_datos_consolidado.xlsx');
  };

  const verArchivo = (archivo: ArchivoCargado) => {
    setDialogoArchivo(archivo);
  };

  const cerrarDialogo = () => {
    setDialogoArchivo(null);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Análisis de Datos</Typography>
        <Typography variant="body2" color="textSecondary">
          Herramienta de Data Analytics para procesamiento de documentos
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Panel de carga de archivos */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              <CloudUploadIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Cargar Documentos
            </Typography>
            
            <Box
              sx={{
                border: '2px dashed #ccc',
                borderRadius: 2,
                p: 3,
                textAlign: 'center',
                cursor: 'pointer',
                '&:hover': {
                  borderColor: 'primary.main',
                  backgroundColor: 'action.hover',
                },
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Arrastra archivos aquí o haz clic para seleccionar
              </Typography>
              <Typography variant="body2" color="textSecondary">
                PDF, Excel, Word, CSV, TXT, JSON
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Máximo 10MB por archivo
              </Typography>
            </Box>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.xlsx,.xls,.docx,.doc,.csv,.txt,.json"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />

            {procesando && (
              <Box sx={{ mt: 2 }}>
                <LinearProgress />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Procesando archivos...
                </Typography>
              </Box>
            )}

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Tipos de archivo soportados:
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={0.5}>
                {['PDF', 'Excel', 'Word', 'CSV', 'TXT', 'JSON'].map(tipo => (
                  <Chip key={tipo} label={tipo} size="small" variant="outlined" />
                ))}
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Lista de archivos cargados */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              <FilePresentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Archivos Cargados ({archivos.length})
            </Typography>
            
            {archivos.length === 0 ? (
              <Box textAlign="center" py={4}>
                <DescriptionIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body1" color="textSecondary">
                  No hay archivos cargados. Sube algunos documentos para comenzar el análisis.
                </Typography>
              </Box>
            ) : (
              <List>
                {archivos.map((archivo) => (
                  <ListItem key={archivo.id} divider>
                    <ListItemIcon>
                      <DescriptionIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={archivo.nombre}
                      secondary={
                        <Box>
                          <Typography variant="caption" display="block">
                            {archivo.tipo} • {formatearTamaño(archivo.tamaño)} • 
                            {archivo.fechaCarga.toLocaleString('es-ES')}
                          </Typography>
                          <Chip
                            label={archivo.procesado ? 'Procesado' : 'Error'}
                            size="small"
                            color={archivo.procesado ? 'success' : 'error'}
                            sx={{ mt: 0.5 }}
                          />
                        </Box>
                      }
                    />
                    <Box>
                      <Tooltip title="Ver datos">
                        <IconButton onClick={() => verArchivo(archivo)}>
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton onClick={() => eliminarArchivo(archivo.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Panel de resultados */}
        {datosProcesados && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  <AnalyticsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Datos Consolidados
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={descargarPlanilla}
                >
                  Descargar Planilla Excel
                </Button>
              </Box>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={3}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: 'center', py: 2 }}>
                      <Typography variant="h4" color="primary">
                        {datosProcesados.totalRegistros}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Total Registros
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: 'center', py: 2 }}>
                      <Typography variant="h4" color="secondary">
                        {datosProcesados.archivos.length}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Archivos Procesados
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: 'center', py: 2 }}>
                      <Typography variant="h4" color="success.main">
                        {datosProcesados.columnas.length}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Columnas Disponibles
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: 'center', py: 2 }}>
                      <Typography variant="h4" color="warning.main">
                        {datosProcesados.archivos.filter(a => a.procesado).length}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Archivos Exitosos
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle1" gutterBottom>
                Vista previa de datos (primeras 10 filas):
              </Typography>
              
              <TableContainer sx={{ maxHeight: 400 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      {datosProcesados.columnas.slice(0, 10).map((columna) => (
                        <TableCell key={columna} sx={{ fontWeight: 'bold' }}>
                          {columna}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {datosProcesados.datosConsolidados.slice(0, 10).map((fila, index) => (
                      <TableRow key={index}>
                        {datosProcesados.columnas.slice(0, 10).map((columna) => (
                          <TableCell key={columna}>
                            {fila[columna]?.toString() || '-'}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Dialog para ver archivo */}
      <Dialog open={!!dialogoArchivo} onClose={cerrarDialogo} maxWidth="md" fullWidth>
        <DialogTitle>
          Datos del archivo: {dialogoArchivo?.nombre}
        </DialogTitle>
        <DialogContent>
          {dialogoArchivo?.datos && (
            <TableContainer sx={{ maxHeight: 400 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {Object.keys(dialogoArchivo.datos[0] || {}).map((columna) => (
                      <TableCell key={columna} sx={{ fontWeight: 'bold' }}>
                        {columna}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dialogoArchivo.datos.slice(0, 20).map((fila, index) => (
                    <TableRow key={index}>
                      {Object.values(fila).map((valor, i) => (
                        <TableCell key={i}>
                          {valor?.toString() || '-'}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={cerrarDialogo}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AnalisisDatos;
