import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    tcPr.append(parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>'))

def set_cell_margins(cell, top=120, bottom=120, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def set_table_borders(table, color="D1D5DB", sz="4", val="single"):
    tblPr = table._tbl.tblPr
    tblBorders = parse_xml(
        f'<w:tblBorders {nsdecls("w")}>'
        f'<w:top w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:bottom w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:insideH w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:insideV w:val="none"/>'
        f'<w:left w:val="none"/>'
        f'<w:right w:val="none"/>'
        f'</w:tblBorders>'
    )
    tblPr.append(tblBorders)

def add_callout(doc, text, title="PRO-TIP FOR SALES & POSITIONING:"):
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl.autofit = False
    tbl.columns[0].width = Inches(6.5)
    cell = tbl.cell(0, 0)
    set_cell_background(cell, "F8FAFC")
    set_cell_margins(cell, top=140, bottom=140, left=200, right=180)
    
    # Left border only
    tcPr = cell._tc.get_or_add_tcPr()
    borders = parse_xml(
        f'<w:tcBorders {nsdecls("w")}>'
        f'<w:top w:val="none"/>'
        f'<w:left w:val="single" w:sz="24" w:space="0" w:color="E99545"/>'
        f'<w:bottom w:val="none"/>'
        f'<w:right w:val="none"/>'
        f'</w:tcBorders>'
    )
    tcPr.append(borders)
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(4)
    run_t = p.add_run(f"★ {title}\n")
    run_t.font.name = "Segoe UI"
    run_t.font.size = Pt(10)
    run_t.font.bold = True
    run_t.font.color.rgb = RGBColor(233, 149, 69) # #E99545
    
    run_b = p.add_run(text)
    run_b.font.name = "Segoe UI"
    run_b.font.size = Pt(9.5)
    run_b.font.italic = True
    run_b.font.color.rgb = RGBColor(71, 85, 105)

def build_marketing_document(output_path):
    doc = docx.Document()
    
    # Set page margins
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(0.8)
        section.bottom_margin = Inches(0.8)
        section.left_margin = Inches(0.9)
        section.right_margin = Inches(0.9)

    # Styles
    COLOR_PRIMARY = RGBColor(36, 70, 56)      # #244638 Deep Forest Green
    COLOR_ACCENT = RGBColor(233, 149, 69)     # #E99545 Warm Amber
    COLOR_DARK = RGBColor(15, 23, 42)         # #0F172A Slate 900
    COLOR_MUTED = RGBColor(100, 116, 139)     # #64748B Slate 500

    # Document Header / Badge
    p_badge = doc.add_paragraph()
    p_badge.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_badge = p_badge.add_run("B2B COMMERCIAL BLUEPRINT • RESTAURANT SALES STRATEGY")
    r_badge.font.name = "Segoe UI"
    r_badge.font.size = Pt(8.5)
    r_badge.font.bold = True
    r_badge.font.color.rgb = COLOR_ACCENT

    # Main Title
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_after = Pt(2)
    r_title = p_title.add_run("Why Restaurant Owners Buy The Evorise System")
    r_title.font.name = "Segoe UI"
    r_title.font.size = Pt(22)
    r_title.font.bold = True
    r_title.font.color.rgb = COLOR_PRIMARY

    # Subtitle
    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.paragraph_format.space_after = Pt(16)
    r_sub = p_sub.add_run("The Marketing Mind, Operational ROI & Psychological Triggers That Turn Restaurant Owners into Eager Clients")
    r_sub.font.name = "Segoe UI"
    r_sub.font.size = Pt(11)
    r_sub.font.color.rgb = COLOR_MUTED

    doc.add_paragraph().paragraph_format.space_after = Pt(4)

    # ========================================================
    # SECTION 1: EXECUTIVE SUMMARY & THE RESTAURANT REALITY
    # ========================================================
    h1 = doc.add_heading(level=1)
    r = h1.add_run("1. Executive Summary: The Brutal Reality of Modern Restaurants")
    r.font.name = "Segoe UI"
    r.font.size = Pt(15)
    r.font.bold = True
    r.font.color.rgb = COLOR_PRIMARY

    p = doc.add_paragraph()
    p.add_run(
        "To successfully sell to restaurant owners, you must first understand the intense pressure they live under every single day. "
        "The food & beverage (F&B) industry is notoriously difficult: profit margins average between "
    )
    r_em = p.add_run("3% and 8%")
    r_em.bold = True
    p.add_run(
        ". A single poorly managed shift, a team of slow or unmotivated waiters, or a high staff turnover rate can wipe out an entire week’s profits.\n\n"
        "When you approach a restaurant owner trying to sell 'technology' or 'software', their immediate instinct is resistance: "
        "'Not another complicated app. My staff won't understand it, it will crash, and it will cost me money.'\n\n"
        "However, when you approach them with a "
    )
    r_bold = p.add_run("business solution that cuts their payroll costs, accelerates table turnover by 20 minutes, eliminates waiter errors, and puts 100% of the profits in their pocket without monthly commission cuts")
    r_bold.bold = True
    p.add_run(
        ", you are no longer selling software—you are selling financial relief and operational peace of mind."
    )

    add_callout(
        doc,
        "Never pitch 'digital QR codes' or 'modern software'. Always pitch '30% Faster Table Turnover, Zero Waiter Miscommunication, and 1 Fewer Server Payroll Expense per shift'. Owners buy outcomes, not code.",
        "THE GOLDEN RULE OF RESTAURANT SALES"
    )

    # ========================================================
    # SECTION 2: THE 6 ACUTE PAIN POINTS
    # ========================================================
    h1 = doc.add_heading(level=1)
    r = h1.add_run("2. The 6 Critical Pain Points Keeping Restaurant Owners Awake")
    r.font.name = "Segoe UI"
    r.font.size = Pt(15)
    r.font.bold = True
    r.font.color.rgb = COLOR_PRIMARY

    pain_points = [
        ("Pain Point 1: Waiter Shortages, High Turnover & Labor Costs",
         "Good waiters are hard to find, expensive to keep, and quick to quit. Training new staff takes weeks. Meanwhile, waiters get tired, forget special modifications ('no onions', 'extra spicy'), and make costly billing mistakes that anger customers and waste kitchen ingredients."),
        
        ("Pain Point 2: The 'Rush Hour Bottleneck' & Slow Table Turnover",
         "A restaurant only makes money during peak lunch and dinner hours (12:00–2:30 PM and 7:00–10:00 PM). During these rush hours, customers sit waiting 8–12 minutes just to receive a paper menu, another 10 minutes to wave down a waiter to order, and 10 minutes to get the bill. That is 30 minutes of dead table time where other paying guests leave because there are 'no tables available'."),

        ("Pain Point 3: The Agony of Food Delivery Apps & 25%-35% Commissions",
         "Platforms like Foodpanda, UberEats, or DoorDash take up to 30% of every order and withhold customer phone numbers. Owners feel held hostage. They want customers dining in or ordering directly so they can keep 100% of their gross revenue."),

        ("Pain Point 4: Repetitive Menu Printing Costs & Inability to Update Prices",
         "Food inflation forces restaurants to adjust prices often. Reprinting 50 laminated menus costs $250 to $600 each time. If an item runs out at 8:00 PM ('86'd'), waiters keep taking orders for it, leading to angry customer confrontations."),

        ("Pain Point 5: Zero Upselling Discipline Among Human Staff",
         "A busy or inexperienced waiter rarely remembers to say: 'Would you like to add garlic butter naan or our signature mango lassi with that?' Human upsell rates are below 10%. A digital visual menu prompts every single customer with high-res photography, lifting average ticket size by 18% to 28% automatically."),

        ("Pain Point 6: The Fear of Internet Crashes & Complicated POS Setups",
         "Most cloud POS systems completely freeze when the restaurant's Wi-Fi drops. During a busy Friday rush, an internet outage is catastrophic. Owners dread hardware lock-ins where companies force them into expensive proprietary tablets.")
    ]

    for title, desc in pain_points:
        p_pt = doc.add_paragraph()
        p_pt.paragraph_format.space_before = Pt(6)
        p_pt.paragraph_format.space_after = Pt(3)
        r_pt_title = p_pt.add_run(f"• {title}: ")
        r_pt_title.font.name = "Segoe UI"
        r_pt_title.font.bold = True
        r_pt_title.font.color.rgb = COLOR_PRIMARY
        r_pt_desc = p_pt.add_run(desc)
        r_pt_desc.font.name = "Segoe UI"
        r_pt_desc.font.size = Pt(10)

    # ========================================================
    # SECTION 3: THE EVORISE SOLUTION - 7 CORE SELLING PILLARS
    # ========================================================
    h1 = doc.add_heading(level=1)
    r = h1.add_run("3. The Evorise Solution: 7 Irresistible Selling Pillars")
    r.font.name = "Segoe UI"
    r.font.size = Pt(15)
    r.font.bold = True
    r.font.color.rgb = COLOR_PRIMARY

    p = doc.add_paragraph()
    p.add_run(
        "Here is why the Evorise Restaurant System wins against every alternative on the market. "
        "Each pillar is engineered to address a specific financial or emotional trigger of the restaurant owner:"
    )

    pillars = [
        ("Pillar 1: Zero-Friction Customer Experience (No App Download Required)",
         "Customers simply open their phone's built-in camera, scan the sleek table QR acrylic stand, and the high-speed interactive menu opens in under 1 second. No login, no password, no app store download. Customers order effortlessly from their own phone."),

        ("Pillar 2: Bulletproof Local Offline Resilience (ACID SQLite Engine)",
         "Unlike cloud-only systems that go dead when the internet drops, Evorise runs an embedded SQLite database locally on the restaurant's computer. Even if the restaurant's external internet cable is cut, customers connected to local Wi-Fi can still scan, view dishes, and place orders smoothly. The restaurant never loses a dollar."),

        ("Pillar 3: Native Windows Desktop POS & Kitchen Display System (KDS)",
         "Comes packaged as a true, professional Windows Setup Installer (.exe). It sits on their desktop with an official shortcut icon. It features high-decibel acoustic alert chimes (Toast POS chimes, service bells, kitchen dings) and unread order taskbar badges, ensuring chefs and cashiers never miss an incoming order even in loud kitchens."),

        ("Pillar 4: Automated Average Ticket Value (AOV) Multiplier (+20% Revenue)",
         "Rich food photos, spice level badges, chef recommendations, and prominent promotional banners trigger visual hunger. When customers see appetizing visuals, they order more sides, drinks, and desserts than they would from a plain paper menu."),

        ("Pillar 5: Instant 2-Second Menu & Pricing Management",
         "Prices change? Sold out of Salmon? With 1 click in the Admin Panel, the item is marked unavailable or updated instantly across all tables in real-time. Zero printing expenses forever."),

        ("Pillar 6: Zero Recurring Commission Fees (Keep 100% of Profits)",
         "No 25% delivery app cuts. No mandatory 3.5% credit card processing markup lock-ins. The owner owns their system, owns their customer relationship, and keeps all their margin."),

        ("Pillar 7: Deep Analytics & Operational Visibility",
         "The dashboard delivers clear business intelligence: Best-selling items, revenue trends, peak ordering hours, and table velocity metrics so owners make profitable inventory and staffing decisions.")
    ]

    for title, desc in pillars:
        p_pil = doc.add_paragraph()
        p_pil.paragraph_format.space_before = Pt(6)
        p_pil.paragraph_format.space_after = Pt(2)
        r_pil_t = p_pil.add_run(f"✔ {title}\n")
        r_pil_t.font.name = "Segoe UI"
        r_pil_t.font.bold = True
        r_pil_t.font.color.rgb = COLOR_PRIMARY
        r_pil_d = p_pil.add_run(desc)
        r_pil_d.font.name = "Segoe UI"
        r_pil_d.font.size = Pt(10)
        r_pil_d.font.color.rgb = COLOR_DARK

    # ========================================================
    # SECTION 4: THE HARD FINANCIAL ROI CALCULATOR
    # ========================================================
    h1 = doc.add_heading(level=1)
    r = h1.add_run("4. The Financial ROI Model: The Math That Closes The Deal")
    r.font.name = "Segoe UI"
    r.font.size = Pt(15)
    r.font.bold = True
    r.font.color.rgb = COLOR_PRIMARY

    p = doc.add_paragraph()
    p.add_run(
        "When speaking to a serious restaurant owner, showing them the direct math makes buying your system a mathematical 'no-brainer'. "
        "Here is the realistic monthly financial gain for an average 15-to-25 table restaurant:"
    )

    # ROI Table
    table = doc.add_table(rows=6, cols=3)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    set_table_borders(table)

    headers = ["Value Driver", "Operational Mechanism", "Estimated Monthly Financial Impact"]
    col_widths = [Inches(1.8), Inches(3.2), Inches(1.5)]

    # Header row
    for i, title in enumerate(headers):
        cell = table.cell(0, i)
        cell.width = col_widths[i]
        set_cell_background(cell, "244638")
        set_cell_margins(cell, top=140, bottom=140, left=140, right=140)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        run = p.add_run(title)
        run.font.name = "Segoe UI"
        run.font.size = Pt(9.5)
        run.font.bold = True
        run.font.color.rgb = RGBColor(255, 255, 255)

    data = [
        ("Labor Cost Optimization", "Servers no longer waste time delivering paper menus or manually punching tickets. 1 fewer server needed during floor shifts.", "+ $800 – $1,400 / mo"),
        ("Faster Table Turnover", "Ordering delay reduced by 15-20 min per table. During rush hours, each table turns 1.5x to 2x faster, seating 15-25 more parties daily.", "+ $1,200 – $2,800 / mo"),
        ("Automated Upselling", "Visual photos of drinks, appetizers, and desserts prompt customers on their phone, lifting average spend by 18%.", "+ $900 – $2,100 / mo"),
        ("Elimination of Menu Printing", "Zero recurring costs for designing, printing, and replacing torn, stained, or outdated paper menus.", "+ $150 – $350 / mo"),
        ("Elimination of Order Errors", "Customers select their own modifiers directly. Zero wrong dishes cooked due to waiter mishearing or forgotten notes.", "+ $200 – $400 / mo")
    ]

    for row_idx, row_data in enumerate(data, start=1):
        for col_idx, text in enumerate(row_data):
            cell = table.cell(row_idx, col_idx)
            cell.width = col_widths[col_idx]
            bg_color = "F8FAFC" if row_idx % 2 == 1 else "FFFFFF"
            set_cell_background(cell, bg_color)
            set_cell_margins(cell, top=100, bottom=100, left=140, right=140)
            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.RIGHT if col_idx == 2 else WD_ALIGN_PARAGRAPH.LEFT
            run = p.add_run(text)
            run.font.name = "Segoe UI"
            run.font.size = Pt(9)
            if col_idx == 2:
                run.font.bold = True
                run.font.color.rgb = RGBColor(16, 185, 129)
            elif col_idx == 0:
                run.font.bold = True

    # Total row summary
    p_tot = doc.add_paragraph()
    p_tot.paragraph_format.space_before = Pt(8)
    r_tot = p_tot.add_run("TOTAL ESTIMATED VALUE DELIVERED: $3,250 – $7,050+ EVERY MONTH.")
    r_tot.font.name = "Segoe UI"
    r_tot.font.size = Pt(11)
    r_tot.font.bold = True
    r_tot.font.color.rgb = COLOR_PRIMARY

    add_callout(
        doc,
        "If you price the Evorise setup at $800 to $1,500 one-time, the restaurant pays for the entire investment within their first 14 to 25 days of operation purely from table turnaround speed and labor savings.",
        "THE ROI CLOSING PITCH"
    )

    # ========================================================
    # SECTION 5: COMPETITIVE BATTLECARD (US vs THEM)
    # ========================================================
    h1 = doc.add_heading(level=1)
    r = h1.add_run("5. Competitive Battlecard: How Evorise Crushes The Alternatives")
    r.font.name = "Segoe UI"
    r.font.size = Pt(15)
    r.font.bold = True
    r.font.color.rgb = COLOR_PRIMARY

    p = doc.add_paragraph()
    p.add_run("When the owner compares your proposal with other options, use this battlecard to demonstrate total dominance:")

    # Comparison Table
    cmp_table = doc.add_table(rows=5, cols=4)
    cmp_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    cmp_table.autofit = False
    set_table_borders(cmp_table)

    c_headers = ["Feature / Benefit", "Traditional Waiter & Paper", "Cloud POS (Toast/Square)", "Evorise Solution"]
    c_widths = [Inches(1.8), Inches(1.5), Inches(1.6), Inches(1.6)]

    for i, title in enumerate(c_headers):
        cell = cmp_table.cell(0, i)
        cell.width = c_widths[i]
        set_cell_background(cell, "244638" if i != 3 else "E99545")
        set_cell_margins(cell, top=140, bottom=140, left=120, right=120)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER if i > 0 else WD_ALIGN_PARAGRAPH.LEFT
        run = p.add_run(title)
        run.font.name = "Segoe UI"
        run.font.size = Pt(9.5)
        run.font.bold = True
        run.font.color.rgb = RGBColor(255, 255, 255)

    c_data = [
        ("Hardware Required", "Paper menus, pens, paper pads", "Expensive proprietary tablets ($2,000+)", "Existing Windows PC / Laptop + Customer Phones"),
        ("Works When Internet Drops?", "Yes (manual)", "NO (Completely freezes or enters crippled offline mode)", "YES (100% Local Wi-Fi + SQLite Engine)"),
        ("Recurring Commission Fees", "None (high waiter wages)", "Monthly SaaS + 3% card cut", "ZERO Commission (Owner keeps 100%)"),
        ("Customer Speed & Wait Time", "Slow (15-20 min wait)", "Medium (Wait for server with tablet)", "Instant (Scan, Browse, Order in 15 sec)")
    ]

    for row_idx, row_data in enumerate(c_data, start=1):
        for col_idx, text in enumerate(row_data):
            cell = cmp_table.cell(row_idx, col_idx)
            cell.width = c_widths[col_idx]
            bg = "FFFFFF" if row_idx % 2 == 0 else "F8FAFC"
            if col_idx == 3:
                bg = "FEF3C7" # Subtle gold tint for Evorise
            set_cell_background(cell, bg)
            set_cell_margins(cell, top=100, bottom=100, left=120, right=120)
            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER if col_idx > 0 else WD_ALIGN_PARAGRAPH.LEFT
            run = p.add_run(text)
            run.font.name = "Segoe UI"
            run.font.size = Pt(8.5)
            if col_idx == 3:
                run.font.bold = True
                run.font.color.rgb = RGBColor(146, 64, 14)

    # ========================================================
    # SECTION 6: HANDLING THE TOP 6 OWNER OBJECTIONS
    # ========================================================
    h1 = doc.add_heading(level=1)
    r = h1.add_run("6. Battle-Tested Objection Handling (What to Say When They Hesitate)")
    r.font.name = "Segoe UI"
    r.font.size = Pt(15)
    r.font.bold = True
    r.font.color.rgb = COLOR_PRIMARY

    objections = [
        ("Objection 1: 'Will older or non-tech-savvy customers know how to scan a QR code?'",
         "The Scripted Rebuttal: 'Post-pandemic, 94% of smartphone users know how to point their camera at a QR code. But the best part is that Evorise doesn't force anyone. If an elderly guest prefers a paper menu, your waiter can still serve them normally. However, for the other 85% of guests who prefer speed, they order instantly, freeing up your servers to give luxury, dedicated attention to guests who need it.'"),

        ("Objection 2: 'What if our restaurant's internet connection goes down?'",
         "The Scripted Rebuttal: 'That is exactly why you need Evorise over cloud systems. Evorise has an embedded local database running right on your counter computer. Even if the internet cable outside is physically severed, your local Wi-Fi router connects customer phones directly to your counter POS. Orders continue flowing uninterrupted.'"),

        ("Objection 3: 'Will this make my restaurant feel impersonal or cold?'",
         "The Scripted Rebuttal: 'Actually, the opposite! Right now, your waiters spend 80% of their time running back and forth delivering menus, checking pens, and taking bill payments. With Evorise handling routine ordering, your staff can focus 100% on hospitality—greeting guests warmly, asking how the food tastes, and building personal relationships.'"),

        ("Objection 4: 'Is it hard or complicated for my kitchen staff to learn?'",
         "The Scripted Rebuttal: 'It takes literally 5 minutes to learn. When an order arrives, a loud Toast POS acoustic chime sounds, the order flashes on screen with table number and exact items, and the cook presses one big green button: Cooking, then Completed. No confusing menus, no complex training.'"),

        ("Objection 5: 'Do I have to buy expensive new touchscreen terminals?'",
         "The Scripted Rebuttal: 'Zero new hardware required. It installs directly on any Windows PC or laptop you already have in the restaurant. Customer devices act as the ordering tablets, which saves you thousands in upfront hardware.'"),

        ("Objection 6: 'Can I change my prices and add new dishes myself?'",
         "The Scripted Rebuttal: 'Yes, in 10 seconds. You open your admin panel, type the new price, and press Save. It updates instantly across every table QR code without reprinting a single sheet of paper.'")
    ]

    for q, a in objections:
        p_q = doc.add_paragraph()
        p_q.paragraph_format.space_before = Pt(8)
        p_q.paragraph_format.space_after = Pt(2)
        r_q = p_q.add_run(q)
        r_q.font.name = "Segoe UI"
        r_q.font.size = Pt(10.5)
        r_q.font.bold = True
        r_q.font.color.rgb = COLOR_PRIMARY

        p_a = doc.add_paragraph()
        p_a.paragraph_format.space_after = Pt(6)
        r_a = p_a.add_run(a)
        r_a.font.name = "Segoe UI"
        r_a.font.size = Pt(9.5)
        r_a.font.italic = True
        r_a.font.color.rgb = COLOR_DARK

    # ========================================================
    # SECTION 7: PACKAGING, PRICING & PROPOSAL STRATEGY
    # ========================================================
    h1 = doc.add_heading(level=1)
    r = h1.add_run("7. Pricing & Packaging Strategy (How to Structure Your Offer)")
    r.font.name = "Segoe UI"
    r.font.size = Pt(15)
    r.font.bold = True
    r.font.color.rgb = COLOR_PRIMARY

    p = doc.add_paragraph()
    p.add_run(
        "To maximize sales conversion, offer 3 clean tiers so the restaurant owner chooses 'which tier' rather than 'yes or no':"
    )

    tiers = [
        ("Tier 1: Starter Digital Setup (One-time $499 – $799)",
         "Includes: Full Desktop Software installation on their PC, digital menu setup for up to 40 items, 15 customized QR code print-ready files, 30 days of direct phone support. (Perfect for single-location cafes and small eateries)."),

        ("Tier 2: Enterprise Pro Suite [RECOMMENDED] (One-time $999 – $1,499 OR $79/mo)",
         "Includes: Full Desktop Software + Local Wi-Fi Offline Engine, complete digital menu setup with high-res food optimization, 30 premium acrylic table QR stands, staff training session, acoustic audio chimes configuration, 6 months priority software updates. (Our highest converting offer)."),

        ("Tier 3: Multi-Branch & VIP Brand Partnership ($1,999 – $3,500+)",
         "Includes: Multi-floor / Multi-counter deployment, customized brand styling, deep analytics reporting, dedicated account manager, lifetime bug warranty, and automated backup routines.")
    ]

    for title, desc in tiers:
        p_t = doc.add_paragraph()
        p_t.paragraph_format.space_before = Pt(6)
        p_t.paragraph_format.space_after = Pt(2)
        r_tt = p_t.add_run(f"★ {title}\n")
        r_tt.font.name = "Segoe UI"
        r_tt.font.bold = True
        r_tt.font.color.rgb = COLOR_ACCENT
        r_td = p_t.add_run(desc)
        r_td.font.name = "Segoe UI"
        r_td.font.size = Pt(9.5)

    # ========================================================
    # SECTION 8: THE 3-MINUTE SALES CLOSING SCRIPT
    # ========================================================
    h1 = doc.add_heading(level=1)
    r = h1.add_run("8. The 3-Minute Elevator Pitch & Closing Script")
    r.font.name = "Segoe UI"
    r.font.size = Pt(15)
    r.font.bold = True
    r.font.color.rgb = COLOR_PRIMARY

    script_text = (
        "\"Hi [Owner Name], I noticed your restaurant gets packed during peak dinner hours. "
        "When tables are full, your servers are running like crazy trying to hand out menus, take orders, and bring bills—meaning tables sit occupied 20 minutes longer than necessary while potential guests wait outside.\n\n"
        "We built Evorise specifically to solve this. Guests simply scan a sleek acrylic stand on their table with their smartphone camera, "
        "view appetizing high-def photos of your menu, and submit their order in 15 seconds. "
        "The order dings instantly on your counter POS screen with acoustic kitchen chimes and prints or displays the table number.\n\n"
        "Because guests order immediately and see beautiful photos of your appetizers and desserts, restaurants using Evorise turn tables 20 minutes faster "
        "and see average bill sizes jump by 18% to 25%, all while needing 1 fewer server on shift.\n\n"
        "Best of all, unlike cloud apps that freeze when Wi-Fi drops, Evorise has an embedded offline engine that keeps running even if the internet goes down. "
        "And unlike delivery apps, we charge zero commissions on your food.\n\n"
        "Can I bring over a live demo on a laptop for 5 minutes tomorrow at 3 PM so you can scan a QR code and see the speed for yourself?\""
    )

    add_callout(doc, script_text, "WORD-FOR-WORD PITCH SCRIPT TO MEMORIZE")

    # Document Footer Note
    p_foot = doc.add_paragraph()
    p_foot.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_foot.paragraph_format.space_before = Pt(20)
    r_foot = p_foot.add_run("Confidential Commercial Document • Prepared by Evorise Solution")
    r_foot.font.name = "Segoe UI"
    r_foot.font.size = Pt(8.5)
    r_foot.font.italic = True
    r_foot.font.color.rgb = COLOR_MUTED

    # Save document
    doc.save(output_path)
    print(f"SUCCESS: Document generated at {output_path}")

if __name__ == "__main__":
    out_dir = r"g:\Download Official\Evorise Solution-20261009T164044Z-1-001\Evorise Solution\QR Code Web\docs\marketing"
    os.makedirs(out_dir, exist_ok=True)
    target_file = os.path.join(out_dir, "Why-Restaurant-Owners-Buy-Evorise-System.docx")
    build_marketing_document(target_file)
    
    # Also save a copy in root for easy access
    root_file = r"g:\Download Official\Evorise Solution-20261009T164044Z-1-001\Evorise Solution\QR Code Web\Why-Restaurant-Owners-Buy-Evorise-System.docx"
    build_marketing_document(root_file)
