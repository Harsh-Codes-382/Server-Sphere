import React from "react";

// This layout is only for those router page which is inside (auth) so  because those all are {children}

const LayoutAuth = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex items-center justify-center h-full">{children}</div>
  );
};

export default LayoutAuth;
