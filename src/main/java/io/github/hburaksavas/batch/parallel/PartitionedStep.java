package io.github.hburaksavas.batch.parallel;

import javax.sql.DataSource;
import org.springframework.batch.core.job.JobInterruptedException;
import org.springframework.batch.core.step.Step;
import org.springframework.batch.core.step.StepExecution;
import org.springframework.batch.core.BatchStatus;
import org.springframework.batch.core.ExitStatus;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.beans.factory.config.ConfigurableListableBeanFactory;

/** Keeps the public step name while the original Step executes once per partition. */
final class PartitionedStep implements Step {
    private static final org.slf4j.Logger LOG = org.slf4j.LoggerFactory.getLogger(PartitionedStep.class);
    private final Step worker;
    private final PartitionSpec spec;
    private final ConfigurableListableBeanFactory beans;

    PartitionedStep(Step worker, PartitionSpec spec, ConfigurableListableBeanFactory beans) {
        this.worker = worker;
        this.spec = spec;
        this.beans = beans;
    }
    @Override public String getName() { return worker.getName(); }
    @Override public boolean isAllowStartIfComplete() { return worker.isAllowStartIfComplete(); }
    @Override public int getStartLimit() { return worker.getStartLimit(); }

    @Override public void execute(StepExecution execution) throws JobInterruptedException {
        try {
            if (execution.getStartTime() == null) execution.setStartTime(java.time.LocalDateTime.now());
            JobRepository repository = beans.getBean(JobRepository.class);
            KeyPartitioner partitioner = new KeyPartitioner(spec, execution, repository, beans.getBean(SqlResources.class),
                    beans.getBeanProvider(DataSource.class).getIfUnique());
            int concurrency = beans.getBean(ParallelProperties.class).concurrency(spec);
            Step manager = new StepBuilder(getName(), repository)
                    .partitioner(worker.getName(), partitioner)
                    .step(worker)
                    .partitionHandler(new BoundedPartitionHandler(worker, beans.getBean(SharedWorkers.class), concurrency))
                    .allowStartIfComplete(worker.isAllowStartIfComplete())
                    .startLimit(worker.getStartLimit())
                    .build();
            manager.execute(execution);
        } catch (JobInterruptedException e) { throw e; }
        catch (Exception e) {
            LOG.error("Failed to prepare partitioned step {} in job {}", getName(), spec.job(), e);
            // Source errors happen before AbstractStep executes; persist their failure explicitly.
            execution.setStatus(BatchStatus.FAILED);
            execution.setExitStatus(ExitStatus.FAILED.addExitDescription(e));
            execution.addFailureException(e);
            execution.setEndTime(java.time.LocalDateTime.now());
            beans.getBean(JobRepository.class).update(execution);
        }
    }
}
