# Tema ve response kataloğu — 0.3.0

Tüm temalar hem Studio hem standart Swagger'da çalışır. Renk, arka plan ve response tepkisi tek seçimle değişir. `System` dışında 19 tema vardır.

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
| autumn | Autumn | Sonbahar yaprakları | Sıcak yapraklar |
| monsoon | Monsoon | Yoğun yağmur izleri | Su halkası |
| bioluminescence | Bioluminescence | Belirip sönen ışık noktaları | Parlayan noktalar |
| digital-rain | Digital Rain | Seyrek kod sütunları | Kenarda kod çözülmesi |
| arrakis | Arrakis | Kum tepeleri ve yatay kum | Kum solucanı geçişi |
| hyperspace | Hyperspace | Radyal yıldız alanı | Kenarda hiperuzay sıçraması |

## İstek durumları

- Bekleme: temanın kenar ilerlemesi; Cosmic/Circuit/Bioluminescence için dolaşan ışık.
- 2xx: temaya özgü yaklaşık bir saniyelik başarı tepkisi.
- 3xx/4xx: kehribar uyarı kenarı; HTTP durum etiketi görünür kalır.
- 5xx ve ağ hatası: belirgin hata kenarı; metin ve JSON yerinde kalır.
- İptal: bekleme hareketi söner.

Efektler panelin konumunu değiştirmez; veri üzerine katman basmaz, tıklamaları yakalamaz ve istek içeriğini okumaz. Hareket azaltma tercihinde arka plan animasyonları kapanır ve response yalnız sabit kenar vurgusu gösterir. Efekt katmanları tamamlanınca temizlenir; en fazla altı eşzamanlı response katmanı tutulur.

Standart Swagger entegrasyonu initializer'a bir Swagger plugin'i ekler. Mevcut plugin'ler, auth, request/response interceptor'ları ve action dönüş değerleri korunur. Özel uygulamalar Swagger'ı kendileri başlatıyorsa `response-effects.js` dosyasını bu başlatmadan önce yüklemelidir.

## Canlı deneme

Java örneğinde `/api/demo-response` endpoint'ini seçin. `status=200`, `404` veya `503`; `delayMillis=2000` ile bekleme ve sonucu gözleyin. Gecikme sırasında Studio'da **Cancel** ile iptali deneyin. Gecikme 0–5000 ms arasında sınırlandırılır. Bu endpoint yalnız örnek uygulamadadır.

| bosphorus | Bosphorus | Boğaz mavisi, süzülen martılar | Execute ile şehir hatları vapuru |

Ocean, Winter ve Sakura (0.3.11): ufukta su yansımaları ve köpük izi; rüzgârla savrulan kar ve kristalleşme; farklı tonlarda çentikli taç yapraklar ve köşede çiçeklenme.

0.3.12: Ocean’da yüzeye çıkan balina; Winter’da kar toplarından oluşan kardan adam; Rainy Night ve Monsoon’da uzak şimşek ve Execute fırtına bulutu.

## Kaldırılan temaların geçişi (0.3.16)

Eski tarayıcı seçimleri ve yapılandırma değerleri aşağıdaki temalara taşınır:

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
