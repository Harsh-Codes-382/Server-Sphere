"use client"

// All this according to the LiveKit DOCS

import { useEffect, useState } from "react"
import "@livekit/components-styles";
import {
  LiveKitRoom,
  VideoConference
} from "@livekit/components-react";
import {Channel} from "@prisma/client";
import { useUser } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

interface MediaRoomProps{
    chatId: string;
    video: boolean;
    audio: boolean;
};

export const MediaRoom = ({chatId, video, audio}: MediaRoomProps) =>{

    const {user} = useUser();
    const [token, setToken] = useState("");

    useEffect(()=>{
        if(!user?.firstName || !user?.lastName){
            return;
        }
        const name = `${user?.firstName} ${user?.lastName}`;
        // IIFE function
        (async() =>{
            try {
                const response = await fetch(`/api/livekit?room=${chatId}&username=${name}`);

                const data = await response.json();
                setToken(data.token);
                
            } catch (error) {
                console.log(error);
            }
        })();
    },[user?.firstName, user?.lastName, chatId]);

    // In case we are still fetching the token
    if (token === "") {
      return (
        <div className="flex flex-col flex-1 justify-center items-center">
            <Loader2 className="h-7 w-7 text-zinc-500 animate-spin my-4"/>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Loading...</p>
        </div>
      )
    }

    return (
      <LiveKitRoom
        video={video}
        audio={audio}
        token={token}
        connect={true}
        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
        // Use the default LiveKit theme for nice styles.
        data-lk-theme="default"
        style={{ height: "100dvh" }}>
        <VideoConference />
      </LiveKitRoom>
    );


}