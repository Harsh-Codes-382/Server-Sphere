"use client";

import { Member, Message, Profile } from "@prisma/client";
import { ChatWelcome } from "./chat-welcome";
import { useChatQuery } from "@/hooks/use-chat-query";
import { Loader2, ServerCrash } from "lucide-react";
import { Fragment } from "react";
import { ChatItem } from "./chat-item";
import {format} from "date-fns";

const DATE_FORMAT = "d MMM yyyy, HH:mm";

//  Type of fetched Messages  
type MessageWithMemberWithProfile = Message & {
  member: Member & {
    profile: Profile
  }
}

interface ChatMessagesProps {
    name: string;
    member: Member;
    chatId: string;
    apiUrl: string;
    socketUrl: string;
    socketQuery: Record<string, string>;
    paramKey: "channelId" | "conversationId";
    paramValue: string;
    type: "channel" | "conversation";
}

export const ChatMessages = ({
  name,
  member,
  chatId,
  apiUrl,
  socketUrl,
  socketQuery,
  paramKey,
  paramValue,
  type,
}: ChatMessagesProps) => {



  const queryKey = `chat:${chatId}`;
  const {data, fetchNextPage, isFetchingNextPage, hasNextPage, status} = useChatQuery({ queryKey ,apiUrl, paramKey, paramValue});


  if(status === 'loading'){
    return (
      <div className="flex flex-col flex-1 justify-center items-center">
        <Loader2 className="h-7 w-7 text-zinc-500 animate-spin my-4"/>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Loading messages...</p>
      </div>
    )
  }

   if (status === "error") {
     return (
       <div className="flex flex-col flex-1 justify-center items-center">
         <ServerCrash className="h-7 w-7 text-zinc-500 my-4" />
         <p className="text-xs text-zinc-500 dark:text-zinc-400">
           Something went wrong!
         </p>
       </div>
     );
   }

  return (
    <>
      <div className="flex flex-1 flex-col py-4 overflow-y-auto">
        <div className="flex-1" />
        <ChatWelcome type={type} name={name} />
        <div className="flex flex-col-reverse mt-auto">
          {data?.pages?.map((group, i) => (
            <Fragment key={i}>
              {group.items.map((message: MessageWithMemberWithProfile) => (
                <ChatItem
                  key={message.id}
                  id={message.id}
                  member={message.member}
                  currentMember={member}
                  socketQuery={socketQuery}
                  socketUrl={socketUrl}
                  content={message.content}
                  deleted={message.deleted}
                  fileUrl={message.fileUrl}
                  // So, if message createdAt and UpdatedAt are not same then it means message was edited
                  isUpdated={message.createdAt !== message.updatedAt}
                  timestamp={format(new Date(message.createdAt), DATE_FORMAT)}
                />
              ))}
            </Fragment>
          ))}
        </div>
      </div>
    </>
  );
};