<template>
    <div class="des-panel">
        <div class="cube1 mr-8"></div>
        <div class="cube2 mr-14"></div>
        <span class="line1">{{ title }}</span>
        <div class="cube2 ml-14"></div>
        <div class="cube1 ml-8"></div>
    </div>
</template>

<script>
export default {
    name: 'DesPanel',
    props: {
        title: {
            type: String,
            default: ''
        }
    }
}
</script>

<style lang="less" scoped>
.des-panel {
    font-family: PingFang-SC, PingFang-SC;
    height: 20px;
    color: #282828;
    padding: 18px 0 20px 0;
    display: flex;
    font-size: 14px;
    align-items: center;
    justify-content: center;

    .cube1 {
        width: 5.66px;
        height: 5.66px;
        background: #9A9A9A;
        border-radius: 1px;
        transform: rotate(45deg);
    }

    .cube2 {
        width: 7.78px;
        height: 7.78px;
        background: #787878;
        border-radius: 1px;
        transform: rotate(45deg);
    }

    .line1 {
        line-height: 1;
    }

    .mr-8 {
        margin-right: 8px;
    }

    .mr-14 {
        margin-right: 14px;
    }

    .ml-8 {
        margin-left: 8px;
    }

    .ml-14 {
        margin-left: 14px;
    }
}
</style>