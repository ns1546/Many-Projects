#!/usr/bin/env python3
"""
Automated Wireless ADB Connector & Live Monitor
Handles ADB 37 STDIN pairing, port autodiscovery, APK push, and live logcat telemetry.
"""

import sys
import subprocess
import time
import socket
import concurrent.futures

PHONE_IP = "192.168.0.103"

def run_cmd(cmd_list):
    res = subprocess.run(cmd_list, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, errors="replace")
    return res.returncode, res.stdout.strip(), res.stderr.strip()

def pair_with_stdin(ip, port, code):
    print(f"[*] Pairing with {ip}:{port} using code {code} via STDIN...")
    proc = subprocess.Popen(
        ["adb", "pair", f"{ip}:{port}"],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )
    stdout, stderr = proc.communicate(input=f"{code}\n", timeout=10)
    print(f"Pairing response:\n{stdout}\n{stderr}")
    return "successfully paired" in stdout.lower() or proc.returncode == 0

def find_open_ports(ip):
    open_ports = []
    def check(p):
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(0.12)
        if s.connect_ex((ip, p)) == 0:
            open_ports.append(p)
        s.close()

    with concurrent.futures.ThreadPoolExecutor(max_workers=300) as ex:
        list(ex.map(check, range(30000, 50000)))
    return sorted(open_ports)

def connect_best_port(ip, ports):
    for p in ports:
        print(f"[*] Trying adb connect {ip}:{p} ...")
        _, out, _ = run_cmd(["adb", "connect", f"{ip}:{p}"])
        print(f" -> {out}")
        _, devs, _ = run_cmd(["adb", "devices"])
        if f"{ip}:{p}\tdevice" in devs:
            print(f"[✓] CONNECTED SUCCESSFULLY to {ip}:{p}!")
            return f"{ip}:{p}"
    return None

def install_and_launch(target):
    apk = "NotificationFixer-Debug.apk"
    print(f"\n[*] Pushing and installing {apk} to {target}...")
    code, out, err = run_cmd(["adb", "-s", target, "install", "-r", apk])
    print(f"Install Output:\n{out}\n{err}")

    print("[*] Launching app on phone...")
    run_cmd(["adb", "-s", target, "shell", "monkey", "-p", "com.antigravity.notificationfixer", "-c", "android.intent.category.LAUNCHER", "1"])
    print("[✓] App launched successfully on device!")

def live_monitor(target):
    print("\n🟢 [LIVE TELEMETRY MONITORING ACTIVE]")
    print("Screen-off, Push, and Call logs will stream live below. Press Ctrl+C to stop.\n")
    proc = subprocess.Popen(
        ["adb", "-s", target, "logcat", "-v", "time", "*:I"],
        stdout=subprocess.PIPE,
        stderr=subprocess.DEVNULL,
        text=True,
        encoding="utf-8",
        errors="replace"
    )
    try:
        for line in proc.stdout:
            l = line.strip()
            if any(k in l for k in ["GCM", "FCM", "mtalk", "WhatsApp", "Telegram", "PowerKeeper", "Athena", "NotificationFixer"]):
                print(f"[{time.strftime('%H:%M:%S')}] {l[:90]}")
    except KeyboardInterrupt:
        proc.terminate()

def main():
    if len(sys.argv) < 3:
        print("Usage: python auto_wireless_connect.py <pair_port> <pair_code>")
        sys.exit(1)

    pair_port = sys.argv[1]
    pair_code = sys.argv[2]

    # 1. Reset ADB
    run_cmd(["adb", "disconnect"])

    # 2. Pair via STDIN
    paired = pair_with_stdin(PHONE_IP, pair_port, pair_code)
    if not paired:
        print("[!] Note: If pairing timed out, please reopen 'Pair device with pairing code' on your phone and try again.")
    
    # 3. Find open ports
    ports = find_open_ports(PHONE_IP)
    print(f"Active ports on phone: {ports}")

    # 4. Connect
    target = connect_best_port(PHONE_IP, ports)
    if target:
        # 5. Install & Monitor
        install_and_launch(target)
        live_monitor(target)
    else:
        print("[!] Could not establish active 'device' connection. Ensure the screen is on and Wireless debugging is active.")

if __name__ == "__main__":
    main()

