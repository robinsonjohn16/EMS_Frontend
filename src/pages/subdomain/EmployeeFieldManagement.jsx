import React, { useEffect, useState } from 'react';
import { employeeFieldApi } from '../../services/employeeApi';
import CustomFieldForm from '../../components/employee/CustomFieldForm';
import FieldCategoryForm from '../../components/employee/FieldCategoryForm';
import FieldBuilderDialog from '../../components/employee/FieldBuilderDialog';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';
import { Pencil, Trash2, Plus, Wrench } from 'lucide-react';

const EmployeeFieldManagement = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  // Remove standalone forms; consolidate into builder
  const [showFieldForm, setShowFieldForm] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [builderCategory, setBuilderCategory] = useState(null);
  const [builderIntent, setBuilderIntent] = useState('edit');

  const refreshCategories = async () => {
    try {
      const res = await employeeFieldApi.getFieldCategories();
      const fetchedCategories = (res && res.data && res.data.categories)
        || (res && res.categories)
        || (Array.isArray(res) ? res : []);
      setCategories(fetchedCategories);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load field categories');
    }
  };

  useEffect(() => {
    refreshCategories();
  }, []);

  const openBuilder = (category, intent = 'edit') => {
    setBuilderCategory(category);
    setBuilderIntent(intent);
    setShowBuilder(true);
  };

  // Redirect actions to builder popup
  const handleAddCategory = () => {
    setEditingCategory(null);
    // For adding new category, still use existing form for now or future builder support
    setShowCategoryForm(true);
  };

  const handleEditCategory = (category) => {
    openBuilder(category, 'edit');
  };

  const handleDeleteCategory = async (categoryIdOrObj) => {
    const category = typeof categoryIdOrObj === 'object' ? categoryIdOrObj : categories.find(c => c._id === categoryIdOrObj);
    if (!category) return;
    openBuilder(category, 'delete');
  };

  const handleAddField = (category) => {
    openBuilder(category, 'addField');
  };

  const handleEditField = (category, field) => {
    setSelectedCategory(category);
    setEditingField(field);
    setShowFieldForm(true);
  };

  const handleDeleteField = async (categoryId, fieldId) => {
    openBuilder(categories.find(c => c._id === categoryId), 'edit');
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Employee Field Management</h1>
        <Button onClick={handleAddCategory}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Remove standalone forms to consolidate editing inside the builder */}
      {/* {showCategoryForm && (
        <FieldCategoryForm
          category={editingCategory}
          onSubmit={handleSubmitCategory}
          onCancel={() => setShowCategoryForm(false)}
        />
      )} */}

      {/* {showFieldForm && selectedCategory && (
        <CustomFieldForm
          field={editingField}
          categoryId={selectedCategory._id}
          onSubmit={handleSubmitField}
          onCancel={() => setShowFieldForm(false)}
        />
      )} */}

      <div className="space-y-6">
        {categories.map(category => (
          <div key={category._id} className="bg-white p-4 rounded-lg shadow">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">{category.name}</h2>
                {category.description && (
                  <p className="text-sm text-gray-600">{category.description}</p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEditCategory(category)}>
                  Edit Category
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDeleteCategory(category)}>
                  Delete Category
                </Button>
                <Button size="sm" onClick={() => handleAddField(category)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Field
                </Button>
                <Button variant="secondary" size="sm" onClick={() => openBuilder(category, 'edit')}>
                  <Wrench className="h-4 w-4 mr-2" />
                  Design with Builder
                </Button>
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
                        {/* <Button variant="ghost" size="icon" onClick={() => handleEditField(category, field)} aria-label="Edit field">
                          <Pencil className="h-4 w-4" />
                        </Button> */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label="Delete field" className="text-muted-foreground hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete field "{field.label || field.name}"?</AlertDialogTitle>
                              <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={async () => {
                                try {
                                  await employeeFieldApi.deleteField(category._id, field._id);
                                  toast.success('Field deleted');
                                  await refreshCategories();
                                } catch (e) {
                                  toast.error(e?.response?.data?.message || e?.message || 'Failed to delete field');
                                }
                              }}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
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

      <Dialog open={showFieldForm} onOpenChange={setShowFieldForm}>
        <DialogContent className="sm:max-w-5xl w-[92vw] max-h-[88vh] overflow-y-auto">
          <DialogHeader className="sticky top-0 bg-background z-1000 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-2xl">Edit Field: {editingField?.label || editingField?.name}</DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">Category: {selectedCategory?.name}</p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Delete field" className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete field "{editingField?.label || editingField?.name}"?</AlertDialogTitle>
                    <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={async () => {
                      try {
                        await employeeFieldApi.deleteField(selectedCategory?._id, editingField?._id);
                        toast.success('Field deleted');
                        setShowFieldForm(false);
                        await refreshCategories();
                      } catch (e) {
                        toast.error(e?.response?.data?.message || e?.message || 'Failed to delete field');
                      }
                    }}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </DialogHeader>

          <CustomFieldForm
            field={editingField}
            categoryId={selectedCategory?._id}
            hideActions={true}
            formId="edit-field-form"
            className="mt-2"
            onSubmit={async (categoryId, data, fieldId) => {
              try {
                await employeeFieldApi.updateField(categoryId, fieldId, data);
                setShowFieldForm(false);
                await refreshCategories();
              } catch (e) {
                toast.error(e?.response?.data?.message || e?.message || 'Failed to update field');
              }
            }}
            onCancel={() => setShowFieldForm(false)}
          />

          <DialogFooter className="sticky bottom-0 bg-background pt-4 mt-6 border-t">
            <Button variant="outline" onClick={() => setShowFieldForm(false)}>
              Cancel
            </Button>
            <Button onClick={() => document.getElementById('edit-field-form')?.requestSubmit()}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <FieldBuilderDialog
        open={showBuilder}
        onOpenChange={(o) => { setShowBuilder(o); if (!o) refreshCategories(); }}
        category={builderCategory}
        intent={builderIntent}
        onCategoryDeleted={async () => { await refreshCategories(); }}
        onFieldsSaved={async () => { await refreshCategories(); }}
      />
    </div>
  );
};

export default EmployeeFieldManagement;