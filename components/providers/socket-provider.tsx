"use client";

// useContext = use for accessing the context value
// createContext = use for creating the context
import { createContext, useContext, useEffect, useState } from "react";
import { io as ClientIO } from "socket.io-client";

// It describes the type of the context value
type SocketContextType = {
  socket: any | null;
  isConnected: boolean;
};

//  This line creates a new context named SocketContext using the createContext function. It sets the default context value
const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

// This is a custom hook which export this above context This hook can be used to access the context value provided by SocketContext
export const useSocket = () => {
  return useContext(SocketContext);
};

// It is 
export const SocketProvider = ({
    children
}: {
    children:React.ReactNode
}) =>{
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    
    useEffect(() =>{
      // ! = because we are telling that this website url is localhost
      const socketInstance = new (ClientIO as any)(
        process.env.NEXT_PUBLIC_SITE_URL!,
        {
          path: "/api/socket/io",
          addTrailingSlash: false,
        }
      );

      // When user socket is connected means online then setIsconnected to true
      socketInstance.on("connect", () => {
        setIsConnected(true);
      });

      // When user socket is disconnected means offline then setIsconnected to false
      socketInstance.on("disconnect", () => {
        setIsConnected(false);
      });

    //   Now store that socket Instance in state
      setSocket(socketInstance);

    // During unMount of component disconnect it 
      return () => {
        socketInstance.disconnect();
      };
    }, []);

    // Here we are letting the socket, isConnected state access to all children of provider through Context
    return <SocketContext.Provider value={{socket, isConnected}}> {children} </SocketContext.Provider>;
}