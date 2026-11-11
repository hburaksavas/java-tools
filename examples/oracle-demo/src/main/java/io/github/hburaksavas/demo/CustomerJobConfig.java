package io.github.hburaksavas.demo;

import java.nio.charset.StandardCharsets;
import java.util.Map;
import io.github.hburaksavas.batch.parallel.*;
import org.springframework.batch.core.*;
import org.springframework.batch.core.configuration.annotation.StepScope;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.batch.core.step.tasklet.Tasklet;
import org.springframework.batch.repeat.RepeatStatus;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.*;
import org.springframework.core.io.ResourceLoader;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.transaction.PlatformTransactionManager;

@Configuration(proxyBeanMethods = false)
@EnablePartitionedSteps(job = "customerJob", steps = {"prepareStep", "processStep"},
        contextKey = "branchCode", valuesResource = "classpath:sql/find-branches.sql", concurrency = 3)
public class CustomerJobConfig {
    @Bean Job customerJob(JobRepository repository, @Qualifier("prepareStep") Step prepare,
                          @Qualifier("processStep") Step process) {
        return new JobBuilder("customerJob", repository).start(prepare).next(process).build();
    }
    @Bean Step prepareStep(JobRepository repository, PlatformTransactionManager transactions,
                           @Qualifier("prepareTasklet") Tasklet tasklet) {
        return new StepBuilder("prepareStep", repository).tasklet(tasklet, transactions).build();
    }
    @Bean Step processStep(JobRepository repository, PlatformTransactionManager transactions,
                           @Qualifier("processTasklet") Tasklet tasklet) {
        return new StepBuilder("processStep", repository).tasklet(tasklet, transactions).build();
    }
    @Bean @StepScope Tasklet prepareTasklet(@PartitionValue("branchCode") String branch,
                                            NamedParameterJdbcTemplate jdbc, ResourceLoader resources) throws Exception {
        return sqlTasklet("classpath:sql/prepare.sql", branch, jdbc, resources);
    }
    @Bean @StepScope Tasklet processTasklet(@PartitionValue("branchCode") String branch,
                                            NamedParameterJdbcTemplate jdbc, ResourceLoader resources) throws Exception {
        return sqlTasklet("classpath:sql/process.sql", branch, jdbc, resources);
    }
    private Tasklet sqlTasklet(String resource, String branch, NamedParameterJdbcTemplate jdbc,
                               ResourceLoader resources) throws Exception {
        String sql;
        try (var stream = resources.getResource(resource).getInputStream()) {
            sql = new String(stream.readAllBytes(), StandardCharsets.UTF_8);
        }
        return (contribution, chunk) -> {
            jdbc.update(sql, Map.of("branchCode", branch));
            return RepeatStatus.FINISHED;
        };
    }
}
