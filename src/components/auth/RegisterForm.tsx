import React, { useState } from 'react';
import { User, Mail, Lock, Building, MapPin, Hash, Eye, EyeOff } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface RegisterFormProps {
  userType: 'seller' | 'buyer' | 'zra_officer';
  onRegister: (formData: any) => void;
  isLoading?: boolean;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ userType, onRegister, isLoading = false }) => {
  // Don't render registration form for ZRA officers
  if (userType === 'zra_officer') {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">ZRA Officer accounts are managed by the system administrator.</p>
        <p className="text-sm text-gray-500">Please use the sign in option to access your account.</p>
      </div>
    );
  }

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    // Seller specific
    businessName: '',
    tpin: '',
    category: '',
    location: '',
    // ZRA Officer specific
    badgeNumber: '',
    zone: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    onRegister(formData);
  };

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

  const zones = [
    'Lusaka Central', 'Lusaka East', 'Lusaka West', 'Copperbelt', 'Northern', 'Eastern', 'Western', 'Southern'
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Full Name"
        placeholder="Enter your full name"
        value={formData.name}
        onChange={(e) => handleChange('name', e.target.value)}
        icon={User}
        required
      />

      <Input
        label="Email Address"
        type="email"
        placeholder="Enter your email"
        value={formData.email}
        onChange={(e) => handleChange('email', e.target.value)}
        icon={Mail}
        required
      />

      {userType === 'seller' && (
        <>
          <Input
            label="Business Name"
            placeholder="Enter your business name"
            value={formData.businessName}
            onChange={(e) => handleChange('businessName', e.target.value)}
            icon={Building}
            required
          />

          <Input
            label="TPIN (Tax Payer Identification Number)"
            placeholder="Enter your TPIN"
            value={formData.tpin}
            onChange={(e) => handleChange('tpin', e.target.value)}
            icon={Hash}
            required
          />

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Business Category <span className="text-red-500 ml-1">*</span>
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
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
            label="Business Location"
            placeholder="Enter your business location"
            value={formData.location}
            onChange={(e) => handleChange('location', e.target.value)}
            icon={MapPin}
            required
          />
        </>
      )}

      {userType === 'zra_officer' && (
        <>
          <Input
            label="Badge Number"
            placeholder="Enter your badge number"
            value={formData.badgeNumber}
            onChange={(e) => handleChange('badgeNumber', e.target.value)}
            icon={Hash}
            required
          />

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Zone <span className="text-red-500 ml-1">*</span>
            </label>
            <select
              value={formData.zone}
              onChange={(e) => handleChange('zone', e.target.value)}
              required
              className="w-full rounded-xl border border-gray-300 bg-white/80 backdrop-blur-sm px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none transition-all duration-300"
            >
              <option value="">Select zone</option>
              {zones.map(zone => (
                <option key={zone} value={zone}>{zone}</option>
              ))}
            </select>
          </div>
        </>
      )}

      <div className="relative">
        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Create a password"
          value={formData.password}
          onChange={(e) => handleChange('password', e.target.value)}
          icon={Lock}
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 transition-colors"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>

      <div className="relative">
        <Input
          label="Confirm Password"
          type={showConfirmPassword ? 'text' : 'password'}
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChange={(e) => handleChange('confirmPassword', e.target.value)}
          icon={Lock}
          required
        />
        <button
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 transition-colors"
        >
          {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? 'Creating Account...' : 'Create Account'}
      </Button>
    </form>
  );
};