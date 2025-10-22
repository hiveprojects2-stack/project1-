import React from 'react';
import { Shield, TrendingUp, Users, CheckCircle, ArrowRight, FileText, ExternalLink } from 'lucide-react';
import { Button } from './ui/Button';

interface LandingPageProps {
  onGetStarted: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const features = [
    {
      icon: Shield,
      title: 'Automated VAT Collection',
      description: 'Every transaction automatically deducts and transfers VAT to ZRA in real-time'
    },
    {
      icon: TrendingUp,
      title: 'Real-time Compliance',
      description: 'Monitor tax compliance with automated alerts and comprehensive reporting'
    },
    {
      icon: Users,
      title: 'Multi-stakeholder Platform',
      description: 'Connects sellers, buyers, and ZRA officers in one unified ecosystem'
    },
    {
      icon: CheckCircle,
      title: 'Digital Transparency',
      description: 'Complete transaction transparency with digital receipts and audit trails'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <Shield className="h-20 w-20 text-white" />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Hive<span className="text-blue-200">.Tax</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Smart VAT enforcement system that streamlines tax compliance, improves revenue collection, and digitizes the relationship between sellers, buyers, and tax authorities.
            </p>
            <Button
              size="lg"
              onClick={onGetStarted}
              className="bg-white text-blue-700 hover:bg-blue-50 transform hover:scale-105 transition-all duration-300 shadow-2xl"
              icon={ArrowRight}
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white/10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Revolutionizing Tax Compliance
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Automated, transparent, and secure VAT collection for modern Zambia
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 text-center hover:bg-white/30 transition-all duration-300 transform hover:scale-105"
                >
                  <div className="bg-white/20 rounded-2xl p-4 w-16 h-16 flex items-center justify-center mx-auto mb-6">
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                  <p className="text-blue-100">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ZRA Practice Note Section */}
      <div className="py-16 bg-white/5 backdrop-blur-sm border-y border-white/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
            <div className="flex items-start space-x-6">
              <div className="bg-yellow-400/20 rounded-2xl p-4 flex-shrink-0">
                <FileText className="h-8 w-8 text-yellow-300" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-4">
                  New Tax Changes for 2024
                </h3>
                <p className="text-blue-100 mb-6 leading-relaxed">
                  Not sure how the new tax changes affect you or your business? Take a look at the 
                  <span className="font-semibold text-white"> ZRA Practice Note No. 1 of 2024</span> — 
                  it explains all the key updates, including PAYE adjustments, new VAT exemptions, 
                  and incentives for rural enterprises. The guide also covers the introduction of 
                  electronic invoicing and other important regulatory changes.
                </p>
                <a
                  href="https://drive.google.com/file/d/1G0rKeO3el1fpRue0YOTE6ceou6oSNNEi/view?usp=drive_link"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-3 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 font-bold px-8 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/25"
                >
                  <FileText className="h-5 w-5" />
                  <span>View ZRA Practice Note 2024</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* CTA Section */}
      <div className="py-24">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Tax Compliance?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of businesses already using Hive.Tax for seamless VAT management
          </p>
          <Button
            size="lg"
            onClick={onGetStarted}
            className="bg-white text-blue-700 hover:bg-blue-50 transform hover:scale-105 transition-all duration-300 shadow-2xl"
            icon={ArrowRight}
          >
            Start Your Journey
          </Button>
        </div>
      </div>
    </div>
  );
};