"use client";

import { UserButton as ClerkUserButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export const UserButton = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <ClerkUserButton afterSignOutUrl="/" />;
};
