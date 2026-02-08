<template>
  <div class="order-tracking">
    <div class="header">
      <jtmall-header :title="$t('single.orderQuery')" />
      <BFormGroup
        id="input-group-order"
        :label="$t('single.orderNo')"
        label-for="input-order"
        class="required"
      >
        <BFormInput
          id="input-order"
          :placeholder="$t('single.enterOrderNo')"
          required
          ref="inputNoRef"
          v-model="orderNo"
          @update:model-value="updateNo"
        />
      </BFormGroup>
    </div>
    <BOverlay :show="show" rounded="sm">
      <div v-if="!noSearch">
        <div class="divider"></div>
        <div v-if="hasResult">
          <div class="result">
            <div class="result-img">
              <img :src="shipped" alt="" />
            </div>
            <div class="result-text">{{ $t("single.shipped") }}</div>
            <div class="track-info">
              <JtformItem
                :label="$t('single.logisticsProvider') + '：'"
                :content="trackInfo?.courierNameEN || '-'"
              />
              <JtformItem
                :label="$t('single.orderNo') + '：'"
                :content="orderNo"
              />
              <JtformItem
                :label="$t('single.trackingNo') + '：'"
                :content="trackInfo?.trackNo || '-'"
              />
            </div>
          </div>
          <div class="divider"></div>
          <!-- 物流信息 -->
          <div class="logistics-info" v-if="trackInfo?.trackingDetails">
            <div
              class="step"
              v-for="(item, index) in trackInfo?.trackingDetails"
            >
              <div class="step-head">
                <div class="step-line"></div>
                <div class="step-icon" :class="index === 0 ? 'active' : ''">
                  <div class="step-icon-outer">
                    <div class="step-icon-inner"></div>
                  </div>
                </div>
              </div>
              <div class="step-main">
                <div class="step-title">{{ item.eventTime }}</div>
                <div class="step-des">
                  {{ item.eventDetail }}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="nodata" v-else>
          <div class="result-img">
            <img :src="empty" alt="" />
          </div>
          <div class="result-text">{{ $t("single.noData") }}</div>
        </div>
      </div>
      <div v-else class="no-search"></div>
    </BOverlay>
  </div>
  <div class="jtmall-btn-group" :class="show ? 'disabled' : ''">
    <div class="buyNow" @click="query" type="submit">
      {{ $t("single.searchNow") }}
    </div>
  </div>
</template>

<script setup>
import { useI18n } from "vue-i18n";
import empty from "@/assets/images/empty.jpg";
import shipped from "@/assets/images/shipped.jpg";
import tobeShipped from "@/assets/images/tobeShipped.jpg";
import { useLocaleStore } from "../../stores/locale";
const { t } = useI18n();
const config = useRuntimeConfig();
const apiBase = config.public.apiBase;
const localeStore = useLocaleStore();
onBeforeMount(() => {
  localeStore.initLocale();
});
useHead({ title: t("single.address") });
const hasResult = ref(false);
const show = ref(false);
const noSearch = ref(true);
const inputNoRef = ref();
const orderNo = ref("");
const trackInfo = ref(null);
const valideNo = (value) => {
  if (value) {
    inputNoRef.value.element.setCustomValidity("");
  } else {
    inputNoRef.value.element.setCustomValidity(t("single.enterOrderNo"));
  }
  inputNoRef.value.element.reportValidity();
};
const updateNo = ($event) => {
  valideNo($event);
};
const query = async () => {
  valideNo(inputNoRef.value.element.value);
  try {
    if (inputNoRef.value.element.checkValidity()) {
      if (show.value) {
        return;
      }
      show.value = true;
      const res = await $fetch(
        `${apiBase}api/order/logistics/${orderNo.value}`,
      );
      console.log(res, "res");
      if (res.code === 200) {
        trackInfo.value = res.data;
        hasResult.value = true;
      } else {
        hasResult.value = false;
      }
      noSearch.value = false;
      show.value = false;
    }
  } catch (error) {
    show.value = false;
    hasResult.value = false;
    noSearch.value = false;
  }
};
</script>

<style lang="less" scoped>
@import "~/assets/less/single.less";

.order-tracking {
  min-height: 100vh;
  padding: 16px 0px 90px 0px;
  background: #fff;
  display: flex;
  flex-direction: column;

  .b-overlay-wrap {
    flex: 1;
  }

  .header {
    padding: 0px 16px;
    margin-bottom: 24px;
  }

  .divider {
    height: 10px;
    background: #f3f3f3;
  }

  .result,
  .nodata {
    padding: 0px 16px;
    margin-top: 48px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .result-img {
      width: 80px;
      height: 80px;
    }

    .result-img img {
      width: 100%;
    }

    .result-text {
      font-family:
        PingFangSC,
        PingFang SC;
      font-weight: 600;
      font-size: 16px;
      color: #282828;
      line-height: 22px;
      margin-top: 14px;
    }

    .track-info {
      width: 100%;
      margin-top: 30px;
      margin-bottom: 4px;
    }
  }
}

.logistics-info {
  padding: 24px 16px 0px 16px;
  display: flex;
  flex-direction: column;

  .step {
    display: flex;
    flex-shrink: 1;
    position: relative;
    flex-basis: 64px;
    line-height: 0;
  }

  .step-head {
    width: 24px;

    .step-line {
      width: 1px;
      border-color: inherit;
      position: absolute;
      bottom: 0;
      left: 11px;
      top: 0;
      background: repeating-linear-gradient(
        180deg,
        #d3d3d3,
        #d3d3d3 4px,
        transparent 4px,
        transparent 8px
      );
    }

    .step-icon {
      position: relative;
      align-items: center;
      box-sizing: border-box;
      background: #fff;
      display: inline-flex;
      font-size: 14px;
      height: 18px;
      width: 22px;
      justify-content: center;
      z-index: 1;

      .step-icon-outer {
        width: 14px;
        height: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #d3d3d3;
        border-radius: 50%;
      }

      .step-icon-inner {
        width: 8px;
        height: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #fff;
        border-radius: 50%;
      }

      &.active {
        .step-icon-outer {
          background-color: #f49e3b;
        }
      }
    }
  }

  .step-main {
    flex-grow: 1;
    padding-left: 10px;

    .step-title {
      font-family: DINPro, DINPro;
      font-size: 14px;
      color: #5b5b5b;
      line-height: 18px;
      margin-bottom: 8px;
    }

    .step-des {
      font-family: PingFang-SC, PingFang-SC;
      font-size: 14px;
      color: #282828;
      line-height: 20px;
      margin-bottom: 8px;
    }
  }
}
</style>
