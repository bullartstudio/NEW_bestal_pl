# QA UI/UX i Dostępność - BESTAL

## 1. Kontrast i czytelność
- Tekst podstawowy i przyciski spełniają minimum WCAG AA.
- Linki są odróżnialne od zwykłego tekstu.
- Długość linii treści nie przekracza 60-75 znaków.

## 2. Klawiatura i focus
- Każdy element interaktywny jest osiągalny klawiszem `Tab`.
- Widoczny stan `focus-visible` dla linków, przycisków i pól formularza.
- `Escape` zamyka menu mobilne i otwarte dropdowny.

## 3. Nawigacja i IA
- Terminologia menu jest spójna (`Oferta` na wszystkich podstronach).
- Dropdown działa myszą, klawiaturą i na urządzeniach dotykowych.
- Targety klikalne w menu mają min. 44 px wysokości.

## 4. Formularze i stany
- Pola wymagane są oznaczone i walidowane przed wysyłką.
- Błędy mają czytelny komunikat i wyróżnienie pola.
- Wysyłka pokazuje stan `loading/disabled`.
- Formularz ma jedną główną akcję wysyłki.

## 5. Responsywność
- Widok działa poprawnie na mobile, tablet, desktop.
- Brak poziomego scrolla przy typowych szerokościach.
- Karty, galerie i siatki przechodzą na 1 kolumnę na mobile.

## 6. Stabilność wizualna
- Obrazy mają określone rozmiary i nie powodują skoków layoutu.
- Sekcje CTA oraz stopka mają spójne odstępy między podstronami.
- Nie ma styli inline w HTML/JS.
