"use client";

import { useEffect } from "react";
import { useStoreModal } from "@/hooks/use-store-modal";

export default function OpenStoreModal() {
  const onOpen = useStoreModal((s) => s.onOpen);
  const isOpen = useStoreModal((s) => s.isOpen);

  useEffect(() => {
    if (!isOpen) onOpen();
  }, [isOpen, onOpen]);

  return null;
}


