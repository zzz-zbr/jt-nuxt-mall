<template>
  <div class="jt-nuxt-mall">
    <NuxtPage />
    <div class="backTop" v-show="showBack" @click="backToTop">
      TOP</div>
  </div>
</template>
<script setup lang="ts">
const showBack = ref(false)
const scrollTop = ref(0)
onMounted(() => {
  window.addEventListener('scroll', setScrollValue)
  scrollTop.value = document.documentElement.scrollTop

})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', setScrollValue)
})
const setScrollValue = () => {
  scrollTop.value = document.documentElement.scrollTop
}
const backToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}
watch(() => scrollTop.value, (val) => {
  if (val > 100) {
    showBack.value = true
  } else {
    showBack.value = false
  }
})
</script>

<style lang="less" scoped>
.jt-nuxt-mall {
  position: relative;
  max-width: 600px;
  margin: 0 auto;
  height: 100%;
  background: #F3F3F3;
  min-height: 100vh;
  overflow: hidden;
  overflow-y: auto;
  scrollbar-width: none;
  /* Firefox */
  -ms-overflow-style: none;

  /* IE and Edge */
  &::-webkit-scrollbar {
    display: none;
    /* Chrome, Safari and Opera */
  }

  .backTop {
    position: fixed;
    right: 10px;
    bottom: 100px;
    width: 44px;
    height: 44px;
    font-weight: 600;
    border-radius: 50%;
    background: #F4A243;
    font-family: DINPro, DINPro;
    font-size: 16px;
    color: #FFFFFF;
    line-height: 44px;
    text-align: center;
  }
}
</style>
