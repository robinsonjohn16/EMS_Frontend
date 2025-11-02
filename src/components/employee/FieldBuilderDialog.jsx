"use client"
import { useEffect, useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import { ChevronUp, ChevronDown, Trash2, GripVertical, X, Pencil, Plus } from "lucide-react"
import { toast } from "sonner"
import { employeeFieldApi } from "../../services/employeeApi"
import { Badge } from "@/components/ui/badge"

const FIELD_TYPES = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "textarea", label: "Textarea" },
  { value: "select", label: "Select" },
  { value: "multiselect", label: "Multi Select" },
  { value: "radio", label: "Radio" },
  { value: "checkbox", label: "Checkbox" },
  { value: "file", label: "File" },
]

const FILE_EXTENSION_PRESETS = [
  { value: "images", label: "Images (jpg, jpeg, png, gif, webp)", extensions: ["jpg", "jpeg", "png", "gif", "webp"] },
  { value: "documents", label: "Documents (pdf, doc, docx)", extensions: ["pdf", "doc", "docx"] },
  { value: "spreadsheets", label: "Spreadsheets (xls, xlsx, csv)", extensions: ["xls", "xlsx", "csv"] },
  { value: "archives", label: "Archives (zip, rar, 7z)", extensions: ["zip", "rar", "7z"] },
  { value: "none", label: "No restriction", extensions: [] },
]

const mapTypeToBuilder = (t) => {
  const map = {
    text: "text",
    number: "number",
    date: "date",
    select: "select",
    multiselect: "multiselect",
    checkbox: "checkbox",
    textarea: "textarea",
    file: "file",
    email: "text",
    phone: "text",
    url: "text",
    radio: "radio",
    image: "file",
  }
  return map[t] || "text"
}

const mapTypeFromBuilder = (t) => {
  const map = {
    text: "text",
    number: "number",
    date: "date",
    select: "select",
    multiselect: "multiselect",
    checkbox: "checkbox",
    textarea: "textarea",
    file: "file",
    radio: "radio",
  }
  return map[t] || "text"
}

const toBuilderItems = (fields = []) => {
  return fields.map((f) => ({
    id: String(f._id || f.name || f.label),
    type: mapTypeToBuilder(f.type),
    label: f.label || f.name,
    placeholder: f.placeholder || "",
    required: !!f.validation?.required,
    options: Array.isArray(f.options) ? f.options : [],
    visible: f.isVisible !== false,
    min: f.validation?.min,
    max: f.validation?.max,
    minLength: f.validation?.minLength,
    maxLength: f.validation?.maxLength,
    pattern: f.validation?.pattern || "",
    acceptedTypesList:
      typeof f.acceptedTypes === "string" && f.acceptedTypes
        ? f.acceptedTypes
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
    maxFiles: f.validation?.maxFiles,
  }))
}

const fromBuilderItem = (item) => {
  return {
    name: item.label?.toLowerCase().replace(/\s+/g, "_") || "field",
    label: item.label || "Field",
    type: mapTypeFromBuilder(item.type),
    description: "",
    placeholder: item.placeholder || "",
    options: Array.isArray(item.options) ? item.options : undefined,
    acceptedTypes:
      Array.isArray(item.acceptedTypesList) && item.acceptedTypesList.length
        ? item.acceptedTypesList.join(", ")
        : undefined,
    validation: {
      required: !!item.required,
      min: item.min !== undefined && item.min !== "" ? Number(item.min) : undefined,
      max: item.max !== undefined && item.max !== "" ? Number(item.max) : undefined,
      minLength: item.minLength !== undefined && item.minLength !== "" ? Number(item.minLength) : undefined,
      maxLength: item.maxLength !== undefined && item.maxLength !== "" ? Number(item.maxLength) : undefined,
      pattern: item.pattern || undefined,
      maxFiles: item.maxFiles !== undefined && item.maxFiles !== "" ? Number(item.maxFiles) : undefined,
    },
    isVisible: item.visible !== false,
  }
}

export default function FieldBuilderDialog({
  open,
  onOpenChange,
  category,
  intent = "edit",
  onCategoryDeleted,
  onFieldsSaved,
}) {
  const [items, setItems] = useState([])
  const [saving, setSaving] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [dragIndex, setDragIndex] = useState(null)
  const [editingFieldIndex, setEditingFieldIndex] = useState(null)
  const [editModalOpen, setEditModalOpen] = useState(false)

  const {
    control,
    watch,
    handleSubmit: handleCategorySubmit,
    reset: resetCategoryForm,
  } = useForm({
    defaultValues: {
      name: category?.name || "",
      description: category?.description || "",
    },
  })

  const catName = watch("name")
  const catDesc = watch("description")

  const {
    control: newFieldControl,
    watch: watchNewField,
    reset: resetNewField,
  } = useForm({
    defaultValues: {
      label: "",
      type: "text",
      placeholder: "",
      required: false,
      visible: true,
      optionsInput: "",
    },
  })

  const newFieldValues = watchNewField()

  useEffect(() => {
    const load = async () => {
      if (!open || !category?._id) return
      try {
        const res = await employeeFieldApi.getFieldCategories()
        const cat = (res.data?.categories || []).find((c) => c._id === category._id) || category
        setItems(toBuilderItems(cat.fields || []))
        resetCategoryForm({
          name: cat.name || "",
          description: cat.description || "",
        })
      } catch (e) {
        setItems(toBuilderItems(category.fields || []))
        resetCategoryForm({
          name: category?.name || "",
          description: category?.description || "",
        })
      }
      if (intent === "delete") setDeleteConfirmOpen(true)
    }
    load()
  }, [open, category, intent, resetCategoryForm])

  const handleSave = async () => {
    if (!category?._id) return
    try {
      setSaving(true)
      const res = await employeeFieldApi.getFieldCategories()
      const cat = (res.data?.categories || []).find((c) => c._id === category._id) || category
      const existing = cat.fields || []

      const existingByLabel = new Map(existing.map((f) => [f.label || f.name, f]))
      const builderByLabel = new Map(items.map((i) => [i.label, i]))

      for (const item of items) {
        const payload = fromBuilderItem(item)
        const match = existingByLabel.get(item.label)
        if (match) {
          await employeeFieldApi.updateField(category._id, match._id, payload)
        } else {
          await employeeFieldApi.addField(category._id, payload)
        }
      }

      for (const f of existing) {
        if (!builderByLabel.has(f.label || f.name)) {
          await employeeFieldApi.deleteField(category._id, f._id)
        }
      }

      const refreshed = await employeeFieldApi.getFieldCategories()
      const updatedCat = (refreshed.data?.categories || []).find((c) => c._id === category._id)
      if (updatedCat?.fields?.length) {
        const orderIds = []
        for (const item of items) {
          const f = updatedCat.fields.find((ef) => (ef.label || ef.name) === item.label)
          if (f) orderIds.push(String(f._id))
        }
        for (const ef of updatedCat.fields) {
          if (!orderIds.includes(String(ef._id))) orderIds.push(String(ef._id))
        }
        await employeeFieldApi.reorderFields(category._id, {
          fieldIds: orderIds,
        })
      }

      toast.success("Fields saved successfully")
      onFieldsSaved?.()
      onOpenChange(false)
    } catch (e) {
      toast.error(e?.response?.data?.message || e?.message || "Failed to save fields")
    } finally {
      setSaving(false)
    }
  }

  const addItem = () => {
    if (!newFieldValues.label) {
      toast.error("Label is required")
      return
    }
    const options = (newFieldValues.optionsInput || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
    const deduped = Array.from(new Set(options))

    const newItem = {
      id: `${Date.now()}`,
      type: newFieldValues.type,
      label: newFieldValues.label,
      placeholder: newFieldValues.placeholder || "",
      required: newFieldValues.required || false,
      options: deduped,
      visible: newFieldValues.visible !== false,
    }
    setItems((prev) => [...prev, newItem])
    resetNewField()
    toast.success("Field added")
  }

  const updateItem = (idx, patch) => {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)))
  }

  const removeItem = (idx) => {
    setItems((prev) => prev.filter((_, i) => i !== idx))
    toast.success("Field removed")
  }

  const moveItem = (idx, dir) => {
    setItems((prev) => {
      const next = [...prev]
      const target = next[idx]
      const newIdx = idx + dir
      if (newIdx < 0 || newIdx >= next.length) return prev
      next.splice(idx, 1)
      next.splice(newIdx, 0, target)
      return next
    })
  }

  const onDragStart = (idx) => setDragIndex(idx)
  const onDragOver = (e) => e.preventDefault()
  const onDrop = (idx) => {
    if (dragIndex === null || dragIndex === idx) return
    setItems((prev) => {
      const next = [...prev]
      const [moved] = next.splice(dragIndex, 1)
      next.splice(idx, 0, moved)
      return next
    })
    setDragIndex(null)
  }

  const saveCategorySettings = async () => {
    if (!category?._id) return
    try {
      await employeeFieldApi.updateFieldCategory(category._id, {
        name: catName,
        description: catDesc,
      })
      toast.success("Category updated")
    } catch (e) {
      toast.error(e?.response?.data?.message || e?.message || "Failed to update category")
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-6xl w-[95vw] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="sticky top-0 bg-background z-50 pb-4">
            <DialogTitle className="text-xl sm:text-2xl">Design Fields: {category?.name || ""}</DialogTitle>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Manage and configure form fields for this category
            </p>
          </DialogHeader>

          {/* Category Settings Card */}
          <Card className="border-0 bg-muted/30 gap-1">
            <CardHeader className="">
              <CardTitle className="text-sm sm:text-base">Category Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="sm:col-span-1">
                  <Label htmlFor="cat-name" className="text-xs sm:text-sm font-medium">
                    Category Name
                  </Label>
                  <Controller
                    control={control}
                    name="name"
                    render={({ field }) => (
                      <Input
                        id="cat-name"
                        {...field}
                        placeholder="e.g., Personal Information"
                        className="mt-2 text-sm"
                      />
                    )}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="cat-desc" className="text-xs sm:text-sm font-medium">
                    Description
                  </Label>
                  <Controller
                    control={control}
                    name="description"
                    render={({ field }) => (
                      <Input
                        id="cat-desc"
                        {...field}
                        placeholder="Describe this category..."
                        className="mt-2 text-sm"
                      />
                    )}
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={saveCategorySettings}
                  className="text-xs sm:text-sm bg-transparent"
                >
                  Save Category
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeleteConfirmOpen(true)}
                  className="text-xs sm:text-sm"
                >
                  Delete Category
                </Button>
              </div>
            </CardContent>
          </Card>

          <Separator className="my-4" />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Fields List */}
            <div className="lg:col-span-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                <div>
                  <h3 className="font-semibold text-base sm:text-lg">Form Fields</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {items.length} field{items.length !== 1 ? "s" : ""} configured
                  </p>
                </div>
              </div>

              <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-2">
                {items.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg text-sm">
                    <p>No fields yet. Add one from the panel on the right.</p>
                  </div>
                ) : (
                  items.map((item, idx) => (
                    <FieldItemCard
                      key={item.id}
                      item={item}
                      index={idx}
                      total={items.length}
                      onEdit={() => {
                        setEditingFieldIndex(idx)
                        setEditModalOpen(true)
                      }}
                      onRemove={() => removeItem(idx)}
                      onMoveUp={() => moveItem(idx, -1)}
                      onMoveDown={() => moveItem(idx, 1)}
                      onDragStart={() => onDragStart(idx)}
                      onDragOver={onDragOver}
                      onDrop={() => onDrop(idx)}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Add New Field Panel */}
            <div className="lg:col-span-1">
              <Card className="sticky top-20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Field
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label htmlFor="new-label" className="text-xs sm:text-sm font-medium">
                      Label *
                    </Label>
                    <Controller
                      control={newFieldControl}
                      name="label"
                      render={({ field }) => (
                        <Input id="new-label" {...field} placeholder="Field label" className="mt-2 text-sm" />
                      )}
                    />
                  </div>

                  <div>
                    <Label htmlFor="new-type" className="text-xs sm:text-sm font-medium">
                      Type
                    </Label>
                    <Controller
                      control={newFieldControl}
                      name="type"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger id="new-type" className="mt-2 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {FIELD_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div>
                    <Label htmlFor="new-placeholder" className="text-xs sm:text-sm font-medium">
                      Placeholder
                    </Label>
                    <Controller
                      control={newFieldControl}
                      name="placeholder"
                      render={({ field }) => (
                        <Input
                          id="new-placeholder"
                          {...field}
                          placeholder="e.g., Enter your name"
                          className="mt-2 text-sm"
                        />
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Controller
                      control={newFieldControl}
                      name="required"
                      render={({ field }) => (
                        <div className="flex items-center gap-2">
                          <Checkbox id="new-required" checked={field.value} onCheckedChange={field.onChange} />
                          <Label htmlFor="new-required" className="text-xs sm:text-sm">
                            Required field
                          </Label>
                        </div>
                      )}
                    />
                    <Controller
                      control={newFieldControl}
                      name="visible"
                      render={({ field }) => (
                        <div className="flex items-center gap-2">
                          <Checkbox id="new-visible" checked={field.value} onCheckedChange={field.onChange} />
                          <Label htmlFor="new-visible" className="text-xs sm:text-sm">
                            Visible
                          </Label>
                        </div>
                      )}
                    />
                  </div>

                  {["select", "multiselect", "radio", "checkbox"].includes(newFieldValues.type) && (
                    <Controller
                      control={newFieldControl}
                      name="optionsInput"
                      render={({ field }) => (
                        <div>
                          <Label className="text-xs sm:text-sm font-medium">Options</Label>
                          <TagInputString
                            value={field.value || ""}
                            onChange={field.onChange}
                            placeholder="Type option, press Enter or comma"
                          />
                          <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                            Options are split by commas. Duplicates ignored.
                          </p>
                        </div>
                      )}
                    />
                  )}

                  <Button onClick={addItem} className="w-full text-sm">
                    Add Field
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          <DialogFooter className="sticky bottom-0 bg-background pt-4 mt-6 border-t flex flex-col sm:flex-row gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="text-sm">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="text-sm">
              {saving ? "Saving..." : "Save All Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <FieldEditModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        field={editingFieldIndex !== null ? items[editingFieldIndex] : null}
        onSave={(updatedField) => {
          if (editingFieldIndex !== null) {
            updateItem(editingFieldIndex, updatedField)
            toast.success("Field updated")
          }
          setEditModalOpen(false)
          setEditingFieldIndex(null)
        }}
      />

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="w-[90vw] sm:w-full">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete category "{catName}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the category and all its fields. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                try {
                  await employeeFieldApi.deleteFieldCategory(category._id)
                  toast.success("Category deleted successfully")
                  onCategoryDeleted?.()
                  setDeleteConfirmOpen(false)
                  onOpenChange(false)
                } catch (e) {
                  toast.error(e?.response?.data?.message || e?.message || "Failed to delete category")
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function TagInputList({ values = [], onChange, placeholder = "" }) {
  const [input, setInput] = useState("")

  const addTokens = (raw) => {
    const tokens = String(raw)
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
    if (!tokens.length) return
    const next = [...values]
    for (const t of tokens) {
      if (!next.includes(t)) next.push(t)
    }
    onChange?.(next)
    setInput("")
  }

  const removeAt = (idx) => {
    const next = values.filter((_, i) => i !== idx)
    onChange?.(next)
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {values.map((opt, idx) => (
        <Badge key={`${opt}-${idx}`} variant="outline" className="pr-1 text-xs">
          {opt}
          <button
            type="button"
            onClick={() => removeAt(idx)}
            className="ml-1 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault()
            addTokens(input)
          }
        }}
        onBlur={() => addTokens(input)}
        placeholder={placeholder}
        className="h-8 w-auto flex-1 min-w-[160px] text-sm"
      />
    </div>
  )
}

function TagInputString({ value = "", onChange, placeholder = "" }) {
  const [input, setInput] = useState("")
  const tokens = String(value)
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)

  const addTokens = (raw) => {
    const newTokens = String(raw)
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
    const merged = Array.from(new Set([...tokens, ...newTokens]))
    onChange?.(merged.join(", "))
    setInput("")
  }

  const removeAt = (idx) => {
    const next = tokens.filter((_, i) => i !== idx)
    onChange?.(next.join(", "))
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {tokens.map((opt, idx) => (
        <Badge key={`${opt}-${idx}`} variant="outline" className="pr-1 text-xs">
          {opt}
          <button
            type="button"
            onClick={() => removeAt(idx)}
            className="ml-1 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault()
            addTokens(input)
          }
        }}
        onBlur={() => addTokens(input)}
        placeholder={placeholder}
        className="h-8 w-auto flex-1 min-w-[160px] text-sm"
      />
    </div>
  )
}

function FieldItemCard({
  item,
  index,
  total,
  onEdit,
  onRemove,
  onMoveUp,
  onMoveDown,
  onDragStart,
  onDragOver,
  onDrop,
}) {
  return (
    <Card
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className="cursor-move transition-all hover:shadow-md"
    >
      <CardContent className="p-3">
        <div className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <GripVertical className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="font-medium truncate text-sm sm:text-base">{item.label}</p>
              <p className="text-xs text-muted-foreground">
                {FIELD_TYPES.find((t) => t.value === item.type)?.label || item.type}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={onMoveUp}
              disabled={index === 0}
              title="Move up"
              className="h-8 w-8 sm:h-9 sm:w-9"
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onMoveDown}
              disabled={index === total - 1}
              title="Move down"
              className="h-8 w-8 sm:h-9 sm:w-9"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onEdit} title="Edit field" className="h-8 w-8 sm:h-9 sm:w-9">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onRemove}
              title="Delete field"
              className="h-8 w-8 sm:h-9 sm:w-9 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function FieldEditModal({ open, onOpenChange, field, onSave }) {
  const [formData, setFormData] = useState(field || {})

  useEffect(() => {
    if (field) {
      setFormData(field)
    }
  }, [field, open])

  if (!field) return null

  const handleSave = () => {
    if (!formData.label) {
      toast.error("Label is required")
      return
    }
    onSave(formData)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Edit Field</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Basic Info */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Basic Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs sm:text-sm font-medium">Label *</Label>
                <Input
                  value={formData.label || ""}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder="Field label"
                  className="mt-2 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs sm:text-sm font-medium">Type</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v, options: [] })}>
                  <SelectTrigger className="mt-2 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FIELD_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-xs sm:text-sm font-medium">Placeholder</Label>
              <Input
                value={formData.placeholder || ""}
                onChange={(e) => setFormData({ ...formData, placeholder: e.target.value })}
                placeholder="e.g., Enter your name"
                className="mt-2 text-sm"
              />
            </div>
          </div>

          <Separator />

          {/* Validation Rules */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Validation & Settings</h3>

            {formData.type === "number" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs sm:text-sm font-medium">Min Value</Label>
                  <Input
                    type="number"
                    value={formData.min ?? ""}
                    onChange={(e) => setFormData({ ...formData, min: e.target.value })}
                    className="mt-2 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs sm:text-sm font-medium">Max Value</Label>
                  <Input
                    type="number"
                    value={formData.max ?? ""}
                    onChange={(e) => setFormData({ ...formData, max: e.target.value })}
                    className="mt-2 text-sm"
                  />
                </div>
              </div>
            )}

            {(formData.type === "text" || formData.type === "textarea") && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs sm:text-sm font-medium">Min Length</Label>
                    <Input
                      type="number"
                      value={formData.minLength ?? ""}
                      onChange={(e) => setFormData({ ...formData, minLength: e.target.value })}
                      className="mt-2 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs sm:text-sm font-medium">Max Length</Label>
                    <Input
                      type="number"
                      value={formData.maxLength ?? ""}
                      onChange={(e) => setFormData({ ...formData, maxLength: e.target.value })}
                      className="mt-2 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs sm:text-sm font-medium">Pattern (regex)</Label>
                  <Input
                    value={formData.pattern || ""}
                    onChange={(e) => setFormData({ ...formData, pattern: e.target.value })}
                    placeholder="e.g., ^[A-Z].*"
                    className="mt-2 text-sm"
                  />
                </div>
              </div>
            )}

            {(formData.type === "select" ||
              formData.type === "multiselect" ||
              formData.type === "radio" ||
              formData.type === "checkbox") && (
              <div>
                <Label className="text-xs sm:text-sm font-medium">Options</Label>
                <TagInputList
                  values={formData.options || []}
                  onChange={(opts) => setFormData({ ...formData, options: opts })}
                  placeholder="Type option, press Enter or comma"
                />
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                  Enter options, press Enter or comma. Duplicates removed.
                </p>
              </div>
            )}

            {formData.type === "file" && (
              <div className="space-y-3">
                <div>
                  <Label className="text-xs sm:text-sm font-medium">Allowed Preset</Label>
                  {(() => {
                    const list = Array.isArray(formData.acceptedTypesList) ? formData.acceptedTypesList : []
                    const match = FILE_EXTENSION_PRESETS.find(
                      (p) =>
                        p.extensions.length &&
                        p.extensions.every((ext) => list.includes(ext)) &&
                        list.length === p.extensions.length,
                    )
                    const currentPreset = !list.length ? "none" : match ? match.value : "custom"
                    return (
                      <Select
                        value={currentPreset}
                        onValueChange={(val) => {
                          if (val === "custom") return
                          const preset = FILE_EXTENSION_PRESETS.find((p) => p.value === val)
                          const next = preset ? preset.extensions : []
                          setFormData({ ...formData, acceptedTypesList: next })
                        }}
                      >
                        <SelectTrigger className="mt-2 text-sm">
                          <SelectValue placeholder="Choose preset" />
                        </SelectTrigger>
                        <SelectContent>
                          {FILE_EXTENSION_PRESETS.map((p) => (
                            <SelectItem key={p.value} value={p.value}>
                              {p.label}
                            </SelectItem>
                          ))}
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    )
                  })()}
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                    Pick a preset or add custom extensions below.
                  </p>
                </div>

                <div>
                  <Label className="text-xs sm:text-sm font-medium">Allowed Extensions</Label>
                  <TagInputList
                    values={formData.acceptedTypesList || []}
                    onChange={(exts) => setFormData({ ...formData, acceptedTypesList: exts })}
                    placeholder="e.g., jpg, png, pdf"
                  />
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                    Enter extensions without dots. Example: jpg, png, pdf.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs sm:text-sm font-medium">Min Size (MB)</Label>
                    <Input
                      type="number"
                      value={formData.min ?? ""}
                      onChange={(e) => setFormData({ ...formData, min: e.target.value })}
                      className="mt-2 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs sm:text-sm font-medium">Max Size (MB)</Label>
                    <Input
                      type="number"
                      value={formData.max ?? ""}
                      onChange={(e) => setFormData({ ...formData, max: e.target.value })}
                      className="mt-2 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs sm:text-sm font-medium">Max Files</Label>
                    <Input
                      type="number"
                      value={formData.maxFiles ?? ""}
                      onChange={(e) => setFormData({ ...formData, maxFiles: e.target.value })}
                      className="mt-2 text-sm"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Flags */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Field Flags</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="edit-required"
                  checked={formData.required || false}
                  onCheckedChange={(v) => setFormData({ ...formData, required: !!v })}
                />
                <Label htmlFor="edit-required" className="text-xs sm:text-sm">
                  Required field
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="edit-visible"
                  checked={formData.visible !== false}
                  onCheckedChange={(v) => setFormData({ ...formData, visible: !!v })}
                />
                <Label htmlFor="edit-visible" className="text-xs sm:text-sm">
                  Visible
                </Label>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="text-sm">
            Cancel
          </Button>
          <Button onClick={handleSave} className="text-sm">
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
