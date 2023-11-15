import { Currentprofile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { MemberRole } from "@prisma/client";
import { NextResponse } from "next/server";

// To delete the channel
export async function DELETE(req:Request, {params}: {params: {channelId: string}}){
    try {
        const profile = await Currentprofile();
        const {searchParams} = new URL(req.url);

        const serverId = searchParams.get('serverId');

        if(!serverId){
            return new NextResponse("ServerId is Missing in Channel Deletion", {status: 400});
        }

        if(!params.channelId){
            return new NextResponse("ChannelId is Missing in Channel Deletion", {status: 400});
        }
        
        if(!profile){
            return new NextResponse("UnAuthorized", {status: 401});
        }

        const server = await db.server.update({
            where:{
                id:serverId,
                members:{
                    some:{
                        profileId: profile.id,
                        // The user who is deleting channel should either be admin or moderator 
                        role: {
                            in: [MemberRole.ADMIN, MemberRole.MODERATOR],
                        }
                    }
                }
            },
            data:{
                channels:{
                    delete:{
                        id:params.channelId,
                        // Channel name should not be "general"
                        name:{
                            not: "general",
                        }
                    }
                }
            }
        });

        return NextResponse.json(server);

    } catch (error) {
        console.log("Error: ", error);
        return new NextResponse("Channel Deletion Route", {status: 500});
    }

}



// To Edit the channel


export async function PATCH(
  req: Request,
  { params }: { params: { channelId: string } }
) {
  try {
    const profile = await Currentprofile();
    const {name, type} = await req.json();
    const { searchParams } = new URL(req.url);

    const serverId = searchParams.get("serverId");

    if (!serverId) {
      return new NextResponse("ServerId is Missing in Channel Deletion", {
        status: 400,
      });
    }

    if (!params.channelId) {
      return new NextResponse("ChannelId is Missing in Channel Deletion", {
        status: 400,
      });
    }

    if (!profile) {
      return new NextResponse("UnAuthorized", { status: 401 });
    }

    if(name === "general"){
        return new NextResponse("This Name is Not Allowed.", {status: 400});
    }

    const server = await db.server.update({
      where: {
        id: serverId,
        members: {
          some: {
            profileId: profile.id,
            // The user who is deleting channel should either be admin or moderator
            role: {
              in: [MemberRole.ADMIN, MemberRole.MODERATOR],
            },
          },
        },
      },
      data: {
        channels:{
            update:{
                where:{
                    id:params.channelId,
                    NOT:{
                        name:"general",
                    },
                },
                data:{
                    name: name,
                    type: type,
                }
            }
        }
      },
    });

    return NextResponse.json(server);
  } catch (error) {
    console.log("Error: ", error);
    return new NextResponse("Channel Deletion Route", { status: 500 });
  }
}