package com.hospitalCRUD.dtos;

import java.math.BigDecimal;

public record VitalSignRequest(Long patientId, BigDecimal temperatureC, Integer pulseBpm,
                               Integer respiratoryRate, Integer systolicBp, Integer diastolicBp,
                               Integer oxygenSaturation) {}
