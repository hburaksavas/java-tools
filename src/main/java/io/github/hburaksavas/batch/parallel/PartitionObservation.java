package io.github.hburaksavas.batch.parallel;

import java.util.Map;
import io.micrometer.core.instrument.*;
import org.slf4j.*;
import org.springframework.batch.core.step.StepExecution;
import org.springframework.batch.core.BatchStatus;
import org.springframework.batch.core.ExitStatus;
import org.springframework.batch.core.listener.StepExecutionListener;

final class PartitionObservation implements StepExecutionListener {
    private static final Logger LOG = LoggerFactory.getLogger(PartitionObservation.class);
    private final String key;
    private final MeterRegistry registry;
    private final ThreadLocal<State> state = new ThreadLocal<>();
    private record State(Map<String, String> previous, long started) {}

    PartitionObservation(String key, MeterRegistry registry) { this.key = key; this.registry = registry; }

    @Override public void beforeStep(StepExecution execution) {
        state.set(new State(MDC.getCopyOfContextMap(), System.nanoTime()));
        MDC.put("batchJob", execution.getJobExecution().getJobInstance().getJobName());
        MDC.put("batchStep", execution.getStepName().split(":", 2)[0]);
        MDC.put("batchPartition", execution.getStepName());
        MDC.put("batchPartitionValue", execution.getExecutionContext().getString(key));
        LOG.info("Starting partition job={} partition={} value={}", MDC.get("batchJob"), execution.getStepName(), MDC.get("batchPartitionValue"));
    }

    @Override public ExitStatus afterStep(StepExecution execution) {
        State current = state.get();
        try {
            LOG.info("Finished partition job={} partition={} value={} status={}",
                    MDC.get("batchJob"), execution.getStepName(), MDC.get("batchPartitionValue"), execution.getStatus());
            if (registry != null && current != null) {
                String job = execution.getJobExecution().getJobInstance().getJobName();
                String step = execution.getStepName().split(":", 2)[0];
                String outcome = execution.getStatus() == BatchStatus.COMPLETED ? "success" : "failure";
                registry.timer("batch.parallel.partition.duration", "job", job, "step", step, "outcome", outcome)
                        .record(System.nanoTime() - current.started(), java.util.concurrent.TimeUnit.NANOSECONDS);
                registry.counter("batch.parallel.partitions", "job", job, "step", step, "outcome", outcome).increment();
            }
        } finally {
            if (current == null || current.previous() == null) MDC.clear();
            else MDC.setContextMap(current.previous());
            state.remove();
        }
        return null;
    }
}
