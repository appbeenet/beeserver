package com.bee.exp.web;

import com.bee.exp.domain.Company;
import com.bee.exp.domain.User;
import com.bee.exp.repository.CompanyRepository;
import com.bee.exp.web.dto.CompanyRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/companies")
@RequiredArgsConstructor
public class CompanyController {

    private final CompanyRepository companyRepository;

    @GetMapping
    public ResponseEntity<java.util.List<Company>> getAllCompanies() {
        return ResponseEntity.ok(companyRepository.findAll());
    }

    @GetMapping("/me")
    public ResponseEntity<Company> getMyCompany(@AuthenticationPrincipal User currentUser) {
        return companyRepository.findByOwner(currentUser)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/me")
    public ResponseEntity<Company> upsertMyCompany(
            @AuthenticationPrincipal User currentUser,
            @RequestBody CompanyRequest req
    ) {
        Company company = companyRepository.findByOwner(currentUser)
                .orElse(Company.builder().owner(currentUser).build());
        company.setName(req.getName());
        company.setDescription(req.getDescription());
        return ResponseEntity.ok(companyRepository.save(company));
    }
}
