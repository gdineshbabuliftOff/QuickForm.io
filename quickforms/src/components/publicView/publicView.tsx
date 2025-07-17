"use client";

import React, { useState, useEffect, FC, FormEvent, JSX, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import QuickFormLoader from '@/components/loaders/quickFormloader';

// TYPE DEFINITIONS
interface IconProps { color?: string; size?: number | string; strokeWidth?: number | string; className?: string; fill?: string; onClick?: () => void; }
type IconPathTuple = [keyof JSX.IntrinsicElements, { [key: string]: any }];
type FieldType = 'text' | 'email' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'heading' | 'paragraph' | 'date' | 'file' | 'signature' | 'section' | 'hr' | 'ordered-list' | 'unordered-list' | 'number' | 'password' | 'range' | 'tel' | 'url' | 'color' | 'time' | 'month' | 'week' | 'address' | 'name' | 'rating' | 'image' | 'button';
type FieldWidth = '100%' | '50%' | '33.33%' | 'custom';
type PreviewMode = 'desktop' | 'tablet' | 'mobile';
type ConditionOperator = 'equals' | 'not_equals' | 'contains' | 'is_empty' | 'is_not_empty';
type TextAlign = 'left' | 'center' | 'right';
type ConditionLogic = 'and' | 'or';
type ListStyleType = 'disc' | 'circle' | 'square' | 'decimal' | 'lower-alpha' | 'upper-alpha' | 'lower-roman' | 'upper-roman' | 'none';
type ControlStyle = 'default' | 'filled' | 'switch' | 'line-through';

interface CustomStyle { name: string; value: string; }
interface ResponsiveFieldStyles { width?: FieldWidth | string; fontSize?: string; height?: string; display?: 'block' | 'none'; }
interface FieldStyles { color?: string; backgroundColor?: string; borderColor?: string; fontSize?: string; fontWeight?: string; textAlign?: TextAlign; padding?: string; listStyleType?: ListStyleType; custom?: CustomStyle[]; controlStyle?: ControlStyle; desktop: ResponsiveFieldStyles; tablet: ResponsiveFieldStyles; mobile: ResponsiveFieldStyles; }
interface ResponsiveGlobalStyles { gap?: number; buttonWidth?: string; buttonHeight?: string; buttonBackgroundColor?: string; buttonTextColor?: string; nextButtonWidth?: string; nextButtonHeight?: string; nextButtonBackgroundColor?: string; nextButtonTextColor?: string; prevButtonWidth?: string; prevButtonHeight?: string; prevButtonBackgroundColor?: string; prevButtonTextColor?: string; }
interface FormStyles { backgroundType: 'color' | 'image'; backgroundColor: string; backgroundImage: string; textColor: string; fieldBackgroundColor: string; fieldBorderColor: string; buttonBackgroundColor: string; buttonTextColor: string; buttonText: string; buttonPosition: 'left' | 'center' | 'right'; buttonWidth: string; buttonHeight: string; gap: number; nextButtonText: string; nextButtonBackgroundColor: string; nextButtonTextColor: string; nextButtonWidth: string; nextButtonHeight: string; prevButtonText: string; prevButtonBackgroundColor: string; prevButtonTextColor: string; prevButtonWidth: string; prevButtonHeight: string; formAlignment?: 'start' | 'center' | 'end'; desktop: ResponsiveGlobalStyles; tablet: ResponsiveGlobalStyles; mobile: ResponsiveGlobalStyles; }
interface LoaderSettings { type?: 'default' | 'dots' | 'spinner' | 'bar' | 'pulse' | 'custom'; url?: string; color?: string; }
type PageTrackerType = 'none' | 'numbers' | 'progress-bar' | 'both';
interface FormSettings { prefillFromAPI: boolean; prefillApiUrl: string; postOnSubmit: boolean; postApiUrl: string; loader?: LoaderSettings; submitSuccessMessage: string; submitErrorMessage: string; submitLoader?: LoaderSettings; enableThankYouPage: boolean; thankYouPageContent: FormField[]; pageTracker: PageTrackerType; pageTrackerColor: string; pageTrackerBgColor: string; }

interface FieldOption { label: string; value: string; }
interface FieldCondition { id: string; fieldId: string; operator: ConditionOperator; value: string; }
interface RequiredCondition { enabled: boolean; logic: ConditionLogic; conditions: FieldCondition[]; }
interface FormField { id: string; type: FieldType; label: string; width: FieldWidth; name?: string; fieldId?: string; placeholder?: string; value?: string; required?: boolean; requiredErrorMessage?: string; requiredConditions?: RequiredCondition; options?: FieldOption[]; layout?: 'vertical' | 'horizontal'; styles: FieldStyles; conditions?: FieldCondition[]; conditionLogic?: ConditionLogic; fields?: FormField[]; min?: number; max?: number; step?: number; maxRating?: number; src?: string; actionType?: 'link' | 'submit' | 'reset'; linkUrl?: string; linkTarget?: '_blank' | '_self'; }
interface FormPage { id: string; name: string; fields: FormField[]; styles: Partial<FormStyles>; }
interface ApiResponseForm { id: string; title: string; fields?: FormField[]; pages?: FormPage[]; styles: FormStyles; settings: FormSettings; }
interface Form { id: string; title: string; pages: FormPage[]; styles: FormStyles; settings: FormSettings; }

type FileState = { [fieldName: string]: FileList | null };

// ICON & HELPER COMPONENTS
const createIcon = (path: IconPathTuple[]): (({ displayName }: { displayName: string; }) => FC<IconProps>) => ({ displayName }: { displayName: string; }) => {
    const Component = React.forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 24, strokeWidth = 2, className, fill = 'none', ...rest }, ref) => React.createElement('svg', { ref, width: size, height: size, stroke: color, strokeWidth, className: ['lucide', `lucide-${displayName.toLowerCase()}`, className].filter(Boolean).join(' '), xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill, strokeLinecap: 'round', strokeLinejoin: 'round', ...rest }, path.map(([tag, attrs], i) => React.createElement(tag, { key: attrs.key || i, ...attrs }))));
    Component.displayName = `LucideIcon(${displayName})`;
    return Component;
};
const CheckCircleIcon = createIcon([['path', { d: "M22 11.08V12a10 10 0 1 1-5.93-9.14" }], ['polyline', { points: "22 4 12 14.01 9 11.01" }]])({ displayName: 'CheckCircle' });
const StarIcon = createIcon([['polygon', { points: "12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" }]])({ displayName: 'Star' });
const SignatureIcon = createIcon([['path', { d: "M22 10.5c0 .8-.7 1.5-1.5 1.5H15v5.5c0 .8-.7 1.5-1.5 1.5h-1c-.8 0-1.5-.7-1.5-1.5v-13C11 3.7 11.7 3 12.5 3h1C14.3 3 15 3.7 15 4.5V9h5.5c.8 0 1.5.7 1.5 1.5Z" }], ['path', { d: "M3 13.5c0 .8.7 1.5 1.5 1.5h1" }], ['path', { d: "M10 18H3.5c-.8 0-1.5-.7-1.5-1.5v-1c0-.8.7-1.5 1.5-1.5H9" }]])({ displayName: 'Signature' });
const CheckIcon = createIcon([['path', { d: "M20 6 9 17l-5-5" }]])({ displayName: 'Check' });
const toCamelCase = (str: string) => str.replace(/-./g, x => x[1].toUpperCase());

// DEFAULT STYLE & SETTINGS OBJECTS
const defaultFieldStyles: FieldStyles = { color: '#000000', backgroundColor: 'transparent', borderColor: '', fontSize: '16px', fontWeight: 'normal', textAlign: 'left', padding: '1rem', listStyleType: 'disc', custom: [], controlStyle: 'default', desktop: { width: '100%', fontSize: '16px', height: 'auto', display: 'block' }, tablet: { width: '100%', fontSize: '15px', height: 'auto', display: 'block' }, mobile: { width: '100%', fontSize: '14px', height: 'auto', display: 'block' } };
const defaultSettings: FormSettings = { prefillFromAPI: false, prefillApiUrl: '', postOnSubmit: false, postApiUrl: '', loader: { type: 'default' }, submitSuccessMessage: 'Form submitted successfully!', submitErrorMessage: 'There was an error submitting your form.', submitLoader: { type: 'default', color: '#FFFFFF' }, enableThankYouPage: false, thankYouPageContent: [{ id: `ty_heading_${Date.now()}`, type: 'heading', label: 'Thank You!', width: '100%', styles: { ...defaultFieldStyles, color: '#000000' } }, { id: `ty_paragraph_${Date.now() + 1}`, type: 'paragraph', label: 'Your submission has been received.', width: '100%', styles: { ...defaultFieldStyles, color: '#000000' } }], pageTracker: 'none', pageTrackerColor: '#4F46E5', pageTrackerBgColor: '#E5E7EB' };
const defaultStyles: FormStyles = { backgroundType: 'color', backgroundColor: '#FFFFFF', backgroundImage: '', textColor: '#000000', fieldBackgroundColor: 'transparent', fieldBorderColor: '#D1D5DB', buttonBackgroundColor: '#4F46E5', buttonTextColor: '#FFFFFF', buttonText: 'Submit', buttonPosition: 'left', buttonWidth: 'auto', buttonHeight: 'auto', gap: 16, nextButtonText: 'Next', nextButtonBackgroundColor: '#4F46E5', nextButtonTextColor: '#FFFFFF', nextButtonWidth: 'auto', nextButtonHeight: 'auto', prevButtonText: 'Back', prevButtonBackgroundColor: '#6B7280', prevButtonTextColor: '#FFFFFF', prevButtonWidth: 'auto', prevButtonHeight: 'auto', formAlignment: 'center', desktop: {}, tablet: {}, mobile: {} };

export default function PublicFormPage() {
    const params = useParams() || {};
    const [form, setForm] = useState<Form | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<{ [key: string]: any }>({});
    const [fileData, setFileData] = useState<FileState>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionStatus, setSubmissionStatus] = useState<'success' | 'error' | null>(null);
    const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
    const [generalError, setGeneralError] = useState<string | null>(null);
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [previewMode] = useState<PreviewMode>('desktop'); // Public view is always 'desktop'
    
    const fieldRefs = useRef<{ [key: string]: HTMLElement | null }>({});
    const formId = params.formId as string;

    const getAllFields = useCallback((fields: FormField[]): FormField[] => {
        let allFields: FormField[] = [];
        fields.forEach(field => {
            allFields.push(field);
            if (['section', 'name', 'address'].includes(field.type) && field.fields) {
                allFields = allFields.concat(getAllFields(field.fields));
            }
        });
        return allFields;
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
                    const data: ApiResponseForm = await res.json();
                    
                    const normalizedPages: FormPage[] = (data.pages && data.pages.length > 0)
                        ? data.pages.map((page: FormPage) => ({
                            ...page,
                            fields: page.fields ? page.fields.map((field: FormField) => ({
                                ...field,
                                requiredErrorMessage: field.requiredErrorMessage || '',
                                styles: { ...defaultFieldStyles, ...field.styles }
                            })) : [],
                            styles: { ...defaultStyles, ...page.styles }
                        }))
                        : [{ id: 'page_default', name: 'Default Page', fields: data.fields || [], styles: {} }];

                    const validatedForm: Form = {
                        id: data.id,
                        title: data.title,
                        pages: normalizedPages,
                        styles: { ...defaultStyles, ...data.styles },
                        settings: { ...defaultSettings, ...data.settings }
                    };
                    setForm(validatedForm);

                    const initialData: { [key: string]: any } = {};
                    validatedForm.pages.forEach(page => {
                        getAllFields(page.fields).forEach(field => {
                            if (field.name) {
                                initialData[field.name] = field.type === 'checkbox' ? [] : '';
                            }
                        });
                    });
                    setFormData(initialData);

                } else {
                    const errorData = await res.json();
                    setError(res.status === 404 ? "This form could not be found." : (errorData.error || 'Failed to load form'));
                }
            } catch (err) {
                setError("An unexpected error occurred while loading the form.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadForm();
    }, [formId, getAllFields]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if(fieldErrors[name]) {
            setFieldErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
        setGeneralError(null);

        if (type === 'checkbox') {
            const checkbox = e.target as HTMLInputElement;
            const currentValues = formData[name] as string[] || [];
            setFormData(prev => ({ ...prev, [name]: checkbox.checked ? [...currentValues, value] : currentValues.filter(v => v !== value) }));
        } else if (type === 'file') {
            const fileInput = e.target as HTMLInputElement;
            setFileData(prev => ({ ...prev, [name]: fileInput.files }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const evaluateConditions = useCallback((conditions: FieldCondition[] = [], logic: ConditionLogic = 'and'): boolean => {
        if (!form || conditions.length === 0) return true;
        const allFormFields = form.pages.flatMap(page => getAllFields(page.fields));

        const conditionChecks = conditions.map(cond => {
            const sourceField = allFormFields.find(f => f.id === cond.fieldId);
            if (!sourceField?.name) return logic === 'and';
            
            const valueToCompare = formData[sourceField.name];
            const conditionValue = cond.value;
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
        return logic === 'or' ? conditionChecks.some(check => check) : conditionChecks.every(check => check);
    }, [form, formData, getAllFields]);

    const isFieldRequired = useCallback((field: FormField): boolean => {
        if (field.requiredConditions?.enabled) {
            return evaluateConditions(field.requiredConditions.conditions, field.requiredConditions.logic);
        }
        return field.required || false;
    }, [evaluateConditions]);

    const validateCurrentPage = useCallback(() => {
        if (!form) return { hasErrors: false, firstErrorFieldName: null };

        const currentFields = form.pages[currentPageIndex].fields;
        const allVisibleFieldsOnCurrentPage = getAllFields(currentFields).filter(field => evaluateConditions(field.conditions, field.conditionLogic));
        
        const newErrors: { [key: string]: string } = {};
        let firstErrorFieldName: string | null = null;

        allVisibleFieldsOnCurrentPage.forEach(field => {
            if (isFieldRequired(field) && field.name) {
                const value = field.type === 'file' ? fileData[field.name] : formData[field.name];
                
                const isFieldEmpty = value === undefined || value === null || value === '' ||
                                     (Array.isArray(value) && value.length === 0) ||
                                     (value instanceof FileList && value.length === 0) ||
                                     (typeof value === 'number' && isNaN(value)); 

                if (isFieldEmpty) {
                    newErrors[field.name] = field.requiredErrorMessage || `${field.label} is required.`;
                    if (!firstErrorFieldName) {
                        firstErrorFieldName = field.name;
                    }
                }
            }
        });

        const hasErrors = Object.keys(newErrors).length > 0;
        setFieldErrors(newErrors);
        setGeneralError(hasErrors ? "Please fill all required fields." : null);

        return { hasErrors, firstErrorFieldName };
    }, [form, currentPageIndex, getAllFields, evaluateConditions, isFieldRequired, formData, fileData]);

    const handleNextPage = () => {
        const { hasErrors, firstErrorFieldName } = validateCurrentPage();
        if (hasErrors) {
            if (firstErrorFieldName && fieldRefs.current[firstErrorFieldName]) {
                fieldRefs.current[firstErrorFieldName]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }
        setCurrentPageIndex(prev => Math.min(form!.pages.length - 1, prev + 1));
    };

    const handlePreviousPage = () => {
        setCurrentPageIndex(prev => Math.max(0, prev - 1));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!form) return;
    
        const { hasErrors, firstErrorFieldName } = validateCurrentPage();
        if (hasErrors) {
            if (firstErrorFieldName && fieldRefs.current[firstErrorFieldName]) {
                fieldRefs.current[firstErrorFieldName]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }
    
        setIsSubmitting(true);
        setSubmissionStatus(null);
        setGeneralError(null);
    
        const submissionApiFormData = new FormData();
        submissionApiFormData.append('formDataJson', JSON.stringify(formData));
    
        Object.entries(fileData).forEach(([fieldName, files]) => {
            if (files) {
                for (let i = 0; i < files.length; i++) {
                    submissionApiFormData.append(fieldName, files[i]);
                }
            }
        });
    
        try {
            const res = await fetch(`/api/forms/submit/${formId}`, {
                method: 'POST',
                body: submissionApiFormData,
            });
    
            if (res.ok) {
                setSubmissionStatus('success');
                if (!form.settings.enableThankYouPage) {
                    alert(form.settings.submitSuccessMessage || "Form submitted successfully!");
                }
            } else {
                const errorData = await res.json();
                throw new Error(errorData.error || form.settings.submitErrorMessage || 'Submission failed');
            }
        } catch (err: any) {
            console.error(err);
            setSubmissionStatus('error');
            setGeneralError(err.message || form.settings.submitErrorMessage || "An unexpected error occurred.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderFieldElement = (field: FormField, effectiveFormStyles: FormStyles): JSX.Element | null => {
        const isVisible = evaluateConditions(field.conditions, field.conditionLogic);
        const responsiveFieldStyles = field.styles?.[previewMode] || {};
        
        if (!isVisible || responsiveFieldStyles.display === 'none') {
            return null;
        }
    
        const isRequired = isFieldRequired(field);
        const currentPageStyles = form!.pages[currentPageIndex]?.styles || {};
        const baseFieldStyles = field.styles || {};
        
        const customCssProps = (baseFieldStyles.custom || []).filter(style => style.name && style.name.trim() !== '').reduce((acc: any, style) => {
            if (style.name) acc[toCamelCase(style.name)] = style.value;
            return acc;
        }, {} as React.CSSProperties);
    
        const isErrored = field.name ? !!fieldErrors[field.name] : false;
    
        const combinedFieldStyle: React.CSSProperties = {
            color: baseFieldStyles.color || currentPageStyles.textColor || effectiveFormStyles.textColor,
            backgroundColor: baseFieldStyles.backgroundColor || currentPageStyles.fieldBackgroundColor || effectiveFormStyles.fieldBackgroundColor,
            borderColor: isErrored ? '#EF4444' : (baseFieldStyles.borderColor || currentPageStyles.fieldBorderColor || effectiveFormStyles.fieldBorderColor),
            fontSize: responsiveFieldStyles.fontSize || baseFieldStyles.fontSize,
            fontWeight: baseFieldStyles.fontWeight,
            textAlign: baseFieldStyles.textAlign,
            height: responsiveFieldStyles.height || 'auto',
            ...customCssProps,
        };
    
        const controlStyle = baseFieldStyles.controlStyle || 'default';
        const fieldLabel = <label htmlFor={field.id} className="block text-sm font-medium mb-2" style={{color: combinedFieldStyle.color}}>{field.label} {isRequired && <span className="text-red-400">*</span>}</label>;
        const errorDisplay = isErrored && field.name ? <div className="text-red-500 text-xs mt-1">{fieldErrors[field.name]}</div> : null;
        const baseInputClasses = "w-full border rounded-lg px-3 py-2 bg-transparent";
        const errorInputClasses = isErrored ? 'focus:ring-red-500 border-red-500' : 'focus:ring-indigo-500';
    
        let fieldContent: JSX.Element | null;
    
        switch (field.type) {
            case 'heading': fieldContent = <h2 className="text-2xl break-words p-2" style={combinedFieldStyle}>{field.label}</h2>; break;
            case 'paragraph': fieldContent = <p className="break-words p-2" style={combinedFieldStyle}>{field.label}</p>; break;
            case 'hr': fieldContent = <hr style={{borderColor: combinedFieldStyle.borderColor}} className="my-4"/>; break;
            case 'ordered-list': fieldContent = <div>{fieldLabel}<ol className="list-inside pl-4" style={{...combinedFieldStyle, listStyleType: baseFieldStyles.listStyleType}}>{field.options?.map((opt, i) => <li key={i}>{opt.label}</li>)}</ol></div>; break;
            case 'unordered-list': fieldContent = <div>{fieldLabel}<ul className="list-inside pl-4" style={{...combinedFieldStyle, listStyleType: baseFieldStyles.listStyleType}}>{field.options?.map((opt, i) => <li key={i}>{opt.label}</li>)}</ul></div>; break;
            case 'text': case 'email': case 'date': case 'password': case 'number': case 'tel': case 'url': case 'time': case 'month': case 'week': case 'color':
                fieldContent = <div>{fieldLabel}<input type={field.type} name={field.name} id={field.id} value={formData[field.name || ''] || ''} placeholder={field.placeholder} required={isRequired} onChange={handleInputChange} min={field.min} max={field.max} step={field.step} style={combinedFieldStyle} className={`${baseInputClasses} ${errorInputClasses}`} />{errorDisplay}</div>; break;
            case 'range': fieldContent = <div>{fieldLabel}<input type="range" name={field.name} id={field.id} min={field.min} max={field.max} step={field.step} value={formData[field.name || ''] || (field.min || 0)} onChange={handleInputChange} style={combinedFieldStyle} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" />{errorDisplay}</div>; break;
            case 'textarea': fieldContent = <div>{fieldLabel}<textarea name={field.name} id={field.id} value={formData[field.name || ''] || ''} placeholder={field.placeholder} required={isRequired} onChange={handleInputChange} style={combinedFieldStyle} className={`${baseInputClasses} ${errorInputClasses}`}/>{errorDisplay}</div>; break;
            case 'select': fieldContent = <div>{fieldLabel}<select name={field.name} id={field.id} value={formData[field.name || ''] || ''} required={isRequired} onChange={handleInputChange} style={combinedFieldStyle} className={`${baseInputClasses} ${errorInputClasses}`}><option value="">{field.placeholder || "Select an option"}</option>{field.options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select>{errorDisplay}</div>; break;
            case 'checkbox':
                fieldContent = <div>{fieldLabel}<div className={`flex gap-4 ${field.layout === 'horizontal' ? 'flex-row flex-wrap' : 'flex-col'}`}>{field.options?.map((opt, i) => <div key={i} className="flex items-center gap-2">
                    {controlStyle === 'switch' ? (<label htmlFor={`${field.id}_${i}`} className="relative inline-flex items-center cursor-pointer"><input type="checkbox" name={field.name} id={`${field.id}_${i}`} value={opt.value} checked={Array.isArray(formData[field.name || '']) && formData[field.name || ''].includes(opt.value)} onChange={handleInputChange} required={isRequired && (formData[field.name || '']?.length === 0)} className="sr-only peer" /><div className={`w-11 h-6 rounded-full peer peer-focus:ring-4 ${isErrored ? 'peer-focus:ring-red-800' : 'peer-focus:ring-blue-800'} peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${Array.isArray(formData[field.name || '']) && formData[field.name || ''].includes(opt.value) ? 'peer-checked:bg-indigo-600' : (isErrored ? 'bg-red-500' : 'bg-gray-700')}`}></div></label>
                    ) : controlStyle === 'filled' ? (<label htmlFor={`${field.id}_${i}`} className="flex items-center cursor-pointer"><div className={`w-5 h-5 border-2 rounded flex items-center justify-center ${Array.isArray(formData[field.name || '']) && formData[field.name || ''].includes(opt.value) ? 'bg-indigo-600 border-indigo-600' : (isErrored ? 'bg-red-500 border-red-500' : 'bg-gray-700 border-gray-500')}`}><CheckIcon size={14} className={`${Array.isArray(formData[field.name || '']) && formData[field.name || ''].includes(opt.value) ? 'text-white' : 'text-transparent'}`} /></div><input type="checkbox" name={field.name} id={`${field.id}_${i}`} value={opt.value} checked={Array.isArray(formData[field.name || '']) && formData[field.name || ''].includes(opt.value)} onChange={handleInputChange} required={isRequired && (formData[field.name || '']?.length === 0)} className="sr-only" /></label>
                    ) : (<input type="checkbox" name={field.name} id={`${field.id}_${i}`} value={opt.value} checked={Array.isArray(formData[field.name || '']) && formData[field.name || ''].includes(opt.value)} onChange={handleInputChange} required={isRequired && (formData[field.name || '']?.length === 0)} className={`h-4 w-4 rounded bg-gray-700 text-indigo-600 focus:ring-indigo-500 ${isErrored ? 'border-red-500' : 'border-gray-600'}`} />
                    )}
                    <label htmlFor={`${field.id}_${i}`} style={{color: combinedFieldStyle.color}} className={`${controlStyle === 'line-through' && Array.isArray(formData[field.name || '']) && formData[field.name || ''].includes(opt.value) ? 'line-through' : ''}`}>{opt.label}</label>
                </div>)}{errorDisplay}</div></div>; break;
            case 'radio':
                fieldContent = <div>{fieldLabel}<div className={`flex gap-4 ${field.layout === 'horizontal' ? 'flex-row flex-wrap' : 'flex-col'}`}>{field.options?.map((opt, i) => <div key={i} className="flex items-center gap-2">
                    {controlStyle === 'filled' ? (<label htmlFor={`${field.id}_${i}`} className="flex items-center cursor-pointer"><div className={`w-5 h-5 border-2 rounded-full flex items-center justify-center ${isErrored ? 'border-red-500' : 'border-gray-500'} ${formData[field.name || ''] === opt.value ? 'bg-indigo-600' : 'bg-gray-700'}`}>{formData[field.name || ''] === opt.value && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}</div><input type="radio" name={field.name} id={`${field.id}_${i}`} value={opt.value} checked={formData[field.name || ''] === opt.value} onChange={handleInputChange} required={isRequired} className="sr-only" /></label>
                    ) : (<input type="radio" name={field.name} id={`${field.id}_${i}`} value={opt.value} checked={formData[field.name || ''] === opt.value} onChange={handleInputChange} required={isRequired} className={`h-4 w-4 border-gray-600 bg-gray-700 text-indigo-600 focus:ring-indigo-500 ${isErrored ? 'border-red-500' : 'border-gray-600'}`} />)}
                    <label htmlFor={`${field.id}_${i}`} style={{color: combinedFieldStyle.color}}>{opt.label}</label>
                </div>)}{errorDisplay}</div></div>; break;
            case 'file': fieldContent = <div>{fieldLabel}<input type="file" name={field.name} id={field.id} required={isRequired} onChange={handleInputChange} style={{...combinedFieldStyle, backgroundColor: 'transparent'}} className={`w-full border rounded-lg px-3 py-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200 ${errorInputClasses}`} />{errorDisplay}</div>; break;
            case 'signature': fieldContent = <div>{fieldLabel}<div className="w-full h-32 bg-gray-100 border-2 border-dashed rounded-lg flex items-center justify-center" style={{borderColor: isErrored ? '#EF4444' : (baseFieldStyles.borderColor || currentPageStyles.fieldBorderColor || effectiveFormStyles.fieldBorderColor) }}><SignatureIcon className="text-gray-500" size={40} /></div><p className="text-xs text-gray-500 mt-1">Signature pad is for demonstration only.</p>{errorDisplay}</div>; break;
            case 'rating': fieldContent = <div>{fieldLabel}<div className="flex items-center">{[...Array(field.maxRating || 5)].map((_, i) => <StarIcon key={i} size={24} className="cursor-pointer" fill={(i + 1) <= (formData[field.name || ''] || 0) ? 'currentColor' : 'none'} color={combinedFieldStyle.color} onClick={() => handleInputChange({ target: { name: field.name || '', value: String(i + 1), type: 'radio' } } as React.ChangeEvent<HTMLInputElement>)} />)}</div>{errorDisplay}</div>; break;
            case 'image': fieldContent = <img src={field.src || 'https://via.placeholder.com/400x200'} alt={field.label} style={{...combinedFieldStyle, width: '100%', height: 'auto', objectFit: 'cover'}}/>; break;
            case 'name': case 'address': case 'section':
                fieldContent = <div className="w-full rounded-lg border-2" style={{...combinedFieldStyle, padding: baseFieldStyles.padding, borderColor: isErrored ? '#EF4444' : (baseFieldStyles.borderColor || currentPageStyles.fieldBorderColor || effectiveFormStyles.fieldBorderColor) }}><h3 className="text-xl font-semibold mb-4" style={{color: combinedFieldStyle.color}}>{field.label}</h3><div className="flex flex-wrap" style={{rowGap: `${effectiveFormStyles.gap}px`, columnGap: `${effectiveFormStyles.gap}px`}}>{field.fields?.map(subField => renderFieldElement(subField, effectiveFormStyles))}</div>{errorDisplay}</div>; break;
            default: fieldContent = null;
        }
        
        const responsiveWidth = responsiveFieldStyles.width || field.width;
        const currentGap = effectiveFormStyles.gap;
        const calculatedWidth = responsiveWidth === '100%' ? '100%' : `calc(${responsiveWidth} - ${currentGap}px)`;

        return <div key={field.id} ref={el => { if(field.name) fieldRefs.current[field.name] = el; }} style={{ width: calculatedWidth }}>{fieldContent}</div>;
    };


    if (loading) return <QuickFormLoader />;
    if (error) return <div className="flex h-screen w-full items-center justify-center text-red-500 bg-gray-100 p-4 text-center"><p>{error}</p></div>;
    if (!form) return <div className="flex h-screen w-full items-center justify-center bg-gray-100"><p>Form not found or is unavailable.</p></div>;

    const currentPageData = form.pages[currentPageIndex];
    const isFirstPage = currentPageIndex === 0;
    const isLastPage = currentPageIndex === form.pages.length - 1;
    const isMultiPageForm = form.pages.length > 1;
    
    // Determine the correct styles for the current view
    const responsiveGlobalStyles = form.styles[previewMode] || {};
    const pageSpecificStyles = currentPageData.styles || {};
    const effectiveFormStyles: FormStyles = {
        ...form.styles,
        ...pageSpecificStyles,
        ...responsiveGlobalStyles,
        gap: responsiveGlobalStyles.gap ?? pageSpecificStyles.gap ?? form.styles.gap,
    };

    const submitButtonStyle: React.CSSProperties = { backgroundColor: effectiveFormStyles.buttonBackgroundColor, color: effectiveFormStyles.buttonTextColor, width: effectiveFormStyles.buttonWidth, height: effectiveFormStyles.buttonHeight };
    const nextButtonStyle: React.CSSProperties = { backgroundColor: effectiveFormStyles.nextButtonBackgroundColor, color: effectiveFormStyles.nextButtonTextColor, width: effectiveFormStyles.nextButtonWidth, height: effectiveFormStyles.nextButtonHeight };
    const prevButtonStyle: React.CSSProperties = { backgroundColor: effectiveFormStyles.prevButtonBackgroundColor, color: effectiveFormStyles.prevButtonTextColor, width: effectiveFormStyles.prevButtonWidth, height: effectiveFormStyles.prevButtonHeight };
    
    const renderPageTracker = () => {
        if (!isMultiPageForm || form.settings.pageTracker === 'none') return null;
        const totalPages = form.pages.length;
        const currentPageNum = currentPageIndex + 1;
        const progress = (currentPageNum / totalPages) * 100;
        return (
            <div className="w-full mb-4 flex flex-col items-center gap-2">
                {(form.settings.pageTracker === 'numbers' || form.settings.pageTracker === 'both') && (<p className="text-sm" style={{ color: form.settings.pageTrackerColor }}>Page {currentPageNum} of {totalPages}</p>)}
                {(form.settings.pageTracker === 'progress-bar' || form.settings.pageTracker === 'both') && (<div className="w-full h-2 rounded-full" style={{ backgroundColor: form.settings.pageTrackerBgColor }}><div className="h-full rounded-full transition-all duration-300" style={{ width: `${progress}%`, backgroundColor: form.settings.pageTrackerColor }}></div></div>)}
            </div>
        );
    };

    const showThankYouPage = form.settings.enableThankYouPage && submissionStatus === 'success';

    return (
        <div className="min-h-screen flex items-center justify-center p-4" style={effectiveFormStyles.backgroundType === 'image' ? { backgroundImage: `url(${effectiveFormStyles.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center', color: effectiveFormStyles.textColor } : { backgroundColor: effectiveFormStyles.backgroundColor, color: effectiveFormStyles.textColor }}>
            <div className="w-full max-w-4xl">
                <div className="bg-white/20 p-6 sm:p-8 rounded-xl shadow-2xl backdrop-blur-lg border border-white/30">
                    <h1 className="text-3xl font-bold mb-8 text-center" style={{ color: effectiveFormStyles.textColor }}>{form.title}</h1>
                    
                    {!showThankYouPage && renderPageTracker()}
                    {generalError && (<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert"><strong className="font-bold">Error!</strong><span className="block sm:inline"> {generalError}</span></div>)}
                    {submissionStatus === 'error' && !generalError && (<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert"><strong className="font-bold">Error!</strong><span className="block sm:inline"> {form.settings.submitErrorMessage || "Submission failed. Please try again."}</span></div>)}

                    {showThankYouPage ? (
                        <div className="text-center">
                             {form.settings.thankYouPageContent?.map(field => renderFieldElement(field, effectiveFormStyles))}
                             {!form.settings.thankYouPageContent?.some(f => f.type === 'button') && (
                                 <button type="button" onClick={() => { setCurrentPageIndex(0); setSubmissionStatus(null); setFormData({}); setFileData({}); }} style={{ ...submitButtonStyle, marginTop: '2rem' }} className="font-bold py-2 px-6 rounded-lg cursor-pointer shadow-lg hover:opacity-90 transition-opacity">
                                    Submit Another Response
                                </button>
                             )}
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="flex flex-wrap" style={{ rowGap: `${effectiveFormStyles.gap}px`, columnGap: `-${effectiveFormStyles.gap}px` }}>
                                {currentPageData.fields.map(field => renderFieldElement(field, effectiveFormStyles))}
                            </div>
                            
                            <div className="w-full mt-8 flex" style={{ justifyContent: isMultiPageForm ? 'space-between' : effectiveFormStyles.buttonPosition }}>
                                {isMultiPageForm && !isFirstPage && (<button type="button" onClick={handlePreviousPage} style={prevButtonStyle} className="font-bold py-2 px-6 rounded-lg cursor-pointer shadow-lg hover:opacity-90 transition-opacity">{effectiveFormStyles.prevButtonText}</button>)}
                                
                                <div className={`${isMultiPageForm && isFirstPage ? 'ml-auto' : ''}`}>
                                    {isLastPage || !isMultiPageForm ? (
                                        <button type="submit" disabled={isSubmitting} style={submitButtonStyle} className="font-bold py-2 px-6 rounded-lg cursor-pointer shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-wait">{isSubmitting ? 'Submitting...' : effectiveFormStyles.buttonText}</button>
                                    ) : (
                                        <button type="button" onClick={handleNextPage} style={nextButtonStyle} className="font-bold py-2 px-6 rounded-lg cursor-pointer shadow-lg hover:opacity-90 transition-opacity">{effectiveFormStyles.nextButtonText}</button>
                                    )}
                                </div>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}