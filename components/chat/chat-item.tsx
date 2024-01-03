"use client";

import { Member, MemberRole, Profile } from "@prisma/client";
import UserAvatar from "@/components/user-avatar";
import { ActionTooltip } from "@/components/action-tooltip";
import { ShieldAlert, ShieldCheck } from "lucide-react";

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
            {content}
        </div>

    </div>
  </div>;
};
