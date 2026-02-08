<template>
    <div class="jtmall-header">
        <span class="header-back" @click="returnBack"></span>
        <div class="header-title">{{ title }}</div>
    </div>
</template>

<script name="jtmall-header" setup>
const router = useRouter()
const props = defineProps({
    title: {
        type: String,
        default: ''
    }
})
const returnBack = () => {
    router.back()
}
</script>
<style lang="less" scoped>
.jtmall-header {
    margin-bottom: 26px;
    display: flex;
    align-items: center;
    text-align: center;

    .header-back {
        display: inline-block;
        width: 14px;
        height: 14px;
        border-bottom: 2px solid #222;
        border-left: 2px solid #222;
        transform: rotate(45deg);
        cursor: pointer;
    }

    .header-title {
        flex: 1;
        margin-left: -7px;
        font-family: PingFangSC, PingFang SC;
        font-weight: 600;
        font-size: 18px;
        color: #5B5B5B;
        line-height: 22px;

    }
}
</style>