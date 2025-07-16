"use client";

import React, { useState, useEffect, FC, JSX, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useParams, useRouter } from 'next/navigation';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import Link from 'next/link';
import QuickFormLoader from '../loaders/quickFormloader';

const useHistory = <T,>(initialState: T): [T, (action: T | ((prevState: T) => T), overwrite?: boolean) => void, () => void, () => void, boolean, boolean] => {
    const [state, setStateInternal] = useState({ history: [initialState], index: 0 });
    const { history, index } = state;
    const setState = useCallback((action: T | ((prevState: T) => T), overwrite = false) => {
        setStateInternal(currentState => {
            const newState = typeof action === 'function' ? (action as (prevState: T) => T)(currentState.history[currentState.index]) : action;
            if (overwrite) {
                const newHistory = [...currentState.history];
                newHistory[currentState.index] = newState;
                return { ...currentState, history: newHistory };
            } else {
                const newHistory = currentState.history.slice(0, currentState.index + 1);
                newHistory.push(newState);
                return { history: newHistory, index: newHistory.length - 1 };
            }
        });
    }, []);
    const undo = useCallback(() => {
        setStateInternal(currentState => {
            if (currentState.index > 0) {
                return { ...currentState, index: currentState.index - 1 };
            }
            return currentState;
        });
    }, []);
    const redo = useCallback(() => {
        setStateInternal(currentState => {
            if (currentState.index < currentState.history.length - 1) {
                return { ...currentState, index: currentState.index + 1 };
            }
            return currentState;
        });
    }, []);
    const canUndo = index > 0;
    const canRedo = index < history.length - 1;
    return [history[index], setState, undo, redo, canUndo, canRedo];
};

const toCamelCase = (str: string) => {
    if (!str.includes('-')) {
        return str;
    }
    return str.replace(/-./g, x => x[1].toUpperCase());
};

interface IconProps {
    color?: string;
    size?: number | string;
    strokeWidth?: number | string;
    className?: string;
    fill?: string;
}
type IconPathTuple = [keyof JSX.IntrinsicElements, { [key: string]: any }];
type FieldType = 'text' | 'email' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'heading' | 'paragraph' | 'date' | 'file' | 'signature' | 'section' | 'hr' | 'ordered-list' | 'unordered-list' | 'number' | 'password' | 'range' | 'tel' | 'url' | 'color' | 'time' | 'month' | 'week' | 'address' | 'name' | 'rating' | 'image';
type FieldWidth = '100%' | '50%' | '33.33%' | 'custom';
type PreviewMode = 'desktop' | 'tablet' | 'mobile';
type ConditionOperator = 'equals' | 'not_equals' | 'contains' | 'is_empty' | 'is_not_empty';
type TextAlign = 'left' | 'center' | 'right';
type ConditionLogic = 'and' | 'or';
type ListStyleType = 'disc' | 'circle' | 'square' | 'decimal' | 'lower-alpha' | 'upper-alpha' | 'lower-roman' | 'upper-roman' | 'none';
interface NotificationType { message: string; type: 'success' | 'error'; visible: boolean; }
interface CustomStyle { name: string; value: string; }
type ControlStyle = 'default' | 'filled' | 'switch' | 'line-through';

interface ResponsiveFieldStyles { width?: FieldWidth | string; fontSize?: string; height?: string; display?: 'block' | 'none'; }
interface FieldStyles { color?: string; backgroundColor?: string; borderColor?: string; fontSize?: string; fontWeight?: string; textAlign?: TextAlign; padding?: string; listStyleType?: ListStyleType; custom?: CustomStyle[]; controlStyle?: ControlStyle; desktop: ResponsiveFieldStyles; tablet: ResponsiveFieldStyles; mobile: ResponsiveFieldStyles; }
interface ResponsiveGlobalStyles { gap?: number; buttonWidth?: string; buttonHeight?: string; nextButtonWidth?: string; nextButtonHeight?: string; prevButtonWidth?: string; prevButtonHeight?: string; }
interface FormStyles { backgroundType: 'color' | 'image'; backgroundColor: string; backgroundImage: string; textColor: string; fieldBackgroundColor: string; fieldBorderColor: string; buttonBackgroundColor: string; buttonTextColor: string; buttonText: string; buttonPosition: 'left' | 'center' | 'right'; buttonWidth: string; buttonHeight: string; gap: number; nextButtonText: string; nextButtonBackgroundColor: string; nextButtonTextColor: string; nextButtonWidth: string; nextButtonHeight: string; prevButtonText: string; prevButtonBackgroundColor: string; prevButtonTextColor: string; prevButtonWidth: string; prevButtonHeight: string; formAlignment?: 'start' | 'center' | 'end'; desktop: ResponsiveGlobalStyles; tablet: ResponsiveGlobalStyles; mobile: ResponsiveGlobalStyles; }
interface LoaderSettings { type: 'default' | 'dots' | 'spinner' | 'bar' | 'pulse' | 'custom'; url?: string; color?: string; }
type PageTrackerType = 'none' | 'numbers' | 'progress-bar' | 'both';
interface FormSettings { prefillFromAPI: boolean; prefillApiUrl: string; postOnSubmit: boolean; postApiUrl: string; loader?: LoaderSettings; submitSuccessMessage: string; submitErrorMessage: string; submitLoader?: LoaderSettings; enableThankYouPage: boolean; thankYouPageContent: FormField[]; pageTracker: PageTrackerType; pageTrackerColor: string; pageTrackerBgColor: string; }

interface FieldOption { label: string; value: string; }
interface FieldCondition { id: string; fieldId: string; operator: ConditionOperator; value: string; }
interface RequiredCondition { enabled: boolean; logic: ConditionLogic; conditions: FieldCondition[]; }
interface FormField { id: string; type: FieldType; label: string; width: FieldWidth; name?: string; fieldId?: string; placeholder?: string; value?: string; required?: boolean; requiredErrorMessage?: string; requiredConditions?: RequiredCondition; options?: FieldOption[]; layout?: 'vertical' | 'horizontal'; styles: FieldStyles; conditions?: FieldCondition[]; conditionLogic?: ConditionLogic; fields?: FormField[]; min?: number; max?: number; step?: number; maxRating?: number; src?: string; }
interface FormPage { id: string; name: string; fields: FormField[]; styles: Partial<FormStyles>; }
interface Form { id: string; title: string; pages: FormPage[]; styles: FormStyles; settings: FormSettings; hasPublishedVersion?: boolean; }

const createIcon = (path: IconPathTuple[]): (({ displayName }: { displayName: string; }) => FC<IconProps>) => ({ displayName }: { displayName: string; }) => {
    const Component = React.forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 24, strokeWidth = 2, className, ...rest }, ref) => React.createElement('svg', { ref, width: size, height: size, stroke: color, strokeWidth, className: ['lucide', `lucide-${displayName.toLowerCase()}`, className].filter(Boolean).join(' '), xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round', ...rest }, path.map(([tag, attrs], i) => React.createElement(tag, { key: attrs.key || i, ...attrs }))));
    Component.displayName = `LucideIcon(${displayName})`;
    return Component;
};
const HomeIcon = createIcon([['path', { d: "m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" }], ['polyline', { points: "9 22 9 12 15 12 15 22" }]])({ displayName: 'Home' });
const UserIcon = createIcon([['path', { d: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" }], ['circle', { cx: "12", cy: "7", r: "4" }]])({ displayName: 'User' });
const StarIcon = createIcon([['polygon', { points: "12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" }]])({ displayName: 'Star' });
const ImageIcon = createIcon([['rect', { width: "18", height: "18", x: "3", y: "3", rx: "2", ry: "2" }], ['circle', { cx: "9", cy: "9", r: "2" }], ['path', { d: "m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" }]])({ displayName: 'Image' });
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
const AlignLeftIcon = createIcon([['line', { x1: "21", x2: "3", y1: "6", y2: "6" }], ['line', { x1: "15", x2: "3", y1: "12", y2: "12" }], ['line', { x1: "17", x2: "3", y1: "18", y2: "18" }]])({ displayName: 'AlignLeft' });
const AlignCenterIcon = createIcon([['line', { x1: "21", x2: "3", y1: "6", y2: "6" }], ['line', { x1: "17", x2: "7", y1: "12", y2: "12" }], ['line', { x1: "19", x2: "5", y1: "18", y2: "18" }]])({ displayName: 'AlignCenter' });
const AlignRightIcon = createIcon([['line', { x1: "21", x2: "3", y1: "6", y2: "6" }], ['line', { x1: "21", x2: "9", y1: "12", y2: "12" }], ['line', { x1: "21", x2: "7", y1: "18", y2: "18" }]])({ displayName: 'AlignRight' });
const UndoIcon = createIcon([['path', { d: "M3 7v6h6" }], ['path', { d: "M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" }]])({ displayName: 'Undo' });
const RedoIcon = createIcon([['path', { d: "m17 2 4 4-4 4" }], ['path', { d: "M3 12v-2a4 4 0 0 1 4-4h12" }]])({ displayName: 'Redo' });
const GlobeIcon = createIcon([['circle', { cx: "12", cy: "12", r: "10" }], ['path', { d: "M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" }], ['path', { d: "M2 12h20" }]])({ displayName: 'Globe' });
const SectionIcon = createIcon([['rect', { x: '3', y: '3', width: '18', height: '18', rx: '2', ry: '2' }], ['line', { x1: '3', y1: '9', x2: '21', y2: '9' }]])({ displayName: 'Section' });
const HrIcon = createIcon([['line', { x1: '3', y1: '12', x2: '21', y2: '12' }]])({ displayName: 'Hr' });
const ListOrderedIcon = createIcon([["line", { x1: "10", x2: "21", y1: "6", y2: "6" }], ["line", { x1: "10", x2: "21", y1: "12", y2: "12" }], ["line", { x1: "10", x2: "21", y1: "18", y2: "18" }], ["path", { d: "M4 6h1v4" }], ["path", { d: "M4 10h2" }], ["path", { d: "M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" }]])({ displayName: 'ListOrdered' });
const ListIcon = createIcon([["line", { x1: "8", x2: "21", y1: "6", y2: "6" }], ["line", { x1: "8", x2: "21", y1: "12", y2: "12" }], ["line", { x1: "8", x2: "21", y1: "18", y2: "18" }], ["line", { x1: "3", x2: "3.01", y1: "6", y2: "6" }], ["line", { x1: "3", x2: "3.01", y1: "12", y2: "12" }], ["line", { x1: "3", x2: "3.01", y1: "18", y2: "18" }]])({ displayName: 'List' });
const Share2Icon = createIcon([['circle', { cx: "18", cy: "5", r: "3" }], ['circle', { cx: "6", cy: "12", r: "3" }], ['circle', { cx: "18", cy: "19", r: "3" }], ['line', { x1: "8.59", y1: "13.51", x2: "15.42", y2: "17.49" }], ['line', { x1: "15.41", y1: "6.51", x2: "8.59", y2: "10.49" }]])({ displayName: 'Share2' });
const MoreVerticalIcon = createIcon([['circle', { cx: "12", cy: "12", r: "1" }], ['circle', { cx: "12", cy: "5", r: "1" }], ['circle', { cx: "12", cy: "19", r: "1" }]])({ displayName: 'MoreVertical' });
const HistoryIcon = createIcon([['path', { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" }], ['path', { d: "M3 3v5h5" }], ['path', { d: "M12 7v5l4 2" }]])({ displayName: 'History' });
const XIcon = createIcon([['path', { d: "M18 6 6 18" }], ['path', { d: "m6 6 12 12" }]])({ displayName: 'X' });
const RotateCcwIcon = createIcon([['path', { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" }], ['path', { d: "M3 3v5h5" }]])({ displayName: 'RotateCcw' });
const SlidersHorizontalIcon = createIcon([['line', { x1: '21', y1: '4', x2: '14', y2: '4' }], ['line', { x1: '10', y1: '4', x2: '3', y2: '4' }], ['line', { x1: '21', y1: '12', x2: '12', y2: '12' }], ['line', { x1: '8', y1: '12', x2: '3', y2: '12' }], ['line', { x1: '21', y1: '20', x2: '16', y2: '20' }], ['line', { x1: '12', y1: '20', x2: '3', y2: '20' }], ['line', { x1: '14', y1: '2', x2: '14', y2: '6' }], ['line', { x1: '8', y1: '10', x2: '8', y2: '14' }], ['line', { x1: '16', y1: '18', x2: '16', y2: '22' }]])({ displayName: 'SlidersHorizontal' });
const HashIcon = createIcon([['line', { x1: '4', x2: '20', y1: '9', y2: '9' }], ['line', { x1: '4', x2: '20', y1: '15', y2: '15' }], ['line', { x1: '10', x2: '8', y1: '3', y2: '21' }], ['line', { x1: '16', x2: '14', y1: '3', y2: '21' }]])({ displayName: 'Hash' });
const KeyRoundIcon = createIcon([['path', { d: 'M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z' }], ['circle', { cx: '16.5', cy: '7.5', r: '.5' }]])({ displayName: 'KeyRound' });
const GitCommitHorizontalIcon = createIcon([['path', { d: "M2 12h8" }], ['path', { d: "M18 12h4" }], ['circle', { cx: "14", cy: "12", r: "2" }]])({ displayName: 'GitCommitHorizontal' });
const CheckIcon = createIcon([['path', { d: "M20 6 9 17l-5-5" }]])({ displayName: 'Check' });
const AlignHorizontalJustifyStart = createIcon([['rect', { width: '6', height: '14', x: '2', y: '5', rx: '2' }], ['rect', { width: '6', height: '10', x: '12', y: '7', rx: '2' }]])({ displayName: 'AlignHorizontalJustifyStart' });
const AlignHorizontalJustifyCenter = createIcon([['rect', { width: '6', height: '14', x: '2', y: '5', rx: '2' }], ['rect', { width: '6', height: '10', x: '16', y: '7', rx: '2' }], ['path', { d: 'M12 3v18' }]])({ displayName: 'AlignHorizontalJustifyCenter' });
const AlignHorizontalJustifyEnd = createIcon([['rect', { width: '6', height: '14', x: '16', y: '5', rx: '2' }], ['rect', { width: '6', height: '10', x: '6', y: '7', rx: '2' }]])({ displayName: 'AlignHorizontalJustifyEnd' });
const PhoneIcon = createIcon([['path', { d: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" }]])({ displayName: 'Phone' });
const Link2Icon = createIcon([['path', { d: "M9 17H7A5 5 0 0 1 7 7h2" }], ['path', { d: "M15 7h2a5 5 0 1 1 0 10h-2" }], ['line', { x1: "8", y1: "12", x2: "16", y2: "12" }]])({ displayName: 'Link2' });
const PaletteIcon = createIcon([['circle', { cx: '13.5', cy: '6.5', r: '.5' }], ['circle', { cx: '17.5', cy: '10.5', r: '.5' }], ['circle', { cx: '8.5', cy: '7.5', r: '.5' }], ['circle', { cx: '6.5', cy: '12.5', r: '.5' }], ['path', { d: 'M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.668 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z' }]])({ displayName: 'Palette' });
const ClockIcon = createIcon([['circle', { cx: '12', cy: '12', r: '10' }], ['polyline', { points: '12 6 12 12 16 14' }]])({ displayName: 'Clock' });
const CalendarRangeIcon = createIcon([['rect', { width: '18', height: '18', x: '3', y: '4', rx: '2', ry: '2' }], ['line', { x1: '16', y1: '2', x2: '16', y2: '6' }], ['line', { x1: '8', y1: '2', x2: '8', y2: '6' }], ['line', { x1: '3', y1: '10', x2: '21', y2: '10' }], ['path', { d: 'M10 14h4' }], ['path', { d: 'M12 12v4' }], ['path', { d: 'M10 18h4' }]])({ displayName: 'CalendarRange' });

const Accordion: FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="border-b border-gray-700">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center py-3 text-left text-sm font-medium text-gray-200 hover:bg-gray-800/50 px-2 rounded-md cursor-pointer">
                <span>{title}</span>
                <ChevronDownIcon size={16} className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && <div className="p-3 bg-gray-800/30"><div className="space-y-4">{children}</div></div>}
        </div>
    );
};

const Notification: FC<{ notification: NotificationType; onClose: () => void }> = ({ notification, onClose }) => {
    if (!notification.visible) return null;
    const baseClasses = "fixed top-5 right-5 z-50 p-4 rounded-lg shadow-lg text-white flex items-center";
    const typeClasses = { success: "bg-green-600/90", error: "bg-red-600/90" };
    return (
        <div className={`${baseClasses} ${typeClasses[notification.type]}`}>
            <span className="mr-3">{notification.message}</span>
            <button onClick={onClose} className="text-xl font-bold">&times;</button>
        </div>
    );
};

const DefaultLoader: FC<{ color?: string }> = ({ color = 'currentColor' }) => <div className="w-4 h-4 border-2 border-t-2 rounded-full animate-spin" style={{ borderColor: color, borderTopColor: 'transparent' }}></div>;
const DotsLoader: FC<{ color?: string }> = ({ color = 'currentColor' }) => (
    <div className="flex space-x-1">
        <span className="sr-only">Loading...</span>
        <div className="h-2 w-2 rounded-full animate-bounce [animation-delay:-0.3s]" style={{ backgroundColor: color }}></div>
        <div className="h-2 w-2 rounded-full animate-bounce [animation-delay:-0.15s]" style={{ backgroundColor: color }}></div>
        <div className="h-2 w-2 rounded-full animate-bounce" style={{ backgroundColor: color }}></div>
    </div>
);
const SpinnerLoader: FC<{ color?: string }> = ({ color = 'currentColor' }) => <div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin" style={{ borderColor: color, borderTopColor: 'transparent' }}></div>;
const BarLoader: FC<{ color?: string }> = ({ color = 'currentColor' }) => <div className="w-5 h-2 bg-gradient-to-r animate-pulse" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}></div>;
const PulseLoader: FC<{ color?: string }> = ({ color = 'currentColor' }) => <div className="w-4 h-4 rounded-full animate-ping" style={{ backgroundColor: color }}></div>;

const getLoaderComponent = (type: LoaderSettings['type'] = 'default', color?: string) => {
    switch (type) {
        case 'dots': return <DotsLoader color={color} />;
        case 'spinner': return <SpinnerLoader color={color} />;
        case 'bar': return <BarLoader color={color} />;
        case 'pulse': return <PulseLoader color={color} />;
        case 'custom': return null;
        default: return <DefaultLoader color={color} />;
    }
};

const fieldTypes: { type: FieldType; label: string; icon: FC<IconProps> }[] = [
    { type: 'section', label: 'Section', icon: SectionIcon },
    { type: 'name', label: 'Name', icon: UserIcon },
    { type: 'address', label: 'Address', icon: HomeIcon },
    { type: 'heading', label: 'Heading', icon: Heading1Icon },
    { type: 'paragraph', label: 'Paragraph', icon: PilcrowIcon },
    { type: 'ordered-list', label: 'Ordered List', icon: ListOrderedIcon },
    { type: 'unordered-list', label: 'Unordered List', icon: ListIcon },
    { type: 'text', label: 'Text Input', icon: TypeIcon },
    { type: 'email', label: 'Email', icon: MailIcon },
    { type: 'number', label: 'Number', icon: HashIcon },
    { type: 'password', label: 'Password', icon: KeyRoundIcon },
    { type: 'tel', label: 'Phone', icon: PhoneIcon },
    { type: 'url', label: 'URL', icon: Link2Icon },
    { type: 'textarea', label: 'Text Area', icon: TextareaIcon },
    { type: 'select', label: 'Dropdown', icon: ChevronDownIcon },
    { type: 'checkbox', label: 'Checkbox', icon: CheckSquareIcon },
    { type: 'radio', label: 'Radio Group', icon: RadioTowerIcon },
    { type: 'date', label: 'Date Picker', icon: CalendarIcon },
    { type: 'time', label: 'Time Picker', icon: ClockIcon },
    { type: 'month', label: 'Month Picker', icon: CalendarRangeIcon },
    { type: 'week', label: 'Week Picker', icon: CalendarRangeIcon },
    { type: 'range', label: 'Range Slider', icon: GitCommitHorizontalIcon },
    { type: 'color', label: 'Color Picker', icon: PaletteIcon },
    { type: 'file', label: 'File Upload', icon: FileUpIcon },
    { type: 'signature', label: 'Signature', icon: SignatureIcon },
    { type: 'rating', label: 'Rating', icon: StarIcon },
    { type: 'image', label: 'Image', icon: ImageIcon },
    { type: 'hr', label: 'Horizontal Line', icon: HrIcon },
];

const defaultFieldStyles: FieldStyles = { color: '#000000', backgroundColor: 'transparent', borderColor: '', fontSize: '16px', fontWeight: 'normal', textAlign: 'left', padding: '1rem', listStyleType: 'disc', custom: [], controlStyle: 'default', desktop: { width: '100%', fontSize: '16px', height: 'auto', display: 'block' }, tablet: { width: '100%', fontSize: '15px', height: 'auto', display: 'block' }, mobile: { width: '100%', fontSize: '14px', height: 'auto', display: 'block' } };
const defaultSettings: FormSettings = { prefillFromAPI: false, prefillApiUrl: '', postOnSubmit: false, postApiUrl: '', loader: { type: 'default' }, submitSuccessMessage: 'Form submitted successfully!', submitErrorMessage: 'There was an error submitting your form.', submitLoader: { type: 'default', color: '#FFFFFF' }, enableThankYouPage: false, thankYouPageContent: [{ id: `ty_heading_${Date.now()}`, type: 'heading', label: 'Thank You!', width: '100%', styles: { ...defaultFieldStyles, color: '#000000' } }, { id: `ty_paragraph_${Date.now() + 1}`, type: 'paragraph', label: 'Your submission has been received.', width: '100%', styles: { ...defaultFieldStyles, color: '#000000' } }], pageTracker: 'none', pageTrackerColor: '#4F46E5', pageTrackerBgColor: '#E5E7EB' };
const defaultStyles: FormStyles = { backgroundType: 'color', backgroundColor: '#FFFFFF', backgroundImage: '', textColor: '#000000', fieldBackgroundColor: 'transparent', fieldBorderColor: '#D1D5DB', buttonBackgroundColor: '#4F46E5', buttonTextColor: '#FFFFFF', buttonText: 'Submit', buttonPosition: 'left', buttonWidth: 'auto', buttonHeight: 'auto', gap: 16, nextButtonText: 'Next', nextButtonBackgroundColor: '#4F46E5', nextButtonTextColor: '#FFFFFF', nextButtonWidth: 'auto', nextButtonHeight: 'auto', prevButtonText: 'Previous', prevButtonBackgroundColor: '#6B7280', prevButtonTextColor: '#FFFFFF', prevButtonWidth: 'auto', prevButtonHeight: 'auto', formAlignment: 'center', desktop: {}, tablet: {}, mobile: {} };

const commonCssProperties = [
    {
      label: 'Text & Font',
      options: [
        { value: 'color', label: 'Color' }, { value: 'fontFamily', label: 'Font Family' }, { value: 'fontSize', label: 'Font Size' }, { value: 'fontStyle', label: 'Font Style' }, { value: 'fontWeight', label: 'Font Weight' }, { value: 'letterSpacing', label: 'Letter Spacing' }, { value: 'lineHeight', label: 'Line Height' }, { value: 'textAlign', label: 'Text Align' }, { value: 'textDecoration', label: 'Text Decoration' }, { value: 'textShadow', label: 'Text Shadow' }, { value: 'textTransform', label: 'Text Transform' }, { value: 'whiteSpace', label: 'White Space' },
      ],
    },
    {
      label: 'Background & Borders',
      options: [
        { value: 'background', label: 'Background' }, { value: 'backgroundColor', label: 'Background Color' }, { value: 'backgroundImage', label: 'Background Image' }, { value: 'backgroundPosition', label: 'Background Position' }, { value: 'backgroundRepeat', label: 'Background Repeat' }, { value: 'backgroundSize', label: 'Background Size' }, { value: 'border', label: 'Border (All)' }, { value: 'borderBottom', label: 'Border Bottom' }, { value: 'borderColor', label: 'Border Color' }, { value: 'borderLeft', label: 'Border Left' }, { value: 'borderRadius', label: 'Border Radius' }, { value: 'borderRight', label: 'Border Right' }, { value: 'borderStyle', label: 'Border Style' }, { value: 'borderTop', label: 'Border Top' }, { value: 'borderWidth', label: 'Border Width' }, { value: 'boxShadow', label: 'Box Shadow' }, { value: 'outline', label: 'Outline' },
      ],
    },
    {
      label: 'Box Model & Sizing',
      options: [
        { value: 'height', label: 'Height' }, { value: 'width', label: 'Width' }, { value: 'maxHeight', label: 'Max Height' }, { value: 'maxWidth', label: 'Max Width' }, { value: 'minHeight', label: 'Min Height' }, { value: 'minWidth', label: 'Min Width' }, { value: 'margin', label: 'Margin (All)' }, { value: 'marginBottom', label: 'Margin Bottom' }, { value: 'marginLeft', label: 'Margin Left' }, { value: 'marginRight', label: 'Margin Right' }, { value: 'marginTop', label: 'Margin Top' }, { value: 'padding', label: 'Padding (All)' }, { value: 'paddingBottom', label: 'Padding Bottom' }, { value: 'paddingLeft', label: 'Padding Left' }, { value: 'paddingRight', label: 'Padding Right' }, { value: 'paddingTop', label: 'Padding Top' },
      ],
    },
    {
      label: 'Layout & Display',
      options: [
        { value: 'display', label: 'Display' }, { value: 'position', label: 'Position' }, { value: 'top', label: 'Top' }, { value: 'right', label: 'Right' }, { value: 'bottom', label: 'Bottom' }, { value: 'left', label: 'Left' }, { value: 'zIndex', label: 'Z-Index' }, { value: 'overflow', label: 'Overflow' }, { value: 'cursor', label: 'Cursor' }, { value: 'opacity', label: 'Opacity' },
      ],
    },
    {
      label: 'Transforms & Transitions',
      options: [
        { value: 'transform', label: 'Transform' }, { value: 'transformOrigin', label: 'Transform Origin' }, { value: 'transition', label: 'Transition' },
      ],
    },
];

export default function EditorPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const params = useParams();
    const formId = params?.formId as string;
    const [form, setForm, undo, redo, canUndo, canRedo] = useHistory<Form | null>(null);
    const [lastDraftState, setLastDraftState] = useState<Form | null>(null);
    const [lastPublishedState, setLastPublishedState] = useState<Form | null>(null);
    const [hasUnsavedDraftChanges, setHasUnsavedDraftChanges] = useState(false);
    const [hasUnpublishedChanges, setHasUnpublishedChanges] = useState(false);
    const [selectedField, setSelectedField] = useState<FormField | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [isBrowser, setIsBrowser] = useState(false);
    const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop');
    const [showPublishModal, setShowPublishModal] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [showHistoryPanel, setShowHistoryPanel] = useState(false);
    const [historyTab, setHistoryTab] = useState<'saved' | 'published'>('saved');
    const [saveHistory, setSaveHistory] = useState<any[]>([]);
    const [publishHistory, setPublishHistory] = useState<any[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [notification, setNotification] = useState<NotificationType>({ message: '', type: 'success', visible: false });
    const [isPaletteOpen, setIsPaletteOpen] = useState(false);
    const [isPropertiesOpen, setIsPropertiesOpen] = useState(false);
    const [currentPageIndex, setCurrentPageIndex] = useState(0);

    useEffect(() => { setIsBrowser(true); }, []);

    const showNotification = useCallback((message: string, type: 'success' | 'error') => {
        setNotification({ message, type, visible: true });
        setTimeout(() => {
            setNotification(prev => ({ ...prev, visible: false }));
        }, 3000);
    }, []);

    useEffect(() => {
        if (user && formId) {
            const fetchInitialData = async () => {
                setLoading(true);
                const token = await user.getIdToken();
                const headers = { 'Authorization': `Bearer ${token}` };

                try {
                    const [draftRes, publishesRes] = await Promise.all([
                        fetch(`/api/forms/${formId}`, { headers }),
                        fetch(`/api/forms/${formId}/history/publishes`, { headers })
                    ]);

                    if (!draftRes.ok) {
                        router.push('/dashboard');
                        return;
                    }

                    const data = await draftRes.json();
                    
                    const validatedForm: Form = {
                        ...data,
                        pages: data.pages ? data.pages.map((page: FormPage) => ({
                            ...page,
                            fields: page.fields.map((field: FormField) => ({
                                ...field,
                                requiredErrorMessage: field.requiredErrorMessage || '',
                                styles: {
                                    ...defaultFieldStyles,
                                    ...(field.styles || {}),
                                    desktop: { ...defaultFieldStyles.desktop, ...(field.styles?.desktop || {}) },
                                    tablet: { ...defaultFieldStyles.tablet, ...(field.styles?.tablet || {}) },
                                    mobile: { ...defaultFieldStyles.mobile, ...(field.styles?.mobile || {}) },
                                },
                                conditions: field.conditions || [],
                                conditionLogic: field.conditionLogic || 'and',
                                requiredConditions: field.requiredConditions || { enabled: false, logic: 'and', conditions: [] },
                            })),
                            styles: { ...defaultStyles, ...(page.styles || {}) }
                        })) : [{ id: `page_${Date.now()}`, name: 'Page 1', fields: data.fields || [], styles: {} }],
                        styles: {
                            ...defaultStyles,
                            ...data.styles,
                            desktop: { ...defaultStyles.desktop, ...(data.styles?.desktop || {}) },
                            tablet: { ...defaultStyles.tablet, ...(data.styles?.tablet || {}) },
                            mobile: { ...defaultStyles.mobile, ...(data.styles?.mobile || {}) },
                        },
                        settings: {
                            ...defaultSettings,
                            ...data.settings,
                            loader: { ...defaultSettings.loader, ...(data.settings?.loader || {}) },
                            submitLoader: { ...defaultSettings.submitLoader, ...(data.settings?.submitLoader || {}) },
                            thankYouPageContent: data.settings?.thankYouPageContent || defaultSettings.thankYouPageContent,
                            pageTracker: data.settings?.pageTracker || defaultSettings.pageTracker,
                            pageTrackerColor: data.settings?.pageTrackerColor || defaultSettings.pageTrackerColor,
                            pageTrackerBgColor: data.settings?.pageTrackerBgColor || defaultSettings.pageTrackerBgColor,
                        }
                    };

                    setForm(validatedForm, true);
                    setLastDraftState(JSON.parse(JSON.stringify(validatedForm)));

                    if (publishesRes.ok) {
                        const publishesData = await publishesRes.json();
                        setLastPublishedState(publishesData.length > 0 ? publishesData[0] : null);
                    } else {
                        setLastPublishedState(null);
                    }

                } catch (error) {
                    console.error("Failed to fetch form data:", error);
                    showNotification('Failed to load form data.', 'error');
                } finally {
                    setLoading(false);
                }
            };
            fetchInitialData();
        }
    }, [user, formId, router, setForm, showNotification]);

    useEffect(() => {
        if (form && lastDraftState) {
            const isDifferent = JSON.stringify(form) !== JSON.stringify(lastDraftState);
            setHasUnsavedDraftChanges(isDifferent);
        }
    }, [form, lastDraftState]);

    useEffect(() => {
        if (form && lastPublishedState) {
            const isDifferent = JSON.stringify(form.pages) !== JSON.stringify(lastPublishedState.pages) ||
                JSON.stringify(form.styles) !== JSON.stringify(lastPublishedState.styles) ||
                JSON.stringify(form.settings) !== JSON.stringify(lastPublishedState.settings) ||
                form.title !== lastPublishedState.title;
            setHasUnpublishedChanges(isDifferent);
        } else if (form && !lastPublishedState) {
            setHasUnpublishedChanges(true);
        }
    }, [form, lastPublishedState]);

    const fetchHistory = async () => {
        if (!user || !formId || historyLoading) return;
        setHistoryLoading(true);
        try {
            const token = await user.getIdToken();
            const headers = { 'Authorization': `Bearer ${token}` };
            const [savesRes, publishesRes] = await Promise.all([
                fetch(`/api/forms/${formId}/history/saves`, { headers }),
                fetch(`/api/forms/${formId}/history/publishes`, { headers })
            ]);
            if (savesRes.ok) setSaveHistory(await savesRes.json());
            if (publishesRes.ok) setPublishHistory(await publishesRes.json());
        } catch (error) {
            console.error("Failed to fetch form history", error);
            showNotification('Could not load form history.', 'error');
        } finally {
            setHistoryLoading(false);
        }
    };

    const handleRestoreVersion = (versionData: any) => {
        if (!form) return;
        const { title, pages, styles, settings } = versionData;
        const restoredForm = { ...form, title, pages, styles, settings };
        setForm(restoredForm, false);
        setShowHistoryPanel(false);
        showNotification('Version restored successfully!', 'success');
    };
    
    const updateForm = (newProps: Partial<Form>) => {
        setForm(prev => prev ? { ...prev, ...newProps } : null);
    };

    const updateFormSettings = (newSettings: Partial<FormSettings>) => {
        setForm(prev => prev ? { ...prev, settings: { ...prev.settings, ...newSettings } } : null);
    };

    const updateFormResponsiveStyle = (newStyles: Partial<ResponsiveGlobalStyles>, device: PreviewMode) => {
        if (!form) return;
        setForm(prev => {
            if (!prev) return null;
            const existingStyles = prev.styles || { ...defaultStyles };
            const existingDeviceStyles = existingStyles[device] || {};
            return {
                ...prev,
                styles: {
                    ...existingStyles,
                    [device]: {
                        ...existingDeviceStyles,
                        ...newStyles
                    }
                }
            };
        });
    };

    const updatePage = (pageId: string, newProps: Partial<FormPage>) => {
        if (!form) return;
        const newPages = form.pages.map(page =>
            page.id === pageId ? { ...page, ...newProps } : page
        );
        updateForm({ pages: newPages });
    };

    const addPage = () => {
        if (!form) return;
        const newPage: FormPage = {
            id: `page_${Date.now()}`,
            name: `Page ${form.pages.length + 1}`,
            fields: [],
            styles: {}
        };
        updateForm({ pages: [...form.pages, newPage] });
        setCurrentPageIndex(form.pages.length);
    };

    const deletePage = (pageId: string) => {
        if (!form || form.pages.length === 1) return;
        const newPages = form.pages.filter(page => page.id !== pageId);
        updateForm({ pages: newPages });
        if (currentPageIndex >= newPages.length) {
            setCurrentPageIndex(newPages.length - 1);
        }
        setSelectedField(null);
    };

    const findAndUpdateField = (fields: FormField[], id: string, updateFn: (field: FormField) => FormField): [FormField[], FormField | null] => {
        let updatedField: FormField | null = null;
        const newFields = fields.map((f: FormField) => {
            if (f.id === id) {
                const result = updateFn(f);
                updatedField = result;
                return result;
            }
            if (['section', 'address', 'name'].includes(f.type) && f.fields) {
                const [recursedFields, foundField] = findAndUpdateField(f.fields, id, updateFn);
                if (foundField) updatedField = foundField;
                return { ...f, fields: recursedFields };
            }
            return f;
        });
        return [newFields, updatedField];
    };

    const updateField = (id: string, newProps: Partial<FormField>) => {
        if (!form) return;
        const isThankYouPageField = form.settings.enableThankYouPage && form.settings.thankYouPageContent.some(f => f.id === id);

        if (isThankYouPageField) {
            const [newThankYouPageContent, updatedField] = findAndUpdateField(form.settings.thankYouPageContent, id, (field: FormField) => ({ ...field, ...newProps }));
            updateFormSettings({ thankYouPageContent: newThankYouPageContent });
            if (selectedField?.id === id && updatedField) {
                setSelectedField(updatedField);
            }
        } else {
            const currentPageFields = form.pages[currentPageIndex].fields;
            const [newFields, updatedField] = findAndUpdateField(currentPageFields, id, (field: FormField) => ({ ...field, ...newProps }));
            const newPages = form.pages.map((page, idx) =>
                idx === currentPageIndex ? { ...page, fields: newFields } : page
            );
            updateForm({ pages: newPages });
            if (selectedField?.id === id && updatedField) {
                setSelectedField(updatedField);
            }
        }
    };

    const updateFieldResponsiveStyle = (id: string, newStyles: Partial<ResponsiveFieldStyles>, device: PreviewMode) => {
        if (!form) return;
        const isThankYouPageField = form.settings.enableThankYouPage && form.settings.thankYouPageContent.some(f => f.id === id);

        if (isThankYouPageField) {
            const [newThankYouPageContent, updatedField] = findAndUpdateField(form.settings.thankYouPageContent, id, (field: FormField) => {
                const existingStyles = field.styles || { ...defaultFieldStyles };
                const existingDeviceStyles = existingStyles[device] || {};
                return { ...field, styles: { ...existingStyles, [device]: { ...existingDeviceStyles, ...newStyles } } };
            });
            updateFormSettings({ thankYouPageContent: newThankYouPageContent });
            if (selectedField?.id === id && updatedField) {
                setSelectedField(updatedField);
            }
        } else {
            const currentPageFields = form.pages[currentPageIndex].fields;
            const [newFields, updatedField] = findAndUpdateField(currentPageFields, id, (field: FormField) => {
                const existingStyles = field.styles || { ...defaultFieldStyles };
                const existingDeviceStyles = existingStyles[device] || {};
                return { ...field, styles: { ...existingStyles, [device]: { ...existingDeviceStyles, ...newStyles } } };
            });
            const newPages = form.pages.map((page, idx) =>
                idx === currentPageIndex ? { ...page, fields: newFields } : page
            );
            updateForm({ pages: newPages });
            if (selectedField?.id === id && updatedField) {
                setSelectedField(updatedField);
            }
        }
    };

    const updateFieldBaseStyle = (id: string, newStyles: Partial<Omit<FieldStyles, 'desktop' | 'tablet' | 'mobile'>>) => {
        if (!form) return;
        const isThankYouPageField = form.settings.enableThankYouPage && form.settings.thankYouPageContent.some(f => f.id === id);

        if (isThankYouPageField) {
            const [newThankYouPageContent, updatedField] = findAndUpdateField(form.settings.thankYouPageContent, id, (field: FormField) => {
                const existingStyles = field.styles || { ...defaultFieldStyles };
                return { ...field, styles: { ...existingStyles, ...newStyles } };
            });
            updateFormSettings({ thankYouPageContent: newThankYouPageContent });
            if (selectedField?.id === id && updatedField) {
                setSelectedField(updatedField);
            }
        } else {
            const currentPageFields = form.pages[currentPageIndex].fields;
            const [newFields, updatedField] = findAndUpdateField(currentPageFields, id, (field: FormField) => {
                const existingStyles = field.styles || { ...defaultFieldStyles };
                return { ...field, styles: { ...existingStyles, ...newStyles } };
            });
            const newPages = form.pages.map((page, idx) =>
                idx === currentPageIndex ? { ...page, fields: newFields } : page
            );
            updateForm({ pages: newPages });
            if (selectedField?.id === id && updatedField) {
                setSelectedField(updatedField);
            }
        }
    };

    const addField = (type: FieldType, sectionId?: string, toThankYouPage: boolean = false) => {
        if (!form) return;
        const hasOptions = ['select', 'radio', 'checkbox', 'ordered-list', 'unordered-list'].includes(type);
        const newField: FormField = { id: `field_${Date.now()}`, type, label: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`, name: `field_${Date.now()}`, fieldId: `field_${Date.now()}`, placeholder: '', required: false, requiredErrorMessage: '', options: hasOptions ? [{ label: 'List Item 1', value: 'item_1' }] : [], layout: 'vertical', width: '100%', styles: { ...defaultFieldStyles }, conditions: [], conditionLogic: 'and', requiredConditions: { enabled: false, logic: 'and', conditions: [] }, fields: ['section', 'address', 'name'].includes(type) ? [] : undefined, };

        const createSubField = (label: string, width: FieldWidth = '100%'): FormField => {
            const subId = `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            return {
                id: subId, type: 'text', label, name: `${label.toLowerCase().replace(/[\s/]+/g, '_')}_${Date.now()}`, fieldId: subId, width,
                styles: { ...defaultFieldStyles, desktop: {...defaultFieldStyles.desktop, width}, tablet: {...defaultFieldStyles.tablet, width}, mobile: {...defaultFieldStyles.mobile, width: '100%'} },
                required: false, requiredErrorMessage: '', conditions: [], conditionLogic: 'and', requiredConditions: { enabled: false, logic: 'and', conditions: [] },
            };
        };

        if (type === 'address') {
            newField.label = 'Address';
            newField.fields = [
                createSubField('Street Address', '100%'),
                createSubField('Street Address Line 2', '100%'),
                createSubField('City', '50%'),
                createSubField('State / Province', '50%'),
                createSubField('Postal / ZIP Code', '50%'),
                createSubField('Country', '50%'),
            ];
        } else if (type === 'name') {
            newField.label = 'Name';
            newField.fields = [
                createSubField('First Name', '50%'),
                createSubField('Last Name', '50%'),
            ];
        } else if (type === 'rating') {
            newField.maxRating = 5;
        } else if (type === 'image') {
            newField.src = 'https://via.placeholder.com/400x200';
            newField.label = 'Descriptive Label';
        }

        if (toThankYouPage) {
            updateFormSettings({ thankYouPageContent: [...(form.settings.thankYouPageContent || []), newField] });
        } else {
            const currentPage = form.pages[currentPageIndex];
            let newPageFields;

            if (sectionId) {
                const [updatedFields] = findAndUpdateField(currentPage.fields, sectionId, (section: FormField) => ({
                    ...section,
                    fields: [...(section.fields || []), newField]
                }));
                newPageFields = updatedFields;
            } else {
                newPageFields = [...currentPage.fields, newField];
            }

            const newPages = form.pages.map((page, idx) =>
                idx === currentPageIndex ? { ...page, fields: newPageFields } : page
            );
            updateForm({ pages: newPages });
        }
    };

    const deleteField = (id: string) => {
        if (!form) return;
        const filterFields = (fields: FormField[]): FormField[] => {
            return fields.filter(f => f.id !== id).map(f => {
                if (['section', 'address', 'name'].includes(f.type) && f.fields) {
                    return { ...f, fields: filterFields(f.fields) };
                }
                return f;
            });
        };
        
        const isThankYouPageField = form.settings.enableThankYouPage && form.settings.thankYouPageContent.some(f => f.id === id);

        if (isThankYouPageField) {
            const newThankYouPageContent = filterFields(form.settings.thankYouPageContent || []);
            updateFormSettings({ thankYouPageContent: newThankYouPageContent });
        } else {
            const newPageFields = filterFields(form.pages[currentPageIndex].fields);
            const newPages = form.pages.map((page, idx) =>
                idx === currentPageIndex ? { ...page, fields: newPageFields } : page
            );
            updateForm({ pages: newPages });
        }
        
        if (selectedField?.id === id) {
            setSelectedField(null);
        }
    };

    const updateOption = (fieldId: string, optionIndex: number, newOption: Partial<FieldOption>) => {
        if (!form) return;
        const isThankYouPageField = form.settings.enableThankYouPage && form.settings.thankYouPageContent.some(f => f.id === fieldId);

        if (isThankYouPageField) {
            const [newThankYouPageContent, updatedField] = findAndUpdateField(form.settings.thankYouPageContent, fieldId, (field: FormField) => {
                if (!field.options) return field;
                const newOptions = [...field.options];
                newOptions[optionIndex] = { ...newOptions[optionIndex], ...newOption };
                return { ...field, options: newOptions };
            });
            updateFormSettings({ thankYouPageContent: newThankYouPageContent });
            if (selectedField?.id === fieldId && updatedField) {
                setSelectedField(updatedField);
            }
        } else {
            const currentPageFields = form.pages[currentPageIndex].fields;
            const [newFields, updatedField] = findAndUpdateField(currentPageFields, fieldId, (field: FormField) => {
                if (!field.options) return field;
                const newOptions = [...field.options];
                newOptions[optionIndex] = { ...newOptions[optionIndex], ...newOption };
                return { ...field, options: newOptions };
            });
            const newPages = form.pages.map((page, idx) =>
                idx === currentPageIndex ? { ...page, fields: newFields } : page
            );
            updateForm({ pages: newPages });
            if (selectedField?.id === fieldId && updatedField) {
                setSelectedField(updatedField);
            }
        }
    };

    const addOption = (fieldId: string) => {
        if (!form) return;
        const isThankYouPageField = form.settings.enableThankYouPage && form.settings.thankYouPageContent.some(f => f.id === fieldId);

        if (isThankYouPageField) {
            const [newThankYouPageContent, updatedField] = findAndUpdateField(form.settings.thankYouPageContent, fieldId, (field: FormField) => {
                const optionCount = (field.options?.length || 0) + 1;
                const newOptions = [...(field.options || []), { label: `Item ${optionCount}`, value: `item_${optionCount}` }];
                return { ...field, options: newOptions };
            });
            updateFormSettings({ thankYouPageContent: newThankYouPageContent });
            if (selectedField?.id === fieldId && updatedField) {
                setSelectedField(updatedField);
            }
        } else {
            const currentPageFields = form.pages[currentPageIndex].fields;
            const [newFields, updatedField] = findAndUpdateField(currentPageFields, fieldId, (field: FormField) => {
                const optionCount = (field.options?.length || 0) + 1;
                const newOptions = [...(field.options || []), { label: `Item ${optionCount}`, value: `item_${optionCount}` }];
                return { ...field, options: newOptions };
            });
            const newPages = form.pages.map((page, idx) =>
                idx === currentPageIndex ? { ...page, fields: newFields } : page
            );
            updateForm({ pages: newPages });
            if (selectedField?.id === fieldId && updatedField) {
                setSelectedField(updatedField);
            }
        }
    };

    const removeOption = (fieldId: string, optionIndex: number) => {
        if (!form) return;
        const isThankYouPageField = form.settings.enableThankYouPage && form.settings.thankYouPageContent.some(f => f.id === fieldId);

        if (isThankYouPageField) {
            const [newThankYouPageContent, updatedField] = findAndUpdateField(form.settings.thankYouPageContent, fieldId, (field: FormField) => {
                if (!field.options) return field;
                const newOptions = [...field.options];
                newOptions.splice(optionIndex, 1);
                return { ...field, options: newOptions };
            });
            updateFormSettings({ thankYouPageContent: newThankYouPageContent });
            if (selectedField?.id === fieldId && updatedField) {
                setSelectedField(updatedField);
            }
        } else {
            const currentPageFields = form.pages[currentPageIndex].fields;
            const [newFields, updatedField] = findAndUpdateField(currentPageFields, fieldId, (field: FormField) => {
                if (!field.options) return field;
                const newOptions = [...field.options];
                newOptions.splice(optionIndex, 1);
                return { ...field, options: newOptions };
            });
            const newPages = form.pages.map((page, idx) =>
                idx === currentPageIndex ? { ...page, fields: newFields } : page
            );
            updateForm({ pages: newPages });
            if (selectedField?.id === fieldId && updatedField) {
                setSelectedField(updatedField);
            }
        }
    };

    const onDragEnd = (result: DropResult) => {
        const { source, destination } = result;
        if (!destination || !form) return;

        const isSourceThankYouPage = source.droppableId === 'thank-you-page-canvas';
        const isDestinationThankYouPage = destination.droppableId === 'thank-you-page-canvas';

        let sourceFields = isSourceThankYouPage ? [...(form.settings.thankYouPageContent || [])] : JSON.parse(JSON.stringify(form.pages[currentPageIndex].fields));
        let destFields = isDestinationThankYouPage ? [...(form.settings.thankYouPageContent || [])] : JSON.parse(JSON.stringify(form.pages[currentPageIndex].fields));
        
        const findSubArray = (fields: FormField[], droppableId: string): FormField[] | null => {
            if (droppableId === `form-canvas-page-${currentPageIndex}` || droppableId === 'thank-you-page-canvas') return fields;
            for (const field of fields) {
                if (`section-${field.id}` === droppableId) return field.fields || [];
                if (field.fields) {
                    const found = findSubArray(field.fields, droppableId);
                    if (found) return found;
                }
            }
            return null;
        };

        const updateSubArray = (fields: FormField[], droppableId: string, newSubArray: FormField[]): FormField[] => {
            if (droppableId === `form-canvas-page-${currentPageIndex}` || droppableId === 'thank-you-page-canvas') return newSubArray;
            return fields.map(field => {
                if (`section-${field.id}` === droppableId) return { ...field, fields: newSubArray };
                if (field.fields) return { ...field, fields: updateSubArray(field.fields, droppableId, newSubArray) };
                return field;
            });
        };

        const currentSourceArray = findSubArray(sourceFields, source.droppableId);
        const currentDestArray = source.droppableId === destination.droppableId ? currentSourceArray : findSubArray(destFields, destination.droppableId);

        if (!currentSourceArray || !currentDestArray) return;

        const [movedItem] = currentSourceArray.splice(source.index, 1);
        currentDestArray.splice(destination.index, 0, movedItem);

        let newFormState = { ...form };

        if (isSourceThankYouPage) {
            newFormState = {
                ...newFormState,
                settings: {
                    ...newFormState.settings,
                    thankYouPageContent: updateSubArray(form.settings.thankYouPageContent || [], source.droppableId, currentSourceArray)
                }
            };
        } else {
            const newPages = newFormState.pages.map((page, idx) =>
                idx === currentPageIndex ? { ...page, fields: updateSubArray(page.fields, source.droppableId, currentSourceArray) } : page
            );
            newFormState = { ...newFormState, pages: newPages };
        }

        if (isDestinationThankYouPage) {
            newFormState = {
                ...newFormState,
                settings: {
                    ...newFormState.settings,
                    thankYouPageContent: updateSubArray(newFormState.settings.thankYouPageContent || [], destination.droppableId, currentDestArray)
                }
            };
        } else if (!isSourceThankYouPage && source.droppableId !== destination.droppableId) {
             const newPages = newFormState.pages.map((page, idx) =>
                idx === currentPageIndex ? { ...page, fields: updateSubArray(page.fields, destination.droppableId, currentDestArray) } : page
            );
            newFormState = { ...newFormState, pages: newPages };
        }
        
        setForm(newFormState);
    };

    const updateLiveVersion = async (formData: Form) => {
        if (!user) return;
        const token = await user.getIdToken();
        try {
            const res = await fetch(`/api/forms/${formData.id}/update-live-version`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (!res.ok) throw new Error('Failed to update live version.');
            console.log('Live version updated successfully.');
        } catch (error) {
            console.error("Failed to update live version:", error);
            showNotification('Could not sync live version.', 'error');
        }
    };

    const saveForm = async () => {
        if (!user || !form) return;
        setSaving(true);
        const token = await user.getIdToken();
        try {
            const res = await fetch(`/api/forms/${formId}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: form.title, pages: form.pages, styles: form.styles, settings: form.settings }),
            });
            if (!res.ok) throw new Error("Failed to save.");
            const savedFormState = JSON.parse(JSON.stringify(form));
            setLastDraftState(savedFormState);
            showNotification(form.settings.submitSuccessMessage, 'success');
        } catch (error) {
            console.error("Failed to save form:", error);
            showNotification(form.settings.submitErrorMessage, 'error');
        }
        finally { setSaving(false); }
    };

    const publishForm = async () => {
        if (!user || !form) return;
        setPublishing(true);
        const token = await user.getIdToken();
        try {
            await saveForm();

            const publishRes = await fetch(`/api/forms/${formId}/publish`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            if (!publishRes.ok) {
                const errorData = await publishRes.text();
                throw new Error(errorData || "Failed to publish form.");
            }

            const publishedFormState = JSON.parse(JSON.stringify(form));
            setLastDraftState(publishedFormState);
            setLastPublishedState(publishedFormState);
            updateForm({ hasPublishedVersion: true });
            setShowPublishModal(true);
            showNotification(form.settings.submitSuccessMessage, 'success');

            await updateLiveVersion(publishedFormState);

        } catch (error) {
            console.error("Failed to publish form:", error);
            showNotification(form.settings.submitErrorMessage, 'error');
        } finally {
            setPublishing(false);
        }
    };

    const previewForm = () => {
        if (!form) return;
        localStorage.setItem(`form_preview_${form.id}`, JSON.stringify(form));
        window.open(`/form/owner/${form.id}`, '_blank');
    };

    const handleUndo = () => { undo(); showNotification('Undo successful.', 'success'); };
    const handleRedo = () => { redo(); showNotification('Redo successful.', 'success'); };

    if (authLoading || loading) { return <QuickFormLoader />; }
    if (!form) { return <div className="flex h-screen w-full items-center justify-center bg-gray-900 text-gray-400"><p>Form not found or failed to load.</p></div>; }

    const currentPage = form.pages[currentPageIndex];
    const isFirstPage = currentPageIndex === 0;
    const isLastPage = currentPageIndex === form.pages.length - 1;

    return (
        <div className="flex h-screen bg-gray-900 text-gray-200 overflow-hidden">
            <Notification notification={notification} onClose={() => setNotification(prev => ({ ...prev, visible: false }))} />
            <div className="hidden lg:flex flex-shrink-0 h-full">
                <FieldPalette onAddField={(type) => addField(type)} />
            </div>
            {isPaletteOpen && (
                <div className="lg:hidden fixed inset-0 z-50" onClick={() => setIsPaletteOpen(false)}>
                    <div className="absolute top-0 left-0 h-full bg-gray-900/80 backdrop-blur-lg border-r border-white/10 p-4 w-full max-w-xs" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white">Form Fields</h2>
                            <button onClick={() => setIsPaletteOpen(false)} className="text-gray-400 hover:text-white p-1 rounded-full"><XIcon size={24} /></button>
                        </div>
                        <FieldPalette onAddField={type => { addField(type); setIsPaletteOpen(false); }} />
                    </div>
                </div>
            )}
            <main className="flex-1 flex flex-col min-w-0">
                <Header
                    formTitle={form.title}
                    onFormTitleChange={title => updateForm({ title })}
                    onSave={saveForm}
                    saving={saving}
                    onPublish={publishForm}
                    onShare={() => setShowShareModal(true)}
                    onHistoryClick={() => { setShowHistoryPanel(true); setIsPropertiesOpen(true); fetchHistory(); }}
                    publishing={publishing}
                    onPreview={previewForm}
                    onUndo={handleUndo}
                    canUndo={canUndo}
                    onRedo={handleRedo}
                    canRedo={canRedo}
                    hasUnsavedDraftChanges={hasUnsavedDraftChanges}
                    hasUnpublishedChanges={hasUnpublishedChanges}
                    hasPublishedVersion={form.hasPublishedVersion || false}
                    previewMode={previewMode}
                    onPreviewModeChange={setPreviewMode}
                    onTogglePalette={() => setIsPaletteOpen(true)}
                    onToggleProperties={() => setIsPropertiesOpen(true)}
                    pages={form.pages}
                    currentPageIndex={currentPageIndex}
                    setCurrentPageIndex={setCurrentPageIndex}
                    addPage={addPage}
                    deletePage={deletePage}
                />
                <Canvas
                    form={form}
                    currentPage={currentPage}
                    currentPageIndex={currentPageIndex}
                    isFirstPage={isFirstPage}
                    isLastPage={isLastPage}
                    onPrevPage={() => setCurrentPageIndex(prev => Math.max(0, prev - 1))}
                    onNextPage={() => setCurrentPageIndex(prev => Math.min(form.pages.length - 1, prev + 1))}
                    previewMode={previewMode}
                    selectedField={selectedField}
                    onFieldSelect={(field) => { setSelectedField(field); if (window.innerWidth < 768) setIsPropertiesOpen(true);}}
                    onDragEnd={onDragEnd}
                    onFieldDelete={deleteField}
                    isBrowser={isBrowser}
                    isSubmitting={publishing}
                />
            </main>
            <div className="hidden md:flex flex-shrink-0 h-full">
                {showHistoryPanel ? (
                    <HistoryPanel onClose={() => setShowHistoryPanel(false)} activeTab={historyTab} setActiveTab={setHistoryTab} saveHistory={saveHistory} publishHistory={publishHistory} onRestore={handleRestoreVersion} isLoading={historyLoading} />
                ) : (
                    <PropertiesPanel
                        selectedField={selectedField}
                        form={form}
                        currentPage={currentPage}
                        onUpdatePage={updatePage}
                        previewMode={previewMode}
                        onUpdateField={updateField}
                        onUpdateFieldResponsiveStyle={updateFieldResponsiveStyle}
                        onUpdateFieldBaseStyle={updateFieldBaseStyle}
                        onUpdateOption={updateOption}
                        onAddOption={addOption}
                        onRemoveOption={removeOption}
                        onUpdateForm={updateForm}
                        onUpdateFormResponsiveStyle={updateFormResponsiveStyle}
                        onUpdateFormSettings={updateFormSettings}
                        addField={addField}
                        onFieldDelete={deleteField}
                    />
                )}
            </div>
            {isPropertiesOpen && (
                    <div className="md:hidden fixed inset-0 z-50" onClick={() => { setIsPropertiesOpen(false); setShowHistoryPanel(false); }}>
                        <div className="absolute top-0 right-0 h-full bg-gray-900/80 backdrop-blur-lg border-l border-white/10 w-full max-w-sm" onClick={e => e.stopPropagation()}>
                            {showHistoryPanel ? (
                                <HistoryPanel onClose={() => { setShowHistoryPanel(false); setIsPropertiesOpen(false); }} activeTab={historyTab} setActiveTab={setHistoryTab} saveHistory={saveHistory} publishHistory={publishHistory} onRestore={handleRestoreVersion} isLoading={historyLoading} />
                            ) : (
                                <PropertiesPanel
                                    selectedField={selectedField}
                                    form={form}
                                    currentPage={currentPage}
                                    onUpdatePage={updatePage}
                                    previewMode={previewMode}
                                    onUpdateField={updateField}
                                    onUpdateFieldResponsiveStyle={updateFieldResponsiveStyle}
                                    onUpdateFieldBaseStyle={updateFieldBaseStyle}
                                    onUpdateOption={updateOption}
                                    onAddOption={addOption}
                                    onRemoveOption={removeOption}
                                    onUpdateForm={updateForm}
                                    onUpdateFormResponsiveStyle={updateFormResponsiveStyle}
                                    onUpdateFormSettings={updateFormSettings}
                                    addField={addField}
                                    onFieldDelete={deleteField}
                                />
                            )}
                        </div>
                    </div>
            )}
            {showPublishModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full border border-white/10">
                        <h3 className="text-xl font-bold text-white">Form Published!</h3>
                        <p className="text-gray-400 mt-2 mb-4">Your form is now live and can be shared with the public link.</p>
                        <div className="flex items-center bg-gray-900/50 border border-white/10 rounded-lg p-2">
                            <input type="text" readOnly value={`${window.location.origin}/form/${formId}`} className="flex-1 bg-transparent text-gray-300 focus:outline-none min-w-0" />
                            <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/form/${formId}`); showNotification('Public URL copied!', 'success'); }} className="bg-indigo-600 text-white font-semibold py-1 px-3 rounded-md hover:bg-indigo-500 cursor-pointer">Copy</button>
                        </div>
                        <div className="text-right mt-6"><button onClick={() => setShowPublishModal(false)} className="bg-gray-700/80 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-600/80 cursor-pointer">Close</button></div>
                    </div>
                </div>
            )}
            {showShareModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full border border-white/10">
                        <h3 className="text-xl font-bold text-white">Share Form</h3>
                        <p className="text-gray-400 mt-2 mb-4">Anyone with the public link can view and submit this form.</p>
                        <div className="flex items-center bg-gray-900/50 border border-white/10 rounded-lg p-2">
                            <input type="text" readOnly value={`${window.location.origin}/form/${formId}`} className="flex-1 bg-transparent text-gray-300 focus:outline-none min-w-0" />
                            <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/form/${formId}`); showNotification('Public URL copied!', 'success'); }} className="bg-indigo-600 text-white font-semibold py-1 px-3 rounded-md hover:bg-indigo-500 cursor-pointer">Copy</button>
                        </div>
                        <div className="text-right mt-6"><button onClick={() => setShowShareModal(false)} className="bg-gray-700/80 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-600/80 cursor-pointer">Close</button></div>
                    </div>
                </div>
            )}
        </div>
    );
}

const Header: FC<{
    formTitle: string;
    onFormTitleChange: (title: string) => void;
    previewMode: PreviewMode;
    onPreviewModeChange: (mode: PreviewMode) => void;
    onSave: () => void;
    saving: boolean;
    onPublish: () => void;
    onShare: () => void;
    onHistoryClick: () => void;
    publishing: boolean;
    onPreview: () => void;
    onUndo: () => void;
    canUndo: boolean;
    onRedo: () => void;
    canRedo: boolean;
    hasUnsavedDraftChanges: boolean;
    hasUnpublishedChanges: boolean;
    hasPublishedVersion: boolean;
    onTogglePalette: () => void;
    onToggleProperties: () => void;
    pages: FormPage[];
    currentPageIndex: number;
    setCurrentPageIndex: (index: number) => void;
    addPage: () => void;
    deletePage: (pageId: string) => void;
}> = ({
    formTitle, onFormTitleChange, onSave, saving, onPublish, onShare, onHistoryClick,
    publishing, onPreview, onUndo, canUndo, onRedo, canRedo, hasUnsavedDraftChanges,
    hasUnpublishedChanges, hasPublishedVersion, previewMode, onPreviewModeChange,
    onTogglePalette, onToggleProperties, pages, currentPageIndex, setCurrentPageIndex, addPage, deletePage
}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [menuRef]);

    const getPublishButtonText = () => {
        if (publishing) return 'Publishing...';
        if (hasPublishedVersion && !hasUnpublishedChanges) return 'Published';
        return 'Publish';
    };

    const isPublishButtonDisabled = publishing || !hasUnpublishedChanges;
    const isSaveButtonDisabled = saving || !hasUnsavedDraftChanges;

    return (
        <div className='flex-shrink-0'>
            <header className="flex items-center justify-between p-2 md:p-4 border-b border-white/10 bg-gray-900/70 backdrop-blur-lg sticky top-0 z-30 flex-wrap gap-y-2">
                <div className="flex items-center gap-2 flex-1 basis-1/3 min-w-[150px]">
                    <button title="Add Fields" onClick={onTogglePalette} className="lg:hidden p-2 rounded-lg hover:bg-gray-700/80 transition-colors cursor-pointer">
                        <PlusIcon size={20} />
                    </button>
                    <Link href="/forms" className="p-2 rounded-full hover:bg-gray-700/80 transition-colors cursor-pointer hidden sm:block"><ChevronLeftIcon size={20} /></Link>
                    <input type="text" value={formTitle} onChange={e => onFormTitleChange(e.target.value)} className="text-lg md:text-xl font-bold text-white bg-transparent focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded-md px-2 w-full" />
                </div>

                <div className="flex items-center justify-center flex-1 basis-1/3 order-3 md:order-2 w-full md:w-auto">
                    <div className="flex items-center gap-2 bg-gray-800/60 p-1 rounded-lg">
                        <button title="Desktop View" onClick={() => onPreviewModeChange('desktop')} className={`p-2 rounded-md cursor-pointer ${previewMode === 'desktop' ? 'bg-indigo-600' : 'hover:bg-gray-700'}`}><MonitorIcon size={20}/></button>
                        <button title="Tablet View" onClick={() => onPreviewModeChange('tablet')} className={`p-2 rounded-md cursor-pointer ${previewMode === 'tablet' ? 'bg-indigo-600' : 'hover:bg-gray-700'}`}><TabletIcon size={20}/></button>
                        <button title="Mobile View" onClick={() => onPreviewModeChange('mobile')} className={`p-2 rounded-md cursor-pointer ${previewMode === 'mobile' ? 'bg-indigo-600' : 'hover:bg-gray-700'}`}><SmartphoneIcon size={20}/></button>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-2 flex-1 basis-1/3 order-2 md:order-3">
                    <button onClick={onUndo} disabled={!canUndo || saving} title="Undo" className="p-2 rounded-lg hover:bg-gray-700/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"><UndoIcon size={18} /></button>
                    <button onClick={onRedo} disabled={!canRedo || saving} title="Redo" className="p-2 rounded-lg hover:bg-gray-700/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"><RedoIcon size={18} /></button>

                    <button onClick={onSave} disabled={isSaveButtonDisabled} className="flex items-center gap-2 py-2 px-3 rounded-lg bg-gray-700/80 hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        <SaveIcon size={18} />
                        <span className="hidden sm:inline">{saving ? 'Saving...' : 'Save'}</span>
                    </button>

                    <button onClick={onPublish} disabled={isPublishButtonDisabled} className="flex items-center gap-2 py-2 px-3 bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors disabled:bg-indigo-400/80 disabled:cursor-not-allowed">
                        <GlobeIcon size={18} />
                        <span className="hidden sm:inline">{getPublishButtonText()}</span>
                    </button>

                    <div className="relative" ref={menuRef}>
                        <button onClick={() => setIsMenuOpen(prev => !prev)} className="p-2 rounded-full hover:bg-gray-700/80 transition-colors">
                            <MoreVerticalIcon size={20} />
                        </button>
                        {isMenuOpen && (
                            <div className="absolute right-0 mt-2 w-56 bg-gray-800 border border-white/10 rounded-lg shadow-xl z-30">
                                <div className="p-2 space-y-1">
                                    <button onClick={() => { onHistoryClick(); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 p-2 text-left text-sm rounded-md hover:bg-gray-700/80 transition-colors">
                                        <HistoryIcon size={16}/> Version History
                                    </button>
                                    <button onClick={() => { onPreview(); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 p-2 text-left text-sm rounded-md hover:bg-gray-700/80 transition-colors">
                                        <EyeIcon size={16}/> Preview Form
                                    </button>
                                    <button onClick={() => { onShare(); setIsMenuOpen(false); }} disabled={!hasPublishedVersion} className="w-full flex items-center gap-3 p-2 text-left text-sm rounded-md hover:bg-gray-700/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                        <Share2Icon size={16}/> Share Link
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                    <button title="View Properties" onClick={onToggleProperties} className="md:hidden p-2 rounded-lg hover:bg-gray-700/80 transition-colors cursor-pointer">
                        <SlidersHorizontalIcon size={20} />
                    </button>
                </div>
            </header>
            <div className="flex justify-center items-center py-2 px-4 border-b border-white/10 bg-gray-900/50 gap-2 overflow-x-auto">
                {pages.map((page, index) => (
                    <div key={page.id} className="flex items-center gap-1">
                        <button
                            onClick={() => setCurrentPageIndex(index)}
                            className={`px-3 py-1 text-sm rounded-full ${currentPageIndex === index ? 'bg-indigo-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-200'}`}
                        >
                            {page.name}
                        </button>
                        {pages.length > 1 && (
                            <button
                                onClick={() => deletePage(page.id)}
                                className="text-red-400 hover:text-red-300 p-1 rounded-full"
                                title="Delete Page"
                            >
                                <XIcon size={14} />
                            </button>
                        )}
                    </div>
                ))}
                <button
                    onClick={addPage}
                    className="flex items-center gap-1 px-3 py-1 text-sm rounded-full bg-green-600 hover:bg-green-500 text-white"
                >
                    <PlusIcon size={14} /> Add Page
                </button>
            </div>
        </div>
    );
};

const FieldPalette: FC<{ onAddField: (type: FieldType, sectionId?: string, toThankYouPage?: boolean) => void }> = ({ onAddField }) => (
    <aside className="w-full lg:w-64 bg-transparent lg:bg-gray-900/70 lg:backdrop-blur-lg lg:border-r lg:border-white/10 p-2 lg:p-6 flex flex-col transition-all duration-300 h-full">
        <div className="flex-grow overflow-y-auto lg:-mr-4 lg:pr-4">
            <div className="space-y-3">
                {fieldTypes.map(ft => (
                    <button
                        key={ft.type}
                        onClick={() => onAddField(ft.type)}
                        title={ft.label}
                        className="w-full flex items-center gap-3 p-3 bg-gray-800/60 hover:bg-indigo-600/30 rounded-lg transition-colors cursor-pointer justify-start"
                    >
                        <ft.icon className="h-5 w-5 text-indigo-400 flex-shrink-0" />
                        <span>{ft.label}</span>
                    </button>
                ))}
            </div>
        </div>
    </aside>
);

const Canvas: FC<{
    form: Form;
    currentPage: FormPage;
    currentPageIndex: number;
    isFirstPage: boolean;
    isLastPage: boolean;
    onPrevPage: () => void;
    onNextPage: () => void;
    previewMode: PreviewMode;
    selectedField: FormField | null;
    onFieldSelect: (field: FormField) => void;
    onDragEnd: (result: DropResult) => void;
    onFieldDelete: (id: string) => void;
    isBrowser: boolean;
    isSubmitting: boolean;
}> = ({ form, currentPage, currentPageIndex, isFirstPage, isLastPage, onPrevPage, onNextPage, previewMode, selectedField, onFieldSelect, onDragEnd, onFieldDelete, isBrowser, isSubmitting }) => {
    const previewWidths = { desktop: '100%', tablet: '768px', mobile: '375px' };

    const pageStyles = currentPage.styles || {};
    const responsiveGlobalStyles = form.styles[previewMode] || {};
    
    const effectiveBackgroundType = pageStyles.backgroundType || form.styles.backgroundType;
    const effectiveBackgroundColor = pageStyles.backgroundColor || form.styles.backgroundColor;
    const effectiveBackgroundImage = pageStyles.backgroundImage || form.styles.backgroundImage;
    const effectiveTextColor = pageStyles.textColor || form.styles.textColor;

    const effectiveGap = responsiveGlobalStyles.gap ?? form.styles.gap;
    const effectiveButtonWidth = responsiveGlobalStyles.buttonWidth ?? form.styles.buttonWidth;
    const effectiveButtonHeight = responsiveGlobalStyles.buttonHeight ?? form.styles.buttonHeight;
    const effectiveNextButtonWidth = responsiveGlobalStyles.nextButtonWidth ?? form.styles.nextButtonWidth;
    const effectiveNextButtonHeight = responsiveGlobalStyles.nextButtonHeight ?? form.styles.nextButtonHeight;
    const effectivePrevButtonWidth = responsiveGlobalStyles.prevButtonWidth ?? form.styles.prevButtonWidth;
    const effectivePrevButtonHeight = responsiveGlobalStyles.prevButtonHeight ?? form.styles.prevButtonHeight;
    const effectiveFormAlignment = form.styles.formAlignment || 'center';

    const effectiveButtonBackgroundColor = pageStyles.buttonBackgroundColor || form.styles.buttonBackgroundColor;
    const effectiveButtonTextColor = pageStyles.buttonTextColor || form.styles.buttonTextColor;
    const effectiveButtonText = pageStyles.buttonText || form.styles.buttonText;
    const effectiveButtonPosition = pageStyles.buttonPosition || form.styles.buttonPosition;
    const effectiveNextButtonText = pageStyles.nextButtonText || form.styles.nextButtonText;
    const effectiveNextButtonBackgroundColor = pageStyles.nextButtonBackgroundColor || form.styles.nextButtonBackgroundColor;
    const effectiveNextButtonTextColor = pageStyles.nextButtonTextColor || form.styles.nextButtonTextColor;
    const effectivePrevButtonText = pageStyles.prevButtonText || form.styles.prevButtonText;
    const effectivePrevButtonBackgroundColor = pageStyles.prevButtonBackgroundColor || form.styles.prevButtonBackgroundColor;
    const effectivePrevButtonTextColor = pageStyles.prevButtonTextColor || form.styles.prevButtonTextColor;

    const renderField = (field: FormField): JSX.Element | null => {
        const responsiveStyles = field.styles?.[previewMode] || {};
        const baseStyles = field.styles || {};
        
        const customStyles = (baseStyles.custom || []).filter(style => style.name && style.name.trim() !== '').reduce((acc, style) => {
            (acc as any)[toCamelCase(style.name)] = style.value;
            return acc;
        }, {} as React.CSSProperties);
        
        const fieldStyles: React.CSSProperties = {
            color: baseStyles.color,
            backgroundColor: baseStyles.backgroundColor,
            borderColor: baseStyles.borderColor || form.styles.fieldBorderColor,
            fontSize: responsiveStyles.fontSize || baseStyles.fontSize,
            fontWeight: baseStyles.fontWeight,
            textAlign: baseStyles.textAlign,
            listStyleType: baseStyles.listStyleType,
            height: responsiveStyles.height || 'auto',
            display: responsiveStyles.display || 'block',
            ...customStyles,
        };
        
        if (fieldStyles.display === 'none') return null;

        const controlStyle = field.styles?.controlStyle || 'default';

        switch (field.type) {
            case 'heading': return <h2 className="text-2xl break-words p-2" style={fieldStyles}>{field.label}</h2>;
            case 'paragraph': return <p className="break-words p-2" style={fieldStyles}>{field.label}</p>;
            case 'text':
            case 'email':
            case 'date': 
            case 'password':
            case 'number':
            case 'tel':
            case 'url':
            case 'time':
            case 'month':
            case 'week':
            case 'color':
                return <input type={field.type} placeholder={field.placeholder} style={fieldStyles} min={field.min} max={field.max} step={field.step} className="w-full border rounded-lg px-3 py-2 bg-transparent" readOnly />;
            case 'range':
                return <div style={{...fieldStyles}}><input type="range" min={field.min} max={field.max} step={field.step} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" /></div>;
            case 'textarea': return <textarea placeholder={field.placeholder} style={fieldStyles} className="w-full border rounded-lg px-3 py-2 bg-transparent" readOnly />;
            case 'file': return <input type="file" style={{ ...fieldStyles }} className="w-full border rounded-lg px-3 py-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200" readOnly />;
            case 'select': return <select style={fieldStyles} className="w-full border rounded-lg px-3 py-2 bg-gray-800"><option>{field.placeholder || "Select an option"}</option>{field.options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select>;
            case 'checkbox':
                return (
                    <div className={`flex gap-x-4 gap-y-2 ${field.layout === 'horizontal' ? 'flex-row flex-wrap' : 'flex-col'}`}>
                        {field.options?.map((opt, i) => {
                            const isChecked = i === 0;
                            let control;
                            switch (controlStyle) {
                                case 'switch':
                                    control = (
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" value="" className="sr-only peer" checked={isChecked} readOnly/>
                                            <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                        </label>
                                    );
                                    break;
                                case 'filled':
                                    control = (<div className={`w-5 h-5 border-2 rounded flex items-center justify-center ${isChecked ? 'bg-indigo-600 border-indigo-600' : 'bg-gray-700 border-gray-500'}`}>{isChecked && <CheckIcon size={14} className="text-white"/>}</div>);
                                    break;
                                default:
                                    control = (<input type="checkbox" checked={isChecked} readOnly className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-indigo-600 focus:ring-indigo-500" />);
                            }
                            return (
                                <div key={i} className="flex items-center gap-2">
                                    {control}
                                    <span style={{ color: field.styles?.color }} className={`${controlStyle === 'line-through' && isChecked ? 'line-through' : ''}`}>{opt.label}</span>
                                </div>
                            )
                        })}
                    </div>
                );
            case 'radio': 
                return (
                    <div className={`flex gap-x-4 gap-y-2 ${field.layout === 'horizontal' ? 'flex-row flex-wrap' : 'flex-col'}`}>
                        {field.options?.map((opt, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    {controlStyle === 'filled' ? (
                                        <div className="w-5 h-5 border-2 border-gray-500 rounded-full flex items-center justify-center bg-gray-700">
                                            {i === 0 && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
                                        </div>
                                    ) : (
                                            <input type="radio" name={field.name} value={opt.value} checked={i === 0} readOnly className="h-4 w-4 border-gray-600 bg-gray-700 text-indigo-600 focus:ring-indigo-500" />
                                    )}
                                    <span style={{ color: field.styles?.color }}>{opt.label}</span>
                                </div>
                        ))}
                    </div>
                );
            case 'signature': return <div className="w-full h-32 bg-gray-800/50 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center"><SignatureIcon className="text-gray-500" size={40} /></div>;
            case 'hr': return <hr className="w-full border-gray-600" style={{ borderColor: baseStyles.color }} />;
            
            case 'ordered-list': {
                const olClasses = field.layout === 'horizontal' ? "flex flex-row flex-wrap gap-x-6 gap-y-2" : "space-y-2 list-inside";
                return <ol className={olClasses} style={fieldStyles}>{field.options?.map((opt, i) => <li key={i}>{opt.label}</li>)}</ol>;
            }
            case 'unordered-list': {
                const ulClasses = field.layout === 'horizontal' ? "flex flex-row flex-wrap gap-x-6 gap-y-2" : "space-y-2 list-inside";
                return <ul className={ulClasses} style={fieldStyles}>{field.options?.map((opt, i) => <li key={i}>{opt.label}</li>)}</ul>;
            }
            case 'image':
                return <img src={field.src || 'https://via.placeholder.com/400x200'} alt={field.label} style={{...fieldStyles, width: '100%', height: 'auto', objectFit: 'cover' }} />;
            
            case 'rating':
                return (
                    <div className="flex items-center gap-1" style={{ ...fieldStyles }}>
                        {Array.from({ length: field.maxRating || 5 }, (_, i) => (
                            <StarIcon key={i} size={24} className="text-yellow-400" fill="currentColor" />
                        ))}
                    </div>
                );
            
            case 'name':
            case 'address':
            case 'section':
                const sectionContainerStyle: React.CSSProperties = { padding: baseStyles.padding || '1rem', ...customStyles };
                return (
                    <Droppable droppableId={`section-${field.id}`} type="FIELD">
                        {(provided, snapshot) => (
                            <div {...provided.droppableProps} ref={provided.innerRef} className={`w-full border-2 border-dashed rounded-lg flex flex-wrap ${snapshot.isDraggingOver ? 'border-indigo-500 bg-indigo-900/20' : 'border-gray-700'}`} style={{ ...sectionContainerStyle, rowGap: `${effectiveGap}px`, columnGap: `${effectiveGap}px` }}>
                                {field.fields && field.fields.length > 0 ? (
                                    field.fields.map((subField, subIndex) => (
                                        <DraggableField key={subField.id} field={subField} index={subIndex} formStyles={form.styles} previewMode={previewMode} selectedField={selectedField} onFieldSelect={onFieldSelect} onFieldDelete={onFieldDelete} />
                                    ))
                                ) : ( <div className="w-full text-center text-gray-500 py-4">Drop fields here</div> )}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                );
            default: return null;
        }
    };

    const DraggableField: FC<{ field: FormField, index: number, formStyles: FormStyles, previewMode: PreviewMode, selectedField: FormField | null, onFieldSelect: (field: FormField) => void, onFieldDelete: (id: string) => void }> = ({ field, index, formStyles, previewMode, selectedField, onFieldSelect, onFieldDelete }) => {
        const fieldDisplay = field.styles?.[previewMode]?.display || 'block';

        return (
            <Draggable key={field.id} draggableId={field.id} index={index}>
                {(provided) => (
                    <div ref={provided.innerRef} {...provided.draggableProps} style={{ display: fieldDisplay, width: `calc(${field.styles?.[previewMode]?.width || field.width} - ${field.width === '100%' ? 0 : formStyles.gap}px)`, ...provided.draggableProps.style }} onClick={(e) => { e.stopPropagation(); onFieldSelect(field) }} className={`p-1 rounded-lg border-2 transition-all cursor-pointer ${selectedField?.id === field.id ? 'border-indigo-500 bg-black/20' : 'border-transparent hover:border-indigo-600/50'}`}>
                        <div className="flex items-start gap-1">
                            <div {...provided.dragHandleProps} className="p-2 text-gray-500 hover:text-white cursor-grab"><GripVerticalIcon size={20} /></div>
                            <div className="flex-1 break-words">
                                {['text', 'email', 'textarea', 'select', 'date', 'file', 'checkbox', 'radio', 'signature', 'section', 'address', 'name', 'ordered-list', 'unordered-list', 'number', 'password', 'range', 'tel', 'url', 'color', 'time', 'month', 'week', 'rating', 'image'].includes(field.type) &&
                                    <label className="block text-sm font-medium mb-2 pl-2" style={{ color: field.styles?.color }}>
                                        {field.label} {field.required && <span className="text-red-400">*</span>}
                                    </label>
                                }
                                {renderField(field)}
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); onFieldDelete(field.id); }} className="p-2 text-gray-500 hover:text-red-400 cursor-pointer"><Trash2Icon size={18} /></button>
                        </div>
                    </div>
                )}
            </Draggable>
        );
    };

    const renderSubmitButtonContent = () => {
        if (isSubmitting) {
            const loaderType = form.settings.submitLoader?.type || 'default';
            const loaderColor = form.settings.submitLoader?.color || '#FFFFFF';
            
            if (loaderType === 'custom' && form.settings.submitLoader?.url) {
                return <img src={form.settings.submitLoader.url} alt="Loading" className="h-6 w-6" />;
            }
            return getLoaderComponent(loaderType, loaderColor);
        }
        return effectiveButtonText;
    };

    const renderPageTracker = () => {
        if (form.pages.length <= 1 || form.settings.pageTracker === 'none') return null;

        const totalPages = form.pages.length;
        const currentPageNum = currentPageIndex + 1;
        const progress = (currentPageNum / totalPages) * 100;

        const trackerStyle: React.CSSProperties = {
            color: form.settings.pageTrackerColor,
            backgroundColor: form.settings.pageTrackerBgColor,
        };

        return (
            <div className="w-full mb-4 flex flex-col items-center gap-2">
                {(form.settings.pageTracker === 'numbers' || form.settings.pageTracker === 'both') && (
                    <p className="text-sm" style={{ color: form.styles.textColor }}>Page {currentPageNum} of {totalPages}</p>
                )}
                {(form.settings.pageTracker === 'progress-bar' || form.settings.pageTracker === 'both') && (
                    <div className="w-full h-2 rounded-full" style={{ backgroundColor: form.settings.pageTrackerBgColor }}>
                        <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progress}%`, backgroundColor: form.settings.pageTrackerColor }}></div>
                    </div>
                )}
            </div>
        );
    };


    return (
        <div className="flex-1 overflow-y-auto p-2 sm:p-4 md:p-8 flex" style={{ justifyContent: effectiveFormAlignment, ... (effectiveBackgroundType === 'image' ? { backgroundImage: `url(${effectiveBackgroundImage})`, backgroundSize: 'cover' } : { backgroundColor: effectiveBackgroundColor }) }}>
            <div className="transition-all duration-300 w-full" style={{ maxWidth: previewWidths[previewMode], color: effectiveTextColor }}>
                {form.pages.length > 1 && renderPageTracker()}
                {form.settings.enableThankYouPage && currentPageIndex === form.pages.length && (
                    <div className="mt-8 p-4 border-2 border-dashed border-gray-600 rounded-xl bg-gray-800/20">
                        <h3 className="text-lg font-bold text-gray-300 mb-4">Thank You Page Content</h3>
                        {isBrowser && (
                            <DragDropContext onDragEnd={onDragEnd}>
                                <Droppable droppableId="thank-you-page-canvas" type="FIELD">
                                    {(provided) => (
                                        <div {...provided.droppableProps} ref={provided.innerRef} className="flex flex-wrap min-h-[200px]" style={{ rowGap: `${effectiveGap}px`, columnGap: `${effectiveGap}px` }}>
                                            {(form.settings.thankYouPageContent?.length === 0 || !form.settings.thankYouPageContent) && (
                                                <div className="w-full text-center text-gray-500 py-4">Drop fields here to customize your thank you message.</div>
                                            )}
                                            {form.settings.thankYouPageContent?.map((field, index) => (
                                                <DraggableField key={field.id} field={field} index={index} formStyles={form.styles} previewMode={previewMode} selectedField={selectedField} onFieldSelect={onFieldSelect} onFieldDelete={onFieldDelete} />
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </DragDropContext>
                        )}
                    </div>
                )}
                {currentPageIndex < form.pages.length && (
                    <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId={`form-canvas-page-${currentPageIndex}`} type="FIELD">
                            {(provided) => (
                                <div {...provided.droppableProps} ref={provided.innerRef} className={`flex flex-wrap ${currentPage.fields.length === 0 ? 'min-h-[400px]' : ''}`} style={{ rowGap: `${effectiveGap}px`, columnGap: `${effectiveGap}px` }}>
                                    {currentPage.fields.length === 0 && (
                                        <div className="w-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-600 rounded-xl text-center">
                                            <p className="text-gray-400">Drag and drop a field here to start building your form.</p>
                                        </div>
                                    )}
                                    {currentPage.fields.map((field, index) => (
                                       <DraggableField key={field.id} field={field} index={index} formStyles={form.styles} previewMode={previewMode} selectedField={selectedField} onFieldSelect={onFieldSelect} onFieldDelete={onFieldDelete} />
                                    ))}
                                    {provided.placeholder}
                                    <div className="w-full mt-4 flex justify-between items-center" style={{ justifyContent: effectiveButtonPosition === 'center' ? 'center' : (effectiveButtonPosition === 'right' ? 'flex-end' : 'flex-start') }}>
                                        {!isFirstPage && (
                                            <button type="button" onClick={onPrevPage} style={{ backgroundColor: effectivePrevButtonBackgroundColor, color: effectivePrevButtonTextColor, width: effectivePrevButtonWidth, height: effectivePrevButtonHeight }} className="font-bold py-2 px-4 rounded-lg cursor-pointer">
                                                {effectivePrevButtonText}
                                            </button>
                                        )}
                                        <div style={{ flexGrow: 1 }} />
                                        {!isLastPage && (
                                            <button type="button" onClick={onNextPage} style={{ backgroundColor: effectiveNextButtonBackgroundColor, color: effectiveNextButtonTextColor, width: effectiveNextButtonWidth, height: effectiveNextButtonHeight }} className="font-bold py-2 px-4 rounded-lg cursor-pointer">
                                                {effectiveNextButtonText}
                                            </button>
                                        )}
                                        {isLastPage && (
                                            <button type="submit" style={{ backgroundColor: effectiveButtonBackgroundColor, color: effectiveButtonTextColor, width: effectiveButtonWidth, height: effectiveButtonHeight }} className="font-bold py-2 px-4 rounded-lg cursor-pointer flex items-center justify-center">
                                                {renderSubmitButtonContent()}
                                            </button>
                                        )}
                                    </div>
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
    currentPage: FormPage;
    onUpdatePage: (pageId: string, newProps: Partial<FormPage>) => void;
    previewMode: PreviewMode;
    onUpdateField: (id: string, newProps: Partial<FormField>) => void;
    onUpdateFieldResponsiveStyle: (id: string, newStyles: Partial<ResponsiveFieldStyles>, device: PreviewMode) => void;
    onUpdateFieldBaseStyle: (id: string, newStyles: Partial<Omit<FieldStyles, 'desktop' | 'tablet' | 'mobile'>>) => void;
    onUpdateOption: (fieldId: string, optionIndex: number, newOption: Partial<FieldOption>) => void;
    onAddOption: (fieldId: string) => void;
    onRemoveOption: (fieldId: string, optionIndex: number) => void;
    onUpdateForm: (newProps: Partial<Form>) => void;
    onUpdateFormResponsiveStyle: (newStyles: Partial<ResponsiveGlobalStyles>, device: PreviewMode) => void;
    onUpdateFormSettings: (newSettings: Partial<FormSettings>) => void;
    addField: (type: FieldType, sectionId?: string, toThankYouPage?: boolean) => void;
    onFieldDelete: (id: string) => void;
}> = (props) => {
    const { selectedField, form, currentPage, onUpdateField, onUpdatePage, onUpdateForm, onUpdateFormSettings, previewMode, onUpdateFieldResponsiveStyle, onUpdateFormResponsiveStyle, addField, onFieldDelete } = props;
    const [activeGlobalTab, setActiveGlobalTab] = useState<'style' | 'settings' | 'page-style'>('style');
    const [activeFieldTab, setActiveFieldTab] = useState<'properties' | 'style' | 'logic'>('properties');
    const noValidationFields = ['heading', 'paragraph', 'hr', 'section', 'address', 'name', 'image', 'rating'];

    const handleUpdateCustomStyle = (index: number, part: 'name' | 'value', value: string) => {
        if (!selectedField) return;
        const newCustomStyles = [...(selectedField.styles.custom || [])];
        newCustomStyles[index] = { ...newCustomStyles[index], [part]: value };
        props.onUpdateFieldBaseStyle(selectedField.id, { custom: newCustomStyles });
    };

    const handleAddCustomStyle = () => {
        if (!selectedField) return;
        const newCustomStyles = [...(selectedField.styles.custom || []), { name: '', value: '' }];
        props.onUpdateFieldBaseStyle(selectedField.id, { custom: newCustomStyles });
    };

    const handleRemoveCustomStyle = (index: number) => {
        if (!selectedField) return;
        const newCustomStyles = [...(selectedField.styles.custom || [])];
        newCustomStyles.splice(index, 1);
        props.onUpdateFieldBaseStyle(selectedField.id, { custom: newCustomStyles });
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

    const handleAddRequiredCondition = () => {
        if (!selectedField) return;
        const newCondition: FieldCondition = { id: `req_cond_${Date.now()}`, fieldId: '', operator: 'equals', value: '' };
        const newRequiredConditions = {
            ...selectedField.requiredConditions,
            enabled: selectedField.requiredConditions?.enabled || true,
            conditions: [...(selectedField.requiredConditions?.conditions || []), newCondition]
        };
        onUpdateField(selectedField.id, { requiredConditions: newRequiredConditions as RequiredCondition });
    };

    const handleUpdateRequiredCondition = (index: number, newProps: Partial<FieldCondition>) => {
        if (!selectedField || !selectedField.requiredConditions) return;
        const newConditions = [...selectedField.requiredConditions.conditions];
        newConditions[index] = { ...newConditions[index], ...newProps };
        onUpdateField(selectedField.id, { requiredConditions: { ...selectedField.requiredConditions, conditions: newConditions } });
    };

    const handleRemoveRequiredCondition = (index: number) => {
        if (!selectedField || !selectedField.requiredConditions) return;
        const newConditions = [...selectedField.requiredConditions.conditions];
        newConditions.splice(index, 1);
        onUpdateField(selectedField.id, { requiredConditions: { ...selectedField.requiredConditions, conditions: newConditions } });
    };

    const availableFieldsForConditions = form.pages.flatMap(page =>
        page.fields.filter(f => f.type !== 'heading' && f.type !== 'paragraph' && f.type !== 'section' && f.id !== selectedField?.id)
    );
    
    const responsiveGlobalStyles = form.styles[previewMode] || {};

    return (
        <aside className="w-full md:w-80 lg:w-96 bg-transparent md:bg-gray-900/70 md:backdrop-blur-lg md:border-l md:border-white/10 flex flex-col transition-all duration-300 h-full p-4 md:p-6">
            <div className="flex-grow overflow-y-auto pr-2">
                {selectedField ? (
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-white mb-4">Field Editor</h2>
                        <div className="flex border-b border-white/10 mb-4">
                            <button onClick={() => setActiveFieldTab('properties')} className={`flex-1 pb-2 text-sm font-semibold cursor-pointer ${activeFieldTab === 'properties' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-400'}`}>Properties</button>
                            <button onClick={() => setActiveFieldTab('style')} className={`flex-1 pb-2 text-sm font-semibold cursor-pointer ${activeFieldTab === 'style' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-400'}`}>Style</button>
                            <button onClick={() => setActiveFieldTab('logic')} className={`flex-1 pb-2 text-sm font-semibold cursor-pointer ${activeFieldTab === 'logic' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-400'}`}>Logic</button>
                        </div>

                        {activeFieldTab === 'properties' && (
                            <div className="space-y-1">
                                <Accordion title="General" defaultOpen>
                                    <div><label className="block text-sm font-medium text-gray-400 mb-1">Label / Text</label><input type="text" value={selectedField.label} onChange={e => props.onUpdateField(selectedField.id, { label: e.target.value })} className="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2" /></div>
                                    {['text', 'email', 'textarea', 'number', 'password', 'tel', 'url'].includes(selectedField.type) && (<div><label className="block text-sm font-medium text-gray-400 mb-1">Placeholder</label><input type="text" value={selectedField.placeholder || ''} onChange={e => props.onUpdateField(selectedField.id, { placeholder: e.target.value })} className="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2" /></div>)}
                                    {['number', 'range'].includes(selectedField.type) && (
                                        <div className="grid grid-cols-3 gap-2 mt-2">
                                            <div><label className="block text-xs font-medium text-gray-400 mb-1">Min</label><input type="number" value={selectedField.min ?? ''} onChange={e => props.onUpdateField(selectedField.id, { min: e.target.value === '' ? undefined : Number(e.target.value) })} className="w-full bg-gray-700 border border-white/10 rounded-lg px-2 py-1" /></div>
                                            <div><label className="block text-xs font-medium text-gray-400 mb-1">Max</label><input type="number" value={selectedField.max ?? ''} onChange={e => props.onUpdateField(selectedField.id, { max: e.target.value === '' ? undefined : Number(e.target.value) })} className="w-full bg-gray-700 border border-white/10 rounded-lg px-2 py-1" /></div>
                                            <div><label className="block text-xs font-medium text-gray-400 mb-1">Step</label><input type="number" value={selectedField.step ?? ''} onChange={e => props.onUpdateField(selectedField.id, { step: e.target.value === '' ? undefined : Number(e.target.value) })} className="w-full bg-gray-700 border border-white/10 rounded-lg px-2 py-1" /></div>
                                        </div>
                                    )}
                                    {selectedField.type === 'rating' && (
                                        <div><label className="block text-sm font-medium text-gray-400 mb-1">Max Rating (Stars)</label><input type="number" value={selectedField.maxRating || 5} onChange={e => props.onUpdateField(selectedField.id, { maxRating: parseInt(e.target.value, 10) || 5 })} className="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2" min="1" /></div>
                                    )}
                                    {selectedField.type === 'image' && (
                                        <div><label className="block text-sm font-medium text-gray-400 mb-1">Image URL</label><input type="text" value={selectedField.src || ''} onChange={e => props.onUpdateField(selectedField.id, { src: e.target.value })} className="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2" placeholder="https://example.com/image.png" /></div>
                                    )}
                                    {selectedField.type !== 'heading' && selectedField.type !== 'paragraph' && selectedField.type !== 'image' && (<>
                                        <div><label className="block text-sm font-medium text-gray-400 mb-1">Name Attribute</label><input type="text" value={selectedField.name || ''} onChange={e => props.onUpdateField(selectedField.id, { name: e.target.value })} className="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2" /></div>
                                        <div><label className="block text-sm font-medium text-gray-400 mb-1">Field ID</label><input type="text" value={selectedField.fieldId || ''} onChange={e => props.onUpdateField(selectedField.id, { fieldId: e.target.value })} className="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2" /></div>
                                    </>)}
                                </Accordion>

                                {['select', 'radio', 'checkbox', 'ordered-list', 'unordered-list'].includes(selectedField.type) && (
                                    <Accordion title="Options" defaultOpen>
                                        {selectedField.options?.map((opt, index) => (
                                            <div key={index} className="flex items-center gap-2 mb-2">
                                                <input type="text" value={opt.label} onChange={e => props.onUpdateOption(selectedField.id, index, { label: e.target.value })} className="flex-1 bg-gray-700 border border-white/10 rounded-lg px-3 py-1" placeholder="Label" />
                                                <input type="text" value={opt.value} onChange={e => props.onUpdateOption(selectedField.id, index, { value: e.target.value })} className="flex-1 bg-gray-700 border border-white/10 rounded-lg px-3 py-1" placeholder="Value" />
                                                <button onClick={() => props.onRemoveOption(selectedField.id, index)} className="text-red-400 hover:text-red-300 cursor-pointer"><Trash2Icon size={16} /></button>
                                            </div>
                                        ))}
                                        <button onClick={() => props.onAddOption(selectedField.id)} className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 cursor-pointer"><PlusIcon size={16} /> Add Option</button>
                                        
                                        {['radio', 'checkbox', 'ordered-list', 'unordered-list'].includes(selectedField.type) && (
                                            <div className="mt-4">
                                                <label className="block text-sm font-medium text-gray-400 mb-1">Layout</label>
                                                <select value={selectedField.layout || 'vertical'} onChange={e => props.onUpdateField(selectedField.id, { layout: e.target.value as 'vertical' | 'horizontal' })} className="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2">
                                                    <option value="vertical">Vertical</option>
                                                    <option value="horizontal">Horizontal</option>
                                                </select>
                                            </div>
                                        )}
                                    </Accordion>
                                )}

                                {!noValidationFields.includes(selectedField.type) && (
                                    <Accordion title="Validation">
                                        <div className="flex items-center justify-between">
                                            <label htmlFor="required" className="text-sm font-medium text-gray-300 cursor-pointer">Required Field</label>
                                            <input id="required" type="checkbox" checked={selectedField.required || false} onChange={e => props.onUpdateField(selectedField.id, { required: e.target.checked })} className="h-4 w-4 rounded text-indigo-600 bg-gray-700 border-gray-600 focus:ring-indigo-500 cursor-pointer" />
                                        </div>
                                        {selectedField.required && (
                                            <div className="mt-2">
                                                <label className="block text-sm font-medium text-gray-400 mb-1">Required Error Message</label>
                                                <input type="text" value={selectedField.requiredErrorMessage || ''} onChange={e => props.onUpdateField(selectedField.id, { requiredErrorMessage: e.target.value })} className="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2" placeholder="This field is required" />
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between mt-4">
                                            <label htmlFor="required-conditional" className="text-sm font-medium text-gray-300 cursor-pointer">Conditional Required</label>
                                            <input id="required-conditional" type="checkbox" checked={selectedField.requiredConditions?.enabled || false} onChange={e => { const currentConditions = selectedField.requiredConditions || { enabled: false, logic: 'and', conditions: [] }; props.onUpdateField(selectedField.id, { requiredConditions: { ...currentConditions, enabled: e.target.checked } }); }} className="h-4 w-4 rounded text-indigo-600 bg-gray-700 border-gray-600 focus:ring-indigo-500 cursor-pointer" />
                                        </div>
                                        {selectedField.requiredConditions?.enabled && (
                                            <div className="mt-4 space-y-3 p-3 bg-gray-800/50 rounded-lg">
                                                <p className="text-xs text-gray-400">Make this field required if...</p>
                                                {selectedField.requiredConditions.conditions.map((cond: FieldCondition, index: number) => (
                                                    <div key={cond.id} className="bg-gray-700/50 p-3 rounded-lg space-y-2">
                                                        <div className="flex items-center gap-2">
                                                            <select value={cond.fieldId} onChange={e => handleUpdateRequiredCondition(index, { fieldId: e.target.value })} className="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2 text-sm">
                                                                <option value="">Select Field...</option>
                                                                {availableFieldsForConditions.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                                                            </select>
                                                            <button onClick={() => handleRemoveRequiredCondition(index)} className="text-red-400 hover:text-red-300 cursor-pointer"><Trash2Icon size={18} /></button>
                                                        </div>
                                                        <select value={cond.operator} onChange={e => handleUpdateRequiredCondition(index, { operator: e.target.value as ConditionOperator })} className="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2 text-sm">
                                                            <option value="equals">Equals</option>
                                                            <option value="not_equals">Does Not Equal</option>
                                                            <option value="contains">Contains</option>
                                                            <option value="is_empty">Is Empty</option>
                                                            <option value="is_not_empty">Is Not Empty</option>
                                                        </select>
                                                        <input type="text" value={cond.value} onChange={e => handleUpdateRequiredCondition(index, { value: e.target.value })} className="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2 text-sm" placeholder="Value to match" />
                                                    </div>
                                                ))}
                                                <button onClick={handleAddRequiredCondition} className="mt-3 flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 cursor-pointer"><PlusIcon size={16} /> Add Condition</button>
                                            </div>
                                        )}
                                    </Accordion>
                                )}
                            </div>
                        )}

                        {activeFieldTab === 'style' && (
                            <div className="space-y-1">
                                <Accordion title="Sizing & Layout" defaultOpen>
                                    {['section', 'address', 'name'].includes(selectedField.type) && (
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="text-sm">Padding</label>
                                            <input type="text" value={selectedField.styles?.padding || ''} onChange={e => props.onUpdateFieldBaseStyle(selectedField.id, { padding: e.target.value })} className="w-2/3 bg-gray-700 border border-white/10 rounded-lg px-3 py-1" placeholder="e.g., 1rem or 16px" />
                                        </div>
                                    )}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1 capitalize">Width ({props.previewMode})</label>
                                        <div className="flex items-center gap-2">
                                            <select
                                                value={['100%', '50%', '33.33%'].includes(selectedField.styles?.[props.previewMode]?.width as string) ? selectedField.styles?.[props.previewMode]?.width : 'custom'}
                                                onChange={e => {
                                                    const value = e.target.value;
                                                    if (value === 'custom') {
                                                        props.onUpdateFieldResponsiveStyle(selectedField.id, { width: '100px' }, props.previewMode);
                                                    } else {
                                                        props.onUpdateFieldResponsiveStyle(selectedField.id, { width: value as FieldWidth }, props.previewMode);
                                                    }
                                                }}
                                                className="flex-1 bg-gray-800 border border-white/10 rounded-lg px-3 py-2"
                                            >
                                                <option value="100%">Full</option>
                                                <option value="50%">Half</option>
                                                <option value="33.33%">Third</option>
                                                <option value="custom">Custom</option>
                                            </select>
                                            {selectedField.styles?.[props.previewMode]?.width && !['100%', '50%', '33.33%'].includes(selectedField.styles[props.previewMode].width as string) && (
                                                <input
                                                    type="text"
                                                    value={selectedField.styles?.[props.previewMode]?.width || ''}
                                                    onChange={e => props.onUpdateFieldResponsiveStyle(selectedField.id, { width: e.target.value }, props.previewMode)}
                                                    className="w-1/2 bg-gray-800 border border-white/10 rounded-lg px-3 py-2"
                                                    placeholder="e.g., 200px, 50%"
                                                />
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm capitalize">Height ({props.previewMode})</label>
                                        <input
                                            type="text"
                                            value={selectedField.styles?.[props.previewMode]?.height || ''}
                                            onChange={e => props.onUpdateFieldResponsiveStyle(selectedField.id, { height: e.target.value }, props.previewMode)}
                                            className="w-2/3 bg-gray-700 border border-white/10 rounded-lg px-3 py-1"
                                            placeholder="e.g., 100px, auto"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm capitalize">Display ({props.previewMode})</label>
                                        <select
                                            value={selectedField.styles?.[props.previewMode]?.display || 'block'}
                                            onChange={e => props.onUpdateFieldResponsiveStyle(selectedField.id, { display: e.target.value as 'block' | 'none' }, props.previewMode)}
                                            className="w-2/3 bg-gray-800 border border-white/10 rounded-lg px-3 py-2"
                                        >
                                            <option value="block">Show</option>
                                            <option value="none">Hide</option>
                                        </select>
                                    </div>
                                </Accordion>
                                <Accordion title="Typography">
                                    {['ordered-list', 'unordered-list'].includes(selectedField.type) && (
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="text-sm">List Style</label>
                                            <select value={selectedField.styles?.listStyleType || 'disc'} onChange={e => props.onUpdateFieldBaseStyle(selectedField.id, { listStyleType: e.target.value as ListStyleType })} className="w-2/3 bg-gray-700 border border-white/10 rounded-lg px-3 py-1" >
                                                <optgroup label="Unordered">
                                                    <option value="disc">Disc</option>
                                                    <option value="circle">Circle</option>
                                                    <option value="square">Square</option>
                                                </optgroup>
                                                <optgroup label="Ordered">
                                                    <option value="decimal">Decimal (1, 2, 3)</option>
                                                    <option value="lower-alpha">Lowercase (a, b, c)</option>
                                                    <option value="upper-alpha">Uppercase (A, B, C)</option>
                                                    <option value="lower-roman">Roman (i, ii, iii)</option>
                                                    <option value="upper-roman">Roman (I, II, III)</option>
                                                </optgroup>
                                                <option value="none">None</option>
                                            </select>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between"><label className="text-sm capitalize">Font Size ({props.previewMode})</label><input type="text" value={selectedField.styles?.[props.previewMode]?.fontSize || ''} onChange={e => props.onUpdateFieldResponsiveStyle(selectedField.id, { fontSize: e.target.value }, props.previewMode)} className="w-2/3 bg-gray-700 border border-white/10 rounded-lg px-3 py-1" placeholder="e.g., 16px" /></div>
                                    <div className="flex items-center justify-between"><label className="text-sm">Font Weight</label><input type="text" value={selectedField.styles?.fontWeight || ''} onChange={e => props.onUpdateFieldBaseStyle(selectedField.id, { fontWeight: e.target.value })} className="w-2/3 bg-gray-700 border border-white/10 rounded-lg px-3 py-1" placeholder="e.g., bold" /></div>
                                    <div className="flex items-center justify-between"><label className="text-sm">Color</label><input type="color" value={selectedField.styles?.color || '#000000'} onChange={e => props.onUpdateFieldBaseStyle(selectedField.id, { color: e.target.value })} className="p-1 h-8 w-14 block bg-gray-700 border border-white/10 cursor-pointer rounded-lg" /></div>
                                    {(selectedField.type === 'heading' || selectedField.type === 'paragraph') && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">Text Align</label>
                                            <div className="flex items-center gap-2 rounded-lg bg-gray-700 p-1">
                                                <button onClick={() => props.onUpdateFieldBaseStyle(selectedField.id, { textAlign: 'left' })} className={`flex-1 p-2 rounded-md cursor-pointer ${selectedField.styles?.textAlign === 'left' ? 'bg-indigo-600' : 'hover:bg-gray-800'}`}><AlignLeftIcon size={16} /></button>
                                                <button onClick={() => props.onUpdateFieldBaseStyle(selectedField.id, { textAlign: 'center' })} className={`flex-1 p-2 rounded-md cursor-pointer ${selectedField.styles?.textAlign === 'center' ? 'bg-indigo-600' : 'hover:bg-gray-800'}`}><AlignCenterIcon size={16} /></button>
                                                <button onClick={() => props.onUpdateFieldBaseStyle(selectedField.id, { textAlign: 'right' })} className={`flex-1 p-2 rounded-md cursor-pointer ${selectedField.styles?.textAlign === 'right' ? 'bg-indigo-600' : 'hover:bg-gray-800'}`}><AlignRightIcon size={16} /></button>
                                            </div>
                                        </div>
                                    )}
                                </Accordion>
                                <Accordion title="Appearance">
                                    <div className="flex items-center justify-between"><label className="text-sm">Background</label><input type="color" value={selectedField.styles?.backgroundColor || '#FFFFFF'} onChange={e => props.onUpdateFieldBaseStyle(selectedField.id, { backgroundColor: e.target.value })} className="p-1 h-8 w-14 block bg-gray-700 border border-white/10 cursor-pointer rounded-lg" /></div>
                                    {['checkbox'].includes(selectedField.type) && (
                                        <div className="flex items-center justify-between mt-2">
                                            <label className="text-sm">Control Style</label>
                                            <select value={selectedField.styles?.controlStyle || 'default'} onChange={e => props.onUpdateFieldBaseStyle(selectedField.id, { controlStyle: e.target.value as ControlStyle })} className="w-2/3 bg-gray-700 border border-white/10 rounded-lg px-3 py-1">
                                                <option value="default">Default</option>
                                                <option value="filled">Filled</option>
                                                <option value="switch">Switch</option>
                                                <option value="line-through">Line-through</option>
                                            </select>
                                        </div>
                                    )}
                                    {['radio'].includes(selectedField.type) && (
                                        <div className="flex items-center justify-between mt-2">
                                            <label className="text-sm">Control Style</label>
                                            <select value={selectedField.styles?.controlStyle || 'default'} onChange={e => props.onUpdateFieldBaseStyle(selectedField.id, { controlStyle: e.target.value as ControlStyle })} className="w-2/3 bg-gray-700 border border-white/10 rounded-lg px-3 py-1">
                                                <option value="default">Default</option>
                                                <option value="filled">Filled</option>
                                            </select>
                                        </div>
                                    )}
                                </Accordion>
                                <Accordion title="Custom CSS" defaultOpen>
                                    <div className="space-y-2">
                                        {selectedField.styles.custom?.map((style, index) => (
                                            <div key={index} className="flex items-center gap-2 ">
                                                <select
                                                    value={style.name}
                                                    onChange={e => handleUpdateCustomStyle(index, 'name', e.target.value)}
                                                    className="w-1/2 bg-gray-700 border border-white/10 rounded-lg px-2 py-1 text-sm h-[40px]"
                                                >
                                                    <option value="">Select Property...</option>
                                                    {commonCssProperties.map(group => (
                                                        <optgroup key={group.label} label={group.label}>
                                                            {group.options.map(prop => (
                                                                <option key={prop.value} value={prop.value}>{prop.label}</option>
                                                            ))}
                                                        </optgroup>
                                                    ))}
                                                </select>
                                                <input
                                                    type="text"
                                                    value={style.value}
                                                    onChange={e => handleUpdateCustomStyle(index, 'value', e.target.value)}
                                                    className="w-1/2 bg-gray-700 border border-white/10 rounded-lg px-2 py-1 text-sm h-[40px]"
                                                    placeholder="value (e.g. 10px, #fff)"
                                                />
                                                <button onClick={() => handleRemoveCustomStyle(index)} className="text-red-400 hover:text-red-300 cursor-pointer"><Trash2Icon size={20} /></button>
                                            </div>
                                        ))}
                                    </div>
                                    <button onClick={handleAddCustomStyle} className="mt-2 flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 cursor-pointer"><PlusIcon size={16} /> Add Style</button>
                                </Accordion>
                            </div>
                        )}

                        {activeFieldTab === 'logic' && (
                           <Accordion title="Display Logic" defaultOpen>
                                <p className="text-xs text-gray-400 mb-2">Show this field if...</p>
                                <div className="flex items-center gap-2 rounded-lg bg-gray-800 p-1 mb-4">
                                    <button onClick={() => handleUpdateConditionLogic('and')} className={`flex-1 p-2 text-xs rounded-md cursor-pointer ${selectedField.conditionLogic !== 'or' ? 'bg-indigo-600' : 'hover:bg-gray-700'}`}>All conditions match</button>
                                    <button onClick={() => handleUpdateConditionLogic('or')} className={`flex-1 p-2 text-xs rounded-md cursor-pointer ${selectedField.conditionLogic === 'or' ? 'bg-indigo-600' : 'hover:bg-gray-700'}`}>Any condition matches</button>
                                </div>
                                <div className="space-y-3">
                                    {selectedField.conditions?.map((cond: FieldCondition, index: number) => (
                                        <div key={cond.id} className="bg-gray-700/50 p-3 rounded-lg space-y-2">
                                            <div className="flex items-center gap-2">
                                                <select value={cond.fieldId} onChange={e => handleUpdateCondition(index, { fieldId: e.target.value })} className="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2 text-sm">
                                                    <option value="">Select Field...</option>
                                                    {availableFieldsForConditions.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                                                </select>
                                                <button onClick={() => handleRemoveCondition(index)} className="text-red-400 hover:text-red-300 cursor-pointer"><Trash2Icon size={18} /></button>
                                            </div>
                                            <select value={cond.operator} onChange={e => handleUpdateCondition(index, { operator: e.target.value as ConditionOperator })} className="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2 text-sm">
                                                <option value="equals">Equals</option>
                                                <option value="not_equals">Does Not Equal</option>
                                                <option value="contains">Contains</option>
                                                <option value="is_empty">Is Empty</option>
                                                <option value="is_not_empty">Is Not Empty</option>
                                            </select>
                                            <input type="text" value={cond.value} onChange={e => handleUpdateCondition(index, { value: e.target.value })} className="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2 text-sm" placeholder="Value to match" />
                                        </div>
                                    ))}
                                </div>
                                <button onClick={handleAddCondition} className="mt-3 flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 cursor-pointer"><PlusIcon size={16} /> Add Condition</button>
                            </Accordion>
                        )}
                    </div>
                ) : <p className="text-gray-500 text-center py-10">Select a field to edit it.</p>}

                <div className="border-t border-white/10 pt-6 mt-6 space-y-4">
                    <h2 className="text-xl font-bold text-white">Global Settings</h2>
                    <div className="flex border-b border-white/10">
                        <button onClick={() => setActiveGlobalTab('style')} className={`flex-1 pb-2 text-sm font-semibold cursor-pointer ${activeGlobalTab === 'style' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-400'}`}>Global Style</button>
                        <button onClick={() => setActiveGlobalTab('page-style')} className={`flex-1 pb-2 text-sm font-semibold cursor-pointer ${activeGlobalTab === 'page-style' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-400'}`}>Page Style</button>
                        <button onClick={() => setActiveGlobalTab('settings')} className={`flex-1 pb-2 text-sm font-semibold cursor-pointer ${activeGlobalTab === 'settings' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-400'}`}>Settings</button>
                    </div>
                    {activeGlobalTab === 'style' && (
                        <div className="space-y-4">
                            <Accordion title="Form Layout" defaultOpen>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Form Alignment</label>
                                    <div className="flex items-center gap-2 rounded-lg bg-gray-800 p-1">
                                        <button onClick={() => onUpdateForm({ styles: { ...form.styles, formAlignment: 'start' }})} className={`flex-1 p-2 rounded-md cursor-pointer ${form.styles.formAlignment === 'start' ? 'bg-indigo-600' : 'hover:bg-gray-700'}`}><AlignHorizontalJustifyStart size={16} /></button>
                                        <button onClick={() => onUpdateForm({ styles: { ...form.styles, formAlignment: 'center' }})} className={`flex-1 p-2 rounded-md cursor-pointer ${!form.styles.formAlignment || form.styles.formAlignment === 'center' ? 'bg-indigo-600' : 'hover:bg-gray-700'}`}><AlignHorizontalJustifyCenter size={16} /></button>
                                        <button onClick={() => onUpdateForm({ styles: { ...form.styles, formAlignment: 'end' }})} className={`flex-1 p-2 rounded-md cursor-pointer ${form.styles.formAlignment === 'end' ? 'bg-indigo-600' : 'hover:bg-gray-700'}`}><AlignHorizontalJustifyEnd size={16} /></button>
                                    </div>
                                </div>
                            </Accordion>
                            <Accordion title="Form Theme">
                                <div><label className="block text-sm font-medium text-gray-400 mb-1">Background Type</label><select value={form.styles.backgroundType} onChange={e => props.onUpdateForm({ styles: { ...form.styles, backgroundType: e.target.value as 'color' | 'image' } })} className="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2"><option value="color">Color</option><option value="image">Image</option></select></div>
                                {form.styles.backgroundType === 'color' ? (<div className="flex items-center justify-between"><label className="text-sm">Background Color</label><input type="color" value={form.styles.backgroundColor} onChange={e => props.onUpdateForm({ styles: { ...form.styles, backgroundColor: e.target.value } })} className="p-1 h-8 w-14 block bg-gray-800 border border-white/10 cursor-pointer rounded-lg" /></div>) : (<div><label className="block text-sm font-medium text-gray-400 mb-1">Background Image URL</label><input type="text" value={form.styles.backgroundImage} onChange={e => props.onUpdateForm({ styles: { ...form.styles, backgroundImage: e.target.value } })} className="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2" /></div>)}
                                <div className="flex items-center justify-between"><label className="text-sm">Text Color</label><input type="color" value={form.styles.textColor} onChange={e => props.onUpdateForm({ styles: { ...form.styles, textColor: e.target.value } })} className="p-1 h-8 w-14 block bg-gray-800 border border-white/10 cursor-pointer rounded-lg" /></div>
                                <div className="flex items-center justify-between"><label className="text-sm capitalize">Field Gap (px) ({previewMode})</label><input type="number" value={responsiveGlobalStyles.gap ?? form.styles.gap} onChange={e => onUpdateFormResponsiveStyle({ gap: parseInt(e.target.value, 10) || 0 }, previewMode)} className="w-20 bg-gray-800 border border-white/10 rounded-lg px-3 py-1" /></div>
                            </Accordion>
                            
                            <Accordion title="Button Styles">
                                <h3 className="text-md font-bold text-white">Submit Button</h3>
                                <div><label className="block text-sm font-medium text-gray-400 mb-1">Button Text</label><input type="text" value={form.styles.buttonText} onChange={e => props.onUpdateForm({ styles: { ...form.styles, buttonText: e.target.value } })} className="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2" /></div>
                                <div><label className="block text-sm font-medium text-gray-400 mb-1">Button Position</label><select value={form.styles.buttonPosition} onChange={e => props.onUpdateForm({ styles: { ...form.styles, buttonPosition: e.target.value as 'left' | 'center' | 'right' } })} className="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2"><option value="left">Left</option><option value="center">Center</option><option value="right">Right</option></select></div>
                                <div className="flex items-center justify-between"><label className="text-sm capitalize">Width ({previewMode})</label><input type="text" value={responsiveGlobalStyles.buttonWidth ?? form.styles.buttonWidth} onChange={e => onUpdateFormResponsiveStyle({ buttonWidth: e.target.value }, previewMode)} className="w-2/3 bg-gray-800 border border-white/10 rounded-lg px-3 py-1" placeholder="e.g., auto or 150px" /></div>
                                <div className="flex items-center justify-between"><label className="text-sm capitalize">Height ({previewMode})</label><input type="text" value={responsiveGlobalStyles.buttonHeight ?? form.styles.buttonHeight} onChange={e => onUpdateFormResponsiveStyle({ buttonHeight: e.target.value }, previewMode)} className="w-2/3 bg-gray-800 border border-white/10 rounded-lg px-3 py-1" placeholder="e.g., auto or 40px" /></div>
                                <div className="flex items-center justify-between"><label className="text-sm">Button Background</label><input type="color" value={form.styles.buttonBackgroundColor} onChange={e => props.onUpdateForm({ styles: { ...form.styles, buttonBackgroundColor: e.target.value } })} className="p-1 h-8 w-14 block bg-gray-800 border border-white/10 cursor-pointer rounded-lg" /></div>
                                <div className="flex items-center justify-between"><label className="text-sm">Button Text Color</label><input type="color" value={form.styles.buttonTextColor} onChange={e => props.onUpdateForm({ styles: { ...form.styles, buttonTextColor: e.target.value } })} className="p-1 h-8 w-14 block bg-gray-800 border border-white/10 cursor-pointer rounded-lg" /></div>

                                <h3 className="text-md font-bold text-white pt-4">Navigation Buttons</h3>
                                <div><label className="block text-sm font-medium text-gray-400 mb-1">Next Button Text</label><input type="text" value={form.styles.nextButtonText} onChange={e => props.onUpdateForm({ styles: { ...form.styles, nextButtonText: e.target.value } })} className="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2" /></div>
                                <div className="flex items-center justify-between"><label className="text-sm capitalize">Next Width ({previewMode})</label><input type="text" value={responsiveGlobalStyles.nextButtonWidth ?? form.styles.nextButtonWidth} onChange={e => onUpdateFormResponsiveStyle({ nextButtonWidth: e.target.value }, previewMode)} className="w-2/3 bg-gray-800 border border-white/10 rounded-lg px-3 py-1" placeholder="auto" /></div>
                                <div className="flex items-center justify-between"><label className="text-sm capitalize">Next Height ({previewMode})</label><input type="text" value={responsiveGlobalStyles.nextButtonHeight ?? form.styles.nextButtonHeight} onChange={e => onUpdateFormResponsiveStyle({ nextButtonHeight: e.target.value }, previewMode)} className="w-2/3 bg-gray-800 border border-white/10 rounded-lg px-3 py-1" placeholder="auto" /></div>
                                <div className="flex items-center justify-between"><label className="text-sm">Next Button Background</label><input type="color" value={form.styles.nextButtonBackgroundColor} onChange={e => props.onUpdateForm({ styles: { ...form.styles, nextButtonBackgroundColor: e.target.value } })} className="p-1 h-8 w-14 block bg-gray-800 border border-white/10 cursor-pointer rounded-lg" /></div>
                                <div className="flex items-center justify-between"><label className="text-sm">Next Button Text Color</label><input type="color" value={form.styles.nextButtonTextColor} onChange={e => props.onUpdateForm({ styles: { ...form.styles, nextButtonTextColor: e.target.value } })} className="p-1 h-8 w-14 block bg-gray-800 border border-white/10 cursor-pointer rounded-lg" /></div>

                                <div className='pt-2'><label className="block text-sm font-medium text-gray-400 mb-1">Previous Button Text</label><input type="text" value={form.styles.prevButtonText} onChange={e => props.onUpdateForm({ styles: { ...form.styles, prevButtonText: e.target.value } })} className="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2" /></div>
                                <div className="flex items-center justify-between"><label className="text-sm capitalize">Prev Width ({previewMode})</label><input type="text" value={responsiveGlobalStyles.prevButtonWidth ?? form.styles.prevButtonWidth} onChange={e => onUpdateFormResponsiveStyle({ prevButtonWidth: e.target.value }, previewMode)} className="w-2/3 bg-gray-800 border border-white/10 rounded-lg px-3 py-1" placeholder="auto" /></div>
                                <div className="flex items-center justify-between"><label className="text-sm capitalize">Prev Height ({previewMode})</label><input type="text" value={responsiveGlobalStyles.prevButtonHeight ?? form.styles.prevButtonHeight} onChange={e => onUpdateFormResponsiveStyle({ prevButtonHeight: e.target.value }, previewMode)} className="w-2/3 bg-gray-800 border border-white/10 rounded-lg px-3 py-1" placeholder="auto" /></div>
                                <div className="flex items-center justify-between"><label className="text-sm">Previous Button Background</label><input type="color" value={form.styles.prevButtonBackgroundColor} onChange={e => props.onUpdateForm({ styles: { ...form.styles, prevButtonBackgroundColor: e.target.value } })} className="p-1 h-8 w-14 block bg-gray-800 border border-white/10 cursor-pointer rounded-lg" /></div>
                                <div className="flex items-center justify-between"><label className="text-sm">Previous Button Text Color</label><input type="color" value={form.styles.prevButtonTextColor} onChange={e => props.onUpdateForm({ styles: { ...form.styles, prevButtonTextColor: e.target.value } })} className="p-1 h-8 w-14 block bg-gray-800 border border-white/10 cursor-pointer rounded-lg" /></div>
                            </Accordion>
                        </div>
                    )}
                    {activeGlobalTab === 'page-style' && (
                        <div className="space-y-4">
                            <p className="text-sm text-gray-400">Override global styles for the current page.</p>
                            <div><label className="block text-sm font-medium text-gray-400 mb-1">Background Type</label><select value={currentPage.styles?.backgroundType || 'color'} onChange={e => onUpdatePage(currentPage.id, { styles: { ...currentPage.styles, backgroundType: e.target.value as 'color' | 'image' } })} className="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2"><option value="color">Color</option><option value="image">Image</option></select></div>
                            {currentPage.styles?.backgroundType === 'color' ? (<div className="flex items-center justify-between"><label className="text-sm">Background Color</label><input type="color" value={currentPage.styles?.backgroundColor || '#FFFFFF'} onChange={e => onUpdatePage(currentPage.id, { styles: { ...currentPage.styles, backgroundColor: e.target.value } })} className="p-1 h-8 w-14 block bg-gray-800 border border-white/10 cursor-pointer rounded-lg" /></div>) : (<div><label className="block text-sm font-medium text-gray-400 mb-1">Background Image URL</label><input type="text" value={currentPage.styles?.backgroundImage || ''} onChange={e => onUpdatePage(currentPage.id, { styles: { ...currentPage.styles, backgroundImage: e.target.value } })} className="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2" /></div>)}
                            <div className="flex items-center justify-between"><label className="text-sm">Text Color</label><input type="color" value={currentPage.styles?.textColor || '#000000'} onChange={e => onUpdatePage(currentPage.id, { styles: { ...currentPage.styles, textColor: e.target.value } })} className="p-1 h-8 w-14 block bg-gray-800 border border-white/10 cursor-pointer rounded-lg" /></div>
                            <div className="flex items-center justify-between"><label className="text-sm">Field Gap (px)</label><input type="number" value={currentPage.styles?.gap ?? form.styles.gap} onChange={e => onUpdatePage(currentPage.id, { styles: { ...currentPage.styles, gap: parseInt(e.target.value, 10) || 0 } })} className="w-20 bg-gray-800 border border-white/10 rounded-lg px-3 py-1" /></div>
                        </div>
                    )}
                    {activeGlobalTab === 'settings' && (
                        <div className="space-y-4">
                               <Accordion title="Submission Messages">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Success Message</label>
                                        <input type="text" value={form.settings.submitSuccessMessage || ''} onChange={e => onUpdateFormSettings({ submitSuccessMessage: e.target.value })} className="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2" placeholder="Form submitted successfully!" />
                                    </div>
                                    <div className="pt-2">
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Error Message</label>
                                        <input type="text" value={form.settings.submitErrorMessage || ''} onChange={e => onUpdateFormSettings({ submitErrorMessage: e.target.value })} className="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2" placeholder="There was an error submitting your form." />
                                    </div>
                               </Accordion>
                               <Accordion title="Submit Button Loader">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Loader Style</label>
                                        <select
                                            value={form.settings.submitLoader?.type || 'default'}
                                            onChange={e => {
                                                const newType = e.target.value as LoaderSettings['type'];
                                                const currentSubmitLoader = form.settings.submitLoader || {type: 'default'};
                                                onUpdateFormSettings({
                                                    submitLoader: { ...currentSubmitLoader, type: newType }
                                                });
                                            }}
                                            className="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2">
                                            <option value="default">Default</option>
                                            <option value="dots">Dots</option>
                                            <option value="spinner">Spinner</option>
                                            <option value="bar">Bar</option>
                                            <option value="pulse">Pulse</option>
                                            <option value="custom">Custom GIF</option>
                                        </select>
                                    </div>
                                    {form.settings.submitLoader?.type === 'custom' && (
                                        <div className="pt-2">
                                            <label className="block text-sm font-medium text-gray-400 mb-1">Custom GIF URL</label>
                                            <input
                                                type="text"
                                                value={form.settings.submitLoader?.url || ''}
                                                onChange={e => {
                                                    const currentSubmitLoader = form.settings.submitLoader || { type: 'custom' };
                                                    onUpdateFormSettings({
                                                        submitLoader: { ...currentSubmitLoader, url: e.target.value }
                                                    });
                                                }}
                                                className="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2"
                                                placeholder="https://example.com/loader.gif"
                                            />
                                        </div>
                                    )}
                                    {form.settings.submitLoader?.type !== 'custom' && (
                                        <div className="flex items-center justify-between pt-2">
                                            <label className="text-sm">Loader Color</label>
                                            <input type="color" value={form.settings.submitLoader?.color || '#FFFFFF'} onChange={e => onUpdateFormSettings({ submitLoader: { ...form.settings.submitLoader, color: e.target.value } } as Partial<FormSettings>)} className="p-1 h-8 w-14 block bg-gray-800 border border-white/10 cursor-pointer rounded-lg" />
                                        </div>
                                    )}
                               </Accordion>
                               <Accordion title="Page Tracking">
                                <p className="text-sm text-gray-400 mb-2">Display progress for multi-page forms.</p>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Page Tracker Type</label>
                                        <select
                                            value={form.settings.pageTracker || 'none'}
                                            onChange={e => onUpdateFormSettings({ pageTracker: e.target.value as PageTrackerType })}
                                            className="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2"
                                        >
                                            <option value="none">None</option>
                                            <option value="numbers">Page Numbers (e.g., 1 of 3)</option>
                                            <option value="progress-bar">Progress Bar</option>
                                            <option value="both">Both</option>
                                        </select>
                                    </div>
                                    {form.settings.pageTracker !== 'none' && (
                                        <>
                                            <div className="flex items-center justify-between pt-2">
                                                <label className="text-sm">Tracker Color</label>
                                                <input type="color" value={form.settings.pageTrackerColor || '#4F46E5'} onChange={e => onUpdateFormSettings({ pageTrackerColor: e.target.value })} className="p-1 h-8 w-14 block bg-gray-800 border border-white/10 cursor-pointer rounded-lg" />
                                            </div>
                                            <div className="flex items-center justify-between pt-2">
                                                <label className="text-sm">Tracker Background Color</label>
                                                <input type="color" value={form.settings.pageTrackerBgColor || '#E5E7EB'} onChange={e => onUpdateFormSettings({ pageTrackerBgColor: e.target.value })} className="p-1 h-8 w-14 block bg-gray-800 border border-white/10 cursor-pointer rounded-lg" />
                                            </div>
                                        </>
                                    )}
                                </Accordion>
                                ---
                                <Accordion title="Thank You Page" defaultOpen>
                                    <div className="flex items-center justify-between">
                                        <label htmlFor="enableThankYouPage" className="text-sm font-medium text-gray-300">Enable Thank You Page</label>
                                        <input
                                            id="enableThankYouPage"
                                            type="checkbox"
                                            checked={form.settings.enableThankYouPage || false}
                                            onChange={e => onUpdateFormSettings({ enableThankYouPage: e.target.checked })}
                                            className="h-4 w-4 rounded text-indigo-600 bg-gray-700 border-gray-600 focus:ring-indigo-500 cursor-pointer"
                                        />
                                    </div>
                                    {form.settings.enableThankYouPage && (
                                        <>
                                            <p className="text-sm text-gray-400 mt-2">Customize the content of your thank you page by dragging fields from the palette.</p>
                                            <div className="space-y-2 max-h-60 overflow-y-auto border border-white/10 rounded p-2">
                                                {form.settings.thankYouPageContent?.length === 0 ? (
                                                    <div className="text-center text-gray-500 py-4">No fields added to Thank You page.</div>
                                                ) : (
                                                    form.settings.thankYouPageContent?.map((field, index) => (
                                                        <div key={field.id} className="bg-gray-700/50 p-2 rounded-lg flex items-center justify-between">
                                                            <span className="text-sm">{field.label}</span>
                                                            <button onClick={() => onFieldDelete(field.id)} className="text-red-400 hover:text-red-300 cursor-pointer"><Trash2Icon size={16} /></button>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">To edit Thank You page field properties, select the field in the preview.</div>
                                        </>
                                    )}
                                </Accordion>
                                ---
                            <Accordion title="API Integrations">
                                <div className="flex items-center justify-between pt-2"><label htmlFor="prefill" className="text-sm font-medium text-gray-300">Prefill from API</label><input id="prefill" type="checkbox" checked={form.settings.prefillFromAPI || false} onChange={e => props.onUpdateForm({ settings: { ...form.settings, prefillFromAPI: e.target.checked } })} className="h-4 w-4 rounded text-indigo-600 bg-gray-700 border-gray-600 focus:ring-indigo-500" /></div>
                                {form.settings.prefillFromAPI && (<div><label className="block text-sm font-medium text-gray-400 mb-1">API Endpoint URL</label><input type="text" value={form.settings.prefillApiUrl || ''} onChange={e => props.onUpdateForm({ settings: { ...form.settings, prefillApiUrl: e.target.value } })} className="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2" placeholder="https://api.example.com/data" /><p className="text-xs text-gray-500 mt-1">The user&apos;s ID will be appended as a query parameter.</p></div>)}
                                <div className="flex items-center justify-between pt-2"><label htmlFor="postOnSubmit" className="text-sm font-medium text-gray-300">POST to API on Submit</label><input id="postOnSubmit" type="checkbox" checked={form.settings.postOnSubmit || false} onChange={e => props.onUpdateForm({ settings: { ...form.settings, postOnSubmit: e.target.checked } })} className="h-4 w-4 rounded text-indigo-600 bg-gray-700 border-gray-600 focus:ring-indigo-500" /></div>
                                {form.settings.postOnSubmit && (<div><label className="block text-sm font-medium text-gray-400 mb-1">API Endpoint URL</label><input type="text" value={form.settings.postApiUrl || ''} onChange={e => props.onUpdateForm({ settings: { ...form.settings, postApiUrl: e.target.value } })} className="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2" placeholder="https://api.example.com/submit" /></div>)}
                            </Accordion>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
};

const HistoryPanel: FC<{
    onClose: () => void;
    activeTab: 'saved' | 'published';
    setActiveTab: (tab: 'saved' | 'published') => void;
    saveHistory: any[];
    publishHistory: any[];
    onRestore: (versionData: any) => void;
    isLoading: boolean;
}> = ({ onClose, activeTab, setActiveTab, saveHistory, publishHistory, onRestore, isLoading }) => {

    const formatDate = (timestamp: any) => {
        if (!timestamp || !timestamp._seconds) return 'Invalid date';
        return new Date(timestamp._seconds * 1000).toLocaleString();
    };

    const historyItems = activeTab === 'saved' ? saveHistory : publishHistory;
    const dateKey = activeTab === 'saved' ? 'savedAt' : 'publishedAt';

    return (
        <aside className="w-full md:w-80 lg:w-96 bg-transparent md:bg-gray-900/70 md:backdrop-blur-lg md:border-l md:border-white/10 flex flex-col flex-shrink-0 transition-all duration-300 h-full">
            <div className="flex items-center justify-between p-4 lg:p-6 border-b border-white/10 flex-shrink-0">
                <h2 className="text-xl font-bold text-white">Version History</h2>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-700/80 transition-colors">
                    <XIcon size={20} />
                </button>
            </div>
            <div className="flex border-b border-white/10 flex-shrink-0">
                <button onClick={() => setActiveTab('saved')} className={`flex-1 p-3 text-sm font-semibold cursor-pointer ${activeTab === 'saved' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-400'}`}>Saved</button>
                <button onClick={() => setActiveTab('published')} className={`flex-1 p-3 text-sm font-semibold cursor-pointer ${activeTab === 'published' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-400'}`}>Published</button>
            </div>
            <div className="flex-grow overflow-y-auto p-4 lg:p-6">
                {isLoading ? (
                    <div className="text-center text-gray-400">Loading history...</div>
                ) : (
                    <ul className="space-y-3">
                        {historyItems.length > 0 ? historyItems.map((version, index) => (
                            <li key={version.historyId || version[dateKey]?._seconds || index} className="bg-gray-800/50 p-3 rounded-lg flex items-center justify-between transition-colors hover:bg-gray-800">
                                <div>
                                    <p className="text-sm font-semibold text-white">{formatDate(version[dateKey])}</p>
                                    {version.historyId ? (
                                        <p className="text-xs text-gray-400 font-mono">ID: {version.historyId.substring(0, 7)}...</p>
                                    ) : (
                                        <p className="text-xs text-gray-500 font-mono">ID not available</p>
                                    )}
                                </div>
                                <button onClick={() => onRestore(version)} title="Restore this version" className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-indigo-600/50 transition-colors cursor-pointer">
                                    <RotateCcwIcon size={16} />
                                </button>
                            </li>
                        )) : (
                            <div className="text-center text-gray-500 mt-8">No {activeTab} versions found.</div>
                        )}
                    </ul>
                )}
            </div>
        </aside>
    );
};