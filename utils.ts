import {AST} from './Parser'
export class NodeVisitor {
  visit(node: AST) {
    const nodeType = node.constructor.name
    const instProto = Object.getPrototypeOf(this)
    const methedName = 'visit_' + nodeType
    if (instProto.hasOwnProperty(methedName)) {
      return this[methedName](node)
    } else {
      throw new ReferenceError(`the designated visit method '${methedName}' name does not exist`)
    }
  }
}

