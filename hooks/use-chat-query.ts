import { useSocket } from "@/components/providers/socket-provider";
import { useInfiniteQuery } from "@tanstack/react-query";
import qs from "query-string";

interface ChatQueryProps{
    queryKey: string;
    apiUrl: string;
    paramKey: "channelId" | "conversationId";
    paramValue: string;

};

export const useChatQuery = ({queryKey, apiUrl, paramKey, paramValue} : ChatQueryProps) =>{

    const {isConnected} = useSocket();

        // This is a function for fetching the messages from api and we will pass this function to tanstack "queryfn" property so
        // it can use this funcion to fetch the messges and create pagination like infinite loading
    const fetchMessages = async ({ pageParam = undefined }) => {
    const url = qs.stringifyUrl({
      url: apiUrl,
      query: {
        cursor: pageParam,
        [paramKey]: paramValue,
      }
    }, { skipNull: true });

    const res = await fetch(url);
    return res.json();
  };

    // We are using tanstack help to call the api for messages to make pagination and it also tale care of next page as well   
    const { 
        data, 
        fetchNextPage, 
        hasNextPage, 
        isFetchingNextPage, 
        status 
    } = useInfiniteQuery({
        queryKey: [queryKey],
        queryFn: fetchMessages,
        getNextPageParam: (lastPage) => lastPage?.nextCursor,
            // It is a Polling: So, it will making api call for messages every 1 second if we are not online other wise websocket is there to show us messages in real time it is only for when there is a condition of falling back offline  
        refetchInterval: isConnected ? false : 1000,
    });

    return {
      data,
      fetchNextPage,
      hasNextPage,
      isFetchingNextPage,
      status,
    };

}