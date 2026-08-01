const PHONE_DIGIT_LIMIT = 11;

function normalizeRuPhoneDigits(value = '') {
  const rawDigits = String(value).replace(/\D/g, '');
  if (!rawDigits) return '';

  let digits;
  if (rawDigits.startsWith('8')) {
    digits = `7${rawDigits.slice(1)}`;
  } else if (rawDigits.startsWith('7')) {
    digits = rawDigits;
  } else {
    digits = `7${rawDigits}`;
  }

  return digits.slice(0, PHONE_DIGIT_LIMIT);
}

export function normalizeRuPhone(value = '') {
  const digits = normalizeRuPhoneDigits(value);
  return digits ? `+${digits}` : '';
}

export function formatRuPhone(value = '') {
  const normalized = normalizeRuPhoneDigits(value);
  if (!normalized) return '';

  const national = normalized.slice(1);
  let formatted = '+7';

  if (national.length > 0) formatted += ` (${national.slice(0, 3)}`;
  if (national.length >= 3) formatted += ')';
  if (national.length > 3) formatted += ` ${national.slice(3, 6)}`;
  if (national.length > 6) formatted += `-${national.slice(6, 8)}`;
  if (national.length > 8) formatted += `-${national.slice(8, 10)}`;

  return formatted;
}

export function isCompleteRuPhone(value = '') {
  return /^\+7\d{10}$/.test(normalizeRuPhone(value));
}

export function validateLeadValues({ name = '', phone = '', consent = false } = {}) {
  const errors = {};
  if (String(name).trim().length < 2) errors.name = 'Укажите имя — минимум 2 символа.';
  if (!isCompleteRuPhone(phone)) errors.phone = 'Введите телефон полностью.';
  if (!consent) errors.consent = 'Подтвердите согласие на обработку данных.';
  return errors;
}

function canonicalDigitsBefore(value, caret) {
  const stringValue = String(value);
  const allDigits = stringValue.replace(/\D/g, '');
  const precedingDigits = stringValue.slice(0, Math.max(0, caret)).replace(/\D/g, '').length;
  if (!precedingDigits) return 0;

  const hasExplicitCountryCode = allDigits.startsWith('7') || allDigits.startsWith('8');
  return Math.min(PHONE_DIGIT_LIMIT, precedingDigits + (hasExplicitCountryCode ? 0 : 1));
}

function caretForCanonicalDigits(value, digitCount) {
  if (digitCount <= 0) return 0;

  let seen = 0;
  for (let index = 0; index < value.length; index += 1) {
    if (!/\d/.test(value[index])) continue;
    seen += 1;
    if (seen === digitCount) return index + 1;
  }
  return value.length;
}

function setCaretByDigitRange(input, startDigits, endDigits = startDigits) {
  input.setSelectionRange?.(
    caretForCanonicalDigits(input.value, startDigits),
    caretForCanonicalDigits(input.value, endDigits)
  );
}

export function initPhoneMask(input) {
  if (!input) return () => {};

  const handleInput = () => {
    const rawValue = input.value;
    const rawStart = input.selectionStart ?? rawValue.length;
    const rawEnd = input.selectionEnd ?? rawStart;
    const startDigits = canonicalDigitsBefore(rawValue, rawStart);
    const endDigits = canonicalDigitsBefore(rawValue, rawEnd);
    input.value = formatRuPhone(rawValue);
    setCaretByDigitRange(input, startDigits, endDigits);
  };

  const handleKeydown = (event) => {
    if (!['Backspace', 'Delete'].includes(event.key) || input.selectionStart !== input.selectionEnd) return;

    const caret = input.selectionStart;
    const step = event.key === 'Backspace' ? -1 : 1;
    let digitIndex = event.key === 'Backspace' ? caret - 1 : caret;
    while (digitIndex >= 0 && digitIndex < input.value.length && !/\d/.test(input.value[digitIndex])) {
      digitIndex += step;
    }
    if (digitIndex < 0 || digitIndex >= input.value.length) return;

    if (event.key === 'Delete' && input.value[digitIndex] === '7') {
      const nextNationalDigit = input.value.slice(digitIndex + 1).search(/\d/);
      if (nextNationalDigit >= 0) digitIndex += nextNationalDigit + 1;
    }

    event.preventDefault();
    const caretDigits = canonicalDigitsBefore(input.value, Math.min(caret, digitIndex));
    input.value = formatRuPhone(`${input.value.slice(0, digitIndex)}${input.value.slice(digitIndex + 1)}`);
    setCaretByDigitRange(input, caretDigits);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  };

  input.addEventListener('input', handleInput);
  input.addEventListener('keydown', handleKeydown);

  return () => {
    input.removeEventListener('input', handleInput);
    input.removeEventListener('keydown', handleKeydown);
  };
}

function showFieldError(form, name, message = '') {
  const control = form.elements.namedItem(name);
  const error = form.querySelector(`#${name}-error`);
  if (control instanceof HTMLElement) {
    control.toggleAttribute('aria-invalid', Boolean(message));
  }
  if (error) error.textContent = message;
}

async function getCsrfToken(fetchImpl) {
  const response = await fetchImpl('/jack/api/csrf.php', {
    method: 'GET',
    credentials: 'same-origin',
    headers: { Accept: 'application/json' }
  });
  if (!response.ok) throw new Error('csrf');
  const data = await response.json();
  if (!data.token) throw new Error('csrf');
  return data.token;
}

export function initLeadForm(form, { fetchImpl = globalThis.fetch?.bind(globalThis) } = {}) {
  if (!form || !fetchImpl) return () => {};

  const phoneInput = form.elements.namedItem('phone');
  const submitButton = form.querySelector('[type="submit"]');
  const status = form.querySelector('.form-status');
  const disposeMask = initPhoneMask(phoneInput);
  let csrfToken = '';
  let csrfRequest = getCsrfToken(fetchImpl)
    .then((token) => {
      csrfToken = token;
      return token;
    })
    .catch(() => '');

  const acquireCsrfToken = async () => {
    if (csrfToken) return csrfToken;
    csrfToken = await csrfRequest;
    if (csrfToken) return csrfToken;

    csrfRequest = getCsrfToken(fetchImpl);
    csrfToken = await csrfRequest;
    return csrfToken;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const values = {
      name: form.elements.namedItem('name')?.value ?? '',
      phone: phoneInput?.value ?? '',
      consent: Boolean(form.elements.namedItem('consent')?.checked)
    };
    const errors = validateLeadValues(values);

    showFieldError(form, 'name', errors.name);
    showFieldError(form, 'phone', errors.phone);
    showFieldError(form, 'consent', errors.consent);
    if (status) {
      status.textContent = '';
      status.dataset.state = '';
    }

    const firstErrorName = ['name', 'phone', 'consent'].find((name) => errors[name]);
    if (firstErrorName) {
      form.elements.namedItem(firstErrorName)?.focus();
      return;
    }

    submitButton?.setAttribute('disabled', '');
    submitButton?.setAttribute('aria-busy', 'true');
    if (status) status.textContent = 'Отправляем заявку…';

    try {
      const csrfToken = await acquireCsrfToken();
      const payload = {
        name: values.name.trim(),
        phone: normalizeRuPhone(values.phone),
        consent: true,
        company_website: form.elements.namedItem('company_website')?.value ?? '',
        csrf_token: csrfToken
      };
      const response = await fetchImpl('/jack/api/submit.php', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.ok !== true) {
        if (response.status === 422 && result.errors && typeof result.errors === 'object') {
          for (const name of ['name', 'phone', 'consent']) {
            showFieldError(form, name, typeof result.errors[name] === 'string' ? result.errors[name] : '');
          }
          if (status) {
            status.textContent = 'Проверьте поля формы и отправьте заявку ещё раз.';
            status.dataset.state = 'error';
          }
          const firstServerError = ['name', 'phone', 'consent'].find((name) => result.errors[name]);
          form.elements.namedItem(firstServerError)?.focus();
          return;
        }

        if (response.status === 429) {
          if (status) {
            status.textContent = 'Слишком много попыток. Пожалуйста, подождите 10 минут.';
            status.dataset.state = 'error';
          }
          return;
        }

        throw new Error(result.message || 'submit');
      }

      form.reset();
      if (phoneInput) phoneInput.value = '';
      if (status) {
        status.textContent = 'Спасибо! Заявка отправлена, мы скоро свяжемся с вами.';
        status.dataset.state = 'success';
      }
    } catch {
      if (status) {
        status.textContent = 'Не удалось отправить заявку. Позвоните нам или попробуйте ещё раз.';
        status.dataset.state = 'error';
      }
    } finally {
      submitButton?.removeAttribute('disabled');
      submitButton?.removeAttribute('aria-busy');
    }
  };

  form.addEventListener('submit', handleSubmit);
  return () => {
    disposeMask();
    form.removeEventListener('submit', handleSubmit);
  };
}
