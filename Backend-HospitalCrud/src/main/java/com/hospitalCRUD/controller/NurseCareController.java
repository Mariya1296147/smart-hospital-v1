package com.hospitalCRUD.controller;

import com.hospitalCRUD.dtos.NursingNoteDTO;
import com.hospitalCRUD.dtos.NursingNoteRequest;
import com.hospitalCRUD.dtos.VitalSignDTO;
import com.hospitalCRUD.dtos.VitalSignRequest;
import com.hospitalCRUD.service.NurseCareService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/nurse-care")
@RequiredArgsConstructor
@PreAuthorize("hasRole('NURSE')")
public class NurseCareController {
    private final NurseCareService nurseCareService;

    @GetMapping("/vitals")
    public List<VitalSignDTO> getVitalSigns(Authentication authentication) {
        return nurseCareService.getVitalSigns(authentication.getName());
    }

    @PostMapping("/vitals")
    @ResponseStatus(HttpStatus.CREATED)
    public VitalSignDTO addVitalSigns(@RequestBody VitalSignRequest request, Authentication authentication) {
        return nurseCareService.addVitalSigns(authentication.getName(), request);
    }

    @GetMapping("/notes")
    public List<NursingNoteDTO> getNursingNotes(Authentication authentication) {
        return nurseCareService.getNursingNotes(authentication.getName());
    }

    @PostMapping("/notes")
    @ResponseStatus(HttpStatus.CREATED)
    public NursingNoteDTO addNursingNote(@RequestBody NursingNoteRequest request, Authentication authentication) {
        return nurseCareService.addNursingNote(authentication.getName(), request);
    }
}
