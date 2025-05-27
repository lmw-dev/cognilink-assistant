/**
 * 平台模板相关类型定义
 * 用于模板渲染和上下文管理
 */

import { PlatformId, UserPreferences } from './social-media';

// 模板渲染上下文接口
export interface TemplateRenderContext {
  topic: string;
  relevantContent: string;
  userPreferences: UserPreferences;
  platform: string;
  maxLength: string;
  styleKeywords: string;
  [key: string]: any; // 允许额外的上下文变量
}

// 平台模板接口（重新导出以避免循环依赖）
export interface PlatformTemplate {
  id: PlatformId;
  name: string;
  maxLength: number;
  systemPrompt: string;
  userTemplate: string;
  styleKeywords: string[];
  requiredElements: string[];
  formatRules: any; // 从 social-media.ts 导入
  validationRules?: any;
  metadata?: any;
}

// 渲染后的模板接口
export interface RenderedTemplate {
  systemPrompt: string;
  userPrompt: string;
  metadata: {
    platformId: PlatformId;
    templateVersion: string;
    renderTime: Date;
    contextHash: string;
    placeholdersReplaced: string[];
    warnings: string[];
  };
} 