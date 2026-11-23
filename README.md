# Spring Batch Parallel Starter

Spring Boot **4.1.1**, Spring Batch **6.0.5** ve **Java 17** için annotation tabanlı, anahtar bazında yerel partitioning. Mevcut reader/tasklet ve SQL dosyaları uygulamada kalır; starter seçilen step'leri paralel çalıştırır.

## Kurulum

Henüz Maven Central'a yayımlanmamıştır. Java 17 ile proje klasöründe:

```powershell
.\mvnw.cmd clean install
```

Linux/macOS: `./mvnw clean install`. Uygulamanın `pom.xml` dosyasına:

```xml
<dependency>
  <groupId>io.github.hburaksavas</groupId>
  <artifactId>spring-batch-parallel-starter</artifactId>
  <version>0.1.0-SNAPSHOT</version>
</dependency>
```

Uygulama kendi JDBC sürücüsünü ve DataSource konfigürasyonunu sağlar. Starter, Boot otomatik yapılandırmasının JDBC JobRepository kurması için `spring-boot-starter-batch-jdbc` bağımlılığını getirir. Batch altyapısını `@EnableBatchProcessing` ile elle yapılandırıyorsanız JDBC repository için `@EnableJdbcJobRepository` ekleyin.

Spring Batch 5.2 metadata tablolarını kullanıyorsanız veritabanınıza uygun `org/springframework/batch/core/migration/6.0/migration-*.sql` script'ini uygulayın ve [Spring Batch 6 geçiş kılavuzunu](https://github.com/spring-projects/spring-batch/wiki/Spring-Batch-6.0-Migration-Guide) izleyin.

## Minimum kullanım

```java
import io.github.hburaksavas.batch.parallel.EnablePartitionedSteps;

@Configuration(proxyBeanMethods = false)
@EnablePartitionedSteps(
    job = "customerJob",
    steps = {"prepareStep", "processStep"},
    contextKey = "branchCode",
    valuesResource = "find-branches.sql",
    concurrency = 8
)
public class CustomerJobConfig {
    @Bean
    Job customerJob(JobRepository repository,
                    @Qualifier("prepareStep") Step prepare,
                    @Qualifier("processStep") Step process) {
        return new JobBuilder("customerJob", repository)
            .start(prepare).next(process).build();
    }
    // Mevcut Step bean'lerinizi burada tutun; @Bean dönüş tipi Step olsun.
}
```

`job` ve `steps` değerleri **Spring bean adlarıdır**. Annotation step sırasını değiştirmez; sıra job tanımından gelir. `steps` içinde olmayan step'ler normal şekilde bir kez çalışır.

`find-branches.sql` tek kolon döndürmelidir:

```sql
SELECT DISTINCT BRANCH_CODE
FROM BRANCH
WHERE ACTIVE = 1
ORDER BY BRANCH_CODE
```

Değerler JDBC `getString` ile alınır. `VARCHAR2` içindeki `001` gibi değerler korunur; NUMBER değerleri string'e çevrilir. Statik alternatif: `valuesResource` yerine `values = {"001", "002", "003"}` kullanın. İki kaynaktan tam biri zorunludur.

### SQL dosyaları için ortak kök

Varsayılan SQL kökü **`classpath:sql/`** olduğundan `src/main/resources/sql/` altındaki dosyalar için ek ayar gerekmez. Annotation'da `valuesResource = "find-branches.sql"` yazmak yeterlidir.

Kökü uygulamada bir kez değiştirebilirsiniz:

```yaml
batch:
  parallel:
    sql:
      base-path: classpath:sql/customer/
```

Bu ayarla `valuesResource = "partition/find-branches.sql"`, kaynak kodda `src/main/resources/sql/customer/partition/find-branches.sql` dosyasına karşılık gelir. `src/main/resources/` derleme sırasında classpath kökü olur; property'ye `resources/` veya Java package yolu yazılmaz. SQL dosyaları classpath altında package benzeri klasörlerde tutuluyorsa o klasörü açıkça belirtin; örneğin `classpath:com/example/batch/sql/`. `sql/customer` gibi prefix'siz kökler de classpath yolu kabul edilir.

Aynı kökü reader, writer ve tasklet içinde kullanmak için starter'ın sağladığı `SqlResources` bean'ini inject edin:

```java
@Bean
@StepScope
JdbcCursorItemReader<BatchItem> reader(@PartitionValue("branchCode") String branchCode,
                                      DataSource dataSource, SqlResources sql) throws IOException {
    return new JdbcCursorItemReaderBuilder<BatchItem>()
        .name("customerReader").dataSource(dataSource)
        .sql(sql.read("reader/read-items.sql"))
        .preparedStatementSetter(statement -> statement.setString(1, branchCode))
        .rowMapper((row, index) -> new BatchItem(row.getLong("ID"),
            row.getString("BRANCH_CODE"), row.getString("STATUS")))
        .build();
}
```

`SqlResources` import'u: `io.github.hburaksavas.batch.parallel.SqlResources`. `read` dosyayı UTF-8 SQL metni olarak okur; `resource` Spring Resource döndürür. Dosya yolları köke göre göreli olabilir. Açık `classpath:...` veya `file:...` yolları kökten bağımsız çözülür; eski `valuesResource = "classpath:sql/find-branches.sql"` kullanımı geçerliliğini korur. Kök için `file:/opt/batch/sql/` gibi harici klasör de kullanılabilir.

Bu kök annotation sorgusuna ve `SqlResources` kullanan bileşenlere uygulanır. Spring'in genel `ResourceLoader` davranışını veya `spring.sql.init.schema-locations` gibi başka property'leri değiştirmez. Tasklet ve chunk örnekleri bütün iş SQL dosyaları için bu ortak bean'i kullanır.

## Context'ten okuma

```java
@Bean
@StepScope
Tasklet processTasklet(@PartitionValue("branchCode") String branch,
                       NamedParameterJdbcTemplate jdbc) {
    return (contribution, chunkContext) -> {
        jdbc.update("UPDATE CUSTOMER SET PROCESSED = 1 WHERE BRANCH_CODE = :branchCode",
                    Map.of("branchCode", branch));
        return RepeatStatus.FINISHED;
    };
}
```

`@PartitionValue` için import: `io.github.hburaksavas.batch.parallel.PartitionValue`.
Standart `@Value("#{stepExecutionContext['branchCode']}")` da desteklenir. Reader, writer veya tasklet içinde durum tutuluyorsa partition başına ayrı nesne için `@StepScope` kullanın. Yardımcı annotation scope'u otomatik değiştirmez. Step bean'inin kendisini step-scoped yapmayın.

SQL'i context değerinden string birleştirme ile üretmek yerine bind parametresi kullanın. Starter iş SQL'ini değiştirmez veya SQL script parser'ı sağlamaz.

## Akış, hata ve restart

```text
prepareStep → [001 | 002 | 003] → tümü başarılı
processStep → [001 | 002 | 003] → tümü başarılı
```

- Her partition ayrı `StepExecution` ve context kullanır. `branchCode` job context'ine ortak bir değişken olarak yazılmaz.
- Değer sorgusu ilk seçili step'ten önce bir kez çalışır. Liste job context'ine kaydedilir; sonraki step'ler ve aynı job instance'ın restart'ı aynı snapshot'ı kullanır.
- Tekrarlanan değerler tekilleştirilir. Null/boş değer, boş liste veya birden fazla kolon hata verir. Sorgu en fazla 10.000 satır döndürebilir; gereksiz tekrarlar için `DISTINCT` kullanın.
- Partition kimlikleri saklanan listedeki sıradan türetilir. Restart sırasında contextKey değiştirmek reddedilir. Başarısız bir job devam ederken step adlarını veya iş mantığını değiştirmeyin.
- Bir worker hata verdiğinde diğer partition'lar çalışmaya devam eder; manager hepsini bekler ve başarısız olur. Sonraki step başlamaz. Starter otomatik retry eklemez; mevcut step'in retry ayarları kullanıcıya aittir.
- Varsayılan Spring Batch restart davranışında tamamlanan partition'lar atlanır. `allowStartIfComplete(true)` gibi mevcut step ayarları korunur ve tekrar çalıştırmaya neden olabilir.
- Her worker kendi step transaction/chunk ayarlarıyla çalışır. Başka şubelerde commit edilmiş işler geri alınmaz. Başarısız bir partition'da daha önce commit edilmiş chunk'lar da bulunabilir; yeniden çalıştırılabilir SQL tasarımı uygulamanın sorumluluğudur.
- Restart için aynı identifying JobParameters ve kalıcı JobRepository kullanın. Yeni parametreyle başlatma yeni bir job instance ve yeni değer sorgusu demektir.

## Paralellik ayarları

```yaml
batch:
  parallel:
    max-workers: 8
    queue-capacity: 32
    jobs:
      customerJob:
        concurrency: 4
```

Job property değeri annotation'daki `concurrency` değerini ezer. Bu sınır her manager step execution için geçerlidir. `max-workers` aynı uygulama context'indeki bütün job execution'ların paylaştığı kesin üst sınırdır. Kuyruk dolduğunda manager kapasite bekler; iş atılmaz ve manager thread'inde worker çalıştırılmaz. `queue-capacity: 0` kuyruksuz çalışmadır.

DataSource havuzunda worker'lara ek olarak manager ve Batch metadata işlemleri için de bağlantı payı bırakın. Bu havuz JVM'ler arasında ortak değildir. Kapanışta 30 saniye beklenir; süre aşımında kalan işler kesilmeye çalışılır ve kuyruktakiler iptal edilir. JDBC driver timeout ayarları uygulama tarafından yapılır.

## Log ve metrikler

Partition başlangıcı/bitişi loglanır. Worker sırasında MDC alanları:
`batchJob`, `batchStep`, `batchPartition`, `batchPartitionValue`. İş bitiminde önceki MDC geri yüklenir.

Tek bir `MeterRegistry` mevcutsa:

| Metrik | Tür | Etiketler |
| --- | --- | --- |
| `batch.parallel.workers.active` | Gauge | — |
| `batch.parallel.partitions.pending` | Gauge | — |
| `batch.parallel.partition.duration` | Timer | job, step, outcome |
| `batch.parallel.partitions` | Counter | job, step, outcome |

`outcome`: `success` veya `failure`. Pending, worker havuzuna kabul edilmiş ama başlamamış iş sayısıdır; kapasite bekleyen veya henüz oluşturulmamış işler dahil değildir. Şube değeri metrik etiketi yapılmaz. Kaynak sorgusu hataları worker metriği üretmez; job/step metadata'sında hata olarak görünür. Actuator endpoint'lerini açmak uygulamanın tercihidir.

## Desteklenen kapsam

- Tek JVM, sıralı `SimpleJob`, `AbstractStep` tabanlı normal Step bean'leri.
- Step'leri job'a bean injection ile verin. `@Configuration(proxyBeanMethods = true)` ile doğrudan `@Bean` çağrısı da test edilmiştir. `proxyBeanMethods = false` ile doğrudan çağrı sarmalamayı atlar ve başlangıçta reddedilir.
- Seçilen step'in başka bir job ile paylaşılması desteklenmez. Bir job için tek annotation kullanılır. Aynı isimde tekrarlanan step'ler ve nested partitioning kullanılmamalıdır.
- FlowJob, split/conditional flow, remote partitioning ve native-image kapsam dışıdır.
- SQL kaynağı için tek/primary DataSource gerekir. Ayrı datasource seçimi ve JobParameters'tan partition sorgusuna parametre bağlama bu sürümde yoktur.

## Çalıştırılabilir SQL örneği

[examples/oracle-demo](examples/oracle-demo) iki step'li, SQL dosyalarını okuyup çalıştıran tam Spring Boot uygulamasıdır.

```powershell
.\mvnw.cmd clean install
.\mvnw.cmd -f examples/oracle-demo/pom.xml package
java -jar examples/oracle-demo/target/parallel-oracle-demo-0.1.0-SNAPSHOT.jar --spring.profiles.active=h2
```

H2 profili Oracle SQL modu kullanır; uygulama bütün örnek kayıtların `DONE` olduğunu doğrulayıp kapanır. Bu profil gerçek Oracle testinin yerine geçmez.

### Reader–processor–writer (chunk) örneği

[ChunkCustomerJobConfig.java](examples/oracle-demo/src/main/java/io/github/hburaksavas/demo/ChunkCustomerJobConfig.java) aynı annotation ile iki chunk step'i çalıştırır. `chunk` profili tasklet konfigürasyonu yerine bu konfigürasyonu seçer:

```powershell
.\mvnw.cmd -f examples/oracle-demo/pom.xml package
java -jar examples/oracle-demo/target/parallel-oracle-demo-0.1.0-SNAPSHOT.jar --spring.profiles.active=h2,chunk
```

Oracle için yalnızca `--spring.profiles.active=chunk` kullanın ve aşağıdaki Oracle kurulumunu yapın.

- **Reader:** Her partition için `@StepScope` ile ayrı `JdbcCursorItemReader<BatchItem>` oluşturulur. `@PartitionValue("branchCode")` değeri [read-items.sql](examples/oracle-demo/src/main/resources/sql/read-items.sql) dosyasındaki `?` parametresine bağlanır; reader yalnızca kendi şubesini okur.
- **Processor:** İlk step `NEW → READY`, ikinci step `READY → DONE` dönüşümü yapar. Beklenen durumda olmayan kayıtlar `null` döndürülerek filtrelenir. İlk processor stateless singleton'dır. İkinci processor `@StepScope` ve `@PartitionValue("branchCode")` kullanarak kaydın kendi şubesine ait olduğunu da doğrular; context'e processor içinden erişimi gösterir.
- **Writer:** [write-item.sql](examples/oracle-demo/src/main/resources/sql/write-item.sql) ile hem ID hem şube koduna göre JDBC batch update yapılır. Stateless `JdbcBatchItemWriter` paylaşılır; her partition kendi transaction'ında ikişer kayıtlık chunk'lar commit eder.
- **Bariyer:** Bütün şubeler `prepareStep`'i tamamladıktan sonra `processStep` başlar; tasklet örneğiyle aynı kural geçerlidir.

Reader restart pozisyonunu saklar. Bu yüzden SELECT, writer'ın değiştirdiği `STATUS` kolonuyla filtrelenmez; durum kontrolü processor'dadır. Restart sırasında okunan kayıt kümesi ve ID sırası sabit kalmalıdır. İşlenirken kaynak kayıtlar eklenip silinebiliyorsa üretim uygulamasında snapshot veya farklı bir restart stratejisi tasarlayın.

Örneğin temel reader tanımı:

```java
@Bean
@StepScope
JdbcCursorItemReader<BatchItem> prepareReader(
        @PartitionValue("branchCode") String branchCode,
        DataSource dataSource, SqlResources sql) throws IOException {
    return new JdbcCursorItemReaderBuilder<BatchItem>()
        .name("prepareReader")
        .dataSource(dataSource)
        .sql(sql.read("read-items.sql"))
        .preparedStatementSetter(statement -> statement.setString(1, branchCode))
        .rowMapper((row, index) -> new BatchItem(row.getLong("ID"),
            row.getString("BRANCH_CODE"), row.getString("STATUS")))
        .build();
}
```

Tam örnekte aynı SQL resource dosyasından okunur. [ChunkCustomerJobTest](examples/oracle-demo/src/test/java/io/github/hburaksavas/demo/ChunkCustomerJobTest.java), altı worker execution'ın şube bazında doğru sayıda kayıt okuyup yazdığını, tüm kayıtların `DONE` olduğunu ve ikinci step'in birinciyi beklediğini doğrular.

Oracle için önce uygulamanın kullandığı Spring Batch sürümünün `org/springframework/batch/core/schema-oracle.sql` script'iyle metadata tablolarını kurun. Ayrı bir demo şemasında `examples/oracle-demo/src/main/resources/sql/demo-schema.sql` dosyasını çalıştırın. Ardından `ORACLE_URL`, `ORACLE_USERNAME`, `ORACLE_PASSWORD` ortam değişkenlerini ayarlayıp H2 profili olmadan JAR'ı çalıştırın. Örnek SQL dosyaları JDBC statement'larıdır; sonunda SQL*Plus `/` veya `;` ayırıcıları bulunmaz. Her yeni demo job instance'ı için `run=2` gibi yeni identifying parametre verilebilir.

## Doğrulama

Java 17'de `./mvnw verify`: gerçek JDBC JobRepository ile context izolasyonu, step bariyeri, hata/restart, değer snapshot'ı, statik kaynak, ortak worker sınırı, property override ve geçersiz konfigürasyon testleri. CI aynı Java sürümünde starter ve örnek uygulamayı derler. Gerçek Oracle sunucusunda doğrulama ayrıca yapılmalıdır.
