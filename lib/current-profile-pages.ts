// This is kind of a middleWare which check if current user is logged in or not

import { getAuth } from "@clerk/nextjs/server";
import { NextApiRequest } from "next";
import { db } from "@/lib/db";
export const CurrentprofilePages = async (req: NextApiRequest) => {
  const { userId } = getAuth(req);

  if (!userId) {
    return null;
  }

  const profile = db.profile.findUnique({
    where: {
      userId,
    },
  });
  return profile;
};
