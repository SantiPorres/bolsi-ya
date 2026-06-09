import { mount } from '@vue/test-utils'
import { describe, expect, test } from 'vitest'
import { createPinia } from 'pinia'
import { IonicVue } from '@ionic/vue'
import HomePage from '@/views/HomePage.vue'

describe('HomePage.vue', () => {
  test('renders balance section', () => {
    const wrapper = mount(HomePage, {
      global: {
        plugins: [createPinia(), IonicVue],
        stubs: { 'ion-page': true, 'ion-content': true, 'ion-fab': true, 'ion-fab-button': true },
      },
    })
    expect(wrapper.exists()).toBe(true)
  })
})
