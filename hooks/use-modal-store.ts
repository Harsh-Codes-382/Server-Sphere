// This is hook modal store from where we will handle all modals.

import { Server } from "@prisma/client";
import { create } from "zustand";

export type ModalType = "createServer" | "invite" | "editServer" | "members" | "createChannel" | "leaveServer";

interface ModalData {
  server?: Server;
}

interface ModalStore {
  type: ModalType | null;
  isOpen: boolean;
  data: ModalData;
  // Tells Which kind of modal we want to open
  onOpen: (type: ModalType, data?: ModalData) => void;
  onClose: () => void;
}

export const useModal = create<ModalStore>((set) => ({
  type: null,
  isOpen: false,
  data: {},
  // onOpen set the isOpen to true and type of modal to type we sent
  onOpen: (type, data = {}) => set({ isOpen: true, type, data }),
  // onOpen set the isOpen to false and type of modal null.
  onClose: () => set({ isOpen: false, type: null }),
}));
