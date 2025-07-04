import React, { useState, useEffect, useRef } from 'react';

const VideoStyles = () => (
    <style>{`
        .scene {
            animation: fadeIn 0.8s ease-in-out;
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        .fade-in { animation: fadeIn 1s ease-out forwards; }
        .fade-in-delay-1 { animation: fadeIn 1s ease-out 0.5s forwards; opacity: 0; }
        .fade-in-delay-2 { animation: fadeIn 1s ease-out 1s forwards; opacity: 0; }

        .logo-animation {
            animation: text-focus-in 1s cubic-bezier(0.550, 0.085, 0.680, 0.530) both, scaleUp 1.5s cubic-bezier(0.19, 1, 0.22, 1) 0.5s forwards;
        }
        @keyframes scaleUp {
            from { transform: scale(0.9); }
            to { transform: scale(1); }
        }
        @keyframes text-focus-in {
            0% { filter: blur(12px); opacity: 0; }
            100% { filter: blur(0px); opacity: 1; }
        }
        .animated-gradient-bg {
            background-size: 200% 200%;
            animation: gradient-pan 10s ease infinite;
        }
        @keyframes gradient-pan {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }

        .slide-in-bottom {
            animation: slideInBottom 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
            opacity: 0;
        }
        @keyframes slideInBottom {
            from { transform: translateY(50px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        .slide-in-left {
            animation: slideInLeft 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
            opacity: 0;
        }
        @keyframes slideInLeft {
            from { transform: translateX(-40px); opacity: 0; }
            to { transform: translateX(0px); opacity: 1; }
        }

        .form-card.bad {
             animation: fadeIn 1s ease-out forwards, subtle-float 6s ease-in-out infinite;
             border: 2px solid #e0e0e0;
        }
        .form-card.bad.cracked {
            animation: fadeIn 1s ease-out, shake-hard 0.6s ease-in-out 1.5s 3;
        }
        @keyframes subtle-float {
            0%, 100% { transform: translateY(0) rotate(-0.5deg); }
            50% { transform: translateY(-5px) rotate(0.5deg); }
        }
        @keyframes shake-hard {
             0% { transform: translate(1px, 1px) rotate(0deg); }
             25% { transform: translate(-1px, -2px) rotate(-1deg); }
             50% { transform: translate(-3px, 0px) rotate(1deg); }
             75% { transform: translate(1px, 2px) rotate(0deg); }
             100% { transform: translate(1px, -1px) rotate(1deg); }
        }

        .dnd-item { cursor: grab; padding: 0.75rem 1rem; background-color: #f3f4f6; border-radius: 0.5rem; font-weight: 500; color: #4b5563; transition: all 0.2s ease-in-out; }
        .dnd-item-active { cursor: grab; padding: 0.75rem 1rem; background-color: #4f46e5; color: white; border-radius: 0.5rem; font-weight: 500; box-shadow: 0 4px 14px 0 rgba(79, 70, 229, 0.5); transform: scale(1.05); }
        .dnd-placeholder { border: 2px dashed #d1d5db; border-radius: 0.5rem; padding: 1.5rem; text-align: center; font-weight: 500; color: #6b7280; position: absolute; width: calc(100% - 2rem); left: 1rem; background-color: #f9fafb; }
        .dnd-drop-1 { top: 1rem; animation: dropIn 0.5s ease-out 1s forwards; opacity: 0; }
        .dnd-drop-2 { top: 6.5rem; animation: dropIn 0.5s ease-out 1.5s forwards; opacity: 0; }
        @keyframes dropIn { from { transform: translateY(-20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

        .shadow-inner-custom { box-shadow: inset 0 2px 4px 0 rgba(0,0,0,0.06); }

        .checkmark-pop { animation: popIn 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55) forwards; }
        @keyframes popIn { 0% { transform: scale(0.5); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }

        .confetti { position: absolute; width: 8px; height: 8px; border-radius: 50%; opacity: 0; animation: confetti-fall 2.5s ease-out forwards; }
        @keyframes confetti-fall { 0% { transform: translateY(-100px) rotateZ(0deg); opacity: 1; } 100% { transform: translateY(300px) rotateZ(360deg); opacity: 0; } }

        .pulse-ring { animation: pulseRing 2s infinite cubic-bezier(0.66, 0, 0, 1); }
        @keyframes pulseRing {
            0%, 100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.7); }
            50% { box-shadow: 0 0 0 14px rgba(99, 102, 241, 0); }
        }

        .template-card {
            background-color: white;
            border-radius: 0.75rem;
            border: 1px solid #e5e7eb;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            overflow: hidden;
        }
        .template-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
        }
        .template-card-active {
            border: 2px solid #4f46e5;
            transform: translateY(-8px) scale(1.05);
            box-shadow: 0 0 25px rgba(79, 70, 229, 0.3);
        }

        .chart-bar { flex-grow: 1; background-image: linear-gradient(to top, #4f46e5, #818cf8); border-radius: 4px 4px 0 0; animation: growHeight 1.2s cubic-bezier(0.23, 1, 0.32, 1) forwards; }
        @keyframes growHeight { from { height: 0%; } }

        .avatar-glow {
            box-shadow: 0 0 20px rgba(255,255,255,0.8), 0 0 8px rgba(79,70,229,0.6);
        }
        .team-avatar {
             animation: avatarPopIn 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55) forwards;
             opacity: 0;
             border: 3px solid white;
        }
        @keyframes avatarPopIn { from { transform: scale(0.6); opacity: 0; } to { transform: scale(1); opacity: 1; } }

        .logic-flow { animation: drawLine 2s ease-out 1s forwards; stroke-dasharray: 1000; stroke-dashoffset: 1000; }
        @keyframes drawLine { to { stroke-dashoffset: 0; } }

        .integration-orbit {
            position: absolute;
            animation: orbit 15s linear infinite;
        }
        @keyframes orbit {
            from { transform: rotate(0deg) translateX(150px) rotate(0deg); }
            to { transform: rotate(360deg) translateX(150px) rotate(-360deg); }
        }
        .integration-icon {
            background: rgba(255,255,255,0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }
    `}</style>
);

function ConfettiPiece() {
    const colors = ['#f43f5e', '#8b5cf6', '#14b8a6', '#f59e0b'];
    return <div className="confetti" style={{ backgroundColor: colors[Math.floor(Math.random() * colors.length)], left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 0.2}s` }}></div>;
}

function BoringFormsScene() {
    return (
        <div className="scene w-full h-full flex flex-col items-center justify-center bg-gray-200 p-8 overflow-hidden">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-700 mb-8 text-center fade-in">Tired of boring, generic forms?</h2>
            <div className="flex items-center gap-8">
                 <img src="https://placehold.co/120x120/000000/ffffff?text=:( " alt="Frustrated User" className="rounded-full slide-in-left hidden md:block" style={{animationDelay: '0.6s'}} />
                 <div className="flex gap-4 md:gap-8">
                    <div className="form-card bad cracked bg-white p-6 rounded-lg w-52 md:w-64" style={{animationDelay: '0.2s'}}>
                        <h3 className="font-bold text-gray-500">Login</h3>
                        <label className="text-sm text-gray-400 mt-4 block">Username</label>
                        <input type="text" className="w-full border border-gray-400 p-2 mt-1 rounded-md" />
                        <button className="w-full bg-gray-300 text-gray-500 p-2 mt-4 rounded-md">Submit</button>
                    </div>
                     <div className="form-card bad bg-white p-6 rounded-lg w-52 md:w-64" style={{animationDelay: '0.4s'}}>
                        <h3 className="font-bold text-gray-500">Contact</h3>
                        <label className="text-sm text-gray-400 mt-4 block">Email</label>
                        <input type="text" className="w-full border border-gray-400 p-2 mt-1 rounded-md" />
                        <button className="w-full bg-gray-300 text-gray-500 p-2 mt-4 rounded-md">Send</button>
                    </div>
                 </div>
            </div>
        </div>
    );
}

function DragAndDropScene() {
    return (
        <div className="scene w-full h-full flex flex-col items-center justify-center bg-white p-8 overflow-hidden">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8 text-center fade-in">Build with a simple drag & drop.</h2>
            <div className="w-full max-w-2xl h-72 bg-gray-100 rounded-xl flex items-center justify-center p-4 gap-4 shadow-inner-custom">
                <div className="w-1/3 h-full bg-white rounded-lg p-3 space-y-3 shadow-md">
                    <div className="dnd-item fade-in" style={{ animationDelay: '0.2s' }}>Text Input</div>
                    <div className="dnd-item-active fade-in" style={{ animationDelay: '0.4s' }}>Email Input</div>
                    <div className="dnd-item fade-in" style={{ animationDelay: '0.6s' }}>Password</div>
                    <div className="dnd-item fade-in" style={{ animationDelay: '0.8s' }}>Submit Button</div>
                </div>
                <div className="w-2/3 h-full bg-white rounded-lg p-4 relative shadow-md">
                    <div className="dnd-placeholder dnd-drop-1">Email Input</div>
                    <div className="dnd-placeholder dnd-drop-2">Submit Button</div>
                </div>
            </div>
        </div>
    );
}

function LivePreviewScene() {
    const [buttonColor, setButtonColor] = useState('bg-indigo-600');
    const colors = ['bg-indigo-600', 'bg-pink-500', 'bg-teal-500', 'bg-gray-800'];
    useEffect(() => {
        const interval = setInterval(() => { setButtonColor(prev => colors[(colors.indexOf(prev) + 1) % colors.length]); }, 1200);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="scene w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 p-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8 text-center fade-in">Customize and see changes instantly.</h2>
            <div className="w-full max-w-3xl h-80 bg-white rounded-xl flex p-4 gap-4 shadow-2xl">
                <div className="w-1/3 h-full p-3 slide-in-left">
                    <h3 className="font-bold text-gray-600 mb-4">Button Color</h3>
                    <div className="space-y-2">
                        {colors.map(color => ( <div key={color} className={`w-full p-2 rounded-md transition-all ${buttonColor === color ? 'ring-2 ring-indigo-500 shadow-lg' : 'ring-1 ring-gray-200'}`}><div className={`h-8 w-full rounded ${color}`}></div></div> ))}
                    </div>
                     <div className="flex items-center mt-6 fade-in" style={{animationDelay: '1s'}}>
                        <img src="https://placehold.co/40x40/000000/ffffff?text=ED" alt="Editor" className="rounded-full mr-3 border-2 border-indigo-200" />
                        <div>
                           <p className="font-bold text-sm text-gray-700">Jane editing...</p>
                        </div>
                    </div>
                </div>
                <div className="w-2/3 h-full bg-gray-50 rounded-lg p-6 flex flex-col justify-center items-center shadow-inner-custom fade-in-delay-1">
                     <h3 className="font-bold text-xl text-gray-800">Get In Touch</h3>
                     <input type="email" placeholder="you@example.com" className="w-full border-2 border-gray-200 p-3 mt-4 rounded-md focus:ring-2 focus:ring-indigo-500 transition" />
                     <button className={`w-full text-white font-bold p-3 mt-4 rounded-lg shadow-lg transition-all duration-500 ${buttonColor}`}>Contact Us</button>
                </div>
            </div>
        </div>
    );
}

function InteractiveScene() {
    const [isSubmitted, setIsSubmitted] = useState(false);
    useEffect(() => {
        const timer = setTimeout(() => setIsSubmitted(true), 2000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="scene w-full h-full flex flex-col items-center justify-center bg-gray-100 p-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8 text-center fade-in">Engage users with <span className="text-pink-500">beautiful animations.</span></h2>
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md relative overflow-hidden">
                <div className="flex items-center justify-between">
                    <label className="text-gray-600 font-medium">Full Name</label>
                    <div className={`text-green-500 transition-opacity duration-500 ${isSubmitted ? 'opacity-0' : 'opacity-100'}`}><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 checkmark-pop" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg></div>
                </div>
                <input type="text" defaultValue="Jane Doe" className="w-full border-2 border-green-500 p-3 mt-1 rounded-md ring-2 ring-green-200" readOnly />
                <div className="mt-6 h-16">
                    {isSubmitted ? ( <div className="text-center p-4 bg-green-100 text-green-800 font-bold rounded-lg text-xl fade-in">Success!</div> ) : ( <button className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold p-4 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 animate-pulse">Submit</button> )}
                </div>
                {isSubmitted && Array.from({ length: 30 }).map((_, i) => <ConfettiPiece key={i} />)}
            </div>
        </div>
    );
}

function TemplateGalleryScene() {
    return (
        <div className="scene w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100 p-8 overflow-hidden">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8 text-center slide-in-bottom">Start with a Stunning Template.</h2>
            <div className="w-full max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="template-card slide-in-bottom" style={{ animationDelay: '0.2s' }}>
                    <div className="p-4 w-full">
                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center"><p className="text-red-500">✉️</p></div>
                        <div className="w-full h-2 bg-gray-200 rounded-full mt-4"></div>
                        <div className="w-2/3 h-2 bg-gray-200 rounded-full mt-2"></div>
                    </div>
                    <div className="bg-gray-50 p-2 text-center w-full border-t"><h3 className="font-bold text-sm text-gray-700">Contact Us</h3></div>
                </div>
                <div className="template-card template-card-active slide-in-bottom" style={{ animationDelay: '0.4s' }}>
                    <div className="p-4 w-full">
                         <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center"><p className="text-indigo-500">📅</p></div>
                        <div className="w-full h-2 bg-indigo-200 rounded-full mt-4"></div>
                        <div className="w-2/3 h-2 bg-indigo-200 rounded-full mt-2"></div>
                    </div>
                    <div className="bg-indigo-50 p-2 text-center w-full border-t border-indigo-100"><h3 className="font-bold text-sm text-indigo-700">Event RSVP</h3></div>
                </div>
                <div className="template-card slide-in-bottom" style={{ animationDelay: '0.6s' }}>
                    <div className="p-4 w-full">
                         <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center"><p className="text-teal-500">💼</p></div>
                        <div className="w-full h-2 bg-gray-200 rounded-full mt-4"></div>
                        <div className="w-2/3 h-2 bg-gray-200 rounded-full mt-2"></div>
                    </div>
                    <div className="bg-gray-50 p-2 text-center w-full border-t"><h3 className="font-bold text-sm text-gray-700">Job Application</h3></div>
                </div>
                <div className="template-card slide-in-bottom" style={{ animationDelay: '0.8s' }}>
                   <div className="p-4 w-full">
                         <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center"><p className="text-amber-500">⭐</p></div>
                        <div className="w-full h-2 bg-gray-200 rounded-full mt-4"></div>
                        <div className="w-2/3 h-2 bg-gray-200 rounded-full mt-2"></div>
                    </div>
                    <div className="bg-gray-50 p-2 text-center w-full border-t"><h3 className="font-bold text-sm text-gray-700">Feedback</h3></div>
                </div>
            </div>
        </div>
    );
}

function AnalyticsScene() {
    return (
        <div className="scene w-full h-full flex flex-col items-center justify-center bg-gray-900 p-8 overflow-hidden">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center fade-in">Track Your Results with Ease.</h2>
            <div className="w-full max-w-2xl bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-gray-700">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-xl text-white">Form Analytics</h3>
                    <span className="text-sm text-green-400 fade-in" style={{animationDelay: '0.5s'}}>+12% Conversion</span>
                </div>
                <div className="w-full h-40 bg-gray-700/50 rounded-lg p-2 flex items-end gap-2">
                    <div className="chart-bar" style={{ height: '60%', animationDelay: '0.8s' }}></div>
                    <div className="chart-bar" style={{ height: '80%', animationDelay: '1.0s' }}></div>
                    <div className="chart-bar" style={{ height: '50%', animationDelay: '1.2s' }}></div>
                    <div className="chart-bar" style={{ height: '70%', animationDelay: '1.4s' }}></div>
                    <div className="chart-bar" style={{ height: '90%', animationDelay: '1.6s' }}></div>
                </div>
            </div>
        </div>
    );
}

function AdvancedLogicScene() {
    return (
        <div className="scene w-full h-full flex flex-col items-center justify-center bg-white p-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 text-center fade-in">Create smart, dynamic forms.</h2>
            <p className="text-lg text-gray-500 mb-8 fade-in-delay-1">Use <span className="font-bold text-indigo-600">conditional logic</span> to create a unique user experience.</p>
            <div className="w-full max-w-lg bg-gray-50 p-6 rounded-xl shadow-lg border border-gray-200 fade-in-delay-2">
                <div className="flex items-center justify-between">
                   <div className="p-3 bg-white rounded-lg shadow font-medium">Are you attending in person?</div>
                   <div className="flex gap-2">
                     <span className="p-3 bg-indigo-500 text-white rounded-lg shadow-md font-medium">Yes</span>
                     <span className="p-3 bg-white rounded-lg shadow font-medium">No</span>
                   </div>
                </div>
                 <svg className="w-full h-16" viewBox="0 0 300 60"><path d="M 150 10 V 50 M 150 50 L 50 50 M 150 50 L 250 50" stroke="#d1d5db" strokeWidth="2.5" className="logic-flow" /></svg>
                 <div className="flex justify-between">
                     <div className="p-3 bg-white rounded-lg shadow opacity-50 w-40 text-center font-medium">Dietary Needs?</div>
                     <div className="p-3 bg-indigo-100 border-2 border-indigo-500 text-indigo-800 rounded-lg shadow-lg w-40 text-center font-bold">T-shirt size?</div>
                 </div>
            </div>
        </div>
    );
}

function CollaborationScene() {
    return (
        <div className="scene w-full h-full flex flex-col items-center justify-center bg-gray-900 p-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-10 text-center fade-in">Work together, faster.</h2>
            <div className="relative w-full max-w-lg bg-gray-800/80 backdrop-blur-sm border border-gray-700 p-8 rounded-2xl shadow-2xl">
                <h3 className="text-xl font-bold text-white text-center">Event Registration Form</h3>
                <img src="https://placehold.co/50x50/ffffff/000000?text=A" alt="User A" className="team-avatar absolute top-4 left-4" style={{animationDelay: '0.5s'}}/>
                <img src="https://placehold.co/50x50/ffffff/000000?text=B" alt="User B" className="team-avatar absolute top-16 right-[-20px]" style={{animationDelay: '0.7s', borderColor: '#ec4899'}}/>
                <img src="https://placehold.co/50x50/ffffff/000000?text=C" alt="User C" className="team-avatar absolute bottom-4 left-[-20px]" style={{animationDelay: '0.9s', borderColor: '#14b8a6'}}/>
                <div className="mt-6 space-y-4">
                     <div className="h-12 bg-gray-700 rounded-md slide-in-left" style={{animationDelay: '1.1s'}}></div>
                     <div className="h-12 bg-gray-700 rounded-md slide-in-left" style={{animationDelay: '1.3s'}}></div>
                     <div className="h-12 bg-pink-500/50 rounded-md ring-2 ring-pink-400 slide-in-left" style={{animationDelay: '1.5s'}}></div>
                </div>
            </div>
        </div>
    );
}

const scenes = [
    {
        duration: 2500,
        content: (
            <div className="scene w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900 animated-gradient-bg">
                <div className="text-center logo-animation">
                    <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter">QuickForm<span className="text-indigo-400">.</span>io</h1>
                </div>
            </div>
        )
    },
    { duration: 4000, content: <BoringFormsScene /> },
    { duration: 4000, content: <DragAndDropScene /> },
    { duration: 4500, content: <LivePreviewScene /> },
    { duration: 4000, content: <InteractiveScene /> },
    { duration: 4000, content: <TemplateGalleryScene /> },
    { duration: 4000, content: <AnalyticsScene /> },
    { duration: 4500, content: <AdvancedLogicScene /> },
    {
        duration: 5000,
        content: (
             <div className="scene w-full h-full flex flex-col items-center justify-center bg-gray-900 p-8 overflow-hidden animated-gradient-bg bg-gradient-to-br from-gray-900 via-indigo-900 to-gray-800">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center fade-in">Connect with your favorite tools.</h2>
                <div className="relative w-40 h-40 flex items-center justify-center fade-in-delay-1">
                    <div className="w-24 h-24 bg-indigo-500/30 rounded-full flex items-center justify-center pulse-ring"><span className="font-bold text-white text-3xl">API</span></div>
                    <div className="integration-orbit" style={{ animationDuration: '12s' }}>
                        <img src="https://cdn.worldvectorlogo.com/logos/slack-new-logo.svg" alt="Slack" className="w-12 h-12 p-2 rounded-full integration-icon" />
                    </div>
                    <div className="integration-orbit" style={{ animationDelay: '-3s', animationDuration: '10s' }}>
                        <img src="https://cdn.worldvectorlogo.com/logos/google-sheets.svg" alt="Google Sheets" className="w-12 h-12 p-2 rounded-full integration-icon" />
                    </div>
                     <div className="integration-orbit" style={{ animationDelay: '-6s', animationDuration: '13s' }}>
                        <img src="https://cdn.worldvectorlogo.com/logos/salesforce-2.svg" alt="Salesforce" className="w-12 h-12 p-2 rounded-full integration-icon" />
                    </div>
                     <div className="integration-orbit" style={{ animationDelay: '-9s', animationDuration: '11s' }}>
                        <img src="https://cdn.worldvectorlogo.com/logos/zapier.svg" alt="Zapier" className="w-12 h-12 p-2 rounded-full integration-icon" />
                    </div>
                </div>
            </div>
        )
    },
    { duration: 4500, content: <CollaborationScene /> },
    {
        duration: 4000,
        content: (
             <div className="scene w-full h-full flex flex-col items-center justify-center bg-gradient-to-tr from-blue-900 to-purple-900 p-8 overflow-hidden">
                <h2 className="text-4xl font-bold text-white mb-8 text-center slide-in-bottom">Perfect on any device.</h2>
                <div className="flex items-end justify-center gap-2 md:gap-[-2rem] h-64">
                    <div className="slide-in-bottom" style={{ animationDelay: '0.2s' }}><div className="w-96 h-56 bg-gray-700 rounded-t-lg border-4 border-gray-600 p-2 shadow-2xl"><div className="w-full h-full bg-indigo-100 rounded-sm"></div></div></div>
                    <div className="slide-in-bottom" style={{ animationDelay: '0.4s' }}><div className="w-48 h-64 bg-gray-700 rounded-t-lg border-4 border-gray-600 p-1 shadow-2xl"><div className="w-full h-full bg-indigo-100 rounded-sm"></div></div></div>
                   <div className="slide-in-bottom" style={{ animationDelay: '0.6s' }}><div className="w-24 h-48 bg-gray-700 rounded-t-lg border-2 border-gray-600 p-1 shadow-2xl"><div className="w-full h-full bg-indigo-100 rounded-sm"></div></div></div>
                </div>
             </div>
        )
    },
    {
        duration: 5000,
        content: (
            <div className="scene w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-indigo-900 to-gray-800 text-center p-8 animated-gradient-bg">
                <div className="fade-in">
                   <img src="https://placehold.co/100x100/ffffff/a78bfa?text=U" className="rounded-full shadow-2xl mb-6 mx-auto avatar-glow" alt="Happy User"/>
                </div>
                <div className="fade-in" style={{ animationDelay: '0.5s' }}>
                   <h2 className="text-4xl md:text-5xl font-bold text-white">Create your perfect form. Today.</h2>
                </div>
                <div className="mt-8 fade-in" style={{ animationDelay: '1s' }}>
                    <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter">QuickForm<span className="text-indigo-400">.</span>io</h1>
                </div>
                <div className="mt-12 fade-in" style={{ animationDelay: '1.5s' }}>
                    <a href="#" className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-10 text-xl rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300 inline-block pulse-ring">
                        Sign Up Free
                    </a>
                </div>
            </div>
        )
    }
];

export default function QuickFormVideo() {
    const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
    const sceneTimeoutRef = useRef(null);

    useEffect(() => {
        if (sceneTimeoutRef.current) {
            clearTimeout(sceneTimeoutRef.current);
        }
        sceneTimeoutRef.current = setTimeout(() => {
            setCurrentSceneIndex(prevIndex => (prevIndex + 1) % scenes.length);
        }, scenes[currentSceneIndex].duration);

        return () => clearTimeout(sceneTimeoutRef.current);
    }, [currentSceneIndex]);

    return (
        <div className="w-full">
            <VideoStyles />
            <div className="video-container bg-black rounded-2xl aspect-video w-full relative shadow-2xl shadow-indigo-900/30 overflow-hidden">
                <div className="w-full h-full">
                    {scenes[currentSceneIndex].content}
                </div>
            </div>
        </div>
    );
}