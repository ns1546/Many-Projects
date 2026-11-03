$header = @"
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tahsin Islam Sifat — Creative Portfolio</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>

  <nav class="nav">
    <div class="nav-logo">TAHSIN.</div>
    <div class="menu-btn">
      <div class="menu-line"></div>
      <div class="menu-line"></div>
    </div>
  </nav>

  <div class="menu-overlay">
    <div class="menu-links">
      <a href="index.html" class="menu-link">Home</a>
      <a href="about.html" class="menu-link">About</a>
      <a href="skills.html" class="menu-link">Skills</a>
      <a href="experience.html" class="menu-link">Experience</a>
      <a href="work.html" class="menu-link">Work</a>
      <a href="contact.html" class="menu-link">Contact</a>
    </div>
    <div class="menu-side-info">
      <div>
        <h4>Say Hello</h4>
        <a href="mailto:tahsin.sifat@email.com">tahsin.sifat@email.com</a>
      </div>
      <div>
        <h4>Social</h4>
        <a href="https://www.facebook.com/Tahsin10.TN" target="_blank">Facebook</a>
        <a href="#">LinkedIn</a>
        <a href="#">GitHub</a>
      </div>
      <div>
        <h4>Based In</h4>
        <p>Bangladesh</p>
        <p>Available worldwide</p>
      </div>
    </div>
  </div>

  <div class="scroll-container">
"@

$footer = @"
      <footer class="footer">
        <div class="footer-top">
          <div class="footer-col">
            <h4>Location</h4>
            <p>Bangladesh<br>Available for remote work worldwide.</p>
          </div>
          <div class="footer-col">
            <h4>Social</h4>
            <a href="https://www.facebook.com/Tahsin10.TN" target="_blank">Facebook</a>
            <a href="#">LinkedIn</a>
            <a href="#">GitHub</a>
          </div>
          <div class="footer-col">
            <h4>Say Hello</h4>
            <a href="mailto:tahsin.sifat@email.com">tahsin.sifat@email.com</a>
            <p>+880 1234 567890</p>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2026 Tahsin Islam Sifat. All rights reserved.</p>
          <a href="#" class="back-to-top">Back to Top &uarr;</a>
        </div>
      </footer>
  </div>

  <script src="script.js"></script>
</body>
</html>
"@

$hero = @"
    <!-- 1. HERO -->
    <section class="section hero" id="home">
      <div class="hero-content">
        <div class="hero-text-block">
          <p class="hero-overline zscope" data-type="fade">Portfolio 2026</p>
          <h1 class="hero-title zscope" data-type="zoom-out">
            <span class="d-block">TAHSIN</span>
            <span class="d-block indent">ISLAM</span>
            <span class="d-block">SIFAT <span class="dot">.</span></span>
          </h1>
          <p class="hero-subtitle zscope" data-type="fade">
            Network Engineer & Full-Stack Developer.<br>
            Bridging robust infrastructure with modern web experiences.
          </p>
        </div>
        
        <div class="hero-visual-block zscope prlx" data-type="zoom-in" data-speed="0.15">
          <div class="hero-image-frame">
            <img src="assets/images/hero.jpeg" alt="Tahsin" class="hero-img">
          </div>
          <div class="scroll-indicator">
            <span>SCROLL</span>
            <div class="line"></div>
          </div>
        </div>
      </div>
    </section>
"@

$about = @"
    <!-- 2. ABOUT -->
    <section class="section about-section" id="about">
      <div class="about-image-wrapper zscope prlx" data-type="zoom-in-img" data-speed="0.15">
        <img src="assets/images/about.jpeg" alt="About Tahsin" class="about-image">
      </div>
      <p class="about-text zscope" data-type="zoom-in">
        I believe the best technology professionals understand <em>both</em> the infrastructure that carries data and the applications that use it.
      </p>
    </section>
"@

$skills = @"
    <!-- 3. SKILLS -->
    <section class="section skills-section" id="skills">
      <div class="marquee-container zscope" data-type="fade">
        <div class="marquee-track mq-right">
          <span class="marquee-text solid">MikroTik</span>
          <span class="marquee-text">React.js</span>
          <span class="marquee-text solid">MongoDB</span>
          <span class="marquee-text">Node.js</span>
          <span class="marquee-text solid">OLT</span>
          <span class="marquee-text">Express</span>
        </div>
      </div>
      <div class="marquee-container zscope" data-type="fade" style="margin-bottom: 60px;">
        <div class="marquee-track mq-left">
          <span class="marquee-text">Networking</span>
          <span class="marquee-text solid">MERN Stack</span>
          <span class="marquee-text">ISP Support</span>
          <span class="marquee-text solid">CRM</span>
          <span class="marquee-text">Full-Stack</span>
          <span class="marquee-text solid">Troubleshooting</span>
        </div>
      </div>

      <div class="skills-grid zscope" data-type="zoom-in">
        <div class="skill-box">
          <h3>Network Infrastructure</h3>
          <p>ISP operations, MikroTik configuration, LAN troubleshooting, and OLT management.</p>
          <p>Ensuring data reaches its destination efficiently and securely.</p>
        </div>
        <div class="skill-box">
          <h3>Full-Stack Development</h3>
          <p>Certified in the MERN stack. Building robust APIs with Node.js and dynamic interfaces with React.</p>
          <p>Creating applications that solve real operational problems.</p>
        </div>
        <div class="skill-box">
          <h3>Support & CRM</h3>
          <p>Years of direct customer relationship management and technical support.</p>
          <p>Bridging the gap between complex technology and end-user satisfaction.</p>
        </div>
      </div>
    </section>
"@

$experience = @"
    <!-- 4. EXPERIENCE -->
    <section class="section exp-section" id="experience">
      <div style="width: 100%;">
        <h2 class="exp-header zscope" data-type="zoom-out">Career Evolution</h2>
        <div class="exp-list">
          <div class="exp-row zscope" data-type="zoom-in">
            <div class="exp-year">Present</div>
            <div class="exp-details">
              <h3>Network Support Engineer</h3>
              <p>Managing ISP connectivity, MikroTik routers, monitoring tools, and network operations.</p>
            </div>
          </div>
          <div class="exp-row zscope" data-type="zoom-in">
            <div class="exp-year">Previous</div>
            <div class="exp-details">
              <h3>ISP Technical Support</h3>
              <p>Tier-1 & Tier-2 customer technical support, ticket management, and fiber troubleshooting.</p>
            </div>
          </div>
          <div class="exp-row zscope" data-type="zoom-in">
            <div class="exp-year">Earlier</div>
            <div class="exp-details">
              <h3>CRM & Customer Relations</h3>
              <p>Complaint resolution, query handling, and building strong client communication foundations.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
"@

$work = @"
    <!-- 5. WORK -->
    <section class="section work-section" id="work">
      <div class="work-grid">
        <div class="work-item">
          <div class="work-img-wrapper zscope prlx" data-type="zoom-in-img" data-speed="0.1">
            <img src="assets/images/contact.jpeg" alt="Project" class="work-img">
          </div>
          <div class="work-info zscope" data-type="fade">
            <h3>ISP Network Tracker</h3>
            <p>Web-based tool designed to track ISP device status and connectivity uptime.</p>
          </div>
        </div>
        <div class="work-item">
          <div class="work-img-wrapper zscope prlx" data-type="zoom-in-img" data-speed="0.1">
            <img src="assets/images/hero.jpeg" alt="Project" class="work-img">
          </div>
          <div class="work-info zscope" data-type="fade">
            <h3>MERN Platform</h3>
            <p>Full-stack web application featuring secure authentication and robust REST API architecture.</p>
          </div>
        </div>
      </div>
    </section>
"@

$contact = @"
    <!-- 6. CONTACT -->
    <section class="section contact-section" id="contact">
      <div class="contact-wrap">
        <a href="mailto:tahsin.sifat@email.com" class="contact-title-link">
          <h2 class="contact-title">LET'S<br>TALK.</h2>
          <span class="contact-email-hint">Click to start a conversation</span>
        </a>
      </div>
    </section>
"@

Set-Content -Path "index.html" -Value ($header + $hero + $footer) -Encoding UTF8
Set-Content -Path "about.html" -Value ($header + $about + $footer) -Encoding UTF8
Set-Content -Path "skills.html" -Value ($header + $skills + $footer) -Encoding UTF8
Set-Content -Path "experience.html" -Value ($header + $experience + $footer) -Encoding UTF8
Set-Content -Path "work.html" -Value ($header + $work + $footer) -Encoding UTF8
Set-Content -Path "contact.html" -Value ($header + $contact + $footer) -Encoding UTF8
