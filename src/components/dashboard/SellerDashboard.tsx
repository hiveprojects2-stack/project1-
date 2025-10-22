import React, { useState } from 'react';
import { Plus, Package, TrendingUp, DollarSign, AlertTriangle, Eye, CreditCard as Edit, Trash2, ShoppingCart, Minus, MessageCircle, Calendar, Download, BarChart3 } from 'lucide-react';
import { StatCard } from './StatCard';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { ChatSystem } from './ChatSystem';
import QRCode from 'qrcode';

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
  const [cart, setCart] = useState<CartItem[]>([]);
  const [qrCode, setQrCode] = useState<string>('');
  
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

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id} hover>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800 mb-1">{product.name}</h4>
                      <p className="text-sm text-gray-600 mb-2">{product.category}</p>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="font-semibold text-green-600">ZMW {product.price.toFixed(2)}</span>
                        <span className="text-gray-500">VAT: {product.vatPercentage}%</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">Stock: {product.stock}</p>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" onClick={() => addToCart(product)} className="flex-1">
                      Add to Cart
                    </Button>
                    <Button size="sm" variant="outline" icon={Edit}>
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" icon={Trash2} className="text-red-600">
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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

              <div className="flex space-x-4">
                <Button icon={Download} variant="outline">
                  Download Tax Report
                </Button>
                <Button icon={Calendar} variant="outline">
                  Schedule Payment
                </Button>
                <Button icon={BarChart3} variant="outline">
                  View Analytics
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
                        <div className="flex items-center space-x-2 bg-white rounded-lg border border-gray-300">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateCartQuantity(item.productId, -1)}
                            className="p-1 h-8 w-8 border-0 hover:bg-gray-100"
                          >
                            <Minus size={14} />
                          </Button>
                          <span className="px-3 py-1 font-semibold text-gray-800 min-w-[2rem] text-center">
                            {item.quantity}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateCartQuantity(item.productId, 1)}
                            className="p-1 h-8 w-8 border-0 hover:bg-gray-100"
                          >
                            <Plus size={14} />
                          </Button>
                        </div>
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