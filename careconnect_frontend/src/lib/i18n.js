import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      // Navigation
      signIn: 'Sign In',
      
      // Hero Section (Home-1)
      heroTitle: "Where Every Child's Journey Matters",
      heroSubtitle: 'Comprehensive daycare management designed for Canadian families and childcare providers',
      startYourJourney: 'Start Your Journey',
      newToCareConnect: 'New to CareConnect? Click "Start Your Journey"',
      
      // Features Section (Home-2)
      featuresTitle: 'Everything You Need for Quality Childcare',
      featuresSubtitle: 'Trusted by daycare providers and parents across Canada',
      
      childCenteredProfiles: 'Child-Centered Profiles',
      childCenteredProfilesDesc: 'Complete development tracking, medical records, and milestone documentation for every little one',
      
      transparentCommunication: 'Transparent Communication',
      transparentCommunicationDesc: 'Real-time updates, incident reports, and daily activity sharing between caregivers and families',
      
      simplifiedBilling: 'Simplified Billing',
      simplifiedBillingDesc: 'Automated invoicing, payment tracking, and financial management for stress-free operations',
      
      familyPortal: 'Family Portal',
      familyPortalDesc: 'Parents stay connected with photos, updates, and their child\'s daily adventures',
      
      regulatoryCompliance: 'Regulatory Compliance',
      regulatoryComplianceDesc: 'Built for Canadian childcare standards with privacy protection and safety protocols',
      
      bilingualSupport: 'Bilingual Support',
      bilingualSupportDesc: 'Seamlessly switch between English and French for inclusive communication',
      
      // Provider/Family Section (Home-3)
      supportingEveryStep: 'Supporting Every Step of the Way',
      
      forChildcareProviders: 'For Childcare Providers',
      manageChildrenDevelopment: 'Manage children\'s development',
      documentDailyActivities: 'Document daily activities',
      streamlineFamilyCommunication: 'Streamline family communication',
      handleBillingPayments: 'Handle billing & payments',
      startFreeTrial: 'Start Free Trial',
      
      forFamilies: 'For Families',
      trackChildProgress: 'Track your child\'s progress',
      stayUpdatedDailyActivities: 'Stay updated on daily activities',
      managePaymentsEasily: 'Manage payments easily',
      connectWithCaregivers: 'Connect with caregivers',
      joinAsParent: 'Join as Parent',
      
      // Testimonials Section (Home-4)
      trustedByFamilies: 'Trusted by Families and Providers Across Canada',
      
      testimonial1: 'CareConnect has revolutionized how we connect with families. Parents love seeing their child\'s day unfold in real-time!',
      testimonial2: 'Finally a solution that respects our two official languages. I can easily track my daughter\'s development.',
      
      readyToTakeNextStep: 'Ready to Take the Next Little Step?',
      joinHundredsOfProviders: 'Join hundreds of childcare providers and families across Canada who trust CareConnect.',
      startYourJourneyToday: 'Start Your Journey Today',
      
      // Footer
      footerDescription: 'Comprehensive daycare management designed for Canadian families and childcare providers.',
      product: 'Product',
      features: 'Features',
      pricing: 'Pricing',
      security: 'Security',
      company: 'Company',
      about: 'About',
      contact: 'Contact',
      careers: 'Careers',
      support: 'Support',
      helpCenter: 'Help Center',
      documentation: 'Documentation',
      privacy: 'Privacy',
      allRightsReserved: 'All rights reserved.',
      
      // Auth
      email: 'Email',
      password: 'Password',
      login: 'Login',
      register: 'Register',
      firstName: 'First Name',
      lastName: 'Last Name',
      confirmPassword: 'Confirm Password',
      phone: 'Phone',
      errors: {
        REQUIRED_FIELD: 'This field is required.',
        PASSWORD_MISMATCH: 'Passwords must match.',
        SELECT_PROGRAM_TYPE: 'Please select at least one program type.',
        SELECT_AGE_GROUP: 'Please select at least one age group.',
        FILL_ALL_REQUIRED: 'Please fill all required fields.',
        DUPLICATE_LICENSE_NUMBER: 'A daycare with that license number already exists.',
        EMAIL_EXISTS:              'An account with that email already exists.',
        INTERNAL_ERROR:            'An unexpected error occurred, please try again.',
        // … any other codes you return …
      },
      
      // Form fields
      form: {
        firstName: 'First Name',
        lastName: 'Last Name',
        email: 'Email',
        phone: 'Phone',
        password: 'Password',
        confirmPassword: 'Confirm Password',
        createAccount: 'Create Account',
        login: 'Login',
        rememberMe: 'Remember me',
        forgotPassword: 'Forgot password?',
      },
      
      // User Types
      selectUserType: 'Select User Type',
      iAmDaycare: 'I am a Daycare',
      iAmParent: 'I am a Parent',
      getStarted: 'Get Started',
      
      userTypes: {
        title: 'Choose Your Role',
        subtitle: 'Select your role to get started with CareConnect Canada',
        daycare: {
          title: 'For Childcare Providers',
          description: 'Manage your daycare operations, track children\'s development, and communicate with families',
        },
        parent: {
          title: 'For Families',
          description: 'Stay connected with your child\'s daily activities, development, and communicate with caregivers',
        },
      },
      
      // Dashboard
      dashboard: {
        goodMorning: 'Good Morning!',
        subtitle: 'Here\'s what\'s happening at your daycare today',
        todaysDate: 'Today\'s Date',
        viewChildren: 'View Children',
        stats: {
          enrolledChildren: 'Enrolled Children',
          activeStaff: 'Active Staff',
          presentToday: 'Present Today',
          todaysActivities: 'Today\'s Activities',
          recentIncidents: 'Recent Incidents',
          waitlisted: 'Waitlisted',
        },
        quickActions: {
          title: 'Quick Actions',
          addChild: 'Add Child',
          recordActivity: 'Record Activity',
          reportIncident: 'Report Incident',
          addStaff: 'Add Staff',
          createPayment: 'Create Payment',
          markAttendance: 'Mark Attendance',
        },
        recentActivity: {
          title: 'Recent Activity',
          noData: 'No data available',
        },
        todaysSchedule: {
          title: 'Today\'s Schedule',
          noData: 'No data available',
        },
        forms: {
          childName: 'Child Name',
          childNamePlaceholder: 'Enter child\'s full name',
          dateOfBirth: 'Date of Birth',
          parentEmail: 'Parent Email',
          parentEmailPlaceholder: 'parent@email.com',
          selectChild: 'Select Child',
          activityType: 'Activity Type',
          description: 'Description',
          activityDescription: 'Describe the activity...',
          incidentType: 'Incident Type',
          severity: 'Severity',
          incidentDescription: 'Describe what happened...',
          staffName: 'Staff Name',
          staffNamePlaceholder: 'Enter staff member\'s name',
          position: 'Position',
          email: 'Email',
          emailPlaceholder: 'staff@email.com',
          paymentType: 'Payment Type',
          amount: 'Amount',
          dueDate: 'Due Date',
          attendanceStatus: 'Attendance Status',
          notes: 'Notes',
          attendanceNotes: 'Optional notes...',
          addChild: 'Add Child',
          recordActivity: 'Record Activity',
          reportIncident: 'Report Incident',
          addStaff: 'Add Staff',
          createPayment: 'Create Payment',
          markAttendance: 'Mark Attendance',
        },
      },
      
      // Common
      common: {
        loading: 'Loading...',
        cancel: 'Cancel',
        logout: 'Logout',
      },
      
      // Children Management
      childrenManagement: 'Children Management',
      manageAllEnrolledChildren: 'Manage all enrolled children',
      searchChildren: 'Search children...',
      addNewChild: 'Add New Child',
      age: 'Age',
      ageGroup: 'Age Group',
      enrolled: 'Enrolled',
      active: 'Active',
      
      // Child Profile
      backToChildren: 'Back to Children',
      editChild: 'Edit Child',
      basicInformation: 'Basic Information',
      dateOfBirth: 'Date of Birth',
      enrollmentDate: 'Enrollment Date',
      status: 'Status',
      assignedStaff: 'Assigned Staff',
      noStaffAssigned: 'No staff assigned',
      recentActivities: 'Recent Activities',
      noRecentActivities: 'No recent activities',
      recentIncidents: 'Recent Incidents',
      parentGuardianInformation: 'Parent/Guardian Information',
      emergencyContacts: 'Emergency Contacts',
      allergies: 'Allergies',
      medications: 'Medications',
      medicalConditions: 'Medical Conditions',
    }
  },
  fr: {
    translation: {
      // Navigation
      signIn: 'Se connecter',
      
      // Hero Section (Home-1)
      heroTitle: 'Où chaque parcours d\'enfant compte',
      heroSubtitle: 'Gestion complète de garderie conçue pour les familles canadiennes et les fournisseurs de services de garde',
      startYourJourney: 'Commencer votre parcours',
      newToCareConnect: 'Nouveau sur CareConnect? Cliquez sur "Commencer votre parcours"',
      
      // Features Section (Home-2)
      featuresTitle: 'Tout ce dont vous avez besoin pour des soins de qualité',
      featuresSubtitle: 'Approuvé par les fournisseurs de garderie et les parents à travers le Canada',
      
      childCenteredProfiles: 'Profils centrés sur l\'enfant',
      childCenteredProfilesDesc: 'Suivi complet du développement, dossiers médicaux et documentation des étapes importantes pour chaque petit',
      
      transparentCommunication: 'Communication transparente',
      transparentCommunicationDesc: 'Mises à jour en temps réel, rapports d\'incidents et partage d\'activités quotidiennes entre soignants et familles',
      
      simplifiedBilling: 'Facturation simplifiée',
      simplifiedBillingDesc: 'Facturation automatisée, suivi des paiements et gestion financière pour des opérations sans stress',
      
      familyPortal: 'Portail familial',
      familyPortalDesc: 'Les parents restent connectés avec des photos, des mises à jour et les aventures quotidiennes de leur enfant',
      
      regulatoryCompliance: 'Conformité réglementaire',
      regulatoryComplianceDesc: 'Conçu pour les normes canadiennes de garde d\'enfants avec protection de la vie privée et protocoles de sécurité',
      
      bilingualSupport: 'Support bilingue',
      bilingualSupportDesc: 'Basculez facilement entre l\'anglais et le français pour une communication inclusive',
      
      // Provider/Family Section (Home-3)
      supportingEveryStep: 'Soutenir chaque étape du chemin',
      
      forChildcareProviders: 'Pour les fournisseurs de services de garde',
      manageChildrenDevelopment: 'Gérer le développement des enfants',
      documentDailyActivities: 'Documenter les activités quotidiennes',
      streamlineFamilyCommunication: 'Rationaliser la communication familiale',
      handleBillingPayments: 'Gérer la facturation et les paiements',
      startFreeTrial: 'Commencer l\'essai gratuit',
      
      forFamilies: 'Pour les familles',
      trackChildProgress: 'Suivre les progrès de votre enfant',
      stayUpdatedDailyActivities: 'Rester informé des activités quotidiennes',
      managePaymentsEasily: 'Gérer les paiements facilement',
      connectWithCaregivers: 'Se connecter avec les soignants',
      joinAsParent: 'Rejoindre en tant que parent',
      
      // Testimonials Section (Home-4)
      trustedByFamilies: 'Approuvé par les familles et les fournisseurs à travers le Canada',
      
      testimonial1: 'CareConnect a révolutionné notre façon de nous connecter avec les familles. Les parents adorent voir la journée de leur enfant se dérouler en temps réel!',
      testimonial2: 'Enfin une solution qui respecte nos deux langues officielles. Je peux suivre le développement de ma fille facilement.',
      
      readyToTakeNextStep: 'Prêt à franchir la prochaine petite étape?',
      joinHundredsOfProviders: 'Rejoignez des centaines de fournisseurs de services de garde et de familles à travers le Canada qui font confiance à CareConnect.',
      startYourJourneyToday: 'Commencez votre parcours aujourd\'hui',
      
      // Footer
      footerDescription: 'Gestion complète de garderie conçue pour les familles canadiennes et les fournisseurs de services de garde.',
      product: 'Produit',
      features: 'Fonctionnalités',
      pricing: 'Tarification',
      security: 'Sécurité',
      company: 'Entreprise',
      about: 'À propos',
      contact: 'Contact',
      careers: 'Carrières',
      support: 'Support',
      helpCenter: 'Centre d\'aide',
      documentation: 'Documentation',
      privacy: 'Confidentialité',
      allRightsReserved: 'Tous droits réservés.',
      
      // Auth
      email: 'Courriel',
      password: 'Mot de passe',
      login: 'Connexion',
      register: 'S\'inscrire',
      firstName: 'Prénom',
      lastName: 'Nom de famille',
      confirmPassword: 'Confirmer le mot de passe',
      phone: 'Téléphone',
      errors: {
        REQUIRED: 'Ce champ est requis.',
        PASSWORD_MISMATCH: 'Les mots de passe doivent correspondre.',
        SELECT_PROGRAM_TYPE: 'Sélectionnez au moins un type de programme.',
        SELECT_AGE_GROUP: 'Sélectionnez au moins un groupe d’âge.',
        FILL_ALL_REQUIRED: 'Veuillez remplir tous les champs obligatoires.',
        DUPLICATE_LICENSE_NUMBER: 'Une garderie avec ce numéro de licence existe déjà.',
        EMAIL_EXISTS:              'Un compte avec ce courriel existe déjà.',
        INTERNAL_ERROR:            'Une erreur inattendue est survenue, veuillez réessayer.',
      },
      
      // Form fields
      form: {
        firstName: 'Prénom',
        lastName: 'Nom de famille',
        email: 'Courriel',
        phone: 'Téléphone',
        password: 'Mot de passe',
        confirmPassword: 'Confirmer le mot de passe',
        createAccount: 'Créer un compte',
        login: 'Connexion',
        rememberMe: 'Se souvenir de moi',
        forgotPassword: 'Mot de passe oublié?',
      },
      
      // User Types
      selectUserType: 'Sélectionner le type d\'utilisateur',
      iAmDaycare: 'Je suis une garderie',
      iAmParent: 'Je suis un parent',
      getStarted: 'Commencer',
      
      userTypes: {
        title: 'Choisissez votre rôle',
        subtitle: 'Sélectionnez votre rôle pour commencer avec CareConnect Canada',
        daycare: {
          title: 'Pour les fournisseurs de services de garde',
          description: 'Gérez vos opérations de garderie, suivez le développement des enfants et communiquez avec les familles',
        },
        parent: {
          title: 'Pour les familles',
          description: 'Restez connecté avec les activités quotidiennes de votre enfant, son développement et communiquez avec les soignants',
        },
      },
      
      // Dashboard
      dashboard: {
        goodMorning: 'Bonjour!',
        subtitle: 'Voici ce qui se passe dans votre garderie aujourd\'hui',
        todaysDate: 'Date d\'aujourd\'hui',
        viewChildren: 'Voir les enfants',
        stats: {
          enrolledChildren: 'Enfants inscrits',
          activeStaff: 'Personnel actif',
          presentToday: 'Présents aujourd\'hui',
          todaysActivities: 'Activités d\'aujourd\'hui',
          recentIncidents: 'Incidents récents',
          waitlisted: 'Liste d\'attente',
        },
        quickActions: {
          title: 'Actions rapides',
          addChild: 'Ajouter un enfant',
          recordActivity: 'Enregistrer une activité',
          reportIncident: 'Signaler un incident',
          addStaff: 'Ajouter du personnel',
          createPayment: 'Créer un paiement',
          markAttendance: 'Marquer la présence',
        },
        recentActivity: {
          title: 'Activité récente',
          noData: 'Aucune donnée disponible',
        },
        todaysSchedule: {
          title: 'Horaire d\'aujourd\'hui',
          noData: 'Aucune donnée disponible',
        },
        forms: {
          childName: 'Nom de l\'enfant',
          childNamePlaceholder: 'Entrez le nom complet de l\'enfant',
          dateOfBirth: 'Date de naissance',
          parentEmail: 'Courriel du parent',
          parentEmailPlaceholder: 'parent@courriel.com',
          selectChild: 'Sélectionner un enfant',
          activityType: 'Type d\'activité',
          description: 'Description',
          activityDescription: 'Décrivez l\'activité...',
          incidentType: 'Type d\'incident',
          severity: 'Gravité',
          incidentDescription: 'Décrivez ce qui s\'est passé...',
          staffName: 'Nom du personnel',
          staffNamePlaceholder: 'Entrez le nom du membre du personnel',
          position: 'Poste',
          email: 'Courriel',
          emailPlaceholder: 'personnel@courriel.com',
          paymentType: 'Type de paiement',
          amount: 'Montant',
          dueDate: 'Date d\'échéance',
          attendanceStatus: 'Statut de présence',
          notes: 'Notes',
          attendanceNotes: 'Notes optionnelles...',
          addChild: 'Ajouter un enfant',
          recordActivity: 'Enregistrer une activité',
          reportIncident: 'Signaler un incident',
          addStaff: 'Ajouter du personnel',
          createPayment: 'Créer un paiement',
          markAttendance: 'Marquer la présence',
        },
      },
      
      // Common
      common: {
        loading: 'Chargement...',
        cancel: 'Annuler',
        logout: 'Déconnexion',
      },
      
      // Children Management
      childrenManagement: 'Gestion des enfants',
      manageAllEnrolledChildren: 'Gérer tous les enfants inscrits',
      searchChildren: 'Rechercher des enfants...',
      addNewChild: 'Ajouter un nouvel enfant',
      age: 'Âge',
      ageGroup: 'Groupe d\'âge',
      enrolled: 'Inscrit',
      active: 'Actif',
      
      // Child Profile
      backToChildren: 'Retour aux enfants',
      editChild: 'Modifier l\'enfant',
      basicInformation: 'Informations de base',
      dateOfBirth: 'Date de naissance',
      enrollmentDate: 'Date d\'inscription',
      status: 'Statut',
      assignedStaff: 'Personnel assigné',
      noStaffAssigned: 'Aucun personnel assigné',
      recentActivities: 'Activités récentes',
      noRecentActivities: 'Aucune activité récente',
      recentIncidents: 'Incidents récents',
      parentGuardianInformation: 'Informations parent/tuteur',
      emergencyContacts: 'Contacts d\'urgence',
      allergies: 'Allergies',
      medications: 'Médicaments',
      medicalConditions: 'Conditions médicales',
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;

