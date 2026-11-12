package com.brsvs.swagger.studio;

import org.springdoc.webmvc.ui.SwaggerIndexTransformer;
import org.springframework.beans.factory.config.BeanPostProcessor;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/** Adds Studio to Springdoc's own page without replacing its configuration/auth initialization. */
@AutoConfiguration
@EnableConfigurationProperties(StudioProperties.class)
@ConditionalOnWebApplication(type = ConditionalOnWebApplication.Type.SERVLET)
@ConditionalOnClass(SwaggerIndexTransformer.class)
@ConditionalOnProperty(name = {"brsvs.swagger.studio.enabled", "springdoc.swagger-ui.enabled"}, havingValue = "true", matchIfMissing = true)
public class StudioAutoConfiguration {
    @Bean
    StudioConfigController studioConfigController(StudioProperties properties) {
        return new StudioConfigController(properties);
    }

    @Bean
    static BeanPostProcessor studioTransformerDecorator() {
        return new BeanPostProcessor() {
            @Override
            public Object postProcessAfterInitialization(Object bean, String beanName) {
                if (bean instanceof SwaggerIndexTransformer transformer && !(bean instanceof StudioIndexTransformer)) {
                    return new StudioIndexTransformer(transformer);
                }
                return bean;
            }
        };
    }

    @Bean
    WebMvcConfigurer studioResources() {
        return new WebMvcConfigurer() {
            @Override
            public void addResourceHandlers(ResourceHandlerRegistry registry) {
                registry.addResourceHandler("/swagger-ui/studio/**")
                        .addResourceLocations("classpath:/META-INF/swagger-ui-studio/");
            }
        };
    }
}
