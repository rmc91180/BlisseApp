import { positions, oralPlayIdeas } from '@/content/localizedContent';
import type { Position } from '@/content/positions';
import type { OralPlayIdea } from '@/content/oralplay';

export type DailyPositionPick =
  | {
      type: 'position';
      key: string;
      item: Position;
      cycleIndex: number;
      poolSize: number;
    }
  | {
      type: 'oral';
      key: string;
      item: OralPlayIdea;
      cycleIndex: number;
      poolSize: number;
    };

const DAILY_POSITION_SEED = 'blisse-position-of-the-day-v1';
const ROTATION_START_DATE = '2026-01-01';
const MS_PER_DAY = 24 * 60 * 60 * 1000;

const getLocalDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const daysSinceRotationStart = (date: Date): number => {
  const target = new Date(`${getLocalDateKey(date)}T12:00:00`);
  const start = new Date(`${ROTATION_START_DATE}T12:00:00`);
  return Math.max(0, Math.floor((target.getTime() - start.getTime()) / MS_PER_DAY));
};

const hashString = (value: string): number => {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const seededRandom = (seed: string) => {
  let state = hashString(seed) || 1;
  return () => {
    state += 0x6D2B79F5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const getRotationPool = (): DailyPositionPick[] => [
  ...positions.map((item) => ({
    type: 'position' as const,
    key: `position:${item.id}`,
    item,
    cycleIndex: 0,
    poolSize: 0,
  })),
  ...oralPlayIdeas.map((item) => ({
    type: 'oral' as const,
    key: `oral:${item.id}`,
    item,
    cycleIndex: 0,
    poolSize: 0,
  })),
].sort((a, b) => a.key.localeCompare(b.key));

const getShuffledPool = (): DailyPositionPick[] => {
  const pool = getRotationPool();
  const random = seededRandom(`${DAILY_POSITION_SEED}:${pool.length}`);
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool;
};

export const getDailyPositionForDate = (date: Date = new Date()): DailyPositionPick | null => {
  const pool = getShuffledPool();
  if (pool.length === 0) return null;

  const cycleIndex = daysSinceRotationStart(date) % pool.length;
  const pick = pool[cycleIndex];
  return {
    ...pick,
    cycleIndex,
    poolSize: pool.length,
  };
};
