"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lexer = exports.Token = exports.TokenType = void 0;
exports.TokenType = {
    ID: {
        type: 'ID',
        value: null
    },
    INTEGER_CONST: {
        type: 'INTEGER_CONST',
        value: null
    },
    EOF: {
        type: 'EOF',
        value: null
    },
    // single character
    SEMI: {
        type: 'SEMI',
        value: ';'
    },
    DOT: {
        type: 'DOT',
        value: '.'
    },
    COLON: {
        type: 'COLON',
        value: ':'
    },
    COMMA: {
        type: 'COMMA',
        value: ','
    },
    LPAREN: {
        type: 'LPAREN',
        value: '('
    },
    RPAREN: {
        type: 'RPAREN',
        value: ')'
    },
    PLUS: {
        type: 'PLUS',
        value: '+'
    },
    MINUS: {
        type: 'MINUS',
        value: '-'
    },
    MUL: {
        type: 'MUL',
        value: '*'
    },
    DIV: {
        type: 'DIV',
        value: '//'
    },
    PROGRAM: {
        type: 'PROGRAM',
        value: 'PROGRAM'
    },
    VAR: {
        type: 'VAR',
        value: 'VAR'
    },
    PROCEDURE: {
        type: 'PROCEDURE',
        value: 'PROCEDURE'
    },
    BEGIN: {
        type: 'BEGIN',
        value: 'BEGIN'
    },
    END: {
        type: 'END',
        value: 'END'
    }
};
const utils = {
    isNumber(char) {
        return /^\d$/.test(char);
    },
    isAlpha(char) {
        return /^[a-zA-Z]$/.test(char);
    },
    isAlphaNum(char) {
        return /^[a-zA-Z0-9]$/.test(char);
    },
    isSpace(char) {
        return /^\s$/.test(char);
    },
    findKey(obj, value) {
        const entries = Object.entries(obj);
        for (const entry of entries) {
            if (entry[1] === value) {
                return entry[0];
            }
        }
        return null;
    }
};
class Token {
    constructor(type, value, linenum, colnum) {
        this.value = value;
        this.type = type;
        this.linenum = linenum;
        this.colnum = colnum;
    }
    toString() {
        return `Token<${this.type}: '${this.value}', position: [${this.linenum}, ${this.colnum}]>`;
    }
}
exports.Token = Token;
function createToken(type, value, linenum, colnum) {
    return new Token(type, value, linenum, colnum);
}
function buildReservedKeywords() {
    const keywords = {};
    const tokenTypeList = Object.values(exports.TokenType);
    const startIndex = tokenTypeList.indexOf(exports.TokenType.PROGRAM);
    const endIndex = tokenTypeList.indexOf(exports.TokenType.END);
    tokenTypeList.slice(startIndex, endIndex + 1).forEach((tokenType, index) => {
        keywords[tokenType.value] = createToken(tokenType.type, tokenType.value, 0, 0);
    });
    return keywords;
}
const keywords = buildReservedKeywords();
class Lexer {
    constructor(text) {
        this.pos = 0;
        this.text = text;
        this.currentChar = text[this.pos];
        this.linenum = 1;
        this.colnum = 1;
    }
    advance() {
        this.pos += 1;
        if (this.text[this.pos] === '\n') {
            this.linenum += 1;
            this.colnum = 0;
        }
        if (this.pos > this.text.length - 1) {
            this.currentChar = null;
        }
        else {
            this.currentChar = this.text[this.pos];
            this.colnum += 1;
        }
    }
    skipComment() {
        this.advance();
        while (this.currentChar !== '}') {
            this.advance();
        }
        this.advance();
    }
    digit() {
        // 目前不支持小数
        const linenum = this.linenum;
        const colnum = this.colnum;
        let rs = '';
        do {
            rs += this.currentChar;
            this.advance();
        } while (utils.isNumber(this.currentChar));
        return createToken(exports.TokenType.INTEGER_CONST.type, rs, linenum, colnum);
    }
    id() {
        const linenum = this.linenum;
        const colnum = this.colnum;
        let rs = '';
        do {
            rs += this.currentChar;
            this.advance();
        } while (utils.isAlphaNum(this.currentChar));
        const token = keywords[rs.toUpperCase()];
        if (token) {
            token.linenum = linenum;
            token.colnum = colnum;
            return token;
        }
        else {
            return createToken(exports.TokenType.ID.type, rs, linenum, colnum);
        }
    }
    peek() {
        const pos = this.pos + 1;
        return this.text[pos];
    }
    getNextToken() {
        let token;
        while (this.currentChar !== null) {
            if (utils.isSpace(this.currentChar)) {
                this.advance();
                continue;
            }
            else if (this.currentChar === '{') {
                this.skipComment();
                continue;
            }
            else if (this.currentChar === ':' && this.peek() === '=') {
                this.advance();
                this.advance();
                return new Token('ASSIGN', ':=', this.linenum, this.colnum);
            }
            else if (utils.isNumber(this.currentChar)) {
                token = this.digit();
                return token;
            }
            else if (utils.isAlpha(this.currentChar)) {
                token = this.id();
                return token;
            }
            else {
                let currentType;
                let isExistChar = false;
                for (const tokenType of Object.values(exports.TokenType)) {
                    if (tokenType.value === this.currentChar) {
                        currentType = tokenType.type;
                        isExistChar = true;
                    }
                }
                if (isExistChar) {
                    token = createToken(currentType, this.currentChar, this.linenum, this.colnum);
                    this.advance();
                    return token;
                }
                else {
                    throw new Error('Unexpected lexeme');
                }
            }
        }
        return token = createToken(exports.TokenType.EOF.type, exports.TokenType.EOF.value, this.linenum, this.colnum);
    }
}
exports.Lexer = Lexer;
//# sourceMappingURL=Lexer.js.map