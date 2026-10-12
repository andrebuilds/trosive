"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronsUpDownIcon, PlusIcon } from "lucide-react"

import type { SessionUser } from "@/lib/auth-client"
import type { ApiKeyStatus } from "@/lib/byok"
import { CHATS_ROUTE } from "@/lib/chat"
import {
  accountMenuNav,
  APP_ROOT,
  visibleDashboardNav,
  isDashboardNavItemActive,
  workspaceInitials,
  type DashboardNavCounts,
} from "@/lib/dashboard-nav"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { ApiKeyLine } from "@/components/api-key/api-key-line"
import { UserAvatar } from "@/components/auth/user-avatar"
import { TrosiveLogo, TrosiveMark } from "@/components/brand/trosive-logo"
import { AccountMenu } from "@/components/dashboard/account-menu"

/**
 * Product navigation — `ui-design/dashboard/light/dashboard-sidebar.png`.
 * Collapsing it leaves an icon rail rather than hiding it outright.
 */
function DashboardSidebar({
  user,
  workspaceName,
  counts,
  keyStatus,
  isAdmin,
}: {
  user: SessionUser
  /** The active organization's name, resolved by the workspace layout. */
  workspaceName: string
  /** Live chat and document totals for this workspace. */
  counts: DashboardNavCounts
  /** The workspace's Anthropic key, shown under the user's name. */
  keyStatus: ApiKeyStatus
  /** Admins get the Admin entry; nobody else is shown it exists. */
  isAdmin: boolean
}) {
  const pathname = usePathname()
  const nav = visibleDashboardNav(isAdmin)

  return (
    <Sidebar collapsible="icon">
      {/* Collapsed to the icon rail, the wordmark gives way to the mark and
          "New chat" to its plus. */}
      <SidebarHeader className="gap-4 px-3 pt-4 pb-2 group-data-[collapsible=icon]:px-2">
        <Link
          href={APP_ROOT}
          aria-label="Trosive home"
          className="px-1 group-data-[collapsible=icon]:px-0"
        >
          <TrosiveLogo className="group-data-[collapsible=icon]:hidden" />
          <TrosiveMark className="hidden group-data-[collapsible=icon]:block" />
        </Link>

        <Button
          size="lg"
          aria-label="New chat"
          className="w-full cursor-pointer group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:px-0"
          render={<Link href={CHATS_ROUTE} />}
          nativeButton={false}
        >
          <PlusIcon />
          <span className="group-data-[collapsible=icon]:hidden">New chat</span>
        </Button>
      </SidebarHeader>

      <SidebarContent className="gap-1">
        <div className="flex items-center gap-3 px-5 py-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
          <span
            title={workspaceName}
            className="flex size-7 shrink-0 items-center justify-center rounded-md border text-[0.625rem] font-semibold tracking-wide"
          >
            {workspaceInitials(workspaceName)}
          </span>
          <span className="truncate text-sm font-semibold group-data-[collapsible=icon]:hidden">
            {workspaceName}
          </span>
        </div>

        {nav.map((group, index) => (
          <SidebarGroup
            key={group.title ?? index}
            className="gap-1 px-3 py-0 group-data-[collapsible=icon]:px-2"
          >
            {group.title && (
              <SidebarGroupLabel className="mt-3 px-2 text-[0.6875rem] font-bold tracking-[0.08em] text-muted-foreground uppercase">
                {group.title}
              </SidebarGroupLabel>
            )}

            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {group.items.map((item) => {
                  const isActive = isDashboardNavItemActive(item, pathname)
                  // Zero is left off rather than shown: an empty library is
                  // already obvious from the page, and "0" reads as a badge.
                  const count = item.count ? counts[item.count] : 0

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        render={<Link href={item.href} />}
                        isActive={isActive}
                        tooltip={item.label}
                        className="h-9 gap-3 px-2.5 text-muted-foreground data-active:text-sidebar-accent-foreground"
                      >
                        <item.icon />
                        <span>{item.label}</span>
                      </SidebarMenuButton>

                      {count > 0 && (
                        <SidebarMenuBadge className="top-2 right-2 text-muted-foreground">
                          {count}
                        </SidebarMenuBadge>
                      )}

                      {item.tag && (
                        <Badge className="pointer-events-none absolute top-2 right-2 bg-brand/15 text-[0.625rem] font-bold tracking-wider text-brand uppercase group-data-[collapsible=icon]:hidden">
                          {item.tag}
                        </Badge>
                      )}

                      {/* Sub-links only while you're in that section — the
                        sidebar reference shows none at rest. */}
                      {item.items && isActive && (
                        <SidebarMenuSub className="my-1 gap-0.5">
                          {item.items.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.href}>
                              <SidebarMenuSubButton
                                render={<Link href={subItem.href} />}
                                isActive={pathname === subItem.href}
                                className="text-muted-foreground data-active:font-medium"
                              >
                                <span>{subItem.label}</span>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      )}
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <AccountMenu
              user={user}
              items={accountMenuNav}
              side="top"
              align="start"
              className="w-(--sidebar-width)"
              render={
                <SidebarMenuButton
                  size="lg"
                  className="cursor-pointer gap-3"
                  aria-label="Account menu"
                />
              }
            >
              <UserAvatar
                user={user}
                className="size-9 group-data-[collapsible=icon]:size-8"
              />
              <div className="flex min-w-0 flex-1 flex-col text-left group-data-[collapsible=icon]:hidden">
                <span className="truncate text-sm font-semibold">
                  {user.name || user.email}
                </span>
                <ApiKeyLine status={keyStatus} />
              </div>
              <ChevronsUpDownIcon className="text-muted-foreground group-data-[collapsible=icon]:hidden" />
            </AccountMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}

export { DashboardSidebar }
