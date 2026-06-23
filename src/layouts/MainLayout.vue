
<script setup>
  import { ref } from 'vue';
  import Header from '../components/layout/Header/index.vue';

  import Footer from '../components/layout/Footer/Footer.vue';

  const isSidebarOpen = ref(false);
</script>

<template>
  <div>
    <Header />
    
    <div class="layout">
      <main class="main-content">
        <slot />
      </main>
      <Footer />
    </div>
  </div>
</template>



<style scoped>
  .layout {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    width: 100%;
    font-family: 'Montserrat', sans-serif;  
    font-size: 15px;
  }

  .main-content {
    flex: 1;
    margin-top: 49px;
  }

  @media (max-width: 768px) {
    .main-content {
      margin-top: 45px;
    }
  }

  @media (max-width: 480px) {
    .main-content {
      margin-top: 42px;
    }
  }
</style>