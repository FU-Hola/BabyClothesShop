package com.fptu.project_group2.warehouse.utils;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.Locale;
import java.util.Objects;

@Component
@RequiredArgsConstructor
public class TrackingNumberGenerator {
    private final JdbcTemplate jdbc;

    public String next() {
        Long number = jdbc.queryForObject("SELECT nextval('shop.tracking_number_seq')", Long.class);
        return String.format(Locale.ROOT, "VD-%012d", Objects.requireNonNull(number));
    }
}
