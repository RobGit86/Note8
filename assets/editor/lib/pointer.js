import Utils from './utils.js'

import Track from './track.js'
import Note from './note.js'

export default class Pointer {

    static MIN_MAX = {
        "G": [0, 4, 2, 5]
    }

    static BASE_VALUE = {
        "G": [2,5],
        "A": [3,4],
        "F": [4,3]
    }

    static BASE_VALUE_BOTTOM = {
        "G": [3,4],
        "A": [3,4],
        "F": [5,2]
    }

    static HEIGHT_DIFF = {
        "G": ((2 * Note.HEAD_HEIGHT) + (5 * 7 * Note.HEAD_HEIGHT))/2,
        "A": ((3 * Note.HEAD_HEIGHT) + (4 * 7 * Note.HEAD_HEIGHT))/2,
        "F": ((4 * Note.HEAD_HEIGHT) + (3 * 7 * Note.HEAD_HEIGHT))/2
    }

    constructor(x, y, clef, refScore) {

        this.refScore = refScore

        this.x = x
        this.y = y

        this.system = 0
        this.stave = 0
        this.track = 0
        this.group = 0
        this.clef = clef

        this.value = Pointer.BASE_VALUE[clef][0]
        this.octave = Pointer.BASE_VALUE[clef][1]

        this.view = {
            ID: "Pointer",
            Pointer: null,
            LedgerTmp: null
        }
    }

    setX(x) { this.x = x }
    setY(y) { this.y = y }
    moveDx(dx) { this.x += dx }
    moveDy(dy) { this.y += dy }

    getX() {

        return this.refScore.system[this.system].x + 
        this.refScore.system[this.system].stave[this.stave].x +
        this.refScore.system[this.system].stave[this.stave].track[this.track].x +
        this.refScore.system[this.system].stave[this.stave].track[this.track].xMeasure +
        this.refScore.system[this.system].stave[this.stave].track[this.track].noteGroup[this.group].x
    }

    getY() {

        let clef = this.refScore.system[this.system].stave[this.stave].track[this.track].clef

        let y = Pointer.HEIGHT_DIFF[clef] - (this.value * (Note.HEAD_HEIGHT/2) + this.octave * 7 * (Note.HEAD_HEIGHT/2))

        return this.refScore.system[this.system].y +
        this.refScore.system[this.system].stave[this.stave].y + 
        this.refScore.system[this.system].stave[this.stave].track[this.track].y + 
        this.refScore.system[this.system].stave[this.stave].track[this.track].paddingTopHeight +
        this.refScore.system[this.system].stave[this.stave].track[this.track].noteGroup[this.group].y + 
        y
    }

    setPosition() {

        this.x = this.getX()
        this.y = this.getY()

        let page = this.refScore.system[this.system].page
        this.refScore.page[page].view["Page"].append(this.view["Pointer"])
    }

    setBasePosition() {

        this.group = 0
        this.value = Pointer.BASE_VALUE[this.clef][0]
        this.octave = Pointer.BASE_VALUE[this.clef][1]

        this.x = this.getX()
        this.y = this.getY()
    }

    ledgerLines() {

        if(this.view["LedgerTmp"] != null) {
            this.view["LedgerTmp"].remove()
        }

        let ledgerLines = document.createElementNS(Utils.SVG_NS, "path")
        let ledgerWidth = Note.BASE_WIDTH
        let ledgerHeight = Note.STAFF_LINE_HEIGHT
        let ledgerSpace = Note.HEAD_HEIGHT

        let refValUp = this.value + this.octave * 7
        let refValBaseUp = Pointer.BASE_VALUE[this.clef][0] + Pointer.BASE_VALUE[this.clef][1] * 7

        let d

        if(refValUp > refValBaseUp) {

            let diff = refValUp - refValBaseUp
            let ledgerCount = Math.floor((refValUp - refValBaseUp) / 2)
            let y

            if(diff % 2 == 0) {
                y = 0
            } else {
                y = Note.HEAD_HEIGHT / 2
            }

            d = "M" + (-2) + " " + y + " "
            for(let i = 0; i < ledgerCount; i++) {
                d += "h" + (ledgerWidth + 4) + " v" + ledgerHeight + " h" + (-(ledgerWidth + 4)) + " v" + (-ledgerHeight) + " m0 " + ledgerSpace + " "    
            }
            d += " Z"

            ledgerLines.setAttributeNS(null, "d", d)

            let ledgerLinesGroup = Utils.createGroup("LedgerTmp")
            ledgerLinesGroup.setAttributeNS(null, "style", "fill:#000000")
            ledgerLinesGroup.appendChild(ledgerLines)
            this.view["Pointer"].appendChild(ledgerLinesGroup)

            this.view["LedgerTmp"] = ledgerLinesGroup
        } else {
            this.view["LedgerTmp"] = null
        }
    }

    moveUp() {

        this.valueUp()

        this.ledgerLines()

        this.setPosition(this.refScore.system[this.system].stave[this.stave])
        this.render()
    }

    moveDown() {

        this.valueDown()

        this.ledgerLines()

        this.setPosition(this.refScore.system[this.system].stave[this.stave])
        this.render()
    }

    moveLeft() {

        if(this.group == 0) {
            if(this.stave == 0) {
                if(this.system == 0) {
                    alert("POCZĄTEK PARTURY !!!")
                } else {
                    this.getGroup().mark(false)
                    this.system--
                    this.stave = this.refScore.system[this.system].stave.length - 1
                    this.group = this.refScore.system[this.system].stave[this.stave].track[this.track].noteGroup.length - 1
                    this.getGroup().mark(true)
                }
            } else {
                this.getGroup().mark(false)
                this.stave--
                this.group = this.refScore.system[this.system].stave[this.stave].track[this.track].noteGroup.length - 1
                this.getGroup().mark(true)
            }
        } else {
            this.getGroup().mark(false)
            this.group--
            this.getGroup().mark(true)
        }

        this.setPosition()
        this.render()
    }

    moveRight() {

        if(this.refScore.system[this.system].stave[this.stave].track[this.track].noteGroup.length - 1 == this.group) {
            if(this.stave == this.refScore.system[this.system].stave.length - 1) {
                if(this.refScore.system[this.system + 1] != undefined) {
                    this.getGroup().mark(false)
                    this.system++
                    this.stave = 0
                    this.group = 0
                    this.getGroup().mark(true)
                } else {
                    alert("KONIEC PARTURY !!!")
                }
            } else {
                this.getGroup().mark(false)
                this.stave++
                this.group = 0
                this.getGroup().mark(true)
            }
        } else {
            this.getGroup().mark(false)
            this.group++
            this.getGroup().mark(true)
        }
        this.setPosition()
        this.render()
    }

    changeTrack() {

        if(this.track == this.refScore.system[0].stave[0].track.length - 1) {
            this.getGroup().mark(false)
            this.track = 0
        } else {
            this.getGroup().mark(false)
            this.track++
        }
        this.clef = this.getTrack(this.stave).clef
        this.setBasePosition()
        this.getGroup().mark(true)
        this.render()
    }

    getStave() {
        
        return this.refScore.system[this.system].stave[this.stave]
    }

    getTrack() {

        return this.getStave().track[this.track]
    }

    getGroup() {

        return this.getTrack().noteGroup[this.group]
    }

    valueUp() {

        if(this.value == 6) {
            this.value = 0
            this.octave++
        } else {
            this.value++
        }
    }

    valueDown() {

        if(this.value == 0) {
            this.value = 6
            this.octave--
        } else {
            this.value--
        }
    }

    initView() {

        let page = document.getElementById(this.refScore.page[0].view["ID"])

        let pointer = document.getElementById("T-Pointer").cloneNode(true)
        pointer.id = "Pointer"

        page.append(pointer)

        this.view["Pointer"] = pointer
    }

    render() {

        this.view["Pointer"].setAttributeNS(null, "transform", "translate(" + this.x + "," + this.y + ")")
    }

    showStats() {

        console.log("POINTER X: " + this.x)
        console.log("POINTER Y: " + this.y)
        console.log("POINTER SYSTEM: " + this.system)
        console.log("POINTER STAVE: " + this.stave)
        console.log("POINTER TRACK: " + this.track)
        console.log("POINTER GROUP: " + this.group)
        console.log("POINTER CLEF: " + this.clef)
        console.log("POINTER VALUE: " + this.value)
        console.log("POINTER OCTAVE: " + this.octave)
    }
}