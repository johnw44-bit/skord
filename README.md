# Skörd

Brave/Chrome-tillägg som samlar länkar i listor och kopierar dem till Claude (eller annan AI) med ett tryck — med en förskriven prompt överst och en länk per rad.

Byggt för research: samla 20 GitHub-repon, tryck en tangent, klistra in i Claude.

## Funktioner

- **Alt+S** — skörda aktuell flik (eller alla markerade flikar, Ctrl/Shift-klick).
- **Ctrl+C på en sida** — URL:er i det kopierade plockas ut automatiskt. Text utan länkar hamnar i listan *Klipp*.
- **Högerklick → Skörda** — länk, markerad text eller sidan.
- **Alt+Shift+C** — kopierar aktiv lista (den du senast lade till i). Ikonen visar ✓.
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

## Egna listor

Klicka på ikonen → **Listor & regler (JSON)**. Varje lista:

```json
{ "id": "papers", "name": "Papers", "match": "^https?://arxiv\\.org/", "ttlMin": 60, "clearAfterCopy": true,
  "template": "Sammanfatta varje paper nedan …" }
```

- `match` — regex mot URL:en; första träffen vinner. Tom = används bara som fallback.
- `ttlMin` — minuter innan en länk försvinner (`0` = aldrig).
- `ovrigt` och `klipp` måste finnas.

## Begränsning

Ctrl+C i **adressfältet** syns inte för tillägg — använd Alt+S där.

## Test

```
node test.mjs
```
