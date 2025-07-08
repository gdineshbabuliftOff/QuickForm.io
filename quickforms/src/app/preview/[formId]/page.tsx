"use client";

import React, { useState, useEffect, FC, JSX } from 'react';
import { useParams } from 'next/navigation';

// Types and Interfaces (Should be shared with the editor)
interface IconProps { color?: string; size?: number | string; strokeWidth?: number | string; className?: string; }
type IconPathTuple = [keyof JSX.IntrinsicElements, { [key: string]: any }];
type FieldType = 'text' | 'email' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'heading' | 'paragraph' | 'date' | 'file' | 'signature';
type FieldWidth = '100%' | '50%' | '33.33%';
type ConditionOperator = 'equals' | 'not_equals' | 'contains' | 'is_empty' | 'is_not_empty';
type TextAlign = 'left' | 'center' | 'right';
type ConditionLogic = 'and' | 'or';

interface CustomStyle {
  name: string;
  value: string;
}

interface ResponsiveStyles {
  width?: FieldWidth;
  fontSize?: string;
}

interface FieldStyles {
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  fontSize?: string;
  fontWeight?: string;
  textAlign?: TextAlign;
  custom?: CustomStyle[];
  desktop: ResponsiveStyles;
  tablet: ResponsiveStyles;
  mobile: ResponsiveStyles;
}

interface FieldOption {
    label: string;
    value: string;
}

interface FieldCondition {
    id: string;
    fieldId: string;
    operator: ConditionOperator;
    value: string;
}

interface FormField {
  id: string;
  type: FieldType;
  label: string;
  width: FieldWidth;
  name?: string;
  fieldId?: string;
  placeholder?: string;
  value?: string;
  required?: boolean;
  options?: FieldOption[];
  layout?: 'vertical' | 'horizontal';
  styles: FieldStyles;
  conditions?: FieldCondition[];
  conditionLogic?: ConditionLogic;
}

interface FormStyles {
  backgroundType: 'color' | 'image';
  backgroundColor: string;
  backgroundImage: string;
  textColor: string;
  fieldBackgroundColor: string;
  fieldBorderColor: string;
  buttonBackgroundColor: string;
  buttonTextColor: string;
  buttonText: string;
  buttonPosition: 'left' | 'center' | 'right';
  buttonWidth: string;
  buttonHeight: string;
  gap: number;
}

interface FormSettings {
  prefillFromAPI: boolean;
  prefillApiUrl: string;
  postOnSubmit: boolean;
  postApiUrl: string;
}

interface Form {
  id: string;
  title: string;
  fields: FormField[];
  styles: FormStyles;
  settings: FormSettings;
}

// Icon Factory
const createIcon = (path: IconPathTuple[]): (({ displayName }: { displayName: string; }) => FC<IconProps>) => ({ displayName }: { displayName: string; }) => {
  const Component = React.forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 24, strokeWidth = 2, className, ...rest }, ref) => React.createElement('svg', { ref, width: size, height: size, stroke: color, strokeWidth, className: ['lucide', `lucide-${displayName.toLowerCase()}`, className].filter(Boolean).join(' '), xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round', ...rest }, path.map(([tag, attrs], i) => React.createElement(tag, { key: attrs.key || i, ...attrs }))));
  Component.displayName = `LucideIcon(${displayName})`;
  return Component;
};

const SignatureIcon = createIcon([['path', { d: "M22 10.5c0 .8-.7 1.5-1.5 1.5H15v5.5c0 .8-.7 1.5-1.5 1.5h-1c-.8 0-1.5-.7-1.5-1.5v-13C11 3.7 11.7 3 12.5 3h1C14.3 3 15 3.7 15 4.5V9h5.5c.8 0 1.5.7 1.5 1.5Z" }], ['path', { d: "M3 13.5c0 .8.7 1.5 1.5 1.5h1" }], ['path', { d: "M10 18H3.5c-.8 0-1.5-.7-1.5-1.5v-1c0-.8.7-1.5 1.5-1.5H9" }]])({ displayName: 'Signature' });

const Loader: FC = () => (
    <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
);

export default function PreviewPage() {
    const params = useParams();
    const formId = params?.formId as string;

    const [form, setForm] = useState<Form | null>(null);
    const [formData, setFormData] = useState<{ [key: string]: any }>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

    useEffect(() => {
        if (formId) {
            
            const fetchForm = async () => {
                try {
                    setLoading(true);
                    // This should be a public API endpoint
                    const res = await fetch(`/api/forms/${formId}`);
                    if (!res.ok) {
                        throw new Error('Form not found or an error occurred.');
                    }
                    const data: Form = await res.json();
                    setForm(data);

                    // Initialize form data state
                    const initialData: { [key: string]: any } = {};
                    data.fields.forEach(field => {
                        if (field.name) {
                            initialData[field.name] = field.value || (field.type === 'checkbox' ? false : '');
                        }
                    });
                    setFormData(initialData);

                } catch (err: any) {
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            };
            fetchForm();
        }
    }, [formId]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const checkCondition = (condition: FieldCondition): boolean => {
        const targetField = form?.fields.find(f => f.id === condition.fieldId);
        if (!targetField || !targetField.name) return true; // If target field not found, show by default

        const value = formData[targetField.name];

        switch (condition.operator) {
            case 'equals': return value == condition.value;
            case 'not_equals': return value != condition.value;
            case 'contains': return String(value).includes(condition.value);
            case 'is_empty': return value === '' || value === null || value === undefined || value === false;
            case 'is_not_empty': return value !== '' && value !== null && value !== undefined && value !== false;
            default: return true;
        }
    };

    const shouldShowField = (field: FormField): boolean => {
        if (!field.conditions || field.conditions.length === 0) {
            return true;
        }
        
        const results = field.conditions.map(checkCondition);

        if (field.conditionLogic === 'or') {
            return results.some(res => res);
        }
        // Default to 'and'
        return results.every(res => res);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!form || !form.settings.postOnSubmit || !form.settings.postApiUrl) {
            alert("Form submission is not configured.");
            return;
        }

        setSubmissionStatus('submitting');
        try {
            const res = await fetch(form.settings.postApiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                throw new Error('Submission failed.');
            }
            setSubmissionStatus('success');
        } catch (err) {
            setSubmissionStatus('error');
        }
    };
    
    const toCamelCase = (str: string) => str.replace(/-./g, x => x[1].toUpperCase());

    const renderField = (field: FormField) => {
        const baseStyles = field.styles || {};
        const customStyles = baseStyles.custom?.reduce((acc, style) => {
            if (style.name) acc[toCamelCase(style.name)] = style.value;
            return acc;
        }, {} as { [key: string]: string }) || {};

        const fieldStyles: React.CSSProperties = {
            ...customStyles,
            color: baseStyles.color || form?.styles.textColor,
            borderColor: baseStyles.borderColor || form?.styles.fieldBorderColor,
            fontSize: baseStyles.fontSize,
            fontWeight: baseStyles.fontWeight,
            textAlign: baseStyles.textAlign,
        };
        
        if (field.type === 'heading' || field.type === 'paragraph') {
            fieldStyles.backgroundColor = baseStyles.backgroundColor || 'transparent';
        } else {
            fieldStyles.backgroundColor = baseStyles.backgroundColor || form?.styles.fieldBackgroundColor;
        }

        switch(field.type) {
            case 'heading': return <h2 className="text-2xl break-words p-2" style={fieldStyles}>{field.label}</h2>;
            case 'paragraph': return <p className="break-words p-2" style={fieldStyles}>{field.label}</p>;
            case 'text':
            case 'email':
            case 'date': return <input type={field.type} name={field.name} value={formData[field.name || ''] || ''} onChange={handleInputChange} placeholder={field.placeholder} required={field.required} style={fieldStyles} className="w-full border rounded-lg px-3 py-2 bg-transparent" />;
            case 'textarea': return <textarea name={field.name} value={formData[field.name || ''] || ''} onChange={handleInputChange} placeholder={field.placeholder} required={field.required} style={fieldStyles} className="w-full border rounded-lg px-3 py-2 bg-transparent" />;
            case 'select': return <select name={field.name} value={formData[field.name || ''] || ''} onChange={handleInputChange} required={field.required} style={fieldStyles} className="w-full border rounded-lg px-3 py-2 bg-transparent appearance-none"><option value="">{field.placeholder || "Select an option"}</option>{field.options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select>;
            case 'checkbox': return <div className={`flex gap-4 ${field.layout === 'horizontal' ? 'flex-row flex-wrap' : 'flex-col'}`}>{field.options?.map((opt, i) => <div key={i} className="flex items-center gap-2"><input type="checkbox" name={opt.value} checked={!!formData[opt.value]} onChange={handleInputChange} /> <span style={{color: fieldStyles.color}}>{opt.label}</span></div>)}</div>;
            case 'radio': return <div className={`flex gap-4 ${field.layout === 'horizontal' ? 'flex-row flex-wrap' : 'flex-col'}`}>{field.options?.map((opt, i) => <div key={i} className="flex items-center gap-2"><input type="radio" name={field.name} value={opt.value} checked={formData[field.name || ''] === opt.value} onChange={handleInputChange} /> <span style={{color: fieldStyles.color}}>{opt.label}</span></div>)}</div>;
            case 'file': return <input type="file" name={field.name} required={field.required} style={{...fieldStyles, backgroundColor: 'transparent'}} className="w-full border rounded-lg px-3 py-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200" />;
            case 'signature': return <div className="w-full h-32 bg-gray-800/50 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center"><p className="text-gray-500">Signature Pad Area</p></div>;
            default: return null;
        }
    };

    if (loading) {
        return <div className="w-full h-screen bg-gray-900"><Loader /></div>;
    }

    if (error) {
        return <div className="w-full h-screen bg-gray-900 text-red-400 flex items-center justify-center"><p>Error: {error}</p></div>;
    }

    if (!form) {
        return <div className="w-full h-screen bg-gray-900 text-gray-400 flex items-center justify-center"><p>Form not found.</p></div>;
    }

    return (
        <div className="min-h-screen w-full p-4 md:p-8 flex items-center justify-center" style={form.styles.backgroundType === 'image' ? { backgroundImage: `url(${form.styles.backgroundImage})`, backgroundSize: 'cover' } : { backgroundColor: form.styles.backgroundColor, color: form.styles.textColor }}>
            <div className="w-full max-w-2xl bg-black/20 backdrop-blur-md p-8 rounded-xl shadow-2xl">
                <h1 className="text-3xl font-bold mb-2 text-center" style={{color: form.styles.textColor}}>{form.title}</h1>
                <hr className="border-gray-600 mb-8"/>

                {submissionStatus === 'success' ? (
                    <div className="text-center p-8 bg-green-900/50 rounded-lg">
                        <h2 className="text-2xl font-bold text-green-300">Thank You!</h2>
                        <p className="text-green-400 mt-2">Your response has been submitted successfully.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="flex flex-wrap" style={{rowGap: `${form.styles.gap}px`, columnGap: `${form.styles.gap}px`}}>
                            {form.fields.filter(shouldShowField).map(field => (
                                <div key={field.id} style={{width: `calc(${field.width} - ${field.width === '100%' ? 0 : form.styles.gap}px)`}}>
                                    {['text', 'email', 'textarea', 'select', 'date', 'file', 'checkbox', 'radio', 'signature'].includes(field.type) && <label className="block text-sm font-medium mb-2" style={{color: field.styles?.color || form.styles.textColor}}>{field.label} {field.required && <span className="text-red-400">*</span>}</label>}
                                    {renderField(field)}
                                </div>
                            ))}
                        </div>
                        <div className="w-full mt-8" style={{textAlign: form.styles.buttonPosition}}>
                            <button type="submit" disabled={submissionStatus === 'submitting'} style={{backgroundColor: form.styles.buttonBackgroundColor, color: form.styles.buttonTextColor, width: form.styles.buttonWidth, height: form.styles.buttonHeight}} className="font-bold py-2 px-6 rounded-lg transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed">
                                {submissionStatus === 'submitting' ? 'Submitting...' : form.styles.buttonText}
                            </button>
                        </div>
                        {submissionStatus === 'error' && <p className="text-red-400 text-center mt-4">An error occurred during submission. Please try again.</p>}
                    </form>
                )}
            </div>
        </div>
    );
}
