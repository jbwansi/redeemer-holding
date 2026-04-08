"use client"

import * as React from "react"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from "@/components/ui/sidebar"
import { dataRoutes } from "@/lib/routes"
import NavMain from "./nav-main"
import { NavUser } from "./nav-user"


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar collapsible="icon" {...props}
            className="bg-background backdrop-blur-[10px] backdrop-saturate-150
                    border-r border-border/40 shadow-sm
                    before:absolute before:inset-0 before:bg-gradient-to-b
                    before:from-white/10 before:to-white/5 before:dark:from-black/10
                    before:dark:to-black/5 before:-z-10"
        >
            <SidebarHeader className="flex items-center justify-center p-3 bg-background">
                <a
                    href={route("home")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group rounded-xl border border-border/60 bg-card/60 px-3 py-2 transition-all duration-200 hover:bg-card hover:shadow-sm"
                >
                    <img
                        src="/assets/images/logo.png"
                        className="w-28 h-auto dark:hidden transition-transform duration-200 group-hover:scale-[1.02]"
                        alt="Logo light mode"
                    />
                    <img
                        src="/assets/images/logo-dark.png"
                        className="w-28 h-auto hidden dark:block transition-transform duration-200 group-hover:scale-[1.02]"
                        alt="Logo dark mode"
                    />
                </a>
            </SidebarHeader>
            <SidebarContent className="bg-background">
                <NavMain items={dataRoutes.navMain} />
            </SidebarContent>
            <SidebarFooter className="bg-background">
                <NavUser user={dataRoutes.user} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
