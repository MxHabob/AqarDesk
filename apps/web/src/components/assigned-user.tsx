"use client"

import { Avatar, AvatarImageNext } from "@aqardesk/ui/avatar"
import { useFileUrl } from "@/hooks/use-file-url"

type Props = {
  avatarUrl?: string | null;
  fullName?: string | null;
};

export function AssignedUser({ avatarUrl, fullName }: Props) {
  const { url } = useFileUrl(
    avatarUrl ? { type: "url", url: avatarUrl } : null
  )

  return (
    <div className="flex space-x-2 items-center">
      {url && (
        <Avatar className="h-5 w-5">
          <AvatarImageNext src={url} alt={fullName ?? ""} width={20} height={20} />
        </Avatar>
      )}
      <span className="truncate">{fullName?.split(" ").at(0)}</span>
    </div>
  );
}
