import { Lexer } from './Lexer';
import { Parser } from './Parser';
import { Command } from 'commander'
import { SemanticAnalyzer } from './symbol'
import { Interpreter } from './Interpreter'
import { setScope, setStack } from './global'
import * as fs from 'fs'
const program = new Command('spi - simple pascal interpreter')
program
  .requiredOption('-f --file <string>', 'the pascal file')
  .option('--stack', 'log stack info')
  .option('--scope', 'log scope info')
  .parse(process.argv)

setScope(program.scope)
setStack(program.stack)
const text = fs.readFileSync(program.file).toString()
const lexer = new Lexer(text)
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
const parser = new Parser(lexer)
const tree = parser.parse()
const semacticAnalyzer = new SemanticAnalyzer()
const interpreter = new Interpreter()
semacticAnalyzer.visit(tree)
interpreter.visit(tree)
// console.log(interpreter.GlobalMem)
// const visu = new ASTVisualizer()
// visu.visit(tree)
// console.log(visu.gendot())
