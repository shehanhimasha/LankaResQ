import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import { AuthProvider } from './context/AuthContext';
import { RequestProvider } from './context/RequestContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { UserProvider } from './context/UserContext';
import { ShelterProvider } from './context/ShelterContext';
import { NotificationProvider } from './context/NotificationContext';
import { DangerZoneProvider } from './context/DangerZoneContext';
import AppRoutes from './routes/AppRoutes';
import './App.css';

const AppContent = () => {
  const { isDarkMode } = useTheme();

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#D32F2F',
          colorLink: '#D32F2F',
          colorInfo: '#D32F2F',
        },
      }}
    >
      <BrowserRouter>
        <AuthProvider>
          <RequestProvider>
            <UserProvider>
              <ShelterProvider>
                <NotificationProvider>
                  <DangerZoneProvider>
                    <AppRoutes />
                  </DangerZoneProvider>
                </NotificationProvider>
              </ShelterProvider>
            </UserProvider>
          </RequestProvider>
        </AuthProvider>
      </BrowserRouter>
    </ConfigProvider>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
