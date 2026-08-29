const fs = require('fs');

const labsHtml = fs.readFileSync('C:/Users/alexander/.gemini/antigravity-ide/scratch/mtlglabs-space/index.html', 'utf8');
const siteHtml = fs.readFileSync('C:/Users/alexander/.gemini/antigravity-ide/scratch/mtlg-site/index.html', 'utf8');

function extractLabsProjects(html) {
  const matches = [...html.matchAll(/<h3 class="product-name">(.*?)<\/h3>/g)];
  return matches.map(m => m[1].trim());
}

function extractSiteProjects(html) {
  const projectSection = html.split('<div class="projects-grid">')[1]?.split('</section>')[0] || '';
  const matches = [...projectSection.matchAll(/<h3>(.*?)<\/h3>/g)];
  return matches.map(m => m[1].trim());
}

const labsList = extractLabsProjects(labsHtml);
const siteList = extractSiteProjects(siteHtml);

console.log(`=== MTLG LABS PROJECTS (${labsList.length}) ===`);
labsList.forEach((p, idx) => console.log(`${idx + 1}. ${p}`));

console.log(`\n=== MTLG SITE PROJECTS (${siteList.length}) ===`);
siteList.forEach((p, idx) => console.log(`${idx + 1}. ${p}`));

const inLabsNotInSite = labsList.filter(p => !siteList.includes(p));
const inSiteNotInLabs = siteList.filter(p => !labsList.includes(p));

console.log('\n=== AUDIT RESULTS ===');
console.log('In Labs but NOT in Site:', inLabsNotInSite);
console.log('In Site but NOT in Labs:', inSiteNotInLabs);
console.log(`Synchronization status: ${inLabsNotInSite.length === 0 && inSiteNotInLabs.length === 0 ? '100% PERFECT MATCH' : 'MISMATCH'}`);
