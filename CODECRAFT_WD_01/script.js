document.addEventListener("DOMContentLoaded", () => {
  const nav = document.getElementById("mainNav");
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const closeMenuBtn = document.getElementById("closeMenuBtn");
  const mobileMenu = document.getElementById("mobileMenu");
  const fadeElements = document.querySelectorAll(".fade-up");
  const darkToggle = document.getElementById("darkModeToggle");
  const darkToggleMobile = document.getElementById("darkModeMobile");
  const toggleSwitch = document.getElementById("pricingToggle");
  const prices = document.querySelectorAll(".pricing-price");
  const toast = document.getElementById("toast");

  // Scroll reveal and nav background toggle
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) nav.classList.add("nav-scrolled");
    else nav.classList.remove("nav-scrolled");

    fadeElements.forEach(el => {
      if (el.getBoundingClientRect().top < window.innerHeight - 100) {
        el.classList.add("show");
      }
    });
  });

  // Mobile menu toggle
  mobileMenuBtn.addEventListener("click", () => {
    mobileMenuBtn.classList.toggle("active");
    mobileMenu.classList.toggle("active");
  });
  closeMenuBtn.addEventListener("click", () => {
    mobileMenuBtn.classList.remove("active");
    mobileMenu.classList.remove("active");
  });

  // Dark mode toggle
  function toggleDark() {
    document.body.classList.toggle("dark");
    const icon = document.body.classList.contains("dark")
      ? '<i class="fas fa-sun"></i>'
      : '<i class="fas fa-moon"></i>';
    darkToggle.innerHTML = icon;
    darkToggleMobile.innerHTML = icon;
  }
  darkToggle.addEventListener("click", toggleDark);
  darkToggleMobile.addEventListener("click", toggleDark);

  // Animate pricing prices
  function animatePrice(el, start, end, duration, isYearly) {
    let startTime = null;
    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      let progress = Math.min((timestamp - startTime) / duration, 1);
      let value = Math.floor(progress * (end - start) + start);
      el.innerHTML = `$${value}<span>${isYearly ? "/yr" : "/mo"}</span>`;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // Pricing monthly/yearly toggle
  toggleSwitch.addEventListener("change", function () {
    const yearly = this.checked;
    prices.forEach(priceEl => {
      const monthly = parseInt(priceEl.getAttribute("data-monthly"), 10);
      const yearlyPrice = parseInt(priceEl.getAttribute("data-yearly"), 10);
      const currentValue = parseInt(priceEl.textContent.replace(/\D/g, ""), 10) || monthly;
      if (yearly) animatePrice(priceEl, currentValue, yearlyPrice, 800, true);
      else animatePrice(priceEl, currentValue, monthly, 800, false);
    });
  });

  // Contact form validation and toast
  const contactForm = document.getElementById("contactForm");
  contactForm.addEventListener("submit", e => {
    e.preventDefault();
    let valid = true;

    ["name", "email", "message"].forEach(id => {
      const el = document.getElementById(id);
      if (!el.value.trim()) {
        el.classList.add("border-red-500");
        valid = false;
      } else {
        el.classList.remove("border-red-500");
      }
    });

    if (valid) {
      toast.classList.add("show");
      toast.classList.remove("hidden");
      setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.classList.add("hidden"), 500);
      }, 3000);

      contactForm.reset();
    }
  });
});
