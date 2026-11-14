(() => {
  const { platforms: PLATFORMS, palette: PALETTE } = window.SS_DATA;
  const BY_KEY = Object.fromEntries(PLATFORMS.map(p => [p.key, p]));
  const onPages = location.protocol.startsWith('http') && /\.github\.io$/.test(location.hostname);
  const SITE = onPages ? new URL('.', location.href).href.replace(/\/$/, '') : 'https://raw.githubusercontent.com/NextBuilder/Email-Signature/main';
  const LIB_KEY = 'signature-studio.library.v1';
  const OLD_KEY = 'signature-studio.v1';
  const OUT = 288;
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const isData = v => /^data:image\//i.test(v || '');

  const FONTS = {
    system: ['System Sans', "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif"],
    helvetica: ['Helvetica', "'Helvetica Neue',Helvetica,Arial,sans-serif"],
    georgia: ['Georgia (serif)', "Georgia,'Times New Roman',serif"],
    verdana: ['Verdana', 'Verdana,Geneva,sans-serif'],
    trebuchet: ['Trebuchet', "'Trebuchet MS',Tahoma,sans-serif"]
  };
  const ACCENTS = ['#E8364A', '#F97316', '#CA8A04', '#16A34A', '#0D9488', '#2563EB', '#7C3AED', '#DB2777', '#111318'];
  const ICON_COLORS = ['graphite', 'black', 'slate', 'red', 'orange', 'gold', 'green', 'teal', 'blue', 'purple', 'pink', 'white', 'brand'];
  const TEMPLATES = {
    classic: ['Classic', 'Photo, divider, details', '<span class="av"></span><span class="vr"></span><span class="col"><i style="width:70px;height:7px;background:#9AA0AA"></i><i style="width:48px;height:5px"></i><i style="width:60px;height:5px"></i></span>'],
    stacked: ['Stacked', 'Great on phones', '<span class="col" style="justify-items:start"><span class="av" style="width:18px;height:18px"></span><i style="width:64px;height:6px;background:#9AA0AA"></i><i style="width:44px;height:5px"></i></span>'],
    minimal: ['Minimal', 'Text and icons only', '<span class="col"><i style="width:78px;height:7px;background:#9AA0AA"></i><i style="width:56px;height:5px"></i><i style="width:66px;height:5px"></i></span>'],
    accent: ['Accent', 'Bold colour bar', '<span class="av"></span><span style="width:3px;height:34px;border-radius:2px;background:var(--accent)"></span><span class="col"><i style="width:70px;height:7px;background:#9AA0AA"></i><i style="width:48px;height:5px"></i></span>']
  };
  const HINTS = {
    youtube: 'youtube.com/@channel', instagram: 'instagram.com/username', x: 'x.com/username', linkedin: 'linkedin.com/in/username',
    facebook: 'facebook.com/page', tiktok: 'tiktok.com/@username', threads: 'threads.net/@username', bluesky: 'bsky.app/profile/handle',
    mastodon: 'mastodon.social/@username', github: 'github.com/username', email: 'you@company.com', phone: '+91 98xxx xxxxx',
    website: 'yourwebsite.com', location: 'maps.google.com/?q=Your+City', whatsapp: 'wa.me/9198xxxxxxxx', telegram: 't.me/username',
    calendly: 'calendly.com/username', medium: 'medium.com/@username', substack: 'name.substack.com'
  };

  const DEFAULTS = {
    template: 'classic', name: '', pronouns: '', title: '', company: '', phone: '', email: '', website: '', location: '',
    address: '', tagline: '', disclaimer: '', photo: '', photoShape: 'circle', photoSize: 56, photoFit: 'cover',
    photoTrim: true, photoBg: false, links: [], ctaOn: false, ctaLabel: '', ctaUrl: '', ctaStyle: 'filled',
    accent: '#E8364A', font: 'system', nameSize: 17, iconStyle: 'outline', iconColor: 'graphite', iconSize: 20, iconGap: 8
  };
  const EXAMPLE = {
    ...DEFAULTS, name: 'Kishan Pratap Singh', title: 'Founder', company: 'Next Builder', photo: `${SITE}/assets/emblem.png`,
    links: [
      ['youtube', 'https://youtube.com/@NextBuilderIO'], ['instagram', 'https://instagram.com/next_builder'],
      ['github', 'https://github.com/NextBuilder'], ['linkedin', 'https://www.linkedin.com/company/nextbuilderio/'],
      ['x', 'https://x.com/NEXTBUILDERIO'], ['instructables', 'https://www.instructables.com/member/Next%20Builder%20DIY/'],
      ['hackster', 'https://hackster.io/NEXTBUILDER'], ['hackaday', 'https://hackaday.io/NextBuilder']
    ].map(([key, url]) => ({ key, url })),
    ctaLabel: 'Watch on YouTube', ctaUrl: 'https://youtube.com/@NextBuilderIO'
  };
  const clean = d => {
    const s = { ...DEFAULTS, ...(d || {}) };
    s.links = (Array.isArray(s.links) ? s.links : []).filter(l => l && BY_KEY[l.key]).map(l => ({ key: l.key, url: String(l.url || '') }));
    if (!TEMPLATES[s.template]) s.template = 'classic';
    if (!FONTS[s.font]) s.font = 'system';
    return s;
  };

  let lib = loadLib();
  let state = current();
  const ui = { theme: 'light', device: 'desktop', guide: 'gmail', filter: '', source: null, sourceType: '', sourceName: 'logo' };

  function loadLib() {
    try {
      const l = JSON.parse(localStorage.getItem(LIB_KEY));
      if (l && Array.isArray(l.items) && l.items.length) { l.items.forEach(i => { i.data = clean(i.data); }); return l; }
    } catch (e) {}
    let first = structuredClone(EXAMPLE);
    try { const old = JSON.parse(localStorage.getItem(OLD_KEY)); if (old && old.template) first = clean(old); } catch (e) {}
    const id = uid();
    return { active: id, items: [{ id, data: first }] };
  }
  function current() { return (lib.items.find(i => i.id === lib.active) || lib.items[0]).data; }
  let saveT;
  function save() { clearTimeout(saveT); saveT = setTimeout(() => { try { localStorage.setItem(LIB_KEY, JSON.stringify(lib)); } catch (e) { toast('Browser storage is full — export your signature to keep it'); } }, 250); }

  const iconUrl = (key, style = state.iconStyle, color = state.iconColor) => {
    const c = style === 'badge' && color === 'white' ? 'graphite' : color;
    return `${SITE}/icons/${style}/${c}/${key}.png`;
  };
  function href(key, v) {
    v = (v || '').trim();
    if (!v) return '';
    if (key === 'email' || (/^[^\s@/]+@[^\s@]+\.[^\s@]+$/.test(v) && !/^mailto:/i.test(v))) return /^mailto:/i.test(v) ? v : `mailto:${v}`;
    if (key === 'phone') return /^tel:/i.test(v) ? v : `tel:${v.replace(/[^\d+]/g, '')}`;
    return /^[a-z][a-z0-9+.-]*:/i.test(v) ? v : `https://${v.replace(/^\/+/, '')}`;
  }
  const textOn = hex => {
    const n = parseInt(hex.replace('#', '').padEnd(6, '0').slice(0, 6), 16);
    return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) > 170 ? '#111318' : '#FFFFFF';
  };

  function build(s, preview = false) {
    const F = FONTS[s.font]?.[1] || FONTS.system[1];
    const INK = '#111318', MUTED = '#6E7480', BODY = '#3D424D';
    const ink = preview ? ' data-ink' : '', rule = preview ? ' data-rule' : '', body = preview ? ' data-body' : '';
    const font = `font-family:${F};`;
    const links = s.links.filter(l => l.url && l.url.trim());
    const hasPhoto = !!(s.photo && s.photo.trim()) && s.template !== 'minimal';
    const size = +s.photoSize || 56;
    const radius = s.photoShape === 'circle' ? '50%' : s.photoShape === 'rounded' ? `${Math.round(size * .22)}px` : '0';

    const photo = hasPhoto ? `<img src="${esc(s.photo.trim())}" width="${size}" height="${size}" alt="${esc(s.name || 'Logo')}" style="display:block;border:0;width:${size}px;height:${size}px;border-radius:${radius};object-fit:cover;">` : '';
    const pron = s.pronouns ? `<span style="font-size:13px;font-weight:400;color:${MUTED};">&nbsp;(${esc(s.pronouns)})</span>` : '';
    const name = s.name ? `<div${ink} style="${font}font-size:${s.nameSize}px;line-height:1.25;font-weight:600;color:${INK};letter-spacing:.1px;">${esc(s.name)}${pron}</div>` : '';
    const company = s.company ? `<span style="color:${s.accent};font-weight:600;">${esc(s.company)}</span>` : '';
    const titleLine = (s.title || s.company) ? `<div style="${font}font-size:13px;line-height:18px;color:${MUTED};padding-top:2px;">${esc(s.title)}${s.title && s.company ? ', ' : ''}${company}</div>` : '';
    const tagline = s.tagline ? `<div style="${font}font-size:12.5px;line-height:18px;color:${MUTED};font-style:italic;padding-top:4px;">${esc(s.tagline)}</div>` : '';

    const contactItems = [['phone', s.phone], ['email', s.email], ['website', s.website], ['location', s.location]]
      .filter(([, v]) => v && v.trim()).map(([k, v]) => {
        const label = esc(k === 'website' ? v.replace(/^https?:\/\//i, '').replace(/\/$/, '') : v);
        const h = k === 'location' ? `https://maps.google.com/?q=${encodeURIComponent(v)}` : href(k, v);
        return `<a${body} href="${esc(h)}" target="_blank" style="color:${BODY};text-decoration:none;">${label}</a>`;
      });
    const contacts = contactItems.length ? `<div${body} style="${font}font-size:12.5px;line-height:18px;color:${BODY};padding-top:8px;">${contactItems.join(`<span style="color:#C3C7CE;">&nbsp;&nbsp;·&nbsp;&nbsp;</span>`)}</div>` : '';
    const address = s.address ? `<div style="${font}font-size:12.5px;line-height:18px;color:${MUTED};padding-top:${contacts ? 2 : 8}px;">${esc(s.address)}</div>` : '';

    const icons = links.length ? `<table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;margin-top:${contacts || address ? 10 : 9}px;"><tr>${links.map((l, i) => {
      const p = BY_KEY[l.key];
      return `<td style="padding:0 ${i === links.length - 1 ? 0 : s.iconGap}px 0 0;"><a href="${esc(href(l.key, l.url))}" target="_blank" title="${esc(p.name)}" style="text-decoration:none;"><img src="${iconUrl(l.key, s.iconStyle, s.iconColor)}" width="${s.iconSize}" height="${s.iconSize}" alt="${esc(p.name)}" style="display:block;border:0;width:${s.iconSize}px;height:${s.iconSize}px;"></a></td>`;
    }).join('')}</tr></table>` : '';

    let cta = '';
    if (s.ctaOn && s.ctaLabel && s.ctaUrl) {
      const u = esc(href('cta', s.ctaUrl)), l = esc(s.ctaLabel);
      const a = `${font}font-size:12.5px;font-weight:600;line-height:16px;text-decoration:none;`;
      if (s.ctaStyle === 'link') cta = `<div style="${font}font-size:12.5px;line-height:18px;padding-top:10px;"><a href="${u}" target="_blank" style="${a}color:${s.accent};">${l}&nbsp;&rarr;</a></div>`;
      else {
        const filled = s.ctaStyle === 'filled';
        cta = `<table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:separate;margin-top:12px;"><tr><td style="border-radius:8px;${filled ? `background:${s.accent};` : `border:1.5px solid ${s.accent};`}"><a href="${u}" target="_blank" style="${a}display:inline-block;padding:${filled ? '8px 14px' : '6.5px 12.5px'};border-radius:8px;color:${filled ? textOn(s.accent) : s.accent};">${l}</a></td></tr></table>`;
      }
    }

    const content = `${name}${titleLine}${tagline}${contacts}${address}${icons}${cta}`;
    const table = inner => `<table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;${font}">${inner}</table>`;
    const vr = `<td${rule} width="1" style="width:1px;background:#E4E6EA;font-size:0;line-height:0;">&nbsp;</td><td width="14" style="width:14px;font-size:0;line-height:0;">&nbsp;</td>`;

    let main;
    switch (s.template) {
      case 'stacked': main = table(`${hasPhoto ? `<tr><td style="padding:0 0 12px 0;">${photo}</td></tr>` : ''}<tr><td style="vertical-align:top;">${content}</td></tr>`); break;
      case 'minimal': main = table(`<tr><td style="vertical-align:top;">${content}</td></tr>`); break;
      case 'accent': main = table(`<tr>${hasPhoto ? `<td style="padding:0 14px 0 0;vertical-align:middle;">${photo}</td>` : ''}<td style="width:3px;background:${s.accent};border-radius:2px;font-size:0;line-height:0;">&nbsp;</td><td style="padding:2px 0 2px 14px;vertical-align:middle;">${content}</td></tr>`); break;
      default: main = table(`<tr>${hasPhoto ? `<td style="padding:0 14px 0 0;vertical-align:middle;">${photo}</td>${vr}` : ''}<td style="vertical-align:middle;">${content}</td></tr>`);
    }
    const disclaimer = s.disclaimer ? `<div style="${font}font-size:11px;line-height:16px;color:#9AA0AA;max-width:520px;padding-top:14px;">${esc(s.disclaimer).replace(/\n/g, '<br>')}</div>` : '';
    return main + disclaimer;
  }

  function plainText(s) {
    const L = [];
    if (s.name) L.push(s.name + (s.pronouns ? ` (${s.pronouns})` : ''));
    const tc = [s.title, s.company].filter(Boolean).join(', ');
    if (tc) L.push(tc);
    if (s.tagline) L.push(s.tagline);
    const c = [s.phone, s.email, s.website && s.website.replace(/^https?:\/\//i, ''), s.location].filter(v => v && v.trim());
    if (c.length) L.push(c.join(' | '));
    if (s.address) L.push(s.address);
    const links = s.links.filter(l => l.url && l.url.trim());
    if (links.length) { L.push(''); links.forEach(l => L.push(`${BY_KEY[l.key].name}: ${href(l.key, l.url).replace(/^(mailto|tel):/i, '')}`)); }
    if (s.ctaOn && s.ctaLabel && s.ctaUrl) { L.push(''); L.push(`${s.ctaLabel}: ${href('cta', s.ctaUrl)}`); }
    if (s.disclaimer) { L.push(''); L.push(s.disclaimer); }
    return L.join('\n');
  }

  function render() {
    $('#sig').innerHTML = build(state, true);
    const len = build(state).replace(/data:image\/[^"]+/g, 'https://example.com/your-logo.png').length;
    $('#charCount').textContent = `${(len / 1000).toFixed(1)}K / 10K`;
    const pct = Math.min(100, len / 100);
    $('#charBar').style.width = `${pct}%`;
    $('#charBar').style.background = pct > 90 ? '#E8364A' : pct > 70 ? '#CA8A04' : '#16A34A';
    const thumb = $('#photoThumb');
    thumb.style.backgroundImage = state.photo ? `url("${state.photo.replace(/"/g, '%22')}")` : '';
    thumb.classList.toggle('has', !!state.photo);
    thumb.style.borderRadius = state.photoShape === 'circle' ? '50%' : state.photoShape === 'rounded' ? '16px' : '6px';
    const embedded = isData(state.photo);
    $('#gmailNotice').hidden = !embedded;
    $('#enhance').hidden = !(embedded && ui.source);
    $('#dropTitle').textContent = embedded ? 'Image uploaded and enhanced' : 'Upload a photo or logo';
    $('#dropSub').textContent = embedded ? (ui.source ? 'Click or drop a new image to replace it' : 'Embedded image · click or drop to replace') : 'Drop an image here or click to browse · PNG, JPG, SVG, WebP';
    const link = $('#photoLink');
    if (document.activeElement !== link) link.value = embedded ? '' : state.photo;
    link.placeholder = embedded ? 'Using your uploaded image' : 'https://…/photo.png';
    $('#photoSizeOut').textContent = `${state.photoSize}px`;
    $('#iconGapOut').textContent = `${state.iconGap}px`;
    $('#linkCount').textContent = state.links.length ? `${state.links.length} added` : '';
    $('#ctaHint').textContent = state.ctaOn ? 'On' : 'Off';
    $('#tplHint').textContent = TEMPLATES[state.template][0];
    document.documentElement.style.setProperty('--accent', state.accent);
    if (ui.guide === 'gmail') renderGuide();
    renderLibrary(true);
    save();
  }

  function syncInputs() {
    $$('[data-k]').forEach(el => { if (el.id !== 'photoLink') el.value = state[el.dataset.k] ?? ''; });
    $('#ctaOn').checked = !!state.ctaOn;
    $('#optTrim').checked = !!state.photoTrim;
    $('#optBg').checked = !!state.photoBg;
    setSeg('#shapeSeg', state.photoShape); setSeg('#nameSeg', String(state.nameSize));
    setSeg('#iconStyleSeg', state.iconStyle); setSeg('#iconSizeSeg', String(state.iconSize));
    setSeg('#ctaStyleSeg', state.ctaStyle); setSeg('#fitSeg', state.photoFit);
    renderTemplates(); renderSwatches(); renderLinks(); renderPicker(); renderLibrary(); render();
  }

  function renderLibrary(labelsOnly) {
    const sel = $('#libSelect');
    const seen = {};
    const labels = lib.items.map(i => {
      const base = (i.data.name || '').trim() || 'Untitled signature';
      seen[base] = (seen[base] || 0) + 1;
      return seen[base] > 1 ? `${base} (${seen[base]})` : base;
    });
    if (labelsOnly && sel.options.length === lib.items.length) {
      lib.items.forEach((i, n) => { if (sel.options[n].textContent !== labels[n]) sel.options[n].textContent = labels[n]; });
      return;
    }
    sel.innerHTML = lib.items.map((i, n) => `<option value="${i.id}"${i.id === lib.active ? ' selected' : ''}>${esc(labels[n])}</option>`).join('');
  }
  function activate(id) { lib.active = id; state = current(); ui.source = null; syncInputs(); }

  function setSeg(sel, v) { $$(`${sel} button`).forEach(b => b.classList.toggle('on', b.dataset.v === v)); }
  function seg(sel, fn) { $$(`${sel} button`).forEach(b => b.addEventListener('click', () => { setSeg(sel, b.dataset.v); fn(b.dataset.v); })); }

  function renderTemplates() {
    $('#templates').innerHTML = Object.entries(TEMPLATES).map(([k, [n, sub, art]]) =>
      `<button type="button" class="tpl${state.template === k ? ' on' : ''}" data-t="${k}"><div class="tpl-art">${art}</div><div class="tpl-name">${n}</div><div class="tpl-sub">${sub}</div></button>`).join('');
    $$('.tpl').forEach(b => b.addEventListener('click', () => { state.template = b.dataset.t; renderTemplates(); render(); }));
  }

  function renderSwatches() {
    $('#accentSw').innerHTML = ACCENTS.map(c => `<button type="button" class="sw${state.accent.toLowerCase() === c.toLowerCase() ? ' on' : ''}" style="background:${c}" data-c="${c}" title="${c}"></button>`).join('') +
      `<label class="sw custom${ACCENTS.map(c => c.toLowerCase()).includes(state.accent.toLowerCase()) ? '' : ' on'}" title="Custom colour"><input type="color" value="${state.accent}"></label>`;
    $$('#accentSw .sw[data-c]').forEach(b => b.addEventListener('click', () => { state.accent = b.dataset.c; renderSwatches(); render(); }));
    $('#accentSw input').addEventListener('input', e => { state.accent = e.target.value; render(); });
    $('#accentSw input').addEventListener('change', renderSwatches);
    const colors = ICON_COLORS.filter(c => !(state.iconStyle === 'badge' && c === 'white'));
    if (!colors.includes(state.iconColor)) state.iconColor = 'graphite';
    $('#iconSw').innerHTML = colors.map(c => `<button type="button" class="sw${c === 'brand' ? ' brand' : ''}${state.iconColor === c ? ' on' : ''}" ${c === 'brand' ? '' : `style="background:${PALETTE[c]}"`} data-c="${c}" title="${c === 'brand' ? 'Official brand colours' : c[0].toUpperCase() + c.slice(1)}"></button>`).join('');
    $$('#iconSw .sw').forEach(b => b.addEventListener('click', () => { state.iconColor = b.dataset.c; renderSwatches(); render(); }));
  }

  function renderLinks() {
    const box = $('#links');
    if (!state.links.length) { box.innerHTML = '<div class="empty">Pick platforms below to add your links.</div>'; return; }
    box.innerHTML = state.links.map((l, i) => {
      const p = BY_KEY[l.key];
      return `<div class="link-row" data-i="${i}">
        <div class="link-ic"><img src="${iconUrl(l.key, 'outline', 'graphite')}" alt=""></div>
        <label class="link-main"><span class="link-name">${esc(p.name)}</span><input value="${esc(l.url)}" placeholder="${esc(HINTS[l.key] || `${p.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com/username`)}" data-li="${i}" spellcheck="false" autocapitalize="off"></label>
        <div class="row-btns">
          <button class="ib" type="button" data-up="${i}" title="Move up" ${i === 0 ? 'disabled style="opacity:.3"' : ''}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 15 6-6 6 6"/></svg></button>
          <button class="ib" type="button" data-down="${i}" title="Move down" ${i === state.links.length - 1 ? 'disabled style="opacity:.3"' : ''}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></button>
          <button class="ib" type="button" data-rm="${i}" title="Remove"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
        </div></div>`;
    }).join('');
    $$('[data-li]').forEach(inp => inp.addEventListener('input', e => { state.links[+e.target.dataset.li].url = e.target.value; render(); }));
    const move = (i, d) => { const j = i + d; [state.links[i], state.links[j]] = [state.links[j], state.links[i]]; renderLinks(); render(); };
    $$('[data-up]').forEach(b => b.addEventListener('click', () => move(+b.dataset.up, -1)));
    $$('[data-down]').forEach(b => b.addEventListener('click', () => move(+b.dataset.down, 1)));
    $$('[data-rm]').forEach(b => b.addEventListener('click', () => { state.links.splice(+b.dataset.rm, 1); renderLinks(); renderPicker(); render(); }));
  }

  function renderPicker() {
    const q = ui.filter.trim().toLowerCase();
    const added = new Set(state.links.map(l => l.key));
    const groups = {};
    PLATFORMS.filter(p => !q || p.name.toLowerCase().includes(q)).forEach(p => (groups[p.group] ||= []).push(p));
    $('#groups').innerHTML = Object.entries(groups).map(([g, list]) => `<div><div class="group-label">${g}</div><div class="chips">${list.map(p =>
      `<button type="button" class="chip${added.has(p.key) ? ' added' : ''}" data-p="${p.key}"><img src="${iconUrl(p.key, 'outline', 'graphite')}" alt="" loading="lazy">${esc(p.name)}</button>`).join('')}</div></div>`).join('') || '<div class="empty">No platform matches that search.</div>';
    $$('.chip').forEach(c => c.addEventListener('click', () => {
      const k = c.dataset.p, i = state.links.findIndex(l => l.key === k);
      if (i >= 0) state.links.splice(i, 1);
      else { state.links.push({ key: k, url: '' }); setTimeout(() => { const el = $(`[data-li="${state.links.length - 1}"]`); el && el.focus(); }, 0); }
      renderLinks(); renderPicker(); render();
    }));
  }

  function loadImage(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('unreadable')); };
      img.src = url;
    });
  }

  function stepScale(src, sx, sy, sw, sh, dw, dh) {
    let cur = src, cx = sx, cy = sy, cw = sw, ch = sh;
    while (cw / 2 >= dw && ch / 2 >= dh) {
      const c = document.createElement('canvas');
      c.width = Math.round(cw / 2); c.height = Math.round(ch / 2);
      const g = c.getContext('2d'); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
      g.drawImage(cur, cx, cy, cw, ch, 0, 0, c.width, c.height);
      cur = c; cx = 0; cy = 0; cw = c.width; ch = c.height;
    }
    while (cw * 2 <= dw && ch * 2 <= dh) {
      const c = document.createElement('canvas');
      c.width = Math.round(cw * 2); c.height = Math.round(ch * 2);
      const g = c.getContext('2d'); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
      g.drawImage(cur, cx, cy, cw, ch, 0, 0, c.width, c.height);
      cur = c; cx = 0; cy = 0; cw = c.width; ch = c.height;
    }
    return { cur, cx, cy, cw, ch };
  }

  function sharpen(ctx, w, h, amount) {
    const img = ctx.getImageData(0, 0, w, h), d = img.data, o = new Uint8ClampedArray(d);
    for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
      const i = (y * w + x) * 4;
      if (d[i + 3] < 10) continue;
      for (let c = 0; c < 3; c++) {
        o[i + c] = d[i + c] * (1 + 4 * amount) - amount * (d[i - 4 + c] + d[i + 4 + c] + d[i - w * 4 + c] + d[i + w * 4 + c]);
      }
    }
    img.data.set(o); ctx.putImageData(img, 0, 0);
  }

  function smoothEdges(ctx, w, h, r) {
    const img = ctx.getImageData(0, 0, w, h), d = img.data;
    let a = new Float32Array(w * h);
    for (let i = 0; i < w * h; i++) a[i] = d[i * 4 + 3] / 255;
    const blur = (src, horiz) => {
      const out = new Float32Array(w * h), n = 2 * r + 1;
      for (let o = 0; o < (horiz ? h : w); o++) {
        let acc = 0;
        const at = i => { const c = Math.min(Math.max(i, 0), (horiz ? w : h) - 1); return horiz ? src[o * w + c] : src[c * w + o]; };
        for (let i = -r; i <= r; i++) acc += at(i);
        for (let i = 0; i < (horiz ? w : h); i++) {
          out[horiz ? o * w + i : i * w + o] = acc / n;
          acc += at(i + r + 1) - at(i - r);
        }
      }
      return out;
    };
    for (let pass = 0; pass < 2; pass++) a = blur(blur(a, true), false);
    for (let i = 0; i < w * h; i++) {
      const t = Math.min(1, Math.max(0, (a[i] - .32) / .36));
      d[i * 4 + 3] = Math.round(255 * t * t * (3 - 2 * t));
    }
    ctx.putImageData(img, 0, 0);
  }

  function processImage(img) {
    let w = img.naturalWidth || img.width || 1024, h = img.naturalHeight || img.height || 1024;
    const isVector = /svg/i.test(ui.sourceType);
    const k = isVector ? 1600 / Math.max(w, h) : Math.min(1, 2400 / Math.max(w, h));
    w = Math.max(1, Math.round(w * k)); h = Math.max(1, Math.round(h * k));
    const c0 = document.createElement('canvas'); c0.width = w; c0.height = h;
    const g0 = c0.getContext('2d', { willReadFrequently: true });
    g0.imageSmoothingQuality = 'high';
    g0.drawImage(img, 0, 0, w, h);
    const data = g0.getImageData(0, 0, w, h), d = data.data;
    const px = (x, y) => { const i = (y * w + x) * 4; return [d[i], d[i + 1], d[i + 2], d[i + 3]]; };
    const corners = [px(0, 0), px(w - 1, 0), px(0, h - 1), px(w - 1, h - 1)];
    const opaque = corners.every(c => c[3] > 245);
    const bg = [0, 1, 2].map(n => corners.reduce((a, c) => a + c[n], 0) / 4);
    const dist = (r, g, b) => Math.sqrt((r - bg[0]) ** 2 + (g - bg[1]) ** 2 + (b - bg[2]) ** 2);
    const uniform = opaque && corners.every(c => dist(c[0], c[1], c[2]) < 26);
    const tags = [];
    let removed = false;

    if (state.photoBg && uniform) {
      for (let i = 0; i < d.length; i += 4) {
        const dd = dist(d[i], d[i + 1], d[i + 2]);
        if (dd < 20) d[i + 3] = 0; else if (dd < 52) d[i + 3] = Math.round(d[i + 3] * (dd - 20) / 32);
      }
      g0.putImageData(data, 0, 0); removed = true; tags.push('Background removed');
    }

    let bx = 0, by = 0, bw = w, bh = h;
    if (state.photoTrim) {
      let x0 = w, y0 = h, x1 = -1, y1 = -1;
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        if (d[i + 3] > 12 && (removed || !uniform || dist(d[i], d[i + 1], d[i + 2]) > 26)) {
          if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
        }
      }
      if (x1 >= x0 && y1 >= y0 && ((x1 - x0 + 1) < w * .98 || (y1 - y0 + 1) < h * .98)) {
        const pad = Math.round(Math.max(x1 - x0, y1 - y0) * .04);
        bx = Math.max(0, x0 - pad); by = Math.max(0, y0 - pad);
        bw = Math.min(w, x1 + pad + 1) - bx; bh = Math.min(h, y1 + pad + 1) - by;
        tags.push('Edges trimmed');
      }
    }

    const out = document.createElement('canvas'); out.width = OUT; out.height = OUT;
    const go = out.getContext('2d', { willReadFrequently: true }); go.imageSmoothingEnabled = true; go.imageSmoothingQuality = 'high';
    let sx, sy, sw, sh, dx, dy, dw, dh;
    if (state.photoFit === 'cover') {
      const side = Math.min(bw, bh);
      sx = bx + (bw - side) / 2; sy = by + (bh - side) / 2; sw = sh = side; dx = dy = 0; dw = dh = OUT;
    } else {
      const s = Math.min(OUT * .9 / bw, OUT * .9 / bh);
      sx = bx; sy = by; sw = bw; sh = bh; dw = bw * s; dh = bh * s; dx = (OUT - dw) / 2; dy = (OUT - dh) / 2;
    }
    if (!removed && uniform && state.photoFit === 'contain') { go.fillStyle = `rgb(${bg.map(Math.round).join(',')})`; go.fillRect(0, 0, OUT, OUT); }
    const st = stepScale(c0, sx, sy, sw, sh, dw, dh);
    go.drawImage(st.cur, st.cx, st.cy, st.cw, st.ch, dx, dy, dw, dh);
    const up = isVector ? 1 : dw / (sw / k);
    const transparent = removed || !opaque;
    if (up > 2.5 && transparent) smoothEdges(go, OUT, OUT, Math.max(1, Math.round(up * .5)));
    if (up > 1.25) { sharpen(go, OUT, OUT, Math.min(.35, .12 + (up - 1) * .06)); tags.unshift(`Upscaled ${up.toFixed(1)}×`); }
    else tags.unshift(isVector ? 'Rendered from vector' : 'Optimised');

    const od = go.getImageData(0, 0, OUT, OUT).data;
    let alpha = false;
    for (let i = 3; i < od.length; i += 4) if (od[i] < 250) { alpha = true; break; }
    const url = alpha ? out.toDataURL('image/png') : out.toDataURL('image/jpeg', .92);
    return { url, meta: [`${OUT} × ${OUT}`, alpha ? 'PNG' : 'JPG', `${Math.round(url.length * .75 / 1024)} KB`, ...tags] };
  }

  function applyProcessed() {
    if (!ui.source) return;
    const r = processImage(ui.source);
    state.photo = r.url;
    $('#enhanceMeta').innerHTML = r.meta.map((t, i) => `<span class="tag${i === 3 ? ' good' : ''}">${esc(t)}</span>`).join('');
    render();
  }

  async function handleFile(file) {
    if (!file) return;
    if (!/^image\//.test(file.type)) { toast('Please choose an image file'); return; }
    if (file.size > 15 * 1024 * 1024) { toast('That image is over 15 MB — try a smaller one'); return; }
    try {
      ui.sourceType = file.type; ui.sourceName = file.name.replace(/\.[^.]+$/, '') || 'logo';
      ui.source = await loadImage(file);
      applyProcessed();
      toast('Image enhanced and added');
    } catch (e) { toast('That image could not be read'); }
  }

  const GUIDES = {
    gmail: () => `<ol class="steps">
      <li><span>Click <b>Copy signature</b>.</span></li>
      <li><span>Open <b>Gmail → Settings → See all settings → General</b>. The button below takes you straight there.</span></li>
      <li><span>Scroll to <b>Signature</b>, click <b>Create new</b> and give it a name.</span></li>
      <li><span>Click inside the signature box and paste with <kbd>Ctrl</kbd> + <kbd>V</kbd> (<kbd>⌘</kbd> + <kbd>V</kbd> on Mac).</span></li>
      <li><span>Under <b>Signature defaults</b>, pick it for <b>For new emails use</b> and <b>On reply/forward use</b>.</span></li>
      <li><span>Scroll to the bottom and click <b>Save Changes</b>.</span></li></ol>
      ${isData(state.photo) ? '<p class="note"><b>Uploaded image:</b> Gmail removes embedded images. Follow the short steps under <b>Photo or logo</b> to let Gmail host it.</p>' : ''}
      <div class="guide-cta"><a class="btn primary" href="https://mail.google.com/mail/u/0/#settings/general" target="_blank" rel="noopener">Open Gmail signature settings</a></div>
      <p class="note">Signed in to several Google accounts? Change <kbd>/u/0/</kbd> in the link to <kbd>/u/1/</kbd>, <kbd>/u/2/</kbd>… until it opens the right inbox.</p>`,
    mobile: () => `<ol class="steps">
      <li><span>Set up the signature in Gmail on a computer first (see the Gmail tab).</span></li>
      <li><span><b>iPhone &amp; iPad:</b> Gmail app → Menu ☰ → <b>Settings</b> → your account → <b>Signature settings</b> → turn <b>Mobile Signature</b> off. The app then uses your computer signature.</span></li>
      <li><span><b>Android:</b> Gmail app → Menu ☰ → <b>Settings</b> → your account → <b>Mobile signature</b>. Leave it empty, or click <b>Text</b> above and paste the plain-text version there.</span></li></ol>
      <p class="note">Whatever device you send from, the people you email see the full signature on their laptop, tablet or phone.</p>`,
    apple: () => `<ol class="steps">
      <li><span>Click <b>Copy signature</b>.</span></li>
      <li><span>In Mail on your Mac, open <b>Mail → Settings → Signatures</b>.</span></li>
      <li><span>Pick your account, click <b>+</b>, and paste into the right-hand box with <kbd>⌘</kbd> + <kbd>V</kbd>.</span></li>
      <li><span>Untick <b>Always match my default message font</b>, then choose the signature under <b>Choose Signature</b>.</span></li></ol>`,
    outlook: () => `<ol class="steps">
      <li><span>Click <b>Copy signature</b>.</span></li>
      <li><span><b>Outlook on the web / new Outlook:</b> Settings ⚙ → <b>Account</b> → <b>Signatures</b> → <b>New signature</b>.</span></li>
      <li><span><b>Classic Outlook (Windows):</b> File → Options → Mail → <b>Signatures…</b> → <b>New</b>.</span></li>
      <li><span>Paste with <kbd>Ctrl</kbd> + <kbd>V</kbd>, set it as the default for new messages and replies, then <b>Save</b>.</span></li></ol>`
  };
  let lastGuide = '';
  function renderGuide() { const html = GUIDES[ui.guide](); if (html !== lastGuide) { $('#guideBody').innerHTML = html; lastGuide = html; } }

  function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('show'), 2600); }
  function flash(btn, label) {
    const span = btn.querySelector('span') || btn; const prev = span.textContent;
    btn.classList.add('ok'); span.textContent = label;
    setTimeout(() => { btn.classList.remove('ok'); span.textContent = prev; }, 1800);
  }
  async function copyRich(html, text) {
    try {
      await navigator.clipboard.write([new ClipboardItem({ 'text/html': new Blob([html], { type: 'text/html' }), 'text/plain': new Blob([text], { type: 'text/plain' }) })]);
      return true;
    } catch (e) {
      const h = ev => { ev.clipboardData.setData('text/html', html); ev.clipboardData.setData('text/plain', text); ev.preventDefault(); };
      document.addEventListener('copy', h);
      let ok = false; try { ok = document.execCommand('copy'); } catch (_) {}
      document.removeEventListener('copy', h);
      return ok;
    }
  }
  async function copyPlain(text) {
    try { await navigator.clipboard.writeText(text); return true; } catch (e) {
      const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select(); let ok = false; try { ok = document.execCommand('copy'); } catch (_) {} ta.remove(); return ok;
    }
  }
  function download(name, content, type) {
    const a = document.createElement('a');
    const isUrl = content.startsWith('data:');
    a.href = isUrl ? content : URL.createObjectURL(new Blob([content], { type }));
    a.download = name; document.body.appendChild(a); a.click(); a.remove();
    if (!isUrl) setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  const slug = () => (state.name || 'email').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'email';

  $('#copySig').addEventListener('click', async e => {
    const btn = e.currentTarget;
    if (await copyRich(build(state), plainText(state))) {
      flash(btn, 'Copied');
      toast(isData(state.photo) ? 'Copied — for Gmail, follow the image steps under Photo or logo' : 'Signature copied — paste it into your email settings');
    } else toast('Copy was blocked — select the signature in the preview and copy it');
  });
  $('#copyText').addEventListener('click', async () => { toast(await copyPlain(plainText(state)) ? 'Plain-text signature copied' : 'Copy was blocked by the browser'); });
  $('#copyHtml').addEventListener('click', async () => { toast(await copyPlain(build(state)) ? 'HTML copied' : 'Copy was blocked by the browser'); });
  $('#download').addEventListener('click', () => {
    download(`${slug()}-signature.html`, `<!DOCTYPE html>\n<html lang="en"><head><meta charset="utf-8"><title>${esc(state.name || 'Email signature')}</title></head>\n<body style="margin:24px;">\n${build(state)}\n</body></html>\n`, 'text/html');
  });

  $$('[data-k]').forEach(el => el.addEventListener('input', () => {
    const k = el.dataset.k; state[k] = el.type === 'range' ? +el.value : el.value;
    if (k === 'photo') ui.source = null;
    render();
  }));
  $('#fontSel').innerHTML = Object.entries(FONTS).map(([k, [n]]) => `<option value="${k}">${n}</option>`).join('');
  $('#fontSel').addEventListener('change', e => { state.font = e.target.value; render(); });
  $('#ctaOn').addEventListener('change', e => {
    state.ctaOn = e.target.checked;
    if (state.ctaOn && !state.ctaLabel) { state.ctaLabel = 'Book a call'; $('[data-k="ctaLabel"]').value = state.ctaLabel; }
    render();
  });
  $('#optTrim').addEventListener('change', e => { state.photoTrim = e.target.checked; applyProcessed(); });
  $('#optBg').addEventListener('change', e => { state.photoBg = e.target.checked; applyProcessed(); });

  seg('#shapeSeg', v => { state.photoShape = v; render(); });
  seg('#fitSeg', v => { state.photoFit = v; applyProcessed(); });
  seg('#nameSeg', v => { state.nameSize = +v; render(); });
  seg('#iconStyleSeg', v => { state.iconStyle = v; renderSwatches(); render(); });
  seg('#iconSizeSeg', v => { state.iconSize = +v; render(); });
  seg('#ctaStyleSeg', v => { state.ctaStyle = v; render(); });
  seg('#themeSeg', v => { ui.theme = v; $('#stage').classList.toggle('dark', v === 'dark'); });
  seg('#deviceSeg', v => { ui.device = v; $('#stage').classList.toggle('mobile', v === 'mobile'); });
  $$('#guideTabs button').forEach(b => b.addEventListener('click', () => {
    $$('#guideTabs button').forEach(x => x.classList.toggle('on', x === b)); ui.guide = b.dataset.v; renderGuide();
  }));

  const drop = $('#drop');
  $('#photoFile').addEventListener('change', e => { handleFile(e.target.files[0]); e.target.value = ''; });
  ['dragenter', 'dragover'].forEach(t => drop.addEventListener(t, e => { e.preventDefault(); drop.classList.add('over'); }));
  ['dragleave', 'drop'].forEach(t => drop.addEventListener(t, e => { e.preventDefault(); drop.classList.remove('over'); }));
  drop.addEventListener('drop', e => handleFile(e.dataTransfer.files[0]));
  document.addEventListener('paste', e => {
    if (e.target.closest && e.target.closest('input, textarea')) return;
    const f = [...(e.clipboardData?.files || [])].find(x => /^image\//.test(x.type));
    if (f) { e.preventDefault(); handleFile(f); }
  });
  $('#dlLogo').addEventListener('click', () => { if (isData(state.photo)) download(`${ui.sourceName || slug()}-signature.${state.photo.startsWith('data:image/png') ? 'png' : 'jpg'}`, state.photo); });

  $('#pickSearch').addEventListener('input', e => { ui.filter = e.target.value; renderPicker(); });
  $('#ghToggle').addEventListener('click', () => { $('#ghRow').classList.toggle('show'); $('#ghUser').focus(); });
  const applyGh = () => {
    const u = $('#ghUser').value.trim().replace(/^@/, '').replace(/^https?:\/\/github\.com\//i, '').split('/')[0];
    if (!u) return;
    state.photo = `https://github.com/${u}.png?size=240`; ui.source = null;
    $('#ghRow').classList.remove('show'); render();
  };
  $('#ghApply').addEventListener('click', applyGh);
  $('#ghUser').addEventListener('keydown', e => { if (e.key === 'Enter') applyGh(); });
  $('#photoClear').addEventListener('click', () => { state.photo = ''; ui.source = null; render(); });

  $('#libSelect').addEventListener('change', e => activate(e.target.value));
  $('#libNew').addEventListener('click', () => { const id = uid(); lib.items.push({ id, data: structuredClone(DEFAULTS) }); activate(id); toast('New signature created'); });
  $('#libDup').addEventListener('click', () => { const id = uid(); lib.items.push({ id, data: structuredClone(state) }); activate(id); toast('Signature duplicated'); });
  $('#libDelete').addEventListener('click', () => {
    const label = (state.name || 'this signature').trim();
    if (!confirm(`Delete "${label}"? This can't be undone.`)) return;
    lib.items = lib.items.filter(i => i.id !== lib.active);
    if (!lib.items.length) lib.items.push({ id: uid(), data: structuredClone(DEFAULTS) });
    activate(lib.items[0].id); toast('Signature deleted');
  });
  $('#libExport').addEventListener('click', () => {
    download(`${slug()}.signature.json`, JSON.stringify({ app: 'signature-studio', version: 1, signature: state }, null, 2), 'application/json');
  });
  $('#libImport').addEventListener('click', () => $('#libFile').click());
  $('#libFile').addEventListener('change', async e => {
    const f = e.target.files[0]; e.target.value = '';
    if (!f) return;
    try {
      const j = JSON.parse(await f.text());
      const data = j && j.signature ? j.signature : j;
      if (!data || typeof data !== 'object' || !('template' in data || 'name' in data)) throw new Error('bad');
      const id = uid(); lib.items.push({ id, data: clean(data) }); activate(id); toast('Signature imported');
    } catch (err) { toast('That file is not a Signature Studio settings file'); }
  });

  syncInputs();
  renderGuide();
})();
