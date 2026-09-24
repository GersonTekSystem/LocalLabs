import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { test } from 'node:test';
import YAML from 'yaml';

const shared = process.env.SHARED_REPO;
assert.ok(shared, 'Configure SHARED_REPO com o checkout .github a validar');

const run = (file, args = []) => spawnSync(process.execPath,
  [resolve(shared, 'tests/versioning', file), ...args], { encoding: 'utf8' });

test('feature, release, integração e rejeições produzem check sem SemVer obrigatório', () => {
  const result = run('pr-check.mjs');
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /feature\/release\/integração/);
});

for (const adapter of ['standard-version', 'changesets']) {
  test(`${adapter} prepara PR pós-merge e reconcilia tag no commit versionado`, () => {
    const result = run('post-merge.mjs', adapter === 'changesets' ? ['--changesets'] : []);
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /no SHA versionado/);
  });
}

test('ferramentas Node reais versionam depois de várias entregas sem commit ou tag próprios', () => {
  for (const file of ['real-standard-version.mjs', 'real-changesets.mjs']) {
    const result = run(file);
    assert.equal(result.status, 0, `${file}: ${result.stderr}`);
  }
});

test('contrato compartilhado mantém check somente leitura e escrita isolada', () => {
  const preview = YAML.parse(readFileSync(resolve(shared, '.github/workflows/version-preview.yml'), 'utf8'));
  const publish = YAML.parse(readFileSync(resolve(shared, '.github/workflows/version-publish.yml'), 'utf8'));
  assert.equal(preview.jobs.preview.permissions.contents, 'read');
  assert.equal(preview.on.workflow_call.inputs.target_branch.required, true);
  assert.equal(preview.on.workflow_call.outputs.phase.value, '${{ jobs.preview.outputs.phase }}');
  assert.equal(publish.jobs.publish.permissions.contents, 'write');
  assert.equal(publish.on.workflow_call.secrets.versioning_token.required, false);
  assert.equal(publish.jobs.publish.concurrency['cancel-in-progress'], false);
});
