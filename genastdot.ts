import { NodeVisitor } from './utils';
import { Lexer } from './Lexer';
import { Parser, AST } from './Parser'
import { Command } from 'commander'
import commander = require('commander');
import { 
  Program, Block, Compound, Assign, NoOp, Var, BinOp, Num, Type, 
  VarDecl, Param, ProcDecl
} from './Parser'
import * as fs from 'fs'

// ts-node genastdot.ts -f 1.pas && dot -Tpng -o ast.png ast.dot
export class ASTVisualizer extends  NodeVisitor {
  head: string;
  body: Array<string>;
  footer: string;
  sequ: number;
  constructor() {
    super()
    this.head = 
    
`digraph astgraph {
  node [shape=circle, fontsize=12, fontname="Courier", height=.1];
  ranksep=.3;
  edge [arrowsize=.5]
`
    this.body = []
    this.footer = '}'
    this.sequ = 0
  }
  genNode(node: AST, label: string | number) {
    this.body.push(`  node${this.sequ} [label="${label}"]\n`)
    node.sequ = this.sequ ++
  }
  genArrow(left: AST, right: AST) {
    this.body.push(`  node${left.sequ} -> node${right.sequ}\n`)
  }
  gendot() {
    return this.head + this.body.join('') + this.footer
  }
  visit_Program(node: Program) {
    this.genNode(node, node.name)
    this.visit(node.blockNode)
    this.genArrow(node, node.blockNode)
  }
  visit_Block(node: Block) {
    this.genNode(node, 'Block')
    for (const declaraton of node.decls) {
      this.visit(declaraton)
      this.genArrow(node, declaraton)
    }
    this.visit(node.compound)
    this.genArrow(node, node.compound)
    
  }
  visit_VarDecl(node: VarDecl) {
    this.genNode(node, 'VarDecl')
    this.visit(node.type_node)
    this.visit(node.var_node)
    this.genArrow(node, node.type_node)
    this.genArrow(node, node.var_node)
  }
  visit_ProcDecl(node: ProcDecl) {
    console.log('node.name', node)
    this.genNode(node, `ProcDecl: ${node.name}`)
    for (const formalParam of node.formalParams) {
      this.visit(formalParam)
      this.genArrow(node, formalParam)
    }
    this.visit(node.blockNode)
    this.genArrow(node, node.blockNode)
  }
  visit_Param(node: Param) {
    this.genNode(node, 'Param')
    this.visit(node.var_node)
    this.visit(node.type_node)
    this.genArrow(node, node.var_node)
    this.genArrow(node, node.type_node)
  }
  visit_Compound(node: Compound) {
    this.genNode(node, 'Compund')
    for (const child of node.children) {
      this.visit(child)
      this.genArrow(node, child)
    }
  }
  visit_Assign(node: Assign) {
    this.genNode(node, 'ASSIGN')
    this.visit(node.left)
    this.visit(node.right)
    this.genArrow(node, node.left)
    this.genArrow(node, node.right)
  }
  visit_NoOp(node: NoOp) {
    this.genNode(node, 'NoOp')
  }
  visit_Var(node: Var) {
    this.genNode(node, node.value)
  }
  visit_Type(node: Type) {
    this.genNode(node, node.value)
  }
  visit_BinOp(node: BinOp) {
    this.genNode(node, node.op.value)
    this.visit(node.left)
    this.visit(node.right)

    this.genArrow(node, node.left)
    this.genArrow(node, node.right)
  }
  visit_Num(node: any) {
    this.genNode(node, node.value)
  }
}

const program = new Command('generate dot file that represent ast')
program
  .requiredOption('-f --file <string>', 'the pascal file need to be parse')
  .parse(process.argv)

const text = fs.readFileSync(program.file).toString();
const lexer = new Lexer(text)
const parser = new Parser(lexer)
const ast = parser.parse()
const visualizer = new ASTVisualizer()
visualizer.visit(ast)
const dotText = visualizer.gendot()
fs.writeFileSync('ast.dot', dotText)