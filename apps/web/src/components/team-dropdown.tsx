"use client";

import { Avatar, AvatarFallback, AvatarImageNext } from "@aqardesk/ui/avatar";
import { Button } from "@aqardesk/ui/button";
import { Icons } from "@aqardesk/ui/icons";
import { Skeleton } from "@aqardesk/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@aqardesk/ui/tooltip";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRef, useState } from "react";
import { useOnClickOutside } from "usehooks-ts";
import {
  getUserTeamsAction,
  switchActiveTeamAction,
} from "@/actions/teams";

type Props = {
  isExpanded?: boolean;
};

function TeamDropdownSkeleton({ isExpanded }: { isExpanded: boolean }) {
  return (
    <div className="relative h-[32px]">
      <div className="fixed start-[19px] bottom-4 w-[32px] h-[32px]">
        <Skeleton className="w-[32px] h-[32px] rounded-none" />
      </div>
      {isExpanded && (
        <div className="fixed start-[62px] bottom-4 h-[32px] flex items-center">
          <Skeleton className="h-4 w-24" />
        </div>
      )}
    </div>
  );
}

export function TeamDropdown({ isExpanded = false }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const [isActive, setActive] = useState(false);
  const [isChangingTeam, setIsChangingTeam] = useState(false);

  const changeTeamMutation = useMutation({
    mutationFn: switchActiveTeamAction,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["user-teams"] });
      setIsChangingTeam(false);
    },
    onError: () => {
      setIsChangingTeam(false);
      setActive(false);
    },
  });

  const {
    data: teamData,
    isLoading: isTeamsLoading,
    isError: isTeamsError,
  } = useQuery({
    queryKey: ["user-teams"],
    queryFn: getUserTeamsAction,
  });
  const teams = teamData?.teams;
  const selectedId = teamData?.selectedTeamId;

  const sortedTeams =
    teams?.sort((a, b) => {
      if (a.id === selectedId) return -1;
      if (b.id === selectedId) return 1;

      return (a.id ?? "").localeCompare(b.id ?? "");
    }) ?? [];

  // @ts-expect-error
  useOnClickOutside(ref, () => {
    if (!isChangingTeam) {
      setActive(false);
    }
  });

  const toggleActive = () => setActive((prev) => !prev);

  // Show skeleton while teams are loading
  // Note: user loading is handled by Suspense since useUserQuery uses useSuspenseQuery
  if (isTeamsLoading || isTeamsError) {
    return <TeamDropdownSkeleton isExpanded={isExpanded} />;
  }

  const handleTeamChange = (teamId: string) => {
    if (teamId === selectedId) {
      toggleActive();
      return;
    }

    setIsChangingTeam(true);
    setActive(false);

    changeTeamMutation.mutate(teamId);
  };

  return (
    <TooltipProvider delay={50}>
      <div className="relative h-[32px]" ref={ref}>
        {/* Avatar - fixed position that absolutely never changes */}
        <div className="fixed start-[19px] bottom-4 w-[32px] h-[32px]">
          <div className="relative w-[32px] h-[32px]">
            <AnimatePresence>
              {isActive && (
                <motion.div
                  className="w-[32px] h-[32px] start-0 overflow-hidden absolute"
                  style={{ zIndex: 1 }}
                  initial={{ y: 0, opacity: 0 }}
                  animate={{ y: -(32 + 10) * sortedTeams.length, opacity: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 25,
                    mass: 1.2,
                  }}
                >
                  <Link href="/onboarding" onClick={() => setActive(false)}>
                    <Button
                      className="w-[32px] h-[32px] bg-background"
                      size="icon"
                      variant="outline"
                    >
                      <Icons.Add />
                    </Button>
                  </Link>
                </motion.div>
              )}
              {sortedTeams.map((team, index) => {
                const isSelected = team.id === selectedId;
                return (
                  <motion.div
                    key={team.id}
                    className="w-[32px] h-[32px] start-0 overflow-hidden absolute"
                    style={{ zIndex: -index }}
                    initial={{
                      scale: `${100 - index * 16}%`,
                      y: index * 5,
                    }}
                    animate={
                      isActive
                        ? {
                            y: -(32 + 10) * index,
                            scale: "100%",
                          }
                        : {
                            scale: `${100 - index * 16}%`,
                            y: index * 5,
                          }
                    }
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 25,
                      mass: 1.2,
                    }}
                  >
                    {!isSelected ? (
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <Avatar
                              className="w-[32px] h-[32px] rounded-none border border-[#DCDAD2] dark:border-[#2C2C2C] cursor-pointer"
                              onClick={() => {
                                if (index === 0) {
                                  toggleActive();
                                } else {
                                  handleTeamChange(team?.id ?? "");
                                }
                              }}
                            >
                              <AvatarImageNext
                                src={team?.logoUrl ?? ""}
                                alt={team?.name ?? ""}
                                width={20}
                                height={20}
                                quality={100}
                              />
                              <AvatarFallback className="rounded-none w-[32px] h-[32px]">
                                <span className="text-xs">
                                  {team?.name?.charAt(0)?.toUpperCase()}
                                  {team?.name?.charAt(1)?.toUpperCase()}
                                </span>
                              </AvatarFallback>
                            </Avatar>
                          }
                        />
                        <TooltipContent
                          side="inline-end"
                          sideOffset={8}
                          className="px-2 py-1"
                        >
                          <p className="text-xs">{team.name}</p>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <Avatar
                        className="w-[32px] h-[32px] rounded-none border border-[#DCDAD2] dark:border-[#2C2C2C] cursor-pointer"
                        onClick={() => {
                          if (index === 0) {
                            toggleActive();
                          } else {
                            handleTeamChange(team?.id ?? "");
                          }
                        }}
                      >
                        <AvatarImageNext
                          src={team?.logoUrl ?? ""}
                          alt={team?.name ?? ""}
                          width={20}
                          height={20}
                          quality={100}
                        />
                        <AvatarFallback className="rounded-none w-[32px] h-[32px]">
                          <span className="text-xs">
                            {team?.name?.charAt(0)?.toUpperCase()}
                            {team?.name?.charAt(1)?.toUpperCase()}
                          </span>
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Team name - appears to the right of the fixed avatar */}
        {isExpanded && sortedTeams[0] && (
          <div className="fixed start-[62px] bottom-4 h-[32px] flex items-center">
            <button
              type="button"
              aria-expanded={isActive}
              className="border-0 bg-transparent p-0 text-start text-sm text-primary truncate transition-opacity duration-200 ease-in-out cursor-pointer hover:opacity-80"
              onClick={(e) => {
                e.stopPropagation();
                toggleActive();
              }}
            >
              {sortedTeams[0].name}
            </button>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
