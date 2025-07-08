import { useState } from 'react';
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
  ArrowRight
} from 'lucide-react';
import logoIcon from '../assets/careconnect_logo_app_style.png';
import logoHorizontal from '../assets/careconnect_logo_horizontal.png';

export const LandingPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6">
        <div className="flex items-center space-x-3">
          <img src={logoIcon} alt="CareConnect Canada" className="h-12 w-12" />
          <div>
            <h1 className="text-xl font-bold text-gray-800">CareConnect</h1>
            <p className="text-sm text-gray-600">Canada</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleLanguage}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {currentLanguage === 'en' ? 'FR' : 'EN'}
          </button>
          <button
            onClick={handleSignIn}
            className="px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
          >
            {t('signIn')}
          </button>
        </div>
      </nav>

      {/* Home-1: Hero Section */}
      <section className="text-center py-20 px-6">
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
              onClick={handleGetStarted}
              className="gradient-bg text-white px-8 py-4 rounded-lg text-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center space-x-2"
            >
              <span>{t('startYourJourney')}</span>
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
      <section className="py-20 px-6 bg-white">
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
      <section className="py-20 px-6 bg-gradient-to-br from-green-50 to-blue-50">
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
                onClick={handleGetStarted}
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

      {/* Home-4: Testimonials and Final CTA */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t('trustedByFamilies')}
            </h2>
          </div>

          {/* Testimonials */}
          <div className="grid lg:grid-cols-2 gap-8 mb-16">
            {/* Testimonial 1 */}
            <div className="bg-green-50 rounded-2xl p-8">
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
            <div className="bg-blue-50 rounded-2xl p-8">
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
              <span>{t('startYourJourneyToday')}</span>
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
                <li><a href="#" className="hover:text-white transition-colors">{t('features')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('pricing')}</a></li>
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

