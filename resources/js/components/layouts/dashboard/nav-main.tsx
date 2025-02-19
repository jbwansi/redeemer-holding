"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
    SidebarGroup,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { Link, usePage } from "@inertiajs/react"

interface NavItem {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    items?: {
        title: string
        url: string
    }[]
}

export function NavMain({ items }: { items: NavItem[] }) {
    const { url } = usePage()

    const getCleanPath = (url: string): string => {
        try {
            const urlObj = new URL(url)
            return urlObj.pathname
        } catch {
            return url.split('?')[0]
        }
    }

    const currentPath = getCleanPath(url)

    const isGroupActive = (item: NavItem): boolean => {
        if (!item.items) return false
        return item.items.some(subItem => {
            const itemPath = getCleanPath(subItem.url)
            return currentPath === itemPath
        })
    }

    const isLinkActive = (url: string): boolean => {
        const itemPath = getCleanPath(url)
        return currentPath === itemPath
    }

    // Classes communes pour les éléments de menu
    const getMenuItemClasses = (isActive: boolean) => `
        mb-[5px]
        font-semibold
        transition-colors
        duration-200
        text-gray-700
        hover:text-gray-900
        dark:text-gray-400
        dark:hover:text-gray-200
        ${isActive ? 'text-primary dark:text-primary bg-primary/10 dark:bg-primary/20' : ''}
    `.trim()

    return (
        <SidebarGroup>
            <SidebarMenu>
                {items.map((item) => (
                    item.items && item.items.length > 0 ? (
                        <Collapsible
                            key={item.title}
                            asChild
                            defaultOpen={isGroupActive(item)}
                            className="group/collapsible"
                        >
                            <SidebarMenuItem>
                                <CollapsibleTrigger asChild>
                                    <SidebarMenuButton
                                        tooltip={item.title}
                                        className={getMenuItemClasses(isGroupActive(item))}
                                    >
                                        {item.icon && (
                                            <item.icon
                                                className={`text-[14px] ${isGroupActive(item)
                                                        ? 'text-primary dark:text-primary'
                                                        : 'text-gray-500 dark:text-gray-400'
                                                    }`}
                                            />
                                        )}
                                        <span className="text-[14px]">{item.title}</span>
                                        <ChevronRight
                                            className="ml-auto transition-transform duration-200
                                            group-data-[state=open]/collapsible:rotate-90"
                                        />
                                    </SidebarMenuButton>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <SidebarMenuSub>
                                        {item.items.map((subItem) => (
                                            <SidebarMenuSubItem key={subItem.title}>
                                                <SidebarMenuSubButton
                                                    asChild
                                                    className={getMenuItemClasses(isLinkActive(subItem.url))}
                                                >
                                                    <Link
                                                        href={subItem.url}
                                                        className="text-[14px] w-full"
                                                    >
                                                        <span className="text-[14px]">{subItem.title}</span>
                                                    </Link>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                        ))}
                                    </SidebarMenuSub>
                                </CollapsibleContent>
                            </SidebarMenuItem>
                        </Collapsible>
                    ) : (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                tooltip={item.title}
                                className={getMenuItemClasses(isLinkActive(item.url))}
                            >
                                <Link href={item.url} className="text-[15px]">
                                    {item.icon && (
                                        <item.icon
                                            className={`text-[15px] ${isLinkActive(item.url)
                                                    ? 'text-primary dark:text-primary'
                                                    : 'text-gray-500 dark:text-gray-400'
                                                }`}
                                        />
                                    )}
                                    <span className="text-[15px]">{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    )
                ))}
            </SidebarMenu>
        </SidebarGroup>
    )
}

export default NavMain
