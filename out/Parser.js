"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = exports.Num = exports.BinOp = exports.NoOp = exports.Var = exports.Assign = exports.Compound = exports.Block = exports.Program = exports.AST = void 0;
const Lexer_1 = require("./Lexer");
class AST {
}
exports.AST = AST;
class Program extends AST {
    constructor(name, blockNode) {
        super();
        this.name = name;
        this.blockNode = blockNode;
    }
}
exports.Program = Program;
class Block extends AST {
    constructor(compound) {
        super();
        this.compound = compound;
    }
}
exports.Block = Block;
class Compound extends AST {
    constructor(children) {
        super();
        this.children = children;
    }
}
exports.Compound = Compound;
class Assign extends AST {
    constructor(left, right) {
        super();
        this.left = left;
        this.right = right;
    }
}
exports.Assign = Assign;
class Var extends AST {
    constructor(token) {
        super();
        this.token = token;
        this.value = token.value;
    }
}
exports.Var = Var;
class NoOp extends AST {
}
exports.NoOp = NoOp;
class BinOp extends AST {
    constructor(left, right, op) {
        super();
        this.left = left;
        this.right = right;
        this.op = op;
    }
}
exports.BinOp = BinOp;
class Num extends AST {
    constructor(token) {
        super();
        this.token = token;
        this.value = token.value;
    }
}
exports.Num = Num;
class Parser {
    constructor(lexer) {
        this.lexer = lexer;
        this.currentToken = this.lexer.getNextToken();
    }
    error(msg) {
        throw new Error(msg);
    }
    eat(type) {
        if (this.currentToken.type === type) {
            const token = this.currentToken;
            this.currentToken = this.lexer.getNextToken();
            return token;
        }
        else {
            this.error(`Unexpected Token ${this.currentToken}`);
        }
    }
    program() {
        console.log('this.currentToken', this.currentToken);
        this.eat(Lexer_1.TokenType.PROGRAM.type);
        const name = this.eat(Lexer_1.TokenType.ID.type).value;
        this.eat(Lexer_1.TokenType.SEMI.type);
        const blockNode = this.block();
        this.eat(Lexer_1.TokenType.DOT.type);
        return new Program(name, blockNode);
    }
    block() {
        const compound = this.compound();
        return new Block(compound);
    }
    compound() {
        let children;
        this.eat(Lexer_1.TokenType.BEGIN.type);
        children = this.stmtList();
        this.eat(Lexer_1.TokenType.END.type);
        console.log('children', children);
        return new Compound(children);
    }
    stmtList() {
        let nodes = [this.stmt()];
        this.eat(Lexer_1.TokenType.SEMI.type);
        if (this.currentToken.type === Lexer_1.TokenType.BEGIN.type ||
            this.currentToken.type === Lexer_1.TokenType.ID.type) {
            return nodes.concat(this.stmtList());
        }
        else {
            return nodes.push(new NoOp());
        }
    }
    stmt() {
        if (this.currentToken.type === Lexer_1.TokenType.BEGIN.type) {
            return this.compound();
        }
        else if (this.currentToken.type === Lexer_1.TokenType.ID.type) {
            return this.assignStmt();
        }
    }
    assignStmt() {
        // variable ASSIGN expr
        const left = this.variable();
        this.eat('ASSIGN');
        const right = this.expr();
        return new Assign(left, right);
    }
    variable() {
        // ID
        const idToken = this.eat(Lexer_1.TokenType.ID.type);
        return new Var(idToken);
    }
    expr() {
        let left = this.term();
        while (this.currentToken.type === Lexer_1.TokenType.PLUS.type
            || this.currentToken.type === Lexer_1.TokenType.MINUS.type) {
            const op = this.currentToken;
            this.eat(op.type);
            const right = this.term();
            left = new BinOp(left, right, op);
        }
        return left;
    }
    term() {
        let left = this.factor();
        while (this.currentToken.type === Lexer_1.TokenType.MUL.type
            || this.currentToken.type === Lexer_1.TokenType.DIV.type) {
            const op = this.currentToken;
            this.eat(op.type);
            const right = this.factor();
            left = new BinOp(left, right, op);
        }
        return left;
    }
    factor() {
        // console.log('this.currentToken', this.currentToken)
        let node;
        if (this.currentToken.type === Lexer_1.TokenType.LPAREN.type) {
            this.eat(Lexer_1.TokenType.LPAREN.type);
            node = this.expr();
            this.eat(Lexer_1.TokenType.RPAREN.type);
        }
        else if (this.currentToken.type === Lexer_1.TokenType.ID.type) {
            node = this.eat(Lexer_1.TokenType.ID.type);
        }
        else {
            const token = this.eat(Lexer_1.TokenType.INTEGER_CONST.type);
            node = new Num(token);
        }
        return node;
    }
    parse() {
        return this.program();
    }
}
exports.Parser = Parser;
//# sourceMappingURL=Parser.js.map