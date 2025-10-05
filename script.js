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

class Slider {
    constructor(selector, options = {}) {
        this.slider = document.querySelector(selector);
        if (!this.slider) return;

        this.track = this.slider.querySelector('.slider-track');
        this.nextButton = this.slider.querySelector('#projeler-nav .next');
        this.prevButton = this.slider.querySelector('#projeler-nav .prev');

        this.originalSlides = Array.from(this.track.children).map(slide => slide.cloneNode(true));
        if (this.originalSlides.length === 0) return;

        this.options = {
            autoScroll: false,
            interval: 5000,
            loop: false,
            ...options
        };

        this.isMoving = false;
        this.autoScrollInterval = null;
        this.slideWidth = 0;
        this.currentIndex = 0;

        this.init();
    }

    init() {
        this.rebuild();
        this.initEvents();
    }

    rebuild() {
        this.stopAutoScroll();
        this.track.innerHTML = '';

        if (this.options.loop) {
            const copies = 3;
            for (let i = 0; i < copies; i++) {
                this.originalSlides.forEach(slide => this.track.appendChild(slide.cloneNode(true)));
            }
            this.currentIndex = this.originalSlides.length;
        } else {
            this.originalSlides.forEach(slide => this.track.appendChild(slide.cloneNode(true)));
            this.currentIndex = 0;
        }

        this.slides = Array.from(this.track.children);
        if (this.slides.length === 0) return;
        
        this.slideWidth = this.slides[0].getBoundingClientRect().width;
        if (this.slideWidth === 0) {
            // console.error("Slider slide width is 0. Check visibility and image loading.");
            return;
        }

        this.updatePosition(false);
        this.startAutoScroll();
    }

    initEvents() {
        this.nextButton?.addEventListener('click', () => this.moveNext());
        this.prevButton?.addEventListener('click', () => this.movePrev());
        this.track.addEventListener('transitionend', () => this.onTransitionEnd());

        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => this.rebuild(), 250);
        });

        if (this.options.autoScroll) {
            this.slider.addEventListener('mouseenter', () => this.stopAutoScroll());
            this.slider.addEventListener('mouseleave', () => this.startAutoScroll());
        }
    }

    updatePosition(withTransition = true) {
        if (this.slideWidth === 0) return;
        this.track.style.transition = withTransition ? 'transform 500ms ease-in-out' : 'none';
        this.track.style.transform = `translateX(-${this.currentIndex * this.slideWidth}px)`;
    }

    moveNext() {
        if (this.isMoving) return;
        this.isMoving = true;
        this.currentIndex++;
        this.updatePosition();
        this.resetAutoScroll();
    }

    movePrev() {
        if (this.isMoving) return;
        this.isMoving = true;
        this.currentIndex--;
        this.updatePosition();
        this.resetAutoScroll();
    }

    onTransitionEnd() {
        this.isMoving = false;
        if (this.options.loop) {
            const numOriginal = this.originalSlides.length;
            if (this.currentIndex >= numOriginal * 2) {
                this.currentIndex -= numOriginal;
                this.updatePosition(false);
            }
            if (this.currentIndex < numOriginal) {
                this.currentIndex += numOriginal;
                this.updatePosition(false);
            }
        }
    }

    startAutoScroll() {
        if (!this.options.autoScroll || this.autoScrollInterval) return;
        this.autoScrollInterval = setInterval(() => this.moveNext(), this.options.interval);
    }

    stopAutoScroll() {
        clearInterval(this.autoScrollInterval);
        this.autoScrollInterval = null;
    }

    resetAutoScroll() {
        if (this.options.autoScroll) {
            this.stopAutoScroll();
            this.startAutoScroll();
        }
    }
}

window.addEventListener('load', () => {
    new Slider('#projeler-slider', {
        autoScroll: true,
        interval: 5000,
        loop: true
    });
});