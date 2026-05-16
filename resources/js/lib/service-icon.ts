import dynamicIconImports from 'lucide-react/dynamicIconImports';

type DynamicIconName = keyof typeof dynamicIconImports;

const LEGACY_ICON_ALIASES: Record<string, DynamicIconName> = {
  user: 'userRound',
  message: 'messageCircle',
  users: 'users',
  Handshake: 'handshake',
  Education: 'graduationCap',
  Progress: 'lineChart',
  Guidance: 'compass',
  Performance: 'barChart2',
  Learning: 'bookOpen',
  Success: 'checkCircle2',
  Time: 'clock',
  Leadership: 'crown',
  Vision: 'eye',
  Reports: 'fileSpreadsheet',
  Obstacles: 'filterX',
  Goals: 'flag',
  Innovation: 'flaskConical',
  Journey: 'footprints',
  Potential: 'gift',
  Global: 'globe2',
  Empathy: 'heartHandshake',
  Support: 'helpCircle',
  Workspace: 'home',
  Unlimited: 'infinity',
  Online: 'laptop2',
  Levels: 'layers',
  Dashboard: 'layoutDashboard',
  Help: 'lifeBuoy',
  Network: 'link',
  ActionPlan: 'listChecks',
  Communication: 'messageCircle',
  Challenge: 'mountain',
  Networking: 'network',
  Creativity: 'palette',
  Notes: 'pencil',
  Analysis: 'pieChart',
  ProblemSolving: 'puzzle',
  Balance: 'scale',
  Training: 'school2',
  Discovery: 'search',
  Customize: 'settings',
  Security: 'shield',
  Feedback: 'stickyNote',
  Productivity: 'timer',
  Eliminate: 'trash2',
  Growth: 'trendingUp',
  Validation: 'userCheck',
  PersonalGrowth: 'userPlus',
  Community: 'users2',
  Process: 'workflow',
  Motivation: 'zap',
};

function lowerFirst(value: string): string {
  return value.charAt(0).toLowerCase() + value.slice(1);
}

function toCamelCase(value: string): string {
  return value
    .replace(/[-_\s]+(.)?/g, (_, char: string) => (char ? char.toUpperCase() : ''))
    .replace(/^(.)/, (char) => char.toLowerCase());
}

export function normalizeServiceIconName(icon?: string | null): DynamicIconName | undefined {
  if (!icon) return undefined;

  const trimmed = icon.trim();
  if (!trimmed) return undefined;

  if (trimmed in LEGACY_ICON_ALIASES) {
    return LEGACY_ICON_ALIASES[trimmed];
  }

  const candidates = [
    trimmed,
    lowerFirst(trimmed),
    toCamelCase(trimmed),
    toCamelCase(trimmed.toLowerCase()),
  ] as DynamicIconName[];

  return candidates.find((candidate) => candidate in dynamicIconImports);
}
