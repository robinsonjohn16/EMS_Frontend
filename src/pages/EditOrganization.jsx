import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
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
  Upload,
  X,
  Loader2
} from 'lucide-react';

import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { 
  fetchOrganizationById, 
  updateOrganization, 
  clearError,
  clearCurrentOrganization 
} from '../store/slices/organizationSlice';

const organizationSchema = z.object({
  name: z.string().min(2, 'Organization name must be at least 2 characters').max(100, 'Organization name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  type: z.string().min(1, 'Organization type is required'),
  industry: z.string().optional(),
  location: z.string().max(100, 'Location must be less than 100 characters').optional(),
  address: z.string().max(200, 'Address must be less than 200 characters').optional(),
  city: z.string().max(100, 'City must be less than 100 characters').optional(),
  state: z.string().max(100, 'State must be less than 100 characters').optional(),
  zipCode: z.string().max(20, 'Zip code must be less than 20 characters').optional(),
  country: z.string().max(100, 'Country must be less than 100 characters').optional(),
  phone: z.string().max(20, 'Phone must be less than 20 characters')
    .regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,9}$/, 'Invalid phone number format')
    .optional()
    .or(z.literal('')),
  email: z.string().email('Invalid email address').max(100, 'Email must be less than 100 characters').optional().or(z.literal('')),
  website: z.string().url('Invalid website URL').max(200, 'Website URL must be less than 200 characters').optional().or(z.literal('')),
  employeeCount: z.coerce.number().min(0, 'Employee count must be positive').optional(),
  foundedYear: z.coerce.number().min(1800, 'Invalid founded year').max(new Date().getFullYear(), 'Founded year cannot be in the future').optional(),
  revenue: z.coerce.number().min(0, 'Revenue must be positive').optional(),
  status: z.enum(['active', 'inactive']).default('active'),
  tags: z.array(z.string().max(50, 'Tag must be less than 50 characters')).optional(),
});

const EditOrganization = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentOrganization, loading, error } = useSelector((state) => state.organizations);
  
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      status: 'active',
      type: '',
      employeeCount: 0,
      revenue: 0,
    }
  });

  const organizationTypes = [
    'Corporation',
    'LLC',
    'Partnership',
    'Non-Profit',
    'Government',
    'Educational',
    'Healthcare',
    'Technology',
    'Manufacturing',
    'Retail',
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
    'Other'
  ];

  useEffect(() => {
    const loadOrganization = async () => {
      try {
        await dispatch(fetchOrganizationById(id)).unwrap();
      } catch (error) {
        console.error('Failed to fetch organization:', error);
        navigate('/dashboard/organizations');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadOrganization();
    }

    return () => {
      dispatch(clearCurrentOrganization());
    };
  }, [id, dispatch, navigate]);

  useEffect(() => {
    if (currentOrganization) {
      // Populate form with current organization data
      Object.keys(currentOrganization).forEach(key => {
        if (key === 'tags' && Array.isArray(currentOrganization[key])) {
          setTags(currentOrganization[key]);
          setValue('tags', currentOrganization[key]);
        } else if (key === 'logo' && currentOrganization[key]) {
          setLogoPreview(currentOrganization[key]);
        } else if (currentOrganization[key] !== null && currentOrganization[key] !== undefined) {
          setValue(key, currentOrganization[key]);
        }
      });
    }
  }, [currentOrganization, setValue]);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      const newTags = [...tags, tagInput.trim()];
      setTags(newTags);
      setValue('tags', newTags);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    setTags(newTags);
    setValue('tags', newTags);
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    try {
      // Create FormData for file upload
      const formData = new FormData();
      
      // Append all form fields
      Object.keys(data).forEach(key => {
        if (data[key] !== undefined && data[key] !== '') {
          if (key === 'tags') {
            formData.append(key, JSON.stringify(data[key]));
          } else {
            formData.append(key, data[key]);
          }
        }
      });

      // Append logo if a new one was selected
      if (logo) {
        formData.append('logo', logo);
      }

      await dispatch(updateOrganization({ id, data: formData })).unwrap();
      toast.success('Organization updated successfully');
      navigate(`/dashboard/organizations/${id}`);
    } catch (error) {
      toast.error(error || 'Failed to update organization');
      console.error('Failed to update organization:', error);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? All changes will be lost.')) {
      navigate('/dashboard/organizations');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading organization...</span>
        </div>
      </div>
    );
  }

  if (!currentOrganization) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Organization not found</h2>
          <p className="text-gray-600 mb-4">The organization you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/dashboard/organizations')}>
            Back to Organizations
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard/organizations')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Organizations
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Organization</h1>
            <p className="text-sm text-gray-500">Update organization information</p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-sm text-red-600">{error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card className="p-6">
          <div className="flex items-center mb-6">
            <Building2 className="h-5 w-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Label htmlFor="name">Organization Name *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Enter organization name"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="type">Organization Type *</Label>
              <select
                id="type"
                {...register('type')}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                  errors.type ? 'border-red-500' : ''
                }`}
              >
                <option value="">Select type</option>
                {organizationTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {errors.type && (
                <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="industry">Industry</Label>
              <select
                id="industry"
                {...register('industry')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select industry</option>
                {industries.map(industry => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                {...register('description')}
                rows={4}
                placeholder="Describe the organization..."
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </Card>

        {/* Contact Information */}
        <Card className="p-6">
          <div className="flex items-center mb-6">
            <Phone className="h-5 w-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                {...register('phone')}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="contact@organization.com"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                {...register('website')}
                placeholder="https://www.organization.com"
                className={errors.website ? 'border-red-500' : ''}
              />
              {errors.website && (
                <p className="mt-1 text-sm text-red-600">{errors.website.message}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Address Information */}
        <Card className="p-6">
          <div className="flex items-center mb-6">
            <MapPin className="h-5 w-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Address Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Label htmlFor="address">Street Address</Label>
              <Input
                id="address"
                {...register('address')}
                placeholder="123 Main Street"
              />
            </div>

            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                {...register('city')}
                placeholder="New York"
              />
            </div>

            <div>
              <Label htmlFor="state">State/Province</Label>
              <Input
                id="state"
                {...register('state')}
                placeholder="NY"
              />
            </div>

            <div>
              <Label htmlFor="zipCode">ZIP/Postal Code</Label>
              <Input
                id="zipCode"
                {...register('zipCode')}
                placeholder="10001"
              />
            </div>

            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                {...register('country')}
                placeholder="United States"
              />
            </div>
          </div>
        </Card>

        {/* Organization Details */}
        <Card className="p-6">
          <div className="flex items-center mb-6">
            <Users className="h-5 w-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Organization Details</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="employeeCount">Employee Count</Label>
              <Input
                id="employeeCount"
                type="number"
                {...register('employeeCount', { valueAsNumber: true })}
                placeholder="0"
                min="0"
              />
            </div>

            <div>
              <Label htmlFor="foundedYear">Founded Year</Label>
              <Input
                id="foundedYear"
                type="number"
                {...register('foundedYear', { valueAsNumber: true })}
                placeholder="2020"
                min="1800"
                max={new Date().getFullYear()}
              />
            </div>

            <div>
              <Label htmlFor="revenue">Annual Revenue ($)</Label>
              <Input
                id="revenue"
                type="number"
                {...register('revenue', { valueAsNumber: true })}
                placeholder="0"
                min="0"
              />
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                {...register('status')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Tags */}
        <Card className="p-6">
          <div className="flex items-center mb-6">
            <Tag className="h-5 w-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Tags</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add a tag..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              />
              <Button type="button" onClick={handleAddTag} variant="outline">
                Add Tag
              </Button>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Logo Upload */}
        <Card className="p-6">
          <div className="flex items-center mb-6">
            <Upload className="h-5 w-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Organization Logo</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <input
                type="file"
                id="logo"
                accept="image/*"
                onChange={handleLogoChange}
                className="hidden"
              />
              <Label
                htmlFor="logo"
                className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Upload className="mr-2 h-4 w-4" />
                {logoPreview ? 'Change Logo' : 'Choose Logo'}
              </Label>
              {logo && (
                <span className="text-sm text-gray-500">{logo.name}</span>
              )}
            </div>

            {logoPreview && (
              <div className="mt-4">
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  className="h-20 w-20 object-cover rounded-lg border border-gray-200"
                />
              </div>
            )}
          </div>
        </Card>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="min-w-[120px]"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Updating...
              </div>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Update Organization
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditOrganization;