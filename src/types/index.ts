export interface User {
  id: string;
  email: string;
  name: string;
  role: 'seller' | 'buyer' | 'zra_officer';
  createdAt: Date;
}

export interface Seller extends User {
  businessName: string;
  tpin: string;
  category: string;
  location: string;
  isActive: boolean;
  lastTransactionDate?: Date;
}

export interface Buyer extends User {
  supportFairTaxBadges: number;
}

export interface ZRAOfficer extends User {
  badgeNumber: string;
  zone: string;
}

export interface Product {
  id: string;
  sellerId: string;
  name: string;
  category: string;
  price: number;
  vatPercentage: number;
  isActive: boolean;
}

export interface Transaction {
  id: string;
  sellerId: string;
  buyerId?: string;
  products: TransactionItem[];
  totalAmount: number;
  vatAmount: number;
  netAmount: number;
  status: 'pending' | 'completed' | 'failed';
  paymentMethod?: 'mobile_money' | 'card' | 'bank_transfer' | 'wallet';
  transactionCode: string;
  qrCode: string;
  createdAt: Date;
  paidAt?: Date;
}

export interface TransactionItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  vatAmount: number;
  totalPrice: number;
}

export interface ComplianceAlert {
  id: string;
  sellerId: string;
  type: 'inactivity' | 'fraud_report';
  message: string;
  status: 'pending' | 'resolved';
  createdAt: Date;
  details?: string;
  reportedBy?: string;
}

export interface FraudReport {
  id: string;
  sellerId: string;
  buyerId: string;
  sellerName: string;
  buyerName: string;
  description: string;
  transactionDetails?: string;
  status: 'pending' | 'investigating' | 'resolved';
  createdAt: Date;
}

export interface AdditionalSale {
  id: string;
  sellerId: string;
  amount: number;
  description: string;
  date: Date;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'seller' | 'zra_officer';
  message: string;
  timestamp: Date;
  isRead: boolean;
}

export interface ChatConversation {
  id: string;
  sellerId: string;
  sellerName: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  status: 'active' | 'closed';
}