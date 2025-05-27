# Bug修复备忘录

## 2025-01-27: Jest测试环境crypto模块问题

### 问题描述
在Jest测试环境中，Node.js的`crypto`模块无法正常工作，导致平台模板管理器测试失败。

**错误信息：**
```
TypeError: Cannot read properties of undefined (reading 'createHash')
at PlatformTemplateManager.generateCacheKey (src/services/platform-template-manager.ts:544:25)
```

### 根本原因
1. Jest默认运行在`jsdom`环境中，该环境不包含Node.js的`crypto`模块
2. `platform-template-manager.ts`中使用了`crypto.createHash('md5')`来生成缓存键
3. 测试环境中`crypto`对象为`undefined`

### 解决方案

#### 1. 创建crypto模块的mock
创建文件：`src/__mocks__/crypto.ts`

```typescript
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
```

#### 2. 更新Jest配置
在`jest.config.js`中添加模块映射：

```javascript
moduleNameMapper: {
  '^obsidian$': '<rootDir>/src/__mocks__/obsidian.ts',
  '^crypto$': '<rootDir>/src/__mocks__/crypto.ts',  // 新增
},
```

### 验证结果
- ✅ 所有平台模板管理器测试通过（38/38）
- ✅ crypto相关功能正常工作
- ✅ 缓存键生成功能正常
- ✅ 没有影响其他测试

### 技术细节
1. **Mock实现原理**：使用简单的字符串哈希算法替代MD5
2. **兼容性**：保持与原始crypto API相同的接口
3. **测试友好**：生成确定性的哈希值，便于测试验证

### 相关文件
- `src/__mocks__/crypto.ts` - crypto模块mock实现
- `jest.config.js` - Jest配置更新
- `src/services/platform-template-manager.ts` - 使用crypto的源文件
- `src/tests/platform-template-manager.test.ts` - 相关测试文件

### 经验教训
1. **环境差异**：注意Jest测试环境与Node.js运行环境的差异
2. **模块Mock**：对于环境特定的模块，需要提供适当的mock
3. **测试策略**：确保mock实现足够简单但功能完整
4. **文档记录**：重要的环境配置问题需要详细记录

### 后续优化建议
1. 考虑使用更轻量级的哈希库（如`hash-sum`）替代Node.js crypto
2. 为其他可能的Node.js特定模块准备mock
3. 建立测试环境配置的标准化流程

---

 