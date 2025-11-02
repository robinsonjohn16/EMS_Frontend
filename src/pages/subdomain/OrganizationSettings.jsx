import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { Building2, Save, Settings, MapPin, Phone, Globe, Users, CalendarClock, Upload } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import { Alert, AlertDescription } from '../../components/ui/alert';
import tenantApi from '../../services/tenantApi';
import { useTenantAuth } from '../../hooks/useTenantAuth';
import { getAssetUrl } from '../../lib/assets';

// Form validation schema
const organizationSchema = z.object({
  name: z.string().min(2, 'Organization name must be at least 2 characters'),
  description: z.string().optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional(),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  industry: z.string().optional(),
  establishedYear: z.string().optional(),
  employeeCount: z.string().optional(),
});

const OrganizationSettings = () => {
  const { user, isManager } = useTenantAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [organization, setOrganization] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [logoUploading, setLogoUploading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: '',
      description: '',
      email: '',
      phone: '',
      website: '',
      address: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
      industry: '',
      establishedYear: '',
      employeeCount: '',
    },
  });

  // Check if user has permission
  useEffect(() => {
    if (!isManager()) {
      toast.error('You do not have permission to access organization settings');
      // Redirect to dashboard or show error
    }
  }, [isManager]);

  // Fetch organization data
  useEffect(() => {
    const fetchOrganizationData = async () => {
      try {
        setLoading(true);
        // Try to get organization from user context first
        if (user?.organization) {
          setOrganization(user.organization);
          setLogoPreview(getAssetUrl(user.organization.logo));
          reset({
            name: user.organization.name || '',
            description: user.organization.description || '',
            email: user.organization.email || '',
            phone: user.organization.phone || '',
            website: user.organization.website || '',
            address: user.organization.address || '',
            city: user.organization.city || '',
            state: user.organization.state || '',
            country: user.organization.country || '',
            postalCode: user.organization.postalCode || '',
            industry: user.organization.industry || '',
            establishedYear: user.organization.establishedYear || '',
            employeeCount: user.organization.employeeCount || '',
          });
        } else {
          // Fetch from API if not in user context
          const response = await tenantApi.organization.getBySubdomain(window.location.hostname.split('.')[0]);
          setOrganization(response.data);
          setLogoPreview(getAssetUrl(response.data.logo));
          reset({
            name: response.data.name || '',
            description: response.data.description || '',
            email: response.data.email || '',
            phone: response.data.phone || '',
            website: response.data.website || '',
            address: response.data.address || '',
            city: response.data.city || '',
            state: response.data.state || '',
            country: response.data.country || '',
            postalCode: response.data.postalCode || '',
            industry: response.data.industry || '',
            establishedYear: response.data.establishedYear || '',
            employeeCount: response.data.employeeCount || '',
          });
        }
      } catch (error) {
        console.error('Error fetching organization data:', error);
        toast.error('Failed to load organization data');
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchOrganizationData();
    }
  }, [user?.id, reset]);

  const onSubmit = async (data) => {
    try {
      setSaving(true);
      // Update organization settings
      const response = await tenantApi.organization.updateSettings(organization._id, data);
      if (response.data.success) {
        toast.success('Organization settings updated successfully');
        setOrganization(response.data.organization);
      } else {
        toast.error('Failed to update organization settings');
      }
    } catch (error) {
      console.error('Error updating organization:', error);
      toast.error(error.response?.data?.message || 'Failed to update organization settings');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = async () => {
    if (!logoFile) {
      toast.error('Please choose a logo file first');
      return;
    }
    try {
      setLogoUploading(true);
      const res = await tenantApi.organization.updateLogo(organization._id, logoFile);
      if (res?.data?.success) {
        const updated = res.data.organization || {};
        setOrganization(updated);
        setLogoPreview(getAssetUrl(updated.logo));
        setLogoFile(null);
        toast.success('Organization logo updated');
      } else {
        toast.error(res?.data?.message || 'Failed to update logo');
      }
    } catch (err) {
      console.error('Logo upload error:', err);
      toast.error(err?.response?.data?.message || 'Failed to upload logo');
    } finally {
      setLogoUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 max-w-4xl">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading organization settings...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isManager()) {
    return (
      <div className="container mx-auto py-6 max-w-4xl">
        <Alert className="bg-red-50 border-red-200">
          <AlertDescription className="text-red-800">
            You do not have permission to access organization settings. Only managers can modify organization settings.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Organization Settings</h1>
        <p className="text-gray-600">Manage your organization's information and settings</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building2 className="h-5 w-5" />
              <span>Basic Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Organization Name *</Label>
                <Input
                  id="name"
                  {...register('name')}
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs">{errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Select onValueChange={(value) => setValue('industry', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="consulting">Consulting</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register('description')}
                rows={3}
                placeholder="Brief description of your organization"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="establishedYear">Established Year</Label>
                <Input
                  id="establishedYear"
                  type="number"
                  min="1800"
                  max={new Date().getFullYear()}
                  {...register('establishedYear')}
                  placeholder="e.g., 2020"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employeeCount">Total Employees</Label>
                <Input
                  id="employeeCount"
                  type="number"
                  min="1"
                  {...register('employeeCount')}
                  placeholder="e.g., 50"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Phone className="h-5 w-5" />
              <span>Contact Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  className={errors.email ? 'border-red-500' : ''}
                  placeholder="contact@company.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs">{errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  {...register('phone')}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                {...register('website')}
                className={errors.website ? 'border-red-500' : ''}
                placeholder="https://www.company.com"
              />
              {errors.website && (
                <p className="text-red-500 text-xs">{errors.website.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Address Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                {...register('address')}
                rows={3}
                placeholder="Street address"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  {...register('city')}
                  placeholder="City"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State/Province</Label>
                <Input
                  id="state"
                  {...register('state')}
                  placeholder="State or Province"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  {...register('country')}
                  placeholder="Country"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  id="postalCode"
                  {...register('postalCode')}
                  placeholder="Postal Code"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Organization Logo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="h-5 w-5" />
              <span>Organization Logo</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {logoPreview && (
              <div className="flex items-center">
                <img src={logoPreview} alt="Organization Logo" className="h-16 w-auto mr-4 rounded" />
                <span className="text-gray-600 text-sm">Current logo preview</span>
              </div>
            )}
            <div className="flex items-center space-x-4">
              <input
                type="file"
                id="orgLogo"
                accept="image/*"
                onChange={handleLogoChange}
                className="hidden"
              />
              <Label
                htmlFor="orgLogo"
                className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Upload className="mr-2 h-4 w-4" />
                {logoFile ? 'Change Logo' : 'Choose Logo'}
              </Label>
              <Button
                type="button"
                onClick={handleLogoUpload}
                disabled={logoUploading || !logoFile}
              >
                {logoUploading ? 'Uploading...' : 'Upload Logo'}
              </Button>
            </div>
            {logoFile && (
              <p className="text-xs text-gray-500">Selected: {logoFile.name}</p>
            )}
          </CardContent>
        </Card>

        {/* Organization Statistics Display */}
        {organization && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Organization Statistics</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">Total Employees</p>
                      <p className="text-2xl font-bold text-blue-600">{organization.employeeCount || 'N/A'}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CalendarClock className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-green-900">Established</p>
                      <p className="text-lg font-semibold text-green-600">
                        {organization.establishedYear || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Building2 className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-sm font-medium text-purple-900">Industry</p>
                      <p className="text-lg font-semibold text-purple-600">
                        {organization.industry || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Save Button */}
        <Card>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={saving} className="flex items-center">
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};

export default OrganizationSettings;






