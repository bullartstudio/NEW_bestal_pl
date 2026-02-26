# CMS / Blog - struktura projektu

Ten projekt został przebudowany tak, aby treść mogła być rozwijana przez prosty backend CMS.

## Kluczowe elementy

- `backend/server.js` - API do zarządzania blogiem i podstawowymi danymi stron
- `cms/data/posts.json` - wpisy blogowe
- `cms/data/pages.json` - przykładowe dane treściowe stron
- `blog-admin.html` - formularz dodawania wpisów

## Uruchomienie lokalne

1. `npm install`
2. `npm run dev`
3. Otwórz `http://localhost:3000`

## Endpointy API

- `GET /api/posts`
- `GET /api/posts/:slug`
- `POST /api/posts`
- `GET /api/pages`
- `GET /api/pages/:slug`
- `PUT /api/pages/:slug`

## Zabezpieczenie API

Ustaw zmienną środowiskową `CMS_API_KEY`, aby wymusić nagłówek `x-api-key` dla metod zapisujących (`POST`, `PUT`).
