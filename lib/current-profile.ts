// This is kind of a middleWare which check if current user is logged in or not

import { auth } from "@clerk/nextjs";
import { db } from "@/lib/db";
export const Currentprofile = async () => {
  const { userId } = auth();

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
