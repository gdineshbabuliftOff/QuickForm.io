"use client";

import React, { useState, useEffect, FC, JSX } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useParams, useRouter } from 'next/navigation';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import Link from 'next/link';
import QuickFormLoader from '../loaders/quickFormloader';

// Types and Interfaces
interface IconProps { color?: string; size?: number | string; strokeWidth?: number | string; className?: string; }
type IconPathTuple = [keyof JSX.IntrinsicElements, { [key: string]: any }];
type FieldType = 'text' | 'email' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'heading' | 'paragraph' | 'date' | 'file' | 'signature';
type FieldWidth = '100%' | '50%' | '33.33%';
type PreviewMode = 'desktop' | 'tablet' | 'mobile';
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

// Icons
const TypeIcon = createIcon([['path', { d: "M4 7V4h16v3" }], ['path', { d: "M9 20h6" }], ['path', { d: "M12 4v16" }]])({ displayName: 'Type' });
const MailIcon = createIcon([['rect', { width: "20", height: "16", x: "2", y: "4", rx: "2" }], ['path', { d: "m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" }]])({ displayName: 'Mail' });
const TextareaIcon = createIcon([['path', { d: "M3 12h18" }], ['path', { d: "M3 6h18" }], ['path', { d: "M3 18h18" }]])({ displayName: 'Textarea' });
const CheckSquareIcon = createIcon([['rect', { width: "18", height: "18", x: "3", y: "3", rx: "2" }], ['path', { d: "m9 12 2 2 4-4" }]])({ displayName: 'CheckSquare' });
const ChevronDownIcon = createIcon([['path', { d: "m6 9 6 6 6-6" }]])({ displayName: 'ChevronDown' });
const GripVerticalIcon = createIcon([['circle', { cx: "9", cy: "12", r: "1" }], ['circle', { cx: "9", cy: "5", r: "1" }], ['circle', { cx: "9", cy: "19", r: "1" }], ['circle', { cx: "15", cy: "12", r: "1" }], ['circle', { cx: "15", cy: "5", r: "1" }], ['circle', { cx: "15", cy: "19", r: "1" }]])({ displayName: 'GripVertical' });
const Trash2Icon = createIcon([['path', { d: 'M3 6h18' }], ['path', { d: 'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' }], ['line', { x1: '10', y1: '11', x2: '10', y2: '17' }], ['line', { x1: '14', y1: '11', x2: '14', y2: '17' }]])({ displayName: 'Trash2' });
const SaveIcon = createIcon([['path', { d: "M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" }], ['polyline', { points: "17 21 17 13 7 13 7 21" }], ['polyline', { points: "7 3 7 8 15 8" }]])({ displayName: 'Save' });
const EyeIcon = createIcon([['path', { d: 'M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z' }], ['circle', { cx: '12', cy: '12', r: '3' }]])({ displayName: 'Eye' });
const ChevronLeftIcon = createIcon([['path', { d: 'm15 18-6-6 6-6' }]])({ displayName: 'ChevronLeft' });
const Heading1Icon = createIcon([['path', { d: "M4 12h8" }], ['path', { d: "M4 18V6" }], ['path', { d: "M12 18V6" }], ['path', { d: "m21 18-4-4" }], ['path', { d: "M17 18h4" }], ['path', { d: "M17 14v-3" }]])({ displayName: 'Heading1' });
const PilcrowIcon = createIcon([['path', { d: "M13 4v16" }], ['path', { d: "M17 4v16" }], ['path', { d: "M19 4H9.5a4.5 4.5 0 0 0 0 9H13" }]])({ displayName: 'Pilcrow' });
const RadioTowerIcon = createIcon([['path', { d: "M4.2 10.2C3.1 8.3 4.1 6 6 5.3l6-3.5c2-1.2 4.5.2 5.2 2.2l3.5 10c.7 2-1.2 4.5-3.2 5.2l-6 3.5c-2 1.2-4.5-.2-5.2-2.2l-3.5-10Z" }], ['path', { d: "M12 12h.01" }]])({ displayName: 'RadioTower' });
const CalendarIcon = createIcon([['rect', { width: "18", height: "18", x: "3", y: "4", rx: "2", ry: "2" }], ['line', { x1: "16", y1: "2", x2: "16", y2: "6" }], ['line', { x1: "8", y1: "2", x2: "8", y2: "6" }], ['line', { x1: "3", y1: "10", x2: "21", y2: "10" }]])({ displayName: 'Calendar' });
const FileUpIcon = createIcon([['path', { d: "M21.42 12.24a.5.5 0 0 0-.01-1.05l-1.63-.25a.5.5 0 0 1-.44-.44l-.25-1.63a.5.5 0 0 0-1.05-.01l-.25 1.63a.5.5 0 0 1-.44.44l-1.63.25a.5.5 0 0 0-.01 1.05l1.63.25a.5.5 0 0 1 .44.44l.25 1.63a.5.5 0 0 0 1.05.01l.25-1.63a.5.5 0 0 1 .44-.44Z" }], ['path', { d: "M17 22v-2.17a2 2 0 0 0-1-1.73l-1.6-1a1 1 0 0 0-1.15.22l-1.3 2.6a1 1 0 0 1-1.9 0l-1.3-2.6a1 1 0 0 0-1.15-.22l-1.6 1A2 2 0 0 0 3 19.83V22" }], ['path', { d: "M16 16h-3a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1h3" }]])({ displayName: 'FileUp' });
const SignatureIcon = createIcon([['path', { d: "M22 10.5c0 .8-.7 1.5-1.5 1.5H15v5.5c0 .8-.7 1.5-1.5 1.5h-1c-.8 0-1.5-.7-1.5-1.5v-13C11 3.7 11.7 3 12.5 3h1C14.3 3 15 3.7 15 4.5V9h5.5c.8 0 1.5.7 1.5 1.5Z" }], ['path', { d: "M3 13.5c0 .8.7 1.5 1.5 1.5h1" }], ['path', { d: "M10 18H3.5c-.8 0-1.5-.7-1.5-1.5v-1c0-.8.7-1.5 1.5-1.5H9" }]])({ displayName: 'Signature' });
const PlusIcon = createIcon([['path', { d: "M5 12h14" }], ['path', { d: "M12 5v14" }]])({ displayName: 'Plus' });
const MonitorIcon = createIcon([['rect', { width: "20", height: "14", x: "2", y: "3", rx: "2" }], ['line', { x1: "8", y1: "21", x2: "16", y2: "21" }], ['line', { x1: "12", y1: "17", x2: "12", y2: "21" }]])({ displayName: 'Monitor' });
const TabletIcon = createIcon([['rect', { width: "16", height: "20", x: "4", y: "2", rx: "2", ry: "2" }], ['line', { x1: "12", y1: "18", x2: "12.01", y2: "18" }]])({ displayName: 'Tablet' });
const SmartphoneIcon = createIcon([['rect', { width: "14", height: "20", x: "5", y: "2", rx: "2", ry: "2" }], ['path', { d: "M12 18h.01" }]])({ displayName: 'Smartphone' });
const AlignLeftIcon = createIcon([['line',{x1:"21",x2:"3",y1:"6",y2:"6"}],['line',{x1:"15",x2:"3",y1:"12",y2:"12"}],['line',{x1:"17",x2:"3",y1:"18",y2:"18"}]])({displayName: 'AlignLeft'});
const AlignCenterIcon = createIcon([['line',{x1:"21",x2:"3",y1:"6",y2:"6"}],['line',{x1:"17",x2:"7",y1:"12",y2:"12"}],['line',{x1:"19",x2:"5",y1:"18",y2:"18"}]])({displayName: 'AlignCenter'});
const AlignRightIcon = createIcon([['line',{x1:"21",x2:"3",y1:"6",y2:"6"}],['line',{x1:"21",x2:"9",y1:"12",y2:"12"}],['line',{x1:"21",x2:"7",y1:"18",y2:"18"}]])({displayName: 'AlignRight'});

// Constants
const fieldTypes: { type: FieldType; label: string; icon: FC<IconProps> }[] = [
    { type: 'heading', label: 'Heading', icon: Heading1Icon },
    { type: 'paragraph', label: 'Paragraph', icon: PilcrowIcon },
    { type: 'text', label: 'Text Input', icon: TypeIcon },
    { type: 'email', label: 'Email', icon: MailIcon },
    { type: 'textarea', label: 'Text Area', icon: TextareaIcon },
    { type: 'select', label: 'Dropdown', icon: ChevronDownIcon },
    { type: 'checkbox', label: 'Checkbox', icon: CheckSquareIcon },
    { type: 'radio', label: 'Radio Group', icon: RadioTowerIcon },
    { type: 'date', label: 'Date Picker', icon: CalendarIcon },
    { type: 'file', label: 'File Upload', icon: FileUpIcon },
    { type: 'signature', label: 'Signature', icon: SignatureIcon },
];

const defaultStyles: FormStyles = {
    backgroundType: 'color', backgroundColor: '#111827', backgroundImage: '', textColor: '#F3F4F6',
    fieldBackgroundColor: '#1F2937', fieldBorderColor: '#4B5563', buttonBackgroundColor: '#4F46E5',
    buttonTextColor: '#FFFFFF', buttonText: 'Submit', buttonPosition: 'left', gap: 16,
    buttonWidth: 'auto', buttonHeight: 'auto',
};

const defaultSettings: FormSettings = {
    prefillFromAPI: false, prefillApiUrl: '', postOnSubmit: false, postApiUrl: ''
};

const defaultFieldStyles: FieldStyles = {
    color: '',
    backgroundColor: '',
    borderColor: '',
    fontSize: '',
    fontWeight: '',
    textAlign: 'left',
    custom: [],
    desktop: { width: '100%' },
    tablet: { width: '100%' },
    mobile: { width: '100%' },
};

// Child Components
const Header: FC<{
    formTitle: string;
    onFormTitleChange: (title: string) => void;
    previewMode: PreviewMode;
    onPreviewModeChange: (mode: PreviewMode) => void;
    isPreviewReady: boolean;
    onSave: () => void;
    saving: boolean;
    formId: string;
}> = ({ formTitle, onFormTitleChange, previewMode, onPreviewModeChange, isPreviewReady, onSave, saving, formId }) => (
    <header className="flex items-center justify-between p-4 border-b border-white/10 bg-gray-900/70 backdrop-blur-lg sticky top-0 z-20">
        <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 rounded-full hover:bg-gray-700/80 transition-colors"><ChevronLeftIcon size={20} /></Link>
            <input type="text" value={formTitle} onChange={e => onFormTitleChange(e.target.value)} className="text-xl font-bold text-white bg-transparent focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded-md px-2" />
        </div>
        <div className="flex items-center gap-2 bg-gray-800/60 p-1 rounded-lg">
            <button onClick={() => onPreviewModeChange('desktop')} className={`p-2 rounded-md ${previewMode === 'desktop' ? 'bg-indigo-600' : 'hover:bg-gray-700'}`}><MonitorIcon size={20}/></button>
            <button onClick={() => onPreviewModeChange('tablet')} className={`p-2 rounded-md ${previewMode === 'tablet' ? 'bg-indigo-600' : 'hover:bg-gray-700'}`}><TabletIcon size={20}/></button>
            <button onClick={() => onPreviewModeChange('mobile')} className={`p-2 rounded-md ${previewMode === 'mobile' ? 'bg-indigo-600' : 'hover:bg-gray-700'}`}><SmartphoneIcon size={20}/></button>
        </div>
        <div className="flex items-center gap-3">
            <Link href={`/preview/${formId}`} target="_blank" className={`flex items-center gap-2 py-2 px-4 rounded-lg transition-colors ${isPreviewReady ? 'hover:bg-gray-700/80' : 'opacity-50 cursor-not-allowed'}`} onClick={(e) => !isPreviewReady && e.preventDefault()}>
                <EyeIcon size={18} /> Preview
            </Link>
            <button onClick={onSave} disabled={saving} className="flex items-center gap-2 py-2 px-4 bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors disabled:bg-indigo-400"><SaveIcon size={18} /> {saving ? 'Saving...' : 'Save Form'}</button>
        </div>
    </header>
);

const FieldPalette: FC<{ onAddField: (type: FieldType) => void }> = ({ onAddField }) => (
    <aside className="w-64 bg-gray-900/70 backdrop-blur-lg border-r border-white/10 p-6 flex flex-col">
        <h2 className="text-xl font-bold text-white mb-6">Form Fields</h2>
        <div className="space-y-3">
            {fieldTypes.map(ft => (<button key={ft.type} onClick={() => onAddField(ft.type)} className="w-full flex items-center gap-3 p-3 bg-gray-800/60 hover:bg-indigo-600/30 rounded-lg transition-colors"><ft.icon className="h-5 w-5 text-indigo-400" /><span>{ft.label}</span></button>))}
        </div>
    </aside>
);

const Canvas: FC<{
    form: Form;
    previewMode: PreviewMode;
    selectedField: FormField | null;
    onFieldSelect: (field: FormField) => void;
    onDragEnd: (result: DropResult) => void;
    onFieldDelete: (id: string) => void;
    isBrowser: boolean;
}> = ({ form, previewMode, selectedField, onFieldSelect, onDragEnd, onFieldDelete, isBrowser }) => {
    const previewWidths = { desktop: '100%', tablet: '768px', mobile: '375px' };

    const toCamelCase = (str: string) => str.replace(/-./g, x => x[1].toUpperCase());

    const renderField = (field: FormField) => {
        const responsiveStyles = field.styles?.[previewMode] || {};
        const baseStyles = field.styles || {};
        
        const customStyles = baseStyles.custom?.reduce((acc, style) => {
            if (style.name) {
                acc[toCamelCase(style.name)] = style.value;
            }
            return acc;
        }, {} as { [key: string]: string }) || {};

        const fieldStyles: React.CSSProperties = {
            ...customStyles,
            color: baseStyles.color || form.styles.textColor,
            borderColor: baseStyles.borderColor || form.styles.fieldBorderColor,
            fontSize: responsiveStyles.fontSize || baseStyles.fontSize,
            fontWeight: baseStyles.fontWeight,
            textAlign: baseStyles.textAlign,
        };

        if (field.type === 'heading' || field.type === 'paragraph') {
            fieldStyles.backgroundColor = baseStyles.backgroundColor || 'transparent';
        } else {
            fieldStyles.backgroundColor = baseStyles.backgroundColor || form.styles.fieldBackgroundColor;
        }


        switch(field.type) {
            case 'heading': return <h2 className="text-2xl break-words p-2" style={fieldStyles}>{field.label}</h2>;
            case 'paragraph': return <p className="break-words p-2" style={fieldStyles}>{field.label}</p>;
            case 'text':
            case 'email':
            case 'date': return <input type={field.type} placeholder={field.placeholder} style={fieldStyles} className="w-full border rounded-lg px-3 py-2 bg-transparent" readOnly />;
            case 'textarea': return <textarea placeholder={field.placeholder} style={fieldStyles} className="w-full border rounded-lg px-3 py-2 bg-transparent" readOnly />;
            case 'file': return <input type="file" style={{...fieldStyles, backgroundColor: 'transparent'}} className="w-full border rounded-lg px-3 py-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200" readOnly />;
            case 'select': return <select style={fieldStyles} className="w-full border rounded-lg px-3 py-2 bg-transparent"><option>{field.placeholder || "Select an option"}</option></select>;
            case 'checkbox':
            case 'radio': return <div className={`flex gap-4 ${field.layout === 'horizontal' ? 'flex-row flex-wrap' : 'flex-col'}`}>{field.options?.map((opt, i) => <div key={i} className="flex items-center gap-2"><input type={field.type} name={field.name} value={opt.value} readOnly /> <span style={{color: fieldStyles.color}}>{opt.label}</span></div>)}</div>;
            case 'signature': return <div className="w-full h-32 bg-gray-800/50 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center"><SignatureIcon className="text-gray-500" size={40}/></div>;
            default: return null;
        }
    };

    return (
        <div className="flex-1 overflow-y-auto p-8" style={form.styles.backgroundType === 'image' ? { backgroundImage: `url(${form.styles.backgroundImage})`, backgroundSize: 'cover' } : { backgroundColor: form.styles.backgroundColor, color: form.styles.textColor }}>
            <div className="mx-auto transition-all duration-300" style={{maxWidth: previewWidths[previewMode]}}>
                {isBrowser && (
                    <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId="form-canvas">
                            {(provided) => (
                                <div {...provided.droppableProps} ref={provided.innerRef} className={`flex flex-wrap ${form.fields.length === 0 ? 'min-h-[400px]' : ''}`} style={{rowGap: `${form.styles.gap}px`, columnGap: `${form.styles.gap}px`}}>
                                    {form.fields.length === 0 && (
                                        <div className="w-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-600 rounded-xl text-center">
                                            <p className="text-gray-400">Drag and drop a field here to start building your form.</p>
                                        </div>
                                    )}
                                    {form.fields.filter(field => field && field.id).map((field, index) => (
                                        <Draggable key={field.id} draggableId={field.id} index={index}>
                                            {(provided) => (
                                                <div 
                                                    ref={provided.innerRef} 
                                                    {...provided.draggableProps}
                                                    style={{ width: `calc(${field.styles?.[previewMode]?.width || field.width} - ${field.width === '100%' ? 0 : form.styles.gap}px)`, ...provided.draggableProps.style }}
                                                    onClick={() => onFieldSelect(field)} 
                                                    className={`p-1 rounded-lg border-2 transition-all cursor-pointer ${selectedField?.id === field.id ? 'border-indigo-500 bg-black/20' : 'border-transparent hover:border-indigo-600/50'}`}
                                                >
                                                    <div className="flex items-start">
                                                        <div {...provided.dragHandleProps} className="p-2 text-gray-500 hover:text-white cursor-grab"><GripVerticalIcon size={20} /></div>
                                                        <div className="flex-1 break-words">
                                                            {['text', 'email', 'textarea', 'select', 'date', 'file', 'checkbox', 'radio', 'signature'].includes(field.type) && <label className="block text-sm font-medium mb-2 pl-2" style={{color: field.styles?.color || form.styles.textColor}}>{field.label} {field.required && <span className="text-red-400">*</span>}</label>}
                                                            {renderField(field)}
                                                        </div>
                                                        <button onClick={(e) => { e.stopPropagation(); onFieldDelete(field.id); }} className="p-2 text-gray-500 hover:text-red-400"><Trash2Icon size={18} /></button>
                                                    </div>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                    {form.fields.length > 0 && <div className="w-full mt-4" style={{textAlign: form.styles.buttonPosition}}><button type="submit" style={{backgroundColor: form.styles.buttonBackgroundColor, color: form.styles.buttonTextColor, width: form.styles.buttonWidth, height: form.styles.buttonHeight}} className="font-bold py-2 px-4 rounded-lg">{form.styles.buttonText}</button></div>}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                )}
            </div>
        </div>
    );
};

const PropertiesPanel: FC<{
    selectedField: FormField | null;
    form: Form;
    previewMode: PreviewMode;
    onUpdateField: (id: string, newProps: Partial<FormField>) => void;
    onUpdateFieldResponsiveStyle: (id: string, newStyles: Partial<ResponsiveStyles>, device: PreviewMode) => void;
    onUpdateFieldBaseStyle: (id: string, newStyles: Partial<Omit<FieldStyles, 'desktop' | 'tablet' | 'mobile'>>) => void;
    onUpdateOption: (fieldId: string, optionIndex: number, newOption: Partial<FieldOption>) => void;
    onAddOption: (fieldId: string) => void;
    onRemoveOption: (fieldId: string, optionIndex: number) => void;
    onUpdateForm: (newProps: Partial<Form>) => void;
}> = (props) => {
    const { selectedField, form, onUpdateField } = props;
    const [activeFieldTab, setActiveFieldTab] = useState<'properties' | 'style' | 'logic'>('properties');
    const [activeGlobalTab, setActiveGlobalTab] = useState<'style' | 'settings'>('style');

    const handleUpdateCustomStyle = (index: number, part: 'name' | 'value', value: string) => {
        if (!selectedField) return;
        const newCustomStyles = [...(selectedField.styles.custom || [])];
        newCustomStyles[index] = { ...newCustomStyles[index], [part]: value };
        onUpdateField(selectedField.id, { styles: { ...selectedField.styles, custom: newCustomStyles } });
    };

    const handleAddCustomStyle = () => {
        if (!selectedField) return;
        const newCustomStyles = [...(selectedField.styles.custom || []), { name: '', value: '' }];
        onUpdateField(selectedField.id, { styles: { ...selectedField.styles, custom: newCustomStyles } });
    };

    const handleRemoveCustomStyle = (index: number) => {
        if (!selectedField) return;
        const newCustomStyles = [...(selectedField.styles.custom || [])];
        newCustomStyles.splice(index, 1);
        onUpdateField(selectedField.id, { styles: { ...selectedField.styles, custom: newCustomStyles } });
    };

    const handleAddCondition = () => {
        if (!selectedField) return;
        const newCondition: FieldCondition = { id: `cond_${Date.now()}`, fieldId: '', operator: 'equals', value: '' };
        const newConditions = [...(selectedField.conditions || []), newCondition];
        onUpdateField(selectedField.id, { conditions: newConditions });
    };

    const handleUpdateCondition = (index: number, newProps: Partial<FieldCondition>) => {
        if (!selectedField || !selectedField.conditions) return;
        const newConditions = [...selectedField.conditions];
        newConditions[index] = { ...newConditions[index], ...newProps };
        onUpdateField(selectedField.id, { conditions: newConditions });
    };

    const handleRemoveCondition = (index: number) => {
        if (!selectedField || !selectedField.conditions) return;
        const newConditions = [...selectedField.conditions];
        newConditions.splice(index, 1);
        onUpdateField(selectedField.id, { conditions: newConditions });
    };

    const handleUpdateConditionLogic = (logic: ConditionLogic) => {
        if (!selectedField) return;
        onUpdateField(selectedField.id, { conditionLogic: logic });
    };

    return (
        <aside className="w-96 bg-gray-900/70 backdrop-blur-lg border-l border-white/10 pl-6 py-5 pr-2 flex flex-col">
            <div className="flex-grow overflow-y-auto">
                {selectedField ? (
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-white mb-4">Field Editor</h2>
                        <div className="flex border-b border-white/10 mb-4">
                            <button onClick={() => setActiveFieldTab('properties')} className={`flex-1 pb-2 text-sm font-semibold ${activeFieldTab === 'properties' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-400'}`}>Properties</button>
                            <button onClick={() => setActiveFieldTab('style')} className={`flex-1 pb-2 text-sm font-semibold ${activeFieldTab === 'style' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-400'}`}>Style</button>
                            <button onClick={() => setActiveFieldTab('logic')} className={`flex-1 pb-2 text-sm font-semibold ${activeFieldTab === 'logic' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-400'}`}>Logic</button>
                        </div>
                        {activeFieldTab === 'properties' && (
                            <div className="space-y-4">
                                <div><label className="block text-sm font-medium text-gray-400 mb-1">Label / Text</label><input type="text" value={selectedField.label} onChange={e => props.onUpdateField(selectedField.id, { label: e.target.value })} className="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2" /></div>
                                {['text', 'email', 'textarea'].includes(selectedField.type) && (<div><label className="block text-sm font-medium text-gray-400 mb-1">Placeholder</label><input type="text" value={selectedField.placeholder || ''} onChange={e => props.onUpdateField(selectedField.id, { placeholder: e.target.value })} className="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2" /></div>)}
                                {(selectedField.type === 'select' || selectedField.type === 'radio' || selectedField.type === 'checkbox') && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Options</label>
                                        {selectedField.options?.map((opt, index) => (
                                            <div key={index} className="flex items-center gap-2 mb-2">
                                                <input type="text" value={opt.label} onChange={e => props.onUpdateOption(selectedField.id, index, { label: e.target.value })} className="flex-1 bg-gray-800 border border-white/10 rounded-lg px-3 py-1" placeholder="Label"/>
                                                <input type="text" value={opt.value} onChange={e => props.onUpdateOption(selectedField.id, index, { value: e.target.value })} className="flex-1 bg-gray-800 border border-white/10 rounded-lg px-3 py-1" placeholder="Value"/>
                                                <button onClick={() => props.onRemoveOption(selectedField.id, index)} className="text-red-400 hover:text-red-300"><Trash2Icon size={16}/></button>
                                            </div>
                                        ))}
                                        <button onClick={() => props.onAddOption(selectedField.id)} className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300"><PlusIcon size={16}/> Add Option</button>
                                    </div>
                                )}
                                {(selectedField.type === 'radio' || selectedField.type === 'checkbox') && (<div><label className="block text-sm font-medium text-gray-400 mb-1">Layout</label><select value={selectedField.layout} onChange={e => props.onUpdateField(selectedField.id, { layout: e.target.value as 'vertical' | 'horizontal' })} className="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2"><option value="vertical">Vertical</option><option value="horizontal">Horizontal</option></select></div>)}
                                {selectedField.type !== 'heading' && selectedField.type !== 'paragraph' && (<>
                                    <div><label className="block text-sm font-medium text-gray-400 mb-1">Name Attribute</label><input type="text" value={selectedField.name || ''} onChange={e => props.onUpdateField(selectedField.id, { name: e.target.value })} className="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2" /></div>
                                    <div><label className="block text-sm font-medium text-gray-400 mb-1">Field ID</label><input type="text" value={selectedField.fieldId || ''} onChange={e => props.onUpdateField(selectedField.id, { fieldId: e.target.value })} className="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2" /></div>
                                    <div className="flex items-center justify-between pt-2"><label htmlFor="required" className="text-sm font-medium text-gray-300">Required</label><input id="required" type="checkbox" checked={selectedField.required || false} onChange={e => props.onUpdateField(selectedField.id, { required: e.target.checked })} className="h-4 w-4 rounded text-indigo-600 bg-gray-700 border-gray-600 focus:ring-indigo-500" /></div>
                                </>)}
                            </div>
                        )}
                        {activeFieldTab === 'style' && (
                            <div className="space-y-4">
                                <div><label className="block text-sm font-medium text-gray-400 mb-1">Width ({props.previewMode})</label><select value={selectedField.styles?.[props.previewMode]?.width || selectedField.width} onChange={e => props.onUpdateFieldResponsiveStyle(selectedField.id, { width: e.target.value as FieldWidth }, props.previewMode)} className="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2"><option value="100%">Full</option><option value="50%">Half</option><option value="33.33%">Third</option></select></div>
                                <div className="flex items-center justify-between"><label className="text-sm">Font Size ({props.previewMode})</label><input type="text" value={selectedField.styles?.[props.previewMode]?.fontSize || ''} onChange={e => props.onUpdateFieldResponsiveStyle(selectedField.id, { fontSize: e.target.value }, props.previewMode)} className="w-2/3 bg-gray-800 border border-white/10 rounded-lg px-3 py-1" placeholder="e.g., 16px" /></div>
                                <div className="flex items-center justify-between"><label className="text-sm">Font Weight</label><input type="text" value={selectedField.styles?.fontWeight || ''} onChange={e => props.onUpdateFieldBaseStyle(selectedField.id, { fontWeight: e.target.value })} className="w-2/3 bg-gray-800 border border-white/10 rounded-lg px-3 py-1" placeholder="e.g., bold" /></div>
                                {(selectedField.type === 'heading' || selectedField.type === 'paragraph') && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Text Align</label>
                                        <div className="flex items-center gap-2 rounded-lg bg-gray-800 p-1">
                                            <button onClick={() => props.onUpdateFieldBaseStyle(selectedField.id, { textAlign: 'left' })} className={`flex-1 p-2 rounded-md ${selectedField.styles?.textAlign === 'left' ? 'bg-indigo-600' : 'hover:bg-gray-700'}`}><AlignLeftIcon size={16}/></button>
                                            <button onClick={() => props.onUpdateFieldBaseStyle(selectedField.id, { textAlign: 'center' })} className={`flex-1 p-2 rounded-md ${selectedField.styles?.textAlign === 'center' ? 'bg-indigo-600' : 'hover:bg-gray-700'}`}><AlignCenterIcon size={16}/></button>
                                            <button onClick={() => props.onUpdateFieldBaseStyle(selectedField.id, { textAlign: 'right' })} className={`flex-1 p-2 rounded-md ${selectedField.styles?.textAlign === 'right' ? 'bg-indigo-600' : 'hover:bg-gray-700'}`}><AlignRightIcon size={16}/></button>
                                        </div>
                                    </div>
                                )}
                                <div className="flex items-center justify-between"><label className="text-sm">Color</label><input type="color" value={selectedField.styles?.color || form.styles.textColor} onChange={e => props.onUpdateFieldBaseStyle(selectedField.id, { color: e.target.value })} className="p-1 h-8 w-14 block bg-gray-800 border border-white/10 cursor-pointer rounded-lg" /></div>
                                {(selectedField.type === 'heading' || selectedField.type === 'paragraph') && 
                                    <div className="flex items-center justify-between"><label className="text-sm">Background</label><input type="color" value={selectedField.styles?.backgroundColor || '#000000'} onChange={e => props.onUpdateFieldBaseStyle(selectedField.id, { backgroundColor: e.target.value })} className="p-1 h-8 w-14 block bg-gray-800 border border-white/10 cursor-pointer rounded-lg" /></div>
                                }
                                {selectedField.type !== 'heading' && selectedField.type !== 'paragraph' && <div className="flex items-center justify-between"><label className="text-sm">Background</label><input type="color" value={selectedField.styles?.backgroundColor || form.styles.fieldBackgroundColor} onChange={e => props.onUpdateFieldBaseStyle(selectedField.id, { backgroundColor: e.target.value })} className="p-1 h-8 w-14 block bg-gray-800 border border-white/10 cursor-pointer rounded-lg" /></div>}
                                
                                <div className="border-t border-white/10 pt-4 mt-4">
                                    <h3 className="text-md font-bold text-white mb-2">Custom Styles</h3>
                                    <div className="space-y-2">
                                        {selectedField.styles.custom?.map((style, index) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <input type="text" value={style.name} onChange={e => handleUpdateCustomStyle(index, 'name', e.target.value)} className="flex-1 bg-gray-700 border border-white/10 rounded-lg px-2 py-1 text-xs" placeholder="property"/>
                                                <input type="text" value={style.value} onChange={e => handleUpdateCustomStyle(index, 'value', e.target.value)} className="flex-1 bg-gray-700 border border-white/10 rounded-lg px-2 py-1 text-xs" placeholder="value"/>
                                                <button onClick={() => handleRemoveCustomStyle(index)} className="text-red-400 hover:text-red-300"><Trash2Icon size={16}/></button>
                                            </div>
                                        ))}
                                    </div>
                                    <button onClick={handleAddCustomStyle} className="mt-2 flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300"><PlusIcon size={16}/> Add Style</button>
                                </div>
                            </div>
                        )}
                        {activeFieldTab === 'logic' && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-white">Conditional Logic</h3>
                                <p className="text-xs text-gray-400">Show this field if...</p>
                                <div className="flex items-center gap-2 rounded-lg bg-gray-800 p-1">
                                    <button onClick={() => handleUpdateConditionLogic('and')} className={`flex-1 p-2 text-xs rounded-md ${selectedField.conditionLogic !== 'or' ? 'bg-indigo-600' : 'hover:bg-gray-700'}`}>All conditions match</button>
                                    <button onClick={() => handleUpdateConditionLogic('or')} className={`flex-1 p-2 text-xs rounded-md ${selectedField.conditionLogic === 'or' ? 'bg-indigo-600' : 'hover:bg-gray-700'}`}>Any condition matches</button>
                                </div>
                                <div className="space-y-3">
                                    {selectedField.conditions?.map((cond, index) => (
                                        <div key={cond.id} className="bg-gray-800/50 p-3 rounded-lg space-y-2">
                                            <div className="flex items-center gap-2">
                                                <select value={cond.fieldId} onChange={e => handleUpdateCondition(index, { fieldId: e.target.value })} className="w-full bg-gray-700 border border-white/10 rounded-lg px-3 py-2 text-sm">
                                                    <option value="">Select Field...</option>
                                                    {form.fields.filter(f => f.id !== selectedField.id && f.type !== 'heading' && f.type !== 'paragraph').map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                                                </select>
                                                <button onClick={() => handleRemoveCondition(index)} className="text-red-400 hover:text-red-300"><Trash2Icon size={18}/></button>
                                            </div>
                                            <select value={cond.operator} onChange={e => handleUpdateCondition(index, { operator: e.target.value as ConditionOperator })} className="w-full bg-gray-700 border border-white/10 rounded-lg px-3 py-2 text-sm">
                                                <option value="equals">Equals</option>
                                                <option value="not_equals">Does Not Equal</option>
                                                <option value="contains">Contains</option>
                                                <option value="is_empty">Is Empty</option>
                                                <option value="is_not_empty">Is Not Empty</option>
                                            </select>
                                            <input type="text" value={cond.value} onChange={e => handleUpdateCondition(index, { value: e.target.value })} className="w-full bg-gray-700 border border-white/10 rounded-lg px-3 py-2 text-sm" placeholder="Value to match"/>
                                        </div>
                                    ))}
                                </div>
                                <button onClick={handleAddCondition} className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300"><PlusIcon size={16}/> Add Condition</button>
                            </div>
                        )}
                    </div>
                ) : <p className="text-gray-500 text-center py-10">Select a field to edit it.</p>}
                
                <div className="border-t border-white/10 pt-6 mt-6 space-y-4">
                    <h2 className="text-xl font-bold text-white">Global Settings</h2>
                    <div className="flex border-b border-white/10">
                        <button onClick={() => setActiveGlobalTab('style')} className={`flex-1 pb-2 text-sm font-semibold ${activeGlobalTab === 'style' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-400'}`}>Style</button>
                        <button onClick={() => setActiveGlobalTab('settings')} className={`flex-1 pb-2 text-sm font-semibold ${activeGlobalTab === 'settings' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-400'}`}>Settings</button>
                    </div>
                    {activeGlobalTab === 'style' && (
                        <div className="space-y-4">
                            <div><label className="block text-sm font-medium text-gray-400 mb-1">Background Type</label><select value={form.styles.backgroundType} onChange={e => props.onUpdateForm({ styles: { ...form.styles, backgroundType: e.target.value as 'color' | 'image' }})} className="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2"><option value="color">Color</option><option value="image">Image</option></select></div>
                            {form.styles.backgroundType === 'color' ? (<div className="flex items-center justify-between"><label className="text-sm">Background Color</label><input type="color" value={form.styles.backgroundColor} onChange={e => props.onUpdateForm({ styles: { ...form.styles, backgroundColor: e.target.value }})} className="p-1 h-8 w-14 block bg-gray-800 border border-white/10 cursor-pointer rounded-lg" /></div>) : (<div><label className="block text-sm font-medium text-gray-400 mb-1">Background Image URL</label><input type="text" value={form.styles.backgroundImage} onChange={e => props.onUpdateForm({ styles: { ...form.styles, backgroundImage: e.target.value }})} className="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2" /></div>)}
                            <div className="flex items-center justify-between"><label className="text-sm">Text Color</label><input type="color" value={form.styles.textColor} onChange={e => props.onUpdateForm({ styles: { ...form.styles, textColor: e.target.value }})} className="p-1 h-8 w-14 block bg-gray-800 border border-white/10 cursor-pointer rounded-lg" /></div>
                            <div className="flex items-center justify-between"><label className="text-sm">Field Gap (px)</label><input type="number" value={form.styles.gap} onChange={e => props.onUpdateForm({ styles: { ...form.styles, gap: parseInt(e.target.value, 10) || 0 }})} className="w-20 bg-gray-800 border border-white/10 rounded-lg px-3 py-1" /></div>
                            <h3 className="text-lg font-bold text-white pt-4">Button Styles</h3>
                            <div><label className="block text-sm font-medium text-gray-400 mb-1">Button Text</label><input type="text" value={form.styles.buttonText} onChange={e => props.onUpdateForm({ styles: { ...form.styles, buttonText: e.target.value }})} className="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2" /></div>
                            <div><label className="block text-sm font-medium text-gray-400 mb-1">Button Position</label><select value={form.styles.buttonPosition} onChange={e => props.onUpdateForm({ styles: { ...form.styles, buttonPosition: e.target.value as 'left' | 'center' | 'right' }})} className="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2"><option value="left">Left</option><option value="center">Center</option><option value="right">Right</option></select></div>
                            <div className="flex items-center justify-between"><label className="text-sm">Width</label><input type="text" value={form.styles.buttonWidth} onChange={e => props.onUpdateForm({ styles: { ...form.styles, buttonWidth: e.target.value }})} className="w-2/3 bg-gray-800 border border-white/10 rounded-lg px-3 py-1" placeholder="e.g., auto or 150px" /></div>
                            <div className="flex items-center justify-between"><label className="text-sm">Height</label><input type="text" value={form.styles.buttonHeight} onChange={e => props.onUpdateForm({ styles: { ...form.styles, buttonHeight: e.target.value }})} className="w-2/3 bg-gray-800 border border-white/10 rounded-lg px-3 py-1" placeholder="e.g., auto or 40px" /></div>
                            <div className="flex items-center justify-between"><label className="text-sm">Button Background</label><input type="color" value={form.styles.buttonBackgroundColor} onChange={e => props.onUpdateForm({ styles: { ...form.styles, buttonBackgroundColor: e.target.value }})} className="p-1 h-8 w-14 block bg-gray-800 border border-white/10 cursor-pointer rounded-lg" /></div>
                            <div className="flex items-center justify-between"><label className="text-sm">Button Text Color</label><input type="color" value={form.styles.buttonTextColor} onChange={e => props.onUpdateForm({ styles: { ...form.styles, buttonTextColor: e.target.value }})} className="p-1 h-8 w-14 block bg-gray-800 border border-white/10 cursor-pointer rounded-lg" /></div>
                        </div>
                    )}
                    {activeGlobalTab === 'settings' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between pt-2"><label htmlFor="prefill" className="text-sm font-medium text-gray-300">Prefill from API</label><input id="prefill" type="checkbox" checked={form.settings.prefillFromAPI || false} onChange={e => props.onUpdateForm({ settings: { ...form.settings, prefillFromAPI: e.target.checked }})} className="h-4 w-4 rounded text-indigo-600 bg-gray-700 border-gray-600 focus:ring-indigo-500" /></div>
                            {form.settings.prefillFromAPI && (<div><label className="block text-sm font-medium text-gray-400 mb-1">API Endpoint URL</label><input type="text" value={form.settings.prefillApiUrl || ''} onChange={e => props.onUpdateForm({ settings: { ...form.settings, prefillApiUrl: e.target.value }})} className="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2" placeholder="https://api.example.com/data" /><p className="text-xs text-gray-500 mt-1">The user&apos;s ID will be appended as a query parameter.</p></div>)}
                            <div className="flex items-center justify-between pt-2"><label htmlFor="postOnSubmit" className="text-sm font-medium text-gray-300">POST to API on Submit</label><input id="postOnSubmit" type="checkbox" checked={form.settings.postOnSubmit || false} onChange={e => props.onUpdateForm({ settings: { ...form.settings, postOnSubmit: e.target.checked }})} className="h-4 w-4 rounded text-indigo-600 bg-gray-700 border-gray-600 focus:ring-indigo-500" /></div>
                            {form.settings.postOnSubmit && (<div><label className="block text-sm font-medium text-gray-400 mb-1">API Endpoint URL</label><input type="text" value={form.settings.postApiUrl || ''} onChange={e => props.onUpdateForm({ settings: { ...form.settings, postApiUrl: e.target.value }})} className="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2" placeholder="https://api.example.com/submit" /></div>)}
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
}

// Main Page Component
export default function EditorPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const params = useParams();
    const formId = params?.formId as string;

    const [form, setForm] = useState<Form | null>(null);
    const [selectedField, setSelectedField] = useState<FormField | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isBrowser, setIsBrowser] = useState(false);
    const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop');
    const [isPreviewReady, setIsPreviewReady] = useState(false);

    useEffect(() => { setIsBrowser(true); }, []);

    useEffect(() => {
        if (user && formId) {
            const fetchFormData = async () => {
                setLoading(true);
                const token = await user.getIdToken();
                const res = await fetch(`/api/forms/${formId}`, { headers: { 'Authorization': `Bearer ${token}` } });
                if (res.ok) {
                    const data = await res.json();
                    const validatedFields = data.fields.map((field: FormField) => ({
                        ...field,
                        styles: { ...defaultFieldStyles, ...(field.styles || {}) },
                        conditions: field.conditions || [],
                        conditionLogic: field.conditionLogic || 'and',
                    }));
                    setForm({ ...data, fields: validatedFields, styles: { ...defaultStyles, ...data.styles }, settings: { ...defaultSettings, ...data.settings } });
                    setIsPreviewReady(true);
                } else { router.push('/dashboard'); }
                setLoading(false);
            };
            fetchFormData();
        }
    }, [user, formId, router]);

    const updateForm = (newProps: Partial<Form>) => {
        setForm(prev => prev ? { ...prev, ...newProps } : null);
        setIsPreviewReady(false);
    };

    const updateField = (id: string, newProps: Partial<FormField>) => {
        if (!form) return;
        let updatedField: FormField | null = null;
        const newFields = form.fields.map(f => {
            if (f.id === id) { updatedField = { ...f, ...newProps }; return updatedField; }
            return f;
        });
        updateForm({ fields: newFields });
        if (selectedField?.id === id && updatedField) { setSelectedField(updatedField); }
    };
    
    const updateFieldResponsiveStyle = (id: string, newStyles: Partial<ResponsiveStyles>, device: PreviewMode) => {
        if (!form) return;
        let updatedField: FormField | null = null;
        const newFields = form.fields.map(f => {
            if (f.id === id) {
                const existingStyles = f.styles || { ...defaultFieldStyles };
                const existingDeviceStyles = existingStyles[device] || {};
                updatedField = { ...f, styles: { ...existingStyles, [device]: { ...existingDeviceStyles, ...newStyles } } };
                return updatedField;
            }
            return f;
        });
        updateForm({ fields: newFields });
        if (selectedField?.id === id && updatedField) { setSelectedField(updatedField); }
    };

    const updateFieldBaseStyle = (id: string, newStyles: Partial<Omit<FieldStyles, 'desktop' | 'tablet' | 'mobile'>>) => {
        if (!form) return;
        let updatedField: FormField | null = null;
        const newFields = form.fields.map(f => {
            if (f.id === id) {
                const existingStyles = f.styles || { ...defaultFieldStyles };
                updatedField = { ...f, styles: { ...existingStyles, ...newStyles } };
                return updatedField;
            }
            return f;
        });
        updateForm({ fields: newFields });
        if (selectedField?.id === id && updatedField) { setSelectedField(updatedField); }
    };

    const addField = (type: FieldType) => {
        if (!form) return;
        const newField: FormField = {
            id: `field_${Date.now()}`, type, label: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
            name: `field_${Date.now()}`, fieldId: `field_${Date.now()}`, placeholder: '', required: false,
            options: type === 'select' || type === 'radio' || type === 'checkbox' ? [{label: 'Option 1', value: 'option_1'}] : [],
            layout: 'vertical', width: '100%', 
            styles: { ...defaultFieldStyles },
            conditions: [],
            conditionLogic: 'and',
        };
        updateForm({ fields: [...form.fields, newField] });
    };

    const deleteField = (id: string) => {
        if (!form) return;
        updateForm({ fields: form.fields.filter(f => f.id !== id) });
        if (selectedField?.id === id) { setSelectedField(null); }
    };
    
    const updateOption = (fieldId: string, optionIndex: number, newOption: Partial<FieldOption>) => {
        const fieldToUpdate = form?.fields.find(f => f.id === fieldId);
        if (!fieldToUpdate || !fieldToUpdate.options) return;
        const newOptions = [...fieldToUpdate.options];
        newOptions[optionIndex] = { ...newOptions[optionIndex], ...newOption };
        updateField(fieldId, { options: newOptions });
    };

    const addOption = (fieldId: string) => {
        const fieldToUpdate = form?.fields.find(f => f.id === fieldId);
        if (!fieldToUpdate) return;
        const optionCount = (fieldToUpdate.options?.length || 0) + 1;
        const newOptions = [...(fieldToUpdate.options || []), {label: `Option ${optionCount}`, value: `option_${optionCount}`}];
        updateField(fieldId, { options: newOptions });
    };

    const removeOption = (fieldId: string, optionIndex: number) => {
        const fieldToUpdate = form?.fields.find(f => f.id === fieldId);
        if (!fieldToUpdate || !fieldToUpdate.options) return;
        const newOptions = [...fieldToUpdate.options];
        newOptions.splice(optionIndex, 1);
        updateField(fieldId, { options: newOptions });
    };

    const onDragEnd = (result: DropResult) => {
        if (!result.destination || !form) return;
        const items = Array.from(form.fields);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        updateForm({ fields: items });
    };

    const saveForm = async () => {
        if (!user || !form) return;
        setSaving(true);
        const token = await user.getIdToken();
        try {
            await fetch(`/api/forms/${formId}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: form.title, fields: form.fields, styles: form.styles, settings: form.settings }),
            });
            setIsPreviewReady(true);
        } catch (error) { console.error("Failed to save form:", error); } 
        finally { setSaving(false); }
    };

    if (authLoading || loading) { return <QuickFormLoader />; }
    if (!form) { return <div className="flex h-screen w-full items-center justify-center bg-gray-900 text-gray-400"><p>Form not found or failed to load.</p></div>; }
    
    return (
        <div className="flex h-screen bg-gray-900 text-gray-200">
            <FieldPalette onAddField={addField} />
            <main className="flex-1 flex flex-col">
                <Header
                    formTitle={form.title}
                    onFormTitleChange={title => updateForm({ title })}
                    previewMode={previewMode}
                    onPreviewModeChange={setPreviewMode}
                    isPreviewReady={isPreviewReady}
                    onSave={saveForm}
                    saving={saving}
                    formId={form.id}
                />
                <Canvas
                    form={form}
                    previewMode={previewMode}
                    selectedField={selectedField}
                    onFieldSelect={setSelectedField}
                    onDragEnd={onDragEnd}
                    onFieldDelete={deleteField}
                    isBrowser={isBrowser}
                />
            </main>
            <PropertiesPanel
                selectedField={selectedField}
                form={form}
                previewMode={previewMode}
                onUpdateField={updateField}
                onUpdateFieldResponsiveStyle={updateFieldResponsiveStyle}
                onUpdateFieldBaseStyle={updateFieldBaseStyle}
                onUpdateOption={updateOption}
                onAddOption={addOption}
                onRemoveOption={removeOption}
                onUpdateForm={updateForm}
            />
        </div>
    );
}
