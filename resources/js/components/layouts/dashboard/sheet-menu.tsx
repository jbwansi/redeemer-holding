
import { MenuIcon, PanelsTopLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetHeader,
    SheetContent,
    SheetTrigger,
    SheetTitle
} from "@/components/ui/sheet";

export function SheetMenu() {
    return (
        <Sheet>
            <SheetTrigger className="lg:hidden" asChild>
                <Button className="h-9 w-9 rounded-xl border-border/70 bg-card/60" variant="outline" size="icon">
                    <MenuIcon size={18} />
                </Button>
            </SheetTrigger>
            <SheetContent className="sm:w-72 px-3 h-full flex flex-col" side="left">
                <SheetHeader>
                    <a
                        href={route('home')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-border/60 bg-card/60 px-3 py-2 transition-all duration-200 hover:bg-card"
                    >
                        <PanelsTopLeft className="w-5 h-5" />
                        <SheetTitle className="font-semibold text-base">Voir le site web</SheetTitle>
                    </a>
                </SheetHeader>
            </SheetContent>
        </Sheet>
    );
}
