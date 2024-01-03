"use client";

import { Member, Profile } from "@prisma/client";

interface ChatItemProps {
  id: string;
  content: string;
  // Because member is a object which have a both info of member and profile coming from db
  member: Member & {
    profile: Profile;
  };
  timestamp: string;
  fileUrl: string | null;
  deleted: boolean;
  currentMember: Member;
  isUpdated: boolean;
  socketUrl: string;
  socketQuery: Record<string, string>;
}

export const ChatItem = ({
  id,
  content,
  member,
  timestamp,
  fileUrl,
  deleted,
  currentMember,
  isUpdated,
  socketQuery,
  socketUrl,
}: ChatItemProps) => {
  return <div>Hello</div>;
};
