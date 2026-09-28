(() => {
  'use strict';
  const body = document.body;
  const chapter = Number(body.dataset.chapter);
  const currentPage = Number(body.dataset.page);
  const total = Number(body.dataset.total);
  const pageInput = document.getElementById('page-input');
  let jumping = false;
  function jumpToPage() {
    if (!pageInput || jumping) return;
    const page = Number(pageInput.value);
    const error = document.getElementById('page-error');
    if (!Number.isInteger(page) || page < 1 || page > total || pageInput.value.trim() === '') {
      error.textContent = `Enter a whole page number from 1 to ${total}.`;
      error.hidden = false;
      pageInput.setAttribute('aria-invalid', 'true');
      pageInput.setAttribute('aria-describedby', 'page-error');
      return;
    }
    error.hidden = true;
    pageInput.removeAttribute('aria-invalid');
    if (page !== currentPage) {
      jumping = true;
      window.location.assign(`/ebook/chapter${chapter}/p${page}`);
    }
  }
  document.getElementById('page-jump')?.addEventListener('submit', event => { event.preventDefault(); jumpToPage(); });
  pageInput?.addEventListener('change', jumpToPage);
  pageInput?.addEventListener('input', () => { pageInput.removeAttribute('aria-invalid'); document.getElementById('page-error').hidden = true; });
  document.getElementById('chapter-select')?.addEventListener('change', event => {
    window.location.assign(`/ebook/chapter${Number(event.target.value)}/p1`);
  });
  document.querySelectorAll('[data-open]').forEach(button => button.addEventListener('click', () => {
    const dialog = document.getElementById(button.dataset.open);
    dialog.showModal();
    if (dialog.id === 'page-picker') dialog.querySelector('[aria-current="page"]')?.focus();
  }));
  document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => document.getElementById(button.dataset.close).close()));
  document.querySelectorAll('dialog').forEach(dialog => dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  }));
  const shell = document.getElementById('page-shell');
  let zoom = 1;
  let fitWidth = shell?.getBoundingClientRect().width || 660;
  function applyZoom(direction) {
    if (!shell) return;
    if (direction === 'fit') {
      zoom = 1; shell.style.width = ''; shell.style.maxWidth = ''; fitWidth = shell.getBoundingClientRect().width;
    } else {
      if (zoom === 1) fitWidth = shell.getBoundingClientRect().width;
      zoom = Math.max(0.75, Math.min(2.5, zoom + (direction === 'in' ? .25 : -.25)));
      shell.style.width = `${Math.round(fitWidth * zoom)}px`; shell.style.maxWidth = 'none';
    }
    document.getElementById('zoom-label').textContent = zoom === 1 ? 'Fit page' : `${Math.round(zoom*100)}%`;
    document.querySelector('[data-zoom="out"]').disabled = zoom <= .75;
    document.querySelector('[data-zoom="in"]').disabled = zoom >= 2.5;
  }
  document.querySelectorAll('[data-zoom]').forEach(button => button.addEventListener('click', () => applyZoom(button.dataset.zoom)));
  window.addEventListener('resize', () => applyZoom('fit'));
  document.addEventListener('keydown', event => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || document.querySelector('dialog[open]') || /INPUT|TEXTAREA|SELECT|BUTTON/.test(event.target.tagName)) return;
    const target = event.key === 'ArrowRight' ? document.querySelector('[data-nav="next"]') : event.key === 'ArrowLeft' ? document.querySelector('[data-nav="previous"]') : null;
    if (target) { event.preventDefault(); target.click(); }
  });
  window.addEventListener('pageshow', () => {
    jumping = false;
    if (pageInput) pageInput.value = String(currentPage);
    document.querySelectorAll('dialog[open]').forEach(dialog => dialog.close());
  });
})();
