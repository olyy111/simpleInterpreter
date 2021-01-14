import { NodeVisitor } from './utils'
import { Program, ProcDecl, VarDecl, Block, Compound, 
  Assign, Var,  Param, Num, Type, ProcCall, NoOp
} from './Parser'
import { SemanticError, ErrorCode, ErrorInfoType } from './error'
import { SHOULD_LOG_SCOPE } from './global'

class OriginSymbol {
  name: string;
  type?: any;
  constructor(name: string, type?: any) {
    this.name = name
    this.type = type || null
  }
  toString() {
    throw new Error('toString method need to be implemented in inherited Class')
  }
}

function getClassname(obj: object) {
  return Object.getPrototypeOf(obj).constructor.name
}

export class BuiltinTypeSymbol extends OriginSymbol {
  name: string;
  constructor(name: string) {
    super(name)
  }
  toString() {
    return `${getClassname(this)}: ${this.name}`
  }
}
export class VarSymbol extends OriginSymbol {
  name: string;
  type: BuiltinTypeSymbol;
  constructor(name: string, type: BuiltinTypeSymbol) {
    super(name, type)
  }
  toString() {
    return `${getClassname(this)}<type: ${this.type}, name: ${this.name}>`
  }
}

export class ProcSymbol extends OriginSymbol {
  name: string;
  blockNode: Block;
  formalParams: Array<Param>;
  constructor(name: string, type: any, blockNode: Block, formalParams: Array<Param>) {
    super(name)
    this.blockNode = blockNode
    this.formalParams = formalParams
  }
  toString() {
    return `${getClassname(this)}<type: ${this.type}, name: ${this.name}>`
  }
}

function log(...rest: Array<any>) {
  if (SHOULD_LOG_SCOPE) {
    console.log(...rest)
  }
}

class ScopedSymbolTable {
  enclosingScope: ScopedSymbolTable;
  scopeName: string;
  scopeLevel: number;
  tables: {[key: string]: OriginSymbol};
  constructor(scopeName: string, scopeLevel: number, enclosingScope: ScopedSymbolTable) {
    this.scopeName = scopeName
    this.scopeLevel = scopeLevel
    this.enclosingScope = enclosingScope
    this.tables = {}
  }
  insert (symbol: OriginSymbol) {
    log('Insert symbol ==>', symbol)
    this.tables[symbol.name] = symbol
  }
  lookup (symbolName: string, currentScopeOnly: boolean = false): OriginSymbol {
    log('Lookup symbol ==>', symbolName)
    const symbol = this.tables[symbolName]
    log('debug lookup symbolName, symbol', symbolName, symbol)
    if (symbol) {
      return symbol
    } else {
      if (currentScopeOnly || !this.enclosingScope) {
        return null
      } else {
        return this.enclosingScope.lookup(symbolName, currentScopeOnly)
      }
    }
  }
}

export class SemanticAnalyzer extends NodeVisitor {
  current_scope: ScopedSymbolTable;
  constructor() {
    super()
    this.current_scope = null
  }
  log() {
    
  }
  error(info: ErrorInfoType) {
    throw new SemanticError(info)
  }
  private _initBuiltins() {
    this.current_scope.insert(new BuiltinTypeSymbol('INTEGER'))
    this.current_scope.insert(new BuiltinTypeSymbol('REAL'))
  }
  visit_Program(node: Program): void {
    this.current_scope = new ScopedSymbolTable(node.name, 1, this.current_scope)
    this._initBuiltins()
    log(`Enter Program Scope '${node.name}'`)
    this.visit(node.blockNode)
    log(`Leave Program Scope '${node.name}'`)
    log(this.current_scope.tables)
    this.current_scope = this.current_scope.enclosingScope
  }
  visit_Block(node: Block): void {
    for (const decl of node.decls) {
      this.visit(decl)
    }
    this.visit(node.compound)
  }
  visit_VarDecl(node: VarDecl): void {
    const varNode = node.var_node
    const varName = varNode.value
    const typeNode = node.type_node

    if (this.current_scope.lookup(varName, true)) {
      this.error({
        errorCode: ErrorCode.duplicateID,
        token: varNode.token
      })
    }
    const typeSymbol = this.current_scope.lookup(typeNode.value)
    const varSymbol = new VarSymbol(varName, typeSymbol as BuiltinTypeSymbol)
    this.current_scope.insert(varSymbol)
  }
  visit_ProcDecl(node: ProcDecl): void {
    const procSymbol = new ProcSymbol(node.name, null, node.blockNode, node.formalParams)
    this.current_scope.insert(procSymbol)
    const procScope = new ScopedSymbolTable(
      node.name, 
      this.current_scope.scopeLevel + 1,
      this.current_scope
    )
    log('Enter Procdure Scope:', node.name)
    this.current_scope = procScope
    node.formalParams.forEach(param => { this.visit(param) })
    this.visit(node.blockNode)

    log('Leave Procedure Scope:', node.name)
    log(this.current_scope.tables)
    this.current_scope = this.current_scope.enclosingScope
  }
  visit_ProcCall(node: ProcCall) {
    const procSymbol: ProcSymbol = this.current_scope.lookup(node.name) as ProcSymbol
    node.setProcSymbol(procSymbol as ProcSymbol)
    console.log('node', node)
    if (procSymbol.formalParams.length !== node.actualParams.length) {
      this.error({
        msg: '参数长度错误'
      })
    }
    
  }
  visit_Compound(node: Compound): void {
    node.children.forEach(childNode => { this.visit(childNode) })
  }
  visit_Var(node: Var): void {
    
  }
  visit_Assign(node: Assign) {

  }
  visit_NoOp(node: NoOp) {
    
  }
  visit_Param(node: Param): void {
    const varNode = node.var_node
    const varName = varNode.value
    const typeNode = node.type_node

    if (this.current_scope.lookup(varName, true)) {
      this.error({
        errorCode: ErrorCode.duplicateID,
        token: varNode.token
      })
    }
    const typeSymbol = this.current_scope.lookup(typeNode.value)
    const varSymbol = new VarSymbol(varName, typeSymbol as BuiltinTypeSymbol)
    this.current_scope.insert(varSymbol)
  }
  visit_Num(node: Num): void {
    
  }
}
