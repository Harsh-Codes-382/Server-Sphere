import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@clerk/nextjs";

// This all from the UPLOADTHING DOCS:->
const f = createUploadthing();

const handleAuth = () => {
  // This is authentication using clerk
  const { userId } = auth();

  // If user is logged in means it have userId if it don't have userId so return error
  if (!userId) {
    throw new Error("Unauthorized");
  }
  // else return the userId
  return { userId: userId };
};

export const ourFileRouter = {
  // This is for our Server image like DP
  serverImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(() => handleAuth())
    .onUploadComplete(() => {
      console.log("Upload Done");
    }),
  // This is for Our message files
  messageFile: f(["image", "pdf", "image/gif", "audio"])
    .middleware(() => handleAuth())
    .onUploadComplete(() => {
      console.log("Uploading Done...");
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
