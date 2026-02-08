<template>
  <div class="main"></div>
</template>

<script lang="ts" setup>
import { useRouter } from "vue-router";
const router = useRouter();

// onBeforeMount(async () => {
//    router.push("/query");
// });
</script>

<style scoped lang="less">
.main {
  min-height: 100vh;
  background-color: #fff;
}
</style>
