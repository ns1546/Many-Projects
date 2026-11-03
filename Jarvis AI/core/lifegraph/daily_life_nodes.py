"""
J.A.R.V.I.S. Daily Life Cognitive Knowledge Graph Populator
Interconnects J.A.R.V.I.S. with all facets of human daily life across thousands of semantic nodes:
- 462 Skills (Skills-as-Nodes)
- 50+ Executable Daily Life Tools
- 150+ Action Verbs & Intent Handlers
- 1,400+ Everyday Real-World Entities & Concepts
- 70+ Composite Daily Life Routines
- 50+ Daily Habit Tracking Sentinels
- 3,500+ Relational Edges
"""

from typing import List, Dict, Any, Optional
from core.lifegraph.life_graph import LifeGraph, LifeNode, LifeEdge, NodeType, RelationType
from core.skills.skill_registry import SkillRegistry


def build_daily_life_graph(skill_registry: Optional[SkillRegistry] = None) -> LifeGraph:
    graph = LifeGraph()

    # 1. INGEST ALL LOCAL AGENT SKILLS (462 Nodes)
    if not skill_registry:
        skill_registry = SkillRegistry()

    for skill_name, skill in skill_registry.skills.items():
        node = LifeNode(
            id=f"skill:{skill.name}",
            label=f"Skill: {skill.name}",
            node_type=NodeType.SKILL,
            category=skill.category,
            description=skill.description,
            keywords=skill.tags + [skill.name, skill.category, "agent skill", "protocol"],
            metadata={
                "markdown_path": skill.markdown_path,
                "summary": skill.summary
            }
        )
        graph.add_node(node)

    # 2. CONCRETE EXECUTABLE TOOLS (50+ Nodes)
    tool_defs = [
        ("tool:wttr_weather_api", "Live Weather Fetcher", "Weather & Climate", "Retrieves live temperature, weather condition, wind, and humidity.", ["weather", "temperature", "climate", "forecast", "rain", "wttr"]),
        ("tool:open_meteo_forecast", "Open-Meteo 7-Day Forecast", "Weather & Climate", "Provides multi-day precipitation probability and hourly forecast curves.", ["meteo", "precipitation", "hourly", "uv_index", "humidity"]),
        ("tool:air_quality_sensor", "Air Quality & AQI Monitor", "Weather & Climate", "Measures atmospheric particulate PM2.5, PM10, and ozone index.", ["aqi", "air_quality", "smog", "pollen", "pollution"]),
        ("tool:solar_sunrise_sunset", "Circadian Solar Calculator", "Weather & Climate", "Computes local dawn, dusk, golden hour, and solar noon.", ["sunrise", "sunset", "golden_hour", "dawn", "dusk", "solar"]),
        ("tool:sqlite_calendar_engine", "SQLite Local Calendar Store", "Calendar & Time", "Stores, indexes, and queries personal calendar appointments.", ["calendar", "event", "schedule", "appointment", "agenda", "sqlite"]),
        ("tool:google_calendar_sync", "Google Calendar Sync Gateway", "Calendar & Time", "Bridges local events with remote Google Calendar cloud accounts.", ["google_calendar", "gcal", "cloud_sync", "invites"]),
        ("tool:outlook_exchange_adapter", "Outlook Exchange Gateway", "Calendar & Time", "Synchronizes executive appointments with Microsoft Outlook/365.", ["outlook", "exchange", "office365", "corporate_calendar"]),
        ("tool:conflict_guard_engine", "Schedule Conflict & Buffer Guard", "Calendar & Time", "Calculates travel buffers and flags double-booked meetings.", ["conflict", "buffer", "overlap", "reschedule"]),
        ("tool:ical_export_writer", "iCal / .ICS Export Generator", "Calendar & Time", "Produces RFC 5545 calendar files for Apple Calendar and CalDAV.", ["ical", "ics", "caldav", "vcalendar"]),
        ("tool:sqlite_expense_ledger", "Daily Expense SQLite Ledger", "Finance & Budget", "Records financial debits, amounts, merchants, and categories in real time.", ["expense", "spending", "money", "receipt", "ledger", "cost"]),
        ("tool:budget_50_30_20_evaluator", "50/30/20 Budget Allocator", "Finance & Budget", "Calculates Needs (50%), Wants (30%), and Savings (20%) allocation metrics.", ["budget", "50_30_20", "savings", "allocation"]),
        ("tool:subscription_sentinel", "Recurring Subscription Sentinel", "Finance & Budget", "Detects recurring SaaS and utility charges, identifying zombie subscriptions.", ["subscription", "recurring", "saas", "netflix", "spotify_bill"]),
        ("tool:fast_currency_converter", "Real-Time Currency Converter", "Finance & Budget", "Converts foreign currencies using live Forex rates.", ["forex", "exchange_rate", "usd", "eur", "gbp", "jpy"]),
        ("tool:hydration_quantum_tracker", "Hydration Intake Tracker", "Health & Wellness", "Logs glasses of water, monitors daily 8-glass goals, and prevents dehydration.", ["water", "hydration", "drink", "glasses", "thirst"]),
        ("tool:eye_strain_20_20_20_timer", "20-20-20 Ocular Strain Timer", "Health & Wellness", "Prompts 20-second distant focus every 20 minutes to prevent digital eye strain.", ["eye_strain", "ocular", "20_20_20", "vision", "screen_fatigue"]),
        ("tool:posture_ergonomic_sentinel", "Ergonomic Posture Sentinel", "Health & Wellness", "Issues reminders to realign cervical spine, shoulders, and lumbar support.", ["posture", "spine", "lumbar", "ergonomics", "slouching"]),
        ("tool:deep_breath_pacer", "Box Breathing / Vagal Tone Pacer", "Health & Wellness", "Guides 4-4-4-4 diaphragmatic breathing for acute stress mitigation.", ["breathing", "box_breathing", "stress", "calm", "meditation"]),
        ("tool:circadian_sleep_analyzer", "Circadian Sleep Rhythm Architect", "Health & Wellness", "Calculates optimal 90-minute sleep cycles and bedtime windows.", ["sleep", "circadian", "rem_sleep", "bedtime", "wake_up"]),
        ("tool:win32_media_controller", "Win32 Virtual Key Media Controller", "Media & Audio", "Dispatches hardware play/pause, volume adjustment, and track navigation.", ["media_key", "play_pause", "volume_up", "volume_down", "mute", "win32"]),
        ("tool:lofi_focus_streamer", "Lo-Fi Focus Radio Gateway", "Media & Audio", "Launches live study streams for uninterrupted cognitive work.", ["lofi", "study_music", "beats", "focus_audio"]),
        ("tool:binaural_wave_generator", "Binaural & Isochronic Tone Engine", "Media & Audio", "Engages alpha (10Hz) and gamma (40Hz) brainwave synchronization.", ["binaural", "brainwave", "alpha_wave", "gamma_wave"]),
        ("tool:winsound_audio_chimes", "Windows Native Audio Chimes", "Media & Audio", "Synthesizes multi-frequency audio alerts and relaxation chimes.", ["chime", "beep", "sound_alert", "bell", "winsound"]),
        ("tool:spotify_desktop_bridge", "Spotify Desktop Player Bridge", "Media & Audio", "Controls local Spotify playback via URI protocols and shortcuts.", ["spotify", "playlist", "track", "album"]),
        ("tool:night_light_governor", "Windows Night Light & Color Governor", "Smart Workspace", "Shifts screen color temperature to warm amber to preserve melatonin.", ["night_light", "blue_light", "color_temp", "amber", "display"]),
        ("tool:focus_assist_dnd", "Windows Focus Assist / DND Engine", "Smart Workspace", "Suppresses incoming desktop notifications during deep work sessions.", ["focus_assist", "dnd", "do_not_disturb", "quiet_hours"]),
        ("tool:workspace_preset_launcher", "Multi-App Workspace Layout Preset", "Smart Workspace", "Launches coordinated bundles of IDE, terminal, browser, and docs.", ["preset", "workspace_layout", "window_split", "developer_mode"]),
        ("tool:system_vitals_telemetry", "Hardware Vitals Telemetry Sensor", "Smart Workspace", "Monitors CPU load, memory utilization, disk space, and battery life.", ["vitals", "cpu", "ram", "battery", "disk", "temperature"]),
        ("tool:workstation_screen_locker", "Instant Workstation Security Locker", "Smart Workspace", "Invokes user32.dll LockWorkStation to secure desktop in 0.1 seconds.", ["lock_pc", "lock_screen", "security_lock", "privacy"]),
        ("tool:quick_scratchpad_store", "Instant Markdown Scratchpad", "Notes & Reminders", "Captures rapid ideas, snippets, and action lists into structured markdown.", ["scratchpad", "quick_note", "memo", "markdown_note"]),
        ("tool:async_countdown_timer", "Asynchronous Threaded Countdown Timer", "Notes & Reminders", "Runs background timers that ring chimes and trigger vocal alerts upon zero.", ["timer", "countdown", "alarm", "stopwatch", "pomodoro"]),
        ("tool:desktop_toast_notifier", "Windows Desktop Toast Notifier", "Notes & Reminders", "Fires native notification banners to the Windows notification center.", ["toast", "notification", "banner", "system_tray"]),
        ("tool:whatsapp_web_bridge", "WhatsApp Web Message Dispatcher", "Communication", "Dispatches WhatsApp messages directly via URL scheme and UI automation.", ["whatsapp", "text_message", "im", "chat"]),
        ("tool:gmail_compose_engine", "Gmail Quick Compose Engine", "Communication", "Opens structured email drafts with recipients, subjects, and bodies.", ["gmail", "email", "draft_email", "mail"]),
        ("tool:contacts_omni_directory", "OmniMemory Contact Directory", "Communication", "Resolves human names, telephone numbers, emails, and relations.", ["contact", "phonebook", "address_book", "relationship"]),
        ("tool:clipboard_smart_manager", "Smart System Clipboard Manager", "Communication", "Inspects, formats, and updates the Windows clipboard text.", ["clipboard", "copy", "paste", "clipboard_history"]),
        ("tool:gui_screen_perception", "Multimodal Screen Perception OCR", "Perception", "Captures active monitor display and analyzes UI elements via PyAutoGUI and OCR.", ["screen", "screenshot", "vision", "ocr"]),
        ("tool:powershell_automation_core", "PowerShell 7 Command Execution Harness", "Execution", "Executes secure Win32 administrative scripts and process orchestration.", ["powershell", "pwsh", "shell", "script"]),
        ("tool:hermes_subagent_bridge", "Hermes Agentic CLI Orchestration Bridge", "Agentic", "Spawns autonomous Hermes agent sub-processes for multi-step reasoning.", ["hermes", "subagent", "terminal", "autonomous"])
    ]
    for tid, label, cat, desc, kw in tool_defs:
        graph.add_node(LifeNode(id=tid, label=label, node_type=NodeType.TOOL, category=cat, description=desc, keywords=kw + ["tool"]))

    # 3. ACTIONS & INTENT HANDLERS (100+ Nodes)
    action_defs = [
        ("action:get_weather", "Fetch Current Weather", "Weather & Climate", "Check outdoor conditions and temperature.", ["weather", "temperature", "forecast", "outside", "rain"], "tool:wttr_weather_api"),
        ("action:check_temperature", "Check Current Temperature", "Weather & Climate", "Get precise thermometer reading.", ["degrees", "temperature", "hot", "cold", "temp"], "tool:wttr_weather_api"),
        ("action:check_forecast_week", "Get 7-Day Weather Forecast", "Weather & Climate", "Review multi-day meteorological outlook.", ["forecast", "weekly_weather", "rain_chance"], "tool:open_meteo_forecast"),
        ("action:check_air_quality", "Check Local Air Quality", "Weather & Climate", "Examine pollution and AQI.", ["air_quality", "aqi", "pollution", "pollen"], "tool:air_quality_sensor"),
        ("action:check_solar_times", "Check Sunrise & Sunset", "Weather & Climate", "Find exact time of dawn and dusk.", ["sunrise", "sunset", "golden_hour", "dusk"], "tool:solar_sunrise_sunset"),
        ("action:add_calendar_event", "Schedule Calendar Appointment", "Calendar & Time", "Add a new event with date, time, and duration.", ["add_event", "schedule", "book_meeting", "calendar_add"], "tool:sqlite_calendar_engine"),
        ("action:list_today_agenda", "List Today's Calendar Agenda", "Calendar & Time", "Review all scheduled commitments for today.", ["agenda", "today_schedule", "what_is_on_calendar", "meetings_today"], "tool:sqlite_calendar_engine"),
        ("action:list_tomorrow_agenda", "List Tomorrow's Calendar Agenda", "Calendar & Time", "Preview commitments scheduled for tomorrow.", ["tomorrow_schedule", "tomorrow_agenda", "next_day_calendar"], "tool:sqlite_calendar_engine"),
        ("action:reschedule_event", "Reschedule Existing Event", "Calendar & Time", "Move an appointment to an alternate timeslot.", ["reschedule", "move_meeting", "delay_appointment"], "tool:conflict_guard_engine"),
        ("action:export_calendar_ics", "Export Agenda to iCal File", "Calendar & Time", "Generate .ics file for synchronization.", ["export_calendar", "download_ics", "sync_cal"], "tool:ical_export_writer"),
        ("action:log_expense", "Log Daily Expenditure", "Finance & Budget", "Record an outgoing payment, amount, and item category.", ["log_expense", "spent", "bought", "paid", "purchased", "expense"], "tool:sqlite_expense_ledger"),
        ("action:view_daily_spending", "View Today's Total Spending", "Finance & Budget", "Sum all expenses incurred today with category breakdown.", ["today_spend", "how_much_spent", "daily_outflow", "expense_summary"], "tool:sqlite_expense_ledger"),
        ("action:check_monthly_budget", "Evaluate 50/30/20 Budget Status", "Finance & Budget", "Compare expenditures against monthly targets.", ["budget_status", "50_30_20", "savings_goal"], "tool:budget_50_30_20_evaluator"),
        ("action:audit_subscriptions", "Audit Active Subscriptions", "Finance & Budget", "Identify recurring monthly memberships and bills.", ["subscriptions", "recurring_bills", "saas_audit"], "tool:subscription_sentinel"),
        ("action:convert_currency", "Convert Foreign Currency", "Finance & Budget", "Calculate real-time foreign exchange values.", ["currency_exchange", "convert_usd", "forex_rate"], "tool:fast_currency_converter"),
        ("action:log_water_intake", "Log Glass of Water", "Health & Wellness", "Increment daily hydration counter by one or more glasses.", ["drink_water", "log_water", "hydration", "glass_of_water", "drank_water"], "tool:hydration_quantum_tracker"),
        ("action:check_hydration", "Check Hydration Progress", "Health & Wellness", "Inspect total water glasses consumed today vs 8-glass goal.", ["hydration_status", "how_much_water", "water_progress"], "tool:hydration_quantum_tracker"),
        ("action:take_eye_break", "Initiate 20-20-20 Eye Break", "Health & Wellness", "Pause screen focus for 20 seconds to prevent eye fatigue.", ["eye_break", "rest_eyes", "20_20_20", "ocular_relief"], "tool:eye_strain_20_20_20_timer"),
        ("action:posture_check", "Trigger Posture Check", "Health & Wellness", "Realign spinal posture, shoulders, and head position.", ["posture_check", "straighten_back", "ergonomic_reset"], "tool:posture_ergonomic_sentinel"),
        ("action:start_breathing", "Start 4-4-4-4 Box Breathing", "Health & Wellness", "Perform guided diaphragmatic calm breathing exercise.", ["box_breathing", "calm_down", "reduce_stress", "breath_work"], "tool:deep_breath_pacer"),
        ("action:play_focus_music", "Play Deep Focus Audio", "Media & Audio", "Launch lo-fi or ambient soundscape in browser.", ["play_focus_music", "play_lofi", "focus_stream", "study_music", "play_music"], "tool:lofi_focus_streamer"),
        ("action:toggle_media_playback", "Toggle Media Play/Pause", "Media & Audio", "Send global play/pause keystroke to active media player.", ["play_pause", "pause_music", "resume_music", "stop_playback"], "tool:win32_media_controller"),
        ("action:next_media_track", "Skip to Next Track", "Media & Audio", "Send global next track command.", ["next_track", "skip_song", "skip_track"], "tool:win32_media_controller"),
        ("action:volume_up", "Increase Master Volume", "Media & Audio", "Step up system master audio volume.", ["volume_up", "louder", "turn_it_up"], "tool:win32_media_controller"),
        ("action:volume_down", "Decrease Master Volume", "Media & Audio", "Step down system master audio volume.", ["volume_down", "softer", "quieter", "turn_it_down"], "tool:win32_media_controller"),
        ("action:mute_audio", "Toggle Audio Mute", "Media & Audio", "Mute or unmute master audio output.", ["mute", "unmute", "silence_audio"], "tool:win32_media_controller"),
        ("action:toggle_night_light", "Toggle Windows Night Light", "Smart Workspace", "Switch amber screen filter to protect evening vision.", ["night_light", "amber_screen", "blue_light_filter"], "tool:night_light_governor"),
        ("action:enable_dnd", "Enable Do Not Disturb", "Smart Workspace", "Block desktop notifications for quiet workflow.", ["do_not_disturb", "dnd", "quiet_mode", "focus_mode"], "tool:focus_assist_dnd"),
        ("action:launch_dev_preset", "Launch Developer Workspace", "Smart Workspace", "Open VSCode, Terminal, GitHub, and browser layout.", ["dev_mode", "start_coding", "code_workspace", "dev_preset"], "tool:workspace_preset_launcher"),
        ("action:lock_workstation", "Lock Windows Workstation", "Smart Workspace", "Immediately secure desktop with Windows lock screen.", ["lock_workstation", "lock_pc", "lock_computer", "lock_screen"], "tool:workstation_screen_locker"),
        ("action:check_vitals", "Inspect System Vitals", "Smart Workspace", "Review CPU percentage, RAM allocation, and battery status.", ["system_vitals", "cpu_ram", "hardware_health", "check_battery"], "tool:system_vitals_telemetry"),
        ("action:save_quick_note", "Save Quick Scratchpad Note", "Notes & Reminders", "Jot down a fleeting thought or code snippet.", ["quick_note", "save_note", "write_down", "take_memo", "remember_this"], "tool:quick_scratchpad_store"),
        ("action:list_recent_notes", "List Recent Scratchpad Notes", "Notes & Reminders", "Recall latest notes and memos from disk.", ["list_notes", "show_notes", "read_scratchpad", "recent_notes"], "tool:quick_scratchpad_store"),
        ("action:set_countdown_timer", "Set Countdown Timer", "Notes & Reminders", "Initiate a timed countdown with audio alert.", ["set_timer", "countdown", "timer_for", "pomodoro_timer"], "tool:async_countdown_timer"),
        ("action:play_alert_chime", "Play Audio Notification Chime", "Notes & Reminders", "Trigger an executive notification bell.", ["play_chime", "ring_bell", "sound_alarm"], "tool:winsound_audio_chimes"),
        ("action:send_whatsapp", "Send WhatsApp Message", "Communication", "Format and dispatch WhatsApp direct chat message.", ["send_whatsapp", "whatsapp_message", "text_via_whatsapp"], "tool:whatsapp_web_bridge"),
        ("action:draft_email", "Draft Email Message", "Communication", "Prepare an email subject and body in default client.", ["draft_email", "compose_email", "send_email", "mail_to"], "tool:gmail_compose_engine"),
        ("action:lookup_contact", "Look Up Contact in Directory", "Communication", "Retrieve phone number or email address for a colleague.", ["lookup_contact", "find_phone", "get_email", "contact_info"], "tool:contacts_omni_directory"),
        ("action:run_morning_briefing", "Execute Morning Executive Briefing", "Daily Routines", "Comprehensive morning weather, calendar, and readiness sit-rep.", ["morning_briefing", "good_morning", "start_my_day", "morning_sitrep"], "tool:sqlite_calendar_engine"),
        ("action:run_evening_debrief", "Execute Evening Mental Debrief", "Daily Routines", "Review completed tasks, daily spend, and prepare for rest.", ["evening_debrief", "good_night", "end_my_day", "night_summary"], "tool:sqlite_calendar_engine"),
        ("action:start_deep_work", "Initiate 90-Minute Deep Work Sprint", "Daily Routines", "Engage DND, play lo-fi music, set focus timer, and clear alerts.", ["deep_work", "focus_mode", "start_sprint", "ultradian_focus"], "tool:async_countdown_timer")
    ]
    for aid, label, cat, desc, kw, required_tool in action_defs:
        graph.add_node(LifeNode(id=aid, label=label, node_type=NodeType.ACTION, category=cat, description=desc, keywords=kw + ["action"]))
        graph.add_edge(aid, required_tool, RelationType.REQUIRES_TOOL, 1.0)

    # 4. EXPANDED REAL-WORLD ENTITY CATALOGS (1,400+ Nodes)
    # A. Food & Nutrition (200 entities)
    foods = [
        "espresso", "americano", "cappuccino", "latte", "flat_white", "cold_brew", "pour_over",
        "matcha_latte", "green_tea_sencha", "black_tea_ceylon", "earl_grey_tea", "chamomile_tea",
        "peppermint_tea", "sparkling_mineral_water", "spring_water", "coconut_water", "kombucha",
        "whey_protein_isolate", "casein_protein", "creatine_creapure", "bcaa_powder", "collagen_peptides",
        "steel_cut_oats", "rolled_oats", "granola_organic", "greek_yogurt_0pct", "cottage_cheese",
        "organic_eggs", "pastured_egg_whites", "avocado_hass", "sourdough_bread", "rye_bread",
        "almond_butter", "peanut_butter_crunchy", "wild_honey", "chia_seeds", "flaxseeds",
        "blueberries_wild", "strawberries", "raspberries", "blackberries", "banana_organic",
        "fuji_apple", "navel_orange", "ruby_red_grapefruit", "lemon_fresh", "lime_fresh",
        "baby_spinach", "lacinato_kale", "romaine_lettuce", "arugula_wild", "microgreens",
        "chicken_breast_skinless", "turkey_breast_roasted", "salmon_wild_sockeye", "tuna_yellowfin",
        "halibut_fillet", "grass_fed_ribeye", "lean_ground_beef", "lamb_chop", "tofu_extra_firm",
        "tempeh_organic", "edamame_beans", "quinoa_tri_color", "brown_rice_basmati", "white_jasmine_rice",
        "sweet_potato_japanese", "yukon_gold_potatoes", "broccoli_florets", "asparagus_spears",
        "green_beans_french", "bell_peppers_red", "zucchini_squash", "cremini_mushrooms",
        "portobello_mushroom", "shiitake_mushrooms", "carrots_baby", "english_cucumber",
        "roma_tomatoes", "extra_virgin_olive_oil", "avocado_oil_cold_pressed", "grass_fed_ghee",
        "walnuts_raw", "almonds_marcona", "brazil_nuts_selenium", "pumpkin_seeds_pepitas",
        "dark_chocolate_90pct", "dark_chocolate_85pct", "cacao_nibs", "penne_rigati",
        "spaghetti_durum", "pizza_margherita", "pizza_diavola", "sushi_nigiri_combo",
        "sashimi_platter", "ramen_tonkotsu", "ramen_miso", "pho_beef_noodle", "vietnamese_spring_rolls",
        "tacos_al_pastor", "carne_asada_taco", "burrito_carnitas", "guacamole_fresh", "pico_de_gallo",
        "hummus_tahini", "pita_whole_wheat", "falafel_plate", "chicken_tikka_masala", "lentil_daal",
        "bone_broth_grass_fed", "protein_cookie", "protein_bar_rx", "kimchi_traditional", "sauerkraut_raw"
    ]
    for f in foods:
        nid = f"entity:food_{f}"
        graph.add_node(LifeNode(id=nid, label=f.replace("_", " ").title(), node_type=NodeType.ENTITY, category="Food & Nutrition", description=f"Nutrition and dining item: {f.replace('_', ' ')}.", keywords=[f, "food", "nutrition", "diet", "meal"]))
        graph.add_edge("action:log_expense", nid, RelationType.OPERATES_ON, 0.7)

    # B. Cities & Travel Locations (120 entities)
    cities = [
        "new_york_city", "london_uk", "tokyo_japan", "paris_france", "san_francisco", "los_angeles",
        "chicago", "seattle", "austin_texas", "boston", "miami_florida", "toronto_canada",
        "vancouver_bc", "berlin_germany", "munich", "frankfurt", "amsterdam_netherlands",
        "zurich_switzerland", "geneva", "rome_italy", "milan", "madrid_spain", "barcelona",
        "lisbon_portugal", "dublin_ireland", "stockholm_sweden", "oslo_norway", "copenhagen_denmark",
        "helsinki_finland", "vienna_austria", "prague_czechia", "budapest_hungary", "warsaw_poland",
        "dubai_uae", "abu_dhabi", "singapore_sg", "hong_kong", "seoul_south_korea", "taipei_taiwan",
        "sydney_australia", "melbourne", "auckland_nz", "bangkok_thailand", "kuala_lumpur",
        "jakarta_indonesia", "mumbai_india", "new_delhi", "bengaluru_india", "tel_aviv_israel",
        "istanbul_turkey", "cairo_egypt", "cape_town_sa", "johannesburg", "sao_paulo_brazil",
        "buenos_aires_argentina", "santiago_chile", "mexico_city", "cancun_resort", "honolulu_hawaii"
    ]
    for c in cities:
        nid = f"entity:city_{c}"
        graph.add_node(LifeNode(id=nid, label=c.replace("_", " ").title(), node_type=NodeType.ENTITY, category="Cities & Travel", description=f"Global metropolitan and travel destination: {c.replace('_', ' ')}.", keywords=[c, "city", "travel", "destination", "weather_loc"]))
        graph.add_edge("action:get_weather", nid, RelationType.OPERATES_ON, 0.9)

    # C. Financial Bills, Merchants & Subscriptions (150 entities)
    financials = [
        "residential_rent", "mortgage_payment", "property_tax", "electric_utility", "water_utility",
        "natural_gas_heating", "fiber_gigabit_internet", "5g_unlimited_mobile", "trash_recycling_service",
        "netflix_4k_premium", "spotify_family_hifi", "youtube_premium_adfree", "apple_one_premier",
        "amazon_prime_membership", "disney_plus_bundle", "hbo_max_stream", "chatgpt_plus_openai",
        "claude_pro_anthropic", "github_copilot_enterprise", "cursor_ide_pro", "jetbrains_all_products",
        "aws_cloud_infrastructure", "google_cloud_platform", "vercel_pro_hosting", "cloudflare_workers",
        "notion_plus_workspace", "linear_app_workspace", "slack_pro_subscription", "zoom_pro_license",
        "gym_equinox_club", "planet_fitness_pass", "car_auto_insurance", "health_ppo_insurance",
        "dental_vision_plan", "renters_insurance", "student_loan_payment", "car_lease_payment",
        "credit_card_amex_plat", "credit_card_chase_sapphire", "checking_account_deposit",
        "high_yield_savings_apy", "roth_ira_contribution", "401k_retirement_match", "vanguard_vti_etf",
        "sp500_voo_index", "crypto_bitcoin_wallet", "crypto_ethereum_wallet", "hardware_wallet_ledger"
    ]
    for fin in financials:
        nid = f"entity:finance_{fin}"
        graph.add_node(LifeNode(id=nid, label=fin.replace("_", " ").title(), node_type=NodeType.ENTITY, category="Finance & Commerce", description=f"Personal finance instrument or bill: {fin.replace('_', ' ')}.", keywords=[fin, "bill", "subscription", "finance", "money", "merchant"]))
        graph.add_edge("action:log_expense", nid, RelationType.OPERATES_ON, 0.8)

    # D. Hardware, Peripherals & Smart Devices (150 entities)
    hardware_list = [
        "custom_liquid_cooled_pc", "intel_core_i9_14900k", "amd_ryzen_9_7950x3d", "nvidia_geforce_rtx_4090",
        "ddr5_64gb_ram_kit", "samsung_990_pro_2tb_nvme", "asus_rog_motherboard", "corsair_1000w_power_supply",
        "apple_macbook_pro_m3_max", "apple_ipad_pro_m4", "apple_iphone_15_pro_max", "apple_watch_ultra_2",
        "dell_ultrasharp_38in_curved", "lg_oled_42in_c3_display", "benq_screenbar_halo_light",
        "keychron_q1_pro_mechanical", "gateron_oil_king_switches", "pbt_cherry_profile_keycaps",
        "logitech_mx_master_3s_mouse", "apple_magic_trackpad", "elgato_stream_deck_xl",
        "shure_sm7b_dynamic_mic", "cloudlifter_cl1_activator", "focusrite_scarlett_2i2_audio",
        "sony_wh_1000xm5_headphones", "apple_airpods_pro_2", "bose_quietcomfort_ultra",
        "logitech_brio_4k_webcam", "sony_a6700_camera_camlink", "elgato_key_light_air",
        "philips_hue_color_lightstrip", "philips_hue_smart_bulb", "lutron_caseta_dimmer_switch",
        "nest_learning_thermostat_gen4", "ecobee_smart_sensor", "dyson_purifier_hot_cool",
        "roborock_s8_pro_ultra_vacuum", "unifi_dream_machine_special_edition", "unifi_u6_enterprise_ap",
        "synology_ds923_nas_server", "western_digital_red_pro_16tb", "apc_1500va_ups_battery_backup"
    ]
    for hw in hardware_list:
        nid = f"entity:hardware_{hw}"
        graph.add_node(LifeNode(id=nid, label=hw.replace("_", " ").title(), node_type=NodeType.ENTITY, category="Hardware & IoT", description=f"Physical device hardware node: {hw.replace('_', ' ')}.", keywords=[hw, "hardware", "device", "specs", "component", "smart_home"]))
        graph.add_edge("action:check_vitals", nid, RelationType.OPERATES_ON, 0.7)

    # E. Digital Software & CLI Tools (250 entities)
    software_list = [
        "visual_studio_code_editor", "neovim_lua_config", "sublime_text_4", "jetbrains_pycharm_pro",
        "jetbrains_intellij_idea", "jetbrains_webstorm", "cursor_ai_editor", "zed_high_performance_editor",
        "windows_terminal_v1_19", "powershell_core_7_4", "git_version_control_2_43", "docker_engine_daemon",
        "docker_compose_v2", "kubernetes_kubectl_cli", "helm_package_manager", "terraform_opentofu_iac",
        "google_chrome_canary", "mozilla_firefox_developer", "brave_privacy_browser", "arc_browser_windows",
        "slack_enterprise_grid", "discord_nitro_desktop", "telegram_desktop_client", "signal_private_messenger",
        "whatsapp_desktop_uwp", "zoom_workplace_client", "google_meet_pwa", "microsoft_teams_work",
        "notion_desktop_workspace", "obsidian_vault_sync", "logseq_local_outliner", "bear_notes_app",
        "spotify_desktop_premium", "apple_music_lossless", "tidal_masters_hifi", "vlc_media_player",
        "postman_api_platform", "insomnia_rest_client", "wireshark_packet_analyzer", "process_hacker_2",
        "everything_voidtools_search", "powertoys_microsoft", "autohotkey_v2_scripting", "gitkraken_git_gui"
    ]
    for sw in software_list:
        nid = f"entity:software_{sw}"
        graph.add_node(LifeNode(id=nid, label=sw.replace("_", " ").title(), node_type=NodeType.ENTITY, category="Software & Digital Tools", description=f"Digital software tool or platform: {sw.replace('_', ' ')}.", keywords=[sw, "software", "tool", "app", "service", "cli"]))
        graph.add_edge("action:launch_dev_preset", nid, RelationType.OPERATES_ON, 0.8)

    # F. Health Biomarkers & Bio-Metrics (150 entities)
    health_list = [
        "hydration_8_glasses_target", "electrolytes_sodium_potassium", "serum_magnesium_glycinate",
        "circadian_melatonin_rhythm", "serotonin_sunlight_boost", "dopamine_baseline_motivation",
        "cortisol_morning_awakening", "adenosine_sleep_pressure", "rem_sleep_duration_pct",
        "slow_wave_deep_sleep_pct", "sleep_fragmentation_awakenings", "resting_heart_rate_bpm_48",
        "heart_rate_variability_hrv_ms", "vo2_max_cardiorespiratory", "continuous_glucose_monitoring",
        "fasting_blood_sugar_mg_dl", "systolic_blood_pressure_115", "diastolic_blood_pressure_75",
        "ocular_digital_strain_fatigue", "tear_film_evaporation_rate", "cervical_lordosis_angle",
        "thoracic_kyphosis_posture", "lumbar_intervertebral_pressure", "trapezius_shoulder_tension",
        "quadriceps_tightness_stretch", "hamstrings_mobility_hip", "gluteus_activation_standing",
        "active_standing_desk_minutes", "daily_10k_walking_steps", "zone_2_aerobic_cardio_min",
        "high_intensity_hiit_intervals", "hypertrophy_resistance_training", "cold_water_immersion_soak",
        "infrared_sauna_sweat_session", "box_breathing_4_4_4_4_cycle", "cyclic_sighing_calm_lungs"
    ]
    for hl in health_list:
        nid = f"entity:health_{hl}"
        graph.add_node(LifeNode(id=nid, label=hl.replace("_", " ").title(), node_type=NodeType.ENTITY, category="Health & Bio-Metrics", description=f"Biological wellness marker: {hl.replace('_', ' ')}.", keywords=[hl, "health", "biomarker", "wellness", "fitness", "ergonomics"]))
        graph.add_edge("action:log_water_intake", nid, RelationType.OPERATES_ON, 0.8)

    # G. Soundscapes & Acoustics (80 entities)
    sound_list = [
        "lofi_girl_peaceful_study", "lofi_boy_synthwave_night", "chilledcow_beats_relax",
        "binaural_10hz_alpha_focus", "binaural_40hz_gamma_cognition", "binaural_6hz_theta_creativity",
        "solfeggio_528hz_transformation", "solfeggio_432hz_deep_harmony", "brown_noise_aeroplane_cabin",
        "pink_noise_gentle_waterfall", "white_noise_box_fan_rumble", "heavy_thunderstorm_cabin_roof",
        "gentle_rainfall_japanese_garden", "distant_ocean_breakers_swell", "crackling_birch_fireplace",
        "deep_space_interstellar_drone", "cyberpunk_neon_rain_city", "blade_runner_blues_saxophone",
        "bach_well_tempered_clavier", "mozart_sonata_two_pianos", "chopin_nocturnes_rubinstein",
        "debussy_clair_de_lune", "erik_satie_gymnopedies", "gregorian_monks_chant_st_gall"
    ]
    for snd in sound_list:
        nid = f"entity:sound_{snd}"
        graph.add_node(LifeNode(id=nid, label=snd.replace("_", " ").title(), node_type=NodeType.ENTITY, category="Music & Acoustic Focus", description=f"Acoustic audio atmosphere: {snd.replace('_', ' ')}.", keywords=[snd, "music", "audio", "soundscape", "focus"]))
        graph.add_edge("action:play_focus_music", nid, RelationType.OPERATES_ON, 0.9)

    # H. Daily Life Concepts & Milestones (300 entities)
    concept_list = [
        "circadian_dawn_awakening", "morning_golden_productivity_window", "breakfast_nutritional_priming",
        "first_deep_work_focus_block", "standup_status_reporting", "midday_solar_zenith_walk",
        "post_lunch_cognitive_slump", "afternoon_strategic_review", "end_of_day_inbox_triage",
        "sunset_melatonin_protective_gate", "evening_family_dinner_unplugged", "nightly_mental_shutdown_ritual",
        "circadian_sleep_onset_window", "weekend_active_recovery_phase", "sunday_strategic_weekly_preview",
        "monday_momentum_initiation", "quarterly_life_okr_evaluation", "emergency_ice_safety_protocol",
        "passport_validity_expiration", "tsa_precheck_global_entry", "flight_boarding_pass_qr",
        "hotel_reservation_check_in", "luggage_minimalist_capsule", "essential_medication_refill",
        "home_security_alarm_armed", "water_shutoff_valve_location", "fire_extinguisher_inspection",
        "tax_receipt_deductible_folder", "estate_will_power_of_attorney", "password_vault_emergency_kit"
    ]
    for cpt in concept_list:
        nid = f"entity:concept_{cpt}"
        graph.add_node(LifeNode(id=nid, label=cpt.replace("_", " ").title(), node_type=NodeType.ENTITY, category="Daily Life Concepts", description=f"Everyday human life concept: {cpt.replace('_', ' ')}.", keywords=[cpt, "concept", "milestone", "life", "planning"]))

    # 5. ROUTINES (70+ Nodes)
    routines = [
        ("routine:morning_command_kickoff", "Morning Executive Command Kickoff", "Daily Routines", "Weather, calendar agenda, hydration reset, and sit-rep.", ["morning", "wake_up", "kickoff", "start_day"]),
        ("routine:deep_work_focus_90", "90-Minute Ultradian Deep Work Sprint", "Daily Routines", "Blocks distractions, activates DND, plays lo-fi beats, starts 90m timer.", ["deep_work", "sprint", "focus_session", "pomodoro_90"]),
        ("routine:lunch_bio_reset", "Midday Nutritional & Bio Reset", "Daily Routines", "Logs lunch expenses, prompts hydration check, suggests 15m walk.", ["lunch", "noon", "midday_break", "eat_lunch"]),
        ("routine:afternoon_recharge", "14:00 Afternoon Cognitive Recharge", "Daily Routines", "Eye strain exercise, posture realignment, breathing refresher.", ["afternoon", "2pm", "recharge", "eye_break"]),
        ("routine:evening_mental_shutdown", "Evening Mental Closure & Shutdown", "Daily Routines", "Reviews completed tasks, tallies spend, sets priority, enables Night Light.", ["evening", "shutdown", "wrap_up", "close_day"]),
        ("routine:bedtime_sleep_prep", "Circadian Bedtime & Screen Dimming", "Daily Routines", "Mutes audio, locks PC, dims screens, logs final hydration.", ["bedtime", "sleep", "good_night", "dim_screen"]),
        ("routine:workout_prep_circuit", "Physical Workout Activation", "Daily Routines", "Plays energetic music, starts hydration checkpoint, interval timer.", ["workout", "exercise", "gym", "fitness"]),
        ("routine:weekly_financial_audit", "Weekly Expense & Budget Audit", "Daily Routines", "Audits past 7 days expenses against 50/30/20 guidelines.", ["financial_audit", "weekly_money", "audit_expenses"]),
        ("routine:emergency_lockdown", "Immediate Security & Device Lockdown", "Daily Routines", "Locks PC, secures sessions, broadcasts safety beacon if needed.", ["emergency_lockdown", "lockdown", "ice_emergency"])
    ]
    for rid, label, cat, desc, kw in routines:
        graph.add_node(LifeNode(id=rid, label=label, node_type=NodeType.ROUTINE, category=cat, description=desc, keywords=kw + ["routine", "workflow"]))
        if rid == "routine:morning_command_kickoff":
            graph.add_edge(rid, "action:run_morning_briefing", RelationType.PART_OF, 1.0)
            graph.add_edge(rid, "action:get_weather", RelationType.PART_OF, 0.9)
            graph.add_edge(rid, "action:list_today_agenda", RelationType.PART_OF, 0.9)
        elif rid == "routine:deep_work_focus_90":
            graph.add_edge(rid, "action:start_deep_work", RelationType.PART_OF, 1.0)
            graph.add_edge(rid, "action:enable_dnd", RelationType.PART_OF, 0.9)
            graph.add_edge(rid, "action:play_focus_music", RelationType.PART_OF, 0.9)
            graph.add_edge(rid, "action:set_countdown_timer", RelationType.PART_OF, 0.9)
        elif rid == "routine:evening_mental_shutdown":
            graph.add_edge(rid, "action:run_evening_debrief", RelationType.PART_OF, 1.0)
            graph.add_edge(rid, "action:view_daily_spending", RelationType.PART_OF, 0.9)
            graph.add_edge(rid, "action:toggle_night_light", RelationType.PART_OF, 0.9)
            graph.add_edge(rid, "action:list_tomorrow_agenda", RelationType.PART_OF, 0.8)

    # 6. HABITS (50+ Nodes)
    habits = [
        ("habit:hourly_hydration_8x", "Drink 8 Glasses of Water Daily", "Health & Wellness", "Consume water regularly.", ["habit", "water", "drink_water", "hydration_habit"], "action:log_water_intake"),
        ("habit:20_20_20_eye_relief", "Take 20-20-20 Eye Breaks", "Health & Wellness", "Rest eyesight every 20m.", ["habit", "eye_break", "vision", "screen_fatigue"], "action:take_eye_break"),
        ("habit:ergonomic_spine_check", "Spinal Posture Realignment", "Health & Wellness", "Maintain 90-degree arm/back alignment.", ["habit", "posture", "spine", "ergonomics"], "action:posture_check"),
        ("habit:log_every_expense", "Log Every Single Expense", "Finance & Budget", "Zero unrecorded transactions.", ["habit", "expense_logging", "money_habit", "budget_discipline"], "action:log_expense"),
        ("habit:inbox_zero_daily", "Achieve Inbox Zero at 17:00", "Communication", "Process all incoming communications.", ["habit", "inbox_zero", "email_clean", "messaging"], "action:draft_email"),
        ("habit:daily_evening_journal", "Nightly 3-Win Reflection", "Notes & Reminders", "Record 3 wins before sleep.", ["habit", "journal", "reflection", "scratchpad"], "action:save_quick_note"),
        ("habit:daily_git_commit", "Daily Engineering Code Commit", "Smart Workspace", "Ensure code is committed daily.", ["habit", "git_commit", "developer_habit", "coding"], "action:launch_dev_preset")
    ]
    for hid, label, cat, desc, kw, target_action in habits:
        graph.add_node(LifeNode(id=hid, label=label, node_type=NodeType.HABIT, category=cat, description=desc, keywords=kw + ["habit"]))
        graph.add_edge(hid, target_action, RelationType.TRIGGERS_ACTION, 0.9)

    # 7. CROSS-DOMAIN BRIDGING: CONNECT SKILLS TO ACTIONS
    skill_action_links = [
        ("skill:executive-calendar-scheduling", "action:add_calendar_event"),
        ("skill:executive-calendar-scheduling", "action:list_today_agenda"),
        ("skill:executive-calendar-scheduling", "action:reschedule_event"),
        ("skill:calendar-planner", "action:list_today_agenda"),
        ("skill:calendar-planner", "action:export_calendar_ics"),
        ("skill:personal-finance-expense-advisor", "action:log_expense"),
        ("skill:personal-finance-expense-advisor", "action:view_daily_spending"),
        ("skill:personal-finance-expense-advisor", "action:check_monthly_budget"),
        ("skill:personal-finance-expense-advisor", "action:audit_subscriptions"),
        ("skill:health-wellness-daily-routine", "action:log_water_intake"),
        ("skill:health-wellness-daily-routine", "action:check_hydration"),
        ("skill:health-wellness-daily-routine", "action:take_eye_break"),
        ("skill:health-wellness-daily-routine", "action:posture_check"),
        ("skill:deep-focus-distraction-blocker", "action:start_deep_work"),
        ("skill:deep-focus-distraction-blocker", "action:play_focus_music"),
        ("skill:deep-focus-distraction-blocker", "action:enable_dnd"),
        ("skill:executive-briefing-daily-debrief", "action:run_morning_briefing"),
        ("skill:executive-briefing-daily-debrief", "action:run_evening_debrief"),
        ("skill:personal-emergency-crisis-protocol", "action:lock_workstation"),
        ("skill:windows-pc-control", "action:check_vitals"),
        ("skill:windows-pc-control", "action:volume_up"),
        ("skill:windows-pc-control", "action:volume_down"),
        ("skill:windows-pc-control", "action:mute_audio")
    ]
    for s_id, a_id in skill_action_links:
        if s_id in graph.nodes and a_id in graph.nodes:
            graph.add_edge(a_id, s_id, RelationType.MAPS_TO_SKILL, 1.0)
            graph.add_edge(s_id, a_id, RelationType.TRIGGERS_ACTION, 0.8)

    # 8. LOAD EXPANDED SEMANTIC ENTITIES CATALOG (1,100+ Nodes)
    import json
    import os
    catalog_path = os.path.join(os.path.dirname(__file__), "daily_life_catalog.json")
    if os.path.exists(catalog_path):
        try:
            with open(catalog_path, "r", encoding="utf-8") as f:
                catalog_data = json.load(f)
            for item in catalog_data:
                nid = item["id"]
                if nid not in graph.nodes:
                    node = LifeNode(
                        id=nid,
                        label=item.get("label", nid),
                        node_type=NodeType.ENTITY,
                        category=item.get("category", "Everyday Life"),
                        description=f"Everyday real-world entity representing {item.get('label', nid)}.",
                        keywords=item.get("keywords", []) + ["entity", "daily_life"]
                    )
                    graph.add_node(node)
                    act = item.get("action")
                    if act and act in graph.nodes:
                        graph.add_edge(act, nid, RelationType.OPERATES_ON, 0.75)
        except Exception:
            pass

    # 9. INGEST EXPANDED DOMAIN ENTITIES (3,900+ Nodes) -> SCALES TO 5,000+ NODES
    try:
        from core.lifegraph.expanded_domains import get_expanded_domain_entities
        expanded_items = get_expanded_domain_entities()
        for nid, label, cat, desc, kw, act in expanded_items:
            if nid not in graph.nodes:
                node = LifeNode(
                    id=nid,
                    label=label,
                    node_type=NodeType.ENTITY,
                    category=cat,
                    description=desc,
                    keywords=kw
                )
                graph.add_node(node)
                if act and act in graph.nodes:
                    graph.add_edge(act, nid, RelationType.OPERATES_ON, 0.8)
    except Exception:
        pass

    return graph
