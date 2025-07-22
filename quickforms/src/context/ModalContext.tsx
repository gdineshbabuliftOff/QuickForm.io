"use client";

import React, { createContext, useContext, useState, FC, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import RedirectModal from '@/components/modals/PricingModal';

interface ModalContent {
  title: string;
  message: string;
  onCloseRedirectPath?: string;
  subscriptionTier?: 'free' | 'pro' | 'premium';
}

interface ModalContextType {
  showModal: (content: ModalContent) => void;
  hideModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalContent, setModalContent] = useState<ModalContent>({ title: '', message: '' });
  const router = useRouter();

  const showModal = useCallback((content: ModalContent) => {
    setModalContent(content);
    setIsOpen(true);
  }, []);

  const hideModal = useCallback(() => {
    setIsOpen(false);
    if (modalContent.onCloseRedirectPath) {
      router.push(modalContent.onCloseRedirectPath);
    }
  }, [modalContent, router]);

  return (
    <ModalContext.Provider value={{ showModal, hideModal }}>
      {children}
      <RedirectModal
        isOpen={isOpen}
        onClose={hideModal}
        title={modalContent.title}
        message={modalContent.message}
        onCloseRedirectPath={modalContent.onCloseRedirectPath}
        subscriptionTier={modalContent.subscriptionTier}
      />
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};
