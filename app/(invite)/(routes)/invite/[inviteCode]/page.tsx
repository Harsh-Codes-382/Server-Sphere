import { Currentprofile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { redirectToSignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";

interface InviteCodeProps {
  params: {
    inviteCode: string;
  };
}

const InviteCodePage = async ({ params }: InviteCodeProps) => {
  const profile = await Currentprofile();

  if (!profile) {
    return redirectToSignIn();
  }

  // If there is not a inviteCode in  url then return to homePage
  if (!params.inviteCode) {
    return redirect("/");
  }

  // Now check if the user who is trying to get into server using "inviteCode" if already member of this server
  const User_Already_Exist_In_Server = await db.server.findFirst({
    where: {
      // If you got to find the server with this invitecode
      inviteCode: params.inviteCode,
      members: {
        some: {
          // And you also found the user id as a member of that server
          profileId: profile.id,
        },
      },
    },
  });

  if (User_Already_Exist_In_Server) {
    // If user already a member of the server then just redirect to that server
    redirect(`/servers/${User_Already_Exist_In_Server.id}`);
  }

  const server = await db.server.update({
    where: {
      inviteCode: params.inviteCode,
    },
    data: {
      members: {
        create: [
          {
            // By default user role will be GUEST so no need to set that
            profileId: profile.id,
          },
        ],
      },
    },
  });

  if (server) {
    return redirect(`/servers/${server.id}`);
  }
  return null;
};

export default InviteCodePage;
