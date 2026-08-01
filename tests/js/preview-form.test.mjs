import test from 'node:test';
import assert from 'node:assert/strict';

import { initLeadForm } from '../../public/assets/js/form.js';

class FakeElement {
  constructor({ value = '', checked = false } = {}) {
    this.value = value;
    this.checked = checked;
    this.dataset = {};
    this.textContent = '';
    this.listeners = new Map();
  }

  addEventListener(type, handler) { this.listeners.set(type, handler); }
  removeEventListener(type) { this.listeners.delete(type); }
  setAttribute() {}
  removeAttribute() {}
  toggleAttribute() {}
  setSelectionRange() {}
  focus() {}
}

test('static preview validates locally without requesting PHP endpoints', async () => {
  const OriginalHTMLElement = globalThis.HTMLElement;
  globalThis.HTMLElement = FakeElement;

  try {
    const controls = {
      name: new FakeElement({ value: 'Анна' }),
      phone: new FakeElement({ value: '+7 (999) 123-45-67' }),
      consent: new FakeElement({ checked: true }),
      company_website: new FakeElement()
    };
    const errors = {
      name: new FakeElement(),
      phone: new FakeElement(),
      consent: new FakeElement()
    };
    const status = new FakeElement();
    const submitButton = new FakeElement();
    const form = new FakeElement();
    form.elements = { namedItem: (name) => controls[name] ?? null };
    form.querySelector = (selector) => {
      if (selector === '[type="submit"]') return submitButton;
      if (selector === '.form-status') return status;
      const match = selector.match(/^#(.+)-error$/);
      return match ? errors[match[1]] : null;
    };
    form.reset = () => {};

    let fetchCalls = 0;
    initLeadForm(form, {
      previewMode: true,
      fetchImpl: async () => {
        fetchCalls += 1;
        throw new Error('The static preview must not call PHP');
      }
    });

    assert.equal(fetchCalls, 0);
    await form.listeners.get('submit')({ preventDefault() {} });
    assert.equal(fetchCalls, 0);
    assert.match(status.textContent, /демо-режим/i);
  } finally {
    globalThis.HTMLElement = OriginalHTMLElement;
  }
});
