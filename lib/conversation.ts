import { db } from "@/lib/db";


export const GetorCreateConversation = async(memberOneId: string, memberTwoId:string) =>{
    // First we try to find the member conversation using both order of member
    let getConversation = await findConversation(memberOneId, memberTwoId) || await findConversation(memberOneId, memberTwoId);

    // If we couldn't find any conversation b\w those 2 member then we need create the conversation b\w them
    
    if(!getConversation){
        getConversation = await createNewConversation(memberOneId, memberTwoId);
    }

    return getConversation;
}

// This function checks if the users have any conversation before
const findConversation = async(memberOneId: string, memberTwoId:string) =>{
    // We will find that if these two members had any conversation before so,  we search in DB in conversation model by using there sent id's 
    try {

        const isAvailable = await db.conversation.findFirst({
          where: {
            AND: [{ memberOneId }, { memberTwoId }],
          },
          // If we found them then include their profile in return object
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

        return isAvailable;
        
    } catch (error) {
        return null;
    }
}

// This function creates the link when two user wants to do conversation.

const createNewConversation = async(memberOneId: string, memberTwoId:string) =>{
    try {
        const createConversation = await db.conversation.create({
            data:{
                memberOneId,
                memberTwoId,
            },
            // When creating the conversation b\w two user then also save their profiles in this object
            include:{
                memberOne:{
                    include:{
                        profile:true,
                    }
                },
                memberTwo:{
                    include:{
                        profile: true,
                    }
                }
            }
        });
        return createConversation;
    } catch (error) {
        return null;
    }
}