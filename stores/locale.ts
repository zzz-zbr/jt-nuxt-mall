import { defineStore } from "pinia";
import { useNuxtApp } from "#app"; // 导入 nuxt 全局实例

const DEFAULT_LOCALE = "en";
const SAVE_KEY = "jt-i18n-locale";
export const useLocaleStore = defineStore("locale", {
  state: () => ({
    currentLocale: DEFAULT_LOCALE,
  }),

  getters: {
    getCurrentLocale: (state) => state.currentLocale,
    isZhCN: (state) => state.currentLocale === "zh-cn",
  },
  actions: {
    initLocale() {
      const nuxtApp = useNuxtApp();
      const i18n = nuxtApp.$i18n;
      if (import.meta.client) {
        // 仅客户端执行
        const savedLang = localStorage.getItem(SAVE_KEY);
        if (savedLang) {
          this.currentLocale = savedLang;
          // 同步到 i18n
          i18n.setLocale(savedLang);
        }
      }
    },
    // 切换语言（核心方法）
    changeLocale(lang: string) {
      const nuxtApp = useNuxtApp();
      const i18n = nuxtApp.$i18n;
      const targetLang = lang || DEFAULT_LOCALE;

      // 避免重复修改
      // if (this.currentLocale === targetLang) return;
      if (import.meta.client) {
        localStorage.setItem(SAVE_KEY, targetLang);
      }
      this.currentLocale = targetLang;
      i18n.setLocale(targetLang);
    },
  },
});
