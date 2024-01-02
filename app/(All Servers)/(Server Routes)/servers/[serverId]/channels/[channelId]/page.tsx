import ChatHeader from "@/components/chat/chat-header";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatMessages } from "@/components/chat/chat-messages";
import { Currentprofile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { redirectToSignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";

interface ChannelIdPageProps{
  params:{
    serverId: string;
    channelId: string;
  }
}

const ChannelIdPage = async ({params}: ChannelIdPageProps) => {
  const profile = await Currentprofile();

  if(!profile){
    return redirectToSignIn();
  }

  // We are finding the channel by using the channelId
  const channel = await db.channel.findUnique({
    where:{
      id: params.channelId,
    },
  });

  // We are finding the user data. Since this "profile.id" can be a member of many other servers but we only need the which is in this server so we also fetch serverId from params
  const member = await db.member.findFirst({
    where:{
      serverId: params.serverId,
      profileId: profile.id,
    },
  });

    // If any of this not present then return to home
  if(!channel || !member){
    return redirect(`/`);
  }

  return (
    <div className="bg-white dark:bg-[#313338] flex flex-col h-full">
      <ChatHeader
          name={channel.name}
          serverId={channel.serverId}
          type="channel"
      />
      <ChatMessages
        name={channel.name}
        member={member}
        chatId={channel.id}
        type="channel"
        // This apiUrl will be url of fetching the messages
        apiUrl="/api/messages"
        socketUrl="/api/socket/messages"
        socketQuery={{
          channelId: channel.id,
          serverId: channel.serverId,
        }}
        paramKey="channelId"
        paramValue={channel.id}
      />
      
      <ChatInput
        name={channel.name}
        type="channel"
        apiUrl="/api/socket/messages"
        query={{
          channelId:channel.id,
          serverId: channel.serverId,
        }}
        />
    </div>
  )
}

export default ChannelIdPage
