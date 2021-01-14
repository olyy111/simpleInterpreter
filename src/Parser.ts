import {Lexer, Token, TokenType} from './Lexer';
import { ProcSymbol } from './symbol';
import { ParserError } from './error'

export class AST {
  [key: string]: any
}

export class Program extends AST {
  name: string;
  blockNode: Block;
  constructor(name: string, blockNode: Block) {
    super()
    this.name = name
    this.blockNode = blockNode
  }
}
export class Block extends AST {
  compound:  Compound;
  decls: Array<VarDecl | ProcDecl>
  constructor(compound: Compound, decls: Array<any>) {
    super()
    this.compound = compound
    this.decls = decls
  }
}
export class VarDecl extends AST {
  var_node: Var;
  type_node: Type;
  constructor(type_node: Type, var_node: Var) {
    super()
    this.type_node = type_node
    this.var_node = var_node
  }
}

export class ProcDecl extends AST {
  name: string;
  formalParams: Array<Param>;
  blockNode: Block;
  constructor(name: string, formalParams: Array<Param>, blockNode: Block) {
    super()
    this.name = name
    this.formalParams = formalParams
    this.blockNode = blockNode
  }
}

export class ProcCall extends AST {
  name: string;
  actualParams: Array<any>;
  procSymbol: ProcSymbol;
  constructor(name: string, actualParams: Array<any>) {
    super()
    this.name = name
    this.actualParams = actualParams
  }
  setProcSymbol(symbol: ProcSymbol) {
    this.procSymbol = symbol
  }
}

export class Param extends AST {
  var_node:  Var;
  type_node: Type;
  constructor(type_node: Type, var_node: Var) {
    super()
    this.type_node = type_node
    this.var_node = var_node
  }
}

export class Compound extends AST {
  children: Array<AST>;
  constructor(children: Array<AST>) {
    super()
    this.children = children
  }
}

export class Assign extends AST {
  left: Var;
  right: BinOp;
  constructor(left: Var, right: BinOp) {
    super()
    this.left = left
    this.right = right
  }
}
export class Var extends AST {
  token: Token;
  value: any;
  constructor(token: Token) {
    super()
    this.token = token
    this.value = token.value
  }
}
export class Type extends AST {
  token: Token;
  value: any;
  constructor(token: Token) {
    super()
    this.token = token
    this.value = token.value
  }
}
export class NoOp extends AST {}
export class BinOp extends AST {
  left: Var
  right: any
  op: Token
  constructor(left: Var, right: any, op: Token) {
    super()
    this.left = left
    this.right = right
    this.op = op
  }
}

export class Num extends AST {
  token: Token
  value: string
  constructor(token: Token) {
    super()
    this.token = token
    this.value = token.value
  }
}
export class Parser {
  lexer: Lexer
  currentToken: Token
  constructor(lexer: Lexer) {
    this.lexer = lexer
    this.currentToken = this.lexer.getNextToken()
  }
  error(msg: string) {
    throw new ParserError({msg})

  }
  eat(type: string) {
    if (this.currentToken.type === type) {
      const token = this.currentToken
      this.currentToken = this.lexer.getNextToken()
      return token
    } else {
      this.error(`Unexpected Token ${this.currentToken}, Expect token type ${type}`)
    }
  }
  program() {
    /**
     *  PROGRAM ID SEMI block DOT
     */
    this.eat(TokenType.PROGRAM.type)
    const name = this.eat(TokenType.ID.type).value
    this.eat(TokenType.SEMI.type)
    const blockNode = this.block()
    this.eat(TokenType.DOT.type)
    return new Program(name, blockNode)
  }
  block() { // decls compound
    const decls = this.decls()
    const compound = this.compound()
    return new Block(compound, decls)
  }
  decls() {
    let decls = []
    while (
      this.currentToken.type === TokenType.VAR.type ||
      this.currentToken.type === TokenType.PROCEDURE.type
    ) {
      decls = decls.concat(this.decl())
      this.eat(TokenType.SEMI.type)
    }
    return decls
  }
  decl() { // var_decl | proc_decl
    if (this.currentToken.type === TokenType.VAR.type) { return this.var_decl() }
    else if (this.currentToken.type === TokenType.PROCEDURE.type) { return this.proc_decl() }
  }
  var_decl() { // VAR variable (COMMA variable)* COLON type_spec
    const var_decls = []
    this.eat(TokenType.VAR.type)
    const var_nodes = [this.variable()]
    while (this.currentToken.type === TokenType.COMMA.type) {
      this.eat(TokenType.COMMA.type)
      var_nodes.push(this.variable())
    }
    this.eat(TokenType.COLON.type)
    const type_node = this.type_sepc()
    for (const var_node of var_nodes) {
      var_decls.push(new VarDecl(type_node, var_node))
    }
    return var_decls
  }
  proc_decl() {
    /**
     *  PROCEDURE ID LPAREN RPAREN SEMI block
     */
    this.eat(TokenType.PROCEDURE.type)
    const procId = this.variable()
    this.eat(TokenType.LPAREN.type)
    const formalParamNodes = this.formalParamsList()
    this.eat(TokenType.RPAREN.type)
    this.eat(TokenType.SEMI.type)
    const blockNode = this.block()
    return new ProcDecl(procId.value, formalParamNodes, blockNode)
  }
  formalParamsList() {
    /**
     *   formalParams
     *  | formalParams SEMI formalParamsList
     */
    let params = [...this.formalParams()]
    if (this.currentToken.type === TokenType.SEMI.type) {
      this.eat(TokenType.SEMI.type)
      return [...params, ...this.formalParamsList()]
    } else {
      return params
    }
  }
  formalParams(): Array<Param> {
    // D (COMMA ID)* COLON type_spec
    const varNodes = [this.variable()]
    const nodes = []
    while (this.currentToken.type === TokenType.COMMA.type) {
      this.eat(TokenType.COMMA.type)
      varNodes.push(this.variable())
    }
    this.eat(TokenType.COLON.type)
    const typeNode = this.type_sepc()
    for (const varNode of varNodes) {
      nodes.push(new Param(typeNode, varNode))
    }
    return nodes
  }
  
  type_sepc() { // INTEGER | REAL
    if (this.currentToken.type === TokenType.INTEGER.type) {
      return new Type(this.eat(TokenType.INTEGER.type))
    } 
    else if (this.currentToken.type === TokenType.REAL.type) {
      return new Type(this.eat(TokenType.REAL.type))
    }
  }

  compound() { // BEGIN stmtList END
    let children;
    this.eat(TokenType.BEGIN.type)
    children = this.stmtList()
    this.eat(TokenType.END.type)
    return new Compound(children)
  }
  stmtList() {
    /**
     *    stmt SEMI
     *   |  stmtList
     */
    let nodes: Array<AST> = [this.stmt()]
    this.eat(TokenType.SEMI.type)
    if (this.currentToken.type === TokenType.BEGIN.type ||
      this.currentToken.type === TokenType.ID.type
    ) {
      return nodes.concat(this.stmtList())
    } else {
      return nodes.concat(new NoOp())
    }
  }
  stmt() { // compound | assignStmt | procCall
    if (this.currentToken.type === TokenType.BEGIN.type) {
      return this.compound()
    }
    else if (this.currentToken.type === TokenType.ID.type
      && this.lexer.currentChar === '('
    ) {
      return this.procCall()
    } else {
      return this.assignStmt()
    }
  }

  procCall() {
    // ID LPAREN (expr (COMMA expr)*)?  RPAREN

    const actualParams: Array<any> = []
    const procName = this.eat(TokenType.ID.type).value
    this.eat(TokenType.LPAREN.type)
    if (this.currentToken.type !== TokenType.RPAREN.type) {
      actualParams.push(this.expr())
      while (this.currentToken.type === TokenType.COMMA.type) {
        this.eat(TokenType.COMMA.type)
        actualParams.push(this.expr())
      }
    }
    this.eat(TokenType.RPAREN.type)
    return new ProcCall(procName, actualParams)
  }
  assignStmt() {
    // variable ASSIGN expr
    const left = this.variable()
    this.eat('ASSIGN')
    const right = this.expr()
    return new Assign(left, right) 
  }
  variable() {
    // ID
    const idToken = this.eat(TokenType.ID.type)
    return new Var(idToken)
  }
  expr() { // term ((PLUS | MINUS) term)*
    let left = this.term()
    while (this.currentToken.type === TokenType.PLUS.type
      || this.currentToken.type === TokenType.MINUS.type
    ) {
      const op = this.currentToken
      this.eat(op.type)
      const right = this.term()
      left = new BinOp(left, right, op)
    }
    return left
  }
  term() { // factor ((MUL | DIV) factor)*
    let left: any = this.factor()
    while (this.currentToken.type === TokenType.MUL.type
      || this.currentToken.type === TokenType.DIV.type
    ) {
      const op = this.currentToken
      this.eat(op.type)
      const right = this.factor()
      left = new BinOp(left, right, op)
    }
    return left
  }
  factor() {
    /**
     *  LPAREN expr RPAREN
     * | variable
     * | INTEGER_CONST
     */
    let node;
    if (this.currentToken.type === TokenType.LPAREN.type) {
      this.eat(TokenType.LPAREN.type)
      node = this.expr()
      this.eat(TokenType.RPAREN.type)
    }
    else if (this.currentToken.type === TokenType.ID.type) {
      node = this.variable()
    }
    else {
      const token = this.eat(TokenType.INTEGER_CONST.type)
      node = new Num(token)
    }
    return node
  }
  parse() {
    return this.program()
  }
}
