package com.hospitalCRUD.repository;

import com.hospitalCRUD.entity.PrescriptionTest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface PrescriptionTestRepository extends JpaRepository<PrescriptionTest, Long> {
    boolean existsByCatalogTest_Id(Long catalogTestId);

    @Query("""
            select test from PrescriptionTest test
            join fetch test.prescription prescription
            join fetch prescription.patient
            join fetch prescription.doctor doctor
            left join fetch prescription.department
            left join fetch doctor.department
            where exists (
                select item.id from BillingItem item
                join item.billing billing
                where item.prescriptionTest = test
                  and upper(billing.paymentStatus) = 'PAID'
            )
            order by prescription.id desc, test.id asc
            """)
    List<PrescriptionTest> findAllForLaboratory();

    @Query("""
            select test from PrescriptionTest test
            join fetch test.prescription prescription
            join fetch prescription.patient
            join fetch prescription.doctor doctor
            left join fetch prescription.department
            left join fetch doctor.department
            where upper(coalesce(test.laboratoryStatus, 'PENDING')) in :statuses
              and exists (
                select item.id from BillingItem item
                join item.billing billing
                where item.prescriptionTest = test
                  and upper(billing.paymentStatus) = 'PAID'
              )
            order by prescription.id desc, test.id asc
            """)
    List<PrescriptionTest> findAllForLaboratoryByStatuses(@Param("statuses") Collection<String> statuses);

    @Query("""
            select test from PrescriptionTest test
            join fetch test.prescription prescription
            join fetch prescription.patient
            join fetch prescription.doctor doctor
            left join fetch prescription.department
            left join fetch doctor.department
            where lower(doctor.email) = lower(:email)
              and upper(coalesce(test.laboratoryStatus, 'PENDING')) = 'COMPLETED'
            order by prescription.id desc, test.id asc
            """)
    List<PrescriptionTest> findCompletedReportsForDoctor(@Param("email") String email);
}
