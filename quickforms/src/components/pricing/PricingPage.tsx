"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { getUserDocument } from '@/lib/db';

// Define the structure of the user document from Firestore
interface UserDocData {
    subscriptionTier: 'free' | 'pro' | 'premium';
}

interface PricingTierProps {
  name: string;
  price: string;
  frequency: string;
  features: string[];
  isHighlighted?: boolean;
  buttonText: string;
  buttonLink: string;
  isDisabled?: boolean;
}

const PricingTier: React.FC<PricingTierProps> = ({
  name,
  price,
  frequency,
  features,
  isHighlighted,
  buttonText,
  buttonLink,
  isDisabled,
}) => {
  const highlightClasses = isHighlighted
    ? 'bg-indigo-700 border-indigo-500 shadow-xl md:scale-105'
    : 'bg-gray-800/50 border-white/10';
  const buttonClasses = isDisabled 
    ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
    : isHighlighted
    ? 'bg-white text-indigo-600 hover:bg-gray-200'
    : 'bg-indigo-600 text-white hover:bg-indigo-500';

  const tierWrapperClasses = isDisabled ? 'opacity-60' : '';

  return (
    <div className={`flex flex-col p-8 rounded-2xl border transition-all duration-300 ${highlightClasses} ${tierWrapperClasses} w-full max-w-sm`}>
      <h3 className="text-2xl font-bold text-white mb-2">{name}</h3>
      <p className="text-gray-400 text-lg">{frequency}</p>
      <div className="flex items-baseline my-6">
        <span className="text-5xl font-extrabold text-white">{price}</span>
        {price !== 'Free' && <span className="text-xl text-gray-400">/month</span>}
      </div>
      <ul className="flex-1 space-y-3 text-gray-300 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            {feature}
          </li>
        ))}
      </ul>
      <Link href={isDisabled ? '#' : buttonLink} className={`block w-full text-center py-3 rounded-lg font-semibold transition-colors duration-200 ${buttonClasses}`}>
        {buttonText}
      </Link>
    </div>
  );
};

const PricingPage: React.FC = () => {
    const { user, loading: authLoading } = useAuth();
    const [userDoc, setUserDoc] = useState<UserDocData | null>(null);
    const [isUserDocLoading, setIsUserDocLoading] = useState(true);

    useEffect(() => {
        const fetchUserDoc = async () => {
            if (user) {
                const doc = await getUserDocument(user.uid);
                if (doc) {
                    setUserDoc(doc as UserDocData);
                }
            }
            setIsUserDocLoading(false);
        };

        if (!authLoading) {
            fetchUserDoc();
        }
    }, [user, authLoading]);

    const subscriptionTier = userDoc?.subscriptionTier;

    const renderTiers = () => {
        if (authLoading || isUserDocLoading) {
            return <div className="text-center text-white">Loading plans...</div>;
        }

        // Default props for a logged-out user
        let freeProps = { buttonText: 'Get Started Free', buttonLink: '/signup', isDisabled: false };
        let proProps = { buttonText: 'Start 14-Day Free Trial', buttonLink: '/signup?plan=pro', isDisabled: false };
        let businessProps = { buttonText: 'Contact Sales', buttonLink: '/contact', isDisabled: false };

        // Update props based on logged-in user's subscription
        if (user && subscriptionTier) {
            switch (subscriptionTier) {
                case 'free':
                    freeProps = { buttonText: 'Your Current Plan', buttonLink: '#', isDisabled: true };
                    proProps = { buttonText: 'Upgrade to Pro', buttonLink: '/payment', isDisabled: false };
                    break;
                case 'pro':
                    freeProps = { ...freeProps, isDisabled: true };
                    proProps = { buttonText: 'Your Current Plan', buttonLink: '#', isDisabled: true };
                    businessProps = { buttonText: 'Upgrade to Business', buttonLink: '/contact', isDisabled: false };
                    break;
                case 'premium':
                    freeProps = { ...freeProps, isDisabled: true };
                    proProps = { ...proProps, isDisabled: true };
                    businessProps = { buttonText: 'Your Current Plan', buttonLink: '#', isDisabled: true };
                    break;
            }
        }
        
        return (
            <div className="flex flex-wrap justify-center items-stretch gap-8">
                <PricingTier
                    key="free"
                    name="Free"
                    price="Free"
                    frequency="Forever"
                    features={['5 Forms', '100 Submissions/month', 'Basic Templates', 'Standard Fields', 'Email Support']}
                    {...freeProps}
                />
                <PricingTier
                    key="pro"
                    name="Pro"
                    price="$19"
                    frequency="per month"
                    features={['Unlimited Forms', '10,000 Submissions/month', 'Premium Templates', 'Advanced Fields (Signature, File Upload)', 'Conditional Logic', 'Custom CSS', 'API Integrations', 'Priority Support']}
                    isHighlighted={true}
                    {...proProps}
                />
                <PricingTier
                    key="business"
                    name="Business"
                    price="$49"
                    frequency="per month"
                    features={['Everything in Pro', 'Unlimited Submissions', 'Team Collaboration', 'Custom Domain', 'Advanced Analytics', 'Dedicated Account Manager', 'SAML SSO']}
                    {...businessProps}
                />
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-900 font-sans antialiased text-gray-200 py-20 px-4">
            <header className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-lg shadow-lg">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <Link href="/" className="text-2xl font-bold text-white">
                        QuickForm<span className="text-indigo-500">.io</span>
                    </Link>
                    <nav className="hidden md:flex items-center space-x-6">
                        <Link href="/#features" className="text-gray-300 hover:text-indigo-400 transition-colors">Features</Link>
                        <Link href="/#templates" className="text-gray-300 hover:text-indigo-400 transition-colors">Templates</Link>
                        <Link href="/solutions" className="text-gray-300 hover:text-indigo-400 transition-colors">Solutions</Link>
                        <Link href="/pricing" className="text-indigo-400 transition-colors">Pricing</Link>
                        <Link href="/resources" className="text-gray-300 hover:text-indigo-400 transition-colors">Resources</Link>
                    </nav>
                    <div className="flex items-center space-x-2">
                        {!authLoading && (
                            user ? (
                                <Link href="/dashboard" className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg shadow-md hover:bg-indigo-500 transition-all duration-300 font-semibold">
                                    Go to Dashboard
                                </Link>
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
                        Simple, Transparent Pricing
                    </h1>
                    <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
                        Choose the plan that fits your needs. No hidden fees, no surprises.
                    </p>
                </div>
                {renderTiers()}
            </main>

            <footer className="bg-gray-900 mt-12">
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
    );
};

export default PricingPage;
