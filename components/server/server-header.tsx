"use client";
import { ServerWithMembersWithProfiles } from "@/types";
import { MemberRole } from "@prisma/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronDown,
  LogOut,
  PlusCircle,
  Settings,
  Trash,
  UserPlus,
  Users,
} from "lucide-react";
import { useModal } from "@/hooks/use-modal-store";

interface ServerHeaderprops {
  // Because server has many types including it like members, role, id etc. so we need specific type We will Create a seperate file for types
  server: ServerWithMembersWithProfiles;
  role?: MemberRole;
}

export const ServerHeader = ({ server, role }: ServerHeaderprops) => {
  const { onOpen } = useModal();

  const isAdmin = role === MemberRole.ADMIN;

  // Because every ADMIN is Moderator also
  const isModerator = isAdmin || role === MemberRole.MODERATOR;
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="focus: outline-none" asChild>
          <button className="w-full text-md font-semibold px-3 flex items-center h-12 border-neutral-200 dark:border-neutral-800 border-b-2  hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition">
            {server.name}
            <ChevronDown className="h-5 w-5 ml-auto" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="text-xs w-56 font-medium text-black dark:text-neutral-100 space-y-[2px]">
          {/* If you are a Admin or Moderator only then you can invite some People */}
          {isModerator && (
            <DropdownMenuItem
              // Now we specified the which modal we want to open when click on this dropDown Item
              onClick={() => onOpen("invite", { server })}
              className="text-indigo-500 dark:text-indigo-400 px-3 py-2 cursor-pointer">
              Invite Folks
              <UserPlus className=" h-4 w-4 ml-auto" />
            </DropdownMenuItem>
          )}

          {/* If you are a Admin  only  you can change settings for server */}
          {isAdmin && (
            <DropdownMenuItem
              onClick={() => onOpen("editServer", { server })}
              className=" px-3 py-2 cursor-pointer">
              Server Setting
              <Settings className=" h-4 w-4 ml-auto" />
            </DropdownMenuItem>
          )}

          {/* If you are a Admin only you can manage members */}
          {isAdmin && (
            <DropdownMenuItem
              onClick={() => onOpen("members", { server })}
              className=" px-3 py-2 cursor-pointer">
              Manage Members
              <Users className=" h-4 w-4 ml-auto" />
            </DropdownMenuItem>
          )}

          {/* If you are a Admin or Moderator only then you can create channels on server */}
          {isModerator && (
            <DropdownMenuItem   
              onClick={()=> onOpen("createChannel", {server})}
              className="text-indigo-500 dark:text-indigo-400 px-3 py-2 cursor-pointer">
              Create Channels
              <PlusCircle className=" h-4 w-4 ml-auto" />
            </DropdownMenuItem>
          )}

          {isModerator && <DropdownMenuSeparator />}

          {/* If you are a Admin only you can delete server */}
          {isAdmin && (
            <DropdownMenuItem className=" text-rose-500 px-3 py-2 cursor-pointer">
              Delete Server
              <Trash className=" h-4 w-4 ml-auto" />
            </DropdownMenuItem>
          )}

          {/* If you are a not a Admin only then you can leave the server So moderator & guest are free to leave anytime */}
          {!isAdmin && (
            <DropdownMenuItem 
              onClick={()=> onOpen("leaveServer", {server})}
              className=" px-3 py-2 cursor-pointer">
              Leave Server
              <LogOut className=" h-4 w-4 ml-auto" />
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
