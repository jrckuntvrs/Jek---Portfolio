
  // Constellation network background — sized to the full page-shell height
  (function(){
    const canvas = document.getElementById('galaxy-canvas');
    const shell = document.querySelector('.page-shell');
    const ctx = canvas.getContext('2d');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let points = [];
    let w, h;
    const LINK_DIST = 150;

    function resize(){
      w = canvas.width = shell.offsetWidth;
      h = canvas.height = shell.scrollHeight;
      const count = Math.min(140, Math.floor((w * h) / 16000));
      points = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.4 + 0.6,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18
      }));
    }

    function draw(){
      ctx.clearRect(0, 0, w, h);

      if (!reduceMotion){
        points.forEach(p => {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0 || p.x > w) p.vx *= -1;
          if (p.y < 0 || p.y > h) p.vy *= -1;
        });
      }

      for (let i = 0; i < points.length; i++){
        for (let j = i + 1; j < points.length; j++){
          const dx = points[i].x - points[j].x;
          const dy = points[i].y - points[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < LINK_DIST){
            ctx.strokeStyle = `rgba(232,179,76, ${0.12 * (1 - dist / LINK_DIST)})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(points[i].x, points[i].y);
            ctx.lineTo(points[j].x, points[j].y);
            ctx.stroke();
          }
        }
      }

      points.forEach(p => {
        ctx.beginPath();
        ctx.fillStyle = 'rgba(235,238,247,0.55)';
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });

      if (!reduceMotion) requestAnimationFrame(draw);
    }

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    });

    const ro = new ResizeObserver(() => resize());
    ro.observe(shell);

    resize();
    draw();
  })();

  // Sync custom certificate dots with the carousel's active slide
  (function(){
    const carouselEl = document.getElementById('certCarousel');
    if (!carouselEl) return;
    const dots = document.querySelectorAll('.cert-dots [data-bs-slide-to]');
    carouselEl.addEventListener('slide.bs.carousel', (e) => {
      dots.forEach(dot => dot.classList.remove('active'));
      if (dots[e.to]) dots[e.to].classList.add('active');
    });
  })();

  // Scroll fade-in
  const faders = document.querySelectorAll('.fade-up, .fade');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  faders.forEach(el => observer.observe(el));

  // Active nav link on scroll
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(sec => {
      const top = sec.offsetTop - 120;
      if (window.scrollY >= top) current = sec.getAttribute('id');
    });
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) link.classList.add('active');
    });
  });

  // Output preview modal — populate screenshot per project
  const outputModal = document.getElementById('outputModal');
  outputModal.addEventListener('show.bs.modal', (event) => {
    const btn = event.relatedTarget;
    const title = btn.getAttribute('data-title') || 'Project Output';
    const img = btn.getAttribute('data-img');
    document.getElementById('outputModalTitle').textContent = title;

    const frame = document.getElementById('screenshotFrame');
    if (img) {
      frame.innerHTML = `<img src="${img}" alt="${title} screenshot">`;
    } else {
      frame.innerHTML = `
        <div class="screenshot-placeholder">
          <i class="bi bi-image"></i>
          No screenshot yet for<br><strong style="color:var(--text)">${title}</strong><br>
          add one via the <code>data-img</code> attribute.
        </div>`;
    }
  });

  // Demo-only contact form (no backend wired up)
  const form = document.getElementById('contactForm');
  const note = document.getElementById('formNote');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    note.textContent = '> message logged locally — connect a backend or form service to send this for real.';
  });