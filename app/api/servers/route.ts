// This CurrentProfile is a middleWare which checks id user is still logged in.
import { Currentprofile } from "@/lib/current-profile";
import { v4 as uuidv4 } from "uuid"; // Generate Unique Id
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
// In Prisma Schema we created this MemberRole enum to store the role of members like ADMIN, GUEST etc.
import { MemberRole } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const { name, imageUrl } = await req.json();
    const profile = await Currentprofile();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const server = await db.server.create({
      data: {
        name,
        imageUrl,
        profileId: profile?.id,
        inviteCode: uuidv4(),
        // because "channels" is a another model so we are creating it like this
        channels: {
          create: [{ name: "general", profileId: profile.id }],
        },
        // because "memebers" is a another model like "server" so we are creating it like this
        members: {
          create: [
            // So the User who created the server is also an ADMIN of that server
            { profileId: profile.id, role: MemberRole.ADMIN },
          ],
        },
      },
    });

    return NextResponse.json(server);
  } catch (error) {
    console.log("Server's POST", error);
    return new NextResponse("INTERNAL_ERROR", { status: 500 });
  }
}
