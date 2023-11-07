import { Currentprofile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";


// This function is for updating the server
export async function PATCH(
  req: Request,
  { params }: { params: { serverId: string } }
) {
  try {
    const profile = await Currentprofile();
    const { name, imageUrl } = await req.json();

    if (!profile) {
      return new NextResponse("UnAuthorized", { status: 401 });
    }

    if (!params.serverId) {
      return new NextResponse("Missing ServerId in Updating Server", {
        status: 400,
      });
    }

    const server = await db.server.update({
      where: {
        id: params.serverId,
        profileId: profile.id,
      },
      data: {
        name,
        imageUrl,
      },
    });

    return NextResponse.json(server);
  } catch (error) {
    console.log(error);

    return new NextResponse(" Updating server Internal Error", { status: 500 });
  }
}





// This function is for deleting the server
export async function DELETE(
  req: Request,
  { params }: { params: { serverId: string } }
) {
  try {
    const profile = await Currentprofile();

    if (!profile) {
      return new NextResponse("UnAuthorized", { status: 401 });
    }

    if (!params.serverId) {
      return new NextResponse("Missing ServerId in deleting Server", {
        status: 400,
      });
    }

    const server = await db.server.delete({
      // Delete the server who's id is sent here through params
      where: {
        id: params.serverId,
        profileId: profile.id,
      }
    });

    return NextResponse.json(server);
  } catch (error) {
    console.log(error);

    return new NextResponse("Deleting Server Internal Error", { status: 500 });
  }
}
