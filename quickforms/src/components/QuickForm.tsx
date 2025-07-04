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
        .fade-in {
            animation: fadeIn 1s ease-out forwards;
        }
        .logo-animation {
            animation: fadeIn 1s ease-out, scaleUp 1.5s cubic-bezier(0.19, 1, 0.22, 1) forwards;
        }
        @keyframes scaleUp {
            from { transform: scale(0.9); }
            to { transform: scale(1); }
        }
        .form-card.bad {
             animation: fadeIn 1s ease-out forwards;
             transition: transform 0.3s ease;
        }
        .form-card.bad:hover {
            transform: translateY(-5px);
        }
        .dnd-item {
            cursor: grab;
            padding: 0.75rem 1rem;
            background-color: #f3f4f6;
            border-radius: 0.5rem;
            font-weight: 500;
            color: #4b5563;
            transition: all 0.2s ease-in-out;
        }
        .dnd-item-active {
            cursor: grab;
            padding: 0.75rem 1rem;
            background-color: #4f46e5;
            color: white;
            border-radius: 0.5rem;
            font-weight: 500;
            box-shadow: 0 4px 14px 0 rgba(79, 70, 229, 0.5);
            transform: scale(1.05);
        }
        .dnd-placeholder {
            border: 2px dashed #d1d5db;
            border-radius: 0.5rem;
            padding: 1.5rem;
            text-align: center;
            font-weight: 500;
            color: #6b7280;
            position: absolute;
            width: calc(100% - 2rem);
            left: 1rem;
            background-color: #f9fafb;
        }
        .dnd-drop-1 {
            top: 1rem;
            animation: dropIn 0.5s ease-out 1s forwards;
            opacity: 0;
        }
        .dnd-drop-2 {
            top: 6.5rem;
            animation: dropIn 0.5s ease-out 1.5s forwards;
            opacity: 0;
        }
        @keyframes dropIn {
            from { transform: translateY(-20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        .shadow-inner-custom {
            box-shadow: inset 0 2px 4px 0 rgba(0,0,0,0.06);
        }
        .checkmark-pop {
             animation: popIn 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55) forwards;
        }
        @keyframes popIn {
             0% { transform: scale(0.5); opacity: 0; }
             100% { transform: scale(1); opacity: 1; }
        }
        .confetti {
            position: absolute;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            opacity: 0;
            animation: confetti-fall 2.5s ease-out forwards;
        }
        @keyframes confetti-fall {
            0% { transform: translateY(-100px) rotateZ(0deg); opacity: 1; }
            100% { transform: translateY(300px) rotateZ(360deg); opacity: 0; }
        }
        .slide-in-bottom {
            animation: slideInBottom 0.7s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
            opacity: 0;
        }
        @keyframes slideInBottom {
            from { transform: translateY(50px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        .pulse-ring {
             animation: pulseRing 1.5s infinite;
        }
        @keyframes pulseRing {
            0%, 100% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.7); }
            50% { box-shadow: 0 0 0 10px rgba(79, 70, 229, 0); }
        }
        .template-card {
            background-color: white;
            border-radius: 0.75rem;
            height: 9rem;
            padding: 1rem;
            display: flex;
            align-items: flex-end;
            border: 1px solid #e5e7eb;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .template-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
        }
        .template-card-active {
            border: 2px solid #4f46e5;
            transform: scale(1.05);
        }
        .chart-bar {
            flex-grow: 1;
            background-image: linear-gradient(to top, #4f46e5, #818cf8);
            border-radius: 4px 4px 0 0;
            animation: growHeight 1.2s cubic-bezier(0.23, 1, 0.32, 1) forwards;
        }
        @keyframes growHeight {
            from { height: 0%; }
        }
        .icon-float {
            animation: iconFloat 3s ease-in-out infinite;
        }
        @keyframes iconFloat {
            0%, 100% { transform: translateY(0) scale(1.1); }
            50% { transform: translateY(-10px) scale(1.1); }
        }
    `}</style>
);

function DragAndDropScene() {
    return (
        <div className="scene w-full h-full flex flex-col items-center justify-center bg-white p-8 overflow-hidden">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8 text-center fade-in">Build forms with a simple drag & drop.</h2>
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
        const interval = setInterval(() => {
            setButtonColor(prev => colors[(colors.indexOf(prev) + 1) % colors.length]);
        }, 1200);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="scene w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 p-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8 text-center fade-in">Customize and see changes instantly.</h2>
            <div className="w-full max-w-3xl h-80 bg-white rounded-xl flex p-4 gap-4 shadow-2xl">
                <div className="w-1/3 h-full p-3">
                    <h3 className="font-bold text-gray-600 mb-4">Button Color</h3>
                    <div className="space-y-2">
                        {colors.map(color => (
                            <div key={color} className={`w-full p-2 rounded-md transition-all ${buttonColor === color ? 'ring-2 ring-indigo-500 shadow-lg' : 'ring-1 ring-gray-200'}`}>
                                <div className={`h-8 w-full rounded ${color}`}></div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="w-2/3 h-full bg-gray-50 rounded-lg p-6 flex flex-col justify-center items-center shadow-inner-custom">
                     <h3 className="font-bold text-xl text-gray-800">Get In Touch</h3>
                     <input type="email" placeholder="you@example.com" className="w-full border-2 border-gray-200 p-3 mt-4 rounded-md focus:ring-2 focus:ring-indigo-500" />
                     <button className={`w-full text-white font-bold p-3 mt-4 rounded-lg shadow-lg transition-all duration-500 ${buttonColor}`}>
                        Contact Us
                     </button>
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
                    <label className="text-gray-600">Full Name</label>
                    <div className={`text-green-500 transition-opacity duration-500 ${isSubmitted ? 'opacity-0' : 'opacity-100'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 checkmark-pop" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                    </div>
                </div>
                <input type="text" defaultValue="Jane Doe" className="w-full border-2 border-green-500 p-3 mt-1 rounded-md ring-2 ring-green-200" readOnly />
                <div className="mt-6 h-16">
                    {isSubmitted ? (
                        <div className="text-center p-4 bg-green-100 text-green-800 font-bold rounded-lg text-xl fade-in">
                            Success!
                        </div>
                    ) : (
                        <button className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold p-4 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 animate-pulse">
                            Submit
                        </button>
                    )}
                </div>
                {isSubmitted && Array.from({ length: 30 }).map((_, i) => <ConfettiPiece key={i} />)}
            </div>
        </div>
    );
}

function ConfettiPiece() {
    const colors = ['#f43f5e', '#8b5cf6', '#14b8a6', '#f59e0b'];
    return <div className="confetti" style={{
        backgroundColor: colors[Math.floor(Math.random() * colors.length)],
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 0.2}s`,
    }}></div>;
}

function TemplateGalleryScene() {
    return (
        <div className="scene w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100 p-8 overflow-hidden">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8 text-center slide-in-bottom" style={{ animationDelay: '0s' }}>Start with a Stunning Template.</h2>
            <div className="w-full max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="template-card slide-in-bottom" style={{ animationDelay: '0.2s' }}><h3 className="font-bold">Contact Us</h3></div>
                <div className="template-card template-card-active slide-in-bottom" style={{ animationDelay: '0.4s' }}><h3 className="font-bold">Event RSVP</h3></div>
                <div className="template-card slide-in-bottom" style={{ animationDelay: '0.6s' }}><h3 className="font-bold">Job Application</h3></div>
                <div className="template-card slide-in-bottom" style={{ animationDelay: '0.8s' }}><h3 className="font-bold">Feedback</h3></div>
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

const scenes = [
    {
        duration: 2000,
        content: (
            <div className="scene w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
                <div className="text-center logo-animation">
                    <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter">QuickForm<span className="text-indigo-500">.</span>io</h1>
                </div>
            </div>
        )
    },
    {
        duration: 3500,
        content: (
            <div className="scene w-full h-full flex flex-col items-center justify-center bg-gray-200 p-8">
                 <h2 className="text-3xl md:text-4xl font-bold text-gray-700 mb-8 text-center fade-in">Tired of boring, generic forms?</h2>
                 <div className="flex gap-8">
                    <div className="form-card bad bg-white p-6 rounded-lg border-2 border-gray-300 w-64" style={{animationDelay: '0.2s'}}>
                        <h3 className="font-bold text-gray-500">Login</h3>
                        <label className="text-sm text-gray-400 mt-4 block">Username</label>
                        <input type="text" className="w-full border border-gray-400 p-2 mt-1 rounded-md" />
                        <button className="w-full bg-gray-300 text-gray-500 p-2 mt-4 rounded-md">Submit</button>
                    </div>
                     <div className="form-card bad bg-white p-6 rounded-lg border-2 border-gray-300 w-64 hidden md:block" style={{animationDelay: '0.4s'}}>
                        <h3 className="font-bold text-gray-500">Contact</h3>
                        <label className="text-sm text-gray-400 mt-4 block">Email</label>
                        <input type="text" className="w-full border border-gray-400 p-2 mt-1 rounded-md" />
                        <button className="w-full bg-gray-300 text-gray-500 p-2 mt-4 rounded-md">Send</button>
                    </div>
                 </div>
            </div>
        )
    },
    { duration: 4000, content: <DragAndDropScene /> },
    { duration: 4500, content: <LivePreviewScene /> },
    { duration: 4000, content: <InteractiveScene /> },
    { duration: 4000, content: <TemplateGalleryScene /> },
    { duration: 4000, content: <AnalyticsScene /> },
    {
        duration: 4000,
        content: (
             <div className="scene w-full h-full flex flex-col items-center justify-center bg-gray-900 p-8">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center fade-in">Connect with your favorite tools.</h2>
                <div className="flex items-center justify-center space-x-4 md:space-x-8">
                    {['API', 'Sheets', 'Slack', 'CRM'].map((tool, i) => (
                        <div key={tool} className="icon-float" style={{ animationDelay: `${i * 0.2}s` }}>
                             <img src={`https://placehold.co/80x80/000000/ffffff?text=${tool}`} alt={`${tool} Icon`} className="h-16 w-16 md:h-20 md:w-20 rounded-2xl shadow-lg"/>
                        </div>
                    ))}
                </div>
            </div>
        )
    },
    {
        duration: 4000,
        content: (
             <div className="scene w-full h-full flex flex-col items-center justify-center bg-gradient-to-tr from-blue-900 to-purple-900 p-8 overflow-hidden">
                <h2 className="text-4xl font-bold text-white mb-8 text-center slide-in-bottom" style={{animationDelay: '0s'}}>Perfect on any device.</h2>
                <div className="flex items-end justify-center gap-2 md:gap-[-2rem] h-64">
                    <div className="slide-in-bottom" style={{ animationDelay: '0.2s' }}>
                        <div className="w-96 h-56 bg-gray-700 rounded-t-lg border-4 border-gray-600 p-2 shadow-2xl"><div className="w-full h-full bg-indigo-100 rounded-sm"></div></div>
                    </div>
                    <div className="slide-in-bottom" style={{ animationDelay: '0.4s' }}>
                        <div className="w-48 h-64 bg-gray-700 rounded-t-lg border-4 border-gray-600 p-1 shadow-2xl"><div className="w-full h-full bg-indigo-100 rounded-sm"></div></div>
                    </div>
                   <div className="slide-in-bottom" style={{ animationDelay: '0.6s' }}>
                        <div className="w-24 h-48 bg-gray-700 rounded-t-lg border-2 border-gray-600 p-1 shadow-2xl"><div className="w-full h-full bg-indigo-100 rounded-sm"></div></div>
                   </div>
                </div>
             </div>
        )
    },
    {
        duration: 4500,
        content: (
            <div className="scene w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 text-center p-8">
                <div className="fade-in" style={{ animationDelay: '0s' }}>
                   <h2 className="text-4xl md:text-5xl font-bold text-white">Create your perfect form. Today.</h2>
                </div>
                <div className="mt-8 fade-in" style={{ animationDelay: '0.5s' }}>
                    <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter">QuickForm<span className="text-indigo-500">.</span>io</h1>
                </div>
                <div className="mt-12 fade-in" style={{ animationDelay: '1s' }}>
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
        sceneTimeoutRef.current = setTimeout(() => {
            setCurrentSceneIndex(prevIndex => (prevIndex + 1) % scenes.length);
        }, scenes[currentSceneIndex].duration);

        return () => clearTimeout(sceneTimeoutRef.current);
    }, [currentSceneIndex]);

    return (
        <div className="w-full">
            <VideoStyles />
            <div className="video-container bg-black rounded-2xl aspect-video w-full relative shadow-2xl shadow-indigo-500/20 overflow-hidden">
                <div className="w-full h-full">
                    {scenes[currentSceneIndex].content}
                </div>
            </div>
        </div>
    );
}