import { CurrentprofilePages } from "@/lib/current-profile-pages";
import { db } from "@/lib/db";
import { NextApiResponseServerIo } from "@/types";
import { MemberRole } from "@prisma/client";
import { NextApiRequest } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIo
) {
  if (req.method !== "DELETE" && req.method !== "PATCH") {
    return res.status(405).json({ error: "Not Allowed on this method" });
  }
  try {
    const profile = await CurrentprofilePages(req);
    // directMessageId is file name and conversationId is params
    const { directMessageId, conversationId } = req.query;
    const { content } = req.body;

    if (!profile) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!directMessageId) {
      return res.status(400).json({ error: "directMessageId Missing" });
    }
    if (!conversationId) {
      return res.status(400).json({ error: "conversationId is missing" });
    }

    const conversation = await db.conversation.findFirst({
      where: {
        id: conversationId as string,
        OR: [
          {
            memberOne: {
              profileId: profile.id,
            },
          },
          {
            memberTwo: {
              profileId: profile.id,
            },
          },
        ],
      },
      include: {
        memberOne: {
          include: {
            profile: true,
          },
        },
        memberTwo: {
          include: {
            profile: true,
          },
        },
      },
    });


    if (!conversation){
        return res.status(404).json({error: "Conversation Not found"});
    }

    const member =
       conversation?.memberOne.profileId === profile.id
        ? conversation?.memberOne
        : conversation?.memberTwo;

    if (!member) {
      return res.status(404).json({ error: "Member not found" });
    }

    // Find that particular message
    let directMessage = await db.directMessage.findFirst({
      where: {
        id: directMessageId as string,
        conversationId: conversationId as string,
      },
      include: {
        member: {
          include: {
            profile: true,
          },
        },
      },
    });

    //   If that message not found or it's "deleted" is true
    if (!directMessage || directMessage.deleted) {
      return res.status(404).json({ error: "Message Not found" });
    }

    const isMessageOwner = directMessage.member.profileId === profile.id;
    const isAdmin = member.role === MemberRole.ADMIN;
    const isModerator = member.role === MemberRole.MODERATOR;
    const Only_We_can_Modify_Message = isMessageOwner || isAdmin || isModerator;

    if (!Only_We_can_Modify_Message) {
      return res
        .status(401)
        .json({ error: "You are not authorized to modify the message " });
    }

    //   If the request of deleting of message
    if (req.method === "DELETE") {
      directMessage = await db.directMessage.update({
        where: {
          id: directMessageId as string,
        },
        data: {
          fileUrl: null,
          content: "This message has been deleted",
          deleted: true,
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

    //   If the request is of updating the message so, here we are only updating the content
    if (req.method === "PATCH") {
      if (!isMessageOwner) {
        return res
          .status(401)
          .json({ error: "Only Message Owner can update the message" });
      }
      directMessage = await db.directMessage.update({
        where: {
          id: directMessageId as string,
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

    const updateKey = `chat:${conversation.id}:messages:update`;

    res?.socket?.server?.io.emit(updateKey, directMessage);
    return res.status(200).json(directMessage);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
