import { Currentprofile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH( req: Request, {params} : {params: {serverId: string}}){
    try {

        const profile = await Currentprofile();
        

        if (!params.serverId){
            return new NextResponse("SerevrId Missing in Params", { status: 401 });
        }

        if (!profile) {
          return new NextResponse("Unauthorized", { status: 400 });
        }  

        const server = await db.server.update({
            where:{
                id: params.serverId,
                // Creater of server can't leave so profile.id should n't be the creator 
                profileId: {
                    not: profile.id
                },
                // find that members who is leaving
                members:{
                    some:{
                        profileId: profile.id,
                    }
                }
            },
            // Now here delete that member form server member
            data: {
                members:{
                    deleteMany:{
                        profileId: profile.id
                    }
                }
            }
        });

    return NextResponse.json(server);

        
    } catch (error) {
        console.log(error);
        return new NextResponse('SERVER LEAVE INTERNAL SERVER ERROR: ', {status: 500});
    }
}