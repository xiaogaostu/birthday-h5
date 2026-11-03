/* ============================================================
   生日贺卡 · 把星河送给你
   app.js — content, card heart, scene transitions, UI
   (night visuals live in fx.js / cake.js / sound.js)
   ============================================================ */
(() => {
  'use strict';

  /* ----------------------------------------------------------
     Content — change these to make it yours
     (页内“设置”按钮可直接修改，保存在 localStorage)
     ---------------------------------------------------------- */
  const CUSTOM_KEY = 'birthday_custom_v1';
  const CONFIG_DEFAULT = {
    name: '吴文同学',
    letterTitle: '致特别的你：',
    letterSign: '祝福你的人',
    autoSound: true,
    letter: [
      '生日快乐！新的一岁到来，先给你一个大大的拥抱。',
      '有你在的日子，总是多了很多温暖和笑声。那些一起分享的开心和烦恼，都让平凡的日子变得闪闪发光。',
      '谢谢你一直以来的温柔和陪伴，不管遇到什么事，想到你就会觉得很安心。',
      '新的一岁，愿你所有的努力都有回报，所有的期待都能如愿，去喜欢的地方，见想见的人，做想做的事。',
      '最想对你说的还是那一句：希望你天天开心，永远幸福。'
    ]
  };
  const CONFIG = Object.assign({}, CONFIG_DEFAULT);

  // 读取用户自定义：优先 custom.js（随文件夹分发给朋友 = 成品），其次本机 localStorage
  (function applyCustomConfig() {
    let src = null;
    try {
      src = window.CUSTOM || JSON.parse(localStorage.getItem(CUSTOM_KEY) || 'null');
    } catch (e) { src = null; }
    if (!src || typeof src !== 'object') return;
    if (typeof src.name === 'string' && src.name.trim()) CONFIG.name = src.name.trim();
    if (typeof src.letterTitle === 'string' && src.letterTitle.trim()) CONFIG.letterTitle = src.letterTitle.trim();
    if (typeof src.letterSign === 'string' && src.letterSign.trim()) CONFIG.letterSign = src.letterSign.trim();
    if (Array.isArray(src.letter)) {
      const ls = src.letter.map(s => String(s).trim()).filter(Boolean);
      if (ls.length) CONFIG.letter = ls;
    }
  })();

  // 90 张卡片，每一张都有属于自己的祝福，不循环、不重复。
  const WISHES = [
    ['所有的期待都如愿', '今天也要开心呀'],
    ['愿你一直闪闪发光', '你值得所有美好'],
    ['生日快乐，不止今天', '而是岁岁年年'],
    ['把烦恼丢远一点', '只留下甜甜的事'],
    ['好运常在', '万事胜意'],
    ['岁岁平安', '喜乐无忧'],
    ['今天你最大', '想做什么都可以'],
    ['愿你被世界温柔以待', '也被我温柔以待'],
    ['今天，是属于你的日子', '闪闪发光地长大吧'],
    ['希望你天天开心', '永远幸福'],
    ['愿你每天都有好心情', '笑容比星星还亮'],
    ['新的一岁，继续快乐', '奔赴下一场热爱'],
    ['愿你眼里有光', '心里有爱'],
    ['所有美好都奔向你', '一个都不许少'],
    ['愿你自由又快乐', '永远做自己'],
    ['想要的都拥有', '得不到的都释怀'],
    ['被爱包围', '被温柔接住'],
    ['万事胜意，一切从欢', '日子滚烫又明亮'],
    ['平安喜乐，顺遂无忧', '每一步都走得踏实'],
    ['心想事成，好运加倍', '惊喜一件接一件'],
    ['永远可爱，永远被爱', '做最自在的小朋友'],
    ['奔赴热爱', '山海皆可平'],
    ['你是今天的主角', '也是每天的宝贝'],
    ['愿你日日有小确幸', '岁岁有小欢喜'],
    ['许个愿吧', '星星会替你实现'],
    ['愿你此生尽兴', '赤诚善良'],
    ['前程似锦', '未来可期'],
    ['愿你心中有光', '脚下有路'],
    ['今天的风', '都在替我说爱你'],
    ['新的一岁，万事顺意', '想去的地方都能抵达'],
    ['愿你笑起来像春天', '明亮又温柔'],
    ['把好运装进口袋', '把烦恼留在昨天'],
    ['愿你熬夜有人陪', '早起有早餐'],
    ['愿你想哭就哭想笑就笑', '永远不必勉强'],
    ['你比自己想象的更好', '也比昨天更勇敢'],
    ['愿你被偏爱', '也永远有底气'],
    ['生日快乐，我的宝贝', '今天要把蛋糕吃光'],
    ['愿你岁岁有今朝', '年年有今日'],
    ['愿你所行皆坦途', '所遇皆温柔'],
    ['愿你被生活轻轻抱住', '所有委屈都有出口'],
    ['今天不许皱眉', '只许收下满屏的喜欢'],
    ['愿你做喜欢的事', '爱想爱的人'],
    ['愿你拥有滚烫人生', '也有安静的小角落'],
    ['愿你一生清澈明朗', '做想做的事'],
    ['愿你有酒有诗', '也有热腾腾的饭'],
    ['愿你想去的地方', '都有人陪你看风景'],
    ['愿你以后的日子', '都是自己喜欢的模样'],
    ['愿你被星光眷顾', '也被清晨叫醒'],
    ['愿你的努力都有回响', '你的等待都有答案'],
    ['愿你手里有花', '心里有海'],
    ['愿你不慌不忙', '活成自己的光'],
    ['愿你不用很厉害', '也能被好好爱着'],
    ['愿你二十岁的风', '吹到八十岁还温柔'],
    ['愿你走远路也不怕', '回头总有人在'],
    ['愿你被岁月善待', '被时光偏爱'],
    ['愿你的每个明天', '都比今天更值得期待'],
    ['愿你眼里长着太阳', '笑里全是坦荡'],
    ['愿你天黑有灯', '下雨有伞'],
    ['愿你三餐四季', '都有人间烟火'],
    ['愿你心里的小女孩', '永远不必长大'],
    ['愿你被好运追着跑', '被快乐撞个满怀'],
    ['愿你有热爱可抵岁月长', '也有温柔可暖人间'],
    ['愿你每一次落泪', '都是喜极而泣'],
    ['愿你逢考必过', '逢山有路'],
    ['愿你工作顺利', '钱包鼓鼓'],
    ['愿你睡到自然醒', '醒来就有好消息'],
    ['愿你被世界认真对待', '也被自己好好珍惜'],
    ['愿你所念皆星河', '所愿皆成真'],
    ['愿你人见人爱', '花见花开'],
    ['愿你永远有说走就走的勇气', '也有等你回家的人'],
    ['愿你不被年龄定义', '永远鲜活明亮'],
    ['愿你的快乐不用假装', '你的难过有人接住'],
    ['愿你生活有光', '心里有糖'],
    ['愿你一路有歌', '一路有花'],
    ['愿你所到之处', '遍地阳光'],
    ['愿你此后人生', '尽是坦途和喜乐'],
    ['愿你被爱意包围', '被幸福点名'],
    ['愿你把日子过成诗', '把平凡过成礼物'],
    ['愿你眉眼带笑', '岁月不催'],
    ['愿你有前程可奔赴', '也有岁月可回头'],
    ['愿你所求皆如愿', '所行皆坦荡'],
    ['愿你春风得意', '万事顺心'],
    ['愿你的世界', '永远亮着一盏灯'],
    ['愿你被未来温柔以待', '也被现在好好拥抱'],
    ['愿你从今往后', '每一天都值得庆祝'],
    ['愿你拥有甜甜的恋爱', '也拥有自由'],
    ['愿你的善良带点锋芒', '温柔且有力量'],
    ['愿你永远热泪盈眶', '永远相信美好'],
    ['愿你有生之年', '天天开心'],
    ['愿你被这个世界', '偷偷爱着']
  ];

  /* ----------------------------------------------------------
     Helpers
     ---------------------------------------------------------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const TAU = Math.PI * 2;
  const REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hash = (n) => {
    const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
  };

  // 手机（窄屏）判定：手机上的过渡更短、层数更省，避免真机掉帧
  const isPhone = () => innerWidth < 760;

  /* ----------------------------------------------------------
     Tap — 不依赖浏览器合成的 click
     真机上 click 可能被滚动手势/掉帧吞掉（点了没反应），
     这里用 pointerup 自己判定「轻触」，click 只作为旧内核的兜底，
     并用时间戳去重，保证一次点按只触发一次。
     ---------------------------------------------------------- */
  function bindTap(el, handler) {
    if (!el) return;
    const TAP_MOVE = 14;        // 手指抖动容差 px
    const TAP_TIME = 900;       // 最长点按时长 ms
    let down = null;
    let lastHandled = -1e9;

    const fire = (x, y, src) => {
      lastHandled = performance.now();
      try {
        handler(x, y, src);
      } catch (err) {
        console.warn('[birthday] tap handler failed:', err);
      }
    };

    el.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      down = { x: e.clientX, y: e.clientY, t: performance.now() };
    }, { passive: true });

    el.addEventListener('pointerup', (e) => {
      if (!down) return;
      const dt = performance.now() - down.t;
      const dist = Math.hypot(e.clientX - down.x, e.clientY - down.y);
      const src = e.target;
      down = null;
      if (dt > TAP_TIME || dist > TAP_MOVE) return;   // 滑动/长按不算轻触
      fire(e.clientX, e.clientY, src);
    });

    el.addEventListener('pointercancel', () => { down = null; }, { passive: true });

    // 兜底：不支持 Pointer Events 的内核，或者 pointerup 没触发
    el.addEventListener('click', (e) => {
      if (performance.now() - lastHandled < 800) { e.preventDefault(); return; }
      fire(e.clientX, e.clientY, e.target);
    });
  }

  const day = $('#day');
  const night = $('#night');
  const deckEl = $('#cardDeck');
  const tiltEl = $('#cardTilt');
  const cardStage = $('#cardStage');
  const openBtn = $('#openBtn');
  const wallTitle = $('#wallTitle');
  const flash = $('#flash');
  const live = $('#live');
  const noteReader = $('#noteReader');
  const notePaper = $('#notePaper');
  const noteMain = $('#noteMain');
  const noteSub = $('#noteSub');
  const noteIndex = $('#noteIndex');
  const noteSave = $('#noteSave');
  const noteNext = $('#noteNext');
  const noteClose = $('#noteClose');
  const bgmEl = $('#bgm');

  const BGM_SRC = 'birthday-music.mp3';
  const BGM_VOLUME = .34;
  const SAVED_KEY = 'birthday.saved.v1';

  const CARDS = [];
  const CARD_BY_EL = new Map();
  const CARD_COUNT = 90;
  const SAVED = loadSaved();

  const state = {
    mode: 'intro',
    hovered: null,
    lockedUntil: 0,
    soundOn: false,
    bgmActive: false,
    candleLit: true,
    fxMode: 'stars',
    noteOpen: false,
    noteOpening: false,
    noteClosing: false,
    noteMode: 'heart'
  };

  let nightAPI = null;
  let resizeTimer = 0;
  let lastPointer = { x: 0, y: 0 };
  let ambient = null;
  let activeCard = null;
  let lastNoteFocus = null;
  let noteOpenTimer = 0;
  let pendingTapTimer = 0;
  let wallTorn = false;
  let noteAnim = null;
  let bgmUnavailable = false;
  let bgmFadeTimer = 0;
  let bgmWanted = false;

  /* ----------------------------------------------------------
     Build the card deck
     ---------------------------------------------------------- */
  function buildCards() {
    const frag = document.createDocumentFragment();
    for (let i = 0; i < CARD_COUNT; i++) {
      const wish = WISHES[i % WISHES.length];
      const el = document.createElement('div');
      el.className = 'card';
      el.dataset.tint = String(i % 4);
      el.dataset.index = String(i);
      el.style.zIndex = String(i + 1);
      el.style.setProperty('--bob', `${(-hash(i + 3) * 6).toFixed(2)}s`);
      el.setAttribute('aria-label', `第 ${i + 1} 张祝福：${wish[0]}，${wish[1]}`);

      const mainClass = wish[0].length > 8 ? 'card-main long' : 'card-main';
      el.innerHTML =
        '<div class="card-float"><article class="card-face">' +
          '<span class="card-heart" aria-hidden="true">♡</span>' +
          '<span class="card-x" aria-hidden="true">×</span>' +
          `<p class="${mainClass}">${wish[0]}</p>` +
          `<p class="card-sub">${wish[1]}</p>` +
        '</article></div>';

      frag.appendChild(el);
      const card = { el, idx: i, wish, baseZ: 0, baseIndex: i + 1, baseDuration: '', ring: -1 };
      CARDS.push(card);
      CARD_BY_EL.set(el, card);
    }
    deckEl.appendChild(frag);
    CARDS.forEach(paintSaved);
  }

  function cardScale() {
    if (innerWidth < 700) return 0.62;
    if (innerWidth < 1000) return 0.82;
    return 1;
  }

  function applyCardScale() {
    deckEl.style.setProperty('--cs', String(cardScale()));
  }

  function place(card, o) {
    const el = card.el;
    el.style.setProperty('--x', `${o.x.toFixed(2)}px`);
    el.style.setProperty('--y', `${o.y.toFixed(2)}px`);
    el.style.setProperty('--z', `${o.z.toFixed(2)}px`);
    el.style.setProperty('--r', `${o.r.toFixed(2)}deg`);
    el.style.setProperty('--s', String(o.s == null ? 1 : o.s));
    el.style.transitionDelay = `${o.delay || 0}ms`;
    el.style.transitionDuration = o.duration ? `${o.duration}s` : '';
    if (o.zIndex != null) el.style.zIndex = String(o.zIndex);
    if (o.opacity != null) el.style.opacity = String(o.opacity);
    el.style.filter = o.blur ? `blur(${o.blur}px)` : '';
    card.baseZ = o.z;
    card.baseDuration = o.duration ? `${o.duration}s` : '';
    if (o.zIndex != null) card.baseIndex = o.zIndex;
  }

  function layoutDeck(quick) {
    const n = CARDS.length;
    const mobile = innerWidth < 700;
    CARDS.forEach((card, i) => {
      const off = i - (n - 1);
      place(card, {
        x: off * (mobile ? 0.34 : 0.55),
        y: -off * (mobile ? 0.15 : 0.26),
        z: 0,
        r: off * (mobile ? 0.1 : 0.16),
        s: 1,
        delay: quick || REDUCED ? 0 : i * 4,
        duration: quick ? 0.45 : null,
        zIndex: i + 1,
        opacity: null,
        blur: 0
      });
    });
  }

  /* ----------------------------------------------------------
     Heart geometry
     ---------------------------------------------------------- */
  function heartBasePoints() {
    const N = 1600;
    const raw = [];
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (let i = 0; i < N; i++) {
      const t = (i / N) * TAU;
      const x = 16 * Math.pow(Math.sin(t), 3);
      const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
      raw.push({ x, y });
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
    const mobile = innerWidth < 700;
    // 手机上必须给卡片自身留出半宽（约 46px），否则爱心左右两侧会被裁掉
    const cardHalf = (150 * cardScale()) / 2;
    const W = Math.min(
      innerWidth * (mobile ? 0.94 : 0.58),
      innerHeight * (mobile ? 0.58 : 0.78),
      mobile ? innerWidth - cardHalf * 2 : 800
    );
    const H = W * 0.88;
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    return raw.map(p => ({
      x: ((p.x - cx) / (maxX - minX)) * W,
      y: (-(p.y - cy) / (maxY - minY)) * H
    }));
  }

  function resampleClosed(points, count) {
    const n = points.length;
    const cum = [0];
    let total = 0;
    for (let i = 0; i < n; i++) {
      const a = points[i];
      const b = points[(i + 1) % n];
      total += Math.hypot(b.x - a.x, b.y - a.y);
      cum.push(total);
    }
    const out = [];
    let j = 0;
    for (let k = 0; k < count; k++) {
      const target = (total * k) / count;
      while (j < n - 1 && cum[j + 1] < target) j++;
      const seg = cum[j + 1] - cum[j] || 1;
      const f = (target - cum[j]) / seg;
      const a = points[j];
      const b = points[(j + 1) % n];
      const x = lerp(a.x, b.x, f);
      const y = lerp(a.y, b.y, f);
      let r = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
      while (r > 90) r -= 180;
      while (r < -90) r += 180;
      out.push({ x, y, r, frac: k / count });
    }
    return out;
  }

  function layoutHeart(quick) {
    const base = heartBasePoints();
    const rings = [
      { n: 40, s: 1.0, cardScale: 1.00, z: 0, opacity: 1, blur: 0 },
      { n: 30, s: 0.73, cardScale: 0.94, z: -64, opacity: 0.96, blur: 0.25 },
      { n: 20, s: 0.48, cardScale: 0.88, z: -128, opacity: 0.9, blur: 0.5 }
    ];
    let idx = 0;
    rings.forEach((ring, ri) => {
      const pts = resampleClosed(base, ring.n);
      pts.forEach((p, pi) => {
        const card = CARDS[idx++];
        if (!card) return;
        const jx = (hash(idx * 1.7) - 0.5) * 9;
        const jy = (hash(idx * 3.3) - 0.5) * 9;
        const jr = (hash(idx * 5.9) - 0.5) * 4;
        const scaleJitter = 0.97 + hash(idx * 8.1) * 0.06;
        const z = ring.z + (hash(idx * 2.4) - 0.5) * 10;
        const zIndex = 900 - ri * 120 + pi;
        place(card, {
          x: p.x * ring.s + jx,
          y: p.y * ring.s + jy,
          z,
          r: p.r + jr,
          s: ring.cardScale * scaleJitter,
          delay: quick || REDUCED ? 0 : p.frac * (isPhone() ? 300 : 520) + ri * (isPhone() ? 110 : 180),
          duration: quick ? 0.45 : REDUCED ? 0.3 : isPhone() ? 1.5 : 2.6,
          zIndex,
          opacity: ring.opacity,
          blur: cardScale() < 0.75 ? 0 : ring.blur
        });
        card.ring = ri;
        card.el.dataset.ring = String(ri);
      });
    });
    tiltEl.style.setProperty('--tilt-x', '0deg');
    tiltEl.style.setProperty('--tilt-y', '0deg');
  }

  /* ----------------------------------------------------------
     Wish wall — a loose, deliberately messy scatter
     ---------------------------------------------------------- */
  function layoutWall(quick) {
    const n = CARDS.length;
    const w = innerWidth;
    const h = innerHeight;
    const mobile = w < 700;
    const cols = mobile ? 5 : 10;
    const rows = Math.ceil(n / cols);
    const cs = cardScale();
    const baseScale = mobile ? 1 : h < 720 ? 0.84 : 1.02;
    const cardW = 150 * cs * baseScale;
    const cardH = 84 * cs * baseScale;
    const padX = clamp(w * 0.035, 8, 30);
    const padY = clamp(h * 0.045, 8, 34);
    const startX = padX + cardW / 2 - w / 2;
    const endX = w - padX - cardW / 2 - w / 2;
    const startY = padY + cardH / 2 - h * 0.46;
    const endY = h - padY - cardH / 2 - h * 0.46;
    const stepX = (endX - startX) / (cols - 1);
    const stepY = (endY - startY) / (rows - 1);

    const order = [];
    for (let i = 0; i < n; i++) order.push(i);
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(hash(i * 9.7 + 4) * (i + 1));
      const t = order[i]; order[i] = order[j]; order[j] = t;
    }

    CARDS.forEach((card, i) => {
      const slot = order[i];
      const col = slot % cols;
      const row = Math.floor(slot / cols);
      const rowOffset = (row % 2 ? 1 : -1) * stepX * 0.12;
      const jx = (hash(i * 2.3 + 1.7) - 0.5) * stepX * 0.54;
      const jy = (hash(i * 6.1 + 2.9) - 0.5) * stepY * 0.46;
      const x = clamp(startX + col * stepX + rowOffset + jx, startX, endX);
      const y = clamp(startY + row * stepY + jy, startY, endY);
      const rot = (hash(i * 4.7 + 3.1) - 0.5) * (mobile ? 34 : 38)
        + (i % 7 === 0 ? (hash(i * 13.3) - 0.5) * 20 : 0);
      const scale = baseScale * (mobile
        ? 0.96 + hash(i * 7.1) * 0.12
        : 0.9 + hash(i * 7.1) * 0.2);
      place(card, {
        x,
        y,
        z: -22 + hash(i * 3.9) * 44,
        r: rot,
        s: scale,
        delay: quick || REDUCED ? 0 : (row * 95 + col * 18 + hash(i * 5.3 + 5.5) * 320) * (isPhone() ? 0.45 : 1),
        duration: quick ? 0.45 : REDUCED ? 0.3 : isPhone() ? 1.6 : 2.55,
        zIndex: 100 + Math.floor(hash(i * 11.7) * 820),
        opacity: 1,
        blur: 0
      });
    });
    tiltEl.style.setProperty('--tilt-x', '0deg');
    tiltEl.style.setProperty('--tilt-y', '0deg');
  }

  /* ----------------------------------------------------------
     Intro placement — keep the open button clear of the script
     ---------------------------------------------------------- */
  function positionIntro() {
    const intro = $('.intro');
    const en = $('.calligraphy .en');
    if (!intro || !en) return;
    const enRect = en.getBoundingClientRect();
    if (!enRect.height) return;
    const dayRect = day.getBoundingClientRect();
    const gap = innerWidth < 700 ? 16 : 22;
    const margin = 12;
    const introH = intro.offsetHeight || 0;
    const desired = enRect.bottom - dayRect.top + gap;
    const maxTop = innerHeight - margin - introH;
    intro.style.top = `${Math.round(Math.max(margin, Math.min(desired, maxTop)))}px`;
  }

  /* ----------------------------------------------------------
     Card hover / hit testing (all three heart rings + wall)
     ---------------------------------------------------------- */
  function setHover(card) {
    if (state.noteOpen || state.noteOpening || state.noteClosing) card = null;
    if (state.hovered === card) return;
    if (state.hovered) {
      const prev = state.hovered;
      prev.el.classList.remove('hovered');
      prev.el.style.transitionDelay = '0ms';
      prev.el.style.transitionDuration = prev.baseDuration || '';
      prev.el.style.setProperty('--z', `${prev.baseZ.toFixed(2)}px`);
      prev.el.style.zIndex = String(prev.baseIndex);
    }
    state.hovered = null;
    if (!card) return;
    state.hovered = card;
    card.el.classList.add('hovered');
    card.el.style.transitionDelay = '0ms';
    card.el.style.transitionDuration = '.55s';
    card.el.style.setProperty('--z', `${(card.baseZ + 170).toFixed(2)}px`);
    card.el.style.zIndex = '9999';
  }

  function clearHover() {
    setHover(null);
  }

  function findCardAt(x, y) {
    let els = null;
    if (document.elementsFromPoint) {
      els = document.elementsFromPoint(x, y);
    } else if (document.elementFromPoint) {
      const one = document.elementFromPoint(x, y);
      els = one ? [one] : [];
    }
    if (!els) return null;
    let best = null;
    for (let i = 0; i < els.length; i++) {
      const el = els[i];
      const node = el.closest ? el.closest('.card') : null;
      if (!node) continue;
      const card = CARD_BY_EL.get(node);
      if (!card) continue;
      const r = node.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      const nx = (x - (r.left + r.width / 2)) / (r.width / 2);
      const ny = (y - (r.top + r.height / 2)) / (r.height / 2);
      const score = nx * nx + ny * ny;
      if (!best || score < best.score) best = { card, score };
    }
    return best ? best.card : null;
  }

  cardStage.addEventListener('pointermove', (e) => {
    if (state.mode !== 'heart' && state.mode !== 'wall') return;
    if (state.noteOpen || state.noteOpening || state.noteClosing) return;
    if (e.pointerType === 'touch') return;
    if (performance.now() < state.lockedUntil) return;
    setHover(findCardAt(e.clientX, e.clientY));
  }, { passive: true });

  cardStage.addEventListener('pointerleave', () => clearHover());

  function handleCardTap(x, y, src) {
    const direct = src && src.closest ? src.closest('.card') : null;

    // 封面阶段直接点卡片：先进入爱心，避免“点了没反应”
    if (state.mode === 'intro') {
      if (direct) goHeart();
      return;
    }
    if (state.mode !== 'heart' && state.mode !== 'wall') return;
    if (state.noteOpen || state.noteOpening || state.noteClosing) return;

    const card = findCardAt(x, y) || (direct ? CARD_BY_EL.get(direct) : null);
    if (!card) return;

    // 卡片还在飞行中（刚展开爱心/祝福墙）：不要装作没听见，
    // 而是把这次点按记住，落位后立刻打开。
    const wait = state.lockedUntil - performance.now();
    if (wait > 0) {
      if (wait > 1200) return;
      clearTimeout(pendingTapTimer);
      pendingTapTimer = setTimeout(() => {
        if (state.mode === 'heart' || state.mode === 'wall') openNote(card);
      }, wait + 60);
      return;
    }
    openNote(card);
  }

  bindTap(cardStage, handleCardTap);

  window.addEventListener('pointermove', (e) => {
    const nx = (e.clientX / innerWidth) * 2 - 1;
    const ny = (e.clientY / innerHeight) * 2 - 1;
    lastPointer.x = nx;
    lastPointer.y = ny;
    // 触摸不要写 tilt：每帧改父级变换会让 90 张卡全部重绘，手机上必卡
    if (!REDUCED && e.pointerType !== 'touch' && state.mode === 'heart' && !state.noteOpen) {
      tiltEl.style.setProperty('--tilt-x', `${(-ny * 4.5).toFixed(2)}deg`);
      tiltEl.style.setProperty('--tilt-y', `${(nx * 7).toFixed(2)}deg`);
    }
    if (nightAPI) nightAPI.pointer(nx, ny);
  }, { passive: true });

  /* ----------------------------------------------------------
     Note reader
     ---------------------------------------------------------- */
  function loadSaved() {
    try {
      const raw = localStorage.getItem(SAVED_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return new Set(Array.isArray(arr) ? arr.filter(n => Number.isInteger(n)) : []);
    } catch (err) {
      return new Set();
    }
  }

  function persistSaved() {
    try {
      localStorage.setItem(SAVED_KEY, JSON.stringify(Array.from(SAVED)));
    } catch (err) {
      /* file:// storage can be unavailable — it is only a convenience */
    }
  }

  function paintSaved(card) {
    if (!card) return;
    const on = SAVED.has(card.idx);
    card.el.classList.toggle('saved', on);
    const heart = card.el.querySelector('.card-heart');
    if (heart) heart.textContent = on ? '♥' : '♡';
  }

  function updateSaveUI(card) {
    const on = SAVED.has(card.idx);
    noteSave.textContent = on ? '已经收下啦 ♥' : '收下这句祝福 ♡';
    noteSave.classList.toggle('saved', on);
    noteSave.setAttribute('aria-pressed', String(on));
  }

  function fillNote(card) {
    noteMain.textContent = card.wish[0];
    noteSub.textContent = card.wish[1];
    noteIndex.textContent = `${String(card.idx + 1).padStart(2, '0')} / ${CARD_COUNT}`;
    noteNext.textContent = state.noteMode === 'wall'
      ? '带着祝福去看蛋糕 →'
      : '把祝福铺满整颗心 →';
    updateSaveUI(card);
    paintSaved(card);
  }

  function animateNoteIn(srcRect) {
    if (REDUCED) return;
    try {
      const dst = notePaper.getBoundingClientRect();
      if (!dst.width || !dst.height) return;
      const dx = srcRect.left + srcRect.width / 2 - (dst.left + dst.width / 2);
      const dy = srcRect.top + srcRect.height / 2 - (dst.top + dst.height / 2);
      const fromScale = clamp(
        Math.min(srcRect.width / dst.width, srcRect.height / dst.height) * 1.06,
        .16, .52
      );
      const tilt = (hash((activeCard ? activeCard.idx : 0) + 7) - .5) * 9 - 1.5;
      const frames = [
        { transform: `translate(${dx}px, ${dy}px) scale(${fromScale}) rotate(${tilt}deg)`, opacity: 0 },
        { transform: `translate(${dx * .84}px, ${dy * .84}px) scale(${fromScale * 1.28}) rotate(${tilt * .6}deg)`, opacity: 1, offset: .22 },
        { transform: `translate(${dx * .34}px, ${dy * .34}px) scale(${fromScale + (1 - fromScale) * .58}) rotate(${tilt * .2}deg)`, opacity: 1, offset: .62 },
        { transform: 'translate(0px, 0px) scale(1.018) rotate(0deg)', opacity: 1, offset: .88 },
        { transform: 'translate(0px, 0px) scale(1) rotate(0deg)', opacity: 1 }
      ];
      if (noteAnim) {
        try { noteAnim.cancel(); } catch (err) { /* noop */ }
      }
      noteAnim = notePaper.animate(frames, {
        duration: REDUCED ? 170 : innerWidth < 700 ? 1080 : 1420,
        easing: 'cubic-bezier(.23, .72, .16, 1)',
        fill: 'both'
      });
      noteAnim.onfinish = () => {
        try { if (noteAnim) noteAnim.cancel(); } catch (err) { /* noop */ }
        noteAnim = null;
      };
    } catch (err) {
      /* older browsers simply get the CSS fade-in */
    }
  }

  function openNote(card) {
    if (!card) return;
    if (state.noteOpen || state.noteOpening || state.noteClosing) return;
    if (state.mode !== 'heart' && state.mode !== 'wall') return;
    if (performance.now() < state.lockedUntil) return;

    state.noteOpening = true;
    state.noteMode = state.mode;
    activeCard = card;
    lastNoteFocus = document.activeElement;
    const srcRect = card.el.getBoundingClientRect();
    card.el.classList.add('tapped');
    fillNote(card);
    clearHover();
    live.textContent = `第 ${card.idx + 1} 张祝福：${card.wish[0]}。`;

    clearTimeout(noteOpenTimer);
    noteOpenTimer = setTimeout(() => {
      state.noteOpening = false;
      state.noteOpen = true;
      document.body.classList.add('note-open');
      noteReader.classList.add('open');
      noteReader.setAttribute('aria-hidden', 'false');
      animateNoteIn(srcRect);
      setTimeout(() => {
        if (state.noteOpen) {
          try { noteClose.focus({ preventScroll: true }); } catch (err) { noteClose.focus(); }
        }
      }, REDUCED ? 40 : 380);
    }, REDUCED ? 0 : 240);
  }

  function closeNote(after) {
    if (state.noteOpening) {
      clearTimeout(noteOpenTimer);
      state.noteOpening = false;
      if (activeCard) activeCard.el.classList.remove('tapped');
      activeCard = null;
      if (after) after();
      return;
    }
    if (!state.noteOpen) {
      if (after) after();
      return;
    }

    state.noteOpen = false;
    state.noteClosing = true;
    noteReader.classList.remove('open');
    document.body.classList.remove('note-open');
    if (noteReader.contains(document.activeElement)) {
      try { document.activeElement.blur(); } catch (err) { /* noop */ }
    }
    noteReader.setAttribute('aria-hidden', 'true');

    const card = activeCard;
    const dst = notePaper.getBoundingClientRect();
    const src = card ? card.el.getBoundingClientRect() : null;
    let frames;
    if (src && dst.width && dst.height) {
      const dx = src.left + src.width / 2 - (dst.left + dst.width / 2);
      const dy = src.top + src.height / 2 - (dst.top + dst.height / 2);
      const toScale = clamp(
        Math.min(src.width / dst.width, src.height / dst.height) * 1.04,
        .14, .5
      );
      frames = [
        { transform: 'translate(0px, 0px) scale(1) rotate(0deg)', opacity: 1 },
        { transform: `translate(${dx}px, ${dy}px) scale(${toScale}) rotate(-4deg)`, opacity: 0 }
      ];
    } else {
      frames = [{ opacity: 1 }, { opacity: 0 }];
    }

    const duration = REDUCED ? 140 : 620;
    if (!REDUCED) {
      try {
        if (noteAnim) noteAnim.cancel();
        noteAnim = notePaper.animate(frames, {
          duration,
          easing: 'cubic-bezier(.4, 0, .72, .3)',
          fill: 'both'
        });
      } catch (err) {
        /* noop */
      }
    }

    setTimeout(() => {
      try { if (noteAnim) noteAnim.cancel(); } catch (err) { /* noop */ }
      noteAnim = null;
      if (card) card.el.classList.remove('tapped');
      activeCard = null;
      state.noteClosing = false;
      if (lastNoteFocus && lastNoteFocus.focus) {
        try { lastNoteFocus.focus({ preventScroll: true }); } catch (err) { /* noop */ }
      }
      live.textContent = '祝福便利贴已经收起。';
      if (after) after();
    }, duration + 20);
  }

  function toggleSave() {
    if (!activeCard) return;
    const idx = activeCard.idx;
    if (SAVED.has(idx)) SAVED.delete(idx);
    else SAVED.add(idx);
    persistSaved();
    paintSaved(activeCard);
    updateSaveUI(activeCard);
    live.textContent = SAVED.has(idx) ? '这句祝福已经收下。' : '已取消收下这句祝福。';
  }

  /* ----------------------------------------------------------
     Scene transitions
     ---------------------------------------------------------- */
  function goHeart() {
    if (state.mode !== 'intro') return;
    state.mode = 'heart';
    state.lockedUntil = performance.now() + (REDUCED ? 450 : isPhone() ? 1250 : 2100);
    day.classList.add('heart');
    const runHeartLayout = () => {
      if (state.mode === 'heart') layoutHeart(false);
    };
    requestAnimationFrame(() => requestAnimationFrame(runHeartLayout));
    // Safety net for browsers that throttle rAF while the tab is occluded.
    setTimeout(() => {
      if (state.mode === 'heart' && CARDS[0] && CARDS[0].ring === -1) runHeartLayout();
    }, 160);
    setTimeout(() => {
      CARDS.forEach(card => { card.el.style.transitionDelay = '0ms'; });
    }, isPhone() ? 2400 : 3900);
    live.textContent = '心形祝福已经展开。点击任意卡片，翻开写给你的话。';
    if (CONFIG.autoSound) startSound();
  }

  function goWall() {
    if (state.mode !== 'heart' || state.noteOpen || state.noteOpening || state.noteClosing) return;
    state.mode = 'wall';
    state.lockedUntil = performance.now() + (REDUCED ? 400 : isPhone() ? 950 : 1600);
    clearHover();
    day.classList.remove('heart');
    day.classList.add('wall');
    layoutWall(false);
    setTimeout(() => {
      if (state.mode !== 'wall') return;
      wallTitle.classList.add('show');
      wallTitle.setAttribute('aria-hidden', 'false');
    }, 1500);
    live.textContent = '满屏都是写给你的祝福。点开任意一张读一读，或者带着祝福去看蛋糕。';
  }

  function goNight() {
    if (state.mode === 'night' || state.mode === 'transition') return;
    state.mode = 'transition';
    wallTitle.classList.remove('show');
    wallTitle.setAttribute('aria-hidden', 'true');
    flash.classList.add('in');

    setTimeout(() => {
      day.classList.add('gone');
      night.classList.add('active');
      initNight();
    }, 920);

    setTimeout(() => flash.classList.remove('in'), 1500);

    setTimeout(() => {
      night.classList.add('revealed');
      state.mode = 'night';
      live.textContent = '星空蛋糕。可以点击许个愿吹灭蜡烛，或打开一封信。';
      // 首次进入：淡入操作引导
      if (!localStorage.getItem('happy_wish_hint')) {
        setTimeout(() => {
          if (state.mode !== 'night') return;
          const hint = $('#firstHint');
          if (!hint) return;
          hint.classList.add('show');
          setTimeout(() => hint.classList.remove('show'), 5200);
          localStorage.setItem('happy_wish_hint', '1');
        }, 3600);
      }
    }, 3300);
  }

  function initNight() {
    if (nightAPI) return;
    buildLetter();
    nightAPI = {
      fx: null,
      cake: null,
      pointer: (x, y) => {
        if (nightAPI.cake) nightAPI.cake.pointer(x, y);
        if (nightAPI.fx) nightAPI.fx.pointer(x, y);
      },
      resize: () => {
        if (nightAPI.fx) nightAPI.fx.resize();
        if (nightAPI.cake) nightAPI.cake.resize();
      }
    };
    try {
      if (window.ParticleField) nightAPI.fx = new window.ParticleField($('#fx'));
      if (window.CakeScene) nightAPI.cake = new window.CakeScene($('#cake'));
      if (nightAPI.fx) nightAPI.fx.setMode(state.fxMode);
      if (nightAPI.cake) nightAPI.cake.setFxMode(state.fxMode);
      setActiveTab(state.fxMode);
    } catch (err) {
      console.warn('[birthday] night scene failed:', err);
    }
  }

  /* ----------------------------------------------------------
     Background music — real track first, generative fallback
     ---------------------------------------------------------- */
  function fadeBgm(target, ms, done) {
    if (!bgmEl) return;
    clearInterval(bgmFadeTimer);
    bgmFadeTimer = 0;
    const from = bgmEl.volume;
    const t0 = performance.now();
    const step = () => {
      const k = Math.min(1, (performance.now() - t0) / ms);
      bgmEl.volume = clamp(from + (target - from) * k, 0, 1);
      if (k >= 1) {
        clearInterval(bgmFadeTimer);
        bgmFadeTimer = 0;
        bgmEl.volume = clamp(target, 0, 1);
        if (done) done();
      }
    };
    // setInterval, not rAF: background/occluded tabs pause rAF, which would
    // leave the music stuck at volume 0.
    bgmFadeTimer = setInterval(step, 32);
    step();
  }

  function markBgmUnavailable() {
    bgmUnavailable = true;
    bgmWanted = false;
  }

  async function startBgm() {
    if (!bgmEl || bgmUnavailable) return false;
    try {
      if (!bgmEl.getAttribute('src')) bgmEl.setAttribute('src', BGM_SRC);
      bgmEl.loop = true;
      bgmEl.volume = 0;
      const playing = bgmEl.play();
      if (playing && playing.then) await playing;
      if (bgmEl.error) {
        markBgmUnavailable();
        return false;
      }
      bgmWanted = true;
      fadeBgm(BGM_VOLUME, 1800);
      return true;
    } catch (err) {
      if (bgmEl && bgmEl.error) markBgmUnavailable();
      return false;
    }
  }

  function stopBgm() {
    if (!bgmEl) return;
    bgmWanted = false;
    if (bgmEl.paused) {
      bgmEl.volume = 0;
      return;
    }
    fadeBgm(0, 700, () => {
      if (!bgmWanted && bgmEl) {
        bgmEl.pause();
        bgmEl.volume = 0;
      }
    });
  }

  function ensureAmbient() {
    if (!ambient && window.AmbientSound) ambient = new window.AmbientSound();
    return ambient;
  }

  async function startSound() {
    if (state.soundOn) return true;
    // Prime WebAudio inside the user gesture. The MP3 attempt below can take
    // long enough to lose transient activation, and then the fallback music
    // box would be created but stay silent.
    const a = ensureAmbient();
    if (a) {
      Promise.resolve(a.ensure()).catch(() => { /* noop */ });
      if (a.ctx && a.ctx.state === 'suspended') {
        try {
          const p = a.ctx.resume();
          if (p && p.catch) p.catch(() => { /* noop */ });
        } catch (err) { /* noop */ }
      }
    }
    const bgmOk = await startBgm();
    if (bgmOk) {
      if (a && a.ctx && a.ctx.state === 'running' && !a.playing) {
        try {
          const p = a.ctx.suspend();
          if (p && p.catch) p.catch(() => { /* noop */ });
        } catch (err) { /* noop */ }
      }
      state.soundOn = true;
      state.bgmActive = true;
      updateSoundUI();
      return true;
    }
    if (!a) return false;
    const ok = await a.start().catch(() => false);
    if (ok) {
      state.soundOn = true;
      state.bgmActive = false;
      updateSoundUI();
    }
    return ok;
  }

  function stopSound() {
    state.soundOn = false;
    state.bgmActive = false;
    if (ambient) ambient.stop();
    stopBgm();
    updateSoundUI();
  }

  if (bgmEl) {
    bgmEl.addEventListener('error', markBgmUnavailable);
    bgmEl.addEventListener('stalled', () => {
      if (!bgmWanted) return;
      if (bgmEl.error) markBgmUnavailable();
    });
  }

  /* ----------------------------------------------------------
     Letter
     ---------------------------------------------------------- */
  function buildLetter() {
    const body = $('#letterBody');
    body.innerHTML = '';
    CONFIG.letter.forEach(p => {
      const el = document.createElement('p');
      el.textContent = p;
      body.appendChild(el);
    });
    $('#letterTitle').textContent = CONFIG.letterTitle;
    $('.letter-sign').textContent = CONFIG.letterSign;
  }

  function openLetter() {
    const letter = $('#letter');
    lastNoteFocus = document.activeElement;
    // 强制重播：即使信已经开着，也重新触发一次弹出动画（每次吹灭都有“弹出”动作）
    letter.classList.remove('open');
    void letter.offsetWidth;
    letter.classList.add('open');
    letter.setAttribute('aria-hidden', 'false');
    setTimeout(() => $('#letterClose').focus(), 80);
    live.textContent = '一封信已经打开。';
  }

  function closeLetter() {
    const letter = $('#letter');
    letter.classList.remove('open');
    letter.setAttribute('aria-hidden', 'true');
    if (lastNoteFocus && lastNoteFocus.focus) lastNoteFocus.focus();
  }

  /* ----------------------------------------------------------
     Wax candle / effects
     ---------------------------------------------------------- */
  // 信封只在整个页面生命周期内“首次吹灭”时弹出一次，之后不再弹
  let letterShownOnce = false;

  function blowCandle() {
    if (!nightAPI) return;
    if (!state.candleLit) {
      // 蜡烛已灭：这次点击只是重新点亮（不再递信），再点一次蜡烛才是再次吹灭
      relightCandle();
      return;
    }
    state.candleLit = false;    night.classList.add('is-out');
    $('#blowText').textContent = '重新点亮蜡烛';
    $('#relightBtn').hidden = false;
    if (nightAPI.cake) nightAPI.cake.setCandleLit(false);

    let flamePos = null;
    if (nightAPI.cake && typeof nightAPI.cake.getFlameScreenPosition === 'function') {
      flamePos = nightAPI.cake.getFlameScreenPosition();
    }
    const rect = night.getBoundingClientRect();
    const fxOrigin = {
      x: flamePos && flamePos.ok ? flamePos.x : rect.width * 0.68,
      y: flamePos && flamePos.ok ? flamePos.y : rect.height * 0.38
    };
    if (nightAPI.fx && typeof nightAPI.fx.celebrateBlow === 'function') {
      nightAPI.fx.celebrateBlow(fxOrigin);
    }

    const flashEl = $('#blowBurst');
    if (flashEl) {
      flashEl.style.setProperty('--blow-x', fxOrigin.x.toFixed(1) + 'px');
      flashEl.style.setProperty('--blow-y', fxOrigin.y.toFixed(1) + 'px');
      flashEl.classList.remove('on');
      void flashEl.offsetWidth;
      flashEl.classList.add('on');
      clearTimeout(blowCandle._flashT);
      blowCandle._flashT = setTimeout(() => flashEl.classList.remove('on'), 2000);
    }
    $('#toast').classList.add('show');
    live.textContent = '愿望已送达。点一下蜡烛，可以重新点亮。';
    clearTimeout(blowCandle._t);
    blowCandle._t = setTimeout(() => $('#toast').classList.remove('show'), 6200);
    // 只有首次吹灭才把这封信递给你，之后（重新点亮再吹灭）不再弹出
    if (!letterShownOnce) {
      letterShownOnce = true;
      clearTimeout(blowCandle._letterT);
      blowCandle._letterT = setTimeout(() => { if (state.mode === 'night') openLetter(); }, 1400);
    }
  }

  function relightCandle() {
    state.candleLit = true;
    night.classList.remove('is-out');
    $('#blowText').textContent = '许个愿，吹灭蜡烛';
    $('#relightBtn').hidden = true;
    const flashEl = $('#blowBurst');
    if (flashEl) flashEl.classList.remove('on');
    $('#toast').classList.remove('show');
    if (nightAPI && nightAPI.cake) nightAPI.cake.setCandleLit(true);
    live.textContent = '蜡烛重新点亮了，再点一下蜡烛，可以再次吹灭、再看一遍那封信。';
  }

  function setActiveTab(mode) {
    const tabs = $$('#fxTabs .fx-tab');
    tabs.forEach(tab => {
      const on = tab.dataset.mode === mode;
      tab.classList.toggle('active', on);
      tab.setAttribute('aria-selected', String(on));
    });
  }

  function setFxMode(mode) {
    state.fxMode = mode;
    setActiveTab(mode);
    if (nightAPI) {
      if (nightAPI.fx) nightAPI.fx.setMode(mode);
      if (nightAPI.cake) nightAPI.cake.setFxMode(mode);
    }
    const names = { stars: '星河', snow: '小雪', meteor: '流星雨', halo: '梦幻光环' };
    live.textContent = `已切换到${names[mode] || '星河'}效果。`;
  }

  /* ----------------------------------------------------------
     UI bindings
     ---------------------------------------------------------- */
  function updateSoundUI() {
    const btn = $('#soundBtn');
    btn.setAttribute('aria-pressed', String(state.soundOn));
    $('#soundText').textContent = state.soundOn ? '声音已开启' : '声音已关闭';
    btn.classList.toggle('on', state.soundOn);
  }

  // 祝福墙信封：任何“离开祝福墙”的方式都先撕开信封，再进夜晚
  // （底部按钮 / 便利贴里的按钮 / 直接点信封，三处都走这里，保证撕信动效一定看得到）
  function tearWall() {
    if (wallTorn || state.mode !== 'wall') return;
    wallTorn = true;
    wallTitle.classList.add('tear');
    setTimeout(() => {
      if (state.mode === 'wall') goNight();
    }, REDUCED ? 420 : 1500);
  }

  openBtn.addEventListener('click', goHeart);
  $('#heartNext').addEventListener('click', goWall);
  $('#wallNext').addEventListener('click', () => {
    if (state.mode === 'wall' && !state.noteOpen) tearWall();
  });

  bindTap(wallTitle, () => tearWall());
  bindTap(document.querySelector('.env-tip'), () => tearWall());

  noteSave.addEventListener('click', toggleSave);
  noteNext.addEventListener('click', () => {
    const mode = state.noteMode;
    closeNote(() => {
      if (mode === 'heart') goWall();
      else if (mode === 'wall') tearWall();
    });
  });
  noteClose.addEventListener('click', () => closeNote());
  $('#noteBackdrop').addEventListener('click', () => closeNote());

  $('#letterBtn').addEventListener('click', openLetter);
  $('#letterClose').addEventListener('click', closeLetter);
  $('#letterBackdrop').addEventListener('click', closeLetter);
  $('#blowBtn').addEventListener('click', blowCandle);
  $('#relightBtn').addEventListener('click', relightCandle);

  $('#fxTabs').addEventListener('click', (e) => {
    const tab = e.target.closest('.fx-tab');
    if (!tab) return;
    setFxMode(tab.dataset.mode);
  });

  // 蛋糕画布：拖拽旋转 · 滚轮缩放 · 点蜡烛吹灭 · 点蛋糕翻转 · 点星星许愿
  const cakeCanvas = $('#cake');
  let cakePointerDrag = false;

  cakeCanvas.addEventListener('pointerdown', (e) => {
    if (!nightAPI || !nightAPI.cake) return;
    cakePointerDrag = true;
    nightAPI.cake.startDrag(e.clientX);
  });
  window.addEventListener('pointermove', (e) => {
    if (cakePointerDrag && nightAPI && nightAPI.cake) {
      nightAPI.cake.moveDrag(e.clientX);
    }
  });
  window.addEventListener('pointerup', () => {
    if (cakePointerDrag) {
      if (nightAPI && nightAPI.cake) nightAPI.cake.endDrag();
      cakePointerDrag = false;
    }
  });
  cakeCanvas.addEventListener('wheel', (e) => {
    if (!nightAPI || !nightAPI.cake) return;
    e.preventDefault();
    nightAPI.cake.wheelZoom(e.deltaY);
  }, { passive: false });

  let cakeTaps = 0;
  let cakeTapTimer = 0;
  function tapCake() {
    if (nightAPI && nightAPI.cake && typeof nightAPI.cake.toggleSpinDir === 'function') {
      nightAPI.cake.toggleSpinDir();
    }
    cakeTaps += 1;
    clearTimeout(cakeTapTimer);
    cakeTapTimer = setTimeout(() => { cakeTaps = 0; }, 2200);
    if (cakeTaps >= 5) {
      cakeTaps = 0;
      if (nightAPI.fx && typeof nightAPI.fx.goldenBurst === 'function') nightAPI.fx.goldenBurst();
      flashWords('生日快乐 ✦');
      live.textContent = '彩蛋解锁：金色流星雨！';
    }
  }

  function wishTap(x, y) {
    if (nightAPI.fx && typeof nightAPI.fx.shootWish === 'function') {
      nightAPI.fx.shootWish(x, y);
    }
    spawnWishLine(x, y);
  }

  cakeCanvas.addEventListener('click', (e) => {
    if (!nightAPI || !nightAPI.cake) return;
    if (typeof nightAPI.cake.isDragGesture === 'function' && nightAPI.cake.isDragGesture()) return;
    const rect = cakeCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const hit = typeof nightAPI.cake.hitTestAt === 'function' ? nightAPI.cake.hitTestAt(x, y) : 'body';
    if (hit === 'flame') {
      blowCandle();
    } else if (hit === 'body') {
      tapCake();
    } else {
      wishTap(x, y);
    }
  });

  /* 许愿字幕：点击星星时上浮一句心愿 */
  const WISH_LINES = [
    '许一个温柔的愿望 ✦', '星河都听见了 ♡', '愿你万事胜意',
    '把星光收进心里', '好运正在赶来', '愿你的梦都发光'
  ];
  function spawnWishLine(x, y) {
    const el = document.createElement('div');
    el.className = 'wish-line';
    el.textContent = WISH_LINES[Math.floor(Math.random() * WISH_LINES.length)];
    const rect = night.getBoundingClientRect();
    el.style.left = (x / rect.width * 100).toFixed(1) + '%';
    el.style.top = Math.min(90, Math.max(6, y / rect.height * 100 - 6)).toFixed(1) + '%';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2600);
  }

  /* 彩蛋全屏闪字 */
  function flashWords(text) {
    const el = document.createElement('div');
    el.className = 'flash-words';
    el.textContent = text;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1900);
  }

  $('#soundBtn').addEventListener('click', () => {
    if (state.soundOn) stopSound();
    else startSound();
  });

  /* ----------------------------------------------------------
     自定义设置（名字 / 一封信）
     ---------------------------------------------------------- */
  const settingsRoot = $('#settings');

  function applyConfigToPage() {
    const nameEl = $('.day-kicker b');
    if (nameEl) nameEl.textContent = CONFIG.name;
    if (typeof buildLetter === 'function') buildLetter();
  }

  function fillSettingsForm() {
    $('#setName').value = CONFIG.name;
    $('#setLetterTitle').value = CONFIG.letterTitle;
    $('#setLetterSign').value = CONFIG.letterSign;
    $('#setLetter').value = CONFIG.letter.join('\n');
  }

  function openSettings() {
    if (!settingsRoot) return;
    fillSettingsForm();
    settingsRoot.classList.add('open');
    settingsRoot.setAttribute('aria-hidden', 'false');
    lastNoteFocus = document.activeElement;
    setTimeout(() => { const i = $('#setName'); if (i && i.focus) i.focus(); }, 80);
  }

  function closeSettings() {
    if (!settingsRoot) return;
    settingsRoot.classList.remove('open');
    settingsRoot.setAttribute('aria-hidden', 'true');
    if (lastNoteFocus && lastNoteFocus.focus) lastNoteFocus.focus();
  }

  function notifySettings(msg) {
    const hint = $('#settingsHint');
    if (hint) hint.textContent = msg;
    live.textContent = msg;
  }

  function saveSettings() {
    const name = $('#setName').value.trim();
    const title = $('#setLetterTitle').value.trim();
    const sign = $('#setLetterSign').value.trim();
    const lines = $('#setLetter').value.split('\n').map(s => s.trim()).filter(Boolean);
    if (name) CONFIG.name = name;
    if (title) CONFIG.letterTitle = title;
    if (sign) CONFIG.letterSign = sign;
    if (lines.length) CONFIG.letter = lines;
    try {
      localStorage.setItem(CUSTOM_KEY, JSON.stringify({
        name: CONFIG.name,
        letterTitle: CONFIG.letterTitle,
        letterSign: CONFIG.letterSign,
        letter: CONFIG.letter
      }));
    } catch (e) { /* 存储失败不阻塞 */ }
    applyConfigToPage();
    closeSettings();
    notifySettings('设置已保存，已应用到整页。');
  }

  function resetSettings() {
    CONFIG.name = CONFIG_DEFAULT.name;
    CONFIG.letterTitle = CONFIG_DEFAULT.letterTitle;
    CONFIG.letterSign = CONFIG_DEFAULT.letterSign;
    CONFIG.letter = CONFIG_DEFAULT.letter.slice();
    try { localStorage.removeItem(CUSTOM_KEY); } catch (e) { /* noop */ }
    applyConfigToPage();
    fillSettingsForm();
    notifySettings('已恢复默认内容。');
  }

  function exportSettings() {
    const c = {
      name: CONFIG.name,
      letterTitle: CONFIG.letterTitle,
      letterSign: CONFIG.letterSign,
      letter: CONFIG.letter
    };
    const js = '/* 生日贺卡 · 成品配置 —— 由页面“设置 → 导出成品配置”生成\n' +
      '   把本文件放进生日贺卡文件夹（与 index.html 同目录），打开页面即为成品 */\n' +
      'window.CUSTOM = ' + JSON.stringify(c, null, 2) + ';\n';
    const blob = new Blob([js], { type: 'text/javascript' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'custom.js';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 3000);
    notifySettings('已导出 custom.js：放进生日文件夹，朋友打开即成品。');
  }

  function importSettings(file) {
    if (!file) return;
    const rd = new FileReader();
    rd.onload = () => {
      try {
        const c = JSON.parse(rd.result);
        if (!c || typeof c !== 'object') throw new Error('bad');
        if (typeof c.name === 'string' && c.name.trim()) CONFIG.name = c.name.trim();
        if (typeof c.letterTitle === 'string' && c.letterTitle.trim()) CONFIG.letterTitle = c.letterTitle.trim();
        if (typeof c.letterSign === 'string' && c.letterSign.trim()) CONFIG.letterSign = c.letterSign.trim();
        if (Array.isArray(c.letter)) {
          const ls = c.letter.map(s => String(s).trim()).filter(Boolean);
          if (ls.length) CONFIG.letter = ls;
        }
        localStorage.setItem(CUSTOM_KEY, JSON.stringify({
          name: CONFIG.name,
          letterTitle: CONFIG.letterTitle,
          letterSign: CONFIG.letterSign,
          letter: CONFIG.letter
        }));
        applyConfigToPage();
        fillSettingsForm();
        notifySettings('配置已导入并生效。');
      } catch (e) {
        notifySettings('导入失败：文件不是有效的配置。');
      }
    };
    rd.readAsText(file);
  }

  $('#settingsBtn').addEventListener('click', openSettings);
  $('#settingsClose').addEventListener('click', closeSettings);
  $('#settingsBackdrop').addEventListener('click', closeSettings);
  $('#setSave').addEventListener('click', saveSettings);
  $('#setReset').addEventListener('click', resetSettings);
  $('#setExport').addEventListener('click', exportSettings);
  $('#setImport').addEventListener('click', () => { const f = $('#setImportFile'); if (f) f.click(); });
  $('#setImportFile').addEventListener('change', (e) => {
    importSettings(e.target.files && e.target.files[0]);
    e.target.value = '';
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && settingsRoot && settingsRoot.classList.contains('open')) closeSettings();
  });


  $('#replayBtn').addEventListener('click', () => {
    location.reload();
  });

  document.addEventListener('keydown', (e) => {
    const noteFocused = state.noteOpen || state.noteOpening;
    if (e.key === 'Escape') {
      if (noteFocused) {
        e.preventDefault();
        closeNote();
        return;
      }
      if ($('#letter').classList.contains('open')) closeLetter();
    }
    if ((e.key === 'b' || e.key === 'B') && state.mode === 'night') {
      blowCandle();
    }
    if (e.key === 'Tab' && state.noteOpen) {
      const focusables = [noteClose, noteSave, noteNext];
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  /* resize */
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      applyCardScale();
      if (state.mode === 'intro') layoutDeck(true);
      else if (state.mode === 'heart') layoutHeart(true);
      else if (state.mode === 'wall') layoutWall(true);
      positionIntro();
      if (nightAPI) nightAPI.resize();
    }, 180);
  });

  /* ----------------------------------------------------------
     Boot
     ---------------------------------------------------------- */
  function boot() {
    buildCards();
    applyCardScale();
    layoutDeck(false);
    positionIntro();
    const nameEl = $('.day-kicker b');
    if (nameEl) nameEl.textContent = CONFIG.name;

    const ready = () => requestAnimationFrame(() => {
      day.classList.add('ready');
      positionIntro();
    });
    if (document.fonts && document.fonts.ready) {
      Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1400))]).then(ready);
      document.fonts.ready.then(positionIntro);
    } else {
      setTimeout(ready, 300);
    }

    // expose a small API for tinkering / testing
    window.birthday = {
      heart: goHeart,
      wall: goWall,
      night: goNight,
      blow: blowCandle,
      relight: relightCandle,
      letter: openLetter,
      fx: setFxMode,
      note: (i) => openNote(CARDS[clamp(Number(i) || 0, 0, CARDS.length - 1)]),
      closeNote,
      sound: { start: startSound, stop: stopSound },
      cards: CARDS,
      saved: SAVED,
      state
    };
  }

  boot();

  /* ----------------------------------------------------------
     BGM autoplay: try to start the moment the page opens.
     Browsers may block audio until the first user gesture, so we
     also arm a one-time first-interaction fallback.
     ---------------------------------------------------------- */
  (function autoplayBgm() {
    if (!state.soundOn) {
      startSound().catch(() => { /* blocked until first gesture */ });
    }
    const armFirstGesture = () => {
      if (!state.soundOn) {
        startSound().catch(() => { /* noop */ });
      }
      document.removeEventListener('pointerdown', armFirstGesture);
      document.removeEventListener('keydown', armFirstGesture);
      document.removeEventListener('touchstart', armFirstGesture);
    };
    document.addEventListener('pointerdown', armFirstGesture, { passive: true });
    document.addEventListener('keydown', armFirstGesture);
    document.addEventListener('touchstart', armFirstGesture, { passive: true });
  })();
})();
