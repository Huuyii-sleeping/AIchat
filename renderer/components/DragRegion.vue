<template>
  <div class="drag-region">
    <slot>
      <span class="_placeholder">_hidden</span>
    </slot>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
._placeholder {
  opacity: 0;
} 
</style>
