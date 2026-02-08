<template>
  <ClientOnly>
    <BOverlay :show="show" rounded="sm">
      <div class="pay-result">
        <jtmall-header title="" />
        <div class="order-status">
          <div class="order-status-img">
            <img :src="success" alt="" srcset="" />
          </div>
          <span class="order-status-name">{{ $t("single.orderSuccess") }}</span>
          <span class="order-status-des">
            {{ $t("single.orderSuccessTipFont") }}
            <a :href="`mailto:${orderDetail?.officialEmail}`">{{
              orderDetail?.officialEmail
            }}</a>
            {{ $t("single.orderSuccessTipAfter") }}
          </span>
        </div>
        <div class="order-detail">
          <JtformItem :label="$t('single.orderNo') + '：'">
            <template #content>
              <div
                style="
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                "
              >
                <div class="result-text">{{ orderDetail?.orderNo || "-" }}</div>
                <div
                  :class="foldShow ? 'arrow-up' : 'arrow-down'"
                  @click="foldShow = !foldShow"
                ></div>
              </div>
            </template>
          </JtformItem>
          <JtformItem :label="$t('single.orderTime') + '：'">
            <template #content>
              <div class="result-text">{{ orderDetail?.orderTime || "-" }}</div>
            </template>
          </JtformItem>
          <JtformItem :label="$t('single.name') + '：'">
            <template #content>
              <div class="result-text">{{ orderDetail?.userName || "-" }}</div>
            </template>
          </JtformItem>
          <JtformItem :label="$t('single.phone') + '：'">
            <template #content>
              <div class="result-text">
                {{
                  orderDetail?.phoneCode
                    ? `(${orderDetail?.phoneCode})${orderDetail?.phone}`
                    : orderDetail?.phone || "-"
                }}
              </div>
            </template>
          </JtformItem>
          <JtformItem :label="$t('single.shippingAddress') + '：'" class="mb-0">
            <template #content>
              <div class="result-text">
                {{
                  orderDetail?.provinceName
                    ? orderDetail?.provinceName + " - "
                    : ""
                }}
                {{ orderDetail?.cityName ? orderDetail?.cityName + " - " : "" }}
                {{ orderDetail?.address }}
              </div>
            </template>
          </JtformItem>
          <div
            v-show="foldShow"
            class="additional-information"
            :class="foldShow ? 'show' : ''"
          >
            <Divider />
            <div class="product-info">
              <div class="product-img">
                <img
                  :src="orderDetail ? productSpec(orderDetail).specUrl : ''"
                  alt="image"
                  srcset=""
                />
              </div>
              <div>
                <div
                  class="spec"
                  v-for="(spec, index) in productSpec(
                    orderDetail ? orderDetail : '',
                  ).attrValues"
                  :key="index"
                >
                  <span class="spec-label"> {{ spec.label }}: </span>
                  <span class="spec-value">{{ spec.value }}</span>
                </div>
              </div>
            </div>
            <Divider />
            <JtformItem :label="$t('single.price') + '：'">
              <template #content>
                <div class="result-text2">
                  {{ orderDetail?.currencyIcon }} {{ orderDetail?.price }}
                </div>
              </template>
            </JtformItem>
            <JtformItem :label="$t('single.quantity') + '：'">
              <template #content>
                <div class="result-text2">{{ orderDetail?.amount || 0 }}</div>
              </template>
            </JtformItem>
            <JtformItem :label="$t('single.totalItems') + '：'">
              <template #content>
                <div class="result-text2">
                  {{ orderDetail?.currencyIcon }}
                  {{ orderDetail?.productTotalPrice || "0.00" }}
                </div>
              </template>
            </JtformItem>
            <JtformItem :label="$t('single.shippingFee') + '：'">
              <template #content>
                <div class="result-text2">
                  {{ orderDetail?.currencyIcon }} 0.00
                </div>
              </template>
            </JtformItem>
            <JtformItem :label="$t('single.paymentMethod') + '：'" class="mb-0">
              <template #content>
                <div class="result-text2">{{ $t("single.cod") }}</div>
              </template>
            </JtformItem>
          </div>
          <Divider />
          <JtformItem
            :label="$t('single.amountPaid') + '：'"
            style="margin-bottom: 0"
          >
            <template #content>
              <span class="amount-paid"
                >{{ orderDetail?.currencyIcon }}
                {{ orderDetail?.totalPrice || "0.00" }}</span
              >
            </template>
          </JtformItem>
        </div>
      </div>
    </BOverlay>
  </ClientOnly>

  <Teleport to="body">
    <div
      class="top-0 start-50 translate-middle-x toast-container position-fixed p-3"
    >
      <BToast v-model="showTip">
        {{ tipMsg }}
      </BToast>
    </div>
  </Teleport>
</template>

<script name="payResult" setup lang="ts">
import success from "@/assets/images/success.jpg";
import { useRouter } from "vue-router";
const show = ref(false);
const router = useRouter();
const { t } = useI18n();
const productSpec = computed(() => {
  return (row: any) => {
    let spec = row.productSpec
      ? JSON.parse(row.productSpec)
      : {
          specUrl: "",
          attrValues: "",
        };
    if (JSON.stringify(spec.attrValues) === "{}" || !spec.attrValues) {
      spec.attrValues = [];
    } else {
      spec.attrValues = Object.entries(spec.attrValues).map(
        ([cnKey, value]) => ({
          label: cnKey, // 取英文键名，无映射则用原中文名
          value: value, // 规格值
        }),
      );
    }
    return spec;
  };
});
const foldShow = ref(false);
const config = useRuntimeConfig();
const route = useRoute();
const apiBase = config.public.apiBase;
const showTip = ref(false);
const tipMsg = ref("");
const orderDetail = ref(null as any);
import { useLocaleStore } from "../../stores/locale";
const localeStore = useLocaleStore();
const fetchData = async () => {
  if (!route.query.id) {
    router.push("error");
    return;
  }
  try {
    show.value = true;
    const res = (await $fetch(`${apiBase}api/order/${route.query.id}`)) as any;
    if (res.code === 200) {
      orderDetail.value = res.data;
    } else {
      showTip.value = true;
      tipMsg.value = res.msg;
    }
  } catch (error: any) {
    show.value = false;
    showTip.value = true;
    tipMsg.value = error.message;
  } finally {
    show.value = false;
  }
};
onBeforeMount(async () => {
  localeStore.initLocale();
  await fetchData();
  if (orderDetail.value?.language) {
    localeStore.changeLocale(orderDetail.value?.language);
  } else {
    localeStore.initLocale();
  }
  useHead({ title: orderDetail.value?.title || t("single.mall") });
});
</script>

<style lang="less" scoped>
.pay-result {
  min-height: 100vh;
  background-color: #fff;
  padding: 16px;

  .order-status {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .order-status-img {
      width: 80px;
      height: 80px;
      margin-bottom: 22px;
    }

    .order-status-img img {
      width: 100%;
    }

    .order-status-name {
      font-family:
        PingFangSC,
        PingFang SC;
      font-weight: 600;
      font-size: 18px;
      color: #565656;
      line-height: 25px;
      margin-bottom: 16px;
    }

    .order-status-des {
      font-family:
        PingFangSC,
        PingFang SC;
      font-size: 14px;
      color: #5b5b5b;
      line-height: 23px;
    }
  }

  .order-detail {
    margin-top: 20px;
    background: #f3f3f3;
    border-radius: 8px;
    padding: 20px 16px 22px 16px;
    margin-bottom: 40px;

    .arrow-up,
    .arrow-down {
      display: inline-block;
      width: 10px;
      height: 10px;
      border-bottom: 2px solid #222;
      border-left: 2px solid #222;
      cursor: pointer;
      transform: rotate(-45deg);
      transition: all 0.3s;
    }

    .arrow-down {
      margin-top: -4px;
      margin-left: 4px;
    }

    .arrow-up {
      transform: rotate(135deg);
    }

    .result-text {
      font-size: 14px;
      text-align: left;
    }

    .result-text2 {
      font-size: 14px;
      text-align: right;
    }

    .amount-paid {
      font-family: DINPro, DINPro;
      font-weight: 600;
      font-size: 20px;
      color: #d94b35;
      line-height: 26px;
      text-align: right;
    }

    .additional-information {
      height: 0;
      overflow: hidden;
      transition: height 0.5s ease;
    }

    .additional-information.show {
      height: auto;
    }

    .product-info {
      display: flex;
      align-items: center;
      font-size: 14px;
      .product-img {
        width: 50px;
        height: 50px;
        background: #d8d8d8;
        border-radius: 2px;
        margin-right: 16px;
      }

      .product-img img {
        width: 50px;
        height: 50px;
        display: block;
        object-fit: contain;
        border-radius: 2px;
      }

      .spec-label {
        font-family: PingFang-SC, PingFang-SC;
        color: #5b5b5b;
        line-height: 20px;
        margin-right: 8px;
      }

      .spec-value {
        font-family: PingFang-SC, PingFang-SC;
        color: #282828;
        line-height: 20px;
      }
    }

    .jtmall-divider {
      margin: 16px 0px;
    }

    .jtform-item {
      margin-bottom: 12px;
    }

    .mb-0 {
      margin-bottom: 0px;
    }
  }
}
</style>
<style>
.toast-body {
  overflow: auto;
}
</style>
