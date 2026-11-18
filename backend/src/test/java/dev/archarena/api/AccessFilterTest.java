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
}
