import React, { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { AuthPage } from './components/AuthPage';
import { Navbar } from './components/layout/Navbar';
import { SellerDashboard } from './components/dashboard/SellerDashboard';
import { BuyerDashboard } from './components/dashboard/BuyerDashboard';
import { ZRADashboard } from './components/dashboard/ZRADashboard';
import { AuthProvider, useAuth } from './hooks/useAuth';

const AppContent: React.FC = () => {
  const [showAuth, setShowAuth] = useState(false);
  const { user, logout } = useAuth();

  const handleGetStarted = () => {
    setShowAuth(true);
  };

  const handleLogout = () => {
    logout();
    setShowAuth(false);
  };

  const handleBackToHome = () => {
    setShowAuth(false);
  };

  const renderDashboard = () => {
    switch (user?.role) {
      case 'seller':
        return <SellerDashboard />;
      case 'buyer':
        return <BuyerDashboard />;
      case 'zra_officer':
        return <ZRADashboard />;
      default:
        return null;
    }
  };

  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
        <Navbar
          userRole={user.role}
          userName={user.name}
          onLogout={handleLogout}
        />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderDashboard()}
        </main>
      </div>
    );
  }

  if (showAuth) {
    return <AuthPage onBack={handleBackToHome} />;
  }

  return <LandingPage onGetStarted={handleGetStarted} />;
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;