import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface HallazgoReporte {
  id: number;
  numero: number;
  descripcion: string;
  severidad: 'Crítico' | 'Mayor' | 'Menor';
  recomendacion: string;
  fechaLimite?: Date;
}

export interface ReporteAuditoria {
  id: number;
  titulo: string;
  auditoriaId: number;
  auditoriaNombre: string;
  fechaCreacion: Date;
  fechaRevision?: Date;
  estado: 'Borrador' | 'En Revisión' | 'Aprobado' | 'Finalizado';
  resumen: string;
  alcance: string;
  metodologia: string;
  conclusiones: string;
  recomendaciones: string;
  hallazgos: HallazgoReporte[];
  observaciones: string;
}

interface ReportesContextType {
  reportes: ReporteAuditoria[];
  isLoading: boolean;
  agregarReporte: (reporte: Omit<ReporteAuditoria, 'id' | 'fechaCreacion'>) => void;
  editarReporte: (id: number, reporte: Partial<ReporteAuditoria>) => void;
  eliminarReporte: (id: number) => void;
  obtenerReporte: (id: number) => ReporteAuditoria | undefined;
  agregarHallazgo: (reporteId: number, hallazgo: Omit<HallazgoReporte, 'id' | 'numero'>) => void;
  editarHallazgo: (reporteId: number, hallazgoId: number, hallazgo: Partial<HallazgoReporte>) => void;
  eliminarHallazgo: (reporteId: number, hallazgoId: number) => void;
  limpiarTodosLosReportes: () => void;
  debugEstado: () => void;
}

const ReportesContext = createContext<ReportesContextType | undefined>(undefined);

const STORAGE_KEY = 'reportes_auditoria';
const INIT_FLAG_KEY = 'reportes_auditoria_initialized';

// Datos iniciales (solo para la primera vez)
const reportesIniciales: ReporteAuditoria[] = [
  {
    id: 1,
    titulo: 'Reporte de Auditoría de Seguridad Informática',
    auditoriaId: 1,
    auditoriaNombre: 'Auditoría de Seguridad Informática',
    fechaCreacion: new Date('2024-01-20'),
    estado: 'Aprobado',
    resumen: 'Auditoría de seguridad de sistemas informáticos de la empresa',
    alcance: 'Departamento de TI, sistemas críticos',
    metodologia: 'Revisión de documentación, entrevistas, pruebas técnicas',
    conclusiones: 'Se identificaron vulnerabilidades de seguridad que requieren atención inmediata',
    recomendaciones: 'Implementar políticas de contraseñas, actualizar sistemas, capacitar personal',
    hallazgos: [
      {
        id: 1,
        numero: 1,
        descripcion: 'Falta de políticas de contraseñas robustas',
        severidad: 'Crítico',
        recomendacion: 'Implementar políticas de contraseñas con requisitos mínimos',
        fechaLimite: new Date('2024-03-01'),
      },
      {
        id: 2,
        numero: 2,
        descripcion: 'Sistemas operativos desactualizados',
        severidad: 'Mayor',
        recomendacion: 'Actualizar todos los sistemas operativos a versiones soportadas',
        fechaLimite: new Date('2024-04-01'),
      },
    ],
    observaciones: 'El personal de TI está comprometido con la mejora de la seguridad',
  },
  {
    id: 2,
    titulo: 'Reporte de Auditoría de Recursos Humanos',
    auditoriaId: 2,
    auditoriaNombre: 'Auditoría de Recursos Humanos',
    fechaCreacion: new Date('2024-01-25'),
    estado: 'En Revisión',
    resumen: 'Auditoría de procesos y procedimientos del departamento de RRHH',
    alcance: 'Departamento de RRHH, procesos de contratación y gestión',
    metodologia: 'Revisión de documentación, entrevistas, observación de procesos',
    conclusiones: 'Los procesos de RRHH están bien documentados pero requieren algunas mejoras',
    recomendaciones: 'Implementar sistema de seguimiento de candidatos, mejorar documentación de evaluaciones',
    hallazgos: [
      {
        id: 1,
        numero: 1,
        descripcion: 'Falta de sistema de seguimiento de candidatos',
        severidad: 'Menor',
        recomendacion: 'Implementar software de gestión de candidatos',
        fechaLimite: new Date('2024-05-01'),
      },
    ],
    observaciones: 'El departamento de RRHH muestra buena organización y compromiso',
  },
];

export const useReportes = () => {
  const context = useContext(ReportesContext);
  if (!context) {
    throw new Error('useReportes debe ser usado dentro de un ReportesProvider');
  }
  return context;
};

interface ReportesProviderProps {
  children: ReactNode;
}

export const ReportesProvider: React.FC<ReportesProviderProps> = ({ children }) => {
  const [reportes, setReportes] = useState<ReporteAuditoria[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Función para guardar en localStorage
  const saveToStorage = (data: ReporteAuditoria[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      console.log('Informes guardados en localStorage:', data.length);
    } catch (error) {
      console.error('Error al guardar en localStorage:', error);
    }
  };

  // Función para cargar desde localStorage
  const loadFromStorage = (): ReporteAuditoria[] | null => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Convertir fechas de string a Date
        const reportesConFechas = parsed.map((reporte: any) => ({
          ...reporte,
          fechaCreacion: new Date(reporte.fechaCreacion),
          fechaRevision: reporte.fechaRevision ? new Date(reporte.fechaRevision) : undefined,
          hallazgos: reporte.hallazgos.map((hallazgo: any) => ({
            ...hallazgo,
            fechaLimite: hallazgo.fechaLimite ? new Date(hallazgo.fechaLimite) : undefined,
          })),
        }));
        console.log('Informes cargados desde localStorage:', reportesConFechas.length);
        return reportesConFechas;
      }
    } catch (error) {
      console.error('Error al cargar desde localStorage:', error);
    }
    return null;
  };

  // Función para verificar si es la primera vez
  const isFirstTime = (): boolean => {
    return localStorage.getItem(INIT_FLAG_KEY) !== 'true';
  };

  // Función para marcar como inicializado
  const markAsInitialized = () => {
    localStorage.setItem(INIT_FLAG_KEY, 'true');
    console.log('Marcado como inicializado');
  };

  // Inicialización
  useEffect(() => {
    console.log('Inicializando ReportesContext...');
    
    const savedReportes = loadFromStorage();
    
    if (savedReportes && savedReportes.length > 0) {
      // Hay datos guardados, usarlos
      console.log('Usando informes guardados:', savedReportes.length);
      setReportes(savedReportes);
    } else if (isFirstTime()) {
      // Es la primera vez, usar reportes iniciales
      console.log('Primera vez, usando informes iniciales:', reportesIniciales.length);
      setReportes(reportesIniciales);
      markAsInitialized();
      saveToStorage(reportesIniciales);
    } else {
      // No es la primera vez y no hay datos, mantener vacío
      console.log('No es primera vez y no hay datos, manteniendo vacío');
      setReportes([]);
    }
    
    setIsLoading(false);
  }, []);

  // Guardar automáticamente cuando cambien los informes
  useEffect(() => {
    if (!isLoading) {
      saveToStorage(reportes);
    }
  }, [reportes, isLoading]);

  const agregarReporte = (nuevoReporte: Omit<ReporteAuditoria, 'id' | 'fechaCreacion'>) => {
    const reporte: ReporteAuditoria = {
      ...nuevoReporte,
      id: Math.max(...reportes.map(r => r.id), 0) + 1,
      fechaCreacion: new Date(),
    };
    console.log('Agregando reporte:', reporte.titulo);
    setReportes(prev => [...prev, reporte]);
  };

  const editarReporte = (id: number, cambios: Partial<ReporteAuditoria>) => {
    console.log('Editando reporte ID:', id);
    setReportes(prev => prev.map(reporte => 
      reporte.id === id ? { ...reporte, ...cambios } : reporte
    ));
  };

  const eliminarReporte = (id: number) => {
    console.log('Eliminando reporte ID:', id);
    setReportes(prev => prev.filter(reporte => reporte.id !== id));
  };

  const obtenerReporte = (id: number) => {
    return reportes.find(reporte => reporte.id === id);
  };

  const agregarHallazgo = (reporteId: number, hallazgo: Omit<HallazgoReporte, 'id' | 'numero'>) => {
    console.log('agregarHallazgo llamado con reporteId:', reporteId);
    console.log('hallazgo a agregar:', hallazgo);
    
    const reporte = reportes.find(r => r.id === reporteId);
    if (!reporte) {
      console.log('Error: No se encontró el reporte con ID:', reporteId);
      return;
    }

    console.log('Reporte encontrado:', reporte.titulo);
    console.log('Hallazgos actuales:', reporte.hallazgos.length);

    const nuevoNumero = Math.max(...reporte.hallazgos.map(h => h.numero), 0) + 1;
    const nuevoHallazgo: HallazgoReporte = {
      ...hallazgo,
      id: Math.max(...reporte.hallazgos.map(h => h.id), 0) + 1,
      numero: nuevoNumero,
    };

    console.log('Nuevo hallazgo creado:', nuevoHallazgo);

    setReportes(prev => prev.map(reporte => 
      reporte.id === reporteId 
        ? { ...reporte, hallazgos: [...reporte.hallazgos, nuevoHallazgo] }
        : reporte
    ));
    
    console.log('Hallazgo agregado exitosamente');
  };

  const editarHallazgo = (reporteId: number, hallazgoId: number, cambios: Partial<HallazgoReporte>) => {
    setReportes(prev => prev.map(reporte => 
      reporte.id === reporteId 
        ? { 
            ...reporte, 
            hallazgos: reporte.hallazgos.map(hallazgo => 
              hallazgo.id === hallazgoId ? { ...hallazgo, ...cambios } : hallazgo
            )
          }
        : reporte
    ));
  };

  const eliminarHallazgo = (reporteId: number, hallazgoId: number) => {
    setReportes(prev => prev.map(reporte => 
      reporte.id === reporteId 
        ? { ...reporte, hallazgos: reporte.hallazgos.filter(h => h.id !== hallazgoId) }
        : reporte
    ));
  };

  const limpiarTodosLosReportes = () => {
    console.log('Limpiando todos los informes');
    setReportes([]);
    // Limpiar también el localStorage
    localStorage.removeItem(STORAGE_KEY);
    console.log('localStorage limpiado');
  };

  // Función de debug para verificar el estado
  const debugEstado = () => {
    console.log('=== DEBUG ESTADO INFORMES ===');
    console.log('Informes en estado:', reportes.length);
    console.log('localStorage contenido:', localStorage.getItem(STORAGE_KEY));
    console.log('Flag inicializado:', localStorage.getItem(INIT_FLAG_KEY));
    console.log('===================');
  };

  const value: ReportesContextType = {
    reportes,
    isLoading,
    agregarReporte,
    editarReporte,
    eliminarReporte,
    obtenerReporte,
    agregarHallazgo,
    editarHallazgo,
    eliminarHallazgo,
    limpiarTodosLosReportes,
    debugEstado,
  };

  return (
    <ReportesContext.Provider value={value}>
      {children}
    </ReportesContext.Provider>
  );
};
