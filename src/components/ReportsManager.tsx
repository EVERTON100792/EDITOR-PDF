
import React, { useState, useEffect } from 'react';

interface Sale {
  id: string;
  productId: string;
  productName: string;
  customerId: string;
  customerName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  paymentMethod: string;
  installments?: number;
  date: string;
  time: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

interface Customer {
  id: string;
  name: string;
  status: string;
}

const ReportsManager: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [dateFilter, setDateFilter] = useState('today');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const savedSales = JSON.parse(localStorage.getItem('fashionstore_sales') || '[]');
    const savedProducts = JSON.parse(localStorage.getItem('fashionstore_products') || '[]');
    const savedCustomers = JSON.parse(localStorage.getItem('fashionstore_customers') || '[]');
    
    setSales(savedSales);
    setProducts(savedProducts);
    setCustomers(savedCustomers);
  };

  const getFilteredSales = () => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    return sales.filter(sale => {
      const saleDate = sale.date.split('T')[0];
      
      switch (dateFilter) {
        case 'today':
          return saleDate === today;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          return saleDate >= weekAgo && saleDate <= today;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          return saleDate >= monthAgo && saleDate <= today;
        case 'custom':
          return (!customStartDate || saleDate >= customStartDate) && 
                 (!customEndDate || saleDate <= customEndDate);
        default:
          return true;
      }
    });
  };

  const filteredSales = getFilteredSales();
  
  const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
  const totalTransactions = filteredSales.length;
  const averageTicket = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

  const paymentMethodStats = filteredSales.reduce((acc: any, sale) => {
    acc[sale.paymentMethod] = (acc[sale.paymentMethod] || 0) + sale.total;
    return acc;
  }, {});

  const topProducts = Object.entries(
    filteredSales.reduce((acc: any, sale) => {
      if (!acc[sale.productId]) {
        acc[sale.productId] = {
          name: sale.productName,
          quantity: 0,
          revenue: 0
        };
      }
      acc[sale.productId].quantity += sale.quantity;
      acc[sale.productId].revenue += sale.total;
      return acc;
    }, {})
  )
  .map(([id, data]: [string, any]) => ({ id, ...data }))
  .sort((a, b) => b.revenue - a.revenue)
  .slice(0, 5);

  const exportSalesReport = () => {
    const csvContent = [
      ['Data', 'Hora', 'Cliente', 'Produto', 'Quantidade', 'Valor Unitário', 'Total', 'Pagamento'].join(','),
      ...filteredSales.map(sale => [
        new Date(sale.date).toLocaleDateString('pt-BR'),
        sale.time,
        sale.customerName,
        sale.productName,
        sale.quantity,
        `R$ ${sale.unitPrice.toFixed(2)}`,
        `R$ ${sale.total.toFixed(2)}`,
        sale.paymentMethod.toUpperCase()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio-vendas-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generatePDFReport = () => {
    // @ts-ignore
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text('RELATÓRIO DE VENDAS', 20, 30);
    
    doc.setFontSize(12);
    doc.text(`Período: ${getFilterPeriodText()}`, 20, 50);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 20, 60);

    doc.setFontSize(14);
    doc.text('RESUMO FINANCEIRO:', 20, 80);
    
    doc.setFontSize(12);
    doc.text(`Total de Vendas: ${totalTransactions}`, 20, 95);
    doc.text(`Faturamento Total: R$ ${totalRevenue.toFixed(2)}`, 20, 105);
    doc.text(`Ticket Médio: R$ ${averageTicket.toFixed(2)}`, 20, 115);

    let yPosition = 135;
    doc.setFontSize(14);
    doc.text('FORMAS DE PAGAMENTO:', 20, yPosition);
    yPosition += 15;

    doc.setFontSize(10);
    Object.entries(paymentMethodStats).forEach(([method, total]: [string, any]) => {
      doc.text(`${method.toUpperCase()}: R$ ${total.toFixed(2)}`, 20, yPosition);
      yPosition += 10;
    });

    yPosition += 10;
    doc.setFontSize(14);
    doc.text('TOP PRODUTOS:', 20, yPosition);
    yPosition += 15;

    doc.setFontSize(10);
    topProducts.forEach((product, index) => {
      doc.text(`${index + 1}. ${product.name}`, 20, yPosition);
      doc.text(`Qtd: ${product.quantity} | Receita: R$ ${product.revenue.toFixed(2)}`, 20, yPosition + 8);
      yPosition += 18;
    });

    doc.save(`relatorio-vendas-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const getFilterPeriodText = () => {
    switch (dateFilter) {
      case 'today':
        return 'Hoje';
      case 'week':
        return 'Últimos 7 dias';
      case 'month':
        return 'Últimos 30 dias';
      case 'custom':
        return `${customStartDate || 'Início'} até ${customEndDate || 'Hoje'}`;
      default:
        return 'Todos os períodos';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Relatórios</h2>
          <p className="text-gray-600">Análise de vendas e performance</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportSalesReport}
            className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200"
          >
            <i className="fas fa-download mr-2"></i>
            Exportar CSV
          </button>
          <button
            onClick={generatePDFReport}
            className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200"
          >
            <i className="fas fa-file-pdf mr-2"></i>
            Relatório PDF
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Filtros de Período</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="today">Hoje</option>
              <option value="week">Últimos 7 dias</option>
              <option value="month">Últimos 30 dias</option>
              <option value="custom">Período personalizado</option>
            </select>
          </div>
          
          {dateFilter === 'custom' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data Inicial</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data Final</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </>
          )}
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Período selecionado: <span className="font-medium">{getFilterPeriodText()}</span>
        </p>
      </div>

      {/* Resumo financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Faturamento Total</p>
              <p className="text-3xl font-bold">R$ {totalRevenue.toFixed(2)}</p>
            </div>
            <div className="bg-white/20 w-12 h-12 rounded-lg flex items-center justify-center">
              <i className="fas fa-dollar-sign text-white text-lg"></i>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total de Vendas</p>
              <p className="text-3xl font-bold">{totalTransactions}</p>
            </div>
            <div className="bg-white/20 w-12 h-12 rounded-lg flex items-center justify-center">
              <i className="fas fa-shopping-cart text-white text-lg"></i>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Ticket Médio</p>
              <p className="text-3xl font-bold">R$ {averageTicket.toFixed(2)}</p>
            </div>
            <div className="bg-white/20 w-12 h-12 rounded-lg flex items-center justify-center">
              <i className="fas fa-chart-line text-white text-lg"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Formas de pagamento e produtos mais vendidos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Formas de Pagamento</h3>
          <div className="space-y-3">
            {Object.entries(paymentMethodStats).map(([method, total]: [string, any]) => (
              <div key={method} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    method === 'pix' ? 'bg-green-500' :
                    method === 'cartao' ? 'bg-blue-500' :
                    method === 'dinheiro' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}></div>
                  <span className="font-medium text-gray-800">{method.toUpperCase()}</span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800">R$ {total.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">
                    {((total / totalRevenue) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top 5 Produtos</h3>
          <div className="space-y-3">
            {topProducts.map((product, index) => (
              <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{product.name}</p>
                    <p className="text-sm text-gray-600">Vendidos: {product.quantity}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800">R$ {product.revenue.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabela de vendas detalhada */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Vendas Detalhadas</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data/Hora</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qtd</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pagamento</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSales.slice().reverse().map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <p>{new Date(sale.date).toLocaleDateString('pt-BR')}</p>
                      <p className="text-gray-500">{sale.time}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {sale.customerName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {sale.productName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {sale.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                    R$ {sale.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      sale.paymentMethod === 'fiado' ? 'bg-red-100 text-red-800' :
                      sale.paymentMethod === 'pix' ? 'bg-green-100 text-green-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {sale.paymentMethod.toUpperCase()}
                      {sale.installments && sale.installments > 1 && ` ${sale.installments}x`}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSales.length === 0 && (
          <div className="text-center py-12">
            <i className="fas fa-chart-bar text-gray-400 text-5xl mb-4"></i>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Nenhuma venda encontrada</h3>
            <p className="text-gray-500">Não há vendas no período selecionado</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsManager;
