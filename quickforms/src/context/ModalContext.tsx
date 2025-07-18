// context/ModalContext.tsx
"use client";

import React, { createContext, useContext, useState, FC, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import PricingModal from '@/components/modals/PricingModal';

interface ModalContent {
  title: string;
  message: string;
  onCloseRedirectPath?: string; // Path to redirect to when modal closes
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
    // Handle redirection after modal closes
    if (modalContent.onCloseRedirectPath) {
      router.push(modalContent.onCloseRedirectPath);
    }
  }, [modalContent, router]);

  return (
    <ModalContext.Provider value={{ showModal, hideModal }}>
      {children}
      <PricingModal
        isOpen={isOpen}
        onClose={hideModal}
        title={modalContent.title}
        message={modalContent.message}
        onCloseRedirectPath={modalContent.onCloseRedirectPath}
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
