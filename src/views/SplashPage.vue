<template>
  <ion-page>
    <ion-content :fullscreen="true" class="splash">
      <div class="splash-inner">
        <div class="logo">
          <ion-icon :icon="walletOutline" />
          <span class="logo-badge">
            <ion-icon :icon="addOutline" />
          </span>
        </div>
        <h1 class="brand">BolsiYa</h1>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { IonPage, IonContent, IonIcon } from '@ionic/vue';
import { walletOutline, addOutline } from 'ionicons/icons';

const router = useRouter();

onMounted(() => {
  setTimeout(() => router.replace('/tabs/home'), 1600);
});
</script>

<style scoped>
.splash {
  --background: var(--by-dark);
}

.splash-inner {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.logo {
  position: relative;
  width: 96px;
  height: 96px;
  border-radius: 24px;
  background: linear-gradient(160deg, var(--by-green-soft), var(--by-green-dark));
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.35);
}

.logo ion-icon {
  font-size: 48px;
  color: #ffffff;
}

.logo-badge {
  position: absolute;
  right: 22px;
  bottom: 30px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--by-dark);
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-badge ion-icon {
  font-size: 16px;
  color: #ffffff;
}

.brand {
  font-size: 30px;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
}
</style>
