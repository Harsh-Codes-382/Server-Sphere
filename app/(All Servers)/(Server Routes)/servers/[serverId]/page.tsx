import { Currentprofile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { redirectToSignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";

interface ServerIdPageProps{
  params:{
    serverId: string;
  }
}


// So when you opens the application general channel will be open as a default 
const ServerIdPage = async ({params}: ServerIdPageProps) => {

  const profile = await Currentprofile();
  if(!profile){
    return redirectToSignIn();
  }

  const server = await db.server.findUnique({
    where: {
      id:params.serverId,
      members:{
        some:{
          profileId: profile.id,
        }
      }
    },
    // Finds the "general" channel
    include: {
      channels:{
        where:{
          name: "general"
        },
        orderBy:{
          createdAt:"asc"
        }
      }
    }
  })

  // Because it is in "asc" oredered so first channel on server always be "general"
  const initialChannel = server?.channels[0];

  
  // This case would be rare it means by default channel is not general
  if(initialChannel?.name !== "general"){
    return null;
  }

  // but else always redirect us to general channel if we open up the application
  return redirect(`/servers/${params?.serverId}/channels/${initialChannel?.id}`);
};

export default ServerIdPage;
