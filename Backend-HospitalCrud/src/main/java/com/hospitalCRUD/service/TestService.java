package com.hospitalCRUD.service;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class TestService {

    @Async("taskExecutor2")
//    @Async
    public void sendDailyReportEmail(String email) {
        System.out.println("📧 Sending daily report to: " + email + " on thread: " + Thread.currentThread().getName());
        try {
            Thread.sleep(4000); // simulate long-running task
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        System.out.println("✅ Email successfully sent to " + email);
    }
}
