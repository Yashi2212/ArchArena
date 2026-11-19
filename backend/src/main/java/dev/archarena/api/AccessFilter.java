package dev.archarena.api;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import org.slf4j.MDC;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Set;
import java.util.UUID;

@Component
public class AccessFilter extends org.springframework.web.filter.OncePerRequestFilter {
    private final String token;
    private final boolean loopback;
    private final java.util.ArrayDeque<Long> requests=new java.util.ArrayDeque<>();
    public AccessFilter(@Value("${archarena.access-token:}")String token,@Value("${server.address:127.0.0.1}")String bind){this.token=token;this.loopback=bind.equals("127.0.0.1");if(!loopback&&token.length()<32)throw new IllegalStateException("Non-loopback binding requires a strong ARCHARENA_ACCESS_TOKEN (at least 32 characters); shared-owner access is not public multi-user authentication");}
    private synchronized boolean admit(){long now=System.nanoTime();while(!requests.isEmpty()&&requests.getFirst()<now-60_000_000_000L)requests.removeFirst();if(requests.size()>=240)return false;requests.addLast(now);return true;}
    @Override protected void doFilterInternal(HttpServletRequest request,HttpServletResponse response,FilterChain chain)throws ServletException,IOException {
        String id=UUID.randomUUID().toString();MDC.put("correlationId",id);response.setHeader("X-Correlation-ID",id);
        response.setHeader("X-Content-Type-Options","nosniff");response.setHeader("Referrer-Policy","no-referrer");response.setHeader("X-Frame-Options","DENY");response.setHeader("Cache-Control","no-store");
        response.setHeader("Content-Security-Policy","default-src 'none'; frame-ancestors 'none'; sandbox");
        response.setHeader("Permissions-Policy","camera=(), microphone=(), geolocation=()");
        try {
            if(loopback&&!Set.of("localhost","127.0.0.1","[::1]","::1").contains(request.getServerName())){deny(response,403,"Host is not allowed",id);return;}
            String origin=request.getHeader("Origin");
            if(origin!=null&&!Set.of("http://127.0.0.1:5173","http://localhost:5173","http://127.0.0.1:8080","http://localhost:8080").contains(origin)){deny(response,403,"Origin is not allowed",id);return;}
            if(!Set.of("GET","HEAD","OPTIONS").contains(request.getMethod())&&"cross-site".equals(request.getHeader("Sec-Fetch-Site"))){deny(response,403,"Cross-site mutation is not allowed",id);return;}
            if(request.getRequestURI().startsWith("/api")&&!token.isBlank()) {
                String given=request.getHeader("Authorization");
                if(given==null||!MessageDigest.isEqual(given.getBytes(StandardCharsets.UTF_8),("Bearer "+token).getBytes(StandardCharsets.UTF_8))){deny(response,401,"Owner authentication required",id);return;}
            }
            if(request.getRequestURI().startsWith("/api")&&!admit()){response.setHeader("Retry-After","60");deny(response,429,"API quota exceeded",id);return;}
            if(Set.of("POST","PUT","PATCH").contains(request.getMethod())) {
                byte[] body=request.getInputStream().readNBytes(65_537);
                if(body.length>65_536){deny(response,413,"Request body exceeds 64 KiB",id);return;}
                chain.doFilter(new BodyRequest(request,body),response);
            } else chain.doFilter(request,response);
        } finally {MDC.remove("correlationId");}
    }
    private void deny(HttpServletResponse response,int status,String detail,String id)throws IOException {response.setStatus(status);response.setContentType("application/problem+json");response.getWriter().write("{\"type\":\"about:blank\",\"title\":\"Request rejected\",\"status\":"+status+",\"detail\":\""+detail+"\",\"correlationId\":\""+id+"\"}");}
    private static class BodyRequest extends HttpServletRequestWrapper {
        private final byte[] body;
        BodyRequest(HttpServletRequest source,byte[] body){super(source);this.body=body;}
        @Override public ServletInputStream getInputStream(){ByteArrayInputStream bytes=new ByteArrayInputStream(body);return new ServletInputStream(){public int read(){return bytes.read();}public boolean isFinished(){return bytes.available()==0;}public boolean isReady(){return true;}public void setReadListener(ReadListener listener){throw new UnsupportedOperationException("Synchronous request body only");}};}
        @Override public BufferedReader getReader(){return new BufferedReader(new InputStreamReader(getInputStream(),StandardCharsets.UTF_8));}
    }
}
