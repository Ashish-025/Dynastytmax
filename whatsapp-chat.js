/*  WhatsApp chat assistant.
    A moment after the visitor arrives, a small greeting strip slides out beside the WhatsApp button
    ("Hello, welcome to DMAX"); clicking it (or the button) opens a compact chat that answers common
    questions from a keyword list and hands the conversation to WhatsApp (wa.me) with the message pre-filled.
    Self-contained: injects its own styles and works on any page with .ssi-float-whatsapp.
    Same WhatsApp look in light and dark themes. */
(function () {
    'use strict';
    var PHONE = '919937020631';
    var GREETING = 'Hello 👋 Welcome to DMAX!';
    var OPEN_DELAY = 2500;                 // ms after load before the greeting pops up
    var SEEN_KEY = 'dm-wa-greeted';        // greet automatically once per browser session
    var STRIP_TIME = 12000;                // ms the greeting strip stays before tucking away

    var button = document.querySelector('.ssi-float-whatsapp');
    if (!button) return;

    // ---------- replies: first entry whose keywords match the visitor's text wins ----------
    var REPLIES = [
        { k: ['gps', 'track', 'vehicle', 'fleet', 'fuel', 'ais', 'bus', 'truck'],
          a: 'We provide GPS vehicle tracking, AIS-140 devices, fuel monitoring and fleet management with live tracking on web and mobile. Want a quote for your vehicles?' },
        { k: ['cctv', 'camera', 'surveil', 'security', 'alarm', 'access', 'biometric'],
          a: 'We design and install CCTV surveillance, access control and smart alarm systems for homes, offices, schools and industries, with remote viewing on your phone.' },
        { k: ['brand', 'marketing', 'website', 'web', 'seo', 'social', 'logo', 'digital', 'app'],
          a: 'Our digital team handles branding, digital marketing, website and app development and business automation to help your business grow online.' },
        { k: ['price', 'cost', 'rate', 'quote', 'charges', 'budget'],
          a: 'Pricing depends on the quantity and setup you need. Tap “Continue on WhatsApp” and our team will send you a quote quickly.' },
        { k: ['where', 'location', 'office', 'address', 'cuttack', 'bhubaneswar', 'puri', 'chandikhol'],
          a: 'We serve clients across Odisha with offices in Cuttack, Bhubaneswar, Puri and Chandikhol.' },
        { k: ['contact', 'call', 'phone', 'number', 'email', 'mail'],
          a: 'Call us on +91 99370 20631 or email ashish2@gmail.com — or just continue here on WhatsApp.' },
        { k: ['hi', 'hello', 'hey', 'namaste', 'good morning', 'good evening'],
          a: 'Hello! 😊 How can we help you today?' },
        { k: ['thank', 'thanks', 'ok', 'okay'],
          a: 'You’re welcome! Anything else we can help with?' }
    ];
    var FALLBACK = 'Thanks for your message! Our team will reply personally on WhatsApp — tap “Continue on WhatsApp” below.';
    var CHIPS = ['Vehicle Tracking', 'CCTV & Surveillance', 'Digital Branding', 'Get a quote'];

    function replyFor(text) {
        var t = ' ' + text.toLowerCase() + ' ';
        for (var i = 0; i < REPLIES.length; i++) {
            for (var j = 0; j < REPLIES[i].k.length; j++) {
                if (t.indexOf(REPLIES[i].k[j]) !== -1) return REPLIES[i].a;
            }
        }
        return FALLBACK;
    }

    // ---------- styles ----------
    var css = [
        '.dm-wa{position:fixed;right:18px;bottom:84px;bottom:calc(84px + env(safe-area-inset-bottom,0px));z-index:9990;width:310px;max-width:calc(100vw - 32px);',
        'display:flex;flex-direction:column;max-height:min(430px,calc(100vh - 120px));border-radius:16px;overflow:hidden;',
        'background:#fff;color:#1b1f24;box-shadow:0 18px 50px rgba(0,0,0,.28);font:14px/1.45 Arial,Helvetica,sans-serif;',
        'opacity:0;transform:translateY(14px) scale(.97);transform-origin:bottom right;pointer-events:none;transition:opacity .3s ease,transform .3s ease}',
        '.dm-wa.is-open{opacity:1;transform:none;pointer-events:auto}',
        '.dm-wa-head{display:flex;align-items:center;gap:10px;padding:12px 14px;background:#075e54;color:#fff}',
        '.dm-wa-avatar{flex:0 0 38px;height:38px;border-radius:50%;display:grid;place-items:center;background:#fff;color:#075e54;font:800 10px/1 Arial,sans-serif;letter-spacing:0}',
        '.dm-wa-title{flex:1;min-width:0}.dm-wa-title b{display:block;font-size:15px}.dm-wa-title span{font-size:12px;opacity:.85}',
        '.dm-wa-title span::before{content:"";display:inline-block;width:7px;height:7px;margin-right:5px;border-radius:50%;background:#25d366;vertical-align:1px}',
        '.dm-wa-close{flex:0 0 30px;height:30px;border:0;border-radius:50%;background:transparent;color:#fff;font-size:22px;line-height:1;cursor:pointer}',
        '.dm-wa-close:hover{background:rgba(255,255,255,.15)}',
        '.dm-wa-body{flex:1;overflow-y:auto;padding:14px 12px 6px;background:#efeae2}',
        '.dm-wa-msg{max-width:85%;margin:0 0 8px;padding:8px 11px;border-radius:10px;background:#fff;box-shadow:0 1px 1px rgba(0,0,0,.08);animation:dmWaIn .25s ease;word-wrap:break-word}',
        '.dm-wa-msg.me{margin-left:auto;background:#d9fdd3}',
        '.dm-wa-typing{display:inline-flex;gap:4px;padding:11px 13px}',
        '.dm-wa-typing i{width:6px;height:6px;border-radius:50%;background:#8696a0;animation:dmWaDot 1s infinite}',
        '.dm-wa-typing i:nth-child(2){animation-delay:.15s}.dm-wa-typing i:nth-child(3){animation-delay:.3s}',
        '.dm-wa-chips{display:flex;flex-wrap:wrap;gap:6px;margin:4px 0 8px}',
        '.dm-wa-chips button{border:1px solid #25d366;border-radius:999px;background:#fff;color:#075e54;padding:5px 10px;font:600 12px/1.2 Arial,sans-serif;cursor:pointer}',
        '.dm-wa-chips button:hover{background:#25d366;color:#fff}',
        '.dm-wa-handoff{display:block;margin:0 12px 8px;padding:9px;border-radius:999px;background:#25d366;color:#fff;text-align:center;font-weight:700;text-decoration:none}',
        '.dm-wa-handoff:hover{background:#1ebe5b}',
        '.dm-wa-form{display:flex;gap:8px;padding:8px 10px 10px;background:#f0f2f5}',
        '.dm-wa-form input{flex:1;min-width:0;border:0;border-radius:999px;padding:10px 14px;font:14px Arial,sans-serif;background:#fff;color:#1b1f24;outline:none}',
        '.dm-wa-form button{flex:0 0 40px;height:40px;border:0;border-radius:50%;background:#075e54;color:#fff;cursor:pointer;display:grid;place-items:center}',
        '.dm-wa-form button svg{width:18px;height:18px;fill:currentColor}',
        /* compact greeting strip beside the WhatsApp button (keeps the page animation visible) */
        '.dm-wa-strip{position:fixed;z-index:9989;display:flex;align-items:center;gap:8px;height:42px;max-width:calc(100vw - 96px);padding:0 6px 0 5px;border-radius:999px;',
        'background:#fff;color:#1b1f24;box-shadow:0 6px 22px rgba(0,0,0,.25);font:13px/1.2 Arial,Helvetica,sans-serif;cursor:pointer;',
        'opacity:0;transform:translateX(12px);pointer-events:none;transition:opacity .35s ease,transform .35s ease}',
        '.dm-wa-strip.is-on{opacity:1;transform:none;pointer-events:auto}',
        '.dm-wa-strip .dm-wa-avatar{flex:0 0 32px;height:32px;font-size:8px;background:#075e54;color:#fff}',
        '.dm-wa-strip-text{min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
        '.dm-wa-strip-text b{font-weight:700}.dm-wa-strip-text span{color:#075e54;font-weight:700;margin-left:6px}',
        '.dm-wa-strip-x{flex:0 0 24px;height:24px;border:0;border-radius:50%;background:rgba(0,0,0,.06);color:inherit;font-size:16px;line-height:1;cursor:pointer}',
        '.dm-wa-strip-x:hover{background:rgba(0,0,0,.14)}',
        '@media (max-width:480px){.dm-wa-strip-text span{display:none}}',
        '@keyframes dmWaIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}',
        '@keyframes dmWaDot{0%,60%,100%{opacity:.35;transform:none}30%{opacity:1;transform:translateY(-3px)}}',
        '@media (prefers-reduced-motion:reduce){.dm-wa,.dm-wa-msg,.dm-wa-typing i{transition:none;animation:none}}'
    ].join('');
    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    // ---------- markup ----------
    var panel = document.createElement('section');
    panel.className = 'dm-wa';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Chat with DMAX on WhatsApp');
    panel.setAttribute('aria-hidden', 'true');
    panel.innerHTML =
        '<div class="dm-wa-head"><div class="dm-wa-avatar">DMAX</div>' +
        '<div class="dm-wa-title"><b>DMAX AI Assistant</b><span>Online · replies instantly</span></div>' +
        '<button type="button" class="dm-wa-close" aria-label="Close chat">&times;</button></div>' +
        '<div class="dm-wa-body" aria-live="polite"></div>' +
        '<a class="dm-wa-handoff" target="_blank" rel="noopener">Continue on WhatsApp</a>' +
        '<form class="dm-wa-form"><input type="text" placeholder="Type a message…" aria-label="Your message" autocomplete="off">' +
        '<button type="submit" aria-label="Send"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 21 23 12 2 3v7l15 2-15 2z"/></svg></button></form>';
    document.body.appendChild(panel);

    var body = panel.querySelector('.dm-wa-body');
    var handoff = panel.querySelector('.dm-wa-handoff');
    var form = panel.querySelector('.dm-wa-form');
    var input = form.querySelector('input');
    var lastVisitorText = '';
    var started = false;

    function waLink(text) {
        return 'https://wa.me/' + PHONE + '?text=' + encodeURIComponent(text || 'Hello DMAX, I would like to know more about your services.');
    }
    handoff.href = waLink();

    function addMsg(text, mine) {
        var m = document.createElement('div');
        m.className = 'dm-wa-msg' + (mine ? ' me' : '');
        m.textContent = text;
        body.appendChild(m);
        body.scrollTop = body.scrollHeight;
        return m;
    }

    // bot "types" for a moment, then answers
    function botSay(text, then) {
        var t = document.createElement('div');
        t.className = 'dm-wa-msg dm-wa-typing';
        t.innerHTML = '<i></i><i></i><i></i>';
        body.appendChild(t);
        body.scrollTop = body.scrollHeight;
        setTimeout(function () {
            t.remove();
            addMsg(text);
            if (then) then();
        }, Math.min(1400, 500 + text.length * 8));
    }

    function showChips() {
        var c = document.createElement('div');
        c.className = 'dm-wa-chips';
        CHIPS.forEach(function (label) {
            var b = document.createElement('button');
            b.type = 'button';
            b.textContent = label;
            b.addEventListener('click', function () { c.remove(); visitorSays(label); });
            c.appendChild(b);
        });
        body.appendChild(c);
        body.scrollTop = body.scrollHeight;
    }

    function visitorSays(text) {
        text = text.trim();
        if (!text) return;
        addMsg(text, true);
        lastVisitorText = lastVisitorText ? lastVisitorText + '\n' + text : text;
        handoff.href = waLink('Hello DMAX, ' + lastVisitorText);
        botSay(replyFor(text));
    }

    function start() {
        if (started) return;
        started = true;
        botSay(GREETING, function () {
            botSay('I’m the DMAX assistant. How can we help you today?', showChips);
        });
    }

    // small greeting strip beside the button; the full chat opens only when the visitor asks for it
    var strip = document.createElement('div');
    strip.className = 'dm-wa-strip';
    strip.setAttribute('role', 'button');
    strip.setAttribute('tabindex', '0');
    strip.setAttribute('aria-label', 'Hello, welcome to DMAX. Open the AI assistant chat');
    strip.innerHTML = '<div class="dm-wa-avatar">DMAX</div>' +
        '<div class="dm-wa-strip-text"><b>Hello 👋 Welcome to DMAX!</b><span>Ask our AI ›</span></div>' +
        '<button type="button" class="dm-wa-strip-x" aria-label="Dismiss">&times;</button>';
    document.body.appendChild(strip);

    function placeStrip() {
        var r = button.getBoundingClientRect();
        if (!r.width) return;
        strip.style.right = (window.innerWidth - r.left + 10) + 'px';
        strip.style.bottom = (window.innerHeight - r.bottom + (r.height - 42) / 2) + 'px';
    }
    function showStrip() { placeStrip(); strip.classList.add('is-on'); }
    function hideStrip() { strip.classList.remove('is-on'); }
    window.addEventListener('resize', placeStrip);
    strip.addEventListener('click', function (e) {
        if (e.target.closest('.dm-wa-strip-x')) { hideStrip(); return; }
        open(true);
    });
    strip.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(true); }
    });

    function open(focus) {
        hideStrip();
        panel.classList.add('is-open');
        panel.setAttribute('aria-hidden', 'false');
        start();
        if (focus) setTimeout(function () { input.focus(); }, 300);
    }
    function close() {
        panel.classList.remove('is-open');
        panel.setAttribute('aria-hidden', 'true');
    }

    // the floating WhatsApp button now toggles the chat (its href still works without JS)
    button.addEventListener('click', function (e) {
        e.preventDefault();
        if (panel.classList.contains('is-open')) close(); else open(true);
    });
    panel.querySelector('.dm-wa-close').addEventListener('click', close);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        visitorSays(input.value);
        input.value = '';
    });

    // greet the visitor with the strip shortly after they arrive (once per session), then tuck it away
    var greeted = false;
    try { greeted = sessionStorage.getItem(SEEN_KEY) === '1'; } catch (err) { /* storage blocked */ }
    if (!greeted) {
        setTimeout(function () {
            if (panel.classList.contains('is-open')) return;
            showStrip();
            try { sessionStorage.setItem(SEEN_KEY, '1'); } catch (err) { /* storage blocked */ }
            setTimeout(hideStrip, STRIP_TIME);
        }, OPEN_DELAY);
    }
})();
