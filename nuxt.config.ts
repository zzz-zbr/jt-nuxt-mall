// https://nuxt.com/docs/api/configuration/nuxt-config
import type { NuxtConfig } from "nuxt/config";

// 扩展类型解决 TS 报错
declare module "nuxt/config" {
  interface NuxtConfig {
    pinia?: {
      autoImports?: (string | [string, string])[];
    };
  }
}
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  runtimeConfig: {
    public: {
      // 这里的变量会暴露给客户端和服务器
      apiBase:
        process.env.NODE_ENV === "development"
          ? "https://dlz.jiatianacc.com/"
          : "https://dlz.jiatianacc.com/",
      // : 'https://dlz.jiatianacc.com/prod-api/'
    },
    metaPixel: {
      pixelId: "",
    },
  },
  devtools: { enabled: true },
  modules: [
    "@pinia/nuxt",
    "@nuxtjs/i18n",
    "@bootstrap-vue-next/nuxt",
    "nuxt-meta-pixel",
  ],
  pinia: {
    autoImports: ["defineStore"],
  },
  routeRules: {
    "/:param": {
      swr: 60, // 启用 ISR (60秒缓存)：新页面首次访问生成，旧页面后台更新，无需重新打包
      cache: {
        staleMaxAge: 86400, // 过期缓存保留1天
      },
    },
  },
  css: ["~/assets/less/common.less", "bootstrap/dist/css/bootstrap.min.css"],
  i18n: {
    langDir: "locales/",
    strategy: "no_prefix",
    defaultLocale: "en",
    lazy: false,
    locales: [
      { code: "en", iso: "en-US", file: "en.ts" },
      { code: "zh", iso: "zh-CN", file: "zh-CN.ts" },
      { code: "th", iso: "th-TH", file: "th.ts" },
      { code: "ro", iso: "ro-RO", file: "ro.ts" },
      { code: "sk", iso: "sk-SK", file: "sk.ts" },
      { code: "cs", iso: "cs-CZ", file: "cs.ts" },
      { code: "hu", iso: "hu-HU", file: "hu.ts" },
      { code: "pl", iso: "pl-PL", file: "pl.ts" },
      { code: "el", iso: "el-GR", file: "el.ts" },
      { code: "sl", iso: "sl-SI", file: "sl.ts" },
      { code: "pt", iso: "pt-PT", file: "pt.ts" },
      { code: "es", iso: "es-ES", file: "es.ts" },
      { code: "hr", iso: "hr-HR", file: "hr.ts" },
      { code: "bg", iso: "bg-BG", file: "bg.ts" },
      { code: "et", iso: "et-EE", file: "et.ts" },
      { code: "lv", iso: "lv-LV", file: "lv.ts" },
      { code: "de-AT", iso: "de-AT", file: "de-AT.ts" }, // 意大利
      { code: "it", iso: "it-IT", file: "it.ts" },
      { code: "de", iso: "de-DE", file: "de.ts" }, //德国
    ],
  },
});
