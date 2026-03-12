#!/usr/bin/env python3
"""Generate synthetic PDF eval fixtures for Justice AI RAG evaluation.

Run: python3 generate_eval_fixtures.py

Creates 3 PDFs in the current directory:
  1. confusable_lease.pdf       — 2-page lease with confusable party names / many dates
  2. dense_nda.pdf              — 8-10 page NDA with high embedding similarity across sections
  3. settlement_breakdown.pdf   — 3-page settlement with itemized financials
"""

from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
)
from reportlab.lib import colors

_styles = getSampleStyleSheet()


def _mk(name_suffix, body_sz=10, body_ld=14, body_af=8,
         head_sz=13, head_bf=14, head_af=6, sig_bf=24):
    """Build a style dict with unique names to avoid ParagraphStyle conflicts."""
    s = name_suffix
    return dict(
        title=ParagraphStyle(
            f"Title_{s}", parent=_styles["Title"], fontSize=16,
            spaceAfter=20, alignment=TA_CENTER),
        heading=ParagraphStyle(
            f"Head_{s}", parent=_styles["Heading2"], fontSize=head_sz,
            spaceBefore=head_bf, spaceAfter=head_af,
            textColor=colors.HexColor("#1a1a1a")),
        body=ParagraphStyle(
            f"Body_{s}", parent=_styles["BodyText"], fontSize=body_sz,
            leading=body_ld, alignment=TA_JUSTIFY, spaceAfter=body_af),
        sig=ParagraphStyle(
            f"Sig_{s}", parent=_styles["BodyText"], fontSize=body_sz,
            leading=body_ld + 2, spaceBefore=sig_bf),
    )


# Lease — fill 2 pages
SL = _mk("L", body_sz=10, body_ld=14, body_af=8,
          head_sz=12, head_bf=12, head_af=5, sig_bf=16)

# Spacious — spread NDA across 8-10 pages
SN = _mk("N", body_sz=11.5, body_ld=22, body_af=26,
          head_sz=15, head_bf=36, head_af=18, sig_bf=40)

# Medium — settlement on 3 pages
SS = _mk("S", body_sz=10, body_ld=14, body_af=8,
          head_sz=12, head_bf=12, head_af=5, sig_bf=18)


# ── 1. Confusable Lease (2 pages, target 4-6 chunks at 500 chars) ───────────

def make_confusable_lease():
    doc = SimpleDocTemplate(
        "confusable_lease.pdf", pagesize=letter,
        leftMargin=0.9*inch, rightMargin=0.9*inch,
        topMargin=0.8*inch, bottomMargin=0.8*inch,
    )
    T, H, B, G = SL["title"], SL["heading"], SL["body"], SL["sig"]
    story = []

    story.append(Paragraph("RESIDENTIAL LEASE AGREEMENT", T))

    story.append(Paragraph(
        "This Residential Lease Agreement (\"Agreement\") is entered into on "
        "<b>January 15, 2025</b> (the \"Execution Date\"), by and between "
        "<b>James Robert Morrison</b> (\"Landlord\"), whose primary mailing "
        "address is 100 Oak Street, Apt 4A, Portland, OR 97201, and "
        "<b>James Robert Morrison Jr.</b> (\"Tenant\"), currently residing at "
        "200 Pine Avenue, Portland, OR 97201.", B))

    # Section 1 — Premises
    story.append(Paragraph("1. Premises", H))
    story.append(Paragraph(
        "The Landlord, James Robert Morrison, hereby agrees to lease to the "
        "Tenant, James Robert Morrison Jr., the residential property located "
        "at 100 Oak Street, Apt 4A, Portland, OR 97201 (the \"Premises\"). "
        "The Premises consists of a two-bedroom, one-bathroom apartment of "
        "approximately 950 square feet, including one designated parking space "
        "and shared laundry access.", B))

    # Section 2 — Term
    story.append(Paragraph("2. Term of Lease", H))
    story.append(Paragraph(
        "The lease term commences on <b>February 1, 2025</b> (\"Move-In "
        "Date\") and terminates on <b>December 31, 2025</b> (\"Lease End "
        "Date\"), for a total of eleven months. The Tenant must notify the "
        "Landlord, James Robert Morrison, in writing of intent to renew or "
        "vacate by <b>December 1, 2025</b> (\"Renewal Deadline\"). If the "
        "Tenant, James Robert Morrison Jr., fails to provide notice by the "
        "Renewal Deadline, this Lease terminates on December 31, 2025 without "
        "further obligation of the Landlord to offer renewal.", B))

    # Section 3 — Rent
    story.append(Paragraph("3. Rent and Late Fees", H))
    story.append(Paragraph(
        "The Tenant, James Robert Morrison Jr., agrees to pay the Landlord, "
        "James Robert Morrison, a monthly rent of <b>$2,100.00</b>. The "
        "first payment is due <b>February 15, 2025</b>; thereafter rent is "
        "due on the 15th of each calendar month. Rent shall be payable by "
        "check, electronic transfer, or money order to James Robert Morrison "
        "at 100 Oak Street, Apt 4A, Portland, OR 97201. If rent is not "
        "received by the fifth (5th) day after the due date, a late fee of "
        "<b>$100.00</b> shall be assessed.", B))

    # Section 4 — Security Deposit
    story.append(Paragraph("4. Security Deposit", H))
    story.append(Paragraph(
        "Upon execution, the Tenant shall pay a security deposit of "
        "<b>$4,200.00</b> (two months' rent). The deposit shall be held by "
        "the Landlord, James Robert Morrison, in a separate account per "
        "Oregon Revised Statutes Chapter 90. The Landlord shall return the "
        "unused portion to the Tenant, James Robert Morrison Jr., within "
        "thirty-one (31) days of surrender, less deductions for damages "
        "beyond normal wear and tear, accompanied by an itemized statement.",
        B))

    # Section 5 — Pets
    story.append(Paragraph("5. Pet Policy", H))
    story.append(Paragraph(
        "No pets of any kind are allowed on the Premises without the prior "
        "written consent of the Landlord, James Robert Morrison. This "
        "prohibition includes dogs, cats, birds, reptiles, rodents, and fish. "
        "Violation constitutes a material breach. Service animals required "
        "under applicable disability law are exempt upon presentation of "
        "proper documentation.", B))

    # Section 6 — Maintenance
    story.append(Paragraph("6. Maintenance and Repairs", H))
    story.append(Paragraph(
        "The Tenant, James Robert Morrison Jr., is responsible for minor "
        "repairs under <b>$200.00</b> per occurrence (light bulbs, air "
        "filters, faucet washers). The Landlord, James Robert Morrison, is "
        "responsible for major systems including HVAC, plumbing, electrical, "
        "roof, and structural maintenance. The Landlord shall respond to "
        "maintenance requests within seventy-two (72) hours. The Tenant shall "
        "promptly notify the Landlord of any condition requiring major repair.",
        B))

    # Section 7 — Termination
    story.append(Paragraph("7. Termination", H))
    story.append(Paragraph(
        "Either Party may terminate by providing <b>sixty (60) days'</b> "
        "written notice delivered to the Landlord at 100 Oak Street, Apt 4A, "
        "Portland, OR 97201 or to the Tenant at the Premises. If the Tenant "
        "terminates early, the Tenant shall pay an early termination fee "
        "equal to two months' rent = <b>$4,200.00</b>, due within 15 days "
        "of notice. The Landlord may waive this fee at sole discretion. The "
        "Landlord may terminate immediately if the Tenant fails to pay rent "
        "within 15 days, engages in illegal activity, causes substantial "
        "damage, or violates a material term after written notice and a "
        "ten-day cure period.", B))

    # Section 8 — Governing Law
    story.append(Paragraph("8. Governing Law", H))
    story.append(Paragraph(
        "This Agreement is governed by the laws of the <b>State of Oregon</b>. "
        "Disputes shall be resolved in the courts of Multnomah County, Oregon.",
        B))

    # Signatures
    story.append(Spacer(1, 10))
    story.append(Paragraph(
        "Landlord: ___________________________<br/>"
        "James Robert Morrison &nbsp; | &nbsp; "
        "100 Oak Street, Apt 4A, Portland, OR 97201<br/>"
        "Date: January 15, 2025", G))
    story.append(Paragraph(
        "Tenant: ___________________________<br/>"
        "James Robert Morrison Jr. &nbsp; | &nbsp; "
        "200 Pine Avenue, Portland, OR 97201<br/>"
        "Date: January 15, 2025", G))

    doc.build(story)
    print("  Created confusable_lease.pdf")


# ── 2. Dense NDA (8-10 pages, target 20-25 chunks) ──────────────────────────

def make_dense_nda():
    doc = SimpleDocTemplate(
        "dense_nda.pdf", pagesize=letter,
        leftMargin=1*inch, rightMargin=1*inch,
        topMargin=1*inch, bottomMargin=1*inch,
    )
    T, H, B, G = SN["title"], SN["heading"], SN["body"], SN["sig"]
    story = []

    story.append(Paragraph("NON-DISCLOSURE AGREEMENT", T))
    story.append(Paragraph(
        "Effective Date: September 1, 2025", ParagraphStyle(
            "EffDate", parent=_styles["Normal"], fontSize=11,
            alignment=TA_CENTER, spaceAfter=16)))

    story.append(Paragraph(
        "This Non-Disclosure Agreement (the \"Agreement\") is entered into as "
        "of <b>September 1, 2025</b> (the \"Effective Date\"), by and between "
        "<b>Acme Corporation</b>, a Delaware corporation with its principal "
        "place of business at 1500 Innovation Drive, Suite 400, Wilmington, "
        "DE 19801 (the \"Disclosing Party\"), and <b>Beta Industries LLC</b>, "
        "a California limited liability company with its principal place of "
        "business at 2200 Commerce Boulevard, San Jose, CA 95134 (the "
        "\"Receiving Party\"). The Parties desire to explore a potential "
        "business relationship (the \"Purpose\") and, in connection therewith, "
        "the Disclosing Party may disclose certain Confidential Information "
        "to the Receiving Party.", B))

    # ── Section 1: Definitions ──
    story.append(Paragraph("Section 1. Definitions", H))

    story.append(Paragraph(
        "1.1 \"Confidential Information\" shall mean any and all non-public, "
        "proprietary, or confidential information disclosed by the Disclosing "
        "Party to the Receiving Party, whether disclosed orally, in writing, "
        "electronically, or by any other means, and whether or not marked as "
        "\"confidential\" or \"proprietary\" at the time of disclosure. "
        "Confidential Information includes, without limitation, trade secrets, "
        "inventions, patent applications, technical data, know-how, research "
        "and development information, product plans, software code, algorithms, "
        "designs, drawings, engineering specifications, formulas, processes, "
        "techniques, and methods.", B))

    story.append(Paragraph(
        "1.2 Confidential Information shall also include business information "
        "such as financial information, financial projections, budgets, cost "
        "structures, pricing information, marketing plans, sales data, "
        "customer lists, supplier lists, vendor agreements, distribution "
        "channels, strategic plans, business forecasts, merger and acquisition "
        "plans, joint venture plans, and any other information relating to the "
        "business operations of the Disclosing Party. The Receiving Party "
        "acknowledges that all such Confidential Information is commercially "
        "sensitive.", B))

    story.append(Paragraph(
        "1.3 Confidential Information shall further include all notes, "
        "analyses, compilations, studies, summaries, memoranda, and other "
        "documents or materials prepared by the Receiving Party or its "
        "Representatives that contain, reflect, or are based upon the "
        "Confidential Information furnished by the Disclosing Party. The "
        "Receiving Party agrees that all such derivative materials constitute "
        "Confidential Information of the Disclosing Party.", B))

    story.append(Paragraph(
        "1.4 \"Representatives\" shall mean the directors, officers, employees, "
        "agents, consultants, advisors, independent contractors, and other "
        "representatives of the Receiving Party who have a need to know the "
        "Confidential Information for the Purpose and who are bound by "
        "obligations of confidentiality no less restrictive than those set "
        "forth in this Agreement.", B))

    # ── Section 2: Obligations ──
    story.append(Paragraph(
        "Section 2. Obligations of Receiving Party", H))

    story.append(Paragraph(
        "2.1 The Receiving Party agrees to hold all Confidential Information "
        "in strict confidence and shall not disclose, publish, or otherwise "
        "disseminate any Confidential Information to any third party without "
        "the prior written consent of the Disclosing Party. The Receiving "
        "Party shall use the Confidential Information solely for the Purpose "
        "and for no other purpose whatsoever. The Receiving Party shall "
        "protect the Confidential Information using the same degree of care "
        "that the Receiving Party uses to protect its own confidential "
        "information of a similar nature, but in no event less than a "
        "reasonable degree of care.", B))

    story.append(Paragraph(
        "2.2 The Receiving Party shall limit access to Confidential "
        "Information to those Representatives who have a need to know such "
        "Confidential Information for the Purpose and who have been advised "
        "of the confidential nature of such information. Prior to disclosing "
        "any Confidential Information to any Representative, the Receiving "
        "Party shall ensure that such Representative is bound by written "
        "obligations of confidentiality and non-use at least as restrictive "
        "as the terms of this Agreement.", B))

    story.append(Paragraph(
        "2.3 The Receiving Party shall immediately notify the Disclosing "
        "Party in writing upon becoming aware of any unauthorized disclosure, "
        "use, or loss of Confidential Information. The Receiving Party shall "
        "cooperate with the Disclosing Party in every reasonable way to help "
        "the Disclosing Party regain possession of the Confidential "
        "Information and prevent any further unauthorized disclosure or use.",
        B))

    story.append(Paragraph(
        "2.4 The Receiving Party shall not reverse engineer, disassemble, "
        "decompile, or otherwise attempt to derive the composition, structure, "
        "or underlying ideas of any Confidential Information provided in "
        "tangible form, including software, hardware, prototypes, or samples. "
        "The Receiving Party shall not create derivative works based on the "
        "Confidential Information without express written permission of the "
        "Disclosing Party.", B))

    story.append(Paragraph(
        "2.5 The Receiving Party shall establish and maintain appropriate "
        "physical, electronic, and procedural safeguards to protect the "
        "Confidential Information from unauthorized access, use, or "
        "disclosure. Such safeguards shall include encryption of Confidential "
        "Information stored electronically, access controls, secure storage "
        "of physical documents, and regular training of personnel on handling "
        "Confidential Information.", B))

    # ── Section 3: Exclusions ──
    story.append(Paragraph(
        "Section 3. Exclusions from Confidential Information", H))

    story.append(Paragraph(
        "3.1 The obligations of the Receiving Party under this Agreement "
        "shall not apply to any Confidential Information that: (a) was "
        "publicly known prior to disclosure by the Disclosing Party; "
        "(b) becomes publicly known after disclosure through no fault of the "
        "Receiving Party; (c) was already in the Receiving Party's possession "
        "without obligation of confidentiality, as demonstrated by written "
        "records; or (d) is independently developed by the Receiving Party "
        "without use of or reference to any Confidential Information.", B))

    story.append(Paragraph(
        "3.2 Confidential Information shall not be deemed excluded merely "
        "because individual features or elements are in the public domain, "
        "unless the specific combination or arrangement is itself publicly "
        "available. The burden of proving any exclusion rests with the "
        "Receiving Party.", B))

    # ── Section 4: Permitted Disclosures ──
    story.append(Paragraph("Section 4. Permitted Disclosures", H))

    story.append(Paragraph(
        "4.1 The Receiving Party may disclose Confidential Information to the "
        "extent required by applicable law, regulation, or court order, "
        "provided that the Receiving Party: (a) gives the Disclosing Party "
        "prompt written notice prior to disclosure; (b) cooperates in seeking "
        "a protective order; and (c) discloses only the portion of "
        "Confidential Information legally required. Any Confidential "
        "Information so disclosed shall remain Confidential Information for "
        "all other purposes.", B))

    story.append(Paragraph(
        "4.2 The Receiving Party may disclose Confidential Information to "
        "legal counsel, accountants, and financial advisors bound by "
        "professional duties of confidentiality or written agreements no less "
        "restrictive than this Agreement. The Receiving Party remains "
        "responsible for any disclosure by such advisors.", B))

    # ── Section 5: Return of Materials ──
    story.append(Paragraph("Section 5. Return of Materials", H))

    story.append(Paragraph(
        "5.1 Upon written request of the Disclosing Party, or upon "
        "termination or expiration of this Agreement, the Receiving Party "
        "shall promptly return or destroy all Confidential Information in its "
        "possession, including copies, extracts, summaries, and derivative "
        "works. The Receiving Party shall certify in writing within ten (10) "
        "business days that all Confidential Information has been returned or "
        "destroyed.", B))

    story.append(Paragraph(
        "5.2 The Receiving Party may retain one (1) archival copy solely for "
        "compliance purposes, subject to the confidentiality obligations of "
        "this Agreement. Backup copies in ordinary-course electronic systems "
        "need not be purged, provided they remain subject to this Agreement "
        "and are not intentionally accessed except for disaster recovery.", B))

    # ── Section 6: Term and Termination ──
    story.append(Paragraph("Section 6. Term and Termination", H))

    story.append(Paragraph(
        "6.1 This Agreement is effective as of September 1, 2025 and remains "
        "in force for three (3) years from the Effective Date, "
        "expiring September 1, 2028. Confidentiality obligations survive "
        "termination for three (3) additional years.", B))

    story.append(Paragraph(
        "6.2 Either Party may terminate this Agreement at any time by "
        "providing thirty (30) days' prior written notice. The Receiving "
        "Party's obligations under Sections 2, 3, 5, 7, and 8 survive "
        "termination or expiration.", B))

    # ── Section 7: Remedies ──
    story.append(Paragraph("Section 7. Remedies", H))

    story.append(Paragraph(
        "7.1 The Receiving Party acknowledges that any breach may cause "
        "irreparable harm for which monetary damages alone would be "
        "inadequate. The Disclosing Party shall be entitled to seek "
        "<b>injunctive relief</b>, specific performance, and other equitable "
        "remedies without proving actual damages or posting bond.", B))

    story.append(Paragraph(
        "7.2 The Receiving Party shall indemnify, defend, and hold harmless "
        "the Disclosing Party from all losses, damages, liabilities, costs, "
        "and expenses (including reasonable attorneys' fees) arising from any "
        "breach by the Receiving Party or its Representatives. This "
        "indemnification survives termination, subject to Section 8.", B))

    story.append(Paragraph(
        "7.3 Rights and remedies under this Agreement are cumulative and not "
        "exclusive. No failure or delay in exercising any right operates as "
        "a waiver.", B))

    # ── Section 8: Limitation of Liability ──
    story.append(Paragraph("Section 8. Limitation of Liability", H))

    story.append(Paragraph(
        "8.1 EXCEPT FOR BREACHES OF SECTION 2 OR INDEMNIFICATION UNDER "
        "SECTION 7, NEITHER PARTY SHALL BE LIABLE FOR INDIRECT, INCIDENTAL, "
        "SPECIAL, CONSEQUENTIAL, OR EXEMPLARY DAMAGES ARISING OUT OF THIS "
        "AGREEMENT, REGARDLESS OF WHETHER FORESEEABLE.", B))

    story.append(Paragraph(
        "8.2 The Disclosing Party makes no warranties regarding the accuracy "
        "or completeness of any Confidential Information. Confidential "
        "Information is provided \"AS IS\" without warranty of any kind.", B))

    story.append(Paragraph(
        "8.3 The aggregate liability of either party under this Agreement "
        "shall not exceed <b>Five Hundred Thousand Dollars ($500,000)</b>. "
        "This limitation applies to all claims arising under or related to "
        "this Agreement, whether based in contract, tort, strict liability, "
        "or any other legal theory, regardless of the number of claims or "
        "disclosures of Confidential Information.", B))

    # ── Section 9: General Provisions ──
    story.append(Paragraph("Section 9. General Provisions", H))

    story.append(Paragraph(
        "9.1 <b>Governing Law.</b> This Agreement shall be governed by the "
        "laws of the <b>State of Delaware</b>. Each Party consents to "
        "exclusive jurisdiction in New Castle County, Delaware.", B))

    story.append(Paragraph(
        "9.2 <b>Severability.</b> If any provision is found invalid, it "
        "shall be modified to the minimum extent necessary or severed. The "
        "remaining provisions continue in full force and effect.", B))

    story.append(Paragraph(
        "9.3 <b>Entire Agreement.</b> This Agreement constitutes the entire "
        "agreement between the Parties regarding the subject matter hereof "
        "and supersedes all prior agreements. No modification is effective "
        "unless in writing signed by both Parties.", B))

    story.append(Paragraph(
        "9.4 <b>Notices.</b> All notices shall be in writing, delivered by "
        "hand, overnight courier, or certified mail to the addresses in the "
        "preamble. Notices are deemed received upon delivery, next business "
        "day (courier), or three business days after mailing.", B))

    story.append(Paragraph(
        "9.5 <b>Waiver.</b> No waiver of any breach is a waiver of any other "
        "breach. Waivers must be in writing signed by the waiving Party.", B))

    story.append(Paragraph(
        "9.6 <b>Counterparts.</b> This Agreement may be executed in "
        "counterparts, each deemed an original. Electronic signatures are "
        "deemed originals.", B))

    # ── Section 10: Signatures ──
    story.append(Paragraph("Section 10. Signatures", H))

    story.append(Paragraph(
        "IN WITNESS WHEREOF, the Parties have executed this Non-Disclosure "
        "Agreement as of the Effective Date.", B))
    story.append(Spacer(1, 16))

    story.append(Paragraph(
        "<b>DISCLOSING PARTY: Acme Corporation</b><br/>"
        "By: ___________________________<br/>"
        "Name: Jonathan W. Hargreaves<br/>"
        "Title: Chief Executive Officer<br/>"
        "Date: September 1, 2025", G))

    story.append(Paragraph(
        "<b>RECEIVING PARTY: Beta Industries LLC</b><br/>"
        "By: ___________________________<br/>"
        "Name: Sarah Chen-Watanabe<br/>"
        "Title: Managing Director<br/>"
        "Date: September 1, 2025", G))

    doc.build(story)
    print("  Created dense_nda.pdf")


# ── 3. Settlement Breakdown (3 pages, target 6-8 chunks) ────────────────────

def make_settlement_breakdown():
    doc = SimpleDocTemplate(
        "settlement_breakdown.pdf", pagesize=letter,
        leftMargin=1*inch, rightMargin=1*inch,
        topMargin=1*inch, bottomMargin=1*inch,
    )
    T, H, B, G = SS["title"], SS["heading"], SS["body"], SS["sig"]
    story = []

    # Caption
    story.append(Paragraph(
        "IN THE SUPERIOR COURT OF FULTON COUNTY", ParagraphStyle(
            "CourtLn", parent=_styles["Normal"], fontSize=12,
            alignment=TA_CENTER, spaceAfter=2, fontName="Helvetica-Bold")))
    story.append(Paragraph(
        "STATE OF GEORGIA", ParagraphStyle(
            "StateLn", parent=_styles["Normal"], fontSize=12,
            alignment=TA_CENTER, spaceAfter=16, fontName="Helvetica-Bold")))

    caption_data = [
        ["DAVID JOHNSON,", "", ""],
        ["     Plaintiff,", "", ""],
        ["", "", ""],
        ["v.", "", "Case No. 2025-CV-3847"],
        ["", "", ""],
        ["METRO TRANSIT AUTHORITY,", "", ""],
        ["     Defendant.", "", ""],
    ]
    caption_table = Table(caption_data, colWidths=[2.5*inch, 0.5*inch, 3*inch])
    caption_table.setStyle(TableStyle([
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("FONTNAME", (2, 3), (2, 3), "Helvetica-Bold"),
        ("TOPPADDING", (0, 0), (-1, -1), 1),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 1),
    ]))
    story.append(caption_table)
    story.append(Spacer(1, 12))

    story.append(Paragraph("SETTLEMENT AGREEMENT AND RELEASE", T))

    # Preamble
    story.append(Paragraph("Article I. Parties and Recitals", H))

    story.append(Paragraph(
        "This Settlement Agreement and Release (\"Agreement\") is entered into "
        "as of <b>November 8, 2025</b> (\"Settlement Date\"), by and between "
        "<b>David Michael Johnson</b> (\"Plaintiff\"), residing at 445 "
        "Magnolia Lane, Atlanta, GA 30312, represented by <b>Patricia Wells</b> "
        "of Wells &amp; Associates, 800 Peachtree Street NE, Suite 1200, "
        "Atlanta, GA 30308; and <b>Metro Transit Authority</b> (\"Defendant\"), "
        "a public agency of the State of Georgia, represented by "
        "<b>Robert Kim</b>, Senior Counsel, Metro Transit Authority Legal "
        "Department, 1000 Transit Way, Atlanta, GA 30303.", B))

    story.append(Paragraph(
        "WHEREAS, the Plaintiff filed a complaint in Case No. 2025-CV-3847, "
        "Superior Court of Fulton County, Georgia, alleging personal injuries, "
        "lost wages, and property damage arising from an incident on January "
        "22, 2025, involving a Metro Transit Authority bus (Vehicle No. "
        "MT-4472) at Peachtree Street and 10th Street, Atlanta, Georgia; and "
        "WHEREAS, the Defendant denies all liability; and WHEREAS, the Parties "
        "desire to resolve all claims without further litigation;", B))

    story.append(Paragraph(
        "NOW, THEREFORE, in consideration of the mutual covenants herein, the "
        "Parties agree as follows:", B))

    # Article II — Breakdown
    story.append(Paragraph(
        "Article II. Settlement Amount and Breakdown", H))

    story.append(Paragraph(
        "The Defendant shall pay the Plaintiff a total of <b>$31,650.00</b>. "
        "The breakdown is as follows:", B))

    breakdown = [
        ["Category", "Amount"],
        ["Medical Expenses (Past - Incurred)", "$12,500.00"],
        ["Medical Expenses (Future - Estimated)", "$3,200.00"],
        ["     Medical Subtotal", "$15,700.00"],
        ["Lost Wages (Documented)", "$8,750.00"],
        ["Pain and Suffering", "$5,000.00"],
        ["Property Damage", "$2,200.00"],
        ["TOTAL SETTLEMENT AMOUNT", "$31,650.00"],
    ]
    tbl = Table(breakdown, colWidths=[4*inch, 2*inch])
    tbl.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#2c3e50")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("ALIGN", (1, 0), (1, -1), "RIGHT"),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("BACKGROUND", (0, 3), (-1, 3), colors.HexColor("#f0f0f0")),
        ("FONTNAME", (0, 3), (-1, 3), "Helvetica-Oblique"),
        ("BACKGROUND", (0, -1), (-1, -1), colors.HexColor("#ecf0f1")),
        ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(tbl)
    story.append(Spacer(1, 10))

    # Article III — Attorney Fees
    story.append(Paragraph(
        "Article III. Attorney Fees and Net Distribution", H))

    story.append(Paragraph(
        "Attorney fees: <b>33.3%</b> of $31,650.00 = <b>$10,539.45</b>. "
        "Net to Plaintiff David Michael Johnson: <b>$21,110.55</b>.", B))

    fee_data = [
        ["Description", "Amount"],
        ["Total Settlement Amount", "$31,650.00"],
        ["Less: Attorney Fees (33.3%)", "($10,539.45)"],
        ["Net to Plaintiff", "$21,110.55"],
    ]
    ft = Table(fee_data, colWidths=[4*inch, 2*inch])
    ft.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#2c3e50")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("ALIGN", (1, 0), (1, -1), "RIGHT"),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("BACKGROUND", (0, -1), (-1, -1), colors.HexColor("#ecf0f1")),
        ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(ft)
    story.append(Spacer(1, 10))

    # Article IV — Payment Schedule
    story.append(Paragraph("Article IV. Payment Schedule", H))

    story.append(Paragraph(
        "<b>First Installment:</b> 50% = <b>$15,825.00</b>, due within 30 "
        "days (by December 8, 2025). <b>Second Installment:</b> 50% = "
        "<b>$15,825.00</b>, due within 90 days (by February 6, 2026). "
        "Payments to IOLTA trust account of Wells &amp; Associates, Account "
        "No. ending in 7834, First National Bank of Georgia.", B))

    # Article V — Release
    story.append(Paragraph("Article V. Release of Claims", H))

    story.append(Paragraph(
        "The Plaintiff, David Michael Johnson, for himself, his heirs, "
        "executors, administrators, successors, and assigns, hereby fully "
        "releases the Defendant, Metro Transit Authority, its officers, "
        "directors, employees, agents, insurers, and assigns, from all "
        "claims arising from the incident of January 22, 2025, and Case "
        "No. 2025-CV-3847, whether known or unknown.", B))

    # Article VI — Confidentiality
    story.append(Paragraph("Article VI. Confidentiality", H))

    story.append(Paragraph(
        "The terms of this Agreement, including the settlement amount of "
        "$31,650.00, shall be kept strictly confidential. Disclosure is "
        "permitted only to attorneys, accountants, tax advisors, and "
        "immediate family members, or as required by law.", B))

    # Article VII — No Admission
    story.append(Paragraph("Article VII. No Admission of Liability", H))

    story.append(Paragraph(
        "Nothing in this Agreement constitutes an admission of liability, "
        "fault, or negligence by Metro Transit Authority. This Agreement "
        "is made solely to avoid continued litigation expense. Neither this "
        "Agreement nor its terms shall be used as evidence of liability.", B))

    # Article VIII — Governing Law
    story.append(Paragraph("Article VIII. Governing Law", H))

    story.append(Paragraph(
        "This Agreement is governed by the laws of the State of Georgia. "
        "Disputes shall be resolved in the Superior Court of Fulton County, "
        "Georgia.", B))

    # Signatures
    story.append(Spacer(1, 16))
    story.append(Paragraph(
        "<b>PLAINTIFF:</b> &nbsp; ___________________________<br/>"
        "David Michael Johnson &nbsp; | &nbsp; Date: November 8, 2025", G))

    story.append(Paragraph(
        "<b>PLAINTIFF'S COUNSEL:</b> &nbsp; ___________________________<br/>"
        "Patricia Wells, Esq., Wells &amp; Associates<br/>"
        "Date: November 8, 2025", G))

    story.append(Paragraph(
        "<b>DEFENSE COUNSEL:</b> &nbsp; ___________________________<br/>"
        "Robert Kim, Senior Counsel, Metro Transit Authority Legal Dept.<br/>"
        "Date: November 8, 2025", G))

    doc.build(story)
    print("  Created settlement_breakdown.pdf")


if __name__ == "__main__":
    print("Generating eval fixture PDFs...")
    make_confusable_lease()
    make_dense_nda()
    make_settlement_breakdown()
    print("Done.")
