import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isSafeUrl, isPlaceholder } from '../../js/lib/url.js';

test('isSafeUrl: https va mailto ruxsat etiladi', () => {
  assert.equal(isSafeUrl('https://t.me/xolmirzayev_v'), true);
  assert.equal(isSafeUrl('mailto:test@example.com'), true);
});

test('isSafeUrl: xavfli yoki noto\'g\'ri qiymatlar rad etiladi', () => {
  assert.equal(isSafeUrl('javascript:alert(1)'), false);
  assert.equal(isSafeUrl(' JavaScript:alert(1)'), false);
  assert.equal(isSafeUrl('http://example.com'), false);
  assert.equal(isSafeUrl('data:text/html,hi'), false);
  assert.equal(isSafeUrl(''), false);
  assert.equal(isSafeUrl(null), false);
  assert.equal(isSafeUrl(42), false);
  assert.equal(isSafeUrl('not a url'), false);
});

test('isPlaceholder: TODO bilan boshlangan va bo\'sh qiymatlar', () => {
  assert.equal(isPlaceholder('TODO'), true);
  assert.equal(isPlaceholder('TODO_EMAIL'), true);
  assert.equal(isPlaceholder('  todo: matn'), true);
  assert.equal(isPlaceholder(''), true);
  assert.equal(isPlaceholder(null), true);
  assert.equal(isPlaceholder(undefined), true);
  assert.equal(isPlaceholder('Kitoblar haqida kanal'), false);
});
