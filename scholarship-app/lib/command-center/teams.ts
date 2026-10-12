/**
 * The teams the command center is organised by. Each agent belongs to one team (see `team` in agents.ts).
 * Kept in code for now; they move to a database table when tasks are added.
 */

export type TeamId = 'content-research' | 'content-creation' | 'data-accuracy' | 'strategy' | 'traffic';

export interface TeamDefinition {
    id: TeamId;
    label: string;
    goal: string;
    // Shown on the team page when the team has no agents yet
    emptyNote?: string;
}

export const TEAMS: TeamDefinition[] = [
    {
        id: 'content-research',
        label: 'Content research',
        goal: 'Find new opportunities worth publishing: scholarships first, other content types later.',
    },
    {
        id: 'content-creation',
        label: 'Content creation',
        goal: 'Turn approved ideas into published pages.',
        emptyNote: 'Only publishing is automated today. A Writer joins this team later.',
    },
    {
        id: 'data-accuracy',
        label: 'Data accuracy',
        goal: 'Keep every date, amount, link and detail on the site correct.',
    },
    {
        id: 'strategy',
        label: 'Strategy',
        goal: 'Decide what to build and publish next.',
        emptyNote: 'No agents here yet. Plans for new features live in the plans folder.',
    },
    {
        id: 'traffic',
        label: 'Traffic distribution',
        goal: 'Get pages found and watch where visits come from.',
    },
];

export const teamById = (id: string) => TEAMS.find(t => t.id === id);
