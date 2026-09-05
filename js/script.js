
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

  // Output preview modal — populate a scrollable set of screenshots per project
const outputModal = document.getElementById('outputModal');
const screenshotFrame = document.getElementById('screenshotFrame');
let outputImages = [];
let outputIndex = 0;
let outputTitle = 'Project Output';

function renderOutputFrame(){
  if (!outputImages.length){
    screenshotFrame.innerHTML = `
      <div class="screenshot-placeholder">
        No screenshots yet available<br><strong style="color:var(--text)">${outputTitle}</strong><br>
      </div>`;
    return;
  }

  const showNav = outputImages.length > 1;
  screenshotFrame.innerHTML = `
    ${showNav ? `<button type="button" class="cert-ctrl cert-ctrl-prev" id="outputPrev" aria-label="Previous screenshot"><i class="bi bi-chevron-left"></i></button>` : ''}
    <img src="${outputImages[outputIndex]}" alt="${outputTitle} screenshot ${outputIndex + 1}">
    ${showNav ? `<button type="button" class="cert-ctrl cert-ctrl-next" id="outputNext" aria-label="Next screenshot"><i class="bi bi-chevron-right"></i></button>` : ''}
    ${showNav ? `<div class="screenshot-counter">${outputIndex + 1} / ${outputImages.length}</div>` : ''}
  `;

  if (showNav){
    document.getElementById('outputPrev').addEventListener('click', () => {
      outputIndex = (outputIndex - 1 + outputImages.length) % outputImages.length;
      renderOutputFrame();
    });
    document.getElementById('outputNext').addEventListener('click', () => {
      outputIndex = (outputIndex + 1) % outputImages.length;
      renderOutputFrame();
    });
  }
}

outputModal.addEventListener('show.bs.modal', (event) => {
  const btn = event.relatedTarget;
  outputTitle = btn.getAttribute('data-title') || 'Project Output';
  document.getElementById('outputModalTitle').textContent = outputTitle;

  const raw = btn.getAttribute('data-imgs') || '';
  outputImages = raw.split(',').map(s => s.trim()).filter(Boolean);
  outputIndex = 0;
  renderOutputFrame();
});
