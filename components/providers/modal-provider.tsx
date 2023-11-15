// use client means it is not a react server component but it is still rendering on both client and server side .
"use client";

// This component renders all modals

import { useEffect, useState } from "react";
import { CreateServerModal } from "@/components/Modals/create-server-modal";
import { InviteModal } from "@/components/Modals/invite-modal";
import { EditServerModal } from "@/components/Modals/edit-server-modal";
import { MembersModal } from "@/components/Modals/members-modal";
import { CreateChannelModal } from "@/components/Modals/create-channel-modal";
import { LeaveServerModal } from "@/components/Modals/leave-server-modal";
import { DeleteServerModal } from "@/components/Modals/delete-server-modal";
import { DeleteChannelModal } from "@/components/Modals/delete-channel-modal";
import { EditChannelModal } from "@/components/Modals/edit-channel-modal";

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
      <EditServerModal />
      <MembersModal />
      <CreateChannelModal/>
      <LeaveServerModal/>
      <DeleteServerModal/>
      <DeleteChannelModal/>
      <EditChannelModal/>
    </>
  );
};
