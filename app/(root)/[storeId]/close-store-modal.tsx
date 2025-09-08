"use client";

import { useEffect, useRef } from "react";
import { useStoreModal } from "@/hooks/use-store-modal";

export default function CloseStoreModal() {
  const onClose = useStoreModal((s) => s.onClose);
  const isOpen = useStoreModal((s) => s.isOpen);
  const didRun = useRef(false);

  // Close the modal only once on first mount (e.g., right after redirect),
  // so manual opens (e.g., via Create Store) are not immediately closed.
  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;
    if (isOpen) onClose();
  }, []);

  return null;
}


