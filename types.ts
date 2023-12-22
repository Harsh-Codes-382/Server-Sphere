import {Server as NetServer, Socket} from "net";
import { NextApiResponse } from "next";
import {Server as SocketIOServer} from "socket.io";

import { Member, Profile, Server } from "@prisma/client";

export type ServerWithMembersWithProfiles = Server & {
  members: (Member & { profile: Profile })[];
};

// We created the custom type for socket and NextResponse so,  we can use these all types in one word in io.ts basically we are extending the type of NextResponse
export type NextApiResponseServerIo = NextApiResponse & {
  socket: Socket & {
    server: NetServer & {
      io: SocketIOServer;
    }
  }
}
