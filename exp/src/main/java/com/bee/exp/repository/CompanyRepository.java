package com.bee.exp.repository;

import com.bee.exp.domain.Company;
import com.bee.exp.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CompanyRepository extends JpaRepository<Company, Long> {
    Optional<Company> findByOwner(User owner);
}
