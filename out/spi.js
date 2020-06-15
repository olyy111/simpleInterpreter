"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Lexer_1 = require("./Lexer");
const Parser_1 = require("./Parser");
const commander_1 = require("commander");
const fs = require("fs");
const program = new commander_1.Command('spi - simple pascal interpreter');
program
    .requiredOption('-f --file <string>', 'the pascal file')
    .parse(process.argv);
const text = fs.readFileSync(program.file).toString();
const lexer = new Lexer_1.Lexer(text);
// function WalkToken() {
//   let token = lexer.getNextToken()
//   console.log('Token ==>', token)
//   if (token.type == TokenType.EOF.type) {
//     return
//   } else {
//     WalkToken()
//   }
// }
// WalkToken()
const parser = new Parser_1.Parser(lexer);
const tree = parser.parse();
// const visu = new ASTVisualizer()
// visu.visit(tree)
// console.log(visu.gendot())
//# sourceMappingURL=spi.js.map