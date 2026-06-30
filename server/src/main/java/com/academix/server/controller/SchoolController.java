package com.academix.server.controller;

import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.academix.server.model.School;
import com.academix.server.service.SchoolService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/school")
@CrossOrigin(origins = "*")
public class SchoolController {

    private static final Logger logger = LoggerFactory.getLogger(SchoolController.class);

    @Autowired
    private SchoolService schoolService;

    @GetMapping
    public ResponseEntity<?> getSchool() {
        try {
            logger.info("GET /api/school - Fetching school settings");
            School school = schoolService.getSchool();

            Map<String, Object> response = new HashMap<>();
            if (school != null) {
                response.put("success", true);
                response.put("data", school);
                response.put("hasSchool", true);
            } else {
                response.put("success", true);
                response.put("data", null);
                response.put("hasSchool", false);
                response.put("message", "No school settings configured yet");
            }
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Failed to get school settings: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to retrieve school settings: " + e.getMessage()));
        }
    }

    @PutMapping
    public ResponseEntity<?> createOrUpdateSchool(@Valid @RequestBody School school) {
        try {
            logger.info("PUT /api/school - Saving school settings: {}", school.getSchoolName());

            boolean existed = schoolService.hasSchool();
            School saved;

            if (existed) {
                saved = schoolService.updateSchool(school);
            } else {
                saved = schoolService.createSchool(school);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", saved);
            response.put("message", existed ? "School settings updated successfully" : "School settings created successfully");
            return ResponseEntity.ok(response);
        } catch (IllegalStateException e) {
            logger.error("Conflict creating school: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            logger.error("Failed to save school settings: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to save school settings: " + e.getMessage()));
        }
    }

    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("error", message);
        return response;
    }
}
