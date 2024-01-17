import { useEffect, useState } from "react";

type ChatScrollProps = {
  chatRef: React.RefObject<HTMLDivElement>;
  bottomRef: React.RefObject<HTMLDivElement>;
  shouldLoadMore: boolean;
  loadMore: ()=> void;
  count: number;
};

export const useChatScroll = ({chatRef, bottomRef, shouldLoadMore, loadMore, count}: ChatScrollProps)=>{
    const [hasInitialized, setHasInitialized] = useState(false);

    useEffect(()=>{
        // chatRef.current is our "div" from chat-message.tsx which is our main & important div for showing all messages
        const topDiv = chatRef?.current;
        const handleScroll = ()=>{
            // It holds the value that if div is scroll to the top
            const scrollTop = topDiv?.scrollTop;

            // Means if you scroll to the top and there are still more message to load then immediatly call the loadMore() to load 
            if(scrollTop === 0 && shouldLoadMore){
                loadMore();
            }
        }
        topDiv?.addEventListener("scroll", handleScroll);

        return ()=> topDiv?.removeEventListener("scroll", handleScroll);
    },[shouldLoadMore, chatRef, loadMore]);

}