import React, { useState } from 'react';
import { TrendingUp, Users, AlertTriangle, MapPin, FileText, Search, Eye, CheckCircle, XCircle, MessageCircle } from 'lucide-react';
import { StatCard } from './StatCard';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { ChatSystem } from './ChatSystem';

export const ZRADashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'alerts' | 'compliance' | 'sellers' | 'revenue'>('alerts');
  const [selectedSeller, setSelectedSeller] = useState<any>(null);
  const [selectedAlert, setSelectedAlert] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [selectedChatSeller, setSelectedChatSeller] = useState<any>(null);

  const stats = [
    { title: 'Total Revenue Collected', value: 'ZMW 2.4M', icon: TrendingUp, color: 'green' as const, trend: { value: 15, isPositive: true } },
    { title: 'Active Sellers', value: '1,247', icon: Users, color: 'blue' as const, trend: { value: 8, isPositive: true } },
    { title: 'Compliance Alerts', value: '23', icon: AlertTriangle, color: 'red' as const },
    { title: 'Zones Monitored', value: '8', icon: MapPin, color: 'purple' as const }
  ];

  const sellers = [
    {
      id: '1',
      name: 'ABC Groceries',
      tpin: 'ZM123456789',
      status: 'Compliant',
      lastTransaction: '2024-01-15',
      monthlyVat: 3920,
      location: 'Lusaka Central',
      category: 'Shop/Retail Store',
      taxRate: 16,
      ownerName: 'John Mwamba',
      phoneNumber: '0977123456',
      email: 'abc.groceries@email.com',
      registrationDate: '2022-03-15',
      employeeCount: 8,
      averageMonthlyRevenue: 24500,
      complianceRate: 98
    },
    {
      id: '2',
      name: 'Quick Mart',
      tpin: 'ZM987654321',
      status: 'Warning',
      lastTransaction: '2024-01-10',
      monthlyVat: 1450,
      location: 'Lusaka East',
      category: 'Small Business',
      taxRate: 5,
      ownerName: 'Mary Banda',
      phoneNumber: '0966234567',
      email: 'quickmart@email.com',
      registrationDate: '2023-06-20',
      employeeCount: 3,
      averageMonthlyRevenue: 29000,
      complianceRate: 85
    },
    {
      id: '3',
      name: 'Super Store',
      tpin: 'ZM456789123',
      status: 'Non-Compliant',
      lastTransaction: '2024-01-05',
      monthlyVat: 0,
      location: 'Copperbelt',
      category: 'Shop/Retail Store',
      taxRate: 16,
      ownerName: 'Peter Phiri',
      phoneNumber: '0955345678',
      email: 'superstore@email.com',
      registrationDate: '2021-11-08',
      employeeCount: 15,
      averageMonthlyRevenue: 45000,
      complianceRate: 45
    },
    {
      id: '4',
      name: 'Tech Solutions',
      tpin: 'ZM789123456',
      status: 'Under Investigation',
      lastTransaction: '2024-01-12',
      monthlyVat: 8750,
      location: 'Lusaka West',
      category: 'Technology/IT Services',
      taxRate: 5,
      ownerName: 'Sarah Mulenga',
      phoneNumber: '0977456789',
      email: 'techsolutions@email.com',
      registrationDate: '2020-08-12',
      employeeCount: 12,
      averageMonthlyRevenue: 175000,
      complianceRate: 92
    }
  ];

  const alerts = [
    {
      id: '1',
      type: 'Inactivity',
      seller: 'Super Store',
      sellerTpin: 'ZM456789123',
      message: 'No transactions recorded for 10 days',
      severity: 'high',
      detectedDate: '2024-01-15 14:30',
      details: 'The business has not recorded any transactions in the Hive.Tax system for the past 10 days. This could indicate possible tax evasion, system issues, or business closure. Last recorded transaction was on January 5, 2024.',
      aiAnalysis: 'Pattern analysis shows this business typically records 15-20 transactions per week. The sudden halt in activity is unusual and warrants immediate investigation.',
      recommendedAction: 'Contact business owner immediately, conduct on-site inspection if no response within 48 hours.',
      previousOccurrences: 2,
      location: 'Copperbelt'
    },
    {
      id: '2',
      type: 'Fraud Report',
      seller: 'Quick Mart',
      sellerTpin: 'ZM987654321',
      message: 'Buyer reported missing transaction code',
      severity: 'medium',
      detectedDate: '2024-01-14 09:15',
      details: 'A customer reported that they made a purchase of ZMW 450 but did not receive a transaction code or VAT receipt. This violates tax compliance regulations.',
      aiAnalysis: 'This is the first fraud report for this business. Transaction patterns show normal activity, suggesting this may be an isolated incident. However, further monitoring is recommended.',
      recommendedAction: 'Issue warning to business, verify recent transactions, schedule follow-up inspection within 2 weeks.',
      reporterInfo: 'Reported by verified Hive.Tax user',
      previousOccurrences: 0,
      location: 'Lusaka East'
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Compliant': return 'text-green-600 bg-green-100';
      case 'Warning': return 'text-yellow-600 bg-yellow-100';
      case 'Non-Compliant': return 'text-red-600 bg-red-100';
      case 'Under Investigation': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'border-red-500 bg-red-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      case 'low': return 'border-blue-500 bg-blue-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  const filteredSellers = sellers.filter(seller =>
    seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    seller.tpin.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const viewSellerDetails = (seller: any) => {
    setSelectedSeller(seller);
  };

  const markUnderInvestigation = (sellerId: string) => {
    alert(`Seller marked as under investigation. Case file created.`);
  };

  const generateReport = () => {
    const reportContent = `
HIVE.TAX - ZRA COMPLIANCE REPORT
==================================

Report Generated: ${new Date().toLocaleString()}
Report ID: ZRA-RPT-${Date.now()}

REVENUE SUMMARY
---------------
Total Revenue Collected: ZMW 2,400,000
Monthly Growth: +15%
Active Sellers: 1,247
Compliance Alerts: 23

SELLER BREAKDOWN
----------------
${sellers.map(seller => `
Business: ${seller.name}
TPIN: ${seller.tpin}
Location: ${seller.location}
Status: ${seller.status}
Monthly VAT: ZMW ${seller.monthlyVat.toLocaleString()}
Last Transaction: ${seller.lastTransaction}
------------------`).join('\n')}

COMPLIANCE STATISTICS
---------------------
Compliant Sellers: 1,175 (94.2%)
Non-Compliant Sellers: 72 (5.8%)
Under Investigation: 4

ZONE PERFORMANCE
----------------
Lusaka Central: ZMW 890,000
Copperbelt: ZMW 650,000
Lusaka East: ZMW 480,000
Other Zones: ZMW 380,000

This is an official ZRA compliance report.
Generated by Hive.Tax Platform
    `;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zra-compliance-report-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const confirmPayment = (sellerId: string, sellerName: string) => {
    alert(`Payment confirmed for ${sellerName}. Compliance status updated to "Good".`);
    // In real app, this would update the backend
  };

  const flagNonCompliant = (sellerId: string, sellerName: string) => {
    alert(`${sellerName} flagged as non-compliant. Seller notified for investigation.`);
    // In real app, this would update the backend
  };

  const openChat = (seller: any) => {
    setSelectedChatSeller(seller);
    setShowChat(true);
  };
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
              { id: 'alerts', label: 'Compliance Alerts', icon: AlertTriangle },
              { id: 'compliance', label: 'Monthly Compliance', icon: CheckCircle },
              { id: 'sellers', label: 'Registered Sellers', icon: Users },
              { id: 'revenue', label: 'Revenue Details', icon: TrendingUp }
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
      {activeTab === 'alerts' && (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-800">Compliance Alerts</h3>
            <div className="text-right">
              <p className="text-sm text-blue-600 font-medium">AI-Powered Monitoring</p>
              <p className="text-xs text-gray-500">Advanced analytics system</p>
            </div>
            <Button size="sm" icon={FileText} onClick={generateReport}>
              Generate Report
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
            <div className="flex items-start space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-blue-800 mb-2">AI-Enhanced Compliance Monitoring</h4>
                <p className="text-sm text-blue-700 leading-relaxed">
                  Our advanced AI system continuously analyzes seller transaction patterns, comparing sales data across similar businesses 
                  and market segments. Using machine learning algorithms, the system identifies anomalies in revenue reporting, 
                  transaction frequency, and seasonal variations. When a seller's activity deviates significantly from established 
                  patterns or industry benchmarks, the AI automatically generates compliance alerts, including inactivity warnings 
                  and potential tax evasion indicators. This intelligent monitoring ensures comprehensive tax compliance oversight 
                  while reducing manual review workload.
                </p>
                <div className="mt-3 flex items-center space-x-4 text-xs text-blue-600">
                  <span className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>Real-time Analysis</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span>Pattern Recognition</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span>Predictive Alerts</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className={`p-4 rounded-xl border-l-4 ${getSeverityColor(alert.severity)}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-800">{alert.type} - {alert.seller}</p>
                    <p className="text-sm text-gray-600">{alert.message}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={() => setSelectedAlert(alert)}>
                      View Details
                    </Button>
                    <Button size="sm" onClick={() => markUnderInvestigation(alert.seller)}>
                      Investigate
                    </Button>
                  </div>
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
          <h3 className="text-xl font-bold text-gray-800">Monthly Compliance Management</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sellers.slice(0, 4).map((seller) => (
              <div key={seller.id} className="p-4 border rounded-xl bg-gray-50">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold text-gray-800">{seller.name}</p>
                    <p className="text-sm text-gray-600">Monthly VAT: ZMW {seller.monthlyVat.toLocaleString()}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(seller.status)}`}>
                    {seller.status}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    icon={CheckCircle}
                    onClick={() => confirmPayment(seller.id, seller.name)}
                    className="flex-1 text-green-600 border-green-300 hover:bg-green-50"
                  >
                    Confirm Payment
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    icon={XCircle}
                    onClick={() => flagNonCompliant(seller.id, seller.name)}
                    className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
                  >
                    Flag Non-Compliant
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    icon={MessageCircle}
                    onClick={() => openChat(seller)}
                  >
                    Chat
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      )}

      {activeTab === 'sellers' && (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-800">Registered Sellers</h3>
            <div className="flex-1 max-w-md ml-4">
              <Input
                placeholder="Search sellers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={Search}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Business Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">TPIN</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Monthly VAT</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Location</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSellers.map((seller) => (
                  <tr key={seller.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-800">{seller.name}</td>
                    <td className="py-3 px-4 text-gray-600 font-mono text-sm">{seller.tpin}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(seller.status)}`}>
                        {seller.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-800">ZMW {seller.monthlyVat.toLocaleString()}</td>
                    <td className="py-3 px-4 text-gray-600">{seller.location}</td>
                    <td className="py-3 px-4">
                      <Button
                        size="sm"
                        variant="outline"
                        icon={Eye}
                        onClick={() => viewSellerDetails(seller)}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      )}

      {activeTab === 'revenue' && (
        <Card>
          <CardHeader>
            <h3 className="text-xl font-bold text-gray-800">Revenue Collection Details</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                <h4 className="font-semibold text-green-800 mb-4">Monthly Collection</h4>
                <p className="text-3xl font-bold text-green-900 mb-2">ZMW 2.4M</p>
                <p className="text-sm text-green-700">+15% from last month</p>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>SME (3%):</span>
                    <span>ZMW 180K</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Retail (16%):</span>
                    <span>ZMW 1.9M</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Services (5%):</span>
                    <span>ZMW 320K</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-4">Collection Rate</h4>
                <p className="text-3xl font-bold text-blue-900 mb-2">94.2%</p>
                <p className="text-sm text-blue-700">Compliance rate</p>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Compliant:</span>
                    <span>1,175 sellers</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Non-compliant:</span>
                    <span>72 sellers</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
                <h4 className="font-semibold text-purple-800 mb-4">Zone Performance</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>Lusaka Central:</span>
                    <span className="font-semibold">ZMW 890K</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Copperbelt:</span>
                    <span className="font-semibold">ZMW 650K</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Lusaka East:</span>
                    <span className="font-semibold">ZMW 480K</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Other Zones:</span>
                    <span className="font-semibold">ZMW 380K</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <h4 className="font-semibold text-gray-800 mb-4">Recent Collections</h4>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Seller</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Amount</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { date: '2024-01-15', seller: 'ABC Groceries', amount: 'ZMW 3,920', type: 'Retail (16%)', status: 'Confirmed' },
                      { date: '2024-01-15', seller: 'Tech Solutions', amount: 'ZMW 1,450', type: 'Services (5%)', status: 'Confirmed' },
                      { date: '2024-01-14', seller: 'Quick SME', amount: 'ZMW 285', type: 'SME (3%)', status: 'Pending' },
                      { date: '2024-01-14', seller: 'Super Store', amount: 'ZMW 8,750', type: 'Retail (16%)', status: 'Confirmed' }
                    ].map((collection, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-600">{collection.date}</td>
                        <td className="py-3 px-4 font-medium text-gray-800">{collection.seller}</td>
                        <td className="py-3 px-4 font-semibold text-gray-800">{collection.amount}</td>
                        <td className="py-3 px-4 text-gray-600">{collection.type}</td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            collection.status === 'Confirmed' ? 'text-green-600 bg-green-100' : 'text-yellow-600 bg-yellow-100'
                          }`}>
                            {collection.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alert Details Modal */}
      {selectedAlert && (
        <Card className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="border-b">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Alert Details</h3>
                  <p className="text-sm text-gray-600 mt-1">{selectedAlert.type} - {selectedAlert.seller}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setSelectedAlert(null)}>
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className={`p-4 rounded-xl border-l-4 ${getSeverityColor(selectedAlert.severity)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-800">Severity Level</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                      selectedAlert.severity === 'high' ? 'bg-red-100 text-red-800' :
                      selectedAlert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {selectedAlert.severity}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{selectedAlert.message}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-xs text-gray-600 mb-1">Business Name</p>
                    <p className="font-semibold text-gray-800">{selectedAlert.seller}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-xs text-gray-600 mb-1">TPIN</p>
                    <p className="font-semibold text-gray-800">{selectedAlert.sellerTpin}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-xs text-gray-600 mb-1">Location</p>
                    <p className="font-semibold text-gray-800">{selectedAlert.location}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-xs text-gray-600 mb-1">Detected Date</p>
                    <p className="font-semibold text-gray-800">{selectedAlert.detectedDate}</p>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">Alert Details</h4>
                  <p className="text-sm text-blue-900">{selectedAlert.details}</p>
                </div>

                <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                  <h4 className="font-semibold text-purple-800 mb-2">AI Analysis</h4>
                  <p className="text-sm text-purple-900">{selectedAlert.aiAnalysis}</p>
                </div>

                <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-2">Recommended Action</h4>
                  <p className="text-sm text-green-900">{selectedAlert.recommendedAction}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-xs text-gray-600 mb-1">Previous Occurrences</p>
                    <p className="text-2xl font-bold text-gray-800">{selectedAlert.previousOccurrences}</p>
                  </div>
                  {selectedAlert.reporterInfo && (
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <p className="text-xs text-gray-600 mb-1">Reporter Info</p>
                      <p className="text-sm font-semibold text-gray-800">{selectedAlert.reporterInfo}</p>
                    </div>
                  )}
                </div>

                <div className="flex space-x-3 pt-4 border-t">
                  <Button onClick={() => markUnderInvestigation(selectedAlert.seller)} className="flex-1">
                    Mark Under Investigation
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedAlert(null)}>
                    Close
                  </Button>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>
      )}

      {/* Seller Details Modal */}
      {selectedSeller && (
        <Card className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">Seller Details: {selectedSeller.name}</h3>
                <Button variant="outline" size="sm" onClick={() => setSelectedSeller(null)}>
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Business Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Business Category:</span>
                      <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                        {selectedSeller.category} ({selectedSeller.taxRate}% VAT)
                      </span>
                    </p>
                    <p><span className="font-medium">TPIN:</span> {selectedSeller.tpin}</p>
                    <p><span className="font-medium">Location:</span> {selectedSeller.location}</p>
                    <p><span className="font-medium">Registration Date:</span> {selectedSeller.registrationDate}</p>
                    <p><span className="font-medium">Last Transaction:</span> {selectedSeller.lastTransaction}</p>
                    <p><span className="font-medium">Status:</span>
                      <span className={`ml-2 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedSeller.status)}`}>
                        {selectedSeller.status}
                      </span>
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Contact Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Owner Name:</span> {selectedSeller.ownerName}</p>
                    <p><span className="font-medium">Phone Number:</span> {selectedSeller.phoneNumber}</p>
                    <p><span className="font-medium">Email:</span> {selectedSeller.email}</p>
                    <p><span className="font-medium">Employees:</span> {selectedSeller.employeeCount}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                  <p className="text-xs text-green-600 mb-1">Monthly VAT</p>
                  <p className="text-2xl font-bold text-green-800">ZMW {selectedSeller.monthlyVat.toLocaleString()}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                  <p className="text-xs text-blue-600 mb-1">Avg. Monthly Revenue</p>
                  <p className="text-2xl font-bold text-blue-800">ZMW {selectedSeller.averageMonthlyRevenue.toLocaleString()}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                  <p className="text-xs text-purple-600 mb-1">Compliance Rate</p>
                  <p className="text-2xl font-bold text-purple-800">{selectedSeller.complianceRate}%</p>
                </div>
              </div>

              <div className="mt-6 bg-gray-50 p-4 rounded-xl">
                <h4 className="font-semibold text-gray-800 mb-3">Tax Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Tax Rate</p>
                    <p className="font-semibold text-gray-800">{selectedSeller.taxRate}%</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total Transactions (This Month)</p>
                    <p className="font-semibold text-gray-800">156</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total Revenue (This Month)</p>
                    <p className="font-semibold text-gray-800">ZMW {selectedSeller.averageMonthlyRevenue.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">VAT Collection Rate</p>
                    <p className="font-semibold text-gray-800">{selectedSeller.complianceRate}%</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex space-x-3">
                <Button variant="outline">View Full History</Button>
                <Button variant="outline">Download Report</Button>
                {selectedSeller.status !== 'Under Investigation' && (
                  <Button className="bg-orange-600 hover:bg-orange-700" onClick={() => {
                    markUnderInvestigation(selectedSeller.id);
                    setSelectedSeller(null);
                  }}>
                    Mark Under Investigation
                  </Button>
                )}
              </div>
            </CardContent>
          </div>
        </Card>
      )}

      {/* Chat System */}
      {showChat && selectedChatSeller && (
        <ChatSystem
          userRole="zra_officer"
          userName="Officer Smith"
          targetUser={selectedChatSeller.name}
          onClose={() => {
            setShowChat(false);
            setSelectedChatSeller(null);
          }}
        />
      )}
    </div>
  );
};