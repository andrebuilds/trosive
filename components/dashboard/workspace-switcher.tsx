"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  CheckIcon,
  ChevronsUpDownIcon,
  PlusIcon,
  UserPlusIcon,
} from "lucide-react"

import { organization } from "@/lib/auth-client"
import {
  APP_ROOT,
  MEMBERS_ROUTE,
  workspaceInitials,
} from "@/lib/dashboard-nav"
import type { Workspace } from "@/lib/session"
import { siteConfig } from "@/lib/site-config"
import { canManageWorkspace, roleLabel } from "@/lib/workspace-roles"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "@/components/ui/toast"
import { authErrorMessage } from "@/components/auth/auth-errors"
import { TrosiveMark } from "@/components/brand/trosive-logo"
import { CreateWorkspaceDialog } from "@/components/workspace/create-workspace-dialog"

/**
 * The top of both sidebars: the product, and under it the workspace you're
 * in, as one block that opens onto every workspace you belong to. Shaped like
 * the account block in the footer. Collapsed to the icon rail, only the mark
 * is left, and it still opens the menu.
 */
function WorkspaceSwitcher({
  workspaces,
  activeWorkspaceId,
}: {
  /** Every workspace the user belongs to, oldest membership first. */
  workspaces: Workspace[]
  activeWorkspaceId: string
}) {
  const router = useRouter()
  const { isMobile, state } = useSidebar()
  const [switchingTo, setSwitchingTo] = React.useState<string | null>(null)
  const [creating, setCreating] = React.useState(false)

  const active =
    workspaces.find((workspace) => workspace.id === activeWorkspaceId) ??
    workspaces[0]

  async function switchTo(workspaceId: string) {
    if (workspaceId === active?.id || switchingTo) return

    setSwitchingTo(workspaceId)

    const { error } = await organization.setActive({
      organizationId: workspaceId,
    })

    if (error) {
      setSwitchingTo(null)
      toast.add({
        title: "Couldn't switch workspace.",
        description: authErrorMessage(error, "Try again in a moment."),
      })
      return
    }

    // Home rather than staying put: whatever chat or document is open belongs
    // to the workspace just left.
    router.push(APP_ROOT)
    router.refresh()
    setSwitchingTo(null)
  }

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <SidebarMenuButton
                  size="lg"
                  className="h-14 cursor-pointer gap-3"
                  aria-label="Switch workspace"
                />
              }
            >
              {/* `!` beats the button's own `[&_svg]:size-4`. On the rail the
                  mark fills the same 32px square as every icon button below. */}
              <TrosiveMark className="size-9! shrink-0 group-data-[collapsible=icon]:size-8!" />
              <div className="flex min-w-0 flex-1 flex-col text-left leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-heading text-lg font-bold tracking-tight">
                  {siteConfig.name}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {active?.name}
                </span>
              </div>
              <ChevronsUpDownIcon className="text-muted-foreground group-data-[collapsible=icon]:hidden" />
            </DropdownMenuTrigger>

            <DropdownMenuContent
              side={isMobile || state === "expanded" ? "bottom" : "right"}
              align="start"
              className="w-(--sidebar-width) min-w-64 p-1.5"
            >
              <DropdownMenuGroup>
                <DropdownMenuLabel>Workspaces</DropdownMenuLabel>

                {workspaces.map((workspace) => {
                  const isActive = workspace.id === active?.id

                  return (
                    <DropdownMenuItem
                      key={workspace.id}
                      disabled={switchingTo !== null && !isActive}
                      onClick={() => switchTo(workspace.id)}
                      className="cursor-pointer gap-2.5 px-1.5 py-2"
                    >
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-md border text-[0.625rem] font-semibold tracking-wide">
                        {workspaceInitials(workspace.name)}
                      </span>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate font-medium">
                          {workspace.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {roleLabel(workspace.role)}
                        </span>
                      </div>
                      {switchingTo === workspace.id ? (
                        <Spinner />
                      ) : (
                        isActive && <CheckIcon className="text-foreground" />
                      )}
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              {active && canManageWorkspace(active.role) && (
                <DropdownMenuItem
                  render={<Link href={MEMBERS_ROUTE} />}
                  className="cursor-pointer gap-2.5 px-1.5 py-2"
                >
                  <UserPlusIcon />
                  Invite members
                </DropdownMenuItem>
              )}

              <DropdownMenuItem
                onClick={() => setCreating(true)}
                className="cursor-pointer gap-2.5 px-1.5 py-2"
              >
                <PlusIcon />
                Create workspace
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <CreateWorkspaceDialog open={creating} onOpenChange={setCreating} />
    </>
  )
}

export { WorkspaceSwitcher }
