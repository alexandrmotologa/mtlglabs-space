const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const projectsJsonPath = path.join(rootDir, 'projects.json');
const labsDir = path.join(rootDir, 'mtlglabs-space');
const siteDir = path.join(rootDir, 'mtlg-site');

if (!fs.existsSync(projectsJsonPath)) {
  console.error('projects.json not found in root scratch directory!');
  process.exit(1);
}

const projects = JSON.parse(fs.readFileSync(projectsJsonPath, 'utf8'));
console.log(`Loaded ${projects.length} canonical projects from Single Source of Truth.`);

// Mirror projects.json to both repo folders
fs.writeFileSync(path.join(labsDir, 'projects.json'), JSON.stringify(projects, null, 2), 'utf8');
fs.writeFileSync(path.join(siteDir, 'projects.json'), JSON.stringify(projects, null, 2), 'utf8');

// Helper to generate Media/Carousel HTML
function generateMediaHtml(p, isSite = false) {
  if (!p.images || p.images.length === 0) return '';
  
  if (p.images.length === 1) {
    const mediaClass = isSite ? 'project-media' : 'card-media';
    return `\n            <div class="${mediaClass}">
              <img src="${p.images[0]}" alt="${p.title} Screenshot Preview" loading="lazy" draggable="false" />
            </div>`;
  }

  const carouselClass = isSite ? 'project-carousel' : 'card-carousel';
  const slidesHtml = p.images.map((img, idx) => `
                <div class="carousel-slide" data-slide-index="${idx}">
                  <img src="${img}" alt="${p.title} Screenshot Preview ${idx + 1}" loading="lazy" draggable="false" />
                </div>`).join('');

  const dotsHtml = p.images.map((_, idx) => `
                <span class="carousel-dot ${idx === 0 ? 'active' : ''}" data-dot-index="${idx}"></span>`).join('');

  return `\n            <div class="${carouselClass}" data-total="${p.images.length}">
              <div class="carousel-track">
                ${slidesHtml}
              </div>
              <button type="button" class="carousel-btn carousel-prev" aria-label="Previous Image">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 18l-6-6 6-6"/></svg>
              </button>
              <button type="button" class="carousel-btn carousel-next" aria-label="Next Image">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 18l6-6-6-6"/></svg>
              </button>
              <div class="carousel-indicators">
                ${dotsHtml}
              </div>
              <div class="carousel-badge">1/${p.images.length}</div>
            </div>`;
}

// 1. Generate MTLG Labs Cards HTML
function generateLabsHtml(p) {
  const statusClass = p.badgeLabs.type === 'live' ? 'status-live' :
                      p.badgeLabs.type === 'dev' ? 'status-dev' :
                      p.badgeLabs.type === 'oss' ? 'status-oss' :
                      p.badgeLabs.type === 'ai' ? 'status-ai' : 'status-tool';

  const tagsHtml = p.tagsLabs.map(t => `<span class="tag">${t}</span>`).join('\n              ');
  const mediaHtml = generateMediaHtml(p, false);
  const escapedTitle = p.title.replace(/"/g, '&quot;');

  let actions = [];
  if (p.url) {
    const label = p.url.includes('github.com') ? 'GitHub Repo' : p.url.includes('play.google.com') ? 'Google Play Store' : 'Launch Project';
    actions.push(`<a href="${p.url}" target="_blank" rel="noopener" class="card-action-btn primary-action">
                <span>${label}</span>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>
              </a>`);
  }

  if (p.github && (!p.url || !p.url.includes('github.com'))) {
    actions.push(`<a href="${p.github}" target="_blank" rel="noopener" class="card-action-btn icon-action" title="View Source">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
              </a>`);
  }

  if (p.npm) {
    actions.push(`<a href="${p.npm}" target="_blank" rel="noopener" class="card-action-btn secondary-action" title="View NPM Package">
                <span>NPM</span>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>
              </a>`);
  }

  if (p.releases) {
    actions.push(`<a href="${p.releases}" target="_blank" rel="noopener" class="card-action-btn secondary-action" title="Download Desktop App">
                <span>Releases</span>
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
              </a>`);
  }

  if (p.extraLink) {
    actions.push(`<a href="${p.extraLink.url}" target="_blank" rel="noopener" class="card-action-btn secondary-action" title="${p.extraLink.label}">
                <span>${p.extraLink.label}</span>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>
              </a>`);
  }

  // Always append Share / Copy Link icon button at the end of the action row
  actions.push(`<button type="button" class="card-action-btn icon-action card-share-btn" data-project-id="${p.id}" data-project-title="${escapedTitle}" title="Copy direct link to ${escapedTitle}" aria-label="Copy direct link to ${escapedTitle}">
                <svg class="share-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                <svg class="check-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </button>`);

  const footerHtml = `\n            <div class="card-footer">\n              ${actions.join('\n              ')}\n            </div>`;

  return `          <!-- Project: ${p.title} -->
          <div class="product-card" id="${p.id}" data-category="${p.category}" data-project-id="${p.id}" data-project-title="${escapedTitle}">
            <div class="card-top">
              <span class="status-pill ${statusClass}">
                <span class="pulse-dot"></span> ${p.badgeLabs.text}
              </span>
              <span class="cat-pill">${p.catPill}</span>
            </div>${mediaHtml}
            <div class="card-main">
              <h3 class="product-name">${p.title}</h3>
              <p class="product-desc">${p.desc}</p>
            </div>
            <div class="card-tags">
              ${tagsHtml}
            </div>${footerHtml}
          </div>`;
}

// 2. Generate MTLG Site Cards HTML
function generateSiteHtml(p) {
  const badgeClass = p.badgeSite.type === 'live' ? 'live-badge' : 'dev-badge';
  const tagsHtml = p.tagsSite.map(t => `<span class="mini-tag">${t}</span>`).join('\n              ');
  const mediaHtml = generateMediaHtml(p, true);
  const escapedTitle = p.title.replace(/"/g, '&quot;');

  if (p.url) {
    return `          <!-- Project: ${p.title} -->
          <a href="${p.url}" target="_blank" rel="noopener" class="card project-card" id="${p.id}" data-project-id="${p.id}" data-project-title="${escapedTitle}">
            <div class="project-header">
              <div class="project-title-group">
                <span class="project-badge ${badgeClass}">${p.badgeSite.text}</span>
                <h3>${p.title}</h3>
              </div>
              <div class="project-header-actions">
                <button type="button" class="card-share-btn" data-project-id="${p.id}" data-project-title="${escapedTitle}" title="Copy direct link to ${escapedTitle}" aria-label="Copy direct link to ${escapedTitle}">
                  <svg class="share-icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                  <svg class="check-icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </button>
                <svg class="arrow-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17L17 7M17 7H7M17 7V17"/></svg>
              </div>
            </div>${mediaHtml}
            <p>${p.desc}</p>
            <div class="project-tags">
              ${tagsHtml}
            </div>
          </a>`;
  } else {
    return `          <!-- Project: ${p.title} -->
          <div class="card project-card project-card-static" id="${p.id}" data-project-id="${p.id}" data-project-title="${escapedTitle}">
            <div class="project-header">
              <div class="project-title-group">
                <span class="project-badge ${badgeClass}">${p.badgeSite.text}</span>
                <h3>${p.title}</h3>
              </div>
              <div class="project-header-actions">
                <button type="button" class="card-share-btn" data-project-id="${p.id}" data-project-title="${escapedTitle}" title="Copy direct link to ${escapedTitle}" aria-label="Copy direct link to ${escapedTitle}">
                  <svg class="share-icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                  <svg class="check-icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </button>
              </div>
            </div>${mediaHtml}
            <p>${p.desc}</p>
            <div class="project-tags">
              ${tagsHtml}
            </div>
          </div>`;
  }
}

// Build grids
const labsGridHtml = projects.map(generateLabsHtml).join('\n\n');
const siteGridHtml = projects.map(generateSiteHtml).join('\n\n');

// Update mtlglabs-space/index.html
let labsHtml = fs.readFileSync(path.join(labsDir, 'index.html'), 'utf8');
labsHtml = labsHtml.replace(
  /<div class="products-grid" id="products-grid">[\s\S]*?<\/div>\s*<\/section>/,
  `<div class="products-grid" id="products-grid">\n${labsGridHtml}\n        </div>\n      </section>`
);
fs.writeFileSync(path.join(labsDir, 'index.html'), labsHtml, 'utf8');
console.log('✓ Successfully synchronized mtlglabs-space');

// Update mtlg-site/index.html
let siteHtml = fs.readFileSync(path.join(siteDir, 'index.html'), 'utf8');
siteHtml = siteHtml.replace(
  /<div class="projects-grid">[\s\S]*?<\/div>\s*<\/section>/,
  `<div class="projects-grid">\n${siteGridHtml}\n        </div>\n      </section>`
);
fs.writeFileSync(path.join(siteDir, 'index.html'), siteHtml, 'utf8');
console.log('✓ Successfully synchronized mtlg-site');

console.log('--- ALL SITES SYNCHRONIZED ---');
