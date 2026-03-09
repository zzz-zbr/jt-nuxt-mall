<template>
  <ClientOnly>
    <JtSwipper
      v-if="images.length"
      ref="jtSwipperRef"
      :sources="images"
      @sliderMove="sliderMove"
    ></JtSwipper>
  </ClientOnly>

  <div class="sec-content">
    <div class="jt-scroll-img">
      <div class="img-content">
        <div
          class="img-item"
          v-for="(item, index) in scrollImages"
          @click="clickImg(item, item.realIndex)"
          :class="currentImg?.sindex === item.sindex ? 'actived' : ''"
          :key="item.realIndex"
          :id="`img-item${item.realIndex}`"
        >
          <img :src="item.imgSrc" alt="" />
        </div>
      </div>
    </div>
    <div class="product-title">{{ productInfo?.title }}</div>
    <div class="sales-price">
      <span>
        <span class="now-price"
          >{{ productInfo?.icon ? productInfo?.icon : "" }}
          {{ currentSku?.price || 0.0 }}</span
        >
        <span class="old-price" v-show="currentSku?.originalPrice"
          >{{ productInfo?.icon ? productInfo?.icon : "" }}
          {{ currentSku?.originalPrice || 0.0 }}</span
        >
      </span>
      <span class="sales" v-show="currentSku?.virtualSales"
        >{{ $t("single.sales") }} {{ currentSku?.virtualSales }}</span
      >
    </div>
    <div class="sec-icon">
      <img alt="" src="assets/svg/car.svg" />
      <span class="tip">{{ $t("single.cod") }}</span>
    </div>
    <div class="sec-icon wl-icon">
      <img alt="" src="assets/svg/wl.svg" />
      <span class="tip">{{ $t("single.freeShipping") }}</span>
    </div>
  </div>
  <!-- 虚拟订单 -->
  <JtRecentOrders
    :orders="productInfo?.orderList || productInfo?.orders || []"
    v-if="productInfo?.status !== 0"
  />

  <!-- 商品详情 -->
  <div class="detail-content">
    <des-panel :title="$t('single.productDetail')"> </des-panel>
    <div class="product-json" v-html="processedProductDetail"></div>
  </div>

  <div class="order-confirm">
    <des-panel :title="$t('single.confirmOrder')"> </des-panel>
    <div class="order-info">
      <div v-for="(sku, index) in attrDefinitions">
        <div class="product-spec">
          <span class="product-spec-label" v-show="sku.name"
            >{{ sku.name }}：</span
          >
          <span class="product-spec-name">{{
            currentSku?.attrValues[sku.name]
          }}</span>
        </div>
        <div
          class="product-spec-radioGroup"
          v-if="sku.values && sku.values.length"
        >
          <div
            class="product-spec-radio"
            :class="currentSku?.attrValues[sku.name] === value ? 'active' : ''"
            v-for="value in sku.values"
            :key="value"
            @click="changeSku(sku, value, $event)"
          >
            <div
              style="width: 100px; height: 100px"
              class="sku-img"
              v-if="index === 0 && skuImg(sku.name, value)"
            >
              <img :src="skuImg(sku.name, value)" alt="" />
            </div>
            {{ value }}
          </div>
        </div>
      </div>
      <BFormGroup :label="$t('single.quantity')">
        <BFormSpinbutton inline min="1" max="999" v-model="amount" />
        <span class="jtmall-inventory" v-show="currentSku?.stock"
          >{{ $t("single.inventory") }}
          <span style="margin-left: 4px">{{ currentSku?.stock }}</span>
        </span>
      </BFormGroup>
      <Divider />
      <div class="order-info-form">
        <JtformItem
          :label="$t('single.totalItems') + '：'"
          :content="`${productInfo?.icon ? productInfo?.icon : ''} ${productTotalPrice}`"
        />
        <JtformItem
          :label="$t('single.shippingFee') + '：'"
          :content="`${productInfo?.icon ? productInfo?.icon : ''} 0.00`"
        />
        <JtformItem
          :label="$t('single.paymentMethod') + '：'"
          :content="$t('single.cod')"
          style="margin-bottom: 0"
        />
        <Divider />
        <JtformItem
          :label="$t('single.amountPaid') + '：'"
          style="margin-bottom: 0"
        >
          <template #content>
            <span class="amount-paid">{{
              `${productInfo?.icon ? productInfo?.icon : ""} ${productTotalPrice}`
            }}</span>
          </template>
        </JtformItem>
      </div>
    </div>
  </div>
  <!-- 订单信息 -->
  <div
    class="deliver-info"
    :class="
      productInfo?.status === 0 ||
      (productInfo?.commentList && productInfo?.commentList.length > 0)
        ? 'bottomnone'
        : ''
    "
  >
    <des-panel :title="$t('single.deliveryInfo')"> </des-panel>
    <div class="deliver-info-form">
      <BForm ref="deliverInfoFormRef" @submit.prevent="handleSubmit">
        <BFormGroup
          id="input-group-2"
          :label="$t('single.name')"
          label-for="input-1"
          :class="productInfo?.checkoutConfig?.buyerName ? 'required' : ''"
        >
          <BFormInput
            id="input-1"
            :placeholder="$t('single.enterName')"
            :required="productInfo?.checkoutConfig?.buyerName ? true : false"
            ref="inputNameRef"
            v-model="userInfo.userName"
            @update:model-value="updateName"
          />
        </BFormGroup>
        <BFormGroup
          id="input-group-2"
          :label="$t('single.email')"
          label-for="input-2"
          :class="productInfo?.checkoutConfig?.buyerEmail ? 'required' : ''"
        >
          <BFormInput
            id="input-2"
            type="email"
            :placeholder="$t('single.enterEmail')"
            ref="inputEmailRef"
            :required="productInfo?.checkoutConfig?.buyerEmail ? true : false"
            v-model="userInfo.userEmail"
            @update:model-value="updateEmail"
          />
        </BFormGroup>
        <BFormGroup
          id="input-group-3"
          :label="$t('single.phone')"
          label-for="input-3"
          :class="productInfo?.checkoutConfig?.buyerPhone ? 'required' : ''"
        >
          <BFormInput
            id="input-3"
            :placeholder="$t('single.enterPhone')"
            :required="productInfo?.checkoutConfig?.buyerPhone ? true : false"
            ref="inputPhoneRef"
            v-model="userInfo.phone"
            @update:model-value="updatePhone"
          />
        </BFormGroup>
        <BFormGroup
          id="input-group-5"
          :label="$t('single.region')"
          label-for="input-5"
          :class="productInfo?.checkoutConfig?.buyerRegion ? 'required' : ''"
        >
          <BFormSelect
            id="input-5"
            :required="productInfo?.checkoutConfig?.buyerRegion ? true : false"
            ref="inputProvinceRef"
            v-model="userInfo.province"
            @update:model-value="updateProvince"
          >
            <BFormSelectOption
              v-for="province in provinceList"
              :key="province.id"
              :value="province.id"
              >{{ province.regionName }}</BFormSelectOption
            >
          </BFormSelect>
          <BFormSelect
            id="input-5"
            class="address-select"
            ref="inputCityRef"
            v-model="userInfo.city"
          >
            <BFormSelectOption
              v-for="province in cityList"
              :key="province.id"
              :value="province.id"
              >{{ province.regionName }}</BFormSelectOption
            >
          </BFormSelect>
        </BFormGroup>
        <BFormGroup
          id="input-group-4"
          :label="$t('single.postcode')"
          label-for="input-4"
          :class="
            productInfo?.checkoutConfig?.buyerPostalCode ? 'required' : ''
          "
        >
          <div
            class="position-relative postcode-input-wrapper"
            ref="postCodeWrapperRef"
          >
            <BFormInput
              id="input-4"
              :placeholder="$t('single.enterPostcode')"
              :required="
                productInfo?.checkoutConfig?.buyerPostalCode ? true : false
              "
              ref="inputPostCodeRef"
              v-model="userInfo.postCode"
              @update:model-value="updatePostCode"
              @focus="showPostCodeSuggestions = true"
              @blur="onPostCodeBlur"
              autocomplete="off"
            />
            <!-- 下拉箭头区域 -->
            <div
              class="position-absolute end-0 top-50 translate-middle-y pe-3"
              style="cursor: pointer; z-index: 10"
              @mousedown.prevent="togglePostCodeDropdown"
            >
              <div
                class="jt-dropdown-arrow"
                :class="{ 'arrow-up': showPostCodeSuggestions }"
              ></div>
            </div>

            <!-- 下拉选项列表 -->
            <Transition name="jt-dropdown">
              <div
                v-show="showPostCodeSuggestions && postCodeList.length > 0"
                class="jt-custom-dropdown-menu"
              >
                <div
                  v-for="code in postCodeList"
                  :key="code"
                  class="jt-custom-dropdown-item"
                  @mousedown.prevent="selectPostCode(code)"
                >
                  {{ code }}
                </div>
              </div>
            </Transition>
          </div>
        </BFormGroup>
        <BFormGroup
          id="input-group-6"
          :label="$t('single.address')"
          label-for="input-6"
          :class="productInfo?.checkoutConfig?.buyerAddress ? 'required' : ''"
        >
          <BFormTextarea
            id="input-6"
            :placeholder="$t('single.enterAddress')"
            rows="3"
            :required="productInfo?.checkoutConfig?.buyerAddress ? true : false"
            ref="inputAddressRef"
            v-model="userInfo.address"
            @update:model-value="updateAddress"
          />
        </BFormGroup>
        <BFormGroup
          id="input-group-7"
          :label="$t('single.message')"
          label-for="input-7"
          :class="productInfo?.checkoutConfig?.buyerRemark ? 'required' : ''"
        >
          <BFormTextarea
            id="input-7"
            :placeholder="$t('single.enterMessage')"
            rows="3"
            :required="productInfo?.checkoutConfig?.buyerRemark ? true : false"
            ref="inputRemarkRef"
            v-model="userInfo.remark"
            @update:model-value="updateRemark"
          />
        </BFormGroup>
      </BForm>
    </div>
  </div>
  <!-- 商品评论 -->
  <JtProductComments :comments="productInfo?.commentList || []" />

  <!-- 底部按钮 -->
  <div
    class="jtmall-btn-group"
    :class="show ? 'disabled' : ''"
    v-if="productInfo?.status !== 0"
  >
    <div
      class="orderQuery"
      @click="queryOrder"
      v-if="productInfo?.orderNum && productInfo?.orderNum > 0"
    >
      {{ $t("single.orderQuery") }}
    </div>
    <div class="buyNow" @click="onSubmit" type="submit">
      {{ $t("single.buyNow") }}
    </div>
  </div>
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

<script lang="ts" setup>
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useLocaleStore } from "../../stores/locale";
import {
  debounce,
  getRealImgUrl,
  isSimpleObjectEqual,
  handleTree,
  extractFirstFrame,
} from "../utils";
import * as math from "mathjs";
const router = useRouter();
const { t, setLocale } = useI18n();
const localeStore = useLocaleStore();
const productDetail = ref<string | null>(null);
const productInfo = ref(null as any);
const show = ref(false);
const jtSwipperRef = ref();
const images = ref([] as any);
const scrollImages = ref([] as any);
const currentImg = ref<any>({
  src: "",
  sindex: 0,
  realIndex: 0,
  id: "",
});
const attrDefinitions = computed(() => {
  return productInfo.value?.attrDefinitions || [];
});
const skuImg = computed(() => {
  return (category: string, targetValue: string) => {
    if (!productInfo.value?.skus || !currentSku.value) return "";

    const targetSku = productInfo.value.skus.find((item: any) => {
      // 1. 目标属性名 category 对应的属性值必须是 targetValue
      if (item.attrValues[category] !== targetValue) return false;

      // 2. 除了 category 以外，其他的属性值必须跟当前选中的 currentSku 一致
      for (const key in currentSku.value.attrValues) {
        if (key !== category) {
          if (item.attrValues[key] !== currentSku.value.attrValues[key]) {
            return false;
          }
        }
      }
      return true;
    });

    return targetSku?.imageUrl ? getRealImgUrl(targetSku.imageUrl) : "";
  };
});
const amount = ref(1);
const productTotalPrice = computed(() => {
  return currentSku.value
    ? math.format(
        math.multiply(
          math.bignumber(amount.value),
          math.bignumber(currentSku.value.price),
        ),
        { notation: "fixed", precision: 2 },
      )
    : "0.00";
});
const currentSku = ref(null as any);
const userInfo = ref({
  userName: "",
  userEmail: "",
  phoneCode: "",
  phone: "",
  postCode: "",
  province: "",
  city: "",
  address: "",
  remark: "",
});
/**
 * 查sku
 */
const findSku = () => {
  if (currentImg.value.id) {
    let sku =
      productInfo.value?.skus
        .filter((item: any) => item.isDisplay)
        .find((item: any) => item.id === currentImg.value.id) ||
      productInfo.value?.skus[0];
    currentSku.value = sku || null;
  } else {
    currentSku.value = null;
  }
};

const ipInfo = ref<any>(null);

// 优化富文本内容，确保在移动端兼容
const processedProductDetail = computed(() => {
  if (!productDetail.value) return "";
  let content = productDetail.value;
  // 1. 处理图片：去掉固定的 width 和 height 属性，让 CSS 控制
  content = content.replace(/<img([^>]*)width="[^"]*"([^>]*)>/gi, "<img$1$2>");
  content = content.replace(/<img([^>]*)height="[^"]*"([^>]*)>/gi, "<img$1$2>");

  // 2. 处理视频：确保有 playsinline, controls, autoplay, muted 和限制最大宽度
  // 特效：给视频地址加上 #t=0.1，浏览器会自动截取 0.1 秒处的画面作为第一帧预览图
  content = content.replace(
    /<video/gi,
    '<video playsinline autoplay muted preload="metadata" controls style="max-width: 100%; height: auto; background: #eee;"',
  );
  content = content.replace(/(<video[^>]*src="[^"]*)(")/gi, "$1#t=0.1$2");
  content = content.replace(/(<source[^>]*src="[^"]*)(")/gi, "$1#t=0.1$2");

  return content;
});

const config = useRuntimeConfig();
const route = useRoute();
const apiBase = config.public.apiBase;
const provinceList = ref([] as any);
const cityList = computed(() => {
  let list = [];
  if (userInfo.value.province && provinceList.value.length) {
    let province = provinceList.value.find(
      (item: any) => item.id === userInfo.value.province,
    );
    list = province && province.children ? province.children : [];
  }
  return list;
});
const postCodeList = computed(() => {
  let city = cityList.value.find(
    (item: any) => item.id === userInfo.value.city,
  );
  if (city && city.postalCode) {
    return city.postalCode.split(",");
  } else {
    return [];
  }
});
watch(
  () => postCodeList,
  (newVal) => {
    userInfo.value.postCode = newVal.value.length ? newVal.value[0] : "";
  },
  { deep: true },
);
watch(
  () => cityList,
  (newVal) => {
    userInfo.value.city = newVal.value.length ? newVal.value[0].id : "";
  },
  { deep: true },
);
const getProvinces = async () => {
  const res = (await $fetch(
    `${apiBase}api/order/listAddress?countryCode=${productInfo.value.countryCode}`,
  ).catch((e) => {
    console.error("Provinces fetch failed:", e);
    return { rows: [] };
  })) as any;
  const data = handleTree(res.rows, "id", "parentId") as any;
  provinceList.value =
    data && data.length && data[0].children ? data[0].children : [];
  userInfo.value.phoneCode =
    data && data.length && data[0].phoneCode ? data[0].phoneCode : "";
  userInfo.value.province = provinceList.value.length
    ? provinceList.value[0].id
    : "";
};

/**
 * 初始化 Facebook Pixel（仅客户端，单一 locale 以避免版本冲突）
 * - 严格清理 ID（仅保留 ASCII 数字）并去重
 * - 使用统一的 en_US locale 以避免多个版本冲突
 * - 如果已有其他源注入的 fbq，则只负责初始化我们的 ID
 */
const PIXEL_INIT_MARK = "__fb_pixel_inited__";
const initMetaPinxel = async (fbPixelIds: string | undefined | null) => {
  if (import.meta.server || (window as any)[PIXEL_INIT_MARK]) return;

  // 防御性检查：fbPixelIds 必须是非空字符串
  if (!fbPixelIds || typeof fbPixelIds !== "string") {
    console.warn("[Facebook Pixel] fbPixelIds 无效：", fbPixelIds);
    return;
  }

  // 严格校验：仅保留 ASCII 数字（0-9），排除全角数字等污染字符
  let pixelIds: string[] = [];
  try {
    const rawIds = String(fbPixelIds).split(",");
    console.log("[Facebook Pixel] 原始 ID 列表：", rawIds);

    pixelIds = Array.from(
      new Set(
        rawIds
          .map((s) => {
            // 将字符串中的所有非 ASCII 数字去掉，仅保留 0-9
            return String(s)
              .replace(/[^\d]/g, "") // 移除所有非数字字符（包括全角数字）
              .trim();
          })
          .filter((s) => s && s.length >= 8), // 过滤空字符串和长度不足的
      ),
    );
    console.log("[Facebook Pixel] 清理后 ID 列表：", pixelIds);
  } catch (parseErr) {
    console.error("[Facebook Pixel] ID 解析失败：", parseErr);
    return;
  }

  if (!pixelIds || pixelIds.length === 0) {
    console.warn("[Facebook Pixel] 没有有效的 Pixel ID");
    return;
  }
  useHead({
    script: [
      {
        hid: "fb-pixel",
        src: "https://connect.facebook.net/en_US/fbevents.js",
        async: true,
        defer: true,
        onload: () => {
          // 对每个 Pixel ID 初始化 Facebook Pixel
          pixelIds.forEach((pixelId) => {
            fbq("init", pixelId);
            fbq("track", "PageView");
          });
        },
      },
    ],
  });
};

const fetchData = async () => {
  try {
    // 1. 获取地理位置信息 (IP Info)
    // 在客户端渲染时，我们只需要调用 API 即可，浏览器会自动处理请求
    const info = await $fetch("/api/ipInfo").catch((e) => {
      console.error("IP Info fetch failed:", e);
      return null;
    });
    ipInfo.value = info;
    // 2. 获取商品信息
    const product = (await $fetch(
      `${apiBase}api/product/${route.params.param}`,
      {
        headers: {
          "ContentInfo-Key":
            ipInfo.value.ip + "###jt###" + ipInfo.value.country,
        },
      },
    ).catch((e) => {
      console.error("Product fetch failed:", e);
      return { data: null };
    })) as any;

    if (product.data) {
      productInfo.value = product.data;
      if (product.data.status === 0) {
        showTip.value = true;
        tipMsg.value = t("single.productUnavailable");
        // return;
      }
      // 注入虚拟评论数据用于样式开发验证
      if (!product.data.commentList || product.data.commentList.length === 0) {
        product.data.commentList = [
          {
            userName: "Anson111",
            starLevel: 5,
            commentTime: "2026-03-03 12:00:00",
            content: "这个商品非常好，物美价廉",
            images: [],
          },
          {
            userName: "SarahW222",
            starLevel: 4,
            commentTime: "2026-03-04 10:30:00",
            content: "这个商品非常好，物美价廉，物流也很快，包装严实。",
            images: [
              "https://pic3.zhimg.com/v2-fdee089bc15b534bce0a10f83e1acf88_1440w.jpg",
            ],
          },
          {
            userName: "JamesBond333",
            starLevel: 5,
            commentTime: "2026-03-05 09:00:00",
            content:
              "Very good product, highly recommend! 这个商品非常好，物美价廉，物美价廉，物美价廉。",
            images: [
              "https://pic3.zhimg.com/v2-fdee089bc15b534bce0a10f83e1acf88_1440w.jpg",
            ],
          },
          {
            userName: "Mokkey444",
            starLevel: 3,
            commentTime: "2026-03-06 15:20:00",
            content: "还行吧，主要是配送快。",
            images: [],
          },
          {
            userName: "Anson",
            starLevel: 5,
            commentTime: "2026-03-03 12:00:00",
            content: "这个商品非常好，物美价廉",
            images: [],
          },
          {
            userName: "SarahW",
            starLevel: 4,
            commentTime: "2026-03-04 10:30:00",
            content: "这个商品非常好，物美价廉，物流也很快，包装严实。",
            images: [
              "https://pic3.zhimg.com/v2-fdee089bc15b534bce0a10f83e1acf88_1440w.jpg",
            ],
          },
          {
            userName: "JamesBond",
            starLevel: 5,
            commentTime: "2026-03-05 09:00:00",
            content:
              "Very good product, highly recommend! 这个商品非常好，物美价廉，物美价廉，物美价廉。",
            images: [
              "https://pic3.zhimg.com/v2-fdee089bc15b534bce0a10f83e1acf88_1440w.jpg",
              "https://p9-xtjj-sign.byteimg.com/tos-cn-i-73owjymdk6/7d12f7153c294c22acc5b839fa5ca593~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5oqA5pyv54is54is6Jm-:q75.awebp?rk3s=f64ab15b&x-expires=1772923874&x-signature=zZFTvRJ0%2BfPidnSHE1lofNCsKHk%3D",
            ],
          },
          {
            userName: "Mokkey",
            starLevel: 3,
            commentTime: "2026-03-06 15:20:00",
            content: "还行吧，主要是配送快。",
            images: [],
          },
        ];
      }

      // 初始化 Facebook Pixel（异步但不阻塞）
      initMetaPinxel(product.data.fbPixelIds);
      productDetail.value = product.data.productDetail || null;
      useHead({ title: productInfo.value?.title || t("single.mall") });
      localeStore.changeLocale(productInfo.value?.language || "en");
      if (productInfo.value.countryCode) {
        getProvinces();
      }
      const mainImages = product.data.images.map(
        (item: any, index: number) => ({
          imgSrc: item.url,
          src: item.url,
          sindex: index,
          realIndex: index,
          id: item.id,
          type: "image",
        }),
      );
      if (product.data.videoUrl) {
        let videoObj = {
          imgSrc: await extractFirstFrame(getRealImgUrl(product.data.videoUrl)),
          src: getRealImgUrl(product.data.videoUrl),
          sindex: mainImages.length,
          realIndex: mainImages.length,
          id: product.data.videoUrl,
          type: "video",
        };
        mainImages.push(videoObj);
      }
      let computedImages = [];
      let computedScrollImages = [];

      computedImages = [...mainImages];
      computedScrollImages = [...mainImages];
      images.value = computedImages;
      scrollImages.value = computedScrollImages;
      if (images.value.length > 0) {
        currentImg.value = images.value[0];
      }
      findSku();
      // 获取虚拟订单数据
      fetchVirtualOrders();
    } else {
      router.push("/error");
    }
  } catch (e) {
    console.error("Unexpected error in fetchData:", e);
  }
};

/**
 * 获取虚拟订单数据
 */
const fetchVirtualOrders = async () => {
  if (!productInfo.value?.id || !ipInfo.value?.timezone) return;
  try {
    const res = (await $fetch(
      `${apiBase}api/virtual/orderList?productId=${productInfo.value.id}&timezone=${ipInfo.value.timezone}`,
    ).catch((e) => {
      console.error("Virtual orders fetch failed:", e);
      return { data: [] };
    })) as any;
    if (res.code === 200 && res.data) {
      productInfo.value.orderList = res.data;
    }
  } catch (e) {
    console.error("Unexpected error in fetchVirtualOrders:", e);
  }
};

onBeforeMount(async () => {
  fetchData();
  useHead({ title: productInfo.value?.title || t("single.mall") });
});

/**
 * 轮播图定位下面
 */
const sliderMove = (swiper: any) => {
  currentImg.value = images.value[swiper.realIndex];
  findSku();
  nextTick(() => {
    if (currentImg.value) {
      scrollImg(currentImg.value);
    }
  });
};

/**
 * 选择规格
 */
const changeSku = (sku: any, value: string, event?: any) => {
  if (!currentSku.value) return;
  if (event?.currentTarget) {
    event.currentTarget.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "nearest",
    });
  }

  let attrValues = JSON.parse(JSON.stringify(currentSku.value.attrValues));
  attrValues[sku.name] = value;
  let obj = productInfo.value?.skus
    .filter((ctem: any) => ctem.isDisplay)
    .find((item: any) => isSimpleObjectEqual(item.attrValues, attrValues));
  currentSku.value = obj ? obj : currentSku.value;
};

const deliverInfoFormRef = ref();
const inputNameRef = ref();
const inputEmailRef = ref();
const inputPhoneRef = ref();
const inputPostCodeRef = ref();
const inputProvinceRef = ref();
// const inputCityRef = ref();
const inputAddressRef = ref();
const inputRemarkRef = ref();
const postCodeWrapperRef = ref();
const showPostCodeSuggestions = ref(false);
const showTip = ref(false);
const tipMsg = ref("");
/**
 * 提交数据
 */
const onSubmit = async () => {
  if (show.value) return;
  // 提交表单-确认订单不在可视窗口上方的时候定位上去
  const orderConfirm = document.querySelector(".order-confirm");
  if (orderConfirm instanceof HTMLElement) {
    const rect = orderConfirm?.getBoundingClientRect();
    if (rect.top > 0) {
      scrollTo({ top: orderConfirm?.offsetTop, behavior: "smooth" });
      return;
    }
  }
  // 名字输入框
  valideName(inputNameRef.value.element.value);

  // 邮件输入框
  valideEmail(inputEmailRef.value.element.value);
  // 电话输入框
  validePhone(inputPhoneRef.value.element.value);
  // 邮编输入框
  validePostCode(inputPostCodeRef.value.element.value);

  // // 地区输入框
  // valideProvince(inputProvinceRef.value.element.value);
  // valideCity(inputCityRef.value.element.value);

  // 详细地址输入框
  valideAddress(inputAddressRef.value.element.value);

  // 留言输入框
  valideRemark(inputRemarkRef.value.element.value);
  // 验证表单
  deliverInfoFormRef.value.element.reportValidity();
  if (deliverInfoFormRef.value.element.checkValidity()) {
    let spec = {
      specUrl: currentSku?.value.imageUrl
        ? getRealImgUrl(currentSku?.value.imageUrl)
        : images.value[0].src,
      attrValues: currentSku?.value.attrValues,
    };
    let params = {
      ...userInfo.value,
      countryCode: productInfo.value.countryCode,
      productId: currentSku.value.productId,
      productSkuId: currentSku.value.id,
      productSpec: JSON.stringify(spec),
      amount: amount.value,
      orderIp: ipInfo.value.ip,
      countryAddress: ipInfo.value.country,
      regionAddress: ipInfo.value.region,
      cityAddress: ipInfo.value.city,
      timezone: ipInfo.value.timezone,
    };
    show.value = true;
    const res = (await $fetch(`${apiBase}api/order/save`, {
      method: "POST",
      body: params,
    }).catch((e) => {
      show.value = false;
      showTip.value = true;
      tipMsg.value = e.message;
    })) as any;
    show.value = false;
    if (res.code === 200) {
      if (window.fbq) {
        console.log("触发购买操作");

        window.fbq("track", "Purchase", {
          value: productTotalPrice.value, // 实付金额，必须是数字
          currency: productInfo.value.iconCode, // 货币代码，大写 ISO 4217（CNY/USD/EUR）
          order_id: res.data, // 订单号，用于对账和去重
          content_type: "product", // 固定值：product（单个商品）/product_group（商品组）
          content_ids: [params.productSkuId], // 商品ID数组
          contents: {
            // 商品明细（推荐传，优化广告投放）
            id: params.productSkuId,
            quantity: amount.value,
            item_price: currentSku?.value.price,
          },
        });
      }
      router.push("/result?id=" + res.data);
    } else {
      showTip.value = true;
      tipMsg.value = res.msg;
    }
  }
};

/**
 * 验证姓名
 * @param value
 */
const valideName = (value: string) => {
  if (inputNameRef.value.element.checkValidity()) {
    return;
  }
  if (value) {
    inputNameRef.value.element.setCustomValidity("");
  } else {
    inputNameRef.value.element.setCustomValidity(t("single.invalidName"));
  }
};
/**
 * 验证邮箱
 */
const valideEmail = (value: string) => {
  if (inputEmailRef.value.element.checkValidity()) {
    return;
  }
  if (!value) {
    inputEmailRef.value.element.setCustomValidity(t("single.invalidEmail"));
  } else if (
    !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(
      inputEmailRef.value.element.value,
    )
  ) {
    inputEmailRef.value.element.setCustomValidity(
      t("single.invalidEmailFormat"),
    );
  } else {
    inputEmailRef.value.element.setCustomValidity("");
  }
};
/**
 * 验证电话
 */
const validePhone = (value: string) => {
  if (inputPhoneRef.value.element.checkValidity()) {
    return;
  }
  if (!value) {
    inputPhoneRef.value.element.setCustomValidity(t("single.invalidPhone"));
  } else {
    inputPhoneRef.value.element.setCustomValidity("");
  }
};
/**
 * 验证邮政编码
 */
const validePostCode = (value: string) => {
  if (inputPostCodeRef.value.element.checkValidity()) {
    return;
  }
  if (!value) {
    inputPostCodeRef.value.element.setCustomValidity(
      t("single.invalidPostcode"),
    );
  } else {
    inputPostCodeRef.value.element.setCustomValidity("");
  }
};
// const valideProvince = (value: string) => {
//   if (!value) {
//     inputProvinceRef.value.element.setCustomValidity(
//       t("single.selectProvince"),
//     );
//   } else {
//     inputProvinceRef.value.element.setCustomValidity("");
//   }
// };
// const valideCity = (value: string) => {
//   if (!value) {
//     inputCityRef.value.element.setCustomValidity(t("single.selectCity"));
//   } else {
//     inputCityRef.value.element.setCustomValidity("");
//   }
// };

/**
 * 验证详细地址
 */

const valideAddress = (value: string) => {
  if (inputAddressRef.value.element.checkValidity()) {
    return;
  }
  if (!value) {
    inputAddressRef.value.element.setCustomValidity(t("single.invalidAddress"));
  } else {
    inputAddressRef.value.element.setCustomValidity("");
  }
};
/**
 * 验证留言
 */
const valideRemark = (value: string) => {
  if (inputRemarkRef.value.element.checkValidity()) {
    return;
  }
  if (!value) {
    inputRemarkRef.value.element.setCustomValidity(t("single.invalidMessage"));
  } else {
    inputRemarkRef.value.element.setCustomValidity("");
  }
};
const updateName = ($event: any) => {
  valideName($event);
  inputNameRef.value.element.reportValidity();
};
const updateEmail = ($event: any) => {
  valideEmail($event);
  inputEmailRef.value.element.reportValidity();
};
const updatePhone = ($event: any) => {
  validePhone($event);
  inputPhoneRef.value.element.reportValidity();
};
const updatePostCode = ($event: any) => {
  validePostCode($event);
  inputPostCodeRef.value.element.reportValidity();
};
const updateProvince = ($event: any) => {
  // valideProvince($event);
  inputProvinceRef.value.element.reportValidity();
};
// const updateCity = ($event: any) => {
//   // valideCity($event);
//   inputCityRef.value.element.reportValidity();
// };
const updateAddress = ($event: any) => {
  valideAddress($event);
  inputAddressRef.value.element.reportValidity();
};
const updateRemark = ($event: any) => {
  valideRemark($event);
  inputRemarkRef.value.element.reportValidity();
};
const handleSubmit = () => {
  console.log("handleSubmit");
};
const clickImg = (item: any, index: number | string) => {
  if (currentImg.value?.realIndex === item.realIndex) return;
  currentImg.value = item;
  findSku();
  jtSwipperRef.value.clickSwiper(item, index);
  nextTick(() => {
    debounce(() => scrollImg(item), 10);
  });
};
/**
 * 滚动缩略图
 */
const scrollImg = (item: any) => {
  if (import.meta.server) return; // 确保只在客户端运行
  const parentNode = document.querySelector(".sec-content");
  const parentAttrs = parentNode?.getBoundingClientRect();
  const curDom = document.querySelector(`#img-item${item.realIndex}`);
  const curDomAttrs = curDom?.getBoundingClientRect();
  const offsetLeft = (curDomAttrs?.left || 0) - (parentAttrs?.left || 0) - 16;
  const offsetRight =
    (parentAttrs?.right || 0) - 16 - (curDomAttrs?.right || 0);
  if (
    (offsetLeft > 0 && offsetLeft < 50) ||
    (-50 < offsetLeft && offsetLeft < 0)
  ) {
    curDom?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }
  if (
    (offsetRight > 0 && offsetRight < 50) ||
    (-50 < offsetRight && offsetRight < 0)
  ) {
    curDom?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }
};

const queryOrder = () => {
  router.push("/query");
};

const togglePostCodeDropdown = (e: any) => {
  if (showPostCodeSuggestions.value) {
    showPostCodeSuggestions.value = false;
  } else {
    showPostCodeSuggestions.value = true;
    inputPostCodeRef.value?.element?.focus();
  }
};

const onPostCodeBlur = () => {
  // 延时关闭以允许 mousedown 事件先执行
  setTimeout(() => {
    showPostCodeSuggestions.value = false;
  }, 200);
};

const selectPostCode = (code: string) => {
  userInfo.value.postCode = code;
  updatePostCode(code);
  showPostCodeSuggestions.value = false;
  inputPostCodeRef?.value?.blur();
};
</script>

<style scoped lang="less">
@import "~/assets/less/single.less";

.jt-dropdown-arrow {
  width: 0;
  height: 0;
  margin-left: 0.255em;
  vertical-align: 0.255em;
  content: "";
  border-top: 0.3em solid;
  border-right: 0.3em solid transparent;
  border-bottom: 0;
  border-left: 0.3em solid transparent;
  color: #6c757d;
  transition: transform 0.2s ease-in-out;

  &.arrow-up {
    transform: rotate(180deg);
  }
}

.jt-custom-dropdown-menu {
  position: absolute;
  top: calc(100% + 4px); // 增加一点间距，像悬浮层一样
  left: 0;
  width: 100%;
  max-height: 200px;
  overflow-y: auto;
  background: #fff;
  border: 1px solid #dee2e6;
  border-radius: 8px; // 更圆润的边角
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1); // 更柔和的阴影
  z-index: 1050;
  padding: 4px 0; // 内部留白
}

.jt-custom-dropdown-item {
  padding: 10px 16px;
  cursor: pointer;
  transition: all 0.1s;
  color: #333;
  font-size: 14px;

  &:hover {
    background-color: #f0f2f5;
    color: #007bff; // 悬浮时变色
  }

  &:active {
    background-color: #e6e9ed;
  }
}

// 动画效果
.jt-dropdown-enter-active,
.jt-dropdown-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: top center;
}

.jt-dropdown-enter-from,
.jt-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px) scaleY(0.95);
}

.postcode-input-wrapper {
  .form-control {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    &:focus {
      border-color: #007bff;
      box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.1);
    }
  }
}
</style>
