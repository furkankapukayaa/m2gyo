// Küçük yardımcılar
const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];

// Mobil menü
const navToggle = $('.nav-toggle');
const navList = $('.nav-list');
navToggle?.addEventListener('click', () => {
  const open = navList.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(open));
});

// Yıl
const yearEl = $('#year');
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}


// Yukarı çık butonu
const toTop = $('.to-top');
if (toTop) {
  window.addEventListener('scroll', () => {
    toTop.style.display = window.scrollY > 400 ? 'grid' : 'none';
  });
  toTop.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));
}


// Form doğrulama (demo)
const form = $('#contactForm');
const formStatus = $('#formStatus');
form?.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form));
  const missing = Object.entries(data).filter(([,v]) => !String(v).trim());
  if(missing.length){
    formStatus.textContent = 'Lütfen tüm alanları doldurun.';
    formStatus.style.color = 'var(--accent)';
    return;
  }
  // Backend yok: mailto ile hızlı yönlendirme + kullanıcıya bildirim
  const mailto = `mailto:info@metrekaregyo.com?subject=${encodeURIComponent('[Web] ' + data.subject)}&body=${encodeURIComponent(`Ad Soyad: ${data.name}\nE-posta: ${data.email}\n\nMesaj:\n${data.message}`)}`;
  window.location.href = mailto;
  form.reset();
  formStatus.textContent = 'Teşekkürler! E-posta uygulamanız açıldı.';
  formStatus.style.color = 'var(--accent-2)';
});

// Sayaç animasyonu
const stat = $('.stat-big');
if(stat){
  const target = Number(stat.getAttribute('data-count')) || 100;
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        let n = 0;
        const step = Math.ceil(target/60);
        const tick = setInterval(() => {
          n += step;
          stat.textContent = String(Math.min(n, target));
          if(n >= target) clearInterval(tick);
        }, 16);
        io.disconnect();
      }
    });
  }, {threshold:.5});
  io.observe(stat);
}

// Tema (koyu/açık)
const themeToggle = $('#themeToggle');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const saved = localStorage.getItem('theme');
let isDark = saved ? saved === 'dark' : prefersDark;

const setTheme = (dark) => {
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  localStorage.setItem('theme', dark ? 'dark' : 'light');
  isDark = dark;
};

themeToggle?.addEventListener('click', () => {
  setTheme(!isDark);
});

// Set initial theme
setTheme(isDark);


// Gözlemci (Observer) for fade-in animations
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target); // Animasyon bir kere çalışsın
    }
  });
}, {
  threshold: 0.1
});

const sectionsToFade = document.querySelectorAll('.fade-in-section');
sectionsToFade.forEach(section => {
  observer.observe(section);
});
