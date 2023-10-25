import { redirectToSignIn } from "@clerk/nextjs";

import { Currentprofile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import ServerSideBar from "@/components/server/server-sidebar";

const ServerIdLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { serverId: string };
}) => {
  const profile = await Currentprofile();

  if (!profile) {
    return redirectToSignIn();
  }

  const server = await db.server.findUnique({
    where: {
      // This serverId means the [serverId] folder because this is present in url
      id: params.serverId,
      members: {
        some: {
          // Alone serverId is enough to fetch the server & all channels on it. But we also fecth profileId so we know that user is a member on this server
          profileId: profile.id,
        },
      },
    },
  });

  // if someone who is not the member of server and knows the id can join in So, to prevent that & If server was deleted so also redirect to "\".
  if (!server) {
    return redirect("/");
  }

  return (
    <>
      <div className="h-full">
        <div className="hidden md:flex h-full w-60 z-20 flex-col inset-y-0 fixed">
          <ServerSideBar serverId={params.serverId} />
        </div>
        <main className="h-full md:pl-60">{children}</main>
      </div>
    </>
  );
};

export default ServerIdLayout;
