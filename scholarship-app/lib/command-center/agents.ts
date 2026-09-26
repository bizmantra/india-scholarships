/**
 * The agents the command center knows about, described as data.
 * To plug in a new agent: add an entry here (and its GitHub Actions workflow with a `target` and
 * `request_id` input). Its runs, proposals and activity then show up in the command center.
 */

export interface AgentDefinition {
    id: string;                 // matches `agent` in agent_proposals / agent_events / agent_settings
    label: string;
    summary: string;            // what it does, in one sentence
    workflow?: string;          // GitHub Actions workflow file; absent = cannot be started from chat
    schedule: string;
    humanToday: string;         // what a person would have to do without the agent
    gated: boolean;             // true = its changes wait for the owner's approval
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
        order: 1,
    },
    {
        id: 'weekly-enrichment',
        label: 'Weekly Enrichment',
        summary: 'Refreshes selection, renewal, steps and FAQs, and proposes changes to amounts, links and helplines.',
        workflow: 'weekly-enrichment.yml',
        schedule: 'Sunday, 5:30 AM IST',
        humanToday: 'Re-read each scholarship guideline and rewrite the details that changed.',
        gated: true,
        order: 2,
        dependsOn: ['deadline-freshness'],
    },
    {
        id: 'scholarship-scout',
        label: 'Scholarship Scout',
        summary: 'Finds scholarships that are not on the site yet, from search demand, portals, CSR sites, news and coverage gaps.',
        workflow: 'scholarship-scout.yml',
        schedule: 'Wednesday, 8:45 AM IST',
        humanToday: 'Search portals, news and competitor sites for new schemes and research each one.',
        gated: true,
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
        order: 4,
        dependsOn: ['scholarship-scout'],
    },
    {
        id: 'database-backup',
        label: 'Database Backup',
        summary: 'Backs up the production database every morning (kept 30 days).',
        schedule: 'Daily',
        humanToday: 'Export the database by hand.',
        gated: false,
        order: 5,
    },
];

export const agentById = (id: string) => AGENTS.find(a => a.id === id);
export const agentLabel = (id: string) => agentById(id)?.label || (id === 'command-center' ? 'Command Center' : id);
