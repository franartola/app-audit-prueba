import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface AccionCorrectiva {
  id: number;
  titulo: string;
  descripcion: string;
  auditoriaId: number;
  auditoriaNombre: string;
  hallazgoRelacionado: string;
  responsable: string;
  prioridad: 'Alta' | 'Media' | 'Baja';
  estado: 'Pendiente' | 'En Proceso' | 'Regularizada' | 'Verificada';
  fechaCreacion: Date;
  fechaLimite: Date;
  fechaCompletado?: Date;
  progreso: number;
  observaciones: string;
  hallazgoDescripcion: string;
  recursos: string;
  comentarios: string;
}

interface AccionesCorrectivasContextType {
  accionesCorrectivas: AccionCorrectiva[];
  isLoading: boolean;
  agregarAccionCorrectiva: (accion: Omit<AccionCorrectiva, 'id' | 'fechaCreacion'>) => void;
  editarAccionCorrectiva: (id: number, accion: Partial<AccionCorrectiva>) => void;
  eliminarAccionCorrectiva: (id: number) => void;
  obtenerAccionCorrectiva: (id: number) => AccionCorrectiva | undefined;
  limpiarTodasLasAcciones: () => void;
  debugEstado: () => void;
}

const AccionesCorrectivasContext = createContext<AccionesCorrectivasContextType | undefined>(undefined);

const STORAGE_KEY = 'acciones_correctivas';
const INIT_FLAG_KEY = 'acciones_correctivas_initialized';

// Datos iniciales (solo para la primera vez)
const accionesIniciales: AccionCorrectiva[] = [
  {
    id: 1,
    titulo: 'Implementar políticas de contraseñas',
    descripcion: 'Establecer políticas robustas de contraseñas para todos los sistemas',
    auditoriaId: 1,
    auditoriaNombre: 'Auditoría de Seguridad Informática',
    hallazgoRelacionado: 'Falta de políticas de contraseñas',
    responsable: 'Departamento de TI',
    prioridad: 'Alta',
    estado: 'En Proceso',
    fechaCreacion: new Date('2024-01-15'),
    fechaLimite: new Date('2024-03-15'),
    progreso: 60,
    observaciones: 'Se han definido las políticas, pendiente implementación',
    hallazgoDescripcion: 'Falta de políticas de contraseñas',
    recursos: 'Equipo de desarrollo, proveedor de 2FA',
    comentarios: 'Se ha completado la configuración en sistemas principales',
  },
  {
    id: 2,
    titulo: 'Actualizar procedimientos de RRHH',
    descripcion: 'Revisar y actualizar todos los procedimientos del departamento de RRHH',
    auditoriaId: 2,
    auditoriaNombre: 'Auditoría de Recursos Humanos',
    hallazgoRelacionado: 'Procedimientos desactualizados',
    responsable: 'Departamento de RRHH',
    prioridad: 'Media',
    estado: 'Pendiente',
    fechaCreacion: new Date('2024-01-20'),
    fechaLimite: new Date('2024-04-20'),
    progreso: 0,
    observaciones: 'En espera de aprobación de la dirección',
    hallazgoDescripcion: 'Procedimientos de contratación desactualizados',
    recursos: 'Equipo de RRHH, asesoría legal',
    comentarios: 'En espera de aprobación de la dirección',
  },
  {
    id: 3,
    titulo: 'Establecer proceso de verificación de backups',
    descripcion: 'Crear procedimiento para verificar regularmente la integridad de los backups',
    auditoriaId: 1,
    auditoriaNombre: 'Auditoría de Seguridad Informática',
    hallazgoRelacionado: 'Backups no verificados regularmente',
    responsable: 'Departamento de TI',
    prioridad: 'Media',
    estado: 'Regularizada',
    fechaCreacion: new Date('2024-01-20'),
    fechaLimite: new Date('2024-02-15'),
    fechaCompletado: new Date('2024-02-10'),
    progreso: 100,
    observaciones: 'Proceso implementado y documentado',
    hallazgoDescripcion: 'Backups no verificados regularmente',
    recursos: 'Personal de operaciones',
    comentarios: 'Proceso implementado y documentado',
  },
];

export const useAccionesCorrectivas = () => {
  const context = useContext(AccionesCorrectivasContext);
  if (!context) {
    throw new Error('useAccionesCorrectivas debe ser usado dentro de un AccionesCorrectivasProvider');
  }
  return context;
};

interface AccionesCorrectivasProviderProps {
  children: ReactNode;
}

export const AccionesCorrectivasProvider: React.FC<AccionesCorrectivasProviderProps> = ({ children }) => {
  const [accionesCorrectivas, setAccionesCorrectivas] = useState<AccionCorrectiva[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Función para guardar en localStorage
  const saveToStorage = (data: AccionCorrectiva[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      console.log('Seguimientos de observaciones guardados en localStorage:', data.length);
    } catch (error) {
      console.error('Error al guardar en localStorage:', error);
    }
  };

  // Función para cargar desde localStorage
  const loadFromStorage = (): AccionCorrectiva[] | null => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Convertir fechas de string a Date
        const accionesConFechas = parsed.map((accion: any) => ({
          ...accion,
          fechaCreacion: new Date(accion.fechaCreacion),
          fechaLimite: new Date(accion.fechaLimite),
          fechaCompletado: accion.fechaCompletado ? new Date(accion.fechaCompletado) : undefined,
        }));
        console.log('Seguimientos de observaciones cargados desde localStorage:', accionesConFechas.length);
        return accionesConFechas;
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
    console.log('Inicializando AccionesCorrectivasContext...');
    
    const savedAcciones = loadFromStorage();
    
    if (savedAcciones && savedAcciones.length > 0) {
      // Hay datos guardados, usarlos
      console.log('Usando seguimientos de observaciones guardados:', savedAcciones.length);
      setAccionesCorrectivas(savedAcciones);
    } else if (isFirstTime()) {
      // Es la primera vez, usar acciones iniciales
      console.log('Primera vez, usando seguimientos iniciales:', accionesIniciales.length);
      setAccionesCorrectivas(accionesIniciales);
      markAsInitialized();
      saveToStorage(accionesIniciales);
    } else {
      // No es la primera vez y no hay datos, mantener vacío
      console.log('No es primera vez y no hay datos, manteniendo vacío');
      setAccionesCorrectivas([]);
    }
    
    setIsLoading(false);
  }, []);

  // Guardar automáticamente cuando cambien los seguimientos de observaciones
  useEffect(() => {
    if (!isLoading) {
      saveToStorage(accionesCorrectivas);
    }
  }, [accionesCorrectivas, isLoading]);

  const agregarAccionCorrectiva = (accion: Omit<AccionCorrectiva, 'id' | 'fechaCreacion'>) => {
    const nuevaAccion: AccionCorrectiva = {
      ...accion,
      id: Math.max(...accionesCorrectivas.map(a => a.id), 0) + 1,
      fechaCreacion: new Date(),
    };
    console.log('Agregando acción correctiva:', nuevaAccion.titulo);
    setAccionesCorrectivas(prev => [...prev, nuevaAccion]);
  };

  const editarAccionCorrectiva = (id: number, accion: Partial<AccionCorrectiva>) => {
    console.log('Editando acción correctiva ID:', id);
    setAccionesCorrectivas(prev => prev.map(a => 
      a.id === id ? { ...a, ...accion } : a
    ));
  };

  const eliminarAccionCorrectiva = (id: number) => {
    console.log('Eliminando acción correctiva ID:', id);
    setAccionesCorrectivas(prev => prev.filter(a => a.id !== id));
  };

  const obtenerAccionCorrectiva = (id: number) => {
    return accionesCorrectivas.find(a => a.id === id);
  };

  const limpiarTodasLasAcciones = () => {
    console.log('Limpiando todos los seguimientos de observaciones');
    setAccionesCorrectivas([]);
    // Limpiar también el localStorage
    localStorage.removeItem(STORAGE_KEY);
    console.log('localStorage limpiado');
  };

  // Función de debug para verificar el estado
  const debugEstado = () => {
    console.log('=== DEBUG ESTADO SEGUIMIENTO DE OBSERVACIONES ===');
    console.log('Seguimientos de observaciones en estado:', accionesCorrectivas.length);
    console.log('localStorage contenido:', localStorage.getItem(STORAGE_KEY));
    console.log('Flag inicializado:', localStorage.getItem(INIT_FLAG_KEY));
    console.log('===================');
  };

  const value: AccionesCorrectivasContextType = {
    accionesCorrectivas,
    isLoading,
    agregarAccionCorrectiva,
    editarAccionCorrectiva,
    eliminarAccionCorrectiva,
    obtenerAccionCorrectiva,
    limpiarTodasLasAcciones,
    debugEstado,
  };

  return (
    <AccionesCorrectivasContext.Provider value={value}>
      {children}
    </AccionesCorrectivasContext.Provider>
  );
};
