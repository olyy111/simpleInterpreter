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
- [ ] declaration
  - [x] Var
  - [ ] Procedure
    - [x] Procedure的定义
    - [ ] 调用Procedure

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
  - [x] procedure
    - [x] 构建scope
    - [x] 构建scope chain
## Interpreter
  - [x] 支持四则混合运算
  - [ ] 运行时构建stack
