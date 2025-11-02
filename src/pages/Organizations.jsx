import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Building2,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Users,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Globe,
  ChevronDown,
  Grid,
  List,
  Download,
  Upload
} from 'lucide-react';

import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  fetchOrganizations,
  deleteOrganization,
  clearError,
  setCurrentPage
} from '../store/slices/organizationSlice';

const Organizations = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { organizations, loading, error, currentPage, totalPages } = useSelector(
    (state) => state.organizations
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState('list'); // 'grid' or 'list'
  const [showFilters, setShowFilters] = useState(false);
  const [selectedOrgs, setSelectedOrgs] = useState([]);

  useEffect(() => {
    dispatch(fetchOrganizations());
  }, [dispatch, currentPage]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this organization?')) {
      try {
        await dispatch(deleteOrganization(id)).unwrap();
        toast.success('Organization deleted successfully');
        dispatch(fetchOrganizations());
      } catch (error) {
        toast.error(error || 'Failed to delete organization');
        console.error('Failed to delete organization:', error);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedOrgs.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedOrgs.length} organizations?`)) {
      try {
        await Promise.all(
          selectedOrgs.map(id => dispatch(deleteOrganization(id)).unwrap())
        );
        setSelectedOrgs([]);
        dispatch(fetchOrganizations());
      } catch (error) {
        console.error('Failed to delete organizations:', error);
      }
    }
  };

  const filteredOrganizations = organizations.length > 0 ? organizations.filter(org => { 
    const matchesSearch = org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         org.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         org.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || org.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  }) : [];



  const handleSelectOrg = (orgId) => {
    setSelectedOrgs(prev => 
      prev.includes(orgId) 
        ? prev.filter(id => id !== orgId)
        : [...prev, orgId]
    );
  };

  const handleSelectAll = () => {
    if (selectedOrgs.length === filteredOrganizations.length) {
      setSelectedOrgs([]);
    } else {
      setSelectedOrgs(filteredOrganizations.map(org => org._id));
    }
  };

  const OrganizationCard = ({ org }) => (
    <Card className="p-6 hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={selectedOrgs.includes(org._id)}
            onChange={() => handleSelectOrg(org._id)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{org.name}</h3>
            <p className="text-sm text-gray-500">{org.type || 'Organization'}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            org.status === 'active' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {org.status || 'Active'}
          </span>
          
          <div className="relative group">
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
            <div className="absolute right-0 top-8 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              <Link
                to={`/dashboard/organizations/${org._id}`}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </Link>
              <Link
                to={`/dashboard/organizations/${org._id}/edit`}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
              <Link
                to={`/dashboard/organizations/${org._id}/users`}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Users className="mr-2 h-4 w-4" />
                Manage Users
              </Link>
              <button
                onClick={() => handleDelete(org._id)}
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {org.description || 'No description available'}
      </p>

      <div className="grid grid-cols-2 gap-4 text-sm text-gray-500 mb-4">
        {org.location && (
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-2" />
            <span className="truncate">{org.location}</span>
          </div>
        )}
        {org.phone && (
          <div className="flex items-center">
            <Phone className="h-4 w-4 mr-2" />
            <span>{org.phone}</span>
          </div>
        )}
        {org.email && (
          <div className="flex items-center">
            <Mail className="h-4 w-4 mr-2" />
            <span className="truncate">{org.email}</span>
          </div>
        )}
        {org.website && (
          <div className="flex items-center">
            <Globe className="h-4 w-4 mr-2" />
            <span className="truncate">{org.website}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center text-sm text-gray-500">
          <Users className="h-4 w-4 mr-1" />
          <span>{org.employeeCount || 0} employees</span>
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <Calendar className="h-4 w-4 mr-1" />
          <span>Created {new Date(org.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </Card>
  );

  const OrganizationRow = ({ org }) => (
    <tr className="hover:bg-gray-50 border-b border-gray-200">
      <td className="px-6 py-4">
        <input
          type="checkbox"
          checked={selectedOrgs.includes(org._id)}
          onChange={() => handleSelectOrg(org._id)}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center mr-3">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">{org.name}</div>
            <div className="text-sm text-gray-500">{org.type || 'Organization'}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-500">{org.location || '-'}</td>
      <td className="px-6 py-4 text-sm text-gray-500">{org.employeeCount || 0}</td>
      <td className="px-6 py-4">
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          org.status === 'active' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {org.status || 'Active'}
        </span>
      </td>
      <td className="px-6 py-4 text-sm text-gray-500">
        {new Date(org.createdAt).toLocaleDateString()}
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-2">
          <Link
            to={`/dashboard/organizations/${org._id}`}
            className="text-blue-600 hover:text-blue-900"
          >
            <Eye className="h-4 w-4" />
          </Link>
          <Link
            to={`/dashboard/organizations/${org._id}/edit`}
            className="text-gray-600 hover:text-gray-900"
          >
            <Edit className="h-4 w-4" />
          </Link>
          <Link
            to={`/dashboard/organizations/${org._id}/users`}
            className="text-green-600 hover:text-green-900"
            title="Manage Users"
          >
            <Users className="h-4 w-4" />
          </Link>
          <button
            onClick={() => handleDelete(org._id)}
            className="text-red-600 hover:text-red-900"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );

  if (loading && organizations.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Organizations</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and organize your company's departments and teams
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          {/* <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button> */}
          <Link to="/dashboard/organizations/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Organization
            </Button>
          </Link>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-sm text-red-600">{error}</div>
        </div>
      )}

      {/* Filters and Search */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search organizations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-80"
              />
            </div>
            
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center"
            >
              <Filter className="mr-2 h-4 w-4" />
              Filters
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            {selectedOrgs.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkDelete}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete ({selectedOrgs.length})
              </Button>
            )}
            {/* Remove view mode toggle - only list view */}
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="status-filter">Status</Label>
                <select
                  id="status-filter"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Organizations Display */}
      {filteredOrganizations.length === 0 ? (
        <Card className="p-12 text-center">
          <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No organizations found</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm ? 'Try adjusting your search criteria' : 'Get started by creating your first organization'}
          </p>
          <Link to="/dashboard/organizations/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Organization
            </Button>
          </Link>
        </Card>
      ) : (
        <>
          {/* Only show list view - no grid */}
          <Card>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedOrgs.length === filteredOrganizations.length && filteredOrganizations.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Organization
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employees
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrganizations.map((org) => (
                    <OrganizationRow key={org._id} org={org} />
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {filteredOrganizations.length} of {organizations.length} organizations
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => dispatch(setCurrentPage(currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-500">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => dispatch(setCurrentPage(currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Organizations;