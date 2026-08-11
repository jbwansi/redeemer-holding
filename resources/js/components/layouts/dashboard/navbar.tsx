import React, { useEffect, useState } from 'react';
import { NavUser } from './nav-user';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Link, usePage } from '@inertiajs/react';
import { Bell, Search, Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { dataRoutes } from '@/lib/routes';
import { ModeToggle } from '@/components/mode-toggle';

interface NavbarProps {
  title?: string;
}

interface GlobalSearchItem {
  id: number;
  title: string;
  subtitle: string;
  url: string;
  type: string;
}

export function Navbar({ title }: NavbarProps) {
  const { auth, notifications } = usePage().props as any;
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const [unreadNotifications, setUnreadNotifications] = useState<number>(
    notifications?.unread_count ?? 0
  );
  const [latestNotifications, setLatestNotifications] = useState<any[]>(notifications?.items ?? []);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [globalResults, setGlobalResults] = useState<{
    users: GlobalSearchItem[];
    events: GlobalSearchItem[];
    trainings: GlobalSearchItem[];
    posts: GlobalSearchItem[];
    services: GlobalSearchItem[];
  }>({
    users: [],
    events: [],
    trainings: [],
    posts: [],
    services: [],
  });

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  useEffect(() => {
    setUnreadNotifications(notifications?.unread_count ?? 0);
    setLatestNotifications(notifications?.items ?? []);
  }, [notifications]);

  useEffect(() => {
    const interval = window.setInterval(async () => {
      try {
        const response = await fetch(route('profile.notifications.feed'), {
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            Accept: 'application/json',
          },
        });

        if (!response.ok) {
          return;
        }

        const payload = await response.json();
        setUnreadNotifications(payload?.unread_count ?? 0);
        setLatestNotifications(payload?.items ?? []);
      } catch {
        // Silent fail: next polling tick will retry automatically.
      }
    }, 10000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const q = searchQuery.trim();

    if (q.length < 2) {
      setGlobalResults({ users: [], events: [], trainings: [], posts: [], services: [] });
      setIsSearching(false);
      return;
    }

    const timeout = window.setTimeout(async () => {
      try {
        setIsSearching(true);
        const response = await fetch(
          `${route('dashboard.search.global')}?q=${encodeURIComponent(q)}`,
          {
            headers: {
              'X-Requested-With': 'XMLHttpRequest',
              Accept: 'application/json',
            },
          }
        );

        if (!response.ok) {
          return;
        }

        const payload = await response.json();
        setGlobalResults({
          users: payload?.users ?? [],
          events: payload?.events ?? [],
          trainings: payload?.trainings ?? [],
          posts: payload?.posts ?? [],
          services: payload?.services ?? [],
        });
      } catch {
        setGlobalResults({ users: [], events: [], trainings: [], posts: [], services: [] });
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [searchQuery]);

  const userInfo = {
    name: auth?.user?.name,
    email: auth?.user?.email,
    avatar: 'https://randomuser.me/api',
  };

  const handleSelect = (url: string) => {
    if (url && url !== '#') {
      window.location.href = url;
    }
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
      <div className="container flex h-14 md:h-16 items-center px-3 md:px-6 justify-between">
        <div className="flex items-center gap-2 md:gap-3 lg:gap-4">
          <div className="rounded-xl border border-border/60 bg-card/70 px-1.5 py-1">
            <SidebarTrigger className="h-7 w-7" />
          </div>

          {title && (
            <div className="hidden xl:flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[#DA2E29]" />
              <span className="text-sm font-semibold tracking-tight text-foreground/90">
                {title}
              </span>
            </div>
          )}

          <div className="hidden lg:flex items-center">
            <a href={route('home')} target="_blank" rel="noopener noreferrer">
              <Button
                variant="outline"
                className="gap-2 rounded-xl border-border/70 bg-card/60 hover:bg-card"
                title="Voir le site web"
              >
                <Globe className="h-4 w-4" />
                <span className="hidden xl:inline">Voir le site web</span>
              </Button>
            </a>
          </div>
        </div>

        <div className="relative mx-4 flex-1 max-w-xl hidden lg:block">
          <Button
            variant="outline"
            className="relative w-full justify-start text-sm text-muted-foreground h-10 px-4 rounded-xl border-border/70 bg-card/50 hover:bg-card"
            onClick={() => setOpen(true)}
          >
            <span className="inline-flex items-center">
              <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-md bg-muted/70">
                <Search className="h-3.5 w-3.5" />
              </span>
              Rechercher dans le dashboard...
            </span>
            <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 hidden h-6 select-none items-center gap-1 rounded-md border border-border/70 bg-muted/60 px-2 font-mono text-[11px] text-muted-foreground sm:flex">
              <span className="text-xs">{isMac ? '⌘' : 'Ctrl'}</span>K
            </kbd>
          </Button>
        </div>

        <div className="flex items-center justify-end gap-1.5 md:gap-3">
          <Button
            variant="outline"
            size="icon"
            className="lg:hidden rounded-xl border-border/70 bg-card/60 hover:bg-card h-8 w-8"
            onClick={() => setOpen(true)}
            title="Rechercher"
          >
            <Search className="h-4 w-4" />
          </Button>

          {/* Notifications Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="relative rounded-xl border-border/70 bg-card/60 hover:bg-card h-8 w-8 md:h-10 md:w-10"
              >
                <Bell className="h-5 w-5" />
                {unreadNotifications > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 min-w-5 px-1 flex items-center justify-center p-0 text-[10px] leading-none">
                    {unreadNotifications}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {latestNotifications.length === 0 ? (
                <DropdownMenuItem disabled className="text-sm text-muted-foreground">
                  Aucune notification non lue
                </DropdownMenuItem>
              ) : (
                latestNotifications.map((item: any) => (
                  <DropdownMenuItem key={item.id} className="p-0">
                    <Link
                      href={route('profile.notifications.read', item.id)}
                      className="flex w-full flex-col items-start p-2"
                      method="post"
                      as="button"
                      data={item.url ? { redirect_to: item.url } : {}}
                    >
                      <div className="font-medium">{item.title}</div>
                      <div className="text-sm text-muted-foreground line-clamp-2">
                        {item.message}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">{item.created_at}</div>
                    </Link>
                  </DropdownMenuItem>
                ))
              )}
              <DropdownMenuSeparator />
              {unreadNotifications > 0 && (
                <DropdownMenuItem className="justify-center font-medium p-0">
                  <Link
                    href={route('profile.notifications.read-all')}
                    method="post"
                    as="button"
                    className="w-full py-2"
                  >
                    Tout marquer comme lu
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem className="justify-center font-medium p-0">
                <Link href={route('profile.notifications')} className="w-full py-2 text-center">
                  Voir toutes les notifications
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="rounded-xl border border-border/70 bg-card/60 px-0.5">
            <ModeToggle />
          </div>

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
          <CommandEmpty>
            {isSearching ? 'Recherche en cours...' : 'Aucun résultat trouvé.'}
          </CommandEmpty>
          {searchQuery.trim().length >= 2 && (
            <>
              {globalResults.users.length > 0 && (
                <CommandGroup heading="Utilisateurs">
                  {globalResults.users.map((item) => (
                    <CommandItem key={`user-${item.id}`}>
                      <Link
                        href={item.url}
                        className="flex w-full items-center justify-between"
                        onClick={() => setOpen(false)}
                      >
                        <span>{item.title}</span>
                        <span className="text-xs text-muted-foreground">{item.subtitle}</span>
                      </Link>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {globalResults.events.length > 0 && (
                <CommandGroup heading="Evenements">
                  {globalResults.events.map((item) => (
                    <CommandItem key={`event-${item.id}`}>
                      <Link
                        href={item.url}
                        className="flex w-full items-center justify-between"
                        onClick={() => setOpen(false)}
                      >
                        <span>{item.title}</span>
                        <span className="text-xs text-muted-foreground">{item.subtitle}</span>
                      </Link>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {globalResults.trainings.length > 0 && (
                <CommandGroup heading="Formations">
                  {globalResults.trainings.map((item) => (
                    <CommandItem key={`formation-${item.id}`}>
                      <Link
                        href={item.url}
                        className="flex w-full items-center justify-between"
                        onClick={() => setOpen(false)}
                      >
                        <span>{item.title}</span>
                        <span className="text-xs text-muted-foreground">{item.subtitle}</span>
                      </Link>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {globalResults.posts.length > 0 && (
                <CommandGroup heading="Articles">
                  {globalResults.posts.map((item) => (
                    <CommandItem key={`post-${item.id}`}>
                      <Link
                        href={item.url}
                        className="flex w-full items-center justify-between"
                        onClick={() => setOpen(false)}
                      >
                        <span>{item.title}</span>
                        <span className="text-xs text-muted-foreground">{item.subtitle}</span>
                      </Link>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {globalResults.services.length > 0 && (
                <CommandGroup heading="Services">
                  {globalResults.services.map((item) => (
                    <CommandItem key={`service-${item.id}`}>
                      <Link
                        href={item.url}
                        className="flex w-full items-center justify-between"
                        onClick={() => setOpen(false)}
                      >
                        <span>{item.title}</span>
                        <span className="text-xs text-muted-foreground">{item.subtitle}</span>
                      </Link>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              <CommandSeparator />
            </>
          )}
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
                        <Link
                          href={item.url}
                          className="flex items-center w-full"
                          onClick={() => setOpen(false)}
                        >
                          {item.icon ? (
                            <item.icon className="mr-2 h-4 w-4" />
                          ) : (
                            <Icon className="mr-2 h-4 w-4" />
                          )}
                          <span>{item.title}</span>
                        </Link>
                      </CommandItem>
                    );
                  })
                ) : (
                  <CommandItem onSelect={() => handleSelect(section.url)}>
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
