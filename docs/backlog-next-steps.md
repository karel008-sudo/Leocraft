# Backlog – další kroky po první hratelné verzi

## Priorita 1 – Audio (nejdůležitější pro dětský zážitek)

- [ ] Přidat zvuk při správném výběru (vesele, krátce – např. „ping" nebo fanfára)
- [ ] Přidat zvuk při špatném výběru (neutrálně, jemně – např. „bloop")
- [ ] Přidat klidnou smyčkovanou hudbu na pozadí
- [ ] Implementovat globální mute tlačítko (rodiče ocení)
- [ ] Přidat hlasové popisky zvířat (ideálně „Slon!" po správném klepnutí)

## Priorita 2 – Vizuální polish

- [ ] Nahradit emoji zvířat ilustrovanými sprity (PNG s průhledností)
- [ ] Nahradit emoji Lea animovanou postavou (idle + happy + shake animace)
- [ ] Ilustrovaný background místo Phaser Graphics
- [ ] Animace hvězdiček jako Spine nebo spritesheet místo emoji tweenů
- [ ] Smooth přechody (slide-in pásu, confetti particle system)

## Priorita 3 – Herní mechaniky

- [ ] Obtížnostní stupně (rychlost pásu, počet karet, podobná zvířata)
- [ ] Jednoduchý systém odměn (nálepky, sbírání zvířat)
- [ ] „Výborně!" animace od Lea s hvězdami
- [ ] Zvukové tipy pokud dítě 5 s neklikne (Leo na bublinu ukáže)
- [ ] Různé herní režimy (barvy, číslice, tvary)

## Priorita 4 – Obsah

- [ ] Rozšíření na 15+ zvířat
- [ ] Domácí zvířata jako druhá kategorie
- [ ] Lokalizace do dalších jazyků (EN, DE, SK)
- [ ] Přidání jmen zvířat zvukem (TTS nebo nahrávka)

## Priorita 5 – Technická infrastruktura

- [ ] Service Worker (offline podpora) přes `vite-plugin-pwa`
- [ ] PWA ikony (192 px, 512 px) z finálního loga
- [ ] Ukládání skóre/progress do localStorage
- [ ] Capacitor wrapper pro Google Play
- [ ] Analytics (anonymní, bez PII – kolik kol, průměrná přesnost)

## Priorita 6 – QA

- [ ] Testování na reálných zařízeních (Android low-end + iPad)
- [ ] Testování s dětmi 3–5 let
- [ ] Lighthouse audit (performance, PWA score)
- [ ] Accessibility audit (kontrast, touch targets)

---

## Doporučený příští prompt

Jakmile bude hotové audio nebo finální assety, použij:

> "Pokračuji v Leocraft. Aktuální stav: `src/scenes/GameScene.ts` má placeholder emoji zvířata a žádné zvuky.
> Zadání: (1) Přidej audio feedback – správně: veselý ding, špatně: jemný bloop. Použij WebAudioAPI
> přes Phaser.Sound nebo procedurálně vygenerované tóny bez externích souborů. (2) Přidej
> mute tlačítko do top baru. Zachovej existující architekturu, nepřepisuj hotový kód."
