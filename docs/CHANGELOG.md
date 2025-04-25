# Changelog

## [Unreleased]

### Fixed
- TOM-19: 修复了单元测试问题
  - 修复了 SettingsManager 的设置验证测试
  - 完善了 Obsidian API 的 mock 实现
  - 提高了测试覆盖率到 62.23%
  - 修复了 main.test.ts 中的依赖问题

### Changed
- 优化了 SettingsManager 的验证逻辑
- 添加了用于测试的辅助方法 setSettingsForTesting

### Added
- 完善了测试用例的 mock 实现
  - 添加了 ItemView 类的 mock
  - 添加了 Plugin 类的完整 mock
  - 添加了 workspace 相关方法的 mock 