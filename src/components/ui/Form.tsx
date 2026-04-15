import { type ReactNode, useState } from 'react';
import { z } from 'zod';
import Input from './Input';
import Select from './Select';
import DateInput from './DateInput';
import Checkbox from './Checkbox';
import SelectWithSearch from './SelectWithSearch';
import Button from './Button';
import Modal from './Modal';

export type FieldType =
  | 'text'
  | 'number'
  | 'email'
  | 'date'
  | 'file'
  | 'checkbox'
  | 'select'
  | 'select-with-search'
  | 'textarea';

export interface FieldConfig<T> {
  key: keyof T;
  label: string;
  type: FieldType;
  placeholder?: string;
  disabled?: boolean;
  options?: { value: string; label: string }[];
  selectWithSearchOptions?: {
    options: Array<{ id: string; label: string; subLabel?: string; metadata?: string[] }>;
    placeholder?: string;
    searchPlaceholder?: string;
    showDetails?: boolean;
  };
}

interface FormProps<T> {
  fields: FieldConfig<T>[];
  data: T;
  // Aceptamos cualquier esquema Zod válido (incluyendo refine, transform, etc.)
  schema?: z.ZodTypeAny;
  onChange: (key: keyof T, value: T[keyof T]) => void;
  onFileChange?: (key: keyof T, file: File | null) => void;
  onSubmit: (data: T) => Promise<void> | void;
  onCloseModal: () => void;
  title: string;
  submitText?: string;
  isModalOpen: boolean;
  loading?: boolean;
  children?: ReactNode;
}

const Form = <T extends Record<string, unknown>>({
  fields,
  data,
  schema,
  onChange,
  onFileChange,
  onSubmit,
  onCloseModal,
  title,
  submitText = "Guardar",
  isModalOpen,
  loading = false,
  children,
}: FormProps<T>) => {
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

  // Limpiamos errores cuando se abre/cierra el modal
  useState(() => {
    if (!isModalOpen) {
      setErrors({});
    }
  });

  const clearFieldError = (key: keyof T) => {
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const handleSave = async () => {
    if (schema) {
      const result = schema.safeParse(data);

      if (!result.success) {
        // const newErrors: Partial<Record<keyof T, string>> = {};
        // result.error.errors.forEach((err) => {
        //   const path = err.path[0];
        //   if (path !== undefined) {
        //     newErrors[path as keyof T] = err.message;
        //   }
        // });
        // setErrors(newErrors);
        return;
      }
    }

    setErrors({});
    await onSubmit(data);
  };

  const renderField = (field: FieldConfig<T>) => {
    const value = data[field.key];
    const errorMessage = errors[field.key];

    const commonProps = {
      label: field.label,
      disabled: field.disabled || loading,
      placeholder: field.placeholder,
      errorMessage,
    };

    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
        return (
          <Input
            {...commonProps}
            type={field.type}
            value={value != null ? String(value) : ''}
            onChange={(val) => {
              clearFieldError(field.key);
              if (field.type === 'number') {
                onChange(field.key, (val === '' ? '' : Number(val)) as T[keyof T]);
              } else {
                onChange(field.key, val as T[keyof T]);
              }
            }}
          />
        );

      case 'date':
        return (
          <DateInput
            {...commonProps}
            value={(value as string | undefined) ?? ''}
            onChange={(val) => {
              clearFieldError(field.key);
              onChange(field.key, val as T[keyof T]);
            }}
            // Opcional: impedir fechas futuras
            // max={new Date().toISOString().split('T')[0]}
          />
        );

      case 'checkbox':
        return (
          <Checkbox
            label={field.label}
            checked={Boolean(value)}
            onChange={(checked) => {
              clearFieldError(field.key);
              onChange(field.key, checked as T[keyof T]);
            }}
            disabled={field.disabled || loading}
          />
        );

      case 'file':
        return (
          <div className="w-full">
            <label className="text-[rgb(var(--text))] text-lg block mb-1">
              {field.label}
            </label>
            <input
              type="file"
              disabled={field.disabled || loading}
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                onFileChange?.(field.key, file);
              }}
              className="w-full p-2 border rounded text-[rgb(var(--text))]"
            />
            {errorMessage && <p className="text-red-500 text-sm mt-1">{errorMessage}</p>}
          </div>
        );

      case 'select':
        return (
          <Select
            {...commonProps}
            value={value != null ? String(value) : ''}
            onChange={(val) => {
              clearFieldError(field.key);
              onChange(field.key, val as T[keyof T]);
            }}
            options={field.options || []}
          />
        );

      case 'select-with-search':
        return (
          <div className="space-y-1">
            <SelectWithSearch
              label={field.label}
              value={value != null ? String(value) : ''}
              onChange={(id) => {
                clearFieldError(field.key);
                onChange(field.key, id as T[keyof T]);
              }}
              options={field.selectWithSearchOptions?.options || []}
              placeholder={field.selectWithSearchOptions?.placeholder}
              searchPlaceholder={field.selectWithSearchOptions?.searchPlaceholder}
              showDetails={field.selectWithSearchOptions?.showDetails}
              disabled={field.disabled || loading}
            />
            {errorMessage && <p className="text-red-500 text-sm mt-1">{errorMessage}</p>}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Modal isOpen={isModalOpen} onClose={onCloseModal} title={title}>
      <div className="space-y-5">
        {fields.map((field) => (
          <div key={String(field.key)} className="space-y-1">
            {renderField(field)}
          </div>
        ))}

        {children && <div className="mt-6">{children}</div>}

        {Object.keys(errors).length > 0 && (
          <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">
            Por favor corrige los errores antes de guardar.
          </div>
        )}

        <div className="flex justify-end gap-3 mt-8">
          <Button variant="secondary" onClick={onCloseModal} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Guardando..." : submitText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default Form;