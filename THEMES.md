# Tema ve response kataloğu — 0.3.18

Tüm temalar Studio ve standart Swagger için ortak renk, ortam ve Execute sahnesi kullanır. System dışında 27 tema vardır.

| Ayar değeri | Tema | Arka plan | Response dokunuşu |
| --- | --- | --- | --- |
| system | System | İşletim sistemine göre sade açık/koyu | Işık/halka |
| light | Daylight | Açık ve sade | Yumuşak halka |
| dark | Midnight | Koyu ve sade | Mor ışık yayılması |
| winter | Winter | Kar | Kristaller ve buz kenarı |
| cosmic | Cosmic | Yıldızlar | Takımyıldız parçacıkları |
| rainy-night | Rainy Night | İnce yağmur | Su halkası |
| aurora | Aurora | Yeşil/mor ışık perdeleri | Kenar ışığı |
| sakura | Sakura | Pembe yapraklar | Kısa yaprak dağılımı |
| ember | Ember | Yükselen köz | Köz parçacıkları |
| ocean | Ocean | Su ışığı ve kabarcıklar | Su halkası |
| cyberpunk | Cyberpunk | Neon çizgiler | Neon kenar darbesi |
| blueprint | Blueprint | Teknik ızgara | Köşe/çizim vurgusu |
| paper | Paper & Ink | Kâğıt dokusu | Mürekkep kenarı |
| digital-rain | Digital Rain | Seyrek kod sütunları | Kenarda kod çözülmesi |
| arrakis | Arrakis | Kum tepeleri ve yatay kum | Kum solucanı geçişi |
| hyperspace | Hyperspace | Radyal yıldız alanı | Kenarda hiperuzay sıçraması |
| orient-express | Orient Express | Gece, pencere ışıkları, buhar | Işıklı tren |
| koi-garden | Koi Garden | Nilüferler, su halkaları ve koi | Dönen koi çifti |
| moonbase | Moonbase | Ay tozu ve uzak Dünya | Süzülen astronot |
| coral-reef | Coral Reef | Mercan, kabarcıklar ve ışık | Deniz kaplumbağası |
| clockwork | Clockwork | Pirinç mekanizmalar | Dişliler ve açılan kilit |
| firefly-camp | Firefly Camp | Ateş böcekleri, kamp ateşi, tilki | Ateşin yanına gelen tilki |
| air-mail | Air Mail | Kâğıt ve bulutlar | Kâğıt uçak ve açılan zarf |
| volcanic-island | Volcanic Island | Lav damarları ve kül | Dağılan lav kabarcığı |
| bosphorus | Bosphorus | Boğaz mavisi, süzülen martılar | Execute ile şehir hatları vapuru |
| autumn | Autumn | Sonbahar yaprakları | Sıcak yapraklar |
| monsoon | Monsoon | Yoğun yağmur izleri | Su halkası |
| bioluminescence | Bioluminescence | Belirip sönen ışık noktaları | Parlayan noktalar |
| orient-express | Orient Express | Gece, pencere ışıkları, buhar | Işıklı tren |
| koi-garden | Koi Garden | Nilüferler, su halkaları ve koi | Dönen koi çifti |
| moonbase | Moonbase | Ay tozu ve uzak Dünya | Süzülen astronot |
| coral-reef | Coral Reef | Mercan, kabarcıklar ve ışık | Deniz kaplumbağası |
| clockwork | Clockwork | Pirinç mekanizmalar | Dişliler ve açılan kilit |
| firefly-camp | Firefly Camp | Ateş böcekleri, kamp ateşi, tilki | Ateşin yanına gelen tilki |
| air-mail | Air Mail | Kâğıt ve bulutlar | Kâğıt uçak ve açılan zarf |
| volcanic-island | Volcanic Island | Lav damarları ve kül | Dağılan lav kabarcığı |

## Ortak davranış

İstekler bekleme, başarı, uyarı, hata ve iptal durumlarına göre tepki verir. Metin ve JSON yerinde kalır. Azaltılmış hareket tercihi dekoratif animasyonları kapatır; istek süresi görünür kalır.

Bosphorus ve Winter için gündüz, gün batımı ve gece tercihleri tarayıcıda ayrı saklanır. Sekiz yeni temanın kapsamı [THEME_PHASE_ONE.md](THEME_PHASE_ONE.md) dosyasındadır. Koi ve tilki yakınlık tepkileri yalnızca dekoratif boşlukta çalışır; form ve kontrollerde devre dışıdır.

## Eski tema seçimlerinin geçişi

| Eski | Yeni |
| --- | --- |
| forest | bioluminescence |
| terminal | digital-rain |
| sandstorm | arrakis |
| observatory | cosmic |
| infrared | ember |
| zen | paper |
| circuit | cyberpunk |
| eclipse | cosmic |
