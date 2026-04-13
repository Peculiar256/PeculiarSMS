package com.academix.server.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.academix.server.model.Staff;
import com.academix.server.repository.StaffRepository;

/**
 * Initialize database with admin user on application startup
 * Creates default admin user for system access
 */
@Configuration
public class DataInitializer {
    
    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);
    
    @Bean
    CommandLineRunner initializeData(StaffRepository staffRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            logger.info("=== Starting Database Initialization ===");
            
            try {
                // Check if admin already exists by email
                Iterable<Staff> allStaff = staffRepository.findAll();
                boolean adminExists = false;
                for (Staff staff : allStaff) {
                    if ("josephkijjambu24@gmail.com".equals(staff.getEmail())) {
                        adminExists = true;
                        break;
                    }
                }
                
                if (adminExists) {
                    logger.info("✓ Admin user already exists");
                    return;
                }
                
                // Create and save admin user
                Staff admin = new Staff();
                admin.setEmail("josephkijjambu24@gmail.com");
                admin.setPassword(passwordEncoder.encode("Admin@123"));
                admin.setFirstName("Joseph");
                admin.setLastName("Kijjambu");
                admin.setStaffId("ADM001");
                admin.setDepartment("Administration");
                admin.setPosition("System Administrator");
                admin.setNin("00000000000000");
                admin.setPhoneNumber("+256701234567");
                admin.setNationality("Ugandan");
                admin.setGender("MALE");
                admin.setDateOfBirth(java.time.LocalDate.of(1990, 1, 1));
                admin.setEmailVerified(true);  // Auto-verify email
                admin.setIsActive(true);
                
                staffRepository.save(admin);
                logger.info("✓ Admin user created successfully");
                logger.info("  Email: josephkijjambu24@gmail.com");
                logger.info("  Password: Admin@123");
                logger.info("  Email Verified: true");
                
                logger.info("=== Database Initialization Complete ===");
                
            } catch (Exception e) {
                logger.error("✗ Error initializing database: {}", e.getMessage());
                logger.debug("Full error:", e);
            }
        };
    }
}
