(() => {
  const { platforms: PLATFORMS, palette: PALETTE } = window.SS_DATA;
  const BY_KEY = Object.fromEntries(PLATFORMS.map(p => [p.key, p]));
  const onPages = location.protocol.startsWith('http') && /\.github\.io$/.test(location.hostname);
  const SITE = onPages ? new URL('.', location.href).href.replace(/\/$/, '') : 'https://raw.githubusercontent.com/NextBuilder/Email-Signature/main';
  const STORE = 'signature-studio.v1';
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

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
    mastodon: 'mastodon.social/@username', github: 'github.com/username', email: 'you@company.com', phone: '+1 555 010 2030',
    website: 'yourwebsite.com', location: 'maps.google.com/?q=Your+City', whatsapp: 'wa.me/15550102030', telegram: 't.me/username',
    calendly: 'calendly.com/username', medium: 'medium.com/@username', substack: 'name.substack.com'
  };

  const EXAMPLE = {
    template: 'classic', name: 'Kishan Pratap Singh', title: 'Founder', company: 'Next Builder',
    phone: '', email: '', website: '', location: '', tagline: '',
    photo: `${SITE}/assets/emblem.png`, photoShape: 'circle', photoSize: 56,
    links: [
      ['youtube', 'https://youtube.com/@NextBuilderIO'], ['instagram', 'https://instagram.com/next_builder'],
      ['github', 'https://github.com/NextBuilder'], ['linkedin', 'https://www.linkedin.com/company/nextbuilderio/'],
      ['x', 'https://x.com/NEXTBUILDERIO'], ['instructables', 'https://www.instructables.com/member/Next%20Builder%20DIY/'],
      ['hackster', 'https://hackster.io/NEXTBUILDER'], ['hackaday', 'https://hackaday.io/NextBuilder']
    ].map(([key, url]) => ({ key, url })),
    accent: '#E8364A', font: 'system', nameSize: 17, iconStyle: 'outline', iconColor: 'graphite', iconSize: 20, iconGap: 8
  };
  const BLANK = { ...EXAMPLE, name: '', title: '', company: '', photo: '', links: [] };

  let state = load();
  let ui = { theme: 'light', device: 'desktop', guide: 'gmail', filter: '' };

  function load() {
    try { const s = JSON.parse(localStorage.getItem(STORE)); if (s && s.template) return { ...EXAMPLE, ...s }; } catch (e) {}
    return structuredClone(EXAMPLE);
  }
  let saveT;
  function save() { clearTimeout(saveT); saveT = setTimeout(() => { try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (e) {} }, 250); }

  const iconUrl = (key, style = state.iconStyle, color = state.iconColor) => {
    const c = style === 'badge' && color === 'white' ? 'graphite' : color;
    return `${SITE}/icons/${style}/${c}/${key}.png`;
  };

  function href(key, v) {
    v = (v || '').trim();
    if (!v) return '';
    if (key === 'email' || (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) && !/^mailto:/i.test(v))) return /^mailto:/i.test(v) ? v : `mailto:${v}`;
    if (key === 'phone') return /^tel:/i.test(v) ? v : `tel:${v.replace(/[^\d+]/g, '')}`;
    return /^[a-z][a-z0-9+.-]*:/i.test(v) ? v : `https://${v.replace(/^\/+/, '')}`;
  }

  function build(s, preview = false) {
    const F = FONTS[s.font]?.[1] || FONTS.system[1];
    const INK = '#111318', MUTED = '#6E7480', BODY = '#3D424D';
    const ink = preview ? ' data-ink' : '', rule = preview ? ' data-rule' : '', body = preview ? ' data-body' : '';
    const font = `font-family:${F};`;
    const links = s.links.filter(l => l.url && l.url.trim());
    const hasPhoto = !!(s.photo && s.photo.trim()) && s.template !== 'minimal';
    const size = +s.photoSize || 56;
    const radius = s.photoShape === 'circle' ? '50%' : s.photoShape === 'rounded' ? `${Math.round(size * .22)}px` : '0';

    const photo = hasPhoto ? `<img src="${esc(s.photo.trim())}" width="${size}" height="${size}" alt="${esc(s.name || 'Photo')}" style="display:block;border:0;width:${size}px;height:${size}px;border-radius:${radius};object-fit:cover;">` : '';

    const name = s.name ? `<div${ink} style="${font}font-size:${s.nameSize}px;line-height:1.25;font-weight:600;color:${INK};letter-spacing:.1px;">${esc(s.name)}</div>` : '';
    const company = s.company ? `<span style="color:${s.accent};font-weight:600;">${esc(s.company)}</span>` : '';
    const titleLine = (s.title || s.company) ? `<div style="${font}font-size:13px;line-height:18px;color:${MUTED};padding-top:2px;">${esc(s.title)}${s.title && s.company ? ', ' : ''}${company}</div>` : '';
    const tagline = s.tagline ? `<div style="${font}font-size:12.5px;line-height:18px;color:${MUTED};font-style:italic;padding-top:4px;">${esc(s.tagline)}</div>` : '';

    const contactItems = [
      ['phone', s.phone], ['email', s.email], ['website', s.website], ['location', s.location]
    ].filter(([, v]) => v && v.trim()).map(([k, v]) => {
      const label = esc(k === 'website' ? v.replace(/^https?:\/\//i, '').replace(/\/$/, '') : v);
      const h = k === 'location' ? `https://maps.google.com/?q=${encodeURIComponent(v)}` : href(k, v);
      return `<a${body} href="${esc(h)}" target="_blank" style="color:${BODY};text-decoration:none;">${label}</a>`;
    });
    const contacts = contactItems.length ? `<div${body} style="${font}font-size:12.5px;line-height:18px;color:${BODY};padding-top:8px;">${contactItems.join(`<span style="color:#C3C7CE;">&nbsp;&nbsp;·&nbsp;&nbsp;</span>`)}</div>` : '';

    const icons = links.length ? `<table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;margin-top:${contacts ? 10 : 9}px;"><tr>${links.map((l, i) => {
      const p = BY_KEY[l.key];
      return `<td style="padding:0 ${i === links.length - 1 ? 0 : s.iconGap}px 0 0;"><a href="${esc(href(l.key, l.url))}" target="_blank" title="${esc(p.name)}" style="text-decoration:none;"><img src="${iconUrl(l.key, s.iconStyle, s.iconColor)}" width="${s.iconSize}" height="${s.iconSize}" alt="${esc(p.name)}" style="display:block;border:0;width:${s.iconSize}px;height:${s.iconSize}px;"></a></td>`;
    }).join('')}</tr></table>` : '';

    const content = `${name}${titleLine}${tagline}${contacts}${icons}`;
    const table = inner => `<table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;${font}">${inner}</table>`;
    const vr = h => `<td style="padding:0 14px 0 0;vertical-align:middle;"><div${rule} style="width:1px;height:${h}px;background:#E4E6EA;line-height:${h}px;font-size:0;">&nbsp;</div></td>`;

    switch (s.template) {
      case 'stacked':
        return table(`${hasPhoto ? `<tr><td style="padding:0 0 12px 0;">${photo}</td></tr>` : ''}<tr><td style="vertical-align:top;">${content}</td></tr>`);
      case 'minimal':
        return table(`<tr><td style="vertical-align:top;">${content}</td></tr>`);
      case 'accent':
        return table(`<tr>${hasPhoto ? `<td style="padding:0 14px 0 0;vertical-align:middle;">${photo}</td>` : ''}<td style="width:3px;background:${s.accent};border-radius:2px;font-size:0;line-height:0;">&nbsp;</td><td style="padding:2px 0 2px 14px;vertical-align:middle;">${content}</td></tr>`);
      default:
        return table(`<tr>${hasPhoto ? `<td style="padding:0 14px 0 0;vertical-align:middle;">${photo}</td>${vr(size)}` : ''}<td style="vertical-align:middle;">${content}</td></tr>`);
    }
  }

  function render() {
    $('#sig').innerHTML = build(state, true);
    const out = build(state);
    $('#charCount').textContent = `${(out.length / 1000).toFixed(1)}K / 10K`;
    const pct = Math.min(100, out.length / 100);
    $('#charBar').style.width = `${pct}%`;
    $('#charBar').style.background = pct > 90 ? '#E8364A' : pct > 70 ? '#CA8A04' : '#16A34A';
    $('#photoThumb').style.backgroundImage = state.photo ? `url("${state.photo.replace(/"/g, '%22')}")` : '';
    $('#photoThumb').style.borderRadius = state.photoShape === 'circle' ? '50%' : state.photoShape === 'rounded' ? '14px' : '4px';
    $('#photoSizeOut').textContent = `${state.photoSize}px`;
    $('#iconGapOut').textContent = `${state.iconGap}px`;
    $('#linkCount').textContent = state.links.length ? `${state.links.length} added` : '';
    $('#tplHint').textContent = TEMPLATES[state.template][0];
    document.documentElement.style.setProperty('--accent', state.accent);
    save();
  }

  function syncInputs() {
    $$('[data-k]').forEach(el => { el.value = state[el.dataset.k] ?? ''; });
    setSeg('#shapeSeg', state.photoShape); setSeg('#nameSeg', String(state.nameSize));
    setSeg('#iconStyleSeg', state.iconStyle); setSeg('#iconSizeSeg', String(state.iconSize));
    renderTemplates(); renderSwatches(); renderLinks(); renderPicker(); render();
  }

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
    $$('#iconSw .sw').forEach(b => b.addEventListener('click', () => { state.iconColor = b.dataset.c; renderSwatches(); renderLinks(); render(); }));
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
      else {
        state.links.push({ key: k, url: '' });
        setTimeout(() => { const el = $(`[data-li="${state.links.length - 1}"]`); el && el.focus(); }, 0);
      }
      renderLinks(); renderPicker(); render();
    }));
  }

  const GUIDES = {
    gmail: `<ol class="steps">
      <li><span>Click <b>Copy signature</b>.</span></li>
      <li><span>Open <b>Gmail → Settings → See all settings → General</b>. The button below takes you straight there.</span></li>
      <li><span>Scroll to <b>Signature</b>, click <b>Create new</b> and give it a name.</span></li>
      <li><span>Click inside the signature box and paste with <kbd>Ctrl</kbd> + <kbd>V</kbd> (<kbd>⌘</kbd> + <kbd>V</kbd> on Mac).</span></li>
      <li><span>Under <b>Signature defaults</b>, pick it for <b>For new emails use</b> and <b>On reply/forward use</b>.</span></li>
      <li><span>Scroll to the bottom and click <b>Save Changes</b>.</span></li></ol>
      <div class="guide-cta"><a class="btn primary" href="https://mail.google.com/mail/u/0/#settings/general" target="_blank" rel="noopener">Open Gmail signature settings</a></div>
      <p class="note">Signed in to several Google accounts? Change <kbd>/u/0/</kbd> in the link to <kbd>/u/1/</kbd>, <kbd>/u/2/</kbd>… until it opens the right inbox.</p>`,
    mobile: `<ol class="steps">
      <li><span>Set up the signature in Gmail on a computer first (see the Gmail tab).</span></li>
      <li><span><b>iPhone &amp; iPad:</b> Gmail app → Menu ☰ → <b>Settings</b> → your account → <b>Signature settings</b> → turn <b>Mobile Signature</b> off. The app then uses your computer signature.</span></li>
      <li><span><b>Android:</b> Gmail app → Menu ☰ → <b>Settings</b> → your account → <b>Mobile signature</b> → leave it empty, then send yourself a test email.</span></li></ol>
      <p class="note">Whatever device you send from, the people you email see the full signature on their laptop, tablet or phone.</p>`,
    apple: `<ol class="steps">
      <li><span>Click <b>Copy signature</b>.</span></li>
      <li><span>In Mail on your Mac, open <b>Mail → Settings → Signatures</b>.</span></li>
      <li><span>Pick your account, click <b>+</b>, and paste into the right-hand box with <kbd>⌘</kbd> + <kbd>V</kbd>.</span></li>
      <li><span>Untick <b>Always match my default message font</b>, then choose the signature under <b>Choose Signature</b>.</span></li></ol>`,
    outlook: `<ol class="steps">
      <li><span>Click <b>Copy signature</b>.</span></li>
      <li><span><b>Outlook on the web / new Outlook:</b> Settings ⚙ → <b>Account</b> → <b>Signatures</b> → <b>New signature</b>.</span></li>
      <li><span><b>Classic Outlook (Windows):</b> File → Options → Mail → <b>Signatures…</b> → <b>New</b>.</span></li>
      <li><span>Paste with <kbd>Ctrl</kbd> + <kbd>V</kbd>, set it as the default for new messages and replies, then <b>Save</b>.</span></li></ol>`
  };
  function renderGuide() { $('#guideBody').innerHTML = GUIDES[ui.guide]; }

  function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('show'), 2200); }
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
  const plain = () => [state.name, [state.title, state.company].filter(Boolean).join(', '), state.phone, state.email, state.website].filter(Boolean).join('\n');

  $('#copySig').addEventListener('click', async e => {
    const btn = e.currentTarget;
    if (await copyRich(build(state), plain())) { flash(btn, 'Copied'); toast('Signature copied — paste it into your email settings'); }
    else toast('Copy was blocked — select the signature in the preview and copy it');
  });
  $('#copyHtml').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(build(state)); toast('HTML copied'); } catch (e) { toast('Copy was blocked by the browser'); }
  });
  $('#download').addEventListener('click', () => {
    const doc = `<!DOCTYPE html>\n<html lang="en"><head><meta charset="utf-8"><title>${esc(state.name || 'Email signature')}</title></head>\n<body style="margin:24px;">\n${build(state)}\n</body></html>\n`;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([doc], { type: 'text/html' }));
    a.download = `${(state.name || 'email').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'email'}-signature.html`;
    a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });

  $$('[data-k]').forEach(el => el.addEventListener('input', () => {
    const k = el.dataset.k; state[k] = el.type === 'range' ? +el.value : el.value; render();
  }));
  $('#fontSel').innerHTML = Object.entries(FONTS).map(([k, [n]]) => `<option value="${k}">${n}</option>`).join('');
  $('#fontSel').addEventListener('change', e => { state.font = e.target.value; render(); });

  seg('#shapeSeg', v => { state.photoShape = v; render(); });
  seg('#nameSeg', v => { state.nameSize = +v; render(); });
  seg('#iconStyleSeg', v => { state.iconStyle = v; renderSwatches(); render(); });
  seg('#iconSizeSeg', v => { state.iconSize = +v; render(); });
  seg('#themeSeg', v => { ui.theme = v; $('#stage').classList.toggle('dark', v === 'dark'); });
  seg('#deviceSeg', v => { ui.device = v; $('#stage').classList.toggle('mobile', v === 'mobile'); });
  $$('#guideTabs button').forEach(b => b.addEventListener('click', () => {
    $$('#guideTabs button').forEach(x => x.classList.toggle('on', x === b)); ui.guide = b.dataset.v; renderGuide();
  }));

  $('#pickSearch').addEventListener('input', e => { ui.filter = e.target.value; renderPicker(); });
  $('#ghToggle').addEventListener('click', () => { $('#ghRow').classList.toggle('show'); $('#ghUser').focus(); });
  const applyGh = () => {
    const u = $('#ghUser').value.trim().replace(/^@/, '').replace(/^https?:\/\/github\.com\//i, '').split('/')[0];
    if (!u) return;
    state.photo = `https://github.com/${u}.png?size=240`;
    $('[data-k="photo"]').value = state.photo; $('#ghRow').classList.remove('show'); render();
  };
  $('#ghApply').addEventListener('click', applyGh);
  $('#ghUser').addEventListener('keydown', e => { if (e.key === 'Enter') applyGh(); });
  $('#photoClear').addEventListener('click', () => { state.photo = ''; $('[data-k="photo"]').value = ''; render(); });
  $('#resetExample').addEventListener('click', () => { state = structuredClone(EXAMPLE); syncInputs(); toast('Example loaded'); });
  $('#startBlank').addEventListener('click', () => { state = structuredClone(BLANK); syncInputs(); toast('Fresh start — add your details'); });

  syncInputs();
  renderGuide();
})();
