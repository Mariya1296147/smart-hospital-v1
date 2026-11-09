package com.hospitalCRUD.dtos;

import java.time.LocalDateTime;

public record NursingNoteDTO(Long id, Long patientId, String patientName, String patientCode,
                             String note, LocalDateTime recordedAt) {}
