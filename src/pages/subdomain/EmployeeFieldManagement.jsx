import React, { useEffect, useState } from 'react';
import { employeeFieldApi } from '../../services/employeeApi';
import CustomFieldForm from '../../components/employee/CustomFieldForm';
import FieldCategoryForm from '../../components/employee/FieldCategoryForm';
import { toast } from 'sonner';

const EmployeeFieldManagement = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showFieldForm, setShowFieldForm] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await employeeFieldApi.getFieldCategories();
        const fetchedCategories = (res && res.data && res.data.categories)
          || (res && res.categories)
          || (Array.isArray(res) ? res : []);
        setCategories(fetchedCategories);
      } catch (error) {
        toast.error('Failed to load field categories');
      }
    };
    fetchCategories();
  }, []);

  const handleAddCategory = () => {
    setEditingCategory(null);
    setShowCategoryForm(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setShowCategoryForm(true);
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      await employeeFieldApi.deleteFieldCategory(categoryId);
      setCategories(categories.filter(cat => cat._id !== categoryId));
      toast.success('Category deleted successfully');
    } catch (error) {
      toast.error('Failed to delete category');
    }
  };

  const handleSubmitCategory = async (data, categoryId) => {
    try {
      const res = categoryId
        ? await employeeFieldApi.updateFieldCategory(categoryId, data)
        : await employeeFieldApi.createFieldCategory(data);
      const updatedCategory = res.data || res;
      
      if (categoryId) {
        setCategories(categories.map(cat => cat._id === categoryId ? updatedCategory : cat));
      } else {
        setCategories([...categories, updatedCategory]);
      }
      setShowCategoryForm(false);
      toast.success(`Category ${categoryId ? 'updated' : 'created'} successfully`);
    } catch (error) {
      toast.error(error.message || `Failed to ${categoryId ? 'update' : 'create'} category`);
    }
  };

  const handleAddField = (category) => {
    setSelectedCategory(category);
    setEditingField(null);
    setShowFieldForm(true);
  };

  const handleEditField = (category, field) => {
    setSelectedCategory(category);
    setEditingField(field);
    setShowFieldForm(true);
  };

  const handleDeleteField = async (categoryId, fieldId) => {
    try {
      await employeeFieldApi.deleteField(categoryId, fieldId);
      setCategories(categories.map(cat => {
        if (cat._id === categoryId) {
          return { ...cat, fields: cat.fields.filter(f => f._id !== fieldId) };
        }
        return cat;
      }));
      toast.success('Field deleted successfully');
    } catch (error) {
      toast.error('Failed to delete field');
    }
  };

  const handleSubmitField = async (categoryId, data, fieldId) => {
    try {
      const payload = { ...data };

      const res = fieldId
        ? await employeeFieldApi.updateField(categoryId, fieldId, payload)
        : await employeeFieldApi.addField(categoryId, payload);

      const updatedCategory = res.data || res;

      setCategories(categories.map(cat => {
        if (cat._id === categoryId) {
          // Backend returns the full category on field add/update
          return updatedCategory;
        }
        return cat;
      }));

      setShowFieldForm(false);
      setEditingField(null);
      setSelectedCategory(null);
      toast.success(`Field ${fieldId ? 'updated' : 'created'} successfully`);
    } catch (error) {
      toast.error(error.message || `Failed to ${fieldId ? 'update' : 'create'} field`);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Employee Field Management</h1>
        <button
          onClick={handleAddCategory}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Add Category
        </button>
      </div>

      {showCategoryForm && (
        <FieldCategoryForm
          category={editingCategory}
          onSubmit={handleSubmitCategory}
          onCancel={() => setShowCategoryForm(false)}
        />
      )}

      {showFieldForm && selectedCategory && (
        <CustomFieldForm
          field={editingField}
          categoryId={selectedCategory._id}
          onSubmit={handleSubmitField}
          onCancel={() => setShowFieldForm(false)}
        />
      )}

      <div className="space-y-6">
        {categories.map(category => (
          <div key={category._id} className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold">{category.name}</h2>
                {category.description && (
                  <p className="text-sm text-gray-600">{category.description}</p>
                )}
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => handleEditCategory(category)}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Edit Category
                </button>
                <button
                  onClick={() => handleDeleteCategory(category._id)}
                  className="px-3 py-1 border border-red-300 text-red-600 rounded hover:bg-red-50"
                >
                  Delete Category
                </button>
                <button
                  onClick={() => handleAddField(category)}
                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Add Field
                </button>
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Label</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Required</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {category.fields?.length ? category.fields.map(field => (
                    <tr key={field._id}>
                      <td className="px-4 py-2">{field.label || field.name}</td>
                      <td className="px-4 py-2">{field.type}</td>
                      <td className="px-4 py-2">{field.validation?.required ? 'Yes' : 'No'}</td>
                      <td className="px-4 py-2 text-right space-x-2">
                        <button
                          onClick={() => handleEditField(category, field)}
                          className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteField(category._id, field._id)}
                          className="px-3 py-1 border border-red-300 text-red-600 rounded hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td className="px-4 py-2 text-center text-gray-500" colSpan={4}>No fields in this category</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmployeeFieldManagement;