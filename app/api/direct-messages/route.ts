import { Currentprofile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { DirectMessage } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  // It is a limit of messages for each batch so in one load 10 messages and in scroll down another 10 message so-on
  const MESSAGE_BATCH = 10;

  try {
    const profile = await Currentprofile();
    const { searchParams } = new URL(req.url);

    // cursor will tell from which next batch messages should fetch like pagination like which Batch number is to be fetch 1,2 etc. and each batch have message limit to "MESSAGE_BATCH"
    const cursor = searchParams.get("cursor");
    const conversationId = searchParams.get("conversationId");

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!conversationId) {
      return new NextResponse("conversationId missing", { status: 400 });
    }

    let messages: DirectMessage[] = []; // by defualt array type

    if (cursor) {
      // If we have cursor
      messages = await db.directMessage.findMany({
        // This pagination feature is built in prisma

        take: MESSAGE_BATCH, // How many meesage to fetch
        skip: 1, // So we don't want to fetch the same message again
        cursor: {
          // Tells the Batch number
          id: cursor,
        },
        where: {
          // fetch from where this conversationId matches
          conversationId: conversationId,
        },
        // In return object include member, profile etc.
        include: {
          member: {
            include: {
              profile: true,
            },
          },
        },
        orderBy: {
          // Because we want latest message to be fetch first
          createdAt: "desc",
        },
      });
    }
    // If we don't have cursor
    else {
      messages = await db.directMessage.findMany({
        // No need to consider the cursor then
        take: MESSAGE_BATCH,
        where: {
          conversationId,
        },
        include: {
          member: {
            include: {
              profile: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }

    let nextCursor = null;

    if (messages.length === MESSAGE_BATCH) {
      // If we fetch the first batch then nextCursor wull be the id of last message so in next fetch of messages nextCursor is cursor
      nextCursor = messages[MESSAGE_BATCH - 1].id;
    }

    // But if the length of message less than MESSAGE_BATCH then it means you reached the end of message then nextCursor will be null
    return NextResponse.json({
      items: messages,
      nextCursor,
    });
  } catch (error) {
    console.log("fetching direct messages ", error);
    return new NextResponse("Fetching Message Error", { status: 500 });
  }
}
