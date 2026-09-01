// Dynamic Year
const yearEl = document.getElementById('year');
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

// Product Category Filter
const filterButtons = document.querySelectorAll('.filter-btn');
const productCards = document.querySelectorAll('.product-card');

filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    // Remove active class from all
    filterButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.getAttribute('data-filter');

    productCards.forEach(card => {
      const category = card.getAttribute('data-category');
      if (filter === 'all' || category === filter) {
        card.style.display = 'flex';
        card.style.opacity = '0';
        setTimeout(() => {
          card.style.opacity = '1';
        }, 50);
      } else {
        card.style.display = 'none';
      }
    });
  });
});

// Interactive mouse glow tilt
productCards.forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  });
});

// Toast System
let toastTimer = null;
function showToast(message) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--neon-cyan);flex-shrink:0;"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg> <span>${message}</span>`;
  toast.classList.add('show');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}

// Share Direct Project Links
function setupShareButtons() {
  document.querySelectorAll('.card-share-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();

      const projectId = btn.getAttribute('data-project-id');
      const projectTitle = btn.getAttribute('data-project-title') || 'Project';
      const origin = window.location.origin;
      const pathname = window.location.pathname;
      const shareUrl = `${origin}${pathname}#${projectId}`;

      try {
        await navigator.clipboard.writeText(shareUrl);
      } catch (err) {
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = shareUrl;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }

      // Update URL in browser address bar without reload
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, '', '#' + projectId);
      }

      // Visual feedback on button
      btn.classList.add('copied');
      setTimeout(() => {
        btn.classList.remove('copied');
      }, 2000);

      // Visual highlight feedback on card
      const card = btn.closest('.product-card') || document.getElementById(projectId);
      if (card) {
        card.classList.remove('highlighted-project');
        void card.offsetWidth;
        card.classList.add('highlighted-project');
        setTimeout(() => {
          card.classList.remove('highlighted-project');
        }, 3600);
      }

      showToast(`Direct link to <strong>${projectTitle}</strong> copied!`);
    });
  });
}

// Deep Link Auto-Scroll & Neon Highlight
function handleProjectDeepLink() {
  let targetId = '';
  if (window.location.hash) {
    targetId = window.location.hash.substring(1).trim();
  } else {
    const urlParams = new URLSearchParams(window.location.search);
    targetId = urlParams.get('project') || urlParams.get('p') || '';
  }

  if (!targetId) return;

  const rawId = targetId.replace(/^project-/, '');
  const targetCard = document.getElementById(rawId) ||
                     document.getElementById(targetId) ||
                     document.querySelector(`[data-project-id="${rawId}"]`) ||
                     document.querySelector(`[data-project-id="${targetId}"]`);

  if (!targetCard) return;

  // Ensure card is visible if a category filter is active
  const cardCategory = targetCard.getAttribute('data-category');
  const activeFilterBtn = document.querySelector('.filter-btn.active');
  const activeFilter = activeFilterBtn ? activeFilterBtn.getAttribute('data-filter') : 'all';

  if (activeFilter !== 'all' && activeFilter !== cardCategory) {
    const matchingFilterBtn = document.querySelector(`.filter-btn[data-filter="${cardCategory}"]`) ||
                              document.querySelector('.filter-btn[data-filter="all"]');
    if (matchingFilterBtn) {
      matchingFilterBtn.click();
    } else {
      targetCard.style.display = 'flex';
      targetCard.style.opacity = '1';
    }
  }

  setTimeout(() => {
    targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    targetCard.classList.remove('highlighted-project');
    void targetCard.offsetWidth;
    targetCard.classList.add('highlighted-project');
    setTimeout(() => {
      targetCard.classList.remove('highlighted-project');
    }, 3600);
  }, 120);
}

// Initialize on Load & Hash Changes
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setupShareButtons();
    handleProjectDeepLink();
  });
} else {
  setupShareButtons();
  handleProjectDeepLink();
}

window.addEventListener('hashchange', handleProjectDeepLink);
