/**
 * Starts agent workflows on GitHub Actions and reads their live progress.
 *
 * Needs GITHUB_ACTIONS_TOKEN: a fine-grained token for this repository only, with
 * Actions read/write and Contents read-only. Workflows put the `request_id` input in their run name,
 * which is how a run started here is found again.
 */
const REPO = process.env.GITHUB_REPOSITORY_SLUG || 'bizmantra/india-scholarships';
const API = `https://api.github.com/repos/${REPO}`;

export class GithubNotConfigured extends Error {}

async function gh(path: string, init: RequestInit = {}) {
    const token = process.env.GITHUB_ACTIONS_TOKEN;
    if (!token) throw new GithubNotConfigured('GITHUB_ACTIONS_TOKEN is not set in Vercel, so agents cannot be started from here.');
    const res = await fetch(`${API}${path}`, {
        ...init,
        cache: 'no-store',
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
            ...(init.headers || {}),
        },
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`GitHub said ${res.status}: ${text.slice(0, 200)}`);
    }
    return res.status === 204 ? null : res.json();
}

export async function dispatchWorkflow(workflow: string, inputs: Record<string, string>) {
    await gh(`/actions/workflows/${workflow}/dispatches`, {
        method: 'POST',
        body: JSON.stringify({ ref: process.env.GITHUB_DISPATCH_REF || 'main', inputs }),
    });
}

export interface RunStatus {
    found: boolean;
    runId?: number;
    url?: string;
    status?: string;        // queued | in_progress | completed | waiting
    conclusion?: string | null;
    title?: string;
    startedAt?: string;
    steps: { name: string; status: string; conclusion: string | null; seconds: number | null }[];
}

const seconds = (a?: string | null, b?: string | null) =>
    a ? Math.round(((b ? new Date(b) : new Date()).getTime() - new Date(a).getTime()) / 1000) : null;

// Runs appear a few seconds after dispatch; the caller keeps asking until found
export async function findRun(workflow: string, requestId: string): Promise<RunStatus> {
    const list = await gh(`/actions/workflows/${workflow}/runs?event=workflow_dispatch&per_page=20`);
    const run = (list?.workflow_runs || []).find((r: any) => String(r.display_title || r.name || '').includes(requestId));
    if (!run) return { found: false, steps: [] };

    const jobs = await gh(`/actions/runs/${run.id}/jobs`);
    const steps = (jobs?.jobs || []).flatMap((job: any) => (job.steps || [])
        .filter((s: any) => !/^(Set up job|Complete job|Post )/.test(s.name))
        .map((s: any) => ({ name: s.name, status: s.status, conclusion: s.conclusion, seconds: seconds(s.started_at, s.completed_at) })));
    return {
        found: true,
        runId: run.id,
        url: run.html_url,
        status: run.status,
        conclusion: run.conclusion,
        title: run.display_title,
        startedAt: run.run_started_at,
        steps,
    };
}

// Recent runs of the agent workflows (for "what did agents do today?")
export async function recentRuns(limit = 20) {
    const list = await gh(`/actions/runs?per_page=${limit}`);
    return (list?.workflow_runs || []).map((r: any) => ({
        workflow: String(r.path || '').split('/').pop(),
        title: r.display_title,
        status: r.status,
        conclusion: r.conclusion,
        event: r.event,
        startedAt: r.run_started_at,
        url: r.html_url,
    }));
}
