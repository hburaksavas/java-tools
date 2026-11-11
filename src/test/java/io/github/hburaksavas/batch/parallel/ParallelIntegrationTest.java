package io.github.hburaksavas.batch.parallel;

import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;
import javax.sql.DataSource;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import org.junit.jupiter.api.Test;
import org.springframework.batch.core.*;
import org.springframework.batch.core.configuration.annotation.*;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.batch.core.step.tasklet.Tasklet;
import org.springframework.batch.repeat.RepeatStatus;
import org.springframework.beans.factory.annotation.*;
import org.springframework.context.annotation.*;
import org.springframework.core.env.MapPropertySource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.jdbc.datasource.embedded.*;
import org.springframework.transaction.PlatformTransactionManager;
import static org.assertj.core.api.Assertions.*;

class ParallelIntegrationTest {
    static AnnotationConfigApplicationContext context(Class<?> config, Map<String, Object> properties) {
        var context = new AnnotationConfigApplicationContext();
        context.getEnvironment().getPropertySources().addFirst(new MapPropertySource("test", properties));
        context.register(Infrastructure.class, config);
        try { context.refresh(); return context; }
        catch (RuntimeException e) { context.close(); throw e; }
    }
    static JobExecution run(AnnotationConfigApplicationContext c, long id) throws Exception {
        return c.getBean(JobLauncher.class).run(c.getBean("customerJob", Job.class),
                new JobParametersBuilder().addLong("run", id).toJobParameters());
    }

    @Test void databaseValuesAreIsolatedAndEveryStepWaitsForAllBranches() throws Exception {
        try (var c = context(DatabaseJob.class, Map.of("batch.parallel.max-workers", 2))) {
            Tracker tracker = c.getBean(Tracker.class);
            // The SQL source must not be queried again at the next step.
            tracker.afterPrepare = () -> c.getBean(JdbcTemplate.class).execute("drop table branches");
            JobExecution execution = run(c, 1);
            assertThat(execution.getStatus()).isEqualTo(BatchStatus.COMPLETED);
            assertThat(tracker.prepared).containsExactlyInAnyOrder("001", "002", "003");
            assertThat(tracker.processed).containsExactlyInAnyOrder("001", "002", "003");
            assertThat(tracker.barrierViolation.get()).isFalse();
            assertThat(tracker.max.get()).isEqualTo(2);
            assertThat(execution.getStepExecutions()).filteredOn(e -> e.getStepName().contains(":"))
                    .hasSize(6).allSatisfy(e -> assertThat(e.getExecutionContext().getString("branchCode")).isIn("001", "002", "003"));
            SimpleMeterRegistry registry = c.getBean(SimpleMeterRegistry.class);
            assertThat(registry.get("batch.parallel.partitions").tag("outcome", "success").counters()
                    .stream().mapToDouble(counter -> counter.count()).sum()).isEqualTo(6);
            assertThat(registry.get("batch.parallel.workers.active").gauge().value()).isZero();
            assertThat(registry.getMeters()).allSatisfy(m -> assertThat(m.getId().getTags())
                    .noneMatch(tag -> tag.getKey().equals("branchCode")));
        }
    }

    @Test void failureWaitsForWorkersAndRestartOnlyRunsFailedPartitionWithOriginalValues() throws Exception {
        try (var c = context(DatabaseJob.class, Map.of("batch.parallel.max-workers", 2))) {
            Tracker tracker = c.getBean(Tracker.class);
            tracker.failOnce.set(true);
            JobExecution failed = run(c, 2);
            assertThat(failed.getStatus()).isEqualTo(BatchStatus.FAILED);
            assertThat(tracker.active.get()).isZero();
            assertThat(tracker.processed).isEmpty();
            assertThat(tracker.attempts.get("001").get()).isEqualTo(1);
            assertThat(tracker.attempts.get("002").get()).isEqualTo(1);
            assertThat(tracker.attempts.get("003").get()).isEqualTo(1);
            c.getBean(JdbcTemplate.class).update("insert into branches values ('004')");
            JobExecution restarted = run(c, 2);
            assertThat(restarted.getStatus()).isEqualTo(BatchStatus.COMPLETED);
            assertThat(tracker.attempts.get("001").get()).isEqualTo(1);
            assertThat(tracker.attempts.get("002").get()).isEqualTo(2);
            assertThat(tracker.attempts.get("003").get()).isEqualTo(1);
            assertThat(tracker.processed).containsExactlyInAnyOrder("001", "002", "003");
            assertThat(tracker.attempts).doesNotContainKey("004");
            assertThat(tracker.barrierViolation.get()).isFalse();
            assertThat(c.getBean(SimpleMeterRegistry.class).get("batch.parallel.partitions")
                    .tag("outcome", "failure").counter().count()).isEqualTo(1);
        }
    }

    @Test void propertyOverridesAnnotationConcurrency() throws Exception {
        try (var c = context(StaticJob.class, Map.of("batch.parallel.max-workers", 4,
                "batch.parallel.jobs.customerJob.concurrency", 1))) {
            assertThat(run(c, 3).getStatus()).isEqualTo(BatchStatus.COMPLETED);
            assertThat(c.getBean(Tracker.class).max.get()).isEqualTo(1);
        }
    }

    @Test void simultaneousJobExecutionsShareTheGlobalWorkerLimitWithNoQueue() throws Exception {
        try (var c = context(StaticJob.class, Map.of("batch.parallel.max-workers", 2,
                "batch.parallel.queue-capacity", 0))) {
            ExecutorService callers = Executors.newFixedThreadPool(2);
            try {
                Future<JobExecution> first = callers.submit(() -> run(c, 4));
                Future<JobExecution> second = callers.submit(() -> run(c, 5));
                assertThat(first.get(20, TimeUnit.SECONDS).getStatus()).isEqualTo(BatchStatus.COMPLETED);
                assertThat(second.get(20, TimeUnit.SECONDS).getStatus()).isEqualTo(BatchStatus.COMPLETED);
                assertThat(c.getBean(Tracker.class).max.get()).isEqualTo(2);
                assertThat(c.getBean(Tracker.class).processed).hasSize(6);
            } finally { callers.shutdownNow(); }
        }
    }

    @Test void invalidSourceAndUnknownStepFailAtStartup() {
        assertThatThrownBy(() -> context(BothSources.class, Map.of())).hasStackTraceContaining("exactly one");
        assertThatThrownBy(() -> context(MissingStep.class, Map.of())).hasStackTraceContaining("missingStep");
        assertThatThrownBy(() -> context(StaticJob.class, Map.of("batch.parallel.max-workers", 0)))
                .hasStackTraceContaining("maxWorkers");
        assertThatThrownBy(() -> context(WrongJob.class, Map.of())).hasStackTraceContaining("unknownJob");
        assertThatThrownBy(() -> context(WrongMembership.class, Map.of())).hasStackTraceContaining("not wrapped in job");
        assertThatThrownBy(() -> context(BypassedBeans.class, Map.of())).hasStackTraceContaining("not wrapped in job");
    }

    @Test void twoDifferentJobsShareTheWorkerLimit() throws Exception {
        try (var c = context(TwoJobs.class, Map.of("batch.parallel.max-workers", 2,
                "batch.parallel.queue-capacity", 1))) {
            ExecutorService callers = Executors.newFixedThreadPool(2);
            try {
                Future<JobExecution> first = callers.submit(() -> run(c, 8));
                Future<JobExecution> second = callers.submit(() -> c.getBean(JobLauncher.class).run(
                        c.getBean("secondJob", Job.class), new JobParametersBuilder().addLong("run", 8L).toJobParameters()));
                assertThat(first.get(20, TimeUnit.SECONDS).getStatus()).isEqualTo(BatchStatus.COMPLETED);
                assertThat(second.get(20, TimeUnit.SECONDS).getStatus()).isEqualTo(BatchStatus.COMPLETED);
                assertThat(c.getBean(Tracker.class).max.get()).isEqualTo(2);
                assertThat(c.getBean(Tracker.class).prepared).hasSize(6);
            } finally { callers.shutdownNow(); }
        }
    }

    @Test void mdcDoesNotLeakIntoTheNextWorkerTask() throws Exception {
        try (var c = context(StaticJob.class, Map.of("batch.parallel.max-workers", 1))) {
            assertThat(run(c, 9).getStatus()).isEqualTo(BatchStatus.COMPLETED);
            FutureTask<Map<String, String>> check = new FutureTask<>(org.slf4j.MDC::getCopyOfContextMap);
            c.getBean(SharedWorkers.class).execute(check);
            Map<String, String> context = check.get(5, TimeUnit.SECONDS);
            assertThat(context == null || context.keySet().stream().noneMatch(key -> key.startsWith("batch"))).isTrue();
        }
    }

    @Test void emptyAndNullSourcesFailWithoutRunningWorkers() throws Exception {
        try (var c = context(DatabaseJob.class, Map.of())) {
            JdbcTemplate jdbc = c.getBean(JdbcTemplate.class);
            jdbc.update("delete from branches");
            assertThat(run(c, 6).getStatus()).isEqualTo(BatchStatus.FAILED);
            assertThat(c.getBean(Tracker.class).prepared).isEmpty();
            jdbc.update("insert into branches values (null)");
            assertThat(run(c, 7).getStatus()).isEqualTo(BatchStatus.FAILED);
            assertThat(c.getBean(Tracker.class).prepared).isEmpty();
        }
    }

    @Configuration(proxyBeanMethods = false)
    @EnableBatchProcessing
    @Import(ParallelAutoConfiguration.class)
    static class Infrastructure {
        @Bean(destroyMethod = "shutdown") EmbeddedDatabase dataSource() {
            return new EmbeddedDatabaseBuilder().generateUniqueName(true).setType(EmbeddedDatabaseType.H2)
                    .addScript("org/springframework/batch/core/schema-h2.sql")
                    .addScript("branches.sql").build();
        }
        @Bean PlatformTransactionManager transactionManager(DataSource ds) { return new DataSourceTransactionManager(ds); }
        @Bean JdbcTemplate jdbcTemplate(DataSource ds) { return new JdbcTemplate(ds); }
        @Bean SimpleMeterRegistry meterRegistry() { return new SimpleMeterRegistry(); }
        @Bean Tracker tracker() { return new Tracker(); }
    }

    static class Tracker {
        final List<String> prepared = new CopyOnWriteArrayList<>();
        final List<String> processed = new CopyOnWriteArrayList<>();
        final Map<String, AtomicInteger> attempts = new ConcurrentHashMap<>();
        final AtomicInteger active = new AtomicInteger();
        final AtomicInteger max = new AtomicInteger();
        final AtomicBoolean barrierViolation = new AtomicBoolean();
        final AtomicBoolean failOnce = new AtomicBoolean();
        volatile Runnable afterPrepare = () -> {};
        void prepare(String branch) throws Exception {
            attempts.computeIfAbsent(branch, k -> new AtomicInteger()).incrementAndGet();
            int running = active.incrementAndGet();
            max.accumulateAndGet(running, Math::max);
            try {
                Thread.sleep(40);
                if (branch.equals("002") && failOnce.compareAndSet(true, false)) throw new IllegalStateException("test failure");
                prepared.add(branch);
                if (prepared.size() == 3) afterPrepare.run();
            } finally { active.decrementAndGet(); }
        }
    }

    static class Pipeline {
        @Autowired JobRepository repository;
        @Autowired PlatformTransactionManager transactionManager;
        @Autowired Tracker tracker;
        @Bean Job customerJob() { return new JobBuilder("customerJob", repository).start(prepareStep()).next(processStep()).build(); }
        @Bean Step prepareStep() { return new StepBuilder("prepareStep", repository).tasklet(prepareTasklet(null), transactionManager).build(); }
        @Bean Step processStep() { return new StepBuilder("processStep", repository).tasklet(processTasklet(null), transactionManager).build(); }
        @Bean @StepScope Tasklet prepareTasklet(@PartitionValue("branchCode") String branch) {
            return (contribution, chunk) -> { tracker.prepare(branch); return RepeatStatus.FINISHED; };
        }
        @Bean @StepScope Tasklet processTasklet(@Value("#{stepExecutionContext['branchCode']}") String branch) {
            return (contribution, chunk) -> {
                if (!tracker.prepared.containsAll(List.of("001", "002", "003"))) tracker.barrierViolation.set(true);
                tracker.processed.add(branch);
                return RepeatStatus.FINISHED;
            };
        }
    }

    @Configuration
    @EnablePartitionedSteps(job = "customerJob", steps = {"prepareStep", "processStep"},
            contextKey = "branchCode", valuesResource = "classpath:find-branches.sql", concurrency = 3)
    static class DatabaseJob extends Pipeline {}

    @Configuration
    @EnablePartitionedSteps(job = "customerJob", steps = {"prepareStep", "processStep"},
            contextKey = "branchCode", values = {"001", "002", "003", "003"}, concurrency = 3)
    static class StaticJob extends Pipeline {}

    @Configuration
    @EnablePartitionedSteps(job = "customerJob", steps = "prepareStep", contextKey = "branchCode",
            values = "001", valuesResource = "classpath:find-branches.sql")
    static class BothSources extends Pipeline {}

    @Configuration
    @EnablePartitionedSteps(job = "customerJob", steps = "missingStep", contextKey = "branchCode", values = "001")
    static class MissingStep extends Pipeline {}

    @Configuration
    @EnablePartitionedSteps(job = "unknownJob", steps = "prepareStep", contextKey = "branchCode", values = "001")
    static class WrongJob extends Pipeline {}

    @Configuration
    @EnablePartitionedSteps(job = "otherJob", steps = "prepareStep", contextKey = "branchCode", values = "001")
    static class WrongMembership extends Pipeline {
        @Bean Job otherJob() {
            Step unrelated = new StepBuilder("unrelated", repository)
                    .tasklet((c, x) -> RepeatStatus.FINISHED, transactionManager).build();
            return new JobBuilder("otherJob", repository).start(unrelated).build();
        }
    }

    @Configuration(proxyBeanMethods = false)
    @EnablePartitionedSteps(job = "customerJob", steps = "prepareStep", contextKey = "branchCode", values = "001")
    static class BypassedBeans extends Pipeline {}

    @Configuration(proxyBeanMethods = false)
    @Import({StaticJob.class, SecondJob.class})
    static class TwoJobs {}

    @Configuration(proxyBeanMethods = false)
    @EnablePartitionedSteps(job = "secondJob", steps = "secondStep", contextKey = "branchCode",
            values = {"001", "002", "003"}, concurrency = 3)
    static class SecondJob {
        @Bean Job secondJob(JobRepository repository, @Qualifier("secondStep") Step step) {
            return new JobBuilder("secondJob", repository).start(step).build();
        }
        @Bean Step secondStep(JobRepository repository, PlatformTransactionManager transactions,
                              @Qualifier("secondTasklet") Tasklet tasklet) {
            return new StepBuilder("secondStep", repository).tasklet(tasklet, transactions).build();
        }
        @Bean @StepScope Tasklet secondTasklet(@PartitionValue("branchCode") String branch, Tracker tracker) {
            return (c, x) -> { tracker.prepare(branch); return RepeatStatus.FINISHED; };
        }
    }
}
