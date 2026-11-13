package com.brsvs.swagger.studio;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("brsvs.swagger.studio")
public class StudioProperties {
    private String title = "API Studio";
    private String logoUrl = "";
    private String welcomeTitle = "";
    private String welcomeMessage = "";
    private String theme = "system";
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }
    public String getWelcomeTitle() { return welcomeTitle; }
    public void setWelcomeTitle(String welcomeTitle) { this.welcomeTitle = welcomeTitle; }
    public String getWelcomeMessage() { return welcomeMessage; }
    public void setWelcomeMessage(String welcomeMessage) { this.welcomeMessage = welcomeMessage; }
    public String getTheme() { return theme; }
    public void setTheme(String theme) { this.theme = theme; }
}
