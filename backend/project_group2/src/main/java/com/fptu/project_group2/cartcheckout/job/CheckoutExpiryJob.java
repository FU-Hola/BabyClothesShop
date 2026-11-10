package com.fptu.project_group2.cartcheckout.job;

import com.fptu.project_group2.cartcheckout.service.CheckoutExpiryService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import java.util.UUID;

@Component
@EnableScheduling
@RequiredArgsConstructor
public class CheckoutExpiryJob {
    private static final Logger log=LoggerFactory.getLogger(CheckoutExpiryJob.class);
    private final JdbcTemplate jdbc;
    private final CheckoutExpiryService expiry;
    @Scheduled(fixedDelayString="${app.checkout.expiry-scan-ms:15000}",initialDelayString="${app.checkout.expiry-scan-ms:15000}")
    public void expireBatch() {
        for(UUID id: jdbc.queryForList("SELECT id FROM shop.orders WHERE status='PENDING_PAYMENT' "
                + "AND payment_expires_at<=clock_timestamp() ORDER BY payment_expires_at,id LIMIT 100",UUID.class)) {
            try { expiry.expire(id); }
            catch(RuntimeException ex) { log.error("Cannot expire checkout order {}",id,ex); }
        }
    }
}
