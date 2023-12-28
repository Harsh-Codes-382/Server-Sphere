import { currentUser, redirectToSignIn } from "@clerk/nextjs";
import { db } from "@/lib/db";

export const initialProfile = async () => {
  // See if user previouly Logged in or it is first time
  const user = await currentUser();

  if (!user) {
    //If user didn't logged in then redirect to login in
    return redirectToSignIn();
  }

  const profile = await db.profile.findUnique({   
    where: {
      userId: user.id,    
    },
  });
  if (profile) {
    return profile;
  }

  //   If profile Not existed in database then create new one
  const newProfile = await db.profile.create({
    data: {
      userId: user.id,
      name: `${user.firstName} ${user.lastName}`,
      imageUrl: user.imageUrl,
      email: user.emailAddresses[0].emailAddress,
    },
  });

  return newProfile;
};
