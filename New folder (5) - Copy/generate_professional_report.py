import os
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
from docx.enum.style import WD_STYLE_TYPE

def add_page_number(run):
    fldChar1 = OxmlElement('w:fldChar')
    fldChar1.set(qn('w:fldCharType'), 'begin')
    instrText = OxmlElement('w:instrText')
    instrText.set(qn('xml:space'), 'preserve')
    instrText.text = "PAGE"
    fldChar2 = OxmlElement('w:fldChar')
    fldChar2.set(qn('w:fldCharType'), 'end')
    run._r.append(fldChar1)
    run._r.append(instrText)
    run._r.append(fldChar2)

def set_style(doc, style_name, font_name, font_size, rgb_color, bold=False):
    style = doc.styles[style_name]
    font = style.font
    font.name = font_name
    font.size = Pt(font_size)
    font.color.rgb = rgb_color
    font.bold = bold

def create_report():
    doc = Document()
    
    # Configure styles
    set_style(doc, 'Normal', 'Calibri', 12, RGBColor(51, 51, 51))
    set_style(doc, 'Heading 1', 'Arial', 18, RGBColor(37, 99, 235), bold=True)
    set_style(doc, 'Heading 2', 'Arial', 14, RGBColor(30, 64, 175), bold=True)
    set_style(doc, 'Heading 3', 'Arial', 12, RGBColor(59, 130, 246), bold=True)

    # 1. Cover Page
    doc.add_paragraph('\n\n\n')
    
    title = doc.add_paragraph()
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    title_run = title.add_run('SMART AIR GUARDIAN\n')
    title_run.font.name = 'Arial'
    title_run.font.size = Pt(36)
    title_run.font.bold = True
    title_run.font.color.rgb = RGBColor(15, 23, 42)

    subtitle = doc.add_paragraph()
    subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER
    sub_run = subtitle.add_run('Next-Generation IoT Air Quality Monitoring System\n\n')
    sub_run.font.name = 'Arial'
    sub_run.font.size = Pt(16)
    sub_run.font.color.rgb = RGBColor(100, 116, 139)

    # Add cover image if exists
    cover_image_path = "esp32_3d_circuit_render_1785526101612.png"
    if os.path.exists(cover_image_path):
        img_para = doc.add_paragraph()
        img_para.alignment = WD_ALIGN_PARAGRAPH.CENTER
        img_para.add_run().add_picture(cover_image_path, width=Inches(4.5))

    doc.add_paragraph('\n\n')
    
    info = doc.add_paragraph()
    info.alignment = WD_ALIGN_PARAGRAPH.CENTER
    info_run = info.add_run('PROJECT REPORT\n\nSubmitted by\nEngineering & Development Team\n\nAugust 2026')
    info_run.font.name = 'Calibri'
    info_run.font.size = Pt(14)
    info_run.font.bold = True

    doc.add_page_break()

    # Footer Setup for remaining pages
    section = doc.sections[0]
    footer = section.footer
    footer_para = footer.paragraphs[0]
    footer_para.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    footer_run = footer_para.add_run('Smart Air Guardian Project Report | Page ')
    add_page_number(footer_run)

    # 2. Abstract
    doc.add_heading('Abstract', level=1)
    doc.add_paragraph("The Smart Air Guardian is a state-of-the-art IoT air quality monitoring system designed to bridge the gap between low-level hardware sensors and high-level cloud telemetry. Powered by a dual-core ESP32 microcontroller, Edge Machine Learning, and a globally synchronized Progressive Web App (PWA) via Firebase, the system provides real-time, actionable insights into indoor air quality. By incorporating industrial-grade sensors (PM2.5, MQ-135, MQ-7, DHT22) and an embedded Groq/Gemini LLM for clinical-grade analysis, the Smart Air Guardian acts as an automated environmental defense node, capable of warning users visually and audibly against hazardous air conditions.")
    doc.add_page_break()

    # 3. Chapter 1: Introduction
    doc.add_heading('Chapter 1: Introduction', level=1)
    doc.add_heading('1.1 Project Vision', level=2)
    doc.add_paragraph("The primary objective of the Smart Air Guardian is to develop a world-class, professional monitoring system that not only collects accurate environmental data but interprets it intelligently using on-device Machine Learning.")
    
    doc.add_heading('1.2 Key Objectives', level=2)
    obj_list = [
        "Intelligent Monitoring: Real-time environmental tracking utilizing edge AI.",
        "Instant Alerts: Visual LED indicators and auditory emergency pulse alarms.",
        "Ubiquitous Access: Global Command & Control via Firebase Realtime Database.",
        "AI Insights: Integration with Groq/Gemini to deliver medical-grade analysis."
    ]
    for obj in obj_list:
        doc.add_paragraph(obj, style='List Bullet')
    
    doc.add_page_break()

    # 4. Chapter 2: System Architecture
    doc.add_heading('Chapter 2: System Architecture & Design', level=1)
    doc.add_paragraph("The ecosystem is built upon an optimized three-tier IoT architecture:")
    
    doc.add_heading('2.1 The Edge Node (Hardware)', level=2)
    doc.add_paragraph("Driven by an ESP32 Dual-Core Xtensa LX6 CPU at 240 MHz, the edge node handles real-time sensor polling via a robust C++ RTOS-like loop, processing 24-sample hardware oversampling for noise reduction, and performing ML inference.")

    # Add Breadboard Diagram
    breadboard_path = "esp32_breadboard_diagram_1785525898462.png"
    if os.path.exists(breadboard_path):
        img_para = doc.add_paragraph()
        img_para.alignment = WD_ALIGN_PARAGRAPH.CENTER
        img_para.add_run().add_picture(breadboard_path, width=Inches(5.5))
        cap = doc.add_paragraph("Figure 1: ESP32 Hardware Wiring and Sensor Integration Matrix")
        cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        cap.runs[0].font.italic = True
    
    doc.add_heading('2.2 The Cloud Broker', level=2)
    doc.add_paragraph("Utilizing Firebase Realtime Database (RTDB) for low-latency JSON telemetry syncing. The ESP32 executes HTTP PUT/GET requests natively to sync telemetry data and fetch C2 (Command & Control) actions.")
    
    doc.add_page_break()

    # 5. Chapter 3: Sensor Instrumentation
    doc.add_heading('Chapter 3: Sensor Instrumentation', level=1)
    doc.add_paragraph("The physical device acts as a continuous environmental auditor, gathering inputs from precision peripherals.")
    
    table = doc.add_table(rows=1, cols=3)
    table.style = 'Table Grid'
    hdr_cells = table.rows[0].cells
    hdr_cells[0].text = 'Component'
    hdr_cells[1].text = 'Protocol/Pin'
    hdr_cells[2].text = 'Functionality'
    
    sensor_data = [
        ("PM2.5 Dust (GP2Y1010)", "ADC1_CH4 (32)", "Detects fine particulate matter. Firmware applies an 8-pulse oversampling average."),
        ("MQ-135 Gas", "ADC1_CH6 (34)", "Detects broad spectrum air quality and CO2. Utilizes 24-sample oversampling."),
        ("MQ-7 CO Gas", "ADC1_CH7 (35)", "Tuned for Carbon Monoxide detection using dual-temperature heater states."),
        ("DHT22", "GPIO 4", "Tracks ambient Temperature & Humidity with automatic DHT11 fallback."),
        ("1.3\" OLED", "I2C (0x3C)", "Onboard auto-carousel UI for localized diagnostics and metric display.")
    ]
    
    for comp, pin, func in sensor_data:
        row_cells = table.add_row().cells
        row_cells[0].text = comp
        row_cells[1].text = pin
        row_cells[2].text = func

    doc.add_page_break()

    # 6. Chapter 4: Edge AI & Machine Learning Pipeline
    doc.add_heading('Chapter 4: Edge AI & Machine Learning', level=1)
    doc.add_paragraph("The ESP32 is a true 'Smart Node'. It operates on C++ Machine Learning models trained via a Python Data Science pipeline on over 1 Million data rows.")
    
    doc.add_heading('4.1 Model Deployments', level=2)
    doc.add_paragraph("1. Linear Regression Forecaster: Predicts the 1-hour future AQI.")
    doc.add_paragraph("2. Logistic Regression (Emergency Alarm): Outputs binary hazard probabilities, triggering the physical buzzer if Probability > 0.85.")
    doc.add_paragraph("3. Decision Tree Classifier: Maps complex sensor matrices into 4 discrete Risk Classes to drive the RGB notification LEDs.")

    if os.path.exists("ai_bg.png"):
        img_para = doc.add_paragraph()
        img_para.alignment = WD_ALIGN_PARAGRAPH.CENTER
        img_para.add_run().add_picture("ai_bg.png", width=Inches(4.5))
        cap = doc.add_paragraph("Figure 2: Edge AI Representation")
        cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        cap.runs[0].font.italic = True

    doc.add_page_break()

    # 7. Chapter 5: PWA & Command Interface
    doc.add_heading('Chapter 5: Frontend Interface & C2 Operations', level=1)
    doc.add_paragraph("The frontend dashboard is engineered as a true Progressive Web App (PWA). It features offline caching, global remote control, and an 11-pane analytical interface.")

    if os.path.exists("frontend_dashboard_mockup_1785526199986.png"):
        img_para = doc.add_paragraph()
        img_para.alignment = WD_ALIGN_PARAGRAPH.CENTER
        img_para.add_run().add_picture("frontend_dashboard_mockup_1785526199986.png", width=Inches(6.0))
        cap = doc.add_paragraph("Figure 3: PWA Dashboard Interface Layout")
        cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        cap.runs[0].font.italic = True
    
    doc.add_heading('5.1 AI Clinical Studio', level=2)
    doc.add_paragraph("Integrated directly with the Groq LLM API. It processes raw telemetry to generate plain-English, medical-grade diagnostic reports for end-users, highlighting synergistic risk factors (e.g., compounding dangers of High CO and High PM2.5).")

    doc.add_page_break()

    # 8. Chapter 6: Conclusion
    doc.add_heading('Chapter 6: Conclusion', level=1)
    doc.add_paragraph("The Smart Air Guardian represents a holistic synthesis of electrical engineering, edge computing, and modern web frameworks. By moving inference to the Edge and centralizing Command & Control in the cloud, the system provides an ultra-reliable, highly scalable solution for modern air quality auditing.")

    doc.save("Smart_Air_Guardian_Professional_Report.docx")

if __name__ == '__main__':
    create_report()
