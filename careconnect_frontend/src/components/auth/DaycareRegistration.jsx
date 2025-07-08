import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Building, Mail, Phone, MapPin, Users, Info } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';


export const DaycareRegistration = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    
    // Daycare Information
    daycareName: '',
    licenseNumber: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    daycarePhone: '',
    daycareEmail: '',
    capacity: '',
    description: '',
    
    // Canadian Government Program Types
    programTypes: {
      daycare: false,
      family_day_homes: false,
      out_of_school_care: false,
      preschool: false,
      group_family_child_care: false
    },
    
    // Canadian Government Age Groups
    ageGroups: {
      under_19_months: false,
      '19_months_to_kindergarten': false,
      kindergarten_to_grade_6: false
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const provinces = [
    { code: 'AB', name: 'Alberta' },
    { code: 'BC', name: 'British Columbia' },
    { code: 'MB', name: 'Manitoba' },
    { code: 'NB', name: 'New Brunswick' },
    { code: 'NL', name: 'Newfoundland and Labrador' },
    { code: 'NS', name: 'Nova Scotia' },
    { code: 'ON', name: 'Ontario' },
    { code: 'PE', name: 'Prince Edward Island' },
    { code: 'QC', name: 'Quebec' },
    { code: 'SK', name: 'Saskatchewan' },
    { code: 'NT', name: 'Northwest Territories' },
    { code: 'NU', name: 'Nunavut' },
    { code: 'YT', name: 'Yukon' }
  ];

  // Canadian Government Program Types with descriptions
  const programTypes = [
    {
      id: 'daycare',
      name: 'Daycare',
      description: 'Licensed child care program providing care to infants, preschool children, and kindergarten children for four or more consecutive hours in each day the program is provided. Daycares may serve children from birth to kindergarten.'
    },
    {
      id: 'family_day_homes',
      name: 'Family Day Homes',
      description: 'Approved program where Jobs, Economy and Trade has entered into an agreement with a family day home agency to coordinate and monitor the provision of child care in the private residence of one or more program educators. Family day home programs do not provide care for more than six children in each private residence. Family day homes may serve children from ages 0-12.'
    },
    {
      id: 'out_of_school_care',
      name: 'Out-of-School Care',
      description: 'Licensed child care program providing care to kindergarten and school-aged children in any or all of the following periods: before-and-after school, during the lunch hour, or when school is closed. Out-of-school care programs may serve children from kindergarten until before they are 13 years of age, or a child of 13 or 14 years of age who requires care because of a special need.'
    },
    {
      id: 'preschool',
      name: 'Preschool',
      description: 'Licensed child care program providing care to preschool children and kindergarten children for four or less hours per child in each day that the program is provided. Preschools may serve children who are at least 19 months old to kindergarten.'
    },
    {
      id: 'group_family_child_care',
      name: 'Group Family Child Care',
      description: 'Licensed child care program providing care in the private residence of the licence holder to infants, preschool children, kindergarten children, and school-aged children. Group family child care providers may serve children from ages 0-12.'
    }
  ];

  // Canadian Government Age Groups
  const ageGroups = [
    {
      id: 'under_19_months',
      name: 'Under 19 months of age',
      description: 'Infants and very young toddlers'
    },
    {
      id: '19_months_to_kindergarten',
      name: '19 months old to kindergarten',
      description: 'Toddlers and preschool children'
    },
    {
      id: 'kindergarten_to_grade_6',
      name: 'Kindergarten to Grade 6',
      description: 'School-aged children'
    }
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('programTypes.')) {
      const programType = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        programTypes: {
          ...prev.programTypes,
          [programType]: checked
        }
      }));
    } else if (name.startsWith('ageGroups.')) {
      const ageGroup = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        ageGroups: {
          ...prev.ageGroups,
          [ageGroup]: checked
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // setError('');
    // setSuccess('');
    toast.dismiss();

    // Validation
    // if (formData.password !== formData.confirmPassword) {
    //   // setError('Passwords do not match');
    //   toast.error('Passwords do not match');
    //   setLoading(false);
    //   return;
    // }

    // if (formData.password.length < 8) {
    //   setError('Password must be at least 8 characters long');
    //   setLoading(false);
    //   return;
    // }

    // Check if at least one program type is selected
    const selectedProgramTypes = Object.keys(formData.programTypes).filter(key => formData.programTypes[key]);
    // if (selectedProgramTypes.length === 0) {
    //   setError('Please select at least one program type');
    //   setLoading(false);
    //   return;
    // }

    // Check if at least one age group is selected
    const selectedAgeGroups = Object.keys(formData.ageGroups).filter(key => formData.ageGroups[key]);
    // if (selectedAgeGroups.length === 0) {
    //   setError('Please select at least one age group');
    //   setLoading(false);
    //   return;
    // }

    
    // Prepare registration data
    const registrationData = {
      user_type: 'daycare',
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      daycare_info: {
        name: formData.daycareName,
        license_number: formData.licenseNumber,
        address: formData.address,
        city: formData.city,
        province: formData.province,
        postal_code: formData.postalCode,
        phone: formData.daycarePhone,
        email: formData.daycareEmail,
        capacity: parseInt(formData.capacity),
        description: formData.description,
        program_types: selectedProgramTypes,
        age_groups: selectedAgeGroups
      }
    };

    // clear any previous field highlights
    setFieldErrors({});
    const result = await register(registrationData);
    
    if (result.success) {
      // setSuccess('Registration successful! Please check your email for verification instructions.');
      // setTimeout(() => {
      //   navigate('/login');
      // }, 3000);
      toast.success('Registration successful! Redirecting to login…');
      setTimeout(() => navigate('/login'), 2500);
    } else {

      // --- CLIENT‐SIDE REQUIRED FIELD CHECKS ---

      const errs = {};
      if (result.code === 'DUPLICATE_LICENSE_NUMBER') {
          errs.licenseNumber = result.error;
      }
      if (result.code === 'PASSWORD_TOO_WEAK') {
          errs.password = result.error;
      }
      if (!formData.firstName.trim())      errs.firstName      = t('errors.REQUIRED');
      if (!formData.lastName.trim())       errs.lastName       = t('errors.REQUIRED');
      if (!formData.email.trim())          errs.email          = t('errors.REQUIRED');
      if (!formData.password)              errs.password       = t('errors.REQUIRED');
      if (formData.password !== formData.confirmPassword)
        errs.confirmPassword = t('errors.PASSWORD_MISMATCH');
      if (!formData.daycareName.trim())    errs.daycareName    = t('errors.REQUIRED');
      if (!formData.licenseNumber.trim())  errs.licenseNumber  = t('errors.REQUIRED');
      if (!formData.address.trim())        errs.address        = t('errors.REQUIRED');
      if (!formData.city.trim())           errs.city           = t('errors.REQUIRED');
      if (!formData.province)              errs.province       = t('errors.REQUIRED');
      if (!formData.postalCode.trim())     errs.postalCode     = t('errors.REQUIRED');
      if (!formData.capacity)              errs.capacity       = t('errors.REQUIRED');
      // at least one program type
      if (Object.values(formData.programTypes).every(v => !v))
      errs.programTypes = t('errors.SELECT_PROGRAM_TYPE');
      // at least one age group
      if (Object.values(formData.ageGroups).every(v => !v))
        errs.ageGroups = t('errors.SELECT_AGE_GROUP');

      // 3) if any inline errors, bail out
      if (Object.keys(errs).length > 0) {
        setFieldErrors(errs);
        // show the first error as a toast
        toast.error(Object.values(errs)[0]);
        setLoading(false);
        return;
      }
      setFieldErrors(errs);
      // setError(result.error);
      toast.error(result.error, { duration: 4000 });
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen hero-bg py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/register')}
            className="text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to User Selection
          </Button>
        </div>

        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full gradient-bg mb-4">
              <Building className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              Daycare Registration
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Join CareConnect Canada as a daycare provider
            </p>
          </CardHeader>
          
          <CardContent className="space-y-8">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Personal Information
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={`border ${
                        fieldErrors.firstName ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {fieldErrors.firstName && (
                      <p className="text-sm text-red-600">{fieldErrors.firstName}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={`border ${
                        fieldErrors.lastName ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {fieldErrors.lastName && (
                      <p className="text-sm text-red-600">{fieldErrors.lastName}</p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`border ${
                        fieldErrors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {fieldErrors.email && (
                      <p className="text-sm text-red-600">{fieldErrors.email}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      className="border-gray-300"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`border ${
                        fieldErrors.password ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {fieldErrors.password && (
                      <p className="text-sm text-red-600">{fieldErrors.password}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`border ${
                        fieldErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {fieldErrors.confirmPassword && (
                      <p className="text-sm text-red-600">{fieldErrors.confirmPassword}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Daycare Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  Daycare Information
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="daycareName">Daycare Name</Label>
                    <Input
                      id="daycareName"
                      name="daycareName"
                      value={formData.daycareName}
                      onChange={handleChange}
                      className={`border ${
                        fieldErrors.daycareName ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {fieldErrors.daycareName && (
                      <p className="text-sm text-red-600">{fieldErrors.daycareName}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="licenseNumber">License Number</Label>
                    <Input
                      id="licenseNumber"
                      name="licenseNumber"
                      value={formData.licenseNumber}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 rounded ${
                        fieldErrors.licenseNumber ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {fieldErrors.licenseNumber && (
                      <p className="mt-1 text-sm text-red-600">
                        {fieldErrors.licenseNumber}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Street Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className={`border ${
                      fieldErrors.address ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {fieldErrors.address && (
                    <p className="text-sm text-red-600">{fieldErrors.address}</p>
                  )}
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className={`border ${
                        fieldErrors.city ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {fieldErrors.city && (
                      <p className="text-sm text-red-600">{fieldErrors.city}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="province">Province</Label>
                    <select
                      id="province"
                      name="province"
                      value={formData.province}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 ${
                        fieldErrors.province
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-emerald-500'
                      }`}
                    >
                      <option value="">Select Province</option>
                      {provinces.map(province => (
                        <option key={province.code} value={province.code}>
                          {province.name}
                        </option>
                      ))}
                    </select>
                    {fieldErrors.province && (
                      <p className="text-sm text-red-600">{fieldErrors.province}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleChange}
                      className={`border ${
                        fieldErrors.postalCode ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {fieldErrors.postalCode && (
                      <p className="text-sm text-red-600">{fieldErrors.postalCode}</p>
                    )}

                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="daycarePhone">Daycare Phone</Label>
                    <Input
                      id="daycarePhone"
                      name="daycarePhone"
                      type="tel"
                      value={formData.daycarePhone}
                      onChange={handleChange}
                      className="border-gray-300"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="daycareEmail">Daycare Email</Label>
                    <Input
                      id="daycareEmail"
                      name="daycareEmail"
                      type="email"
                      value={formData.daycareEmail}
                      onChange={handleChange}
                      className="border-gray-300"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="capacity">Maximum Capacity</Label>
                  <Input
                    id="capacity"
                    name="capacity"
                    type="number"
                    min="1"
                    value={formData.capacity}
                    onChange={handleChange}
                    className={`border ${
                      fieldErrors.capacity ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {fieldErrors.capacity && (
                    <p className="text-sm text-red-600">{fieldErrors.capacity}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="border-gray-300"
                    placeholder="Brief description of your daycare..."
                  />
                </div>
              </div>

              {/* Canadian Government Program Types */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center">
                  <Info className="h-5 w-5 mr-2" />
                  Type of Program (select all that apply)
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Select the types of programs your facility offers according to Canadian government classifications:
                </p>
                
                <div className="space-y-4">
                  {programTypes.map(program => (
                    <div key={program.id} className="border border-gray-200 rounded-lg p-4 hover:border-emerald-300 transition-colors">
                      <div className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          id={`programTypes.${program.id}`}
                          name={`programTypes.${program.id}`}
                          checked={formData.programTypes[program.id]}
                          onChange={handleChange}
                          className="mt-1 h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                        />
                        <div className="flex-1">
                          <label htmlFor={`programTypes.${program.id}`} className="font-medium text-gray-900 cursor-pointer">
                            {program.name}
                          </label>
                          <p className="text-sm text-gray-600 mt-1">
                            {program.description}
                          </p>
                          {fieldErrors.programTypes && (
                            <p className="text-sm text-red-600 mb-2">
                              {fieldErrors.programTypes}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Canadian Government Age Groups */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Age Group (select all that apply)
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Select the age groups your facility serves according to Canadian government classifications:
                </p>
                
                <div className="space-y-3">
                  {ageGroups.map(ageGroup => (
                    <div key={ageGroup.id} className="border border-gray-200 rounded-lg p-4 hover:border-emerald-300 transition-colors">
                      <div className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          id={`ageGroups.${ageGroup.id}`}
                          name={`ageGroups.${ageGroup.id}`}
                          checked={formData.ageGroups[ageGroup.id]}
                          onChange={handleChange}
                          className="mt-1 h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                        />
                        <div className="flex-1">
                          <label htmlFor={`ageGroups.${ageGroup.id}`} className="font-medium text-gray-900 cursor-pointer">
                            {ageGroup.name}
                          </label>
                          <p className="text-sm text-gray-600 mt-1">
                            {ageGroup.description}
                          </p>
                          {fieldErrors.ageGroups && (
                            <p className="text-sm text-red-600 mb-2">
                              {fieldErrors.ageGroups}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full gradient-bg hover:opacity-90 text-white py-3 text-lg font-semibold"
                >
                  {loading ? 'Creating Account...' : 'Create Daycare Account'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

