package com.hospitalCRUD.dtos;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record VitalSignDTO(Long id, Long patientId, String patientName, String patientCode,
                           BigDecimal temperatureC, Integer pulseBpm, Integer respiratoryRate,
                           Integer systolicBp, Integer diastolicBp, Integer oxygenSaturation,
                           LocalDateTime recordedAt) {}
