
<script setup>
  import { ref } from 'vue';
  import Header from '../components/layout/Header/index.vue';

  import Footer from '../components/layout/Footer/Footer.vue';

  const isSidebarOpen = ref(false);
</script>

<template>
  <div class="layout">
    <Header  />
    
    <main class="main-content">
      <slot />
    </main>
    <Footer />
  </div>
</template>



<style scoped>
  .layout {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    width: 100%;

    font-family: 'Montserrat', sans-serif;  
    font-size: 20px;
    
    
  }

  .main-content {
    flex: 1;
    margin-top: 118px;
  }

  @media (max-width: 768px) {
    
  }
</style>