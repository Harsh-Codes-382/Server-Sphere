"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

import { useModal } from "@/hooks/use-modal-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, Copy, RefreshCw } from "lucide-react";
import { UseOrigin } from "@/hooks/use-origin";
import axios from "axios";

export const InviteModal = () => {
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Destructuring from modal Store
  const { onOpen, isOpen, onClose, type, data } = useModal();

  //  This hook will be taking the Current window URL and giving us
  const origin = UseOrigin();

  //This holds whether this modal is open or not. isOpen become true when user clicked on button where we used the onOpen() from modalstore and we are also using the ype so we know if type is "invite" then open this modal
  const IsModalOpen = isOpen && type === "invite";

  //   We are extracting the server info from "data" and data is from Modal Store
  const { server } = data;

  // Now we have to create "page.tsx" for this URL so when paste this link on browser he get that page for invite
  const InvitedURL = `${origin}/invite/${server?.inviteCode}`;

  const onCopy = () => {
    navigator.clipboard.writeText(InvitedURL);
    setCopied(true);

    // After Copied after 1sec set State false again
    setTimeout(() => {
      setCopied(false);
    }, 1000);
  };

  const GenerateLink = async () => {
    try {
      setIsLoading(true);

      const response = await axios.patch(
        `/api/servers/${server?.id}/invite-code`
      );

      // Pass this response.data to ModalStore so it can pass it here in "server" because "server" info like "server.invite-code" is what we are showing in input
      onOpen("invite", { server: response?.data });
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <>
      {/* This is all written as same as in "Shadcn" components like Dialog, Form */}

      <Dialog open={IsModalOpen} onOpenChange={onClose}>
        <DialogContent className="bg-white text-black p-0 overflow-hidden">
          <DialogHeader className="pt-8 px-6">
            <DialogTitle className="text-2xl text-center font-bold">
              Invite Your Friends
            </DialogTitle>
          </DialogHeader>
          <div className="p-6">
            <Label className="uppercase text-xs font-bold text-zinc-500 dark:text:secondary/70">
              Server Invite Link
            </Label>
            <div className="flex items-center mt-2 gap-x-2 ">
              <Input
                className="bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0"
                // Here in input value will be the current window URL
                disabled={isLoading}
                value={InvitedURL}
              />
              <Button
                disabled={isLoading}
                onClick={onCopy}
                className="hover:bg-indigo-400 hover:text-white"
                size="icon">
                {/* Based on Copied state change icons on copy */}
                {copied ? (
                  <Check className="w-4 h-4 " />
                ) : (
                  <Copy className="w-4 h-4 " />
                )}
              </Button>
            </div>
            <Button
              onClick={GenerateLink}
              disabled={isLoading}
              className="text-xs text-zinc-500 mt-4 hover:text-indigo-600"
              variant="link"
              size="sm">
              Generate a new Invite Link
              <RefreshCw className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
