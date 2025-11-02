import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import employeeApi from '../../services/employeeApi';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Switch } from '../../components/ui/switch';

// Create a dynamic schema for employee data
const createEmployeeSchema = (categories) => {
  // Base schema for required fields
  const baseSchema = z.object({
    baseInfo: z.object({
      employeeId: z.string().min(1, 'Employee ID is required'),
      joiningDate: z.string().optional(),
      status: z.enum(['active', 'inactive', 'pending'])
    }),
    customFields: z.record(z.any())
  });
  
  return baseSchema;
};

const EditEmployee = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [employee, setEmployee] = useState(null);
  const [formSchema, setFormSchema] = useState(null);

  // Initialize form with React Hook Form
  const { control, handleSubmit, setValue, watch, formState: { errors, isSubmitting, isDirty, dirtyFields } } = useForm({
    defaultValues: {
      baseInfo: {
        employeeId: '',
        joiningDate: '',
        status: 'active'
      },
      customFields: {}
    },
    resolver: zodResolver(createEmployeeSchema([]))
  });

  // Watch form values for real-time validation feedback
  const formValues = watch();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch field categories
        const categoriesResponse = await employeeApi.fields.getFieldCategories();
        const fetchedCategories = categoriesResponse.data.categories || [];
        setCategories(fetchedCategories);
        
        // Update schema with fetched categories
        setFormSchema(createEmployeeSchema(fetchedCategories));
        
        // Fetch employee data if ID is provided
        if (id) {
          // Try to get employee by user ID first (for /employee-details/:userId route)
          let employeeResponse;
          let employeeData;
          
          try {
            employeeResponse = await employeeApi.details.getEmployeeDetailsByUserId(id);
            employeeData = employeeResponse.data.employee;
          } catch (userIdError) {
            // If user ID fails, try employee ID (for /edit-employee/:employeeId route)
            try {
              employeeResponse = await employeeApi.details.getEmployeeDetails(id);
              employeeData = employeeResponse.data.employee;
            } catch (employeeIdError) {
              throw new Error('Employee not found with the provided ID');
            }
          }
          
          setEmployee(employeeData);
          
          // Set base info
          if (employeeData.baseInfo) {
            setValue('baseInfo', {
              employeeId: employeeData.baseInfo.employeeId || '',
              joiningDate: employeeData.baseInfo.joiningDate ? new Date(employeeData.baseInfo.joiningDate).toISOString().split('T')[0] : '',
              status: employeeData.baseInfo.status || 'active'
            });
          }
          
          // Set custom fields
          if (employeeData.customFields) {
            setValue('customFields', employeeData.customFields);
          }
        }
      } catch (error) {
        toast.error('Failed to load employee data');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, setValue]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      await employeeApi.details.upsertEmployeeDetails({
        employeeId: id,
        baseInfo: data.baseInfo,
        customFields: data.customFields
      });
      
      toast.success('Employee details saved successfully');
      navigate('/employee-management');
    } catch (error) {
      toast.error('Failed to save employee details: ' + (error.response?.data?.message || error.message));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderField = (field) => {
    const isLocked = employee?.lockedFields?.includes(field._id);
    const isHrEditable = field.hrEditable !== false;
    const isDisabled = isLocked && !isHrEditable;
    
    return (
      <Controller
        control={control}
        name={`customFields.${field._id}`}
        render={({ field: { onChange, value, ref } }) => {
          switch (field.type) {
            case 'text':
              return (
                <div>
                  <input
                    type="text"
                    value={value || ''}
                    onChange={onChange}
                    disabled={isDisabled}
                    placeholder={field.placeholder || `Enter ${field.name}`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    ref={ref}
                  />
                  {errors?.customFields?.[field._id] && (
                    <p className="mt-1 text-sm text-red-600">{errors.customFields[field._id].message}</p>
                  )}
                </div>
              );
              
            case 'number':
              return (
                <div>
                  <input
                    type="number"
                    value={value || ''}
                    onChange={(e) => onChange(e.target.valueAsNumber || '')}
                    disabled={isDisabled}
                    placeholder={field.placeholder || `Enter ${field.name}`}
                    min={field.validation?.min}
                    max={field.validation?.max}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    ref={ref}
                  />
                  {errors?.customFields?.[field._id] && (
                    <p className="mt-1 text-sm text-red-600">{errors.customFields[field._id].message}</p>
                  )}
                </div>
              );
              
            case 'date':
              return (
                <div>
                  <input
                    type="date"
                    value={value || ''}
                    onChange={onChange}
                    disabled={isDisabled}
                    min={field.validation?.minDate}
                    max={field.validation?.maxDate}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    ref={ref}
                  />
                  {errors?.customFields?.[field._id] && (
                    <p className="mt-1 text-sm text-red-600">{errors.customFields[field._id].message}</p>
                  )}
                </div>
              );
              
            case 'select':
              return (
                <div>
                  <select
                    value={value || ''}
                    onChange={onChange}
                    disabled={isDisabled}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    ref={ref}
                  >
                    <option value="">Select {field.name}</option>
                    {field.options?.map((option, index) => (
                      <option key={index} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  {errors?.customFields?.[field._id] && (
                    <p className="mt-1 text-sm text-red-600">{errors.customFields[field._id].message}</p>
                  )}
                </div>
              );
              
            case 'checkbox':
              return (
                <div>
                  <input
                    type="checkbox"
                    checked={value === true}
                    onChange={(e) => onChange(e.target.checked)}
                    disabled={isDisabled}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:bg-gray-100"
                    ref={ref}
                  />
                  {errors?.customFields?.[field._id] && (
                    <p className="mt-1 text-sm text-red-600">{errors.customFields[field._id].message}</p>
                  )}
                </div>
              );
              
            case 'textarea':
              return (
                <div>
                  <textarea
                    value={value || ''}
                    onChange={onChange}
                    disabled={isDisabled}
                    placeholder={field.placeholder || `Enter ${field.name}`}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    ref={ref}
                  />
                  {errors?.customFields?.[field._id] && (
                    <p className="mt-1 text-sm text-red-600">{errors.customFields[field._id].message}</p>
                  )}
                </div>
              );
              
            default:
              return (
                <div>
                  <input
                    type="text"
                    value={value || ''}
                    onChange={onChange}
                    disabled={isDisabled}
                    placeholder={field.placeholder || `Enter ${field.name}`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    ref={ref}
                  />
                  {errors?.customFields?.[field._id] && (
                    <p className="mt-1 text-sm text-red-600">{errors.customFields[field._id].message}</p>
                  )}
                </div>
              );
          }
        }}
      />
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Handle profile settings update
  const updateProfileSettings = async (settings) => {
    try {
      if (!employee?._id) return;
      
      setLoading(true);
      await employeeApi.details.updateProfileSettings(employee._id, settings);
      toast.success('Profile settings updated successfully');
      // Refresh data
      const employeeResponse = await employeeApi.details.getEmployeeDetails(id);
      setEmployee(employeeResponse.data.employee);
    } catch (error) {
      toast.error('Failed to update profile settings');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        {id ? 'Edit Employee' : 'Add New Employee'}
      </h1>
      
      <Tabs defaultValue="details" className="w-full">
        <TabsList>
          <TabsTrigger value="details">Employee Details</TabsTrigger>
          <TabsTrigger value="settings">Profile Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details">
        {/* Base Information */}
        <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
          <div className="p-4 bg-gray-50">
            <h3 className="text-lg font-medium text-gray-800">Base Information</h3>
          </div>
          
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700">
                  Employee ID
                  <span className="text-red-500 ml-1">*</span>
                </label>
              </div>
              <div className="md:col-span-2">
                <Controller
                  control={control}
                  name="baseInfo.employeeId"
                  render={({ field }) => (
                    <div>
                      <input
                        type="text"
                        {...field}
                        placeholder="Enter employee ID"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {errors?.baseInfo?.employeeId && (
                        <p className="mt-1 text-sm text-red-600">{errors.baseInfo.employeeId.message}</p>
                      )}
                    </div>
                  )}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700">
                  Joining Date
                  <span className="text-red-500 ml-1">*</span>
                </label>
              </div>
              <div className="md:col-span-2">
                <Controller
                  control={control}
                  name="baseInfo.joiningDate"
                  render={({ field }) => (
                    <div>
                      <input
                        type="date"
                        {...field}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {errors?.baseInfo?.joiningDate && (
                        <p className="mt-1 text-sm text-red-600">{errors.baseInfo.joiningDate.message}</p>
                      )}
                    </div>
                  )}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700">
                  Status
                  <span className="text-red-500 ml-1">*</span>
                </label>
              </div>
              <div className="md:col-span-2">
                <Controller
                  control={control}
                  name="baseInfo.status"
                  render={({ field }) => (
                    <div>
                      <select
                        {...field}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="pending">Pending</option>
                      </select>
                      {errors?.baseInfo?.status && (
                        <p className="mt-1 text-sm text-red-600">{errors.baseInfo.status.message}</p>
                      )}
                    </div>
                  )}
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Custom Fields */}
        {categories.map((category) => (
          <div key={category._id} className="bg-white rounded-lg shadow overflow-hidden mb-6">
            <div className="p-4 bg-gray-50">
              <h3 className="text-lg font-medium text-gray-800">{category.name}</h3>
              {category.description && (
                <p className="text-sm text-gray-500">{category.description}</p>
              )}
            </div>
            
            <div className="p-4 space-y-4">
              {category.fields && category.fields.length > 0 ? (
                category.fields.map((field) => (
                  <div key={field._id} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <div className="md:col-span-1">
                      <label className="block text-sm font-medium text-gray-700">
                        {field.name}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      {field.description && (
                        <p className="text-xs text-gray-500 mt-1">{field.description}</p>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      {renderField(field)}
                      {employee?.lockedFields?.includes(field._id) && !field.hrEditable && (
                        <p className="text-xs text-gray-500 mt-1">
                          This field has been submitted by the employee and cannot be edited by HR.
                        </p>
                      )}
                      {employee?.lockedFields?.includes(field._id) && field.hrEditable && (
                        <p className="text-xs text-gray-500 mt-1">
                          This field has been submitted by the employee but can be edited by HR.
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No fields defined in this category yet.
                </div>
              )}
            </div>
          </div>
        ))}
        
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/employee-management')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Employee'}
          </button>
        </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EditEmployee;