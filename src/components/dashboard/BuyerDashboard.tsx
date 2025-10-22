import React, { useState } from 'react';
import { ShoppingCart, Award, QrCode, CreditCard, History, AlertCircle, Camera, X, Flag, Download, Calendar } from 'lucide-react';
import { StatCard } from './StatCard';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import QrScanner from 'qr-scanner';

export const BuyerDashboard: React.FC = () => {
  // Get current month/year for tracking
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthName = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
  
  const [transactionCode, setTransactionCode] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState<any>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [qrScanner, setQrScanner] = useState<QrScanner | null>(null);
  const [scannerError, setScannerError] = useState<string>('');
  const [showFraudReport, setShowFraudReport] = useState(false);
  const [fraudReport, setFraudReport] = useState({
    sellerName: '',
    description: '',
    transactionDetails: ''
  });
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [paymentFormData, setPaymentFormData] = useState({
    // Mobile Money
    network: '',
    phoneNumber: '',
    // Bank Transfer
    bankName: '',
    accountNumber: '',
    accountHolder: '',
    // Card Payment
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });
  const [paymentErrors, setPaymentErrors] = useState<any>({});

  // Monthly stats (would reset each month in real app)
  const monthlyStats = {
    totalPurchases: 1250, // This month's purchases
    fairTaxBadges: 12,   // Accumulated badges
    transactions: 45,     // This month's transaction count
    vatPaid: 200          // Estimated VAT paid this month
  };

  const stats = [
    { title: `Purchases (${monthName})`, value: `ZMW ${monthlyStats.totalPurchases.toLocaleString()}`, icon: ShoppingCart, color: 'blue' as const },
    { title: 'Fair Tax Badges', value: '12', icon: Award, color: 'purple' as const },
    { title: `Transactions (${monthName})`, value: `${monthlyStats.transactions}`, icon: History, color: 'orange' as const }
  ];

  const [selectedStore, setSelectedStore] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('all');

  // Current month's purchase history (would be filtered by month in real app)
  const currentMonthHistory = [
    { id: '1', store: 'ABC Groceries', items: 'Cooking Oil, Sugar', total: 'ZMW 85.00', vat: 'ZMW 13.60', date: '2024-01-15', transactionCode: 'HTX-12345678' },
    { id: '2', store: 'Quick Mart', items: 'Bread, Milk', total: 'ZMW 25.00', vat: 'ZMW 4.00', date: '2024-01-15', transactionCode: 'HTX-87654321' },
    { id: '3', store: 'Super Store', items: 'Rice, Beans', total: 'ZMW 120.00', vat: 'ZMW 19.20', date: '2024-01-14', transactionCode: 'HTX-11223344' },
    { id: '4', store: 'Tech Solutions', items: 'Phone Repair', total: 'ZMW 150.00', vat: 'ZMW 7.50', date: '2024-01-13', transactionCode: 'HTX-55667788' },
    { id: '5', store: 'Fresh Market', items: 'Vegetables, Fruits', total: 'ZMW 65.00', vat: 'ZMW 10.40', date: '2024-01-12', transactionCode: 'HTX-99887766' }
  ];

  // Get unique stores and dates for filters
  const uniqueStores = [...new Set(currentMonthHistory.map(t => t.store))];
  const uniqueDates = [...new Set(currentMonthHistory.map(t => t.date))];

  // Filter transactions based on selected filters
  const filteredHistory = currentMonthHistory.filter(transaction => {
    const storeMatch = selectedStore === 'all' || transaction.store === selectedStore;
    const dateMatch = selectedDate === 'all' || transaction.date === selectedDate;
    return storeMatch && dateMatch;
  });

  const handleScanCode = () => {
    if (!transactionCode) return;
    
    processTransactionCode(transactionCode);
  };

  const processTransactionCode = (code: string) => {
    try {
      // Try to parse as JSON (QR code data)
      const transactionData = JSON.parse(code);
      if (transactionData.code && transactionData.items) {
        setCurrentTransaction({
          id: transactionData.code,
          sellerName: 'Scanned Seller',
          items: transactionData.items.map((item: any) => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            vat: (item.price * item.quantity * item.vatPercentage / 100)
          })),
          subtotal: parseFloat(transactionData.subtotal),
          totalVat: parseFloat(transactionData.vatAmount),
          total: parseFloat(transactionData.total)
        });
        setShowPayment(true);
        return;
      }
    } catch (e) {
      // Not JSON, treat as regular transaction code
    }

    // Mock transaction data for regular codes
    const mockTransaction = {
      id: code,
      sellerName: 'ABC Groceries',
      items: [
        { name: 'Cooking Oil 2L', quantity: 1, price: 45.00, vat: 7.20 },
        { name: 'Sugar 1kg', quantity: 2, price: 25.00, vat: 8.00 }
      ],
      subtotal: 95.00,
      totalVat: 15.20,
      total: 110.20
    };
    
    setCurrentTransaction(mockTransaction);
    setShowPayment(true);
  };

  const startQrScanner = async () => {
    try {
      setScannerError('');
      setShowScanner(true);
      
      // Wait for the video element to be in the DOM
      setTimeout(async () => {
        const videoElement = document.getElementById('qr-video') as HTMLVideoElement;
        if (videoElement) {
          const scanner = new QrScanner(
            videoElement,
            (result) => {
              setTransactionCode(result.data);
              processTransactionCode(result.data);
              stopQrScanner();
            },
            {
              highlightScanRegion: true,
              highlightCodeOutline: true,
            }
          );
          
          setQrScanner(scanner);
          await scanner.start();
        }
      }, 100);
    } catch (error) {
      console.error('Error starting QR scanner:', error);
      setScannerError('Unable to access camera. Please check permissions.');
      setShowScanner(false);
    }
  };

  const stopQrScanner = () => {
    if (qrScanner) {
      qrScanner.stop();
      qrScanner.destroy();
      setQrScanner(null);
    }
    setShowScanner(false);
    setScannerError('');
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
    } else if (selectedPaymentMethod === 'Card') {
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

    // Simulate payment processing
    setTimeout(() => {
      alert(`Payment of ZMW ${currentTransaction?.total.toFixed(2)} processed successfully via ${selectedPaymentMethod}. Receipt sent to your account.`);
      setShowPaymentForm(false);
      setSelectedPaymentMethod('');
      setShowPayment(false);
      setCurrentTransaction(null);
      setTransactionCode('');
    }, 2000);
  };

  const cancelPayment = () => {
    setShowPaymentForm(false);
    setSelectedPaymentMethod('');
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

  const handlePayment = (method: string) => {
    handlePaymentMethodSelect(method);
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

  const formatPhoneNumber = (value: string) => {
    setShowPayment(false);
    setCurrentTransaction(null);
    setTransactionCode('');
  };

  const submitFraudReport = () => {
    if (!fraudReport.sellerName || !fraudReport.description) {
      alert('Please fill in all required fields');
      return;
    }
    
    // In a real app, this would send to the backend
    console.log('Fraud report submitted:', fraudReport);
    alert('Fraud report submitted successfully. ZRA has been notified and will investigate this matter.');
    
    setFraudReport({ sellerName: '', description: '', transactionDetails: '' });
    setShowFraudReport(false);
  };

  const downloadMonthlyReport = () => {
    const reportData = {
      month: monthName,
      totalPurchases: monthlyStats.totalPurchases,
      vatPaid: monthlyStats.vatPaid,
      transactionCount: monthlyStats.transactions,
      fairTaxBadges: monthlyStats.fairTaxBadges,
      transactions: currentMonthHistory
    };
    
    const reportContent = `
HIVE.TAX BUYER MONTHLY REPORT
=============================
Month: ${reportData.month}
Total Purchases: ZMW ${reportData.totalPurchases.toLocaleString()}
VAT Paid: ZMW ${reportData.vatPaid.toLocaleString()}
Number of Transactions: ${reportData.transactionCount}
Fair Tax Badges Earned: ${reportData.fairTaxBadges}

TRANSACTION HISTORY
===================
${reportData.transactions.map(t => 
`Date: ${t.date}
Store: ${t.store}
Items: ${t.items}
Total: ${t.total}
VAT: ${t.vat}
Transaction Code: ${t.transactionCode}
-------------------`
).join('\n')}

Generated on: ${new Date().toLocaleString()}

This report shows your monthly purchase activity and VAT contributions.
Keep supporting fair tax compliance by using Hive.Tax!
    `;
    
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hive-tax-buyer-report-${currentMonth + 1}-${currentYear}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Transaction Scanner */}
      <Card>
        <CardHeader>
          <h3 className="text-xl font-bold text-gray-800">Scan Transaction Code</h3>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Enter transaction code or scan QR"
                value={transactionCode}
                onChange={(e) => setTransactionCode(e.target.value)}
                icon={QrCode}
              />
            </div>
            <Button onClick={startQrScanner} icon={Camera} variant="outline">
              Scan QR
            </Button>
            <Button onClick={handleScanCode} disabled={!transactionCode}>
              Process Code
            </Button>
          </div>

          <div className="mt-4 p-4 bg-orange-50 rounded-xl border border-orange-200">
            <div className="flex items-center space-x-2 mb-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <p className="font-semibold text-orange-800">No Transaction Code?</p>
            </div>
            <p className="text-sm text-orange-700 mb-3">
              If a seller didn't provide a transaction code, this might be tax evasion. Help promote fair tax by reporting it.
            </p>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" icon={Flag} onClick={() => setShowFraudReport(true)}>
                Report Fraud
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fraud Report Modal */}
      {showFraudReport && (
        <Card className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Report Tax Fraud</h3>
              <Button variant="outline" size="sm" onClick={() => setShowFraudReport(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                <h4 className="font-semibold text-red-800 mb-2">How to Report Tax Fraud:</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• Seller refused to provide transaction code</li>
                  <li>• No VAT receipt given after payment</li>
                  <li>• Suspicious pricing or tax calculations</li>
                  <li>• Business operating without proper registration</li>
                </ul>
              </div>
              
              <Input
                label="Seller/Business Name *"
                placeholder="Enter the business name"
                value={fraudReport.sellerName}
                onChange={(e) => setFraudReport(prev => ({ ...prev, sellerName: e.target.value }))}
                required
              />
              
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Description of Issue *
                </label>
                <textarea
                  placeholder="Describe what happened in detail..."
                  value={fraudReport.description}
                  onChange={(e) => setFraudReport(prev => ({ ...prev, description: e.target.value }))}
                  required
                  rows={4}
                  className="w-full rounded-xl border border-gray-300 bg-white/80 backdrop-blur-sm px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none transition-all duration-300"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Transaction Details (Optional)
                </label>
                <textarea
                  placeholder="Items purchased, amount paid, date, etc..."
                  value={fraudReport.transactionDetails}
                  onChange={(e) => setFraudReport(prev => ({ ...prev, transactionDetails: e.target.value }))}
                  rows={3}
                  className="w-full rounded-xl border border-gray-300 bg-white/80 backdrop-blur-sm px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none transition-all duration-300"
                />
              </div>
              
              <div className="flex space-x-3">
                <Button onClick={submitFraudReport} className="flex-1">
                  Submit Report
                </Button>
                <Button variant="outline" onClick={() => setShowFraudReport(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* QR Scanner Modal */}
      {showScanner && (
        <Card className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Scan QR Code</h3>
              <Button variant="outline" size="sm" onClick={stopQrScanner}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {scannerError ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 mb-4">{scannerError}</p>
                <Button onClick={stopQrScanner} variant="outline">
                  Close
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative bg-black rounded-xl overflow-hidden">
                  <video
                    id="qr-video"
                    className="w-full h-64 object-cover"
                    playsInline
                  />
                  <div className="absolute inset-0 border-2 border-blue-500 rounded-xl pointer-events-none">
                    <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-blue-500"></div>
                    <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-blue-500"></div>
                    <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-blue-500"></div>
                    <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-blue-500"></div>
                  </div>
                </div>
                <p className="text-center text-sm text-gray-600">
                  Position the QR code within the frame to scan
                </p>
                <Button onClick={stopQrScanner} variant="outline" className="w-full">
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Payment Modal */}
      {showPayment && currentTransaction && (
        <Card className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">Transaction Details</h3>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setShowPayment(false);
                    setShowPaymentForm(false);
                    setSelectedPaymentMethod('');
                    setCurrentTransaction(null);
                    setTransactionCode('');
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-xl">
                <h4 className="font-semibold text-gray-800 mb-2">{currentTransaction.sellerName}</h4>
                <div className="space-y-2">
                  {currentTransaction.items.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.name} (x{item.quantity})</span>
                      <span>ZMW {(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-300 mt-3 pt-3 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>ZMW {currentTransaction.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-green-600">
                    <span>VAT (16%):</span>
                    <span>ZMW {currentTransaction.totalVat.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>ZMW {currentTransaction.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-gray-800">Choose Payment Method</h4>
                <div className="grid grid-cols-2 gap-3">
                  <Button onClick={() => handlePayment('Mobile Money')} className="h-12" disabled={showPaymentForm}>
                    Mobile Money
                  </Button>
                  <Button onClick={() => handlePayment('Bank Transfer')} variant="outline" className="h-12" disabled={showPaymentForm}>
                    Bank Transfer
                  </Button>
                  <Button onClick={() => handlePayment('Card')} variant="outline" className="h-12" disabled={showPaymentForm}>
                    Card Payment
                  </Button>
                  <Button onClick={() => handlePayment('Wallet')} variant="outline" className="h-12" disabled={showPaymentForm}>
                    Digital Wallet
                  </Button>
                </div>
              </div>

              {/* Payment Forms */}
              {showPaymentForm && (
                <div className="border-t pt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-800">{selectedPaymentMethod} Payment</h4>
                    <Button variant="outline" size="sm" onClick={cancelPayment}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {selectedPaymentMethod === 'Mobile Money' && (
                    <div className="space-y-4">
                      <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                        <p className="text-sm text-blue-800 font-medium mb-2">Payment Amount: ZMW {currentTransaction?.total.toFixed(2)}</p>
                        <p className="text-sm text-blue-700">Seller: {currentTransaction?.sellerName}</p>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Select Network *
                        </label>
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
                        <label className="block text-sm font-semibold text-gray-700">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          placeholder="097XXXXXXX"
                          value={paymentFormData.phoneNumber}
                          onChange={(e) => handlePaymentFormChange('phoneNumber', e.target.value)}
                          className="w-full rounded-xl border border-gray-300 bg-white/80 backdrop-blur-sm px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none transition-all duration-300"
                        />
                        {paymentErrors.phoneNumber && <p className="text-sm text-red-600">{paymentErrors.phoneNumber}</p>}
                      </div>

                      <div className="bg-yellow-50 p-3 rounded-xl border border-yellow-200">
                        <p className="text-sm text-yellow-800">
                          <strong>Next Steps:</strong> You will receive a payment prompt on your phone. 
                          Enter your mobile money PIN to complete the transaction.
                        </p>
                      </div>

                      <Button onClick={processPayment} className="w-full">
                        Send Payment Request
                      </Button>
                    </div>
                  )}

                  {selectedPaymentMethod === 'Bank Transfer' && (
                    <div className="space-y-4">
                      <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                        <p className="text-sm text-green-800 font-medium mb-2">Payment Amount: ZMW {currentTransaction?.total.toFixed(2)}</p>
                        <p className="text-sm text-green-700">Seller: {currentTransaction?.sellerName}</p>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Select Your Bank *
                        </label>
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
                        <label className="block text-sm font-semibold text-gray-700">
                          Account Number *
                        </label>
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
                        <label className="block text-sm font-semibold text-gray-700">
                          Account Holder Name *
                        </label>
                        <input
                          type="text"
                          placeholder="Enter account holder name"
                          value={paymentFormData.accountHolder}
                          onChange={(e) => handlePaymentFormChange('accountHolder', e.target.value)}
                          className="w-full rounded-xl border border-gray-300 bg-white/80 backdrop-blur-sm px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none transition-all duration-300"
                        />
                        {paymentErrors.accountHolder && <p className="text-sm text-red-600">{paymentErrors.accountHolder}</p>}
                      </div>

                      <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                        <h5 className="font-semibold text-blue-800 mb-2">Transfer Details:</h5>
                        <div className="text-sm text-blue-700 space-y-1">
                          <p><strong>Bank:</strong> Bank of Zambia</p>
                          <p><strong>Account:</strong> ZRA-VAT-COLLECTION</p>
                          <p><strong>Reference:</strong> HTX-{currentTransaction?.id}</p>
                        </div>
                      </div>

                      <Button onClick={processPayment} className="w-full">
                        Confirm Bank Transfer
                      </Button>
                    </div>
                  )}

                  {selectedPaymentMethod === 'Card' && (
                    <div className="space-y-4">
                      <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                        <p className="text-sm text-purple-800 font-medium mb-2">Payment Amount: ZMW {currentTransaction?.total.toFixed(2)}</p>
                        <p className="text-sm text-purple-700">Seller: {currentTransaction?.sellerName}</p>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Card Number *
                        </label>
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
                          <label className="block text-sm font-semibold text-gray-700">
                            Expiry Date *
                          </label>
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
                          <label className="block text-sm font-semibold text-gray-700">
                            CVV *
                          </label>
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
                        <label className="block text-sm font-semibold text-gray-700">
                          Cardholder Name *
                        </label>
                        <input
                          type="text"
                          placeholder="Enter name as shown on card"
                          value={paymentFormData.cardholderName}
                          onChange={(e) => handlePaymentFormChange('cardholderName', e.target.value)}
                          className="w-full rounded-xl border border-gray-300 bg-white/80 backdrop-blur-sm px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none transition-all duration-300"
                        />
                        {paymentErrors.cardholderName && <p className="text-sm text-red-600">{paymentErrors.cardholderName}</p>}
                      </div>

                      <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                        <p className="text-sm text-gray-700">
                          <strong>Secure Payment:</strong> Your card information is encrypted and secure. 
                          We accept Visa, Mastercard, and local bank cards.
                        </p>
                      </div>

                      <Button onClick={processPayment} className="w-full">
                        Pay with Card
                      </Button>
                    </div>
                  )}

                  {selectedPaymentMethod === 'Wallet' && (
                    <div className="space-y-4">
                      <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
                        <p className="text-sm text-orange-800 font-medium mb-2">Payment Amount: ZMW {currentTransaction?.total.toFixed(2)}</p>
                        <p className="text-sm text-orange-700">Seller: {currentTransaction?.sellerName}</p>
                      </div>

                      <div className="text-center py-8">
                        <div className="bg-orange-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                          <CreditCard className="h-8 w-8 text-orange-600" />
                        </div>
                        <h4 className="font-semibold text-gray-800 mb-2">Digital Wallet Payment</h4>
                        <p className="text-sm text-gray-600 mb-4">
                          Connect your preferred digital wallet to complete the payment
                        </p>
                        <div className="space-y-2">
                          <Button onClick={processPayment} className="w-full">
                            Pay with Hive.Tax Wallet
                          </Button>
                          <Button variant="outline" className="w-full">
                            Connect External Wallet
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            </CardContent>
          </div>
        </Card>
      )}

      {/* Monthly Summary */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-800">Monthly Summary - {monthName}</h3>
            <Button onClick={downloadMonthlyReport} icon={Download} size="sm">
              Download Report
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
              <div className="flex items-center space-x-3 mb-2">
                <ShoppingCart className="h-5 w-5 text-blue-600" />
                <h4 className="font-semibold text-blue-800">Total Purchases</h4>
              </div>
              <p className="text-2xl font-bold text-blue-900">ZMW {monthlyStats.totalPurchases.toLocaleString()}</p>
              <p className="text-sm text-blue-700">{monthlyStats.transactions} transactions this month</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-xl border border-green-200">
              <div className="flex items-center space-x-3 mb-2">
                <Calendar className="h-5 w-5 text-green-600" />
                <h4 className="font-semibold text-green-800">Monthly Activity</h4>
              </div>
              <p className="text-2xl font-bold text-green-900">{monthlyStats.transactions}</p>
              <p className="text-sm text-green-700">Transactions this month</p>
            </div>

            <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
              <div className="flex items-center space-x-3 mb-2">
                <Award className="h-5 w-5 text-purple-600" />
                <h4 className="font-semibold text-purple-800">Fair Tax Impact</h4>
              </div>
              <p className="text-2xl font-bold text-purple-900">{monthlyStats.fairTaxBadges} Badges</p>
              <p className="text-sm text-purple-700">Supporting tax compliance</p>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
            <div className="flex items-center space-x-2 mb-2">
              <Calendar className="h-5 w-5 text-yellow-600" />
              <p className="font-semibold text-yellow-800">Monthly Reset Notice</p>
            </div>
            <p className="text-sm text-yellow-700">
              Your purchase totals and transaction history reset at the beginning of each month. 
              Download your monthly report before the month ends to keep your records.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Purchase History */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-800">Purchase History - {monthName}</h3>
            <div className="flex space-x-3">
              <select
                value={selectedStore}
                onChange={(e) => setSelectedStore(e.target.value)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Stores</option>
                {uniqueStores.map(store => (
                  <option key={store} value={store}>{store}</option>
                ))}
              </select>
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Dates</option>
                {uniqueDates.map(date => (
                  <option key={date} value={date}>{date}</option>
                ))}
              </select>
              <div className="text-sm text-gray-600 flex items-center">
                {filteredHistory.length} transactions
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredHistory.map((purchase) => (
              <div key={purchase.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <ShoppingCart className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{purchase.store}</p>
                      <p className="text-sm text-gray-600">{purchase.items}</p>
                      <p className="text-xs text-gray-500">{purchase.date} • Code: {purchase.transactionCode}</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800">{purchase.total}</p>
                  <p className="text-sm text-gray-500">Code: {purchase.transactionCode.slice(-4)}</p>
                </div>
              </div>
            ))}
          </div>
          
          {filteredHistory.length === 0 && (
            <div className="text-center py-8">
              <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">No transactions found</p>
              <p className="text-sm text-gray-500">Try adjusting your filters or make a purchase</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};