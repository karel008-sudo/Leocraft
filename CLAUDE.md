# CLAUDE.md – pravidla pro AI agenty v tomto repozitáři

Tento soubor definuje, jak má Claude Code (a jiné AI agenty) přistupovat k práci v tomto projektu.

---

## Kontex projektu

**Leocraft** je mobilní vzdělávací hra pro děti od 3 let.  
Stack: Phaser 3 · TypeScript · Vite · web-first · PWA-ready.  
Cílová platforma: mobilní prohlížeč (portrait, touch-first).

---

## Závazná pravidla

### 1. Jednoduchost první

- Preferuj nejjednodušší řešení, které funguje.
- Nepřidávej nové npm závislosti bez silného důvodu.
- Nepřidávej abstrakce pro jednu použití.

### 2. Mobilní a dětské publikum

- Vždy respektuj principy z `docs/design-principles-3plus.md`.
- Touch targety ≥ 88 px. Velké fonty. Žádný text onboarding.
- Testuj myšlenkově na 375 px šířce a portrait orientaci.

### 3. Práce se strukturou projektu

- Před každou větší změnou přečti existující soubory — neupravuj naslepo.
- Konstanty patří do `src/config/constants.ts` — nikdy nehardcoduj čísla.
- Nové scény: viz postup v `docs/architecture.md`.

### 4. Git a commity

- Malé, čisté commity s popisnou zprávou.
- Formát: `<typ>: <co a proč>`, např. `feat: add tap feedback animation`.
- Typy: `feat`, `fix`, `refactor`, `docs`, `chore`, `style`.
- Nikdy commituj s `--no-verify`.

### 5. Dokumentace

- Pokud měníš architekturu nebo přidáváš novou vrstvu, aktualizuj `docs/architecture.md`.
- Nové design rozhodnutí ohledně dětí → `docs/design-principles-3plus.md`.

### 6. Zakázané přístupy

- ❌ Žádné `any` typy v TypeScript (výjimka: Phaser interní typy).
- ❌ Žádné inline styly nebo magic stringy pro klíče scén (use `SCENES` constants).
- ❌ Žádné těžké backend závislosti (tato hra je 100 % frontend).
- ❌ Žádné agresivní herní mechaniky nebo age-inappropriate obsah.

---

## Doporučený pracovní postup

1. Přečti relevantní soubory před editací.
2. Navrhni změnu (pokud je netriviální) jako komentář nebo v chat.
3. Implementuj malými kroky.
4. Spusť `npm run typecheck` a `npm run build` po každé větší změně.
5. Commitni s čistou zprávou.
