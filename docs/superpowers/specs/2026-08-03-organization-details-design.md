# Organization Details Integration Design

## Goal

Replace the site's fictional contacts and legal placeholders with the supplied details of ООО «Текстиль Опт Торг», and publish the full organization and bank requisites without overloading the landing-page footer.

## Information architecture

- The header shows the primary sales phone `8 (927) 667-73-07` with the neutral caption `Консультация по оборудованию`.
- The landing footer shows the primary phone, office phones, company email, and registered/actual address.
- `privacy.html` and `consent.html` identify the personal-data operator using the legal name, INN, OGRN, address, email, and primary phone.
- A new `requisites.html` page contains registration codes, legal and actual addresses, bank details effective from 1 April 2025, director details, all phones, and email.
- The footer and all legal pages link to the requisites page.
- Organization JSON-LD contains the real legal name, tax ID, OGRN identifier, phone, email, and structured postal address.

## Exact public details

- Legal name: ООО «Текстиль Опт Торг»
- INN/KPP: 2130136574 / 211601001
- OGRN: 1142130005731
- OKPO: 14431206
- OKTMO: 97544000
- OKFS: 16
- OKOPF: 12165
- OKVED: 51.41
- Legal and actual address: 429500, Чувашская Республика, Чебоксарский район, пос. Кугеси, ул. Шоршелская, д. 2
- Email: tekstilopttorg@mail.ru
- Primary phone: 8 (927) 667-73-07
- Office phones: 8 (8352) 62-65-20 and 8 (8352) 37-73-07
- Director: Федотов Андрей Николаевич, acts on the basis of the Charter
- Bank: ПРИВОЛЖСКИЙ Ф-Л ПАО «Банк ПСБ» г. Нижний Новгород
- BIK: 042202803
- Correspondent account: 30101810700000000803
- Settlement account: 40702810203000184072

## Legal copy decisions

- Remove pre-publication notices and all operator placeholders from public legal pages.
- Do not place bank account numbers in the privacy policy because they are unrelated to personal-data processing.
- Replace the unresolved numeric retention marker with purpose-bound wording: data is stored until the processing purpose is achieved or consent is withdrawn, unless another legal ground requires continued processing.
- Keep the Google SMTP/localization caution factual and avoid claiming legal compliance that has not been independently confirmed.
- Keep `[[DOMAIN]]` only in source canonical/sitemap values until the production domain is supplied. The Pages build replaces it with the GitHub Pages URL for the preview.

## UX and accessibility

- All phone numbers use `tel:` links with normalized international numbers.
- The email uses a `mailto:` link.
- Requisites use semantic headings, paragraphs, and lists within the existing legal-page layout.
- Long account numbers and addresses must wrap without horizontal overflow down to 320 px.
- No new colors, components, or motion are introduced.

## Verification

- Tests assert the real operator identity on privacy, consent, and requisites pages.
- Tests assert the real header/footer contacts and the absence of the old fictional contacts.
- Tests assert that no operator placeholder remains in `public/` except the intentionally deferred `[[DOMAIN]]` marker.
- Playwright verifies links, responsive overflow, footer layout, legal navigation, and SEO structured data.
- The full JavaScript and browser suites run before the Pages build is pushed.

