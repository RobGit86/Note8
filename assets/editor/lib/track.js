import Utils from './utils.js'
import Config from './config.js'

import Note from './note.js'
import NoteGroup from './noteGroup.js'

export default class Track {

    static START_SPACE = 10
    static CLEF_WIDTH = 22
    static KEY_WIDTH = {
        "C": 5,
        "#": 10,
        "##": 15,
        "bbb": 20
    }
    static METER_WIDTH = 20
    static FIRST_NOTE_SPACE = 20

    constructor(clef, meterUp, meterDown, key, refStave) {

        this.refStave = refStave

        this.meterUp = meterUp
        this.meterDown = meterDown
        this.clef = clef
        this.key = key

        this.offset = [Track.START_SPACE, 0, 0, 0, Track.FIRST_NOTE_SPACE]

        this.x = 0
        this.y = 0
        this.width = 150
        this.paddingTopHeight = Note.HEAD_HEIGHT * 2
        this.staffLinesHeight = Note.HEAD_HEIGHT * 4 + Note.STAFF_LINE_HEIGHT       
        this.paddingBottomHeight = Note.HEAD_HEIGHT * 2
        this.height = this.paddingTopHeight + this.staffLinesHeight + this.paddingBottomHeight

        this.xMeasure = this.offset[0] + this.offset[1] + this.offset[2] + this.offset[3] + this.offset[4]
        this.yMeasure = this.paddingTopHeight

        this.noteGroup = []

        this.view = {
            ID: "Track-" + Utils.idPop(),
            Track: null,
            StaffLines: null,
            Clef: null,
            Key: null,
            Meter: null,
            Measure: null,            
            Rect: null
        }
    }

    // COORDS PARAMS
    setX(x) { this.x = x }
    setY(y) { this.y = y }
    moveDx(dx) { this.x += dx }
    moveDy(dy) { this.y += dy }
    setWidth() {

        let offset = this.getOffset()

        if(this.noteGroup.length > 0) {
            
            let notesWidth = 0

            if(this.noteGroup.length > 0) {
                let x1 = this.noteGroup[0].x
                let x2 = this.noteGroup[this.noteGroup.length - 1].x + this.noteGroup[this.noteGroup.length - 1].width
                notesWidth = x2 - x1
            }
            this.width = offset + notesWidth
        } else {
            this.width = offset
        }
    }
    setWidthFixed(width) { this.width = width }
    setHeight() { this.height = this.paddingTopHeight + this.staffLinesHeight + this.paddingBottomHeight }
    setPadding(topBottom, padding) {

        if(topBottom == 0) {
            this.paddingTopHeight = padding
        }
        if(topBottom == 1) {
            this.paddingBottomHeight = padding
        }
        this.setHeight()
    }

    addPadding(topBottom, dp) {

        if(topBottom == 0) {
            this.paddingTopHeight += dp
        }
        if(topBottom == 1) {
            this.paddingBottomHeight += dp
        }
        this.setHeight()
    }
    // ----------------

    getOffset() { return this.offset.reduce((a, b) => a + b, 0)}

    setXYMeasure() { 
        
        this.xMeasure = this.offset[0] + this.offset[1] + this.offset[2] + this.offset[3] + this.offset[4]
        this.yMeasure = this.paddingTopHeight
    }

    getHighestNoteInt() {

        let result = -1
        let resultTmp

        for(let i = 0; i < this.noteGroup.length; i++) {

            let note = this.noteGroup[i].note[this.noteGroup[i].note.length - 1]

            if(note.type == "NOTE") {
                resultTmp = note.value + note.octave * 7
                if(resultTmp > result) {
                    result = resultTmp
                }
            }
        }

        if(result < 0) {
            return null
        } else {
            return result
        }
    }

    getLowestNoteInt() {

        let result = 1000
        let resultTmp

        for(let i = 0; i < this.noteGroup.length; i++) {

            let note = this.noteGroup[i].note[0]

            if(note.type == "NOTE") {
                resultTmp = note.value + note.octave * 7
                if(resultTmp < result) {
                    result = resultTmp
                }
            }
        }

        if(result == 1000) {
            return null
        } else {
            return result
        }
    }

    showClef(notHidden = true) {

        if(notHidden) {
            this.offset[1] = Track.CLEF_WIDTH
            this.view["Clef"].setAttributeNS(null, "visibility", "visible")
        } else {
            this.offset[1] = 0
            this.view["Clef"].setAttributeNS(null, "visibility", "hidden")
        }
        this.setXYMeasure()
        this.setWidth()
    }

    showKey(notHidden = true) {
        
        if(notHidden) {
            this.offset[2] = Track.KEY_WIDTH[this.key]
            this.view["Key"].setAttributeNS(null, "visibility", "visible")
        } else {
            this.offset[2] = 0
            this.view["Key"].setAttributeNS(null, "visibility", "hidden")
        }
        this.setXYMeasure()
        this.setWidth()
    }

    showMeter(notHidden = true) {
        
        if(notHidden) {
            this.offset[3] = Track.METER_WIDTH
            this.view["Meter"].setAttributeNS(null, "visibility", "visible")
        } else {
            this.offset[3] = 0
            this.view["Meter"].setAttributeNS(null, "visibility", "hidden")
        }
        this.setXYMeasure()
        this.setWidth()
    }

    fillEmpty() {

        for(let i = 0; i < this.meterUp; i++) {

            let duration = Math.log2(this.meterDown) + 1
            this.addNoteGroup(i, duration)

            if(i == 0) {
                // this.noteGroup[i].setX(this.x + this.getOffset())
                this.noteGroup[i].setX(0)
            } else {
                this.noteGroup[i].setX(this.noteGroup[i-1].x + this.noteGroup[i-1].width)
            }
            // this.noteGroup[i].setY(this.yStaffLines)
            this.noteGroup[i].setWidth()
        }
    }

    addNoteGroup(xPosition, restDuration) {

        let noteGroup = new NoteGroup(this)
        this.noteGroup.splice(xPosition, 0, noteGroup)
        noteGroup.initView()

        // noteGroup.setY(this.yStaffLines)
        // noteGroup.setY(0)
        // noteGroup.setX(this.getOffset())
        noteGroup.addRest(restDuration)
        noteGroup.setWidth(noteGroup.note[0].width)
    }

    removeNoteGroup(idx) {

        for(let i = 0; i < this.noteGroup[idx].note.length; i++) {
            this.noteGroup[idx].note[i].removeView()
        }
        this.noteGroup[idx].removeView()
        this.noteGroup.splice(idx, 1)
    }

    scaleXMeasure(scale) {

        let x
        for(let i = 1; i < this.noteGroup.length; i++) {
            x = this.noteGroup[i].x * scale
            this.noteGroup[i].setX(x)
        }
        this.setWidth()

        let addedWidth = (this.noteGroup[this.noteGroup.length - 1].width - 1) * (scale - 1)
        this.setWidthFixed(this.width + addedWidth)
    }
   
    getRealDurationRange(startIdx, endIdx) {

        let duration = 0

        if(this.noteGroup[startIdx] != undefined) {
            for(let i = startIdx; i <= endIdx; i++) {
                duration += this.noteGroup[i].getRealDuration()
            }
        }
        return duration
    }

    getRealDurationAllGroups() {

        let duration = 0
        for(let i = 0; i < this.noteGroup.length; i++) {
            duration += this.noteGroup[i].getRealDuration()
        }
        return duration
    }

    getRealDurationRestGroups(idx) {

        return this.getRealDurationRange(idx + 1, this.noteGroup.length - 1)
    }

    distanceFromMid(idxGroup, idxNote) {

        let note = this.noteGroup[idxGroup].note[idxNote]

        if(note.y > -(2 * Note.HEAD_HEIGHT)) {
            return note.y - 2 * Note.HEAD_HEIGHT
        } else {
            return note.y
        }
    }

    beamTrack() {

        let factor = 1
        if(this.meterUp == 6 && this.meterDown == 8) factor = 3

        for(let i = 0; i < this.noteGroup.length; i++) {
            for(let k = 0; k < this.noteGroup[i].note.length; k++) {
                
                const beams = this.noteGroup[i].note[k].view["Beams"]

                if(beams != null) {
                    while (beams.firstChild) {
                        beams.firstChild.remove()
                    }
                }
            }
        }

        if(this.meterUp == 4 && this.meterDown == 4) {

            let condition1 = true // FIRST FOUR NOTES
            let condition2 = true // LAST FOUR NOTES

            if(this.noteGroup.length >= 4) {

                for(let i = 0; i < 4; i++) {
                    if(this.noteGroup[i].duration != 4 || this.noteGroup[i].note[0].type == "REST") {
                        condition1 = false;
                        break;
                    }
                }

                for(let i = this.noteGroup.length - 1; i >= this.noteGroup.length - 4; i--) {
                    if(this.noteGroup[i].duration != 4 || this.noteGroup[i].note[0].type == "REST") {
                        condition2 = false;
                        break;
                    }
                }
            } else {
                condition1 = false
                condition2 = false
            }

            if(condition1 && condition2) {
                this.beamNotes(0, 3)
                this.beamNotes(4, 7)
            } else if(condition1 && !condition2) {
                this.beamNotes(0, 3)
                for(let i = 2; i < this.meterUp; i++) {
                    this.beamBeat(i, factor)    
                }
            } else if(!condition1 && condition2) {
                let lastIdx = this.noteGroup.length - 1
                let firstIdx = lastIdx - 3

                this.beamNotes(firstIdx, lastIdx)
                for(let i = 0; i < 2; i++) {
                    this.beamBeat(i, factor)    
                }
            } else if(!condition1 && !condition2) {
                for(let i = 0; i < this.meterUp; i++) {
                    this.beamBeat(i, factor)    
                }
            }
        }

        if(this.meterUp == 6 && this.meterDown == 8) {

            for(let i = 0; i < this.meterUp - 1; i++) {
                this.beamBeat(i, factor)    
            }

            // let condition1 = true // FIRST FOUR NOTES
            // let condition2 = true // LAST FOUR NOTES

            // if(this.noteGroup.length >= 3) {

            //     for(let i = 0; i < 4; i++) {
            //         if(this.noteGroup[i].duration != 4 || this.noteGroup[i].note[0].type == "REST") {
            //             condition1 = false;
            //             break;
            //         }
            //     }

            //     for(let i = this.noteGroup.length - 1; i >= this.noteGroup.length - 4; i--) {
            //         if(this.noteGroup[i].duration != 4 || this.noteGroup[i].note[0].type == "REST") {
            //             condition2 = false;
            //             break;
            //         }
            //     }
            // }




        }
    }

    beamBeat(beat, factor) {

        let acc = 0
        let canBeamed = []

        for(let i = 0; i < this.noteGroup.length; i++) {

            if(this.noteGroup[i].note[0].type == "NOTE" && this.noteGroup[i].duration >= 4 &&
                (acc) >= (beat) / (this.meterDown / factor) &&
                ((acc) + this.noteGroup[i].getRealDuration()) <= (beat + 1) / (this.meterDown / factor)
            ) {
                canBeamed.push(i)                
            }
            acc += this.noteGroup[i].getRealDuration()
        }

        let cFirst, cLast
        for(let i = 0; i < canBeamed.length - 1; i++) {

            cFirst = cLast = canBeamed[i]

            while(canBeamed[i+1] == canBeamed[i] + 1) {
                cLast = canBeamed[i+1]
                i++
            }

            if(cFirst == cLast) {

                this.noteGroup[cFirst].note[0].addStem()
                this.noteGroup[cFirst].note[0].addFlag()

            } else {
                this.beamNotes(cFirst, cLast)
            }
        }

        if(canBeamed.length == 1) {
            this.noteGroup[canBeamed[0]].note[0].addStem()
            this.noteGroup[canBeamed[0]].note[0].addFlag()
        }
    }

    beamNotes(idxFirst, idxLast) {

        // REMOVING STEMS
        for(let i = idxFirst; i <= idxLast; i++) {
            if(this.noteGroup[i].note[0].type == "NOTE") {
                this.noteGroup[i].note[0].removeStem()
            }
        }
        // DEFINE STEM DIRECTION
        let midDistance = 0
        let tmp = 0
    
        for(let i = idxFirst; i<=idxLast; i++) {
            for(let j = 0; j < this.noteGroup[i].note.length; j++) {
                tmp = this.distanceFromMid(i, j)
                if(Math.abs(tmp) > Math.abs(midDistance)) {
                    midDistance = tmp
                }
            }
        }
    
        let stemDirection
    
        if(midDistance < 0) stemDirection = "down"
        else stemDirection = "up"
    
        // DEFINE DY
        let dy

        if(stemDirection == "up") dy = this.noteGroup[idxLast].note[this.noteGroup[idxLast].note.length - 1].y 
                                       - this.noteGroup[idxFirst].note[this.noteGroup[idxFirst].note.length - 1].y
        if(stemDirection == "down") dy = this.noteGroup[idxLast].note[0].y - this.noteGroup[idxFirst].note[0].y
        
        if(dy >= Note.HEAD_HEIGHT) dy = Note.HEAD_HEIGHT
        if(dy <= -Note.HEAD_HEIGHT) dy = -Note.HEAD_HEIGHT

        // SETTING PROPER STEM HEIGHTS
        let tmpHeight

        for(let i = idxFirst; i <= idxLast; i++) {
    
            if(i == idxFirst) {
                this.noteGroup[idxFirst].note[0].addStem(stemDirection)
            } else {
    
                if(stemDirection == "up") {
                    tmpHeight = this.noteGroup[idxFirst].note[0].stemHeight +
                    (this.noteGroup[i].note[0].y - this.noteGroup[idxFirst].note[0].y)
                }
                if(stemDirection == "down") {
                    tmpHeight = this.noteGroup[idxFirst].note[0].stemHeight -
                    (this.noteGroup[idxFirst].note[0].y - this.noteGroup[idxFirst].note[this.noteGroup[idxFirst].note.length - 1].y) - 
                    (this.noteGroup[i].note[this.noteGroup[i].note.length-1].y - this.noteGroup[idxFirst].note[0].y)
                }
                this.noteGroup[i].note[0].addStem(stemDirection, tmpHeight)
            }
        }   

        if(stemDirection == "up") this.noteGroup[idxLast].note[0].setStemHeight(this.noteGroup[idxLast].note[0].stemHeight - dy)
        if(stemDirection == "down") this.noteGroup[idxLast].note[0].setStemHeight(this.noteGroup[idxLast].note[0].stemHeight + dy)

        // SETTING PROPER STEM HEIGHTS INNER - OK

        let width = (this.noteGroup[idxLast].x + this.noteGroup[idxLast].note[0].getSpaceBefore() + this.noteGroup[idxLast].note[0].xStem) -
            (this.noteGroup[idxFirst].x + this.noteGroup[idxFirst].note[0].getSpaceBefore() + this.noteGroup[idxFirst].note[0].xStem)

        let alpha = Math.atan(dy / width)
        let widthLocal, addDy

        for(let i = idxFirst + 1; i < idxLast; i++) {

            widthLocal = (this.noteGroup[i].x + this.noteGroup[i].note[0].getSpaceBefore() + this.noteGroup[i].note[0].xStem) -
            (this.noteGroup[idxFirst].x + this.noteGroup[idxFirst].note[0].getSpaceBefore() + this.noteGroup[idxFirst].note[0].xStem)
            
            addDy = alpha * widthLocal

            if(stemDirection == "up") this.noteGroup[i].note[0].setStemHeight(this.noteGroup[i].note[0].stemHeight - addDy)
            if(stemDirection == "down") this.noteGroup[i].note[0].setStemHeight(this.noteGroup[i].note[0].stemHeight + addDy)
        }

        // EXTEND STEM HEIGHTS TO MINIMUM 

        let diff = 0
        let stemAbs

        for(let i = idxFirst; i <= idxLast; i++) {

            stemAbs = this.noteGroup[i].note[0].stemHeight - 
            (Math.abs(this.noteGroup[i].note[0].y - this.noteGroup[i].note[this.noteGroup[i].note.length - 1].y))

            if(stemAbs < (3.5 * Note.HEAD_HEIGHT)) {
                tmp = (3.5 * Note.HEAD_HEIGHT) - stemAbs
                if(tmp > diff) {
                    diff = tmp
                }
            }
        }

        if(diff > 0) {

            for(let i = idxFirst; i <= idxLast; i++) {
                if(stemDirection == "up") this.noteGroup[i].note[0].setStemHeight(this.noteGroup[i].note[0].stemHeight + diff)
                if(stemDirection == "down") this.noteGroup[i].note[0].setStemHeight(this.noteGroup[i].note[0].stemHeight + diff)
            }
        }

        this.noteGroup[idxFirst].note[0].beam(width, dy, 0)

        // >4 DURATION BEAMS
        let cFirst, cLast
        for(let i=5; i<=7; i++) {
    
            for(let k = idxFirst; k < idxLast; k++) {
    
                cFirst = cLast = k
    
                if(this.noteGroup[k].duration >= i) {
                    while(cLast < idxLast && this.noteGroup[cLast + 1].duration >= i) {
                        cLast++
                    }
                    k = cLast
    
                    if(cLast > cFirst) {

                        widthLocal = (this.noteGroup[cLast].x + this.noteGroup[cLast].note[0].getSpaceBefore() + this.noteGroup[cLast].note[0].xStem) -
                        (this.noteGroup[cFirst].x + this.noteGroup[cFirst].note[0].getSpaceBefore() + this.noteGroup[cFirst].note[0].xStem)

                        dy = alpha * widthLocal
                        this.noteGroup[cFirst].note[0].beam(widthLocal, dy, (i-4))
                    }
                }
            }
        }
    
        // SINGLE BEAMS
        if(idxLast > idxFirst) {
            
            for(let i = idxFirst; i <= idxLast; i++) {
    
                if(i == idxFirst) {
                    if(this.noteGroup[i].duration > 4 && this.noteGroup[i+1].duration < this.noteGroup[i].duration) {

                        widthLocal = (this.noteGroup[i+1].x + this.noteGroup[i+1].note[0].getSpaceBefore() + this.noteGroup[i+1].note[0].xStem) -
                        (this.noteGroup[i].x + this.noteGroup[i].note[0].getSpaceBefore() + this.noteGroup[i].note[0].xStem)

                        dy = alpha * widthLocal / 3

                        for(let d = this.noteGroup[i+1].duration + 1; d <= this.noteGroup[i].duration; d++) {
                            this.noteGroup[i].note[0].beam(widthLocal/3, dy, (d-4))
                        }
                    }
                } else if(i == idxLast) {
                    if(this.noteGroup[i].duration > 4 && this.noteGroup[i].duration > this.noteGroup[i-1].duration) {
                        
                        widthLocal = (this.noteGroup[i].x + this.noteGroup[i].note[0].getSpaceBefore() + this.noteGroup[i].note[0].xStem) -
                        (this.noteGroup[i-1].x + this.noteGroup[i-1].note[0].getSpaceBefore() + this.noteGroup[i-1].note[0].xStem)
                        
                        dy = -alpha * widthLocal / 3

                        for(let d = this.noteGroup[i-1].duration + 1; d <= this.noteGroup[i].duration; d++) {
                            this.noteGroup[i].note[0].beam(widthLocal/3, dy, (d-4), "left")
                        }
                    } 
                } else {
                    if(this.noteGroup[i].duration != this.noteGroup[i-1].duration && this.noteGroup[i].duration != this.noteGroup[i+1].duration) {
                        
                        widthLocal = (this.noteGroup[i].x + this.noteGroup[i].note[0].getSpaceBefore() + this.noteGroup[i].note[0].xStem) -
                        (this.noteGroup[i-1].x + this.noteGroup[i-1].note[0].getSpaceBefore() + this.noteGroup[i-1].note[0].xStem)
                        
                        dy = -alpha * widthLocal / 3
                        
                        for(let d = 1; d <= this.noteGroup[i].duration - 4; d++) {
                            this.noteGroup[i].note[0].beam(widthLocal/3, dy, d, "left")
                        }
                    }
                }
            }
        }
    }

    initView() {

        let stave = document.getElementById(this.refStave.view["ID"] + "-Tracks")

        let track = Utils.createGroup(this.view["ID"])
        track.setAttributeNS(null, "transform", "translate(" + this.x + "," + this.y + ")")
        this.view["Track"] = track

        let staffLines = Utils.createGroup(this.view["ID"] + "-StaffLines")
        this.view["StaffLines"] = staffLines
        
        let measure = Utils.createGroup(this.view["ID"] + "-Measure")
        this.view["Measure"] = measure

        //---RECT OPTIONAL---//
        if(Config.DEV_MODE) {
            let rect = Utils.createRect(0, 0, this.width, this.height, 0, 51, 51)
            rect.setAttributeNS(null, "opacity", 0.1)
            track.appendChild(rect)
            this.view["Rect"] = rect
        }

        let rectStaffLine1 = Utils.createRect(0, this.paddingTopHeight, this.width, 1, 0, 0, 0)
        let rectStaffLine2 = Utils.createRect(0, this.paddingTopHeight + Note.HEAD_HEIGHT, this.width, 1, 0, 0, 0)
        let rectStaffLine3 = Utils.createRect(0, this.paddingTopHeight + Note.HEAD_HEIGHT * 2, this.width, 1, 0, 0, 0)
        let rectStaffLine4 = Utils.createRect(0, this.paddingTopHeight + Note.HEAD_HEIGHT * 3, this.width, 1, 0, 0, 0)
        let rectStaffLine5 = Utils.createRect(0, this.paddingTopHeight + Note.HEAD_HEIGHT * 4, this.width, 1, 0, 0, 0)

        staffLines.appendChild(rectStaffLine1)
        staffLines.appendChild(rectStaffLine2)
        staffLines.appendChild(rectStaffLine3)
        staffLines.appendChild(rectStaffLine4)
        staffLines.appendChild(rectStaffLine5)

        // CLEF INIT
        let clef = Utils.createGroup(this.view["ID"] + "-Clef")
        clef.setAttributeNS(null, "transform", "translate(" + this.offset[1] + "," + this.paddingTopHeight + ")")
        let clefView = document.getElementById("T-Clef-" + this.clef).cloneNode(true)
        clefView.id = this.view["ID"] + "-Clef" + Utils.idPop()
        this.view["Clef"] = clef
        // this.offset[1] = Track.CLEF_WIDTH
        clef.appendChild(clefView)
        if(this.offset[1] == 0) {
            this.view["Clef"].setAttributeNS(null, "visibility", "hidden")
        }

        // KEY INIT
        let key = Utils.createGroup(this.view["ID"] + "-Key")
        key.setAttributeNS(null, "transform", "translate(" + this.offset[2] + "," + this.paddingTopHeight + ")")
        // key.setAttributeNS(null, "transform", "translate(0," + this.paddingTopHeight + ")")
        let keyView = document.getElementById("T-Key-" + this.key).cloneNode(true)
        keyView.id = this.view["ID"] + "-Key" + Utils.idPop()
        this.view["Key"] = key
        // this.offset[2] = Track.KEY_WIDTH[this.key]
        key.appendChild(keyView)
        if(this.offset[2] == 0) {
            this.view["Key"].setAttributeNS(null, "visibility", "hidden")
        }

        // METER INIT
        let meter = Utils.createGroup(this.view["ID"] + "-Meter")
        // meter.setAttributeNS(null, "transform", "translate(0," + this.paddingTopHeight + ")")
        meter.setAttributeNS(null, "transform", "translate(" + this.offset[3] + "," + this.paddingTopHeight + ")")
        let meterUpView = document.getElementById("T-Font-" + this.meterUp).cloneNode(true)
        let meterDownView = document.getElementById("T-Font-" + this.meterDown).cloneNode(true)
        meterDownView.setAttributeNS(null, "transform", "translate(0," + (this.staffLinesHeight / 2) + ")")
        meterUpView.id = this.view["ID"] + "-MeterUp-" + Utils.idPop()
        meterDownView.id = this.view["ID"] + "-MeterDown-" + Utils.idPop()
        this.view["Meter"] = meter
        // this.offset[3] = Track.METER_WIDTH
        meter.appendChild(meterUpView)
        meter.appendChild(meterDownView)
        if(this.offset[3] == 0) {
            this.view["Meter"].setAttributeNS(null, "visibility", "hidden")
        }

        this.setXYMeasure()

        //-----------------

        track.appendChild(meter)
        track.appendChild(clef)
        track.appendChild(key)
        track.appendChild(staffLines)
        track.appendChild(measure)
        stave.appendChild(track)
    }

    render() {

        this.view["Track"].setAttributeNS(null, "transform", "translate(" + this.x + "," + this.y + ")")

        let nodes = this.view["StaffLines"].childNodes
        for(let i = 0; i < nodes.length; i++) {
            nodes[i].setAttributeNS(null, "width", this.width)
            nodes[i].setAttributeNS(null, "y", this.paddingTopHeight + Note.HEAD_HEIGHT * i)
        }

        let xClef = this.offset[0]
        this.view["Clef"].setAttributeNS(null, "transform", "translate(" + xClef + "," + this.paddingTopHeight + ")")

        let xKey = this.offset[0] + this.offset[1]
        this.view["Key"].setAttributeNS(null, "transform", "translate(" + xKey + "," + this.paddingTopHeight + ")")

        let xMeter = this.offset[0] + this.offset[1] + this.offset[2]
        this.view["Meter"].setAttributeNS(null, "transform", "translate(" + xMeter + "," + this.paddingTopHeight + ")")

        let xMeasure = this.getOffset()
        this.view["Measure"].setAttributeNS(null, "transform", "translate(" + xMeasure + "," + this.paddingTopHeight + ")")

        for(let i = 0; i < this.noteGroup.length; i++) {
            this.noteGroup[i].render()
        }

        if(Config.DEV_MODE) {
            // this.view["Rect"].setAttributeNS(null, "opacity", 0.3)
            this.view["Rect"].setAttributeNS(null, "width", this.width)
            this.view["Rect"].setAttributeNS(null, "height", this.height)
        }
    }

}