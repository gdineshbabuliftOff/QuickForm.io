"use client";

import React, { useState, useEffect, FC, FormEvent, JSX, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import QuickFormLoader from '../loaders/quickFormloader';

// --- Icon Creation (Copied from Editor for UI) ---
interface IconProps { color?: string; size?: number | string; strokeWidth?: number | string; className?: string; }
type IconPathTuple = [keyof JSX.IntrinsicElements, { [key: string]: any }];
const createIcon = (path: IconPathTuple[]): (({ displayName }: { displayName: string; }) => FC<IconProps>) => ({ displayName }: { displayName: string; }) => {
    const Component = React.forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 24, strokeWidth = 2, className, ...rest }, ref) => React.createElement('svg', { ref, width: size, height: size, stroke: color, strokeWidth, className: ['lucide', `lucide-${displayName.toLowerCase()}`, className].filter(Boolean).join(' '), xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round', ...rest }, path.map(([tag, attrs], i) => React.createElement(tag, { key: attrs.key || i, ...attrs }))));
    Component.displayName = `LucideIcon(${displayName})`;
    return Component;
};

const MonitorIcon = createIcon([['rect', { width: "20", height: "14", x: "2", y: "3", rx: "2" }], ['line', { x1: "8", y1: "21", x2: "16", y2: "21" }], ['line', { x1: "12", y1: "17", x2: "12", y2: "21" }]])({ displayName: 'Monitor' });
const TabletIcon = createIcon([['rect', { width: "16", height: "20", x: "4", y: "2", rx: "2", ry: "2" }], ['line', { x1: "12", y1: "18", x2: "12.01", y2: "18" }]])({ displayName: 'Tablet' });
const SmartphoneIcon = createIcon([['rect', { width: "14", height: "20", x: "5", y: "2", rx: "2", ry: "2" }], ['path', { d: "M12 18h.01" }]])({ displayName: 'Smartphone' });


// --- Type Definitions (Synchronized with Editor) ---
type FieldType = 'text' | 'email' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'heading' | 'paragraph' | 'date' | 'file' | 'signature' | 'section' | 'hr' | 'ordered-list' | 'unordered-list';
type FieldWidth = '100%' | '50%' | '33.33%';
type PreviewMode = 'desktop' | 'tablet' | 'mobile';
type ConditionOperator = 'equals' | 'not_equals' | 'contains' | 'is_empty' | 'is_not_empty';
type TextAlign = 'left' | 'center' | 'right';
type ConditionLogic = 'and' | 'or';

interface CustomStyle { name: string; value: string; }
interface ResponsiveStyles { width?: FieldWidth; fontSize?: string; }

interface FieldStyles {
    color?: string;
    backgroundColor?: string;
    borderColor?: string;
    fontSize?: string;
    fontWeight?: string;
    textAlign?: TextAlign;
    padding?: string;
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

interface RequiredCondition {
    enabled: boolean;
    logic: ConditionLogic;
    conditions: FieldCondition[];
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
    requiredConditions?: RequiredCondition;
    options?: FieldOption[];
    layout?: 'vertical' | 'horizontal';
    styles: FieldStyles;
    conditions?: FieldCondition[];
    conditionLogic?: ConditionLogic;
    fields?: FormField[];
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
    hasPublishedVersion?: boolean;
}

export default function OwnerPreviewPage() {
    const params = useParams() || {};
    const { user, loading: authLoading } = useAuth();
    const [form, setForm] = useState<Form | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<{ [key: string]: any }>({});
    const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop');

    const formId = params.formId as string;

    const getAllFields = useCallback((fields: FormField[]): FormField[] => {
        let allFields: FormField[] = [];
        fields.forEach(field => {
            allFields.push(field);
            if (field.type === 'section' && field.fields) {
                allFields = allFields.concat(getAllFields(field.fields));
            }
        });
        return allFields;
    }, []);

    useEffect(() => {
        if (authLoading) return;

        const loadForm = async () => {
            if (!user) {
                setError("You must be logged in to preview this form.");
                setLoading(false);
                return;
            }

            if (!formId) {
                setError("Invalid Form URL.");
                setLoading(false);
                return;
            }

            try {
                const token = await user.getIdToken();
                const res = await fetch(`/api/forms/preview/${formId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.ok) {
                    const data: Form = await res.json();
                    setForm(data);
                    
                    const initialData: { [key: string]: any } = {};
                    const allFields = getAllFields(data.fields);
                    allFields.forEach(field => {
                        if (field.name) {
                            if (field.type === 'checkbox') {
                                initialData[field.name] = [];
                            } else {
                                initialData[field.name] = '';
                            }
                        }
                    });
                    setFormData(initialData);

                } else {
                    const errorText = await res.text();
                    setError(`Error: ${errorText} (${res.status})`);
                }
            } catch (err) {
                setError("Failed to load the form preview.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadForm();
    }, [formId, user?.uid, authLoading, getAllFields]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        if (type === 'checkbox') {
            const checkbox = e.target as HTMLInputElement;
            const currentValues = formData[name] as string[] || [];
            if (checkbox.checked) {
                setFormData(prev => ({ ...prev, [name]: [...currentValues, value] }));
            } else {
                setFormData(prev => ({ ...prev, [name]: currentValues.filter(v => v !== value) }));
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const evaluateConditions = (conditions: FieldCondition[] = [], logic: ConditionLogic = 'and'): boolean => {
        if (conditions.length === 0) return true;
    
        const allFields = form ? getAllFields(form.fields) : [];
    
        const conditionChecks = conditions.map(cond => {
            const targetField = allFields.find(f => f.id === cond.fieldId);
            if (!targetField?.name) return false;
    
            const targetValueFromState = formData[targetField.name];
            const conditionValue = cond.value;
    
            let valueToCompare = targetValueFromState;
            if (targetField.type === 'select' || targetField.type === 'radio') {
                const selectedOption = targetField.options?.find(opt => opt.value === targetValueFromState);
                valueToCompare = selectedOption ? selectedOption.label : '';
            } else if (Array.isArray(targetValueFromState)) {
                 valueToCompare = targetValueFromState.map(val => {
                    const selectedOption = targetField.options?.find(opt => opt.value === val);
                    return selectedOption ? selectedOption.label : val;
                });
            }

            const isTargetEmpty = valueToCompare === undefined || valueToCompare === null || valueToCompare === '' || (Array.isArray(valueToCompare) && valueToCompare.length === 0);
    
            switch (cond.operator) {
                case 'is_empty': return isTargetEmpty;
                case 'is_not_empty': return !isTargetEmpty;
                case 'equals': return Array.isArray(valueToCompare) ? valueToCompare.includes(conditionValue) : String(valueToCompare) === conditionValue;
                case 'not_equals': return Array.isArray(valueToCompare) ? !valueToCompare.includes(conditionValue) : String(valueToCompare) !== conditionValue;
                case 'contains': return !isTargetEmpty && String(valueToCompare).includes(conditionValue);
                default: return false;
            }
        });
    
        if (logic === 'or') return conditionChecks.some(check => check);
        return conditionChecks.every(check => check);
    };

    const isFieldRequired = (field: FormField): boolean => {
        if (field.requiredConditions?.enabled) {
            return evaluateConditions(field.requiredConditions.conditions, field.requiredConditions.logic);
        }
        return field.required || false;
    };
    
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        alert("This is a preview. Form submissions are disabled.");
    };

    const renderField = (field: FormField): JSX.Element | null => {
        if (!form) return null;
        
        const isVisible = evaluateConditions(field.conditions, field.conditionLogic);
        if (!isVisible) return null;
        
        const isRequired = isFieldRequired(field);
        
        const responsiveStyles = field.styles?.[previewMode] || {};
        const fieldStyles: React.CSSProperties = {
            color: field.styles?.color || form.styles.textColor,
            borderColor: field.styles?.borderColor || form.styles.fieldBorderColor,
            fontSize: responsiveStyles.fontSize || field.styles?.fontSize,
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
            case 'date': return fieldWrapper(<input type={field.type} name={field.name} id={field.id} placeholder={field.placeholder} required={isRequired} onChange={handleInputChange} style={fieldStyles} className="w-full border rounded-lg px-3 py-2 bg-transparent" />);
            case 'textarea': return fieldWrapper(<textarea name={field.name} id={field.id} placeholder={field.placeholder} required={isRequired} onChange={handleInputChange} style={fieldStyles} className="w-full border rounded-lg px-3 py-2 bg-transparent" />);
            case 'select': return fieldWrapper(<select name={field.name} id={field.id} required={isRequired} onChange={handleInputChange} style={fieldStyles} className="w-full border rounded-lg px-3 py-2 bg-transparent"><option value="">{field.placeholder || "Select an option"}</option>{field.options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select>);
            case 'checkbox': return fieldWrapper(<div className={`flex gap-4 ${field.layout === 'horizontal' ? 'flex-row' : 'flex-col'}`}>{field.options?.map((opt, i) => <div key={i} className="flex items-center gap-2"><input type={field.type} name={field.name} id={`${field.id}_${i}`} value={opt.value} onChange={handleInputChange} required={isRequired && (formData[field.name || '']?.length === 0)} /> <label htmlFor={`${field.id}_${i}`} style={{color: fieldStyles.color}}>{opt.label}</label></div>)}</div>);
            case 'radio': return fieldWrapper(<div className={`flex gap-4 ${field.layout === 'horizontal' ? 'flex-row' : 'flex-col'}`}>{field.options?.map((opt, i) => <div key={i} className="flex items-center gap-2"><input type={field.type} name={field.name} id={`${field.id}_${i}`} value={opt.value} onChange={handleInputChange} required={isRequired} /> <label htmlFor={`${field.id}_${i}`} style={{color: fieldStyles.color}}>{opt.label}</label></div>)}</div>);
            case 'file': return fieldWrapper(<input type="file" name={field.name} id={field.id} required={isRequired} onChange={handleInputChange} style={{...fieldStyles, backgroundColor: 'transparent'}} className="w-full border rounded-lg px-3 py-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200" />);
            case 'signature': return fieldWrapper(<div className="w-full"><p className="mb-2">Please sign below:</p><div className="w-full h-32 bg-gray-100 border-2 border-dashed border-gray-400 rounded-lg"></div></div>);
            case 'section':
                const sectionContainerStyle: React.CSSProperties = {
                    ...fieldStyles,
                    padding: field.styles?.padding || '1rem',
                    borderColor: field.styles?.borderColor || 'transparent'
                };
                return (
                    <div className="w-full rounded-lg border-2" style={sectionContainerStyle}>
                         <h3 className="text-xl font-semibold mb-4" style={{color: field.styles?.color || form.styles.textColor}}>{field.label}</h3>
                         <div className="flex flex-wrap" style={{rowGap: `${form.styles.gap}px`, columnGap: `${form.styles.gap}px`}}>
                            {field.fields?.map(subField => {
                                const responsiveWidth = subField.styles?.[previewMode]?.width || subField.width;
                                const renderedSubField = renderField(subField);
                                return renderedSubField ? (
                                    <div key={subField.id} style={{ width: `calc(${responsiveWidth} - ${responsiveWidth === '100%' ? 0 : form.styles.gap}px)` }}>
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
    if (error) return <div className="flex h-screen w-full items-center justify-center text-red-500"><p>{error}</p></div>;
    if (!form) return <div className="flex h-screen w-full items-center justify-center"><p>Could not load form.</p></div>;

    const previewWidths = { desktop: '100%', tablet: '768px', mobile: '420px' };

    return (
        <div className="min-h-screen" style={form.styles.backgroundType === 'image' ? { backgroundImage: `url(${form.styles.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : { backgroundColor: form.styles.backgroundColor, color: form.styles.textColor }}>
            <div className="fixed top-0 left-0 w-full bg-yellow-400 text-black text-center p-2 font-semibold z-50 shadow-md">
                Owner Preview Mode - Submissions are Disabled
            </div>
            <div className="fixed top-10 left-1/2 -translate-x-1/2 w-full max-w-sm flex justify-center p-2 z-50">
                <div className="flex items-center gap-2 bg-gray-900/80 backdrop-blur-sm p-1 rounded-lg border border-white/20">
                     <button onClick={() => setPreviewMode('desktop')} className={`p-2 rounded-md cursor-pointer ${previewMode === 'desktop' ? 'bg-indigo-600 text-white' : 'hover:bg-gray-700 text-gray-300'}`}><MonitorIcon size={20}/></button>
                     <button onClick={() => setPreviewMode('tablet')} className={`p-2 rounded-md cursor-pointer ${previewMode === 'tablet' ? 'bg-indigo-600 text-white' : 'hover:bg-gray-700 text-gray-300'}`}><TabletIcon size={20}/></button>
                     <button onClick={() => setPreviewMode('mobile')} className={`p-2 rounded-md cursor-pointer ${previewMode === 'mobile' ? 'bg-indigo-600 text-white' : 'hover:bg-gray-700 text-gray-300'}`}><SmartphoneIcon size={20}/></button>
                </div>
            </div>

            <div className="mx-auto p-8 pt-32 transition-all duration-300 ease-in-out" style={{maxWidth: previewWidths[previewMode]}}>
                <div className="bg-white/20 p-8 rounded-xl shadow-2xl backdrop-blur-lg border border-white/30">
                    <h1 className="text-3xl font-bold mb-8 text-center" style={{color: form.styles.textColor}}>{form.title}</h1>
                    <form onSubmit={handleSubmit} className="flex flex-wrap" style={{rowGap: `${form.styles.gap}px`, columnGap: `${form.styles.gap}px`}}>
                        {form.fields.map(field => {
                            const responsiveWidth = field.styles?.[previewMode]?.width || field.width;
                            const renderedField = renderField(field);
                            return renderedField ? (
                                <div key={field.id} style={{ width: `calc(${responsiveWidth} - ${responsiveWidth === '100%' ? 0 : form.styles.gap}px)` }}>
                                    {renderedField}
                                </div>
                            ) : null;
                        })}
                        {form.fields.length > 0 && (
                            <div className="w-full mt-8" style={{textAlign: form.styles.buttonPosition}}>
                                <button type="submit" style={{backgroundColor: form.styles.buttonBackgroundColor, color: form.styles.buttonTextColor, width: form.styles.buttonWidth, height: form.styles.buttonHeight}} className="font-bold py-2 px-6 rounded-lg cursor-pointer shadow-lg hover:opacity-90 transition-opacity">
                                    {form.styles.buttonText}
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}