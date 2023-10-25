// use client means it is not a react server component but it is still rendering on both client and server side .
"use client";

// This component renders all modals

import { CreateServerModal } from "@/components/Modals/create-server-modal";
import { useEffect, useState } from "react";
import { InviteModal } from "@/components/Modals/invite-modal";

export const ModalProvider = () => {
  // By doing this here we are preventing the modals renders on server side so, avoid hydration Error

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }
  return (
    <>
      <CreateServerModal />
      <InviteModal />
    </>
  );
};
