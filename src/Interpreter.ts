import { NodeVisitor } from './utils'
import { TokenType } from './Lexer'
import { 
  Program, Block, Compound, VarDecl,  ProcDecl,
  Assign, BinOp, Num, Type, Var, NoOp, ProcCall
} from './Parser'
import { SHOULD_LOG_STACK } from './global'

function log(...rest: Array<any>) {
  if (SHOULD_LOG_STACK) {
    console.log(...rest)
  }
}

class CallStack {
  ars: Array<ActiveRecord>
  constructor() {
    this.ars = []
  }
  push(ar: ActiveRecord): void {
    this.ars.push(ar)
  }
  pop(): ActiveRecord {
    return this.ars.pop()
  }
  peek(): ActiveRecord {
    return this.ars[this.ars.length - 1]
  }
  toString() {
    return this.ars.toString()
  }
}

enum ARType {
  procedure = 'procedure',
  program = 'program'
}

class ActiveRecord {
  memory: {[key: string]: any}
  name: string;
  type: ARType;
  constructor(name: string, type: ARType) {
    this.name = name
    this.type = type
    this.memory = {}
  }
  get(varName: string) {
    return Reflect.get(this.memory, varName)
  }
  set(varName: string, value: any) {
    Reflect.set(this.memory, varName, value)
  }
}



export class Interpreter extends NodeVisitor {
  callStack: CallStack;
  constructor() {
    super()
    this.callStack = new CallStack()
  }
  visit_Program(node: Program) {
    const ar = new ActiveRecord(node.name, ARType.program)
    this.callStack.push(ar)
    log(`Enter stack: ${node.name}`)
    log(this.callStack.ars)
    
    this.visit(node.blockNode)

    log(`Leave stack: ${node.name}`)
    log(this.callStack.ars)
    this.callStack.pop()
  }
  visit_Block(node: Block) {
    node.decls.forEach(decl => { this.visit(decl) })
    this.visit(node.compound)
  }
  visit_ProcDecl(node: ProcDecl) {
    // this.visit(node)
  }
  visit_ProcCall(node: ProcCall) {
    const ctx = this
    const blockNode = node.procSymbol.blockNode;
    const formalParams = node.procSymbol.formalParams
    const ar = new ActiveRecord(node.name, ARType.procedure)
    log(`Enter stack: ${node.name}`)
    log(this.callStack.ars)
     
    node.actualParams.forEach((actualParam, index) => {
      const formalParam = formalParams[index]
      ar.set(formalParam.var_node.value, ctx.visit(actualParam))
    })

    this.callStack.push(ar)
    this.visit(node.procSymbol.blockNode)
    
    log(`Leave stack: ${node.name}`)
    log(this.callStack.ars)
    this.callStack.pop()
  }
  visit_VarDecl(node: VarDecl) {
    // this.visit(node)
  }
  visit_Compound(node: Compound) {
    node.children.forEach(stmt => this.visit(stmt))
  }
  visit_Assign(node: Assign) {
    const ar = this.callStack.peek()
    ar.set(node.left.value, this.visit(node.right))
  }
  visit_BinOp(node: BinOp) {
    if (node.op.type === TokenType.PLUS.type) {
      return this.visit(node.left) + this.visit(node.right)
    }
    else if (node.op.type === TokenType.MINUS.type) {
      return this.visit(node.left) - this.visit(node.right)
    }
    else if (node.op.type === TokenType.MUL.type) {
      return this.visit(node.left) * this.visit(node.right)
    }
    else if (node.op.type === TokenType.DIV.type) {
      return this.visit(node.left) / this.visit(node.right)
    }
  }
  visit_Var(node: Var): number {
    const ar = this.callStack.peek()
    return ar.get(node.value)
  }
  visit_Num(node: Num): number {
    return parseInt(node.value)
  }
  visit_NoOp(node: NoOp) {}
}

