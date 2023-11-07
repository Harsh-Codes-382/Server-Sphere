import { Currentprofile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { MemberRole } from "@prisma/client";
import { NextResponse } from "next/server";

export async function POST( req: Request){
    try {

        const profile = await Currentprofile();

        const {searchParams} = new URL(req.url);

        const serverId = searchParams.get('serverId');
        
        const {name, type} = await req.json();

        // If someHow user get byPassed from FrontEnd validation and manage to send the name 'general'
        if(name === 'general'){
            return new NextResponse("General Name not accessible", {status: 400});
        }

        if(!serverId){
            return new NextResponse("SerevrId is missing", {status: 400});
        }

        if(!profile){
            return new NextResponse('Unauthorized', {status: 401});
        }

        
        const server = await db.server.update({
            where:{
                id:serverId,
                members:{
                    some:{
                        // Only the person with the role of ADMIN or MODERATOR can make channels
                        profileId: profile.id,
                        role: {
                            in:[MemberRole.ADMIN, MemberRole.MODERATOR],
                        }
                    }
                }
            },
            data:{
                channels:{
                    create:{
                        // Created the channel with profieId who is loggin now because he created this channel
                        profileId: profile.id,
                        name,
                        type,
                    }
                }
            }
        });

        return NextResponse.json(server);
        
    } catch (error) {
        console.log(error);
        return new NextResponse("Internal Error in Creating Channels", {status: 500});
    }
}