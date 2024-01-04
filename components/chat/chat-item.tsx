"use client";

import { Member, MemberRole, Profile } from "@prisma/client";
import UserAvatar from "@/components/user-avatar";
import { ActionTooltip } from "@/components/action-tooltip";
import { FileIcon, ShieldAlert, ShieldCheck } from "lucide-react";
import Image from "next/image";

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

    const fileType = fileUrl?.split(".").pop();

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



  return <div className="relative group flex items-center hover:bg-black/5 p-4 transition w-full">
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
        </div>

    </div>
  </div>;
};
