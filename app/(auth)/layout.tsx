import React from "react";

// This layout is only for those router page which is inside (auth) so  because those all are {children}

const LayoutAuth = ({ children }: { children: React.ReactNode }) => {
  return <div className="bg-red-400 h-full">{children}</div>;
};

export default LayoutAuth;
