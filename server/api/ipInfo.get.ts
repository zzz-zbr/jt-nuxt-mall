export default defineEventHandler(async (event) => {
  const getHeaderValue = (name: string) => {
    const val = getHeader(event, name);
    return val === '' ? undefined : val;
  };

  // 1. 获取所有 Header 用于调试（仅在开发或手动查看时有用）
  const allHeaders = getHeaders(event);
  
  // 2. 获取 IP
  // 在本地开发环境下，ip 可能是 127.0.0.1 或 ::1，我们需要尝试获取真实 IP
  let ip = getHeaderValue('cf-connecting-ip') || 
           getHeaderValue('x-real-ip') || 
           getHeaderValue('x-forwarded-for')?.split(',')[0].trim() || 
           '127.0.0.1';

  // 3. 尝试多种方式获取 Cloudflare 特有对象
  const cf = (event.context.cloudflare as any)?.request?.cf || 
             (event.context.cloudflare as any)?.cf;

  // 4. 如果没有 Cloudflare 信息且处于开发模式或 IP 是本地回环，尝试外部 API 兜底
  let fallbackData: any = null;
  const isLocalIp = ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.');
  
  if (!cf && (process.dev || isLocalIp || !getHeaderValue('cf-ipcountry'))) {
    try {
      // 使用 ipapi.co 作为兜底（无需 API Key 的免费额度）
      // 如果是本地 IP，不传 IP 参数，API 会返回当前出口公网 IP 的信息
      const lookupIp = isLocalIp ? '' : ip;
      fallbackData = await $fetch(`https://ipapi.co/${lookupIp}/json/`).catch(() => null);
    } catch (e) {
      console.error('IP Fallback fetch failed:', e);
    }
  }

  // 5. 构建返回对象
  const info = {
    ip: fallbackData?.ip || ip,
    country: getHeaderValue('cf-ipcountry') || cf?.country || fallbackData?.country_name || (process.dev ? 'LOCAL_COUNTRY' : ''),
    region: getHeaderValue('cf-region') || getHeaderValue('cf-region-code') || cf?.region || fallbackData?.region || (process.dev ? 'LOCAL_REGION' : ''),
    city: getHeaderValue('cf-ipcity') || cf?.city || fallbackData?.city || (process.dev ? 'LOCAL_CITY' : ''),
    postalCode: getHeaderValue('cf-postal-code') || cf?.postalCode || fallbackData?.postal || (process.dev ? '000000' : ''),
    continent: getHeaderValue('cf-ipcontinent') || cf?.continent || fallbackData?.continent_code || (process.dev ? 'LOCAL_CONTINENT' : ''),
    timezone: cf?.timezone || fallbackData?.timezone || (process.dev ? 'UTC' : ''),
    lang: cf?.lang || fallbackData?.languages?.split(',')[0] || (process.dev ? 'zh-CN' : ''),
    isDev: process.dev,
  };

  return info;
});
