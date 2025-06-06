
import React, { useState, useEffect } from 'react';

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  status: 'paid' | 'pending';
  createdAt: string;
}

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
  date: string;
  time: string;
}

const DebtorManager: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [debtors, setDebtors] = useState<Customer[]>([]);
  const [selectedDebtor, setSelectedDebtor] = useState<Customer | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const savedCustomers = JSON.parse(localStorage.getItem('fashionstore_customers') || '[]');
    const savedSales = JSON.parse(localStorage.getItem('fashionstore_sales') || '[]');
    
    setCustomers(savedCustomers);
    setSales(savedSales);
    
    const debtorCustomers = savedCustomers.filter((customer: Customer) => customer.status === 'pending');
    setDebtors(debtorCustomers);
  };

  const markAsPaid = (customerId: string) => {
    if (confirm('Marcar este cliente como pago?')) {
      const updatedCustomers = customers.map(customer =>
        customer.id === customerId
          ? { ...customer, status: 'paid' as 'paid' | 'pending' }
          : customer
      );
      
      localStorage.setItem('fashionstore_customers', JSON.stringify(updatedCustomers));
      setCustomers(updatedCustomers);
      
      const updatedDebtors = updatedCustomers.filter(customer => customer.status === 'pending');
      setDebtors(updatedDebtors);
      
      if (selectedDebtor?.id === customerId) {
        setSelectedDebtor(null);
      }
    }
  };

  const getCustomerDebt = (customerId: string) => {
    return sales
      .filter(sale => sale.customerId === customerId && sale.paymentMethod === 'fiado')
      .reduce((total, sale) => total + sale.total, 0);
  };

  const getCustomerSales = (customerId: string) => {
    return sales.filter(sale => sale.customerId === customerId && sale.paymentMethod === 'fiado');
  };

  const totalDebt = debtors.reduce((total, debtor) => total + getCustomerDebt(debtor.id), 0);

  const exportDebtorsList = () => {
    const csvContent = [
      ['Nome', 'Telefone', 'E-mail', 'Dívida Total', 'Data do Cadastro'].join(','),
      ...debtors.map(debtor => [
        debtor.name,
        debtor.phone,
        debtor.email || '',
        `R$ ${getCustomerDebt(debtor.id).toFixed(2)}`,
        new Date(debtor.createdAt).toLocaleDateString('pt-BR')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `devedores-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateDebtorReport = () => {
    // @ts-ignore
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text('RELATÓRIO DE DEVEDORES', 20, 30);
    
    doc.setFontSize(12);
    doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 20, 50);
    doc.text(`Total de Devedores: ${debtors.length}`, 20, 60);
    doc.text(`Valor Total em Dívidas: R$ ${totalDebt.toFixed(2)}`, 20, 70);

    let yPosition = 90;
    doc.setFontSize(14);
    doc.text('LISTA DE DEVEDORES:', 20, yPosition);
    yPosition += 15;

    doc.setFontSize(10);
    debtors.forEach((debtor) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 30;
      }

      const debt = getCustomerDebt(debtor.id);
      doc.text(`${debtor.name}`, 20, yPosition);
      doc.text(`Tel: ${debtor.phone}`, 20, yPosition + 8);
      doc.text(`Dívida: R$ ${debt.toFixed(2)}`, 120, yPosition);
      
      yPosition += 20;
    });

    doc.save(`relatorio-devedores-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Gerenciar Devedores</h2>
          <p className="text-gray-600">Controle de clientes com pagamentos pendentes</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportDebtorsList}
            className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200"
          >
            <i className="fas fa-download mr-2"></i>
            Exportar CSV
          </button>
          <button
            onClick={generateDebtorReport}
            className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200"
          >
            <i className="fas fa-file-pdf mr-2"></i>
            Relatório PDF
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-red-50 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 text-sm font-medium">Total de Devedores</p>
              <p className="text-3xl font-bold text-red-800">{debtors.length}</p>
            </div>
            <div className="bg-red-500 w-12 h-12 rounded-lg flex items-center justify-center">
              <i className="fas fa-exclamation-triangle text-white text-lg"></i>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium">Valor Total em Dívidas</p>
              <p className="text-3xl font-bold text-orange-800">R$ {totalDebt.toFixed(2)}</p>
            </div>
            <div className="bg-orange-500 w-12 h-12 rounded-lg flex items-center justify-center">
              <i className="fas fa-dollar-sign text-white text-lg"></i>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Dívida Média</p>
              <p className="text-3xl font-bold text-blue-800">
                R$ {debtors.length > 0 ? (totalDebt / debtors.length).toFixed(2) : '0.00'}
              </p>
            </div>
            <div className="bg-blue-500 w-12 h-12 rounded-lg flex items-center justify-center">
              <i className="fas fa-chart-line text-white text-lg"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de devedores */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Lista de Devedores</h3>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {debtors.map((debtor) => {
              const debt = getCustomerDebt(debtor.id);
              return (
                <div
                  key={debtor.id}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedDebtor?.id === debtor.id ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                  onClick={() => setSelectedDebtor(debtor)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {debtor.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800">{debtor.name}</h4>
                        <p className="text-sm text-gray-600">{debtor.phone}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600">R$ {debt.toFixed(2)}</p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsPaid(debtor.id);
                        }}
                        className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition-colors"
                      >
                        Marcar como Pago
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {debtors.length === 0 && (
            <div className="text-center py-12">
              <i className="fas fa-check-circle text-green-400 text-5xl mb-4"></i>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Nenhum devedor!</h3>
              <p className="text-gray-500">Todos os clientes estão em dia com os pagamentos</p>
            </div>
          )}
        </div>

        {/* Detalhes do devedor selecionado */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">
              {selectedDebtor ? 'Detalhes da Dívida' : 'Selecione um Devedor'}
            </h3>
          </div>
          
          {selectedDebtor ? (
            <div className="p-6">
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-2">{selectedDebtor.name}</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><i className="fas fa-phone mr-2"></i>{selectedDebtor.phone}</p>
                  {selectedDebtor.email && (
                    <p><i className="fas fa-envelope mr-2"></i>{selectedDebtor.email}</p>
                  )}
                  {selectedDebtor.address && (
                    <p><i className="fas fa-map-marker-alt mr-2"></i>{selectedDebtor.address}</p>
                  )}
                </div>
              </div>

              <div className="bg-red-50 p-4 rounded-lg mb-4">
                <p className="text-red-800 font-bold text-lg">
                  Total da Dívida: R$ {getCustomerDebt(selectedDebtor.id).toFixed(2)}
                </p>
              </div>

              <h5 className="font-medium text-gray-800 mb-3">Compras Fiadas:</h5>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {getCustomerSales(selectedDebtor.id).map((sale) => (
                  <div key={sale.id} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-800">{sale.productName}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(sale.date).toLocaleDateString('pt-BR')} - Qtd: {sale.quantity}
                        </p>
                      </div>
                      <p className="font-bold text-red-600">R$ {sale.total.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => markAsPaid(selectedDebtor.id)}
                className="w-full mt-4 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200"
              >
                <i className="fas fa-check mr-2"></i>
                Marcar como Pago
              </button>
            </div>
          ) : (
            <div className="p-12 text-center">
              <i className="fas fa-hand-pointer text-gray-400 text-5xl mb-4"></i>
              <p className="text-gray-500">Clique em um devedor para ver os detalhes</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DebtorManager;
