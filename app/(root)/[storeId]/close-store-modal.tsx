"use client";

import { useEffect } from "react";
import { useStoreModal } from "@/hooks/use-store-modal";

export default function CloseStoreModal() {
  const onClose = useStoreModal((s) => s.onClose);
  const isOpen = useStoreModal((s) => s.isOpen);

  useEffect(() => {
    if (isOpen) onClose();
  }, [isOpen, onClose]);

  return null;
}


