import { Selector } from 'testcafe';

/* global fixture, test */

function url(x = '') {
  return process.env.BASE_URL + x;
}

fixture('yrv (dsl)')
  .page(url());

test('it just loads!', async t => {
  await t.expect(Selector('h1').withText('Example page').visible).ok();
});

test('it would mount Route-less content', async t => {
  await t.expect(Selector('p[data-test=routeless]').visible).ok();
});

test('it should mount from slot-content nodes', async t => {
  await t.click(Selector('a').withText('Test page'));
  await t.expect(Selector('h2').withText('Testing features').visible).ok();
});

fixture('yrv (fallback)')
  .page(url('/e'));

test('should not mount any fallback et all', async t => {
  await t.expect(Selector('h2[data-test=fallback]').exists).notOk();
});

test.page(url('/e/im_not_exists'))('should handle non-matched routes as fallback', async t => {
  await t.expect(Selector('h2').withText('NOT FOUND').visible).ok();
});

fixture('yrv (params)')
  .page(url('/test'));

test('it should mount from component-based nodes', async t => {
  await t.click(Selector('a').withText('Test props'));
  await t.expect(Selector('h3').withText('Injected parameters').visible).ok();
});

fixture('yrv (nested params)')
  .page(url('/test/props/Hello%20World'));

test('it should inject params from resolved routes', async t => {
  await t.expect(Selector('p').withText('Value: Hello World').visible).ok();
});

fixture('yrv (anchored routes)')
  .page(url('/sub'));

test('it should inject params from resolved routes', async t => {
  await t.click(Selector('a').withText('Root'));
  await t.expect(Selector('p[data-test=anchored]').innerText).contains('HOME');
  await t.expect(Selector('p[data-test=anchored]').innerText).notContains('ABOUT');
});

test('it should skip non-exact routes from matched ones', async t => {
  await t.click(Selector('a').withText('About page'));
  await t.expect(Selector('p[data-test=anchored]').innerText).contains('ABOUT');
  await t.expect(Selector('p[data-test=anchored]').innerText).notContains('HOME');
});

test('it should handle non-matched routes as fallback', async t => {
  await t.click(Selector('a').withText('Broken anchor'));
  await t.expect(Selector('h2[data-test=fallback]').exists).notOk();
  await t.expect(Selector('fieldset').innerText).contains("Unreachable '/sub#broken'");
});

// FIXME: redirections
// FIXME: conditions
// FIXME: query-params
// FIXME: buttons