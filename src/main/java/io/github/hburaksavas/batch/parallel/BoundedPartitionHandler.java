package io.github.hburaksavas.batch.parallel;

import java.util.*;
import java.util.concurrent.*;
import org.springframework.batch.core.step.Step;
import org.springframework.batch.core.step.StepExecution;
import org.springframework.batch.core.partition.support.AbstractPartitionHandler;

/** Waits for every accepted worker, even if one partition fails. Never retries business SQL. */
final class BoundedPartitionHandler extends AbstractPartitionHandler {
    private final Step worker;
    private final SharedWorkers workers;
    private final int concurrency;

    BoundedPartitionHandler(Step worker, SharedWorkers workers, int concurrency) {
        this.worker = worker;
        this.workers = workers;
        this.concurrency = concurrency;
        setGridSize(concurrency);
    }

    @Override protected Set<StepExecution> doHandle(StepExecution manager, Set<StepExecution> partitions) throws Exception {
        Semaphore permits = new Semaphore(concurrency);
        List<FutureTask<Void>> futures = new ArrayList<>();
        Exception submissionFailure = null;
        boolean interrupted = false;
        for (StepExecution partition : partitions) {
            try {
                permits.acquire();
                FutureTask<Void> future = new FutureTask<>(() -> {
                    try { worker.execute(partition); return null; }
                    finally { permits.release(); }
                });
                try { workers.execute(future); }
                catch (Exception e) { permits.release(); throw e; }
                futures.add(future);
            } catch (Exception e) {
                submissionFailure = e;
                interrupted = e instanceof InterruptedException || Thread.interrupted();
                break;
            }
        }
        Exception executionFailure = null;
        for (FutureTask<Void> future : futures) {
            boolean finished = false;
            while (!finished) {
                try { future.get(); finished = true; }
                catch (InterruptedException e) { interrupted = true; }
                catch (ExecutionException e) { executionFailure = e; finished = true; }
                catch (CancellationException e) { executionFailure = e; finished = true; }
            }
        }
        if (interrupted) Thread.currentThread().interrupt();
        if (submissionFailure != null) throw submissionFailure;
        if (executionFailure != null) throw executionFailure;
        if (interrupted) throw new InterruptedException("Interrupted while awaiting partitions");
        return partitions;
    }
}
