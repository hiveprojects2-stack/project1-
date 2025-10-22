import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { AuthTabs } from './auth/AuthTabs';
import { LoginForm } from './auth/LoginForm';
import { RegisterForm } from './auth/RegisterForm';
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { useAuth } from '../hooks/useAuth';

interface AuthPageProps {
  onBack: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'seller' | 'buyer' | 'zra_officer'>('seller');
  const [isLogin, setIsLogin] = useState(true);
  const { login, register, isLoading } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password, activeTab);
    } catch (error) {
      alert('Login failed. Please try again.');
    }
  };

  const handleRegister = async (formData: any) => {
    try {
      await register(formData, activeTab);
    } catch (error) {
      alert('Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Button
            variant="outline"
            size="sm"
            icon={ArrowLeft}
            onClick={onBack}
            className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
          >
            Back to Home
          </Button>
        </div>
        <Card className="overflow-hidden">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-gray-600">
                {isLogin ? 'Sign in to your account' : 'Join the Hive.Tax ecosystem'}
              </p>
            </div>

            <AuthTabs activeTab={activeTab} onTabChange={setActiveTab} />

            {isLogin ? (
              <LoginForm
                userType={activeTab}
                onLogin={handleLogin}
                isLoading={isLoading}
              />
            ) : (
              <RegisterForm
                userType={activeTab}
                onRegister={handleRegister}
                isLoading={isLoading}
              />
            )}

            <div className="mt-6 text-center">
              {activeTab !== 'zra_officer' && (
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};