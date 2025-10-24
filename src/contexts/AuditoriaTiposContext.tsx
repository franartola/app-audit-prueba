import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface TipoAuditoria {
  id: number;
  nombre: string;
  descripcion: string;
  color: string;
  activo: boolean;
  fechaCreacion: Date;
}

interface AuditoriaTiposContextType {
  tipos: TipoAuditoria[];
  isLoading: boolean;
  agregarTipo: (tipo: Omit<TipoAuditoria, 'id' | 'fechaCreacion'>) => void;
  editarTipo: (id: number, tipo: Partial<TipoAuditoria>) => void;
  eliminarTipo: (id: number) => void;
  toggleActivo: (id: number) => void;
  getTiposActivos: () => TipoAuditoria[];
  limpiarTodosLosTipos: () => void;
  debugEstado: () => void;
}

const AuditoriaTiposContext = createContext<AuditoriaTiposContextType | undefined>(undefined);

// Tipos de auditoría iniciales (solo para la primera vez)
const tiposIniciales: TipoAuditoria[] = [
  {
    id: 1,
    nombre: 'Seguridad',
    descripcion: 'Auditorías relacionadas con seguridad informática y física',
    color: '#1976d2',
    activo: true,
    fechaCreacion: new Date('2024-01-01'),
  },
  {
    id: 2,
    nombre: 'Recursos Humanos',
    descripcion: 'Auditorías de procesos de RRHH y cumplimiento laboral',
    color: '#dc004e',
    activo: true,
    fechaCreacion: new Date('2024-01-01'),
  },
  {
    id: 3,
    nombre: 'Finanzas',
    descripcion: 'Auditorías financieras y de control interno',
    color: '#388e3c',
    activo: true,
    fechaCreacion: new Date('2024-01-01'),
  },
  {
    id: 4,
    nombre: 'Operaciones',
    descripcion: 'Auditorías de procesos operativos y de producción',
    color: '#f57c00',
    activo: true,
    fechaCreacion: new Date('2024-01-01'),
  },
  {
    id: 5,
    nombre: 'Calidad',
    descripcion: 'Auditorías de sistemas de gestión de calidad',
    color: '#7b1fa2',
    activo: true,
    fechaCreacion: new Date('2024-01-01'),
  },
  {
    id: 6,
    nombre: 'Ambiental',
    descripcion: 'Auditorías de cumplimiento ambiental y sostenibilidad',
    color: '#388e3c',
    activo: false,
    fechaCreacion: new Date('2024-01-01'),
  },
];

const STORAGE_KEY = 'auditoria_tipos';
const INIT_FLAG_KEY = 'auditoria_tipos_initialized';

export const AuditoriaTiposProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tipos, setTipos] = useState<TipoAuditoria[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Función para guardar en localStorage
  const saveToStorage = (data: TipoAuditoria[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      console.log('Tipos guardados en localStorage:', data.length);
    } catch (error) {
      console.error('Error al guardar en localStorage:', error);
    }
  };

  // Función para cargar desde localStorage
  const loadFromStorage = (): TipoAuditoria[] | null => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Convertir fechas de string a Date
        const tiposConFechas = parsed.map((tipo: any) => ({
          ...tipo,
          fechaCreacion: new Date(tipo.fechaCreacion),
        }));
        console.log('Tipos cargados desde localStorage:', tiposConFechas.length);
        return tiposConFechas;
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
    console.log('Inicializando AuditoriaTiposContext...');
    
    const savedTipos = loadFromStorage();
    
    if (savedTipos && savedTipos.length > 0) {
      // Hay datos guardados, usarlos
      console.log('Usando tipos guardados:', savedTipos.length);
      setTipos(savedTipos);
    } else if (isFirstTime()) {
      // Es la primera vez, usar tipos iniciales
      console.log('Primera vez, usando tipos iniciales:', tiposIniciales.length);
      setTipos(tiposIniciales);
      markAsInitialized();
      saveToStorage(tiposIniciales);
    } else {
      // No es la primera vez y no hay datos, mantener vacío
      console.log('No es primera vez y no hay datos, manteniendo vacío');
      setTipos([]);
    }
    
    setIsLoading(false);
  }, []);

  // Guardar automáticamente cuando cambien los tipos
  useEffect(() => {
    if (!isLoading) {
      saveToStorage(tipos);
    }
  }, [tipos, isLoading]);

  const agregarTipo = (nuevoTipo: Omit<TipoAuditoria, 'id' | 'fechaCreacion'>) => {
    const tipo: TipoAuditoria = {
      ...nuevoTipo,
      id: Math.max(...tipos.map(t => t.id), 0) + 1,
      fechaCreacion: new Date(),
    };
    console.log('Agregando tipo:', tipo.nombre);
    setTipos(prev => [...prev, tipo]);
  };

  const editarTipo = (id: number, cambios: Partial<TipoAuditoria>) => {
    console.log('Editando tipo ID:', id);
    setTipos(prev => prev.map(tipo => 
      tipo.id === id ? { ...tipo, ...cambios } : tipo
    ));
  };

  const eliminarTipo = (id: number) => {
    console.log('Eliminando tipo ID:', id);
    setTipos(prev => prev.filter(tipo => tipo.id !== id));
  };

  const toggleActivo = (id: number) => {
    console.log('Toggle activo tipo ID:', id);
    setTipos(prev => prev.map(tipo => 
      tipo.id === id ? { ...tipo, activo: !tipo.activo } : tipo
    ));
  };

  const getTiposActivos = () => {
    return tipos.filter(tipo => tipo.activo);
  };

  const limpiarTodosLosTipos = () => {
    console.log('Limpiando todos los tipos');
    setTipos([]);
    // Limpiar también el localStorage
    localStorage.removeItem(STORAGE_KEY);
    console.log('localStorage limpiado');
  };

  // Función de debug para verificar el estado
  const debugEstado = () => {
    console.log('=== DEBUG ESTADO ===');
    console.log('Tipos en estado:', tipos.length);
    console.log('localStorage contenido:', localStorage.getItem(STORAGE_KEY));
    console.log('Flag inicializado:', localStorage.getItem(INIT_FLAG_KEY));
    console.log('===================');
  };

  const value: AuditoriaTiposContextType = {
    tipos,
    isLoading,
    agregarTipo,
    editarTipo,
    eliminarTipo,
    toggleActivo,
    getTiposActivos,
    limpiarTodosLosTipos,
    debugEstado,
  };

  return (
    <AuditoriaTiposContext.Provider value={value}>
      {children}
    </AuditoriaTiposContext.Provider>
  );
};

export const useAuditoriaTipos = (): AuditoriaTiposContextType => {
  const context = useContext(AuditoriaTiposContext);
  if (context === undefined) {
    throw new Error('useAuditoriaTipos must be used within an AuditoriaTiposProvider');
  }
  return context;
};
