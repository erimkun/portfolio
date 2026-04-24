# Erden Erim Portfolio — Tasarım Spesifikasyonu
**Tarih:** 2026-04-21  
**Durum:** Onaylı — Implementation bekliyor

---

## 1. Proje Özeti

Erden Erim'in kişisel portfolio sitesi. Mevcut kilit ekranı (gülümseme çiz → piksel karakter belirir → unlock) üzerine inşa edilen, kozmik uzay estetiğinde, piksel nehir animasyonuyla bölümler arası geçiş yapan tam sayfa scroll deneyimi.

**Mevcut ve korunacak:** LockScreen (gülümseme canvas + kilit açma animasyonu), UnlockPage hero (ERDEN | erimpixel.png | ERİM), yıldız canvas arka planı, parçacık sistemi.

---

## 2. Kullanıcı Akışı

```
Gülümseme çizilir
  → Kilit açılır (shockwave + collapse animasyonu)
    → Hero: ERDEN | piksel karakter | ERİM belirir
      → Kullanıcı scroll yapar
        → Piksel karakter dağılır → nehre dönüşür
          → About → Education → Experience → Projects → Contact
```

Her scroll adımında piksel nehir kullanıcının hızına göre reaktif akar.

---

## 3. Mimari

### 3.1 Teknoloji Kararları
- **GSAP ScrollTrigger** — scroll pin, snap, scrub, timeline yönetimi
- **Canvas API** — piksel nehir (PixelRiver bileşeni)
- **React 19** — bileşen yapısı
- **Vite** — build

### 3.2 Bileşen Ağacı

```
App
├── LockScreen                     (mevcut, dokunulmaz)
└── SiteShell                      (mevcut UnlockPage'in yerine geçer, unlock sonrası aktif)
    ├── BackgroundStage (fixed)    (mevcut yıldızlar + gradient)
    ├── PixelRiver (fixed canvas)  (YENİ — tüm site boyunca)
    ├── DotNav (fixed)             (YENİ — sağ kenar)
    ├── HeroSection                (mevcut UnlockPage hero, refactor)
    ├── AboutSection               (mevcut, entegre edilecek)
    ├── EducationSection           (YENİ)
    ├── ExperienceSection          (YENİ)
    ├── ProjectsSection            (YENİ)
    └── ContactSection             (YENİ)
```

### 3.3 Scroll Mekanizması
**Hibrit model:**
- Her section girişinde GSAP `snap` — bölüm başları snap noktası
- Section içi içerik normal scroll (uzun listeler için)
- `scrub: 0.8` — scroll hızı piksel akış hızına doğrudan bağlı, hafif lag ile yumuşatılmış

---

## 4. Piksel Nehir Sistemi

### 4.1 Genel Mantık
Tek `PixelRiver` canvas'ı `position: fixed`, `z-index` tüm content'in üstünde, `pointer-events: none`.

**3 faz:**
1. **Dağılma** — Mevcut section'ın piksel elementi (fotoğraf/ikon/border) parçalanır. erimpixel.png silueti referans alınır, kırmızı kapşonlu form kısa süre görünür sonra dökülür.
2. **Akış** — Ekranın ~%25-35'ini kaplayan yılanımsı/snake-like sütun. Scroll hızı = akış hızı (GSAP scrub progress). Nehir hissi verecek kadar kitlesel ama arka planı öldürmeyecek kadar ince.
3. **Toplanma** — Yeni section'a varışta piksel bulutu o bölüme özgü nesnenin şeklini alarak materialleşir.

### 4.2 Section Bazında Materialleşme

| Section | Dağılan | Toplanan |
|---|---|---|
| Hero → About | erimpixel.png logosu | Fotoğraf (scan line efektiyle) |
| About → Education | Fotoğraf silueti | İlk kartın sol border'ı + timeline çizgisi |
| Education → Experience | Kart border'ı | Timeline ikon noktaları |
| Experience → Projects | Timeline ikonları | Proje thumbnail'ları (nehir kollara ayrılır) |
| Projects → Contact | Thumbnail'lar | 4 sosyal ikon (sırayla) |

**Projects özel:** Birden fazla proje kartı olduğunda piksel nehir kollara ayrılır — her kol bir thumbnail'a akar. Nehrin kolları gibi.

### 4.3 Renk
Piksel nehirin rengi o anki section accent hue'suyla boyanır (geçişte lerp).

---

## 5. Renk Sistemi

Arka plan gradient hue'su scroll pozisyonuna göre sürekli kayar. Keskin değil, yavaş erir (GSAP lerp).

| Section | Arka Plan | Accent |
|---|---|---|
| Hero | `#020714` → `#0d1f3c` | Mavi |
| About | `#0a0d2e` | Mavi-mor |
| Education | `#0d0828` | Mor-indigo |
| Experience | `#1a1208` | Amber-lacivert |
| Projects | `#071a12` | Yeşil-koyu |
| Contact | `#1a0810` | Kırmızı-koyu |

---

## 6. Tipografi Sistemi

**Kural:** Vurgulu metinler boyut ve font kontrastıyla konuşur — renk vurgusu yok.

| Kullanım | Font | Boyut |
|---|---|---|
| Section başlığı / vurgu kelime | Anton | `clamp(56px, 10vw, 140px)` |
| Alt başlık / kurum adı | Anton | `clamp(28px, 4vw, 56px)` |
| Gövde metin | Fraunces 300 | `clamp(15px, 1.1vw, 18px)` |
| Metadata / etiket | JetBrains Mono 300 | `10-11px`, `letter-spacing: .4em` |

Dramatik boyut farkı vurguyu sağlar — Fraunces body yanında Anton başlık çok büyük durur.

---

## 7. Section Tasarımları

### 7.1 Hero
Mevcut yapı korunur. Tek güncelleme: en altta çok küçük `↓` veya `scroll` hint. Scroll başlayınca erimpixel.png dağılmaya başlar.

### 7.2 About
Mevcut AboutSection entegre edilir. Sol fotoğraf (kaba beyaz çerçeve, kozmik toz), sağ `BIOMETRIC DATA` paneli. Piksel nehir fotoğraf alanına akar.

### 7.3 Education
- Dikey timeline layout
- Her eğitim/sertifika bir kart
- Anton'la büyük yıl + Fraunces'la kurum ve açıklama
- Timeline çizgisi piksellerden uzuyor (scroll ilerledikçe)
- İlk kart border'ı piksel nehirden materialleşiyor

### 7.4 Experience
- Sol dikey timeline çizgisi + sağda içerik blokları
- Anton'la şirket adı (büyük), Fraunces'la rol ve açıklama
- Timeline'daki ikon noktaları piksellerden birer birer belirir

### 7.5 Projects
- Grid layout (2 kolon masaüstü, 1 kolon mobil)
- Her kart: thumbnail (piksellerden), Anton'la proje adı, teknoloji ikonları
- Piksel nehir kollara ayrılarak her karta akar
- Hover: kart hafifçe yükselir, overlay bilgi gösterir

### 7.6 Contact
- Merkezde büyük Anton başlık: `LET'S CONNECT`
- 4 ikon satırı: LinkedIn, X (Twitter), Instagram, Gmail
- İkonlar piksellerden sırayla materialleşir — nehrin son durağı
- Piksel bulutu toprağa karışır, silinir

---

## 8. Dot Navigasyon

- `position: fixed`, sağ kenar, dikey ortalı
- 6 nokta (Hero, About, Education, Experience, Projects, Contact)
- **Varsayılan:** `2px` çap, `rgba(233,228,214,.3)`
- **Aktif:** `6px` çap, section accent rengiyle `box-shadow` glow
- **Hover:** dot büyür + sol tarafında section adı soldan kayarak belirir (JetBrains Mono, uppercase)
- **Tıklama:** GSAP smooth scroll ile hedef section'a atlar

---

## 9. Mobil Strateji

- Piksel nehir animasyonu çalışır — basitleştirilmiş versiyon
- Parçacık sayısı yarıya düşer (`W < 768` kontrolü)
- Snake path daha dar (ekran genişliğinin %60'ı)
- Projects: 1 kolon grid
- Dot nav: daha küçük, dokunma hedefi `44px`

---

## 10. Performans Kararları

- `PixelRiver` canvas'ı `will-change: transform` + `requestAnimationFrame`
- GSAP `scrub` değeri `0.8` — çok hızlı değil, çok yavaş değil
- Section içerikleri `IntersectionObserver` ile lazy reveal
- Görseller `loading="lazy"` + WebP formatı önerilir
- Tüm animasyonlar `prefers-reduced-motion` media query'ye saygı gösterir
