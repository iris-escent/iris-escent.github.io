// 应过滤掉的非内容标签（状态标签、结构标签等）
const IGNORED_TAGS = ['已发布', '未发布', '草稿'];
const IGNORED_PATTERNS = [
  /^\d+\.\s/, // 以数字编号开头的结构标签，如 "5. 论点/案例"
];

// 辅助函数：删除所有 emoji
function removeEmoji(str: string): string {
  // eslint-disable-next-line no-control-regex
  return str.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F900}-\u{1F9FF}]|[\u{1F1E0}-\u{1F1FF}]/gu, '');
}

// 清理标签：删除 emoji、删除 # 前缀、转小写、去除首尾空格
function cleanTag(tag: string): string {
  return removeEmoji(tag).replace(/^#+/, '').toLowerCase().trim();
}

// 判断是否为应过滤的标签
function shouldIgnore(tag: string): boolean {
  if (IGNORED_TAGS.includes(tag)) return true;
  return IGNORED_PATTERNS.some((pattern) => pattern.test(tag));
}

// 核心转换逻辑：将层级标签转换为扁平标签数组
function tagToArray(tag: string): string[] {
  if (shouldIgnore(tag)) return [];

  // post/xxx → 只保留子标签
  if (tag.startsWith('post/')) {
    return [tag.slice(5)];
  }

  // ai/xxx → 只保留 ai
  if (tag.startsWith('ai/')) {
    return ['ai'];
  }

  // 这世界/二级/三级 → 保留所有子级标签（去掉"这世界"）
  if (tag.startsWith('这世界/')) {
    const parts = tag.split('/').slice(1).filter(Boolean);
    return parts.length > 0 ? parts : [];
  }

  // pkm/二级/三级 → 保留 pkm + 所有子级
  if (tag.startsWith('pkm/')) {
    const parts = tag.split('/').filter(Boolean);
    return parts;
  }

  // tool/xxx → 保留 tool + 子级
  if (tag.startsWith('tool/')) {
    const parts = tag.split('/').filter(Boolean);
    return parts;
  }

  // 我的/xxx → 只保留子标签
  if (tag.startsWith('我的/')) {
    const parts = tag.split('/').slice(1).filter(Boolean);
    return parts.length > 0 ? parts : [];
  }

  // ref/xxx → 只保留子标签
  if (tag.startsWith('ref/')) {
    return [tag.slice(4)];
  }

  // 工作/xxx → 只保留子标签
  if (tag.startsWith('工作/')) {
    return [tag.slice(3)];
  }

  // 新知/xxx → 只保留子标签
  if (tag.startsWith('新知/')) {
    return [tag.slice(3)];
  }

  // area/xxx → 只保留子标签
  if (tag.startsWith('area/')) {
    return [tag.slice(5)];
  }

  // 其他含 / 的标签 → 拆分为独立标签（如 经济/商业 → 经济、商业）
  if (tag.includes('/')) {
    return tag.split('/').filter(Boolean);
  }

  // 无层级的普通标签，直接返回
  return [tag];
}

// 向后兼容：返回单个标签（用于链接等场景）
export function formatTag(tag: string): string {
  if (!tag || typeof tag !== 'string') return tag;

  const cleaned = cleanTag(tag);
  const result = tagToArray(cleaned);
  return result[0] || cleaned;
}

// 转换标签，可能返回多个标签
export function transformTag(tag: string): string[] {
  if (!tag || typeof tag !== 'string') return [tag];

  return tagToArray(cleanTag(tag));
}

// 批量处理标签数组并去重
export function processTags(tags: string[]): string[] {
  if (!Array.isArray(tags) || !tags.length) return [];

  const formattedTags = tags.flatMap((tag) => transformTag(tag));
  return [...new Set(formattedTags)];
}
