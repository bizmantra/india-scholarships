/**
 * The teams the command center is organised by. Each agent belongs to one team (see `team` in agents.ts) and each
 * backlog item's `category` is a team id. The ids and labels live in backlog-types.ts (one list for both); this file adds
 * what the team pages need. Kept in code for now; they move to a database table later.
 */
import { TEAMS as TEAM_LIST } from './backlog-types';

export type TeamId = (typeof TEAM_LIST)[number]['id'];

export interface TeamDefinition {
    id: TeamId;
    label: string;
    goal: string;
    // Shown on the team page when the team has no agents yet
    emptyNote?: string;
}

const DETAILS: Record<TeamId, { goal: string; emptyNote?: string }> = {
    dev: {
        goal: 'Build and fix the site and the command center.',
        emptyNote: 'No agents here yet. Work for this team is on the backlog board.',
    },
    'content-research': {
        goal: 'Find new opportunities worth publishing: scholarships first, other content types later.',
    },
    'content-creation': {
        goal: 'Turn approved ideas into published pages.',
        emptyNote: 'Only publishing is automated today. A Writer joins this team later.',
    },
    data: {
        goal: 'Keep every date, amount, link and detail on the site correct.',
    },
    strategy: {
        goal: 'Decide what to build and publish next.',
        emptyNote: 'No agents here yet. Plans for new features live in the plans folder.',
    },
    seo: {
        goal: 'Get pages found and indexed by search engines, and win more search clicks.',
    },
    growth: {
        goal: 'Watch where visits come from and bring more of them.',
    },
};

export const TEAMS: TeamDefinition[] = TEAM_LIST.map(t => ({ id: t.id, label: t.label, ...DETAILS[t.id] }));

export const teamById = (id: string) => TEAMS.find(t => t.id === id);
