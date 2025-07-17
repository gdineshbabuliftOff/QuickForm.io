// app/contact/page.tsx
"use client";

import React, { useState, useEffect, useRef, FC } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

declare global {
  interface Window {
    calendar: {
      schedulingButton: {
        load: (options: { url: string; color: string; label: string; target: HTMLElement | null }) => void;
      };
    };
  }
}

interface ToastNotificationProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const ToastNotification: FC<ToastNotificationProps> = ({ message, type, onClose }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);

    const timer = setTimeout(() => {
      setShow(false);
    }, 3500);

    const unmountTimer = setTimeout(() => {
      onClose();
    }, 4000);

    return () => {
      clearTimeout(timer);
      clearTimeout(unmountTimer);
    };
  }, [onClose]);

  // Changed position to top-5, left-1/2, and added -translate-x-1/2 for centering
  const baseClasses = "fixed top-5 left-1/2 -translate-x-1/2 z-50 p-4 rounded-lg shadow-xl text-white flex items-center transition-all duration-300 ease-out transform";
  const typeClasses = {
    success: "bg-green-600/90",
    error: "bg-red-600/90",
  };

  const animationClasses = show
    ? "opacity-100 scale-100"
    : "opacity-0 scale-90";

  const icon = type === 'success' ? (
    <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
  ) : (
    <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
  );

  return (
    <div className={`${baseClasses} ${typeClasses[type]} ${animationClasses}`}>
      {icon}
      <span>{message}</span>
      <button onClick={() => setShow(false)} className="ml-4 text-xl font-bold">&times;</button>
    </div>
  );
};


const ContactPage: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const { user, loading } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');


  const googleCalendarButtonRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  useEffect(() => {
    const handleScroll = (): void => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const googleCalendarScheduleUrl = 'https://calendar.google.com/calendar/appointments/schedules/AcZssZ2XHcgRC9APjKZXimENZBpHeZjJGdp_sTAGFwVOrbN--fSX3qkNHy9MO059Mi0iLA-ltSXqeK7k?gv=true';
  const userSharableLink = 'https://calendar.app.google/pY5k8m5SQxYDw2U46';


  useEffect(() => {
    const loadGoogleCalendarScripts = () => {
      const link = document.createElement('link');
      link.href = 'https://calendar.google.com/calendar/scheduling-button-script.css';
      link.rel = 'stylesheet';
      document.head.appendChild(link);

      const script = document.createElement('script');
      script.src = 'https://calendar.google.com/calendar/scheduling-button-script.js';
      script.async = true;
      script.onload = () => {
        if (window.calendar && window.calendar.schedulingButton && googleCalendarButtonRef.current) {
          window.calendar.schedulingButton.load({
            url: googleCalendarScheduleUrl,
            color: '#4F46E5', // Changed to Indigo-600 for theme consistency
            label: 'Book an appointment',
            target: googleCalendarButtonRef.current,
          });
        }
      };
      document.body.appendChild(script);

      return () => {
        document.head.removeChild(link);
        document.body.removeChild(script);
      };
    };

    if (typeof window !== 'undefined') {
      loadGoogleCalendarScripts();
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormStatus('loading');
    setShowToast(false);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setFormStatus('success');
        setToastMessage(result.message || 'Your message has been sent successfully!');
        setToastType('success');
        setFormData({ name: '', email: '', message: '' });
      } else {
        setFormStatus('error');
        setToastMessage(result.error || 'Failed to send your message. Please try again.');
        setToastType('error');
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setFormStatus('error');
      setToastMessage('An unexpected error occurred. Please try again later.');
      setToastType('error');
    } finally {
      setShowToast(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 font-sans antialiased text-gray-200">
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
            <Link href="/contact" className="text-indigo-400 transition-colors">Contact</Link>
          </nav>
          <div className="flex items-center space-x-2">
            {!loading && (
              user ? (
                <>
                  <button onClick={handleLogout} className="hidden md:inline-block text-gray-300 hover:text-indigo-400 px-4 py-2 rounded-md transition-colors">Log Out</button>
                  <Link href="/dashboard" className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg shadow-md hover:bg-indigo-500 transition-all duration-300 font-semibold">
                    Go to Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login" className="hidden md:inline-block text-gray-300 hover:text-indigo-400 px-4 py-2 rounded-md transition-colors">Log In</Link>
                  <Link href="/signup" className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg shadow-md hover:bg-indigo-500 transition-all duration-300 font-semibold">
                    Sign Up Free
                  </Link>
                </>
              )
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 pt-24 pb-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
            Get in Touch
          </h1>
          <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
            We&apos;d love to hear from you! Whether you have a question, feedback, or just want to chat, feel free to reach out.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          <div className="bg-gray-800/50 p-8 rounded-2xl border border-white/10 shadow-lg flex flex-col items-center text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Schedule a Google Meet</h3>
            <p className="text-gray-400 mb-6">
              Need a personalized walkthrough or have specific questions? Click the button below to book a 30-minute Google Meet with me.
            </p>
            <div ref={googleCalendarButtonRef} className="w-full max-w-xs"></div>

            <p className="text-sm text-gray-500 mt-4">
              (This will open your Google Calendar to book an appointment with gdineshbabu607@google.com)
            </p>
          </div>

          <div className="bg-gray-800/50 p-8 rounded-2xl border border-white/10 shadow-lg">
            <h3 className="text-2xl font-bold text-white mb-4 text-center">Send Us a Message</h3>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Your Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Your Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="john.doe@example.com"
                  required
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1">Your Message</label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Tell us how we can help..."
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-indigo-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={formStatus === 'loading'}
              >
                {formStatus === 'loading' ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </main>

      <footer className="bg-black mt-12">
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
      {showToast && (
        <ToastNotification
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};

export default ContactPage;
