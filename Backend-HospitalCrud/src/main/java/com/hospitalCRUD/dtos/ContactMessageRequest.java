package com.hospitalCRUD.dtos;

public record ContactMessageRequest(String name, String email, String phone, String subject, String message) {
}
