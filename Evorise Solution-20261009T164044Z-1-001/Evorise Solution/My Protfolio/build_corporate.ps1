$header = @"
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tahsin Islam Sifat — Network Engineer & Developer</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <nav class="navbar">
    <div class="container nav-container">
      <a href="index.html" class="nav-logo">TIS<span>.</span></a>
      <div class="nav-links">
        <a href="index.html" class="nav-home">Home</a>
        <a href="about.html" class="nav-about">About</a>
        <a href="skills.html" class="nav-skills">Skills</a>
        <a href="experience.html" class="nav-experience">Experience</a>
        <a href="projects.html" class="nav-projects">Projects</a>
        <a href="contact.html" class="nav-contact">Contact</a>
      </div>
      <button class="mobile-toggle">☰</button>
    </div>
  </nav>
"@

$footer = @"
  <footer class="footer">
    <div class="container">
      <div class="social-links">
        <a href="https://www.facebook.com/Tahsin10.TN">Facebook</a>
        <a href="#">LinkedIn</a>
        <a href="#">GitHub</a>
      </div>
      <p class="footer-text">&copy; 2026 Tahsin Islam Sifat. All rights reserved.</p>
    </div>
  </footer>
</body>
</html>
"@

# 1. index.html
$indexContent = $header.Replace('class="nav-home"', 'class="nav-home active"') + @"
  <section class="hero">
    <div class="container grid-2">
      <div class="hero-content">
        <span class="badge">Available for Work</span>
        <h1>Tahsin Islam Sifat</h1>
        <p class="hero-subtitle">Network Engineer & Full-Stack Developer</p>
        <p>Crafting scalable network solutions and robust full-stack applications with a focus on performance, security, and user experience.</p>
        <div class="hero-actions">
          <a href="projects.html" class="btn btn-primary">View Work</a>
          <a href="contact.html" class="btn btn-secondary">Contact Me</a>
        </div>
      </div>
      <div class="hero-image">
        <img src="assets/images/hero.jpeg" alt="Tahsin Islam Sifat">
      </div>
    </div>
  </section>
"@ + $footer
Set-Content "index.html" $indexContent -Encoding UTF8

# 2. about.html
$aboutContent = $header.Replace('class="nav-about"', 'class="nav-about active"') + @"
  <section class="section">
    <div class="container">
      <h2>About Me</h2>
      <div class="grid-2">
        <div>
          <img src="assets/images/about.jpeg" alt="Tahsin" class="card" style="padding:0; overflow:hidden;">
        </div>
        <div>
          <h3>Bridging Infrastructure and Applications</h3>
          <p>I am a technology professional with a dual focus: ISP network operations and full-stack web development. My career started in customer relationship management, evolved through ISP technical support, and grew into network operations managing MikroTik routers, OLTs, and device monitoring.</p>
          <p>Driven by a passion for building, I completed Full Stack Web Development with the MERN stack. I believe the best engineers understand both the infrastructure that carries data and the applications that rely on it.</p>
          
          <div class="about-stats">
            <div class="stat-box">
              <div class="stat-num">3+</div>
              <div class="stat-label">Years Experience</div>
            </div>
            <div class="stat-box">
              <div class="stat-num">10+</div>
              <div class="stat-label">Projects Built</div>
            </div>
            <div class="stat-box">
              <div class="stat-num">2</div>
              <div class="stat-label">Core Domains</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
"@ + $footer
Set-Content "about.html" $aboutContent -Encoding UTF8

# 3. skills.html
$skillsContent = $header.Replace('class="nav-skills"', 'class="nav-skills active"') + @"
  <section class="section">
    <div class="container">
      <h2>Core Expertise</h2>
      <p>A comprehensive skill set spanning physical networking infrastructure to modern web application development.</p>
      
      <div class="skills-grid">
        <div class="card skill-card">
          <div class="skill-icon">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg>
          </div>
          <h3>Networking & ISP</h3>
          <div class="skill-list">
            <div class="skill-item"><span>•</span> MikroTik Configuration</div>
            <div class="skill-item"><span>•</span> OLT & Fiber Troubleshooting</div>
            <div class="skill-item"><span>•</span> LAN Operations</div>
            <div class="skill-item"><span>•</span> Network Monitoring</div>
          </div>
        </div>
        
        <div class="card skill-card">
          <div class="skill-icon">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>
          </div>
          <h3>Full-Stack (MERN)</h3>
          <div class="skill-list">
            <div class="skill-item"><span>•</span> React.js & Frontend</div>
            <div class="skill-item"><span>•</span> Node.js & Express API</div>
            <div class="skill-item"><span>•</span> MongoDB Database</div>
            <div class="skill-item"><span>•</span> JavaScript (ES6+)</div>
          </div>
        </div>

        <div class="card skill-card">
          <div class="skill-icon">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"/></svg>
          </div>
          <h3>Support & CRM</h3>
          <div class="skill-list">
            <div class="skill-item"><span>•</span> Customer Tech Support</div>
            <div class="skill-item"><span>•</span> Ticket Management</div>
            <div class="skill-item"><span>•</span> Complaint Resolution</div>
            <div class="skill-item"><span>•</span> CRM Platforms</div>
          </div>
        </div>
      </div>
    </div>
  </section>
"@ + $footer
Set-Content "skills.html" $skillsContent -Encoding UTF8

# 4. experience.html
$experienceContent = $header.Replace('class="nav-experience"', 'class="nav-experience active"') + @"
  <section class="section">
    <div class="container">
      <h2>Work Experience</h2>
      <p>Professional history transitioning from customer relationship management to network engineering.</p>
      
      <div class="timeline">
        <div class="timeline-item">
          <div class="timeline-dot"></div>
          <div class="timeline-date">Current</div>
          <div class="timeline-role">Network Support Engineer</div>
          <div class="timeline-company">ISP · Network Operations Team</div>
          <p class="timeline-desc">Managing LAN networking infrastructure, ISP connectivity support, MikroTik router configuration, basic OLT troubleshooting, and network monitoring.</p>
        </div>
        
        <div class="timeline-item">
          <div class="timeline-dot"></div>
          <div class="timeline-date">Previous</div>
          <div class="timeline-role">ISP Technical Support</div>
          <div class="timeline-company">Customer Technical Support Division</div>
          <p class="timeline-desc">Provided Tier-1 & Tier-2 customer support for connectivity issues. Managed end-to-end support tickets, troubleshooting fiber and LAN access systems.</p>
        </div>
        
        <div class="timeline-item">
          <div class="timeline-dot"></div>
          <div class="timeline-date">Earlier</div>
          <div class="timeline-role">CRM & Customer Support</div>
          <div class="timeline-company">Customer Relations Team</div>
          <p class="timeline-desc">Managed customer relationships, query handling, and complaint resolution through CRM platforms, building strong communication fundamentals.</p>
        </div>
      </div>
    </div>
  </section>
"@ + $footer
Set-Content "experience.html" $experienceContent -Encoding UTF8

# 5. projects.html
$projectsContent = $header.Replace('class="nav-projects"', 'class="nav-projects active"') + @"
  <section class="section">
    <div class="container">
      <h2>Selected Projects & Certifications</h2>
      
      <div class="projects-grid">
        <div class="card project-card">
          <div class="project-content">
            <span class="badge">Full-Stack</span>
            <h3 class="project-title">MERN Web Application</h3>
            <p>A complete full-stack platform featuring secure authentication, data dashboards, and a robust REST API backend.</p>
            <div class="project-tags">
              <span class="tag">MongoDB</span>
              <span class="tag">Express</span>
              <span class="tag">React</span>
              <span class="tag">Node.js</span>
            </div>
            <a href="#" class="project-link">View Project &rarr;</a>
          </div>
        </div>
        
        <div class="card project-card">
          <div class="project-content">
            <span class="badge">Networking</span>
            <h3 class="project-title">ISP Network Tracker</h3>
            <p>A web-based tool designed to track ISP device status, connectivity uptime, and monitor ticket assignments for network technicians.</p>
            <div class="project-tags">
              <span class="tag">React</span>
              <span class="tag">Node.js</span>
              <span class="tag">SNMP</span>
            </div>
            <a href="#" class="project-link">View Project &rarr;</a>
          </div>
        </div>
      </div>

      <h3 style="margin-top: 60px;">Certifications</h3>
      <div class="card" style="margin-top: 24px; display: flex; align-items: center; gap: 24px;">
        <div style="flex: 1;">
          <h4 style="font-size: 1.25rem; margin-bottom: 8px;">Full Stack Web Development with MERN</h4>
          <p style="margin:0;"><strong>Provider:</strong> Ostad The Coach</p>
          <p style="margin:0;"><strong>Instructor:</strong> Rabbil Hasan</p>
          <p style="margin-top:8px; font-size: 0.9rem;">Professional training covering MongoDB, Express.js, React, and Node.js. Certificate ID: C19992</p>
        </div>
        <a href="#" class="btn btn-secondary">Verify</a>
      </div>
    </div>
  </section>
"@ + $footer
Set-Content "projects.html" $projectsContent -Encoding UTF8

# 6. contact.html
$contactContent = $header.Replace('class="nav-contact"', 'class="nav-contact active"') + @"
  <section class="section">
    <div class="container">
      <h2>Get in Touch</h2>
      <p>Open for opportunities in Network Engineering and Full-Stack Development.</p>
      
      <div class="contact-grid" style="margin-top: 48px;">
        <div>
          <img src="assets/images/contact.jpeg" alt="Contact" class="card" style="padding:0; overflow:hidden; aspect-ratio: 16/9; object-fit: cover; margin-bottom: 32px;">
          
          <div class="contact-info-item">
            <div class="contact-icon">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
            </div>
            <div>
              <div class="form-label">Email</div>
              <a href="mailto:tahsin.sifat@email.com" style="color:var(--text-primary); font-weight: 500;">tahsin.sifat@email.com</a>
            </div>
          </div>
          
          <div class="contact-info-item">
            <div class="contact-icon">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            </div>
            <div>
              <div class="form-label">Location</div>
              <span style="color:var(--text-primary); font-weight: 500;">Bangladesh</span>
            </div>
          </div>
        </div>
        
        <div class="card">
          <h3 style="margin-bottom: 24px;">Send a Message</h3>
          <form>
            <div class="form-group">
              <label class="form-label">Name</label>
              <input type="text" class="form-control" placeholder="Your Name">
            </div>
            <div class="form-group">
              <label class="form-label">Email</label>
              <input type="email" class="form-control" placeholder="your@email.com">
            </div>
            <div class="form-group">
              <label class="form-label">Message</label>
              <textarea class="form-control" placeholder="How can we work together?"></textarea>
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%;">Send Message</button>
          </form>
        </div>
      </div>
    </div>
  </section>
"@ + $footer
Set-Content "contact.html" $contactContent -Encoding UTF8
