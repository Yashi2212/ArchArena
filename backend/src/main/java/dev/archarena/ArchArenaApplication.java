package dev.archarena;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ArchArenaApplication {
    public static void main(String[] args) {SpringApplication.run(ArchArenaApplication.class,args);}
}
