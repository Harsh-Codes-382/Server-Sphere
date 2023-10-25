import { Currentprofile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { ChannelType } from "@prisma/client";
import { redirect } from "next/navigation";
import { ServerHeader } from "./server-header";

interface ServerSideBarProps {
  serverId: string;
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
  const textChannels = server?.channels.filter(
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
      </div>
    </>
  );
};

export default ServerSideBar;
