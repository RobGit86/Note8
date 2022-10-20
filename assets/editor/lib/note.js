import NotesAndRests from "./notesAndRests"

import Config from "./config.js"
import Utils from "./utils.js"

export default class Note extends NotesAndRests {

    static SCALE = 1

    static BASE_WIDTH = 11
    static HEAD_WIDTH = {0: 17, 1: 11, 2: 11, 3: 11, 4: 11, 5: 11, 6: 11, 7: 11}
    static HEAD_HEIGHT = 10
    static MIN_SPACE = {0: 50, 1: 40, 2: 30, 3: 20, 4: 16, 5: 10, 6: 8, 7: 7}

    static STEM_WIDTH = 1
        
    static FLAG_HEIGHT = {4: 30, 5: 28, 6: 36, 7: 44} 

    static STAFF_LINE_HEIGHT = 1

    static FLIP_SPACE = 10
    static FLIP_SPACE_BREVE = 18

    static BEAM_HEIGHT = 4
    static BEAM_SPACE = 2

    static ACCIDENTAL_WIDTH = 7
    static ACCIDENTAL_SPACE = 2

    static ZERO_NOTE_Y_CLEF = {
        "G": ((2 * Note.HEAD_HEIGHT) + (5 * 7 * Note.HEAD_HEIGHT)) / 2,
        "A": ((3 * Note.HEAD_HEIGHT) + (4 * 7 * Note.HEAD_HEIGHT)) / 2,
        "F": ((4 * Note.HEAD_HEIGHT) + (3 * 7 * Note.HEAD_HEIGHT)) / 2
    }

    constructor(duration, value, octave, refGroup) {

        super(duration)

        this.refGroup = refGroup
        this.type = "NOTE"
        
        this.spaceBefore = [0]
        this.spaceBody = Note.HEAD_WIDTH[duration]
        this.spaceAfter = [Note.MIN_SPACE[this.duration]]

        this.x = 0
        this.y = 0
        this.width = this.getWidth()
        this.height = Note.HEAD_HEIGHT

        // NOTE PARAMS        
        this.value = value
        this.octave = octave

        // HEAD PARAMS
        this.xHead = 0
        this.yHead = 0

        // STEM PARAMS
        this.stem = false
        this.xStem = null
        this.yStem = null
        this.stemHeight = null
        this.stemDirection = null

        // FLAG PARAMS
        this.flag = false
        this.xFlag = null
        this.yFlag = null

        // FLIP PARAMS
        this.flipped = false
        this.flipSpaced = false

        // BEAM PARAMS
        this.beamed = false

        // ACCIDENTAL PARAMS
        this.accidental = null
        this.accidentalPosition = null
        this.accidentalX = null

        // VIEWS
        this.view = {
            ID: Note.getId(),
            Note: null,
            Body: null,
            Head: null,
            Stem: null,
            Flag: null,
            Beams: null,
            Accidental: null,
            LedgerLines: null,
            Rect: null,
            RectBody: null
        }
    }

    // STATIC FUNCTIONS
    static getId() { return "Note-" + Utils.idPop() }
    static getDuration(duration) { return 1 / (Math.pow(2, (duration - 1))) }
    // ----------------

    // DIMEONSION PARAMS
    setX(x) { this.x = x }
    setY(y) { this.y = y }
    moveDx(dx) { this.x += dx }
    moveDy(dy) { this.y += dy }

    getWidth() { return this.getSpaceBefore() + this.spaceBody + this.getSpaceAfter() }
    setWidth() { this.width = this.getWidth() }
    getSpaceBefore() { return this.spaceBefore.reduce((a, b) => a + b, 0) }
    getSpaceAfter() { return this.spaceAfter.reduce((a, b) => a + b, 0) }

    computeY() {

        let clef = this.refGroup.refTrack.clef
        return Note.ZERO_NOTE_Y_CLEF[clef] - (this.value * (Note.HEAD_HEIGHT/2) + this.octave * 7 * (Note.HEAD_HEIGHT/2))
    }

    compare(note) {

        if(this.octave > note.octave) {
            return 1
        } else if (this.octave < note.octave) {
            return -1
        } else if(this.octave == note.octave) {
            if(this.value > note.value) return 1
            if(this.value < note.value) return -1
            if(this.value == note.value) return 0
        }
    }

    isNeighbourLower(note) {

        let currentNote = this.value + this.octave * 7
        let neighbourNote = note.value + note.octave * 7

        if(currentNote == neighbourNote + 1) {
            return true
        } else {
            return false
        }
    }

    distanceMiddleLine() {

        return 1.5 * Note.HEAD_HEIGHT - this.y
    }

    defaultStemDirection() {

        if(this.refGroup.note.length == 1) {
            if(this.refGroup.note[0].distanceMiddleLine() < 0) return "up"
            if(this.refGroup.note[0].distanceMiddleLine() >= 0) return "down"
        } else {
            let highestDistance = this.refGroup.note[this.refGroup.note.length - 1].distanceMiddleLine()
            let lowestDistance = this.refGroup.note[0].distanceMiddleLine()
            if(Math.abs(lowestDistance) == Math.abs(highestDistance)) return "down"
            if(Math.abs(lowestDistance) > Math.abs(highestDistance)) return "up"
            if(Math.abs(lowestDistance) < Math.abs(highestDistance)) return "down"
        }
    }

    defaultStemHeight() {

        if(this.duration < 6) return Note.HEAD_HEIGHT * 3.5
        if(this.duration == 6) return Note.HEAD_HEIGHT * 4
        if(this.duration == 7) return Note.HEAD_HEIGHT * 4.5
        return 0
    }

    addStem(direction = "default", height = "default") {

        if(this.duration > 1 && !this.stem) {

            this.stem = true

            let dyGroup, dyHeight, x, y, stemHeight
            dyGroup = this.refGroup.note[this.refGroup.note.length - 1].y - this.refGroup.note[0].y
            dyHeight = 0

            // SET DEFAULT STEM HEIGHT
            if(direction == "default") {
                this.stemDirection = this.defaultStemDirection()
            } else {
                this.stemDirection = direction
            }

            if(this.stemDirection == "up") {  // direction = UP

                if(height == "default") {
                    stemHeight = Math.abs(dyGroup) + this.defaultStemHeight()
                    dyHeight = this.refGroup.note[this.refGroup.note.length - 1].y - (1.5 * Note.HEAD_HEIGHT) - this.defaultStemHeight()
                    if(dyHeight > 0) stemHeight += dyHeight
                } else {
                    stemHeight = height
                }

                x = Note.BASE_WIDTH - Note.STEM_WIDTH
                y = -stemHeight + (Note.HEAD_HEIGHT / 2)
            }
            if(this.stemDirection == "down") {   // direction = DOWN
                if(this.flipped || this.flipSpaced) {
                    x = Note.FLIP_SPACE
                } else {
                    x = 0
                }

                if(height == "default") {
                    stemHeight = -dyGroup + this.defaultStemHeight()
                    dyHeight = (Note.HEAD_HEIGHT * 1.5) - (this.y + stemHeight) - dyGroup
                    if(dyHeight > 0) stemHeight += dyHeight
                } else {
                    stemHeight = height
                }

                y = (Note.HEAD_HEIGHT / 2) + (Note.HEAD_HEIGHT / 10) + dyGroup
            }

            this.xStem = x
            this.yStem = y
            this.stemHeight = stemHeight

            this.initViewStem()
        } else {
            // console.log("NIE MOZNA DODAC PALECZKI")
        }
    }

    setStemHeight(height) { // TO DO

        if(this.stem) {

            if(height == "default") height = this.defaultStemHeight()

            if(this.stemDirection == "up") {
                let dy = -(height - this.stemHeight)
                this.yStem += dy
            }

            this.stemHeight = height

            let stem = this.view["Stem"].firstElementChild
            stem.setAttributeNS(null, "height", height)

            if(this.flag) {
                if(this.stemDirection == "up") {
                    this.yFlag = this.yStem
                }
                if(this.stemDirection == "down") {
                    this.yFlag = this.yStem + (this.stemHeight - Note.FLAG_HEIGHT[this.duration])
                }
            }
        } 
    }

    removeStem() {

        if(this.stem) {

            this.stem = false
            this.xStem = null
            this.yStem = null
            this.stemHeight = null
            this.stemDirection = null

            this.view["Stem"].remove()
            this.view["Stem"] = null
            
            if(this.flag) this.removeFlag()
        }
    }

    addFlag() {

        if(this.duration > 3 && this.stem && !this.flag) {

            this.flag = true
            this.xFlag = this.xStem

            if(this.stemDirection == "up") {
                this.yFlag = this.yStem
            }
            if(this.stemDirection == "down") {
                this.yFlag = this.yStem + (this.stemHeight - Note.FLAG_HEIGHT[this.duration])
            }

            this.initViewFlag()
        } else {
            console.log("NIE MOZNA DODAĆ FLAGI! - BRAK PAŁECZKI")
        }
    }

    removeFlag() {

        if(this.flag) {
            this.flag = false
            this.xFlag = null
            this.yFlag = null
            this.view["Flag"].remove()
            this.view["Flag"] = null
        }
    }

    beam(dx, dy, level, side = "right") {

        let beam = document.createElementNS(Utils.SVG_NS, "path")
        this.view["Beams"].appendChild(beam)

        if(side == "left") {
            dx = -dx
        }

        let x1 = this.xStem
        let y1
        if(this.stemDirection == "up") y1 = this.yStem + (level * (Note.BEAM_HEIGHT + Note.BEAM_SPACE))
        if(this.stemDirection == "down") y1 = this.yStem + this.stemHeight - Note.BEAM_HEIGHT - (level * (Note.BEAM_HEIGHT + Note.BEAM_SPACE))

        let dPathArg = "M " + x1 + " " + y1 + " "
        dPathArg += "l " + (dx) + " " + dy + " "
        dPathArg += "v" + Note.BEAM_HEIGHT + " "
        dPathArg += "L " + x1 + " " + (y1 + Note.BEAM_HEIGHT) + " Z"

        beam.setAttributeNS(null, "d", dPathArg)
    }

    setFlipSpace(flip) {

        if(!this.flipped) {
            if(flip == 0) {
                this.flipSpaced = false
                this.spaceBody = Note.HEAD_WIDTH[this.duration]
            }
            if(flip == 1) {
                this.flipSpaced = true
                if(this.duration == 0) {
                    this.spaceBody = Note.HEAD_WIDTH[this.duration] + Note.FLIP_SPACE_BREVE
                } else {
                    this.spaceBody = Note.HEAD_WIDTH[this.duration] + Note.FLIP_SPACE
                }
            }
            this.setWidth()
        }
    }

    flip() {

        if(!this.flipped) {
            this.flipped = true
            if(this.duration == 0) {
                this.xHead = Note.FLIP_SPACE_BREVE
                this.spaceBody = Note.HEAD_WIDTH[this.duration] + Note.FLIP_SPACE_BREVE
            } else {
                this.xHead = Note.HEAD_WIDTH[this.duration] - Note.STEM_WIDTH
                this.spaceBody = Note.HEAD_WIDTH[this.duration] + Note.FLIP_SPACE
            }
            
            let head = this.getHeadTemplate()
            this.view["Head"].remove()
            this.view["Body"].append(head)
            this.view["Head"] = head

            this.setWidth()
        }
    }

    unFlip() {

        if(this.flipped) {
            this.flipped = false
            this.xHead = 0
            this.spaceBody = Note.HEAD_WIDTH[this.duration]

            let head = this.getHeadTemplate()
            this.view["Head"].remove()
            this.view["Body"].append(head)
            this.view["Head"] = head

            this.setWidth()
        }
    }

    addAccidental(accidental) {

        if(this.accidental != null) this.removeAccidental()
        if(this.accidental == null) {
            this.accidental = accidental
            this.accidentalPosition = 0
            this.accidentalX = 0
            this.initViewAccidental()            
        }
    }

    removeAccidental() {

        if(this.accidental != null) {
            
            this.view["Accidental"].remove()
            this.view["Accidental"] = null
            this.accidental = null
            this.accidentalPosition = null
            this.accidentalX = null
        }
    }

    setAccidentalPosition(position) {

        if(this.accidental != null) {
            this.accidentalPosition = position
            this.accidentalX = -(this.accidentalPosition * (Note.ACCIDENTAL_WIDTH + Note.ACCIDENTAL_SPACE))
        }
    }

    decreaseDuration() {

        if(this.duration < NotesAndRests.DURATION_MIN_MAX[1]) {

            this.duration++

            this.spaceBody = Note.HEAD_WIDTH[this.duration]
            this.spaceAfter[0] = Note.MIN_SPACE[this.duration]
            
            let head = this.getHeadTemplate()
            this.view["Head"].remove()
            this.view["Body"].append(head)
            this.view["Head"] = head
            
            this.setWidth()
        } else {
            console.log("MINIMALNA DŁUGOŚĆ NUTY - NIE MOŻNA SKRÓCIĆ!")
        }
    }

    increaseDuration() {
        
        if(this.duration > NotesAndRests.DURATION_MIN_MAX[0]) {

            this.duration--

            this.spaceBody = Note.HEAD_WIDTH[this.duration]
            this.spaceAfter[0] = Note.MIN_SPACE[this.duration]

            let head = this.getHeadTemplate()
            this.view["Head"].remove()
            this.view["Body"].append(head)
            this.view["Head"] = head
            
            this.setWidth()
        } else {
            console.log("MAKSYMALNA DŁUGOŚĆ NUTY - NIE MOŻNA WYDŁUŻYĆ")
        }
    }

    getHeadTemplate() {

        let head
        
        if(this.duration == 0) head = document.getElementById("T-Note-Head-Breve").cloneNode(true)
        if(this.duration == 1) head = document.getElementById("T-Note-Head-Whole").cloneNode(true)
        if(this.duration == 2) {
            if(this.flipped)
                head = document.getElementById("T-Note-Head-Empty-Flip").cloneNode(true)
            else
                head = document.getElementById("T-Note-Head-Empty").cloneNode(true)
        }
        if(this.duration > 2) {
            if(this.flipped)
                head = document.getElementById("T-Note-Head-Full-Flip").cloneNode(true)
            else
                head = document.getElementById("T-Note-Head-Full").cloneNode(true)
        }

        head.id = this.view["ID"] + "-Head"
        return head
    }

    initViewStem() {

        if(this.stem) {
            let stem = Utils.createGroup(this.view["ID"] + "-Stem")
            let stemImg = Utils.createRect(0, 0, Note.STEM_WIDTH, this.stemHeight)
            stem.append(stemImg)
            this.view["Body"].append(stem)
            this.view["Stem"] = stem
        }
    }

    initViewFlag() {

        if(this.flag) {

            let flag = Utils.createGroup(this.view["ID"] + "-Flag")
            let flagImg

            if(this.stemDirection == "up") {
                flagImg = document.getElementById("T-Note-Flag-" + this.duration).cloneNode(true)
            }
            if(this.stemDirection == "down") {
                flagImg = document.getElementById("T-Note-Flag-" + this.duration + "-Down").cloneNode(true)
            }

            flag.id = this.id + "-Flag"
            flag.append(flagImg)
            this.view["Body"].append(flag)
            this.view["Flag"] = flag
        }
    }

    initViewAccidental() {

        if(this.accidental != null) {
            let acc = document.getElementById("T-Accidental-" + this.accidental).cloneNode(true)
            acc.id = this.view["ID"] + "-" + this.accidental + "-" + Utils.idPop()
            this.view["Note"].append(acc)
            this.view["Accidental"] = acc
        }
    }

    initView() {

        let noteGroup = document.getElementById(this.refGroup.view["ID"])
        let noteStack = Utils.createGroup(this.view["ID"])
        let noteBody = Utils.createGroup(this.view["ID"] + "-Body")

        noteStack.setAttributeNS(null, "transform", "translate(" + this.x + "," + this.y + ")")
        noteBody.setAttributeNS(null, "transform", "translate(" + this.getSpaceBefore() + ",0)")

        //---RECT OPTIONAL---//
        if(Config.DEV_MODE) {
            let rectNoteStack = Utils.createRect(0, 0, this.width, this.height, 255, 0, 0) // 0 255 0
            let rectNoteBody = Utils.createRect(0, 0, this.spaceBody, this.height, 0, 255, 0) // 255 255 0
            rectNoteStack.setAttributeNS(null, "opacity", 0.2)
            rectNoteBody.setAttributeNS(null, "opacity", 0.2)
            noteBody.append(rectNoteBody)
            noteStack.append(rectNoteStack)
            this.view["Rect"] = rectNoteStack
            this.view["RectBody"] = rectNoteBody
        }
        //------------------//
        
        let head = this.getHeadTemplate()
        let beams = Utils.createGroup(this.view["ID"] + "-Beams")

        noteBody.append(head)
        noteBody.append(beams)
        noteStack.append(noteBody)
        noteGroup.append(noteStack)

        this.view["Note"] = noteStack
        this.view["Body"] = noteBody
        this.view["Head"] = head
        this.view["Beams"] = beams

        this.initViewStem()
        this.initViewFlag()
        this.initViewAccidental()
    }

    render() {
        
        if(this.view["Note"] != null)
            this.view["Note"].setAttributeNS(null, "transform", "translate(" + this.x + "," + this.y + ")")
        
        if(this.view["Body"] != null)
            this.view["Body"].setAttributeNS(null, "transform", "translate(" + this.getSpaceBefore() + ",0)")
        
        if(this.view["Head"] != null)
            this.view["Head"].setAttributeNS(null, "transform", "translate(" + this.xHead + "," + 0 + ")")
        
        if(this.view["Stem"] != null) 
            this.view["Stem"].setAttributeNS(null, "transform", "translate(" + this.xStem + "," + this.yStem + ")")
        
        if(this.view["Flag"] != null)
            this.view["Flag"].setAttributeNS(null, "transform", "translate(" + this.xFlag + "," + this.yFlag + ")")

        if(this.view["Accidental"] != null) {
            let accPos = this.getSpaceBefore() - (this.accidentalPosition * (Note.ACCIDENTAL_WIDTH + Note.ACCIDENTAL_SPACE))
            this.view["Accidental"].setAttributeNS(null, "transform", "translate(" + accPos + ",0)")
        }
        // if(this.dotted) {
        //     let x = this.spaces[0] + this.spaces[1]
        //     this.view["Dot"].setAttributeNS(null, "transform", "translate(" + x + "," + 0 + ")")
        // }

        //---RECT OPTIONAL---//
        if(Config.DEV_MODE) {
            this.view["Rect"].setAttributeNS(null, "width", this.width)
            this.view["Rect"].setAttributeNS(null, "height", this.height)
            this.view["RectBody"].setAttributeNS(null, "height", this.height)
            this.view["RectBody"].setAttributeNS(null, "width", this.spaceBody)
        }
        //------------------//
    }

    clearViews() {

        this.view["Note"] = null 
        this.view["Body"] = null
        this.view["Head"] = null
        this.view["Stem"] = null
        this.view["Flag"] = null
        this.view["Rect"] = null
        this.view["RectBody"] = null
    }

    removeView() {

        document.getElementById(this.view["ID"]).remove()
        this.clearViews()        
    }
}