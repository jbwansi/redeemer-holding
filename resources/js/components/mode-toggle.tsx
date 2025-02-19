"use client";

import React from "react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
    TooltipProvider
} from "@/components/ui/tooltip";
import { Moon, Sun } from "lucide-react";

export function ModeToggle() {
    const { setTheme, theme } = useTheme();

    return (
        <TooltipProvider disableHoverableContent>
            <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                    <Button
                        className="rounded-full w-8 h-8 bg-background mr-2 dark:bg-slate-200 dark:text-black"
                        variant="outline"
                        size="icon"
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    >
                        <Sun className="w-[1.2rem] h-[1.2rem] rotate-90 px-5 scale-0 transition-transform ease-in-out duration-500 dark:rotate-0 dark:scale-100" />
                        <Moon className="absolute w-[1.2rem] h-[1.2rem] rotate-0 scale-1000 transition-transform ease-in-out duration-500 dark:-rotate-90 dark:text-black" />
                        <span className="sr-only">Mode Jour/Nuit</span>
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Mode Jour/Nuit</TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
