<template>
  <div class="om-page-content">
    <slot />
  </div>
</template>

<style scoped>
.om-page-content {
  margin: 4px 0;
  position: relative;
  z-index: 2;
}
@media (min-width: 960px) {
  .om-page-content {
    margin: -32px 16px 0;
  }
}
</style>
