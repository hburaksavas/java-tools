package io.github.hburaksavas.batch.parallel;

import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;
import io.micrometer.core.instrument.*;

/** One bounded worker pool per application context, shared by all annotated jobs. */
public final class SharedWorkers implements AutoCloseable {
    private final ThreadPoolExecutor executor;
    private final Semaphore capacity;
    private final AtomicInteger active = new AtomicInteger();
    private final AtomicInteger pending = new AtomicInteger();
    private final ThreadLocal<Boolean> workerThread = new ThreadLocal<>();

    SharedWorkers(ParallelProperties properties, MeterRegistry registry) {
        int workers = properties.getMaxWorkers();
        int queue = properties.getQueueCapacity();
        if (workers < 1 || queue < 0) throw new IllegalArgumentException("maxWorkers >= 1 and queueCapacity >= 0 required");
        AtomicInteger sequence = new AtomicInteger();
        executor = new ThreadPoolExecutor(workers, workers, 0, TimeUnit.MILLISECONDS,
                queue == 0 ? new SynchronousQueue<>() : new ArrayBlockingQueue<>(queue), task -> {
                    Thread thread = new Thread(task, "batch-partition-" + sequence.incrementAndGet());
                    thread.setDaemon(false);
                    return thread;
                });
        capacity = new Semaphore(workers + queue, true);
        // Permits bound accepted work; blocking rejection handles the tiny handoff race
        // between a completed task releasing its permit and the executor dequeuing work.
        executor.setRejectedExecutionHandler((task, pool) -> {
            try {
                while (!pool.isShutdown()) {
                    if (pool.getQueue().offer(task, 100, TimeUnit.MILLISECONDS)) {
                        if (pool.isShutdown() && pool.remove(task)) throw new RejectedExecutionException("Workers stopped");
                        return;
                    }
                }
                throw new RejectedExecutionException("Workers stopped");
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new RejectedExecutionException("Interrupted while waiting for worker capacity", e);
            }
        });
        if (registry != null) {
            Gauge.builder("batch.parallel.workers.active", active, AtomicInteger::get).register(registry);
            Gauge.builder("batch.parallel.partitions.pending", pending, AtomicInteger::get).register(registry);
        }
    }

    void execute(Runnable task) throws InterruptedException {
        if (Boolean.TRUE.equals(workerThread.get())) throw new IllegalStateException("Nested partitioning is unsupported");
        while (!capacity.tryAcquire(100, TimeUnit.MILLISECONDS)) {
            if (executor.isShutdown()) throw new RejectedExecutionException("Workers stopped");
        }
        pending.incrementAndGet();
        try {
            executor.execute(new WorkerTask(task));
        } catch (RuntimeException e) {
            pending.decrementAndGet();
            capacity.release();
            throw e;
        }
    }

    private final class WorkerTask implements Runnable {
        private final Runnable task;
        WorkerTask(Runnable task) { this.task = task; }
        @Override public void run() {
            pending.decrementAndGet();
            active.incrementAndGet();
            workerThread.set(true);
            try { task.run(); }
            finally {
                workerThread.remove();
                active.decrementAndGet();
                capacity.release();
            }
        }
        void cancel() {
            pending.decrementAndGet();
            capacity.release();
            if (task instanceof Future<?> future) future.cancel(false);
        }
    }

    private void stopNow() {
        for (Runnable queued : executor.shutdownNow()) {
            if (queued instanceof SharedWorkers.WorkerTask task) task.cancel();
        }
    }

    @Override public void close() {
        executor.shutdown();
        try {
            if (!executor.awaitTermination(30, TimeUnit.SECONDS)) stopNow();
        } catch (InterruptedException e) {
            stopNow();
            Thread.currentThread().interrupt();
        }
    }
}
