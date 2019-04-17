class Reel {
    constructor(reelContainer, idx, initialSymbols, speed) {
        this.reelContainer = reelContainer;
        this.idx = idx;
        this.debugMode = false;

        this.speed = speed; // Spin speed (ms)
        this.spinDuration = 2000; // Spin duration (ms)
        this.delayBetweenLandings = 500; // Delay between reels landings (ms)
        this.symbolContainer = this.reelContainer.appendChild(document.createElement("div"));
        this.symbolContainer.className = 'symbol';
        this.symbolContainer.dataset.id = idx;
        initialSymbols.forEach((symbol) => this.symbolContainer.appendChild((new Symbol(symbol, idx)).img));
        this.wheel = $('[data-id="' + this.idx + '"]');

        // Symbol fixed positions
        this.wheelPositions = {
            '3xBAR': {
                top: -660,
                middle: -600,
                bottom: -530
            },
            'BAR': {
                top: -800,
                middle: -730,
                bottom: -660
            },
            '2xBAR': {
                top: -940,
                middle: -865,
                bottom: -800
            },
            '7': {
                top: -1070,
                middle: -1000,
                bottom: -940
            },
            'Cherry': {
                top: -540,
                middle: -470,
                bottom: -400
            }
        }

        // Initial reel symbols
        this.currentPositions = {
            top: '3xBAR',
            middle: '',
            bottom: 'BAR'
        }
    }

    async spin() {
        this.startSpin();

        return new Promise(resolve => setTimeout(resolve, this.spinDuration + (this.delayBetweenLandings * this.idx))).then(() => {
            this.stopSpin(this.randomPosition());
        });
    }

    // Randomize symbol and position if fixed mode is not enabled.
    randomPosition() {
        var allSymbols = Symbol.symbols;
        var symbol = allSymbols[Math.floor(Math.random() * allSymbols.length)];
        var positions = ['top', 'middle', 'bottom'];
        var symbolPosition = positions[Math.floor(Math.random() * positions.length)];
        if (this.debugMode) {
            symbol = $('[data-reel-symbol="' + this.idx + '"]').val();
            symbolPosition = $('[data-reel-position="' + this.idx + '"]').val();
        }
        
        if (symbolPosition == 'middle') {
            this.currentPositions = {
                top: '',
                middle: symbol,
                bottom: ''
            }
        } else {
            this.currentPositions = {
                top: '',
                middle: '',
                bottom: ''
            }
            this.currentPositions[symbolPosition] = symbol;
            if (symbolPosition == 'top') {
                this.currentPositions['bottom'] = Symbol.nextSymbolByName(symbol).name;
            } else {
                this.currentPositions['top'] = Symbol.prevSymbolByName(symbol).name;
            }
        }

        return this.wheelPositions[symbol][symbolPosition];
    }

    // Stop spinning animation and execute last animation for reel before stop. Takes symbol position.
    stopSpin(position) {
        this.wheel.stop();
        this.wheel.animate({
            top: position
        }, this.speed);
    }

    // Start infinite spinning animation
    startSpin() {
        var that = this;
        var reelHeight = this.wheel.height();
        this.wheel.css('top', 0);
        this.wheel.animate({
            top: -reelHeight / 2
        }, this.speed, 'linear', function () {
            that.startSpin();
        });
    }

    getCurrentPositions() {
        return this.currentPositions;
    }

    setDebugMode(state) {
        this.debugMode = state;
    }
}