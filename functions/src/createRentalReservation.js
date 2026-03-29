const { onRequest } = require("firebase-functions/v2/https");
const { z } = require("zod");
const cors = require("cors")({ origin: true });
const { transporter, escapeHtml, sendEmailWithTimeout } = require("./lib/emailUtils");
const { buildDossierHtml } = require("./lib/buildDossierHtml");
const { generateDossierPdf } = require("./lib/generateDossierPdf");
const { admin, db } = require("./lib/firebaseAdmin");

// ── Rental-only Zod schema (strict — no freight/logistics fields) ──
const rentalReservationSchema = z.object({
  rentalId: z.string().min(1).max(120),
  rentalSlug: z.string().max(160).optional(),
  airportCode: z.string().min(2).max(12),
  machineName: z.string().min(1).max(160),
  operatorName: z.string().min(1).max(160),
  operatorId: z.string().max(160).optional(),
  pickupDate: z.string().min(1),
  returnDate: z.string().min(1),
  contact: z.union([
    z.string().email(),
    z.object({
      email: z.string().email(),
      name: z.string().optional(),
      phone: z.string().optional(),
    }),
  ]),
  riderName: z.string().min(1).max(200).optional(),
  insuranceOption: z.enum(["basic", "premium", "none"]).optional(),
  pickupTime: z.string().max(10).optional(),
  notes: z.string().max(500).optional(),
  legalAcknowledgement: z.object({
    securityDepositAmount: z.string().min(1).max(120),
    securityDepositPolicy: z.string().min(1).max(400),
    cancellationPolicy: z.string().min(1).max(400),
    priorityReservationFee: z.string().min(1).max(120),
    acknowledgedSecurityDeposit: z.string().min(1).max(200),
    acknowledgedCancellationPolicy: z.string().min(1).max(400),
    acknowledgedDepositPolicy: z.string().min(1).max(400),
    acknowledgedReservationFee: z.string().min(1).max(200),
    acknowledgedAt: z.string().min(1).max(80),
    termsLastVerified: z.string().max(80).optional(),
    sourceTermsUrl: z.string().max(500).optional(),
  }).optional(),
});

exports.createRentalReservation = onRequest({ memory: "1GiB", cors: true }, (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  cors(req, res, async () => {
    try {
      console.log("-> [RENTAL] Incoming request:", JSON.stringify(req.body));

      // ── Validate ──
      let data;
      try {
        data = rentalReservationSchema.parse(req.body);
        console.log("OK: Rental validation passed");
      } catch (err) {
        console.error("ERR: RENTAL ZOD VALIDATION:", JSON.stringify(err.issues || err.errors, null, 2));
        return res.status(400).json({
          success: false,
          error: "Invalid reservation data",
          details: err.issues || err.errors,
        });
      }

      // ── Build reservation document ──
      const bookingRef = `JMR-${Date.now()}`;
      const createdAtIso = new Date().toISOString();
      const legalAcknowledgement = data.legalAcknowledgement || null;
      const reservationDocument = {
        bookingRef,
        requestMode: "rental",
        status: "reservation_pending_payment",
        paymentStatus: "unpaid",
        rentalId: data.rentalId,
        rentalSlug: data.rentalSlug || null,
        selectedRentalAirport: data.airportCode,
        selectedRentalMachine: data.machineName,
        selectedRentalOperator: data.operatorName,
        selectedRentalOperatorId: data.operatorId || null,
        pickupDate: data.pickupDate,
        returnDate: data.returnDate,
        arrivalDate: data.pickupDate,
        contact: data.contact,
        riderName: data.riderName || null,
        insuranceOption: data.insuranceOption || "none",
        pickupTime: data.pickupTime || null,
        notes: data.notes || null,
        brokerFeeCents: 5000,
        legalAcknowledgement,
        createdAt: createdAtIso,
      };

      const firestoreDocument = {
        ...reservationDocument,
        createdAtIso,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      await db.collection("bookings").doc(bookingRef).set(firestoreDocument, { merge: true });

      // ── Respond immediately — PDF + email are best-effort ──
      console.log("OK: Returning rental success response");
      res.status(200).json({
        success: true,
        bookingRef,
        data: reservationDocument,
      });

      // ── PDF generation (best-effort) ──
      let pdfBuffer = null;
      try {
        const dossierHtml = buildDossierHtml(reservationDocument);
        pdfBuffer = await generateDossierPdf(dossierHtml);
      } catch (pdfErr) {
        console.error("PDF generation failed:", (pdfErr && pdfErr.message) || "Unknown error");
      }

      // ── Email dispatch ──
      try {
        const email =
          typeof data.contact === "string"
            ? data.contact
            : data.contact.email;

        // ── Ops notification ──
        const opsHtml = `
          <p><strong>Booking Ref:</strong> ${escapeHtml(bookingRef)}</p>
          <p><strong>Type:</strong> RENTAL RESERVATION</p>
          <p><strong>Machine:</strong> ${escapeHtml(data.machineName)}</p>
          <p><strong>Operator:</strong> ${escapeHtml(data.operatorName)}</p>
          <p><strong>Airport:</strong> ${escapeHtml(data.airportCode)}</p>
          <p><strong>Pickup:</strong> ${escapeHtml(data.pickupDate)} ${escapeHtml(data.pickupTime || "TBD")}</p>
          <p><strong>Return:</strong> ${escapeHtml(data.returnDate)}</p>
          <p><strong>Rider:</strong> ${escapeHtml(data.riderName || "Not provided")}</p>
          <p><strong>Insurance:</strong> ${escapeHtml(data.insuranceOption || "none")}</p>
          <p><strong>Contact:</strong> ${escapeHtml(email)}</p>
          ${legalAcknowledgement?.acknowledgedSecurityDeposit ? `<p><strong>Legal:</strong> ${escapeHtml(legalAcknowledgement.acknowledgedSecurityDeposit)}</p>` : ""}
          ${legalAcknowledgement?.acknowledgedCancellationPolicy ? `<p><strong>Cancellation:</strong> ${escapeHtml(legalAcknowledgement.acknowledgedCancellationPolicy)}</p>` : ""}
          ${data.notes ? `<p><strong>Notes:</strong> ${escapeHtml(data.notes)}</p>` : ""}
        `;

        console.log(`[EMAIL] rental queued: ${bookingRef}`);

        void sendEmailWithTimeout(
          transporter.sendMail({
            from: process.env.GMAIL_EMAIL,
            to: "info@jetmymoto.com",
            subject: `[RENTAL] ${bookingRef} - ${data.machineName} @ ${data.airportCode}`,
            html: opsHtml,
          }),
          3000
        ).catch((err) => {
          console.error("Ops email delivery failed:", (err && err.message) || "Unknown error");
        });

        // ── Customer confirmation ──
        const fallbackLink = `https://rideratlas.com/booking/${encodeURIComponent(bookingRef)}`;
        const fallbackBlock = `
          <p style="margin-top:24px;font-size:13px;color:#888;">If the attachment does not load, your dossier is available here:</p>
          <p><a href="${fallbackLink}" style="color:#CDA755;">View your deployment dossier</a></p>
        `;

        const customerSubject = `JetMyMoto: Tactical Hardware Secured - ${escapeHtml(data.machineName)}`;
        const customerHtml = `
          <p>Commander,</p>
          <p>Your rental deployment is confirmed. Attached is your official Reservation Dossier.</p>
          <p>Present this document to <strong>${escapeHtml(data.operatorName)}</strong>
             at <strong>${escapeHtml(data.airportCode)}</strong>.</p>
          <p><strong>Booking Ref:</strong> ${escapeHtml(bookingRef)}</p>
          <p><strong>Pickup:</strong> ${escapeHtml(data.pickupDate)} ${escapeHtml(data.pickupTime || "")}</p>
          <p><strong>Return:</strong> ${escapeHtml(data.returnDate)}</p>
          ${legalAcknowledgement?.acknowledgedSecurityDeposit ? `<p><strong>${escapeHtml(legalAcknowledgement.acknowledgedSecurityDeposit)}</strong></p>` : ""}
          <p>This document confirms your machine reservation.</p>
          ${fallbackBlock}
          <p>&mdash; JetMyMoto Tactical Division</p>
        `;

        const pdfFilename = `JetMyMoto-Reservation-${bookingRef}.pdf`;

        void sendEmailWithTimeout(
          transporter.sendMail({
            from: process.env.GMAIL_EMAIL,
            to: email,
            subject: customerSubject,
            html: customerHtml,
            attachments: pdfBuffer
              ? [{ filename: pdfFilename, content: pdfBuffer, contentType: "application/pdf" }]
              : [],
          }),
          15000
        ).catch((err) => {
          console.error("Customer email failed:", (err && err.message) || "Unknown error");
        });
      } catch (err) {
        console.error("Email preparation error:", err);
      }
    } catch (err) {
      console.error("🔥 RENTAL FUNCTION CRASH:", err);

      if (err instanceof z.ZodError || (err && err.issues)) {
        return res.status(400).json({
          success: false,
          error: "Invalid reservation data",
          details: err.issues || err.errors,
        });
      }

      return res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  });
});
