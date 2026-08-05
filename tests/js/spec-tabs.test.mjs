import assert from 'node:assert/strict';
import test from 'node:test';

import { initSpecTabs } from '../../public/assets/js/spec-tabs.js';

class FakeElement {
  constructor({ id = '', textContent = '', dataset = {} } = {}) {
    this.id = id;
    this.textContent = textContent;
    this.dataset = dataset;
    this.attributes = new Map();
    this.listeners = new Map();
    this.tabIndex = -1;
    this.hidden = false;
  }

  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  addEventListener(type, handler) { this.listeners.set(type, handler); }
  removeEventListener(type) { this.listeners.delete(type); }
  focus() { this.focused = true; }
}

test('model tabs synchronize the shared speed copy', () => {
  const j6 = new FakeElement({
    id: 'tab-j6',
    textContent: 'JACK J6',
    dataset: { imageSrc: '/j6.webp', speedCopy: 'До 3 000 ст/мин (JACK J6)' }
  });
  j6.setAttribute('aria-controls', 'panel-j6');
  const m9 = new FakeElement({
    id: 'tab-m9',
    textContent: 'JACK M9',
    dataset: { imageSrc: '/m9.webp', speedCopy: 'До 3 600 ст/мин (JACK M9)' }
  });
  m9.setAttribute('aria-controls', 'panel-m9');

  const panels = {
    'panel-j6': new FakeElement(),
    'panel-m9': new FakeElement()
  };
  const modelImage = new FakeElement();
  const modelSpeed = new FakeElement({ textContent: 'До 3 000 ст/мин (JACK J6)' });
  const specifications = {
    querySelector(selector) {
      if (selector === '[data-model-image]') return modelImage;
      if (selector === '[data-model-speed]') return modelSpeed;
      return null;
    }
  };
  const tablist = {
    querySelectorAll: () => [j6, m9],
    closest: () => specifications
  };

  const originalDocument = globalThis.document;
  globalThis.document = { getElementById: (id) => panels[id] ?? null };
  try {
    initSpecTabs(tablist);
    m9.listeners.get('click')({ currentTarget: m9 });
    assert.equal(modelSpeed.textContent, 'До 3 600 ст/мин (JACK M9)');

    m9.listeners.get('keydown')({
      currentTarget: m9,
      key: 'ArrowLeft',
      preventDefault() {}
    });
    assert.equal(modelSpeed.textContent, 'До 3 000 ст/мин (JACK J6)');
  } finally {
    globalThis.document = originalDocument;
  }
});
