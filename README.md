# Skörd

Brave/Chrome-tillägg som samlar länkar i listor och kopierar dem till Claude (eller annan AI) med ett tryck — med en förskriven prompt överst och en länk per rad.

Byggt för research: samla 20 GitHub-repon, tryck en tangent, klistra in i Claude.

## Funktioner

- **Alt+S** — öppna popupen.
- **Ctrl+S** — skörda aktuell flik (eller alla markerade flikar, Ctrl/Shift-klick).
- **Ctrl+C på en sida** — URL:er i det kopierade plockas ut automatiskt. Text utan länkar hamnar i listan *Klipp*.
- **Högerklick → Skörda** — länk, markerad text eller sidan.
- **Ctrl+Q** — kopierar aktiv lista (den du senast lade till i). Ikonen visar ✓.
- **Automatisk sortering** — `github.com/*` → GitHub-listan, övrigt → Övrigt. Egna regler via regex.
- **Städning** — dubbletter och spårningsparametrar (`utm_*`, `fbclid`, …) tas bort, GitHub-länkar kortas till `github.com/ägare/repo`, allt äldre än 60 min försvinner.
- Allt lagras lokalt i webbläsaren. Inget konto, ingen server, inga beroenden.

Resultat vid inklistring:

```
Researcha varje GitHub-repo nedan om det är något vi kan använda eller låna:

https://github.com/a/b
https://github.com/c/d
```

## Installation

1. Ladda ner/klona repot.
2. Öppna `brave://extensions` (eller `chrome://extensions`), slå på **Utvecklarläge**.
3. **Läs in okomprimerat** → välj mappen.
4. Öppna `brave://extensions/shortcuts` och kontrollera att kortkommandona är satta (de sätts inte automatiskt om de krockar med något annat).

## Popupen (Alt+S)

- **Flikarna** överst = listorna med antal. Klick gör listan *aktiv* (den Ctrl+Q kopierar).
- **×** tar bort en enskild länk.
- **Förskriven text** redigeras direkt; sparas när du klickar utanför fältet.
- **Kopiera** kopierar listan och stänger popupen. **Töm** rensar listan.

## Uppdatera

1. `git pull` (eller ladda ner ny release).
2. `brave://extensions` → ↻ vid Skörd.

Listor, texter och kortkommandon du redan har behålls — ändrade standardvärden i en ny version gäller bara nya installationer. Flyttar du mappen måste tillägget tas bort och läsas in igen; då töms listorna och kortkommandona måste sättas om.

## Egna listor

Klicka på ikonen → **Listor & regler (JSON)**. Varje lista:

```json
{ "id": "papers", "name": "Papers", "match": "^https?://arxiv\\.org/", "ttlMin": 60, "clearAfterCopy": true,
  "template": "Sammanfatta varje paper nedan …" }
```

- `match` — regex mot URL:en; första träffen vinner. Tom = används bara som fallback.
- `ttlMin` — minuter innan en länk försvinner (`0` = aldrig).
- `clearAfterCopy` — töm listan efter kopiering.
- `template` — texten överst vid kopiering. Tom = bara länkarna.
- `ovrigt` och `klipp` måste finnas.

Listan *Klipp* tar emot kopierad text utan länkar; vid kopiering kommer en text per rad (radbrytningar i texten behålls).

## Begränsningar

- Ctrl+C i **adressfältet** syns inte för tillägg — använd Ctrl+S där.
- Högerklick → **Kopiera länkadress** fångas inte — använd **Skörda** i samma meny.
- Ctrl+S är Braves "Spara sida"; om Brave inte släpper det, välj t.ex. Ctrl+Shift+S i `brave://extensions/shortcuts`.

## Behörigheter & integritet

- **Innehållsskript på alla sidor** — läser det du markerat *när du trycker Ctrl+C*, inget annat.
- **tabs** — läsa URL:en på markerade flikar vid Ctrl+S.
- **storage, alarms** — spara listorna lokalt, rensa gamla länkar varje minut.
- **offscreen, clipboardWrite** — skriva till urklippet vid Ctrl+Q.
- **contextMenus** — högerklicksvalet Skörda.

Inget skickas någonstans; allt ligger i `chrome.storage.local`.

## Test

```
node test.mjs
```
