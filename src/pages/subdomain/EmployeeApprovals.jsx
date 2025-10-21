import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Calendar, 
  MessageSquare,
  Eye,
  Search,
  Filter,
  Users,
  FileText,
  AlertCircle
} from 'lucide-react';
import employeeApi from '../../services/employeeApi';

const EmployeeApprovals = () => {
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [reviewComments, setReviewComments] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const fetchPendingApprovals = async () => {
    try {
      setLoading(true);
      const response = await employeeApi.details.getPendingApprovals();
      console.log('Pending approvals response:', response.data);
      setPendingApprovals(response.data || []);
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch pending approvals');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (employeeId, action) => {
    try {
      setSubmittingReview(true);
      await employeeApi.details.reviewEmployeeDetails(employeeId, action, reviewComments);
      
      toast.success(`Employee details ${action}d successfully`);
      
      // Refresh the list
      await fetchPendingApprovals();
      
      // Reset form
      setSelectedEmployee(null);
      setReviewComments('');
      setShowDetailsModal(false);
    } catch (error) {
      console.error(`Error ${action}ing employee:`, error);
      toast.error(error.response?.data?.message || `Failed to ${action} employee details`);
    } finally {
      setProcessing(false);
    }
  };

  const openDetailsModal = (employee) => {
    setSelectedEmployee(employee);
    setShowDetailsModal(true);
    setReviewComments('');
  };

  const filteredApprovals = pendingApprovals.length > 0 ? pendingApprovals.filter(employee =>
    employee.userId?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.userId?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.baseInfo?.employeeId?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const renderCustomFieldValue = (value) => {
    if (value === null || value === undefined) return 'Not provided';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return value.toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading pending approvals...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Employee Approvals</h1>
              <p className="mt-2 text-gray-600">Review and approve employee profile submissions</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-white px-4 py-2 rounded-lg shadow-sm border">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-900">
                    {filteredApprovals.length} Pending
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, or employee ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>
                  {filteredApprovals.length} pending approval{filteredApprovals.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Approvals List */}
        {filteredApprovals.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="text-center py-16">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No Pending Approvals</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                {searchTerm ? 'No approvals match your search criteria.' : 'All employee submissions have been reviewed.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="divide-y divide-gray-200">
              {filteredApprovals.map((employee) => (
                <div key={employee._id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {employee.userId?.firstName} {employee.userId?.lastName}
                          </h3>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending Review
                          </span>
                        </div>
                        <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            {employee.userId?.email}
                          </span>
                          {employee.baseInfo?.employeeId && (
                            <span className="flex items-center">
                              <FileText className="h-4 w-4 mr-1" />
                              ID: {employee.baseInfo.employeeId}
                            </span>
                          )}
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            Submitted: {new Date(employee.approvalStatus.submittedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => openDetailsModal(employee)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Review Details
                      </button>
                      <button
                        onClick={() => handleReview(employee._id, 'approve')}
                        disabled={submittingReview}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReview(employee._id, 'reject')}
                        disabled={submittingReview}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Review Modal */}
        {showDetailsModal && selectedEmployee && (
          <div
            className="fixed inset-0  flex items-center justify-center p-4 z-50 transition-all duration-300"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowDetailsModal(false);
              }
            }}
          >
            <div 
              className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl transform transition-all duration-300 scale-100"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        Review Employee Details
                      </h2>
                      <p className="text-sm text-gray-600">
                        {selectedEmployee.userId?.firstName} {selectedEmployee.userId?.lastName}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
                <div className="p-6">
                  {/* Employee Basic Info */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedEmployee.userId?.firstName} {selectedEmployee.userId?.lastName}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedEmployee.userId?.email}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Employee ID</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedEmployee.baseInfo?.employeeId || 'Not set'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Joining Date</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedEmployee.baseInfo?.joiningDate 
                            ? new Date(selectedEmployee.baseInfo.joiningDate).toLocaleDateString()
                            : 'Not set'
                          }
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedEmployee.baseInfo?.status || 'Not set'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Submitted On</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {new Date(selectedEmployee.approvalStatus.submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Custom Fields */}
                  {selectedEmployee.customFields && Object.keys(selectedEmployee.customFields).length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Employee Details</h3>
                      <div className="space-y-6">
                        {Object.entries(selectedEmployee.customFields).map(([categoryName, fields]) => (
                          <div key={categoryName} className="border border-gray-200 rounded-lg overflow-hidden">
                            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                              <h4 className="text-md font-medium text-gray-900">{categoryName}</h4>
                            </div>
                            <div className="p-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.entries(fields).map(([fieldName, fieldValue]) => (
                                  <div key={fieldName}>
                                    <label className="block text-sm font-medium text-gray-700 capitalize">
                                      {fieldName.replace(/([A-Z])/g, ' $1').trim()}
                                    </label>
                                    <p className="mt-1 text-sm text-gray-900">
                                      {renderCustomFieldValue(fieldValue)}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Review Comments */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Review Comments (Optional)
                    </label>
                    <textarea
                      value={reviewComments}
                      onChange={(e) => setReviewComments(e.target.value)}
                      placeholder="Add any comments about this review..."
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReview(selectedEmployee._id, 'reject')}
                  disabled={submittingReview}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  {submittingReview ? 'Processing...' : 'Reject'}
                </button>
                <button
                  onClick={() => handleReview(selectedEmployee._id, 'approve')}
                  disabled={submittingReview}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {submittingReview ? 'Processing...' : 'Approve'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeApprovals;