<template>
  <div class="jt-recent-orders" v-if="props.orders.length">
    <des-panel :title="$t('single.recentOrders')"> </des-panel>

    <div
      class="orders-list-wrapper"
      @mouseenter="hovering = true"
      @mouseleave="hovering = false"
      @touchstart="hovering = true"
      @touchend="hovering = false"
      ref="wrapperRef"
    >
      <div
        class="orders-scroll-box"
        ref="scrollBoxRef"
        :style="{ transform: `translateY(-${translateY}px)` }"
      >
        <div
          class="order-item"
          v-for="(item, index) in displayOrders"
          :key="index"
        >
          <div class="o-col name-col">{{ maskName(item.userName) }}</div>
          <div class="o-col spec-col">{{ parseSpec(item) }}</div>
          <div class="o-col qty-col">x{{ item.productNum || 1 }}</div>
          <div class="o-col time-col">
            {{ formatTime(item.createLocalTime) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
  nextTick,
  watch,
} from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

interface OrderItem {
  userName: string;
  createLocalTime: string;
  productNum: number;
  [key: string]: any;
}

const props = withDefaults(
  defineProps<{
    orders?: OrderItem[];
  }>(),
  {
    orders: () => [],
  },
);

const displayOrders = computed(() => {
  if (props.orders.length === 0) return [];
  return [...props.orders, ...props.orders];
});

const wrapperRef = ref<HTMLElement | null>(null);
const scrollBoxRef = ref<HTMLElement | null>(null);

let rafId = 0;
const translateY = ref(0);
const hovering = ref(false);

const maskName = (name: string) => {
  if (!name) return "****";
  const str = String(name);
  if (str.length <= 2) {
    return str + "****";
  } else if (str.length <= 4) {
    return str.slice(0, 1) + "****" + str.slice(-1);
  } else {
    return str.slice(0, 2) + "****" + str.slice(-2);
  }
};

const parseSpec = (item: any) => {
  if (!item) return "";
  if (item.sysProductSku && item.sysProductSku.attrValues) {
    return Object.values(item.sysProductSku.attrValues).join(" ");
  }
  return "";
};

const formatTime = (timeStr: string) => {
  if (!timeStr) return "";
  const orderTimeMs = new Date(timeStr).getTime();
  if (isNaN(orderTimeMs)) return timeStr;

  const nowMs = new Date().getTime();
  const diffMs = nowMs - orderTimeMs;

  const oneHour = 3600000;

  if (diffMs < oneHour) {
    return t("single.justBought");
  } else if (diffMs >= oneHour && diffMs < 3 * oneHour) {
    return t("single.hoursAgo");
  } else if (diffMs >= 3 * oneHour && diffMs < 24 * oneHour) {
    return t("single.threeHoursAgo");
  } else {
    return t("single.daysAgo");
  }
};

const startScroll = () => {
  if (!scrollBoxRef.value || !wrapperRef.value) {
    rafId = requestAnimationFrame(startScroll);
    return;
  }

  const totalHeight = scrollBoxRef.value.scrollHeight;
  const loopHeight = totalHeight / 2;

  if (loopHeight > 0) {
    if (!hovering.value) {
      translateY.value += 0.2;
      if (translateY.value >= loopHeight) {
        translateY.value = 0;
      }
    }
  }

  rafId = requestAnimationFrame(startScroll);
};

watch(
  () => props.orders,
  (newVal) => {
    if (newVal.length > 0) {
      nextTick(() => {
        if (!rafId) {
          rafId = requestAnimationFrame(startScroll);
        }
      });
    }
  },
  { deep: true },
);

onMounted(() => {
  if (props.orders.length > 0) {
    rafId = requestAnimationFrame(startScroll);
  }
});

onBeforeUnmount(() => {
  //   if (rafId) cancelAnimationFrame(rafId);
});
</script>

<style scoped lang="less">
.jt-recent-orders {
  background: #fff;
  margin-top: 10px;
  padding: 0 0 15px 0;
  max-height: 150px;
  overflow: hidden;
}

.orders-list-wrapper {
  overflow: hidden;
  position: relative;
  padding: 0 16px;
}

.orders-scroll-box {
  width: 100%;
  will-change: transform;
  transition: none;
}

.order-item {
  display: flex;
  align-items: center;
  padding: 4px 0;
  font-size: 11px;
  color: #333;
}

.order-item:last-child {
  border-bottom: none;
}

.o-col {
  white-space: nowrap;
}

.name-col {
  width: 18%;
  flex-shrink: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.spec-col {
  flex-grow: 1;
  width: 0;
  margin: 0 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #555;
}

.qty-col {
  width: 6%;
  flex-shrink: 0;
  text-align: left;
  color: #666;
}

.time-col {
  width: 28%;
  flex-shrink: 0;
  text-align: right;
  color: #999;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
