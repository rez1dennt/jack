import test from 'node:test';
import assert from 'node:assert/strict';

import {
  normalizeRuPhone,
  formatRuPhone,
  isCompleteRuPhone,
  validateLeadValues
} from '../../public/assets/js/form.js';

test('normalizes Russian local, +7, and 8-prefixed phone input', () => {
  assert.equal(normalizeRuPhone('999 123-45-67'), '+79991234567');
  assert.equal(normalizeRuPhone('+7 (999) 123-45-67'), '+79991234567');
  assert.equal(normalizeRuPhone('8 999 123 45 67'), '+79991234567');
  assert.equal(normalizeRuPhone('+7 (999) 123-45-67 000'), '+79991234567');
});

test('formats progressively and allows complete deletion', () => {
  assert.equal(formatRuPhone(''), '');
  assert.equal(formatRuPhone('9'), '+7 (9');
  assert.equal(formatRuPhone('9991'), '+7 (999) 1');
  assert.equal(formatRuPhone('89991234567'), '+7 (999) 123-45-67');
  assert.equal(formatRuPhone('+'), '');
});

test('recognizes only a complete eleven-digit Russian phone', () => {
  assert.equal(isCompleteRuPhone('+7 (999) 123-45-67'), true);
  assert.equal(isCompleteRuPhone('+7 (999) 123-45'), false);
  assert.equal(isCompleteRuPhone(''), false);
});

test('validates name, phone, and explicit consent', () => {
  assert.deepEqual(validateLeadValues({ name: 'А', phone: '+7 (999) 123-45', consent: false }), {
    name: 'Укажите имя — минимум 2 символа.',
    phone: 'Введите телефон полностью.',
    consent: 'Подтвердите согласие на обработку данных.'
  });

  assert.deepEqual(validateLeadValues({ name: 'Анна', phone: '+7 (999) 123-45-67', consent: true }), {});
});
