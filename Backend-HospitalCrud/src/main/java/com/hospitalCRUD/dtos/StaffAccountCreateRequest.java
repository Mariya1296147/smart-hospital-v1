package com.hospitalCRUD.dtos;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** Request wrapper for creating a staff profile and its login account atomically. */
public record StaffAccountCreateRequest<T>(
        @NotNull @Valid T profile,
        @NotBlank @Size(min = 8, max = 72) String password
) {
}
