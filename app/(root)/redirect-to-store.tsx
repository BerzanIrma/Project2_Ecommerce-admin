"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RedirectToStore({ defaultStoreId }: { defaultStoreId: string }) {
  const router = useRouter();

  useEffect(() => {
    try {
      const last = localStorage.getItem('lastStoreId');
      const target = last || defaultStoreId;
      if (target) router.replace(`/${target}`);
    } catch {
      if (defaultStoreId) router.replace(`/${defaultStoreId}`);
    }
  }, [defaultStoreId, router]);

  return null;
}


