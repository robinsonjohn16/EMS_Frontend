import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Building2,
  ArrowLeft,
  Edit,
  Trash2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Users,
  Calendar,
  DollarSign,
  Tag,
  Activity,
  MoreVertical,
  Download,
  Share2,
  Loader2,
  AlertTriangle
} from 'lucide-react';

import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { 
  fetchOrganizationById, 
  deleteOrganization, 
  clearCurrentOrganization 
} from '../store/slices/organizationSlice';

const OrganizationDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentOrganization, loading, error } = useSelector((state) => state.organizations);
  
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const loadOrganization = async () => {
      try {
        await dispatch(fetchOrganizationById(id)).unwrap();
      } catch (error) {
        console.error('Failed to fetch organization:', error);
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
  }, [id, dispatch]);

  const handleEdit = () => {
    navigate(`/dashboard/organizations/${id}/edit`);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await dispatch(deleteOrganization(id)).unwrap();
      navigate('/dashboard/organizations');
    } catch (error) {
      console.error('Failed to delete organization:', error);
      setIsDeleting(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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

  if (error || !currentOrganization) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {error || 'Organization not found'}
          </h2>
          <p className="text-gray-600 mb-4">
            {error ? 'There was an error loading the organization.' : 'The organization you\'re looking for doesn\'t exist.'}
          </p>
          <Button onClick={() => navigate('/dashboard/organizations')}>
            Back to Organizations
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
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
          <div className="flex items-center space-x-3">
            {currentOrganization.logo && (
              <img
                src={currentOrganization.logo}
                alt={`${currentOrganization.name} logo`}
                className="h-12 w-12 rounded-lg object-cover border border-gray-200"
              />
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{currentOrganization.name}</h1>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>{currentOrganization.type}</span>
                {currentOrganization.industry && (
                  <>
                    <span>•</span>
                    <span>{currentOrganization.industry}</span>
                  </>
                )}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  currentOrganization.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {currentOrganization.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => navigate(`/dashboard/organizations/${id}/users`)}>
            <Users className="h-4 w-4 mr-2" />
            Manage Users
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowDeleteModal(true)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overview */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Overview</h2>
            {currentOrganization.description ? (
              <p className="text-gray-600 leading-relaxed">{currentOrganization.description}</p>
            ) : (
              <p className="text-gray-400 italic">No description available</p>
            )}
          </Card>

          {/* Key Metrics */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Key Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-2">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {currentOrganization.employeeCount || 0}
                </div>
                <div className="text-sm text-gray-500">Employees</div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-2">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(currentOrganization.revenue)}
                </div>
                <div className="text-sm text-gray-500">Annual Revenue</div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-2">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {currentOrganization.foundedYear || 'N/A'}
                </div>
                <div className="text-sm text-gray-500">Founded</div>
              </div>
            </div>
          </Card>

          {/* Contact Information */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
            <div className="space-y-4">
              {currentOrganization.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-900">{currentOrganization.phone}</span>
                </div>
              )}

              {currentOrganization.email && (
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <a 
                    href={`mailto:${currentOrganization.email}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {currentOrganization.email}
                  </a>
                </div>
              )}

              {currentOrganization.website && (
                <div className="flex items-center space-x-3">
                  <Globe className="h-5 w-5 text-gray-400" />
                  <a 
                    href={currentOrganization.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {currentOrganization.website}
                  </a>
                </div>
              )}
            </div>
          </Card>

          {/* Address */}
          {(currentOrganization.address || currentOrganization.city || currentOrganization.state || currentOrganization.country) && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Address</h2>
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                <div className="text-gray-900">
                  {currentOrganization.address && (
                    <div>{currentOrganization.address}</div>
                  )}
                  <div>
                    {[
                      currentOrganization.city,
                      currentOrganization.state,
                      currentOrganization.zipCode
                    ].filter(Boolean).join(', ')}
                  </div>
                  {currentOrganization.country && (
                    <div>{currentOrganization.country}</div>
                  )}
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start" onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Organization
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Activity className="h-4 w-4 mr-2" />
                View Activity
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Download className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </Card>

          {/* Tags */}
          {currentOrganization.tags && currentOrganization.tags.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {currentOrganization.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
            </Card>
          )}

          {/* Organization Details */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Created</span>
                <span className="text-sm text-gray-900">
                  {formatDate(currentOrganization.createdAt)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Last Updated</span>
                <span className="text-sm text-gray-900">
                  {formatDate(currentOrganization.updatedAt)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">ID</span>
                <span className="text-sm text-gray-900 font-mono">
                  {currentOrganization.id}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Delete Organization</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{currentOrganization.name}"? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
                className="min-w-[100px]"
              >
                {isDeleting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deleting...
                  </div>
                ) : (
                  'Delete'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationDetails;