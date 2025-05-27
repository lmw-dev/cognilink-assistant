/**
 * 哈希工具函数
 * 在测试环境中使用简单的字符串哈希，在生产环境中使用crypto
 */

/**
 * 生成字符串的MD5哈希
 */
export function createHash(input: string): string {
  // 在测试环境中使用简单的哈希函数
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
    return simpleHash(input);
  }

  // 在生产环境中使用crypto
  try {
    const crypto = require('crypto');
    return crypto.createHash('md5').update(input).digest('hex');
  } catch (error) {
    // 如果crypto不可用，回退到简单哈希
    return simpleHash(input);
  }
}

/**
 * 简单的字符串哈希函数（用于测试环境）
 */
function simpleHash(str: string): string {
  let hash = 0;
  if (str.length === 0) return hash.toString(16);
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 转换为32位整数
  }
  
  return Math.abs(hash).toString(16);
} 