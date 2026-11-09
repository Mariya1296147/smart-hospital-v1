package com.hospitalCRUD.controller;

import com.hospitalCRUD.entity.ContactMessage;
import com.hospitalCRUD.repository.ContactMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/contact-messages")
@RequiredArgsConstructor
public class AdminContactMessageController {
    private final ContactMessageRepository repository;

    @GetMapping
    public List<ContactMessage> getAll() {
        return repository.findAllByOrderByReceivedAtDesc();
    }
}
