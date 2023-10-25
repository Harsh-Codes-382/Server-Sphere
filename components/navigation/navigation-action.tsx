"use client";

import { Plus } from "lucide-react";
import { ActionTooltip } from "@/components/action-tooltip";
import { useModal } from "@/hooks/use-modal-store";

const NavigationAction = () => {
  const { onOpen } = useModal();
  return (
    <>
      <ActionTooltip side="right" align="center" label="Add a server">
        <button
          className="group flex items-center"
          // Here we are using onOpen() from modal store and aslo passing the type of modal to open
          onClick={() => onOpen("createServer")}>
          <div className="flex mx-2 h-[48px] w-[48px] rounded-[24px] group-hover:rounded-[16px] transition-all overflow-hidden items-center justify-center bg-background dark:bg-neutral-700  group-hover:bg-emerald-500">
            <Plus
              className="group-hover:text-white translate text-emerald-500"
              size={25}
            />
          </div>
        </button>
      </ActionTooltip>
    </>
  );
};

export default NavigationAction;
