import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import {
  Building2,
  ArrowLeft,
  Save,
  MapPin,
  Phone,
  Mail,
  Globe,
  Users,
  FileText,
  Calendar,
  DollarSign,
  Tag,
  X,
  Loader2,
  AlertCircle
} from 'lucide-react';

import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { createOrganization, clearError } from '../store/slices/organizationSlice';

const organizationSchema = z.object({
  name: z.string().min(2, 'Organization name must be at least 2 characters').max(100, 'Organization name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  type: z.string().min(1, 'Organization type is required'),
  industry: z.string().optional(),
  address: z.string().max(200, 'Address must be less than 200 characters').optional(),
  city: z.string().max(100, 'City must be less than 100 characters').optional(),
  state: z.string().max(100, 'State must be less than 100 characters').optional(),
  zipCode: z.string().max(20, 'Zip code must be less than 20 characters').optional(),
  country: z.string().max(100, 'Country must be less than 100 characters').optional(),
  phone: z.string().max(20, 'Phone must be less than 20 characters')
    .regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,9}$/, 'Invalid phone number format')
    .optional(),
  email: z.string().email('Invalid email address').optional(),
  website: z.string().url('Invalid website URL').optional(),
  employeeCount: z.number().min(0, 'Employee count must be positive').optional(),
  foundedYear: z.number().min(1800, 'Founded year must be after 1800').max(new Date().getFullYear(), 'Founded year cannot be in the future').optional(),
  revenue: z.number().min(0, 'Revenue must be positive').optional(),
  status: z.enum(['active', 'inactive', 'pending']).optional()
});

const organizationTypes = [
  'Corporation',
  'LLC',
  'Partnership',
  'Sole Proprietorship',
  'Non-Profit',
  'Government',
  'Educational',
  'Healthcare',
  'Technology',
  'Manufacturing',
  'Retail',
  'Services',
  'Other'
];

const industries = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Manufacturing',
  'Retail',
  'Construction',
  'Transportation',
  'Energy',
  'Agriculture',
  'Entertainment',
  'Real Estate',
  'Professional Services',
  'Government',
  'Non-Profit',
  'Other'
];

const CreateOrganization = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');

  const { isLoading, error } = useSelector((state) => state.organizations);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      status: 'active'
    }
  });

  // Clear error when component mounts
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Check for authentication token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to continue');
      navigate('/login');
    }
  }, [navigate]);

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const onSubmit = async (data) => {
    try {
      // Check token before submission
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Session expired. Please login again.');
        navigate('/login');
        return;
      }

      // Create organization data object
      const organizationData = {
        name: data.name,
        type: data.type,
        description: data.description || '',
        industry: data.industry || '',
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        zipCode: data.zipCode || '',
        country: data.country || '',
        phone: data.phone || '',
        email: data.email || '',
        website: data.website || '',
        employeeCount: data.employeeCount ? Number(data.employeeCount) : 0,
        foundedYear: data.foundedYear ? Number(data.foundedYear) : null,
        revenue: data.revenue ? Number(data.revenue) : 0,
        status: data.status || 'active',
        tags: tags
      };

      const result = await dispatch(createOrganization(organizationData)).unwrap();
      
      toast.success('Organization created successfully!');
      navigate('/dashboard/organizations');
    } catch (error) {
      // Handle different error types properly
      const errorMessage = typeof error === 'string' ? error : 
                          error?.message || 
                          'Failed to create organization';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard/organizations')}
            className="mb-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Organizations
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Organization</h1>
            <p className="text-gray-600">Fill in the details below to create a new organization</p>
          </div>
        </div>

        {/* Main Form Card */}
        <Card className="shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl font-bold flex items-center gap-3">
              <Building2 className="w-8 h-8" />
              Organization Information
            </CardTitle>
            <CardDescription className="text-green-100">
              Enter all the relevant details for your organization
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8">
            {/* Error Display */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-red-700">
                  {typeof error === 'string' ? error : error?.message || 'An error occurred'}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Basic Information Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <Label htmlFor="name" className="text-base font-medium">
                      Organization Name *
                    </Label>
                    <Input
                      id="name"
                      {...register('name')}
                      placeholder="Enter organization name"
                      className={`mt-2 ${errors.name ? 'border-red-500' : ''}`}
                    />
                    {errors.name && (
                      <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="type" className="text-base font-medium">
                      Organization Type *
                    </Label>
                    <Select onValueChange={(value) => setValue('type', value)}>
                      <SelectTrigger className={`mt-2 ${errors.type ? 'border-red-500' : ''}`}>
                        <SelectValue placeholder="Select organization type" />
                      </SelectTrigger>
                      <SelectContent>
                        {organizationTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.type && (
                      <p className="text-red-600 text-sm mt-1">{errors.type.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="industry" className="text-base font-medium">
                      Industry
                    </Label>
                    <Select onValueChange={(value) => setValue('industry', value)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {industries.map((industry) => (
                          <SelectItem key={industry} value={industry}>
                            {industry}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="description" className="text-base font-medium">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      {...register('description')}
                      placeholder="Brief description of the organization"
                      className={`mt-2 min-h-[100px] ${errors.description ? 'border-red-500' : ''}`}
                    />
                    {errors.description && (
                      <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Contact Information Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="email" className="text-base font-medium flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      {...register('email')}
                      placeholder="organization@example.com"
                      className={`mt-2 ${errors.email ? 'border-red-500' : ''}`}
                    />
                    {errors.email && (
                      <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-base font-medium flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      {...register('phone')}
                      placeholder="+1 (555) 123-4567"
                      className={`mt-2 ${errors.phone ? 'border-red-500' : ''}`}
                    />
                    {errors.phone && (
                      <p className="text-red-600 text-sm mt-1">{errors.phone.message}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="website" className="text-base font-medium flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Website
                    </Label>
                    <Input
                      id="website"
                      type="url"
                      {...register('website')}
                      placeholder="https://www.example.com"
                      className={`mt-2 ${errors.website ? 'border-red-500' : ''}`}
                    />
                    {errors.website && (
                      <p className="text-red-600 text-sm mt-1">{errors.website.message}</p>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Address Information Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Address Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <Label htmlFor="address" className="text-base font-medium">
                      Street Address
                    </Label>
                    <Input
                      id="address"
                      {...register('address')}
                      placeholder="123 Main Street"
                      className={`mt-2 ${errors.address ? 'border-red-500' : ''}`}
                    />
                    {errors.address && (
                      <p className="text-red-600 text-sm mt-1">{errors.address.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="city" className="text-base font-medium">
                      City
                    </Label>
                    <Input
                      id="city"
                      {...register('city')}
                      placeholder="New York"
                      className={`mt-2 ${errors.city ? 'border-red-500' : ''}`}
                    />
                    {errors.city && (
                      <p className="text-red-600 text-sm mt-1">{errors.city.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="state" className="text-base font-medium">
                      State/Province
                    </Label>
                    <Input
                      id="state"
                      {...register('state')}
                      placeholder="NY"
                      className={`mt-2 ${errors.state ? 'border-red-500' : ''}`}
                    />
                    {errors.state && (
                      <p className="text-red-600 text-sm mt-1">{errors.state.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="zipCode" className="text-base font-medium">
                      ZIP/Postal Code
                    </Label>
                    <Input
                      id="zipCode"
                      {...register('zipCode')}
                      placeholder="10001"
                      className={`mt-2 ${errors.zipCode ? 'border-red-500' : ''}`}
                    />
                    {errors.zipCode && (
                      <p className="text-red-600 text-sm mt-1">{errors.zipCode.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="country" className="text-base font-medium">
                      Country
                    </Label>
                    <Input
                      id="country"
                      {...register('country')}
                      placeholder="United States"
                      className={`mt-2 ${errors.country ? 'border-red-500' : ''}`}
                    />
                    {errors.country && (
                      <p className="text-red-600 text-sm mt-1">{errors.country.message}</p>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Additional Information Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Additional Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="employeeCount" className="text-base font-medium flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Employee Count
                    </Label>
                    <Input
                      id="employeeCount"
                      type="number"
                      min="0"
                      {...register('employeeCount', { valueAsNumber: true })}
                      placeholder="50"
                      className={`mt-2 ${errors.employeeCount ? 'border-red-500' : ''}`}
                    />
                    {errors.employeeCount && (
                      <p className="text-red-600 text-sm mt-1">{errors.employeeCount.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="foundedYear" className="text-base font-medium flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Founded Year
                    </Label>
                    <Input
                      id="foundedYear"
                      type="number"
                      min="1800"
                      max={new Date().getFullYear()}
                      {...register('foundedYear', { valueAsNumber: true })}
                      placeholder="2020"
                      className={`mt-2 ${errors.foundedYear ? 'border-red-500' : ''}`}
                    />
                    {errors.foundedYear && (
                      <p className="text-red-600 text-sm mt-1">{errors.foundedYear.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="revenue" className="text-base font-medium flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Annual Revenue ($)
                    </Label>
                    <Input
                      id="revenue"
                      type="number"
                      min="0"
                      {...register('revenue', { valueAsNumber: true })}
                      placeholder="1000000"
                      className={`mt-2 ${errors.revenue ? 'border-red-500' : ''}`}
                    />
                    {errors.revenue && (
                      <p className="text-red-600 text-sm mt-1">{errors.revenue.message}</p>
                    )}
                  </div>
                </div>

                {/* Tags Section */}
                <div className="mt-6">
                  <Label className="text-base font-medium flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Tags
                  </Label>
                  <div className="mt-2 flex gap-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="Add a tag"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      className="flex-1"
                    />
                    <Button type="button" onClick={addTag} variant="outline">
                      Add
                    </Button>
                  </div>
                  {tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {tag}
                          <X
                            className="w-3 h-3 cursor-pointer hover:text-red-600"
                            onClick={() => removeTag(tag)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-6">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg font-medium"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Creating Organization...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      Create Organization
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateOrganization;