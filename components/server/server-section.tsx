"use client"

import { ServerWithMembersWithProfiles } from "@/types";
import { ChannelType, MemberRole } from "@prisma/client";
import { ActionTooltip } from "../action-tooltip";
import { Plus, Settings } from "lucide-react";
import { useModal } from "@/hooks/use-modal-store";

interface ServerSectionProps{
    label: string;
    role?: MemberRole;
    sectionType: "members" | "channels";
    channelType?: ChannelType;
    server?: ServerWithMembersWithProfiles;
}

const ServerSection = ({label, role, sectionType, channelType, server} : ServerSectionProps) => {

    const {onOpen} = useModal();

    const LabelChannelType = channelType === ChannelType.TEXT ? "Text" : channelType === ChannelType.AUDIO ? "Audio" : "Video";

  return (
    <div className="flex items-center justify-between py-2">
      <p className="text-xs uppercase font-semibold text-zinc-500 dark:text-zinc-400">
        {label}
      </p>

      {/* If you are Admin or Moderator means not a guest and sectionType is channels.
       Only then you can see this "create channel Button" and onclick of button you can open a modal for creating the channel  */}
      {role !== MemberRole.GUEST && sectionType === "channels" && (
        <ActionTooltip label={`create ${LabelChannelType} Channel`} side="top">
          <button
            onClick={() => onOpen("createChannel")}
            className="text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition">
            <Plus className="h-4 w-4" />
          </button>
        </ActionTooltip>
      )}

      {/*  */}
      {role === MemberRole.ADMIN && sectionType === "members" && (
        <ActionTooltip label="Invite Folks" side="top">
          <button
            onClick={() => onOpen("members", { server })}
            className="text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition">
            <Settings className="h-4 w-4" />
          </button>
        </ActionTooltip>
      )}
    </div>
  );
}

export default ServerSection
