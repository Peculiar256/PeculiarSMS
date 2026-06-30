package com.academix.server.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.academix.server.model.School;

@Repository
public interface SchoolRepository extends JpaRepository<School, Long> {
    Optional<School> findFirstByOrderByIdAsc();
    boolean existsByIdIsNotNull();
}
