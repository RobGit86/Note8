import Config from './config'
import Track from './track'
import Utils from './utils'
import Note from './note.js'

export default class Stave {

    constructor(meterUp, meterDown, refSystem) {

        this.refSystem = refSystem

        this.x = 0
        this.y = 0
        this.width = 100
        this.height = 100

        this.meterUp = meterUp
        this.meterDown = meterDown

        this.track = []

        this.view = {
            ID: Stave.getId(),
            Stave: null,
            Tracks: null,
            Bars: null,
            BarBegin: null,
            BarEnd: null,
            Rect: null
        }
    }

    static getId() { return "Stave-" + Utils.idPop() }
    getRef() { return this}

    setX(x) { this.x = x }
    setY(y) { this.y = y }
    moveDx(dx) { this.x += dx }
    moveDy(dy) { this.y += dy }
    setWidth() { 

        this.width = this.getLongestTrack()

        for(let i = 0; i < this.track.length; i++) {
            this.track[i].setWidthFixed(this.width)
        }
    }
    setWidthFixed(width) { this.width = width}
    setHeight() {

        let height = 0

        if(this.track.length > 0) {
            for(let i = 0; i < this.track.length; i++) {
                height += this.track[i].height
                if(i > 0) {
                    this.track[i].y = this.track[i-1].height + this.track[i-1].y
                }
            }
            this.height = height
        } else {
            this.height = 100
        }
    }
    setHeightFixed(height) { this.height = height }

    setWidthAllTracks() {

        for(let i = 0; i < this.track.length; i++) {
            this.track[i].setWidth()
        }
    }

    setWidthAllTracksFixed() {

        this.setWidthAllTracks()
        let width = this.getLongestTrack()
        for(let i = 0; i < this.track.length; i++) {
            this.track[i].setWidthFixed(width)
        }
    }

    getIndex() {

        for(let i = 0; i < this.refSystem.stave.length; i++) {
            if(this.refSystem.stave[i] === this) {
                return i
            }
        }
        return null
    }

    moveToSystem(targetSystemIdx, xPosition) {

        let currentSystemIdx = this.refSystem.getIndex()
        let staveIdx = this.getIndex()        

        if(currentSystemIdx != targetSystemIdx) {

            if(this.refSystem.refScore.system[targetSystemIdx] == undefined) {
                this.refSystem.refScore.addSystem()
            }

            this.refSystem.refScore.system[targetSystemIdx].view["System"].appendChild(this.view["Stave"])
            this.refSystem.refScore.system[targetSystemIdx].stave.splice(xPosition, 0, this)
            this.refSystem.refScore.system[currentSystemIdx].stave.splice(staveIdx, 1)
            this.refSystem = this.refSystem.refScore.system[targetSystemIdx]
            
        } else {
            // console.log("TEN SAM SYSTEM !!!")
        }
    }

    getLongestTrack() {

        let width = 0
        for(let i = 0; i < this.track.length; i++) {
            if(this.track[i].width > width) {
                width = this.track[i].width
            }
        }
        return width
    }

    showClefs(notHidden = true) {

        for(let i = 0; i < this.track.length; i++) {
            this.track[i].showClef(notHidden)
        }
    }

    showKeys(notHidden = true) {

        for(let i = 0; i < this.track.length; i++) {
            this.track[i].showKey(notHidden)
        }
    }

    showMeters(notHidden = true) {

        for(let i = 0; i < this.track.length; i++) {
            this.track[i].showMeter(notHidden)
        }
    }

    orderTracksVertical() {

        for(let i = 0; i < this.track.length; i++) {
            if(i == 0) {
                this.track[0].setY(0)
            } else {
                this.track[i].setY(this.track[i-1].y + this.track[i-1].height)
            }
        }
    }

    fitNotesHorizontalAll() {

        let accumulator = 0
        let noteDuraion = 0
        let notes = []
        let notesNotSorted = []

        // MAKE NOTES ARRAY + SET PROPER POSITIONS
        for(let i = 0; i < this.track.length; i++) {

            accumulator = 0

            for(let j = 0; j < this.track[i].noteGroup.length; j++) {
                noteDuraion = this.track[i].noteGroup[j].getRealDuration()             
                notes.push([j, i, accumulator])
                notesNotSorted.push([j, i, accumulator])
                accumulator += noteDuraion
            }
        }
        // SORT NOTES ARRAY
        let tmp
        for(let i = 0; i < notes.length; i++) {
            for(let j = i + 1; j < notes.length; j++) {
                if(notes[j][2] < notes[i][2]) {
                    tmp = notes[i]
                    notes[i] = notes[j]
                    notes[j] = tmp
                }
            }
        }
        // DX REMOVAL TOOL 
        for(let i = 1; i < notes.length; i++) {
            let dx = notes[i][2] - notes[i-1][2]
            // console.log("DX: " + dx)
            if(Math.abs(dx) > 0 && Math.abs(dx) < 0.00000000001) {
                notes[i-1][2] = notes[i][2]
            }
        }
        // FUNCTIONS
        function getIdxGroup(noteIdx) {
            let result = []
            for(let i = 0; i < notes.length; i++) {
                if(notes[i][2] == notes[noteIdx][2]) {
                    result.push(i);
                    break;
                }
            }
            for(let i = notes.length-1; i >= 0; i--) {
                if(notes[i][2] == notes[noteIdx][2]) {
                    result.push(i);
                    break;
                }
            }
            return result
        }

        function isGroup(noteIdx) {
            let result = getIdxGroup(noteIdx)
            if(result[0] == result[1]) {
                return false
            } else {
                return true
            }
        }

        function isPreviousNoteOnTrack(noteIdx) {

            let groupIdxCurrent = getIdxGroup(noteIdx)
            let groupIdxPrevious = getIdxGroup(groupIdxCurrent[0] - 1)

            for(let i = groupIdxPrevious[0]; i <= groupIdxPrevious[1]; i++) {
                if(notes[i][1] == notes[noteIdx][1]) {
                    return i
                }
            }
            return -1
        }

        let first = notes.length
        for(let t = 0; t < notes.length; t++) {
            if(notes[t][2] > 0) {
                first = t;
                break;
            }
        }

        // console.log("%cSTART !!!",'background: #154; color: purple')
        for(let i = first; i < notes.length; i++) {

            // console.log("%cNUTA " + notes[i][0] + " TRACK " + notes[i][1] + ":",'background: #222; color: #bada55')
            let currentIdx = getIdxGroup(i)
            let previousIdx = getIdxGroup(currentIdx[0] - 1)
            let isCurrentGroup = isGroup(i)
            let isPreviousGroup = isGroup(currentIdx[0] - 1)
            let isPrevOnTrack = isPreviousNoteOnTrack(i)

            // CASE 1 - DOBRE NIE RUSZAĆ !
            if(!isCurrentGroup && !isPreviousGroup) {
                // console.log("%cONE <-- ONE",'background: #222; color: red')
                if(isPrevOnTrack >= 0) { // OK - DONT MOVE

                    let x = this.track[notes[isPrevOnTrack][1]].noteGroup[notes[isPrevOnTrack][0]].x +
                            this.track[notes[isPrevOnTrack][1]].noteGroup[notes[isPrevOnTrack][0]].width

                    this.track[notes[i][1]].noteGroup[notes[i][0]].setX(x)
                } else { // OK - DONT MOVE

                    let durationDiff = notes[i][2] - notes[previousIdx[0]][2]
                    let dur = this.track[notes[previousIdx[0]][1]].noteGroup[notes[previousIdx[0]][0]].getRealDuration()
                    let frac = durationDiff / dur

                    let widtPrev = this.track[notes[previousIdx[0]][1]].noteGroup[notes[previousIdx[0]][0]].width
                    let off = this.track[notes[previousIdx[0]][1]].noteGroup[notes[previousIdx[0]][0]].note[0].getSpaceBefore()

                    let x = this.track[notes[previousIdx[0]][1]].noteGroup[notes[previousIdx[0]][0]].x + 
                    this.track[notes[previousIdx[0]][1]].noteGroup[notes[previousIdx[0]][0]].note[0].getSpaceBefore() +
                    (frac * (widtPrev - off))

                    this.track[notes[i][1]].noteGroup[notes[i][0]].setX(x)
                }
            }
            // CASE 2 - DO POPRAWY B (TYLKO > 3 ŚCIEŻKI)
            if(!isCurrentGroup && isPreviousGroup) {
                // console.log("%cMANY <-- ONE",'background: #222; color: pink')
                if(isPrevOnTrack >= 0) { // OK - DONT MOVE

                    let idxShortest = previousIdx[0]
                    let width = this.track[notes[idxShortest][1]].noteGroup[notes[idxShortest][0]].width

                    for(let k = previousIdx[0]; k <= previousIdx[1]; k++) {
                        if(this.track[notes[k][1]].noteGroup[notes[k][0]].width < width) {
                            width = this.track[notes[k][1]].noteGroup[notes[k][0]].width
                            idxShortest = k
                        }
                    }

                    let x = this.track[notes[idxShortest][1]].noteGroup[notes[idxShortest][0]].x + width

                    this.track[notes[i][1]].noteGroup[notes[i][0]].setX(x)

                } else {
                    
                    let duration = 0
                    let idxShortest = previousIdx[0]

                    for(let k = previousIdx[0]; k <= previousIdx[1]; k++) {
                        if(this.track[notes[k][1]].noteGroup[notes[k][0]].duration > duration) {
                            duration = this.track[notes[k][1]].noteGroup[notes[k][0]].duration
                            idxShortest = k
                        }
                    }

                    let x = this.track[notes[idxShortest][1]].noteGroup[notes[idxShortest][0]].x + 
                            this.track[notes[idxShortest][1]].noteGroup[notes[idxShortest][0]].width

                    this.track[notes[i][1]].noteGroup[notes[i][0]].setX(x)
                }
            }
            // CASE 3 - DO ZROBIENIA b)
            if(isCurrentGroup && !isPreviousGroup) {

                if(isPrevOnTrack >= 0) {

                    let x = this.track[notes[isPrevOnTrack][1]].noteGroup[notes[isPrevOnTrack][0]].x +
                            this.track[notes[isPrevOnTrack][1]].noteGroup[notes[isPrevOnTrack][0]].width

                    let offset = 0
                    let offsetTmp

                    for(let k = currentIdx[0]; k <= currentIdx[1]; k++) {
                        offsetTmp = this.track[notes[k][1]].noteGroup[notes[k][0]].getSpaceBefore()
                        if(offsetTmp > offset) {
                            offset = offsetTmp
                        }
                    }

                    for(let d = currentIdx[0]; d <= currentIdx[1]; d++) {
                        this.track[notes[d][1]].noteGroup[notes[d][0]].setX(x + (offset - this.track[notes[d][1]].noteGroup[notes[d][0]].getSpaceBefore()))
                    }
                    i = currentIdx[1]

                } else {

                    let x = this.track[notes[previousIdx[0]][1]].noteGroup[notes[previousIdx[0]][0]].x +
                            this.track[notes[previousIdx[0]][1]].noteGroup[notes[previousIdx[0]][0]].width

                    for(let k = currentIdx[0]; k < currentIdx[1]; k++) {
                        this.track[notes[k][1]].noteGroup[notes[k][0]].setX(x)
                    }
                }
            }
            // CASE 4 - ZROBIC B (TYLKO > 3 ŚCIEŻKI)
            // console.log("%cMANY <-- MANY",'background: #222; color: blue')
            if(isCurrentGroup && isPreviousGroup) {

                if(isPrevOnTrack >= 0) {

                    let width = 0
                    let idxLongest = previousIdx[0]

                    for(let k = previousIdx[0]; k <= previousIdx[1]; k++) {
                        if(this.track[notes[k][1]].noteGroup[notes[k][0]].width > width) {
                            width = this.track[notes[k][1]].noteGroup[notes[k][0]].width
                            idxLongest = k
                        }
                    }

                    let x = this.track[notes[idxLongest][1]].noteGroup[notes[idxLongest][0]].x + 
                            this.track[notes[idxLongest][1]].noteGroup[notes[idxLongest][0]].width

                    let offset = 0
                    let offsetTmp

                    for(let k = currentIdx[0]; k <= currentIdx[1]; k++) {
                        offsetTmp = this.track[notes[k][1]].noteGroup[notes[k][0]].getSpaceBefore()
                        if(offsetTmp > offset) {
                            offset = offsetTmp
                        }
                    }
                    for(let d = currentIdx[0]; d <= currentIdx[1]; d++) {
                        this.track[notes[d][1]].noteGroup[notes[d][0]].setX(x + (offset - this.track[notes[d][1]].noteGroup[notes[d][0]].getSpaceBefore()))
                    }
                    i = currentIdx[1]

                } else {
                    console.log("DO ROBOTY !!")
                }
            }
        }
        this.setWidth()
    }

    initView() {

        let system = document.getElementById(this.refSystem.view["ID"])

        let stave = Utils.createGroup(this.view["ID"])
        stave.setAttributeNS(null, "transform", "translate(" + this.x + "," + this.y + ")")
        this.view["Stave"] = stave
    
        system.appendChild(stave)

        //--RECT OPTIONAL--//
        if(Config.DEV_MODE) {
            let rect = Utils.createRect(0, 0, this.width, this.height, 255, 100, 100)
            stave.appendChild(rect)
            this.view["Rect"] = rect
        }

        let tracks = Utils.createGroup(this.view["ID"] + "-Tracks")

        let bars = Utils.createGroup(this.view["ID"] + "-Bars")
        this.view["Bars"] = bars

        let barBegin = Utils.createRect(0, 0, Note.STAFF_LINE_HEIGHT, 0, 0, 0, 0)
        this.view["BarBegin"] = barBegin

        let barEnd = Utils.createRect(this.width, 0, Note.STAFF_LINE_HEIGHT, 0, 0, 0, 0)
        this.view["BarEnd"] = barEnd

        bars.appendChild(barBegin)
        bars.appendChild(barEnd)

        stave.appendChild(tracks)
        stave.appendChild(bars)

        this.view["Tracks"] = tracks
    }

    render() {

        this.view["Stave"].setAttributeNS(null, "transform", "translate(" + this.x + "," + this.y + ")")

        for(let i = 0; i < this.track.length; i++) {
            this.track[i].render()
        }

        if(this.track.length > 0) {

            let y1 = this.track[0].y + this.track[0].paddingTopHeight
            let y2 = this.track[this.track.length-1].y + this.track[this.track.length-1].paddingTopHeight + this.track[this.track.length-1].staffLinesHeight
            let barHeight = y2 - y1

            if(this.x == 0) {
                this.view["BarBegin"].setAttributeNS(null, "y", this.track[0].paddingTopHeight)
                this.view["BarBegin"].setAttributeNS(null, "height", barHeight)
            } else {
                this.view["BarBegin"].setAttributeNS(null, "y", this.track[0].paddingTopHeight)
                this.view["BarBegin"].setAttributeNS(null, "height", 0)
            }

            this.view["BarEnd"].setAttributeNS(null, "x", this.width)
            this.view["BarEnd"].setAttributeNS(null, "y", this.track[0].paddingTopHeight)
            this.view["BarEnd"].setAttributeNS(null, "height", barHeight)
        }

        if(Config.DEV_MODE) {
            this.view["Rect"].setAttributeNS(null, "opacity", 0.3)
            this.view["Rect"].setAttributeNS(null, "width", this.width)
            this.view["Rect"].setAttributeNS(null, "height", this.height)
        }
    }

    removeView() {

        document.getElementById(this.view["ID"]).remove()
    }
}