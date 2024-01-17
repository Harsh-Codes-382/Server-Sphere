"use client";

import { Member, Message, Profile } from "@prisma/client";
import { ChatWelcome } from "./chat-welcome";
import { useChatQuery } from "@/hooks/use-chat-query";
import { Loader2, ServerCrash } from "lucide-react";
import { Fragment, useRef, ElementRef } from "react";
import { ChatItem } from "./chat-item";
import {format} from "date-fns";
import { useChatSocket } from "@/hooks/use-chat-socket";
import { useChatScroll } from "@/hooks/use-chat-scroll";

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

  // This "addKey" is should be same as channelKey in a pages/api/socket/messages/index.ts because we are using this id for socket from backend to emit the message info on this "id"
  const addKey = `chat:${chatId}:messages`;

  // This "updateKey" should be same as a updateKey in pages/api/socket/messages/[message.ts] because this id we are using in socket and sending the new Message from backend on this connection
  const updateKey = `chat:${chatId}messages:update`;

  const chatRef = useRef<ElementRef<"div">>(null);
  const BottomRef = useRef<ElementRef<"div">>(null);

  const { data, fetchNextPage, isFetchingNextPage, hasNextPage, status } =
    useChatQuery({ queryKey, apiUrl, paramKey, paramValue });

  // Use this custom hook for showing the messages upadte and new Message in realtime 
  useChatSocket({ queryKey, addKey, updateKey });

  // custom hook for autoscroll and scroll message on scroll up
  useChatScroll({
    chatRef,
    bottomRef: BottomRef,

    // if there is even a data to fetch more data
    shouldLoadMore: isFetchingNextPage && !!hasNextPage,

    loadMore: fetchNextPage,  // this func() fetches more messages

    // count takes the number of items there is to load else default is 0
    count: data?.pages?.[0]?.items.length ?? 0

  });

  if (status === "loading") {
    return (
      <div className="flex flex-col flex-1 justify-center items-center">
        <Loader2 className="h-7 w-7 text-zinc-500 animate-spin my-4" />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Loading messages...
        </p>
      </div>
    );
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
      <div ref={chatRef} className="flex flex-1 flex-col py-4 overflow-y-auto">
        {/* If on scroll up we don't have any old messages to load only then shows this ChatWelcome component   */}
        {!hasNextPage && <div className="flex-1" />}
        {!hasNextPage && (<ChatWelcome type={type} name={name} />)}

        {/* If you have more than message already loaded and you want to load more old message to scroll up and if you have old message to load then show this button for fetch more older mesasge and loader to show the fetching */}

        {hasNextPage && (
          <div className="flex justify-center">
            {isFetchingNextPage ? (
            <Loader2 className="h-6 w-6 text-zinc-500 animate-spin my-4"/>) : (
            <button 
              onClick={()=> fetchNextPage()}
              className="text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 text-xs my-4 dark:hover:text-zinc-300 transition">
              Load Previous message
            </button>) 
            }
          </div>
        )}
        <div className="flex flex-col-reverse mt-auto">
          {data?.pages?.map((group, i) => (
            <Fragment key={i}>
              {group?.items?.map((message: MessageWithMemberWithProfile) => (
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
        <div ref={BottomRef}/>
      </div>
    </>
  );
};