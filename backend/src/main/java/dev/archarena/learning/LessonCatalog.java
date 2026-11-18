package dev.archarena.learning;

import com.fasterxml.jackson.databind.ObjectMapper;
import dev.archarena.engine.Model.*;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import java.io.IOException;
import java.util.*;

@Component
public class LessonCatalog {
    public record Lesson(String id,String title,String subtitle,String question,String explanation,String control,String nodeType,double min,double max,double step,double initial,String unit,String challenge) {}
    private final List<Lesson> lessons;
    public LessonCatalog(ObjectMapper mapper)throws IOException {
        try(var stream=new ClassPathResource("content/lessons.json").getInputStream()){lessons=List.of(mapper.readValue(stream,Lesson[].class));}
        Set<String> ids=new HashSet<>();
        for(Lesson l:lessons)if(l.id()==null||!ids.add(l.id())||l.min()>l.initial()||l.initial()>l.max()||l.step()<=0)throw new IllegalStateException("Invalid lesson content");
        if(lessons.size()!=5)throw new IllegalStateException("Expected five initial lessons");
    }
    public List<Lesson> all(){return lessons;}
    public boolean checkpoint(String lesson,Request request,Result result) {
        if(lessons.stream().noneMatch(l->l.id().equals(lesson)))throw new IllegalArgumentException("Unknown lesson");
        if(result==null||result.requests()==0)return false;
        boolean healthy=(double)result.errors()/result.requests()<=0.05;
        return switch(lesson) {
            case "load-balancing" -> healthy&&request.graph().nodes().stream().anyMatch(n->n.type()==NodeType.SERVICE&&n.value("replicas",1)>=2);
            case "caching" -> healthy&&request.graph().nodes().stream().anyMatch(n->n.type()==NodeType.CACHE&&n.value("hitRatio",0)>=0.8)&&request.graph().nodes().stream().filter(n->n.type()==NodeType.DATABASE).allMatch(n->result.nodes().get(n.id()).visits()<result.requests()*0.5);
            case "replication" -> healthy&&request.graph().nodes().stream().anyMatch(n->n.type()==NodeType.DATABASE&&n.value("replicas",1)>=2);
            case "queues" -> healthy&&request.graph().nodes().stream().filter(n->n.type()==NodeType.QUEUE).anyMatch(n->result.nodes().get(n.id()).maxQueueDepth()>0);
            case "rate-limiting" -> result.rejected()>0&&result.errors()==0&&request.graph().nodes().stream().anyMatch(n->n.type()==NodeType.RATE_LIMITER);
            default -> false;
        };
    }
}
