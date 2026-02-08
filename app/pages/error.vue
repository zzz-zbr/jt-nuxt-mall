<template>
    <div class="page-404">
        <div class="error-box">
            <div class="error-img">
                <img :src="empty" alt="404"></img>
            </div>
            <div class="error-desc">{{ $t('single.pageNotFound') }}</div>
        </div>
    </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import empty from '@/assets/images/404.jpg';
const { t } = useI18n()
</script>
<style lang="less" scoped>
.page-404 {
    min-height: 100vh;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #fff;

    .error-img {
        width: 80px;
        height: 80px;
        margin: auto;
    }

    .error-img img {
        width: 100%;
    }

    .error-desc {
        font-family: PingFangSC, PingFang SC;
        font-weight: 600;
        font-size: 16px;
        color: #282828;
        line-height: 22px;
        margin-top: 14px;
    }

}
</style>