import React, { useState, useEffect, useRef, FC, ReactNode } from 'react';

const ShowcaseStyles: FC = () => (
    <style>{`
        .scene { animation: scene-fade-in 0.7s ease-in-out; }
        @keyframes scene-fade-in { from { opacity: 0; } to { opacity: 1; } }

        .item-pop-in { animation: item-pop-in 0.6s cubic-bezier(0.68, -0.55, 0.27, 1.55) forwards; opacity: 0; }
        @keyframes item-pop-in { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }

        .item-slide-up { animation: item-slide-up 0.7s ease-out forwards; opacity: 0; }
        @keyframes item-slide-up { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

        .avatar { animation: avatar-pop 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55) forwards; opacity: 0; border: 3px solid #1f2937; box-shadow: 0 0 15px rgba(0,0,0,0.5); }
        @keyframes avatar-pop { from { transform: scale(0.6); opacity: 0; } to { transform: scale(1); opacity: 1; } }

        .integration-orbit { position: absolute; animation: orbit 15s linear infinite; }
        @keyframes orbit { from { transform: rotate(0deg) translateX(100px) rotate(0deg); } to { transform: rotate(360deg) translateX(100px) rotate(-360deg); } }
        .integration-icon { background: rgba(255,255,255,0.05); backdrop-filter: blur(5px); border: 1px solid rgba(255,255,255,0.1); }
        
        .checkmark-draw { stroke-dasharray: 50; stroke-dashoffset: 50; animation: checkmark-draw 0.5s ease-out 0.5s forwards; }
        @keyframes checkmark-draw { to { stroke-dashoffset: 0; } }
    `}</style>
);

const WelcomeScene: FC = () => (
    <div className="scene w-full h-full flex flex-col items-center justify-center text-center p-8">
        <h1 className="text-6xl font-black text-white tracking-tighter item-slide-up">QuickForm<span className="text-indigo-400">.</span>io</h1>
        <p className="text-xl text-gray-400 mt-4 item-slide-up" style={{animationDelay: '0.2s'}}>The future of forms is here.</p>
    </div>
);

const SecureLoginScene: FC = () => (
    <div className="scene w-full h-full flex flex-col items-center justify-center p-8">
        <h3 className="text-2xl font-bold text-white mb-6 item-slide-up">Secure & Simple Login</h3>
        <div className="bg-gray-800/50 p-6 rounded-xl w-full max-w-sm relative shadow-lg item-pop-in" style={{animationDelay: '0.2s'}}>
            <div className="flex items-center gap-4">
                <svg className="w-12 h-12 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <div className="w-full">
                    <p className="font-bold text-white">Email</p>
                    <div className="mt-1 h-6 bg-gray-700 rounded"></div>
                </div>
            </div>
            <div className="flex items-center gap-4 mt-4">
                <svg className="w-12 h-12 text-transparent" fill="none" viewBox="0 0 24 24" stroke="currentColor"></svg>
                <div className="w-full">
                    <p className="font-bold text-white">Password</p>
                    <div className="mt-1 h-6 bg-gray-700 rounded"></div>
                </div>
            </div>
        </div>
    </div>
);

const EasySignupScene: FC = () => (
    <div className="scene w-full h-full flex flex-col items-center justify-center p-8">
        <h3 className="text-2xl font-bold text-white mb-6 item-slide-up">Get Started in Seconds</h3>
        <div className="bg-white p-8 rounded-xl w-full max-w-sm relative shadow-lg item-pop-in text-center" style={{animationDelay: '0.2s'}}>
            <svg className="w-20 h-20 text-green-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1" opacity="0.2"/>
                <path className="checkmark-draw" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4" />
            </svg>
            <p className="text-xl font-bold text-gray-800 mt-4">Account Created!</p>
            <p className="text-gray-500">Welcome to QuickForm.io</p>
        </div>
    </div>
);

const CollaborationScene: FC = () => (
    <div className="scene w-full h-full flex flex-col items-center justify-center p-8">
        <h3 className="text-2xl font-bold text-white mb-6 item-slide-up">Work Together, in Real-time.</h3>
        <div className="bg-gray-800/50 p-6 rounded-xl w-full max-w-sm relative shadow-lg item-pop-in" style={{animationDelay: '0.2s'}}>
            <p className="text-lg font-bold text-white">Event Registration</p>
            <div className="mt-4 h-8 bg-gray-700 rounded"></div>
            <div className="mt-2 h-8 bg-indigo-500/60 rounded ring-2 ring-indigo-400"></div>
            <img src="https://i.pravatar.cc/150?u=a" alt="User A" className="w-12 h-12 rounded-full absolute top-[-20px] left-8 avatar" style={{animationDelay: '0.4s'}}/>
            <img src="https://i.pravatar.cc/150?u=b" alt="User B" className="w-12 h-12 rounded-full absolute bottom-8 right-[-20px] avatar" style={{animationDelay: '0.6s'}}/>
            <img src="https://i.pravatar.cc/150?u=c" alt="User C" className="w-12 h-12 rounded-full absolute top-12 right-12 avatar" style={{animationDelay: '0.8s'}}/>
        </div>
    </div>
);

interface Scene { id: number; duration: number; content: ReactNode; }
const scenes: Scene[] = [
    { id: 1, duration: 4000, content: <WelcomeScene /> },
    { id: 2, duration: 4000, content: <SecureLoginScene /> },
    { id: 3, duration: 4000, content: <EasySignupScene /> },
    { id: 4, duration: 5000, content: <CollaborationScene /> },
];

export const AnimatedShowcase: FC = () => {
    const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
    const sceneTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (sceneTimeoutRef.current) clearTimeout(sceneTimeoutRef.current);
        sceneTimeoutRef.current = setTimeout(() => {
            setCurrentSceneIndex(prevIndex => (prevIndex + 1) % scenes.length);
        }, scenes[currentSceneIndex].duration);
        return () => { if (sceneTimeoutRef.current) clearTimeout(sceneTimeoutRef.current); };
    }, [currentSceneIndex]);

    return (
        <div className="w-full h-full aspect-square max-w-md">
            <ShowcaseStyles />
            <div className="w-full h-full relative overflow-hidden">
                {scenes[currentSceneIndex].content}
            </div>
        </div>
    );
};