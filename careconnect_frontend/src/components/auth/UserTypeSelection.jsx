import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Users, ArrowLeft } from 'lucide-react';

export const UserTypeSelection = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const userTypes = [
    {
      type: 'daycare',
      icon: Users,
      title: t('userTypes.daycare.title'),
      description: t('userTypes.daycare.description'),
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      route: '/register/daycare'
    },
    {
      type: 'parent',
      icon: Heart,
      title: t('userTypes.parent.title'),
      description: t('userTypes.parent.description'),
      color: 'text-pink-500',
      bgColor: 'bg-pink-50',
      route: '/register/parent'
    }
  ];

  return (
    <div className="min-h-screen hero-bg flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        {/* Back to Home */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            {t('userTypes.title')}
          </h1>
          <p className="text-xl text-gray-600">
            Select your role to get started with CareConnect Canada
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {userTypes.map((userType) => (
            <Card 
              key={userType.type} 
              className="card-hover border-0 shadow-lg bg-white/80 backdrop-blur-sm cursor-pointer group"
              onClick={() => navigate(userType.route)}
            >
              <CardContent className="p-8 text-center">
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${userType.bgColor} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <userType.icon className={`h-10 w-10 ${userType.color}`} />
                </div>
                
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                  {userType.title}
                </h3>
                
                <p className="text-gray-600 mb-8 leading-relaxed">
                  {userType.description}
                </p>
                
                <Button 
                  className="gradient-bg text-white rounded-full px-8 py-3 font-semibold hover:shadow-lg transition-all duration-300 group-hover:scale-105"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(userType.route);
                  }}
                >
                  Get Started
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Button
              variant="link"
              onClick={() => navigate('/login')}
              className="text-blue-600 hover:text-blue-800 font-semibold p-0"
            >
              Sign in here
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
};

