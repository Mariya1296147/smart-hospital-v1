package com.hospitalCRUD.service;

import com.hospitalCRUD.entity.Bed;
import com.hospitalCRUD.entity.Ward;
import com.hospitalCRUD.repository.AdmissionRepository;
import com.hospitalCRUD.repository.BedRepository;
import com.hospitalCRUD.repository.WardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BedService {
    private final BedRepository bedRepository;
    private final WardRepository wardRepository;
    private final AdmissionRepository admissionRepository;

    public List<Bed> getAll() { return bedRepository.findAll(); }

    public List<Bed> getAvailable(Long wardId) { return bedRepository.findAvailable(wardId); }

    public Bed getById(Long id) {
        return bedRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Bed not found"));
    }

    public Bed create(Bed bed) {
        validate(bed, null);
        bed.setStatus(bed.getStatus() == null || bed.getStatus().isBlank() ? "AVAILABLE" : bed.getStatus().toUpperCase());
        if (!"AVAILABLE".equals(bed.getStatus())) {
            throw new IllegalArgumentException("New beds must start as AVAILABLE");
        }
        return bedRepository.save(bed);
    }

    public Bed update(Long id, Bed request) {
        Bed bed = getById(id);
        validate(request, id);
        if (!request.getWard().getId().equals(bed.getWard().getId())
                && request.getWard().getCapacity() != null
                && bedRepository.countByWard_Id(request.getWard().getId()) >= request.getWard().getCapacity()) {
            throw new IllegalStateException("The selected ward has reached its bed capacity");
        }
        if ("OCCUPIED".equalsIgnoreCase(bed.getStatus()) && request.getWard() != null
                && !request.getWard().getId().equals(bed.getWard().getId())) {
            throw new IllegalStateException("An occupied bed cannot be moved to another ward");
        }
        bed.setBedNumber(request.getBedNumber().trim());
        bed.setBedType(request.getBedType());
        bed.setWard(request.getWard());
        if (!"OCCUPIED".equalsIgnoreCase(bed.getStatus())) {
            String requestedStatus = request.getStatus() == null || request.getStatus().isBlank()
                    ? "AVAILABLE" : request.getStatus().toUpperCase();
            if (!List.of("AVAILABLE", "MAINTENANCE").contains(requestedStatus)) {
                throw new IllegalArgumentException("Bed status must be AVAILABLE or MAINTENANCE");
            }
            bed.setStatus(requestedStatus);
        }
        return bedRepository.save(bed);
    }

    public void delete(Long id) {
        Bed bed = getById(id);
        if ("OCCUPIED".equalsIgnoreCase(bed.getStatus())
                || admissionRepository.existsByBed_IdAndStatusIn(bed.getId(), List.of("ADMITTED", "ACTIVE", "IN_PROGRESS"))) {
            throw new IllegalStateException("An occupied bed cannot be deleted");
        }
        bedRepository.delete(bed);
    }

    private void validate(Bed bed, Long currentId) {
        if (bed == null || bed.getBedNumber() == null || bed.getBedNumber().isBlank()) {
            throw new IllegalArgumentException("Bed number is required");
        }
        if (bed.getWard() == null || bed.getWard().getId() == null) {
            throw new IllegalArgumentException("A ward must be selected for the bed");
        }
        Ward ward = wardRepository.findById(bed.getWard().getId())
                .orElseThrow(() -> new IllegalArgumentException("Ward not found"));
        if (currentId == null && ward.getCapacity() != null
                && bedRepository.countByWard_Id(ward.getId()) >= ward.getCapacity()) {
            throw new IllegalStateException("The selected ward has reached its bed capacity");
        }
        bed.setWard(ward);
        boolean duplicate = currentId == null
                ? bedRepository.existsByBedNumberIgnoreCase(bed.getBedNumber().trim())
                : bedRepository.existsByBedNumberIgnoreCaseAndIdNot(bed.getBedNumber().trim(), currentId);
        if (duplicate) {
            throw new IllegalArgumentException("Bed number is already in use");
        }
    }
}
