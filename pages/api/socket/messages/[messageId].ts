import { CurrentprofilePages } from "@/lib/current-profile-pages";
import { db } from "@/lib/db";
import { NextApiResponseServerIo } from "@/types";
import { NextApiRequest } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponseServerIo){

    if(req.method !== "DELETE" && req.method !== "PATCH"){
        return res.status(405).json({error: "Not Allowed on this method"});
    }
    try {
      const profile = await CurrentprofilePages(req);
      const { messageId, serverId, channelId } = req.query;
      const { content } = req.body;

      if (!profile) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      if (!serverId) {
        return res.status(400).json({ error: "ServerId Missing" });
      }
      if (!channelId) {
        return res.status(400).json({ error: "ChannelId is missing" });
      }

      // We are just confirming if server like this is even exist or not
      const server = await db.server.findFirst({
        where: {
          id: serverId as string,
          members: {
            some: {
              profileId: profile.id,
            },
          },
        },
        include: {
          members: true,
        },
      });

      if (!server) {
        return res.status(404).json({ error: "Server not found" });
      }

      // We are just confirming if channel like this is even exist or not
      const channel = await db.channel.findFirst({
        where: {
          id: channelId as string,
          serverId: serverId as string,
        },
      });

      if (!channel) {
        return res.status(404).json({ error: "channel not found" });
      }

      const member = server.members.find((member)=> member.profileId === profile.id);

      if(!member){
        return res.status(404).json({error: "Member not found"})
      }

    // Find that particular message
      const message = await db.message.findFirst({
        where:{
            id: messageId as string,
            channelId: channelId as string,
        },
        include:{
            member:{
                include:{
                    profile: true,
                }
            }
        }
      });

    //   If that message not found or it's "deleted" is true
      if(!message || message.deleted){
        return res.status(404).json({error: "Message Not found"})
      }
    } catch (error) {
        console.log(error);
        return res.status(500).json({error: "Internal Server Error"});
    }
}