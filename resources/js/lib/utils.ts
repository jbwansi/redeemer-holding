import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type TimeInterval = { label: string; seconds: number };

export const getRelativeTime = (date: Date): string => {
  const now = new Date();
  const diff = (now.getTime() - date.getTime()) / 1000; // Différence en secondes

  const intervals: TimeInterval[] = [
    { label: 'année', seconds: 31536000 },
    { label: 'mois', seconds: 2592000 },
    { label: 'jour', seconds: 86400 },
    { label: 'heure', seconds: 3600 },
    { label: 'minute', seconds: 60 },
    { label: 'seconde', seconds: 1 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(diff / interval.seconds);
    if (count >= 1) {
      return `il y a ${count} ${interval.label}${count > 1 ? 's' : ''}`;
    }
  }

  return "à l'instant";
};

export const isDateInPast = (date: Date) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0);
  return compareDate < now;
};

export const isEndDateBeforeStartDate = (startDate: Date, endDate: Date) => {
  return new Date(endDate) <= new Date(startDate);
};

/**
 * Formate un montant en CHF
 * @param {number} amount - Montant à formater
 * @returns {string} - Montant formaté (ex: "CHF 24.90")
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-CH', {
    style: 'currency',
    currency: 'CHF',
    minimumFractionDigits: 2,
  }).format(amount);
};

/**
 * Formate une date au format français
 * @param {string|Date} date - Date à formater
 * @param {boolean} includeWeekday - Inclure le jour de la semaine
 * @returns {string} - Date formatée (ex: "jeudi 20 février 2025")
 */
export const formatDate = (date: any, includeWeekday = true) => {
  if (!date) return '';

  const dateObj = new Date(date);
  const options = {
    weekday: includeWeekday ? 'long' : undefined,
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  };

  return dateObj.toLocaleDateString('fr-FR', options);
};

/**
 * Formate une heure au format français
 * @param {string|Date} date - Date contenant l'heure à formater
 * @returns {string} - Heure formatée (ex: "14:30")
 */
export const formatTime = (date: any) => {
  if (!date) return '';

  const dateObj = new Date(date);
  return dateObj.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

/**
 * Détermine si un événement est passé
 * @param {string|Date} eventDate - Date de fin de l'événement
 * @returns {boolean} - True si l'événement est passé
 */
export const isEventPassed = (eventDate: any) => {
  return new Date(eventDate) < new Date();
};

/**
 * Détermine si un événement est en cours
 * @param {string|Date} startDate - Date de début de l'événement
 * @param {string|Date} endDate - Date de fin de l'événement
 * @returns {boolean} - True si l'événement est en cours
 */
export const isEventOngoing = (startDate: any, endDate: any) => {
  const now = new Date();
  return new Date(startDate) <= now && new Date(endDate) >= now;
};
