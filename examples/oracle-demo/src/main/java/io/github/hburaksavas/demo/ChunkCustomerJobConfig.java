package io.github.hburaksavas.demo;

import javax.sql.DataSource;
import io.github.hburaksavas.batch.parallel.EnablePartitionedSteps;
import io.github.hburaksavas.batch.parallel.PartitionValue;
import io.github.hburaksavas.batch.parallel.SqlResources;
import org.springframework.batch.core.*;
import org.springframework.batch.core.configuration.annotation.StepScope;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.batch.item.ItemProcessor;
import org.springframework.batch.item.database.JdbcBatchItemWriter;
import org.springframework.batch.item.database.JdbcCursorItemReader;
import org.springframework.batch.item.database.builder.JdbcBatchItemWriterBuilder;
import org.springframework.batch.item.database.builder.JdbcCursorItemReaderBuilder;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.*;
import org.springframework.transaction.PlatformTransactionManager;

/** Same partition annotation as the tasklet example; chunk components remain standard Batch beans. */
@Configuration(proxyBeanMethods = false)
@Profile("chunk")
@EnablePartitionedSteps(job = "customerJob", steps = {"prepareStep", "processStep"},
        contextKey = "branchCode", valuesResource = "find-branches.sql", concurrency = 3)
public class ChunkCustomerJobConfig {
    @Bean Job customerJob(JobRepository repository, @Qualifier("prepareStep") Step prepare,
                          @Qualifier("processStep") Step process) {
        return new JobBuilder("customerJob", repository).start(prepare).next(process).build();
    }

    @Bean Step prepareStep(JobRepository repository, PlatformTransactionManager transactions,
                           @Qualifier("prepareReader") JdbcCursorItemReader<BatchItem> reader,
                           @Qualifier("prepareProcessor") ItemProcessor<BatchItem, BatchItem> processor,
                           JdbcBatchItemWriter<BatchItem> writer) {
        return new StepBuilder("prepareStep", repository)
                .<BatchItem, BatchItem>chunk(2, transactions)
                .reader(reader).processor(processor).writer(writer).build();
    }

    @Bean Step processStep(JobRepository repository, PlatformTransactionManager transactions,
                           @Qualifier("processReader") JdbcCursorItemReader<BatchItem> reader,
                           @Qualifier("processProcessor") ItemProcessor<BatchItem, BatchItem> processor,
                           JdbcBatchItemWriter<BatchItem> writer) {
        return new StepBuilder("processStep", repository)
                .<BatchItem, BatchItem>chunk(2, transactions)
                .reader(reader).processor(processor).writer(writer).build();
    }

    @Bean @StepScope
    JdbcCursorItemReader<BatchItem> prepareReader(@PartitionValue("branchCode") String branchCode,
                                                DataSource dataSource, SqlResources resources) throws Exception {
        return reader("prepareReader", "read-items.sql", branchCode, dataSource, resources);
    }

    @Bean @StepScope
    JdbcCursorItemReader<BatchItem> processReader(@PartitionValue("branchCode") String branchCode,
                                                DataSource dataSource, SqlResources resources) throws Exception {
        return reader("processReader", "read-items.sql", branchCode, dataSource, resources);
    }

    @Bean ItemProcessor<BatchItem, BatchItem> prepareProcessor() {
        return item -> "NEW".equals(item.status()) ? new BatchItem(item.id(), item.branchCode(), "READY") : null;
    }

    @Bean @StepScope
    ItemProcessor<BatchItem, BatchItem> processProcessor(@PartitionValue("branchCode") String branchCode) {
        return item -> {
            if (!branchCode.equals(item.branchCode())) {
                throw new IllegalStateException("Reader returned an item belonging to another branch");
            }
            return "READY".equals(item.status()) ? new BatchItem(item.id(), branchCode, "DONE") : null;
        };
    }

    // The stateless JDBC batch writer can be shared by partitions.
    @Bean JdbcBatchItemWriter<BatchItem> itemWriter(DataSource dataSource, SqlResources resources) throws Exception {
        return new JdbcBatchItemWriterBuilder<BatchItem>()
                .dataSource(dataSource).sql(resources.read("write-item.sql"))
                .itemPreparedStatementSetter((item, statement) -> {
                    statement.setString(1, item.status());
                    statement.setLong(2, item.id());
                    statement.setString(3, item.branchCode());
                }).assertUpdates(true).build();
    }

    private JdbcCursorItemReader<BatchItem> reader(String name, String resource, String branchCode,
                                                  DataSource dataSource, SqlResources resources) throws Exception {
        return new JdbcCursorItemReaderBuilder<BatchItem>()
                .name(name).dataSource(dataSource).sql(resources.read(resource))
                .preparedStatementSetter(statement -> statement.setString(1, branchCode))
                .rowMapper((row, index) -> new BatchItem(row.getLong("ID"), row.getString("BRANCH_CODE"),
                        row.getString("STATUS")))
                .build();
    }

}
