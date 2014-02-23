var owenge = function() {

    var symbol = {
        mul: '*',
        div: '/',
        add: '+',
        sub: '-',
        grpbeg: '(',
        grpend: ')'
    };

    var ex = {
        divZero: 'divZero',
        isNan: 'isNan',
        invalidArgument: 'invalidArgument'
    };

    var operator = [symbol.mul, symbol.div, symbol.add, symbol.sub];
    var group = [symbol.grpbeg, symbol.grpend];
    var originalFunction;

    // Just another way I want to make a namespace. I
    // don't want to have another js file that has to
    // be referenced just to make this parser works!
    var ns = {
        equation: {
            Data: "",
            headlines: "",
            parse: function(s) {
            },
            setHeadLines: function(headLines) {
                this.headlines = headLines;
            },
            setDataArrays: function(Data) {
                this.Data = Data;
            }
        }
    };

    // Function for parsing the string-based equation.
    //
    // Returns: Object with properties - "answer" and "error"
    ns.equation.parse = function(s) {
        originalFunction = s;
        // Function for splitting operators and numbers
        // into valid elements.
        //
        // Returns: Array of numbers and operators
        var split = function(s) {
            var ar = [];
            var len = s.length;
            var i = 0;
            var start = 0;

            for (i = 0; i < len; i++) {
                // Get the current character of the formula.
                var ch = s.charAt(i);

                // Get the left character of the current character.
                var left = i == 0 ? '' : s.charAt(i - 1);

                // Ignore if it is not an operator so letters
                // and numbers will be skipped.

                // if char is operator
                if (!Array.contains(operator, ch)) {
                    continue;
                }

                // Evaluate if the operator is actually a "sign".
                // This is for negative numbers where the left
                // character is usually a math operator.
                if (Array.contains(operator, ch) && Array.contains(operator, left)) {
                    continue;
                }

                // Parse the number starting from the index of the
                // previous operator upto the current one.
                Array.add(ar, s.substr(start, i - start));
                // Add the operator to the array.
                Array.add(ar, ch);

                // Track the index of the current operator. This
                // will be used for the next numeric parsing.
                start = i + 1;
            }

            // If the array has no elements it only means
            // that the formula doesn't have any operator(s)
            // so we have to assume that the value is a
            // number.
            if (ar.length == 0) {
                return s;
            }

            // The right most number of the formula will NOT be
            // included when parsing so we have to add it to the
            // array based on the last index of the last operator.
            if (start > 0) {
                Array.add(ar, s.substr(start));
            }
            // Return the parsed array values.

            var retmdas = mdas(ar);
            return retmdas;
        };

        // Function for eliminating equation groups.
        //
        // Returns: Number as the answer of the equation
        var recurse = function(s) {
            var len = s.length;
            var i = 0;
            var start = 0;
            var prevGrp;
            var parsed = '';

            for (i = 0; i < len; i++) {
                var ch = s.charAt(i);

                // Update the starting index with the latest value.
                if (ch === symbol.grpbeg) {
                    start = i + 1;
                }

                // Update the new parsed formula
                parsed += ch;

                // Ignore other characters that is not a group symbol.
                if (!Array.contains(group, ch)) {
                    continue;
                }

                if (prevGrp === symbol.grpbeg && ch === symbol.grpend) {
                    // Get the inner formula with the parenthesis
                    var formula = s.substr(start, i - start);
                    // Compute the inner formula using MDAS
                    var ans = split(formula);

                    // Compute the length of the new formula
                    var clen = parsed.length - (formula.length + 2);
                    parsed = parsed.substr(0, clen);

                    // Add the answer of the parsed inner formula.
                    parsed += ans;
                }

                // Track the group symbols
                prevGrp = ch;
            }

            // If the newly concatenated formula still has 
            // groupings then we recurse until all groups
            // are eliminated.
            if ((parsed.indexOf(symbol.grpbeg) != -1) || (parsed.indexOf(symbol.grpend) != -1)) {
                return recurse(parsed);
            }

            // If you reach this part it only means that
            // all groups were eliminated and the final
            // result is ready for the last computation.
            var ret = split(parsed);
            return ret;
        };

        var error = '';
        var ans;

        // Main
        try {
            ans = recurse(s);
            var indexFinalData = ns.equation.headlines.indexOf(String(ans));
            ans = ns.equation.Data[indexFinalData];

            //if (isNaN(ans)) {
            //    throw ex.isNan;
            //}
        }
        catch (e) {
            ans = 'n/a';

            if (e == ex.divZero) {
                error = 'Cannot perform division by zero';
            }
            else if (e == ex.isNan) {
                error = 'Invalid formula';
            }
            else if (e == ex.invalidArgument) {
                error = 'Invalid argument';
            }
        }

        return {
            error: error,
            answer: ans
        };
    };

    // Function for computing equation based on MDAS.
    //
    // Returns: Numeric value as result of computation
    var mdas = function(ar) {
        // Function for computing basic math operation.
        //
        // Returns: Numeric value as result computation
        var compute = function(n1, n2, op) {
            var newData = [];
            var data1;
            var data2;

            // Set the data's----------------------

            if (typeof n1 === 'string') {
                var indexdata1 = ns.equation.headlines.indexOf(String(n1));
                if (indexdata1 !== -1)
                    data1 = ns.equation.Data[indexdata1];
                else
                    data1 = parseInt(n1);
            }
            else
            {
                data1 = n1;
            }


            if (typeof n2 === 'string') {
                var indexdata2 = ns.equation.headlines.indexOf(n2);
                if (indexdata2 !== -1)
                    data2 = ns.equation.Data[indexdata2];
                else
                    data2 = parseInt(n2);
            }
            else
            {
                data2 = n2;
            }
            // end setting the data---------------------------


            var tmp;
            if (typeof data1 === 'object')
                tmp = data1;
            else if (typeof data2 === 'object')
                tmp = data2;
            else
                return;

            for (var i = 0; i < tmp.length; i++) {

                if (typeof data1 === 'object') {
                    var x = parseInt(data1[i][0]);
                    var y1 = parseInt(data1[i][1]);
                    if (typeof data2 === 'object') {
                        var y2 = parseInt(data2[i][1]);
                    }
                    else {
                        var y2 = parseInt(data2);
                    }
                }
                else {
                    var x = parseInt(data2[i][0]);
                    var y2 = parseInt(data2[i][1]);
                    if (typeof data1 === 'object') {
                        var y1 = parseInt(data1[i][1]);
                    }
                    else {
                        var y1 = parseInt(data1);
                    }
                }

                switch (op) {
                    case symbol.add:
                        newData.push([x, y1 + y2]);
                        break;
                    case symbol.sub:
                        newData.push([x, y1 - y2]);
                        break;
                    case symbol.mul:
                        newData.push([x, y1 * y2]);
                        break;
                    case symbol.div:
                        if (Number(n2) === 0) {
                            throw ex.divZero;
                        }

                        newData.push([x, y1 / y2]);
                        break;
                }
            }
            ns.equation.Data.push(newData);

            var newDataName = "Line" + ns.equation.Data.length + "";
            ns.equation.headlines.push(newDataName);

            return newDataName;
        };

        // Function for computing equation applying
        // MDAS rule. Operators that are passed in
        // the parameter will be basis of computation.
        // Operators not passed will be ignored.
        //
        // Returns: Array of COMPUTED numbers and operators
        var applyRule = function(ar, ops) {
            var len = ar.length;
            var i = 0;
            var prevOp;
            var parsed = [];

            for (i = 0; i < len; i++) {
                var mod = i % 2;

                // Skip if it is not an operator.
                if (mod == 0) {
                    continue;
                }

                // If the equation is 2+3 then
                // num1 is 2
                // num2 is 3
                // op is +
                var num1 = ar[i - 1];
                var num2 = ar[i + 1];
                var op = ar[i];

                // If the current operator is the one
                // that will be used for computation then
                // we ignore it.
                if (!Array.contains(ops, op)) {
                    // Check if the previous operator is used
                    // for the calculation. If not then we
                    // add the current number to the parsed array.
                    if (!Array.contains(ops, prevOp)) {
                        Array.add(parsed, num1);
                    }

                    // Add ignored operator to the parsed array.
                    Array.add(parsed, op);
                }
                else {
                    // If the previous operator is found in
                    // the list of operators to be used for 
                    // computation, then we get the previous
                    // oomputed value in the array.
                    if (Array.contains(ops, prevOp)) {
                        num1 = parsed[parsed.length - 1];
                    }

                    // Compute the equation.
                    var ans = compute(num1, num2, op);

                    // Replace the last value in the array
                    // with the new parsed value.
                    if (Array.contains(ops, prevOp)) {
                        parsed[parsed.length - 1] = ans;
                    }
                    else {
                        Array.add(parsed, ans);
                    }
                }
                // Track the previous operator.
                prevOp = op;
            }

            // We have to add the last value of the formula if the
            // last operator it used for computation.
            if (!Array.contains(ops, prevOp)) {
                // Get the last operator in the array.
                Array.add(parsed, ar[len - 1]);
            }
            return parsed;
        };

        // Apply MDAS rules to the equation
        ar = applyRule(ar, ['*', '/']);
        ar = applyRule(ar, ['+', '-']);

        // Return the final answer of the computation
        //return ar.length == 0 ? 0 : ar[0];

        return String(ar);
    };

    // Array extensions
    if (!Array.contains) {
        Array.contains = function(array, o) {
            var len = array.length;
            var i = 0;

            for (i = 0; i < len; i++) {
                if (array[i] === o) {
                    return true;
                }
            }

            return false;
        };
    }

    if (!Array.add) {
        Array.add = function(array, o) {
            array[array.length] = o;
        };
    }

    return ns;
}();






