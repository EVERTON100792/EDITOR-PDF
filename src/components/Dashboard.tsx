
import React, { useState, useEffect } from 'react';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalSales: 0,
    totalCustomers: 0,
    totalDebtors: 0,
    dailySales: 0,
    monthlySales: 0
  });

  useEffect(() => {
    updateStats();
  }, []);

  const updateStats = () => {
    const products = JSON.parse(localStorage.getItem('fashionstore_products') || '[]');
    const sales = JSON.parse(localStorage.getItem('fashionstore_sales') || '[]');
    const customers = JSON.parse(localStorage.getItem('fashionstore_customers') || '[]');
    
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    const dailySales = sales.filter((sale: any) => sale.date.startsWith(today));
    const monthlySales = sales.filter((sale: any) => sale.date.startsWith(currentMonth));
    
    const debtors = customers.filter((customer: any) => customer.status === 'pending');
    
    setStats({
      totalProducts: products.length,
      totalSales: sales.length,
      totalCustomers: customers.length,
      totalDebtors: debtors.length,
      dailySales: dailySales.reduce((sum: number, sale: any) => sum + sale.total, 0),
      monthlySales: monthlySales.reduce((sum: number, sale: any) => sum + sale.total, 0)
    });
  };

  const cards = [
    {
      title: 'Produtos Cadastrados',
      value: stats.totalProducts,
      icon: 'fas fa-tags',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Vendas Realizadas',
      value: stats.totalSales,
      icon: 'fas fa-shopping-cart',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Clientes Cadastrados',
      value: stats.totalCustomers,
      icon: 'fas fa-users',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Devedores',
      value: stats.totalDebtors,
      icon: 'fas fa-exclamation-triangle',
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Dashboard</h2>
        <p className="text-gray-600">Visão geral do sistema de vendas</p>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <div key={index} className={`${card.bgColor} rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">{card.title}</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{card.value}</p>
              </div>
              <div className={`bg-gradient-to-r ${card.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                <i className={`${card.icon} text-white text-lg`}></i>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cards de vendas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Vendas do Dia</h3>
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              Hoje
            </div>
          </div>
          <div className="text-3xl font-bold text-green-600">
            R$ {stats.dailySales.toFixed(2)}
          </div>
          <p className="text-gray-600 text-sm mt-2">
            Faturamento do dia atual
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Vendas do Mês</h3>
            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              Mensal
            </div>
          </div>
          <div className="text-3xl font-bold text-blue-600">
            R$ {stats.monthlySales.toFixed(2)}
          </div>
          <p className="text-gray-600 text-sm mt-2">
            Faturamento do mês atual
          </p>
        </div>
      </div>

      {/* Ações rápidas */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200">
            <i className="fas fa-plus text-xl mb-2"></i>
            <p className="font-medium">Novo Produto</p>
          </button>
          <button className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200">
            <i className="fas fa-shopping-cart text-xl mb-2"></i>
            <p className="font-medium">Nova Venda</p>
          </button>
          <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200">
            <i className="fas fa-user-plus text-xl mb-2"></i>
            <p className="font-medium">Novo Cliente</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
