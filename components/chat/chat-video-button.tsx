"use client"

import qs from "query-string";
import {usePathname, useRouter, useSearchParams} from "next/navigation";

import {Video, VideoOff} from "lucide-react";

import { ActionTooltip } from "@/components/action-tooltip";

export const ChatVideoButton = () =>{
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const isVideo = searchParams?.get("video");

    const onClick = () =>{
        const url = qs.stringifyUrl({
            url: pathname || "",
            query: {
                video: isVideo ? undefined : true,
            }
        }, {skipNull: true});

        router.push(url);

    }
    const Icon = isVideo ? VideoOff : Video;
    const tooltipLabel = isVideo ? "End Video Call" : "Start Video Call";


    return (
        <ActionTooltip side="bottom" label={tooltipLabel}>
            <button onClick={onClick} className="hover-opacity-75 mr-4 transition">
                <Icon className="h-6 w-6 text-zinc-500 dark:tex-zinc-400"/>
            </button>

        </ActionTooltip>
    )
}
