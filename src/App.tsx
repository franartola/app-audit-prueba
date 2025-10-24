import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { Box, CircularProgress } from '@mui/material';

// Componentes
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Auditorias from './pages/Auditorias';
import ListasVerificacion from './pages/ListasVerificacion';
import AnalisisDatos from './pages/AnalisisDatos';
import Muestreo from './pages/Muestreo';
import Reportes from './pages/Reportes';
import AccionesCorrectivas from './pages/AccionesCorrectivas';
import AdministracionTipos from './pages/AdministracionTipos';

// Contexto de autenticación
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuditoriaTiposProvider } from './contexts/AuditoriaTiposContext';
import { AuditoriasProvider } from './contexts/AuditoriasContext';
import { AccionesCorrectivasProvider } from './contexts/AccionesCorrectivasContext';
import { ListasVerificacionProvider } from './contexts/ListasVerificacionContext';
import { ReportesProvider } from './contexts/ReportesContext';

// Tema personalizado
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
  },
});

// Componente para rutas protegidas
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
        <CssBaseline />
        <AuthProvider>
          <AuditoriaTiposProvider>
            <AuditoriasProvider>
              <AccionesCorrectivasProvider>
                <ListasVerificacionProvider>
                  <ReportesProvider>
                    <Router>
                <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Dashboard />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/auditorias"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Auditorias />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/listas-verificacion"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <ListasVerificacion />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/analisis-datos"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <AnalisisDatos />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/muestreo"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Muestreo />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/reportes"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Reportes />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/acciones-correctivas"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <AccionesCorrectivas />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/administracion-tipos"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <AdministracionTipos />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                              </Routes>
                    </Router>
                  </ReportesProvider>
                </ListasVerificacionProvider>
              </AccionesCorrectivasProvider>
            </AuditoriasProvider>
          </AuditoriaTiposProvider>
          </AuthProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
