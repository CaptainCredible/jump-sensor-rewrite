let myNumber = 19

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
let wasStop = false
let wasReset = false
let highDurationThresh = 10
let lowDurationThresh = 250
let DEBUG = false
let allowedToCount = false
let myAvgArray: number[] = []
let jumps = 0 // counter for jumps
allowedToCount = true
//

basic.showNumber(myNumber, 100)
basic.showIcon(IconNames.StickFigure)
basic.clearScreen()
led.plot(2,4)
radio.setGroup(1)

music.playTone(440, 200)


let movingAverageCount = 5
for (let i = 0; i <= movingAverageCount - 1; i++) {
    myAvgArray[i] = 0
}

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
        //radio.sendValue("jumps", jumps)
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
    led.toggle(2,0)
    if (name == "count") {
        
        if (myNumber != 0) {
            basic.pause(20 + (myNumber * 20))
        }
        radio.sendValue(myNumber.toString(), jumps)
        basic.showIcon(IconNames.Chessboard, 0)
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
        if(!wasReset){
            music.ringTone(1000)
        }
        
        wasReset = true
        jumps = 0
        allowedToCount = true
        led.toggleAll()
    } else if (name == "stop") {
        if(!wasStop){
            music.ringTone(2000)
        }
        wasStop = true
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
    if(wasReset){
        music.stopAllSounds()
        basic.clearScreen()
        wasReset = false
    }

    if(wasStop){
        music.stopAllSounds()
        wasStop = false
    }
    
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
    led.toggle(2,4)
    myAcc = Math.abs(input.acceleration(Dimension.Y))
    myAvgAcc = averaged(myAcc)
    if (DEBUG) {
        //radio.sendValue("avg", myAvgAcc)
    }
    if (myAvgAcc > highThresh && !(wasHigh)) {
        wasHigh = true
        highStart = input.runningTime()
    } else if (myAvgAcc < highThresh && wasHigh) {
        wasHigh = false
        highDuration = input.runningTime() - highStart
        if (highDuration > highDurationThresh) {
            if (allowedToCount) {
                if (!(jumped)) {
                    jumped = true
                    led.unplot(1, 1)
                    led.unplot(2, 1)
                    led.unplot(3, 1)
                    led.plot(2, 3)
                    music.playTone(660, 10)
                } else {
                    music.playTone(330, 10)
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
                    led.plot(1, 1)
                    led.plot(2, 1)
                    led.plot(3, 1)
                    led.unplot(2, 3)
                    countJump()
                }
            }
        }
    }
})