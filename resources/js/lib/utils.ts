import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type TimeInterval = { label: string; seconds: number };

export const getRelativeTime = (date: Date): string => {
    const now = new Date();
    const diff = (now.getTime() - date.getTime()) / 1000; // Différence en secondes

    const intervals: TimeInterval[] = [
        { label: "année", seconds: 31536000 },
        { label: "mois", seconds: 2592000 },
        { label: "jour", seconds: 86400 },
        { label: "heure", seconds: 3600 },
        { label: "minute", seconds: 60 },
        { label: "seconde", seconds: 1 },
    ];

    for (const interval of intervals) {
        const count = Math.floor(diff / interval.seconds);
        if (count >= 1) {
            return `il y a ${count} ${interval.label}${count > 1 ? "s" : ""}`;
        }
    }

    return "à l'instant";
};
/**
 * Formats a number into a currency string using the specified locale and currency.
 * @param amount - The amount to format
 * @param currency - The currency code (default: 'EUR')
 * @param locale - The locale to use for formatting (default: 'fr-FR')
 * @returns A formatted currency string
 */
export function formatCurrency(
    amount: number,
    currency: string = "XOF",
    locale: string = "fr-FR"
): string {
    return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}
