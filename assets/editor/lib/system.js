import Config from './config.js'
import Utils from './utils.js'

import Page from './page.js'
import Stave from './stave.js'
import Track from './track.js'

export default class System {

    static SPACE = 20

    constructor(refScore) {

        this.refScore = refScore

        this.x = Page.MARGIN_PX["LEFT"]

        this.width = Page.MARGIN_PX["RIGHT"] - Page.MARGIN_PX["LEFT"]
        this.height = 200

        if(this.refScore.system.length == 0) {
            this.page = 0
            this.y = Page.MARGIN_PX["TOP_FIRST"]
        } else {
            this.page = this.refScore.page.length - 1
            this.y = this.refScore.system[this.refScore.system.length - 1].y + this.refScore.system[this.refScore.system.length - 1].height + System.SPACE
        }

        this.stave = []

        this.view = {
            ID: System.getId(),
            System: null,
            Rect: null
        }
    }

    static getId() { return "System-" + Utils.idPop() }

    setX(x) { this.x = x }
    setY(y) { this.y = y }
    moveDx(dx) { this.x += dx }
    moveDy(dy) { this.y += dy }
    setWidth() { this.width = Page.MARGIN_PX["RIGHT"] - Page.MARGIN_PX["LEFT"] }
    setWidthFixed(width) { this.width = width}
    setHeight() {

        if(this.stave.length > 0) {

            let height = 0

            for(let i = 0; i < this.stave.length; i++) {
                if(this.stave[i].height > height) {
                    height = this.stave[i].height
                }
            }
            this.height = height
        }
        else { 
            this.height = 200
        }
    }
    setHeightFixed(height) { this.height = height}

    moveToPage(page) {

        document.getElementById(this.refScore.page[page].view["ID"] + "-Systems")
        this.refScore.page[page].view["Page"].append(this.view["System"])
        this.page = page
    }

    getIndex() {

        for(let i = 0; i < this.refScore.system.length; i++) {
            if(this.refScore.system[i] === this) {
                return i
            }
        }
        return null
    }

    addStaveBefore() {

        let currentStave = this.refScore.pointer.getStave()
        let currentStaveIdx = currentStave.getIndex()

        let stave = new Stave(currentStave.meterUp, currentStave.meterDown, this)
        this.stave.splice(currentStaveIdx, 0, stave)
        stave.initView()

        for(let i = 0; i < currentStave.track.length; i++) {

            let clef = currentStave.track[i].clef
            let meterUp = currentStave.track[i].meterUp
            let meterDown = currentStave.track[i].meterDown
            let key = currentStave.track[i].key

            let track = new Track(clef, meterUp, meterDown, key, stave)

            track.paddingTopHeight = currentStave.track[i].paddingTopHeight
            track.paddingBottomHeight = currentStave.track[i].paddingBottomHeight
            track.setHeight()

            track.initView()
            track.fillEmpty()
            track.setWidth()

            stave.track.push(track)
        }

        stave.orderTracksVertical()
        stave.setWidth()
        stave.setHeight()

        this.refScore.pointer.group = 0

        this.refScore.fitMultiHorizontal()
        this.refScore.fitMultiVertical()
        this.refScore.render()
    }

    addStaveAfter() {

        let currentStave = this.refScore.pointer.getStave()
        let currentStaveIdx = currentStave.getIndex()

        let stave = new Stave(currentStave.meterUp, currentStave.meterDown, this)
        this.stave.splice(currentStaveIdx + 1, 0, stave)
        stave.initView()

        for(let i = 0; i < currentStave.track.length; i++) {

            let clef = currentStave.track[i].clef
            let meterUp = currentStave.track[i].meterUp
            let meterDown = currentStave.track[i].meterDown
            let key = currentStave.track[i].key

            let track = new Track(clef, meterUp, meterDown, key, stave)

            track.paddingTopHeight = currentStave.track[i].paddingTopHeight
            track.paddingBottomHeight = currentStave.track[i].paddingBottomHeight
            track.setHeight()

            track.initView()
            track.fillEmpty()
            track.setWidth()

            stave.track.push(track)
        }

        stave.orderTracksVertical()
        stave.setWidth()
        stave.setHeight()

        this.refScore.fitMultiHorizontal()
        this.refScore.fitMultiVertical()
        this.refScore.render()
    }

    removeStave() {

        console.log("CURRENT SYSTEM IS: " + this.refScore.pointer.system)
        console.log("CURRENT STAVE IS: " + this.refScore.pointer.stave)

        if(this.refScore.system[0].stave.length > 1) {
            let currentStave = this.refScore.pointer.getStave()
            let currentStaveIdx = null

            for(let i = 0; i < this.stave.length; i++) {
                if(this.stave[i] === currentStave) {
                    currentStaveIdx = i
                }
            }

            if(this.refScore.pointer.system == 0 && this.refScore.pointer.stave == 0 && this.refScore.system[0].stave.length > 1) {

                this.refScore.pointer.stave = 0
                this.refScore.pointer.group = 0

            } else {

                if(currentStaveIdx > 0) {
                    this.refScore.pointer.stave = currentStaveIdx - 1
                    this.refScore.pointer.group = 0
                } else {
                    this.refScore.pointer.system--
                    this.refScore.pointer.stave = this.refScore.system[this.refScore.pointer.system].stave.length - 1
                    this.refScore.pointer.group = 0
                }
            }
            
            this.stave[currentStaveIdx].removeView()
            this.stave.splice(currentStaveIdx, 1)

            this.setHeight()

            this.refScore.fitMultiHorizontal()
            this.refScore.fitMultiVertical()
            this.refScore.render()
        }
    }

    initView() {

        let page = document.getElementById(this.refScore.page[this.page].view["ID"] + "-Systems")

        let system = Utils.createGroup(this.view["ID"])
        system.setAttributeNS(null, "transform", "translate(" + this.x + "," + this.y + ")")
        this.view["System"] = system

        page.append(system)
        
        if(Config.DEV_MODE) {
            let rect = Utils.createRect(0, 0, this.width, this.height, 200, 200, 200)
            system.append(rect)
            this.view["Rect"] = rect
        }
    }

    render() {

        this.view["System"].setAttributeNS(null, "transform", "translate(" + this.x + "," + this.y + ")")

        if(Config.DEV_MODE) {
            this.view["Rect"].setAttributeNS(null, "width", this.width)
            this.view["Rect"].setAttributeNS(null, "height", this.height)
        }

        for(let i = 0; i < this.stave.length; i++) {
            this.stave[i].render()
        }
    }

    removeView() {

        this.view["System"].remove()
        this.view["System"] = null
    }
}