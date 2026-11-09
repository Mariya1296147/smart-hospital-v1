package com.hospitalCRUD.dtos;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StoredImage {

    private Long id;

    private String fileName;

    private String contentType;

    private String imageUrl;
}
