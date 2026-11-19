package dev.archarena.api;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.*;
import static org.assertj.core.api.Assertions.*;

class AccessFilterTest {
    @Test void bearerTokenProtectsOwnerApi()throws Exception {
        var filter=new AccessFilter("test-secret","127.0.0.1");
        var request=new MockHttpServletRequest("GET","/api/catalog");var response=new MockHttpServletResponse();
        filter.doFilter(request,response,(req,res)->{throw new AssertionError("Must not reach API without token");});
        assertThat(response.getStatus()).isEqualTo(401);
        request=new MockHttpServletRequest("GET","/api/catalog");request.addHeader("Authorization","Bearer test-secret");response=new MockHttpServletResponse();
        filter.doFilter(request,response,(req,res)->res.getWriter().write("authorized"));
        assertThat(response.getContentAsString()).isEqualTo("authorized");
        assertThat(response.getHeader("X-Content-Type-Options")).isEqualTo("nosniff");
        assertThat(org.slf4j.MDC.get("correlationId")).isNull();
    }
    @Test void refusesUnprotectedNonLoopbackBinding(){assertThatThrownBy(()->new AccessFilter("","0.0.0.0")).isInstanceOf(IllegalStateException.class);}
    @Test void blocksDnsRebindingAndCrossSiteMutations()throws Exception {
        var filter=new AccessFilter("","127.0.0.1");
        var request=new MockHttpServletRequest("GET","/api/catalog");request.setServerName("attacker.invalid");var response=new MockHttpServletResponse();
        filter.doFilter(request,response,(req,res)->{throw new AssertionError("Untrusted host reached API");});assertThat(response.getStatus()).isEqualTo(403);
        request=new MockHttpServletRequest("DELETE","/api/designs/anything");request.addHeader("Sec-Fetch-Site","cross-site");response=new MockHttpServletResponse();
        filter.doFilter(request,response,(req,res)->{throw new AssertionError("Cross-site mutation reached API");});assertThat(response.getStatus()).isEqualTo(403);
    }
    @Test void apiQuotaIsBoundedAndHasRetryAfter()throws Exception {
        var filter=new AccessFilter("","127.0.0.1");
        for(int i=0;i<240;i++){var response=new MockHttpServletResponse();filter.doFilter(new MockHttpServletRequest("GET","/api/catalog"),response,(req,res)->{});assertThat(response.getStatus()).isEqualTo(200);}
        var response=new MockHttpServletResponse();filter.doFilter(new MockHttpServletRequest("GET","/api/catalog"),response,(req,res)->{throw new AssertionError("Quota bypass");});
        assertThat(response.getStatus()).isEqualTo(429);assertThat(response.getHeader("Retry-After")).isEqualTo("60");
    }
    @Test void nullOriginAndWeakRemoteSecretAreRejected()throws Exception {
        assertThatThrownBy(()->new AccessFilter("short-secret","0.0.0.0")).isInstanceOf(IllegalStateException.class);
        var request=new MockHttpServletRequest("POST","/api/designs");request.addHeader("Origin","null");var response=new MockHttpServletResponse();
        new AccessFilter("","127.0.0.1").doFilter(request,response,(req,res)->{throw new AssertionError("Null origin bypass");});assertThat(response.getStatus()).isEqualTo(403);
    }
}
