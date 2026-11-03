/**
 * Evo Alarm Production Controller
 * Features Native Android AlarmManager Integration, Real-Time Squad WebSocket Sync,
 * On-Screen Hardened Numeric Keypad, and Google/iOS Clock Architecture.
 */
document.addEventListener('DOMContentLoaded', () => {
  const sync = window.clientSync;
  const audio = window.alarmAudioEngine;

  let currentAlarms = [];
  let currentMembers = [];
  let lastDevices = [];
  let activeRingingAlarm = null;
  let pendingDeleteAlarmId = null;
  let activeTestingAlarmId = null;
  let mathSolution = null;
  let requiredTaps = 0;
  let currentTaps = 0;
  let selectedDays = [0, 1, 2, 3, 4, 5, 6];
  let currentQrTarget = 'download';

  // ==========================================================
  // 0. NATIVE ALARM PERSISTENCE & HARDWARE BRIDGE
  // ==========================================================
  function persistAlarmsLocally() {
    try {
      const json = JSON.stringify(currentAlarms);
      localStorage.setItem('combine_local_alarms', json);
      localStorage.setItem('combine_cached_alarms', json);
      localStorage.setItem('evo_alarm_list', json);
    } catch (e) {}

    // Synchronize directly with Native Android AlarmManager (AlarmClock stream)
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.NativeAlarm) {
      window.Capacitor.Plugins.NativeAlarm.syncAlarms({ alarms: currentAlarms })
        .then(res => console.log('⏰ Native alarms synced with Android AlarmManager:', res))
        .catch(err => console.warn('Native alarm sync warning:', err));
    }
  }

  // Load cached alarms from storage immediately on startup
  try {
    const cached = localStorage.getItem('combine_cached_alarms') || localStorage.getItem('combine_local_alarms') || localStorage.getItem('evo_alarm_list');
    if (cached) currentAlarms = JSON.parse(cached);
  } catch (e) {}

  if (!currentAlarms || currentAlarms.length === 0) {
    currentAlarms = [
      {
        id: 'evo-alarm-morning',
        title: '🌅 Squad Morning Wake Up',
        time: '07:30',
        enabled: true,
        repeatMode: 'repeat',
        repeatDays: [0, 1, 2, 3, 4, 5, 6],
        snoozeDuration: 10,
        sound: 'nuclear',
        challenge: 'none',
        consensusMode: 'any',
        targetScope: 'all',
        targetMembers: [],
        crescendo: true,
        voiceMemo: 'Good morning squad! Time to get active!'
      },
      {
        id: 'evo-alarm-standup',
        title: '🚀 Squad Standup & Sync',
        time: '09:00',
        enabled: true,
        repeatMode: 'repeat',
        repeatDays: [1, 2, 3, 4, 5],
        snoozeDuration: 5,
        sound: 'siren',
        challenge: 'math',
        consensusMode: 'all',
        targetScope: 'all',
        targetMembers: [],
        crescendo: false,
        voiceMemo: ''
      }
    ];
    persistAlarmsLocally();
  }

  // Check if Native Android launched this app due to a hardware Alarm Trigger
  if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.NativeAlarm) {
    window.Capacitor.Plugins.NativeAlarm.checkPendingTrigger().then(res => {
      if (res && res.hasPending && res.alarm) {
        console.log('⏰ App cold-started by Android Alarm Receiver:', res.alarm);
        const match = currentAlarms.find(a => a.id === res.alarm.alarmId) || {
          id: res.alarm.alarmId,
          title: res.alarm.title || 'Squad Alarm',
          time: res.alarm.time || '08:00',
          sound: 'nuclear',
          challenge: 'math',
          consensusMode: 'any'
        };
        triggerLocalRinging(match);
      }
    }).catch(() => {});

    // Check exact alarm permission on Android 12+
    window.Capacitor.Plugins.NativeAlarm.checkPermissions().then(perm => {
      if (perm && perm.exactAlarmAllowed === false) {
        console.warn('⚠️ Exact alarm permission required for Android 12+ lock-screen alarms');
      }
    }).catch(() => {});
  }

  // URL Query Param Auto-Join (?room=ROOM_NAME)
  const urlParams = new URLSearchParams(window.location.search);
  const paramRoom = urlParams.get('room');
  if (paramRoom) {
    sync.joinRoom(paramRoom);
  }

  // ==========================================================
  // 1. PAGE VIEWS ROUTER & BOTTOM NAVIGATION
  // ==========================================================
  const pageViews = document.querySelectorAll('.page-view');
  const bottomNavItems = document.querySelectorAll('.bottom-nav-item');

  function navigateToPage(pageId) {
    audio.hapticTap();
    pageViews.forEach(v => v.classList.remove('active'));
    bottomNavItems.forEach(item => {
      if (item.dataset.page === pageId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    const target = document.getElementById(pageId);
    if (target) {
      target.classList.add('active');
    }
    if (pageId === 'pageDevices') {
      updateQRCodes();
    }
  }

  bottomNavItems.forEach(item => {
    item.addEventListener('click', () => {
      const pageId = item.dataset.page;
      navigateToPage(pageId);
    });
  });

  // Header & Clock Elements
  const elHours = document.getElementById('liveHours');
  const elSeconds = document.getElementById('liveSeconds');
  const elAmPm = document.getElementById('liveAmPm');
  const elDate = document.getElementById('liveDate');
  const elSquadTitle = document.getElementById('squadTitle');
  const elHeaderStatusDot = document.getElementById('headerStatusDot');
  const elHeaderDeviceCount = document.getElementById('headerDeviceCount');
  const elNextAlarmBanner = document.getElementById('nextAlarmBanner');
  const elNextAlarmTime = document.getElementById('nextAlarmTime');
  const elNextAlarmCountdown = document.getElementById('nextAlarmCountdown');
  const elAlarmsList = document.getElementById('alarmsList');

  // Devices & History Page Elements
  const elDevicesRoomCode = document.getElementById('devicesRoomCode');
  const elDevicesListCount = document.getElementById('devicesListCount');
  const elSquadDeviceList = document.getElementById('squadDeviceList');
  const elActivityFeed = document.getElementById('activityFeed');

  // Modals
  const alarmModal = document.getElementById('alarmModal');
  const roomModal = document.getElementById('roomModal');
  const panicModal = document.getElementById('panicModal');
  const addMemberModal = document.getElementById('addMemberModal');
  const deleteConfirmModal = document.getElementById('deleteConfirmModal');
  const ringingOverlay = document.getElementById('ringingOverlay');
  const qrModal = document.getElementById('qrModal');

  // Ringing Elements
  const ringTitle = document.getElementById('ringTitle');
  const ringAuthor = document.getElementById('ringAuthor');
  const ringClockTime = document.getElementById('ringClockTime');
  const ringVoiceMemo = document.getElementById('ringVoiceMemo');
  const ringChallengeBox = document.getElementById('ringChallengeBox');
  const ringChallengeQuestion = document.getElementById('ringChallengeQuestion');
  const mathChallengeRow = document.getElementById('mathChallengeRow');
  const ringChallengeInput = document.getElementById('ringChallengeInput');
  const onscreenKeypad = document.getElementById('onscreenKeypad');
  const ringChallengeSubmit = document.getElementById('ringChallengeSubmit');
  const tapChallengeRow = document.getElementById('tapChallengeRow');
  const btnTapChallengeTarget = document.getElementById('btnTapChallengeTarget');
  const tapChallengeQuestion = document.getElementById('tapChallengeQuestion');
  const tapProgressFill = document.getElementById('tapProgressFill');
  const btnRingDismiss = document.getElementById('btnRingDismiss');
  const btnRingSnooze5 = document.getElementById('btnRingSnooze5');
  const btnRingSnooze10 = document.getElementById('btnRingSnooze10');
  const ringProgress = document.getElementById('ringProgress');

  // Helper: Determine if this device is targeted by an alarm
  function isDeviceTargeted(alarm) {
    if (!alarm || !alarm.targetScope || alarm.targetScope === 'all') return true;
    if (Array.isArray(alarm.targetMembers) && alarm.targetMembers.length > 0) {
      const myName = (sync.deviceName || '').toLowerCase();
      const myId = sync.deviceId;
      return alarm.targetMembers.some(name => {
        const clean = (name || '').toLowerCase();
        return clean === myName || name === myId;
      });
    }
    return true;
  }

  // ==========================================================
  // 2. LIVE CLOCK & WEB ALARM LOOP
  // ==========================================================
  function updateClock() {
    const now = new Date();
    const nowMs = now.getTime();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = String(hours % 12 || 12).padStart(2, '0');

    elHours.textContent = `${displayHours}:${minutes}`;
    elSeconds.textContent = seconds;
    elAmPm.textContent = ampm;

    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    elDate.textContent = now.toLocaleDateString(undefined, options);

    updateNextAlarmCountdown();

    // Web Fallback Alarm Trigger (if app is foregrounded)
    const currentTimeStr = `${String(hours).padStart(2, '0')}:${minutes}`;
    const currentDay = now.getDay();

    currentAlarms.forEach(alarm => {
      if (!alarm.enabled && alarm.status !== 'SNOOZED') return;

      const isSnoozeDue = alarm.status === 'SNOOZED' && alarm.snoozeUntil && nowMs >= alarm.snoozeUntil;
      const isOnce = alarm.repeatMode === 'once' || (Array.isArray(alarm.repeatDays) && alarm.repeatDays.length === 0);
      const repeats = isOnce || !alarm.repeatDays || alarm.repeatDays.includes(currentDay);
      const isScheduleDue = now.getSeconds() === 0 && alarm.enabled && alarm.time === currentTimeStr && repeats && alarm.status !== 'RINGING';

      if ((isSnoozeDue || isScheduleDue) && (!activeRingingAlarm || activeRingingAlarm.id !== alarm.id)) {
        if (isDeviceTargeted(alarm)) {
          console.log(`⏰ Local Alarm triggering: "${alarm.title}" (Snooze: ${isSnoozeDue}, Once: ${isOnce})`);
          alarm.status = 'RINGING';
          delete alarm.snoozeUntil;
          if (isOnce && !isSnoozeDue) {
            alarm.enabled = false;
          }
          persistAlarmsLocally();
          renderAlarms(currentAlarms);
          updateNextAlarmCountdown();
          triggerLocalRinging(alarm);
        }
      }
    });
  }
  setInterval(updateClock, 1000);
  updateClock();

  function updateNextAlarmCountdown() {
    const enabledAlarms = currentAlarms.filter(a => a.enabled || (a.status === 'SNOOZED' && a.snoozeUntil));
    if (enabledAlarms.length === 0) {
      elNextAlarmBanner.style.display = 'none';
      return;
    }

    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    let shortestDiff = Infinity;
    let nextAlarm = null;

    enabledAlarms.forEach(alarm => {
      if (alarm.status === 'SNOOZED' && alarm.snoozeUntil && alarm.snoozeUntil > Date.now()) {
        const snoozeDiffMinutes = Math.max(1, Math.round((alarm.snoozeUntil - Date.now()) / 60000));
        if (snoozeDiffMinutes < shortestDiff) {
          shortestDiff = snoozeDiffMinutes;
          nextAlarm = { ...alarm, isSnoozedActive: true };
        }
        return;
      }
      const [h, m] = (alarm.time || '08:00').split(':').map(Number);
      let alarmMinutes = h * 60 + m;
      let diff = alarmMinutes - nowMinutes;
      if (diff <= 0) diff += 1440;

      if (diff < shortestDiff) {
        shortestDiff = diff;
        nextAlarm = alarm;
      }
    });

    if (nextAlarm) {
      elNextAlarmBanner.style.display = 'inline-flex';
      if (nextAlarm.isSnoozedActive) {
        elNextAlarmTime.textContent = '💤 Snooze';
        elNextAlarmCountdown.textContent = `resumes in ${shortestDiff}m`;
      } else {
        elNextAlarmTime.textContent = nextAlarm.time;
        const hoursLeft = Math.floor(shortestDiff / 60);
        const minsLeft = shortestDiff % 60;
        const countdownStr = hoursLeft > 0 ? `in ${hoursLeft}h ${minsLeft}m` : `in ${minsLeft}m`;
        elNextAlarmCountdown.textContent = countdownStr;
      }
    }
  }

  // ==========================================================
  // 3. WEBSOCKET REAL-TIME MULTIPLAYER SYNC
  // ==========================================================
  sync.on('connection_status', ({ connected }) => {
    const offBanner = document.getElementById('offlineSyncBanner');
    if (connected) {
      elHeaderStatusDot.className = 'live-dot';
      elHeaderStatusDot.title = 'Live Squad Connected';
      if (offBanner) offBanner.style.display = 'none';
    } else {
      elHeaderStatusDot.className = 'live-dot offline';
      elHeaderStatusDot.title = 'Standalone / Offline (Native alarms will still ring)';
      if (offBanner) offBanner.style.display = 'flex';
    }
  });

  sync.on('room_state_sync', ({ room, devices }) => {
    elSquadTitle.textContent = room.id || 'ALPHA-7';
    elDevicesRoomCode.textContent = room.id;
    currentMembers = room.members || [];
    renderDevicesAndMembers(devices, currentMembers);
    renderAlarms(room.alarms);
    renderLogs(room.logs);
    updateQRCodes();
  });

  sync.on('devices_updated', (devices) => {
    renderDevicesAndMembers(devices, currentMembers);
  });

  sync.on('members_updated', (members) => {
    currentMembers = members || [];
    renderDevicesAndMembers(lastDevices, currentMembers);
  });

  sync.on('alarms_updated', (data) => {
    currentAlarms = data.alarms;
    persistAlarmsLocally();
    renderAlarms(data.alarms);
    updateNextAlarmCountdown();
  });

  sync.on('room_log', (log) => {
    prependLog(log);
  });

  // ==========================================================
  // 4. SYNCHRONIZED FULLSCREEN RINGING OVERLAY
  // ==========================================================
  function triggerLocalRinging(alarm, triggeredBy = null) {
    if (!alarm.isInstantAlert && !isDeviceTargeted(alarm)) {
      const targets = (alarm.targetMembers || []).join(', ');
      console.log(`ℹ️ Alarm "${alarm.title}" targeted for specific phones (${targets}).`);
      showToast(`ℹ️ Alarm "${alarm.title}" ringing on targeted devices`);
      return;
    }

    activeRingingAlarm = alarm;
    audio.startAlarm(alarm.sound || 'nuclear', alarm.voiceMemo, alarm.title, !!alarm.crescendo);

    ringClockTime.textContent = alarm.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    ringTitle.textContent = alarm.title || 'Combine Alarm!';
    ringAuthor.textContent = triggeredBy 
      ? `🚨 Emergency broadcast from ${triggeredBy}` 
      : `Scheduled by ${alarm.createdBy || 'Squad'}`;

    if (alarm.voiceMemo) {
      ringVoiceMemo.textContent = `🎙️ Memo: "${alarm.voiceMemo}"`;
      ringVoiceMemo.style.display = 'block';
    } else {
      ringVoiceMemo.style.display = 'none';
    }

    setupChallenge(alarm.challenge || 'none');

    if (alarm.consensusMode === 'all') {
      btnRingDismiss.textContent = "I'M AWAKE (CHECK IN)";
      ringProgress.style.display = 'block';
      ringProgress.textContent = "Waiting for squad check-ins...";
    } else {
      btnRingDismiss.textContent = "DISMISS FOR EVERYONE";
      ringProgress.style.display = 'none';
    }

    // Configure Snooze Actions Dynamically
    const snoozeContainer = document.getElementById('snoozeButtonsRow');
    const snoozeDuration = alarm.snoozeDuration !== undefined ? parseInt(alarm.snoozeDuration, 10) : 10;
    if (snoozeContainer) {
      if (snoozeDuration === 0) {
        snoozeContainer.innerHTML = `
          <div style="width:100%; text-align:center; color:var(--color-amber); font-size:12px; font-weight:700; padding:10px 14px; background:rgba(255,170,0,0.12); border-radius:10px; border:1px solid rgba(255,170,0,0.3);">
            🚫 Snooze Disabled (Strict Wake-Up)
          </div>
        `;
      } else {
        const altMinutes = snoozeDuration === 5 ? 10 : (snoozeDuration + 5);
        snoozeContainer.innerHTML = `
          <button type="button" class="btn-snooze btn-active-snooze" data-mins="${snoozeDuration}">
            💤 Snooze ${snoozeDuration}m
          </button>
          <button type="button" class="btn-snooze btn-active-snooze" data-mins="${altMinutes}">
            +5m (${altMinutes}m)
          </button>
        `;
        snoozeContainer.querySelectorAll('.btn-active-snooze').forEach(btn => {
          btn.addEventListener('click', () => {
            audio.hapticTap();
            if (!activeRingingAlarm) return;
            const mins = parseInt(btn.dataset.mins, 10) || snoozeDuration;
            handleLocalSnooze(activeRingingAlarm.id, mins);
          });
        });
      }
    }

    ringingOverlay.classList.add('active');
  }

  function handleLocalSnooze(alarmId, minutes) {
    audio.stopAlarm();
    ringingOverlay.classList.remove('active');
    activeRingingAlarm = null;

    // Reschedule in Native Android AlarmManager
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.NativeAlarm) {
      window.Capacitor.Plugins.NativeAlarm.snoozeAlarm({ id: alarmId, minutes: minutes }).catch(() => {});
    }

    const alarm = currentAlarms.find(a => a.id === alarmId);
    if (alarm) {
      alarm.status = 'SNOOZED';
      alarm.snoozeUntil = Date.now() + (minutes * 60000);
      alarm.snoozeMinutes = minutes;
      persistAlarmsLocally();
      renderAlarms(currentAlarms);
      updateNextAlarmCountdown();
    }

    sync.snoozeAlarm(alarmId, minutes);
    const resumeStr = new Date(Date.now() + minutes * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    showToast(`💤 Snoozed for ${minutes} min! Will ring again at ${resumeStr}`);
  }

  sync.on('alarm_ring_triggered', ({ alarm, devices }) => {
    triggerLocalRinging(alarm, alarm.triggeredBy);
  });

  sync.on('alarm_dismissed', (data) => {
    audio.stopAlarm();
    ringingOverlay.classList.remove('active');
    activeRingingAlarm = null;

    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.NativeAlarm) {
      window.Capacitor.Plugins.NativeAlarm.stopAlarmSound({ id: data.alarmId }).catch(() => {});
    }

    const a = currentAlarms.find(al => al.id === data.alarmId);
    if (a) {
      a.status = 'DISMISSED';
      delete a.snoozeUntil;
      persistAlarmsLocally();
      renderAlarms(currentAlarms);
      updateNextAlarmCountdown();
    }
    showToast(`✅ Dismissed by ${data.dismissedBy}`);
  });

  sync.on('user_checked_in', (data) => {
    ringProgress.textContent = `Awake: ${data.awakeCount} / ${data.totalCount} Checked In`;
    if (data.deviceId === sync.deviceId) {
      audio.stopAlarm();
      btnRingDismiss.textContent = "CHECKED IN (WAITING FOR SQUAD)";
      btnRingDismiss.disabled = true;
    }
  });

  sync.on('alarm_snoozed', (data) => {
    audio.stopAlarm();
    ringingOverlay.classList.remove('active');
    activeRingingAlarm = null;

    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.NativeAlarm) {
      window.Capacitor.Plugins.NativeAlarm.stopAlarmSound({ id: data.alarmId }).catch(() => {});
    }

    const a = currentAlarms.find(al => al.id === data.alarmId);
    if (a) {
      a.status = 'SNOOZED';
      a.snoozeUntil = Date.now() + ((data.minutes || 5) * 60000);
      a.snoozeMinutes = data.minutes || 5;
      persistAlarmsLocally();
      renderAlarms(currentAlarms);
      updateNextAlarmCountdown();
    }
    showToast(`⏰ Snoozed for ${data.minutes}m by ${data.snoozedBy}`);
  });

  // Challenge Setup
  function setupChallenge(challengeType) {
    mathSolution = null;
    requiredTaps = 0;
    currentTaps = 0;
    ringChallengeInput.value = '';
    tapProgressFill.style.width = '0%';

    if (challengeType === 'math') {
      ringChallengeBox.style.display = 'flex';
      mathChallengeRow.style.display = 'flex';
      tapChallengeRow.style.display = 'none';

      const n1 = Math.floor(12 + Math.random() * 45);
      const n2 = Math.floor(14 + Math.random() * 38);
      mathSolution = n1 + n2;
      ringChallengeQuestion.textContent = `Solve to Unlock: ${n1} + ${n2} = ?`;
      btnRingDismiss.style.display = 'none';
    } else if (challengeType === 'tap') {
      ringChallengeBox.style.display = 'flex';
      mathChallengeRow.style.display = 'none';
      tapChallengeRow.style.display = 'flex';

      requiredTaps = 10;
      currentTaps = 0;
      if (tapChallengeQuestion) tapChallengeQuestion.textContent = `Tap 10 times to unlock! (0/10)`;
      btnTapChallengeTarget.textContent = "TAP HERE FAST!";
      btnRingDismiss.style.display = 'none';
    } else {
      ringChallengeBox.style.display = 'none';
      btnRingDismiss.style.display = 'block';
      btnRingDismiss.disabled = false;
    }
  }

  // Built-in Numeric Keypad Handler (Prevents virtual keyboard popup)
  if (onscreenKeypad) {
    onscreenKeypad.querySelectorAll('.keypad-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        audio.hapticTap();
        const key = btn.dataset.key;
        if (key === 'C') {
          ringChallengeInput.value = '';
        } else if (key === 'back') {
          ringChallengeInput.value = ringChallengeInput.value.slice(0, -1);
        } else if (key) {
          if (ringChallengeInput.value.length < 6) {
            ringChallengeInput.value += key;
          }
        }
      });
    });
  }

  // Hardware keyboard numpad support
  document.addEventListener('keydown', (e) => {
    if (!ringingOverlay.classList.contains('active')) return;
    if (ringChallengeBox.style.display !== 'none' && mathSolution !== null) {
      if (e.key >= '0' && e.key <= '9') {
        if (ringChallengeInput.value.length < 6) ringChallengeInput.value += e.key;
      } else if (e.key === 'Backspace') {
        ringChallengeInput.value = ringChallengeInput.value.slice(0, -1);
      } else if (e.key === 'Escape' || e.key.toLowerCase() === 'c') {
        ringChallengeInput.value = '';
      } else if (e.key === 'Enter') {
        ringChallengeSubmit.click();
      }
    }
  });

  ringChallengeSubmit.addEventListener('click', () => {
    audio.hapticTap();
    if (mathSolution !== null) {
      const val = parseInt(ringChallengeInput.value.trim(), 10);
      if (val === mathSolution) {
        ringChallengeBox.style.display = 'none';
        btnRingDismiss.style.display = 'block';
        btnRingDismiss.disabled = false;
        showToast("✅ Challenge solved! Tap Dismiss to stop alarm.");
      } else {
        audio.hapticWarning();
        ringChallengeInput.style.borderColor = 'var(--color-danger)';
        ringChallengeInput.value = '';
        ringChallengeInput.placeholder = 'Wrong answer';
        setTimeout(() => {
          ringChallengeInput.style.borderColor = '';
          ringChallengeInput.placeholder = 'Enter Answer';
        }, 1200);
      }
    }
  });

  btnTapChallengeTarget.addEventListener('click', () => {
    audio.hapticTap();
    if (requiredTaps > 0) {
      currentTaps++;
      const percent = Math.min((currentTaps / requiredTaps) * 100, 100);
      tapProgressFill.style.width = `${percent}%`;
      if (tapChallengeQuestion) tapChallengeQuestion.textContent = `Tap 10 times to unlock! (${currentTaps}/10)`;

      if (currentTaps >= requiredTaps) {
        ringChallengeBox.style.display = 'none';
        btnRingDismiss.style.display = 'block';
        btnRingDismiss.disabled = false;
        showToast("✅ Tap challenge completed!");
      }
    }
  });

  btnRingDismiss.addEventListener('click', () => {
    audio.hapticTap();
    if (!activeRingingAlarm) return;
    const alarmId = activeRingingAlarm.id;
    const mode = activeRingingAlarm.consensusMode || 'any';

    audio.stopAlarm();
    ringingOverlay.classList.remove('active');
    activeRingingAlarm = null;

    // Stop Native Android Alarm Sound & Notification
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.NativeAlarm) {
      window.Capacitor.Plugins.NativeAlarm.stopAlarmSound({ id: alarmId }).catch(() => {});
    }

    const alarm = currentAlarms.find(a => a.id === alarmId);
    if (alarm) {
      alarm.status = 'DISMISSED';
      delete alarm.snoozeUntil;
      persistAlarmsLocally();
      renderAlarms(currentAlarms);
      updateNextAlarmCountdown();
    }

    sync.dismissAlarm(alarmId, mode);
    showToast('✅ Alarm dismissed');
  });

  // ==========================================================
  // 5. RENDERERS: DEVICES, MEMBERS & ALARM CARDS
  // ==========================================================
  function renderDevicesAndMembers(devices, members) {
    lastDevices = devices || [];
    currentMembers = members || [];

    const onlineCount = lastDevices.length;
    elHeaderDeviceCount.textContent = onlineCount;
    elDevicesListCount.textContent = currentMembers.length > 0 ? currentMembers.length : onlineCount;
    elSquadDeviceList.innerHTML = '';

    if (currentMembers.length > 0) {
      currentMembers.forEach(mem => {
        const activeDev = lastDevices.find(d => 
          (mem.deviceId && d.deviceId === mem.deviceId) || 
          d.deviceName.toLowerCase() === mem.name.toLowerCase()
        );
        const isSelf = activeDev && activeDev.deviceId === sync.deviceId;
        const isOnline = !!activeDev;
        const batteryStr = activeDev && activeDev.battery !== null ? `🔋 ${activeDev.battery}%` : (isOnline ? '⚡ Plugged' : '⚪ Registered');
        const statusText = activeDev ? (activeDev.isRinging ? '🚨 Ringing' : (activeDev.isAwake ? '☀️ Awake' : '🟢 Ready')) : 'Offline / Standby';
        const isManual = mem.type === 'manual';

        const item = document.createElement('div');
        item.className = `device-row-item ${isSelf ? 'self' : ''}`;
        item.innerHTML = `
          <div>
            <span class="device-name-text">${mem.name}</span>
            ${isSelf ? '<span class="you-pill">YOU</span>' : ''}
            ${isManual ? '<span class="member-badge-manual">MANUAL</span>' : ''}
            <div style="font-size:11px; color:var(--text-secondary); margin-top:2px;">
              ${isOnline ? (activeDev.platform + ' • ' + batteryStr) : 'Registered Squad Device'}
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:12px; font-weight:700; color:${activeDev && activeDev.isRinging ? 'var(--color-danger)' : (isOnline ? 'var(--color-accent)' : 'var(--text-tertiary)')};">
              ${statusText}
            </span>
            ${isManual ? `<button type="button" class="btn-remove-member" data-id="${mem.id}" title="Remove member">🗑️</button>` : ''}
          </div>
        `;
        elSquadDeviceList.appendChild(item);
      });

      elSquadDeviceList.querySelectorAll('.btn-remove-member').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          audio.hapticWarning();
          const memId = btn.dataset.id;
          sync.deleteMember(memId);
          showToast('Member removed from squad');
        });
      });
    } else {
      lastDevices.forEach(dev => {
        const isSelf = dev.deviceId === sync.deviceId;
        const batteryStr = dev.battery !== null ? `🔋 ${dev.battery}%` : '⚡ Plugged';
        const statusText = dev.isRinging ? '🚨 Ringing' : (dev.isAwake ? '☀️ Awake' : '🟢 Ready');

        const item = document.createElement('div');
        item.className = `device-row-item ${isSelf ? 'self' : ''}`;
        item.innerHTML = `
          <div>
            <span class="device-name-text">${dev.deviceName}</span>
            ${isSelf ? '<span class="you-pill">YOU</span>' : ''}
            <div style="font-size:11px; color:var(--text-secondary); margin-top:2px;">
              ${dev.platform} • ${batteryStr}
            </div>
          </div>
          <span style="font-size:12px; font-weight:700; color:${dev.isRinging ? 'var(--color-danger)' : 'var(--color-accent)'};">
            ${statusText}
          </span>
        `;
        elSquadDeviceList.appendChild(item);
      });
    }
  }

  function renderAlarms(alarms) {
    currentAlarms = alarms;
    elAlarmsList.innerHTML = '';

    if (alarms.length === 0) {
      elAlarmsList.innerHTML = `
        <div style="text-align:center; padding:36px 10px; color:var(--text-secondary); font-size:13px;">
          No squad alarms scheduled.<br>Tap <strong>+</strong> in the top header to add one.
        </div>
      `;
      return;
    }

    alarms.forEach(alarm => {
      const card = document.createElement('div');
      card.className = `alarm-card ${alarm.enabled ? '' : 'disabled'}`;
      card.dataset.alarmId = alarm.id;

      const consensusLabel = alarm.consensusMode === 'all' ? 'All Check-in' : 'Anyone Dismisses';
      const challengeLabel = alarm.challenge && alarm.challenge !== 'none' ? `${alarm.challenge.toUpperCase()}` : 'Instant';

      const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
      const isOnce = alarm.repeatMode === 'once' || (Array.isArray(alarm.repeatDays) && alarm.repeatDays.length === 0);
      const repeatDays = isOnce ? [] : (alarm.repeatDays || [0, 1, 2, 3, 4, 5, 6]);
      const daysPillsHtml = isOnce 
        ? `<span class="badge-chip amber" style="margin:0; font-size:10px; font-weight:800; padding:2px 8px;">🔔 RING ONCE</span>`
        : daysOfWeek.map((d, idx) => `
            <span class="day-circle ${repeatDays.includes(idx) ? 'active' : ''}">${d}</span>
          `).join('');

      const repeatBadgeHtml = isOnce 
        ? `<span class="badge-chip amber" style="font-weight:700;">🔔 Once Only</span>` 
        : (repeatDays.length === 7 
            ? `<span class="badge-chip">🔁 Everyday</span>` 
            : (repeatDays.length === 5 && !repeatDays.includes(0) && !repeatDays.includes(6)
                ? `<span class="badge-chip">📅 Weekdays</span>`
                : `<span class="badge-chip">🗓️ Custom Days</span>`));

      const snoozeDuration = alarm.snoozeDuration !== undefined ? parseInt(alarm.snoozeDuration, 10) : 10;
      const snoozeBadgeHtml = snoozeDuration === 0
        ? `<span class="badge-chip red" style="font-weight:700;">🚫 No Snooze</span>`
        : `<span class="badge-chip purple" style="font-weight:600;">💤 ${snoozeDuration}m Snooze</span>`;

      const isSnoozedNow = alarm.status === 'SNOOZED' && alarm.snoozeUntil && alarm.snoozeUntil > Date.now();
      const snoozeRemainingMins = isSnoozedNow ? Math.max(1, Math.round((alarm.snoozeUntil - Date.now()) / 60000)) : 0;
      const snoozedAlertBadge = isSnoozedNow
        ? `<span class="badge-chip amber" style="font-weight:800;">💤 Resumes in ${snoozeRemainingMins}m</span>`
        : '';

      let targetBadgeHtml = '';
      if (alarm.targetScope === 'selected' && Array.isArray(alarm.targetMembers) && alarm.targetMembers.length > 0) {
        const count = alarm.targetMembers.length;
        const sample = alarm.targetMembers.slice(0, 2).join(', ');
        const more = count > 2 ? ` +${count - 2}` : '';
        targetBadgeHtml = `<span class="badge-chip target">🎯 ${sample}${more} (${count})</span>`;
      } else {
        targetBadgeHtml = `<span class="badge-chip cyan">🌐 All Squad Phones</span>`;
      }

      const isCurrentlyTesting = activeTestingAlarmId === alarm.id;

      card.innerHTML = `
        <div class="alarm-card-top">
          <div class="time-and-title">
            <span class="alarm-time-digits">${alarm.time}</span>
            <span class="alarm-label">${alarm.title}</span>
            <div class="alarm-repeat-pills">${daysPillsHtml}</div>
          </div>
          <label class="switch">
            <input type="checkbox" class="alarm-toggle" data-id="${alarm.id}" ${alarm.enabled ? 'checked' : ''}>
            <span class="slider"></span>
          </label>
        </div>

        <div class="alarm-card-meta-row">
          ${targetBadgeHtml}
          ${repeatBadgeHtml}
          ${snoozeBadgeHtml}
          ${snoozedAlertBadge}
          <span class="badge-chip blue">${consensusLabel}</span>
          <span class="badge-chip amber">${challengeLabel}</span>
          <span class="badge-chip">🎵 ${alarm.sound || 'nuclear'}</span>
          ${alarm.voiceMemo ? '<span class="badge-chip memo">🎙️ Spoken Memo</span>' : ''}
        </div>

        <div class="alarm-card-action-bar">
          <button type="button" class="btn-card-action test btn-test-ring-now ${isCurrentlyTesting ? 'playing' : ''}" data-id="${alarm.id}">
            ${isCurrentlyTesting ? '⏹️ Stop Test' : '🔔 Test Ring'}
          </button>
          <button type="button" class="btn-card-action edit btn-edit-alarm" data-id="${alarm.id}">
            ✏️ Edit
          </button>
          <button type="button" class="btn-card-action delete btn-delete-alarm" data-id="${alarm.id}">
            🗑️ Delete
          </button>
        </div>
      `;

      elAlarmsList.appendChild(card);
    });

    // Wire Alarm Toggle Switch
    document.querySelectorAll('.alarm-toggle').forEach(input => {
      input.addEventListener('change', (e) => {
        audio.hapticTap();
        const id = e.target.dataset.id;
        const updatedAlarm = currentAlarms.find(a => a.id === id);
        if (updatedAlarm) {
          updatedAlarm.enabled = e.target.checked;
          persistAlarmsLocally();
          updateNextAlarmCountdown();
        }
        sync.updateAlarm({ id, enabled: e.target.checked });
      });
    });

    // Wire Test Ring Button with Toggle Stop
    document.querySelectorAll('.btn-test-ring-now').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        audio.hapticTap();
        const id = btn.dataset.id;
        const alarm = currentAlarms.find(a => a.id === id);
        if (!alarm) return;

        if (activeTestingAlarmId === id) {
          audio.stopAlarm();
          activeTestingAlarmId = null;
          renderAlarms(currentAlarms);
          showToast('⏹️ Test stopped');
        } else {
          activeTestingAlarmId = id;
          audio.previewSound(alarm.sound || 'nuclear');
          renderAlarms(currentAlarms);
          showToast(`🔔 Testing "${alarm.title}"... Tap Stop to end`);
        }
      });
    });

    // Wire Edit Alarm Button
    document.querySelectorAll('.btn-edit-alarm').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        audio.hapticTap();
        const id = btn.dataset.id;
        const alarm = currentAlarms.find(a => a.id === id);
        if (alarm) openEditAlarmModal(alarm);
      });
    });

    // Wire Delete Alarm Button
    document.querySelectorAll('.btn-delete-alarm').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        audio.hapticWarning();
        const id = btn.dataset.id;
        const alarm = currentAlarms.find(a => a.id === id);
        pendingDeleteAlarmId = id;

        const msgEl = document.getElementById('deleteConfirmMessage');
        if (msgEl) {
          msgEl.textContent = `Are you sure you want to delete "${alarm ? alarm.title : 'this alarm'}"? This will cancel and remove it for all squad members.`;
        }
        openModal(deleteConfirmModal);
      });
    });
  }

  // Wire In-App Delete Modal Confirm & Cancel
  document.getElementById('btnConfirmDelete').addEventListener('click', () => {
    if (!pendingDeleteAlarmId) return;
    audio.hapticWarning();

    const idToDelete = pendingDeleteAlarmId;
    closeModal(deleteConfirmModal);

    // Cancel in Native Android AlarmManager
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.NativeAlarm) {
      window.Capacitor.Plugins.NativeAlarm.cancelAlarm({ id: idToDelete }).catch(() => {});
    }

    // Optimistic UI Removal
    const cardEl = document.querySelector(`.alarm-card[data-alarm-id="${idToDelete}"]`);
    if (cardEl) {
      cardEl.style.transition = 'all 0.25s ease';
      cardEl.style.opacity = '0';
      cardEl.style.transform = 'scale(0.95)';
      setTimeout(() => cardEl.remove(), 250);
    }

    sync.deleteAlarm(idToDelete);
    currentAlarms = currentAlarms.filter(a => a.id !== idToDelete);
    persistAlarmsLocally();
    updateNextAlarmCountdown();
    showToast('🗑️ Alarm deleted successfully');
    pendingDeleteAlarmId = null;
  });

  document.getElementById('btnCancelDelete').addEventListener('click', () => {
    audio.hapticTap();
    closeModal(deleteConfirmModal);
    pendingDeleteAlarmId = null;
  });

  function renderLogs(logs) {
    elActivityFeed.innerHTML = '';
    (logs || []).forEach(log => prependLog(log));
  }

  function prependLog(log) {
    const entry = document.createElement('div');
    entry.className = `history-item ${log.type || 'info'}`;
    const timeStr = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    entry.innerHTML = `
      <span>${log.text}</span>
      <span style="font-size:10px; color:var(--text-tertiary);">${timeStr}</span>
    `;
    elActivityFeed.insertBefore(entry, elActivityFeed.firstChild);
  }

  // ==========================================================
  // 6. EMERGENCY BROADCAST MODAL
  // ==========================================================
  const btnOpenPanicModal = document.getElementById('btnOpenPanicModal');
  const panicBroadcastForm = document.getElementById('panicBroadcastForm');
  const btnAuditionPanic = document.getElementById('btnAuditionPanic');

  btnOpenPanicModal.addEventListener('click', () => {
    audio.hapticTap();
    openModal(panicModal);
  });

  btnAuditionPanic.addEventListener('click', () => {
    audio.hapticTap();
    const sound = document.getElementById('panicSoundSelect').value;
    audio.previewSound(sound);
  });

  panicBroadcastForm.addEventListener('submit', (e) => {
    e.preventDefault();
    audio.hapticWarning();
    const message = document.getElementById('panicMessageInput').value.trim() || 'WAKE UP CALL!';
    const sound = document.getElementById('panicSoundSelect').value;
    sync.triggerInstantAlert('emergency', message, sound);
    closeModal(panicModal);
    showToast('🚨 Alert broadcasted to all connected phones!');
  });

  // ==========================================================
  // 7. CREATE & EDIT ALARM MODAL WITH TARGETING
  // ==========================================================
  const btnCreateAlarm = document.getElementById('btnCreateAlarm');
  const alarmForm = document.getElementById('alarmForm');
  const btnAuditionAlarmSound = document.getElementById('btnAuditionAlarmSound');
  const btnScopeAll = document.getElementById('btnScopeAll');
  const btnScopeSelected = document.getElementById('btnScopeSelected');
  const targetMembersContainer = document.getElementById('targetMembersContainer');
  const targetCheckboxList = document.getElementById('targetCheckboxList');
  let editingAlarmId = null;

  function setScopeMode(scope, preselectedMembers = []) {
    if (scope === 'selected') {
      btnScopeSelected.classList.add('active');
      btnScopeAll.classList.remove('active');
      targetMembersContainer.style.display = 'block';

      const allRoster = [];
      const seen = new Set();
      (currentMembers || []).forEach(m => {
        if (m.name && !seen.has(m.name.toLowerCase())) {
          seen.add(m.name.toLowerCase());
          allRoster.push(m.name);
        }
      });
      (lastDevices || []).forEach(d => {
        if (d.deviceName && !seen.has(d.deviceName.toLowerCase())) {
          seen.add(d.deviceName.toLowerCase());
          allRoster.push(d.deviceName);
        }
      });
      if (allRoster.length === 0) allRoster.push(sync.deviceName);

      targetCheckboxList.innerHTML = '';
      allRoster.forEach(name => {
        const isChecked = preselectedMembers.length === 0 || preselectedMembers.some(p => p.toLowerCase() === name.toLowerCase());
        const item = document.createElement('label');
        item.className = 'target-member-item';
        item.innerHTML = `
          <input type="checkbox" value="${name}" ${isChecked ? 'checked' : ''}>
          <span>📱 ${name}</span>
        `;
        targetCheckboxList.appendChild(item);
      });
    } else {
      btnScopeAll.classList.add('active');
      btnScopeSelected.classList.remove('active');
      targetMembersContainer.style.display = 'none';
    }
  }

  btnScopeAll.addEventListener('click', () => {
    audio.hapticTap();
    setScopeMode('all');
  });

  btnScopeSelected.addEventListener('click', () => {
    audio.hapticTap();
    setScopeMode('selected');
  });

  btnCreateAlarm.addEventListener('click', () => {
    audio.hapticTap();
    editingAlarmId = null;
    document.getElementById('modalAlarmTitleHeader').textContent = 'New Squad Alarm';
    alarmForm.reset();
    document.getElementById('alarmTitleInput').value = '';
    document.getElementById('alarmTimeInput').value = '08:00';
    document.getElementById('alarmSnoozeSelect').value = '10';
    selectedDays = [0, 1, 2, 3, 4, 5, 6];
    updateDayPillsUI();
    setScopeMode('all');
    openModal(alarmModal);
  });

  btnAuditionAlarmSound.addEventListener('click', () => {
    audio.hapticTap();
    const sound = document.getElementById('alarmSoundSelect').value;
    audio.previewSound(sound);
  });

  function openEditAlarmModal(alarm) {
    editingAlarmId = alarm.id;
    document.getElementById('modalAlarmTitleHeader').textContent = 'Edit Squad Alarm';
    document.getElementById('alarmTitleInput').value = alarm.title || '';
    document.getElementById('alarmTimeInput').value = alarm.time || '08:00';
    document.getElementById('alarmSoundSelect').value = alarm.sound || 'nuclear';
    document.getElementById('alarmSnoozeSelect').value = alarm.snoozeDuration !== undefined ? String(alarm.snoozeDuration) : '10';
    document.getElementById('alarmChallengeSelect').value = alarm.challenge || 'none';
    document.getElementById('alarmConsensusSelect').value = alarm.consensusMode || 'any';
    document.getElementById('alarmCrescendoToggle').checked = !!alarm.crescendo;
    document.getElementById('alarmVoiceMemoInput').value = alarm.voiceMemo || '';
    
    if (alarm.repeatMode === 'once' || (Array.isArray(alarm.repeatDays) && alarm.repeatDays.length === 0)) {
      selectedDays = [];
    } else {
      selectedDays = Array.isArray(alarm.repeatDays) ? [...alarm.repeatDays] : [0, 1, 2, 3, 4, 5, 6];
    }
    updateDayPillsUI();

    if (alarm.targetScope === 'selected') {
      setScopeMode('selected', alarm.targetMembers || []);
    } else {
      setScopeMode('all');
    }

    openModal(alarmModal);
  }

  // Day Selector UI
  const dayPills = document.querySelectorAll('.day-chip');
  dayPills.forEach(pill => {
    pill.addEventListener('click', () => {
      audio.hapticTap();
      const day = parseInt(pill.dataset.day, 10);
      if (selectedDays.includes(day)) {
        selectedDays = selectedDays.filter(d => d !== day);
      } else {
        selectedDays.push(day);
      }
      updateDayPillsUI();
    });
  });

  function updateDayPillsUI() {
    const noticeEl = document.getElementById('repeatOnceNotice');
    if (selectedDays.length === 0) {
      if (noticeEl) noticeEl.style.display = 'block';
    } else {
      if (noticeEl) noticeEl.style.display = 'none';
    }

    dayPills.forEach(pill => {
      const day = parseInt(pill.dataset.day, 10);
      if (selectedDays.includes(day)) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });
  }

  document.getElementById('presetOnce')?.addEventListener('click', () => {
    audio.hapticTap();
    selectedDays = [];
    updateDayPillsUI();
  });

  document.getElementById('presetEveryday')?.addEventListener('click', () => {
    audio.hapticTap();
    selectedDays = [0, 1, 2, 3, 4, 5, 6];
    updateDayPillsUI();
  });

  document.getElementById('presetWeekdays')?.addEventListener('click', () => {
    audio.hapticTap();
    selectedDays = [1, 2, 3, 4, 5];
    updateDayPillsUI();
  });

  // Quick Time Chips
  document.querySelectorAll('.time-chip-btn').forEach(chip => {
    chip.addEventListener('click', () => {
      audio.hapticTap();
      const addMinutes = parseInt(chip.dataset.add, 10);
      const timeInput = document.getElementById('alarmTimeInput');
      const [h, m] = timeInput.value.split(':').map(Number);
      const d = new Date();
      d.setHours(h);
      d.setMinutes(m + addMinutes);
      timeInput.value = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    });
  });

  alarmForm.addEventListener('submit', (e) => {
    e.preventDefault();
    audio.hapticTap();

    const isSelectedScope = btnScopeSelected.classList.contains('active');
    const targetScope = isSelectedScope ? 'selected' : 'all';
    let targetMembers = [];

    if (isSelectedScope) {
      targetMembers = Array.from(targetCheckboxList.querySelectorAll('input:checked')).map(cb => cb.value);
      if (targetMembers.length === 0) {
        showToast('⚠️ Please select at least one device');
        return;
      }
    }

    const rawTitle = document.getElementById('alarmTitleInput').value.trim();
    const title = rawTitle || 'Squad Alarm';
    const isOnce = selectedDays.length === 0;
    const snoozeDuration = parseInt(document.getElementById('alarmSnoozeSelect').value, 10);

    const data = {
      title: title,
      time: document.getElementById('alarmTimeInput').value || '08:00',
      sound: document.getElementById('alarmSoundSelect').value || 'nuclear',
      challenge: document.getElementById('alarmChallengeSelect').value || 'none',
      consensusMode: document.getElementById('alarmConsensusSelect').value || 'any',
      targetScope: targetScope,
      targetMembers: targetMembers,
      snoozeDuration: isNaN(snoozeDuration) ? 10 : snoozeDuration,
      repeatMode: isOnce ? 'once' : 'repeat',
      repeatDays: isOnce ? [] : (selectedDays.length > 0 ? selectedDays : [0, 1, 2, 3, 4, 5, 6]),
      crescendo: document.getElementById('alarmCrescendoToggle').checked,
      voiceMemo: document.getElementById('alarmVoiceMemoInput').value.trim()
    };

    if (editingAlarmId) {
      const idx = currentAlarms.findIndex(a => a.id === editingAlarmId);
      if (idx !== -1) {
        currentAlarms[idx] = {
          ...currentAlarms[idx],
          ...data,
          lastModifiedAt: new Date().toISOString()
        };
      }
      persistAlarmsLocally();
      renderAlarms(currentAlarms);
      updateNextAlarmCountdown();

      sync.updateAlarm({ id: editingAlarmId, ...data });
      showToast('✅ Alarm updated & saved!');
    } else {
      const newAlarm = {
        id: 'alarm-' + Date.now(),
        ...data,
        enabled: true,
        status: 'IDLE',
        createdBy: sync.deviceName || 'You',
        createdAt: new Date().toISOString()
      };
      currentAlarms.push(newAlarm);
      persistAlarmsLocally();
      renderAlarms(currentAlarms);
      updateNextAlarmCountdown();

      sync.createAlarm(data);
      showToast('✅ New alarm created & active!');
    }
    closeModal(alarmModal);
  });

  // ==========================================================
  // 8. ADD MANUAL MEMBER MODAL
  // ==========================================================
  const btnOpenAddMemberModal = document.getElementById('btnOpenAddMemberModal');
  const addMemberForm = document.getElementById('addMemberForm');
  const manualMemberNameInput = document.getElementById('manualMemberNameInput');

  if (btnOpenAddMemberModal) {
    btnOpenAddMemberModal.addEventListener('click', () => {
      audio.hapticTap();
      manualMemberNameInput.value = '';
      openModal(addMemberModal);
      setTimeout(() => manualMemberNameInput.focus(), 150);
    });
  }

  if (addMemberForm) {
    addMemberForm.addEventListener('submit', (e) => {
      e.preventDefault();
      audio.hapticTap();
      const name = manualMemberNameInput.value.trim();
      if (name) {
        sync.addManualMember(name);
        closeModal(addMemberModal);
        showToast(`✅ Added "${name}" to squad`);
        manualMemberNameInput.value = '';
      }
    });
  }

  // ==========================================================
  // 9. SQUAD ROOM SWITCH MODAL
  // ==========================================================
  const btnOpenSquadModal = document.getElementById('btnOpenSquadModal');
  const btnSwitchRoom = document.getElementById('btnSwitchRoom');
  const roomForm = document.getElementById('roomForm');
  const roomCodeInput = document.getElementById('roomCodeInput');
  const deviceNameInput = document.getElementById('deviceNameInput');

  function openRoomConfig() {
    audio.hapticTap();
    roomCodeInput.value = sync.roomId;
    deviceNameInput.value = sync.deviceName;
    const hostEl = document.getElementById('serverHostInput');
    if (hostEl) hostEl.value = localStorage.getItem('combine_server_host') || '';
    openModal(roomModal);
  }

  btnOpenSquadModal?.addEventListener('click', openRoomConfig);
  btnSwitchRoom?.addEventListener('click', openRoomConfig);

  roomForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    audio.hapticTap();
    const newRoom = roomCodeInput.value.trim().toUpperCase();
    const newName = deviceNameInput.value.trim();
    const newHost = document.getElementById('serverHostInput')?.value.trim();

    if (newRoom && newName) {
      if (newHost !== undefined) {
        sync.setServerHost(newHost);
      }
      sync.joinRoom(newRoom, newName);
      closeModal(roomModal);
      showToast(`Joined Squad: ${newRoom}`);
    }
  });

  // ==========================================================
  // 10. QR CODE ENGINE & URL SHARING
  // ==========================================================
  const devicesQrUrlDisplay = document.getElementById('devicesQrUrlDisplay');
  const modalQrUrlText = document.getElementById('modalQrUrlText');
  const qrCodeImg = document.getElementById('qrCodeImg');
  const modalQrCodeImg = document.getElementById('modalQrCodeImg');
  const guideQrImg = document.getElementById('guideQrImg');

  function getTargetUrl(target) {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    let baseHost = window.location.host;
    let baseProtocol = window.location.protocol;

    if (isLocalhost) {
      baseHost = 'rca-tested-episode-belkin.trycloudflare.com';
      baseProtocol = 'https:';
    }

    const currentRoom = sync.roomId || 'ALPHA-7';

    if (target === 'direct_apk') {
      return `${baseProtocol}//${baseHost}/EvoAlarm.apk`;
    } else if (target === 'join') {
      return `${baseProtocol}//${baseHost}/?room=${encodeURIComponent(currentRoom)}`;
    } else {
      return `${baseProtocol}//${baseHost}/download?room=${encodeURIComponent(currentRoom)}`;
    }
  }

  function updateQRCodes(target = currentQrTarget) {
    currentQrTarget = target;
    const url = getTargetUrl(target);
    const encodedTargetUrl = encodeURIComponent(url);

    const applyQrImage = (imgEl, extraParams = '') => {
      if (!imgEl) return;
      const primarySrc = `/api/qr?url=${encodedTargetUrl}${extraParams}`;
      const fallbackSrc = `https://api.qrserver.com/v1/create-qr-code/?data=${encodedTargetUrl}&size=240x240&margin=10`;

      imgEl.src = primarySrc;
      imgEl.onerror = () => {
        imgEl.onerror = null;
        imgEl.src = fallbackSrc;
      };
    };

    applyQrImage(qrCodeImg, `&room=${encodeURIComponent(sync.roomId || 'ALPHA-7')}&size=200`);
    applyQrImage(modalQrCodeImg, '&size=260');
    applyQrImage(guideQrImg, '&size=100');

    if (devicesQrUrlDisplay) devicesQrUrlDisplay.textContent = url;
    if (modalQrUrlText) modalQrUrlText.textContent = url;

    document.querySelectorAll('.qr-mode-pill').forEach(pill => {
      if (pill.dataset.target === target) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });
  }

  document.querySelectorAll('.qr-mode-pill').forEach(pill => {
    pill.addEventListener('click', (e) => {
      audio.hapticTap();
      const target = e.currentTarget.dataset.target;
      updateQRCodes(target);
    });
  });

  document.getElementById('btnOpenQRModal')?.addEventListener('click', () => {
    audio.hapticTap();
    updateQRCodes(currentQrTarget);
    openModal(qrModal);
  });

  document.getElementById('btnEnlargeDevicesQR')?.addEventListener('click', () => {
    audio.hapticTap();
    updateQRCodes(currentQrTarget);
    openModal(qrModal);
  });

  document.getElementById('btnEnlargeGuideQR')?.addEventListener('click', () => {
    audio.hapticTap();
    updateQRCodes('download');
    openModal(qrModal);
  });

  document.getElementById('guideQrImg')?.addEventListener('click', () => {
    audio.hapticTap();
    updateQRCodes('download');
    openModal(qrModal);
  });

  document.getElementById('devicesQrBox')?.addEventListener('click', () => {
    audio.hapticTap();
    updateQRCodes(currentQrTarget);
    openModal(qrModal);
  });

  function copyQrUrl() {
    audio.hapticTap();
    const url = getTargetUrl(currentQrTarget);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        showToast('✅ Link copied to clipboard!');
      });
    } else {
      prompt('Copy link:', url);
    }
  }

  document.getElementById('btnCopyInviteLink')?.addEventListener('click', copyQrUrl);
  document.getElementById('btnModalCopyLink')?.addEventListener('click', copyQrUrl);

  // Modal helpers
  const openModal = (m) => m && m.classList.add('active');
  const closeModal = (m) => m && m.classList.remove('active');

  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
      audio.hapticTap();
      const modal = btn.closest('.modal-overlay');
      if (modal) {
        closeModal(modal);
      } else {
        closeModal(alarmModal);
        closeModal(roomModal);
        closeModal(panicModal);
        closeModal(addMemberModal);
        closeModal(deleteConfirmModal);
        closeModal(qrModal);
      }
    });
  });

  function showToast(msg) {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      bottom: calc(env(safe-area-inset-bottom, 12px) + 72px);
      left: 50%;
      transform: translateX(-50%);
      background: rgba(22, 26, 38, 0.96);
      border: 1px solid var(--border-hairline);
      color: #fff;
      padding: 9px 18px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 700;
      z-index: 10000;
      box-shadow: 0 4px 25px rgba(0, 0, 0, 0.8);
      pointer-events: none;
      text-align: center;
      max-width: 85%;
    `;
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2800);
  }

  document.getElementById('offlineSyncBanner')?.addEventListener('click', () => {
    audio.hapticTap();
    openRoomConfig();
  });

  // Initial render
  renderAlarms(currentAlarms);
  updateNextAlarmCountdown();

  // Connect client sync
  sync.connect();
});
