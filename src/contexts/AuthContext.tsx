import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  role: 'admin' | 'auditor' | 'supervisor';
  permissions: string[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Usuarios de ejemplo para demostración
const mockUsers: User[] = [
  {
    id: 1,
    username: 'admin',
    name: 'Administrador',
    email: 'admin@empresa.com',
    role: 'admin',
    permissions: ['all'],
  },
  {
    id: 2,
    username: 'auditor1',
    name: 'Juan Pérez',
    email: 'juan.perez@empresa.com',
    role: 'auditor',
    permissions: ['auditorias', 'listas', 'reportes', 'acciones'],
  },
  {
    id: 3,
    username: 'supervisor1',
    name: 'María García',
    email: 'maria.garcia@empresa.com',
    role: 'supervisor',
    permissions: ['auditorias', 'reportes', 'acciones'],
  },
];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verificar si hay un usuario guardado en localStorage al cargar
  useEffect(() => {
    const savedUser = localStorage.getItem('auditoria_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } catch (e) {
        localStorage.removeItem('auditoria_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Buscar usuario en la lista de usuarios válidos
      const foundUser = mockUsers.find(u => u.username === username);
      
      if (foundUser && password === '123456') { // Contraseña simple para demo
        setUser(foundUser);
        localStorage.setItem('auditoria_user', JSON.stringify(foundUser));
        return true;
      } else {
        setError('Usuario o contraseña incorrectos');
        return false;
      }
    } catch (err) {
      setError('Error al iniciar sesión. Intenta nuevamente.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setError(null);
    localStorage.removeItem('auditoria_user');
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    error,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};



