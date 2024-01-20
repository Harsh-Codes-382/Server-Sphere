import ChatHeader from "@/components/chat/chat-header";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatMessages } from "@/components/chat/chat-messages";
import { MediaRoom } from "@/components/media-room";

import { GetorCreateConversation } from "@/lib/conversation";
import { Currentprofile } from "@/lib/current-profile";
import { db } from "@/lib/db";

import { redirectToSignIn } from "@clerk/nextjs";

import { redirect } from "next/navigation";

interface MemberIdPageProps {
  params:{
    memberId: string;
    serverId: string;
  },
  searchParams:{
    video?: boolean;
  }
}
const MemberIdPage = async ({params, searchParams} : MemberIdPageProps) => {
  // 

  // This memberId is id of that member on which we clicked from frontSide and we sent that memberId in params

  const {memberId, serverId} = params;

  const profile = await Currentprofile();

  if(!profile){
    return redirectToSignIn();
  }
  if(!serverId){
    return redirect("/");
  }

    // Here we are finding logged in user means our own memberId in "member" model from DB
  const currentMember = await db.member.findFirst({
    where:{
      serverId,
      profileId:profile.id,
    },
    include:{
      profile:true,
    },
  });
  
  if(!currentMember){
    return redirect("/");
  }

  // Now pass the memberId of user from params and our own member id which we just found
  const conversation = await GetorCreateConversation(currentMember.id, memberId);

  if(!conversation){
    return redirect(`/servers/${serverId}`);
  }

  const {memberOne, memberTwo} = conversation;

  // So, which member is us and other member.
  // so, if memberOne profileId matches with ours so, we are memberOne then memberTwo will be other member or vice-versa
  const otherMember = memberOne.profileId === profile.id ? memberTwo : memberOne;

  return (
    <div className="bg-white dark:bg-[#313338] flex flex-col h-full">
      <ChatHeader
        imageUrl={otherMember.profile.imageUrl}
        name={otherMember.profile.name}
        serverId={serverId}
        type="conversation"
      />

  {/* So, render this MediaRoom component when in params video is true on clicking of video call button so, chatId is conversation.id becuase this is what keep two user connected to each other so this acts as a room Id */}
      {searchParams.video && (
        <MediaRoom video={true} audio={true} chatId={conversation.id}/>
      )}

{/* Only render this chatMessage and chatInput when you haven't clicked on video Call button because on clicking it video sets to true */}
      {!searchParams.video && (
        <>
          <ChatMessages
            type="conversation"
            name={otherMember.profile.name}
            member={currentMember}
            chatId={conversation.id}
            apiUrl="/api/direct-messages"
            paramKey="conversationId"
            paramValue={conversation.id}
            socketUrl="/api/socket/direct-messages"
            socketQuery={{
              conversationId: conversation.id,
            }}
          />

          <ChatInput
            type="conversation"
            name={otherMember.profile.name}
            apiUrl="/api/socket/direct-messages"
            query={{
              conversationId: conversation.id,
            }}
          />
        </>
      )}


    </div>
  );
}

export default MemberIdPage
