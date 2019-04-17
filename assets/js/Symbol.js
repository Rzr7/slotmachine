class Symbol {
    constructor(name, reel) {
        this.name = name;
        this.img = new Image();
        this.index = Symbol.symbols.indexOf(name);
        this.img.src = `assets/img/${name}.png`;
        this.img.dataset.symbol = name;
        this.img.dataset.reel = reel;
    }

    static preload() {
        Symbol.symbols.forEach(symbol => new Symbol(symbol));
    }
    static get symbols() {
        return ['3xBAR', 'BAR', '2xBAR', '7', 'Cherry'];
    }

    static nextSymbolByName(name) {
        var index = Symbol.symbols.indexOf(name);
        var nextSymbol = index + 1;
        var symbols = Symbol.symbols;
        var symbolsLength = symbols.length;
        if (nextSymbol >= symbolsLength) {
            nextSymbol = 0;
        }
        return new Symbol(symbols[nextSymbol]);
    }

    static prevSymbolByName(name) {
        var index = Symbol.symbols.indexOf(name);
        var prevSymbol = index - 1;
        var symbols = Symbol.symbols;
        var symbolsLength = symbols.length;
        if (prevSymbol < 0) {
            prevSymbol = symbolsLength - 1;
        }
        return new Symbol(symbols[prevSymbol]);
    }
}