# Day 04: Portfolio Management System

> Built autonomously by Claude Code in a single session · Live at [balajiloganathan.net](https://balajiloganathan.net)

## 🎯 The Problem

After completing three daily microservices experiments, there was no central place to showcase the work. Projects lived only on GitHub — no public portfolio, no analytics, no CMS, no way to build an audience.

Day 04 made the infrastructure itself the experiment: **can Claude Code build and deploy a production-grade portfolio platform from scratch in one session?**

---

## 🏗️ What Was Built

4 microservices, each with a distinct responsibility:

| Service | Responsibility | Exposure |
|---------|---------------|----------|
| **Website** | Public portfolio — projects, case studies, about, updates | Public (balajiloganathan.net) |
| **CMS** | Admin panel — manage all content without code changes | Private |
| **Analytics** | Visitor tracking — page views, sources, devices, peak hours | Private |
| **Newsletter** | Subscriber management + email delivery via Resend | Private |

---

## 🌐 Live System

**→ [balajiloganathan.net](https://balajiloganathan.net)**

The portfolio platform is live in production. All previous Daily Microservices Challenge experiments (Day 01–03) are documented there as case studies with architecture diagrams, metrics, and key findings.

---

## 🏛️ Architecture

```
External Users
      ↓ HTTPS (Cloudflare CDN + SSL)
balajiloganathan.net
      ↓
Railway: WEBSITE SERVICE  (public, port 8080)
      ↓ HTTP — Railway private network
      ├─ CMS SERVICE          (private, port 8080)  → PostgreSQL
      ├─ ANALYTICS SERVICE    (private, port 8080)  → PostgreSQL
      └─ NEWSLETTER SERVICE   (private, port 8080)  → PostgreSQL
                                        ↓
                             PostgreSQL (Railway managed)
```

**Key design decisions:**
- Internal services communicate via Railway private DNS — never exposed to the public internet
- Cloudflare sits in front for CDN caching, DDoS protection, and SSL
- All media (profile photo, project screenshots) stored as base64 in PostgreSQL — no S3 needed at this scale

---

## 🛠️ Tech Stack

- **Runtime:** Node.js 18 + Express
- **Templating:** EJS
- **Database:** PostgreSQL (Railway managed)
- **Cloud:** Railway (4 services + 1 database)
- **CDN / DNS / SSL:** Cloudflare
- **Email:** Resend API
- **Domain:** balajiloganathan.net

---

## 💰 Cost

| Item | Cost |
|------|------|
| Claude Code API (build cost) | $10 one-time |
| Railway hosting | $5/month |
| Domain | ~$1.25/month |
| **Total ongoing** | **~$6.25/month** |

Compare to Wix ($16-23/mo), Webflow ($23-36/mo), or Squarespace ($16-23/mo) — with full code ownership, custom microservices, and no vendor lock-in.

---

## ✨ Key Features

- **Dark theme UI** — 15 theme presets, 6 background styles, all CMS-controlled
- **Project case studies** — full write-ups with architecture diagrams, metrics, screenshots gallery + lightbox
- **CMS admin panel** — add/edit projects, site settings, profile photo without touching code
- **Analytics dashboard** — visitor tracking, traffic sources, device breakdown
- **Newsletter** — subscriber list, bulk send, verified sender domain (emails land in inbox, not spam)
- **Fully responsive** — mobile-first design

---

## 🐛 Real Issues Encountered

| Issue | Cause | Fix |
|-------|-------|-----|
| Internal fetch failures | Node's `http` module couldn't handle Railway's HTTPS + port 8080 | Switched to Node 18 native `fetch()` |
| PayloadTooLargeError | Express default 100kb body limit rejected base64 image uploads | `express.json({ limit: '50mb' })` |
| CSS not updating on live site | Cloudflare CDN caching old stylesheet | Cache-bust with `styles.css?v=2` |
| Admin panels returning 404/500 | Missing Railway environment variables | Set `ADMIN_SECRET`, `ADMIN_EMAIL`, `FROM_EMAIL` in Railway dashboard |

All diagnosed and fixed systematically — no code was written by hand.

---

## 📊 Results

- ✅ 4 microservices deployed to Railway cloud
- ✅ Custom domain with SSL (balajiloganathan.net)
- ✅ Newsletter emails delivered to inbox (verified Resend domain)
- ✅ Project screenshots with lightbox carousel
- ✅ CMS-controlled content — no code needed to update the site
- ✅ Analytics tracking live visitors
- ✅ $10 build cost · $6.25/month to run

---

## 🔗 Links

- **Live site:** [balajiloganathan.net](https://balajiloganathan.net)
- **Full case study:** [balajiloganathan.net/projects/portfolio-management-system](https://balajiloganathan.net/projects/portfolio-management-system)
- **YouTube walkthrough:** [Watch on YouTube](https://youtu.be/eGdcCznRu-Y)
- **Series:** [Daily Microservices Challenge](https://github.com/devopsballog25-pixel/microservices-daily-challenge)

> ⚠️ **Note:** This repository contains documentation only. The full source code is maintained in a private repository as this system runs live infrastructure.
