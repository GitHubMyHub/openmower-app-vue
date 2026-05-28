<script setup lang="ts">
defineProps<{ title: string; subtitle: string }>()
</script>

<template>
  <div class="om-page-header">
    <div class="bg-pattern" />
    <div class="px-4">
      <div style="position: relative; z-index: 1">
        <h1 class="text-h3 text-md-h2 font-weight-bold mb-2">{{ title }}</h1>
        <p class="text-h6 d-none d-md-block mb-3" style="opacity: 0.9; font-weight: 300">
          {{ subtitle }}
        </p>
        <div class="d-none d-md-flex flex-wrap ga-6 mt-4">
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.om-page-header {
  background: linear-gradient(135deg, #388e3c 0%, #4caf50 100%);
  color: white;
  padding: 8px 0 0;
  position: relative;
  overflow: hidden;
  border-radius: 0 0 24px 24px;
  box-shadow: 0 2px 12px -2px rgba(0, 0, 0, 0.4);

  @media (min-width: 960px) {
    padding: 32px 24px 48px;
    border-radius: 24px;
  }
}

.bg-pattern {
  position: absolute;
  inset: 0;
  opacity: 0.1;
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
</style>
