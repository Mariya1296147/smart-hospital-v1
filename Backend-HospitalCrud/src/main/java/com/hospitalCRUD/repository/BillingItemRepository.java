package com.hospitalCRUD.repository;

import com.hospitalCRUD.entity.BillingItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Set;
import java.util.Collection;

public interface BillingItemRepository extends JpaRepository<BillingItem, Long> {
    boolean existsByPrescriptionTest_Id(Long prescriptionTestId);
    boolean existsByPrescriptionTest_IdAndBilling_IdNot(Long prescriptionTestId, Long billingId);

    @Query("select item.prescriptionTest.id from BillingItem item where item.prescriptionTest is not null")
    Set<Long> findLinkedPrescriptionTestIds();

    @Query("""
            select item from BillingItem item
            join fetch item.billing billing
            join fetch item.prescriptionTest test
            join fetch test.prescription prescription
            join fetch prescription.patient patient
            join fetch prescription.doctor doctor
            left join fetch prescription.department prescriptionDepartment
            left join fetch doctor.department doctorDepartment
            where upper(billing.paymentStatus) = 'PAID'
            order by prescription.id desc, test.id asc
            """)
    List<BillingItem> findPaidPrescribedTests();

    @Query("select count(item) > 0 from BillingItem item where item.prescriptionTest.id = :testId and upper(item.billing.paymentStatus) = 'PAID'")
    boolean isPrescriptionTestPaid(@Param("testId") Long testId);

    @Query("select item from BillingItem item join fetch item.billing where item.prescriptionTest.id in :testIds")
    List<BillingItem> findByPrescriptionTestIds(@Param("testIds") Collection<Long> testIds);
}
