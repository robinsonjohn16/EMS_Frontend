import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { Eye, EyeOff, Save, Lock, Mail, CalendarClock, Building2, MapPin, Phone, Globe, Users, Settings, Upload, Camera, Edit } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui/avatar';
import { getAssetUrl } from '@/lib/assets';
import { Link } from 'react-router-dom';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Separator } from '../../components/ui/separator';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Badge } from '../../components/ui/badge';
import { tenantAuthApi, tenantOrganizationApi } from '../../services/tenantApi';
import { employeeDetailsApi } from '../../services/employeeApi';
 // Removed profile refetch to avoid redundant API call
 // import { fetchTenantUserProfile } from '../../store/slices/tenantAuthSlice';

// Form validation schemas
const profileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(6, 'Current password must be at least 6 characters'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

const Profile = () => {
  const dispatch = useDispatch();
  const { user, isLoading: authLoading } = useSelector((state) => state.tenantAuth);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [profileSettings, setProfileSettings] = useState({
    canEditProfile: true,
    canChangePassword: true,
  });
  const [organization, setOrganization] = useState(null);
  const [organizationLoading, setOrganizationLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [editingOrganization, setEditingOrganization] = useState(false);
  const [organizationForm, setOrganizationForm] = useState({});
  const [savingOrganization, setSavingOrganization] = useState(false);

  // Profile form
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
    },
  });

  // Password form
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
    watch: watchPassword,
  } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  // Password strength calculator
  const computeStrength = (pwd) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
    return (score / 4) * 100;
  };

  useEffect(() => {
    const np = watchPassword('newPassword');
    setPasswordStrength(computeStrength(np || ''));
  }, [watchPassword]);

  // Fetch profile settings and organization data
  useEffect(() => {
    const fetchProfileSettings = async () => {
      try {
        // This would be replaced with an actual API call to get profile settings
        const response = await employeeDetailsApi.getEmployeeDetailsByUserId(user?.id);
        if (response.data && response.data.profileSettings) {
          setProfileSettings(response.data.profileSettings);
        }
      } catch (error) {
        console.error('Error fetching profile settings:', error);
        // Default to allowing edits if there's an error
        setProfileSettings({
          canEditProfile: true,
          canChangePassword: true,
        });
      }
    };

    const fetchOrganizationData = async () => {
      try {
        setOrganizationLoading(true);
        // Fetch organization data from user context or API
        if (user?.organization) {
          setOrganization(user.organization);
        } else {
          // If organization data is not in user context, fetch it
          const response = await tenantApi.organization.getBySubdomain(window.location.hostname.split('.')[0]);
          setOrganization(response.data);
        }
      } catch (error) {
        console.error('Error fetching organization data:', error);
        // Set default organization data if available from user
        if (user?.organization) {
          setOrganization(user.organization);
        }
      } finally {
        setOrganizationLoading(false);
      }
    };

    if (user?.id) {
      fetchProfileSettings();
      fetchOrganizationData();
    }
  }, [user?.id]);

  // Reset form when user data changes
  useEffect(() => {
    if (user) {
      resetProfile({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
      });
    }
  }, [user, resetProfile]);

  // Handle profile update
  const onProfileSubmit = async (data) => {
    if (!profileSettings.canEditProfile) {
      toast.error('Profile editing has been disabled by your administrator');
      return;
    }

    setLoading(true);
    try {
      await tenantAuthApi.updateProfile(data);
      toast.success('Profile updated successfully');
     // Refresh user data
// -     dispatch(fetchTenantUserProfile());
     // Avoid redundant profile fetch; rely on local state and server-side persistence
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // Handle avatar upload
  const handleAvatarUpload = async (file) => {
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);

    try {
      setUploadingAvatar(true);
      
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await tenantAuthApi.updateProfile(formData);
      
      if (response?.success || response?.data?.success) {
        toast.success('Profile photo updated successfully');
        // Clear preview and refresh page to get updated avatar
        setAvatarPreview(null);
        window.location.reload();
      } else {
        toast.error('Failed to update profile photo');
        setAvatarPreview(null);
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload profile picture');
      setAvatarPreview(null);
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Handle organization logo upload
  const handleOrganizationLogoUpload = async (file) => {
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    try {
      const response = await tenantOrganizationApi.updateLogo(organization._id, file);
      
      if (response.success) {
        toast.success('Organization logo updated successfully');
        // Update organization state with new logo
        setOrganization(prev => ({
          ...prev,
          logo: response.organization.logo
        }));
      }
    } catch (error) {
      console.error('Error uploading organization logo:', error);
      toast.error('Failed to upload organization logo');
    }
  };

  // Handle organization form changes
  const handleOrganizationChange = (field, value) => {
    setOrganizationForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Save organization changes
  const handleSaveOrganization = async () => {
    try {
      setSavingOrganization(true);
      
      const response = await tenantApi.organization.updateSettings(organization._id, organizationForm);
      
      if (response.data.success) {
        toast.success('Organization settings updated successfully');
        setOrganization(response.data.organization);
        setEditingOrganization(false);
      } else {
        toast.error('Failed to update organization settings');
      }
    } catch (error) {
      console.error('Error updating organization:', error);
      toast.error('Failed to update organization settings');
    } finally {
      setSavingOrganization(false);
    }
  };

  // Initialize organization form when organization data loads
  useEffect(() => {
    if (organization) {
      setOrganizationForm({
        name: organization.name || '',
        description: organization.description || '',
        email: organization.email || '',
        phone: organization.phone || '',
        website: organization.website || '',
        address: organization.address || '',
        city: organization.city || '',
        state: organization.state || '',
        country: organization.country || '',
        postalCode: organization.postalCode || '',
        industry: organization.industry || '',
        establishedYear: organization.establishedYear || '',
        employeeCount: organization.employeeCount || ''
      });
    }
  }, [organization]);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  // Helpers
  const displayName = user?.firstName || user?.lastName ? `${user?.firstName || ''} ${user?.lastName || ''}`.trim() : (user?.email || 'User');
  const initial = (user?.firstName?.[0] || user?.email?.[0] || 'U').toUpperCase();
  const formattedLastLogin = user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : '—';
const strengthLabel = passwordStrength < 50 ? 'Weak' : passwordStrength < 75 ? 'Medium' : 'Strong';

  // Handle password change
  const onPasswordSubmit = async (data) => {
    if (!profileSettings.canChangePassword) {
      toast.error('Password changing has been disabled by your administrator');
      return;
    }

    if (data.newPassword !== data.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setPasswordLoading(true);
    try {
      await tenantAuthApi.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success('Password changed successfully');
      resetPassword();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>

      {/* Summary Header */}
      <div className="mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14">
                {avatarPreview ? (
                  <AvatarImage src={avatarPreview} alt="Preview" />
                ) : user?.avatar ? (
                  <AvatarImage src={getAssetUrl(user.avatar)} alt={displayName} />
                ) : null}
                <AvatarFallback className="text-lg font-semibold">{initial}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-xl font-semibold text-gray-900">{displayName}</p>
                  {user?.role && (
                    <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700 capitalize">{user.role}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-gray-600 mt-1">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm">{user?.email || '—'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 mt-1">
                  <CalendarClock className="h-4 w-4" />
                  <span className="text-sm">Last login: {formattedLastLogin}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setActiveTab('profile')}>Edit Profile</Button>
              <Button variant="outline" onClick={() => setActiveTab('security')}>Change Password</Button>
              <Link to="/my-details">
                <Button variant="default">View My Details</Button>
              </Link>
            </div>
          </div>

          {authLoading && (
            <div className="mt-4 animate-pulse">
              <div className="h-3 bg-gray-200 rounded w-1/3 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/4" />
            </div>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="profile">Profile Information</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="organization">Organization</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleProfileSubmit(onProfileSubmit)}>
              <CardContent className="space-y-4">
                 {!profileSettings.canEditProfile && (
                   <Alert className="mb-4 bg-yellow-50 border-yellow-200">
                     <AlertDescription className="text-yellow-800">
                       Profile editing has been disabled by your administrator
                     </AlertDescription>
                   </Alert>
                 )}

                 {/* Profile Photo uploader */}
                 <div className="flex items-center gap-4">
                   <Avatar className="h-20 w-20">
                     {avatarPreview ? (
                       <AvatarImage src={avatarPreview} alt="Preview" />
                     ) : user?.avatar ? (
                       <AvatarImage src={getAssetUrl(user.avatar)} alt={displayName} />
                     ) : null}
                     <AvatarFallback className="text-lg font-semibold">{initial}</AvatarFallback>
                   </Avatar>
                   <div className="space-y-2">
                     <p className="text-sm text-muted-foreground">Manage your profile photo</p>
                     <div className="flex items-center gap-2">
                       <input
                         id="profile-avatar-input"
                         type="file"
                         accept="image/*"
                         className="hidden"
                         onChange={(e) => {
                           const file = e.target.files?.[0];
                           if (file) {
                             handleAvatarUpload(file);
                           }
                           // Reset the input value to allow selecting the same file again
                           e.target.value = '';
                         }}
                       />
                       <Button
                         variant="outline"
                         onClick={() => document.getElementById('profile-avatar-input')?.click()}
                         disabled={uploadingAvatar}
                       >
                         <Camera className="h-4 w-4 mr-2" />
                         {uploadingAvatar ? 'Uploading...' : 'Upload Photo'}
                       </Button>
                     </div>
                   </div>
                 </div>
 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      {...registerProfile('firstName')}
                      disabled={!profileSettings.canEditProfile}
                      className={profileErrors.firstName ? 'border-red-500' : ''}
                    />
                    {profileErrors.firstName && (
                      <p className="text-red-500 text-xs">{profileErrors.firstName.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      {...registerProfile('lastName')}
                      disabled={!profileSettings.canEditProfile}
                      className={profileErrors.lastName ? 'border-red-500' : ''}
                    />
                    {profileErrors.lastName && (
                      <p className="text-red-500 text-xs">{profileErrors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500">Email cannot be changed. Contact your administrator for assistance.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    value={user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ''}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
              </CardContent>
              <CardFooter className="pt-5 justify-center">
                <Button 
                  type="submit" 
                  disabled={loading || !profileSettings.canEditProfile}
                  className="flex items-center"
                >
                  {loading ? 'Saving...' : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <form onSubmit={handlePasswordSubmit(onPasswordSubmit)}>
              <CardContent className="space-y-4">
                {!profileSettings.canChangePassword && (
                  <Alert className="mb-4 bg-yellow-50 border-yellow-200">
                    <AlertDescription className="text-yellow-800">
                      Password changing has been disabled by your administrator
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? 'text' : 'password'}
                      {...registerPassword('currentPassword')}
                      disabled={!profileSettings.canChangePassword}
                      className={`pr-10 ${passwordErrors.currentPassword ? 'border-red-500' : ''}`}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      disabled={!profileSettings.canChangePassword}
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {passwordErrors.currentPassword && (
                    <p className="text-red-500 text-xs">{passwordErrors.currentPassword.message}</p>
                  )}
                </div>

                <Separator />

                <div className="space-y-2">
                   <Label htmlFor="newPassword">New Password</Label>
                   <div className="relative">
                     <Input
                       id="newPassword"
                       type={showNewPassword ? 'text' : 'password'}
                       {...registerPassword('newPassword')}
                       disabled={!profileSettings.canChangePassword}
                       className={`pr-10 ${passwordErrors.newPassword ? 'border-red-500' : ''}`}
                     />
                     <button
                       type="button"
                       className="absolute inset-y-0 right-0 pr-3 flex items-center"
                       onClick={() => setShowNewPassword(!showNewPassword)}
                       disabled={!profileSettings.canChangePassword}
                     >
                       {showNewPassword ? (
                         <EyeOff className="h-4 w-4 text-gray-400" />
                       ) : (
                         <Eye className="h-4 w-4 text-gray-400" />
                       )}
                     </button>
                   </div>
                   {passwordErrors.newPassword && (
                     <p className="text-red-500 text-xs">{passwordErrors.newPassword.message}</p>
                   )}
                   <div className="mt-2">
                     <div className="h-2 bg-gray-200 rounded">
                       <div
                         className={`h-2 rounded ${passwordStrength < 50 ? 'bg-red-500' : passwordStrength < 75 ? 'bg-yellow-500' : 'bg-green-600'}`}
                         style={{ width: `${passwordStrength}%` }}
                       />
                     </div>
                     <p className="text-xs text-gray-600 mt-1">Strength: {strengthLabel}</p>
                   </div>
                 </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      {...registerPassword('confirmPassword')}
                      disabled={!profileSettings.canChangePassword}
                      className={`pr-10 ${passwordErrors.confirmPassword ? 'border-red-500' : ''}`}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={!profileSettings.canChangePassword}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {passwordErrors.confirmPassword && (
                    <p className="text-red-500 text-xs">{passwordErrors.confirmPassword.message}</p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="pt-5 justify-center">
                <Button 
                  type="submit" 
                  disabled={passwordLoading || !profileSettings.canChangePassword}
                  className="flex items-center"
                >
                  {passwordLoading ? 'Updating...' : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Change Password
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="organization">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="h-5 w-5" />
                <span>Organization Information</span>
              </CardTitle>
              <CardDescription>
                View your organization details and settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              {organizationLoading ? (
                <div className="space-y-4">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ) : organization ? (
                <div className="space-y-6">
                  {/* Organization Header */}
                  <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="relative">
                      {organization.logo ? (
                        <div className="bg-white p-2 rounded-lg shadow-sm">
                          <img 
                            src={organization.logo} 
                            alt={`${organization.name} logo`}
                            className="h-16 w-16 object-contain rounded"
                          />
                        </div>
                      ) : (
                        <div className="bg-blue-100 p-3 rounded-lg">
                          <Building2 className="h-8 w-8 text-blue-600" />
                        </div>
                      )}
                      {/* Logo upload for managers */}
                      {user?.role === 'manager' && (
                        <div className="absolute -bottom-1 -right-1">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleOrganizationLogoUpload(e.target.files[0])}
                            className="hidden"
                            id="organization-logo-upload"
                          />
                          <label
                            htmlFor="organization-logo-upload"
                            className="bg-blue-600 hover:bg-blue-700 text-white p-1 rounded-full cursor-pointer shadow-sm"
                            title="Upload organization logo"
                          >
                            <Camera className="h-3 w-3" />
                          </label>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900">{organization.name}</h3>
                      <p className="text-gray-600 mt-1">{organization.description || 'No description available'}</p>
                      <div className="flex items-center space-x-4 mt-3">
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                          Active Organization
                        </Badge>
                        {organization.subdomain && (
                          <Badge variant="secondary">
                            {organization.subdomain}.yourdomain.com
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Organization Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Contact Information */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                        <Phone className="h-5 w-5" />
                        <span>Contact Information</span>
                      </h4>
                      <div className="space-y-3">
                        {organization.email && (
                          <div className="flex items-center space-x-3">
                            <Mail className="h-4 w-4 text-gray-500" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">Email</p>
                              <p className="text-sm text-gray-600">{organization.email}</p>
                            </div>
                          </div>
                        )}
                        {organization.phone && (
                          <div className="flex items-center space-x-3">
                            <Phone className="h-4 w-4 text-gray-500" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">Phone</p>
                              <p className="text-sm text-gray-600">{organization.phone}</p>
                            </div>
                          </div>
                        )}
                        {organization.website && (
                          <div className="flex items-center space-x-3">
                            <Globe className="h-4 w-4 text-gray-500" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">Website</p>
                              <a 
                                href={organization.website} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:underline"
                              >
                                {organization.website}
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Address Information */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                        <MapPin className="h-5 w-5" />
                        <span>Address</span>
                      </h4>
                      <div className="space-y-3">
                        {organization.address && (
                          <div className="flex items-start space-x-3">
                            <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">Address</p>
                              <p className="text-sm text-gray-600 whitespace-pre-line">{organization.address}</p>
                            </div>
                          </div>
                        )}
                        {organization.city && (
                          <div>
                            <p className="text-sm font-medium text-gray-900">City</p>
                            <p className="text-sm text-gray-600">{organization.city}</p>
                          </div>
                        )}
                        {organization.state && (
                          <div>
                            <p className="text-sm font-medium text-gray-900">State</p>
                            <p className="text-sm text-gray-600">{organization.state}</p>
                          </div>
                        )}
                        {organization.country && (
                          <div>
                            <p className="text-sm font-medium text-gray-900">Country</p>
                            <p className="text-sm text-gray-600">{organization.country}</p>
                          </div>
                        )}
                        {organization.postalCode && (
                          <div>
                            <p className="text-sm font-medium text-gray-900">Postal Code</p>
                            <p className="text-sm text-gray-600">{organization.postalCode}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Organization Settings */}
                  {(user?.role === 'manager' || user?.role === 'hr') && (
                    <div className="border-t pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                            <Settings className="h-5 w-5" />
                            <span>Organization Settings</span>
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Manage organization-wide settings and configurations
                          </p>
                        </div>
                        <Link to="/organization-settings">
                          <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4 mr-2" />
                            Manage Settings
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* Organization Statistics */}
                  <div className="border-t pt-6">
                    <h4 className="text-lg font-medium text-gray-900 flex items-center space-x-2 mb-4">
                      <Users className="h-5 w-5" />
                      <span>Organization Statistics</span>
                    </h4>
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
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Organization Data</h3>
                  <p className="text-gray-500">Unable to load organization information.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;