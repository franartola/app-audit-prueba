import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Auditoria {
  id: number;
  nombre: string;
  tipo: string;
  planAuditoria: number;
  fechaInicio: Date;
  fechaFin: Date;
  auditor: string;
  estado: string;
  descripcion: string;
  alcance: string;
  facultadDependencia: string;
  procedimientos: string;
  observaciones?: string;
  recomendaciones?: string;
}

interface AuditoriasContextType {
  auditorias: Auditoria[];
  isLoading: boolean;
  agregarAuditoria: (auditoria: Omit<Auditoria, 'id'>) => void;
  editarAuditoria: (id: number, auditoria: Partial<Auditoria>) => void;
  eliminarAuditoria: (id: number) => void;
  obtenerAuditoria: (id: number) => Auditoria | undefined;
  limpiarTodasLasAuditorias: () => void;
  debugEstado: () => void;
}

const AuditoriasContext = createContext<AuditoriasContextType | undefined>(undefined);

const STORAGE_KEY = 'auditorias';
const INIT_FLAG_KEY = 'auditorias_initialized';

// Datos iniciales (solo para la primera vez)
const auditoriasIniciales: Auditoria[] = [
  {
    id: 1,
    nombre: 'Auditoría de Seguridad Informática',
    tipo: 'Seguridad',
    planAuditoria: 2024,
    fechaInicio: new Date('2024-01-15'),
    fechaFin: new Date('2024-01-20'),
    auditor: 'Juan Pérez',
    estado: 'Completada',
    descripcion: 'Auditoría de seguridad de sistemas informáticos',
    alcance: 'Departamento de TI',
    facultadDependencia: 'Facultad de Ingeniería',
    procedimientos: 'Revisión de políticas de seguridad, análisis de vulnerabilidades, pruebas de penetración, revisión de logs de acceso.',
    observaciones: 'Se encontraron vulnerabilidades críticas en el sistema de autenticación. Los logs de acceso no están siendo monitoreados adecuadamente. Se requiere implementar autenticación de dos factores.',
    recomendaciones: 'Implementar autenticación de dos factores en todos los sistemas críticos. Establecer un sistema de monitoreo de logs en tiempo real. Realizar auditorías de seguridad trimestrales. Capacitar al personal en mejores prácticas de seguridad.',
  },
  {
    id: 2,
    nombre: 'Auditoría de Recursos Humanos',
    tipo: 'Recursos Humanos',
    planAuditoria: 2024,
    fechaInicio: new Date('2024-01-10'),
    fechaFin: new Date('2024-01-25'),
    auditor: 'María García',
    estado: 'En Proceso',
    descripcion: 'Auditoría de procesos de RRHH',
    alcance: 'Departamento de RRHH',
    facultadDependencia: 'Facultad de Ciencias Administrativas',
    procedimientos: 'Revisión de expedientes de personal, verificación de cumplimiento laboral, análisis de procesos de contratación, revisión de políticas de RRHH.',
    observaciones: 'Se identificaron expedientes incompletos en el 15% del personal. Los procesos de contratación no siguen completamente las políticas establecidas. Falta documentación de evaluaciones de desempeño.',
    recomendaciones: 'Completar todos los expedientes faltantes en un plazo de 30 días. Revisar y actualizar los procesos de contratación para asegurar cumplimiento. Implementar un sistema de seguimiento de evaluaciones de desempeño. Capacitar al personal de RRHH en las políticas actualizadas.',
  },
];

export const useAuditorias = () => {
  const context = useContext(AuditoriasContext);
  if (!context) {
    throw new Error('useAuditorias debe ser usado dentro de un AuditoriasProvider');
  }
  return context;
};

interface AuditoriasProviderProps {
  children: ReactNode;
}

export const AuditoriasProvider: React.FC<AuditoriasProviderProps> = ({ children }) => {
  const [auditorias, setAuditorias] = useState<Auditoria[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Función para guardar en localStorage
  const saveToStorage = (data: Auditoria[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      console.log('Auditorías guardadas en localStorage:', data.length);
    } catch (error) {
      console.error('Error al guardar en localStorage:', error);
    }
  };

  // Función para cargar desde localStorage
  const loadFromStorage = (): Auditoria[] | null => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Convertir fechas de string a Date
        const auditoriasConFechas = parsed.map((auditoria: any) => ({
          ...auditoria,
          fechaInicio: new Date(auditoria.fechaInicio),
          fechaFin: new Date(auditoria.fechaFin),
        }));
        console.log('Auditorías cargadas desde localStorage:', auditoriasConFechas.length);
        return auditoriasConFechas;
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
    console.log('Inicializando AuditoriasContext...');
    
    const savedAuditorias = loadFromStorage();
    
    if (savedAuditorias && savedAuditorias.length > 0) {
      // Hay datos guardados, usarlos
      console.log('Usando auditorías guardadas:', savedAuditorias.length);
      setAuditorias(savedAuditorias);
    } else if (isFirstTime()) {
      // Es la primera vez, usar auditorías iniciales
      console.log('Primera vez, usando auditorías iniciales:', auditoriasIniciales.length);
      setAuditorias(auditoriasIniciales);
      markAsInitialized();
      saveToStorage(auditoriasIniciales);
    } else {
      // No es la primera vez y no hay datos, mantener vacío
      console.log('No es primera vez y no hay datos, manteniendo vacío');
      setAuditorias([]);
    }
    
    setIsLoading(false);
  }, []);

  // Guardar automáticamente cuando cambien las auditorías
  useEffect(() => {
    if (!isLoading) {
      saveToStorage(auditorias);
    }
  }, [auditorias, isLoading]);

  const agregarAuditoria = (auditoria: Omit<Auditoria, 'id'>) => {
    const nuevaAuditoria: Auditoria = {
      ...auditoria,
      id: Math.max(...auditorias.map(a => a.id), 0) + 1,
    };
    console.log('Agregando auditoría:', nuevaAuditoria.nombre);
    setAuditorias(prev => [...prev, nuevaAuditoria]);
  };

  const editarAuditoria = (id: number, auditoria: Partial<Auditoria>) => {
    console.log('Editando auditoría ID:', id);
    setAuditorias(prev => prev.map(a => 
      a.id === id ? { ...a, ...auditoria } : a
    ));
  };

  const eliminarAuditoria = (id: number) => {
    console.log('Eliminando auditoría ID:', id);
    setAuditorias(prev => prev.filter(a => a.id !== id));
  };

  const obtenerAuditoria = (id: number) => {
    return auditorias.find(a => a.id === id);
  };

  const limpiarTodasLasAuditorias = () => {
    console.log('Limpiando todas las auditorías');
    setAuditorias([]);
    // Limpiar también el localStorage
    localStorage.removeItem(STORAGE_KEY);
    console.log('localStorage limpiado');
  };

  // Función de debug para verificar el estado
  const debugEstado = () => {
    console.log('=== DEBUG ESTADO AUDITORÍAS ===');
    console.log('Auditorías en estado:', auditorias.length);
    console.log('localStorage contenido:', localStorage.getItem(STORAGE_KEY));
    console.log('Flag inicializado:', localStorage.getItem(INIT_FLAG_KEY));
    console.log('===================');
  };

  const value: AuditoriasContextType = {
    auditorias,
    isLoading,
    agregarAuditoria,
    editarAuditoria,
    eliminarAuditoria,
    obtenerAuditoria,
    limpiarTodasLasAuditorias,
    debugEstado,
  };

  return (
    <AuditoriasContext.Provider value={value}>
      {children}
    </AuditoriasContext.Provider>
  );
};
