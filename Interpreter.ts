import { NodeVisitor } from './utils'
import { TokenType } from './Lexer'
import { 
  Program, Block, Compound, VarDecl,  ProcDecl,
  Assign, BinOp, Num, Type, Var, NoOp
} from './Parser'
export class Interpreter extends NodeVisitor {
  GlobalMem: object;
  constructor() {
    super()
    this.GlobalMem = {}
  }
  visit_Program(node: Program) {
    this.visit(node.blockNode)
  }
  visit_Block(node: Block) {
    node.decls.forEach(decl => { this.visit(decl) })
    this.visit(node.compound)
  }
  visit_ProcDecl(node: ProcDecl) {
    // this.visit(node)
  }
  visit_VarDecl(node: VarDecl) {
    // this.visit(node)
  }
  visit_Compound(node: Compound) {
    node.children.forEach(stmt => this.visit(stmt))
  }
  visit_Assign(node: Assign) {
    this.GlobalMem[node.left.value] = this.visit(node.right)
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
    return this.GlobalMem[node.value]
  }
  visit_Num(node: Num): number {
    return parseInt(node.value)
  }
  visit_NoOp(node: NoOp) {}
}