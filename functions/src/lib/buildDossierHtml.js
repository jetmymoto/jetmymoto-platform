function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function buildDossierHtml(bookingDocument) {
  const isRental = bookingDocument.requestMode === "rental";
  const ref = escapeHtml(bookingDocument.bookingRef);
  const date = escapeHtml(bookingDocument.arrivalDate || "TBD");

  const headBlock = `
    <head>
      <meta charset="UTF-8" />
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          background: #050505; color: #E0E0E0;
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          padding: 48px 40px;
        }
        .brand {
          color: #CDA755; font-size: 13px; letter-spacing: 4px;
          text-transform: uppercase; font-weight: 600;
        }
        .ref {
          color: #CDA755; font-size: 11px; letter-spacing: 2px; margin-top: 8px;
          font-family: 'Courier New', Courier, monospace;
        }
        h1 {
          color: #FFFFFF; font-size: 28px; font-weight: 700; margin: 32px 0 8px;
        }
        h2 {
          color: #CDA755; font-size: 14px; letter-spacing: 3px;
          text-transform: uppercase; margin: 36px 0 16px;
          border-bottom: 1px solid #1A1A1A; padding-bottom: 8px;
        }
        .panel {
          background: #121212; border-radius: 6px; padding: 24px;
          margin: 16px 0;
        }
        .row {
          display: flex; justify-content: space-between; padding: 12px 0;
          border-bottom: 1px solid #1A1A1A; font-size: 14px;
        }
        .row:last-child { border-bottom: none; }
        .row-label {
          color: #888; font-family: 'Courier New', Courier, monospace;
          font-size: 12px; letter-spacing: 1px; text-transform: uppercase;
        }
        .row-value { color: #FFF; font-weight: 600; }
        .amber { color: #CDA755; }
        .terms-box {
          margin: 36px 0; padding: 24px; border: 1px solid #CDA755;
          border-radius: 4px; background: #0A0A0A;
        }
        .terms-box h2 { margin-top: 0; border: none; padding: 0; }
        .terms-box p { font-size: 13px; line-height: 1.7; color: #CCC; }
        .present-notice {
          margin: 24px 0; padding: 20px; text-align: center;
          background: #121212; border-left: 3px solid #CDA755; border-radius: 4px;
        }
        .present-notice p {
          font-size: 14px; color: #E0E0E0; line-height: 1.6;
        }
        .footer {
          margin-top: 48px; font-size: 11px; color: #555; text-align: center;
          border-top: 1px solid #1A1A1A; padding-top: 16px;
        }
      </style>
    </head>`;

  if (isRental) {
    const machine  = escapeHtml(bookingDocument.selectedRentalMachine || "Unspecified");
    const operator = escapeHtml(bookingDocument.selectedRentalOperator || "Unspecified");
    const airport  = escapeHtml(bookingDocument.selectedRentalAirport || "Unspecified");
    const legalAcknowledgement = bookingDocument.legalAcknowledgement || null;
    const legalRows = [
      legalAcknowledgement?.acknowledgedSecurityDeposit || null,
      legalAcknowledgement?.acknowledgedDepositPolicy || null,
      legalAcknowledgement?.acknowledgedCancellationPolicy || null,
      legalAcknowledgement?.acknowledgedReservationFee || "Acknowledged Priority Reservation Fee: EUR 50",
    ].filter(Boolean).map((item) => `<p>${escapeHtml(item)}</p>`).join("");

    return `<!DOCTYPE html><html>${headBlock}<body>
      <div class="brand">JETMYMOTO</div>
      <div class="ref">REF ${ref}</div>
      <h1>Tactical Hardware Reservation</h1>

      <h2>Deployment Intel</h2>
      <div class="panel">
        <div class="row">
          <span class="row-label">Deployment Hub</span>
          <span class="row-value">${airport}</span>
        </div>
        <div class="row">
          <span class="row-label">Secured Machine</span>
          <span class="row-value">${machine}</span>
        </div>
        <div class="row">
          <span class="row-label">Verified Operator</span>
          <span class="row-value">${operator}</span>
        </div>
        <div class="row">
          <span class="row-label">Deployment Date</span>
          <span class="row-value">${date}</span>
        </div>
        <div class="row">
          <span class="row-label">Booking Reference</span>
          <span class="row-value amber">${ref}</span>
        </div>
      </div>

      <div class="present-notice">
        <p>Present this document to <strong class="amber">${operator}</strong> at <strong class="amber">${airport}</strong>.</p>
      </div>

      <div class="terms-box">
        <h2>Mission Terms</h2>
        <p>
          A <span class="amber">&euro;50</span> priority reservation fee has been authorized.
          The remaining daily balance is to be settled directly with the verified operator
          at the staging hub.
        </p>
        ${legalRows}
      </div>

      <div class="footer">
        JETMYMOTO &mdash; Tactical Hardware Reservation &mdash; ${ref}
      </div>
    </body></html>`;
  }

  // ── LOGISTICS: Deployment Brief ──
  const pickup = escapeHtml(bookingDocument.pickupCity);
  const dest   = escapeHtml(bookingDocument.destinationCity);
  const hub    = escapeHtml(bookingDocument.hub || "AUTO");
  const dist   = bookingDocument.distanceKm;
  const price  = bookingDocument.estimatedPrice;
  const bikes  = bookingDocument.bikes || { small: 0, medium: 0, large: 0 };

  const fleetRows = [
    bikes.large  > 0 ? `<div class="row"><span class="row-label">Large Class</span><span class="row-value">${bikes.large}</span></div>` : "",
    bikes.medium > 0 ? `<div class="row"><span class="row-label">Medium Class</span><span class="row-value">${bikes.medium}</span></div>` : "",
    bikes.small  > 0 ? `<div class="row"><span class="row-label">Small Class</span><span class="row-value">${bikes.small}</span></div>` : "",
  ].filter(Boolean).join("\n        ");

  return `<!DOCTYPE html><html>${headBlock}<body>
    <div class="brand">JETMYMOTO</div>
    <div class="ref">REF ${ref}</div>
    <h1>Secure Transport Dossier</h1>

    <h2>Route Intelligence</h2>
    <div class="panel">
      <div class="row">
        <span class="row-label">Origin</span>
        <span class="row-value">${pickup}</span>
      </div>
      <div class="row">
        <span class="row-label">Destination</span>
        <span class="row-value">${dest}</span>
      </div>
      <div class="row">
        <span class="row-label">Nearest Hub</span>
        <span class="row-value">${hub}</span>
      </div>
      <div class="row">
        <span class="row-label">Distance</span>
        <span class="row-value">${dist} km</span>
      </div>
      <div class="row">
        <span class="row-label">Deployment Date</span>
        <span class="row-value">${date}</span>
      </div>
    </div>

    <h2>Fleet Manifest</h2>
    <div class="panel">
      ${fleetRows}
    </div>

    <h2>Financial Summary</h2>
    <div class="panel">
      <div class="row">
        <span class="row-label">Total Units</span>
        <span class="row-value">${bookingDocument.totalUnits}</span>
      </div>
      <div class="row">
        <span class="row-label">Estimated Price</span>
        <span class="row-value amber">EUR ${price}</span>
      </div>
    </div>

    <div class="footer">
      JETMYMOTO &mdash; Secure Transport Dossier &mdash; ${ref}
    </div>
  </body></html>`;
}

module.exports = { buildDossierHtml };
