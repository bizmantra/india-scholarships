/**
 * The agents the command center knows about, described as data.
 * To plug in a new agent: add an entry here (and its GitHub Actions workflow with a `target` and
 * `request_id` input). Its runs, proposals and activity then show up in the command center.
 */

import type { TeamId } from './teams';

export interface AgentDefinition {
    id: string;                 // matches `agent` in agent_proposals / agent_events / agent_settings
    label: string;
    summary: string;            // what it does, in one sentence
    workflow?: string;          // GitHub Actions workflow file; absent = cannot be started from chat
    schedule: string;
    humanToday: string;         // what a person would have to do without the agent
    gated: boolean;             // true = its changes wait for the owner's approval
    team?: TeamId;              // which team's page it appears on; absent = no team (e.g. the morning briefing)
    acceptsState?: boolean;     // workflow has a `state` input
    order: number;
    dependsOn?: string[];
}

export const AGENTS: AgentDefinition[] = [
    {
        id: 'deadline-freshness',
        label: 'Deadline Freshness',
        summary: 'Checks the official deadline of up to 30 scholarships whose dates are near or that get the most traffic.',
        workflow: 'daily-freshness-check.yml',
        schedule: 'Daily, 7:00 AM IST',
        humanToday: 'Open each official portal, find the current last date and compare it with the site.',
        gated: true,
        team: 'data-accuracy',
        order: 1,
    },
    {
        id: 'fact-check',
        label: 'Fact Check',
        summary: 'Re-checks amount, income limit and apply link on complete pages (pages losing search clicks first, then most visited), with the official source and exact sentence for every finding.',
        workflow: 'fact-check.yml',
        schedule: 'Sunday, 9:00 AM IST',
        humanToday: 'Re-read each scheme\'s official notice and compare the amounts and links with the site.',
        gated: true,
        team: 'data-accuracy',
        order: 2,
        dependsOn: ['traffic-watchdog'],
    },
    {
        id: 'weekly-enrichment',
        label: 'Weekly Maintenance',
        summary: 'Refreshes Google search data, runs the content audit and format clean-up, and posts new scholarships to Telegram. (Its old AI rewriting step was removed.)',
        workflow: 'weekly-enrichment.yml',
        schedule: 'Sunday, 5:30 AM IST',
        humanToday: 'Download Search Console data and run the audit by hand.',
        gated: false,
        team: 'data-accuracy',
        order: 2,
    },
    {
        id: 'scholarship-scout',
        label: 'Scholarship Scout',
        summary: 'Finds scholarships that are not on the site yet, from search demand, portals, CSR sites, news and coverage gaps.',
        workflow: 'scholarship-scout.yml',
        schedule: 'Wednesday, 8:45 AM IST',
        humanToday: 'Search portals, news and competitor sites for new schemes and research each one.',
        gated: true,
        team: 'content-research',
        acceptsState: true,
        order: 3,
    },
    {
        id: 'scout-publisher',
        label: 'Scout Publisher',
        summary: 'Publishes the new scholarships you approved and announces them on Telegram.',
        workflow: 'publish-scout-approved.yml',
        schedule: 'Daily, 10:00 AM IST, and after approvals',
        humanToday: 'Copy each approved scholarship into the database, check its format and post it.',
        gated: false,
        team: 'content-creation',
        order: 4,
        dependsOn: ['scholarship-scout'],
    },
    {
        id: 'quality-fixer',
        label: 'Quality Fixer',
        summary: 'Works through pages that fail the quality audit: tidies formatting itself, researches missing documents, helplines, amounts, links and outdated deadlines, and sends them to your inbox ("Missing or outdated details").',
        workflow: 'quality-fixer.yml',
        schedule: 'Saturday, 9:00 AM IST',
        humanToday: 'Open the audit report, research each incomplete page on official sites and edit it by hand.',
        gated: true,
        team: 'data-accuracy',
        order: 5,
    },
    {
        id: 'traffic-watchdog',
        label: 'Traffic Watchdog',
        summary: 'Compares last week with the week before (Google search clicks, visits), lists pages losing or gaining search traffic, and checks that key pages load.',
        workflow: 'traffic-watchdog.yml',
        schedule: 'Daily, 7:30 AM IST',
        humanToday: 'Open Search Console and Analytics every day and compare weeks by hand.',
        gated: false,
        team: 'traffic',
        order: 6,
    },
    {
        id: 'indexing',
        label: 'Indexing',
        summary: 'Sends pages that changed today to IndexNow (Yandex and Bing, separately), re-submits the sitemap to Google, and checks with Google that key pages are indexed.',
        workflow: 'indexing-agent.yml',
        schedule: 'Daily, 9:00 PM IST',
        humanToday: 'Submit changed pages in Bing and Search Console and inspect pages one by one.',
        gated: false,
        team: 'traffic',
        order: 7,
    },
    {
        id: 'morning-briefing',
        label: 'Morning Briefing',
        summary: 'Sums up what needs you, what the agents did, deadlines closing this week and pages still open after their deadline.',
        workflow: 'morning-briefing.yml',
        schedule: 'Daily, 8:00 AM IST (email + Agent Center)',
        humanToday: 'Open the inbox, GitHub and the site every morning to piece together what happened.',
        gated: false,
        order: 8,
        dependsOn: ['deadline-freshness', 'scholarship-scout', 'traffic-watchdog'],
    },
    {
        id: 'database-backup',
        label: 'Database Backup',
        summary: 'Backs up the production database every morning (kept 30 days).',
        schedule: 'Daily',
        humanToday: 'Export the database by hand.',
        gated: false,
        team: 'data-accuracy',
        order: 9,
    },
];

export const teamOf = (agentId: string): TeamId | undefined => agentById(agentId)?.team;
export const agentsOfTeam = (team: string) => AGENTS.filter(a => a.team === team);
export const agentById = (id: string) => AGENTS.find(a => a.id === id);
export const agentLabel = (id: string) => agentById(id)?.label || (id === 'command-center' ? 'Agent Center' : id);
