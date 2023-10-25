import { Currentprofile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function PATCH(
  req: Request,
  { params }: { params: { serverId: string } }
) {
  try {
    const profile = await Currentprofile();

    if (!profile) {
      return new NextResponse("UnAuthorized", { status: 401 });
    }

    if (!params.serverId) {
      return new NextResponse("Server Id is Missing", { status: 400 });
    }

    // Here we are generating the new Unique for inviteCode and store it into Database. So, next time we use this route to fetch the InviteCode it will be Different each time.
    const server = await db.server.update({
      where: {
        id: params.serverId,
        profileId: profile.id,
      },
      data: {
        inviteCode: uuidv4(),
      },
    });

    return NextResponse.json(server);
  } catch (error) {
    console.log("SERVERID PATCH ", error);
    return new NextResponse("INTERNAL ERROR", { status: 500 });
  }
}
