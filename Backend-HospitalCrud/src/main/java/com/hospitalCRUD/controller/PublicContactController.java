package com.hospitalCRUD.controller;

import com.hospitalCRUD.dtos.ContactMessageRequest;
import com.hospitalCRUD.entity.ContactMessage;
import com.hospitalCRUD.repository.ContactMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public/contact")
@RequiredArgsConstructor
public class PublicContactController {
    private final ContactMessageRepository repository;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ContactSubmissionResponse submit(@RequestBody ContactMessageRequest request) {
        if (request == null || blank(request.name()) || blank(request.email())
                || blank(request.subject()) || blank(request.message())) {
            throw new IllegalArgumentException("Name, email, subject, and message are required");
        }
        String name = request.name().trim();
        String email = request.email().trim();
        String phone = request.phone() == null ? "" : request.phone().trim();
        String subject = request.subject().trim();
        String message = request.message().trim();
        if (name.length() > 120 || email.length() > 254 || phone.length() > 40
                || subject.length() > 160 || message.length() > 5000
                || !email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            throw new IllegalArgumentException("Please check the contact details and message length");
        }

        ContactMessage saved = new ContactMessage();
        saved.setName(name);
        saved.setEmail(email);
        saved.setPhone(phone);
        saved.setSubject(subject);
        saved.setMessage(message);
        saved.setStatus("NEW");
        saved = repository.save(saved);
        return new ContactSubmissionResponse(saved.getId(), "RECEIVED");
    }

    private boolean blank(String value) {
        return value == null || value.isBlank();
    }

    public record ContactSubmissionResponse(Long ticketId, String status) {}
}
