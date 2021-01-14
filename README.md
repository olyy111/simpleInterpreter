# What does mean simpleInterpreter

thanks ruslan spivak, I love the article that insctruct how to build one's own interpreter, this is the ts implementation for [orginal implementation](https://github.com/rspivak/lsbasi)

## run the interpreter

```bash
ts-node src/spi.ts -f test/final.test.pas
```

## gen the ast diagram

```bash
ts-node src/genastdot.ts -f test/final.test.pas && dot -Tpng -o gen/ast.png gen/ast.dot
```
