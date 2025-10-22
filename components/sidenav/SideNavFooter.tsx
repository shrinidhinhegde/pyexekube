import {useSession} from "next-auth/react";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,} from "@/components/ui/dropdown-menu";
import {SidebarFooter, SidebarMenuButton, SidebarMenuItem, useSidebar} from "@/components/ui/sidebar";
import {ChevronUp, LogOut, User} from "lucide-react";
import ThemeToggle from "@/components/theme/ThemeToggle";
import Link from "next/link";
import UIAvatar from "@/components/sidenav/UIAvatar";
import {useAuth} from "@/lib/signout";

export function SideNavFooter() {
    const {state} = useSidebar();
    const {data: session} = useSession();
    const {handleSignOut} = useAuth();
    if (!session?.user) return null;
    const {name: username, email} = session.user;

    function truncateEmail(email: string, maxLength = 15) {
        if (email.length <= maxLength) return email;
        const [name, domain] = email.split("@");
        const keep = Math.max(3, maxLength - domain.length - 5)
        return `${name.slice(0, keep)}...@${domain}`;
    }

    function truncateUsername(username: string, maxLength = 15) {
        if (username.length <= maxLength) return username;
        return `${username.slice(0, maxLength - 3)}...`;
    }

    const DropDownContent = () => {
        return (
          <DropdownMenuContent
            align="end"
            className="w-[--radix-popper-anchor-width]"
          >
              <div className="px-3 py-2">
                  <span className="font-medium block truncate">{username}</span>
                  <span className="text-xs text-muted-foreground block truncate">{email}</span>
              </div>
              <div className="border-t my-1"/>
              <DropdownMenuItem>
                  <Link href="/profile" className="flex items-center w-full">
                      <User
                        className="mr-2 h-[1.2rem] w-[1.2rem] scale-100 transition-all"
                        size={18}
                      />
                      Profile
                  </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSignOut()}>
                  <LogOut
                    className="mr-2 h-[1.2rem] w-[1.2rem] scale-100 transition-all"
                    size={18}
                  />
                  Sign out
              </DropdownMenuItem>
          </DropdownMenuContent>
        )
    }

    return (
      <SidebarFooter className="list-none">
          <SidebarMenuItem>
              {state === "collapsed" ? (
                <div className="flex flex-col items-center gap-2 w-full">
                    <ThemeToggle/>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild={true}>
                            <SidebarMenuButton className="justify-center flex">
                                <UIAvatar className="border-2 border-[var(--color-chateau-green-600)]"
                                          fallback={username || ""}/>
                            </SidebarMenuButton>
                        </DropdownMenuTrigger>
                        <DropDownContent/>
                    </DropdownMenu>
                </div>
              ) : (
                <DropdownMenu>
                    <div className="flex items-center gap-2 w-full">
                        <DropdownMenuTrigger asChild={true}>
                            <SidebarMenuButton className="flex items-center flex-1 w-0">
                                <UIAvatar className="border-2 border-[var(--color-chateau-green-600)]"
                                          fallback={username || ""}/>
                                <div className="flex flex-col items-start min-w-0 flex-1">
                                        <span
                                          className="font-medium truncate">{username ? truncateUsername(username) : ""}</span>
                                    <span
                                      className="text-xs text-muted-foreground truncate">{email ? truncateEmail(email) : ""}</span>
                                </div>
                                <ChevronUp className="ml-2"/>
                            </SidebarMenuButton>
                        </DropdownMenuTrigger>
                        <ThemeToggle/>
                    </div>
                    <DropDownContent/>
                </DropdownMenu>
              )}
          </SidebarMenuItem>
      </SidebarFooter>
    );
}