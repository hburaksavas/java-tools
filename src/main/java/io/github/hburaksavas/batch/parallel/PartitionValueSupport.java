package io.github.hburaksavas.batch.parallel;

import java.lang.reflect.*;
import org.springframework.beans.factory.config.*;
import org.springframework.beans.factory.support.*;
import org.springframework.core.Ordered;

/** Decorates, rather than replaces, the application's existing dependency resolver. */
public final class PartitionValueSupport implements BeanFactoryPostProcessor, Ordered {
    @Override public int getOrder() { return Ordered.LOWEST_PRECEDENCE; }

    @Override
    public void postProcessBeanFactory(ConfigurableListableBeanFactory beanFactory) {
        DefaultListableBeanFactory factory = (DefaultListableBeanFactory) beanFactory;
        AutowireCandidateResolver delegate = factory.getAutowireCandidateResolver();
        factory.setAutowireCandidateResolver((AutowireCandidateResolver) Proxy.newProxyInstance(
                AutowireCandidateResolver.class.getClassLoader(), new Class<?>[]{AutowireCandidateResolver.class},
                (proxy, method, args) -> {
                    if (method.getName().equals("getSuggestedValue") && args[0] instanceof DependencyDescriptor descriptor) {
                        PartitionValue annotation = descriptor.getAnnotation(PartitionValue.class);
                        if (annotation != null) {
                            String key = annotation.value();
                            if (!key.matches("[A-Za-z_][A-Za-z0-9_]*")) {
                                throw new IllegalArgumentException("Invalid partition context key: " + key);
                            }
                            return "#{stepExecutionContext['" + key + "']}";
                        }
                    }
                    try { return method.invoke(delegate, args); }
                    catch (InvocationTargetException e) { throw e.getCause(); }
                }));
    }
}
