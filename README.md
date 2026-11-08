# MEMO Studio — Design systems, built to work

MEMO Studio is the computational design and design-technology practice of Alireza Memarian, building tools, systems and prototypes that help architects, engineers, fabricators and teams work with complex geometry and building data.

## Website

- **Homepage:** https://memortal.github.io/MEMO-STUDIO-/
- **Explore services and related work:** https://memortal.github.io/MEMO-STUDIO-/services.html
- **Portfolio archive:** https://memortal.github.io/Portfolio-/
- **GitHub:** https://github.com/Memortal

## What clients can hire MEMO Studio for

| Specialty | Typical projects |
|---|---|
| BIM Automation & Coordination | Revit/Dynamo automation, IFC/model inspection, QA, BIM reporting and sheet workflows |
| Generative Architecture & Housing | Parametric massing, housing configurations, adjacency and building generators |
| Custom Design Software & 3D Tools | Interactive browser applications, configurators, dashboards and model viewers |
| Digital Fabrication & Public Art | CNC geometry, feature walls, tessellated cladding, panels, sculpture and installations |
| GIS, Zoning & Site Feasibility | Parcel design, zoning explorations, spatial analysis and scenario comparisons |
| AI Design Systems & Research | Human-in-the-loop design agents, design knowledge, geometric reasoning and simulation |

Every service section in the website includes common problems, possible deliverables, target clients, and relevant examples and research.

## How the service website is organized

The **service explorer** is the central client-facing experience. Six specialty tabs organize related work; each specialty has nested sections for **Selected work**, **Physical work**, **Interactive tools**, **Explorations**, and **What I can deliver**. Visitors can search, open available demos and galleries, or email MEMO Studio about a specific scope.

- `index.html`, `styles.css`, `script.js`: homepage and responsive interactions.
- `services.html`, `atlas.css`, `atlas.js`: service explorer and nested portfolio tabs. `atlas.html` redirects earlier links to the new page.
- `data/work.json`: sanitized, categorized work and capabilities (98 distinct studies and projects and 66 service descriptions).
- `.github/workflows/pages.yml`: automatic GitHub Pages deployment.
- `favicon.svg`: MEMO Studio mark.

This is a static site: no client login, file upload, payment flow, external API keys or databases are needed. Use **Settings → Pages → GitHub Actions** for deployment; commits to `main` trigger publishing. To preview locally, run `python3 -m http.server 8000` in this repository.

## How work is labeled

- **Physical / archival work:** historic professional or physical examples, with employer/project credit where known.
- **Interactive prototype:** an experimental app or model; published status does not certify reliable operation.
- **Design proposal:** concept/proposal work; not a built commission.
- **Research exploration:** implementation research or evolving design methods.
- **Service capability:** a possible engagement, with sample output, scope and precedent rather than a claim of an existing turnkey product.

Complex design and engineering tools require client-specific testing. Building-code, life-safety, accessibility, structural and MEP conclusions must be reviewed by qualified professionals. A future project-memory platform is a research direction and is not marketed as an already deployed secure storage service.

## Contact

**Alireza Memarian**  
Computational designer · BIM automation · Design technology  
alireza.memaryan@gmail.com  
https://memostudio.design/

*From a design problem to a working system.*
