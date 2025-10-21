import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

const fieldSchema = z.object({
  name: z.string().min(2, 'Field name must be at least 2 characters'),
  label: z.string().min(2, 'Field label must be at least 2 characters'),
  type: z.enum(['text', 'number', 'date', 'select', 'multiselect', 'checkbox', 'textarea', 'file', 'email', 'phone', 'url', 'radio', 'image']),
  description: z.string().optional(),
  placeholder: z.string().optional(),
  options: z.string().optional(),
  acceptedTypes: z.string().optional(),
  validation: z.object({
    required: z.boolean().optional(),
    min: z.number().optional(),
    max: z.number().optional(),
    pattern: z.string().optional(),
    minDate: z.string().optional(),
    maxDate: z.string().optional()
  }).optional()
});

const CustomFieldForm = ({ field, categoryId, onSubmit, onCancel }) => {
  const isEdit = !!field;
  
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(fieldSchema),
    defaultValues: {
      name: field?.name || '',
      label: field?.label || '',
      type: field?.type || 'text',
      description: field?.description || '',
      placeholder: field?.placeholder || '',
      options: field?.options ? field.options.join(',') : '',
      acceptedTypes: field?.acceptedTypes || '',
      validation: {
        required: field?.validation?.required ?? false,
        min: field?.validation?.min,
        max: field?.validation?.max,
        pattern: field?.validation?.pattern || '',
        minDate: field?.validation?.minDate || '',
        maxDate: field?.validation?.maxDate || ''
      }
    }
  });

  const fieldType = watch('type');

  const submitHandler = async (data) => {
    try {
      // Process options for select, multiselect, and radio fields
      if ((data.type === 'select' || data.type === 'multiselect' || data.type === 'radio') && data.options) {
        data.options = data.options.split(',').map(opt => opt.trim()).filter(opt => opt);
      }
      
      await onSubmit(categoryId, data, field?._id);
      toast.success(`Field ${isEdit ? 'updated' : 'created'} successfully`);
    } catch (error) {
      toast.error(error.message || `Failed to ${isEdit ? 'update' : 'create'} field`);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">
        {isEdit ? 'Edit Field' : 'Add New Field'}
      </h2>
      
      <form onSubmit={handleSubmit(submitHandler)}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Field Name*
          </label>
          <input
            type="text"
            {...register('name')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter field name"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Field Label*
          </label>
          <input
            type="text"
            {...register('label')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter field label"
          />
          {errors.label && (
            <p className="mt-1 text-sm text-red-600">{errors.label.message}</p>
          )}
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Field Type*
          </label>
          <select
            {...register('type')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="text">Text</option>
            <option value="number">Number</option>
            <option value="date">Date</option>
            <option value="select">Dropdown</option>
            <option value="multiselect">Multi-select</option>
            <option value="checkbox">Checkbox</option>
            <option value="textarea">Text Area</option>
            <option value="file">File Upload</option>
            <option value="image">Image Upload</option>
            <option value="email">Email</option>
            <option value="phone">Phone</option>
            <option value="url">URL</option>
            <option value="radio">Radio Buttons</option>
          </select>
          {errors.type && (
            <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
          )}
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            {...register('description')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter field description"
            rows={2}
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Placeholder
          </label>
          <input
            type="text"
            {...register('placeholder')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter placeholder text"
          />
        </div>
        
        {(fieldType === 'select' || fieldType === 'multiselect' || fieldType === 'radio') && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Options (comma separated)
            </label>
            <input
              type="text"
              {...register('options')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Option 1, Option 2, Option 3"
            />
            <p className="mt-1 text-xs text-gray-500">
              Enter options separated by commas
            </p>
          </div>
        )}
        
        {(fieldType === 'file' || fieldType === 'image') && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Accepted File Types
            </label>
            <input
              type="text"
              {...register('acceptedTypes')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder=".pdf,.doc,.docx,.jpg,.png"
            />
            <p className="mt-1 text-xs text-gray-500">
              Enter file extensions separated by commas (e.g., .pdf,.doc,.jpg)
            </p>
          </div>
        )}
        
        {(fieldType === 'number' || fieldType === 'text') && (
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {fieldType === 'number' ? 'Minimum Value' : 'Minimum Length'}
              </label>
              <input
                type="number"
                {...register('validation.min', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min={0}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {fieldType === 'number' ? 'Maximum Value' : 'Maximum Length'}
              </label>
              <input
                type="number"
                {...register('validation.max', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min={0}
              />
            </div>
          </div>
        )}
        
        {fieldType === 'date' && (
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Date
              </label>
              <input
                type="date"
                {...register('validation.minDate')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Date
              </label>
              <input
                type="date"
                {...register('validation.maxDate')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}
        
        <div className="mb-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              {...register('validation.required')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Required field</span>
          </label>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : isEdit ? 'Update Field' : 'Add Field'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CustomFieldForm;