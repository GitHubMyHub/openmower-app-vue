<template>
  <div class="om-page d-flex flex-column">
    <slot />
  </div>
</template>

<style scoped>
.om-page {
  margin: 4px 8px;
}
@media (min-width: 960px) {
  .om-page {
    margin: 4px 16px;
  }
}
</style>
