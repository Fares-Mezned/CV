/* ============================================================================
   FARES MEZNED — OBSIDIAN & GOLD STUDIO ENGINE
   Zero dependencies · 60fps GPU-composited · ScrollStack + HoloTilt + i18n
   ============================================================================ */

(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ------------------------------------------------
     1. MINIMALIST EDITORIAL SPRING HALO CURSOR
  ------------------------------------------------ */
  function initCursor() {
    if (!finePointer || prefersReducedMotion) return;
    var reticle = document.createElement('div');
    reticle.id = 'cursor-reticle';
    reticle.setAttribute('aria-hidden', 'true');
    document.body.appendChild(reticle);

    var mx = -100, my = -100, cx = -100, cy = -100, shown = false;

    document.addEventListener('mousemove', function (e) {
      mx = e.clientX;
      my = e.clientY;
      if (!shown) {
        cx = mx; cy = my; shown = true;
        reticle.classList.add('active');
      }
    }, { passive: true });

    document.addEventListener('mouseleave', function () {
      shown = false;
      reticle.classList.remove('active');
    });

    document.addEventListener('mouseover', function (e) {
      var interactive = e.target.closest('a, button, input, .portrait-stage, .signal-node, .bento-card');
      reticle.classList.toggle('big', !!interactive);
    });

    (function loop() {
      cx += (mx - cx) * 0.24;
      cy += (my - cy) * 0.24;
      reticle.style.transform = 'translate3d(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px,0)';
      requestAnimationFrame(loop);
    })();
  }

  /* ------------------------------------------------
     2. CALM OBSIDIAN & BRUSHED GOLD ATMOSPHERIC CANVAS
  ------------------------------------------------ */
  function initWebGLBackdrop() {
    var cv = document.getElementById('webgl-bg');
    if (cv) {
      var gl = cv.getContext('webgl', { antialias: false, powerPreference: 'high-performance' });
      if (gl) {
        var vs = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
        var fs = [
          '#ifdef GL_FRAGMENT_PRECISION_HIGH',
          'precision highp float;',
          '#else',
          'precision mediump float;',
          '#endif',
          'uniform vec2 u_res;',
          'uniform vec2 u_mouse;',
          'uniform float u_time;',
          'uniform float u_scroll;',
          'float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}',
          'float noise(vec2 p){',
          '  vec2 i=floor(p),f=fract(p);',
          '  f=f*f*(3.0-2.0*f);',
          '  float a=hash(i),b=hash(i+vec2(1.0,0.0)),c=hash(i+vec2(0.0,1.0)),d=hash(i+vec2(1.0,1.0));',
          '  return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);',
          '}',
          'float fbm(vec2 p){',
          '  float v=0.0,a=0.5;',
          '  mat2 rot=mat2(0.8,-0.6,0.6,0.8);',
          '  for(int i=0;i<4;i++){v+=a*noise(p);p=rot*p*2.02+vec2(1.7,9.2);a*=0.5;}',
          '  return v;',
          '}',
          'void main(){',
          '  vec2 uv=gl_FragCoord.xy/u_res;',
          '  vec2 p=(gl_FragCoord.xy-0.5*u_res)/u_res.y;',
          '  vec2 mo=(u_mouse-0.5)*vec2(u_res.x/u_res.y,1.0);',
          '  float dist=length(p-mo);',
          '  float t=u_time*0.045+u_scroll*0.08;',
          '  vec2 q=vec2(fbm(p*1.25+vec2(t,t*0.35)),fbm(p*1.25+vec2(-t*0.45,t*0.5)+vec2(4.2,1.9)));',
          '  float f=fbm(p*1.15+1.7*q);',
          '  // Pure Obsidian -> Warm Studio Amber Silk Veils',
          '  vec3 cBlack=vec3(0.0,0.0,0.0);',
          '  vec3 cChar=vec3(0.039,0.031,0.024);',
          '  vec3 cBronze=vec3(0.24,0.18,0.11);',
          '  vec3 cGold=vec3(0.831,0.686,0.216);',
          '  vec3 col=mix(cBlack,cChar,smoothstep(0.25,0.65,f));',
          '  col=mix(col,cBronze,smoothstep(0.58,0.92,f)*0.22);',
          '  // Fine silk topographic contour shimmer in Antique Gold',
          '  float crest=1.0-smoothstep(0.0,0.045,abs(fract(f*7.0)-0.5));',
          '  col+=cGold*crest*0.08*smoothstep(0.32,0.85,f);',
          '  // Soft atmospheric cursor bloom',
          '  col+=cGold*exp(-dist*3.4)*0.055;',
          '  // Deep film noir edge vignette',
          '  col*=1.0-0.42*length(uv-0.5);',
          '  gl_FragColor=vec4(col,1.0);',
          '}'
        ].join('\n');

        function compile(type, src) {
          var sh = gl.createShader(type);
          gl.shaderSource(sh, src);
          gl.compileShader(sh);
          return sh;
        }
        var prog = gl.createProgram();
        gl.attachShader(prog, compile(gl.VERTEX_SHADER, vs));
        gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fs));
        gl.linkProgram(prog);
        if (gl.getProgramParameter(prog, gl.LINK_STATUS)) {
          gl.useProgram(prog);
          gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
          gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
          var attr = gl.getAttribLocation(prog, 'a');
          gl.enableVertexAttribArray(attr);
          gl.vertexAttribPointer(attr, 2, gl.FLOAT, false, 0, 0);

          var uRes = gl.getUniformLocation(prog, 'u_res');
          var uMouse = gl.getUniformLocation(prog, 'u_mouse');
          var uTime = gl.getUniformLocation(prog, 'u_time');
          var uScroll = gl.getUniformLocation(prog, 'u_scroll');
          var mx = 0.68, my = 0.48, sx = 0.68, sy = 0.48;

          function resize() {
            var sc = 0.5;
            cv.width = Math.max(320, Math.round(window.innerWidth * sc));
            cv.height = Math.max(240, Math.round(window.innerHeight * sc));
            gl.viewport(0, 0, cv.width, cv.height);
          }
          resize();
          window.addEventListener('resize', resize);
          window.addEventListener('mousemove', function (e) {
            mx = e.clientX / Math.max(window.innerWidth, 1);
            my = 1 - (e.clientY / Math.max(window.innerHeight, 1));
          }, { passive: true });

          function draw(ts) {
            sx += (mx - sx) * 0.04;
            sy += (my - sy) * 0.04;
            gl.uniform2f(uRes, cv.width, cv.height);
            gl.uniform2f(uMouse, sx, sy);
            gl.uniform1f(uTime, prefersReducedMotion ? 1.5 : ts * 0.001);
            gl.uniform1f(uScroll, window.scrollY / Math.max(window.innerHeight, 1));
            gl.drawArrays(gl.TRIANGLES, 0, 3);
            if (!prefersReducedMotion) requestAnimationFrame(draw);
          }
          if (prefersReducedMotion) draw(0); else requestAnimationFrame(draw);
        }
      }
    }

    // Sub-page warm gold dust particles inside .header-canvas
    document.querySelectorAll('.header-canvas').forEach(function (hcv) {
      var hctx = hcv.getContext('2d');
      var hW = 0, hH = 0, hdpr = Math.min(window.devicePixelRatio || 1, 2);
      var hPts = [];
      function buildH() {
        hW = hcv.clientWidth || window.innerWidth;
        hH = hcv.clientHeight || 280;
        hcv.width = Math.round(hW * hdpr);
        hcv.height = Math.round(hH * hdpr);
        hctx.setTransform(hdpr, 0, 0, hdpr, 0, 0);
        hPts = [];
        for (var i = 0; i < 36; i++) {
          hPts.push({
            x: Math.random() * hW,
            y: Math.random() * hH,
            vx: (Math.random() - 0.5) * 0.24,
            vy: (Math.random() - 0.5) * 0.18,
            gold: i % 4 === 0
          });
        }
      }
      function frameH() {
        hctx.clearRect(0, 0, hW, hH);
        for (var i = 0; i < hPts.length; i++) {
          var p = hPts[i];
          if (!prefersReducedMotion) {
            p.x = (p.x + p.vx + hW) % hW;
            p.y = (p.y + p.vy + hH) % hH;
          }
          hctx.fillStyle = p.gold ? 'rgba(212, 175, 55, 0.52)' : 'rgba(232, 223, 216, 0.22)';
          hctx.fillRect(p.x, p.y, 2, 2);
        }
        if (!prefersReducedMotion) requestAnimationFrame(frameH);
      }
      buildH();
      window.addEventListener('resize', buildH);
      if (prefersReducedMotion) frameH(); else requestAnimationFrame(frameH);
    });
  }

  /* ------------------------------------------------
     3. LENS-FOCUS INTERSECTION REVEALS
  ------------------------------------------------ */
  function initReveals() {
    var targets = document.querySelectorAll('.reveal, .reveal-stagger');
    if (!targets.length) return;
    if (prefersReducedMotion) {
      targets.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    function checkReveals() {
      var vh = window.innerHeight || 800;
      var atBottom = (window.scrollY + vh) >= (document.documentElement.scrollHeight - 36);
      targets.forEach(function (el) {
        if (el.hidden) return;
        var r = el.getBoundingClientRect();
        if (atBottom || r.top < vh * 0.94) {
          el.classList.add('is-visible');
        }
      });
    }

    window.__checkReveals = checkReveals;
    requestAnimationFrame(function () { requestAnimationFrame(checkReveals); });
    window.addEventListener('scroll', checkReveals, { passive: true });
    window.addEventListener('resize', checkReveals, { passive: true });
  }

  /* ------------------------------------------------
     4. SCROLL PROGRESS RIBBON, TIMELINE SPINE & SCROLLSTACK ENGINE
  ------------------------------------------------ */
  function initScrollPhysics() {
    var progressLine = document.querySelector('.progress-line');
    var timelines = document.querySelectorAll('.timeline');
    var deck = document.getElementById('projects-deck');

    function updateStack() {
      if (!deck) return;
      var vh = window.innerHeight || 800;
      var cards = Array.prototype.slice.call(deck.querySelectorAll('.scroll-stack-card')).filter(function (c) {
        return !c.hidden;
      });
      var flatMode = deck.classList.contains('is-flat') || window.innerWidth <= 900 || prefersReducedMotion;

      cards.forEach(function (card, idx) {
        card.style.zIndex = String(idx + 1);
        card.style.setProperty('--stack-i', String(Math.min(idx, 7)));

        if (flatMode || card.offsetHeight > vh * 0.74) {
          card.classList.add('is-expanded-tall');
          card.style.setProperty('--stack-s', '1');
          card.style.setProperty('--stack-b', '1');
          return;
        }
        card.classList.remove('is-expanded-tall');

        // Scale down gently as the next card rises up cleanly over this pinned card
        var next = cards[idx + 1];
        if (!next) {
          card.style.setProperty('--stack-s', '1');
          card.style.setProperty('--stack-b', '1');
          return;
        }
        var myTop = 90 + Math.min(idx, 7) * 16;
        var nextRect = next.getBoundingClientRect();
        var overlap = Math.max(0, Math.min(1, (vh * 0.88 - nextRect.top) / Math.max(240, vh * 0.88 - myTop)));
        var scale = 1 - overlap * 0.065;
        var bright = 1 - overlap * 0.24;
        card.style.setProperty('--stack-s', scale.toFixed(4));
        card.style.setProperty('--stack-b', bright.toFixed(3));
      });
    }

    window.__syncScrollStack = updateStack;

    function tick() {
      var y = window.scrollY;
      var vh = window.innerHeight || 800;
      var docH = Math.max(1, document.documentElement.scrollHeight - vh);
      var pct = Math.max(0, Math.min(100, (y / docH) * 100));
      if (progressLine) progressLine.style.width = pct.toFixed(2) + '%';

      timelines.forEach(function (tl) {
        var fill = tl.querySelector('.tl-spine-fill');
        if (!fill) return;
        var rect = tl.getBoundingClientRect();
        var filled = Math.max(0, Math.min(rect.height - 20, vh * 0.62 - rect.top));
        fill.style.height = filled.toFixed(0) + 'px';
      });

      updateStack();
    }

    tick();
    window.addEventListener('scroll', tick, { passive: true });
    window.addEventListener('resize', tick, { passive: true });
  }

  /* ------------------------------------------------
     5. EDITORIAL COMMAND NAVBAR, GLIDER & MOBILE DRAWER
  ------------------------------------------------ */
  function initNav() {
    var siteNav = document.querySelector('.site-nav');
    if (siteNav) {
      function syncNavDock() {
        siteNav.classList.toggle('is-scrolled', window.scrollY > 24);
      }
      syncNavDock();
      window.addEventListener('scroll', syncNavDock, { passive: true });
    }

    var page = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a.nav-primary, .mobile-drawer a.m-main').forEach(function (a) {
      var href = a.getAttribute('href');
      if (href === page || (page === '' && href === 'index.html')) {
        a.classList.add('active');
        a.setAttribute('aria-current', 'page');
      } else {
        a.classList.remove('active');
        a.removeAttribute('aria-current');
      }
    });

    var navLinks = document.querySelector('.nav-links');
    var glider = navLinks ? navLinks.querySelector('.nav-glider') : null;
    function moveGlider(itemEl) {
      if (!navLinks || !glider || !itemEl) return;
      var lr = navLinks.getBoundingClientRect();
      var ir = itemEl.getBoundingClientRect();
      if (!lr.width || !ir.width) return;
      glider.style.width = ir.width.toFixed(1) + 'px';
      glider.style.transform = 'translate3d(' + (ir.left - lr.left).toFixed(1) + 'px,0,0)';
      glider.style.opacity = '1';
    }
    function resetGlider() {
      if (!navLinks || !glider) return;
      var activeLink = navLinks.querySelector('a.nav-primary.active');
      var activeItem = activeLink ? activeLink.closest('.nav-item') : navLinks.querySelector('.nav-item');
      if (activeItem) moveGlider(activeItem);
    }
    if (navLinks && glider) {
      navLinks.querySelectorAll('.nav-item').forEach(function (item) {
        item.addEventListener('mouseenter', function () { moveGlider(item); });
        item.addEventListener('focusin', function () { moveGlider(item); });
      });
      navLinks.addEventListener('mouseleave', resetGlider);
      navLinks.addEventListener('focusout', function (e) {
        if (!navLinks.contains(e.relatedTarget)) resetGlider();
      });
      window.addEventListener('resize', resetGlider, { passive: true });
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(resetGlider);
      }
      requestAnimationFrame(resetGlider);
      window.__syncNavGlider = resetGlider;
    }

    var navItems = document.querySelectorAll('.nav-item');
    function closeAllSubmenus() {
      navItems.forEach(function (item) {
        item.classList.remove('open');
        var btn = item.querySelector('.sub-toggle');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      });
    }
    navItems.forEach(function (item) {
      var btn = item.querySelector('.sub-toggle');
      if (!btn) return;
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var willOpen = !item.classList.contains('open');
        closeAllSubmenus();
        if (willOpen) {
          item.classList.add('open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
    document.addEventListener('click', closeAllSubmenus);
    document.querySelectorAll('.nav-submenu a').forEach(function (a) {
      a.addEventListener('click', function () {
        closeAllSubmenus();
        if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
      });
    });

    var toggle = document.querySelector('.mobile-toggle');
    var drawer = document.querySelector('.mobile-drawer');
    var scrim = null;
    if (drawer) {
      scrim = document.querySelector('.mobile-scrim');
      if (!scrim) {
        scrim = document.createElement('div');
        scrim.className = 'mobile-scrim';
        scrim.setAttribute('aria-hidden', 'true');
        drawer.parentNode.insertBefore(scrim, drawer);
      }
    }
    function setDrawerOpen(open) {
      if (!drawer || !toggle) return;
      drawer.classList.toggle('open', open);
      if (scrim) scrim.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
      var lbl = toggle.querySelector('.mob-label') || toggle;
      lbl.textContent = open ? 'CLOSE' : 'MENU';
    }
    if (toggle && drawer) {
      toggle.addEventListener('click', function (e) {
        e.stopPropagation();
        setDrawerOpen(!drawer.classList.contains('open'));
      });
      if (scrim) scrim.addEventListener('click', function () { setDrawerOpen(false); });
      drawer.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () { setDrawerOpen(false); });
      });
      document.addEventListener('click', function (e) {
        if (!drawer.contains(e.target) && !toggle.contains(e.target)) setDrawerOpen(false);
      });
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeAllSubmenus();
        if (drawer && drawer.classList.contains('open')) setDrawerOpen(false);
      }
    });
  }

  /* ------------------------------------------------
     6. 3D HOLOGRAPHIC PORTRAIT STAGE (COLOR FLOOD + 16DEG TILT)
  ------------------------------------------------ */
  function initPortraitStages() {
    document.querySelectorAll('.portrait-stage').forEach(function (stage) {
      function updateCoords(clientX, clientY) {
        var r = stage.getBoundingClientRect();
        var xPct = ((clientX - r.left) / Math.max(r.width, 1)) * 100;
        var yPct = ((clientY - r.top) / Math.max(r.height, 1)) * 100;
        stage.style.setProperty('--px', Math.max(0, Math.min(100, xPct)).toFixed(1) + '%');
        stage.style.setProperty('--py', Math.max(0, Math.min(100, yPct)).toFixed(1) + '%');

        if (!prefersReducedMotion && finePointer) {
          var rx = ((yPct / 100) - 0.5) * -14;
          var ry = ((xPct / 100) - 0.5) * 14;
          stage.style.setProperty('--hp-rx', rx.toFixed(2) + 'deg');
          stage.style.setProperty('--hp-ry', ry.toFixed(2) + 'deg');
        }
      }

      stage.addEventListener('mouseenter', function (e) { updateCoords(e.clientX, e.clientY); });
      stage.addEventListener('mousemove', function (e) { updateCoords(e.clientX, e.clientY); });
      stage.addEventListener('mouseleave', function () {
        stage.style.setProperty('--hp-rx', '0deg');
        stage.style.setProperty('--hp-ry', '0deg');
      });

      function toggleLock(e) {
        if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') return;
        if (e.type === 'keydown') e.preventDefault();
        var locked = stage.classList.toggle('color-locked');
        stage.setAttribute('aria-pressed', String(locked));
      }
      stage.addEventListener('click', toggleLock);
      stage.addEventListener('keydown', toggleLock);
    });
  }

  /* ------------------------------------------------
     7. PROJECTS: SCROLLSTACK DECK, FILTERS, PREVIEW FRAMES, ESP32 & GITHUB
  ------------------------------------------------ */
  function initProjects() {
    var chips = document.querySelectorAll('.filter-chip[data-filter]');
    var cards = document.querySelectorAll('.scroll-stack-card[data-domain]');
    var deck = document.getElementById('projects-deck');
    var deckBtn = document.getElementById('deck-mode-btn');

    function applyFilter(filter) {
      if (!cards.length) return;
      chips.forEach(function (c) {
        var match = c.getAttribute('data-filter') === filter;
        c.classList.toggle('active', match);
        c.setAttribute('aria-pressed', String(match));
      });
      cards.forEach(function (card) {
        var match = filter === 'all' || card.getAttribute('data-domain') === filter;
        card.hidden = !match;
      });
      if (window.__syncScrollStack) window.__syncScrollStack();
      if (window.__checkReveals) window.__checkReveals();
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        applyFilter(chip.getAttribute('data-filter'));
      });
    });

    if (deck && deckBtn) {
      deckBtn.addEventListener('click', function () {
        var flat = deck.classList.toggle('is-flat');
        deckBtn.classList.toggle('active', !flat);
        deckBtn.setAttribute('aria-pressed', String(!flat));
        deckBtn.textContent = flat ? 'VIEW: FLAT LIST' : 'DECK: STACKED';
        if (window.__syncScrollStack) window.__syncScrollStack();
      });
    }

    function syncHashFilter() {
      var hash = location.hash.replace('#', '').toLowerCase();
      if (['all', 'web', 'iot', 'auto', 'comp'].indexOf(hash) !== -1) {
        applyFilter(hash);
      }
    }
    syncHashFilter();
    window.addEventListener('hashchange', syncHashFilter);

    // Multi-device live viewport switcher across embedded site frames
    document.querySelectorAll('.preview-widget').forEach(function (widget) {
      var previewShell = widget.querySelector('.preview-shell');
      var deviceBtns = widget.querySelectorAll('.device-btn');
      var previewLabel = widget.querySelector('.preview-res');
      if (!previewShell || !deviceBtns.length) return;

      deviceBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
          var mode = btn.getAttribute('data-device');
          deviceBtns.forEach(function (b) {
            var on = b === btn;
            b.classList.toggle('active', on);
            b.setAttribute('aria-pressed', String(on));
          });
          previewShell.className = 'preview-shell';
          if (mode === 'tablet') {
            previewShell.classList.add('tablet');
            if (previewLabel) previewLabel.textContent = 'Viewport: 768px (Tablet)';
          } else if (mode === 'mobile') {
            previewShell.classList.add('mobile');
            if (previewLabel) previewLabel.textContent = 'Viewport: 375px (Mobile)';
          } else {
            if (previewLabel) previewLabel.textContent = 'Viewport: Full Width (Desktop)';
          }
          if (window.__syncScrollStack) window.__syncScrollStack();
        });
      });
    });

    // ESP32 Signal Architecture Schematic
    var pipeNodes = document.querySelectorAll('.signal-node');
    var pipeReadout = document.getElementById('signal-inspector');
    if (pipeNodes.length && pipeReadout) {
      var specs = {
        sensors: 'STAGE 01 // PHYSICAL TRANSDUCERS: Reads line voltage via stepped voltage divider, current via Hall-effect ACS712 sensor, and ambient thermal probes before ADC sampling.',
        mcu: 'STAGE 02 // ESP32 C++ FIRMWARE: Samples calibrated ADC channels in C++ on ESP32, computing instantaneous power (V x I) and integrated energy over time.',
        payload: 'STAGE 03 // TELEMETRY SERIALIZATION: Formats voltage, ACS712 current, power, energy consumption, and temperature metrics cleanly for cloud transmission.',
        cloud: 'STAGE 04 // FIREBASE REALTIME DB: Streams live JSON telemetry records over Wi-Fi into Firebase Realtime Database for persistent monitoring.'
      };
      pipeNodes.forEach(function (node) {
        node.addEventListener('click', function () {
          pipeNodes.forEach(function (n) { n.classList.remove('active'); });
          node.classList.add('active');
          var key = node.getAttribute('data-stage');
          if (specs[key]) pipeReadout.textContent = specs[key];
        });
      });
    }

    // Live Public GitHub Repositories
    var repoGrid = document.getElementById('github-repo-grid');
    if (repoGrid) {
      fetch('https://api.github.com/users/Fares-Mezned/repos?sort=updated&per_page=6')
        .then(function (r) { if (!r.ok) throw new Error(); return r.json(); })
        .then(function (repos) {
          var list = (repos || []).filter(function (x) { return !x.fork; }).slice(0, 6);
          if (!list.length) return;
          repoGrid.innerHTML = list.map(function (repo) {
            return (
              '<a href="' + repo.html_url + '" target="_blank" rel="noopener" class="repo-card">' +
                '<div>' +
                  '<span class="label" style="display:block;margin-bottom:8px;">// ' + escapeHtml(repo.language || 'Source') + '</span>' +
                  '<h4 style="font-family:\'Bebas Neue\',sans-serif;font-size:1.5rem;color:#FFFFFF;margin-bottom:6px;">' + escapeHtml(repo.name) + '</h4>' +
                  '<p>' + escapeHtml(repo.description || 'Repository on github.com/Fares-Mezned') + '</p>' +
                '</div>' +
                '<div class="repo-foot">' +
                  '<span>Stars: ' + (repo.stargazers_count || 0) + '</span>' +
                  '<span style="color:var(--gold);">OPEN REPO &#8599;</span>' +
                '</div>' +
              '</a>'
            );
          }).join('');
        })
        .catch(function () {});
    }
  }

  /* ------------------------------------------------
     8. INTERACTIVE PROJECT SANDBOXES (projects.html)
  ------------------------------------------------ */
  function initProjectSandboxes() {
    var sortBox = document.getElementById('sort-sandbox');
    if (sortBox) {
      var bucketShot = document.getElementById('bucket-screenshots');
      var bucketCode = document.getElementById('bucket-code');
      var bucketDocs = document.getElementById('bucket-docs');
      var fileBtns = sortBox.querySelectorAll('.sort-file-btn');
      var sortAllBtn = document.getElementById('sort-all-btn');
      var sortResetBtn = document.getElementById('sort-reset-btn');

      function routeFile(filename) {
        var low = filename.toLowerCase();
        var target = bucketDocs;
        if (low.indexOf('screenshot') !== -1 || low.endsWith('.png')) target = bucketShot;
        else if (low.endsWith('.py') || low.endsWith('.cpp') || low.endsWith('.ino') || low.endsWith('.js')) target = bucketCode;

        if (!target) return;
        if (target.querySelector('[data-sorted="' + filename + '"]')) return;
        var tag = document.createElement('span');
        tag.className = 'sort-item-tag';
        tag.setAttribute('data-sorted', filename);
        tag.textContent = filename;
        target.appendChild(tag);
      }

      fileBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
          routeFile(btn.getAttribute('data-file'));
          btn.classList.add('active');
        });
      });

      if (sortAllBtn) {
        sortAllBtn.addEventListener('click', function () {
          fileBtns.forEach(function (btn) {
            routeFile(btn.getAttribute('data-file'));
            btn.classList.add('active');
          });
        });
      }

      if (sortResetBtn) {
        sortResetBtn.addEventListener('click', function () {
          [bucketShot, bucketCode, bucketDocs].forEach(function (b) {
            if (!b) return;
            b.querySelectorAll('.sort-item-tag').forEach(function (t) { t.remove(); });
          });
          fileBtns.forEach(function (btn) { btn.classList.remove('active'); });
        });
      }
    }

    var discordBox = document.getElementById('discord-sandbox');
    if (discordBox) {
      var currentRole = 'member';
      var roleBtns = discordBox.querySelectorAll('.role-pick-btn');
      var actionBtns = discordBox.querySelectorAll('.discord-action-btn');
      var consoleEl = document.getElementById('discord-role-log');

      roleBtns.forEach(function (rb) {
        rb.addEventListener('click', function () {
          currentRole = rb.getAttribute('data-role');
          roleBtns.forEach(function (b) { b.classList.toggle('active', b === rb); });
          if (consoleEl) {
            consoleEl.className = 'role-console';
            consoleEl.textContent = 'ACTIVE ROLE: @' + (currentRole === 'admin' ? 'Authorized Role' : 'Member') + ' — click an action to verify gate.';
          }
        });
      });

      actionBtns.forEach(function (ab) {
        ab.addEventListener('click', function () {
          var act = ab.getAttribute('data-action');
          if (!consoleEl) return;
          if (currentRole !== 'admin') {
            consoleEl.className = 'role-console denied';
            consoleEl.textContent = '403 FORBIDDEN // "' + act + '" blocked: Missing required authorized Discord role.';
          } else {
            consoleEl.className = 'role-console ok';
            consoleEl.textContent = '200 OK // Role verified: "' + act + '" dispatched cleanly.';
          }
        });
      });
    }

    var fundBox = document.getElementById('fund-sandbox');
    if (fundBox) {
      var rates = {
        TND: { val: '1,360 TND', goal: 'Target: 2,000 TND', pct: '68%' },
        EUR: { val: '406 EUR', goal: 'Target: 600 EUR', pct: '68%' },
        USD: { val: '439 USD', goal: 'Target: 650 USD', pct: '68%' }
      };
      var currBtns = fundBox.querySelectorAll('.curr-btn');
      var amtEl = document.getElementById('fund-amount');
      var noteEl = document.getElementById('fund-note');
      var barEl = document.getElementById('fund-bar-fill');

      currBtns.forEach(function (cb) {
        cb.addEventListener('click', function () {
          var code = cb.getAttribute('data-curr');
          currBtns.forEach(function (b) { b.classList.toggle('active', b === cb); });
          var d = rates[code];
          if (!d) return;
          if (amtEl) amtEl.textContent = d.val;
          if (noteEl) noteEl.textContent = d.goal + ' (Interactive sample preview)';
          if (barEl) barEl.style.width = d.pct;
        });
      });
    }
  }

  /* ------------------------------------------------
     9. INTERACTIVE 3D GOLD CONSTELLATION SPHERE (about.html)
  ------------------------------------------------ */
  function initSkillsSphere() {
    var cv = document.getElementById('skills-canvas');
    var readout = document.getElementById('skill-inspector');
    if (!cv) return;

    var ctx = cv.getContext('2d');
    var skills = [
      { label: 'Python 3.14', note: 'Python 3.14: sort.py CLI, Discord bots, Playwright automation, GTA VI Fund, and FastAPI.' },
      { label: 'C / C++', note: 'C / C++: ESP32 IoT Telemetry System & Pre-Engineering algorithmic systems coursework.' },
      { label: 'JavaScript', note: 'JavaScript: Frontends for cs-smu.ieee.tn, Tinkywinky.tn, and React Native (FTL).' },
      { label: 'Java', note: 'Java: Object-Oriented Programming & foundational systems coursework at MedTech (SMU).' },
      { label: 'HTML5 / CSS3', note: 'HTML5 / CSS3: Accessible multi-page layouts, Obsidian architectures, and UI/UX engineering.' },
      { label: 'SQL', note: 'SQL: Relational schema design and querying in Database Systems coursework.' },
      { label: 'FastAPI', note: 'FastAPI: REST APIs and automated event registration backends.' },
      { label: 'Playwright', note: 'Playwright: Automated offer submission and auto-reply browser workflow bot.' },
      { label: 'React Native', note: 'React Native: Fantasy Tunisia League (FTL) mobile and web application.' },
      { label: 'Git & GitHub', note: 'Git & GitHub: Version control and automated CI/CD workflows for cs-smu.ieee.tn.' },
      { label: 'Netlify & DNS', note: 'Netlify & Oxahost DNS: Domain routing, custom records, and deployment (tinkywinky.tn, IEEE).' },
      { label: 'ESP32 IoT', note: 'ESP32 & Arduino IDE: Voltage, ACS712 current, power, and temperature sensing hardware.' },
      { label: 'Firebase RTDB', note: 'Firebase Realtime Database: Live real-time cloud logging for ESP32 sensor telemetry.' },
      { label: 'pandas / sklearn', note: 'pandas & scikit-learn: Python data calibration scripts and scientific workflows.' },
      { label: 'Linux CLI', note: 'Linux CLI & FileZilla: Workstation administration and SFTP server deployment.' }
    ];

    var N = skills.length;
    var goldenAngle = Math.PI * (3 - Math.sqrt(5));
    var nodes = skills.map(function (s, i) {
      var y = 1 - (i / (N - 1)) * 2;
      var r = Math.sqrt(Math.max(0, 1 - y * y));
      var theta = goldenAngle * i;
      return {
        label: s.label, note: s.note,
        x: Math.cos(theta) * r, y: y, z: Math.sin(theta) * r,
        sx: 0, sy: 0, sc: 1, zOut: 0
      };
    });

    var rotX = 0.22, rotY = 0.4, velX = 0.002, velY = 0.0048;
    var dragging = false, lastMX = 0, lastMY = 0, selectedIdx = -1;
    var W = 560, H = 360, dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      W = cv.clientWidth || 560;
      H = cv.clientHeight || 360;
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    cv.addEventListener('pointerdown', function (e) {
      dragging = true; lastMX = e.clientX; lastMY = e.clientY;
    });
    window.addEventListener('pointerup', function () { dragging = false; });
    cv.addEventListener('pointermove', function (e) {
      var r = cv.getBoundingClientRect();
      if (dragging) {
        velY = (e.clientX - lastMX) * 0.0045;
        velX = (e.clientY - lastMY) * 0.0045;
        lastMX = e.clientX; lastMY = e.clientY;
      } else if (!prefersReducedMotion) {
        velY = ((e.clientX - r.left) / W - 0.5) * 0.015;
        velX = ((e.clientY - r.top) / H - 0.5) * 0.012;
      }
    });

    cv.addEventListener('click', function (e) {
      var r = cv.getBoundingClientRect();
      var cx = e.clientX - r.left;
      var cy = e.clientY - r.top;
      var best = -1, bestDist = 44;
      for (var i = 0; i < nodes.length; i++) {
        var d = Math.hypot(nodes[i].sx - cx, nodes[i].sy - cy);
        if (d < bestDist) { bestDist = d; best = i; }
      }
      if (best !== -1) {
        selectedIdx = best;
        if (readout) {
          readout.textContent = nodes[best].note;
          readout.style.borderColor = '#D4AF37';
        }
      }
    });

    function frame() {
      if (!prefersReducedMotion) {
        rotY += velY;
        rotX += velX;
        if (!dragging) {
          velX *= 0.985;
          velY = velY * 0.985 + 0.0042 * 0.015;
        }
      }

      ctx.clearRect(0, 0, W, H);
      var rad = Math.min(W, H) * 0.36;
      var cosX = Math.cos(rotX), sinX = Math.sin(rotX);
      var cosY = Math.cos(rotY), sinY = Math.sin(rotY);

      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        var x1 = n.x * cosY - n.z * sinY;
        var z1 = n.z * cosY + n.x * sinY;
        var y2 = n.y * cosX - z1 * sinX;
        var z2 = z1 * cosX + n.y * sinX;
        var persp = 2.6 / (2.6 - z2);
        n.sx = W * 0.5 + x1 * rad * persp;
        n.sy = H * 0.5 + y2 * rad * persp;
        n.sc = persp;
        n.zOut = z2;
      }

      // Subtle bronze constellation edges
      ctx.lineWidth = 1;
      for (var a = 0; a < nodes.length; a++) {
        for (var b = a + 1; b < nodes.length; b++) {
          var dist3d = Math.hypot(nodes[a].x - nodes[b].x, nodes[a].y - nodes[b].y, nodes[a].z - nodes[b].z);
          if (dist3d < 0.92) {
            var depthA = Math.max(0.05, ((nodes[a].zOut + nodes[b].zOut + 2) * 0.25) * 0.26);
            ctx.strokeStyle = 'rgba(140, 109, 79, ' + depthA.toFixed(2) + ')';
            ctx.beginPath();
            ctx.moveTo(nodes[a].sx, nodes[a].sy);
            ctx.lineTo(nodes[b].sx, nodes[b].sy);
            ctx.stroke();
          }
        }
      }

      var order = nodes.map(function (_, i) { return i; }).sort(function (i, j) { return nodes[i].zOut - nodes[j].zOut; });
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      for (var k = 0; k < order.length; k++) {
        var idx = order[k];
        var item = nodes[idx];
        var alpha = Math.max(0.28, Math.min(1, (item.zOut + 1.2) * 0.48));
        var isSel = idx === selectedIdx;
        var isFront = item.zOut > 0.35;

        ctx.font = (isSel || isFront ? '700 ' : '500 ') + Math.round(11 * item.sc) + 'px "JetBrains Mono", monospace';
        ctx.fillStyle = isSel
          ? '#F7E7C4'
          : isFront
            ? 'rgba(212, 175, 55, ' + alpha.toFixed(2) + ')'
            : 'rgba(232, 223, 216, ' + alpha.toFixed(2) + ')';
        ctx.fillText(item.label, item.sx, item.sy);
      }

      if (!prefersReducedMotion) requestAnimationFrame(frame);
    }

    frame();
  }

  /* ------------------------------------------------
     10. COPY EMAIL TOAST INTERACTION
  ------------------------------------------------ */
  function initCopyEmail() {
    var btn = document.getElementById('copy-email-btn');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var addr = btn.getAttribute('data-email') || 'faresmezned8@gmail.com';
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(addr).catch(function () {});
      }
      var orig = btn.textContent;
      btn.textContent = 'COPIED: ' + addr;
      btn.style.borderColor = '#D4AF37';
      btn.style.color = '#F7E7C4';
      setTimeout(function () {
        btn.textContent = orig;
        btn.style.borderColor = '';
        btn.style.color = '';
      }, 2200);
    });
  }

  /* ------------------------------------------------
     11. INTERACTIVE TERMINAL CLI + SNAKE + GOLD MATRIX
  ------------------------------------------------ */
  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function triggerMatrix() {
    if (document.getElementById('matrix-overlay')) return;
    var ov = document.createElement('div');
    ov.id = 'matrix-overlay';
    ov.style.cssText = 'position:fixed;inset:0;z-index:10020;background:rgba(0,0,0,0.94);cursor:pointer;';
    var c = document.createElement('canvas');
    c.style.cssText = 'width:100%;height:100%;display:block;';
    ov.appendChild(c);

    var tag = document.createElement('div');
    tag.textContent = 'OBSIDIAN / GOLD TELEMETRY RAIN — CLICK OR PRESS ANY KEY TO EXIT';
    tag.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);padding:8px 16px;border-radius:4px;background:#0A0806;border:1px solid #D4AF37;color:#F7E7C4;font:600 11px/1 "JetBrains Mono",monospace;z-index:10021;';
    ov.appendChild(tag);
    document.body.appendChild(ov);

    var ctx = c.getContext('2d');
    var W = (c.width = window.innerWidth);
    var H = (c.height = window.innerHeight);
    var cols = Math.floor(W / 18);
    var drops = new Array(cols).fill(1);
    var chars = '01FARESMEZNEDIEEETUNISESP32PYTHONJAVA';
    var running = true;

    function draw() {
      if (!running) return;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.14)';
      ctx.fillRect(0, 0, W, H);
      ctx.font = '14px "JetBrains Mono", monospace';
      for (var i = 0; i < drops.length; i++) {
        var ch = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillStyle = i % 7 === 0 ? '#F7E7C4' : '#D4AF37';
        ctx.fillText(ch, i * 18, drops[i] * 18);
        if (drops[i] * 18 > H && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);

    function close() {
      running = false;
      window.removeEventListener('keydown', close);
      if (ov.parentNode) ov.parentNode.removeChild(ov);
    }
    ov.addEventListener('click', close);
    window.addEventListener('keydown', close);
  }

  function initTerminal() {
    var screen = document.getElementById('term-screen');
    var form = document.getElementById('term-form');
    var input = document.getElementById('term-input');
    if (!screen || !form || !input) return;

    var history = [];
    var histIdx = 0;

    var commands = {
      help: function () {
        return [
          'Available commands:',
          '  whoami    Identity and university profile',
          '  about     Academic background and interests',
          '  skills    Technical languages, frameworks & hardware',
          '  projects  Ten authentic engineering builds',
          '  mandate   IEEE Computer Society SMU Webmaster summary',
          '  contact   Direct email, GitHub & LinkedIn channels',
          '  cv        Open printable ATS/academic CV dialog',
          '  github    Open github.com/Fares-Mezned',
          '  snake     Launch playable Snake inside terminal',
          '  matrix    Render obsidian/gold coordinate overlay',
          '  clear     Clear terminal output'
        ];
      },
      whoami: function () {
        return [
          'Fares Mezned — Sophomore Pre-Engineering Computer Science Student',
          'Institution : MedTech (South Mediterranean University / SMU), Tunis',
          'Leadership  : Webmaster, IEEE Computer Society SMU Chapter (since 2026)',
          'Recognition : Top 2 Worldwide — IEEEXtreme PreXtreme'
        ];
      },
      about: function () {
        return [
          'EDUCATION',
          '  Mediterranean Institute of Technology (MedTech, SMU)',
          '  Computer Science Engineering Degree (Expected 2030)',
          '  Foundation: Baccalauréat Technique (Technical Sciences)',
          '',
          'COMPETITIVE RECORD',
          '  Top 2 Worldwide — IEEEXtreme PreXtreme',
          '  Frequent hackathon builder (Team TinkyWinky, NOSTOS)',
          '  Languages: Arabic (Native), French (Professional), English (Professional)'
        ];
      },
      skills: function () {
        return [
          'LANGUAGES : Python (3.14), C/C++, Java, JavaScript, HTML, CSS, SQL',
          'FRAMEWORKS: FastAPI, Playwright, React Native, pandas, scikit-learn',
          'INFRA     : Git/GitHub, CI/CD, Netlify, Oxahost DNS, FileZilla, Linux CLI',
          'HARDWARE  : ESP32, Arduino IDE, ACS712 Current Sensor, Firebase RTDB'
        ];
      },
      projects: function () {
        return [
          '01  IEEE CS SMU Website         cs-smu.ieee.tn (Webmaster & CI/CD)',
          '02  Event Registration Flows    IEEE SMU hackathons & bootcamps',
          '03  ESP32 IoT Telemetry         C++, ACS712, voltage/temp -> Firebase',
          '04  GTA VI Launch Fund          Python + HTML TND/EUR/USD tracker',
          '05  Downloads Sorter (sort.py)  Python CLI extension & keyword organizer',
          '06  Discord Bot Utilities       Role-gated refresh & withdrawal controls',
          '07  Playwright Offer Bot        Automated submission, auto-reply, UI',
          '08  Fantasy Tunisia League      React Native Tunisian football fantasy app',
          '09  Team TinkyWinky             tinkywinky.tn (Netlify + Oxahost DNS)',
          '10  NOSTOS — Xenia Protocol     Autonomous permission-seeking robot'
        ];
      },
      mandate: function () {
        return [
          'IEEE Computer Society — SMU Student Branch Chapter',
          'Role   : Webmaster (mandate since 2026)',
          'URL    : https://cs-smu.ieee.tn',
          'Scope  : Full-stack web architecture, registration pipelines, GitHub CI/CD'
        ];
      },
      contact: function () {
        return [
          'Primary Email  : faresmezned8@gmail.com',
          'Academic Email : fares.mezned@medtech.tn',
          'GitHub         : github.com/Fares-Mezned',
          'LinkedIn       : linkedin.com/in/fares-mezned-3a17b237a',
          'Chapter Site   : cs-smu.ieee.tn'
        ];
      }
    };

    function print(lines) {
      lines.forEach(function (line) {
        var div = document.createElement('div');
        div.className = 'terminal-line term-out';
        div.textContent = line;
        screen.appendChild(div);
      });
      screen.scrollTop = screen.scrollHeight;
    }

    function printPrompt(cmd) {
      var div = document.createElement('div');
      div.className = 'terminal-line';
      div.innerHTML = '<span class="term-prompt">fares@medtech:~$</span> ' + escapeHtml(cmd);
      screen.appendChild(div);
    }

    function runCommand(raw) {
      var cmd = raw.trim().toLowerCase();
      if (!cmd) return;
      history.push(cmd);
      histIdx = history.length;

      if (cmd === 'clear') {
        stopActiveSnake();
        screen.innerHTML = '';
        return;
      }

      printPrompt(cmd);

      if (cmd === 'snake') {
        print(['Starting Snake... Arrow keys, WASD, or touch controls below. ESC to exit.']);
        startSnake();
      } else if (cmd === 'matrix') {
        print(['Rendering obsidian/gold telemetry overlay...']);
        triggerMatrix();
      } else if (cmd === 'cv') {
        print(['Opening print-ready CV dialog...']);
        setTimeout(function () { window.print(); }, 250);
      } else if (cmd === 'github') {
        print(['Opening https://github.com/Fares-Mezned ...']);
        window.open('https://github.com/Fares-Mezned', '_blank', 'noopener');
      } else if (cmd === 'sudo hire-me' || cmd === 'hire-me') {
        print(['Access granted. Primary contact: faresmezned8@gmail.com']);
      } else if (commands[cmd]) {
        print(commands[cmd]());
      } else {
        print(['bash: command not found: ' + cmd, 'Type "help" or click a command chip below.']);
      }
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var val = input.value;
      input.value = '';
      runCommand(val);
    });

    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowUp' && history.length) {
        histIdx = Math.max(0, histIdx - 1);
        input.value = history[histIdx] || '';
        e.preventDefault();
      } else if (e.key === 'ArrowDown' && history.length) {
        histIdx = Math.min(history.length, histIdx + 1);
        input.value = history[histIdx] || '';
        e.preventDefault();
      }
    });

    var termBox = form.closest('.terminal');
    if (termBox) {
      termBox.addEventListener('click', function (e) {
        if (!e.target.closest('button') && !e.target.closest('input')) input.focus();
      });
    }

    document.querySelectorAll('.term-chip[data-cmd]').forEach(function (chip) {
      chip.addEventListener('click', function (e) {
        e.stopPropagation();
        runCommand(chip.getAttribute('data-cmd'));
        input.focus();
      });
    });

    var snakeState = null;
    function stopActiveSnake(msg) {
      if (!snakeState) return;
      clearInterval(snakeState.timer);
      window.removeEventListener('keydown', snakeState.onKey);
      if (snakeState.wrap && snakeState.wrap.parentNode) snakeState.wrap.parentNode.removeChild(snakeState.wrap);
      snakeState = null;
      if (msg) print([msg]);
    }

    function startSnake() {
      stopActiveSnake();
      var wrap = document.createElement('div');
      var canvas = document.createElement('canvas');
      canvas.width = 280;
      canvas.height = 170;
      canvas.style.cssText = 'display:block;margin:8px 0;border:1px solid var(--border-strong);border-radius:2px;background:#050403;';
      wrap.appendChild(canvas);

      var controls = document.createElement('div');
      controls.className = 'snake-controls';
      controls.innerHTML =
        '<button type="button" data-dir="up">UP</button>' +
        '<button type="button" data-dir="down">DOWN</button>' +
        '<button type="button" data-dir="left">LEFT</button>' +
        '<button type="button" data-dir="right">RIGHT</button>' +
        '<button type="button" data-dir="exit" style="color:var(--gold);">EXIT</button>';
      wrap.appendChild(controls);

      screen.appendChild(wrap);
      screen.scrollTop = screen.scrollHeight;

      var ctx = canvas.getContext('2d');
      var CELL = 10;
      var COLS = canvas.width / CELL;
      var ROWS = canvas.height / CELL;
      var snake = [{ x: 6, y: 8 }, { x: 5, y: 8 }, { x: 4, y: 8 }];
      var dir = { x: 1, y: 0 };
      var score = 0;

      function nextFood() {
        return { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
      }
      var food = nextFood();

      function setDir(d) {
        if (d === 'up' && dir.y !== 1) dir = { x: 0, y: -1 };
        else if (d === 'down' && dir.y !== -1) dir = { x: 0, y: 1 };
        else if (d === 'left' && dir.x !== 1) dir = { x: -1, y: 0 };
        else if (d === 'right' && dir.x !== -1) dir = { x: 1, y: 0 };
        else if (d === 'exit') stopActiveSnake('Snake exited. Score: ' + score);
      }

      controls.addEventListener('click', function (e) {
        var b = e.target.closest('button[data-dir]');
        if (b) setDir(b.getAttribute('data-dir'));
      });

      function onKey(e) {
        if (e.key === 'Escape') { stopActiveSnake('Snake exited. Score: ' + score); return; }
        var map = {
          ArrowUp: 'up', w: 'up', W: 'up',
          ArrowDown: 'down', s: 'down', S: 'down',
          ArrowLeft: 'left', a: 'left', A: 'left',
          ArrowRight: 'right', d: 'right', D: 'right'
        };
        if (map[e.key] && document.activeElement !== input) {
          e.preventDefault();
          setDir(map[e.key]);
        } else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].indexOf(e.key) !== -1) {
          e.preventDefault();
          setDir(map[e.key]);
        }
      }

      function draw() {
        ctx.fillStyle = '#050403';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#E05D52';
        ctx.fillRect(food.x * CELL + 1, food.y * CELL + 1, CELL - 2, CELL - 2);
        for (var i = 0; i < snake.length; i++) {
          ctx.fillStyle = i === 0 ? '#D4AF37' : '#E8DFD8';
          ctx.fillRect(snake[i].x * CELL + 1, snake[i].y * CELL + 1, CELL - 2, CELL - 2);
        }
        ctx.fillStyle = '#F7E7C4';
        ctx.font = '700 11px "JetBrains Mono", monospace';
        ctx.fillText('SCORE ' + score, 6, 14);
      }

      function tick() {
        var head = { x: (snake[0].x + dir.x + COLS) % COLS, y: (snake[0].y + dir.y + ROWS) % ROWS };
        for (var i = 0; i < snake.length; i++) {
          if (snake[i].x === head.x && snake[i].y === head.y) {
            stopActiveSnake('Game over. Final score: ' + score);
            return;
          }
        }
        snake.unshift(head);
        if (head.x === food.x && head.y === food.y) {
          score++;
          food = nextFood();
        } else {
          snake.pop();
        }
        draw();
      }

      window.addEventListener('keydown', onKey);
      draw();
      snakeState = { wrap: wrap, onKey: onKey, timer: setInterval(tick, 120) };
    }
  }

  /* ------------------------------------------------
     12. SUBTLE POINTER CLICK RIPPLES
  ------------------------------------------------ */
  function initClickShockwaves() {
    if (prefersReducedMotion) return;
    document.addEventListener('pointerdown', function (e) {
      if (e.button && e.button !== 0) return;
      var ring = document.createElement('span');
      ring.className = 'click-shockwave';
      ring.setAttribute('aria-hidden', 'true');
      ring.style.left = e.clientX + 'px';
      ring.style.top = e.clientY + 'px';
      document.body.appendChild(ring);
      setTimeout(function () {
        if (ring.parentNode) ring.parentNode.removeChild(ring);
      }, 540);
    }, { passive: true });
  }

  /* ------------------------------------------------
     14. TRILINGUAL EN / FR / AR (RTL) SWITCHER
  ------------------------------------------------ */
  function initLanguageSwitcher() {
    var dict = window.FM_I18N;
    var btns = document.querySelectorAll('.lang-btn[data-lang]');
    if (!dict || !btns.length) return;

    var nodes = document.querySelectorAll('[data-i18n]');
    nodes.forEach(function (el) {
      el.dataset.enOriginal = el.textContent;
    });

    function applyLang(lang) {
      var d = document.documentElement;
      d.lang = lang;
      d.dir = lang === 'ar' ? 'rtl' : 'ltr';

      nodes.forEach(function (el) {
        var key = el.getAttribute('data-i18n');
        var nextText = (lang !== 'en' && dict[lang] && dict[lang][key]) ? dict[lang][key] : el.dataset.enOriginal;
        if (nextText) el.textContent = nextText;
      });

      btns.forEach(function (b) {
        b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === lang));
      });
      try { localStorage.setItem('fm-lang', lang); } catch (_) {}
      if (window.__syncNavGlider) requestAnimationFrame(window.__syncNavGlider);
      if (window.__syncScrollStack) requestAnimationFrame(window.__syncScrollStack);
    }

    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        applyLang(b.getAttribute('data-lang'));
      });
    });

    var saved = 'en';
    try { saved = localStorage.getItem('fm-lang') || 'en'; } catch (_) {}
    if (saved === 'fr' || saved === 'ar') applyLang(saved);
  }

  /* ------------------------------------------------
     15. HERO VIDEO PLAYBACK & SHUTTER INTER-PAGE TRANSITION
  ------------------------------------------------ */
  function initHeroMedia() {
    var vid = document.getElementById('hero-video');
    if (vid) {
      vid.muted = true;
      vid.playsInline = true;
      var p = vid.play();
      if (p && typeof p.catch === 'function') p.catch(function () {});
    }
  }

  function initWarpNavigation() {
    if (prefersReducedMotion) return;
    var overlay = document.createElement('div');
    overlay.id = 'warp-transition';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML = '<div class="warp-ring"></div>';
    document.body.appendChild(overlay);

    var navTimer = null;
    function clearWarpState() {
      if (navTimer) { clearTimeout(navTimer); navTimer = null; }
      document.body.classList.remove('warping-out');
      overlay.classList.remove('active');
    }
    window.addEventListener('pageshow', clearWarpState);

    var currentFile = location.pathname.split('/').pop() || 'index.html';
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href]');
      if (!a) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      var targetAttr = a.getAttribute('target');
      if (targetAttr && targetAttr !== '_self') return;
      var href = a.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('http')) return;
      var targetFile = href.split('#')[0] || currentFile;
      if (targetFile === currentFile && href.indexOf('#') !== -1) return;

      e.preventDefault();
      document.body.classList.add('warping-out');
      overlay.classList.add('active');
      navTimer = setTimeout(function () { window.location.href = href; }, 220);
    });
  }

  /* ------------------------------------------------
     INIT ALL
  ------------------------------------------------ */
  document.addEventListener('DOMContentLoaded', function () {
    initCursor();
    initWebGLBackdrop();
    initLanguageSwitcher();
    initReveals();
    initScrollPhysics();
    initNav();
    initPortraitStages();
    initProjects();
    initProjectSandboxes();
    initSkillsSphere();
    initCopyEmail();
    initTerminal();
    initClickShockwaves();
    initHeroMedia();
    initWarpNavigation();
  });

})();
