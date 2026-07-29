/**
 * Runnable check that the TypeScript status vocabularies match the database CHECK constraints.
 *
 *   npm run check
 *
 * Why this exists: these enums live in two places that no compiler connects. A value the
 * app emits but the constraint rejects fails at INSERT/UPDATE time, and both the API route
 * and the client swallow that error (`.catch(console.error)`), so the write is simply lost
 * with no user-visible signal. Enforcing `status: 'abandoned'` from the client made that
 * risk concrete, so the two sides are now compared mechanically.
 *
 * Parses supabase/schema.sql and src/types/index.ts as text — no database, no framework.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..');
const schemaSql = fs.readFileSync(path.join(root, 'supabase/schema.sql'), 'utf8');
const typesTs = fs.readFileSync(path.join(root, 'src/types/index.ts'), 'utf8');

/** Values of a `check (<column> in ('a','b'))` constraint inside a given table's definition. */
function checkConstraintValues(table: string, column: string): string[] {
  const table_ = new RegExp(`create table if not exists ${table}\\s*\\(([\\s\\S]*?)\\n\\);`, 'i');
  const body = schemaSql.match(table_)?.[1];
  assert.ok(body, `no CREATE TABLE found for "${table}"`);

  const check = body.match(new RegExp(`check\\s*\\(\\s*${column}\\s+in\\s*\\(([^)]*)\\)`, 'i'))?.[1];
  assert.ok(check, `no CHECK constraint found for ${table}.${column}`);

  return [...check.matchAll(/'([^']+)'/g)].map((m) => m[1]).sort();
}

/** Members of an exported string-literal union in src/types/index.ts. */
function unionMembers(typeName: string): string[] {
  const decl = typesTs.match(new RegExp(`export type ${typeName}\\s*=\\s*([^;]+);`))?.[1];
  assert.ok(decl, `no exported type "${typeName}" found`);

  return [...decl.matchAll(/'([^']+)'/g)].map((m) => m[1]).sort();
}

/** table.column in Postgres  <->  string-literal union in TypeScript */
const CONTRACTS: Array<[table: string, column: string, tsType: string]> = [
  ['conversations',         'status',     'ConversationStatus'],
  ['conversations',         'sentiment',  'ConversationSentiment'],
  ['conversations',         'source',     'ConversationSource'],
  ['conversation_messages', 'role',       'MessageRole'],
  ['appointments',          'status',     'AppointmentStatus'],
  ['leads',                 'status',     'LeadStatus'],
  ['services',              'price_type', 'PriceType'],
  ['embedded_widgets',      'position',   'WidgetPosition'],
];

let passed = 0;

console.log('\nschema <-> type contracts');

for (const [table, column, tsType] of CONTRACTS) {
  const db = checkConstraintValues(table, column);
  const ts = unionMembers(tsType);

  assert.deepEqual(
    ts,
    db,
    `${tsType} and ${table}.${column} disagree.\n` +
      `  TypeScript: ${ts.join(', ')}\n` +
      `  Postgres:   ${db.join(', ')}`
  );

  passed++;
  console.log(`  ✓ ${tsType} matches ${table}.${column} (${db.length} values)`);
}

console.log('\nvalues written by the runtime');

// Statuses the client asks the API to persist. 'abandoned' is written when the transport
// drops; it was a valid schema value that no code path had ever used before.
for (const status of ['completed', 'abandoned'] as const) {
  assert.ok(
    checkConstraintValues('conversations', 'status').includes(status),
    `the client writes conversations.status='${status}' but the CHECK constraint rejects it`
  );
  passed++;
  console.log(`  ✓ conversations.status='${status}' is accepted by the constraint`);
}

console.log(`\n${passed} checks passed\n`);
