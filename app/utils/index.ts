/**
 * 防抖函数
 */
function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number,
    immediate = false
): (this: ThisParameterType<T>, ...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;

    return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
        const context = this;

        if (immediate && !timeout) {
            func.apply(context, args);
        }

        if (timeout !== null) {
            clearTimeout(timeout);
        }

        timeout = setTimeout(() => {
            timeout = null;
            if (!immediate) {
                func.apply(context, args);
            }
        }, wait);
    };
};
/**
 * 获取真实的图片地址
 */
function getRealImgUrl(url: string) {
    if(!url) return '';
    return url.split('#ossid#').length ? url.split('#ossid#')[1] : url
}

/**
 * 判断两个对象一致
 * 
 */
function isSimpleObjectEqual(obj1: any, obj2: any) {
  // 先判断是否为对象
  if (typeof obj1 !== 'object' || obj1 === null || 
      typeof obj2 !== 'object' || obj2 === null) {
    return obj1 === obj2;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  // key数量不同
  if (keys1.length !== keys2.length) return false;

  // 遍历比较每个key和value
  for (const key of keys1) {
    if (!obj2.hasOwnProperty(key) || obj1[key] !== obj2[key]) {
      return false;
    }
  }

  return true;
}
 /**
 * 构造树型结构数据
 * @param {*} data 数据源
 * @param {*} id id字段 默认 'id'
 * @param {*} parentId 父节点字段 默认 'parentId'
 * @param {*} children 孩子节点字段 默认 'children'
 */
const handleTree = <T>(data: any[], id?: string, parentId?: string, children?: string): T[] => {
  const config: {
    id: string;
    parentId: string;
    childrenList: string;
  } = {
    id: id || 'id',
    parentId: parentId || 'parentId',
    childrenList: children || 'children'
  };

  const childrenListMap: any = {};
  const tree: T[] = [];
  for (const d of data) {
    const id = d[config.id];
    childrenListMap[id] = d;
    if (!d[config.childrenList]) {
      d[config.childrenList] = [];
    }
  }

  for (const d of data) {
    const parentId = d[config.parentId];
    const parentObj = childrenListMap[parentId];
    if (!parentObj) {
      tree.push(d);
    } else {
      parentObj[config.childrenList].push(d);
    }
  }
  return tree;
};

export { debounce, getRealImgUrl, isSimpleObjectEqual, handleTree }

