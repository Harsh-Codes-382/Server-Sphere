import { CurrentprofilePages } from "@/lib/current-profile-pages";
import { db } from "@/lib/db";
import { NextApiResponseServerIo } from "@/types";
import { NextApiRequest } from "next";

export default async function handler(req:NextApiRequest, res:NextApiResponseServerIo){
    if(req.method !== 'POST'){
        return res.status(405).json({error: "Method Not allowed"});
    }

    try {
        const profile = await CurrentprofilePages(req);
        const {content, fileUrl} = req.body;
        const {serverId, channelId} = req.query;

        if(!profile){
            return res.status(401).json({error: "Unauthorized"})
        }
        if (!serverId) {
            return res.status(401).json({ error: "Serverid Missing" });
        }
        if (!channelId) {
           return res.status(401).json({ error: "ChannelId Missing" });
        }
        if (!content) {
          return res.status(401).json({ error: "content Missing" });
        }

        // Find the info of profile.id on server
        const server = await db.server.findFirst({
            where:{
                id: serverId as string,
                members:{
                    some:{
                        profileId:profile.id
                    }
                }
            },
            include:{
                members: true,
            }
        });

        if(!server){
            return res.status(404).json({error: "Server Not found"})
        }

        // find the channel based on channelId and serverId 
        const channel = await db.channel.findFirst({
            where:{
                id: channelId as string,
                serverId: serverId as string,
            }
        })
        if (!channel) {
          return res.status(404).json({ error: "channel Not found" });
        }

        const member = server.members.find((member)=> member.profileId === profile.id);
        if (!member) {
          return res.status(404).json({ error: "member Not found" });
        }

        // Now store the message we typed and send here
        const message = await db.message.create({
            data:{
                content,
                fileUrl,
                channelId: channelId as string,
                memberId: member.id,
            },
            include:{
                member:{
                    include:{
                        profile:true,
                    }
                }
            }
        });

        // We have unique key for socket here
        const channelKey = `chat:${channelId}:messages`;
        
        // We emit the socket to all the active connections in channel because in member of channel will have same channelId so
        // Socket will connect to all them who have same channelId 
        res?.socket?.server?.io?.emit(channelKey, message);

        return res.status(200).json({message});

    } catch (error) {
        console.log("Messages_POST", error);
        return res.status(500).json({error: "Internal server error"});
    }
}