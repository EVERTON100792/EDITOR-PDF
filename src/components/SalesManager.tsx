
import React, { useState, useEffect } from 'react';

interface Product {
  id: string;
  code: string;
  name: string;
  price: number;
  stock: number;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  status: string;
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
  installments?: number;
  date: string;
  time: string;
}

const SalesManager: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    productId: '',
    customerId: '',
    quantity: '1',
    paymentMethod: 'pix',
    installments: '1'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const savedProducts = JSON.parse(localStorage.getItem('fashionstore_products') || '[]');
    const savedCustomers = JSON.parse(localStorage.getItem('fashionstore_customers') || '[]');
    const savedSales = JSON.parse(localStorage.getItem('fashionstore_sales') || '[]');
    
    setProducts(savedProducts);
    setCustomers(savedCustomers);
    setSales(savedSales);
  };

  const selectedProduct = products.find(p => p.id === formData.productId);
  const selectedCustomer = customers.find(c => c.id === formData.customerId);
  const quantity = parseInt(formData.quantity) || 0;
  const total = selectedProduct ? selectedProduct.price * quantity : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProduct || !selectedCustomer) {
      alert('Selecione um produto e um cliente');
      return;
    }

    if (quantity > selectedProduct.stock) {
      alert('Quantidade maior que o estoque disponível');
      return;
    }

    const sale: Sale = {
      id: Date.now().toString(),
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      quantity,
      unitPrice: selectedProduct.price,
      total,
      paymentMethod: formData.paymentMethod,
      installments: formData.paymentMethod === 'cartao' ? parseInt(formData.installments) : undefined,
      date: new Date().toISOString(),
      time: new Date().toLocaleTimeString('pt-BR')
    };

    // Salvar venda
    const updatedSales = [...sales, sale];
    localStorage.setItem('fashionstore_sales', JSON.stringify(updatedSales));
    setSales(updatedSales);

    // Atualizar estoque
    const updatedProducts = products.map(p => 
      p.id === selectedProduct.id 
        ? { ...p, stock: p.stock - quantity }
        : p
    );
    localStorage.setItem('fashionstore_products', JSON.stringify(updatedProducts));
    setProducts(updatedProducts);

    // Atualizar status do cliente se for fiado
    if (formData.paymentMethod === 'fiado') {
      const updatedCustomers = customers.map(c =>
        c.id === selectedCustomer.id
          ? { ...c, status: 'pending' }
          : c
      );
      localStorage.setItem('fashionstore_customers', JSON.stringify(updatedCustomers));
      setCustomers(updatedCustomers);
    }

    // Gerar recibo
    generateReceipt(sale);

    // Reset form
    setFormData({
      productId: '',
      customerId: '',
      quantity: '1',
      paymentMethod: 'pix',
      installments: '1'
    });
    setShowForm(false);
  };

  const generateReceipt = (sale: Sale) => {
    // @ts-ignore
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text('FASHION STORE', 20, 30);
    doc.setFontSize(16);
    doc.text('RECIBO DE VENDA', 20, 45);

    doc.setFontSize(12);
    doc.text(`Data: ${new Date(sale.date).toLocaleDateString('pt-BR')}`, 20, 65);
    doc.text(`Hora: ${sale.time}`, 20, 75);
    doc.text(`Recibo #${sale.id}`, 20, 85);

    doc.text('DADOS DO CLIENTE:', 20, 105);
    doc.text(`Nome: ${sale.customerName}`, 20, 115);

    doc.text('DADOS DO PRODUTO:', 20, 135);
    doc.text(`Produto: ${sale.productName}`, 20, 145);
    doc.text(`Quantidade: ${sale.quantity}`, 20, 155);
    doc.text(`Valor unitário: R$ ${sale.unitPrice.toFixed(2)}`, 20, 165);

    doc.text('PAGAMENTO:', 20, 185);
    doc.text(`Forma de pagamento: ${sale.paymentMethod.toUpperCase()}`, 20, 195);
    if (sale.installments && sale.installments > 1) {
      doc.text(`Parcelado em: ${sale.installments}x`, 20, 205);
    }

    doc.setFontSize(16);
    doc.text(`TOTAL: R$ ${sale.total.toFixed(2)}`, 20, 225);

    doc.save(`recibo-${sale.id}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Gerenciar Vendas</h2>
          <p className="text-gray-600">Registre suas vendas</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200"
        >
          <i className="fas fa-plus mr-2"></i>
          Nova Venda
        </button>
      </div>

      {/* Formulário de venda */}
      {showForm && (
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Nova Venda</h3>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Produto</label>
                <select
                  value={formData.productId}
                  onChange={(e) => setFormData({...formData, productId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                >
                  <option value="">Selecione um produto</option>
                  {products.filter(p => p.stock > 0).map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} - R$ {product.price.toFixed(2)} (Estoque: {product.stock})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                <select
                  value={formData.customerId}
                  onChange={(e) => setFormData({...formData, customerId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                >
                  <option value="">Selecione um cliente</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade</label>
                <input
                  type="number"
                  min="1"
                  max={selectedProduct?.stock || 1}
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Forma de Pagamento</label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="pix">PIX</option>
                  <option value="cartao">Cartão de Crédito</option>
                  <option value="dinheiro">Dinheiro</option>
                  <option value="fiado">Fiado</option>
                </select>
              </div>

              {formData.paymentMethod === 'cartao' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Parcelas</label>
                  <select
                    value={formData.installments}
                    onChange={(e) => setFormData({...formData, installments: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    {Array.from({length: 10}, (_, i) => i + 1).map(num => (
                      <option key={num} value={num}>{num}x</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Resumo da venda */}
            {selectedProduct && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">Resumo da Venda</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Produto:</span>
                    <span>{selectedProduct.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Valor unitário:</span>
                    <span>R$ {selectedProduct.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Quantidade:</span>
                    <span>{quantity}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>R$ {total.toFixed(2)}</span>
                  </div>
                  {formData.paymentMethod === 'cartao' && parseInt(formData.installments) > 1 && (
                    <div className="flex justify-between text-blue-600">
                      <span>Valor da parcela:</span>
                      <span>R$ {(total / parseInt(formData.installments)).toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-2 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200"
              >
                Finalizar Venda
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de vendas */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Vendas Realizadas</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qtd</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pagamento</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sales.slice().reverse().map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(sale.date).toLocaleDateString('pt-BR')}
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => generateReceipt(sale)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <i className="fas fa-download mr-1"></i>
                      Recibo
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sales.length === 0 && (
          <div className="text-center py-12">
            <i className="fas fa-shopping-cart text-gray-400 text-5xl mb-4"></i>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Nenhuma venda realizada</h3>
            <p className="text-gray-500">Registre sua primeira venda</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesManager;
