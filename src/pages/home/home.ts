import { defineComponent, onMounted } from "vue";

export default defineComponent({
  name: "HomePage",
  setup() {
    let currentIndex = 0;
    let isTransitioning = false;

    const scrollCarousel = (direction: "next" | "prev") => {
      if (isTransitioning) return;

      const carousel = document.querySelector(".carousel-track") as HTMLElement;
      if (!carousel) return;

      const items = carousel.querySelectorAll(".carousel-item.original");
      const totalItems = items.length;
      
      if (totalItems === 0) return;

      isTransitioning = true;
      const itemWidth = (items[0] as HTMLElement).offsetWidth;
      const gap = 20;

      if (direction === "next") {
        currentIndex++;
      } else {
        currentIndex--;
      }

      const scrollAmount = -(currentIndex * (itemWidth + gap));
      carousel.style.transition = "transform 0.5s ease";
      carousel.style.transform = `translateX(${scrollAmount}px)`;

      setTimeout(() => {
        // Infinite loop logic: reset về vị trí thật khi đến clone
        if (currentIndex >= totalItems) {
          carousel.style.transition = "none";
          currentIndex = 0;
          carousel.style.transform = `translateX(0px)`;
        } else if (currentIndex < 0) {
          carousel.style.transition = "none";
          currentIndex = totalItems - 1;
          const resetAmount = -(currentIndex * (itemWidth + gap));
          carousel.style.transform = `translateX(${resetAmount}px)`;
        }
        
        setTimeout(() => {
          isTransitioning = false;
        }, 50);
      }, 500);
    };

    onMounted(() => {
      const carousel = document.querySelector(".carousel-track") as HTMLElement;
      if (!carousel) return;

      // Clone items để tạo infinite effect
      const items = carousel.querySelectorAll(".carousel-item");
      items.forEach((item) => {
        item.classList.add("original");
        const clone = item.cloneNode(true) as HTMLElement;
        clone.classList.remove("original");
        clone.classList.add("clone");
        carousel.appendChild(clone);
      });

      const prevBtn = document.querySelector(".carousel-prev");
      const nextBtn = document.querySelector(".carousel-next");

      if (prevBtn) {
        prevBtn.addEventListener("click", () => scrollCarousel("prev"));
      }
      
      if (nextBtn) {
        nextBtn.addEventListener("click", () => scrollCarousel("next"));
      }
    });

    return {};
  },
});