import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { CheckCircle, Clock, XCircle, Send, User, FileText, AlertCircle, Shield, Upload, Camera, Save } from 'lucide-react';
import employeeApi from '../../services/employeeApi';
import { tenantAuthApi } from '../../services/tenantApi';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { getAssetUrl } from '@/lib/assets';
import { Link } from 'react-router-dom';

const EmployeeDetails = () => {
  const user = useSelector(state => state.tenantAuth.user);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submittingForApproval, setSubmittingForApproval] = useState(false);
  const [submittingUnlock, setSubmittingUnlock] = useState(false);
  const [submittingCategories, setSubmittingCategories] = useState({});
  const [categories, setCategories] = useState([]);
  const [employeeData, setEmployeeData] = useState(null);
  const [formValues, setFormValues] = useState({});
  const [errors, setErrors] = useState({});
  const [previewImage, setPreviewImage] = useState(null);
  const [profileValues, setProfileValues] = useState({
    employeeId: '',
    dateOfJoining: '',
    gender: '',
    panNumber: '',
    aadhaarNumber: '',
    uanNumber: '',
    esicIpNumber: '',
    bankAccountNumber: '',
    ifscCode: '',
    avatar: ''
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileErrors, setProfileErrors] = useState({});
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch field categories with user data included
        const categoriesResponse = await employeeApi.fields.getFieldCategories();
        const fetchedCategories = categoriesResponse.data.categories || [];
        const userData = categoriesResponse.data.userData || {};
        const profile = categoriesResponse.data.profile || null;
        
        setCategories(fetchedCategories);
        
        const transformedFields = {};
        fetchedCategories.forEach(category => {
          transformedFields[category.name] = {};
          
          if (category.fields && category.fields.length > 0) {
            category.fields.forEach(field => {
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
        
        setFormValues(transformedFields);
        
        // Set employee data for approval status
        setEmployeeData(categoriesResponse.data.employee || {});
        
        // Initialize Employment & Identity section from returned profile
        const toDateInput = (d) => {
          if (!d) return '';
          try {
            const dt = new Date(d);
            if (isNaN(dt.getTime())) return '';
            const yyyy = dt.getFullYear();
            const mm = String(dt.getMonth() + 1).padStart(2, '0');
            const dd = String(dt.getDate()).padStart(2, '0');
            return `${yyyy}-${mm}-${dd}`;
          } catch {
            return '';
          }
        };
        setProfileValues({
          employeeId: profile?.employeeId || '',
          dateOfJoining: toDateInput(profile?.dateOfJoining),
          gender: profile?.gender || '',
          panNumber: profile?.panNumber || '',
          aadhaarNumber: profile?.aadhaarNumber || '',
          uanNumber: profile?.uanNumber || '',
          esicIpNumber: profile?.esicIpNumber || '',
          bankAccountNumber: profile?.bankAccountNumber || '',
          ifscCode: profile?.ifscCode || '',
          avatar: profile?.avatar || user?.avatar || ''
        });
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load employee data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleProfileChange = (fieldName, value) => {
    setProfileValues((prev) => ({ ...prev, [fieldName]: value }));
  };

  const validateProfile = () => {
    const errs = {};
    const v = profileValues || {};
    const val = (s) => (s || '').toString().trim();
    const pan = val(v.panNumber).toUpperCase();
    const ifsc = val(v.ifscCode).toUpperCase();
    const aadhaar = val(v.aadhaarNumber);
    const uan = val(v.uanNumber);
    const esic = val(v.esicIpNumber);
    const acc = val(v.bankAccountNumber);
  
    if (pan && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan)) errs.panNumber = 'PAN must be 5 letters, 4 digits, 1 letter';
    if (ifsc && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc)) errs.ifscCode = 'IFSC must be 11 chars: AAAA0XXXXXX';
    if (aadhaar && !/^[0-9]{12}$/.test(aadhaar)) errs.aadhaarNumber = 'Aadhaar must be 12 digits';
    if (uan && !/^[0-9]{12}$/.test(uan)) errs.uanNumber = 'UAN must be 12 digits';
    if (esic && !/^[0-9]{10}$/.test(esic)) errs.esicIpNumber = 'ESIC IP must be 10 digits';
    if (acc && !/^[0-9]{9,18}$/.test(acc)) errs.bankAccountNumber = 'Account must be 9–18 digits';
  
    if (v.dateOfJoining) {
      const d = new Date(v.dateOfJoining);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (d > today) errs.dateOfJoining = 'Date of joining cannot be in the future';
    }
  
    setProfileErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveProfile = async () => {
    if (areFieldsLocked()) {
      toast.error('Cannot save changes while approval is pending or approved');
      return;
    }
    const ok = validateProfile();
    if (!ok) {
      toast.error('Please fix highlighted fields');
      return;
    }
    try {
      setSavingProfile(true);
      const payload = {
        panNumber: profileValues.panNumber,
        aadhaarNumber: profileValues.aadhaarNumber,
        bankAccountNumber: profileValues.bankAccountNumber,
        ifscCode: profileValues.ifscCode,
        gender: profileValues.gender,
        avatar: profileValues.avatar
      };
      // Convert date for API
      const res = await tenantAuthApi.updateProfile(payload);
      const updated = res?.data || res;
      toast.success('Profile updated successfully');
      // Normalize returned values back to inputs
      const toDateInput = (d) => {
        if (!d) return '';
        const dt = new Date(d);
        const yyyy = dt.getFullYear();
        const mm = String(dt.getMonth() + 1).padStart(2, '0');
        const dd = String(dt.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
      };
      setProfileValues({
        employeeId: updated?.employeeId ?? profileValues.employeeId,
        dateOfJoining: toDateInput(updated?.dateOfJoining ?? profileValues.dateOfJoining),
        gender: profileValues.gender,
        panNumber: updated?.panNumber ?? profileValues.panNumber,
        aadhaarNumber: updated?.aadhaarNumber ?? profileValues.aadhaarNumber,
        uanNumber: profileValues.uanNumber,
        esicIpNumber: profileValues.esicIpNumber,
        bankAccountNumber: updated?.bankAccountNumber ?? profileValues.bankAccountNumber,
        ifscCode: updated?.ifscCode ?? profileValues.ifscCode,
        avatar: updated?.avatar ?? profileValues.avatar,
      });
    } catch (err) {
      console.error('Failed to save profile', err);
      toast.error(err?.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAvatarUpload = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);

    try {
      setUploadingAvatar(true);
      const formData = new FormData();
      formData.append('avatar', file);
      const response = await tenantAuthApi.updateProfile(formData);
      const updated = response?.data || response;
      toast.success('Profile photo updated successfully');
      setProfileValues(prev => ({
        ...prev,
        avatar: updated?.avatar || prev.avatar
      }));
      setAvatarPreview(null);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error(error?.response?.data?.message || 'Failed to upload profile picture');
      setAvatarPreview(null);
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Helper: parse comma-separated extensions (e.g. ".pdf,.docx") to a Set
  const parseAcceptedTypes = (acceptStr) => {
    const set = new Set();
    if (!acceptStr) return set;
    acceptStr.split(',').map(s => s.trim()).forEach(token => {
      // Accept tokens like ".pdf" or "pdf"; ignore mime wildcards here
      if (!token) return;
      if (token.includes('/')) return; // skip mime patterns, handled separately
      const ext = token.replace(/^\./, '').toLowerCase();
      if (ext) set.add(ext);
    });
    return set;
  };

  const handleInputChange = (categoryName, fieldName, value) => {
    setFormValues(prev => ({
      ...prev,
      [categoryName]: {
        ...prev[categoryName],
        [fieldName]: value
      }
    }));
  };

  const renderField = (field, categoryName) => {
    const value = formValues[categoryName]?.[field.name] ?? '';
    const isDisabled = !field.isEmployeeEditable || areFieldsLocked();
  
    switch (field.type) {
      case 'text':
      case 'email':
      case 'phone':
      case 'url':
        return (
          <div>
            <Input
              type={field.type === 'text' ? 'text' : field.type}
              value={value || ''}
              onChange={(e) => handleInputChange(categoryName, field.name, e.target.value)}
              disabled={isDisabled}
              placeholder={field.placeholder || `Enter ${field.name}`}
            />
            {errors?.[field._id] && (
              <p className="mt-1 text-sm text-red-600">{errors[field._id]}</p>
            )}
          </div>
        );
  
      case 'number':
        return (
          <div>
            <Input
              type="number"
              value={value || ''}
              onChange={(e) => handleInputChange(categoryName, field.name, e.target.value)}
              disabled={isDisabled}
              placeholder={field.placeholder || `Enter ${field.name}`}
            />
            {errors?.[field._id] && (
              <p className="mt-1 text-sm text-red-600">{errors[field._id]}</p>
            )}
          </div>
        );
  
      case 'date':
        return (
          <div>
            <Input
              type="date"
              value={value || ''}
              onChange={(e) => handleInputChange(categoryName, field.name, e.target.value)}
              disabled={isDisabled}
            />
            {errors?.[field._id] && (
              <p className="mt-1 text-sm text-red-600">{errors[field._id]}</p>
            )}
          </div>
        );
  
      case 'textarea':
        return (
          <div>
            <Textarea
              value={value || ''}
              onChange={(e) => handleInputChange(categoryName, field.name, e.target.value)}
              disabled={isDisabled}
              placeholder={field.placeholder || `Enter ${field.name}`}
              rows={3}
            />
            {errors?.[field._id] && (
              <p className="mt-1 text-sm text-red-600">{errors[field._id]}</p>
            )}
          </div>
        );
  
      case 'select':
        return (
          <div>
            <Select value={value || ''} onValueChange={(v) => handleInputChange(categoryName, field.name, v)} disabled={isDisabled}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={`Select ${field.name}`} />
              </SelectTrigger>
              <SelectContent>
                {(field.options || []).map((option, idx) => (
                  <SelectItem key={`${field._id}-opt-${idx}`} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors?.[field._id] && (
              <p className="mt-1 text-sm text-red-600">{errors[field._id]}</p>
            )}
          </div>
        );
  
      case 'multiselect': {
        const arr = Array.isArray(value) ? value : [];
        const toggle = (opt, checked) => {
          const next = checked ? [...arr, opt] : arr.filter((o) => o !== opt);
          handleInputChange(categoryName, field.name, next);
        };
        return (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {(field.options || []).map((option, idx) => {
                const checked = arr.includes(option);
                return (
                  <div key={`${field._id}-multi-${idx}`} className="flex items-center gap-2 border rounded-md px-3 py-2">
                    <Checkbox id={`${field._id}-multi-${idx}`} checked={checked} onCheckedChange={(c) => toggle(option, !!c)} disabled={isDisabled} />
                    <Label htmlFor={`${field._id}-multi-${idx}`}>{option}</Label>
                  </div>
                );
              })}
            </div>
            {errors?.[field._id] && (
              <p className="mt-1 text-sm text-red-600">{errors[field._id]}</p>
            )}
          </div>
        );
      }
  
      case 'radio': {
        const opts = field.options || [];
        return (
          <div>
            <RadioGroup value={value || ''} onValueChange={(v) => handleInputChange(categoryName, field.name, v)} disabled={isDisabled}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {opts.map((option, idx) => (
                  <div key={`${field._id}-radio-${idx}`} className="flex items-center space-x-2 border rounded-md px-3 py-2">
                    <RadioGroupItem value={option} id={`${field._id}-radio-${idx}`} />
                    <Label htmlFor={`${field._id}-radio-${idx}`}>{option}</Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
            {errors?.[field._id] && (
              <p className="mt-1 text-sm text-red-600">{errors[field._id]}</p>
            )}
          </div>
        );
      }
  
      case 'checkbox': {
        const boolVal = !!value;
        return (
          <div className="flex items-center gap-2">
            <Checkbox id={`${field._id}-checkbox`} checked={boolVal} onCheckedChange={(c) => handleInputChange(categoryName, field.name, !!c)} disabled={isDisabled} />
            <Label htmlFor={`${field._id}-checkbox`}>{field.label || field.name}</Label>
            {errors?.[field._id] && (
              <p className="mt-1 text-sm text-red-600">{errors[field._id]}</p>
            )}
          </div>
        );
      }
  
      case 'file':
      case 'image': {
        const files = Array.isArray(value) ? value : value ? [value] : [];
        const multiple = (field.validation?.maxFiles || 1) > 1;
        const accept = field.acceptedTypes || (field.type === 'image' ? 'image/*' : undefined);
        const extSet = parseAcceptedTypes(accept);
        const openPreview = (url) => setPreviewImage(url);

        const onFilesSelected = (selected) => {
          const list = Array.from(selected || []);
          const maxFiles = field.validation?.maxFiles || 1;
          if (list.length > maxFiles) {
            setErrors(prev => ({ ...prev, [field._id]: `You can select up to ${maxFiles} file(s)` }));
            return;
          }
          const invalid = [];
          const sizeErrors = [];
          const minMB = field.validation?.min;
          const maxMB = field.validation?.max;

          list.forEach(f => {
            const ext = f.name.split('.').pop()?.toLowerCase() || '';
            const typeOk = extSet.size === 0 || extSet.has(ext) || (accept?.includes('image/*') && f.type.startsWith('image/'));
            if (!typeOk) invalid.push(f.name);
            if (minMB && f.size < minMB * 1024 * 1024) sizeErrors.push(`${f.name} below ${minMB}MB`);
            if (maxMB && f.size > maxMB * 1024 * 1024) sizeErrors.push(`${f.name} exceeds ${maxMB}MB`);
          });
          if (invalid.length) {
            setErrors(prev => ({ ...prev, [field._id]: `Invalid file type: ${invalid.join(', ')}` }));
            return;
          }
          if (sizeErrors.length) {
            setErrors(prev => ({ ...prev, [field._id]: sizeErrors.join('; ') }));
            return;
          }
          setErrors(prev => {
            const clone = { ...prev };
            delete clone[field._id];
            return clone;
          });
          const existingStrings = files.filter(v => typeof v === 'string');
          if (multiple) {
            const combined = [...existingStrings, ...list].slice(0, maxFiles);
            handleInputChange(categoryName, field.name, combined);
          } else {
            handleInputChange(categoryName, field.name, list[0] || null);
          }
        };

        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                id={`${field._id}-file`}
                type="file"
                accept={accept}
                multiple={multiple}
                className="hidden"
                onChange={(e) => onFilesSelected(e.target.files)}
                disabled={isDisabled}
              />
              <Label htmlFor={`${field._id}-file`} className="sr-only">{field.label || field.name}</Label>
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById(`${field._id}-file`)?.click()}
                disabled={isDisabled}
              >
                {multiple ? 'Choose files' : 'Choose file'}
              </Button>
              {accept && <span className="text-xs text-gray-500">Allowed: {accept}</span>}
              {field.validation?.max && <span className="text-xs text-gray-500 ml-2">Max {field.validation.max}MB</span>}
            </div>

            {files.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {files.map((f, idx) => {
                  const isFile = f instanceof File;
                  const isImage = isFile ? f.type.startsWith('image/') : typeof f === 'string';
                  const fileUrl = isFile ? URL.createObjectURL(f) : getAssetUrl(f);
                  const fileName = isFile ? f.name : f.split('/').pop() || 'file';

                  return (
                    <div key={idx} className="flex items-center justify-between rounded-md border p-2">
                      <div className="flex items-center gap-3">
                        {field.type === 'image' && isImage ? (
                          <img
                            src={fileUrl}
                            alt={fileName}
                            className="h-12 w-12 object-cover rounded cursor-pointer"
                            onClick={() => openPreview(fileUrl)}
                          />
                        ) : (
                          <FileText className="h-5 w-5 text-gray-500" />
                        )}

                        <div>
                          {typeof f === 'string' ? (
                            <a
                              href={fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-medium text-blue-600 hover:underline"
                            >
                              {fileName}
                            </a>
                          ) : (
                            <p className="text-sm font-medium text-gray-900">{fileName}</p>
                          )}
                          <p className="text-xs text-gray-500">
                            {isFile ? `${(f.size / (1024 * 1024)).toFixed(2)} MB` : 'Saved'}
                          </p>
                        </div>
                      </div>

                      {!isDisabled && (
                        <Button
                          type="button"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => {
                            if (multiple) {
                              const next = files.filter((_, i) => i !== idx);
                              handleInputChange(categoryName, field.name, next.length ? next : []);
                            } else {
                              handleInputChange(categoryName, field.name, null);
                            }
                          }}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {errors?.[field._id] && (
              <p className="mt-1 text-sm text-red-600">{errors[field._id]}</p>
            )}
          </div>
        );
      }
  
      default:
        return (
          <div>
            <Input
              type="text"
              value={value || ''}
              onChange={(e) => handleInputChange(categoryName, field.name, e.target.value)}
              disabled={isDisabled}
              placeholder={field.placeholder || `Enter ${field.name}`}
            />
            {errors?.[field._id] && (
              <p className="mt-1 text-sm text-red-600">{errors[field._id]}</p>
            )}
          </div>
        );
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;
  
    categories.forEach(category => {
      if (category.fields) {
        category.fields.forEach(field => {
          const required = !!field.validation?.required;
          if (required) {
            const value = formValues[category.name]?.[field.name];
            const hasValue = Array.isArray(value)
              ? value.length > 0
              : (typeof value === 'string'
                ? value.trim() !== ''
                : value !== undefined && value !== null);
            if (!hasValue) {
              newErrors[field._id] = `${field.name} is required`;
              isValid = false;
              return; // skip further checks for this field
            }
          }

          // Additional client-side validations for file/image
          if ((field.type === 'file' || field.type === 'image')) {
            const accept = field.acceptedTypes || (field.type === 'image' ? 'image/*' : undefined);
            const extSet = parseAcceptedTypes(accept);
            const val = formValues[category.name]?.[field.name];
            const files = Array.isArray(val) ? val : val ? [val] : [];
            if (files.length) {
              const maxFiles = field.validation?.maxFiles || 1;
              if (files.length > maxFiles) {
                newErrors[field._id] = `You can select up to ${maxFiles} file(s)`;
                isValid = false;
                return;
              }
              const minMB = field.validation?.min;
              const maxMB = field.validation?.max;
              for (const f of files) {
                const ext = f.name?.split('.').pop()?.toLowerCase() || '';
                const typeOk = extSet.size === 0 || extSet.has(ext) || (accept?.includes('image/*') && f.type?.startsWith('image/'));
                if (!typeOk) {
                  newErrors[field._id] = `Invalid file type for ${f.name}`;
                  isValid = false;
                  break;
                }
                if (minMB && f.size < minMB * 1024 * 1024) {
                  newErrors[field._id] = `${f.name} below ${minMB}MB`;
                  isValid = false;
                  break;
                }
                if (maxMB && f.size > maxMB * 1024 * 1024) {
                  newErrors[field._id] = `${f.name} exceeds ${maxMB}MB`;
                  isValid = false;
                  break;
                }
              }
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

    if (areFieldsLocked()) {
      toast.error('Cannot save changes while approval is pending or approved');
      return;
    }

    try {
      setSubmitting(true);
      
      // Submit each category with a single multipart payload (fields + files)
      for (const category of categories) {
        if (!category.fields || category.fields.length === 0) continue;

        const formData = new FormData();
        formData.append('categoryName', category.name);
        const fieldsObj = {};
        let hasFiles = false;

        for (const field of category.fields) {
          const value = formValues[category.name]?.[field.name];
          const isFileType = field.type === 'file' || field.type === 'image';
          if (isFileType) {
            const filesArray = Array.isArray(value) ? value : (value ? [value] : []);
            const newFiles = filesArray.filter(v => v && typeof v === 'object' && 'name' in v);
            const existingUrls = filesArray.filter(v => typeof v === 'string');
            const maxFiles = field.validation?.maxFiles || 1;
            fieldsObj[field.name] = maxFiles > 1 ? existingUrls : (existingUrls[0] || '');
            newFiles.forEach(file => {
              formData.append(field.name, file);
              hasFiles = true;
            });
          } else {
            // Always include value to allow clearing overrides
            const normalized = Array.isArray(value)
              ? value
              : (value == null ? '' : value);
            fieldsObj[field.name] = normalized;
          }
        }

        const hasFields = Object.keys(fieldsObj).length > 0;
        if (!hasFields && !hasFiles) continue;

        formData.append('fields', JSON.stringify(fieldsObj));
        const response = await employeeApi.details.updateEmployeeFields(formData);
        const updated = response?.data || response?.employee;
        if (updated) {
          setEmployeeData(updated);
          const catData = (updated.customFields && (updated.customFields[category.name] || updated.customFields?.get?.(category.name))) || {};
          setFormValues(prev => ({
            ...prev,
            [category.name]: {
              ...prev[category.name],
              ...catData
            }
          }));
        }
      }

      toast.success('Details saved successfully');
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
          if (field.validation?.required) {
            const value = formValues[category.name]?.[field.name];
            const isFileType = field.type === 'file' || field.type === 'image';
            const missing = Array.isArray(value)
              ? value.length === 0
              : (typeof value === 'string' ? value.trim() === '' : value == null);
            if (missing) {
              categoryErrors[field._id] = `${field.name} is required`;
              isValid = false;
            }
            if (isFileType) {
              const filesArray = Array.isArray(value) ? value : (value ? [value] : []);
              const hasFileLike = filesArray.length > 0;
              if (!hasFileLike) {
                categoryErrors[field._id] = `${field.name} is required`;
                isValid = false;
              }
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
      
      // Build single multipart payload for this category
      const formData = new FormData();
      formData.append('categoryName', category.name);
      const fieldsObj = {};
      let hasFiles = false;

      if (category.fields) {
        category.fields.forEach(field => {
          const value = formValues[category.name]?.[field.name];
          const isFileType = field.type === 'file' || field.type === 'image';
          if (isFileType) {
            const filesArray = Array.isArray(value) ? value : (value ? [value] : []);
            const newFiles = filesArray.filter(v => v && typeof v === 'object' && 'name' in v);
            const existingUrls = filesArray.filter(v => typeof v === 'string');
            const maxFiles = field.validation?.maxFiles || 1;
            fieldsObj[field.name] = maxFiles > 1 ? existingUrls : (existingUrls[0] || '');
            newFiles.forEach(file => {
              formData.append(field.name, file);
              hasFiles = true;
            });
          } else {
            const include = Array.isArray(value)
              ? value.length > 0
              : (typeof value === 'string' ? value.trim() !== '' : value != null);
            if (include) {
              fieldsObj[field.name] = value;
            }
          }
        });
      }

      const hasFields = Object.keys(fieldsObj).length > 0;
      if (!hasFields && !hasFiles) {
        toast.info(`No changes to save for ${category.name}`);
      } else {
        formData.append('fields', JSON.stringify(fieldsObj));
        const response = await employeeApi.details.updateEmployeeFields(formData);
        const updated = response?.data || response?.employee;
        if (updated) {
          setEmployeeData(updated);
          const catData = (updated.customFields && (updated.customFields[category.name] || updated.customFields?.get?.(category.name))) || {};
          setFormValues(prev => ({
            ...prev,
            [category.name]: {
              ...prev[category.name],
              ...catData
            }
          }));
        }
        toast.success(`${category.name} saved successfully`);
      }
    } catch (error) {
      console.error('Error saving category:', error);
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

  const handleRequestUnlock = async () => {
    try {
      setSubmittingUnlock(true);
      if (!employeeData?._id) {
        toast.error('Employee data not found. Please save your details first.');
        return;
      }
      const reason = window.prompt('Provide a reason for unlock (optional):') || '';
      const response = await employeeApi.details.requestUnlockFields(employeeData._id, reason);
      if (response?.unlockStatus?.status || response?.data?.unlockStatus?.status) {
        const unlockStatus = response.unlockStatus || response.data.unlockStatus;
        toast.success('Unlock request sent to HR');
        setEmployeeData(prev => ({
          ...prev,
          unlockStatus
        }));
      }
    } catch (error) {
      console.error('Error requesting unlock:', error);
      toast.error(error.response?.data?.message || 'Failed to request unlock');
    } finally {
      setSubmittingUnlock(false);
    }
  };
  
  const getApprovalStatusInfo = () => {
    if (employeeData?.unlockStatus?.status === 'requested') {
      return {
        status: 'unlock_requested',
        text: 'Unlock Requested',
        color: 'text-yellow-700',
        bgColor: 'bg-yellow-100',
        icon: Shield,
        variant: 'secondary'
      };
    }

    switch (status) {
      case 'submitted':
        return {
          status: 'submitted',
          text: 'Submitted for Review',
          color: 'text-yellow-700',
          bgColor: 'bg-yellow-100',
          icon: Clock,
          variant: 'secondary',
          submittedAt: employeeData?.approvalStatus?.submittedAt
        };
      case 'approved':
        return {
          status: 'approved',
          text: 'Approved by HR',
          color: 'text-green-700',
          bgColor: 'bg-green-100',
          icon: CheckCircle,
          variant: 'default',
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
          variant: 'destructive',
          reviewedAt: employeeData?.approvalStatus?.reviewedAt,
          reviewComments: employeeData?.approvalStatus?.reviewComments
        };
      default:
        return {
          status: 'draft',
          text: 'Draft',
          color: 'text-gray-700',
          bgColor: 'bg-gray-100',
          icon: FileText,
          variant: 'outline'
        };
    }
  };

  const areFieldsLocked = () => {
    const approvalLocked = employeeData?.approvalStatus?.status === 'approved' || employeeData?.approvalStatus?.status === 'submitted';
    const unlockPending = employeeData?.unlockStatus?.status === 'requested';
    return approvalLocked || unlockPending;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Loading employee details...</p>
        </div>
      </div>
    );
  }

  const approvalInfo = getApprovalStatusInfo();
  const displayName = user?.firstName || user?.lastName ? `${user?.firstName || ''} ${user?.lastName || ''}`.trim() : (user?.email || 'User');
  const initial = (user?.firstName?.[0] || user?.email?.[0] || 'U').toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header Section */}
        <Card className="mb-6">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl">My Details</CardTitle>
                  <p className="text-gray-600 mt-1">Manage your personal and professional information</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Badge variant={approvalInfo.variant} className="px-3 py-1">
                  {approvalInfo.icon && <approvalInfo.icon className="h-4 w-4 mr-1" />}
                  {approvalInfo.text}
                </Badge>
                <Button onClick={handleSubmitForApproval} disabled={submittingForApproval || areFieldsLocked()}>
                  <Send className="h-5 w-5 mr-2" />
                  <span>{submittingForApproval ? 'Submitting...' : 'Submit for Approval'}</span>
                </Button>
                {(employeeData?.approvalStatus?.status === 'approved' || employeeData?.approvalStatus?.status === 'submitted') && employeeData?.unlockStatus?.status !== 'requested' && (
                  <Button onClick={handleRequestUnlock} disabled={submittingUnlock}>
                    <Shield className="h-5 w-5 mr-2" />
                    <span>{submittingUnlock ? 'Requesting...' : 'Request Unlock'}</span>
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Basic Info section (tenant user fields) */}
        <Card className="mb-6">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">Basic Information</CardTitle>
                <p className="text-sm text-gray-600 mt-1">Employment & identity details from your user profile</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Profile Photo uploader */}
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="h-20 w-20">
                {avatarPreview ? (
                  <AvatarImage src={avatarPreview} alt="Preview" />
                ) : profileValues?.avatar ? (
                  <AvatarImage src={getAssetUrl(profileValues.avatar)} alt={displayName} />
                ) : null}
                <AvatarFallback className="text-lg font-semibold">{initial}</AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Manage your profile photo</p>
                <div className="flex items-center gap-2">
                  <input
                    id="employee-details-avatar-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleAvatarUpload(file);
                      e.target.value = '';
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('employee-details-avatar-input')?.click()}
                    disabled={uploadingAvatar}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    {uploadingAvatar ? 'Uploading...' : 'Upload Photo'}
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Employee ID */}
              <div className="space-y-2">
                <Label className="block text-sm font-medium text-gray-700">Employee ID</Label>
                <Input
                  type="text"
                  value={profileValues.employeeId || ''}
                  onChange={(e) => handleProfileChange('employeeId', e.target.value)}
                  disabled={true}
                  placeholder="Enter Employee ID"
                />
                {profileErrors.employeeId && (
                  <p className="text-xs text-red-600">{profileErrors.employeeId}</p>
                )}
              </div>

              {/* Date of Joining */}
              <div className="space-y-2">
                <Label className="block text-sm font-medium text-gray-700">Date of Joining</Label>
                <Input
                  type="date"
                  value={profileValues.dateOfJoining || ''}
                  onChange={(e) => handleProfileChange('dateOfJoining', e.target.value)}
                  disabled={true}
                />
                {profileErrors.dateOfJoining && (
                  <p className="text-xs text-red-600">{profileErrors.dateOfJoining}</p>
                )}
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <Label className="block text-sm font-medium text-gray-700">Gender</Label>
                <Select
                  value={profileValues.gender || ''}
                  onValueChange={(value) => handleProfileChange('gender', value)}
                  disabled={false}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* PAN Number */}
              <div className="space-y-2">
                <Label className="block text-sm font-medium text-gray-700">PAN Number</Label>
                <Input
                  type="text"
                  value={profileValues.panNumber || ''}
                  onChange={(e) => handleProfileChange('panNumber', e.target.value)}
                  disabled={false}
                  placeholder="ABCDE1234F"
                />
                {profileErrors.panNumber && (
                  <p className="text-xs text-red-600">{profileErrors.panNumber}</p>
                )}
              </div>

              {/* Aadhaar Number */}
              <div className="space-y-2">
                <Label className="block text-sm font-medium text-gray-700">Aadhaar Number</Label>
                <Input
                  type="text"
                  value={profileValues.aadhaarNumber || ''}
                  onChange={(e) => handleProfileChange('aadhaarNumber', e.target.value)}
                  disabled={false}
                  placeholder="12-digit Aadhaar"
                />
                {profileErrors.aadhaarNumber && (
                  <p className="text-xs text-red-600">{profileErrors.aadhaarNumber}</p>
                )}
              </div>

              {/* UAN Number */}
              <div className="space-y-2">
                <Label className="block text-sm font-medium text-gray-700">UAN Number</Label>
                <Input
                  type="text"
                  value={profileValues.uanNumber || ''}
                  onChange={(e) => handleProfileChange('uanNumber', e.target.value)}
                  disabled={true}
                  placeholder="12-digit UAN"
                />
                {profileErrors.uanNumber && (
                  <p className="text-xs text-red-600">{profileErrors.uanNumber}</p>
                )}
              </div>

              {/* ESIC IP Number */}
              <div className="space-y-2">
                <Label className="block text-sm font-medium text-gray-700">ESIC IP Number</Label>
                <Input
                  type="text"
                  value={profileValues.esicIpNumber || ''}
                  onChange={(e) => handleProfileChange('esicIpNumber', e.target.value)}
                  disabled={true}
                  placeholder="10-digit ESIC IP"
                />
                {profileErrors.esicIpNumber && (
                  <p className="text-xs text-red-600">{profileErrors.esicIpNumber}</p>
                )}
              </div>

              {/* Bank Account Number */}
              <div className="space-y-2">
                <Label className="block text-sm font-medium text-gray-700">Bank Account Number</Label>
                <Input
                  type="text"
                  value={profileValues.bankAccountNumber || ''}
                  onChange={(e) => handleProfileChange('bankAccountNumber', e.target.value)}
                  disabled={false}
                  placeholder="9–18 digits"
                />
                {profileErrors.bankAccountNumber && (
                  <p className="text-xs text-red-600">{profileErrors.bankAccountNumber}</p>
                )}
              </div>

              {/* IFSC Code */}
              <div className="space-y-2">
                <Label className="block text-sm font-medium text-gray-700">IFSC Code</Label>
                <Input
                  type="text"
                  value={profileValues.ifscCode || ''}
                  onChange={(e) => handleProfileChange('ifscCode', e.target.value)}
                  disabled={false}
                  placeholder="AAAA0XXXXXX"
                />
                {profileErrors.ifscCode && (
                  <p className="text-xs text-red-600">{profileErrors.ifscCode}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-200 mt-6">
              <Button type="button" onClick={handleSaveProfile} disabled={savingProfile}>
                <Save className="h-4 w-4 mr-2" />
                {savingProfile ? 'Saving...' : 'Save Basic Info'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Custom Field Categories */}
        {categories.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="bg-gray-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Employee Fields Configured</h3>
              <p className="text-gray-500 mb-4">No employee fields have been defined yet.</p>
              <p className="text-gray-500">Please contact HR to set up employee fields.</p>
            </CardContent>
          </Card>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {categories.map((category) => (
              <Card key={category._id} className="overflow-hidden">
                {/* Category Header */}
                <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold text-gray-900">{category.name}</CardTitle>
                        {category.description && (
                          <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                        )}
                      </div>
                    </div>
                    <Button
                      type="button"
                      onClick={() => handleCategorySubmit(category)}
                      disabled={submittingCategories[category._id] || areFieldsLocked()}
                      size="sm"
                    >
                      {submittingCategories[category._id] ? `Saving...` : `Save ${category.name}`}
                    </Button>
                  </div>
                </CardHeader>
                
                {/* Category Content */}
                <CardContent className="p-6">
                  {category.fields && category.fields.some(f => f.isVisible !== false) ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {category.fields.filter(f => f.isVisible !== false).map((field) => (
                          <div key={field._id} className="space-y-2">
                            <Label className="block text-sm font-medium text-gray-700">
                              {field.label || field.name}
                              {(field.validation?.required) && <span className="text-red-500 ml-1">*</span>}
                            </Label>
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
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm">No fields defined in this category yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            
            {/* Main Save Button */}
            <Card>
              <CardFooter className="flex justify-center pt-6">
                <Button
                  type="submit"
                  disabled={submitting || areFieldsLocked()}
                  className="px-8 py-3"
                >
                  {submitting ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Saving...</span>
                    </div>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save All Details
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </form>
        )}
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Image Preview</DialogTitle>
            </DialogHeader>
            <div className="flex items-center justify-center p-4">
              <img src={previewImage} alt="Preview" className="max-h-[60vh] rounded-lg shadow-lg" />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default EmployeeDetails;
 
 
 // Helper: parse comma-separated extensions (e.g. ".pdf,.docx") to a Set