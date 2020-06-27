import { NodeVisitor } from './utils'
import { Program, ProcDecl, VarDecl, Block, Compound, Assign, Var,  Param, Num, Type} from './Parser'
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

class BuiltinTypeSymbol extends OriginSymbol {
  name: string;
  constructor(name: string) {
    super(name)
  }
  toString() {
    return `${getClassname(this)}: ${this.name}`
  }
}
class VarSymbol extends OriginSymbol {
  name: string;
  type: BuiltinTypeSymbol;
  constructor(name: string, type: BuiltinTypeSymbol) {
    super(name, type)
  }
  toString() {
    return `${getClassname(this)}<type: ${this.type}, name: ${this.name}>`
  }
}

class ProcSymbol extends OriginSymbol {
  name: string;
  constructor(name: string, type: any) {
    super(name)
  }
  toString() {
    return `${getClassname(this)}<type: ${this.type}, name: ${this.name}>`
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
    console.log('Insert symbol ==>', symbol)
    this.tables[symbol.name] = symbol
  }
  lookup (symbolName: string, currentScopeOnly: boolean = false): OriginSymbol {
    console.log('Lookup symbol ==>', symbolName)
    const symbol = this.tables[symbolName]
    console.log('debug lookup symbolName, symbol', symbolName, symbol)
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
  error(msg: string) {
    throw new Error(msg)
  }
  private _initBuiltins() {
    this.current_scope.insert(new BuiltinTypeSymbol('INTEGER'))
    this.current_scope.insert(new BuiltinTypeSymbol('REAL'))
  }
  visit_Program(node: Program): void {
    this.current_scope = new ScopedSymbolTable(node.name, 1, this.current_scope)
    this._initBuiltins()
    console.log(`Enter Program Scope '${node.name}'`)
    this.visit(node.blockNode)
    console.log(`Leave Program Scope '${node.name}'`)
    console.log(this.current_scope.tables)
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
      this.error(`Duplicate identifier found '${varName}'`)
    }
    const typeSymbol = this.current_scope.lookup(typeNode.value)
    const varSymbol = new VarSymbol(varName, typeSymbol as BuiltinTypeSymbol)
    this.current_scope.insert(varSymbol)
  }
  visit_ProcDecl(node: ProcDecl): void {
    const procSymbol = new ProcSymbol(node.name, null)
    this.current_scope.insert(procSymbol)
    const procScope = new ScopedSymbolTable(
      node.name, 
      this.current_scope.scopeLevel + 1,
      this.current_scope
    )
    console.log('Enter Procdure Scope:', node.name)
    this.current_scope = procScope
    node.formalParams.forEach(param => { this.visit(param) })
    this.visit(node.blockNode)

    console.log('Leave Procedure Scope:', node.name)
    console.log(this.current_scope.tables)
    this.current_scope = this.current_scope.enclosingScope
  }
  visit_Compound(node: Compound): void {

  }
  visit_Var(node: Var): void {
    
  }
  visit_Param(node: Param): void {
    const varNode = node.var_node
    const varName = varNode.value
    const typeNode = node.type_node

    if (this.current_scope.lookup(varName, true)) {
      this.error(`Duplicate identifier found '${varName}'`)
    }
    const typeSymbol = this.current_scope.lookup(typeNode.value)
    const varSymbol = new VarSymbol(varName, typeSymbol as BuiltinTypeSymbol)
    this.current_scope.insert(varSymbol)
  }
  visit_Num(node: Num): void {
    
  }
}
