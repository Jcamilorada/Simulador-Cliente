package simulatorui.configuration;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableAutoConfiguration
public class ClientApplication
{
    public static void main(String... args)
    {
        SpringApplication.run(ClientApplication.class, args);
    }
}