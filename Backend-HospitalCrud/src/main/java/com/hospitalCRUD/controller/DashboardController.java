
package com.hospitalCRUD.controller;


import com.hospitalCRUD.entity.DashboardDTO;
import com.hospitalCRUD.service.DashboardService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/data")
    @PreAuthorize("isAuthenticated()")
    public DashboardDTO getDashboard(Authentication authentication) {
        return dashboardService.getDashboard(authentication);
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public DashboardDTO getAdminDashboard(Authentication authentication) {
        return dashboardService.getAdminDashboard(authentication);
    }
}
