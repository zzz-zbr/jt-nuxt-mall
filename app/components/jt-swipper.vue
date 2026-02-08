<template>
  <div class="swiper jt-swiper" ref="containerRef" @silde-change="slideChange">
    <!-- Additional required wrapper -->
    <div class="swiper-wrapper">
      <!-- Slides -->
      <div
        class="swiper-slide"
        v-for="(item, index) in localSources"
        :key="item.realIndex || index"
      >
        <div class="jt-wrapper">
          <img
            v-if="item.type === 'image' || !item.type"
            class="slider-image"
            :src="item.src"
            :alt="item.alt || ''"
            loading="lazy"
          />
          <!-- 视频以海报 + 播放按钮的方式渲染，点击时在浮层全屏播放（模拟淘宝行为） -->
          <div v-else class="video-poster-wrapper">
            <img
              class="slider-image"
              :src="item.poster || item.src"
              :alt="item.alt || ''"
            />
            <button class="play-btn" @click="openFullscreenVideo(index, item)">
              <svg
                viewBox="0 0 64 64"
                width="40"
                height="40"
                aria-hidden="true"
              >
                <path d="M16 12v40l36-20z" fill="currentColor" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 全屏浮层（淘宝式播放） -->
    <div
      v-if="fullscreenVideoShow"
      class="fullscreen-video"
      role="dialog"
      aria-modal="true"
    >
      <img
        src="../assets/svg/close.svg"
        class="fullscreen-close"
        alt=""
        @click="closeFullscreenVideo"
      />
      <video
        ref="fullscreenVideoRef"
        controls
        playsinline
        :src="fullscreenVideoSrc"
        :type="fullscreenVideoMime"
      ></video>
    </div>
  </div>
</template>

<script setup>
import Swiper from "swiper";
import "swiper/css";
import { debounce } from "lodash";
const props = defineProps({
  sources: { type: Array, default: () => [] },
});

// local copy of sources so we can attach generated poster images
const localSources = ref([]);

const makeLocalSources = (srcs) => {
  localSources.value = (srcs || []).map((s) => ({ ...s }));
};

// extract first frame from video URL as dataURL; returns null on failure
const extractFirstFrame = async (url) => {
  return new Promise((resolve) => {
    try {
      const v = document.createElement("video");
      v.crossOrigin = "anonymous";
      v.preload = "metadata";
      v.muted = true;
      v.playsInline = true;
      v.src = url;
      const cleanup = () => {
        v.pause();
        v.src = "";
        v.load && v.load();
      };
      const onError = () => {
        cleanup();
        resolve(null);
      };
      v.addEventListener("error", onError);
      v.addEventListener(
        "loadedmetadata",
        () => {
          // seek to small time to ensure frame available
          const target = Math.min(0.1, (v.duration && v.duration / 2) || 0.1);
          const onSeeked = () => {
            try {
              const canvas = document.createElement("canvas");
              canvas.width = v.videoWidth || 320;
              canvas.height = v.videoHeight || 180;
              const ctx = canvas.getContext("2d");
              ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
              const data = canvas.toDataURL("image/jpeg", 0.85);
              v.removeEventListener("error", onError);
              cleanup();
              resolve(data);
            } catch (err) {
              v.removeEventListener("error", onError);
              cleanup();
              resolve(null);
            }
          };
          const seekTry = () => {
            try {
              v.currentTime = target;
            } catch (e) {
              // some browsers may throw; fallback
              resolve(null);
            }
          };
          v.addEventListener("seeked", onSeeked, { once: true });
          seekTry();
        },
        { once: true },
      );
    } catch (e) {
      resolve(null);
    }
  });
};

const generatePostersForVideos = async () => {
  const tasks = [];
  localSources.value.forEach((it, idx) => {
    if (
      (it.type === "video" ||
        (it.src && /\.(mp4|webm|ogg)(\?|$)/i.test(it.src))) &&
      !it.poster
    ) {
      tasks.push(
        (async () => {
          const data = await extractFirstFrame(it.src);
          if (data) {
            it.poster = data;
          }
        })(),
      );
    }
  });
  await Promise.all(tasks);
};
const containerRef = ref();
const swiper = ref(null);
const initSwiper = () => {
  if (swiper.value) {
    swiper.value.destroy();
  }
  nextTick(() => {
    if (containerRef.value) {
      swiper.value = new Swiper(containerRef.value, {
        observer: true,
        observeParents: true,
        on: {
          slideChange: debounce(sliderMove, 150),
        },
      });
    }
  });
};

onMounted(() => {
  makeLocalSources(props.sources);
  if (props.sources && props.sources.length > 0) {
    // try to generate posters, then init swiper
    generatePostersForVideos().finally(() => initSwiper());
  } else {
    initSwiper();
  }
});

watch(
  () => props.sources,
  (newSources) => {
    makeLocalSources(newSources);
    if (newSources && newSources.length > 0) {
      generatePostersForVideos().finally(() => initSwiper());
    } else {
      initSwiper();
    }
  },
  { deep: true },
);
const clickSwiper = (item, index) => {
  swiper.value.slideTo(index);
};

const onVideoPlay = (index) => {
  // 播放时暂停其它视频，避免多个视频同时播放
  const videos = document.querySelectorAll(".jt-swiper video");
  videos.forEach((v) => {
    const idx = parseInt(v.dataset.index, 10);
    if (!Number.isNaN(idx) && idx !== index) {
      try {
        v.pause();
      } catch (e) {}
    }
  });
};

// 全屏浮层视频播放（淘宝式）
const fullscreenVideoSrc = ref("");
const fullscreenVideoMime = ref("video/mp4");
const fullscreenVideoShow = ref(false);
const fullscreenVideoRef = ref(null);

const openFullscreenVideo = (index, item) => {
  fullscreenVideoSrc.value = item.src;
  fullscreenVideoMime.value = item.mimeType || "video/mp4";
  fullscreenVideoShow.value = true;
  // pause swiper autoplay or interactions
  if (swiper.value && swiper.value.autoplay)
    swiper.value.autoplay.stop && swiper.value.autoplay.stop();
  nextTick(() => {
    try {
      fullscreenVideoRef.value && fullscreenVideoRef.value.play();
    } catch (e) {}
  });
};

const closeFullscreenVideo = () => {
  try {
    fullscreenVideoRef.value && fullscreenVideoRef.value.pause();
  } catch (e) {}
  fullscreenVideoShow.value = false;
  fullscreenVideoSrc.value = "";
  if (swiper.value && swiper.value.autoplay)
    swiper.value.autoplay.start && swiper.value.autoplay.start();
};

onMounted(() => {
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && fullscreenVideoShow.value) closeFullscreenVideo();
  });
});

const emit = defineEmits(["sliderMove"]);
const sliderMove = (swiper) => {
  emit("sliderMove", swiper);
};
defineExpose({
  clickSwiper,
});
</script>

<style lang="less" scoped>
.jt-swiper {
  width: 100%;
  aspect-ratio: 1 / 1; // 设置默认宽高比，防止页面跳动
  overflow: hidden;
  background-color: #f0f0f0; // 默认占位背景色

  .jt-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }
}

.swiper-slide {
  overflow: hidden;
  display: flex;
  align-items: center;
}

.slider-image {
  width: 100%;
  height: 100%;
  object-fit: cover; // 改为 cover 以填满容器，避免拉伸
  transition: transform 0.3s ease;
}

.slider-media {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.video-poster-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.video-poster-wrapper .slider-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.play-btn {
  position: absolute;
  z-index: 3;
  background: rgba(0, 0, 0, 0.45);
  border: none;
  color: #fff;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 全屏浮层视频 */
.fullscreen-video {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.85);
  z-index: 9999;
}

.fullscreen-video video {
  width: 100%;
  height: 100%;
  object-fit: contain;
  max-width: 100vw;
  max-height: 100vh;
}

.fullscreen-close {
  position: absolute;
  right: 12px;
  top: 12px;
  z-index: 10000;
  width: 32px;
  border: none;
  color: #fff;
  cursor: pointer;
  border-radius: 6px;
}
</style>
