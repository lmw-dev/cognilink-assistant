/**
 * Crypto module mock for Jest testing environment
 * 为Jest测试环境提供crypto模块的简单实现
 */

export default {
  createHash: (algorithm: string) => ({
    update: (data: string) => ({
      digest: (encoding: string) => {
        // 简单的哈希实现，用于测试
        let hash = 0;
        for (let i = 0; i < data.length; i++) {
          const char = data.charCodeAt(i);
          hash = ((hash << 5) - hash) + char;
          hash = hash & hash; // 转换为32位整数
        }
        
        // 转换为十六进制字符串
        const hexHash = Math.abs(hash).toString(16);
        
        // 确保返回固定长度的哈希（模拟MD5的32字符长度）
        return hexHash.padStart(8, '0').repeat(4).substring(0, 32);
      }
    })
  })
}; 