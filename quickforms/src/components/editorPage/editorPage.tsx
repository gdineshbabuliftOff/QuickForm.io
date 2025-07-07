"use client";

import React, { useState, useEffect, FC, JSX } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useParams, useRouter } from 'next/navigation';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import Link from 'next/link';
import QuickFormLoader from '../loaders/quickFormloader';

// --- Type Definitions ---
interface IconProps { color?: string; size?: number | string; strokeWidth?: number | string; className?: string; }
type IconPathTuple = [keyof JSX.IntrinsicElements, { [key: string]: any }];
interface FormField { id: string; type: string; label: string; placeholder?: string; required?: boolean; options?: string[]; }
interface Form { id: string; title: string; fields: FormField[]; }
type FieldType = 'text' | 'email' | 'textarea' | 'select' | 'checkbox' | 'radio';

// --- Reusable Icon Creator ---
const createIcon = (path: IconPathTuple[]): (({ displayName }: { displayName: string; }) => FC<IconProps>) => ({ displayName }: { displayName: string; }) => {
  const Component = React.forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 24, strokeWidth = 2, className, ...rest }, ref) => React.createElement('svg', { ref, width: size, height: size, stroke: color, strokeWidth, className: ['lucide', `lucide-${displayName.toLowerCase()}`, className].filter(Boolean).join(' '), xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round', ...rest }, path.map(([tag, attrs], i) => React.createElement(tag, { key: attrs.key || i, ...attrs }))));
  Component.displayName = `LucideIcon(${displayName})`;
  return Component;
};

// --- Icon Definitions ---
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


const fieldTypes: { type: FieldType; label: string; icon: FC<IconProps> }[] = [
    { type: 'text', label: 'Text Input', icon: TypeIcon },
    { type: 'email', label: 'Email', icon: MailIcon },
    { type: 'textarea', label: 'Text Area', icon: TextareaIcon },
    { type: 'select', label: 'Dropdown', icon: ChevronDownIcon },
    { type: 'checkbox', label: 'Checkbox', icon: CheckSquareIcon },
];

export default function EditorPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const params = useParams();
    const formId = params.formId as string;

    const [form, setForm] = useState<Form | null>(null);
    const [fields, setFields] = useState<FormField[]>([]);
    const [selectedField, setSelectedField] = useState<FormField | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isBrowser, setIsBrowser] = useState(false);

    useEffect(() => {
        setIsBrowser(true); // Ensures DND only renders on the client
    }, []);

    useEffect(() => {
        if (user && formId) {
            const fetchFormData = async () => {
                setLoading(true);
                const token = await user.getIdToken();
                const res = await fetch(`/api/forms/${formId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setForm(data);
                    setFields(data.fields || []);
                } else {
                    console.error("Failed to fetch form data");
                    router.push('/dashboard');
                }
                setLoading(false);
            };
            fetchFormData();
        }
    }, [user, formId, router]);

    const addField = (type: FieldType) => {
        const newField: FormField = {
            id: `field_${Date.now()}`,
            type,
            label: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
            placeholder: '',
            required: false,
            ...(type === 'select' && { options: ['Option 1', 'Option 2'] }),
        };
        setFields([...fields, newField]);
    };

    const updateField = (id: string, newProps: Partial<FormField>) => {
        const newFields = fields.map(f => f.id === id ? { ...f, ...newProps } : f);
        setFields(newFields);
        if (selectedField?.id === id) {
            setSelectedField({ ...selectedField, ...newProps });
        }
    };

    const deleteField = (id: string) => {
        setFields(fields.filter(f => f.id !== id));
        if (selectedField?.id === id) {
            setSelectedField(null);
        }
    };

    const onDragEnd = (result: DropResult) => {
        if (!result.destination) return;
        const items = Array.from(fields);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        setFields(items);
    };

    const saveForm = async () => {
        if (!user) return;
        setSaving(true);
        const token = await user.getIdToken();
        try {
            await fetch(`/api/forms/${formId}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ fields }),
            });
        } catch (error) {
            console.error("Failed to save form:", error);
        } finally {
            setSaving(false);
        }
    };

    if (authLoading || loading) {
        return <QuickFormLoader />;
    }

    return (
        <div className="flex h-screen bg-gray-900 text-gray-200">
            {/* Fields Sidebar */}
            <aside className="w-64 bg-gray-900/70 backdrop-blur-lg border-r border-white/10 p-6 flex flex-col">
                <h2 className="text-xl font-bold text-white mb-6">Form Fields</h2>
                <div className="space-y-3">
                    {fieldTypes.map(ft => (
                        <button key={ft.type} onClick={() => addField(ft.type)} className="w-full flex items-center gap-3 p-3 bg-gray-800/60 hover:bg-indigo-600/30 rounded-lg transition-colors">
                            <ft.icon className="h-5 w-5 text-indigo-400" />
                            <span>{ft.label}</span>
                        </button>
                    ))}
                </div>
            </aside>

            {/* Main Canvas */}
            <main className="flex-1 flex flex-col">
                <header className="flex items-center justify-between p-4 border-b border-white/10 bg-gray-900/70 backdrop-blur-lg sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <Link href="/forms" className="p-2 rounded-full hover:bg-gray-700/80 transition-colors">
                            <ChevronLeftIcon size={20} />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-white">{form?.title}</h1>
                            <p className="text-sm text-gray-400">Form Editor</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href={`/preview/${formId}`} target="_blank" className="flex items-center gap-2 py-2 px-4 rounded-lg hover:bg-gray-700/80 transition-colors">
                            <EyeIcon size={18} /> Preview
                        </Link>
                        <button onClick={saveForm} disabled={saving} className="flex items-center gap-2 py-2 px-4 bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors disabled:bg-indigo-400">
                            <SaveIcon size={18} /> {saving ? 'Saving...' : 'Save Form'}
                        </button>
                    </div>
                </header>
                <div className="flex-1 overflow-y-auto p-8">
                    {isBrowser && (
                        <DragDropContext onDragEnd={onDragEnd}>
                            <Droppable droppableId="form-canvas">
                                {(provided) => (
                                    <div {...provided.droppableProps} ref={provided.innerRef} className="max-w-3xl mx-auto space-y-4">
                                        {fields.length > 0 ? fields.map((field, index) => (
                                            <Draggable key={field.id} draggableId={field.id} index={index}>
                                                {(provided) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        onClick={() => setSelectedField(field)}
                                                        className={`p-4 rounded-lg border-2 transition-all ${selectedField?.id === field.id ? 'border-indigo-500 bg-gray-800/80' : 'border-transparent bg-gray-800/50 hover:border-indigo-600/50'}`}
                                                    >
                                                        <div className="flex items-start">
                                                            <div {...provided.dragHandleProps} className="p-2 text-gray-500 hover:text-white cursor-grab">
                                                                <GripVerticalIcon size={20} />
                                                            </div>
                                                            <div className="flex-1">
                                                                <label className="block text-sm font-medium text-gray-300 mb-2">{field.label} {field.required && <span className="text-red-400">*</span>}</label>
                                                                {field.type === 'text' && <input type="text" placeholder={field.placeholder} className="w-full bg-gray-900/50 border border-white/10 rounded-lg px-3 py-2" readOnly />}
                                                                {field.type === 'email' && <input type="email" placeholder={field.placeholder} className="w-full bg-gray-900/50 border border-white/10 rounded-lg px-3 py-2" readOnly />}
                                                                {field.type === 'textarea' && <textarea placeholder={field.placeholder} className="w-full bg-gray-900/50 border border-white/10 rounded-lg px-3 py-2" readOnly />}
                                                                {field.type === 'select' && <select className="w-full bg-gray-900/50 border border-white/10 rounded-lg px-3 py-2"><option>{field.placeholder || "Select an option"}</option></select>}
                                                                {field.type === 'checkbox' && <div className="flex items-center gap-2"><input type="checkbox" className="h-4 w-4 rounded" readOnly /> <span>{field.label}</span></div>}
                                                            </div>
                                                            <button onClick={() => deleteField(field.id)} className="p-2 text-gray-500 hover:text-red-400"><Trash2Icon size={18} /></button>
                                                        </div>
                                                    </div>
                                                )}
                                            </Draggable>
                                        )) : (
                                            <div className="text-center py-20 border-2 border-dashed border-gray-700 rounded-lg">
                                                <p className="text-gray-400">Drag and drop fields from the left sidebar to start building your form.</p>
                                            </div>
                                        )}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>
                    )}
                </div>
            </main>

            {/* Properties Sidebar */}
            <aside className="w-80 bg-gray-900/70 backdrop-blur-lg border-l border-white/10 p-6 overflow-y-auto">
                <h2 className="text-xl font-bold text-white mb-6">Field Properties</h2>
                {selectedField ? (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Label</label>
                            <input type="text" value={selectedField.label} onChange={e => updateField(selectedField.id, { label: e.target.value })} className="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2" />
                        </div>
                        {['text', 'email', 'textarea'].includes(selectedField.type) && (
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Placeholder</label>
                                <input type="text" value={selectedField.placeholder || ''} onChange={e => updateField(selectedField.id, { placeholder: e.target.value })} className="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2" />
                            </div>
                        )}
                        {selectedField.type === 'select' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Options (one per line)</label>
                                <textarea value={selectedField.options?.join('\n')} onChange={e => updateField(selectedField.id, { options: e.target.value.split('\n') })} className="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2 h-24" />
                            </div>
                        )}
                        <div className="flex items-center justify-between pt-2">
                            <label htmlFor="required" className="text-sm font-medium text-gray-300">Required</label>
                            <input id="required" type="checkbox" checked={selectedField.required || false} onChange={e => updateField(selectedField.id, { required: e.target.checked })} className="h-4 w-4 rounded text-indigo-600 bg-gray-700 border-gray-600 focus:ring-indigo-500" />
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-500">Select a field to see its properties.</p>
                )}
            </aside>
        </div>
    );
}
