"use client";

import { useState, useEffect } from "react";
import { StoreModal } from "@/components/modals/store-modal";

export const ModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <StoreModal />
      {children}
    </>
  );
};
