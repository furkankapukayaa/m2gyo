// Küçük yardımcılar
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

// Mobil menü
const navToggle = $(".nav-toggle");
const navList = $(".nav-list");
navToggle?.addEventListener('click', () => {
	const open = navList.classList.toggle('open');
	navToggle.setAttribute('aria-expanded', String(open));
});

// Yıl
const yearEl = $("#year");
if (yearEl) {
	yearEl.textContent = new Date().getFullYear();
}


// Yukarı çık butonu
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


// Form doğrulama (demo)
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
	// Backend yok: mailto ile hızlı yönlendirme + kullanıcıya bildirim
	const mailto = `mailto:info@metrekaregyo.com?subject=${encodeURIComponent('[Web] ' + data.subject)}&body=${encodeURIComponent(`Ad Soyad: ${data.name}\nE-posta: ${data.email}\n\nMesaj:\n${data.message}`)}`;
	window.location.href = mailto;
	form.reset();
	formStatus.textContent = 'Teşekkürler! E-posta uygulamanız açıldı.';
	formStatus.style.color = 'var(--accent-2)';
});

// Sayaç animasyonu
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

// Tema (koyu/açık)
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

class Slider {
	constructor(selector, options = {}) {
		this.slider = document.querySelector(selector);
		if (!this.slider) return;

		this.track = this.slider.querySelector('.slider-track');
		this.slides = Array.from(this.track.children);
		this.nextButton = this.slider.querySelector('.next');
		this.prevButton = this.slider.querySelector('.prev');

		if (this.slides.length === 0) return;

		this.options = {
			autoScroll: false,
			interval: 5000,
			...options
		};

		this.slideWidth = this.slides[0].getBoundingClientRect().width;
		this.currentIndex = 0;
		this.autoScrollInterval = null;

		this.init();
	}

	init() {
		this.setSlidePositions();
		this.updateButtons();

		this.nextButton.addEventListener('click', () => this.moveToNextSlide());
		this.prevButton.addEventListener('click', () => this.moveToPrevSlide());

		window.addEventListener('resize', () => {
			this.slideWidth = this.slides[0].getBoundingClientRect().width;
			this.setSlidePositions();
			this.track.style.transform = `translateX(-${this.slideWidth * this.currentIndex}px)`;
		});

		if (this.options.autoScroll) {
			this.startAutoScroll();
			this.slider.addEventListener('mouseenter', () => this.stopAutoScroll());
			this.slider.addEventListener('mouseleave', () => this.startAutoScroll());
		}
	}

	setSlidePositions() {
		this.slides.forEach((slide, index) => {
			slide.style.left = this.slideWidth * index + 'px';
		});
	}

	moveToSlide(targetIndex) {
		this.track.style.transform = `translateX(-${this.slideWidth * targetIndex}px)`;
		this.currentIndex = targetIndex;
		this.updateButtons();
	}

	moveToNextSlide(loop = false) {
		let nextIndex = this.currentIndex + 1;
		if (nextIndex >= this.slides.length - this.getVisibleSlides() + 1) {
			if (loop) {
				nextIndex = 0;
			} else {
				return; // Don't move if not looping and at the end
			}
		}
		this.moveToSlide(nextIndex);
	}

	moveToPrevSlide() {
		if (this.currentIndex > 0) {
			this.moveToSlide(this.currentIndex - 1);
		}
	}

	updateButtons() {
		if (!this.options.autoScroll || !this.prevButton || !this.nextButton) return;
		this.prevButton.disabled = this.currentIndex === 0;
		this.nextButton.disabled = this.currentIndex >= this.slides.length - this.getVisibleSlides();
	}

	getVisibleSlides() {
		const containerWidth = this.slider.querySelector('.slider-container').offsetWidth;
		if (this.slideWidth === 0) return 0;
		return Math.round(containerWidth / this.slideWidth);
	}

	startAutoScroll() {
		this.stopAutoScroll(); // Ensure no multiple intervals are running
		this.autoScrollInterval = setInterval(() => {
			this.moveToNextSlide(true); // loop = true
		}, this.options.interval);
	}

	stopAutoScroll() {
		clearInterval(this.autoScrollInterval);
	}
}

document.addEventListener('DOMContentLoaded', () => {
	new Slider('#hizmetler-slider', {
		autoScroll: true,
		interval: 4000
	});
	new Slider('#projeler-slider', {
		autoScroll: true,
		interval: 5000
	});
});