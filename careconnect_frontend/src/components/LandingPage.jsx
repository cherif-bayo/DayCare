import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, 
  Users, 
  FileText, 
  CreditCard, 
  MessageCircle, 
  Shield,
  Globe,
  Star,
  CheckCircle,
  ArrowRight,
  Menu,
  X,
  Crown,
  Infinity,
  Calendar,
  DollarSign
} from 'lucide-react';
import logoIcon from '../assets/careconnect_logo_app_style.png';
import logoHorizontal from '../assets/careconnect_logo_horizontal.png';

export const LandingPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleLanguage = () => {
    const newLang = currentLanguage === 'en' ? 'fr' : 'en';
    i18n.changeLanguage(newLang);
    setCurrentLanguage(newLang);
  };

  const handleGetStarted = () => {
    navigate('/register');
  };

  const handleSignIn = () => {
    navigate('/login');
  };

  // Smooth scroll function
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
    setIsMobileMenuOpen(false); // Close mobile menu after clicking
  };

  // Navigation items
  const navigationItems = [
    { id: 'home', label: 'Home', sectionId: 'hero-section' },
    { id: 'features', label: 'Features', sectionId: 'features-section' },
    { id: 'solutions', label: 'Solutions', sectionId: 'solutions-section' },
    { id: 'pricing', label: 'Pricing', sectionId: 'pricing-section' },
    { id: 'testimonials', label: 'Testimonials', sectionId: 'testimonials-section' }
  ];

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && !event.target.closest('.mobile-menu-container')) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  // Pricing plans data
  const pricingPlans = [
    {
      id: 'free',
      name: 'Free Trial',
      price: 'Free',
      period: 'for 1 year',
      description: 'Perfect for getting started',
      icon: <Heart className="h-8 w-8" />,
      color: 'from-green-400 to-green-600',
      features: [
        'Complete daycare management system',
        'Child profiles and development tracking',
        'Parent communication portal',
        'Activity documentation',
        'Basic reporting',
        'Billing and payment processing',
        'Free support included',
        'Available for daycares only',
        'Parents always free'
      ],
      highlight: false,
      note: 'Free for parents forever'
    },
    {
      id: 'monthly',
      name: 'Monthly Plan',
      price: '$250',
      period: 'per month',
      description: 'Flexible monthly subscription',
      icon: <Calendar className="h-8 w-8" />,
      color: 'from-blue-400 to-blue-600',
      features: [
        'All features included',
        'Complete daycare management system',
        'Child profiles and development tracking',
        'Parent communication portal',
        'Activity documentation',
        'Advanced reporting and analytics',
        'Billing and payment processing',
        'Priority support included',
        'No long-term commitment'
      ],
      highlight: false,
      note: 'After first year free trial'
    },
    {
      id: 'yearly',
      name: 'Annual Plan',
      price: '$1,500',
      period: 'per year',
      description: 'Best value for committed users',
      icon: <Crown className="h-8 w-8" />,
      color: 'from-purple-400 to-purple-600',
      features: [
        'All features included',
        'Complete daycare management system',
        'Child profiles and development tracking',
        'Parent communication portal',
        'Activity documentation',
        'Advanced reporting and analytics',
        'Billing and payment processing',
        'Priority support included',
        'Save $1,500 per year',
        'Annual billing discount'
      ],
      highlight: true,
      note: 'Most popular choice'
    },
    {
      id: 'lifetime',
      name: 'Lifetime Access',
      price: '$3,000',
      period: 'one-time',
      description: 'Pay once, use forever',
      icon: <Infinity className="h-8 w-8" />,
      color: 'from-amber-400 to-amber-600',
      features: [
        'All features included forever',
        'Complete daycare management system',
        'Child profiles and development tracking',
        'Parent communication portal',
        'Activity documentation',
        'Advanced reporting and analytics',
        'Billing and payment processing',
        'Lifetime support included',
        'No recurring payments',
        'Future updates included'
      ],
      highlight: false,
      note: 'Best long-term value'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Enhanced Navigation */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <img src={logoIcon} alt="CareConnect Canada" className="h-10 w-10" />
              <div>
                <h1 className="text-lg font-bold text-gray-800">CareConnect</h1>
                <p className="text-xs text-gray-600">Canada</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.sectionId)}
                  className="text-gray-700 hover:text-teal-600 transition-colors font-medium"
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={toggleLanguage}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {currentLanguage === 'en' ? 'FR' : 'EN'}
              </button>
              <button
                onClick={handleSignIn}
                className="px-4 py-2 text-teal-600 border border-teal-600 rounded-md hover:bg-teal-50 transition-colors"
              >
                {t('signIn')}
              </button>
              <button
                onClick={handleGetStarted}
                className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
              >
                Get Started
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden mobile-menu-container">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>

              {/* Mobile Menu Dropdown */}
              {isMobileMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                  {navigationItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.sectionId)}
                      className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      {item.label}
                    </button>
                  ))}
                  <div className="border-t border-gray-200 mt-2 pt-2">
                    <button
                      onClick={toggleLanguage}
                      className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Language: {currentLanguage === 'en' ? 'Français' : 'English'}
                    </button>
                    <button
                      onClick={handleSignIn}
                      className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      {t('signIn')}
                    </button>
                    <button
                      onClick={handleGetStarted}
                      className="block w-full text-left px-4 py-3 text-teal-600 font-medium hover:bg-gray-50 transition-colors"
                    >
                      Get Started
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Home-1: Hero Section */}
      <section id="hero-section" className="text-center py-20 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Logo */}
          <div className="mb-8">
            <img src={logoIcon} alt="CareConnect Canada" className="h-24 w-24 mx-auto mb-4" />
            <div className="flex items-center justify-center space-x-3">
              <img src={logoIcon} alt="CareConnect Canada" className="h-16 w-16" />
              <div className="text-left">
                <h2 className="text-2xl font-bold text-teal-500">CareConnect</h2>
                <p className="text-gray-600">Canada</p>
                <Star className="h-5 w-5 text-yellow-400 inline" />
              </div>
            </div>
          </div>

          {/* Main Title */}
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            {t('heroTitle')}
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            {t('heroSubtitle')}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => scrollToSection('pricing-section')}
              className="gradient-bg text-white px-8 py-4 rounded-lg text-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center space-x-2"
            >
              <span>Start Your Journey</span>
              <ArrowRight className="h-5 w-5" />
            </button>
            <button
              onClick={handleSignIn}
              className="bg-white text-gray-800 px-8 py-4 rounded-lg text-lg font-semibold border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              {t('signIn')}
            </button>
          </div>

          {/* Helper Text */}
          <p className="text-sm text-gray-500 mt-6">
            {t('newToCareConnect')}
          </p>
        </div>
      </section>

      {/* Home-2: Features Section */}
      <section id="features-section" className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t('featuresTitle')}
            </h2>
            <p className="text-xl text-gray-600">
              {t('featuresSubtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Child-Centered Profiles */}
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {t('childCenteredProfiles')}
              </h3>
              <p className="text-gray-600">
                {t('childCenteredProfilesDesc')}
              </p>
            </div>

            {/* Transparent Communication */}
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FileText className="h-8 w-8 text-teal-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {t('transparentCommunication')}
              </h3>
              <p className="text-gray-600">
                {t('transparentCommunicationDesc')}
              </p>
            </div>

            {/* Simplified Billing */}
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <CreditCard className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {t('simplifiedBilling')}
              </h3>
              <p className="text-gray-600">
                {t('simplifiedBillingDesc')}
              </p>
            </div>

            {/* Family Portal */}
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Heart className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {t('familyPortal')}
              </h3>
              <p className="text-gray-600">
                {t('familyPortalDesc')}
              </p>
            </div>

            {/* Regulatory Compliance */}
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {t('regulatoryCompliance')}
              </h3>
              <p className="text-gray-600">
                {t('regulatoryComplianceDesc')}
              </p>
            </div>

            {/* Bilingual Support */}
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Globe className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {t('bilingualSupport')}
              </h3>
              <p className="text-gray-600">
                {t('bilingualSupportDesc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Home-3: For Providers and Families */}
      <section id="solutions-section" className="py-20 px-6 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t('supportingEveryStep')}
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* For Childcare Providers */}
            <div className="bg-white rounded-3xl p-8 shadow-lg">
              <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center mb-6">
                <Users className="h-8 w-8 text-teal-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                {t('forChildcareProviders')}
              </h3>
              <div className="space-y-4 mb-8">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-teal-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">{t('manageChildrenDevelopment')}</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-teal-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">{t('documentDailyActivities')}</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-teal-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">{t('streamlineFamilyCommunication')}</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-teal-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">{t('handleBillingPayments')}</span>
                </div>
              </div>
              <button
                onClick={() => scrollToSection('pricing-section')}
                className="w-full gradient-bg text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
              >
                {t('startFreeTrial')}
              </button>
            </div>

            {/* For Families */}
            <div className="bg-white rounded-3xl p-8 shadow-lg">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                <Heart className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                {t('forFamilies')}
              </h3>
              <div className="space-y-4 mb-8">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-blue-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">{t('trackChildProgress')}</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-blue-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">{t('stayUpdatedDailyActivities')}</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-blue-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">{t('managePaymentsEasily')}</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-blue-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">{t('connectWithCaregivers')}</span>
                </div>
              </div>
              <button
                onClick={handleGetStarted}
                className="w-full bg-white text-gray-800 py-3 rounded-lg font-semibold border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                {t('joinAsParent')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* NEW: Pricing Section */}
      <section id="pricing-section" className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Start Your Journey
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Choose the perfect plan for your daycare. All plans include the same powerful features.
            </p>
            <div className="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-full">
              <Heart className="h-4 w-4" />
              <span className="font-medium">Free for parents forever</span>
            </div>
          </div>

          <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">
            {pricingPlans.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl ${
                  plan.highlight 
                    ? 'border-purple-500 transform scale-105' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="p-8">
                  {/* Plan Header */}
                  <div className="text-center mb-8">
                    <div className={`w-16 h-16 bg-gradient-to-r ${plan.color} rounded-2xl flex items-center justify-center mx-auto mb-4 text-white`}>
                      {plan.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <p className="text-gray-600 mb-4">{plan.description}</p>
                    
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                      <span className="text-gray-600 ml-2">{plan.period}</span>
                    </div>
                    
                    <p className="text-sm text-gray-500 italic">{plan.note}</p>
                  </div>

                  {/* Features List */}
                  <div className="space-y-3 mb-8">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={handleGetStarted}
                    className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 ${
                      plan.highlight
                        ? 'bg-purple-500 text-white hover:bg-purple-600 shadow-lg'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {plan.id === 'free' ? 'Start Free Trial' : 'Get Started'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Footer */}
          <div className="text-center mt-12">
            <div className="bg-gray-50 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                All Plans Include
              </h3>
              <div className="grid md:grid-cols-3 gap-6 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-green-500" />
                  <span>Free support included</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="h-5 w-5 text-blue-500" />
                  <span>Bilingual support (EN/FR)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  <span>Canadian compliance ready</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Home-4: Testimonials and Final CTA */}
      <section id="testimonials-section" className="py-20 px-6 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t('trustedByFamilies')}
            </h2>
          </div>

          {/* Testimonials */}
          <div className="grid lg:grid-cols-2 gap-8 mb-16">
            {/* Testimonial 1 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic">
                "{t('testimonial1')}"
              </p>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">S</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Sarah Mitchell</p>
                  <p className="text-sm text-gray-600">Director, Maple Leaf Daycare</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic">
                "{t('testimonial2')}"
              </p>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">J</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Jean-François Dubois</p>
                  <p className="text-sm text-gray-600">Parent, Montréal</p>
                </div>
              </div>
            </div>
          </div>

          {/* Final CTA Section */}
          <div className="gradient-bg rounded-3xl p-12 text-center text-white">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-4">
              {t('readyToTakeNextStep')}
            </h2>
            <p className="text-xl mb-8 opacity-90">
              {t('joinHundredsOfProviders')}
            </p>
            <button
              onClick={handleGetStarted}
              className="bg-white text-teal-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center space-x-2"
            >
              <span>Start Your Journey Today</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <img src={logoIcon} alt="CareConnect Canada" className="h-10 w-10" />
                <div>
                  <h3 className="text-lg font-bold">CareConnect</h3>
                  <p className="text-sm text-gray-400">Canada</p>
                </div>
              </div>
              <p className="text-gray-400">
                {t('footerDescription')}
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">{t('product')}</h4>
              <ul className="space-y-2 text-gray-400">
                <li><button onClick={() => scrollToSection('features-section')} className="hover:text-white transition-colors">{t('features')}</button></li>
                <li><button onClick={() => scrollToSection('pricing-section')} className="hover:text-white transition-colors">{t('pricing')}</button></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('security')}</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">{t('company')}</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">{t('about')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('contact')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('careers')}</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">{t('support')}</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">{t('helpCenter')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('documentation')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('privacy')}</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 CareConnect Canada. {t('allRightsReserved')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};