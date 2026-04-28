# Mobile UX Test Report (2026-04-27)

## Test ortami
- URL: http://127.0.0.1:4174/
- Browser: VS Code integrated browser + Playwright actions
- Not: Bu ortamda viewport emulasyonu tutarsiz davrandi (JS tarafinda genislik degeri sabit kaldigi anlar oldu). Bu nedenle bulgularin bir kismini "mobilde kirpma/overflow riski" olarak isaretledim.

## Adim adim
1. Lock screen acildi, smile jesti denendi.
2. Unlock sonrasi Experience bolumu kontrol edildi.
3. Projects bolumu kontrol edildi.
4. Proje kartina tiklama sonrasi detay paneli davranisi kontrol edildi.
5. Skills bolumu ve filtre/tag tiklamalari kontrol edildi.

## Ekran goruntuleri
- m01-locked-home.png
- m02-unlocked-home.png
- m03-experience.png
- m04-projects.png
- m05-project-opened.png
- m06-skills.png
- m07-skills-frontend-filter.png
- m08-skills-react-tag.png
- m09-project-modal-check.png
- m10-project-open-fullpage.png

## Bulgular
- Lock gesture calisiyor: smile egri dogru cizildiginde ekran aciliyor.
- Experience ve Projects basliklari buyuk oldugu icin dar gorunumde kirpma riski var.
- Projects kart acilisinda detay paneli yatayda ikinci kolonda aciliyor; dar ekranda panelin bir kismi ekrandisina tasabiliyor.
- Skills bolumunde filtre/tag butonlari calisiyor (Frontend ve React tetiklenebildi).
- Sayfa altinda bos/koyu alan goruntusu olusabiliyor (viewport ve shell scroll iliskisi kaynakli olabilir).

## Oncelikli iyilestirme onerileri
1. Projects acik durumunu mobilde tek kolon zorla:
   - .slider-reveal: 1fr
   - detay panelini kartin altina al
2. Basliklar icin mobilde ayrica font-size clamp degerlerini dusur (Experience, Projects, Skills).
3. Shell ve section yuksekliklerini mobilde netle:
   - 100dvh + overflow kontrolu
   - siyah bosluk olusan durumlar icin root/stage/shell yukseklik uyumu
4. Lock screen metin ve goz konumlarini mobilde merkezle:
   - caption satir kirilmasi ve safe-area inset destegi

## Tekrarlanabilir test metodu (onerilen)
- Gercek cihaz profili ile Playwright CI testi kos:
  - iPhone 14 Pro (390x844)
  - Pixel 7 (412x915)
- Her cihazda zorunlu adimlar:
  1) unlock
  2) Experience goto
  3) Project card open
  4) Skills filter click
- Her adimda screenshot al, onceki baseline ile pixel diff yap.
- Basarisiz kosullarda otomatik rapor + artifact upload.
