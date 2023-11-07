"use client";
import qs from "query-string";

import { Check, Gavel, Loader2, MoreVertical, Shield, ShieldAlert, ShieldCheck, ShieldQuestion } from "lucide-react";
import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuTrigger,
  DropdownMenuSubTrigger

} from "@/components/ui/dropdown-menu"

import UserAvatar from "@/components/user-avatar";
import { useModal } from "@/hooks/use-modal-store";
import { ServerWithMembersWithProfiles } from "@/types";
import { MemberRole } from "@prisma/client";
import axios from "axios";
import { useRouter } from "next/navigation";

// This is a Object we created for different Role have different symbol
// Now on based on role we can show different symbol
const RoleIconMap = {
  "GUEST": null,
  "MODERATOR": <ShieldCheck className="h-4 w-4 ml-2 text-indigo-500" />,
  "ADMIN": <ShieldAlert className="h-4 w-4 text-rose-500" />,
};

export const MembersModal = () => {

  const router = useRouter();
  // Destructuring from modal Store
  const { onOpen, isOpen, onClose, type, data } = useModal();

  // loadingId represents the user which we clicked
  const [loadingId, setLoadingId] = useState("");

  const IsModalOpen = isOpen && type === "members";

  //   We are extracting the server info from "data" and data is from Modal Store and here we are specifying the type of server
  //  Because we only need the members from server and "data" send us with type "server"
  const { server } = data as { server: ServerWithMembersWithProfiles };


  const onKick = async(memberId: string) =>{
    try{
      setLoadingId(memberId);

      const url = qs.stringifyUrl({
        url: `/api/members/${memberId}`,
        query:{
          serverId: server?.id,
        }
      })

      const response = await axios.delete(url);
      console.log(response.data);
      router.refresh();
      onOpen("members", {server: response.data})

    }
    catch(error){
      console.error(error);
    }
    finally{
      setLoadingId("");
    }
  }


  const onRoleChange = async (memberId: string, newrole: MemberRole) =>{
    try {
      // Here set the selected user memberId
        setLoadingId(memberId);

        // Here we are calling API call and sending the user memberId as a query in url
        const url = qs.stringifyUrl({
          url: `/api/members/${memberId}`,
          query:{
            serverId: server?.id,
          }
        });

        // Send the "newrole" to update the role of member.id as a newrole
        const response = await axios.patch(url, {newrole});

        // router.refresh to refresh the component so it shows the updated component
        router.refresh();
        // After refresh open the modal with updated info
        onOpen('members', {server: response?.data})


      
    } catch (error) {
      console.log(error);
    }
    finally{
      setLoadingId("");
    }
  }

  return (
    <>
      <Dialog open={IsModalOpen} onOpenChange={onClose}>
        <DialogContent className="bg-white text-black overflow-hidden">
          <DialogHeader className="pt-8 px-6">
            <DialogTitle className="text-2xl text-center font-bold">
              Manage Members
            </DialogTitle>
            <DialogDescription className="text-center text-zinc-500">
              {server?.members?.length} Members
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="mt-8 mx-h-[420px] pr-6">
            {server?.members?.map((member) => (
              <div className="flex items-center gap-x-2 mb-6" key={member.id}>
                <UserAvatar src={member.profile.imageUrl} />
                <div className="flex flex-col gap-y-1">
                  <div className="text-xs font-semibold flex items-center gap-x-1">
                    {member.profile.name}
                    {/* Here we are accessing the key of object like GUEST, ADMIN which would be same as a member.role */}
                    {RoleIconMap[member.role]}
                  </div>
                  <p className="text-xs text-zinc-500">
                    {member.profile.email}
                  </p>
                </div>
                {/* Except for the Admin shows dropDown action for everyone  */}
                {server.profileId !== member.profileId &&
                  loadingId !== member.id && (
                    <div className="ml-auto">
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <MoreVertical className="h-4 w-4 text-zinc-500 " />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="left">
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger className="flex items-center">
                              <ShieldQuestion className="h-4 w-4 mr-2" />
                              <span>Role</span>
                            </DropdownMenuSubTrigger>

                            <DropdownMenuPortal>
                              <DropdownMenuSubContent>
                                <DropdownMenuItem
                                  onClick={() =>
                                    onRoleChange(member.id, "GUEST")
                                  }>
                                  <Shield className="h-4 w-4 mr-2" />
                                  GUEST
                                  {member.role === "GUEST" && (
                                    <Check className="h-4 w-4 ml-auto" />
                                  )}
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                  onClick={() =>
                                    // Send the role moderator if you want to make a user a moderator
                                    onRoleChange(member.id, "MODERATOR")
                                  }
                                  >
                                  <ShieldCheck className="h-4 w-4 mr-2" />
                                  MODERATOR
                                  {member.role === "MODERATOR" && (
                                    <Check className="h-4 w-4 ml-auto" />
                                  )}
                                </DropdownMenuItem>
                              </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                          </DropdownMenuSub>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={()=> onKick(member.id)}
                          >
                            <Gavel className="h-4 w-4  mr-2" />
                            Kick Out
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu> 
                    </div>
                  )}
                {/* Shows the loading for the user which we selected and set in loadingId */}
                {loadingId === member.id && (
                  <Loader2 className="animate-spin text-zinc-500 w-4 h-4 ml-auto" />
                )}
              </div>
            ))}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};
