import React, { useEffect, useState } from 'react';
import { NavUser } from "./nav-user";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Link, usePage } from "@inertiajs/react";
import { Input } from "@/components/ui/input";
import { Bell, MessageSquare, Radio, Search, LayoutDashboard, Music2, Calendar as Calendar1, ShoppingCart, CalendarDays, BookType, Users, Headset, MonitorCog, Settings, Globe } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command';
import { dataRoutes } from '@/lib/routes';
import { ModeToggle } from '@/components/mode-toggle';

interface NavbarProps {
    title?: string;
}

export function Navbar({ title }: NavbarProps) {
    const { auth } = usePage().props as any;
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const [unreadMessages] = useState(3);
    const [unreadNotifications] = useState(5);
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");


    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const userInfo = {
        name: auth?.user?.name,
        email: auth?.user?.email,
        avatar: "https://randomuser.me/api",
    }

    const filteredNavMain = dataRoutes.navMain.flatMap(section => {
        if (section.items) {
            return section.items.map(item => ({
                ...item,
                parentTitle: section.title,
                icon: section.icon,
            }));
        }
        return [{
            title: section.title,
            url: section.url,
            icon: section.icon,
        }];
    });

    const handleSelect = (url: string) => {
        if (url && url !== "#") {
            window.location.href = url;
        }
        setOpen(false);
    };

    return (
        <header className="sticky top-0 z-50 w-full bg-background/95 shadow backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:shadow-secondary">
            <div className="container flex h-16 items-center px-4 md:px-6 justify-between">
                <div className="flex items-center space-x-4 lg:space-x-0">
                    <SidebarTrigger />
                    <div className="hidden lg:flex items-center space-x-6 ps-4">
                        <Link href={route('home')} target='_blank'>
                            <Button variant="ghost" className="gap-2" title='Voir le site web'>
                                <Globe className="h-5 w-5" />
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="relative mx-4 flex-1 max-w-md hidden lg:block">
                    <Button
                        variant="outline"
                        className="relative w-full justify-start text-sm text-muted-foreground h-9 px-4"
                        onClick={() => setOpen(true)}
                    >
                        <span className="inline-flex">
                            <Search className="mr-2 h-4 w-4" />
                            Rechercher...
                        </span>
                        <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs text-muted-foreground sm:flex">
                            <span className="text-xs">{isMac ? '⌘' : 'Ctrl'}</span>K
                        </kbd>
                    </Button>
                </div>

                <div className="flex items-center justify-end space-x-4">
                    {/* Notifications Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="relative">
                                <Bell className="h-7 w-7" />
                                {unreadNotifications > 0 && (
                                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                                        {unreadNotifications}
                                    </Badge>
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-80">
                            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="flex flex-col items-start">
                                <div className="font-medium">Nouvel événement ajouté</div>
                                <div className="text-sm text-muted-foreground">Concert en direct - 20h</div>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="flex flex-col items-start">
                                <div className="font-medium">Nouvelle article blog</div>
                                <div className="text-sm text-muted-foreground">Top 10 hits de la semaine</div>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="justify-center font-medium">
                                Voir toutes les notifications
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <ModeToggle />
                    <NavUser user={userInfo} />
                </div>
            </div>

            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput
                    placeholder="Rechercher dans l'application..."
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                />
                <CommandList>
                    <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>
                    {dataRoutes.navMain.map((section) => (
                        <React.Fragment key={section.title}>
                            <CommandGroup heading={section.title}>
                                {section.items ? (
                                    section.items.map((item) => {
                                        const Icon = section.icon;
                                        return (
                                            <CommandItem
                                                key={`${section.title}-${item.title}`}
                                            // onSelect={() => handleSelect(item.url)}
                                            >
                                                <Link href={item.url} className="flex items-center w-full" onClick={() => setOpen(false)}>
                                                    {item.icon ? <item.icon className="mr-2 h-4 w-4" /> : <Icon className="mr-2 h-4 w-4" />}
                                                    <span>{item.title}</span>
                                                </Link>
                                            </CommandItem>
                                        );
                                    })
                                ) : (
                                    <CommandItem
                                        onSelect={() => handleSelect(section.url)}
                                    >
                                        {section.icon && <section.icon className="mr-2 h-4 w-4" />}
                                        <span>{section.title}</span>
                                    </CommandItem>
                                )}
                            </CommandGroup>
                            <CommandSeparator />
                        </React.Fragment>
                    ))}
                </CommandList>
            </CommandDialog>
        </header>
    );
}

export default Navbar;
