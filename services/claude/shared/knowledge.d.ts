import type { Puzzle, Group } from '../../../src/frontend/src/game/puzzles';
export interface KnowledgePack { id: string; name: string; summary: string; sources: { title: string; url: string }[]; groups: (Omit<Group, 'rule'> & { rule?: string; fixedText?: string })[] }
export const knowledgePacks: KnowledgePack[];
export function packById(id: string): KnowledgePack;
export function packVariants(id: string): Group[];
export function knowledgeBoard(id: string, choices?: string[]): Puzzle;
