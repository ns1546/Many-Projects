import puppeteer from 'puppeteer-core';

async function testQualityAPI() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    defaultViewport: { width: 1366, height: 768 },
    args: ['--no-sandbox', '--disable-gpu', '--autoplay-policy=no-user-gesture-required']
  });

  const page = await browser.newPage();

  // Load an isolated test page with YouTube IFrame API to test quality switching directly!
  const html = `
    <!DOCTYPE html>
    <html>
    <head><title>YT Test</title></head>
    <body style="background:#000; margin:0;">
      <div id="player"></div>
      <script>
        var tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

        var player;
        window.qualityLogs = [];

        function onYouTubeIframeAPIReady() {
          player = new YT.Player('player', {
            height: '720',
            width: '1280',
            videoId: '3Y99GpafFu0',
            playerVars: {
              autoplay: 1,
              controls: 0,
              modestbranding: 1
            },
            events: {
              onReady: function(e) {
                window.qualityLogs.push({ event: 'onReady', quality: e.target.getPlaybackQuality(), levels: e.target.getAvailableQualityLevels() });
              },
              onPlaybackQualityChange: function(e) {
                window.qualityLogs.push({ event: 'qualityChange', newQuality: e.data });
              },
              onStateChange: function(e) {
                window.qualityLogs.push({ event: 'stateChange', state: e.data, quality: player.getPlaybackQuality() });
              }
            }
          });
          window.player = player;
        }
      </script>
    </body>
    </html>
  `;

  await page.setContent(html);
  await new Promise(r => setTimeout(r, 4000));

  const initialLogs = await page.evaluate(() => window.qualityLogs);
  console.log('Initial Logs:', JSON.stringify(initialLogs, null, 2));

  // Now test setPlaybackQuality vs loadVideoById
  console.log('Testing setPlaybackQuality(hd720)...');
  await page.evaluate(() => {
    window.player.setPlaybackQuality('hd720');
  });
  await new Promise(r => setTimeout(r, 2000));

  const afterSetQuality = await page.evaluate(() => ({
    currentQuality: window.player.getPlaybackQuality(),
    availableLevels: window.player.getAvailableQualityLevels(),
    logs: window.qualityLogs
  }));
  console.log('After setPlaybackQuality:', JSON.stringify(afterSetQuality, null, 2));

  // Now test reload via loadVideoById with suggestedQuality
  console.log('Testing loadVideoById with suggestedQuality...');
  await page.evaluate(() => {
    const curTime = window.player.getCurrentTime();
    window.player.loadVideoById({
      videoId: '3Y99GpafFu0',
      startSeconds: curTime,
      suggestedQuality: 'hd1080'
    });
  });
  await new Promise(r => setTimeout(r, 3000));

  const afterLoadVideoById = await page.evaluate(() => ({
    currentQuality: window.player.getPlaybackQuality(),
    logs: window.qualityLogs.slice(-5)
  }));
  console.log('After loadVideoById:', JSON.stringify(afterLoadVideoById, null, 2));

  await browser.close();
}

testQualityAPI().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

