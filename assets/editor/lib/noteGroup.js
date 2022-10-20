import Config from "./config.js"
import Utils from "./utils.js"

import NotesAndRests from "./notesAndRests.js"

import Note from "./note.js"
import Rest from "./rest.js"

export default class NoteGroup {

    constructor(refTrack) {
        
        this.refTrack = refTrack

        this.x = 0
        this.y = 0
        this.width = 50
        this.height = Note.HEAD_HEIGHT * 4

        this.duration = null

        this.note = []

        this.accidentals = 0

        this.tuplet = []
        this.tupletIdx = []

        this.view = {
            ID : "NoteGroup-" + Utils.idPop(),
            NoteGroup: null,
            Rect: null
        }
    }

    setX(x) { this.x = x }
    setY(y) { this.y = y }
    moveDx(dx) { this.x += dx }
    moveDy(dy) { this.y += dy }
    setWidth() { 
        
        let width = 0

        for(let i = 0; i < this.note.length; i++) {
            if(this.note[i].width > width) {
                width = this.note[i].width
            }
        }
        this.width = width
    }
    setWidthFixed(width) { this.width = width }

    getSpaceBefore() {

        let space = 0
        let spaceTmp

        for(let i = 0; i < this.note.length; i++) {
            spaceTmp = this.note[i].getSpaceBefore()
            if(spaceTmp > space) {
                space = spaceTmp
            }
        }
        return space
    }

    getRealDuration() {

        let duration

        if(this.tuplet.length == 0) duration = 1 / (Math.pow(2, (this.duration - 1)))
        else {

            duration = Note.getDuration(this.duration)

            for(let i = 0; i < this.tuplet.length; i++) {

                if(this.tuplet[i] == 3) {
                    duration *= (2/3)
                }
                if(this.tuplet[i] == 5) {
                    duration *= (4/5)
                }
                if(this.tuplet[i] == 7) {
                    duration *= (4/7)
                }
            }
        }
        if(this.dotted) duration *= 1.5
        return duration
    }

    noteExists(value, octave) {

        for(let i = 0; i < this.note.length; i++) {
            if(this.note[i].value == value && this.note[i].octave == octave) {
                return i
            }
        }
        return null
    }

    flipGroup() {

        let counter = 0
        let condition = false

        for(let i = 1; i < this.note.length; i++) {
            if(this.note[i].isNeighbourLower(this.note[i-1])) {
                if(counter % 2 == 0) {
                    this.note[i].flip()
                    condition = true
                }
                counter++
            } else {
                counter = 0
                continue
            }
        }

        if(condition) {
            for(let i = 0; i < this.note.length; i++) {
                this.note[i].setFlipSpace(1)
            }
        }
        this.setWidth()
    }

    unflipGroup() {

        if(!(this.note.length == 1 && this.note[0].type == "REST")) {
            for(let i = 0; i < this.note.length; i++) {
                this.note[i].unFlip()
                this.note[i].setFlipSpace(0)
            }
        }
        this.setWidth()
    }

    decreaseDuration() {

        if(this.duration < NotesAndRests.DURATION_MIN_MAX[1]) {

            if(this.tuplet.length == 0) {
                for(let i = 0; i < this.note.length; i++) {
                    this.note[i].decreaseDuration()
                }

                let c = false
                for(let i = 0; i < this.note.length; i++) {
                    if(this.note[i].flipped) c = true
                }
                if(c) {
                    this.unflipGroup()
                    this.flipGroup()
                }

                this.duration = this.note[0].duration
                this.setWidth()

                if(this.note[0].type != "REST") {
                    this.note[0].removeStem()
                    this.note[0].addStem()
                    this.note[0].addFlag()
                }

                let group = this.refTrack.refStave.refSystem.refScore.pointer.group
                this.refTrack.addNoteGroup(group + 1, this.note[0].duration)

                // this.refTrack.refStave.fitNotesHorizontalAll()
                this.refTrack.refStave.setWidth()
                this.refTrack.refStave.refSystem.refScore.fitMultiHorizontal()
                this.refTrack.refStave.refSystem.refScore.render()
            } else {
                // TO DO TUPLET DECREASING
            }
        }
    }

    increaseDuration() {

        if(this.tuplet.length == 0) {

            let trackDuration = this.refTrack.meterUp / this.refTrack.meterDown
            let availableDuration = this.refTrack.getRealDurationRestGroups(this.refTrack.refStave.refSystem.refScore.pointer.group)
            let requestDuration = this.getRealDuration()
            let leftDuration = availableDuration - requestDuration

            if(leftDuration >= 0) {

                let pointer = this.refTrack.refStave.refSystem.refScore.pointer

                for(let i = 0; i < this.note.length; i++) {
                    this.note[i].increaseDuration()
                }
                this.duration--

                let durationToFill

                do {
                    this.refTrack.removeNoteGroup(pointer.group + 1)
                    durationToFill = trackDuration - this.refTrack.getRealDurationAllGroups()
                    // console.log(durationToFill)
                } while(durationToFill < 0)

                if(durationToFill > 0) {

                    let notesToAdd
                    let durationFilled

                    for(let i = 0; i < 8; i++) {

                        notesToAdd = durationToFill / Note.getDuration(i)
                        // console.log(notesToAdd)
                        if(Math.floor(notesToAdd) > 0) {

                            for(let j = 0; j < Math.floor(notesToAdd); j++) {
                                this.refTrack.addNoteGroup(pointer.group + 1, i)
                            }
                            durationFilled = Math.floor(notesToAdd) * Note.getDuration(i)
                            durationToFill -= durationFilled
                        }
                    }
                }
                // console.log("SPRAWDZENIE TAKTU: " + (trackDuration - this.refTrack.getRealDurationAllGroups()))
            }
        } else {
            // TO DO
            console.log("TO DO TUPLETS")
        }

        let c = false
        for(let i = 0; i < this.note.length; i++) {
            if(this.note[i].flipped) c =true
        }
        if(c) {
            this.unflipGroup()
            this.flipGroup()
        }

        this.setWidth()

        if(this.note[0].type != "REST") {
            this.note[0].removeStem()
            this.note[0].addStem()
            this.note[0].addFlag()
        }

        // this.refTrack.refStave.fitNotesHorizontalAll()
        this.refTrack.refStave.setWidth()
        this.refTrack.refStave.refSystem.refScore.fitMultiHorizontal()
        this.refTrack.refStave.refSystem.refScore.render()
    }


    addRest(duration) {

        let rest = new Rest(duration, this)
        this.note = []
        this.note.push(rest)
        rest.initView()
        
        this.duration = duration
        this.setWidth()
    }

    addNote(value, octave) {

        if(this.noteExists(value, octave) != null) {
            console.log("TAKA NUTA JUŻ ISTNIEJE - NIE MOŻNA DODAĆ !") 
        } else {

            let note = new Note(this.duration, value, octave, this)
            note.initView()
            note.setY(note.computeY())

            if(this.note.length == 1 && this.note[0].type == "REST") {
                // TO DO DOT
                this.note[0].removeView()
                this.note[0] = note
            } else {
                this.note[0].removeStem()

                for(let i = 0; i < this.note.length; i++) {
                    if(i == this.note.length - 1) {
                        if(note.compare(this.note[i]) == 1) {
                            this.note.push(note)
                            break
                        }
                    }
                    if(note.compare(this.note[i]) == -1) {
                        this.note.splice(i, 0, note)
                        break
                    }
                }
            }

            // if(this.refTrack.refStave.refSystem.refScore.pointer.view["LedgerTmp"] != null) {
            //     this.note[0].view["LedgerLines"].append(document.getElementById("LedgerTmp"))
            // }

            this.unflipGroup()
            this.flipGroup()
            this.orderAccidentals()

            this.setWidth()

            this.note[0].addStem()
            this.note[0].addFlag()

            this.refTrack.refStave.fitNotesHorizontalAll()
            this.refTrack.refStave.setWidth()
            this.refTrack.refStave.refSystem.refScore.fitMultiHorizontal()
            this.refTrack.refStave.refSystem.refScore.render()
        }
    }

    removeNote(value, octave) {

        let idx = this.noteExists(value, octave)

        if(idx == null) {
            console.log("NUTA NIE ISTNIEJE - NIE MOŻNA USUNĄĆ !")
        } else {

            if(this.note.length == 1 && this.note[0].type != "REST") {

                this.note[0].removeView()
                // let duration = this.note[0].duration
                let rest = new Rest(this.duration, this)
                rest.initView()
                this.note[0] = rest
            }

            if(this.note.length > 1) {

                this.note[0].removeStem()
    
                this.note[idx].removeView()
                this.note.splice(idx, 1)
                
                this.note[0].addStem()
                this.note[0].addFlag()
                let dy = this.note[0].y - this.note[this.note.length-1].y
                this.note[0].setStemHeight(this.note[0].defaultStemHeight() + dy)
    
                this.unflipGroup()
                this.flipGroup()
            }

            this.setWidth()

            this.refTrack.refStave.fitNotesHorizontalAll()
            this.refTrack.refStave.setWidth()
            this.refTrack.refStave.refSystem.refScore.fitMultiHorizontal()
            this.refTrack.refStave.refSystem.refScore.render()
        }
    }    

    addAccidental(idx, accidental) {

        this.note[idx].addAccidental(accidental)
        this.orderAccidentals()
        this.setWidth()

        this.refTrack.refStave.fitNotesHorizontalAll()
        this.refTrack.refStave.setWidth()
        this.refTrack.refStave.refSystem.refScore.fitMultiHorizontal()
        this.refTrack.refStave.refSystem.refScore.render()
    }

    removeAccidental(idx) {

        this.note[idx].removeAccidental()
        this.orderAccidentals()
        this.setWidth()

        this.refTrack.refStave.fitNotesHorizontalAll()
        this.refTrack.refStave.setWidth()
        this.refTrack.refStave.refSystem.refScore.fitMultiHorizontal()
        this.refTrack.refStave.refSystem.refScore.render()
    }

    orderAccidentals() {

        let accIdx = []
        let accidentalOffset

        for(let i = 0; i < this.note.length; i++) {
            if(this.note[i].accidental != null) {
                accIdx.push(i)
            }
        }

        if(accIdx.length == 0) {

            for(let i = 0; i < this.note.length; i++) {
                this.note[i].spaceBefore[0] = 0
                this.note[i].setWidth()
            }
        }

        if(accIdx.length == 1) {

            accidentalOffset = Note.ACCIDENTAL_SPACE + Note.ACCIDENTAL_WIDTH

            for(let i = 0; i < this.note.length; i++) {
                this.note[i].setAccidentalPosition(1)
                this.note[i].spaceBefore[0] = accidentalOffset
                this.note[i].setWidth()
            }
        }

        if(accIdx.length > 1) {

            let idxTop = accIdx[accIdx.length-1]
            let idxBottom = accIdx[0]

            let valTop = this.note[idxTop].value + (this.note[idxTop].octave * 7)
            let valBottom = this.note[idxBottom].value + (this.note[idxBottom].octave * 7)

            let dy = valTop - valBottom
            let position

            if(dy < 6) {

                position = 1
                for(let i = accIdx.length - 1; i >= 0; i--) {
                    this.note[accIdx[i]].setAccidentalPosition(position)
                    position++
                }
                for(let i = 0; i < this.note.length; i++) {
                    this.note[i].spaceBefore[0] = (position -1) * (Note.ACCIDENTAL_SPACE + Note.ACCIDENTAL_WIDTH)
                    this.note[i].setWidth()
                }
            }

            if(dy >= 6) {

                this.note[accIdx[accIdx.length-1]].setAccidentalPosition(1)
                this.note[accIdx[0]].setAccidentalPosition(1)

                position = 2
                for(let i = accIdx.length - 2; i >= 1; i--) {
                    this.note[accIdx[i]].setAccidentalPosition(position)
                    if(i != accIdx.length-1) position++
                }
                for(let i = 0; i < this.note.length; i++) {
                    this.note[i].spaceBefore[0] = (position -1) * (Note.ACCIDENTAL_SPACE + Note.ACCIDENTAL_WIDTH)
                    this.note[i].setWidth()
                }
            }
        }
    }

    mark(mark) {

        if(mark) this.view["NoteGroup"].setAttributeNS(null, "fill", "blue")
        else this.view["NoteGroup"].setAttributeNS(null, "fill", "black")
    }
    
    initView() {

        let measure = this.refTrack.view["Measure"]

        let noteGroup = Utils.createGroup(this.view["ID"])
        this.view["NoteGroup"] = noteGroup

        measure.appendChild(noteGroup)

        //---RECT OPTIONAL---//
        if(Config.DEV_MODE) {
            let rect = Utils.createRect(0, 0, this.width, this.height, 150, 100, Math.floor(Math.random() * (255 - 0 + 1)) + 0)
            rect.setAttributeNS(null, "opacity", 0.6)
            noteGroup.appendChild(rect)
            this.view["Rect"] = rect
        }
    }

    render() {

        this.view["NoteGroup"].setAttributeNS(null, "transform", "translate(" + this.x + "," + this.y + ")")

        for(let i = 0; i < this.note.length; i++) {
            this.note[i].render()
        }

        //---RECT OPTIONAL---//
        if(Config.DEV_MODE) {
            this.view["Rect"].setAttributeNS(null, "width", this.width)
            this.view["Rect"].setAttributeNS(null, "height", this.height)
        }
    }

    removeView() {

        document.getElementById(this.view["ID"]).remove()
        this.view["NoteGroup"] = null
        this.view["Rect"] = null
    }
}