import test from 'node:test';
import assert from 'node:assert/strict';
import { AgentRuleError, checkAgentUpdate, isAgentName } from './backlog-agent-rules.ts';

const item = (over: Record<string, unknown> = {}) => ({ id: 'IS-4', assignee: 'Claude', status: 'Ready', link: null, ...over }) as Parameters<typeof checkAgentUpdate>[0];
const denied = (fn: () => void, status: number) => assert.throws(fn, (e: unknown) => e instanceof AgentRuleError && e.status === status);

test('an agent can start its own Ready item', () => {
    assert.doesNotThrow(() => checkAgentUpdate(item(), 'Claude', { status: 'In Progress' }));
});

test('an agent cannot touch an item assigned to someone else or to nobody', () => {
    denied(() => checkAgentUpdate(item({ assignee: 'Antigravity' }), 'Claude', { status: 'In Progress' }), 403);
    denied(() => checkAgentUpdate(item({ assignee: null }), 'Claude', { note: 'x' }), 403);
});

test('an agent can move In Progress to Review only with a link', () => {
    denied(() => checkAgentUpdate(item({ status: 'In Progress' }), 'Claude', { status: 'Review' }), 400);
    assert.doesNotThrow(() => checkAgentUpdate(item({ status: 'In Progress' }), 'Claude', { status: 'Review', link: 'plans/x.md' }));
    assert.doesNotThrow(() => checkAgentUpdate(item({ status: 'In Progress', link: 'https://example.com/pr/1' }), 'Claude', { status: 'Review' }));
});

test('an agent never sets Done, Parked or Backlog, and cannot skip steps', () => {
    for (const to of ['Done', 'Parked', 'Backlog']) denied(() => checkAgentUpdate(item({ status: 'In Progress' }), 'Claude', { status: to }), 403);
    denied(() => checkAgentUpdate(item({ status: 'Ready' }), 'Claude', { status: 'Review', link: 'plans/x.md' }), 403);
    denied(() => checkAgentUpdate(item({ status: 'Review' }), 'Claude', { status: 'Done' }), 403);
});

test('an agent cannot work on items that are not Ready, In Progress or Review', () => {
    denied(() => checkAgentUpdate(item({ status: 'Backlog' }), 'Claude', { note: 'x' }), 403);
    denied(() => checkAgentUpdate(item({ status: 'Done' }), 'Claude', { note: 'x' }), 403);
});

test('notes and links can be edited on an item the agent already holds', () => {
    assert.doesNotThrow(() => checkAgentUpdate(item({ status: 'Review' }), 'Claude', { note: 'Waiting for the owner', link: 'plans/x.md' }));
});

test('only the three known agents are accepted', () => {
    assert.equal(isAgentName('Claude'), true);
    assert.equal(isAgentName('Owner'), false);
    assert.equal(isAgentName(undefined), false);
});
