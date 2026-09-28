const paths={
 home:'m3 10 9-7 9 7 M5 9v12h5v-7h4v7h5V9',
 book:'M3 4h6a3 3 0 0 1 3 3v14a4 4 0 0 0-4-2H3z M21 4h-6a3 3 0 0 0-3 3v14a4 4 0 0 1 4-2h5z',
 practice:'m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z',
 mistakes:'M6 3h12v18l-6-4-6 4z M10 8h4 M10 11h4',
 history:'M3 11a9 9 0 1 1 2.5 7 M3 4v7h7 M12 7v5l3 2',
 lock:'M6 10h12v11H6z M8 10V7a4 4 0 0 1 8 0v3'
};
const icon=name=>`<svg aria-hidden="true" viewBox="0 0 24 24"><path d="${paths[name]}"/></svg>`;
const entries=[['home','Home','Home','/'],['book','Textbook','Textbook','/ebook/chapter1/p1'],['practice','Practice','Practice','/practice/setup','setup'],['mistakes','Mistake Book','Mistakes','/practice/mistakes','mistakes'],['history','History','History','/practice/history','history']];
export function siteHeader(active){
 const title=entries.find(([key])=>key===active)?.[1]??'Practice';
 return `<header class="site-header app-header"><a class="site-brand" href="/" aria-label="Fieldnotes home">${icon('book')}<span><strong>Fieldnotes</strong><small>THE STUDY LIBRARY</small></span></a><div class="site-breadcrumb"><span>Algebra 2</span><span aria-hidden="true">/</span><strong>${title}</strong></div><span class="site-header-note">Units 1–10 · Algebra 2</span></header>`;
}
function navigation(active,mobile=false){return `<nav class="${mobile?'site-mobile-nav':'site-nav'}" aria-label="${mobile?'Mobile navigation':'Main navigation'}">${entries.map(([key,label,short,href,route])=>`<a class="site-nav-link ${active===key?'active':''}" href="${href}" ${active===key?'aria-current="page"':''} ${route?`data-route="${route}"`:''}>${icon(key)}<span>${mobile?short:label}</span></a>`).join('')}</nav>`;}
export function siteSidebar(active,extra=''){return `<aside class="site-sidebar"><p class="site-nav-caption">Your workspace</p>${navigation(active)}${extra?`<div class="site-context">${extra}</div>`:`<div class="site-sidebar-note"><span>Algebra 2</span><strong>A little, every day.</strong><a class="workbook-link" href="/workbook">Open practice workbook →</a><p>Read a lesson. Practice a question.<br>Build your understanding.</p><p>${icon('lock')} Saved on this browser.</p></div>`}</aside>`;}
export const siteMobileNav=active=>navigation(active,true);
