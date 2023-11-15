"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useModal } from "@/hooks/use-modal-store";
import { Button } from "@/components/ui/button";
import { useState } from "react";

import qs from "query-string";

import { useParams, useRouter } from "next/navigation";
import axios from "axios";

export const DeleteChannelModal = () => {

  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);

  // Destructuring from modal Store
  const { isOpen, onClose, type, data } = useModal();

  const IsModalOpen = isOpen && type === "deleteChannel";

  //   We are extracting the server info from "data" and data is from Modal Store
  const { server, channel } = data;

  const onClick = async () => {
    try {
      setIsLoading(true);

    //   Send the serverId as a query in url 
      const url = qs.stringifyUrl({
        url: `/api/channels/${channel?.id}`,
        query: {
            serverId: server?.id
        }
      }) 
      await axios.delete(url);

      // After api call close the modal
      onClose();

      // Referesh the page so we can see updated info.
      router.refresh();
      router.push(`/servers/${server?.id}`);
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
              Delete Channel
            </DialogTitle>
            <DialogDescription className="text-center text-zinc-500">
              Are You really Gonna Delete!! <br/>
              <span className="font-semibold text-indigo-500">
                #{channel?.name}
              </span>{" "}
              will be gone for forever?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="bg-gray-100 px-6 py-4">
            <div className="flex items-center justify-between w-full">
              <Button disabled={isLoading} variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button disabled={isLoading} variant="primary" onClick={onClick}>
                Confirm
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
