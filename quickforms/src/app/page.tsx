"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Share2, BarChart2, MousePointerClick } from 'lucide-react';
import QuickFormVideo from '@/components/QuickForm';

const createIcon = (path) => ({
  displayName,
  defaultProps = {
    color: 'currentColor',
    size: 24,
    strokeWidth: 2,
    absoluteStrokeWidth: false,
  },
}) => {
  const Component = React.forwardRef(
    ({ color, size, strokeWidth, absoluteStrokeWidth, className, children, ...rest }, ref) => {
      const strokeVal = absoluteStrokeWidth ? (Number(strokeWidth) * 24) / Number(size) : strokeWidth;
      const svgProps = {
        ref,
        width: size,
        height: size,
        stroke: color,
        strokeWidth: strokeVal,
        className: ['lucide', `lucide-${displayName.toLowerCase()}`, className].join(' '),
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 24 24',
        fill: 'none',
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        ...rest,
      };
      delete svgProps.absoluteStrokeWidth;
      return React.createElement(
        'svg',
        svgProps,
        [...path.map(([tag, attrs]) => React.createElement(tag, { key: attrs.key, ...attrs })), ...(Array.isArray(children) ? children : [children])]
      );
    }
  );
  Component.displayName = `LucideIcon(${displayName})`;
  return Component;
};

const ChevronLeftIcon = createIcon([['path', { d: 'm15 18-6-6 6-6', key: '15332k' }]])({ displayName: 'ChevronLeft' });
const ChevronRightIcon = createIcon([['path', { d: 'm9 18 6-6-6-6', key: 'mthhwq' }]])({ displayName: 'ChevronRight' });
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

interface FormCardProps {
  imageUrl: string;
  title: string;
  description: string;
}

const FormCard: React.FC<FormCardProps> = ({ imageUrl, title, description }) => {
  return (
    <div className="group relative flex-shrink-0 w-80 md:w-96 h-96 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out">
      <Image
        src={imageUrl}
        alt={title}
        layout="fill"
        className="object-cover w-full h-full"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
      <div className="absolute inset-0 p-6 flex flex-col justify-end">
        <h3 className="text-white text-2xl font-bold">{title}</h3>
        <p className="text-white/80 mt-2">{description}</p>
      </div>
      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-indigo-700 transition-colors">
          View Template
        </button>
      </div>
    </div>
  );
};

const HorizontalScrollSection = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const formTemplates = [
    { id: 1, title: 'Event Registration', description: 'Capture attendee details seamlessly.', imageUrl: 'https://images.unsplash.com/photo-1561494265-9a84bce65706?q=80&w=800&auto=format&fit=crop' },
    { id: 2, title: 'Customer Feedback', description: 'Gather valuable insights.', imageUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=800&auto=format&fit=crop' },
    { id: 3, title: 'Job Application', description: 'Streamline your hiring process.', imageUrl: 'https://images.unsplash.com/photo-1516842621375-12776c7e2b83?q=80&w=800&auto=format&fit=crop' },
    { id: 4, title: 'Contact Us', description: 'Make it easy to get in touch.', imageUrl: 'https://images.unsplash.com/photo-1586769852836-bc069f19e1b6?q=80&w=800&auto=format&fit=crop' },
    { id: 5, title: 'Online Quiz', description: 'Engage and educate your audience.', imageUrl: 'https://images.unsplash.com/photo-1453733190371-0a9bedd82893?q=80&w=800&auto=format&fit=crop' },
    { id: 6, title: 'Product Order', description: 'Simplify online ordering.', imageUrl: 'https://images.unsplash.com/photo-1585144860161-161945203b5c?q=80&w=800&auto=format&fit=crop' },
  ];

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.offsetWidth * 0.9;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div id="templates" className="relative py-20 md:py-28 bg-gray-50 overflow-hidden">
      <div className="text-center mb-16 px-4">
        <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900">Start with a Proven Template</h2>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">Why start from scratch? Choose from our library of beautifully designed forms that are proven to convert.</p>
      </div>
      <div className="relative">
        <div ref={scrollContainerRef} className="flex gap-6 md:gap-8 px-4 md:px-8 pb-8 overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {formTemplates.map(template => (
            <FormCard key={template.id} {...template} />
          ))}
        </div>
        <div className="absolute top-1/2 -translate-y-1/2 left-0 md:left-8 z-10">
          <button onClick={() => scroll('left')} className="bg-white/80 hover:bg-white rounded-full p-3 shadow-lg transition-all hover:scale-110">
            <ChevronLeftIcon className="h-6 w-6 text-gray-800" />
          </button>
        </div>
        <div className="absolute top-1/2 -translate-y-1/2 right-0 md:right-8 z-10">
          <button onClick={() => scroll('right')} className="bg-white/80 hover:bg-white rounded-full p-3 shadow-lg transition-all hover:scale-110">
            <ChevronRightIcon className="h-6 w-6 text-gray-800" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    { id: 'feature-builder', icon: <MousePointerClickIcon className="h-8 w-8 text-indigo-600" />, title: 'Intuitive Drag & Drop Builder', description: 'Create any form you can imagine. Just drag, drop, and you\'re done. No code required, ever.' },
    { id: 'feature-sharing', icon: <Share2Icon className="h-8 w-8 text-indigo-600" />, title: 'Seamless Sharing & Embedding', description: 'Share your form with a link or embed it directly into your website with a single line of code.' },
    { id: 'feature-analytics', icon: <BarChart2Icon className="h-8 w-8 text-indigo-600" />, title: 'Powerful, Real-time Analytics', description: 'Track submissions, view rates, and conversion rates in real-time to understand your audience better.' },
  ];

  return (
    <div className="bg-white font-sans antialiased text-gray-900">
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-lg shadow-md' : 'bg-transparent'}`}>
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-gray-900">
            QuickForm<span className="text-indigo-600">.io</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/#features" className="text-gray-600 hover:text-indigo-600 transition-colors">Features</Link>
            <Link href="/#templates" className="text-gray-600 hover:text-indigo-600 transition-colors">Templates</Link>
            <Link href="/pricing" className="text-gray-600 hover:text-indigo-600 transition-colors">Pricing</Link>
          </nav>
          <div className="flex items-center space-x-2">
            <Link href="/login" className="hidden md:inline-block text-gray-600 hover:text-indigo-600 px-4 py-2 rounded-md transition-colors">Log In</Link>
            <Link href="/signup" className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg shadow-md hover:bg-indigo-700 transition-all duration-300 font-semibold">
              Sign Up Free
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative pt-36 pb-24 md:pt-48 md:pb-32 bg-gradient-to-b from-indigo-50 via-white to-white">
          <div className="container mx-auto px-6 text-center">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight">
                Build Beautiful Forms, <br />
                <span className="text-indigo-600">Get More Responses.</span>
              </h1>
              <p className="mt-6 text-lg md:text-xl text-gray-600">
                Tired of clunky form builders? QuickForm empowers you to create stunning, responsive forms that people actually enjoy filling out.
              </p>
              <div className="mt-10">
                <Link href="/signup" className="bg-indigo-600 text-white font-bold py-4 px-8 rounded-lg shadow-lg hover:bg-indigo-700 transition-transform transform hover:scale-105 inline-block">
                  Create Your First Form — Free
                </Link>
              </div>
            </div>
            <div className="mt-16 max-w-5xl mx-auto">
              <div className="rounded-2xl shadow-2xl overflow-hidden border-4 border-gray-200 bg-white">
                 <QuickFormVideo/>
              </div>
            </div>
          </div>
        </section>

        <HorizontalScrollSection />

        <section id="features" className="py-20 md:py-28 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900">Everything you need. Nothing you don’t.</h2>
              <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">From creation to analysis, we've got you covered.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {features.map((feature) => (
                <div key={feature.id} className="bg-gray-50/70 p-8 rounded-2xl text-left transition-all duration-300 hover:bg-white hover:shadow-xl hover:-translate-y-2 border border-gray-100">
                  <div className="inline-block bg-indigo-100 p-4 rounded-xl">
                    {feature.icon}
                  </div>
                  <h3 className="mt-6 text-xl font-bold text-gray-900">{feature.title}</h3>
                  <p className="mt-2 text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 md:py-28 bg-indigo-600">
            <div className="container mx-auto px-6">
                <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8 items-center">
                    <div className="md:col-span-1 flex justify-center">
                        <Image
                            src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=300&h=300&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                            alt="Avatar of David Chen"
                            width={160}
                            height={160}
                            className="rounded-full shadow-2xl" 
                        />
                    </div>
                    <div className="md:col-span-2 text-center md:text-left">
                        <p className="text-2xl font-light text-white italic">
                            &quot;QuickForm.io has revolutionized how we gather feedback. We went from a handful of responses to hundreds per week. The best part? It took me less than 10 minutes to set up!&quot;
                        </p>
                        <div className="mt-6">
                            <p className="font-bold text-lg text-white">David Chen</p>
                            <p className="text-indigo-200">Marketing Lead, Innovate Inc.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        
        <section className="py-20 md:py-32 bg-gray-50">
           <div className="container mx-auto px-6 text-center">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900">Ready to Transform Your Data Collection?</h2>
              <p className="mt-4 text-lg text-gray-600">
                Join thousands of businesses building smarter, more beautiful forms. Get started for free—no credit card required.
              </p>
              <div className="mt-10">
                <Link href="/signup" className="bg-indigo-600 text-white font-bold py-4 px-8 rounded-lg shadow-lg hover:bg-indigo-700 transition-transform transform hover:scale-105 inline-block">
                    Sign Up and Build for Free
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-white">
        <div className="container mx-auto px-6 py-16">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
                <div className="col-span-2 md:col-span-1">
                    <h3 className="text-lg font-bold">QuickForm.io</h3>
                    <p className="mt-2 text-gray-400 text-sm">Build forms that feel like a conversation.</p>
                </div>
                <div>
                    <h4 className="font-semibold text-gray-200">Product</h4>
                    <ul className="mt-4 space-y-3">
                        <li><Link href="/#features" className="text-gray-400 hover:text-white transition-colors">Features</Link></li>
                        <li><Link href="/#templates" className="text-gray-400 hover:text-white transition-colors">Templates</Link></li>
                        <li><Link href="/integrations" className="text-gray-400 hover:text-white transition-colors">Integrations</Link></li>
                        <li><Link href="/pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-semibold text-gray-200">Company</h4>
                    <ul className="mt-4 space-y-3">
                        <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
                        <li><Link href="/careers" className="text-gray-400 hover:text-white transition-colors">Careers</Link></li>
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
                 <div>
                    <h4 className="font-semibold text-gray-200">Connect</h4>
                    <ul className="mt-4 space-y-3">
                        <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Twitter</Link></li>
                        <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">LinkedIn</Link></li>
                    </ul>
                </div>
            </div>
            <div className="mt-12 border-t border-gray-800 pt-8 text-center text-gray-500">
                <p>&copy; {new Date().getFullYear()} QuickForm.io. All rights reserved.</p>
            </div>
        </div>
      </footer>
    </div>
  );
}