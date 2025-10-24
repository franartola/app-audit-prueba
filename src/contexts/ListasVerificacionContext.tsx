import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export interface ElementoVerificacion {
  id: number;
  descripcion: string;
  cumplimiento: boolean;
  observaciones: string;
  evidencia: string;
}

export interface Hallazgo {
  id: number;
  numero: number;
  descripcion: string;
  severidad: 'Alto' | 'Medio' | 'Bajo';
  recomendacion: string;
}

export interface ListaVerificacion {
  id: number;
  nombre: string;
  categoria: string;
  descripcion: string;
  auditoriaId: number | null;
  auditoriaNombre: string | null;
  elementos: ElementoVerificacion[];
  hallazgos: Hallazgo[];
  fechaCreacion: Date;
  estado: string;
  observaciones?: string;
  recomendaciones?: string;
}

interface ListasVerificacionContextType {
  listas: ListaVerificacion[];
  isLoading: boolean;
  agregarLista: (lista: Omit<ListaVerificacion, 'id' | 'fechaCreacion'>) => void;
  editarLista: (id: number, lista: Partial<ListaVerificacion>) => void;
  eliminarLista: (id: number) => void;
  obtenerLista: (id: number) => ListaVerificacion | undefined;
  agregarElemento: (listaId: number, elemento: Omit<ElementoVerificacion, 'id'>) => void;
  editarElemento: (listaId: number, elementoId: number, elemento: Partial<ElementoVerificacion>) => void;
  eliminarElemento: (listaId: number, elementoId: number) => void;
  agregarHallazgo: (listaId: number, hallazgo: Omit<Hallazgo, 'id' | 'numero'>) => void;
  editarHallazgo: (listaId: number, hallazgoId: number, hallazgo: Partial<Hallazgo>) => void;
  eliminarHallazgo: (listaId: number, hallazgoId: number) => void;
  toggleCumplimiento: (listaId: number, elementoId: number) => void;
  limpiarTodasLasListas: () => void;
  restaurarDatosIniciales: () => void;
  limpiarRegistroEliminados: () => void;
  debugEstado: () => void;
}

const ListasVerificacionContext = createContext<ListasVerificacionContextType | undefined>(undefined);

const STORAGE_KEY = 'listas_verificacion';
const INIT_FLAG_KEY = 'listas_verificacion_initialized';
const DELETED_ITEMS_KEY = 'listas_verificacion_deleted_items';

// Datos iniciales (solo para la primera vez)
const listasIniciales: ListaVerificacion[] = [
  {
    id: 1,
    nombre: 'Lista de Verificación de Seguridad',
    categoria: 'Seguridad',
    descripcion: 'Checklist para auditorías de seguridad informática',
    auditoriaId: 1,
    auditoriaNombre: 'Auditoría de Seguridad Informática',
    fechaCreacion: new Date('2024-01-01'),
    estado: 'Activa',
    elementos: [
      {
        id: 1,
        descripcion: '¿Existen políticas de contraseñas?',
        cumplimiento: true,
        observaciones: 'Políticas implementadas correctamente',
        evidencia: 'Documento de políticas',
      },
      {
        id: 2,
        descripcion: '¿Se realizan backups regulares?',
        cumplimiento: false,
        observaciones: 'Falta programación automática',
        evidencia: 'Reporte de backups',
      },
    ],
    hallazgos: [
      {
        id: 1,
        numero: 1,
        descripcion: 'Falta de políticas de respaldo automático',
        severidad: 'Medio',
        recomendacion: 'Implementar sistema de respaldo automático con notificaciones',
      },
    ],
    observaciones: 'Se encontraron vulnerabilidades críticas en el sistema de autenticación. Los logs de acceso no están siendo monitoreados adecuadamente. Se requiere implementar autenticación de dos factores.',
    recomendaciones: 'Implementar autenticación de dos factores en todos los sistemas críticos. Establecer un sistema de monitoreo de logs en tiempo real. Realizar auditorías de seguridad trimestrales. Capacitar al personal en mejores prácticas de seguridad.',
  },
  {
    id: 2,
    nombre: 'Lista de Verificación de RRHH',
    categoria: 'Recursos Humanos',
    descripcion: 'Checklist para auditorías de procesos de RRHH',
    auditoriaId: 2,
    auditoriaNombre: 'Auditoría de Recursos Humanos',
    fechaCreacion: new Date('2024-01-02'),
    estado: 'Activa',
    elementos: [
      {
        id: 1,
        descripcion: '¿Existen políticas de contratación?',
        cumplimiento: true,
        observaciones: 'Políticas claras y documentadas',
        evidencia: 'Manual de políticas',
      },
    ],
    hallazgos: [],
    observaciones: 'Se identificaron expedientes incompletos en el 15% del personal. Los procesos de contratación no siguen completamente las políticas establecidas. Falta documentación de evaluaciones de desempeño.',
    recomendaciones: 'Completar todos los expedientes faltantes en un plazo de 30 días. Revisar y actualizar los procesos de contratación para asegurar cumplimiento. Implementar un sistema de seguimiento de evaluaciones de desempeño. Capacitar al personal de RRHH en las políticas actualizadas.',
  },
];

export const useListasVerificacion = () => {
  const context = useContext(ListasVerificacionContext);
  if (!context) {
    throw new Error('useListasVerificacion debe ser usado dentro de un ListasVerificacionProvider');
  }
  return context;
};

interface ListasVerificacionProviderProps {
  children: ReactNode;
}

export const ListasVerificacionProvider: React.FC<ListasVerificacionProviderProps> = ({ children }) => {
  const [listas, setListas] = useState<ListaVerificacion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Función para guardar en localStorage
  const saveToStorage = (data: ListaVerificacion[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      console.log('Listas guardadas en localStorage:', data.length);
    } catch (error) {
      console.error('Error al guardar en localStorage:', error);
    }
  };

  // Función para cargar desde localStorage
  const loadFromStorage = (): ListaVerificacion[] | null => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Convertir fechas de string a Date
        const listasConFechas = parsed.map((lista: any) => ({
          ...lista,
          fechaCreacion: new Date(lista.fechaCreacion),
          elementos: lista.elementos.map((elemento: any) => ({
            ...elemento,
          })),
          hallazgos: lista.hallazgos.map((hallazgo: any) => ({
            ...hallazgo,
          })),
        }));
        console.log('Listas cargadas desde localStorage:', listasConFechas.length);
        return listasConFechas;
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

  // Función para obtener elementos eliminados
  const getDeletedItems = (): number[] => {
    try {
      const deleted = localStorage.getItem(DELETED_ITEMS_KEY);
      return deleted ? JSON.parse(deleted) : [];
    } catch (error) {
      console.error('Error al cargar elementos eliminados:', error);
      return [];
    }
  };

  // Función para marcar elemento como eliminado
  const markAsDeleted = (id: number) => {
    const deletedItems = getDeletedItems();
    if (!deletedItems.includes(id)) {
      deletedItems.push(id);
      localStorage.setItem(DELETED_ITEMS_KEY, JSON.stringify(deletedItems));
      console.log('Elemento marcado como eliminado:', id);
    }
  };

  // Función para filtrar datos iniciales (excluir eliminados)
  const getFilteredInitialData = useCallback((): ListaVerificacion[] => {
    const deletedItems = getDeletedItems();
    return listasIniciales.filter(lista => !deletedItems.includes(lista.id));
  }, []);

  // Inicialización
  useEffect(() => {
    console.log('Inicializando ListasVerificacionContext...');
    
    const savedListas = loadFromStorage();
    
    if (savedListas && savedListas.length > 0) {
      // Hay datos guardados, usarlos
      console.log('Usando listas guardadas:', savedListas.length);
      setListas(savedListas);
    } else if (isFirstTime()) {
      // Es la primera vez, usar listas iniciales (sin filtrar)
      console.log('Primera vez, usando listas iniciales:', listasIniciales.length);
      setListas(listasIniciales);
      markAsInitialized();
      saveToStorage(listasIniciales);
    } else {
      // No es la primera vez y no hay datos - esto indica un problema
      // Restaurar solo datos iniciales que NO fueron eliminados por el admin
      const filteredData = getFilteredInitialData();
      console.log('Detectado problema: flag inicializado pero sin datos. Restaurando datos no eliminados...');
      console.log('Datos iniciales totales:', listasIniciales.length);
      console.log('Datos eliminados por admin:', getDeletedItems());
      console.log('Datos a restaurar:', filteredData.length);
      
      if (filteredData.length > 0) {
        setListas(filteredData);
        saveToStorage(filteredData);
      } else {
        // Si todos los datos iniciales fueron eliminados, mantener vacío
        console.log('Todos los datos iniciales fueron eliminados por el admin. Manteniendo vacío.');
        setListas([]);
      }
    }
    
    setIsLoading(false);
  }, [getFilteredInitialData]);

  // Guardar automáticamente cuando cambien las listas
  useEffect(() => {
    if (!isLoading) {
      saveToStorage(listas);
    }
  }, [listas, isLoading]);

  const agregarLista = (nuevaLista: Omit<ListaVerificacion, 'id' | 'fechaCreacion'>) => {
    const lista: ListaVerificacion = {
      ...nuevaLista,
      id: Math.max(...listas.map(l => l.id), 0) + 1,
      fechaCreacion: new Date(),
    };
    console.log('Agregando lista:', lista.nombre);
    setListas(prev => [...prev, lista]);
  };

  const editarLista = (id: number, cambios: Partial<ListaVerificacion>) => {
    console.log('Editando lista ID:', id);
    setListas(prev => prev.map(lista => 
      lista.id === id ? { ...lista, ...cambios } : lista
    ));
  };

  const eliminarLista = (id: number) => {
    console.log('Eliminando lista ID:', id);
    // Marcar como eliminado para que no se restaure
    markAsDeleted(id);
    setListas(prev => prev.filter(lista => lista.id !== id));
  };

  const obtenerLista = (id: number) => {
    return listas.find(lista => lista.id === id);
  };

  const agregarElemento = (listaId: number, elemento: Omit<ElementoVerificacion, 'id'>) => {
    const nuevoElemento: ElementoVerificacion = {
      ...elemento,
      id: Math.max(...listas.find(l => l.id === listaId)?.elementos.map(e => e.id) || [0], 0) + 1,
    };
    setListas(prev => prev.map(lista => 
      lista.id === listaId 
        ? { ...lista, elementos: [...lista.elementos, nuevoElemento] }
        : lista
    ));
  };

  const editarElemento = (listaId: number, elementoId: number, cambios: Partial<ElementoVerificacion>) => {
    setListas(prev => prev.map(lista => 
      lista.id === listaId 
        ? { 
            ...lista, 
            elementos: lista.elementos.map(elemento => 
              elemento.id === elementoId ? { ...elemento, ...cambios } : elemento
            )
          }
        : lista
    ));
  };

  const eliminarElemento = (listaId: number, elementoId: number) => {
    setListas(prev => prev.map(lista => 
      lista.id === listaId 
        ? { ...lista, elementos: lista.elementos.filter(e => e.id !== elementoId) }
        : lista
    ));
  };

  const agregarHallazgo = (listaId: number, hallazgo: Omit<Hallazgo, 'id' | 'numero'>) => {
    const lista = listas.find(l => l.id === listaId);
    if (!lista) return;

    const nuevoNumero = Math.max(...lista.hallazgos.map(h => h.numero), 0) + 1;
    const nuevoHallazgo: Hallazgo = {
      ...hallazgo,
      id: Math.max(...lista.hallazgos.map(h => h.id), 0) + 1,
      numero: nuevoNumero,
    };

    setListas(prev => prev.map(lista => 
      lista.id === listaId 
        ? { ...lista, hallazgos: [...lista.hallazgos, nuevoHallazgo] }
        : lista
    ));
  };

  const editarHallazgo = (listaId: number, hallazgoId: number, cambios: Partial<Hallazgo>) => {
    setListas(prev => prev.map(lista => 
      lista.id === listaId 
        ? { 
            ...lista, 
            hallazgos: lista.hallazgos.map(hallazgo => 
              hallazgo.id === hallazgoId ? { ...hallazgo, ...cambios } : hallazgo
            )
          }
        : lista
    ));
  };

  const eliminarHallazgo = (listaId: number, hallazgoId: number) => {
    setListas(prev => prev.map(lista => 
      lista.id === listaId 
        ? { ...lista, hallazgos: lista.hallazgos.filter(h => h.id !== hallazgoId) }
        : lista
    ));
  };

  const toggleCumplimiento = (listaId: number, elementoId: number) => {
    setListas(prev => prev.map(lista => 
      lista.id === listaId 
        ? { 
            ...lista, 
            elementos: lista.elementos.map(elemento => 
              elemento.id === elementoId 
                ? { ...elemento, cumplimiento: !elemento.cumplimiento }
                : elemento
            )
          }
        : lista
    ));
  };

  const limpiarTodasLasListas = () => {
    console.log('Limpiando todas las listas');
    setListas([]);
    // Limpiar también el localStorage, flag y registro de eliminados
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(INIT_FLAG_KEY);
    localStorage.removeItem(DELETED_ITEMS_KEY);
    console.log('localStorage, flag y registro de eliminados limpiados');
  };

  const restaurarDatosIniciales = () => {
    console.log('Restaurando datos iniciales...');
    const filteredData = getFilteredInitialData();
    console.log('Datos iniciales totales:', listasIniciales.length);
    console.log('Datos eliminados por admin:', getDeletedItems());
    console.log('Datos a restaurar:', filteredData.length);
    
    setListas(filteredData);
    saveToStorage(filteredData);
    markAsInitialized();
    console.log('Datos iniciales restaurados (solo no eliminados)');
  };

  const limpiarRegistroEliminados = () => {
    console.log('Limpiando registro de elementos eliminados...');
    localStorage.removeItem(DELETED_ITEMS_KEY);
    console.log('Registro de eliminados limpiado');
  };

  // Función de debug para verificar el estado
  const debugEstado = () => {
    console.log('=== DEBUG ESTADO LISTAS ===');
    console.log('Listas en estado:', listas.length);
    console.log('localStorage contenido:', localStorage.getItem(STORAGE_KEY));
    console.log('Flag inicializado:', localStorage.getItem(INIT_FLAG_KEY));
    console.log('Elementos eliminados por admin:', getDeletedItems());
    console.log('Datos iniciales totales:', listasIniciales.length);
    console.log('Datos iniciales disponibles:', getFilteredInitialData().length);
    console.log('===================');
  };

  const value: ListasVerificacionContextType = {
    listas,
    isLoading,
    agregarLista,
    editarLista,
    eliminarLista,
    obtenerLista,
    agregarElemento,
    editarElemento,
    eliminarElemento,
    agregarHallazgo,
    editarHallazgo,
    eliminarHallazgo,
    toggleCumplimiento,
    limpiarTodasLasListas,
    restaurarDatosIniciales,
    limpiarRegistroEliminados,
    debugEstado,
  };

  return (
    <ListasVerificacionContext.Provider value={value}>
      {children}
    </ListasVerificacionContext.Provider>
  );
};
