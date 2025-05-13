import React, { useState } from 'react';
import { BlockStyles } from '@/types/block';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';

interface FormField {
  type: string;
  label: string;
  required: boolean;
  placeholder?: string;
}

interface FormBlockProps {
  content: {
    fields: FormField[];
    submitText: string;
    submitAction: string;
  };
  styles?: {
    container?: BlockStyles;
    input?: BlockStyles;
    label?: BlockStyles;
    button?: BlockStyles;
  };
  brandId?: string;
}

export function FormBlock({ content, styles = {}, brandId }: FormBlockProps) {
  // Add state for form fields
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess(null);
    setError(null);
    try {
      if (!brandId) throw new Error('Brand not found');
      const { error } = await supabase
        .from('contact_submissions')
        .insert({
          brand_id: brandId,
          customer_name: form.name,
          customer_email: form.email,
          message: form.message
        });
      if (error) throw new Error(error.message);
      setSuccess('Thank you for contacting us!');
      // Store customer email in localStorage for click tracking
      if (form.email) {
        localStorage.setItem('customer_email', form.email);
      }
      setForm({ name: '', email: '', message: '' });
    } catch (err: any) {
      setError(err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Helper function to apply container styles
  const applyContainerStyles = (additionalClasses?: string) => {
    const containerStyles = styles.container || {};
    const textAlignClass = containerStyles.textAlign ? {
      'text-left': containerStyles.textAlign === 'left',
      'text-center': containerStyles.textAlign === 'center',
      'text-right': containerStyles.textAlign === 'right',
    } : {};

    return {
      className: cn(
        'space-y-4',
        additionalClasses,
        textAlignClass
      ),
      style: {
        backgroundColor: containerStyles.backgroundColor || 'transparent',
        padding: containerStyles.padding || '0',
        margin: containerStyles.margin,
        borderRadius: containerStyles.borderRadius || '0',
        borderWidth: containerStyles.borderWidth || '0',
        borderColor: containerStyles.borderColor,
        borderStyle: containerStyles.borderStyle,
        boxShadow: containerStyles.boxShadow,
        width: containerStyles.width,
        minHeight: containerStyles.minHeight,
        maxWidth: containerStyles.maxWidth
      }
    };
  };

  // Helper function to apply input styles
  const applyInputStyles = (additionalClasses?: string) => {
    const inputStyles = styles.input || {};
    return {
      className: cn('w-full', additionalClasses),
      style: {
        backgroundColor: inputStyles.backgroundColor || 'transparent',
        color: inputStyles.textColor || 'inherit',
        borderRadius: inputStyles.borderRadius || '0.375rem',
        borderWidth: inputStyles.borderWidth || '1px',
        borderColor: inputStyles.borderColor || 'hsl(var(--input))',
        borderStyle: inputStyles.borderStyle || 'solid',
        fontSize: inputStyles.fontSize,
        padding: inputStyles.padding || '0.5rem',
        fontFamily: inputStyles.fontFamily,
        '&:focus': {
          outline: 'none',
          borderColor: inputStyles.borderColor || 'hsl(var(--input))',
          backgroundColor: inputStyles.backgroundColor || 'transparent',
        }
      }
    };
  };

  // Helper function to apply label styles
  const applyLabelStyles = (additionalClasses?: string) => {
    const labelStyles = styles.label || {};
    const textAlignClass = labelStyles.textAlign ? {
      'text-left': labelStyles.textAlign === 'left',
      'text-center': labelStyles.textAlign === 'center',
      'text-right': labelStyles.textAlign === 'right',
    } : {};

    return {
      className: cn('block mb-2', additionalClasses, textAlignClass),
      style: {
        color: labelStyles.textColor || 'inherit',
        fontSize: labelStyles.fontSize,
        fontWeight: labelStyles.fontWeight || '500',
        fontFamily: labelStyles.fontFamily
      }
    };
  };

  // Helper function to apply button styles
  const applyButtonStyles = () => {
    const buttonStyles = styles.button || {};
    const textAlignClass = buttonStyles.textAlign ? {
      'text-left': buttonStyles.textAlign === 'left',
      'text-center': buttonStyles.textAlign === 'center',
      'text-right': buttonStyles.textAlign === 'right',
    } : {};

    return {
      className: cn(
        'mt-6 w-full transition-colors duration-200',
        textAlignClass
      ),
      style: {
        backgroundColor: buttonStyles.backgroundColor || 'hsl(var(--primary))',
        color: buttonStyles.textColor || 'hsl(var(--primary-foreground))',
        borderRadius: buttonStyles.borderRadius || '0.375rem',
        padding: buttonStyles.padding || '0.5rem 1rem',
        fontSize: buttonStyles.fontSize,
        fontWeight: buttonStyles.fontWeight || '500',
        borderWidth: buttonStyles.borderWidth || '0',
        borderColor: buttonStyles.borderColor,
        borderStyle: buttonStyles.borderStyle,
        cursor: 'pointer',
        fontFamily: buttonStyles.fontFamily,
        '&:hover': {
          opacity: 0.9
        }
      }
    };
  };

  return (
    <div {...applyContainerStyles('rounded-lg')}>
      <form className="space-y-4" onSubmit={handleSubmit}>
        {content.fields.map((field) => {
          if (field.type === 'textarea') {
            return (
              <div key={field.label} className="space-y-2">
                <Label {...applyLabelStyles()}>
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                <Textarea
                  {...applyInputStyles()}
                  placeholder={field.placeholder}
                  required={field.required}
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                />
              </div>
            );
          }
          // For Name and Email
          return (
            <div key={field.label} className="space-y-2">
              <Label {...applyLabelStyles()}>
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              <Input
                type={field.type}
                {...applyInputStyles()}
                placeholder={field.placeholder}
                required={field.required}
                name={field.label.toLowerCase()}
                value={form[field.label.toLowerCase() as 'name' | 'email']}
                onChange={handleChange}
              />
            </div>
          );
        })}
        <button {...applyButtonStyles()} disabled={submitting}>
          {submitting ? 'Submitting...' : content.submitText}
        </button>
        {success && <div className="text-green-600 text-sm mt-2">{success}</div>}
        {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
      </form>
    </div>
  );
}
