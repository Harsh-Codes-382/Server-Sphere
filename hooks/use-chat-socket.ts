import { useSocket } from "@/components/providers/socket-provider";
import { Member, Message, Profile } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

type ChatSocketProps = {
    addKey: string;
    updateKey: string;
    queryKey: string;
}

type MessageWithMemberWithProfile = Message & {
  member: Member & {
    profile: Profile;
  };
};

export const useChatSocket = ({addKey, updateKey, queryKey}: ChatSocketProps) =>{
    const {socket} = useSocket();
    const queryClient = useQueryClient();

    useEffect(()=>{
        if(!socket){
            return;
        }

        // Update the message either delete or edit so, using tanstack we iterate over the existing pages of message because tanstack making pagination of messages
        // and finding that message with id socket sends us and replace it with new and updated message 
        socket.on(updateKey, (message: MessageWithMemberWithProfile)=>{
            queryClient.setQueryData([queryKey], (oldData: any)=>{
                // First check if there is even pages of message exist or not
                if (!oldData || !oldData.pages || oldData.pages.length === 0) {
                    return oldData;
                }

                const newData = oldData.pages.map((page: any) => {
                    // Find that particular message through message id from socket and return the new message which was present in socket because it comes from backEnd part in api/ which handles the update of messsage 
                  return {
                    ...page,
                    items: page.items.map(
                      (item: MessageWithMemberWithProfile) => {
                        if (item.id === message.id) {
                          return message;
                        }
                        return item;
                      }
                    ),
                  };
                });

                return {
                  ...oldData,
                  pages: newData,
                };
            })
        });


        // This Socket connection looks for new messages 
        socket.on(addKey, (message:MessageWithMemberWithProfile) =>{
            queryClient.setQueryData([queryKey], (oldData: any) =>{
                if (!oldData || oldData.pages.length === 0 || !oldData.pages) {
                  return {
                    pages:[{
                        items: [message],
                    }]
                  };
                }

                const newData = [...oldData.pages];

                newData[0] = {  
                    ...newData[0],
                    items: [
                        message,
                        ...newData[0].items,
                    ]
                };
                
                return {
                    ...oldData,
                    pages: newData,
                }

            })
        });
        
        return ()=> {
            socket.off(addKey);
            socket.off(updateKey);
        }

    },[queryClient, addKey, queryKey, socket, updateKey]);
}