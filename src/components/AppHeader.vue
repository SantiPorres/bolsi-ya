<template>
  <ion-header :translucent="false">
    <ion-toolbar>
      <div class="header-content">
        <div class="header-brand">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.1243 10.11C10.0208 10.1107 9.9375 10.1947 9.9375 10.2982C9.9375 10.4017 10.0215 10.4857 10.125 10.485C10.2285 10.485 10.3125 10.401 10.3125 10.2975C10.3125 10.194 10.2285 10.11 10.1243 10.11" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2.25 4.71225V4.5C2.25 3.25725 3.25725 2.25 4.5 2.25H13.5C14.7428 2.25 15.75 3.25725 15.75 4.5V11.25C15.75 12.4928 14.7428 13.5 13.5 13.5H12.75" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M15.75 6.75H12.75" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M9.99375 15.6915C11.4037 16.017 12.75 14.946 12.75 13.4993V7.04028C12.75 5.99253 12.027 5.08353 11.0063 4.84803L4.0875 3.25128C3.147 3.03378 2.25 3.74778 2.25 4.71228V12.114C2.25 13.1618 2.973 14.0708 3.99375 14.3063L9.99375 15.6915V15.6915Z" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span class="brand-name">BolsiYa</span>
        </div>
        <span class="current-period">{{ currentPeriod }}</span>
      </div>
    </ion-toolbar>
  </ion-header>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { IonHeader, IonToolbar } from '@ionic/vue';
import { formatPeriod } from '@/utils/format';

const currentPeriod = computed(() => formatPeriod());
</script>

<style scoped>
ion-toolbar {
  --background: #ffffff;
  --padding-start: 20px;
  --padding-end: 20px;
  --min-height: 52px;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.header-brand {
  display: flex;
  align-items: center;
  gap: 8px;
}

.brand-name {
  font-size: 16px;
  font-weight: 600;
  color: #000000;
}

.current-period {
  font-size: 16px;
  color: #000000;
  font-weight: normal;
}
</style>
