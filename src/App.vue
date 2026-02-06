<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';


const route = useRoute();

// Kiểm tra xem route hiện tại có config layout không?
// Nếu có thì dùng, nếu không (null) thì dùng thẻ div bình thường
const layout = computed(() => route?.meta?.layout || 'div');
</script>

<template>
  <component :is="layout">
    <router-view />
  </component>
</template>




