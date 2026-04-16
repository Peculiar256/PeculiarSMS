package com.academix.server.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.academix.server.model.Exam;
import com.academix.server.model.Exam.ExamLevel;
import com.academix.server.model.Exam.ExamStatus;
import com.academix.server.model.Exam.ExamType;
import com.academix.server.model.Exam.GradingScale;
import com.academix.server.model.Result;
import com.academix.server.model.Result.GradingScaleType;
import com.academix.server.repository.ExamRepository;
import com.academix.server.repository.ResultRepository;
import com.academix.server.repository.StudentRepository;

/**
 * Data initializer component that populates sample data on application startup
 * This ensures that dashboards display sample data even when database is empty
 */
@Component
public class DataInitializer {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Autowired
    private ExamRepository examRepository;

    @Autowired
    private ResultRepository resultRepository;

    @Autowired
    private StudentRepository studentRepository;

    /**
     * Initialize sample data when application is ready
     */
    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void initializeSampleData() {
        try {
            // Only initialize if exams table is empty
            if (examRepository.count() == 0) {
                logger.info("Initializing sample exam data...");
                initializeSampleExams();
                logger.info("Sample exam data initialized successfully");
            }

            // Only initialize results if table is empty and there are exams
            if (resultRepository.count() == 0 && examRepository.count() > 0) {
                logger.info("Initializing sample result data...");
                initializeSampleResults();
                logger.info("Sample result data initialized successfully");
            }
        } catch (Exception e) {
            logger.error("Error initializing sample data: {}", e.getMessage(), e);
            // Don't throw - let application start even if data initialization fails
        }
    }

    /**
     * Initialize sample exams with various statuses
     */
    private void initializeSampleExams() {
        // Mid-term exam - in progress
        Exam midterm = new Exam();
        midterm.setCode("MOT1-2025-S1");
        midterm.setName("Mid-of-Term 1 Examinations 2025");
        midterm.setType(ExamType.MOT);
        midterm.setAcademicYear("2025");
        midterm.setTerm(1);
        midterm.setTargetClasses(Arrays.asList("Form 1A", "Form 1B", "Form 2A", "Form 2B", "Form 3A", "Form 3B", "Form 4A", "Form 4B"));
        midterm.setLevel(ExamLevel.O_LEVEL);
        midterm.setStartDate(LocalDate.now().minusDays(5));
        midterm.setEndDate(LocalDate.now().plusDays(5));
        midterm.setMarksEntryDeadline(LocalDateTime.now().plusDays(10));
        midterm.setStatus(ExamStatus.IN_PROGRESS);
        midterm.setIsPublished(false);
        midterm.setDescription("Mid-term examinations for all O-Level classes");
        midterm.setGradingScale(GradingScale.O_LEVEL);
        midterm.setPassMark(34);
        midterm.setTotalMarks(100);
        examRepository.save(midterm);

        // Mock exam - draft
        Exam mock = new Exam();
        mock.setCode("MOCK-2025-S4");
        mock.setName("Mock Examinations - Form 4");
        mock.setType(ExamType.MOCK);
        mock.setAcademicYear("2025");
        mock.setTerm(2);
        mock.setTargetClasses(Arrays.asList("Form 4A", "Form 4B"));
        mock.setLevel(ExamLevel.O_LEVEL);
        mock.setStartDate(LocalDate.now().plusDays(20));
        mock.setEndDate(LocalDate.now().plusDays(30));
        mock.setMarksEntryDeadline(LocalDateTime.now().plusDays(40));
        mock.setStatus(ExamStatus.DRAFT);
        mock.setIsPublished(false);
        mock.setDescription("Mock examinations to prepare students for national exams");
        mock.setGradingScale(GradingScale.O_LEVEL);
        mock.setPassMark(34);
        mock.setTotalMarks(100);
        examRepository.save(mock);

        // End of term exam - published
        Exam endOfTerm = new Exam();
        endOfTerm.setCode("EOT1-2024-ALL");
        endOfTerm.setName("End-of-Term 1 Examinations 2024");
        endOfTerm.setType(ExamType.EOT);
        endOfTerm.setAcademicYear("2024");
        endOfTerm.setTerm(1);
        endOfTerm.setTargetClasses(Arrays.asList("Form 1A", "Form 1B", "Form 2A", "Form 2B", "Form 3A", "Form 3B", "Form 4A", "Form 4B", "Form 5A", "Form 6A"));
        endOfTerm.setLevel(ExamLevel.ALL);
        endOfTerm.setStartDate(LocalDate.now().minusDays(60));
        endOfTerm.setEndDate(LocalDate.now().minusDays(50));
        endOfTerm.setMarksEntryDeadline(LocalDateTime.now().minusDays(40));
        endOfTerm.setStatus(ExamStatus.COMPLETED);
        endOfTerm.setIsPublished(true);
        endOfTerm.setIsLocked(true);
        endOfTerm.setPublishedAt(LocalDateTime.now().minusDays(30));
        endOfTerm.setPublishedBy(1L);
        endOfTerm.setDescription("End-of-term comprehensive examination");
        endOfTerm.setGradingScale(GradingScale.O_LEVEL);
        endOfTerm.setPassMark(34);
        endOfTerm.setTotalMarks(100);
        examRepository.save(endOfTerm);

        // A-Level mock
        Exam aLevelMock = new Exam();
        aLevelMock.setCode("MOCK-2025-S6");
        aLevelMock.setName("A-Level Mock Examinations");
        aLevelMock.setType(ExamType.MOCK);
        aLevelMock.setAcademicYear("2025");
        aLevelMock.setTerm(2);
        aLevelMock.setTargetClasses(Arrays.asList("Form 5A", "Form 5B", "Form 6A"));
        aLevelMock.setLevel(ExamLevel.A_LEVEL);
        aLevelMock.setStartDate(LocalDate.now().plusDays(15));
        aLevelMock.setEndDate(LocalDate.now().plusDays(25));
        aLevelMock.setMarksEntryDeadline(LocalDateTime.now().plusDays(35));
        aLevelMock.setStatus(ExamStatus.SCHEDULED);
        aLevelMock.setIsPublished(false);
        aLevelMock.setDescription("A-Level mock exams for final year classes");
        aLevelMock.setGradingScale(GradingScale.A_LEVEL);
        aLevelMock.setPassMark(40);
        aLevelMock.setTotalMarks(105);
        examRepository.save(aLevelMock);
    }

    /**
     * Initialize sample results for students
     */
    private void initializeSampleResults() {
        // Get completed exam
        Exam completedExam = examRepository.findByCode("EOT1-2024-ALL").stream().findFirst().orElse(null);
        if (completedExam == null) {
            logger.warn("No completed exam found for results initialization");
            return;
        }

        // Get sample students
        List<?> students = studentRepository.findAll().stream().limit(20).toList();
        
        // Grade distribution for realistic results
        String[] grades = {"D1", "D1", "D2", "D2", "D2", "C3", "C3", "C3", "C3", "C4", 
                          "C4", "C4", "C5", "C5", "P7", "P7", "P8", "P8", "F9", "D2"};
        String[] subjects = {"Mathematics", "English", "Science", "History", "Geography", 
                           "Biology", "Chemistry", "Physics", "Literature", "Social Studies"};
        String[] classes = {"Form 1A", "Form 1B", "Form 2A", "Form 2B", "Form 3A", 
                           "Form 3B", "Form 4A", "Form 4B"};

        // Create sample results
        int resultCount = 0;
        for (int i = 0; i < Math.min(students.size(), 20); i++) {
            for (String subject : subjects) {
                Result result = new Result();
                result.setStudentId((long) i + 1); // Simple ID mapping
                result.setStudentNumber("STU" + String.format("%05d", i + 1));
                result.setExamId(completedExam.getId());
                result.setExamCode(completedExam.getCode());
                result.setSubjectCode(subject.substring(0, 3).toUpperCase());
                result.setSubjectName(subject);
                result.setClassName(classes[i % classes.length]);
                result.setAcademicYear("2024");
                result.setTerm(1);

                // Random marks
                int marks = 25 + (i * 3 + subject.hashCode() * 7) % 60;
                result.setMarksObtained(marks);
                result.setMaxMarks(100);
                result.setPercentage((double) marks);
                
                String grade = grades[(i + subject.hashCode()) % grades.length];
                result.setGrade(grade);
                result.setGradePoints((int) gradeToPoints(grade));
                result.setGradingScale(GradingScaleType.O_LEVEL);
                result.setRemarks(marks >= 34 ? "Pass" : "Fail");
                
                resultRepository.save(result);
                resultCount++;
                
                if (resultCount >= 200) { // Limit to 200 sample results
                    return;
                }
            }
        }
    }

    /**
     * Convert grade letter to numeric points (Ugandan system)
     */
    private Integer gradeToPoints(String grade) {
        return switch (grade) {
            case "D1" -> 1;
            case "D2" -> 2;
            case "C3" -> 3;
            case "C4" -> 4;
            case "C5" -> 5;
            case "P7" -> 7;
            case "P8" -> 8;
            case "F9" -> 9;
            default -> 9;
        };
    }
}
