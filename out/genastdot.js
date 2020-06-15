"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ASTVisualizer = void 0;
const utils_1 = require("./utils");
const Lexer_1 = require("./Lexer");
const Parser_1 = require("./Parser");
const commander_1 = require("commander");
const fs = require("fs");
class ASTVisualizer extends utils_1.NodeVisitor {
    constructor() {
        super();
        this.head =
            `digraph astgraph {
  node [shape=circle, fontsize=12, fontname="Courier", height=.1];
  ranksep=.3;
  edge [arrowsize=.5]
`;
        this.body = [];
        this.footer = '}';
        this.sequ = 0;
    }
    genNode(node, label) {
        this.body.push(`  node${this.sequ} [label="${label}"]\n`);
        node.sequ = this.sequ++;
    }
    genArrow(left, right) {
        this.body.push(`  node${left.sequ} -> node${right.sequ}\n`);
    }
    gendot() {
        return this.head + this.body.join('') + this.footer;
    }
    visit_Program(node) {
        this.genNode(node, node.name);
        this.visit(node.blockNode);
        this.genArrow(node, node.blockNode);
    }
    visit_Block(node) {
        this.genNode(node, 'Block');
        this.visit(node.compound);
        this.genArrow(node, node.compound);
    }
    visit_Compound(node) {
        this.genNode(node, 'Compund');
        for (const child of node.children) {
            this.visit(child);
            this.genArrow(node, child);
        }
    }
    visit_Assign(node) {
        this.genNode(node, 'ASSIGN');
        this.visit(node.left);
        this.visit(node.right);
        this.genArrow(node, node.left);
        this.genArrow(node, node.right);
    }
    visit_NoOp(node) {
        this.genNode(node, 'NoOp');
    }
    visit_Var(node) {
        this.genNode(node, node.value);
    }
    visit_BinOp(node) {
        this.genNode(node, node.op.value);
        this.visit(node.left);
        this.visit(node.right);
        this.genArrow(node, node.left);
        this.genArrow(node, node.right);
    }
    visit_Num(node) {
        this.genNode(node, node.value);
    }
}
exports.ASTVisualizer = ASTVisualizer;
const program = new commander_1.Command('generate dot file that represent ast');
program
    .requiredOption('-f --file <string>', 'the pascal file need to be parse')
    .parse(process.argv);
const text = fs.readFileSync(program.file).toString();
const lexer = new Lexer_1.Lexer(text);
const parser = new Parser_1.Parser(lexer);
const ast = parser.parse();
const visualizer = new ASTVisualizer();
visualizer.visit(ast);
const dotText = visualizer.gendot();
fs.writeFileSync('ast.dot', dotText);
//# sourceMappingURL=genastdot.js.map