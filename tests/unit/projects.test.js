import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  extractBotUrl,
  filterRepos,
  sortRepos,
  mapRepo,
  collectLanguages,
} from '../../js/lib/projects.js';

const repo = (overrides = {}) => ({
  name: 'demo',
  description: 'Demo loyiha',
  html_url: 'https://github.com/valililloh/demo',
  homepage: '',
  language: 'Python',
  topics: [],
  fork: false,
  archived: false,
  stargazers_count: 0,
  pushed_at: '2026-01-01T00:00:00Z',
  ...overrides,
});

test('extractBotUrl: homepage dagi t.me havola', () => {
  assert.equal(extractBotUrl(repo({ homepage: 'https://t.me/demo_bot' })), 'https://t.me/demo_bot');
});

test('extractBotUrl: tavsifdagi t.me havola', () => {
  assert.equal(
    extractBotUrl(repo({ description: 'Bot: https://t.me/kitob_bot ishlaydi' })),
    'https://t.me/kitob_bot',
  );
});

test('extractBotUrl: tavsifdagi @...bot username', () => {
  assert.equal(extractBotUrl(repo({ description: 'Telegram: @Ob_Havo_Bot' })), 'https://t.me/Ob_Havo_Bot');
});

test('extractBotUrl: bot yo\'q yoki tavsif null', () => {
  assert.equal(extractBotUrl(repo()), null);
  assert.equal(extractBotUrl(repo({ description: null, homepage: null })), null);
  assert.equal(extractBotUrl(repo({ description: 'email @valililloh' })), null);
});

test('filterRepos: fork va noto\'g\'ri elementlar chiqariladi', () => {
  const result = filterRepos([repo(), repo({ name: 'f', fork: true }), null, { foo: 1 }]);
  assert.deepEqual(result.map((r) => r.name), ['demo']);
});

test('filterRepos: massiv bo\'lmasa bo\'sh massiv', () => {
  assert.deepEqual(filterRepos(undefined), []);
  assert.deepEqual(filterRepos({ message: 'rate limit' }), []);
});

test('sortRepos: yangi push qilinganlar oldinda, asl massiv o\'zgarmaydi', () => {
  const input = [
    repo({ name: 'old', pushed_at: '2025-01-01T00:00:00Z' }),
    repo({ name: 'new', pushed_at: '2026-05-01T00:00:00Z' }),
  ];
  const sorted = sortRepos(input);
  assert.deepEqual(sorted.map((r) => r.name), ['new', 'old']);
  assert.deepEqual(input.map((r) => r.name), ['old', 'new']);
});

test('mapRepo: kerakli maydonlar va bot havolasi', () => {
  const mapped = mapRepo(
    repo({ homepage: 'https://t.me/demo_bot', topics: ['telegram-bot'], stargazers_count: 3 }),
  );
  assert.deepEqual(mapped, {
    name: 'demo',
    description: 'Demo loyiha',
    url: 'https://github.com/valililloh/demo',
    homepage: null,
    bot: 'https://t.me/demo_bot',
    language: 'Python',
    topics: ['telegram-bot'],
    stars: 3,
    archived: false,
  });
});

test('mapRepo: t.me bo\'lmagan homepage sayt sifatida qoladi, null tavsif', () => {
  const mapped = mapRepo(repo({ description: null, homepage: 'https://demo.uz', language: null }));
  assert.equal(mapped.description, null);
  assert.equal(mapped.homepage, 'https://demo.uz');
  assert.equal(mapped.bot, null);
  assert.equal(mapped.language, null);
});

test('mapRepo: xavfli homepage tashlab yuboriladi', () => {
  assert.equal(mapRepo(repo({ homepage: 'javascript:alert(1)' })).homepage, null);
});

test('collectLanguages: ko\'p ishlatilgani oldinda, null hisobga olinmaydi', () => {
  const langs = collectLanguages([
    { language: 'Python' },
    { language: 'JavaScript' },
    { language: 'Python' },
    { language: null },
  ]);
  assert.deepEqual(langs, ['Python', 'JavaScript']);
});
