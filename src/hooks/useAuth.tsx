import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'seller' | 'buyer' | 'zra_officer';
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string, role: 'seller' | 'buyer' | 'zra_officer') => Promise<void>;
  register: (formData: any, role: 'seller' | 'buyer' | 'zra_officer') => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('hive_tax_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, role: 'seller' | 'buyer' | 'zra_officer') => {
    setIsLoading(true);
    
    // Special validation for ZRA officer
    if (role === 'zra_officer') {
      if (email !== 'texila@gmail.com' || password !== '1234') {
        setIsLoading(false);
        throw new Error('Invalid ZRA officer credentials');
      }
    }
    
    // Mock authentication - in real app, this would be an API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock user data based on role
    const mockUsers = {
      seller: { id: '1', name: 'John Seller', email, role: 'seller' as const },
      buyer: { id: '2', name: 'Jane Buyer', email, role: 'buyer' as const },
      zra_officer: { id: '3', name: 'Officer Smith', email, role: 'zra_officer' as const }
    };
    
    const userData = mockUsers[role];
    setUser(userData);
    localStorage.setItem('hive_tax_user', JSON.stringify(userData));
    setIsLoading(false);
  };

  const register = async (formData: any, role: 'seller' | 'buyer' | 'zra_officer') => {
    setIsLoading(true);
    
    // Mock registration - in real app, this would be an API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const userData = {
      id: Date.now().toString(),
      name: formData.name,
      email: formData.email,
      role,
      // Store additional seller data
      ...(role === 'seller' && {
        businessName: formData.businessName,
        tpin: formData.tpin,
        category: formData.category,
        location: formData.location
      })
    };
    
    setUser(userData);
    localStorage.setItem('hive_tax_user', JSON.stringify(userData));
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('hive_tax_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};