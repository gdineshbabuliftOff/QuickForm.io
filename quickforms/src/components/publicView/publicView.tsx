"use client";

import React, { useState, useEffect, FC, FormEvent, JSX, useCallback } from 'react';
import { useParams } from 'next/navigation';
import QuickFormLoader from '@/components/loaders/quickFormloader';

// --- Icon Creation (Your existing code, no changes needed) ---
interface IconProps { color?: string; size?: number | string; strokeWidth?: number | string; className?: string; }
type IconPathTuple = [keyof JSX.IntrinsicElements, { [key: string]: any }];
const createIcon = (path: IconPathTuple[]): (({ displayName }: { displayName: string; }) => FC<IconProps>) => ({ displayName }: { displayName: string; }) => {
    const Component = React.forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 24, strokeWidth = 2, className, ...rest }, ref) => React.createElement('svg', { ref, width: size, height: size, stroke: color, strokeWidth, className: ['lucide', `lucide-${displayName.toLowerCase()}`, className].filter(Boolean).join(' '), xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round', ...rest }, path.map(([tag, attrs], i) => React.createElement(tag, { key: attrs.key || i, ...attrs }))));
    Component.displayName = `LucideIcon(${displayName})`;
    return Component;
};
const CheckCircleIcon = createIcon([['path', {d:"M22 11.08V12a10 10 0 1 1-5.93-9.14"}],['polyline', {points:"22 4 12 14.01 9 11.01"}]])({displayName: 'CheckCircle'});


// --- Type Definitions (Your existing types, no changes needed) ---
type FieldType = 'text' | 'email' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'heading' | 'paragraph' | 'date' | 'file' | 'signature' | 'section' | 'hr' | 'ordered-list' | 'unordered-list';
type FieldWidth = '100%' | '50%' | '33.33%';
type PreviewMode = 'desktop' | 'tablet' | 'mobile'; 
type ConditionOperator = 'equals' | 'not_equals' | 'contains' | 'is_empty' | 'is_not_empty';
type TextAlign = 'left' | 'center' | 'right';
type ConditionLogic = 'and' | 'or';
interface CustomStyle { name: string; value: string; }
interface ResponsiveStyles { width?: FieldWidth; fontSize?: string; }
interface FieldStyles {
    color?: string; backgroundColor?: string; borderColor?: string; fontSize?: string;
    fontWeight?: string; textAlign?: TextAlign; padding?: string; custom?: CustomStyle[];
    desktop: ResponsiveStyles; tablet: ResponsiveStyles; mobile: ResponsiveStyles;
}
interface FieldOption { label: string; value: string; }
interface FieldCondition { id: string; fieldId: string; operator: ConditionOperator; value: string; }
interface RequiredCondition { enabled: boolean; logic: ConditionLogic; conditions: FieldCondition[]; }
interface FormField {
    id: string; type: FieldType; label: string; width: FieldWidth; name?: string;
    fieldId?: string; placeholder?: string; value?: string; required?: boolean;
    requiredConditions?: RequiredCondition; options?: FieldOption[]; layout?: 'vertical' | 'horizontal';
    styles: FieldStyles; conditions?: FieldCondition[]; conditionLogic?: ConditionLogic; fields?: FormField[];
}
interface FormStyles {
    backgroundType: 'color' | 'image'; backgroundColor: string; backgroundImage: string; textColor: string;
    fieldBackgroundColor: string; fieldBorderColor: string; buttonBackgroundColor: string; buttonTextColor: string;
    buttonText: string; buttonPosition: 'left' | 'center' | 'right'; buttonWidth: string; buttonHeight: string; gap: number;
}
interface FormSettings { postOnSubmit: boolean; postApiUrl: string; }
interface Form { id: string; title: string; fields: FormField[]; styles: FormStyles; settings: FormSettings; }

// --- ADDED --- State for file objects
type FileState = { [fieldName: string]: File | null };

export default function PublicFormPage() {
    const params = useParams() || {};
    const [form, setForm] = useState<Form | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<{ [key: string]: any }>({});
    const [fileData, setFileData] = useState<FileState>({}); // --- ADDED --- State to manage file objects
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionStatus, setSubmissionStatus] = useState<'success' | 'error' | null>(null);
    const [validationError, setValidationError] = useState<string | null>(null); // --- ADDED --- For inline validation messages

    const formId = params.formId as string;

    const getAllFields = useCallback((fields: FormField[]): FormField[] => {
        return fields.reduce((acc, field) => {
            acc.push(field);
            if (field.type === 'section' && field.fields) {
                acc.push(...getAllFields(field.fields));
            }
            return acc;
        }, [] as FormField[]);
    }, []);

    useEffect(() => {
        if (!formId) {
            setError("Invalid Form URL.");
            setLoading(false);
            return;
        }
        const loadForm = async () => {
            try {
                const res = await fetch(`/api/forms/public/${formId}`);
                if (res.ok) {
                    const data: Form = await res.json();
                    setForm(data);
                    const initialData: { [key: string]: any } = {};
                    const allFields = getAllFields(data.fields);
                    allFields.forEach(field => {
                        if (field.name) {
                            initialData[field.name] = field.type === 'checkbox' ? [] : '';
                        }
                    });
                    setFormData(initialData);
                } else {
                    const errorText = await res.text();
                    setError(res.status === 404 ? "This form could not be found." : `Error: ${errorText}`);
                }
            } catch (err) {
                setError("Failed to load the form.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadForm();
    }, [formId, getAllFields]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setValidationError(null); // Reset validation error on input change

        if (type === 'checkbox') {
            const checkbox = e.target as HTMLInputElement;
            const currentValues = formData[name] as string[] || [];
            setFormData(prev => ({
                ...prev,
                [name]: checkbox.checked ? [...currentValues, value] : currentValues.filter(v => v !== value),
            }));
        } else if (type === 'file') { // --- FIX --- Handle file input separately
            const fileInput = e.target as HTMLInputElement;
            if (fileInput.files && fileInput.files[0]) {
                setFileData(prev => ({ ...prev, [name]: fileInput.files![0] }));
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    // --- Evaluate Conditions (Your existing code, no changes needed) ---
    const evaluateConditions = (conditions: FieldCondition[] = [], logic: ConditionLogic = 'and'): boolean => {
        if (!form || conditions.length === 0) return true;
        const allFields = getAllFields(form.fields);
        const conditionChecks = conditions.map(cond => {
            const targetField = allFields.find(f => f.id === cond.fieldId);
            if (!targetField?.name) return false;
            const value = formData[targetField.name];
            const isTargetEmpty = value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0);
            switch (cond.operator) {
                case 'is_empty': return isTargetEmpty;
                case 'is_not_empty': return !isTargetEmpty;
                case 'equals': return !isTargetEmpty && String(value) === cond.value;
                case 'not_equals': return isTargetEmpty || String(value) !== cond.value;
                case 'contains': return !isTargetEmpty && String(value).includes(cond.value);
                default: return false;
            }
        });
        return logic === 'or' ? conditionChecks.some(c => c) : conditionChecks.every(c => c);
    };

    const isFieldRequired = (field: FormField): boolean => {
        if (field.requiredConditions?.enabled) {
            return evaluateConditions(field.requiredConditions.conditions, field.requiredConditions.logic);
        }
        return field.required || false;
    };
    
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!form) return;
        setValidationError(null);
        
        // --- Validation ---
        const allFields = getAllFields(form.fields);
        for (const field of allFields) {
            const isVisible = evaluateConditions(field.conditions, field.conditionLogic);
            const isRequired = isFieldRequired(field);
            if (isVisible && isRequired) {
                const value = field.type === 'file' ? fileData[field.name || ''] : formData[field.name || ''];
                if (!value || (Array.isArray(value) && value.length === 0)) {
                    setValidationError(`Field "${field.label}" is required.`); // --- FIX --- Set validation state instead of alert
                    return;
                }
            }
        }

        setIsSubmitting(true);
        setSubmissionStatus(null);
        
        // --- FIX --- Use FormData for submission to support files
        const submissionApiFormData = new FormData();
        submissionApiFormData.append('formDataJson', JSON.stringify(formData));
        
        // Append all files to the form data
        Object.entries(fileData).forEach(([fieldName, file]) => {
            if (file) {
                submissionApiFormData.append(fieldName, file);
            }
        });

        try {
            const res = await fetch(`/api/forms/submit/${formId}`, {
                method: 'POST',
                body: submissionApiFormData, // Send as FormData, not JSON
            });

            if (res.ok) {
                setSubmissionStatus('success');
            } else {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Submission failed');
            }
        } catch (err: any) {
            console.error(err);
            setSubmissionStatus('error');
            setValidationError(err.message || "An unexpected error occurred.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderField = (field: FormField): JSX.Element | null => {
        // ... (Your existing renderField function has no breaking issues, but we'll modify the 'file' case slightly for clarity)
        if (!form) return null;
        
        const isVisible = evaluateConditions(field.conditions, field.conditionLogic);
        if (!isVisible) return null;
        
        const isRequired = isFieldRequired(field);
        
        const fieldStyles: React.CSSProperties = {
            color: field.styles?.color || form.styles.textColor,
            borderColor: field.styles?.borderColor || form.styles.fieldBorderColor,
            fontSize: field.styles?.desktop?.fontSize || field.styles?.fontSize,
            fontWeight: field.styles?.fontWeight,
            textAlign: field.styles?.textAlign,
            backgroundColor: field.type.match(/heading|paragraph|section|hr|ordered-list|unordered-list/) ? (field.styles?.backgroundColor || 'transparent') : (field.styles?.backgroundColor || form.styles.fieldBackgroundColor)
        };

        const fieldWrapper = (content: JSX.Element) => {
             if (field.type.match(/heading|paragraph|section|hr/)) {
                return content;
             }
             return (
                <div>
                    <label className="block text-sm font-medium mb-2" style={{color: field.styles?.color || form.styles.textColor}}>
                        {field.label} {isRequired && <span className="text-red-400">*</span>}
                    </label>
                    {content}
                </div>
             );
        };

        switch(field.type) {
            case 'heading': return fieldWrapper(<h2 className="text-2xl break-words p-2" style={fieldStyles}>{field.label}</h2>);
            case 'paragraph': return fieldWrapper(<p className="break-words p-2" style={fieldStyles}>{field.label}</p>);
            case 'hr': return <hr style={{borderColor: field.styles?.borderColor || form.styles.fieldBorderColor}} className="my-4"/>;
            case 'ordered-list': return fieldWrapper(<ol className="list-decimal list-inside pl-4" style={fieldStyles}>{field.options?.map((opt, i) => <li key={i}>{opt.label}</li>)}</ol>);
            case 'unordered-list': return fieldWrapper(<ul className="list-disc list-inside pl-4" style={fieldStyles}>{field.options?.map((opt, i) => <li key={i}>{opt.label}</li>)}</ul>);
            case 'text':
            case 'email':
            case 'date': return fieldWrapper(<input type={field.type} name={field.name} id={field.id} placeholder={field.placeholder} required={isRequired} onChange={handleInputChange} value={formData[field.name || '']} style={fieldStyles} className="w-full border rounded-lg px-3 py-2 bg-transparent" />);
            case 'textarea': return fieldWrapper(<textarea name={field.name} id={field.id} placeholder={field.placeholder} required={isRequired} onChange={handleInputChange} value={formData[field.name || '']} style={fieldStyles} className="w-full border rounded-lg px-3 py-2 bg-transparent" />);
            case 'select': return fieldWrapper(<select name={field.name} id={field.id} required={isRequired} onChange={handleInputChange} value={formData[field.name || '']} style={fieldStyles} className="w-full border rounded-lg px-3 py-2 bg-transparent"><option value="">{field.placeholder || "Select an option"}</option>{field.options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select>);
            case 'checkbox': return fieldWrapper(<div className={`flex gap-4 ${field.layout === 'horizontal' ? 'flex-row' : 'flex-col'}`}>{field.options?.map((opt, i) => <div key={i} className="flex items-center gap-2"><input type={field.type} name={field.name} id={`${field.id}_${i}`} value={opt.value} onChange={handleInputChange} checked={formData[field.name || '']?.includes(opt.value)} /> <label htmlFor={`${field.id}_${i}`} style={{color: fieldStyles.color}} className="cursor-pointer">{opt.label}</label></div>)}</div>);
            case 'radio': return fieldWrapper(<div className={`flex gap-4 ${field.layout === 'horizontal' ? 'flex-row' : 'flex-col'}`}>{field.options?.map((opt, i) => <div key={i} className="flex items-center gap-2"><input type={field.type} name={field.name} id={`${field.id}_${i}`} value={opt.value} onChange={handleInputChange} required={isRequired} checked={formData[field.name || ''] === opt.value} /> <label htmlFor={`${field.id}_${i}`} style={{color: fieldStyles.color}} className="cursor-pointer">{opt.label}</label></div>)}</div>);
            // --- FIX --- Use the corrected handleInputChange for file
            case 'file': return fieldWrapper(<input type="file" name={field.name} id={field.id} required={isRequired} onChange={handleInputChange} style={{...fieldStyles, backgroundColor: 'transparent'}} className="w-full border rounded-lg px-3 py-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200" />);
            case 'signature': return fieldWrapper(<div><p className="mb-2">Please sign below:</p><div className="w-full h-32 bg-gray-100 border-2 border-dashed border-gray-400 rounded-lg"></div><p className="text-xs text-gray-500 mt-1">Signature pad is for demonstration only.</p></div>);
            case 'section':
                 return (
                    <div className="w-full rounded-lg border-2" style={{ ...fieldStyles, padding: field.styles?.padding || '1rem', borderColor: field.styles?.borderColor || 'transparent' }}>
                         <h3 className="text-xl font-semibold mb-4" style={{color: field.styles?.color || form.styles.textColor}}>{field.label}</h3>
                         <div className="flex flex-wrap" style={{rowGap: `${form.styles.gap}px`, columnGap: `${form.styles.gap}px`}}>
                            {field.fields?.map(subField => {
                                const renderedSubField = renderField(subField);
                                return renderedSubField ? (
                                    <div key={subField.id} style={{ width: `calc(${subField.width} - ${subField.width === '100%' ? 0 : form.styles.gap}px)` }}>
                                        {renderedSubField}
                                    </div>
                                ) : null;
                            })}
                         </div>
                    </div>
                );
            default: return null;
        }
    };


    if (loading) return <QuickFormLoader />;
    if (error) return <div className="flex h-screen w-full items-center justify-center text-red-500 bg-gray-100 p-4 text-center"><p>{error}</p></div>;
    if (!form) return <div className="flex h-screen w-full items-center justify-center bg-gray-100"><p>Form not found or is unavailable.</p></div>;

    if (submissionStatus === 'success') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4" style={form.styles.backgroundType === 'image' ? { backgroundImage: `url(${form.styles.backgroundImage})`} : { backgroundColor: form.styles.backgroundColor }}>
                <div className="bg-white/30 p-10 rounded-xl shadow-2xl backdrop-blur-lg text-center">
                    <CheckCircleIcon size={64} className="mx-auto text-green-500" />
                    <h2 className="text-3xl font-bold mt-4" style={{color: form.styles.textColor}}>Thank You!</h2>
                    <p className="mt-2 text-lg" style={{color: form.styles.textColor}}>Your response has been successfully submitted.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4" style={form.styles.backgroundType === 'image' ? { backgroundImage: `url(${form.styles.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : { backgroundColor: form.styles.backgroundColor, color: form.styles.textColor }}>
            <div className="w-full max-w-4xl">
                <div className="bg-white/20 p-6 sm:p-8 rounded-xl shadow-2xl backdrop-blur-lg border border-white/30">
                    <h1 className="text-3xl font-bold mb-8 text-center" style={{color: form.styles.textColor}}>{form.title}</h1>
                    <form onSubmit={handleSubmit} className="flex flex-wrap" style={{rowGap: `${form.styles.gap}px`, columnGap: `${form.styles.gap}px`}}>
                        {form.fields.map(field => {
                            const renderedField = renderField(field);
                            return renderedField ? (
                                <div key={field.id} style={{ width: `calc(${field.width} - ${field.width === '100%' ? 0 : form.styles.gap}px)` }}>
                                    {renderedField}
                                </div>
                            ) : null;
                        })}
                        {form.fields.length > 0 && (
                            <div className="w-full mt-8" style={{textAlign: form.styles.buttonPosition}}>
                                <button type="submit" disabled={isSubmitting} style={{backgroundColor: form.styles.buttonBackgroundColor, color: form.styles.buttonTextColor, width: form.styles.buttonWidth, height: form.styles.buttonHeight}} className="font-bold py-2 px-6 rounded-lg cursor-pointer shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-wait">
                                    {isSubmitting ? 'Submitting...' : form.styles.buttonText}
                                </button>
                                {/* --- ADDED --- Display validation and submission errors inline */}
                                {validationError && <p className="text-red-400 mt-4 font-semibold">{validationError}</p>}
                                {submissionStatus === 'error' && !validationError && <p className="text-red-400 mt-4 font-semibold">Submission failed. Please try again.</p>}
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}