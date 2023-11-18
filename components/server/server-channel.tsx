"use client"

import { cn } from "@/lib/utils";
import { Channel, ChannelType, MemberRole, Server } from "@prisma/client"
import { Edit, Hash, Lock, Mic, Trash, Video } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { ActionTooltip } from "@/components/action-tooltip";

import { ModalType, useModal } from "@/hooks/use-modal-store";

interface ServerChannelProps{
    channel: Channel;
    server: Server;
    role?: MemberRole;
}

// For different channel type different icons
const iconMap = {
  [ChannelType.TEXT]: Hash,
  [ChannelType.AUDIO]: Mic, 
  [ChannelType.VIDEO]:Video 
}

const ServerChannel = ({channel, server, role} : ServerChannelProps) => {

    const params = useParams();
    const router = useRouter();

    const {onOpen} = useModal();

    const Icon = iconMap[channel.type];

    const onclick = ()=>{
      router.push(`/servers/${params?.serverId}/channels/${channel.id}`)
    }

    // so If we click on edit or delete button then only that event should execute not other like which opens the channel page
    const onAction = (e: React.MouseEvent, action:ModalType) =>{
      e.stopPropagation();
      onOpen(action, {channel, server});
    }
  return (
    <>
      <button
        onClick={onclick}
        className={cn(
          "group px-2 py-2 rounded-md flex items-center gap-x-2 w-full hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition mb-1",
          params?.channelId === channel.id && "bg-zinc-700/20 dark:bg-zinc-700"
        )}>
        <Icon className="flex-shrink-0 w-5 h-5 text-zinc-500 dark:text-zinc-400" />
        {/* Dynamic classes so use cn() from shadcn UI */}
        <p
          className={cn(
            "line-clamp-1 font-semibold text-sm text-zinc-500 group-hover:text-zinc-600 dark:text-zinc-400 dark:group-hover:text-zinc-300 transition",
            // Means if this is a selected channel. ofcourse on params the channelId will be selected channel id then add this class
            params?.channelId === channel.id &&
              "text-priamry dark:text-zinc-200 dark:group-hover:text-white"
          )}>
          {channel.name}
        </p>

        {/* Only if channel name is not "general" and logged in user is not "guest" then this Edit option will appear here */}
        {channel.name !== "general" && role !== MemberRole.GUEST && (
          <div className="ml-auto flex items-center gap-x-2">
            <ActionTooltip label="Edit">
              <Edit
                onClick={(e) => onAction(e, "editChannel")}
                className="hidden group-hover:block w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 ddark:hover:text-zinc-300 transition"
              />
            </ActionTooltip>

            <ActionTooltip label="Delete" side="right">
              <Trash
                onClick={(e) => onAction(e, "deleteChannel")}
                className="hidden group-hover:block w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 ddark:hover:text-zinc-300 transition"
              />
            </ActionTooltip>
          </div>
        )}

        {/* If the channel name is "general" only then shows Locked Symbol */}
        {channel.name === "general" && (
          <ActionTooltip label="Not Editable">
            <Lock className="h-4 w-4 ml-auto text-zinc-500 dark:text-zinc-600" />
          </ActionTooltip>
        )}
      </button>
    </>
  );
}

export default ServerChannel
