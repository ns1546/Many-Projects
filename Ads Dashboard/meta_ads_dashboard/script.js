/**
 * Enterprise Meta Ads Ecosystem
 * Full Graph API Integration for Account, Campaigns, AdSets, and Ads.
 */

// Global State
const ACCESS_TOKEN = 'EAGOqkMTFOoYBSb1R5sNgcfnpO3Wv2QaTPpe7z6rqxOC4ZA4ZAnqbYPVU0sAzJkxlZAZAjNYT4Y1AyCSBVlZBxVa51oQWlbfcxroWg6VBzHKE46AFH5XiiGDb9ZCi8ffeplVRZB1Q31PdZCJF2quDmMUjcL5hDfOblCAKkkExonuzD11ZAw5BKCNbwMx5Hy52tEyCrpZBSBqGNmjWkZAfFuawnpSXVopY4ZBrizZCYC5LhFI2W';
const BASE_ACCOUNT_ID = 'act_1751640392843894';
let currentAdId = null;
let explorerState = { level: 'root', campaignId: null, campaignName: null };

// --- History Management ---
function pushAppState(isReplace = false) {
    let activeView = 'overview';
    document.querySelectorAll('.view-section').forEach(el => {
        if (el.style.display === 'block') {
            activeView = el.id.replace('view-', '');
        }
    });
    
    const state = {
        view: activeView,
        explorerLevel: explorerState.level,
        explorerCampaignId: explorerState.campaignId,
        explorerCampaignName: explorerState.campaignName,
        universeAdId: currentAdId,
        universeAdName: document.getElementById('universeAdName') ? document.getElementById('universeAdName').textContent : null
    };
    
    if (isReplace) {
        history.replaceState(state, '', '');
    } else {
        history.pushState(state, '', '');
    }
}

window.addEventListener('popstate', (e) => {
    if (e.state) {
        restoreAppState(e.state);
    } else {
        switchView('overview', true);
    }
});

function restoreAppState(state) {
    // Restore View
    if (state.view) {
        document.querySelectorAll('.view-section').forEach(el => el.style.display = 'none');
        const viewEl = document.getElementById(`view-${state.view}`);
        if (viewEl) viewEl.style.display = 'block';
        
        document.querySelectorAll('.nav-menu a').forEach(el => el.classList.remove('active'));
        const navEl = document.getElementById(`nav-${state.view}`);
        if (navEl) navEl.classList.add('active');
    }
    
    // Restore Explorer
    if (state.explorerLevel === 'root') {
        fetchRootCampaigns(true);
    } else if (state.explorerLevel === 'ads') {
        fetchAds(state.explorerCampaignId, state.explorerCampaignName, true);
    }
    
    // Restore Ad Universe
    if (state.view === 'ad-universe') {
        if (state.universeAdId) {
            openAdUniverse(state.universeAdId, state.universeAdName, true);
        } else {
            clearAdSelection(true);
        }
    }
}

// Formatting Utils
const formatCurrency = (num) => parseFloat(num).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
const formatNumber = (num) => parseInt(num).toLocaleString('en-US');
const formatDecimal = (num) => parseFloat(num).toFixed(2);
const formatDate = (ds) => ds ? new Date(ds).toLocaleDateString() : 'Ongoing';
const formatValue = (val, formatType) => {
    if (formatType === 'currency') return formatCurrency(val);
    if (formatType === 'decimal') return formatDecimal(val);
    if (formatType === 'percent') return formatDecimal(val) + '%';
    if (formatType === 'multiplier') return formatDecimal(val) + 'x';
    return formatNumber(Math.floor(val));
};

// Animation Engine
window.isSilentSync = false;

function animateValue(obj, start, end, duration, formatType) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = start + (end - start) * easeOutQuart;
        
        obj.innerHTML = formatValue(current, formatType);
        
        if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
}

function runKpiAnimations(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.querySelectorAll('.animate-num').forEach(el => {
        const endVal = parseFloat(el.getAttribute('data-val') || 0);
        const format = el.getAttribute('data-format');
        
        if (window.isSilentSync) {
            el.innerHTML = formatValue(endVal, format);
        } else {
            animateValue(el, 0, endVal, 1500, format);
        }
    });
}


// Logging
const log = (msg, isError = false) => {
    console.log(`[${isError ? 'ERROR' : 'OK'}] ${msg}`);
};

// View Routing
function switchView(viewId, fromHistory = false) {
    document.querySelectorAll('.view-section').forEach(el => el.style.display = 'none');
    document.getElementById(`view-${viewId}`).style.display = 'block';
    
    document.querySelectorAll('.nav-menu a').forEach(el => el.classList.remove('active'));
    document.getElementById(`nav-${viewId}`).classList.add('active');

    if (viewId === 'ad-universe' && !currentAdId) {
        clearAdSelection(true);
    }
    
    if (!fromHistory) {
        pushAppState();
    }
}

// System Init
async function initializeSystem() {
    log(`Authenticating with Ad Account: ${BASE_ACCOUNT_ID}`);
    showLoader();
    try {
        pushAppState(true);
        await fetchAccountOverview();
        await fetchRootCampaigns(true);
        await fetchBillingInfo();
    } catch (e) {
        log(e.message, true);
    }
    hideLoader();
}

function showLoader() {
    document.getElementById('globalLoader').classList.add('active');
}

function hideLoader() {
    setTimeout(() => {
        document.getElementById('globalLoader').classList.remove('active');
    }, 500); // small delay to ensure smooth UI transition
}

async function refreshAllData() {
    const icon = document.getElementById('refreshIcon');
    icon.classList.add('fa-spin');
    
    await initializeSystem();
    
    // Also re-fetch ad universe if we are in it
    if (currentAdId && document.getElementById('view-ad-universe').style.display === 'block') {
        await fetchAdUniverseData();
    }
    
    icon.classList.remove('fa-spin');
}

document.addEventListener('DOMContentLoaded', initializeSystem);

// Realtime API Sync Loop
setInterval(async () => {
    log("Executing Real-Time API Sync...");
    window.isSilentSync = true;
    try {
        const overviewActive = document.getElementById('view-overview').style.display !== 'none';
        const campaignsActive = document.getElementById('view-campaigns').style.display !== 'none';
        const adUniverseActive = document.getElementById('view-ad-universe').style.display !== 'none';
        
        if (overviewActive) await fetchAccountOverview();
        if (campaignsActive) {
            if (explorerState.level === 'root') await fetchRootCampaigns(true);
            else if (explorerState.level === 'ads') await fetchAds(explorerState.campaignId, explorerState.campaignName, true);
        }
        if (adUniverseActive && currentAdId) await fetchAdUniverseData();
    } catch(e) {
        log("Real-Time Sync Error: " + e.message, true);
    }
    window.isSilentSync = false;
}, 15000); // 15 seconds

// ----------------------------------------------------
// 1. ACCOUNT OVERVIEW
// ----------------------------------------------------
async function fetchAccountOverview() {
    log("Fetching Account Overview KPIs...");
    // Request deep KPI fields
    const url = `https://graph.facebook.com/v19.0/${BASE_ACCOUNT_ID}/insights?date_preset=last_30d&fields=spend,impressions,reach,clicks,cpc,cpm,ctr,actions,cost_per_action_type,purchase_roas&access_token=${ACCESS_TOKEN}`;
    
    const res = await fetch(url);
    const data = await res.json();
    
    if (data.error) throw new Error(`Overview API Error: ${data.error.message}`);
    
    renderAccountKpis(data.data[0]);
    
    // Render Chart
    renderChart(data.data[0] || {});
}

// ----------------------------------------------------
// 1.1 AI & CHART ADDITIONS
// ----------------------------------------------------


function renderChart(insights) {
    document.getElementById('chartContainer').style.display = 'block';
    const ctx = document.getElementById('performanceChart').getContext('2d');
    
    if (window.perfChart) {
        window.perfChart.destroy();
    }
    
    window.perfChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Spend', 'Impressions (scaled)', 'Reach (scaled)', 'Clicks'],
            datasets: [{
                label: 'Performance Metrics',
                data: [
                    insights.spend || 0,
                    (insights.impressions || 0) / 100, // scaled for visibility against spend
                    (insights.reach || 0) / 100,
                    insights.clicks || 0
                ],
                backgroundColor: [
                    'rgba(79, 70, 229, 0.7)',
                    'rgba(16, 185, 129, 0.7)',
                    'rgba(59, 130, 246, 0.7)',
                    'rgba(245, 158, 11, 0.7)'
                ],
                borderColor: [
                    'rgba(79, 70, 229, 1)',
                    'rgba(16, 185, 129, 1)',
                    'rgba(59, 130, 246, 1)',
                    'rgba(245, 158, 11, 1)'
                ],
                borderWidth: 1,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                title: {
                    display: true,
                    text: 'Key Metrics Comparison (Impressions & Reach scaled /100)',
                    font: { family: 'Inter', size: 14 }
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function renderAccountKpis(insights) {
    const container = document.getElementById('accountKpis');
    if (!insights) {
        container.innerHTML = `<div style="grid-column: 1 / -1; text-align:center;">No activity in the last 30 days.</div>`;
        return;
    }

    // Extract Purchases
    let purchases = 0;
    if (insights.actions) {
        const pAction = insights.actions.find(a => a.action_type === 'purchase');
        if (pAction) purchases = pAction.value;
    }

    // Extract ROAS
    let roas = "0.00";
    if (insights.purchase_roas) {
        const roasObj = insights.purchase_roas.find(r => r.action_type === 'purchase');
        if (roasObj) roas = roasObj.value;
    }

    const cards = [
        { icon: 'fa-money-bill', label: 'Total Ad Spend', tip: 'Total money spent on ads so far', val: insights.spend || 0, format: 'currency' },
        { icon: 'fa-eye', label: 'Ad Views (Impressions)', tip: 'Total times your ads were shown to people', val: insights.impressions || 0, format: 'number' },
        { icon: 'fa-users', label: 'Unique People Reached', tip: 'Number of unique individuals who saw your ads', val: insights.reach || 0, format: 'number' },
        { icon: 'fa-mouse', label: 'Total Clicks', tip: 'Number of times people clicked on your ads', val: insights.clicks || 0, format: 'number' },
        { icon: 'fa-bullseye', label: 'Cost Per 1k Views (CPM)', tip: 'How much it costs to show ads to 1,000 people', val: insights.cpm || 0, format: 'currency' },
        { icon: 'fa-percent', label: 'Click Rate (CTR)', tip: 'Percentage of viewers who actually clicked', val: insights.ctr || 0, format: 'percent' },
        { icon: 'fa-cart-shopping', label: 'Total Purchases', tip: 'Number of items successfully bought', val: purchases, format: 'number' },
        { icon: 'fa-arrow-trend-up', label: 'Return on Spend (ROAS)', tip: 'Revenue generated for every $1 you spent', val: roas, format: 'multiplier' }
    ];

    container.innerHTML = cards.map(c => `
        <div class="kpi-card" title="${c.tip}" style="cursor: help; ${window.isSilentSync ? '' : `animation: slideUpFade 0.5s ease backwards; animation-delay: ${Math.random() * 0.2}s;`}">
            <div class="kpi-icon"><i class="fa-solid ${c.icon}"></i></div>
            <div>
                <p style="font-size:12px; color:var(--text-muted); font-weight:700;">
                    ${c.label.toUpperCase()} <i class="fa-regular fa-circle-question" style="font-size:10px; opacity:0.6;"></i>
                </p>
                <h2 class="animate-num" data-val="${c.val}" data-format="${c.format}" style="font-size:24px; font-weight:700;">0</h2>
            </div>
        </div>
    `).join('');
    
    runKpiAnimations('accountKpis');
}

// ----------------------------------------------------
// 2. EXPLORER (Campaign -> AdSet -> Ad)
// ----------------------------------------------------
function navigateExplorerBack() {
    if (explorerState.level === 'ads') {
        fetchRootCampaigns();
    }
}

async function fetchRootCampaigns(fromHistory = false) {
    log("Fetching Root Campaigns...");
    explorerState = { level: 'root', campaignId: null, campaignName: null, adSetId: null, adSetName: null };
    document.getElementById('explorerBackBtn').style.display = 'none';
    
    document.getElementById('explorerBreadcrumb').innerHTML = `Root / Campaigns`;
    document.getElementById('explorerHeaders').innerHTML = `
        <th>Campaign Name</th>
        <th>Status</th>
        <th>Start / Stop</th>
        <th>Spend</th>
        <th>Objective</th>
        <th>Action</th>
    `;
    
    if (!fromHistory) pushAppState();
    
    const url = `https://graph.facebook.com/v19.0/${BASE_ACCOUNT_ID}/campaigns?fields=name,status,objective,start_time,stop_time,insights.date_preset(last_30d){spend}&limit=50&access_token=${ACCESS_TOKEN}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.error) throw new Error(`Campaigns API Error: ${data.error.message}`);
    
    const tbody = document.getElementById('explorerBody');
    tbody.innerHTML = '';
    
    data.data.forEach(camp => {
        const spend = camp.insights && camp.insights.data.length ? camp.insights.data[0].spend : 0;
        
        let health = 'Paused ⏸️';
        let badgeColor = 'neutral';
        if (camp.status === 'ACTIVE') {
            health = spend > 0 ? 'Active & Running 🚀' : 'Learning Phase ⏳';
            badgeColor = 'success';
        }

        tbody.innerHTML += `
            <tr>
                <td><strong>${camp.name}</strong><br><small style="color:#718096">${camp.id}</small></td>
                <td><span class="badge ${badgeColor}">${health}</span></td>
                <td><span style="font-size:12px; color:var(--text-muted);">Start: ${formatDate(camp.start_time)}<br>Stop: ${formatDate(camp.stop_time)}</span></td>
                <td>${formatCurrency(spend)}</td>
                <td>${camp.objective || 'N/A'}</td>
                <td><span class="action-link" onclick="fetchAds('${camp.id}', '${camp.name.replace(/'/g, "\\'")}')">View Ads <i class="fa-solid fa-arrow-right"></i></span></td>
            </tr>
        `;
    });
}

async function fetchAds(campaignId, campaignName, fromHistory = false) {
    log(`Fetching Ads for Campaign: ${campaignId}`);
    
    explorerState.level = 'ads';
    explorerState.campaignId = campaignId;
    explorerState.campaignName = campaignName;
    document.getElementById('explorerBackBtn').style.display = 'inline-flex';
    
    document.getElementById('explorerBreadcrumb').innerHTML = `<span class="action-link" onclick="fetchRootCampaigns()">Root</span> / ${campaignName} / Ads`;
    document.getElementById('explorerHeaders').innerHTML = `
        <th>Preview</th>
        <th>Ad Name</th>
        <th>Status</th>
        <th>Results</th>
        <th>Reach</th>
        <th>Impressions</th>
        <th>Spend (30d)</th>
        <th>Action</th>
    `;
    const tbody = document.getElementById('explorerBody');
    tbody.innerHTML = '<tr><td colspan="8">Loading...</td></tr>';
    
    if (!fromHistory) pushAppState();
    
    const url = `https://graph.facebook.com/v19.0/${campaignId}/ads?fields=name,status,creative{thumbnail_url},insights.date_preset(last_30d){spend,reach,impressions,actions,cost_per_action_type}&access_token=${ACCESS_TOKEN}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.error) {
        log(`Ads API Error: ${data.error.message}`, true);
        return;
    }
    
    tbody.innerHTML = '';
    data.data.forEach(ad => {
        const thumb = (ad.creative && ad.creative.thumbnail_url) ? `<img src="${ad.creative.thumbnail_url}" style="height:40px; border-radius:4px;">` : '<div style="height:40px; width:40px; background:rgba(0,0,0,0.1); border-radius:4px; display:flex; align-items:center; justify-content:center;"><i class="fa-solid fa-image"></i></div>';
        
        let health = 'Paused ⏸️';
        let badgeColor = 'neutral';
        if (ad.status === 'ACTIVE') {
            health = 'Active 🚀';
            badgeColor = 'success';
        }

        let spend = 0, reach = 0, impressions = 0;
        let resultsText = "--";
        
        if (ad.insights && ad.insights.data && ad.insights.data.length > 0) {
            const ins = ad.insights.data[0];
            spend = ins.spend || 0;
            reach = ins.reach || 0;
            impressions = ins.impressions || 0;

            let purchases = 0, messages = 0, leads = 0;
            if (ins.actions) {
                ins.actions.forEach(a => {
                    if (a.action_type === 'purchase') purchases = parseInt(a.value);
                    if (a.action_type === 'lead') leads = parseInt(a.value);
                    if (a.action_type.includes('message')) messages += parseInt(a.value);
                });
            }
            
            let resArray = [];
            if (purchases > 0) resArray.push(`<span style="color:var(--success);"><b>${purchases}</b> Purchases</span>`);
            if (messages > 0) resArray.push(`<span style="color:var(--primary);"><b>${messages}</b> Messages</span>`);
            if (leads > 0) resArray.push(`<span style="color:#F59E0B;"><b>${leads}</b> Leads</span>`);
            
            if(resArray.length > 0) {
                resultsText = resArray.join('<br>');
            } else if (ins.actions && ins.actions.length > 0) {
                const importantAction = ins.actions.find(a => !['link_click', 'post_engagement', 'page_engagement', 'onsite_conversion.post_engagement'].includes(a.action_type));
                if(importantAction) resultsText = `<b>${importantAction.value}</b> ${importantAction.action_type.replace(/_/g, ' ')}`;
            }
        }

        tbody.innerHTML += `
            <tr>
                <td>${thumb}</td>
                <td><strong>${ad.name}</strong></td>
                <td><span class="badge ${badgeColor}">${health}</span></td>
                <td style="font-size:13px;">${resultsText}</td>
                <td>${formatNumber(reach)}</td>
                <td>${formatNumber(impressions)}</td>
                <td>${formatCurrency(spend)}</td>
                <td><span class="action-link" style="color:var(--primary); font-weight:700;" onclick="openAdUniverse('${ad.id}', '${ad.name.replace(/'/g, "\\'")}')"><i class="fa-solid fa-meteor"></i> View Analytics</span></td>
            </tr>
        `;
    });
}

function filterExplorer() {
    const input = document.getElementById('campaignSearch');
    const filter = input.value.toLowerCase();
    const tbody = document.getElementById('explorerBody');
    const tr = tbody.getElementsByTagName('tr');

    for (let i = 0; i < tr.length; i++) {
        const td = tr[i].getElementsByTagName('td')[0];
        if (td) {
            const txtValue = td.textContent || td.innerText;
            if (txtValue.toLowerCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
}

// ----------------------------------------------------
// 3. AD UNIVERSE (Deep Specific Details)
// ----------------------------------------------------
function clearAdSelection(fromHistory = false) {
    currentAdId = null;
    document.getElementById('universeAdName').textContent = 'Ad Analytics Interface';
    document.getElementById('universeAdId').textContent = 'Overview of all your ads.';
    document.getElementById('universeContent').style.display = 'none';
    document.getElementById('universeEmpty').style.display = 'block';
    document.getElementById('syncAdDataBtn').style.display = 'none';
    
    if (!fromHistory) pushAppState();
    
    fetchAllAccountAds();
}

async function fetchAllAccountAds() {
    log("Fetching all ads for the account...");
    const emptyContainer = document.getElementById('universeEmpty');
    emptyContainer.innerHTML = `<div style="padding: 100px; text-align: center; color: #718096;">
        <i class="fa-solid fa-spinner fa-spin" style="font-size: 48px; margin-bottom: 16px;"></i>
        <h2>Loading All Ads...</h2>
    </div>`;

    try {
        const url = `https://graph.facebook.com/v19.0/${BASE_ACCOUNT_ID}/ads?fields=name,status,creative{thumbnail_url},campaign{name},insights.date_preset(last_30d){spend,reach,impressions,actions,cost_per_action_type}&limit=100&access_token=${ACCESS_TOKEN}`;
        const res = await fetch(url);
        const data = await res.json();
        
        if (data.error) throw new Error(data.error.message);

        if (!data.data || data.data.length === 0) {
            emptyContainer.innerHTML = `<div style="padding: 100px; text-align: center; color: #718096;">
                <i class="fa-solid fa-ghost" style="font-size: 64px; margin-bottom: 24px; opacity: 0.2;"></i>
                <h2>No Ads Found</h2>
                <p>There are no ads in this account.</p>
            </div>`;
            return;
        }

        let html = `
            <div class="table-wrapper clay-panel-inset">
                <table style="width: 100%;">
                    <thead>
                        <tr>
                            <th>Preview</th>
                            <th>Ad Name</th>
                            <th>Campaign</th>
                            <th>Status</th>
                            <th>Results</th>
                            <th>Reach</th>
                            <th>Impressions</th>
                            <th>Spend (30d)</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        data.data.forEach(ad => {
            const thumb = (ad.creative && ad.creative.thumbnail_url) ? `<img src="${ad.creative.thumbnail_url}" style="height:40px; border-radius:4px;">` : '<div style="height:40px; width:40px; background:rgba(0,0,0,0.1); border-radius:4px; display:flex; align-items:center; justify-content:center;"><i class="fa-solid fa-image"></i></div>';
            
            let health = 'Paused ⏸️';
            let badgeColor = 'neutral';
            if (ad.status === 'ACTIVE') {
                health = 'Active 🚀';
                badgeColor = 'success';
            }
            
            let spend = 0, reach = 0, impressions = 0;
            let resultsText = "--";
            
            if (ad.insights && ad.insights.data && ad.insights.data.length > 0) {
                const ins = ad.insights.data[0];
                spend = ins.spend || 0;
                reach = ins.reach || 0;
                impressions = ins.impressions || 0;

                let purchases = 0, messages = 0, leads = 0;
                if (ins.actions) {
                    ins.actions.forEach(a => {
                        if (a.action_type === 'purchase') purchases = parseInt(a.value);
                        if (a.action_type === 'lead') leads = parseInt(a.value);
                        if (a.action_type.includes('message')) messages += parseInt(a.value);
                    });
                }
                
                let resArray = [];
                if (purchases > 0) resArray.push(`<span style="color:var(--success);"><b>${purchases}</b> Purchases</span>`);
                if (messages > 0) resArray.push(`<span style="color:var(--primary);"><b>${messages}</b> Messages</span>`);
                if (leads > 0) resArray.push(`<span style="color:#F59E0B;"><b>${leads}</b> Leads</span>`);
                
                if(resArray.length > 0) {
                    resultsText = resArray.join('<br>');
                } else if (ins.actions && ins.actions.length > 0) {
                    const importantAction = ins.actions.find(a => !['link_click', 'post_engagement', 'page_engagement', 'onsite_conversion.post_engagement'].includes(a.action_type));
                    if(importantAction) resultsText = `<b>${importantAction.value}</b> ${importantAction.action_type.replace(/_/g, ' ')}`;
                }
            }

            html += `
                <tr>
                    <td>${thumb}</td>
                    <td><strong>${ad.name}</strong></td>
                    <td>${ad.campaign ? ad.campaign.name : 'N/A'}</td>
                    <td><span class="badge ${badgeColor}">${health}</span></td>
                    <td style="font-size:13px;">${resultsText}</td>
                    <td>${formatNumber(reach)}</td>
                    <td>${formatNumber(impressions)}</td>
                    <td>${formatCurrency(spend)}</td>
                    <td><button class="clay-btn" onclick="openAdUniverse('${ad.id}', '${ad.name.replace(/'/g, "\\'")}')">View Details</button></td>
                </tr>
            `;
        });

        html += `</tbody></table></div>`;
        emptyContainer.innerHTML = html;

    } catch (e) {
        emptyContainer.innerHTML = `<div style="padding: 100px; text-align: center; color: #EF4444;">
            <i class="fa-solid fa-triangle-exclamation" style="font-size: 64px; margin-bottom: 24px; opacity: 0.5;"></i>
            <h2>Error Loading Ads</h2>
            <p>${e.message}</p>
        </div>`;
    }
}

function openAdUniverse(adId, adName, fromHistory = false) {
    currentAdId = adId;
    document.getElementById('universeAdName').textContent = adName;
    document.getElementById('universeAdId').textContent = `Ad ID: ${adId}`;
    
    document.getElementById('universeEmpty').style.display = 'none';
    document.getElementById('universeContent').style.display = 'block';
    
    const syncBtn = document.getElementById('syncAdDataBtn');
    if (syncBtn) syncBtn.style.display = 'inline-flex';
    
    switchView('ad-universe', true);
    
    if (!fromHistory) pushAppState();
    
    // Show local ad sync animation
    const icon = syncBtn.querySelector('i');
    if (icon) icon.classList.add('fa-spin');
    
    fetchAdUniverseData().then(() => {
        if (icon) icon.classList.remove('fa-spin');
    });
}

async function fetchAdUniverseData() {
    if (!currentAdId) return;
    log(`Entering Ad Universe for Ad: ${currentAdId}`);
    
    // Request an extremely detailed list of fields for this specific Ad
    const url = `https://graph.facebook.com/v19.0/${currentAdId}?fields=name,status,creative{thumbnail_url,title,body,image_url},insights.date_preset(last_30d){spend,reach,impressions,cpc,cpm,ctr,frequency,outbound_clicks,quality_ranking,engagement_rate_ranking,conversion_rate_ranking,actions,cost_per_action_type,purchase_roas}&access_token=${ACCESS_TOKEN}`;
    
    try {
        const res = await fetch(url);
        const data = await res.json();
        
        if (data.error) throw new Error(data.error.message);
        
        // Populate Creative
        if (data.creative) {
            const imgUrl = data.creative.image_url || data.creative.thumbnail_url;
            if (imgUrl) {
                document.getElementById('uniImage').src = imgUrl;
                document.getElementById('uniImage').style.display = 'block';
                document.getElementById('uniNoImage').style.display = 'none';
            }
            document.getElementById('uniTitle').textContent = data.creative.title || 'No Title';
            document.getElementById('uniBody').textContent = data.creative.body || 'No Body Copy';
        }
        
        // Populate Insights
        const uniKpis = document.getElementById('uniKpis');
        if (data.insights && data.insights.data.length > 0) {
            const ins = data.insights.data[0];
            
            let purchases = 0, costPerPurchase = 0;
            let messages = 0, costPerMessage = 0;
            let leads = 0, costPerLead = 0;
            let roas = 0;

            if (ins.actions) {
                ins.actions.forEach(a => {
                    if (a.action_type === 'purchase') purchases = parseInt(a.value);
                    if (a.action_type === 'lead') leads = parseInt(a.value);
                    if (a.action_type.includes('message')) messages += parseInt(a.value);
                });
            }
            if (ins.cost_per_action_type) {
                ins.cost_per_action_type.forEach(a => {
                    if (a.action_type === 'purchase') costPerPurchase = parseFloat(a.value);
                    if (a.action_type === 'lead') costPerLead = parseFloat(a.value);
                    if (a.action_type.includes('message')) costPerMessage = parseFloat(a.value);
                });
            }
            if (ins.purchase_roas) {
                ins.purchase_roas.forEach(a => {
                    if (a.action_type === 'purchase') roas = parseFloat(a.value);
                });
            }

            let resultHtml = `
                <div class="kpi-card" style="padding:16px; flex-direction: column; align-items: flex-start; gap: 8px; animation: slideUpFade 0.5s ease backwards; animation-delay: 0.1s;">
                    <div style="display:flex; align-items:center; gap:8px;"><i class="fa-solid fa-money-bill-wave" style="color:var(--primary);"></i> <p style="font-size:11px; color:var(--text-muted); font-weight:700; margin:0;">AD SPEND</p></div>
                    <h3 class="animate-num" data-val="${ins.spend||0}" data-format="currency" style="font-size:20px; font-weight:700;">0</h3>
                </div>
                <div class="kpi-card" style="padding:16px; flex-direction: column; align-items: flex-start; gap: 8px; animation: slideUpFade 0.5s ease backwards; animation-delay: 0.2s;">
                    <div style="display:flex; align-items:center; gap:8px;"><i class="fa-solid fa-eye" style="color:var(--primary);"></i> <p style="font-size:11px; color:var(--text-muted); font-weight:700; margin:0;">IMPRESSIONS</p></div>
                    <h3 class="animate-num" data-val="${ins.impressions||0}" data-format="number" style="font-size:20px; font-weight:700;">0</h3>
                </div>
                <div class="kpi-card" style="padding:16px; flex-direction: column; align-items: flex-start; gap: 8px; animation: slideUpFade 0.5s ease backwards; animation-delay: 0.3s;">
                    <div style="display:flex; align-items:center; gap:8px;"><i class="fa-solid fa-bullseye" style="color:var(--primary);"></i> <p style="font-size:11px; color:var(--text-muted); font-weight:700; margin:0;">CPM (Cost / 1k Imp)</p></div>
                    <h3 class="animate-num" data-val="${ins.cpm||0}" data-format="currency" style="font-size:20px; font-weight:700;">0</h3>
                </div>
                <div class="kpi-card" style="padding:16px; flex-direction: column; align-items: flex-start; gap: 8px; animation: slideUpFade 0.5s ease backwards; animation-delay: 0.4s;">
                    <div style="display:flex; align-items:center; gap:8px;"><i class="fa-solid fa-percent" style="color:var(--primary);"></i> <p style="font-size:11px; color:var(--text-muted); font-weight:700; margin:0;">AD CTR</p></div>
                    <h3 class="animate-num" data-val="${ins.ctr||0}" data-format="percent" style="font-size:20px; font-weight:700;">0</h3>
                </div>
            `;
            
            if (messages > 0) {
                resultHtml += `
                <div class="kpi-card" style="padding:16px; border: 1px solid var(--primary); flex-direction: column; align-items: flex-start; gap: 8px; background: rgba(79, 70, 229, 0.1); animation: slideUpFade 0.5s ease backwards; animation-delay: 0.5s;">
                    <div style="display:flex; align-items:center; gap:8px;"><i class="fa-regular fa-comment-dots" style="color:var(--primary);"></i> <p style="font-size:11px; color:var(--primary); font-weight:700; margin:0;">MESSAGES</p></div>
                    <h3 class="animate-num" data-val="${messages}" data-format="number" style="font-size:24px; color:var(--primary); font-weight:800;">0</h3>
                </div>
                <div class="kpi-card" style="padding:16px; flex-direction: column; align-items: flex-start; gap: 8px; animation: slideUpFade 0.5s ease backwards; animation-delay: 0.6s;">
                    <div style="display:flex; align-items:center; gap:8px;"><i class="fa-solid fa-hand-holding-dollar" style="color:var(--text-muted);"></i> <p style="font-size:11px; color:var(--text-muted); font-weight:700; margin:0;">COST / MSG</p></div>
                    <h3 class="animate-num" data-val="${costPerMessage}" data-format="currency" style="font-size:20px; font-weight:700;">0</h3>
                </div>
                `;
            }

            if (purchases > 0) {
                resultHtml += `
                <div class="kpi-card" style="padding:16px; border: 1px solid var(--success); flex-direction: column; align-items: flex-start; gap: 8px; background: rgba(16, 185, 129, 0.1); animation: slideUpFade 0.5s ease backwards; animation-delay: 0.5s;">
                    <div style="display:flex; align-items:center; gap:8px;"><i class="fa-solid fa-cart-shopping" style="color:var(--success);"></i> <p style="font-size:11px; color:var(--success); font-weight:700; margin:0;">PURCHASES</p></div>
                    <h3 class="animate-num" data-val="${purchases}" data-format="number" style="font-size:24px; color:var(--success); font-weight:800;">0</h3>
                </div>
                <div class="kpi-card" style="padding:16px; flex-direction: column; align-items: flex-start; gap: 8px; animation: slideUpFade 0.5s ease backwards; animation-delay: 0.6s;">
                    <div style="display:flex; align-items:center; gap:8px;"><i class="fa-solid fa-arrow-trend-up" style="color:var(--text-muted);"></i> <p style="font-size:11px; color:var(--text-muted); font-weight:700; margin:0;">ROAS</p></div>
                    <h3 class="animate-num" data-val="${roas}" data-format="multiplier" style="font-size:20px; font-weight:700;">0</h3>
                </div>
                `;
            }

            if (leads > 0) {
                resultHtml += `
                <div class="kpi-card" style="padding:16px; border: 1px solid #F59E0B; flex-direction: column; align-items: flex-start; gap: 8px; background: rgba(245, 158, 11, 0.1); animation: slideUpFade 0.5s ease backwards; animation-delay: 0.5s;">
                    <div style="display:flex; align-items:center; gap:8px;"><i class="fa-solid fa-user-plus" style="color:#F59E0B;"></i> <p style="font-size:11px; color:#F59E0B; font-weight:700; margin:0;">LEADS</p></div>
                    <h3 class="animate-num" data-val="${leads}" data-format="number" style="font-size:24px; color:#F59E0B; font-weight:800;">0</h3>
                </div>
                <div class="kpi-card" style="padding:16px; flex-direction: column; align-items: flex-start; gap: 8px; animation: slideUpFade 0.5s ease backwards; animation-delay: 0.6s;">
                    <div style="display:flex; align-items:center; gap:8px;"><i class="fa-solid fa-hand-holding-dollar" style="color:var(--text-muted);"></i> <p style="font-size:11px; color:var(--text-muted); font-weight:700; margin:0;">COST / LEAD</p></div>
                    <h3 class="animate-num" data-val="${costPerLead}" data-format="currency" style="font-size:20px; font-weight:700;">0</h3>
                </div>
                `;
            }
            if (window.isSilentSync) {
                resultHtml = resultHtml.replace(/animation: slideUpFade 0.5s ease backwards;/g, '');
            }
            uniKpis.innerHTML = resultHtml;
            runKpiAnimations('uniKpis');
            
            // Ad Level Chart
            document.getElementById('adChartContainer').style.display = 'block';
            const ctx = document.getElementById('adUniverseChart').getContext('2d');
            if (window.adChart) window.adChart.destroy();
            
            window.adChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Spend', 'Impressions (/100)', 'Reach (/100)', 'Clicks'],
                    datasets: [{
                        label: 'Ad Specific Performance',
                        data: [
                            ins.spend || 0,
                            (ins.impressions || 0) / 100,
                            (ins.reach || 0) / 100,
                            ins.clicks || (ins.outbound_clicks?ins.outbound_clicks[0].value:0) || 0
                        ],
                        backgroundColor: ['rgba(79, 70, 229, 0.7)', 'rgba(16, 185, 129, 0.7)', 'rgba(59, 130, 246, 0.7)', 'rgba(245, 158, 11, 0.7)'],
                        borderColor: ['rgba(79, 70, 229, 1)', 'rgba(16, 185, 129, 1)', 'rgba(59, 130, 246, 1)', 'rgba(245, 158, 11, 1)'],
                        borderWidth: 1,
                        borderRadius: 8
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true } }
                }
            });
            
        } else {
            uniKpis.innerHTML = `<div style="grid-column: 1/-1;">No insight data available for this specific ad in the last 30 days.</div>`;
            document.getElementById('adChartContainer').style.display = 'none';
        }
        
        log(`Ad Universe Sync Complete for ${currentAdId}`);
    } catch(e) {
        log(`Universe Sync Error: ${e.message}`, true);
    }
}

// ----------------------------------------------------
// 4. BILLING & LIMITS
// ----------------------------------------------------
async function fetchBillingInfo() {
    log("Fetching Billing Info...");
    const url = `https://graph.facebook.com/v19.0/${BASE_ACCOUNT_ID}?fields=balance,currency,spend_cap,amount_spent,account_status,is_prepay_account&access_token=${ACCESS_TOKEN}`;
    
    const res = await fetch(url);
    const data = await res.json();
    if (data.error) {
        log(`Billing API Error: ${data.error.message}`, true);
        return;
    }
    
    const container = document.getElementById('billingContent');
    const bal = formatCurrency(data.balance ? data.balance/100 : 0);
    const cap = data.spend_cap > 0 ? formatCurrency(data.spend_cap/100) : 'No Limit';
    
    container.innerHTML = `
        <h2 style="margin-bottom: 24px; color: var(--primary);">Financial Status</h2>
        <table style="width:100%; max-width: 600px;">
            <tr><td style="padding:12px; border-bottom:1px solid #ddd;"><strong>Account Balance / Due</strong></td><td style="padding:12px; border-bottom:1px solid #ddd; font-weight:700; color:var(--error);">${bal}</td></tr>
            <tr><td style="padding:12px; border-bottom:1px solid #ddd;"><strong>Lifetime Amount Spent</strong></td><td style="padding:12px; border-bottom:1px solid #ddd; font-weight:700;">${formatCurrency(data.amount_spent ? data.amount_spent/100 : 0)}</td></tr>
            <tr><td style="padding:12px; border-bottom:1px solid #ddd;"><strong>Account Spend Cap</strong></td><td style="padding:12px; border-bottom:1px solid #ddd;">${cap}</td></tr>
            <tr><td style="padding:12px; border-bottom:1px solid #ddd;"><strong>Currency</strong></td><td style="padding:12px; border-bottom:1px solid #ddd;">${data.currency || 'USD'}</td></tr>
        </table>
    `;
}
