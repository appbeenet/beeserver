package com.bee.exp.web;

import com.bee.exp.domain.Company;
import com.bee.exp.repository.CompanyRepository;
import com.bee.exp.web.dto.CompanyRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/companies")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminCompanyController {

    private final CompanyRepository companyRepository;

    @GetMapping
    public ResponseEntity<List<Company>> getAllCompanies() {
        return ResponseEntity.ok(companyRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<Company> createCompany(@RequestBody CompanyRequest req) {
        Company company = Company.builder()
                .name(req.getName())
                .description(req.getDescription())
                .build();
        return ResponseEntity.ok(companyRepository.save(company));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Company> updateCompany(@PathVariable Long id, @RequestBody CompanyRequest req) {
        return companyRepository.findById(id)
                .map(company -> {
                    company.setName(req.getName());
                    company.setDescription(req.getDescription());
                    return ResponseEntity.ok(companyRepository.save(company));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCompany(@PathVariable Long id) {
        if (companyRepository.existsById(id)) {
            companyRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
