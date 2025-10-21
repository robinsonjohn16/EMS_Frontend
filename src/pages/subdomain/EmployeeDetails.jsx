import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { CheckCircle, Clock, XCircle, Send, User, FileText, AlertCircle, Shield } from 'lucide-react';
import employeeApi from '../../services/employeeApi';
import { constrainPoint } from '@fullcalendar/core/internal';

const EmployeeDetails = () => {
  const user = useSelector(state => state.tenantAuth.user);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submittingForApproval, setSubmittingForApproval] = useState(false);
  const [submittingCategories, setSubmittingCategories] = useState({});
  const [categories, setCategories] = useState([]);
  const [employeeData, setEmployeeData] = useState(null);
  const [formValues, setFormValues] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch field categories with user data included
        const categoriesResponse = await employeeApi.fields.getFieldCategories();
        const fetchedCategories = categoriesResponse.data.categories || [];
        const userData = categoriesResponse.data.userData || {};
        
        setCategories(fetchedCategories);
        
        const transformedFields = {};
        fetchedCategories.forEach(category => {
          transformedFields[category.name] = {};
          
          if (category.fields && category.fields.length > 0) {
            category.fields.forEach(field => {
              // console.log(field);
              // First check if the field has a value property directly
              // if (field.value !== undefined) {
              //   transformedFields[category.name][field.name] = field.value;
              // } 
              // // Then check in userData by field ID
              // else if (userData[field._id]) {
              //   transformedFields[category.name][field.name] = userData[field._id];
              // }
              // // Then check in userData by field name
              // else if (userData[field.name]) {
              //   transformedFields[category.name][field.name] = userData[field.name];
              // }
              // // Finally check in userData by category.fieldname structure
              // else if (userData[`${category.name}.${field.name}`]) {
              //   transformedFields[category.name][field.name] = userData[`${category.name}.${field.name}`];
              // }
              // // Default to empty string if no value found
              // else {
              //   transformedFields[category.name][field.name] = field.defaultValue || '';
              // }
              if (field.value !== undefined) {
                transformedFields[category.name][field.name] = field.value;
              } 
              else if (userData[field._id]) {
                transformedFields[category.name][field.name] = userData[field._id];
              }
              else if (userData[field.name]) {
                transformedFields[category.name][field.name] = userData[field.name];
              }
              else if (userData[`${category.name}.${field.name}`]) {
                transformedFields[category.name][field.name] = userData[`${category.name}.${field.name}`];
              }
              else if (userData[category.name] && userData[category.name][field.name]) {
                transformedFields[category.name][field.name] = userData[category.name][field.name];
              }
              else {
                transformedFields[category.name][field.name] = field.defaultValue || '';
              }
            });
          }
        });
        
        // console.log('Transformed fields1:', transformedFields);
        setFormValues(transformedFields);
        
        // Set employee data for approval status
        setEmployeeData(categoriesResponse.data.employee || {});
        
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load employee data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (categoryName, fieldName, value) => {
    setFormValues(prev => ({
      ...prev,
      [categoryName]: {
        ...prev[categoryName],
        [fieldName]: value
      }
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    categories.forEach(category => {
      if (category.fields) {
        category.fields.forEach(field => {
          if (field.required) {
            const value = formValues[category.name]?.[field.name];
            if (!value || (typeof value === 'string' && value.trim() === '')) {
              newErrors[field._id] = `${field.name} is required`;
              isValid = false;
            }
          }
        });
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Check if fields are locked due to approval status
    if (areFieldsLocked()) {
      toast.error('Cannot save changes while approval is pending or approved');
      return;
    }

    try {
      setSubmitting(true);
      
      // Transform form values to the expected format for each category
      const categoryPromises = categories.map(async (category) => {
        const categoryData = {};
        let hasData = false;
        
        if (category.fields) {
          category.fields.forEach(field => {
            const value = formValues[category.name]?.[field.name];
            if (value !== undefined && value !== '') {
              categoryData[field.name] = value;
              hasData = true;
            }
          });
        }
        
        if (hasData) {
          const payload = {
            categoryName: category.name,
            fields: categoryData
          };
          
          return employeeApi.details.updateEmployeeFields(payload);
        }
        return null;
      });

      const responses = await Promise.all(categoryPromises);
      const successfulResponses = responses.filter(response => response !== null);
      
      if (successfulResponses.length > 0) {
        toast.success('Employee details saved successfully');
        // Update employee data with the latest response
        const lastResponse = successfulResponses[successfulResponses.length - 1];
        if (lastResponse.data.employee) {
          setEmployeeData(lastResponse.data.employee);
        }
      }
    } catch (error) {
      console.error('Error saving employee details:', error);
      toast.error(error.response?.data?.message || 'Failed to save employee details');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCategorySubmit = async (category) => {
    try {
      setSubmittingCategories(prev => ({ ...prev, [category._id]: true }));
      
      // Validate only this category's required fields
      const categoryErrors = {};
      let isValid = true;
      
      if (category.fields) {
        category.fields.forEach(field => {
          if (field.required) {
            const value = formValues[category.name]?.[field.name];
            if (!value || (typeof value === 'string' && value.trim() === '')) {
              categoryErrors[field._id] = `${field.name} is required`;
              isValid = false;
            }
          }
        });
      }
      
      if (!isValid) {
        setErrors(prev => ({ ...prev, ...categoryErrors }));
        toast.error(`Please fill in all required fields in ${category.name}`);
        return;
      }
      
      // Clear errors for this category
      const clearedErrors = { ...errors };
      if (category.fields) {
        category.fields.forEach(field => {
          delete clearedErrors[field._id];
        });
      }
      setErrors(clearedErrors);
      
      // Transform only this category's data
      const categoryData = {};
      let hasData = false;
      
      if (category.fields) {
        category.fields.forEach(field => {
          const value = formValues[category.name]?.[field.name];
          if (value !== undefined && value !== '') {
            categoryData[field.name] = value;
            hasData = true;
          }
        });
      }
      
      if (!hasData) {
        toast.error(`No data to save for ${category.name}`);
        return;
      }

      console.log(`Submitting ${category.name} data:`, categoryData);
      
      const payload = {
        categoryName: category.name,
        fields: categoryData
      };
      
      const response = await employeeApi.details.updateEmployeeFields(payload);
      
      if (response.data.success) {
        toast.success(`${category.name} saved successfully`);
        // Update employee data with the response
        if (response.data.employee) {
          setEmployeeData(response.data.employee);
        }
      }
    } catch (error) {
      console.error(`Error saving ${category.name}:`, error);
      toast.error(error.response?.data?.message || `Failed to save ${category.name}`);
    } finally {
      setSubmittingCategories(prev => ({ ...prev, [category._id]: false }));
    }
  };

  const handleSubmitForApproval = async () => {
    try {
      setSubmittingForApproval(true);
      
      if (!employeeData?._id) {
        toast.error('Employee data not found. Please save your details first.');
        return;
      }
      
      const response = await employeeApi.details.submitForApproval(employeeData._id);
      
      if (response.data.success) {
        toast.success('Employee details submitted for HR approval');
        // Update employee data to reflect the new approval status
        setEmployeeData(prev => ({
          ...prev,
          approvalStatus: {
            ...prev.approvalStatus,
            status: 'submitted',
            submittedAt: new Date().toISOString()
          }
        }));
      }
    } catch (error) {
      console.error('Error submitting for approval:', error);
      toast.error(error.response?.data?.message || 'Failed to submit for approval');
    } finally {
      setSubmittingForApproval(false);
    }
  };

  const getApprovalStatusInfo = () => {
    const status = employeeData?.approvalStatus?.status || 'draft';
    
    switch (status) {
      case 'submitted':
        return {
          status: 'submitted',
          text: 'Submitted for Review',
          color: 'text-yellow-700',
          bgColor: 'bg-yellow-100',
          icon: Clock,
          submittedAt: employeeData?.approvalStatus?.submittedAt
        };
      case 'approved':
        return {
          status: 'approved',
          text: 'Approved by HR',
          color: 'text-green-700',
          bgColor: 'bg-green-100',
          icon: CheckCircle,
          reviewedAt: employeeData?.approvalStatus?.reviewedAt,
          reviewComments: employeeData?.approvalStatus?.reviewComments
        };
      case 'rejected':
        return {
          status: 'rejected',
          text: 'Rejected by HR',
          color: 'text-red-700',
          bgColor: 'bg-red-100',
          icon: XCircle,
          reviewedAt: employeeData?.approvalStatus?.reviewedAt,
          reviewComments: employeeData?.approvalStatus?.reviewComments
        };
      default:
        return {
          status: 'draft',
          text: 'Draft',
          color: 'text-gray-700',
          bgColor: 'bg-gray-100',
          icon: FileText
        };
    }
  };

  const areFieldsLocked = () => {
    // Lock fields if approval is pending or approved
    return employeeData?.approvalStatus?.status === 'approved' || employeeData?.approvalStatus?.status === 'submitted';
  };

  const renderField = (field, categoryName) => {
    const value = formValues[categoryName]?.[field.name] || '';
    const isDisabled = !field.isEmployeeEditable || areFieldsLocked();

    switch (field.type) {
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleInputChange(categoryName, field.name, e.target.value)}
            disabled={isDisabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
          >
            <option value="">Select {field.name}</option>
            {field.options?.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
        
      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleInputChange(categoryName, field.name, e.target.value)}
            disabled={isDisabled}
            placeholder={field.placeholder || `Enter ${field.name}`}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
          />
        );
        
      case 'email':
        return (
          <input
            type="email"
            value={value}
            onChange={(e) => handleInputChange(categoryName, field.name, e.target.value)}
            disabled={isDisabled}
            placeholder={field.placeholder || `Enter ${field.name}`}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
          />
        );
        
      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleInputChange(categoryName, field.name, e.target.value)}
            disabled={isDisabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
          />
        );
        
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleInputChange(categoryName, field.name, e.target.value)}
            disabled={isDisabled}
            placeholder={field.placeholder || `Enter ${field.name}`}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 resize-none"
          />
        );
        
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleInputChange(categoryName, field.name, e.target.value)}
            disabled={isDisabled}
            placeholder={field.placeholder || `Enter ${field.name}`}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading employee details...</p>
        </div>
      </div>
    );
  }

  const approvalInfo = getApprovalStatusInfo();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <User className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Details</h1>
                <p className="text-gray-600 mt-1">Manage your personal and professional information</p>
              </div>
            </div>
            
            
            {/* Submit for Approval Button */}
            {approvalInfo.status === 'draft' && (
              <button
                onClick={handleSubmitForApproval}
                disabled={submittingForApproval || !employeeData?._id}
                className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="h-5 w-5" />
                <span>{submittingForApproval ? 'Submitting...' : 'Submit for Approval'}</span>
              </button>
            )}
            
          </div>
          
          {/* Approval Status Display */}
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-700">Status:</span>
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${approvalInfo.bgColor}`}>
                {approvalInfo.icon && <approvalInfo.icon className={`h-5 w-5 ${approvalInfo.color}`} />}
                <span className={`text-sm font-semibold ${approvalInfo.color}`}>
                  {approvalInfo.text}
                </span>
              </div>
            </div>
          </div>
          
          {/* Approval Details */}
          {(approvalInfo.submittedAt || approvalInfo.reviewedAt) && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              {approvalInfo.submittedAt && (
                <p className="text-sm text-gray-600 flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Submitted on: {new Date(approvalInfo.submittedAt).toLocaleDateString()}
                </p>
              )}
              {approvalInfo.reviewedAt && (
                <p className="text-sm text-gray-600 flex items-center mt-2">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Reviewed on: {new Date(approvalInfo.reviewedAt).toLocaleDateString()}
                </p>
              )}
              {approvalInfo.reviewComments && (
                <div className="mt-3 p-3 bg-white rounded-md border border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-1">HR Comments:</p>
                  <p className="text-sm text-gray-600">{approvalInfo.reviewComments}</p>
                </div>
              )}
            </div>
          )}
          
          {/* Locked Fields Notice */}
          {areFieldsLocked() && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-blue-800">
                    Details Approved & Protected
                  </p>
                  <p className="text-sm text-blue-600 mt-1">
                    Your details have been approved by HR and are now protected from editing.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {categories.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="bg-gray-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Employee Fields Configured</h3>
            <p className="text-gray-500 mb-4">No employee fields have been defined yet.</p>
            <p className="text-gray-500">Please contact HR to set up employee fields.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {categories.map((category) => (
              <div key={category._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Category Header */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                      {category.description && (
                        <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Category Content */}
                <div className="p-6">
                  {category.fields && category.fields.length > 0 ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {category.fields.map((field) => (
                          <div key={field._id} className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              {field.name}
                              {field.required && <span className="text-red-500 ml-1">*</span>}
                            </label>
                            {field.description && (
                              <p className="text-xs text-gray-500">{field.description}</p>
                            )}
                            <div className="relative">
                              {renderField(field, category.name)}
                              {employeeData?.lockedFields?.includes(field._id) && (
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                  <Shield className="h-4 w-4 text-gray-400" />
                                </div>
                              )}
                            </div>
                            {errors[field._id] && (
                              <p className="text-xs text-red-600 flex items-center mt-1">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                {errors[field._id]}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      {/* Section-specific save button */}
                      <div className="flex justify-end pt-4 border-t border-gray-200">
                        <button
                          type="button"
                          onClick={() => handleCategorySubmit(category)}
                          disabled={submittingCategories[category._id] || areFieldsLocked()}
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                        >
                          {submittingCategories[category._id] ? `Saving ${category.name}...` : `Save ${category.name}`}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm">No fields defined in this category yet.</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {/* Main Save Button */}
            <div className="flex justify-center pt-6">
              <button
                type="submit"
                disabled={submitting || areFieldsLocked()}
                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {submitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </div>
                ) : (
                  'Save All Details'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EmployeeDetails;