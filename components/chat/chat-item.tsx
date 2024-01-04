"use client";
// Necessary imports for form 
import * as z from "zod";
import qs from "query-string";
import axios from "axios";
import {useForm} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import UserAvatar from "@/components/user-avatar";
import { ActionTooltip } from "@/components/action-tooltip";
import Image from "next/image";

import { Member, MemberRole, Profile } from "@prisma/client";

import { Edit, FileIcon, ShieldAlert, ShieldCheck, Trash } from "lucide-react";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

import {
  Form,
  FormControl,
  FormField,
  FormItem
} from "@/components/ui/form"

interface ChatItemProps {
  id: string;
  content: string;
  // Because member is a object which have a both info of member and profile coming from db
  member: Member & {
    profile: Profile;
  };
  timestamp: string;
  fileUrl: string | null;
  deleted: boolean;
  currentMember: Member;
  isUpdated: boolean;
  socketUrl: string;
  socketQuery: Record<string, string>;
}

const roleIconMap = {
    "GUEST":null,
    "MODERATOR": <ShieldCheck className="h-4 w-4 ml-2 text-indigo-500 cursor-pointer"/>,
    "ADMIN": <ShieldAlert className="h-4 w-4 ml-2 text-rose-500 cursor-pointer"/>
}

const formSchema = z.object({
  content: z.string().min(1),
});

export const ChatItem = ({
  id,
  content,
  member,
  timestamp,
  fileUrl,
  deleted,
  currentMember,
  isUpdated,
  socketQuery,
  socketUrl,
}: ChatItemProps) => {

  const [isEditing, setIsEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues:{
      content: content,
    }
  });

  useEffect(()=>{
    form.reset({
      content: content,
    });
  },[content]);


    const fileType = fileUrl?.split(".").pop(); // get the file extension from backside of fileUrl

    const isAdmin = currentMember.role === MemberRole.ADMIN;
    const isModerator = currentMember.role === MemberRole.MODERATOR;
    // User Who sent the message
    const isOwner_Of_Message = currentMember.id === member.id;

    // if message is not already deleted Only these people are allowed to delete the message
    const canDeleteMessage = !deleted && (isAdmin || isModerator || isOwner_Of_Message);

    // if message is not already deleted only owner of message can edit the message but not message is file or image
    const canEditMessage = !deleted && isOwner_Of_Message && !fileUrl;

    const isPdf = fileType === "pdf" && fileUrl;

    const isImage = !isPdf && fileUrl;  // if it is not pdf but we have fileUrl means it is image 



  return (
    <div className="relative group flex items-center hover:bg-black/5 p-4 transition w-full">
      <div className="group flex gap-x-2 items-start w-full">
        {/* UI for image avatar for message who sent this */}
        <div className="cursor-pointer hover:drop-shadow-md transition">
          <UserAvatar src={member.profile.imageUrl} />
        </div>

        <div className="flex flex-col w-full">
          <div className="flex items-center gap-x-2">
            <div className="flex items-center">
              <p className="font-semibold text-sm hover:underline cursor-pointer">
                {member.profile.name}
              </p>
              <ActionTooltip label={member.role}>
                {roleIconMap[member.role]}
              </ActionTooltip>
            </div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {timestamp}
            </span>
          </div>
          {/* UI FOR MESSAGE AS A IMAGES */}
          {isImage && (
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative aspect-square rounded-md mt-2 border flex overflow-hidden items-center bg-secondary h-48 w-48">
              <Image
                src={fileUrl}
                alt={content}
                fill
                className="object-cover"
              />
            </a>
          )}

          {/* UI FOR MESSAGES AS A PDF */}
          {isPdf && (
            <div className="relative flex items-center p-2 mt-2 rounded-md bg-background/10">
              <FileIcon className="h-10 w-10 fill-indigo-200 stroke-indigo-400" />
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-sm text-indigo-500 dark:text-indigo-400 hover:underline">
                PDF File
              </a>
            </div>
          )}

          {!fileUrl && !isEditing && (
            <p
              className={cn(
                "text-sm text-zinc-600 dark:text-zinc-300",
                // So on deleted we will make it look like in italic
                deleted &&
                  "italic text-zinc-500 dark:text-zinc-400 text-xs mt-1"
              )}>
              {content}
              {/* If you ever updated the message the this will also appear on screen */}
              {isUpdated && !deleted && (
                <span className="text-[10px] mx-2 text-zinc-500 dark:text-zinc-400">
                  (edited)
                </span>
              )}
            </p>
          )}
        </div>
      </div>

      {canDeleteMessage && (
        <div className="hidden group-hover:flex items-center gap-x-2 absolute p-1 -top-2 right-5 bg-white dark:bg-zinc-800 border rounded-sm">

          {/* ONLY APPEAR WHEN THE USER IS ELIGIBLE TO EDIT MESSAGE */}
          {canEditMessage && (
            <ActionTooltip label="Edit">
              <Edit 
                onClick={()=> setIsEditing(true)}
                className="cursor-pointer ml-auto w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition" 
              />
            </ActionTooltip>
          )}

          {/* ONLY APPEAR WHEN THE USER IS ELIGIBLE TO DELETE MESSAGE */}
          <ActionTooltip label="Delete">
            <Trash 
              onClick={()=> setDeleting(true)}
              className="cursor-pointer ml-auto w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-600 transition" 
            />
          </ActionTooltip>
        </div>
      )}
    </div>
  );
};
