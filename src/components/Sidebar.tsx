
import React from 'react';

interface SidebarProps {
  isOpen: boolean;
  currentSection: string;
  onSectionChange: (section: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, currentSection, onSectionChange }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-tachometer-alt' },
    { id: 'products', label: 'Produtos', icon: 'fas fa-tags' },
    { id: 'sales', label: 'Vendas', icon: 'fas fa-shopping-cart' },
    { id: 'customers', label: 'Clientes', icon: 'fas fa-users' },
    { id: 'debtors', label: 'Devedores', icon: 'fas fa-exclamation-triangle' },
    { id: 'reports', label: 'Relatórios', icon: 'fas fa-chart-bar' },
  ];

  return (
    <div
      className={`fixed left-0 top-0 h-full bg-gradient-to-b from-gray-900 to-gray-800 shadow-2xl transition-all duration-300 z-40 ${
        isOpen ? 'w-64' : 'w-16'
      }`}
    >
      <div className="p-4">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 w-8 h-8 rounded-lg flex items-center justify-center">
            <i className="fas fa-store text-white text-sm"></i>
          </div>
          {isOpen && (
            <div>
              <h2 className="text-white font-bold text-lg">Fashion Store</h2>
              <p className="text-gray-400 text-xs">Sistema de Vendas</p>
            </div>
          )}
        </div>
      </div>

      <nav className="mt-8">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSectionChange(item.id)}
            className={`w-full flex items-center px-4 py-3 text-left transition-all duration-200 ${
              currentSection === item.id
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-r-4 border-pink-400'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <i className={`${item.icon} w-5 text-center`}></i>
            {isOpen && <span className="ml-3 font-medium">{item.label}</span>}
          </button>
        ))}
      </nav>

      {isOpen && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-gray-700 rounded-lg p-3">
            <p className="text-gray-300 text-xs">
              Versão 1.0
            </p>
            <p className="text-gray-400 text-xs">
              Sistema Offline
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
