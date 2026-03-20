<template>
  <!-- " -->
  <div class="jt-product-comments" v-if="processedComments.length">
    <des-panel :title="$t('single.productReviews')"> </des-panel>
    <div
      class="comments-list-wrapper"
      @mouseenter="hovering = true"
      @mouseleave="hovering = false"
      @touchstart="hovering = true"
      @touchend="hovering = false"
      ref="wrapperRef"
    >
      <div
        class="comments-scroll-box"
        ref="scrollBoxRef"
        :style="{ transform: `translateY(-${translateY}px)` }"
      >
        <div
          class="comment-item"
          v-for="(item, index) in displayComments"
          :key="index"
        >
          <div class="comment-top">
            <span class="user-name">{{ maskName(item.consumerName) }}</span>
            <span class="comment-time">{{ formatDate(item.commentTime) }}</span>
          </div>
          <div class="comment-stars">
            <BFormRating
              v-model="item.level"
              variant="warning"
              aria-label="Warning rating"
              readonly
            />
          </div>
          <div
            class="comment-content"
            :style="[{ 'margin-bottom': item.images ? '10px' : '0px' }]"
          >
            {{ item.comment }}
          </div>
          <div class="comment-images" v-if="item.images">
            <img
              v-for="(img, idx) in item.images"
              :key="idx"
              :src="getRealImgUrl(img)"
              alt="image"
              @click="openPreview(item.images, idx)"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 图片预览遮罩层 -->
    <Teleport to="body">
      <div
        v-if="isPreviewing"
        class="comment-preview-overlay"
        @click="closePreview"
      >
        <div
          class="preview-container"
          @click.stop
          @touchstart="onTouchStart"
          @touchend="onTouchEnd"
        >
          <img :src="previewImages[previewIndex]" alt="preview" />

          <!-- 切换按钮 -->
          <div
            class="nav-btn prev-btn"
            v-if="previewImages.length > 1"
            @click.stop="prevImage"
          >
            &#10094;
          </div>
          <div
            class="nav-btn next-btn"
            v-if="previewImages.length > 1"
            @click.stop="nextImage"
          >
            &#10095;
          </div>

          <div class="close-btn" @click="closePreview">×</div>

          <!-- 进度指示 -->
          <div class="preview-indicators" v-if="previewImages.length > 1">
            {{ previewIndex + 1 }} / {{ previewImages.length }}
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from "vue";
import { getRealImgUrl } from "../utils";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

interface CommentItem {
  consumerName: string;
  commentTime: string;
  level: undefined | number;
  comment: string;
  images?: string[];
  [key: string]: any;
}

const props = withDefaults(
  defineProps<{
    comments?: CommentItem[];
  }>(),
  {
    comments: () => [],
  },
);

/**
 * 处理评论数据：按时间倒序排序，限制最多30条评论
 * @returns 排序并截取后的评论数组
 */
const processedComments = computed(() => {
  if (!props.comments || !props.comments.length) return [];
  let list = [...props.comments];
  list.sort((a: any, b: any) => {
    const timeA = new Date(a.commentTime).getTime() || 0;
    const timeB = new Date(b.commentTime).getTime() || 0;
    return timeB - timeA;
  });
  return list.slice(0, 30);
});

/**
 * 创建用于显示的评论列表，通过复制原始评论实现无缝滚动效果
 * @returns 包含两份原始评论的数组，用于无缝循环展示
 */
const isScrollEnabled = ref(false);

/**
 * 创建用于显示的评论列表
 * 如果列表高度不足以填满容器，则只展示原本的消息，不产生循环；
 * 否则为了实现无缝滚动效果，复制原始评论一份放在后面。
 */
const displayComments = computed(() => {
  if (processedComments.value.length === 0) return [];
  if (!isScrollEnabled.value) return processedComments.value;
  return [...processedComments.value, ...processedComments.value];
});

const wrapperRef = ref<HTMLElement | null>(null);
const scrollBoxRef = ref<HTMLElement | null>(null);

let rafId = 0;
const translateY = ref(0);
const hovering = ref(false);
const isPreviewing = ref(false);
const previewImages = ref<string[]>([]);
const previewIndex = ref(0);
const touchStartX = ref(0);
const touchEndX = ref(0);

const onTouchStart = (e: TouchEvent) => {
  touchStartX.value = e.changedTouches[0]?.screenX || 0;
};

const onTouchEnd = (e: TouchEvent) => {
  touchEndX.value = e.changedTouches[0]?.screenX || 0;
  handleSwipe();
};

const handleSwipe = () => {
  const swipeThreshold = 50;
  const diff = touchEndX.value - touchStartX.value;
  if (Math.abs(diff) > swipeThreshold && previewImages.value.length > 1) {
    if (diff > 0) {
      prevImage();
    } else {
      nextImage();
    }
  }
};

/**
 * 打开图片预览功能
 * @param images - 要预览的图片数组
 * @param index - 当前预览的图片索引
 */
const openPreview = (images: string[], index: number | string) => {
  if (!images || !images.length) return;
  previewImages.value = images
    .map((img) => getRealImgUrl(img))
    .filter(Boolean) as string[];
  previewIndex.value = Number(index);
  isPreviewing.value = true;
};

/**
 * 关闭图片预览
 */
const closePreview = () => {
  isPreviewing.value = false;
};

/**
 * 切换到上一张图片（在预览中）
 */
const prevImage = () => {
  if (previewIndex.value > 0) {
    previewIndex.value--;
  } else {
    previewIndex.value = previewImages.value.length - 1;
  }
};

/**
 * 切换到下一张图片（在预览中）
 */
const nextImage = () => {
  if (previewIndex.value < previewImages.value.length - 1) {
    previewIndex.value++;
  } else {
    previewIndex.value = 0;
  }
};

/**
 * 隐藏用户姓名中的敏感信息
 * @param name - 原始用户名
 * @returns 处理后的用户名（隐藏中间部分字符）
 */
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

/**
 * 格式化日期字符串，只保留年月日部分
 * @param dateStr - 完整的日期时间字符串
 * @returns 格式化后的日期字符串（YYYY-MM-DD格式）
 */
const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  return dateStr.split(" ")[0];
};

/**
 * 启动自动滚动功能，实现评论列表的连续滚动动画
 */
const startScroll = () => {
  if (!scrollBoxRef.value || !wrapperRef.value) {
    rafId = requestAnimationFrame(startScroll);
    return;
  }

  const currentHeight = scrollBoxRef.value.scrollHeight;
  // 如果当前是滚动状态，scrollHeight 是两份的高度，单份高度为一半
  // 如果是非滚动状态，scrollHeight 就是单份的高度
  const singleSetHeight = isScrollEnabled.value
    ? currentHeight / 2
    : currentHeight;
  const wrapperHeight = wrapperRef.value.clientHeight;

  // 如果单份高度小于等于容器高度，则不进行滚动展示
  isScrollEnabled.value = singleSetHeight > wrapperHeight;

  if (isScrollEnabled.value) {
    if (!hovering.value && !isPreviewing.value) {
      translateY.value += 0.4;
      if (translateY.value >= singleSetHeight) {
        translateY.value = 0;
      }
    }
  } else {
    translateY.value = 0;
  }

  rafId = requestAnimationFrame(startScroll);
};

// 监听评论数据变化，确保数据加载后能触发滚动
watch(
  () => processedComments.value,
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
  if (processedComments.value.length > 0) {
    rafId = requestAnimationFrame(startScroll);
  }
});

onBeforeUnmount(() => {
  if (rafId) cancelAnimationFrame(rafId);
});
</script>

<style scoped lang="less">
.jt-product-comments {
  background: #fff;
  margin-top: 10px;
  padding: 15px 0;
  margin-bottom: 58px;
}

.comments-list-wrapper {
  overflow: hidden;
  max-height: 460px;
  position: relative;
  padding: 0 15px;
}

.comments-scroll-box {
  width: 100%;
  will-change: transform;
  transition: none;
}

.comment-item {
  padding: 0 0 16px 0;
  margin-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
}

.comment-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;

  .user-name {
    font-size: 13px;
    font-weight: 500;
    color: #333;
  }

  .comment-time {
    font-size: 12px;
    color: #999;
  }
}

.comment-content {
  font-size: 12px;
  color: #333;
  line-height: 1.5;
  margin-bottom: 10px;
  overflow-wrap: break-word;
  word-break: keep-all;
}

.comment-images {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  img {
    width: 65px;
    height: 65px;
    object-fit: cover;
    border-radius: 4px;
    border: 1px solid #eee;
  }
}
.b-form-rating {
  border: none;
  justify-content: start;
  padding: 0;
  margin-left: 0;
  gap: 0;
  :deep(.star) {
    padding-left: 0;
  }
  :deep(.star-spacing) {
    margin: 0 4px 0 0;
  }
}
.comment-preview-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);

  .preview-container {
    position: relative;
    max-width: 90%;
    max-height: 90%;
    display: flex;
    // align-items: center;
    justify-content: center;

    img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      border-radius: 4px;
    }

    .close-btn {
      position: absolute;
      top: -40px;
      right: -10px;
      width: 32px;
      height: 32px;
      background: rgba(255, 255, 255, 0.2);
      color: #fff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      cursor: pointer;
      transition: background 0.3s;

      &:hover {
        background: rgba(255, 255, 255, 0.4);
      }
    }

    .nav-btn {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 40px;
      height: 40px;
      background: rgba(0, 0, 0, 0.5);
      color: #fff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      cursor: pointer;
      transition: background 0.3s;
      user-select: none;

      &:hover {
        background: rgba(0, 0, 0, 0.8);
      }
    }

    .prev-btn {
      left: 10px;
    }

    .next-btn {
      right: 10px;
    }

    .preview-indicators {
      position: absolute;
      bottom: -30px;
      left: 50%;
      transform: translateX(-50%);
      color: #fff;
      font-size: 14px;
      background: rgba(0, 0, 0, 0.5);
      padding: 2px 10px;
      border-radius: 12px;
    }
  }
}
</style>
