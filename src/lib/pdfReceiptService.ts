import { jsPDF } from "jspdf";
import { PaymentReceipt } from "../types";

export const SUPER_USER_CONTACT = {
  name: "Bethuel Moukangwe (BSc Maths)",
  title: "Head Mathematical Coach & Founder",
  email: "bethuelthipe@gmail.com",
  backupEmail: "bethuelmoukangwe8@gmail.com",
  whatsappNumber: "+27714156665",
  displayPhone: "+27 71 415 6665",
  address: "Pretoria, Gauteng, South Africa",
  taxNumber: "AMH-VAT-ZA-449102",
  website: "www.amarismathematics.co.za"
};

/**
 * Generate a high-contrast, professional A4 PDF Receipt / Tax Invoice
 */
export function generateReceiptPdf(receipt: PaymentReceipt): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  // Color Palette
  const navyDark = [15, 23, 42];      // #0f172a
  const goldAccent = [234, 179, 8];    // #eab308
  const royalBlue = [37, 99, 235];    // #2563eb
  const textDark = [30, 41, 59];      // #1e293b
  const textMuted = [100, 116, 139];  // #64748b
  const lightBg = [248, 250, 252];    // #f8fafc
  const emeraldGreen = [22, 163, 74]; // #16a34a

  // --- 1. HEADER BANNER ---
  doc.setFillColor(navyDark[0], navyDark[1], navyDark[2]);
  doc.rect(0, 0, 210, 36, "F");

  // Gold accent line
  doc.setFillColor(goldAccent[0], goldAccent[1], goldAccent[2]);
  doc.rect(0, 36, 210, 3, "F");

  // Header Typography
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("AMARIS MATHEMATICS HUB", 14, 15);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(goldAccent[0], goldAccent[1], goldAccent[2]);
  doc.text("OFFICIAL TAX INVOICE & LESSON BOOKING RECEIPT", 14, 22);

  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  doc.text("National Senior Certificate (CAPS) & IEB Mathematics Excellence | Pretoria, South Africa", 14, 29);

  // Right Header info
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text(`RECEIPT: ${receipt.receipt_number}`, 145, 14);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  doc.text(`Booking Ref: ${receipt.booking_reference}`, 145, 20);
  doc.text(`Date Issued: ${receipt.created_at || new Date().toISOString().split("T")[0]}`, 145, 25);
  doc.text(`Payment: ${receipt.payment_method.toUpperCase()}`, 145, 30);

  let currentY = 46;

  // --- 2. PAYMENT STATUS BANNER ---
  doc.setFillColor(240, 253, 244); // light green
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(14, currentY, 182, 14, 2, 2, "FD");

  doc.setTextColor(emeraldGreen[0], emeraldGreen[1], emeraldGreen[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("✓ PAYMENT APPROVED & SECURED", 20, currentY + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(`Simultaneous delivery verified: Student (${receipt.student_email}) + Super User (${receipt.super_user_email})`, 20, currentY + 11);

  // Delivery Channel Badge on right
  const channelLabel = receipt.delivery_channel === "both" ? "EMAIL + WHATSAPP" : receipt.delivery_channel.toUpperCase();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(royalBlue[0], royalBlue[1], royalBlue[2]);
  doc.text(`CHANNEL: ${channelLabel}`, 145, currentY + 9);

  currentY += 20;

  // --- 3. TWO-COLUMN DETAILS BOX (STUDENT vs TUTOR/SERVICE PROVIDER) ---
  const boxWidth = 88;
  const boxHeight = 44;

  // Left Box: Student & Billed To
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, currentY, boxWidth, boxHeight, 2, 2, "FD");

  doc.setTextColor(navyDark[0], navyDark[1], navyDark[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("BILLED TO (STUDENT / PARENT)", 18, currentY + 7);

  doc.setDrawColor(203, 213, 225);
  doc.line(18, currentY + 9, 18 + boxWidth - 8, currentY + 9);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(receipt.student_name, 18, currentY + 15);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(`Email: ${receipt.student_email || "N/A"}`, 18, currentY + 21);
  doc.text(`Phone/WhatsApp: ${receipt.student_phone || "071 415 6665"}`, 18, currentY + 26);
  doc.text(`Grade / Stream: ${receipt.student_grade || "Grade 12 CAPS/IEB"}`, 18, currentY + 31);
  if (receipt.parent_name || receipt.parent_phone) {
    doc.text(`Parent/Sponsor: ${receipt.parent_name || "Parent"} (${receipt.parent_phone || ""})`, 18, currentY + 36);
  } else {
    doc.text(`School: ${receipt.student_school || "High School"}`, 18, currentY + 36);
  }

  // Right Box: Tutor & Institution
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(108, currentY, boxWidth, boxHeight, 2, 2, "FD");

  doc.setTextColor(navyDark[0], navyDark[1], navyDark[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("SERVICE PROVIDER & LEAD TUTOR", 112, currentY + 7);

  doc.setDrawColor(203, 213, 225);
  doc.line(112, currentY + 9, 112 + boxWidth - 8, currentY + 9);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(receipt.tutor_name || SUPER_USER_CONTACT.name, 112, currentY + 15);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(`${receipt.tutor_title || SUPER_USER_CONTACT.title}`, 112, currentY + 21);
  doc.text(`Official WhatsApp: ${SUPER_USER_CONTACT.displayPhone}`, 112, currentY + 26);
  doc.text(`Super User Email: ${SUPER_USER_CONTACT.email}`, 112, currentY + 31);
  doc.text(`HQ: ${SUPER_USER_CONTACT.address}`, 112, currentY + 36);

  currentY += boxHeight + 8;

  // --- 4. LESSON & WHITEBOARD SPECIFICATION ---
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, currentY, 182, 30, 2, 2, "FD");

  doc.setTextColor(navyDark[0], navyDark[1], navyDark[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.text("LESSON & WHITEBOARD CLASSROOM SPECIFICATION", 18, currentY + 7);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);

  doc.text(`• Subject: ${receipt.subject_name}`, 18, currentY + 14);
  doc.text(`• Scheduled Date: ${receipt.lesson_date}`, 18, currentY + 19);
  doc.text(`• Time Slot (SAST): ${receipt.lesson_time}`, 18, currentY + 24);

  doc.text(`• Platform: ${receipt.platform} Live Interactive Board`, 108, currentY + 14);
  doc.text(`• Duration: ${receipt.duration_minutes} Minutes (1-on-1)`, 108, currentY + 19);
  
  const topicsStr = Array.isArray(receipt.topics_to_cover) && receipt.topics_to_cover.length > 0
    ? receipt.topics_to_cover.slice(0, 2).join(", ")
    : "Syllabus Mastery & Exam Questions";
  doc.text(`• Topics: ${topicsStr}`, 108, currentY + 24);

  currentY += 36;

  // --- 5. FINANCIAL ITEMIZED TABLE ---
  doc.setFillColor(navyDark[0], navyDark[1], navyDark[2]);
  doc.rect(14, currentY, 182, 8, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("ITEM DESCRIPTION", 18, currentY + 5.5);
  doc.text("QTY / HOURS", 108, currentY + 5.5);
  doc.text("RATE", 140, currentY + 5.5);
  doc.text("TOTAL (ZAR)", 170, currentY + 5.5);

  currentY += 8;

  // Table Row 1
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.rect(14, currentY, 182, 14, "FD");

  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text(receipt.package_name || "1-on-1 Whiteboard Tutoring Session", 18, currentY + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(`Includes interactive whiteboard recording & homework review`, 18, currentY + 10.5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(`${receipt.lessons_count || 1} Session`, 108, currentY + 7);
  doc.text(`R${(receipt.amount / (receipt.lessons_count || 1)).toFixed(2)}`, 140, currentY + 7);
  doc.text(`R${receipt.amount.toFixed(2)}`, 170, currentY + 7);

  currentY += 14;

  // Totals Area
  const totalsY = currentY;
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.setDrawColor(226, 232, 240);
  doc.rect(108, totalsY, 88, 26, "FD");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text("Subtotal:", 112, totalsY + 6);
  doc.text(`R${receipt.amount.toFixed(2)}`, 170, totalsY + 6);

  doc.text("VAT / Tax (Educational 0%):", 112, totalsY + 12);
  doc.text("R0.00", 170, totalsY + 12);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(navyDark[0], navyDark[1], navyDark[2]);
  doc.text("Total Paid:", 112, totalsY + 20);
  doc.setTextColor(emeraldGreen[0], emeraldGreen[1], emeraldGreen[2]);
  doc.text(`R${receipt.amount.toFixed(2)} ZAR`, 164, totalsY + 20);

  // Left of totals: Transaction Verification badge
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.setDrawColor(226, 232, 240);
  doc.rect(14, totalsY, 90, 26, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(navyDark[0], navyDark[1], navyDark[2]);
  doc.text("PAYMENT GATEWAY CLEARANCE", 18, totalsY + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(`Gateway: PayFast SA / Instant EFT Gateway`, 18, totalsY + 11);
  doc.text(`Transaction ID: ${receipt.transaction_id}`, 18, totalsY + 16);
  doc.text(`Status: CLEARED (Audit Reference: ${receipt.verification_hash.slice(0, 16)}...)`, 18, totalsY + 21);

  currentY += 32;

  // --- 6. VIRTUAL CLASSROOM ACCESS LINK ---
  if (receipt.meeting_link) {
    doc.setFillColor(238, 242, 255);
    doc.setDrawColor(199, 210, 254);
    doc.roundedRect(14, currentY, 182, 14, 2, 2, "FD");

    doc.setTextColor(royalBlue[0], royalBlue[1], royalBlue[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text("VIRTUAL ZOOM WHITEBOARD LINK:", 18, currentY + 6);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.text(receipt.meeting_link, 18, currentY + 11);

    currentY += 18;
  }

  // --- 7. OFFICIAL STAMP & TERMS ---
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, currentY, 182, 24, 2, 2, "FD");

  doc.setTextColor(navyDark[0], navyDark[1], navyDark[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("OFFICIAL AMARIS ACADEMIC GUARANTEE & CANCELLATION POLICY", 18, currentY + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text("1. All tutoring credits are valid for 6 months. Rescheduling requires a minimum of 24 hours advance notice.", 18, currentY + 11);
  doc.text("2. Please ensure student is logged into the Zoom whiteboard 5 minutes prior to start time with stationery and calculator.", 18, currentY + 15);
  doc.text("3. Queries & urgent support: WhatsApp +27 71 415 6665 or email bethuelthipe@gmail.com.", 18, currentY + 19);

  // --- 8. FOOTER BAR ---
  doc.setFillColor(navyDark[0], navyDark[1], navyDark[2]);
  doc.rect(0, 285, 210, 12, "F");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225);
  doc.text("Amaris Mathematics Hub (Pty) Ltd | Automated Secure Checkout & Receipt Dispatch Engine", 14, 292);
  doc.text(`Verified: ${receipt.verification_hash.slice(0, 12)}`, 160, 292);

  return doc;
}

/**
 * Trigger immediate client-side download of the PDF Receipt
 */
export function downloadReceiptPdf(receipt: PaymentReceipt): void {
  try {
    const doc = generateReceiptPdf(receipt);
    const fileName = `${receipt.receipt_number}_${receipt.student_name.replace(/\s+/g, "_")}.pdf`;
    doc.save(fileName);
  } catch (err) {
    console.error("Failed to generate or download receipt PDF:", err);
  }
}

/**
 * Get PDF as a Blob object (for local preview or upload)
 */
export function getReceiptPdfBlob(receipt: PaymentReceipt): Blob {
  const doc = generateReceiptPdf(receipt);
  return doc.output("blob");
}

/**
 * Get PDF as base64 data string (for email dispatch payload)
 */
export function getReceiptPdfBase64(receipt: PaymentReceipt): string {
  const doc = generateReceiptPdf(receipt);
  return doc.output("datauristring");
}

/**
 * Trigger browser native print for the generated receipt
 */
export function printReceiptPdf(receipt: PaymentReceipt): void {
  try {
    const doc = generateReceiptPdf(receipt);
    const blob = doc.output("blob");
    const blobUrl = URL.createObjectURL(blob);
    const printWindow = window.open(blobUrl, "_blank");
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  } catch (err) {
    console.error("Failed to print receipt:", err);
  }
}

/**
 * Generate formatted WhatsApp message text for student or super user
 */
export function generateWhatsAppReceiptText(receipt: PaymentReceipt, isSuperUser: boolean): string {
  if (isSuperUser) {
    return `🚨 *[AMARIS NEW BOOKING & PAYMENT ALERT]* 🚨
━━━━━━━━━━━━━━━━━━━━━
*Receipt No:* ${receipt.receipt_number}
*Booking Ref:* ${receipt.booking_reference}
*Amount Paid:* R${receipt.amount.toFixed(2)} ZAR (${receipt.payment_method})

👤 *STUDENT DETAILS:*
• *Name:* ${receipt.student_name}
• *Email:* ${receipt.student_email}
• *Phone:* ${receipt.student_phone || "N/A"}
• *Grade:* ${receipt.student_grade || "Grade 12 CAPS/IEB"}
${receipt.parent_phone ? `• *Parent Phone:* ${receipt.parent_phone}` : ""}

📚 *LESSON SPECIFICATION:*
• *Subject:* ${receipt.subject_name}
• *Package:* ${receipt.package_name} (${receipt.lessons_count} hrs)
• *Date:* ${receipt.lesson_date}
• *Time:* ${receipt.lesson_time} SAST
• *Platform:* Zoom Interactive Whiteboard
• *Meeting Link:* ${receipt.meeting_link || "https://zoom.us"}
• *Topics:* ${Array.isArray(receipt.topics_to_cover) ? receipt.topics_to_cover.join(", ") : receipt.topics_to_cover}

*Status:* ✓ PAYMENT CLEARED & LOGGED
Simultaneously dispatched to Student & Super User.`;
  }

  return `📚 *AMARIS MATHEMATICS HUB - BOOKING & RECEIPT* 📚
━━━━━━━━━━━━━━━━━━━━━
Hello *${receipt.student_name}*! 👋

Your 1-on-1 live mathematics lesson has been *confirmed* and payment of *R${receipt.amount.toFixed(2)}* cleared.

🧾 *RECEIPT SUMMARY:*
• *Receipt No:* ${receipt.receipt_number}
• *Booking Ref:* ${receipt.booking_reference}
• *Subject:* ${receipt.subject_name}
• *Date:* ${receipt.lesson_date}
• *Time:* ${receipt.lesson_time} SAST
• *Duration:* ${receipt.duration_minutes} Mins
• *Tutor:* ${receipt.tutor_name || "Bethuel Moukangwe (BSc Maths)"}

🔗 *JOIN ZOOM WHITEBOARD:*
${receipt.meeting_link || "https://zoom.us"}

📌 *Important Reminders:*
- Join 5 mins early to test audio & screen connection.
- Prepare your notepad, calculator, and past paper questions.
- A full PDF receipt has also been dispatched to your email (${receipt.student_email}).

Official Tutor WhatsApp: *+27 71 415 6665*`;
}

/**
 * Generate click-to-chat WhatsApp link
 */
export function generateWhatsAppReceiptUrl(receipt: PaymentReceipt, recipientPhone: string, isSuperUser: boolean): string {
  const cleanNumber = recipientPhone.replace(/[^0-9]/g, "");
  const formattedNumber = cleanNumber.startsWith("0")
    ? "27" + cleanNumber.slice(1)
    : cleanNumber.startsWith("27")
      ? cleanNumber
      : "27714156665";

  const messageText = generateWhatsAppReceiptText(receipt, isSuperUser);
  return `https://wa.me/${formattedNumber}?text=${encodeURIComponent(messageText)}`;
}
