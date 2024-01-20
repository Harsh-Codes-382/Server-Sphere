import { CurrentprofilePages } from "@/lib/current-profile-pages";
import { db } from "@/lib/db";
import { NextApiResponseServerIo } from "@/types";
import { NextApiRequest } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIo
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not allowed" });
  }

  try {
    const profile = await CurrentprofilePages(req);
    const { content, fileUrl } = req.body;
    const { conversationId } = req.query;

    if (!profile) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!conversationId) {
      return res.status(401).json({ error: "conversationId Missing" });
    }

    if (!content) {
      return res.status(401).json({ error: "content Missing" });
    }


    const conversation = await db.conversation.findFirst({
      where: {
        id: conversationId as string,
        // SO we should be either of the member of conversation
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
        memberTwo:{
            include:{
                profile: true,
            },
        },
      },
    });

    if(!conversation){
        return res.status(404).json({message: "Coversation is not found"});
    }



// member is who we are
    const member =
      conversation.memberOne.profileId === profile.id
        ? conversation.memberOne
        : conversation.memberTwo;


    if (!member) {
      return res.status(404).json({ error: "member Not found" });
    }

    // Now store the message we typed and send here
    const directmessage = await db.directMessage.create({
      data: {
        content,
        fileUrl,
        conversationId: conversationId as string,
        memberId: member.id,
      },
      include: {
        member: {
          include: {
            profile: true,
          },
        },
      },
    });

    // We have unique key for socket here
    const conversationKey = `chat:${conversationId}:messages`;

    // We emit the socket event and using conversationId so, both user who connects through this conversationId they will get this
    res?.socket?.server?.io?.emit(conversationKey, directmessage);

    return res.status(200).json({ directmessage });

  } catch (error) {
    console.log("Direct Messages_POST", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
