import { Currentprofile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH( req:Request, {params}: {params: {memberId: string}}){

    try{
        const profile = await Currentprofile();
        
        // It take params Object from URL
        const {searchParams} = new URL(req.url);

        // It take the "role" from body we are sending here
        const {newrole} = await req.json();

        // From params Object we take "serverId" query we sent from members-modal.tsx.
        const serverId = searchParams.get("serverId");

        if(!profile){
            return new NextResponse("Unauthorized", {status: 401});
        }

        if(!params.memberId){
            return new NextResponse("MemberId Not Present", {status: 400});
        }

        if (!serverId) {
          return new NextResponse("serverId Not Present", { status: 400 });
        }

        const server = await db.server.update({
          where: {
            id: serverId,
            profileId: profile.id,
          },
          data: {
            // Do the update in members
            members: {
              update: {
                // Do the update where there our memberId matches with member.id
                where: {
                  id: params.memberId,
                  profileId: {
                    // So we can't change our own Role. Means Admin can't change his own role
                    not: profile.id,
                  },
                },
                // Here Update the role to the newRole we sent in body here from members-modal
                data: {
                  role: newrole,
                },
              },
            },
          },
        //   which which things we need in return 
          include:{
            members: {
                include:{
                    profile: true,
                },
                orderBy:{
                    role: "asc"
                }
            }
          }
        });

        return NextResponse.json(server);


    }
    catch(error){
        console.log("Internal Server Error at MemberId route",error);
        return new NextResponse("Internal Server Error at MemberId route", {status: 500});
    }

}