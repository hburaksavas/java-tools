package io.github.hburaksavas.batch.parallel;

import java.util.*;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.batch.core.*;
import org.springframework.batch.core.job.SimpleJob;
import org.springframework.batch.core.step.AbstractStep;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.*;
import org.springframework.beans.factory.config.*;
import org.springframework.context.ResourceLoaderAware;
import org.springframework.core.io.ResourceLoader;

public final class ParallelStepPostProcessor implements BeanPostProcessor, BeanFactoryAware,
        ResourceLoaderAware, SmartInitializingSingleton {
    private ConfigurableListableBeanFactory beans;
    private ResourceLoader resources;
    private final Map<String, PartitionedStep> wrapped = new HashMap<>();

    @Override public void setBeanFactory(BeanFactory beanFactory) throws BeansException {
        beans = (ConfigurableListableBeanFactory) beanFactory;
    }
    @Override public void setResourceLoader(ResourceLoader resourceLoader) { resources = resourceLoader; }

    private Collection<PartitionSpec> specs() { return beans.getBeansOfType(PartitionSpec.class).values(); }

    @Override public Object postProcessAfterInitialization(Object bean, String name) {
        if (!(bean instanceof Step step)) return bean;
        List<PartitionSpec> matches = specs().stream().filter(s -> s.steps().contains(name)).toList();
        if (matches.isEmpty()) return bean;
        if (matches.size() != 1) throw new IllegalStateException("Step bean is selected by multiple annotations: " + name);
        if (!(step instanceof AbstractStep abstractStep)) {
            throw new IllegalStateException("Selected worker must extend AbstractStep: " + name);
        }
        PartitionSpec spec = matches.get(0);
        // Resolve the registry at execution time, after the whole context is initialized.
        abstractStep.registerStepExecutionListener(new StepExecutionListener() {
            private volatile PartitionObservation observation;
            private PartitionObservation delegate() {
                if (observation == null) synchronized (this) {
                    if (observation == null) observation = new PartitionObservation(spec.contextKey(),
                            beans.getBeanProvider(MeterRegistry.class).getIfUnique());
                }
                return observation;
            }
            @Override public void beforeStep(StepExecution e) { delegate().beforeStep(e); }
            @Override public ExitStatus afterStep(StepExecution e) { return delegate().afterStep(e); }
        });
        PartitionedStep result = new PartitionedStep(step, spec, beans, resources);
        wrapped.put(name, result);
        return result;
    }

    @Override public void afterSingletonsInstantiated() {
        Set<String> jobs = new HashSet<>();
        for (PartitionSpec spec : specs()) {
            if (!jobs.add(spec.job())) throw new IllegalStateException("Only one partition annotation per job is supported: " + spec.job());
            Object bean = beans.getBean(spec.job());
            if (!(bean instanceof SimpleJob job)) throw new IllegalStateException("Only sequential SimpleJob is supported: " + spec.job());
            beans.getBean(ParallelProperties.class).concurrency(spec);
            for (String name : spec.steps()) {
                Step step = beans.getBean(name, Step.class);
                if (step != wrapped.get(name) || job.getStep(step.getName()) != step) {
                    throw new IllegalStateException("Selected step is not wrapped in job " + spec.job() + ": " + name
                            + ". Use Step bean injection or @Configuration(proxyBeanMethods = true).");
                }
                for (Map.Entry<String, Job> other : beans.getBeansOfType(Job.class).entrySet()) {
                    if (!other.getKey().equals(spec.job()) && other.getValue() instanceof org.springframework.batch.core.step.StepLocator locator
                            && locator.getStep(step.getName()) == step) {
                        throw new IllegalStateException("Partitioned step cannot be shared between jobs: " + name);
                    }
                }
            }
        }
    }
}
