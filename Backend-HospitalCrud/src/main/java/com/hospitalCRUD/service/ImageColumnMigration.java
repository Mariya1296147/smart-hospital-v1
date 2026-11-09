package com.hospitalCRUD.service;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Converts image data created by older Hibernate mappings (PostgreSQL OID)
 * into bytea, which is what the current Image entity and upload service use.
 */
@Component
@RequiredArgsConstructor
public class ImageColumnMigration implements ApplicationRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        String columnType = jdbcTemplate.query(
                "SELECT data_type FROM information_schema.columns "
                        + "WHERE table_schema = current_schema() "
                        + "AND table_name = 'images' AND column_name = 'image_data'",
                resultSet -> resultSet.next() ? resultSet.getString("data_type") : null);

        if ("oid".equalsIgnoreCase(columnType)) {
            jdbcTemplate.execute("ALTER TABLE images ALTER COLUMN image_data "
                    + "TYPE bytea USING lo_get(image_data)");
        }
    }
}
