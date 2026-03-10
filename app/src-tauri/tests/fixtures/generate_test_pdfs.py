#!/usr/bin/env python3
"""Generate synthetic test PDFs for Justice AI parser tests.

Run: python3 generate_test_pdfs.py

Creates 3 PDFs in the current directory:
  1. plain_contract.pdf       — Plain text (no form fields), multi-paragraph
  2. filled_form_simple.pdf   — Fillable form with AcroForm fields (filled)
  3. multipage_form.pdf       — 2-page filled form
"""

from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch

W, H = letter  # 612 x 792


# ── 1. Plain text contract (no form fields) ─────────────────────────────────

def make_plain_contract():
    c = canvas.Canvas("plain_contract.pdf", pagesize=letter)
    c.setFont("Helvetica-Bold", 16)
    c.drawString(1*inch, H - 1*inch, "RESIDENTIAL LEASE AGREEMENT")

    c.setFont("Helvetica", 11)
    y = H - 1.6*inch
    lines = [
        "This Lease Agreement is entered into on March 15, 2025, between:",
        "",
        "Landlord: Jane Thompson, 500 Oak Avenue, Portland, OR 97201",
        "Tenant: Robert Chen, SSN ending 4421",
        "",
        "Property Address: 742 Evergreen Terrace, Unit 3B, Portland, OR 97201",
        "",
        "Term: 12 months, beginning April 1, 2025 and ending March 31, 2026.",
        "Monthly Rent: $1,850.00, due on the 1st of each month.",
        "Security Deposit: $3,700.00 (two months' rent).",
        "Late Fee: $75.00 if rent is received after the 5th of the month.",
        "",
        "Utilities: Tenant is responsible for electricity, gas, and internet.",
        "Landlord pays water and trash collection.",
        "",
        "Pet Policy: One pet allowed with $500 pet deposit. Maximum weight 40 lbs.",
        "",
        "Governing Law: State of Oregon.",
        "",
        "Landlord Signature: Jane Thompson          Date: 03/15/2025",
        "Tenant Signature: Robert Chen              Date: 03/15/2025",
    ]
    for line in lines:
        if line == "":
            y -= 14
            continue
        c.drawString(1*inch, y, line)
        y -= 16

    c.save()
    print("  Created plain_contract.pdf")


# ── 2. Filled form (simulates XObject-based form fields) ────────────────────

def make_filled_form():
    """Simulates the structure of a filled PDF form by drawing labels first,
    then drawing filled values as separate Form XObjects placed at the
    correct coordinates. This mimics the real-world problem where pdf-extract
    outputs template text and filled values in separate blocks."""
    c = canvas.Canvas("filled_form_simple.pdf", pagesize=letter)

    c.setFont("Helvetica-Bold", 14)
    c.drawString(1*inch, H - 1*inch, "CATERING SERVICE AGREEMENT")

    # --- Template labels with blanks (the "big XObject" in real PDFs) ---
    c.setFont("Helvetica", 10)
    fields = [
        (1.0, H - 1.8*inch,  "Client Name: ____________________"),
        (4.5, H - 1.8*inch,  "Event Type: ____________________"),
        (1.0, H - 2.2*inch,  "Event Date: ____________________"),
        (4.5, H - 2.2*inch,  "Guest Count: ____________________"),
        (1.0, H - 2.6*inch,  "Venue: ____________________"),
        (4.5, H - 2.6*inch,  "Total Cost: ____________________"),
        (1.0, H - 3.0*inch,  "Contact Email: ____________________"),
        (4.5, H - 3.0*inch,  "Phone: ____________________"),
    ]
    for x_in, y, text in fields:
        c.drawString(x_in * inch, y, text)

    # Boilerplate between labels and values (like the real contract)
    c.setFont("Helvetica", 9)
    boilerplate_y = H - 3.6*inch
    boilerplate = [
        "TERMS AND CONDITIONS: The Caterer agrees to provide food and beverage service",
        "for the event described above. A 50% deposit is required at signing. The remaining",
        "balance is due 7 days before the event. Cancellation within 14 days of the event",
        "forfeits the deposit. Menu changes must be submitted at least 21 days in advance.",
        "The Caterer carries liability insurance up to $1,000,000 per occurrence.",
        "",
        "Dietary accommodations will be provided at no extra charge with 14 days notice.",
        "Setup begins 2 hours before event start. Breakdown completes within 1 hour after.",
        "",
        "Caterer Signature: ____________________    Date: ____________________",
        "Client Signature: ____________________     Date: ____________________",
    ]
    for line in boilerplate:
        if line == "":
            boilerplate_y -= 12
            continue
        c.drawString(1*inch, boilerplate_y, line)
        boilerplate_y -= 14

    # --- Filled values as separate Form XObjects ---
    # In a real PDF these are separate XObjects placed via `cm` + `Do`.
    # reportlab's acroform support is limited, so we simulate the key property:
    # values are drawn AFTER all template text, but at the correct coordinates.
    #
    # We use saveState/restoreState to group them, which creates the same
    # q/Q wrapping that real form fields have.

    c.setFont("Helvetica", 10)
    c.setFillColorRGB(0, 0, 0.6)  # slightly blue to distinguish

    filled_values = [
        (2.5*inch,  H - 1.8*inch,  "Maria Garcia"),
        (5.8*inch,  H - 1.8*inch,  "Wedding Reception"),
        (2.5*inch,  H - 2.2*inch,  "June 14, 2025"),
        (5.8*inch,  H - 2.2*inch,  "200"),
        (2.5*inch,  H - 2.6*inch,  "The Grand Ballroom, 100 Main St"),
        (5.8*inch,  H - 2.6*inch,  "$8,500"),
        (2.5*inch,  H - 3.0*inch,  "maria.garcia@email.com"),
        (5.8*inch,  H - 3.0*inch,  "555-0147"),
    ]

    # Signature dates (these go at the bottom, like the real contract)
    sig_values = [
        (3.5*inch, boilerplate_y + 14*2 + 12, "03/01/2025"),   # Caterer sig date
        (3.5*inch, boilerplate_y + 14, "03/03/2025"),           # Client sig date
    ]

    # Draw all filled values in a batch (simulating XObject batch rendering)
    for x, y, text in filled_values + sig_values:
        c.saveState()
        c.drawString(x, y, text)
        c.restoreState()

    c.save()
    print("  Created filled_form_simple.pdf")


# ── 3. Multi-page filled form ───────────────────────────────────────────────

def make_multipage_form():
    c = canvas.Canvas("multipage_form.pdf", pagesize=letter)

    # ---- Page 1 ----
    c.setFont("Helvetica-Bold", 14)
    c.drawString(1*inch, H - 1*inch, "PHOTOGRAPHY SERVICE CONTRACT")
    c.setFont("Helvetica-Bold", 11)
    c.drawString(1*inch, H - 1.4*inch, "Page 1 — Client & Event Details")

    c.setFont("Helvetica", 10)
    labels_p1 = [
        (1.0, H - 2.0*inch,  "Photographer: ____________________"),
        (1.0, H - 2.4*inch,  "Client Name: ____________________"),
        (4.5, H - 2.4*inch,  "Client Phone: ____________________"),
        (1.0, H - 2.8*inch,  "Event Type: ____________________"),
        (4.5, H - 2.8*inch,  "Event Date: ____________________"),
        (1.0, H - 3.2*inch,  "Location: ____________________"),
        (1.0, H - 3.6*inch,  "Start Time: ____________________"),
        (4.5, H - 3.6*inch,  "End Time: ____________________"),
    ]
    for x_in, y, text in labels_p1:
        c.drawString(x_in * inch, y, text)

    # Filled values for page 1
    c.setFont("Helvetica", 10)
    c.setFillColorRGB(0, 0, 0.6)
    values_p1 = [
        (2.8*inch, H - 2.0*inch,  "Sarah Mitchell Photography"),
        (2.8*inch, H - 2.4*inch,  "David Kim"),
        (5.8*inch, H - 2.4*inch,  "555-0293"),
        (2.8*inch, H - 2.8*inch,  "Corporate Gala"),
        (5.8*inch, H - 2.8*inch,  "September 20, 2025"),
        (2.8*inch, H - 3.2*inch,  "Hilton Downtown, Chicago, IL"),
        (2.8*inch, H - 3.6*inch,  "5:00 PM"),
        (5.8*inch, H - 3.6*inch,  "11:00 PM"),
    ]
    for x, y, text in values_p1:
        c.saveState()
        c.drawString(x, y, text)
        c.restoreState()

    c.showPage()

    # ---- Page 2 ----
    c.setFont("Helvetica-Bold", 11)
    c.drawString(1*inch, H - 1*inch, "Page 2 — Pricing & Terms")

    c.setFont("Helvetica", 10)
    c.setFillColorRGB(0, 0, 0)
    labels_p2 = [
        (1.0, H - 1.6*inch,  "Package: ____________________"),
        (1.0, H - 2.0*inch,  "Total Price: ____________________"),
        (4.5, H - 2.0*inch,  "Deposit: ____________________"),
        (1.0, H - 2.4*inch,  "Overtime Rate: ____________________"),
    ]
    for x_in, y, text in labels_p2:
        c.drawString(x_in * inch, y, text)

    # Boilerplate
    c.setFont("Helvetica", 9)
    bp_y = H - 3.2*inch
    for line in [
        "The photographer retains copyright to all images. Client receives a",
        "non-exclusive license for personal and corporate use. Resale prohibited.",
        "",
        "Photographer Signature: ____________________    Date: ____________________",
        "Client Signature: ____________________          Date: ____________________",
    ]:
        if line == "":
            bp_y -= 12
            continue
        c.drawString(1*inch, bp_y, line)
        bp_y -= 14

    # Filled values page 2
    c.setFillColorRGB(0, 0, 0.6)
    values_p2 = [
        (2.8*inch, H - 1.6*inch,  "Premium 6-Hour"),
        (2.8*inch, H - 2.0*inch,  "$4,200"),
        (5.8*inch, H - 2.0*inch,  "$2,100"),
        (2.8*inch, H - 2.4*inch,  "$350/hour"),
        (3.8*inch, bp_y + 14*2 + 12, "08/15/2025"),  # Photographer sig date
        (3.8*inch, bp_y + 14, "08/18/2025"),          # Client sig date
    ]
    for x, y, text in values_p2:
        c.saveState()
        c.drawString(x, y, text)
        c.restoreState()

    c.save()
    print("  Created multipage_form.pdf")


if __name__ == "__main__":
    print("Generating test PDFs...")
    make_plain_contract()
    make_filled_form()
    make_multipage_form()
    print("Done.")
