// components/modals/RedirectModal.tsx
import React, { FC, useEffect, useState } from 'react';
import Link from 'next/link';

interface RedirectModalProps {
  isOpen: boolean;
  onClose: () => void; // This onClose will now trigger the conditional redirect
  title: string;
  message: string;
  // New prop to indicate if closing the modal should redirect to a specific path
  onCloseRedirectPath?: string;
}

interface PricingTierProps {
  name: string;
  price: string;
  frequency: string;
  features: string[];
  isHighlighted?: boolean;
  buttonText: string;
  buttonLink: string;
}

// Minimal XIcon for the modal's close button
const XIcon: FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

const PricingTier: React.FC<PricingTierProps> = ({
  name,
  price,
  frequency,
  features,
  isHighlighted,
  buttonText,
  buttonLink,
}) => {
  const highlightClasses = isHighlighted
    ? 'bg-indigo-700 border-indigo-500 shadow-xl'
    : 'bg-gray-800/50 border-white/10';
  const buttonClasses = isHighlighted
    ? 'bg-white text-indigo-600 hover:bg-gray-200'
    : 'bg-indigo-600 text-white hover:bg-indigo-500';

  return (
    <div className={`flex flex-col p-6 rounded-xl border transition-all duration-300 ${highlightClasses}`}>
      <h3 className="text-xl font-bold text-white mb-1">{name}</h3>
      <p className="text-gray-400 text-md">{frequency}</p>
      <div className="flex items-baseline my-4">
        <span className="text-4xl font-extrabold text-white">{price}</span>
        {price !== 'Free' && <span className="text-md text-gray-400">/month</span>}
      </div>
      <ul className="flex-1 space-y-2 text-gray-300 mb-6 text-sm">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <svg className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            {feature}
          </li>
        ))}
      </ul>
      <Link href={buttonLink} className={`block w-full text-center py-2 rounded-lg font-semibold transition-colors duration-200 ${buttonClasses}`}>
        {buttonText}
      </Link>
    </div>
  );
};


const RedirectModal: FC<RedirectModalProps> = ({ isOpen, onClose, title, message, onCloseRedirectPath }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShow(true);
    } else {
      setShow(false);
    }
  }, [isOpen]);

  if (!isOpen && !show) return null;

  const modalClasses = `
    fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4
    transition-opacity duration-300
    ${show ? 'opacity-100' : 'opacity-0 pointer-events-none'}
  `;

  // Increased max-width to max-w-5xl for a "big" modal
  const contentClasses = `
    bg-gray-800 rounded-2xl p-8 max-w-5xl w-full border border-white/10 text-center
    shadow-2xl relative overflow-hidden
    transform transition-all duration-300 ease-out
    ${show ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}
  `;

  const handleCloseClick = () => {
    setShow(false); // Start fade out animation
    // After animation, call the onClose prop which might handle redirection
    setTimeout(() => {
      onClose();
    }, 300); // Match duration-300 for transition-opacity
  };

  return (
    <div className={modalClasses} onClick={handleCloseClick}>
      <div className={contentClasses} onClick={(e) => e.stopPropagation()}>
        <button
          onClick={handleCloseClick}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-1 rounded-full"
          aria-label="Close modal"
        >
          <XIcon className="w-6 h-6" />
        </button>

        <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
        <p className="text-gray-400 mb-6">{message}</p>

        <div className="grid md:grid-cols-3 gap-6 mt-8"> {/* Adjusted grid for 3 columns */}
          <PricingTier
            name="Free"
            price="Free"
            frequency="Forever"
            features={[
              '5 Forms',
              '100 Submissions/month',
              'Basic Templates',
              'Email Support',
              'Standard Fields',
              'Basic Analytics',
            ]}
            buttonText="Current Plan"
            buttonLink="/dashboard"
            isHighlighted={false}
          />
          <PricingTier
            name="Pro"
            price="$19"
            frequency="per month"
            features={[
              'Unlimited Forms',
              '10,000 Submissions/month',
              'Premium Templates',
              'Advanced Fields',
              'Conditional Logic',
              'Custom CSS',
              'API Integrations',
              'Priority Support',
            ]}
            isHighlighted={true}
            buttonText="Upgrade to Pro"
            buttonLink="/pricing?plan=pro"
          />
          <PricingTier
            name="Business"
            price="$49"
            frequency="per month"
            features={[
              'Everything in Pro',
              'Unlimited Submissions',
              'Team Collaboration',
              'Custom Domain',
              'Advanced Analytics',
              'Dedicated Account Manager',
              'SAML SSO',
            ]}
            buttonText="Contact Sales"
            buttonLink="/contact"
          />
        </div>

        <div className="mt-8 text-center">
            <Link href="/pricing" className="text-indigo-400 hover:text-indigo-300 text-sm font-semibold">
                View all pricing plans
            </Link>
        </div>
      </div>
    </div>
  );
};

export default RedirectModal;
