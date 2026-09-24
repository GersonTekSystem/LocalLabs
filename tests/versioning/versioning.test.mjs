import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync, chmodSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import YAML from 'yaml';

const shared = process.env.SHARED_REPO;
assert.ok(shared, 'Defina SHARED_REPO com o caminho do clone .github');
const script = (...paths) => resolve(shared, 'scripts/versioning', ...paths);
const bashPath = (value) => process.platform === 'win32'
  ? value.replace(/\\/g, '/').replace(/^([A-Za-z]):/, (_, drive) => `/${drive.toLowerCase()}`)
  : value;
const run = (bin, args, cwd, env = {}) => spawnSync(bin, args, {
  cwd, encoding: 'utf8', env: { ...process.env, ...env }
});

const fixture = (t) => {
  const root = mkdtempSync(join(process.env.SPEC_TEST_TMP_DIR || tmpdir(), 'sprint-version-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const git = (...args) => {
    const result = run('git', args, root);
    assert.equal(result.status, 0, result.stderr);
    return result.stdout.trim();
  };
  git('init', '-b', 'main');
  writeFileSync(join(root, 'package.json'), JSON.stringify({ name: '@labs/demo', version: '1.0.0' }));
  git('add', '.');
  git('-c', 'user.name=Lab', '-c', 'user.email=lab@example.invalid', 'commit', '-m', 'chore: initial');
  git('tag', 'v1.0.0');
  const initial = git('rev-parse', 'HEAD');
  git('update-ref', 'refs/remotes/origin/release/v1.0.0', initial);
  writeFileSync(join(root, 'CHANGELOG.md'), 'Nova entrega aprovada');
  writeFileSync(join(root, 'package.json'), JSON.stringify({ name: '@labs/demo', version: '1.1.0' }));
  git('add', '.');
  git('-c', 'user.name=Lab', '-c', 'user.email=lab@example.invalid', 'commit', '-m', 'feat: add sprint support');
  const sha = git('rev-parse', 'HEAD');
  const statePath = join(root, 'mock-state.json');
  writeFileSync(statePath, JSON.stringify({ repo: 'GersonTekSystem/LocalLabs', sha }));
  const bin = join(root, 'bin');
  mkdirSync(bin);
  const gh = join(bin, 'gh');
  writeFileSync(gh, `#!/usr/bin/env bash\nexec node "${resolve('tests/versioning/mock-gh.mjs').replace(/\\/g, '/')}" "$@"\n`);
  chmodSync(gh, 0o755);
  const env = {
    PATH: `${bashPath(bin)}:${process.env.PATH}`,
    GITHUB_WORKSPACE: bashPath(root),
    GITHUB_REPOSITORY: 'GersonTekSystem/LocalLabs',
    GITHUB_SHA: sha,
    GITHUB_EVENT_NAME: 'push',
    GITHUB_REF_NAME: 'main',
    TARGET_BRANCH: 'main',
    RELEASE_BRANCH: 'release/v1.0.0',
    ADAPTER: 'standard-version',
    PROJECT_PATH: '.',
    RUNNER_TEMP: bashPath(root),
    MOCK_STATE: statePath
  };
  const adapter = join(root, 'node_modules', '.bin');
  mkdirSync(adapter, { recursive: true });
  writeFileSync(join(adapter, 'standard-version'), '#!/usr/bin/env bash\nprintf "bumping version in package.json from 1.0.0 to 1.1.0\\n"\n');
  chmodSync(join(adapter, 'standard-version'), 0o755);
  return { root, git, sha, statePath, env };
};

test('a prévia calcula o incremento sem criar tag ou release', t => {
  const { root, git, sha, statePath, env } = fixture(t);
  const event = join(root, 'event.json');
  writeFileSync(event, JSON.stringify({ pull_request: {
    number: 7, base: { ref: 'release/v1.0.0' }, head: { sha }, body: 'Refs #2'
  } }));
  const output = join(root, 'outputs.txt');
  const result = run('bash', [bashPath(script('preview.sh'))], root,
    { ...env, GITHUB_EVENT_PATH: bashPath(event), GITHUB_OUTPUT: bashPath(output) });
  assert.equal(result.status, 0, result.stderr);
  assert.match(readFileSync(output, 'utf8'), /candidate_version=1\.1\.0/);
  assert.deepEqual(git('tag', '--list'), 'v1.0.0');
  assert.equal(JSON.parse(readFileSync(statePath, 'utf8')).releaseUrl, undefined);
});

test('release aprovada é idempotente em dez reexecuções', t => {
  const { root, git, sha, statePath, env } = fixture(t);
  for (let i = 0; i < 11; i++) {
    const result = run('bash', [bashPath(script('publish.sh'))], root, env);
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Release (publicada|já publicada)/);
  }
  const state = JSON.parse(readFileSync(statePath, 'utf8'));
  assert.equal(state.tagSha, sha);
  assert.equal(state.releaseCreates, 1);
  assert.deepEqual(git('tag', '--list'), 'v1.0.0');
});

test('tag divergente não é movida e não publica release', t => {
  const { root, statePath, env } = fixture(t);
  writeFileSync(statePath, JSON.stringify({ repo: env.GITHUB_REPOSITORY, sha: env.GITHUB_SHA,
    tagSha: '1'.repeat(40) }));
  const result = run('bash', [bashPath(script('publish.sh'))], root, env);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Conflito/);
  const state = JSON.parse(readFileSync(statePath, 'utf8'));
  assert.equal(state.tagSha, '1'.repeat(40));
  assert.equal(state.releaseCreates, undefined);
});

test('tag íntegra sem release é recuperada sem mover tag', t => {
  const { root, statePath, env } = fixture(t);
  writeFileSync(statePath, JSON.stringify({ repo: env.GITHUB_REPOSITORY, sha: env.GITHUB_SHA,
    tagSha: env.GITHUB_SHA }));
  const result = run('bash', [bashPath(script('publish.sh'))], root, env);
  assert.equal(result.status, 0, result.stderr);
  const state = JSON.parse(readFileSync(statePath, 'utf8'));
  assert.equal(state.tagSha, env.GITHUB_SHA);
  assert.equal(state.releaseCreates, 1);
});

test('milestone aberta e review pendente impedem publicação', t => {
  const { root, statePath, env } = fixture(t);
  for (const override of [{ milestoneState: 'open' }, { reviewDecision: 'REVIEW_REQUIRED' },
    { homologation: 'Homologação: pendente' }]) {
    writeFileSync(statePath, JSON.stringify({ repo: env.GITHUB_REPOSITORY, sha: env.GITHUB_SHA,
      ...override }));
    const result = run('bash', [bashPath(script('publish.sh'))], root, env);
    assert.notEqual(result.status, 0);
    assert.equal(JSON.parse(readFileSync(statePath, 'utf8')).tagSha, undefined);
  }
});

test('PR sem issue e publicação antes do merge falham fechados', t => {
  const { root, sha, env } = fixture(t);
  const event = join(root, 'event.json');
  writeFileSync(event, JSON.stringify({ pull_request: {
    number: 7, base: { ref: 'release/v1.0.0' }, head: { sha }, body: 'Sem vínculo'
  } }));
  const preview = run('bash', [bashPath(script('preview.sh'))], root,
    { ...env, GITHUB_EVENT_PATH: bashPath(event) });
  assert.notEqual(preview.status, 0);
  const publish = run('bash', [bashPath(script('publish.sh'))], root,
    { ...env, GITHUB_EVENT_NAME: 'pull_request' });
  assert.notEqual(publish.status, 0);
});

test('contratos do workflow têm permissões separadas e refs estáveis', () => {
  const sharedPreview = YAML.parse(readFileSync(resolve(shared, '.github/workflows/version-preview.yml'), 'utf8'));
  const sharedPublish = YAML.parse(readFileSync(resolve(shared, '.github/workflows/version-publish.yml'), 'utf8'));
  const caller = YAML.parse(readFileSync(resolve('tests/versioning/fixtures/caller.yml'), 'utf8'));
  assert.equal(sharedPreview.jobs.preview.permissions.contents, 'read');
  assert.equal(sharedPublish.jobs.publish.permissions.contents, 'write');
  assert.ok(sharedPreview.on.workflow_call.inputs.adapter);
  assert.ok(sharedPublish.on.workflow_call.inputs.homologation_environment);
  assert.match(caller.jobs.preview.uses, /@v1$/);
});

test('versão menor não ultrapassa tag MAJOR anterior', () => {
  const result = run('node', [script('version.mjs'), 'compare', 'v2.0.0', '1.9.0'], process.cwd());
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, 'none');
});

test('prévia dos quatro perfis preserva o repositório sem publicar', t => {
  const { root, sha, statePath, env, git } = fixture(t);
  const event = join(root, 'event.json');
  writeFileSync(event, JSON.stringify({ pull_request: {
    number: 7, base: { ref: 'release/v1.0.0' }, head: { sha }, body: 'Refs #2'
  } }));
  mkdirSync(join(root, '.changeset'));
  writeFileSync(join(root, '.changeset', 'config.json'), '{}');
  writeFileSync(join(root, 'node_modules', '.bin', 'changeset'),
    '#!/usr/bin/env bash\nprintf \'{"releases":[{"name":"@labs/demo","newVersion":"1.1.0","type":"minor"}]}\' > "$3"\n');
  chmodSync(join(root, 'node_modules', '.bin', 'changeset'), 0o755);
  mkdirSync(join(root, '.mvn'));
  writeFileSync(join(root, '.mvn', 'extensions.xml'), '<extension>jgitver</extension>');
  writeFileSync(join(root, 'pom.xml'), '<project><version>1.1.0</version></project>');
  writeFileSync(join(root, 'mvnw'), '#!/usr/bin/env bash\nprintf 1.1.0\n');
  chmodSync(join(root, 'mvnw'), 0o755);
  writeFileSync(join(root, 'bin', 'go-gitsemver'), '#!/usr/bin/env bash\nprintf 1.1.0\n');
  chmodSync(join(root, 'bin', 'go-gitsemver'), 0o755);
  for (const adapter of ['standard-version', 'changesets', 'jgitver', 'go-gitsemver']) {
    const output = join(root, `${adapter}.out`);
    const result = run('bash', [bashPath(script('preview.sh'))], root,
      { ...env, ADAPTER: adapter, GITHUB_EVENT_PATH: bashPath(event), GITHUB_OUTPUT: bashPath(output) });
    assert.equal(result.status, 0, `${adapter}: ${result.stderr}`);
    assert.match(readFileSync(output, 'utf8'), /candidate_version=1\.1\.0/, adapter);
  }
  assert.equal(git('tag', '--list'), 'v1.0.0');
  assert.equal(JSON.parse(readFileSync(statePath, 'utf8')).releaseUrl, undefined);
});

test('duas publicações concorrentes criam no máximo uma release', async t => {
  const { root, statePath, env } = fixture(t);
  const launch = () => new Promise(resolve => {
    const child = spawn('bash', [bashPath(script('publish.sh'))], {
      cwd: root, env: { ...process.env, ...env }
    });
    let stderr = '';
    child.stderr.on('data', chunk => { stderr += chunk; });
    child.on('close', status => resolve({ status, stderr }));
  });
  const outcomes = await Promise.all([launch(), launch()]);
  assert.deepEqual(outcomes.map(item => item.status), [0, 0], JSON.stringify(outcomes));
  const state = JSON.parse(readFileSync(statePath, 'utf8'));
  assert.equal(state.releaseCreates, 1);
  assert.equal(state.tagSha, env.GITHUB_SHA);
});
