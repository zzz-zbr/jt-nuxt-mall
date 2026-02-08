<template>
    <div class="jtform-item">
        <label class="jtform-item-label">{{ label }}</label>
        <div class="jtform-item-content">
            {{ content }}
            <slot v-if="!content" name="content"></slot>
        </div>
    </div>
</template>

<script name="jtFormItem" setup>
const props = defineProps({
    label: {
        type: String,
        default: ''
    },
    content: {
        type: String,
        default: ''
    },
})

</script>

<style lang="less" scoped>
.jtform-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 16px;

    .jtform-item-label {
        font-family: PingFang-SC, PingFang-SC;
        font-size: 14px;
        color: #5B5B5B;
        line-height: 20px;
        text-align: left;
        min-width: 70px;
    }

    .jtform-item-content {
        flex: 1;
        font-family: DINPro, DINPro;
        font-size: 16px;
        color: #282828;
        line-height: 21px;
        text-align: right;
        font-weight: 600;
        margin-left: 16px;
    }
}
</style>