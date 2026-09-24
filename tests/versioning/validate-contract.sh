#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."
node --input-type=module <<'JS'
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import YAML from 'yaml';

const paths = [
  'tests/versioning/fixtures/caller.yml',
  process.env.SHARED_REPO + '/.github/workflows/version-preview.yml',
  process.env.SHARED_REPO + '/.github/workflows/version-publish.yml'
];
assert.ok(process.env.SHARED_REPO, 'SHARED_REPO deve apontar para o clone .github');
for (const path of paths) {
  const doc = YAML.parseDocument(readFileSync(path, 'utf8'), { uniqueKeys: true });
  assert.equal(doc.errors.length, 0, `${path}: ${doc.errors}`);
  const workflow = doc.toJS();
  assert.ok(workflow.on, `${path}: gatilho ausente`);
  assert.ok(workflow.jobs, `${path}: jobs ausentes`);
}
const preview = YAML.parse(readFileSync(paths[1], 'utf8'));
const publish = YAML.parse(readFileSync(paths[2], 'utf8'));
const caller = YAML.parse(readFileSync(paths[0], 'utf8'));
assert.ok(preview.on.workflow_call);
assert.ok(publish.on.workflow_call);
assert.equal(preview.jobs.preview.permissions.contents, 'read');
assert.equal(publish.jobs.publish.permissions.contents, 'write');
assert.match(caller.jobs.preview.uses, /@v1$/);
assert.equal(caller.jobs.publish.concurrency['cancel-in-progress'], false);
console.log('YAML e contratos dos workflows: OK');
JS
