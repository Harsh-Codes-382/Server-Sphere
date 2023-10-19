// page is root folder for router
// All the folders inside app are for routing
// Except organisational folder which not use for routing & there name are inside brackets e.g = (auth)
// (auth) shows a dirsctory for all routers which associated in some way to login, register etc. but (auth) not in routing
// We can even create a custom layout inside the (auth) which is common for all login and register

import { ModeToggle } from "@/components/mode-toggle";
import { UserButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <>
      {/* It means it will show the logedIn user data and grom there user can logout & after Logout redirect to "/" */}
      <UserButton afterSignOutUrl="/" />
      <ModeToggle />
    </>
  );
}
