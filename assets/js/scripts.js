class SlotMachine {
    constructor(domElement) {
        Symbol.preload(); // Load symbols
        this.balance = 100; // Initial User balance
        this.debugMode = false;
        this.updateBalanceBox();

        /*
        * Initial reel position
        */
        this.initialReels = [
            ['3xBAR', 'BAR', '2xBAR', '7', 'Cherry', '3xBAR', 'BAR', '2xBAR', '7', 'Cherry'],
            ['3xBAR', 'BAR', '2xBAR', '7', 'Cherry', '3xBAR', 'BAR', '2xBAR', '7', 'Cherry'],
            ['3xBAR', 'BAR', '2xBAR', '7', 'Cherry', '3xBAR', 'BAR', '2xBAR', '7', 'Cherry'],
        ];

        // Each reel has his own speed, actually this is just decorative feature. (greater = slower)
        this.initialReelSpeed = [
            100,
            200,
            150
        ];

        this.container = domElement;

        // Set symbols to reels
        this.reels = Array.from(this.container.find('.reel')).map(
            (reelContainer, idx) => new Reel(reelContainer, idx, this.initialReels[idx], this.initialReelSpeed[idx])
        );

        this.payTable = { // Pay-table
            'Cherry': {
                'top': 2000,
                'middle': 1000,
                'bottom': 4000,
            },
            '7': {
                'top': 150,
                'middle': 150,
                'bottom': 150,
            },
            '7Cherry': {
                'top': 75,
                'middle': 75,
                'bottom': 75,
            },
            '3xBAR': {
                'top': 50,
                'middle': 50,
                'bottom': 50,
            },
            '2xBAR': {
                'top': 20,
                'middle': 20,
                'bottom': 20,
            },
            'BAR': {
                'top': 10,
                'middle': 10,
                'bottom': 10,
            },
            'anyBAR': {
                'top': 5,
                'middle': 5,
                'bottom': 5,
            }
        };

        // Set events to our controls
        this.initControls();
    }

    async spin() {
        // Checking balance before spin, if we have at least 1 point - spin
        if (this.checkBalance()) {
            this.onSpinStart();
            this.balance -= 1;
            this.updateBalanceBox();
            return Promise.all(this.reels.map(reel => {
              return reel.spin();
            })).then(() => this.onSpinEnd());
        }
    }

    // Disable spin button while spinning
    onSpinStart() {
        this.spinButton.prop( "disabled", true );
        console.log('Spinning');
    }

    // Enable spin button after spinning
    onSpinEnd() {
        this.spinButton.prop( "disabled", false );
        console.log('Stopped');
        this.calculateResults();
    }

    // Check that we have enough balance to spin
    checkBalance() {
        return this.balance >= 1;
    }

    // Calculate our results after spin and highlight winning positions if there are.
    async calculateResults() {
        var that = this;
        var reelsPositions = {
            top: [],
            middle: [],
            bottom: []
        };
        this.reels.map(reel => {
            var currentReelPositions = reel.getCurrentPositions();
            $.each(currentReelPositions, function(position, value) {
                reelsPositions[position].push(value);
            });
        })

        var combinations = this.checkCombinations(reelsPositions);
        return Promise.all(combinations.map(win => {
            that.blinkLines(win.line, 5);
            that.blinkPayTable(win.symbol, 5);
            that.balance += win.value;
        })).then(() => this.updateBalanceBox());
    }

    // Check for existing combinations in spin result
    checkCombinations(reelsPositions) {
        var wins = [];
        var that = this;
        $.each(reelsPositions, function(line, symbols) {
            // Check 3 Symbols
            if (symbols[0] == symbols[1] && symbols[1] == symbols[2] && symbols[0] != '') {
                wins.push({
                    value: that.payTable[symbols[0]][line],
                    line: line,
                    symbol: symbols[0]
                });
            }

            // Check Seven and Cherry
            if (['7', 'Cherry'].indexOf(symbols[0]) !== -1 && 
            ['7', 'Cherry'].indexOf(symbols[1]) !== -1 && 
            ['7', 'Cherry'].indexOf(symbols[2]) !== -1 && 
            !(symbols[0] == symbols[1] && symbols[1] == symbols[2])) {
                wins.push({
                    value: that.payTable['7Cherry'][line],
                    line: line,
                    symbol: '7Cherry'
                });
            }

            // Any BAR symbols
            if ((symbols[0] === 'BAR' || symbols[1] === 'BAR' || symbols[2] === 'BAR') && !(symbols[0] == symbols[1] && symbols[1] == symbols[2])) {
                wins.push({
                    value: that.payTable['anyBAR'][line],
                    line: line,
                    symbol: 'anyBAR'
                });
            }
        });
        return wins;
    }

    // Blink lines on the reels if there are winning position
    async blinkLines(line, counter) {
        var that = this;
        $('[data-line="' + line +'"]').animate({
            opacity: 1
        }, 100, 'linear', function () {
            $('[data-line="' + line +'"]').animate({
                opacity: 0
            }, 100);
            if (counter != 0) {
                that.blinkLines(line, counter - 1);
            }
        });
    }

    // Blink rows in pay table if there are winning positions
    async blinkPayTable(combination, counter) {
        var that = this;
        $('[data-combination="' + combination +'"]').animate({
            backgroundColor: "red",
            color: "#ffffff",
        }, 100, 'linear', function () {
            $('[data-combination="' + combination +'"]').animate({
                backgroundColor: "#FFFFFF",
                color: "#666B85"
            }, 100);
            if (counter != 0) {
                that.blinkPayTable(combination, counter - 1);
            }
        });
    }

    updateBalanceBox() {
        $('.balance-box').val(this.balance);
    }

    initControls() {
        var that = this;

        // Set event listener to spin button
        this.spinButton = $('#spin');
        this.spinButton.on('click', function() {
            that.spin();
        });

        // Set event listener to balance input
        $('.balance-box').on('blur', function() {
            var balanceValue = $('.balance-box').val();
            // Check if new balance is Integer
            if (Math.floor(balanceValue) == balanceValue && $.isNumeric(balanceValue)) {
                if (balanceValue < 1) {
                    balanceValue = 1;
                }
                if (balanceValue > 5000) {
                    balanceValue = 5000;
                }
                that.balance = balanceValue;
            }
        });

        // Set event listener to "Fixed Mode" checkbox
        $('#debug').on('change', function() {
            if ($('#debug').is(':checked')) {
                that.debugMode = true;
                that.reels.map(reel => {
                    reel.setDebugMode(true);
                })
                $('.debug-controls').css('display', 'flex');
            } else {
                that.debugMode = false;
                that.reels.map(reel => {
                    reel.setDebugMode(false);
                })
                $('.debug-controls').hide();
            }
        });
    }
  };