package com.academix.server.service;

import java.time.LocalDateTime;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.academix.server.model.School;
import com.academix.server.repository.SchoolRepository;

@Service
@Transactional
public class SchoolService {

    private static final Logger logger = LoggerFactory.getLogger(SchoolService.class);

    @Autowired
    private SchoolRepository schoolRepository;

    public School getSchool() {
        logger.info("Retrieving school settings");
        Optional<School> school = schoolRepository.findFirstByOrderByIdAsc();
        return school.orElse(null);
    }

    public School createSchool(School school) {
        logger.info("Creating school settings: {}", school.getSchoolName());
        if (schoolRepository.existsByIdIsNotNull()) {
            throw new IllegalStateException("School settings already exist. Use update instead.");
        }
        school.setCreatedAt(LocalDateTime.now());
        school.setUpdatedAt(LocalDateTime.now());
        School saved = schoolRepository.save(school);
        logger.info("School created successfully with ID: {}", saved.getId());
        return saved;
    }

    public School updateSchool(School schoolDetails) {
        logger.info("Updating school settings");
        School existing = schoolRepository.findFirstByOrderByIdAsc()
                .orElseGet(() -> {
                    School newSchool = new School();
                    newSchool.setCreatedAt(LocalDateTime.now());
                    newSchool.setUpdatedAt(LocalDateTime.now());
                    return newSchool;
                });

        existing.setSchoolName(schoolDetails.getSchoolName());
        existing.setAddress(schoolDetails.getAddress());
        existing.setCity(schoolDetails.getCity());
        existing.setDistrict(schoolDetails.getDistrict());
        existing.setCountry(schoolDetails.getCountry());
        existing.setPhoneNumber(schoolDetails.getPhoneNumber());
        existing.setEmail(schoolDetails.getEmail());
        existing.setWebsite(schoolDetails.getWebsite());
        existing.setMotto(schoolDetails.getMotto());
        existing.setVision(schoolDetails.getVision());
        existing.setMission(schoolDetails.getMission());
        existing.setSchoolType(schoolDetails.getSchoolType());
        existing.setRegistrationNumber(schoolDetails.getRegistrationNumber());
        existing.setSchoolLevel(schoolDetails.getSchoolLevel());
        existing.setLogo(schoolDetails.getLogo());
        existing.setPrincipalName(schoolDetails.getPrincipalName());
        existing.setEstablishedYear(schoolDetails.getEstablishedYear());
        existing.setUpdatedAt(LocalDateTime.now());

        School updated = schoolRepository.save(existing);
        logger.info("School settings updated successfully");
        return updated;
    }

    public boolean hasSchool() {
        return schoolRepository.existsByIdIsNotNull();
    }
}
