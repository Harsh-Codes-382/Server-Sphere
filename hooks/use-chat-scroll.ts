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


    // This useEffect is for when new message appear so, our 'div' scroll to the bottom to show the new arrived message
    useEffect(()=>{
        const bottomDiv = bottomRef?.current;
        const topDiv = chatRef?.current;
        const shouldAutoScroll = () =>{
            if(!hasInitialized && bottomDiv){
                setHasInitialized(true);
                return true;
            }
            if(!topDiv){
                return false;
            }

            // Lets calculate the distance of user scroll to the bottom if the user is too far above then we don't auto scroll but 
            // otherwise we do autoscroll to bottom

            const distanceFromBottom = topDiv.scrollHeight - topDiv.scrollTop - topDiv.clientHeight;
            return distanceFromBottom <= 100;
        }

        // If user is not far from bottom means under 100 then scroll this bottomRef to user view
        if(shouldAutoScroll()){
            setTimeout(()=>{
                bottomRef?.current?.scrollIntoView({
                    behavior: "smooth",
                })
            },100);
        }
 
    }, [bottomRef, chatRef, count, hasInitialized]); 

}