# Tema ve response kataloğu — 0.3.26

Studio ve standart Swagger ortak renk ve ortam kullanır. Execute sahneleri yalnız API Studio içinde çalışır. System dışında 35 tema vardır.

| Ayar değeri | Tema | Arka plan | Response dokunuşu |
| --- | --- | --- | --- |
| system | System | İşletim sistemine göre sade açık/koyu | Işık/halka |
| light | Daylight | Açık ve sade | Yumuşak halka |
| dark | Midnight | Koyu ve sade | Mor ışık yayılması |
| winter | Winter | Kar | Kristaller ve buz kenarı |
| rainy-night | Rainy Night | İnce yağmur | Su halkası |
| sakura | Sakura | Pembe yapraklar | Kısa yaprak dağılımı |
| ocean | Ocean | Su ışığı ve kabarcıklar | Su halkası |
| cyberpunk | Cyberpunk | Neon çizgiler | Neon kenar darbesi |
| paper | Paper & Ink | Kâğıt dokusu | Mürekkep kenarı |
| digital-rain | Digital Rain | Seyrek kod sütunları | Kenarda kod çözülmesi |
| orient-express | Orient Express | Gece, pencere ışıkları, buhar | Işıklı tren |
| koi-garden | Koi Garden | Nilüferler, su halkaları ve koi | Dönen koi çifti |
| moonbase | Moonbase | Ay tozu ve uzak Dünya | Süzülen astronot |
| coral-reef | Coral Reef | Mercan, kabarcıklar ve ışık | Deniz kaplumbağası |
| air-mail | Air Mail | Kâğıt ve bulutlar | Kâğıt uçak ve açılan zarf |
| volcanic-island | Volcanic Island | Lav damarları ve kül | Parlayan krater, lav akışı, duman ve püsküren korlar |
| bosphorus | Bosphorus | Boğaz mavisi, süzülen martılar | Execute ile şehir hatları vapuru |
| plasma-globe | Plasma Globe | Etkileşimli plasma sahnesi | Aynı sahnede istek tepkisi |
| pendulum-wave | Pendulum Wave | Etkileşimli pendulums sahnesi | Aynı sahnede istek tepkisi |
| ink-in-water | Ink in Water | Etkileşimli ink-water sahnesi | Aynı sahnede istek tepkisi |
| wind-tunnel | Wind Tunnel | Etkileşimli wind sahnesi | Aynı sahnede istek tepkisi |
| paper-city | Paper City | Etkileşimli paper-city sahnesi | Mevcut sahnede istek tepkisi |
| cable-car | Cable Car | Etkileşimli cable-car sahnesi | Mevcut sahnede istek tepkisi |
| watchmaker | Watchmaker | Etkileşimli watchmaker sahnesi | Mevcut sahnede istek tepkisi |
| bonsai-seasons | Bonsai Seasons | Etkileşimli bonsai-seasons sahnesi | Mevcut sahnede istek tepkisi |
| silk-lanterns | Silk Lanterns | Etkileşimli silk-lanterns sahnesi | Mevcut sahnede istek tepkisi |
| miniature-harbor | Miniature Harbor | Etkileşimli miniature-harbor sahnesi | Mevcut sahnede istek tepkisi |
| darkroom | Darkroom | Etkileşimli darkroom sahnesi | Mevcut sahnede istek tepkisi |
| prism-room | Prism Room | Etkileşimli prism sahnesi | Aynı sahnede istek tepkisi |
| kinetic-sand | Kinetic Sand | Koyu taş, sıcak kum ve fareyle açılan geçici izler | Aynı kum yüzeyinde hareket |
| ripple-tank | Ripple Tank | Petrol mavisi, dokunmayla yayılan girişim dalgaları | Aynı dalga havuzunda istek darbeleri |
| magnetic-lab | Magnetic Lab | Grafit ve bakır, metal bilyeler ve mıknatıs | Aynı sahnede alan akışı; fare yakınlığında bükülen çizgiler |
| marble-run | Marble Run | Füme, cam rampalar ve dönen çark | Parkurda ilerleyen cam bilye |
| neon-bowling | Neon Bowling | Mor neon pist ve iki atışlı mini oyun | Başarıda strike, hatada oluk |
| cappadocia | Cappadocia | Güneş doğmadan mavi-pembe şafak, peribacaları ve yükselen balonlar | Balon kalkışı ve aralıklı brülör ışığı |
| autumn | Autumn | Sonbahar yaprakları | Sıcak yapraklar |

## Ortak davranış

Neon Bowling'de topa tıklayarak atış yapın. Topu geriye çekerek gücü, yana kaydırarak başlangıç noktasını ayarlayın. Topu bırakınca o noktadan düz yuvarlanır. Klavyede ok tuşlarını, ardından Enter veya Boşluk tuşunu kullanın. İlk atıştan sonra ayakta kalan lobutlarla devam edilir. Tüm lobutlar devrilince veya ikinci atış bitince yeni dizilim otomatik kurulur. API isteği tamamlanınca oyun kaldığı tura döner.

İstekler bekleme, başarı, uyarı, hata ve iptal durumlarına göre tepki verir. Metin ve JSON yerinde kalır. Azaltılmış hareket tercihi dekoratif animasyonları kapatır; istek süresi görünür kalır.

Bosphorus ve Winter için gündüz ve gece tercihleri tarayıcıda ayrı saklanır. Sekiz yeni temanın kapsamı [THEME_PHASE_ONE.md](THEME_PHASE_ONE.md) dosyasındadır. Koi ve tilki yakınlık tepkileri yalnızca dekoratif boşlukta çalışır; form ve kontrollerde devre dışıdır.

## Eski tema seçimlerinin geçişi

Kaldırılan seçimler mevcut temalara yönlendirilir. Bosphorus yalnız Day ve Night sunar; eski default ve sunset seçimleri Day olur. Winter da yalnız Day ve Night sunar; eski default ve sunset seçimleri Day olur.
