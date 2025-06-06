
import React, { useState, useEffect } from 'react';
import LoginScreen from '../components/LoginScreen';
import Dashboard from '../components/Dashboard';
import ProductManager from '../components/ProductManager';
import SalesManager from '../components/SalesManager';
import CustomerManager from '../components/CustomerManager';
import DebtorManager from '../components/DebtorManager';
import ReportsManager from '../components/ReportsManager';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentSection, setCurrentSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    // Verificar se já está logado
    const loginStatus = localStorage.getItem('fashionstore_logged_in');
    if (loginStatus === 'true') {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (username: string, password: string) => {
    if (username === 'admin' && password === '1234') {
      setIsLoggedIn(true);
      localStorage.setItem('fashionstore_logged_in', 'true');
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('fashionstore_logged_in');
    setCurrentSection('dashboard');
  };

  const renderContent = () => {
    switch (currentSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'products':
        return <ProductManager />;
      case 'sales':
        return <SalesManager />;
      case 'customers':
        return <CustomerManager />;
      case 'debtors':
        return <DebtorManager />;
      case 'reports':
        return <ReportsManager />;
      default:
        return <Dashboard />;
    }
  };

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="flex">
        <Sidebar 
          isOpen={sidebarOpen}
          currentSection={currentSection}
          onSectionChange={setCurrentSection}
        />
        
        <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
          <Header 
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            onLogout={handleLogout}
          />
          
          <main className="p-6">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Index;
