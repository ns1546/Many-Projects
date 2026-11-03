$html = Get-Content -Raw -Path "index.html"

# Extract header (up to the end of the <nav> block + <div class="fullscreen-nav">)
$headerEndPattern = '</div>\s*<!-- ================================================\s*HERO'
$headerMatch = [regex]::Match($html, "(?s)(.*?)<!-- ================================================\s*HERO")
$header = $headerMatch.Groups[1].Value

# We need to update the navigation links in the header
$header = $header -replace 'href="#home"', 'href="index.html"'
$header = $header -replace 'href="#about"', 'href="about.html"'
$header = $header -replace 'href="#skills"', 'href="skills.html"'
$header = $header -replace 'href="#experience"', 'href="experience.html"'
$header = $header -replace 'href="#webdev"', 'href="projects.html"'
$header = $header -replace 'href="#certifications"', 'href="projects.html#certs"'
$header = $header -replace 'href="#contact"', 'href="contact.html"'
$header = $header -replace 'id="nl-certs"', 'id="nl-certs" style="display:none;"'
$header = $header -replace 'id="fs-certs"', 'id="fs-certs" style="display:none;"'
$header = $header -replace 'Web Dev', 'Projects'
$header = $header -replace 'class="nav-link active"', 'class="nav-link"'

# Extract sections
$hero = [regex]::Match($html, "(?s)(<!-- ================================================\s*HERO.*?)</section>").Groups[1].Value + "</section>`n"
$about = [regex]::Match($html, "(?s)(<!-- ================================================\s*ABOUT.*?)</section>").Groups[1].Value + "</section>`n"
$skills = [regex]::Match($html, "(?s)(<!-- ================================================\s*SKILLS.*?)</section>").Groups[1].Value + "</section>`n"
$experience = [regex]::Match($html, "(?s)(<!-- ================================================\s*EXPERIENCE.*?)</section>").Groups[1].Value + "</section>`n"
$webdev = [regex]::Match($html, "(?s)(<!-- ================================================\s*WEB DEVELOPMENT.*?)</section>").Groups[1].Value + "</section>`n"
$certs = [regex]::Match($html, "(?s)(<!-- ================================================\s*CERTIFICATIONS.*?)</section>").Groups[1].Value + "</section>`n"
$education = [regex]::Match($html, "(?s)(<!-- ================================================\s*EDUCATION.*?)</section>").Groups[1].Value + "</section>`n"
$contact = [regex]::Match($html, "(?s)(<!-- ================================================\s*CONTACT.*?)</section>").Groups[1].Value + "</section>`n"

# Extract footer
$footerMatch = [regex]::Match($html, "(?s)(<!-- ================================================\s*FOOTER.*)")
$footer = $footerMatch.Groups[1].Value
$footer = $footer -replace 'href="#home"', 'href="index.html"'
$footer = $footer -replace 'href="#about"', 'href="about.html"'
$footer = $footer -replace 'href="#skills"', 'href="skills.html"'
$footer = $footer -replace 'href="#experience"', 'href="experience.html"'
$footer = $footer -replace 'href="#webdev"', 'href="projects.html"'
$footer = $footer -replace 'href="#certifications"', 'href="projects.html#certs"'
$footer = $footer -replace 'href="#education"', 'href="about.html#education"'
$footer = $footer -replace 'href="#contact"', 'href="contact.html"'

# Now let's change image paths
$hero = $hero -replace 'assets/images/tahsin-profile.jpg', 'assets/images/hero.jpeg'
$about = $about -replace '<div class="about-text', '<img src="assets/images/about.jpeg" style="width:100%;margin-bottom:40px;aspect-ratio:4/3;object-fit:cover;filter:grayscale(100%);" alt="Tahsin Islam Sifat"><div class="about-text'
$contact = $contact -replace '<div class="contact-info">', '<div class="contact-info"><img src="assets/images/contact.jpeg" style="width:100%;margin-bottom:40px;aspect-ratio:1/1;object-fit:cover;filter:grayscale(100%);" alt="Tahsin Islam Sifat">'

# Write files
# index.html
$indexContent = $header.Replace('href="index.html"           class="nav-link"', 'href="index.html"           class="nav-link active"') + $hero + $footer
Set-Content -Path "index.html" -Value $indexContent

# about.html
$aboutContent = $header.Replace('href="about.html"          class="nav-link"', 'href="about.html"          class="nav-link active"') + $about + $education + $footer
Set-Content -Path "about.html" -Value $aboutContent

# skills.html
$skillsContent = $header.Replace('href="skills.html"         class="nav-link"', 'href="skills.html"         class="nav-link active"') + $skills + $footer
Set-Content -Path "skills.html" -Value $skillsContent

# experience.html
$expContent = $header.Replace('href="experience.html"     class="nav-link"', 'href="experience.html"     class="nav-link active"') + $experience + $footer
Set-Content -Path "experience.html" -Value $expContent

# projects.html
$projectsContent = $header.Replace('href="projects.html"         class="nav-link"', 'href="projects.html"         class="nav-link active"') + $webdev + $certs + $footer
Set-Content -Path "projects.html" -Value $projectsContent

# contact.html
$contactContent = $header.Replace('href="contact.html"        class="nav-link"', 'href="contact.html"        class="nav-link active"') + $contact + $footer
Set-Content -Path "contact.html" -Value $contactContent
