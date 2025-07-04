"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import QuickFormVideo from '@/components/QuickForm';

// --- Icon Creation Utility ---
const createIcon = (path) => ({
  displayName,
}) => {
  const Component = React.forwardRef(
    ({ color = 'currentColor', size = 24, strokeWidth = 2, className, ...rest }, ref) => (
      React.createElement('svg', {
        ref,
        width: size,
        height: size,
        stroke: color,
        strokeWidth,
        className: ['lucide', `lucide-${displayName.toLowerCase()}`, className].filter(Boolean).join(' '),
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 24 24',
        fill: 'none',
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        ...rest,
      }, path.map(([tag, attrs]) => React.createElement(tag, { key: attrs.key, ...attrs })))
    )
  );
  Component.displayName = `LucideIcon(${displayName})`;
  return Component;
};

// --- Icon Definitions ---
const Share2Icon = createIcon([
  ['circle', { cx: '18', cy: '5', r: '3', key: '1y29k1' }],
  ['circle', { cx: '6', cy: '12', r: '3', key: '12g9s1' }],
  ['circle', { cx: '18', cy: '19', r: '3', key: '12b4m1' }],
  ['line', { x1: '8.59', x2: '15.42', y1: '13.51', y2: '17.49', key: '1m318g' }],
  ['line', { x1: '15.41', x2: '8.59', y1: '6.51', y2: '10.49', key: '1dqu56' }],
])({ displayName: 'Share2' });

const BarChart2Icon = createIcon([
  ['line', { x1: '18', x2: '18', y1: '20', y2: '10', key: '1xfg5x' }],
  ['line', { x1: '12', x2: '12', y1: '20', y2: '4', key: 'b03r4h' }],
  ['line', { x1: '6', x2: '6', y1: '20', y2: '14', key: '1s5mjm' }],
])({ displayName: 'BarChart2' });

const MousePointerClickIcon = createIcon([
    ['path', { d: 'm9 9 5 12 1.8-5.2L21 14Z', key: '14z71w' }],
    ['path', { d: 'M2.05 11.05c-1.3-1.3-1-3.45.6-4.35C4.15 5.8 6.3 6.1 7.6 7.4l3 3', key: '1q5w2g' }],
    ['path', { d: 'm11 11 4 4', key: '1x7e1j' }],
])({ displayName: 'MousePointerClick' });

// --- Dynamic Feature Card Component with Mouse-aware Glow ---
const FeatureCard = ({ icon, title, description }) => {
    const cardRef = useRef(null);

    useEffect(() => {
        const card = cardRef.current;
        if (!card) return;

        const handleMouseMove = (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        };
        
        card.addEventListener('mousemove', handleMouseMove);
        return () => card.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div ref={cardRef} className="feature-card bg-gray-800/50 p-8 rounded-2xl text-left transition-all duration-300 relative overflow-hidden border border-white/10">
            <div className="relative z-10">
                <div className="inline-block bg-gray-700/80 p-4 rounded-xl mb-6">
                    {icon}
                </div>
                <h3 className="text-xl font-bold text-white">{title}</h3>
                <p className="mt-2 text-gray-400 leading-relaxed">{description}</p>
            </div>
        </div>
    );
};

// --- Corrected Horizontal Scroll Section with Automatic Scrolling ---
const HorizontalScrollSection = () => {
    // ADDED: More templates for a richer list.
    const formTemplates = [
        { id: 1, title: 'Event Registration', description: 'Capture attendee details seamlessly.', imageUrl: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=800&auto=format&fit=crop' },
        { id: 2, title: 'Customer Feedback', description: 'Gather valuable insights.', imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=800&auto=format&fit=crop' },
        { id: 3, title: 'Job Application', description: 'Streamline your hiring process.', imageUrl: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=800&auto=format&fit=crop' },
        { id: 4, title: 'Contact Us', description: 'Make it easy to get in touch.', imageUrl: 'https://images.unsplash.com/photo-1596524430615-b46475ddff6e?q=80&w=800&auto=format&fit=crop' },
        { id: 5, title: 'Online Quiz', description: 'Engage and educate your audience.', imageUrl: 'https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?q=80&w=800&auto=format&fit=crop' },
        { id: 6, title: 'Product Order', description: 'Simplify online ordering.', imageUrl: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=800&auto=format&fit=crop' },
        { id: 7, title: 'NPS Survey', description: 'Measure customer loyalty.', imageUrl: 'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?q=80&w=800&auto=format&fit=crop'},
        { id: 8, title: 'Course Enrollment', description: 'Manage your student applications.', imageUrl: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=800&auto=format&fit=crop'},
        { id: 9, title: 'Newsletter Signup', description: 'Grow your mailing list.', imageUrl: 'https://images.unsplash.com/photo-1586769852836-bc069f19e1b6?q=80&w=800&auto=format&fit=crop'},
        { id: 10, title: 'Request a Quote', description: 'Generate leads for your business.', imageUrl: 'https://images.unsplash.com/photo-1554224155-1696413565d3?q=80&w=800&auto=format&fit=crop'},
    ];

    // Create a duplicated list for a seamless loop
    const duplicatedTemplates = [...formTemplates, ...formTemplates];

    return (
        <div id="templates" className="relative py-20 md:py-28 bg-gray-900 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0,_rgba(121,96,238,0.2),_rgba(121,96,238,0)_50%)]"></div>
            <div className="text-center mb-16 px-4 z-10 relative">
                <h2 className="text-3xl md:text-5xl font-extrabold text-white">Start with a Proven Template</h2>
                <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">Why start from scratch? Choose from our library of beautifully designed forms that are proven to convert.</p>
            </div>
            {/* The outer div masks the scrolling content */}
            <div className="scroll-container-mask">
                <div className="scroll-container flex gap-8 px-4">
                    {duplicatedTemplates.map((template, index) => (
                        <div key={`${template.id}-${index}`} className="scroll-item group relative flex-shrink-0 w-80 h-[26rem] rounded-2xl overflow-hidden shadow-lg">
                            <Image
                                src={template.imageUrl}
                                alt={template.title}
                                layout="fill"
                                className="object-cover w-full h-full transition-all duration-500 ease-out group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
                            <div className="absolute inset-0 p-6 flex flex-col justify-end">
                                <h3 className="text-white text-2xl font-bold">{template.title}</h3>
                                <p className="text-white/80 mt-2">{template.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default function App() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const features = [
    { id: 'feature-builder', icon: <MousePointerClickIcon className="h-8 w-8 text-indigo-400" />, title: 'Intuitive Drag & Drop Builder', description: 'Create any form you can imagine. Just drag, drop, and you\'re done. No code required, ever.' },
    { id: 'feature-sharing', icon: <Share2Icon className="h-8 w-8 text-indigo-400" />, title: 'Seamless Sharing & Embedding', description: 'Share your form with a link or embed it directly into your website with a single line of code.' },
    { id: 'feature-analytics', icon: <BarChart2Icon className="h-8 w-8 text-indigo-400" />, title: 'Powerful, Real-time Analytics', description: 'Track submissions, view rates, and conversion rates in real-time to understand your audience better.' },
  ];

  return (
    <>
    {/* MODIFIED: Replaced scroll-snap with a continuous animation */}
    <style jsx global>{`
        @keyframes animated-gradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        .animated-aurora-bg {
            background-size: 200% 200%;
            background-image: linear-gradient(315deg, rgba(88, 80, 236, 0.15) 0%, rgba(30,30,40,0) 30%, rgba(139, 92, 246, 0.1) 70%, rgba(30,30,40,0) 100%);
            animation: animated-gradient 20s ease infinite;
        }

        /* --- New styles for automatic scrolling carousel --- */
        @keyframes scrollLeft {
            0% { transform: translateX(0); }
            /* Card width (w-80 -> 20rem) + gap (gap-8 -> 2rem) = 22rem = 352px */
            /* 10 cards * 352px = 3520px */
            100% { transform: translateX(calc(-22rem * 10)); }
        }
        .scroll-container-mask {
            overflow: hidden;
        }
        .scroll-container {
            /* 20 cards (10 original + 10 duplicates) */
            width: calc(22rem * 20);
            animation: scrollLeft 50s linear infinite;
        }
        .scroll-container:hover {
            animation-play-state: paused;
        }
        /* -------------------------------------------------- */

        .feature-card::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(350px circle at var(--mouse-x) var(--mouse-y), rgba(129, 140, 248, 0.2), transparent 100%);
            border-radius: inherit;
            opacity: 0;
            transition: opacity 0.4s;
        }
        .feature-card:hover::before { opacity: 1; }
    `}</style>
    <div className="bg-gray-900 font-sans antialiased text-gray-200">
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-black/50 backdrop-blur-lg shadow-lg' : 'bg-transparent'}`}>
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-white">
            QuickForm<span className="text-indigo-500">.io</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/#features" className="text-gray-300 hover:text-indigo-400 transition-colors">Features</Link>
            <Link href="/#templates" className="text-gray-300 hover:text-indigo-400 transition-colors">Templates</Link>
            <Link href="/solutions" className="text-gray-300 hover:text-indigo-400 transition-colors">Solutions</Link>
            <Link href="/pricing" className="text-gray-300 hover:text-indigo-400 transition-colors">Pricing</Link>
            <Link href="/resources" className="text-gray-300 hover:text-indigo-400 transition-colors">Resources</Link>
          </nav>
          <div className="flex items-center space-x-2">
            <Link href="/login" className="hidden md:inline-block text-gray-300 hover:text-indigo-400 px-4 py-2 rounded-md transition-colors">Log In</Link>
            <Link href="/signup" className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg shadow-md hover:bg-indigo-500 transition-all duration-300 font-semibold">
              Sign Up Free
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative pt-36 pb-24 md:pt-48 md:pb-32 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
          <div className="container mx-auto px-6 text-center">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight">
                Build Beautiful Forms, <br />
                <span className="text-indigo-500">Get More Responses.</span>
              </h1>
              <p className="mt-6 text-lg md:text-xl text-gray-400">
                Tired of clunky form builders? QuickForm empowers you to create stunning, responsive forms that people actually enjoy filling out.
              </p>
              <div className="mt-10">
                <Link href="/signup" className="bg-indigo-600 text-white font-bold py-4 px-8 rounded-lg shadow-lg hover:bg-indigo-700 transition-transform transform hover:scale-105 inline-block">
                  Create Your First Form — Free
                </Link>
              </div>
            </div>
            <div className="mt-16 max-w-5xl mx-auto">
              <div className="rounded-2xl shadow-2xl overflow-hidden border-4 border-gray-700 bg-white">
                 <QuickFormVideo/>
              </div>
            </div>
          </div>
        </section>
        
        <HorizontalScrollSection />

        <section id="features" className="py-20 md:py-28 bg-gray-900 animated-aurora-bg">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-extrabold text-white">Everything you need. Nothing you don’t.</h2>
              <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">From creation to analysis, we've got you covered.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {features.map((feature) => (
                <FeatureCard key={feature.id} {...feature} />
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 md:py-28 bg-gray-900">
            <div className="container mx-auto px-6">
                <div className="bg-gray-800/60 border border-white/10 rounded-3xl p-8 md:p-12 max-w-4xl mx-auto backdrop-blur-sm">
                    <div className="grid md:grid-cols-3 gap-8 items-center">
                        <div className="md:col-span-1 flex justify-center">
                            <Image
                                src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=300&h=300&auto=format&fit=crop"
                                alt="Avatar of G Dinesh Babu"
                                width={160}
                                height={160}
                                className="rounded-full shadow-2xl ring-4 ring-indigo-500/40" 
                            />
                        </div>
                        <div className="md:col-span-2 text-center md:text-left">
                            <p className="text-2xl font-light text-white italic">
                                &quot;This platform has fundamentally changed our development workflow. The ability to quickly create and deploy robust forms without backend overhead is a game-changer. An absolutely essential tool for modern developers.&quot;
                            </p>
                            <div className="mt-6">
                                <p className="font-bold text-lg text-white">G Dinesh Babu</p>
                                <p className="text-indigo-400">Lead Developer, FusionCraft</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        
        <section className="py-20 md:py-32 bg-gray-900 animated-aurora-bg">
           <div className="container mx-auto px-6 text-center">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-extrabold text-white">Ready to Transform Your Data Collection?</h2>
              <p className="mt-4 text-lg text-gray-400">
                Join thousands of businesses building smarter, more beautiful forms. Get started for free—no credit card required.
              </p>
              <div className="mt-10">
                <Link href="/signup" className="bg-indigo-600 text-white font-bold py-4 px-8 rounded-lg shadow-lg hover:bg-indigo-500 transition-transform transform hover:scale-105 inline-block">
                    Sign Up and Build for Free
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-black">
        <div className="container mx-auto px-6 py-16">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
                <div className="col-span-2 md:col-span-2">
                    <h3 className="text-lg font-bold text-white">QuickForm.io</h3>
                    <p className="mt-2 text-gray-400 text-sm">Build forms that feel like a conversation.</p>
                </div>
                <div>
                    <h4 className="font-semibold text-gray-200">Product</h4>
                    <ul className="mt-4 space-y-3">
                        <li><Link href="/#features" className="text-gray-400 hover:text-white transition-colors">Features</Link></li>
                        <li><Link href="/#templates" className="text-gray-400 hover:text-white transition-colors">Templates</Link></li>
                        <li><Link href="/pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-semibold text-gray-200">Resources</h4>
                    <ul className="mt-4 space-y-3">
                        <li><Link href="/solutions" className="text-gray-400 hover:text-white transition-colors">Solutions</Link></li>
                        <li><Link href="/integrations" className="text-gray-400 hover:text-white transition-colors">Integrations</Link></li>
                         <li><Link href="/docs" className="text-gray-400 hover:text-white transition-colors">Documentation</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-semibold text-gray-200">Company</h4>
                    <ul className="mt-4 space-y-3">
                        <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
                        <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
                    </ul>
                </div>
                 <div>
                    <h4 className="font-semibold text-gray-200">Legal</h4>
                    <ul className="mt-4 space-y-3">
                        <li><Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
                        <li><Link href="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link></li>
                    </ul>
                </div>
            </div>
            <div className="mt-12 border-t border-gray-800 pt-8 text-center text-gray-500">
                <p>&copy; {new Date().getFullYear()} QuickForm.io. All rights reserved.</p>
            </div>
        </div>
      </footer>
    </div>
    </>
  );
}