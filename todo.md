## Lexer
- [x] 建立token的类
  - [x] token弃用enum, 改用对象表示
- [x] 建立lexer类
  - [x] id
  - [x] number
  - [x] single character
  - [x] space
  - [x] comment
  - [x] token 加 position

## Parser
- [x] 建立基础四则运算的parser
  - [x] 解析成AST
  - [x] ast dot生成器
- [x] program block compound 解析
- [x] declaration
  - [x] Var
  - [x] Procedure
    - [x] Procedure的定义
    - [x] 调用Procedure

## Symbol
- [x] Symbol
  - [x] BuiltinTypeSymbol
  - [x] VarSymbol
  - [x] ProcedureSymbol
- [x] scope
  - [x] 实现scope类

## AST
都有哪些AST种类?
terminal wrapper: Var/Type/Num
non-terminal: 

## SemanticAnalyzer
- [x] 实现各个AST节点的visit方法
  - [x] program
    - [x] 先构建一个最简单的program 的 scope
  - [x] procedure define
    - [x] 构建scope
    - [x] 构建scope chain
  - [x] procedure call
    - [x] 在semantic analysis 的时候分析出他所对应的procSymbol
- [ ] 语义检查
  - [x] 参数个数不一样, ❌
## Interpreter
  - [x] 支持四则混合运算
  - [ ] 运行时构建stack
    - [ ] 创建CallStack, ActiveRecord定义

## 其余
- [x] 实现错误分类: ParserError, SemanticError, LexerError等
- [x] 控制stack和scope的log打印开关
- [ ] 继承的lookup typescript实现