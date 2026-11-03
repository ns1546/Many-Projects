# bKash APK Extraction & Reverse Engineering Architecture Report

## 1. Overview & Artifact Metadata
- **Target File:** `bKash.apk` (51.8 MB)
- **Extracted Directory:** `bkash_extracted/`
- **Total Files Extracted:** 2,141 files
- **Total Unpacked Size:** 55.74 MB
- **Package Name:** `com.bKash.customerapp`
- **Main Application:** `com.example.first.flutter.bkash.bkashnext.MainApplication`
- **Main Activity:** `com.bKash.customerapp.MainActivity`

---

## 2. Identified Technology Stack & Architectural Modules

### A. Hybrid Application Architecture (Flutter + Native Android + Mini-Programs)
- **Flutter Integration:** 
  - Application class declared under `com.example.first.flutter.bkash.bkashnext.MainApplication`.
  - Found extensive Flutter assets in `assets/flutter_assets/` including `AssetManifest.bin`, `FontManifest.json`, `NativeAssetsManifest.json`, custom fonts (`InterTight`, `NotoSansBengali`, `Delius`, `CupertinoIcons`).
- **Alipay+ / Ant Group IAPConnect & Griver Engine:**
  - `assets/channel.config`: `channel_id=alipay_plus`, `release_type=release`.
  - `assets/iapconnect_config_full`: Encoded IAPConnect configuration with App IDs `BKASH_APP_WALLET_BGD` and Mini-Program ID `BKASH_APP_MINIPROGRAM_BGD`.
  - `assets/Griver/`, `assets/GriverBridge/`, `assets/GriverTheme/`: Alibaba/Ant Group Griver runtime engine powering in-app mini-programs and lightweight web apps.
- **Biometric & e-KYC Identity Engine (Zoloz / Hummer):**
  - Found `assets/toyger.face.dat`, `assets/FULL_KYC.json`, `assets/zoloz_biometric.json`, `assets/zoloz_framework.json`, and `assets/hummer_task.json`.
  - Powered by Ant Group Zoloz biometric facial recognition and automated KYC verification.
- **Machine Learning & Barcode Scanning:**
  - Google ML Kit Barcode Scanning (`assets/mlkit_barcode_models/`) and Face Detection.

---

## 3. Bytecode Structure (MultiDex)
The app is packaged with 5 Dalvik Executable (`.dex`) files:
1. `classes.dex` (~8.59 MB)
2. `classes2.dex` (~7.03 MB)
3. `classes3.dex` (~7.96 MB)
4. `classes4.dex` (~7.34 MB)
5. `classes5.dex` (~0.57 MB)
**Total DEX Bytecode:** ~31.49 MB

---

## 4. Extracted Directory Layout

```
bkash_extracted/
├── AndroidManifest.xml          # Binary Android Manifest
├── classes.dex                  # MultiDex Primary Dalvik Executable
├── classes2.dex ... classes5.dex# MultiDex Secondary Executables
├── resources.arsc               # Compiled binary resource table
├── assets/
│   ├── flutter_assets/          # Flutter UI assets, fonts, icons, shaders
│   ├── Griver/                  # Alipay+ Mini-Program runtime
│   ├── GriverBridge/            # JS-Native Bridge
│   ├── mlkit_barcode_models/    # Machine Learning scanning models
│   ├── iapconnect_config_full   # Alipay+ wallet configuration
│   ├── toyger.face.dat          # Zoloz biometric facial recognition model
│   └── FULL_KYC.json            # Electronic KYC flow schema
├── res/                         # Compiled drawables, layouts, mipmaps, animations
├── META-INF/                    # APK signing certificates and dependency manifests
└── EXTRACTION_REPORT.md         # This architectural analysis report
```

---

## 5. Next Steps for Deep Decompilation

If you wish to decompile the Java/Kotlin sources or convert Binary XML into human-readable XML:

### A. Decompiling Dex to Java using JADX
To convert the `.dex` files into clean Java source code:
```bash
# Using JADX CLI (if installed):
jadx -d bkash_java_src bKash.apk

# Or open bKash.apk directly in JADX-GUI:
jadx-gui bKash.apk
```

### B. Decoding Binary XML & Resources using Apktool
To convert `AndroidManifest.xml` and `res/` into editable XML:
```bash
apktool d bKash.apk -o bkash_apktool_decoded
```
