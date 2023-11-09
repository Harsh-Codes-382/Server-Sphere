import { Currentprofile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { ChannelType, MemberRole } from "@prisma/client";
import { redirect } from "next/navigation";
import { ServerHeader } from "./server-header";
import { ScrollArea } from "@/components/ui/scroll-area";
import ServerSearch from "./server-search";
import { Hash, Mic, ShieldAlert, ShieldCheck, Video } from "lucide-react";

interface ServerSideBarProps {
  serverId: string;
}

// For different channel type different icons
const iconMap = {
  [ChannelType.TEXT]: <Hash className="mr-2 h-4 w-4"/>,
  [ChannelType.AUDIO]: <Mic className="mr-2 h-4 w-4"/>,
  [ChannelType.VIDEO]: <Video className="mr-2 h-4 w-4"/>
}

// For different role of member different icons
const roleIconMap = {
  [MemberRole.GUEST]: null,
  [MemberRole.MODERATOR]: <ShieldCheck className="h-4 w-4 mr-2 text-indigo-500"/> ,
  [MemberRole.ADMIN]: <ShieldAlert className="h-4 w-4 mr-2 text-rose-500"/>

}

const ServerSideBar = async ({ serverId }: ServerSideBarProps) => {
  const profile = await Currentprofile();

  if (!profile) {
    return redirect("/");
  }
  const server = await db.server.findUnique({
    where: {
      id: serverId,
    },
    // Fetch all channels from server using serverId and in ascending order of the date they were created
    include: {
      channels: {
        orderBy: {
          createdAt: "asc",
        },
      },
      // Also fetch all members and their profiles from server and in order of their role e.g-> 1st ADMIN, 2nd Moderator, 3rd Guest
      members: {
        include: {
          profile: true,
        },
        orderBy: {
          role: "asc",
        },
      },
    },
  });

  //   Now Seperate all different channels based on channelTtype

  //    It is we specify in prisma schema "ChannelType"

  //   It is for Text channels
  const TextChannels = server?.channels.filter(
    (channel) => channel.type === ChannelType.TEXT
  );

  //   It is for Video Channels
  const VideoChannels = server?.channels.filter(
    (channel) => channel.type === ChannelType.VIDEO
  );
  // It is for Audio cahnnels
  const AudioChannels = server?.channels.filter(
    (channel) => channel.type === ChannelType.AUDIO
  );

  // To filter ourselves from members array Because we don't want to show ourselves in member List
  const members = server?.members.filter(
    (member) => profile.id !== member.profileId
  );

  if (!server) {
    return redirect("/");
  }

  // Now we want to check our Role either we are guest or Admin or  moderator in this server So found our profile.id in this member.profileId
  const role = server?.members.find(
    (member) => member.profileId === profile.id
  )?.role;
  return (
    <>
      <div className="flex flex-col text-primary h-full dark:bg-[#2B2D31] bg-[#F2F3F5]">
        <ServerHeader server={server} role={role} />
        <ScrollArea className="flex-1 px-3">
          <div className="mt-2">
            {/* Sending all the channels & members as a props in serverSearch Component  
            so we can search all channels in serversearch componenet*/}
            <ServerSearch
              data={[
                {
                  label: "Text Channels",
                  type: "channel",
                  data: TextChannels?.map((channel) => ({
                    id: channel.id,
                    name: channel.name,
                    icon: iconMap[channel.type],
                  })),
                },
                {
                  label: "Audio Channels",
                  type: "channel",
                  data: AudioChannels?.map((channel) => ({
                    id: channel.id,
                    name: channel.name,
                    icon: iconMap[channel.type],
                  })),
                },
                {
                  label: "Video Channels",
                  type: "channel",
                  data: VideoChannels?.map((channel) => ({
                    id: channel.id,
                    name: channel.name,
                    icon: iconMap[channel.type],
                  })),
                },
                {
                  label: "Members",
                  type: "member",
                  data: members?.map((member) => ({
                    id: member.id,
                    name: member.profile.name,
                    // Based on role of member icon will be sent in props
                    icon: roleIconMap[member.role],
                  })),
                },
              ]}
            />
          </div>
        </ScrollArea>
      </div>
    </>
  );
};

export default ServerSideBar;
