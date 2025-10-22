import React, { useState } from 'react';
import { Store, ShoppingCart, Shield } from 'lucide-react';

interface AuthTabsProps {
  activeTab: 'seller' | 'buyer' | 'zra_officer';
  onTabChange: (tab: 'seller' | 'buyer' | 'zra_officer') => void;
}

export const AuthTabs: React.FC<AuthTabsProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'seller' as const, label: 'Seller', icon: Store, color: 'text-green-600' },
    { id: 'buyer' as const, label: 'Buyer', icon: ShoppingCart, color: 'text-blue-600' },
    { id: 'zra_officer' as const, label: 'ZRA Officer', icon: Shield, color: 'text-purple-600' }
  ];

  return (
    <div className="flex space-x-1 bg-gray-100/80 backdrop-blur-sm p-1 rounded-xl mb-6">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg
              font-semibold text-sm transition-all duration-300
              ${activeTab === tab.id 
                ? 'bg-white shadow-md text-gray-800 transform scale-105' 
                : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
              }
            `}
          >
            <Icon size={18} className={activeTab === tab.id ? tab.color : ''} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};