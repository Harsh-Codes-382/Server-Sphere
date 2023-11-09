"use client"

import { Search } from "lucide-react";
import { useEffect, useState } from "react";

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { useParams, useRouter } from "next/navigation";


interface ServerSearchProps{
  data:{
    label:string;
    type: "channel" | "member";
    data:{
      icon: React.ReactNode;
      name: string;
      id:string;
    }[] | undefined
  }[]
}
const ServerSearch = ({data} : ServerSearchProps) => {

  const router = useRouter();
  const params = useParams();

  const [isOpen, setIsOpen] = useState(false);

  // So we can open the search input using ctrl+k shortcut
  useEffect(()=>{
    const down = (e: KeyboardEvent) =>{
      if(e.key === 'k' && (e.metaKey || e.ctrlKey)){
        e.preventDefault();
        // we are toggling the open state
        setIsOpen((isOpen) => !isOpen);
      }
    }
    document.addEventListener("keydown", down);

    // On Unmounting of component
    return () => document.removeEventListener("keydown", down);
  },[]);




  // If you click on any of the channel or member from search results
  const onclick = ({id, type} : {id: string, type: "channel" | "member"}) =>{
    setIsOpen(false);
    // If you click on any of the  member from search results
    if (type === "member") {
      return router.push(`/servers/${params?.serverId}/conversations/${id}`);
    }

    if (type === "channel") {
      return router.push(`/servers/${params?.serverId}/channels/${id}`);
    }
  }
  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
         className="group px-2 py-2 rounded-md flex items-center gap-x-2 w-full hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition">
        <Search className="w-4 h-4 text-zinc-500 dark:text-zinc-400"/>
        <p className="font-semibold text-sm text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition">Search</p>

        <kbd className="pointer-events-none h-5 inline-flex select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground ml-auto">
          <span className="text-xs">
            ctrl K
          </span>
        </kbd>
      </button>
      <CommandDialog open={isOpen} onOpenChange={setIsOpen}>
        <CommandInput placeholder="Search Channels and memebers"/>
        <CommandList>
          <CommandEmpty>
            No results are found
          </CommandEmpty>
          {data?.map(({label, type, data}) => {
            if(!data?.length) return null;

            return (
              <CommandGroup key={label} heading={label}>
                {data?.map(({id, name, icon})=>{
                  return (
                    <CommandItem key={id} onSelect={()=> onclick({id, type})}>
                      {icon}
                      <span>{name}</span>
                    </CommandItem>
                  )
                })}

              </CommandGroup>
            )
          })}
        </CommandList>
      </CommandDialog>
    </>
  );
}

export default ServerSearch
