package com.academix.server.dto;

import java.time.LocalDateTime;

import com.academix.server.model.Subject;

import lombok.Data;

@Data
public class SubjectDto {
    private Long id;
    private String code;
    private String name;
    private Subject.SubjectCategory category;
    private Subject.SubjectLevel level;
    private Boolean isCompulsory;
    private Boolean isScience;
    private Boolean isArts;
    private Integer paperCount;
    private Integer maxMarksPerPaper;
    private Integer creditUnits;
    private String description;
    private String department;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static SubjectDto fromEntity(Subject subject) {
        if (subject == null) return null;
        
        SubjectDto dto = new SubjectDto();
        dto.setId(subject.getId());
        dto.setCode(subject.getCode());
        dto.setName(subject.getName());
        dto.setCategory(subject.getCategory());
        dto.setLevel(subject.getLevel());
        dto.setIsCompulsory(subject.getIsCompulsory());
        dto.setIsScience(subject.getIsScience());
        dto.setIsArts(subject.getIsArts());
        dto.setPaperCount(subject.getPaperCount());
        dto.setMaxMarksPerPaper(subject.getMaxMarksPerPaper());
        dto.setCreditUnits(subject.getCreditUnits());
        dto.setDescription(subject.getDescription());
        dto.setDepartment(subject.getDepartment());
        dto.setIsActive(subject.getIsActive());
        dto.setCreatedAt(subject.getCreatedAt());
        dto.setUpdatedAt(subject.getUpdatedAt());
        return dto;
    }
}