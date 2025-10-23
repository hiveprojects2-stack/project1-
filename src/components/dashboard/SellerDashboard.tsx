import React, { useState } from 'react';
import { Plus, Package, TrendingUp, DollarSign, AlertTriangle, Eye, CreditCard as Edit, Trash2, ShoppingCart, Minus, MessageCircle, Calendar, Download, BarChart3, ChevronUp, ChevronDown } from 'lucide-react';
import { StatCard } from './StatCard';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { ChatSystem } from './ChatSystem';
import QRCode from 'qrcode';
import { Button } from "@/components/ui/button";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  vatPercentage: number;
  stock: number;
  isActive: boolean;
}

interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  vatAmount: number;
  totalPrice: number;
}

export const SellerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'products' | 'sales' | 'compliance'>('products');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [qrCode, setQrCode] = useState<string>('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentFormData, setPaymentFormData] = useState({
    network: '',
    phoneNumber: '',
    bankName: '',
    accountNumber: '',
    accountHolder: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });
  const [paymentErrors, setPaymentErrors] = useState<any>({});

  const [products, setProducts] = useState<Product[]>([
    { id: '1', name: 'Cooking Oil 2L', category: 'Groceries', price: 45.00, vatPercentage: 16, stock: 50, isActive: true },
    { id: '2', name: 'Sugar 1kg', category: 'Groceries', price: 25.00, vatPercentage: 16, stock: 30, isActive: true },
    { id: '3', name: 'Rice 5kg', category: 'Groceries', price: 85.00, vatPercentage: 16, stock: 20, isActive: true },
    { id: '4', name: 'Phone Repair Service', category: 'Services', price: 150.00, vatPercentage: 5, stock: 999, isActive: true }
  ]);

  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    price: '',
    vatPercentage: 16,
    stock: ''
  });

  const stats = [
    { title: 'Monthly Revenue', value: 'ZMW 15,420', icon: DollarSign, color: 'green' as const, trend: { value: 12, isPositive: true } },
    { title: 'Products Listed', value: products.length.toString(), icon: Package, color: 'blue' as const },
    { title: 'Total Sales', value: '156', icon: TrendingUp, color: 'purple' as const, trend: { value: 8, isPositive: true } },
    { title: 'Compliance Status', value: 'Good', icon: AlertTriangle, color: 'orange' as const }
  ];

  const businessCategories = [
    { name: 'Shop/Retail Store', tax: 16 },
    { name: 'SME (Small/Medium Enterprise)', tax: 3 },
    { name: 'Service Provider', tax: 5 },
    { name: 'Small Business', tax: 5 },
    { name: 'Restaurant/Food Service', tax: 16 },
    { name: 'Manufacturing', tax: 16 },
    { name: 'Technology/IT Services', tax: 5 },
    { name: 'Healthcare Services', tax: 5 },
    { name: 'Other', tax: 16 }
  ];

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.category || !newProduct.price || !newProduct.stock) {
      alert('Please fill in all required fields');
      return;
    }

    const product: Product = {
      id: Date.now().toString(),
      name: newProduct.name,
      category: newProduct.category,
      price: parseFloat(newProduct.price),
      vatPercentage: newProduct.vatPercentage,
      stock: parseInt(newProduct.stock),
      isActive: true
    };

    setProducts(prev => [...prev, product]);
    setNewProduct({ name: '', category: '', price: '', vatPercentage: 16, stock: '' });
    setShowAddProduct(false);
    alert('Product added successfully!');
  };

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.productId === product.id);
    
    if (existingItem) {
      setCart(prev => prev.map(item => 
        item.productId === product.id 
          ? {
              ...item,
              quantity: item.quantity + 1,
              vatAmount: (item.quantity + 1) * item.unitPrice * (product.vatPercentage / 100),
              totalPrice: (item.quantity + 1) * item.unitPrice
            }
          : item
      ));
    } else {
      const newItem: CartItem = {
        productId: product.id,
        productName: product.name,
        quantity: 1,
        unitPrice: product.price,
        vatAmount: product.price * (product.vatPercentage / 100),
        totalPrice: product.price
      };
      setCart(prev => [...prev, newItem]);
    }
  };

  const updateCartQuantity = (productId: string, change: number) => {
    setCart(prev => prev.map(item => {
      if (item.productId === productId) {
        const newQuantity = Math.max(0, item.quantity + change);
        if (newQuantity === 0) {
          return null;
        }
        return {
          ...item,
          quantity: newQuantity,
          vatAmount: newQuantity * item.unitPrice * (getProductVatRate(productId) / 100),
          totalPrice: newQuantity * item.unitPrice
        };
      }
      return item;
    }).filter(Boolean) as CartItem[]);
  };

  const getProductVatRate = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return product?.vatPercentage || 16;
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const generateTransaction = async () => {
    if (cart.length === 0) {
      alert('Cart is empty');
      return;
    }

    const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
    const totalVat = cart.reduce((sum, item) => sum + item.vatAmount, 0);
    const total = subtotal + totalVat;

    const transactionData = {
      code: `HTX-${Date.now()}`,
      items: cart,
      subtotal: subtotal.toFixed(2),
      vatAmount: totalVat.toFixed(2),
      total: total.toFixed(2),
      timestamp: new Date().toISOString()
    };

    try {
      const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(transactionData));
      setQrCode(qrCodeDataURL);
      alert(`Transaction generated! Code: ${transactionData.code}`);
    } catch (error) {
      console.error('Error generating QR code:', error);
      alert('Error generating QR code');
    }
  };

  const clearCart = () => {
    setCart([]);
    setQrCode('');
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      vatPercentage: product.vatPercentage,
      stock: product.stock.toString()
    });
    setShowEditModal(true);
  };

  const saveEditedProduct = () => {
    if (!editingProduct || !newProduct.name || !newProduct.category || !newProduct.price || !newProduct.stock) {
      alert('Please fill in all required fields');
      return;
    }

    setProducts(prev => prev.map(p =>
      p.id === editingProduct.id
        ? {
            ...p,
            name: newProduct.name,
            category: newProduct.category,
            price: parseFloat(newProduct.price),
            vatPercentage: newProduct.vatPercentage,
            stock: parseInt(newProduct.stock)
          }
        : p
    ));

    setShowEditModal(false);
    setEditingProduct(null);
    setNewProduct({ name: '', category: '', price: '', vatPercentage: 16, stock: '' });
    alert('Product updated successfully!');
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      setProducts(prev => prev.filter(p => p.id !== productId));
      alert('Product deleted successfully!');
    }
  };

  const handlePaymentMethodSelect = (method: string) => {
    setSelectedPaymentMethod(method);
    setShowPaymentForm(true);
    setPaymentFormData({
      network: '',
      phoneNumber: '',
      bankName: '',
      accountNumber: '',
      accountHolder: '',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardholderName: ''
    });
    setPaymentErrors({});
  };

  const handlePaymentFormChange = (field: string, value: string) => {
    setPaymentFormData(prev => ({ ...prev, [field]: value }));
    if (paymentErrors[field]) {
      setPaymentErrors((prev: any) => ({ ...prev, [field]: '' }));
    }
  };

  const validatePaymentForm = () => {
    const errors: any = {};

    if (selectedPaymentMethod === 'Mobile Money') {
      if (!paymentFormData.network) errors.network = 'Please select a network';
      if (!paymentFormData.phoneNumber) errors.phoneNumber = 'Phone number is required';
      else if (!/^(097|096|095|077|076)\d{7}$/.test(paymentFormData.phoneNumber.replace(/\s/g, ''))) {
        errors.phoneNumber = 'Please enter a valid Zambian phone number';
      }
    } else if (selectedPaymentMethod === 'Bank Transfer') {
      if (!paymentFormData.bankName) errors.bankName = 'Please select a bank';
      if (!paymentFormData.accountNumber) errors.accountNumber = 'Account number is required';
      if (!paymentFormData.accountHolder) errors.accountHolder = 'Account holder name is required';
    } else if (selectedPaymentMethod === 'Card Payment') {
      if (!paymentFormData.cardNumber) errors.cardNumber = 'Card number is required';
      else if (!/^\d{16}$/.test(paymentFormData.cardNumber.replace(/\s/g, ''))) {
        errors.cardNumber = 'Please enter a valid 16-digit card number';
      }
      if (!paymentFormData.expiryDate) errors.expiryDate = 'Expiry date is required';
      if (!paymentFormData.cvv) errors.cvv = 'CVV is required';
      if (!paymentFormData.cardholderName) errors.cardholderName = 'Cardholder name is required';
    }

    setPaymentErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const processPayment = () => {
    if (!validatePaymentForm()) return;

    const taxAmount = 2504.70;

    setTimeout(() => {
      alert(`Payment of ZMW ${taxAmount.toFixed(2)} processed successfully via ${selectedPaymentMethod}. Receipt generated and sent to ZRA.`);
      setShowPaymentForm(false);
      setSelectedPaymentMethod('');
      setShowPaymentModal(false);
      downloadReceipt();
    }, 2000);
  };

  const downloadReceipt = () => {
    const receiptContent = `
HIVE.TAX - TAX PAYMENT RECEIPT
================================

Payment Date: ${new Date().toLocaleString()}
Transaction ID: HTX-TAX-${Date.now()}

BUSINESS INFORMATION
--------------------
Business Name: Your Business Name
TPIN: ZM123456789
Payment Period: January 2024

TAX PAYMENT DETAILS
-------------------
Gross Sales: ZMW 15,420.00
VAT Collected (16%): ZMW 2,467.20
Service VAT (5%): ZMW 37.50
--------------------
Total VAT Paid: ZMW 2,504.70

PAYMENT METHOD
--------------
Method: ${selectedPaymentMethod}
Status: CONFIRMED
Payment Reference: PAY-${Date.now()}

RECIPIENT
---------
Zambia Revenue Authority (ZRA)
Tax Collection Account
Bank of Zambia

This is an official tax payment receipt.
Please keep this for your records.

Generated by Hive.Tax Platform
For inquiries, contact ZRA
    `;

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tax-payment-receipt-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadTaxReport = () => {
    const reportContent = `
HIVE.TAX - SELLER TAX REPORT
=============================

Report Generated: ${new Date().toLocaleString()}
Report ID: SELLER-RPT-${Date.now()}

BUSINESS INFORMATION
--------------------
Business Name: Your Business Name
TPIN: ZM123456789
Reporting Period: January 2024

TAX SUMMARY
-----------
Monthly Revenue: ZMW 15,420.00
Products Listed: ${products.length}
Total Sales: 156 transactions

TAX BREAKDOWN
-------------
Gross Sales: ZMW 15,420.00
VAT Collected (16%): ZMW 2,467.20
Service VAT (5%): ZMW 37.50
--------------------
Total VAT Due: ZMW 2,504.70

PRODUCTS
--------
${products.map(p => `${p.name} - ${p.category} - ZMW ${p.price.toFixed(2)} (VAT: ${p.vatPercentage}%)`).join('\n')}

COMPLIANCE STATUS
-----------------
Status: Good
All tax obligations are up to date
Last Payment: January 15, 2024
Next Due: February 15, 2024

This is an official tax report for your records.
Generated by Hive.Tax Platform
    `;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seller-tax-report-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const zambiaBanks = [
    'Zanaco Bank',
    'First National Bank (FNB)',
    'Stanbic Bank',
    'Standard Chartered Bank',
    'Absa Bank Zambia',
    'Citibank Zambia',
    'Atlas Mara Bank',
    'Indo Zambia Bank',
    'Access Bank Zambia',
    'United Bank for Africa (UBA)',
    'Bank of China Zambia'
  ];

  const mobileNetworks = [
    { name: 'MTN Mobile Money', prefix: '097' },
    { name: 'Airtel Money', prefix: '097/096/077' },
    { name: 'Zamtel Kwacha', prefix: '095/076' }
  ];

  const cartTotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const cartVat = cart.reduce((sum, item) => sum + item.vatAmount, 0);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Navigation Tabs */}
      <Card>
        <CardContent className="p-0">
          <div className="flex border-b">
            {[
              { id: 'products', label: 'Product Management', icon: Package },
              { id: 'sales', label: 'Sales & Transactions', icon: TrendingUp },
              { id: 'compliance', label: 'Tax Compliance', icon: AlertTriangle }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center space-x-2 py-4 px-6 font-semibold transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={18} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Tab Content */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          {/* Product Management Header */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">Product Management</h3>
                <div className="flex space-x-3">
                  <Button onClick={() => setShowCart(true)} icon={ShoppingCart} variant="outline">
                    Cart ({cart.length})
                  </Button>
                  <Button onClick={() => setShowAddProduct(true)} icon={Plus}>
                    Add Product
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Products List */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-3">
                {products.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex-1 flex items-center space-x-6">
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-800">{product.name}</h4>
                        <p className="text-sm text-gray-600">{product.category}</p>
                      </div>
                      <div className="flex items-center space-x-6 text-sm">
                        <div>
                          <p className="text-gray-500 text-xs">Price</p>
                          <p className="font-semibold text-green-600">ZMW {product.price.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">VAT</p>
                          <p className="font-semibold text-gray-700">{product.vatPercentage}%</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">Stock</p>
                          <p className="font-semibold text-gray-700">{product.stock}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <Button size="sm" onClick={() => addToCart(product)}>
                        Add to Cart
                      </Button>
                      <Button size="sm" variant="outline" icon={Edit} onClick={() => handleEditProduct(product)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" icon={Trash2} className="text-red-600" onClick={() => handleDeleteProduct(product.id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
                {products.length === 0 && (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">No products yet</p>
                    <p className="text-sm text-gray-500">Add your first product to get started</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'sales' && (
        <Card>
          <CardHeader>
            <h3 className="text-xl font-bold text-gray-800">Sales & Transaction History</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { id: '1', date: '2024-01-15', items: 'Cooking Oil, Sugar', total: 'ZMW 85.00', vat: 'ZMW 13.60', status: 'Completed' },
                { id: '2', date: '2024-01-14', items: 'Rice, Phone Repair', total: 'ZMW 235.00', vat: 'ZMW 21.10', status: 'Completed' },
                { id: '3', date: '2024-01-13', items: 'Sugar x3', total: 'ZMW 75.00', vat: 'ZMW 12.00', status: 'Pending' }
              ].map((sale) => (
                <div key={sale.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-semibold text-gray-800">{sale.items}</p>
                    <p className="text-sm text-gray-600">{sale.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800">{sale.total}</p>
                    <p className="text-sm text-gray-500">VAT: {sale.vat}</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      sale.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {sale.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'compliance' && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">Tax Compliance Status</h3>
              <Button onClick={() => setShowChat(true)} icon={MessageCircle} variant="outline">
                Contact ZRA
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-green-800">Compliance Status: Good</h4>
                    <p className="text-sm text-green-700">All tax obligations are up to date</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="font-semibold text-green-800">Monthly VAT</p>
                    <p className="text-green-700">ZMW 2,467.20 (Paid)</p>
                  </div>
                  <div>
                    <p className="font-semibold text-green-800">Last Payment</p>
                    <p className="text-green-700">January 15, 2024</p>
                  </div>
                  <div>
                    <p className="font-semibold text-green-800">Next Due</p>
                    <p className="text-green-700">February 15, 2024</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                <h4 className="font-bold text-blue-800 mb-3">Monthly Tax Summary</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Gross Sales:</span>
                    <span className="font-semibold text-blue-900">ZMW 15,420.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">VAT Collected (16%):</span>
                    <span className="font-semibold text-blue-900">ZMW 2,467.20</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Service VAT (5%):</span>
                    <span className="font-semibold text-blue-900">ZMW 37.50</span>
                  </div>
                  <div className="border-t border-blue-300 pt-2 flex justify-between">
                    <span className="font-semibold text-blue-800">Total VAT Due:</span>
                    <span className="font-bold text-blue-900">ZMW 2,504.70</span>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200">
                <h4 className="font-bold text-yellow-800 mb-3">Payment Instructions</h4>
                <div className="space-y-2 text-sm text-yellow-700">
                  <p><strong>Why pay taxes?</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Legal compliance requirement for all registered businesses</li>
                    <li>Contributes to national infrastructure and public services</li>
                    <li>Maintains good standing with ZRA</li>
                    <li>Avoids penalties and legal consequences</li>
                  </ul>
                  <p className="mt-3"><strong>How to pay:</strong></p>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>Click "Pay Tax Now" button below</li>
                    <li>Choose your preferred payment method</li>
                    <li>Enter payment details accurately</li>
                    <li>Confirm payment and receive instant receipt</li>
                    <li>Download and save receipt for your records</li>
                  </ol>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button icon={Download} variant="outline" onClick={downloadTaxReport}>
                  Download Tax Report
                </Button>
                <Button onClick={() => setShowPaymentModal(true)} className="bg-green-600 hover:bg-green-700">
                  Pay Tax Now (ZMW 2,504.70)
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Product Modal */}
      {showAddProduct && (
        <Card className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Add New Product</h3>
              <Button variant="outline" size="sm" onClick={() => setShowAddProduct(false)}>
                ×
              </Button>
            </div>
            
            <div className="space-y-4">
              <Input
                label="Product Name *"
                placeholder="Enter product name"
                value={newProduct.name}
                onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                required
              />
              
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Category *
                </label>
                <select
                  value={newProduct.category}
                  onChange={(e) => {
                    const selectedCategory = businessCategories.find(cat => cat.name === e.target.value);
                    setNewProduct(prev => ({ 
                      ...prev, 
                      category: e.target.value,
                      vatPercentage: selectedCategory?.tax || 16
                    }));
                  }}
                  required
                  className="w-full rounded-xl border border-gray-300 bg-white/80 backdrop-blur-sm px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none transition-all duration-300"
                >
                  <option value="">Select category</option>
                  {businessCategories.map(cat => (
                    <option key={cat.name} value={cat.name}>{cat.name} ({cat.tax}% VAT)</option>
                  ))}
                </select>
              </div>
              
              <Input
                label="Price (ZMW) *"
                type="number"
                placeholder="0.00"
                value={newProduct.price}
                onChange={(e) => setNewProduct(prev => ({ ...prev, price: e.target.value }))}
                required
              />
              
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  VAT Percentage
                </label>
                <input
                  type="number"
                  value={newProduct.vatPercentage}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, vatPercentage: parseInt(e.target.value) || 16 }))}
                  className="w-full rounded-xl border border-gray-300 bg-white/80 backdrop-blur-sm px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none transition-all duration-300"
                  readOnly
                />
                <p className="text-sm text-gray-500">VAT rate is automatically set based on category</p>
              </div>
              
              <Input
                label="Stock Quantity *"
                type="number"
                placeholder="0"
                value={newProduct.stock}
                onChange={(e) => setNewProduct(prev => ({ ...prev, stock: e.target.value }))}
                required
              />
              
              <div className="flex space-x-3">
                <Button onClick={handleAddProduct} className="flex-1">
                  Add Product
                </Button>
                <Button variant="outline" onClick={() => setShowAddProduct(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Cart Modal */}
      {showCart && (
        <Card className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">Shopping Cart</h3>
                <Button variant="outline" size="sm" onClick={() => setShowCart(false)}>
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.productId} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">{item.productName}</h4>
                        <p className="text-sm text-gray-600">ZMW {item.unitPrice.toFixed(2)} each</p>
                        <p className="text-sm text-gray-500">VAT: ZMW {item.vatAmount.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        export default function QuantityButtons({ item, updateCartQuantity }) {
  return (
    <div className="flex flex-col items-center space-y-1 bg-white rounded-lg border border-gray-300 p-1">
      <Button
        size="sm"
        variant="outline"
        onClick={() => updateCartQuantity(item.productId, 1)}
        className="p-0.5 h-6 w-6 border-0 hover:bg-gray-100 text-blue-600 hover:text-blue-700"
      >
        <FaArrowUp size={14} />
      </Button>

      <span className="px-2 font-semibold text-gray-800 text-sm">
        {item.quantity}
      </span>

      <Button
        size="sm"
        variant="outline"
        onClick={() => updateCartQuantity(item.productId, -1)}
        className="p-0.5 h-6 w-6 border-0 hover:bg-gray-100 text-blue-600 hover:text-blue-700"
      >
        <FaArrowDown size={14} />
      </Button>
    </div>
  );
}
                        <div className="text-right min-w-[4rem]">
                          <p className="font-bold text-gray-800">ZMW {item.totalPrice.toFixed(2)}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeFromCart(item.productId)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  <div className="border-t pt-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>ZMW {cartTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-green-600">
                        <span>Total VAT:</span>
                        <span>ZMW {cartVat.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg border-t pt-2">
                        <span>Total:</span>
                        <span>ZMW {(cartTotal + cartVat).toFixed(2)}</span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-3 mt-4">
                      <Button onClick={generateTransaction} className="flex-1">
                        Generate Transaction
                      </Button>
                      <Button variant="outline" onClick={clearCart}>
                        Clear Cart
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
              {qrCode && (
                <div className="mt-6 text-center">
                  <h4 className="font-bold text-gray-800 mb-3">Transaction QR Code</h4>
                  <img src={qrCode} alt="Transaction QR Code" className="mx-auto mb-3" />
                  <p className="text-sm text-gray-600">Show this QR code to the buyer for payment</p>
                </div>
              )}
            </CardContent>
          </div>
        </Card>
      )}

      {/* Edit Product Modal */}
      {showEditModal && editingProduct && (
        <Card className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Edit Product</h3>
              <Button variant="outline" size="sm" onClick={() => {
                setShowEditModal(false);
                setEditingProduct(null);
                setNewProduct({ name: '', category: '', price: '', vatPercentage: 16, stock: '' });
              }}>
                ×
              </Button>
            </div>

            <div className="space-y-4">
              <Input
                label="Product Name *"
                placeholder="Enter product name"
                value={newProduct.name}
                onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                required
              />

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Category *
                </label>
                <select
                  value={newProduct.category}
                  onChange={(e) => {
                    const selectedCategory = businessCategories.find(cat => cat.name === e.target.value);
                    setNewProduct(prev => ({
                      ...prev,
                      category: e.target.value,
                      vatPercentage: selectedCategory?.tax || 16
                    }));
                  }}
                  required
                  className="w-full rounded-xl border border-gray-300 bg-white/80 backdrop-blur-sm px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none transition-all duration-300"
                >
                  <option value="">Select category</option>
                  {businessCategories.map(cat => (
                    <option key={cat.name} value={cat.name}>{cat.name} ({cat.tax}% VAT)</option>
                  ))}
                </select>
              </div>

              <Input
                label="Price (ZMW) *"
                type="number"
                placeholder="0.00"
                value={newProduct.price}
                onChange={(e) => setNewProduct(prev => ({ ...prev, price: e.target.value }))}
                required
              />

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  VAT Percentage
                </label>
                <input
                  type="number"
                  value={newProduct.vatPercentage}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, vatPercentage: parseInt(e.target.value) || 16 }))}
                  className="w-full rounded-xl border border-gray-300 bg-white/80 backdrop-blur-sm px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none transition-all duration-300"
                  readOnly
                />
                <p className="text-sm text-gray-500">VAT rate is automatically set based on category</p>
              </div>

              <Input
                label="Stock Quantity *"
                type="number"
                placeholder="0"
                value={newProduct.stock}
                onChange={(e) => setNewProduct(prev => ({ ...prev, stock: e.target.value }))}
                required
              />

              <div className="flex space-x-3">
                <Button onClick={saveEditedProduct} className="flex-1">
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => {
                  setShowEditModal(false);
                  setEditingProduct(null);
                  setNewProduct({ name: '', category: '', price: '', vatPercentage: 16, stock: '' });
                }}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Tax Payment Modal */}
      {showPaymentModal && (
        <Card className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">Pay Tax to ZRA</h3>
                <Button variant="outline" size="sm" onClick={() => {
                  setShowPaymentModal(false);
                  setShowPaymentForm(false);
                  setSelectedPaymentMethod('');
                }}>
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">Payment Amount</h4>
                  <p className="text-3xl font-bold text-blue-900">ZMW 2,504.70</p>
                  <p className="text-sm text-blue-700 mt-1">Monthly VAT Payment for January 2024</p>
                </div>

                {!showPaymentForm && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-800">Choose Payment Method</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <Button onClick={() => handlePaymentMethodSelect('Mobile Money')} className="h-16 flex flex-col items-center justify-center">
                        <span className="text-sm">Mobile Money</span>
                        <span className="text-xs text-white/80">MTN, Airtel, Zamtel</span>
                      </Button>
                      <Button onClick={() => handlePaymentMethodSelect('Bank Transfer')} variant="outline" className="h-16 flex flex-col items-center justify-center">
                        <span className="text-sm">Bank Transfer</span>
                        <span className="text-xs text-gray-500">All major banks</span>
                      </Button>
                      <Button onClick={() => handlePaymentMethodSelect('Card Payment')} variant="outline" className="h-16 flex flex-col items-center justify-center">
                        <span className="text-sm">Card Payment</span>
                        <span className="text-xs text-gray-500">Visa, Mastercard</span>
                      </Button>
                      <Button onClick={() => handlePaymentMethodSelect('PayPal')} variant="outline" className="h-16 flex flex-col items-center justify-center">
                        <span className="text-sm">PayPal</span>
                        <span className="text-xs text-gray-500">International</span>
                      </Button>
                    </div>
                  </div>
                )}

                {showPaymentForm && selectedPaymentMethod === 'Mobile Money' && (
                  <div className="space-y-4 border-t pt-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-gray-800">Mobile Money Payment</h4>
                      <Button variant="outline" size="sm" onClick={() => {
                        setShowPaymentForm(false);
                        setSelectedPaymentMethod('');
                      }}>
                        Back
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Select Network *</label>
                      <select
                        value={paymentFormData.network}
                        onChange={(e) => handlePaymentFormChange('network', e.target.value)}
                        className="w-full rounded-xl border border-gray-300 bg-white/80 backdrop-blur-sm px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none transition-all duration-300"
                      >
                        <option value="">Choose your mobile network</option>
                        {mobileNetworks.map(network => (
                          <option key={network.name} value={network.name}>
                            {network.name} ({network.prefix})
                          </option>
                        ))}
                      </select>
                      {paymentErrors.network && <p className="text-sm text-red-600">{paymentErrors.network}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Phone Number *</label>
                      <input
                        type="tel"
                        placeholder="097XXXXXXX"
                        value={paymentFormData.phoneNumber}
                        onChange={(e) => handlePaymentFormChange('phoneNumber', e.target.value)}
                        className="w-full rounded-xl border border-gray-300 bg-white/80 backdrop-blur-sm px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none transition-all duration-300"
                      />
                      {paymentErrors.phoneNumber && <p className="text-sm text-red-600">{paymentErrors.phoneNumber}</p>}
                    </div>

                    <Button onClick={processPayment} className="w-full">
                      Confirm Payment
                    </Button>
                  </div>
                )}

                {showPaymentForm && selectedPaymentMethod === 'Bank Transfer' && (
                  <div className="space-y-4 border-t pt-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-gray-800">Bank Transfer Payment</h4>
                      <Button variant="outline" size="sm" onClick={() => {
                        setShowPaymentForm(false);
                        setSelectedPaymentMethod('');
                      }}>
                        Back
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Select Your Bank *</label>
                      <select
                        value={paymentFormData.bankName}
                        onChange={(e) => handlePaymentFormChange('bankName', e.target.value)}
                        className="w-full rounded-xl border border-gray-300 bg-white/80 backdrop-blur-sm px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none transition-all duration-300"
                      >
                        <option value="">Choose your bank</option>
                        {zambiaBanks.map(bank => (
                          <option key={bank} value={bank}>{bank}</option>
                        ))}
                      </select>
                      {paymentErrors.bankName && <p className="text-sm text-red-600">{paymentErrors.bankName}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Account Number *</label>
                      <input
                        type="text"
                        placeholder="Enter your account number"
                        value={paymentFormData.accountNumber}
                        onChange={(e) => handlePaymentFormChange('accountNumber', e.target.value)}
                        className="w-full rounded-xl border border-gray-300 bg-white/80 backdrop-blur-sm px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none transition-all duration-300"
                      />
                      {paymentErrors.accountNumber && <p className="text-sm text-red-600">{paymentErrors.accountNumber}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Account Holder Name *</label>
                      <input
                        type="text"
                        placeholder="Enter account holder name"
                        value={paymentFormData.accountHolder}
                        onChange={(e) => handlePaymentFormChange('accountHolder', e.target.value)}
                        className="w-full rounded-xl border border-gray-300 bg-white/80 backdrop-blur-sm px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none transition-all duration-300"
                      />
                      {paymentErrors.accountHolder && <p className="text-sm text-red-600">{paymentErrors.accountHolder}</p>}
                    </div>

                    <Button onClick={processPayment} className="w-full">
                      Confirm Payment
                    </Button>
                  </div>
                )}

                {showPaymentForm && selectedPaymentMethod === 'Card Payment' && (
                  <div className="space-y-4 border-t pt-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-gray-800">Card Payment</h4>
                      <Button variant="outline" size="sm" onClick={() => {
                        setShowPaymentForm(false);
                        setSelectedPaymentMethod('');
                      }}>
                        Back
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Card Number *</label>
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        value={paymentFormData.cardNumber}
                        onChange={(e) => handlePaymentFormChange('cardNumber', formatCardNumber(e.target.value))}
                        maxLength={19}
                        className="w-full rounded-xl border border-gray-300 bg-white/80 backdrop-blur-sm px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none transition-all duration-300"
                      />
                      {paymentErrors.cardNumber && <p className="text-sm text-red-600">{paymentErrors.cardNumber}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Expiry Date *</label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          value={paymentFormData.expiryDate}
                          onChange={(e) => {
                            let value = e.target.value.replace(/\D/g, '');
                            if (value.length >= 2) {
                              value = value.substring(0, 2) + '/' + value.substring(2, 4);
                            }
                            handlePaymentFormChange('expiryDate', value);
                          }}
                          maxLength={5}
                          className="w-full rounded-xl border border-gray-300 bg-white/80 backdrop-blur-sm px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none transition-all duration-300"
                        />
                        {paymentErrors.expiryDate && <p className="text-sm text-red-600">{paymentErrors.expiryDate}</p>}
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">CVV *</label>
                        <input
                          type="text"
                          placeholder="123"
                          value={paymentFormData.cvv}
                          onChange={(e) => handlePaymentFormChange('cvv', e.target.value.replace(/\D/g, '').substring(0, 3))}
                          maxLength={3}
                          className="w-full rounded-xl border border-gray-300 bg-white/80 backdrop-blur-sm px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none transition-all duration-300"
                        />
                        {paymentErrors.cvv && <p className="text-sm text-red-600">{paymentErrors.cvv}</p>}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Cardholder Name *</label>
                      <input
                        type="text"
                        placeholder="Enter name as shown on card"
                        value={paymentFormData.cardholderName}
                        onChange={(e) => handlePaymentFormChange('cardholderName', e.target.value)}
                        className="w-full rounded-xl border border-gray-300 bg-white/80 backdrop-blur-sm px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none transition-all duration-300"
                      />
                      {paymentErrors.cardholderName && <p className="text-sm text-red-600">{paymentErrors.cardholderName}</p>}
                    </div>

                    <Button onClick={processPayment} className="w-full">
                      Pay Now
                    </Button>
                  </div>
                )}

                {showPaymentForm && selectedPaymentMethod === 'PayPal' && (
                  <div className="space-y-4 border-t pt-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-gray-800">PayPal Payment</h4>
                      <Button variant="outline" size="sm" onClick={() => {
                        setShowPaymentForm(false);
                        setSelectedPaymentMethod('');
                      }}>
                        Back
                      </Button>
                    </div>

                    <div className="text-center py-8">
                      <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <CreditCard className="h-8 w-8 text-blue-600" />
                      </div>
                      <h4 className="font-semibold text-gray-800 mb-2">PayPal Payment</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        You will be redirected to PayPal to complete your payment securely
                      </p>
                      <Button onClick={processPayment} className="w-full">
                        Continue to PayPal
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </div>
        </Card>
      )}

      {/* Chat System */}
      {showChat && (
        <ChatSystem
          userRole="seller"
          userName="John Seller"
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
};