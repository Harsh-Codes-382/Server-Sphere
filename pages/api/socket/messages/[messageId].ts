import { CurrentprofilePages } from "@/lib/current-profile-pages";
import { db } from "@/lib/db";
import { NextApiResponseServerIo } from "@/types";
import { MemberRole } from "@prisma/client";
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
      let message = await db.message.findFirst({
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

      const isMessageOwner = message.member.profileId === profile.id;
      const isAdmin = member.role === MemberRole.ADMIN;
      const isModerator = member.role === MemberRole.MODERATOR;
      const Only_We_can_Modify_Message = isMessageOwner || isAdmin || isModerator;

      if(!Only_We_can_Modify_Message){
        return res.status(401).json({error: "You are not authorized to modify the message "})
      }

    //   If the request of deleting of message
      if(req.method === "DELETE"){

        message = await db.message.update({
            where:{
                id: messageId as string,
            },
            data:{
                fileUrl: null,
                content:"This message has been deleted",
                deleted: true,
            },
            include:{
                member:{
                    include:{
                        profile: true,
                    }
                }
            }
        });
      }

    //   If the request is of updating the message so, here we are only updating the content
      if (req.method === "PATCH") {
        if (!isMessageOwner){
            return res.status(401).json({error: "Only Message Owner can update the message"})
        }
          message = await db.message.update({
            where: {
              id: messageId as string,
            },
            data: {
              content,
            },
            include: {
              member: {
                include: {
                  profile: true,
                },
              },
            },
          });
      }

      const  updateKey = `chat:${channelId}:messages:update`;

      res?.socket?.server?.io.emit(updateKey, message);
      return res.status(200).json(message);


    } catch (error) {
        console.log(error);
        return res.status(500).json({error: "Internal Server Error"});
    }
}