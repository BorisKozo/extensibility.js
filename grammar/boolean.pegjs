start
  = additive

additive
  = left:multiplicative "+" right:additive { return left + right; }
  / multiplicative

multiplicative
  = left:primary "*" right:multiplicative { return left * right; }
  / primary

primary
  = integer
  / "(" additive:additive ")" { return additive; }

integer "integer"
  = digits:[0-9]+ { return parseInt(digits.join(""), 10); }


  /*
  exp→term {OR term};
    term→factor {AND factor};
    factor→id;
    factor→NOT factor;
    factor→LPAREN exp RPAREN;
    */