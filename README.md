# 🦊 Rekenreis — Getallen tot 1.000

Een vrolijk, gratis en reclamevrij rekenavontuur voor leerlingen van ongeveer 8 jaar. De opdrachten volgen de onderwerpen uit het Vlaamse rekenboek: MAB-materiaal, duizendtallen/honderdtallen/tientallen/eenheden (D-H-T-E), plaatswaarde, getalwoorden, getallenlijnen, ordenen en vergelijken.

## Speel de app
Na het activeren van GitHub Pages: **https://sejyta-main.github.io/Dutches/**

## Installeren op iPad
1. Open de app via **Safari**.
2. Tik op **Delen** (het vierkant met de pijl omhoog).
3. Kies **Zet op beginscherm** (Add to Home Screen).
4. Tik op **Voeg toe**.
5. Open **Rekenreis** vanaf het nieuwe pictogram.

De eerste keer is internet nodig. Daarna kun je de gecachete app offline gebruiken. Updates komen binnen wanneer de iPad later weer online is.

## Hoe het werkt
- Vijf thematische oefenwerelden, telkens 10 dynamisch gegenereerde vragen.
- **Oefentoets** van 20 vragen over alle vijf thema's.
- **Extra oefenen** om zwakke thema's bij te spijkeren.
- Correctie en een korte uitleg na ieder antwoord.
- 10 sterren per juist antwoord en een score na elke ronde.
- Ouderoverzicht met prestaties per thema, laatste rondes en een CSV-export.
- Werkt op iPad, telefoon en computer, zonder account, tracking of reclame.

**Privacy:** resultaten worden uitsluitend bewaard in de browser-opslag van het gebruikte apparaat (localStorage). Je kunt in het ouderoverzicht zelf een lokaal rapport downloaden of via het deelmenu delen. Er is geen automatische e-mail of synchronisatie tussen apparaten.

## Publicatie (eenmalig)
Open **Settings → Pages → Build and deployment → Source → GitHub Actions**. Daarna activeert een push naar `main` de workflow `.github/workflows/deploy.yml`. Bekijk de status onder **Actions**.

## Development
De app is bewust zonder framework of backend: `index.html`, `style.css` en `app.js`. PWA-installatie via `manifest.webmanifest` en offline caching via `sw.js`.

De GitHub Actions workflow genereert bij het publiceren PNG-appiconen vanuit `scripts/build_icons.py` (met Pillow). Het SVG-icoon is ook beschikbaar als `icons/icon.svg`.

## Niet-affiliatie
Een onafhankelijk oefenproject, niet uitgegeven of goedgekeurd door de school.
