import { beforeEach, afterEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { setup, click } from './helpers.mjs';
import { DatePicker, parseDate } from '../dist/index.js';
let ui;
beforeEach(async () => (ui = await setup()));
afterEach(async () => ui.cleanup());
test('calendar rejects impossible dates and bounded range cannot cross disabled days', async () => {
  assert.throws(() => parseDate('2024-02-30'));
  assert.throws(() => parseDate('1800-01-01'));
  const values = [];
  await ui.render(
    createElement(DatePicker, {
      mode: 'range',
      initialMonth: '2024-05',
      disabledDate: (date) => date === '2024-05-11',
      onChange: (value) => values.push(value),
    }),
  );
  const day = (number) =>
    [...ui.container.querySelectorAll('button')].find((button) =>
      button.getAttribute('aria-label')?.includes('May ' + number + ', 2024'),
    );
  await click(day(10));
  await click(day(12));
  assert.match(ui.container.querySelector('[role="alert"]').textContent, /disabled/);
  assert.deepEqual(values.at(-1), ['2024-05-10', null]);
});
