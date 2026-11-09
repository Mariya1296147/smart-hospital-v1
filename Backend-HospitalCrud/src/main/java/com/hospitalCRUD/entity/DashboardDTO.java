package com.hospitalCRUD.entity;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DashboardDTO {

    private String dashboard;
    private String username;
    private List<String> roles;
    private Map<String, Object> metrics;
}
