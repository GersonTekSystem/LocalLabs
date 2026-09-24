import { openSync, closeSync, readFileSync, writeFileSync } from 'node:fs';

const statePath = process.env.MOCK_STATE;
const state = JSON.parse(readFileSync(statePath, 'utf8'));
const [command, ...args] = process.argv.slice(2);
const path = args.find(arg => !arg.startsWith('-')) ?? '';
const method = args[0] === '-X' ? args[1] : args.includes('-X') ? args[args.indexOf('-X') + 1] : 'GET';
const route = args.find(arg => arg.startsWith('repos/')) ?? path;
const fields = Object.fromEntries(args.filter(arg => arg.startsWith('ref=') || arg.startsWith('sha=') || arg.startsWith('tag_name='))
  .map(arg => [arg.slice(0, arg.indexOf('=')), arg.slice(arg.indexOf('=') + 1)]));
const respond = (value) => process.stdout.write(`${JSON.stringify(value)}\n`);

if (command === 'pr') {
  process.stdout.write(`${state.reviewDecision ?? 'APPROVED'}\n`);
} else if (route.endsWith('/git/refs') && method === 'POST') {
  if (state.tagSha) process.exitCode = 1;
  else try {
    closeSync(openSync(`${statePath}.tag-created`, 'wx'));
    const fresh = JSON.parse(readFileSync(statePath, 'utf8'));
    fresh.tagSha = fields.sha;
    fresh.tagName = fields.ref.replace('refs/tags/', '');
    writeFileSync(statePath, JSON.stringify(fresh));
    respond({ object: { type: 'commit', sha: fresh.tagSha } });
  } catch {
    process.exitCode = 1;
  }
} else if (route.includes('/git/ref/tags/')) {
  if (!state.tagSha) process.exitCode = 1;
  else respond({ object: { type: 'commit', sha: state.tagSha } });
} else if (route.endsWith('/releases') && method === 'POST') {
  try {
    closeSync(openSync(`${statePath}.release-created`, 'wx'));
    const fresh = JSON.parse(readFileSync(statePath, 'utf8'));
    fresh.releaseUrl = `https://github.com/${fresh.repo}/releases/tag/${fields.tag_name}`;
    fresh.releaseCreates = (fresh.releaseCreates ?? 0) + 1;
    writeFileSync(statePath, JSON.stringify(fresh));
    respond({ html_url: fresh.releaseUrl });
  } catch {
    process.exitCode = 1;
  }
} else if (route.includes('/releases/tags/')) {
  if (!state.releaseUrl) process.exitCode = 1;
  else respond({ html_url: state.releaseUrl });
} else if (route.endsWith('/milestones')) {
  respond([{ number: 1, title: state.milestone ?? 'v1.0.0',
    state: state.milestoneState ?? 'closed', open_issues: state.openIssues ?? 0 }]);
} else if (route.endsWith('/issues')) {
  respond([{ number: 1, title: 'v1.0.0', state: 'closed' }]);
} else if (route.endsWith('/pulls')) {
  respond([{ number: 4, merged_at: '2026-09-23', merge_commit_sha: state.sha,
    base: { ref: 'main' }, head: { ref: 'develop' } }]);
} else if (route.includes('/pulls/4')) {
  const body = state.homologation ?? 'Homologação: aprovada';
  if (args.includes('--jq')) process.stdout.write(`${body}\n`);
  else respond({ body });
} else if (route.includes('/issues/2')) {
  if (args.includes('--jq')) {
    const expr = args[args.indexOf('--jq') + 1];
    process.stdout.write(expr.includes('parent_issue_url')
      ? `https://api.github.com/repos/${state.repo}/issues/1\n` : 'v1.0.0\n');
  } else respond({ milestone: { title: 'v1.0.0' },
    parent_issue_url: `https://api.github.com/repos/${state.repo}/issues/1` });
} else if (route.includes('/issues/1')) {
  if (args.includes('--jq')) process.stdout.write('v1.0.0\n');
  else respond({ title: 'v1.0.0', state: 'open' });
} else if (route === `repos/${state.repo}`) {
  if (args.includes('--jq')) process.stdout.write('main\n');
  else respond({ default_branch: 'main' });
} else {
  console.error(`Rota GitHub inesperada: ${command} ${args.join(' ')}`);
  process.exitCode = 1;
}
