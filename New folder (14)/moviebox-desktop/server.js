import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import { Readable } from 'stream';

const dashCookies = new Map();

const app = express();
app.use(cors());
app.use(express.json());

const HOST_POOL = [
    "https://api6.aoneroom.com",
    "https://api5.aoneroom.com",
    "https://api4.aoneroom.com",
    "https://api4sg.aoneroom.com",
    "https://api3.aoneroom.com",
    "https://api6sg.aoneroom.com",
    "https://api.inmoviebox.com",
];

let activeHostIndex = 0;
let currentToken = null;

const DEFAULT_SECRET_BYTES = Buffer.from([0xef, 0xa8, 0x91, 0x97, 0x4e, 0xec, 0xd3, 0x14, 0x8d, 0xf6, 0x3a, 0xa6, 0x11, 0x60, 0x2d, 0xef, 0xd1, 0x01, 0x25, 0x9b, 0xa5, 0x21, 0x02, 0x2c, 0x57, 0xae, 0x05, 0x66, 0xbd, 0x8e]);

function md5Hex(data) {
    return crypto.createHash('md5').update(data).digest('hex');
}

function generateXClientToken(ts) {
    const tsStr = ts.toString();
    const reversedTs = tsStr.split('').reverse().join('');
    const hashVal = md5Hex(reversedTs);
    return `${tsStr},${hashVal}`;
}

function sortedQueryString(urlStr) {
    try {
        const url = new URL(urlStr);
        const params = new URLSearchParams(url.search);
        const keys = Array.from(params.keys()).sort();
        if (keys.length === 0) return '';
        
        const parts = [];
        for (const key of keys) {
            const values = params.getAll(key);
            for (const val of values) {
                parts.push(`${key}=${val}`);
            }
        }
        return parts.join('&');
    } catch {
        return '';
    }
}

function buildCanonicalString(method, accept, contentType, urlStr, body, timestampMs) {
    let canonicalUrl = urlStr;
    try {
        const url = new URL(urlStr);
        const query = sortedQueryString(urlStr);
        canonicalUrl = query === '' ? url.pathname : `${url.pathname}?${query}`;
    } catch {}

    let bodyHash = '';
    let bodyLength = '';
    if (body) {
        const bytes = Buffer.from(body);
        bodyLength = bytes.length.toString();
        const truncated = bytes.length > 102400 ? bytes.slice(0, 102400) : bytes;
        bodyHash = md5Hex(truncated);
    }

    return `${method.toUpperCase()}\n${accept || ''}\n${contentType || ''}\n${bodyLength}\n${timestampMs}\n${bodyHash}\n${canonicalUrl}`;
}

function generateXTrSignature(method, accept, contentType, urlStr, body, timestampMs) {
    const canonical = buildCanonicalString(method, accept, contentType, urlStr, body, timestampMs);
    const mac = crypto.createHmac('md5', DEFAULT_SECRET_BYTES);
    mac.update(canonical);
    const sigB64 = mac.digest('base64');
    return `${timestampMs}|2|${sigB64}`;
}

function randomHex(len) {
    let res = '';
    for (let i = 0; i < len; i++) {
        res += Math.floor(Math.random() * 16).toString(16);
    }
    return res;
}

function randomUuid() {
    return `${randomHex(8)}-${randomHex(4)}-${randomHex(4)}-${randomHex(4)}-${randomHex(12)}`;
}

function randomSpoofedIp() {
    const prefixes = ["103.241", "49.36", "117.195", "106.198", "122.162", "157.32", "182.70", "103.58", "27.60", "59.90"];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const c = Math.floor(Math.random() * 253) + 1;
    const d = Math.floor(Math.random() * 253) + 1;
    return `${prefix}.${c}.${d}`;
}

const UA = "com.community.oneroom/50020117 (Linux; U; Android 10; en_US; QP1A.191005.007.A3; Build/Redmi; Cronet/135.0.7012.3)";
const CLIENT_INFO = JSON.stringify({
    "package_name":"com.community.oneroom",
    "version_name":"4.0.01.0813.03",
    "version_code":50020117,
    "os":"android",
    "os_version":"10",
    "install_ch":"ps",
    "device_id": randomHex(32),
    "install_store":"ps",
    "gaid": randomUuid(),
    "brand":"Redmi",
    "model":"Redmi",
    "system_language":"en",
    "net":"NETWORK_WIFI",
    "region":"US",
    "timezone":"America/New_York",
    "sp_code":"40401",
    "X-Play-Mode":"2"
});
const SPOOFED_IP = randomSpoofedIp();

function buildSignedHeaders(method, url, body, authToken) {
    const ts = Date.now();
    const accept = "application/json";
    const contentType = "application/json";
    
    const clientToken = generateXClientToken(ts);
    const signature = generateXTrSignature(method, accept, contentType, url, body, ts);
    
    const headers = {
        "User-Agent": UA,
        "Accept": accept,
        "Content-Type": contentType,
        "Connection": "keep-alive",
        "x-client-token": clientToken,
        "x-tr-signature": signature,
        "x-client-info": CLIENT_INFO,
        "x-client-status": "0",
        "x-forwarded-for": SPOOFED_IP
    };

    if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
    }

    return headers;
}

async function fetchWithRetry(method, path, bodyObj = null, requiresAuth = true) {
    let body = bodyObj ? JSON.stringify(bodyObj) : undefined;

    if (requiresAuth && !currentToken) {
        await refreshSession();
    }

    for (let attempts = 0; attempts < HOST_POOL.length; attempts++) {
        const host = HOST_POOL[activeHostIndex];
        const url = `${host}${path}`;
        
        const headers = buildSignedHeaders(method, url, body, requiresAuth ? currentToken : null);

        try {
            // Using dynamic import for node-fetch if using commonjs or native fetch if node 18+
            const fetchRes = await fetch(url, {
                method,
                headers,
                body
            });

            // absorb x-user token
            const xUser = fetchRes.headers.get("x-user");
            if (xUser) {
                try {
                    const parsed = JSON.parse(xUser);
                    if (parsed.token) currentToken = parsed.token;
                } catch(e) {}
            }

            const status = fetchRes.status;
            if ([401, 403].includes(status)) {
                if (requiresAuth) {
                    currentToken = null;
                    await refreshSession();
                    return fetchWithRetry(method, path, bodyObj, requiresAuth); // retry once
                }
            }

            if ([406, 407, 429, 500, 502, 503, 504].includes(status)) {
                activeHostIndex = (activeHostIndex + 1) % HOST_POOL.length;
                continue;
            }

            if (!fetchRes.ok) {
                throw new Error(`API status ${status}`);
            }

            const text = await fetchRes.text();
            console.log(`[API] ${method} ${url} -> Status ${status}, Body snippet:`, text.substring(0, 200));
            
            try {
                const json = JSON.parse(text);
                return json.data || json;
            } catch(e) {
                return text;
            }
            
        } catch (error) {
            console.error(`Request to ${url} failed:`, error.message);
            activeHostIndex = (activeHostIndex + 1) % HOST_POOL.length;
        }
    }
    throw new Error("All hosts exhausted");
}

async function refreshSession() {
    const res = await fetchWithRetry("POST", "/wefeed-mobile-bff/user-api/visitor-login", {}, false);
    if (res && res.token) {
        currentToken = res.token;
    } else {
        throw new Error("Failed to obtain session token");
    }
}

// Routes
app.get('/api/search', async (req, res) => {
    try {
        const query = req.query.q || '';
        const page = parseInt(req.query.page) || 1;
        
        const payload = {
            keyword: query,
            page: page,
            perPage: 15,
            subjectType: req.query.type ? parseInt(req.query.type) : 0
        };
        
        if (req.query.genre) payload.genre = req.query.genre;
        if (req.query.country) payload.country = req.query.country;
        if (req.query.year) payload.year = req.query.year;
        if (req.query.sort) payload.sort = parseInt(req.query.sort) || 1;
        const data = await fetchWithRetry("POST", "/wefeed-mobile-bff/subject-api/search/v2", payload);
        
        // Adapt search items
        let list = data.list;
        if (!list && data.results && data.results.length > 0) {
            list = data.results[0].subjects;
        }
        list = list || [];
        
        const items = list.map(i => ({
            id: i.subjectId ? i.subjectId.toString() : "",
            title: i.title || "",
            poster: i.cover?.url || i.coverUrl || i.poster || null,
            kind: i.stype === 1 ? "movie" : "series",
            year: i.releaseDate ? parseInt(i.releaseDate.substring(0,4)) : (i.releaseYear ? parseInt(i.releaseYear) : null)
        }));
        
        res.json({ items });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/home', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const tabId = req.query.tabId || 3; // 3 usually means 'movies' or 'home'
        const data = await fetchWithRetry("GET", `/wefeed-mobile-bff/tab-operating?page=${page}&tabId=${tabId}&version=`);
        
        const groups = data.items || data || [];
        const resultGroups = [];
        
        for (const group of groups) {
            let subjects = [];
            if (group.banner && group.banner.banners) {
                subjects.push(...group.banner.banners.map(b => b.subject).filter(Boolean));
            }
            if (group.customData && group.customData.items) {
                subjects.push(...group.customData.items.map(i => i.subject).filter(Boolean));
            }
            if (group.subjects) {
                subjects.push(...group.subjects);
            }
            
            const groupItems = [];
            for (const subject of subjects) {
                if (!subject) continue;
                groupItems.push({
                    id: subject.subjectId ? subject.subjectId.toString() : (subject.id ? subject.id.toString() : ""),
                    title: subject.title || "",
                    poster: subject.cover?.url || subject.coverUrl || subject.cover || null,
                    kind: (subject.subjectType === 2 || subject.stype === 2) ? 'series' : 'movie',
                    year: subject.releaseDate ? parseInt(subject.releaseDate.substring(0,4)) : (subject.year ? parseInt(subject.year) : null)
                });
            }

            if (groupItems.length > 0) {
                resultGroups.push({
                    title: group.title || group.moduleName || "Suggested",
                    items: groupItems
                });
            }
        }
        
        res.json({ groups: resultGroups });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/details', async (req, res) => {
    try {
        const id = req.query.id;
        const data = await fetchWithRetry("GET", `/wefeed-mobile-bff/subject-api/get?subjectId=${id}`);
        
        let subject = data.subject || data;
        const stype = subject.subjectType || subject.stype || 1;
        if (stype === 2) {
            try {
                const seasonData = await fetchWithRetry("GET", `/wefeed-mobile-bff/subject-api/season-info?subjectId=${id}`);
                subject.seasons = seasonData;
            } catch(e) {}
        }
        
        // Adapt details
        const details = {
            id: subject.subjectId ? subject.subjectId.toString() : (subject.id ? subject.id.toString() : ""),
            title: subject.title || "",
            overview: subject.description || subject.intro || subject.brief || null,
            poster: subject.cover?.url || subject.coverUrl || subject.cover || null,
            kind: stype === 1 ? "movie" : "series",
            year: subject.releaseDate ? parseInt(subject.releaseDate.substring(0,4)) : (subject.year ? parseInt(subject.year) : null),
            rating: subject.imdbRatingValue || subject.score ? parseFloat(subject.imdbRatingValue || subject.score) : null,
            duration: subject.duration ? `${Math.floor(subject.duration/60)}m` : null,
            seasons: []
        };
        
        if (stype === 2 && subject.seasons && subject.seasons.list) {
            details.seasons = subject.seasons.list.map(s => {
                const sNumber = parseInt(s.season);
                const epCount = s.episodeCount || 0;
                const episodes = [];
                for (let i = 1; i <= epCount; i++) {
                    episodes.push({
                        season_number: sNumber,
                        episode_number: i,
                        title: `Episode ${i}`,
                        overview: null,
                    });
                }
                return {
                    season_number: sNumber,
                    title: `Season ${sNumber}`,
                    episodes
                };
            });
        }
        
        res.json(details);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/streams', async (req, res) => {
    try {
        const id = req.query.id;
        const season = parseInt(req.query.season) || 0;
        const episode = parseInt(req.query.episode) || 0;
        
        let playInfoPath;
        if (season === 0 && episode === 0) {
            playInfoPath = `/wefeed-mobile-bff/subject-api/play-info/v2?subjectId=${id}`;
        } else {
            playInfoPath = `/wefeed-mobile-bff/subject-api/play-info/v2?subjectId=${id}&se=${season}&ep=${episode}`;
        }
        
        const playInfoP = fetchWithRetry("GET", playInfoPath);
        
        let resourcePath;
        const page = episode > 0 ? Math.floor((episode - 1) / 20) + 1 : 1;
        if (season === 0 && episode === 0) {
            resourcePath = `/wefeed-mobile-bff/subject-api/resource?subjectId=${id}&page=${page}&perPage=20`;
        } else {
            resourcePath = `/wefeed-mobile-bff/subject-api/resource?subjectId=${id}&se=${season}&ep=${episode}&page=${page}&perPage=20`;
        }
        const resourcesP = fetchWithRetry("GET", resourcePath);
        
        const [playInfo, resources] = await Promise.allSettled([playInfoP, resourcesP]);
        
        const releases = [];
        const seenUrls = new Set();
        
        if (playInfo.status === 'fulfilled' && playInfo.value) {
            const data = playInfo.value;
            if (data.streams && data.streams.length > 0) {
                for (const stream of data.streams) {
                    const streamUrl = stream.url || "";
                    const signCookie = stream.signCookie || "";
                    
                    let manifestUrl = null;
                    if (signCookie) {
                        const parts = signCookie.split(';');
                        for (const p of parts) {
                            const trimmed = p.trim();
                            const urlPrefixIdx = trimmed.indexOf("urlprefix=");
                            if (urlPrefixIdx !== -1) {
                                let prefixPart = trimmed.substring(urlPrefixIdx + "urlprefix=".length);
                                let b64Token = prefixPart.split(':')[0].trim();
                                let normalized = b64Token.replace(/-/g, '+').replace(/_/g, '/');
                                const padding = (4 - normalized.length % 4) % 4;
                                if (padding > 0) normalized += '='.repeat(padding);
                                try {
                                    const decodedStr = Buffer.from(normalized, 'base64').toString('utf8');
                                    const baseResource = decodedStr.replace(/\*$/, '').replace(/\/$/, '');
                                    if (baseResource && (baseResource.startsWith("http://") || baseResource.startsWith("https://"))) {
                                        manifestUrl = `${baseResource}/index.mpd`;
                                    }
                                } catch (e) { }
                            }
                            if (trimmed.startsWith("CloudFront-Policy=")) {
                                let policyClean = trimmed.substring("CloudFront-Policy=".length).trim();
                                let normalized = policyClean.replace(/-/g, '+').replace(/_/g, '=').replace(/~/g, '/');
                                const padding = (4 - normalized.length % 4) % 4;
                                if (padding > 0) normalized += '='.repeat(padding);
                                try {
                                    const decodedStr = Buffer.from(normalized, 'base64').toString('utf8');
                                    const json = JSON.parse(decodedStr);
                                    const resource = json?.Statement?.[0]?.Resource;
                                    if (resource) {
                                        const baseResource = resource.replace(/\*$/, '').replace(/\/$/, '');
                                        if (baseResource && (baseResource.startsWith("http://") || baseResource.startsWith("https://"))) {
                                            manifestUrl = `${baseResource}/index.mpd`;
                                        }
                                    }
                                } catch (e) { }
                            }
                        }
                    }
                    
                    let playableUrl = manifestUrl || streamUrl;
                    if (playableUrl && !playableUrl.toLowerCase().includes("notice.mp4") && !playableUrl.toLowerCase().includes("b164fbfb4347792950bdfbfb563d39d9") && !playableUrl.toLowerCase().includes("macdn.aoneroom.com/other/")) {
                        let resolutions = (stream.resolutions || data.displayResolutions || "1080,720,480")
                            .split(',')
                            .map(r => parseInt(r.trim()))
                            .filter(r => !isNaN(r))
                            .sort((a,b) => b-a);
                            
                        if (resolutions.length === 0) resolutions = [1080];
                        
                        let cleanCookie = "";
                        if (signCookie) {
                            cleanCookie = signCookie.replace(/;+$/, '').split(';').map(s => s.trim()).filter(s => !!s).join('; ');
                        }
                        
                        const isDash = playableUrl.endsWith('.mpd');
                        
                        let finalUrl = playableUrl;
                        if (isDash) {
                            const baseUrlMatch = playableUrl.match(/^(https?:\/\/[^\/]+\/.*\/)[^\/]+$/);
                            if (baseUrlMatch) {
                                const baseUrl = baseUrlMatch[1];
                                const encodedBase = Buffer.from(baseUrl).toString('base64url');
                                dashCookies.set(encodedBase, cleanCookie);
                                const filename = playableUrl.substring(baseUrl.length);
                                finalUrl = `/api/proxy-dash/${encodedBase}/${filename}`;
                            }
                        } else {
                            finalUrl = `/api/proxy-media?url=${encodeURIComponent(playableUrl)}&cookie=${encodeURIComponent(cleanCookie)}`;
                        }
                        
                        for (const res of resolutions) {
                            releases.push({
                                url: finalUrl,
                                rawUrl: playableUrl,
                                quality: `${res}p`,
                                source: 'MovieBox',
                                isDash: isDash
                            });
                        }
                    }
                }
            }
        }
        
        if (resources.status === 'fulfilled' && resources.value) {
            const list = resources.value.list || [];
            for (const item of list) {
                const link = item.resourceLink || item.url;
                if (link && !link.includes("notice.mp4") && !link.includes("b164fbfb4347792950bdfbfb563d39d9.mp4")) {
                    const base = link.split('?')[0];
                    if (seenUrls.has(base)) continue;
                    seenUrls.add(base);
                    
                    const finalUrl = `/api/proxy-media?url=${encodeURIComponent(link)}`;
                    
                    releases.push({
                        url: finalUrl,
                        rawUrl: link,
                        quality: item.resolution ? `${item.resolution}p` : 'Unknown',
                        source: item.source || item.uploadBy || 'Resource',
                        sizeBytes: item.size || 0,
                        isDash: link.endsWith('.mpd')
                    });
                }
            }
        }
        
        if (releases.length === 0) {
            throw new Error("No stream sources available");
        }

        
        res.json({ releases: releases });
        
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.use('/api/proxy-dash/:b64', async (req, res) => {
    try {
        const b64 = req.params.b64;
        const file = req.path;
        
        if (!b64 || !file) return res.status(400).send('Missing base or file');
        
        const baseUrl = Buffer.from(b64, 'base64url').toString('utf8');
        const targetUrl = baseUrl + (file.startsWith('/') ? file.substring(1) : file);
        console.log(`[DASH Proxy] Fetching: ${targetUrl}`);
        
        const headers = {
            "User-Agent": UA,
            "Referer": "https://sportslive.wine"
        };
        
        if (req.headers.range) headers["Range"] = req.headers.range;
        const cookie = dashCookies.get(b64);
        if (cookie) headers["Cookie"] = cookie;
        
        const response = await fetch(targetUrl, {
            headers,
            redirect: 'follow'
        });
        
        if (!response.ok) {
            return res.status(response.status).send(response.statusText);
        }
        
        res.status(response.status);
        response.headers.forEach((value, name) => {
            if (['content-type', 'content-length', 'content-range', 'accept-ranges', 'access-control-allow-origin'].includes(name.toLowerCase())) {
                res.setHeader(name, value);
            }
        });
        res.setHeader('Access-Control-Allow-Origin', '*');
        
        if (response.body) {
            Readable.fromWeb(response.body).pipe(res);
        } else {
            res.end();
        }
    } catch (e) {
        console.error("DASH proxy error:", e.message);
        res.status(500).send(e.message);
    }
});

app.get('/api/proxy-media', async (req, res) => {
    const targetUrl = req.query.url;
    if (!targetUrl) return res.status(400).send('Missing url');
    
    const headers = {
        "User-Agent": UA,
        "Referer": "https://sportslive.wine"
    };
    
    if (req.headers.range) {
        headers["Range"] = req.headers.range;
    }
    
    if (req.query.cookie) {
        headers["Cookie"] = req.query.cookie;
    }
    
    try {
        const response = await fetch(targetUrl, { headers });
        
        if (response.status === 200 || response.status === 206) {
            res.status(response.status);
            
            // Forward relevant headers
            const headersToForward = ['content-type', 'content-length', 'content-range', 'accept-ranges'];
            headersToForward.forEach(h => {
                const val = response.headers.get(h);
                if (val) res.setHeader(h, val);
            });
            
            if (response.body) {
                Readable.fromWeb(response.body).pipe(res);
            } else {
                res.end();
            }
        } else {
            res.status(response.status).send(await response.text());
        }
    } catch (e) {
        res.status(500).send(e.message);
    }
});

app.listen(3001, () => {
    console.log('MovieBox API proxy listening on port 3001');
});
