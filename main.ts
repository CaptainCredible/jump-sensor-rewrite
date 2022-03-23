let myNumber = 0

let lowDuration = 0
let myAvgAcc = 0
let lowStart = 0
let wasLow = false
let jumped = false
let highDuration = 0
let highStart = 0
let wasHigh = false
let myAcc = 0
let wasAB = false
let average = 0


let highThresh = 1500
let lowThresh = 400

let highDurationThresh = 10
let lowDurationThresh = 250
let DEBUG = false
let allowedToCount = false
let myAvgArray: number[] = []
let jumps = 0 // counter for jumps


allowedToCount = true
music.playTone(440, 200)
if (DEBUG) {
    allowedToCount = true
}
basic.showNumber(myNumber, 100)
basic.showIcon(IconNames.Skull)
basic.clearScreen()

let movingAverageCount = 5
for (let i = 0; i <= movingAverageCount - 1; i++) {
    myAvgArray[i] = 0
}
basic.showIcon(IconNames.StickFigure)
radio.setGroup(1)


function averaged(newVal: number) {
    myAvgArray.pop()
    myAvgArray.unshift(newVal)
    let sum = myAvgArray.reduce((a, b) => a + b, 0);
    average = sum / myAvgArray.length
    return average
}
function countJump() {
    if (allowedToCount) {
        jumps += 1
    } else {
        music.playTone(550, 50)
        music.playTone(440, 50)
    }
    if (DEBUG) {
        radio.sendValue("jumps", jumps)
    }
}
input.onButtonPressed(Button.A, function () {
    if (DEBUG) {
        jumps += -1
        basic.showNumber(jumps, 20)
    }
})
input.onButtonPressed(Button.B, function () {
    if (DEBUG) {
        jumps += 1
        basic.showNumber(jumps, 20)
    }
})

radio.onReceivedValue(function (name, value) {
    if (name == "count") {
        if (myNumber != 0) {
            control.waitMicros(10000 * myNumber)
        } else {
            basic.pause(1)
        }
        radio.sendValue(myNumber.toString(), jumps)
        basic.showIcon(IconNames.Chessboard, 1)
    } else if (name == "setHighThresh") {
        highThresh = value
        basic.showString("HT ", 80)
        basic.showNumber(value, 80)
    } else if (name == "setLowThresh") {
        lowThresh = value
        basic.showString("LT ", 80)
        basic.showNumber(value, 80)
    } else if (name == "setHighDuration") {
        highDurationThresh = value
        basic.showString("HD ", 80)
        basic.showNumber(value, 80)
    } else if (name == "setHighLowDuration") {
        lowDurationThresh = value
        basic.showString("LD ", 80)
        basic.showNumber(value, 80)
    } else if (name == "reset") {
        // set counts to 0
        jumps = 0
        music.playTone(1000, 50)
        allowedToCount = true
        basic.clearScreen()
        led.plot(2, 1)
    } else if (name == "stop") {
        // STOP THE COUNT!!!
        allowedToCount = false
        basic.showIcon(IconNames.No, 0)
    }
})

input.onLogoEvent(TouchButtonEvent.Pressed, function () {
    if (DEBUG) {
        basic.showNumber(jumps)
    }
})

loops.everyInterval(1000, function () {
    if (input.buttonIsPressed(Button.AB) && input.logoIsPressed()) {
        if (wasAB) {
            DEBUG = !(DEBUG)
            if (DEBUG) {
                led.toggleAll()
                music.playTone(220, 10)
                led.toggleAll()
                music.playTone(330, 10)
                led.toggleAll()
                music.playTone(440, 100)
                led.toggleAll()
                music.playTone(550, 100)
            } else {
                led.toggleAll()
                music.playTone(550, 100)
                led.toggleAll()
                music.playTone(440, 100)
                led.toggleAll()
                music.playTone(330, 100)
                led.toggleAll()
                music.playTone(220, 100)
            }
        }
        wasAB = true
    } else {
        wasAB = false
    }
})

basic.forever(function() {
    myAcc = Math.abs(input.acceleration(Dimension.Y))
    myAvgAcc = averaged(myAcc)
    // serial.writeValue("raw", myAcc)
    // serial.writeValue("avg", myAvgAcc)
    if (DEBUG) {
        radio.sendValue("avg", myAvgAcc)
    }
    // MEASURE HIGH ACCELERATION
    if (myAvgAcc > highThresh && !(wasHigh)) {
        // went above high acceleration thresh
        wasHigh = true
        // radio.sendValue("high", 1)
        if (DEBUG) {

        }
        highStart = input.runningTime()
    } else if (myAvgAcc < highThresh && wasHigh) {
        wasHigh = false
        // radio.sendValue("high", 0)
        if (DEBUG) {

        }
        highDuration = input.runningTime() - highStart
        if (highDuration > highDurationThresh) {
            if (allowedToCount) {
                if (!(jumped)) {
                    jumped = true
                    led.toggle(2, 1)
                    led.toggle(2, 3)
                    music.playTone(660, 10)
                } else {
                    music.playTone(550, 10)
                }
            }
        }
    }
    // MEASURE WEIGHTLESSNESS
    if (myAvgAcc < lowThresh && !(wasLow)) {
        // went below weightless thresh
        wasLow = true
        // radio.sendValue("low", 1)
        lowStart = input.runningTime()
    } else if (myAvgAcc > lowThresh && wasLow) {
        // came back from below weightless thresh
        wasLow = false
        // radio.sendValue("low", 0)
        lowDuration = input.runningTime() - lowStart
        if (allowedToCount) {
            if (lowDuration > lowDurationThresh && jumped) {
                // jumped = true after high acc event and false after low acc event
                music.playTone(880, 20)
                if (jumped) {
                    jumped = false
                    led.toggle(2, 1)
                    led.toggle(2, 3)
                    countJump()
                }
            }
        }
    }

})

loops.everyInterval(10, function () {
})
