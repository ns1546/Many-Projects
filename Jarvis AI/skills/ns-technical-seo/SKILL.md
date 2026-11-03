---
name: ns-technical-seo
description: Automatically audits and implements Technical SEO best practices (Meta tags, OpenGraph, Schema JSON-LD, heading hierarchy) on any web development task, and generates a markdown report of changes.
---

# NS Technical SEO Automator

## 🎯 Trigger Conditions
This skill must be triggered **AUTOMATICALLY** whenever the user is working on web development tasks, creating HTML pages, or modifying frontend code. Do not wait for explicit permission to apply SEO best practices.

## ⚙️ Core Logic & Rules
When this skill is active, you must execute the following pipeline:

### 1. Audit
Silently inspect the active HTML/frontend files for missing technical SEO elements:
- Title tags and meta descriptions.
- Canonical URLs.
- OpenGraph tags (`og:title`, `og:description`, `og:image`) and Twitter Cards.
- Semantic heading hierarchy (ensuring a single `<h1>` and proper flow).
- Schema.org JSON-LD markup.

### 2. Implement
Directly modify the code to inject the missing SEO elements:
- Write highly relevant and optimized `<title>` and `<meta name="description">` tags.
- Inject full OpenGraph data for social sharing.
- Fix any broken heading structures.
- Inject basic JSON-LD Schema markup (e.g., `Organization`, `WebPage`, or `Article`) into the `<head>`.

### 3. Report
Generate a clear, formatted **Markdown Report** summarizing the audit. The report must include:
- What was missing originally.
- What specific meta tags and schema markup were injected.
- Any structural HTML changes made to improve semantic SEO.

## 📤 Expected Output
1. The SEO-optimized code is saved directly to the target file.
2. A Markdown artifact is presented to the user showing the summary of SEO changes.
