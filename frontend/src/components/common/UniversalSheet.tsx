import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Cross2Icon, ReloadIcon } from '@radix-ui/react-icons';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { NumericFormat } from 'react-number-format';
import { SearchSelect } from '@/components/ui/search-select';
import { EditIcon, TrashIcon } from 'lucide-react';

interface UniversalSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  icon?: React.ReactNode;
  schema: z.ZodSchema<any>;
  defaultValues: any;
  fields: FormField[];
  onSubmit: (data: any) => Promise<void>;
  mode?: 'add' | 'edit' | 'batch' | 'custom';
  item?: any;
  isLoading?: boolean;
  customContent?: React.ReactNode;
  showImageUpload?: boolean;
  imagePreview?: string;
  onImageChange?: (file: File | null) => void;
  onImageDelete?: () => void;
  additionalActions?: React.ReactNode;
}

interface FormField {
  name: string;
  label: string;
  type:
    | 'text'
    | 'number'
    | 'email'
    | 'password'
    | 'textarea'
    | 'select'
    | 'file'
    | 'date'
    | 'numeric'
    | 'custom';
  placeholder?: string;
  required?: boolean;
  options?: { id: string; label: string; value: string }[];
  validation?: string;
  icon?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  customRender?: (field: FormField, methods: any) => React.ReactNode;
  numericFormat?: {
    thousandSeparator?: string;
    decimalScale?: number;
    allowNegative?: boolean;
  };
}

export function UniversalSheet({
  open,
  onClose,
  title,
  description,
  icon,
  schema,
  defaultValues,
  fields,
  onSubmit,
  mode = 'add',
  item,
  isLoading = false,
  customContent,
  showImageUpload = false,
  imagePreview = '',
  onImageChange,
  onImageDelete,
  additionalActions,
}: UniversalSheetProps) {
  const [image, setImage] = useState<File | null>(null);
  const [localImagePreview, setLocalImagePreview] = useState<string>('');

  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const {
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = methods;

  useEffect(() => {
    if (open && item && (mode === 'edit' || mode === 'batch')) {
      reset(item);
      setLocalImagePreview(item.image || imagePreview || '');
    } else if (!open) {
      reset(defaultValues);
      setImage(null);
      setLocalImagePreview('');
    }
  }, [open, item, mode, reset, defaultValues, imagePreview]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImage(file);
    if (file) {
      const preview = URL.createObjectURL(file);
      setLocalImagePreview(preview);
      onImageChange?.(file);
    }
    e.target.value = '';
  };

  const handleCancel = () => {
    reset(defaultValues);
    setImage(null);
    setLocalImagePreview('');
    onClose();
  };

  const handleFormSubmit = async (data: any) => {
    try {
      await onSubmit(data);
      reset(defaultValues);
      setImage(null);
      setLocalImagePreview('');
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Xatolik yuz berdi, iltimos qayta urinib ko'ring");
    }
  };

  const renderField = (field: FormField) => {
    const commonProps = {
      className: `h-10 bg-background/80 border-border/50 focus:border-primary ${field.className || ''}`,
      placeholder: field.placeholder,
      disabled: field.disabled || isLoading,
    };

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            {...methods.register(field.name)}
            {...commonProps}
            className={`min-h-[100px] resize-none p-3 ${commonProps.className}`}
            placeholder={field.placeholder}
          />
        );

      case 'select':
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: controllerField }) => (
              <SearchSelect
                value={controllerField.value}
                onValueChange={controllerField.onChange}
                placeholder={field.placeholder || 'Tanlang'}
                options={field.options || []}
                className={commonProps.className}
              />
            )}
          />
        );

      case 'numeric':
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: controllerField }) => (
              <NumericFormat
                {...controllerField}
                thousandSeparator={
                  field.numericFormat?.thousandSeparator || ' '
                }
                decimalScale={field.numericFormat?.decimalScale || 0}
                allowNegative={field.numericFormat?.allowNegative || false}
                getInputRef={controllerField.ref}
                className={commonProps.className}
                onValueChange={(values) =>
                  controllerField.onChange(values.value)
                }
                value={controllerField.value}
                placeholder={field.placeholder}
                disabled={commonProps.disabled}
              />
            )}
          />
        );

      case 'file':
        return (
          <div className="space-y-2">
            <Input
              type="file"
              onChange={handleImageChange}
              accept="image/*"
              className={commonProps.className}
              disabled={isLoading}
            />
            {(localImagePreview || imagePreview) && (
              <div className="mt-2">
                <img
                  src={localImagePreview || imagePreview}
                  alt="Preview"
                  className="w-20 h-20 object-cover rounded-lg border"
                />
              </div>
            )}
          </div>
        );

      case 'date':
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: controllerField }) => (
              <DatePicker
                value={controllerField.value || null}
                onChange={(val) => controllerField.onChange(val ?? '')}
                placeholder={field.placeholder}
                buttonClassName={commonProps.className}
                clearButtonClassName="h-9 w-9"
                disabled={commonProps.disabled}
                className={field.className}
              />
            )}
          />
        );

      case 'custom':
        return field.customRender ? field.customRender(field, methods) : null;

      default:
        return (
          <Input
            type={field.type}
            {...methods.register(field.name)}
            {...commonProps}
          />
        );
    }
  };

  const renderImageSection = () => {
    if (!showImageUpload) return null;

    const currentPreview = localImagePreview || imagePreview;

    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium text-muted-foreground">
          Rasm
        </Label>
        {currentPreview ? (
          <div className="relative group cursor-pointer">
            <img
              src={currentPreview}
              alt="Product"
              className="w-full h-32 object-cover rounded-md border group-hover:brightness-75 transition"
            />
            <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition">
              <Button
                type="button"
                disabled={isLoading}
                onClick={(e) => {
                  e.stopPropagation();
                  document.getElementById('image-upload')?.click();
                }}
                variant="outline"
                size="sm"
                className="bg-white/50 text-black hover:text-black hover:bg-white/50 border-2 border-white/60 backdrop-blur-sm"
              >
                <EditIcon className="w-4 h-4 mr-1" /> O'zgartirish
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setImage(null);
                  setLocalImagePreview('');
                  onImageDelete?.();
                }}
                className="bg-white/60 text-red-600 hover:text-red-600 font-semibold hover:bg-red-100 border border-red-500 backdrop-blur-md shadow-md"
              >
                <TrashIcon className="w-4 h-4 mr-1" /> O'chirish
              </Button>
            </div>

            <Input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>
        ) : (
          <Input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="h-10 bg-background/80 border-border/50 focus:border-primary"
            placeholder="Rasm tanlang"
          />
        )}
      </div>
    );
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="min-h-[100vh] w-full sm:w-[40vw] md:w-[40vw] lg:w-[40vw] xl:w-[40vw] !max-w-none sm:!max-w-none bg-background/95 backdrop-blur-sm flex flex-col overflow-hidden">
        {/* Fixed Header */}
        <SheetHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border/50 pb-6 flex-shrink-0">
          <div className="flex items-center gap-3 mb-4">
            {icon && (
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                {icon}
              </div>
            )}
            <div>
              <SheetTitle className="text-xl font-bold">{title}</SheetTitle>
              <SheetDescription className="text-sm text-muted-foreground">
                {description}
              </SheetDescription>
            </div>
          </div>
          <div
            onClick={handleCancel}
            className="absolute right-4 top-4 cursor-pointer rounded-sm opacity-70 hover:opacity-100 hover:bg-muted/50 p-2 transition-colors"
          >
            <Cross2Icon className="h-4 w-4" />
          </div>
        </SheetHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-hidden min-h-0">
          {customContent ? (
            <div className="h-full overflow-y-auto p-3 md:p-6">
              {customContent}
            </div>
          ) : (
            <FormProvider {...methods}>
              <form
                onSubmit={handleSubmit(handleFormSubmit)}
                className="h-full flex flex-col"
              >
                {/* Scrollable Form Fields */}
                <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-4 md:space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {fields.map((field) => (
                      <div key={field.name} className="space-y-2">
                        <Label
                          htmlFor={field.name}
                          className="text-sm font-medium text-muted-foreground flex items-center gap-2"
                        >
                          {field.icon && field.icon}
                          {field.label}
                          {field.required && (
                            <span className="text-red-500">*</span>
                          )}
                        </Label>
                        {renderField(field)}
                        {errors[field.name] && (
                          <div className="text-red-500 text-xs mt-1">
                            {errors[field.name]?.message as string}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {showImageUpload && (
                    <div className="md:col-span-2">{renderImageSection()}</div>
                  )}

                  {additionalActions && (
                    <div className="md:col-span-2">{additionalActions}</div>
                  )}
                </div>

                {/* Fixed Footer with Buttons */}
                <div className="flex-shrink-0 p-3 md:p-6 border-t border-border/50 bg-background/95">
                  <div className="flex justify-end gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                      disabled={isLoading}
                    >
                      Bekor qilish
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting || isLoading}
                      className="min-w-[120px]"
                    >
                      {isSubmitting || isLoading ? (
                        <>
                          <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                          {mode === 'add'
                            ? "Qo'shilmoqda..."
                            : mode === 'edit'
                              ? 'Yangilanmoqda...'
                              : 'Saqlanmoqda...'}
                        </>
                      ) : mode === 'add' ? (
                        "Qo'shish"
                      ) : mode === 'edit' ? (
                        'Yangilash'
                      ) : (
                        'Saqlash'
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </FormProvider>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
