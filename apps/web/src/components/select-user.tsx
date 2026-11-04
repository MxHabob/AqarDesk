"use client";

import { Skeleton } from "@aqardesk/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { AssignedUser } from "./assigned-user";

type User = {
  id: string;
  avatarUrl?: string | null;
  fullName: string | null;
};

type Props = {
  onSelect: (selected: User) => void;
};

export function SelectUser({ onSelect }: Props) {
  const trpc = useTRPC();
  const {
    data: users,
    isLoading,
    isError,
  } = useQuery(trpc.team.members.queryOptions());

  if (isError && !users) {
    return (
      <p className="text-sm text-destructive" role="alert">
        Could not load team members.
      </p>
    );
  }

  if (isLoading) {
    return (
      <div
        role="status"
        aria-label="Loading team members"
        aria-busy="true"
        className="w-full space-y-3"
      >
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index.toString()} className="flex items-center gap-2">
            <Skeleton className="size-8 rounded-full" />
            <Skeleton className="h-4 w-28" />
          </div>
        ))}
      </div>
    );
  }

  return users?.map(({ user }) => {
    return (
      <button
        type="button"
        key={user?.id}
        className="flex items-center text-sm cursor-default"
        onClick={() => {
          if (user) {
            onSelect(user);
          }
        }}
      >
        <AssignedUser avatarUrl={user?.avatarUrl} fullName={user?.fullName} />
      </button>
    );
  });
}
