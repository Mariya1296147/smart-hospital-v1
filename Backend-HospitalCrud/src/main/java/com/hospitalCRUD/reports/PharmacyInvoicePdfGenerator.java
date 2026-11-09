package com.hospitalCRUD.reports;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import org.springframework.stereotype.Component;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Component
public class PharmacyInvoicePdfGenerator {
    public record Line(String medicineName, String batchNumber, int quantity, BigDecimal unitPrice, BigDecimal lineTotal) {}

    public byte[] generate(String invoice, String title, LocalDate date, String partyLabel, String party,
                           String contact, List<Line> lines, BigDecimal subtotal, BigDecimal discount, BigDecimal total) {
        try (ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 42, 42, 40, 40);
            PdfWriter.getInstance(document, output);
            document.addTitle(title + " " + invoice);
            document.addAuthor("Smart Hospital Pharmacy");
            document.open();
            Font hospitalFont = new Font(Font.HELVETICA, 19, Font.BOLD, new Color(22, 56, 82));
            Font titleFont = new Font(Font.HELVETICA, 13, Font.BOLD, new Color(44, 112, 155));
            Font bodyFont = new Font(Font.HELVETICA, 10, Font.NORMAL, Color.DARK_GRAY);
            Paragraph hospital = new Paragraph("SMART HOSPITAL", hospitalFont); hospital.setAlignment(Element.ALIGN_CENTER); document.add(hospital);
            Paragraph heading = new Paragraph(title, titleFont); heading.setAlignment(Element.ALIGN_CENTER); heading.setSpacingAfter(18); document.add(heading);
            PdfPTable meta = new PdfPTable(2); meta.setWidthPercentage(100); meta.setWidths(new float[]{1, 1});
            meta.addCell(metaCell("Invoice: " + invoice, bodyFont)); meta.addCell(metaCell("Date: " + date, bodyFont));
            meta.addCell(metaCell(partyLabel + ": " + (party == null || party.isBlank() ? "Walk-in customer" : party), bodyFont));
            meta.addCell(metaCell(contact == null || contact.isBlank() ? "" : "Contact: " + contact, bodyFont));
            meta.setSpacingAfter(18); document.add(meta);
            PdfPTable table = new PdfPTable(new float[]{4.0f, 1.6f, 0.8f, 1.4f, 1.5f}); table.setWidthPercentage(100); table.setHeaderRows(1);
            Font headerFont = new Font(Font.HELVETICA, 9, Font.BOLD, Color.WHITE);
            for (String label : List.of("Medicine", "Batch", "Qty", "Unit price (BDT)", "Amount (BDT)")) {
                PdfPCell cell = new PdfPCell(new Phrase(label, headerFont)); cell.setBackgroundColor(new Color(29, 73, 105)); cell.setPadding(8); table.addCell(cell);
            }
            for (Line line : lines) {
                table.addCell(dataCell(line.medicineName(), bodyFont, Element.ALIGN_LEFT));
                table.addCell(dataCell(line.batchNumber() == null ? "-" : line.batchNumber(), bodyFont, Element.ALIGN_LEFT));
                table.addCell(dataCell(Integer.toString(line.quantity()), bodyFont, Element.ALIGN_RIGHT));
                table.addCell(dataCell(money(line.unitPrice()), bodyFont, Element.ALIGN_RIGHT));
                table.addCell(dataCell(money(line.lineTotal()), bodyFont, Element.ALIGN_RIGHT));
            }
            document.add(table);
            PdfPTable totals = new PdfPTable(new float[]{1, 1}); totals.setWidthPercentage(42); totals.setHorizontalAlignment(Element.ALIGN_RIGHT); totals.setSpacingBefore(16);
            totals.addCell(totalCell("Subtotal", bodyFont, false)); totals.addCell(totalCell("BDT " + money(subtotal), bodyFont, false));
            totals.addCell(totalCell("Discount", bodyFont, false)); totals.addCell(totalCell("BDT " + money(discount), bodyFont, false));
            totals.addCell(totalCell("Total", new Font(Font.HELVETICA, 11, Font.BOLD), true)); totals.addCell(totalCell("BDT " + money(total), new Font(Font.HELVETICA, 11, Font.BOLD, new Color(29, 73, 105)), true));
            document.add(totals);
            Paragraph footer = new Paragraph("Thank you. Please retain this invoice for your records.", new Font(Font.HELVETICA, 8, Font.ITALIC, Color.GRAY));
            footer.setAlignment(Element.ALIGN_CENTER); footer.setSpacingBefore(35); document.add(footer);
            document.close();
            return output.toByteArray();
        } catch (Exception exception) {
            throw new IllegalStateException("Could not generate pharmacy invoice PDF", exception);
        }
    }

    private PdfPCell metaCell(String text, Font font) { PdfPCell cell = new PdfPCell(new Phrase(text, font)); cell.setBorder(Rectangle.NO_BORDER); cell.setPadding(5); return cell; }
    private PdfPCell dataCell(String text, Font font, int alignment) { PdfPCell cell = new PdfPCell(new Phrase(text == null ? "" : text, font)); cell.setHorizontalAlignment(alignment); cell.setPadding(7); return cell; }
    private PdfPCell totalCell(String text, Font font, boolean emphasize) { PdfPCell cell = new PdfPCell(new Phrase(text, font)); cell.setBorder(Rectangle.NO_BORDER); cell.setPadding(5); if (emphasize) cell.setBorderWidthTop(1.2f); cell.setHorizontalAlignment(Element.ALIGN_RIGHT); return cell; }
    private String money(BigDecimal value) { return value == null ? "0.00" : value.setScale(2, java.math.RoundingMode.HALF_UP).toPlainString(); }
}
