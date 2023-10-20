import { redirect } from "next/navigation";
import { initialProfile } from "@/lib/intial-profile";
import { db } from "@/lib/db";
import { InitialModal } from "@/components/Modals/initial-modal";

const SetupPage = async () => {
  const profile = await initialProfile();

  // Now we find the first server in which the user "profile" is one of the member in that server
  // Because server have all profile id who is connected to the server

  const server = await db.server.findFirst({
    where: {
      members: {
        some: {
          profileId: profile.id,
        },
      },
    },
  });

  // If the logged in user is in any server then redirect him to that server
  if (server) {
    return redirect(`/servers/${server.id}`);
  }

  return <InitialModal />;
};

export default SetupPage;
