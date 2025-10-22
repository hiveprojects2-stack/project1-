import React from 'react';
import { Shield, User, LogOut, Settings } from 'lucide-react';
import { Button } from '../ui/Button';
import { AccessibilityControls } from '../ui/AccessibilityControls';

interface NavbarProps {
  userRole?: 'seller' | 'buyer' | 'zra_officer';
  userName?: string;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ userRole, userName, onLogout }) => {
  const [showAccessibility, setShowAccessibility] = React.useState(false);
  
  const getRoleColor = () => {
    switch (userRole) {
      case 'seller': return 'text-green-600';
      case 'buyer': return 'text-blue-600';
      case 'zra_officer': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const getRoleLabel = () => {
    switch (userRole) {
      case 'seller': return 'Seller';
      case 'buyer': return 'Buyer';
      case 'zra_officer': return 'ZRA Officer';
      default: return 'User';
    }
  };

  return (
    <nav className="bg-white/80 backdrop-blur-lg border-b border-white/20 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Hive.Tax
            </h1>
          </div>
          
          {userName && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-semibold text-gray-800">{userName}</p>
                  <p className={`text-xs font-medium ${getRoleColor()}`}>{getRoleLabel()}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                icon={Settings}
                onClick={() => setShowAccessibility(true)}
                title="Accessibility Settings"
              >
                Accessibility
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={LogOut}
                onClick={onLogout}
              >
                Logout
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <AccessibilityControls
        isOpen={showAccessibility}
        onClose={() => setShowAccessibility(false)}
      />
    </nav>
  );
};