import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { CompanyProvider } from './context/CompanyContext';
import { DepartmentProvider } from './context/DepartmentContext';
import { AppRoutes } from './routes/AppRoutes';
import { LanguageProvider } from './context/LanguageContext';

import { NotificationProvider } from './context/NotificationContext';
import { UrgentAlertModal } from './components/notifications/UrgentAlertModal';
import { NotificationToast } from './components/notifications/NotificationToast';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <LanguageProvider>
          <AuthProvider>
            <CompanyProvider>
              <DepartmentProvider>
                <NotificationProvider>
                  <AppRoutes />
                  <UrgentAlertModal />
                  <NotificationToast />
                </NotificationProvider>
              </DepartmentProvider>
            </CompanyProvider>
          </AuthProvider>
        </LanguageProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
