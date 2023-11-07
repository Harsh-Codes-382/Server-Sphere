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

import {useRouter} from 'next/navigation';
import axios from "axios";


export const LeaveServerModal = () => {

  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  

  // Destructuring from modal Store
  const { isOpen, onClose, type, data } = useModal();

  const IsModalOpen = isOpen && type === "leaveServer";

  //   We are extracting the server info from "data" and data is from Modal Store
  const { server } = data;


  const onClick = async() =>{

    try{
      setIsLoading(true);
      await axios.patch(`/api/servers/${server?.id}/leave`);

      // After api call close the modal
      onClose();

      // Referesh the page so we can see updated info.
      router.refresh();
      router.push('/');
      }
      catch(error){
        console.log(error);
      }
      finally{
        setIsLoading(false);
      }
    
  }


  return (
    <>
      {/* This is all written as same as in "Shadcn" components like Dialog, Form */}

      <Dialog open={IsModalOpen} onOpenChange={onClose}>
        <DialogContent className="bg-white text-black p-0 overflow-hidden">
          <DialogHeader className="pt-8 px-6">
            <DialogTitle className="text-2xl text-center font-bold">
              Leave Server
            </DialogTitle>
            <DialogDescription className="text-center text-zinc-500">
              Are You Gonna Leave us from{" "}
              <span className="font-semibold text-indigo-500">
                {server?.name}
              </span>{" "}
              ?
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
