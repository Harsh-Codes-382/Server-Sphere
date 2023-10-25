//  This is a common layout for all Servers
import NavigationSidebar from "@/components/navigation/navigation-sidebar";
import React from "react";

const MainLayoutForServers = async ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // This children will be all those servres so every change from here reflect on others
  return (
    <div className="h-full">
      <div className="hidden md:flex h-full w-[72px] z-30 felx-col fixed inset-y-0">
        <NavigationSidebar />
      </div>
      <main className="md:pl-[72px] h-full">{children}</main>
    </div>
  );
};

export default MainLayoutForServers;
