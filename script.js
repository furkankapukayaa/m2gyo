const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const navToggle = $(".nav-toggle");
const navList = $(".nav-list");
navToggle?.addEventListener('click', () => {
	const open = navList.classList.toggle('open');
	navToggle.setAttribute('aria-expanded', String(open));
});

const yearEl = $("#year");
if (yearEl) {
	yearEl.textContent = new Date().getFullYear();
}


const toTop = $(".to-top");
if (toTop) {
	window.addEventListener('scroll', () => {
		toTop.style.display = window.scrollY > 400 ? 'grid' : 'none';
	});
	toTop.addEventListener('click', () => window.scrollTo({
		top: 0,
		behavior: 'smooth'
	}));
}


const form = $("#contactForm");
const formStatus = $("#formStatus");
form?.addEventListener('submit', (e) => {
	e.preventDefault();
	const data = Object.fromEntries(new FormData(form));
	const missing = Object.entries(data).filter(([, v]) => !String(v).trim());
	if (missing.length) {
		formStatus.textContent = 'Lütfen tüm alanları doldurun.';
		formStatus.style.color = 'var(--accent)';
		return;
	}

  const mailto = `mailto:info@metrekaregyo.com?subject=${encodeURIComponent('[Web] ' + data.subject)}&body=${encodeURIComponent(`Ad Soyad: ${data.name}\nE-posta: ${data.email}\n\nMesaj:\n${data.message}`)}`;
	window.location.href = mailto;
	form.reset();
	formStatus.textContent = 'Teşekkürler! E-posta uygulamanız açıldı.';
	formStatus.style.color = 'var(--accent-2)';
});

const stat = $(".stat-big");
if (stat) {
	const target = Number(stat.getAttribute('data-count')) || 100;
	const io = new IntersectionObserver(entries => {
		entries.forEach(entry => {
			if (entry.isIntersecting) {
				let n = 0;
				const step = Math.ceil(target / 60);
				const tick = setInterval(() => {
					n += step;
					stat.textContent = String(Math.min(n, target));
					if (n >= target) clearInterval(tick);
				}, 16);
				io.disconnect();
			}
		});
	}, {
		threshold: .5
	});
	io.observe(stat);
}

const themeSwitch = $("#theme-switch-input");
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const saved = localStorage.getItem('theme');
let isDark = saved ? saved === 'dark' : prefersDark;

const setTheme = (dark) => {
	document.documentElement.dataset.theme = dark ? 'dark' : 'light';
	localStorage.setItem('theme', dark ? 'dark' : 'light');
	if (themeSwitch) {
		themeSwitch.checked = dark;
	}
};

themeSwitch?.addEventListener('change', (e) => {
	setTheme(e.target.checked);
});

setTheme(isDark);

const observer = new IntersectionObserver((entries) => {
	entries.forEach(entry => {
		if (entry.isIntersecting) {
			entry.target.classList.add('is-visible');
			observer.unobserve(entry.target);
		}
	});
}, {
	threshold: 0.1
});

const sectionsToFade = document.querySelectorAll('.fade-in-section');
sectionsToFade.forEach(section => {
	observer.observe(section);
});
