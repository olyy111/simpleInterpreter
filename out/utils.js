"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeVisitor = void 0;
class NodeVisitor {
    visit(node) {
        const nodeType = node.constructor.name;
        const instProto = Object.getPrototypeOf(this);
        const methedName = 'visit_' + nodeType;
        if (instProto.hasOwnProperty(methedName)) {
            this[methedName](node);
        }
        else {
            throw new ReferenceError('the designated visit method name does not exist');
        }
    }
}
exports.NodeVisitor = NodeVisitor;
//# sourceMappingURL=utils.js.map