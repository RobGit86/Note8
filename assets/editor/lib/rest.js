import NotesAndRests from './notesAndRests.js'

import Config from './config.js'
import Utils from "./utils"

import Note from "./note.js"

export default class Rest extends NotesAndRests{

    static HEAD_WIDTH = { 0: 11, 1: 11, 2: 11, 3: 11, 4: 11, 5: 13, 6: 15, 7: 19 }
    static MIN_SPACE = { 0: 50, 1: 40, 2: 30, 3: 20, 4: 10, 5: 5, 6: 3, 7: 1 }

    static HEIGHT = Note.HEAD_HEIGHT * 4

    constructor(duration, refNoteGroup) {
        
        super(duration)

        this.refGroup = refNoteGroup
        this.type = "REST"

        this.spaceBefore = [0]
        this.spaceBody = Rest.HEAD_WIDTH[duration]
        this.spaceAfter = [Rest.MIN_SPACE[this.duration]]

        this.x = 0
        this.y = 0
        this.width = this.getWidth()
        this.height = Rest.HEIGHT

        this.xHead = 0
        this.yHead = 0

        this.view = {
            ID: "Rest-" + Utils.idPop(),
            Rest: null,
            Body: null,
            Rect: null,
            RectBody: null
        }
    }

    setX(x) { this.x = x }
    setY(y) { this.y = y }
    moveDx(dx) { this.x += dx }
    moveDy(dy) { this.y += dy }
    
    getWidth() { return this.getSpaceBefore() + this.spaceBody + this.getSpaceAfter() }
    setWidth() { this.width = this.getWidth() }
    getSpaceBefore() { return this.spaceBefore.reduce((a, b) => a + b, 0) }
    getSpaceAfter() { return this.spaceAfter.reduce((a, b) => a + b, 0) }

    decreaseDuration() {

        if(this.duration < NotesAndRests.DURATION_MIN_MAX[1]) {

            this.duration++

            this.spaceBody = Rest.HEAD_WIDTH[this.duration]
            this.spaceAfter = [Rest.MIN_SPACE[this.duration]]

            let head = this.getHeadTemplate()
            this.view["Head"].remove()
            this.view["Body"].append(head)
            this.view["Head"] = head

            this.setWidth()
        }
    }

    increaseDuration() {

        if(this.duration > NotesAndRests.DURATION_MIN_MAX[0]) {

            this.duration--

            this.spaceBody = Rest.HEAD_WIDTH[this.duration]
            this.spaceAfter = [Rest.MIN_SPACE[this.duration]]

            let head = this.getHeadTemplate()
            this.view["Head"].remove()
            this.view["Body"].append(head)
            this.view["Head"] = head

            this.setWidth()
        }
    }

    getHeadTemplate() {

        let head = document.getElementById("T-Rest-" + this.duration).cloneNode(true)
        return head
    }

    // INITIALIZING VIEWS
    initView() {

        let noteGroup = document.getElementById(this.refGroup.view["ID"])
        let restStack = Utils.createGroup(this.view["ID"])
        let restBody = Utils.createGroup(this.view["ID"] + "-Body")

        restStack.setAttributeNS(null, "transform", "translate(" + this.x + "," + this.y +")")
        restBody.setAttributeNS(null, "transform", "translate(" + this.getSpaceBefore() + ",0)")

        //---RECT OPTIONAL---//
        if(Config.DEV_MODE) {
            let rectRestStack = Utils.createRect(0, 15, this.width, 5, 0, 255, 0)
            let rectRestBody = Utils.createRect(0, 15, this.width, 5, 255, 255, 0)
            restBody.append(rectRestBody)
            restStack.append(rectRestStack)
            this.view["Rect"] = rectRestStack
            this.view["RectBody"] = rectRestBody
        }

        let head = this.getHeadTemplate()
        head.id = this.view["ID"] + "-Head"

        restBody.append(head)
        restStack.append(restBody)
        noteGroup.append(restStack)
        
        this.view["Rest"] = restStack
        this.view["Body"] = restBody
        this.view["Head"] = head
    }

    // RENDER FUCNTIONS
    render() {

        this.view["Rest"].setAttributeNS(null, "transform", "translate(" + this.x + "," + this.y + ")")
        this.view["Head"].setAttributeNS(null, "transform", "translate(" + this.getSpaceBefore()+ "," + this.yHead + ")")

        if(this.dotted) {
            let x = this.spaces[0]
            this.view["Dot"].setAttributeNS(null, "transform", "translate(" + x + "," + 0 + ")")
        }

        //---RECT RENDER OPTIONAL---//
        if(Config.DEV_MODE) {
            this.view["Rect"].setAttributeNS(null, "width", this.width + this.getSpaceBefore())
            this.view["Rect"].setAttributeNS(null, "height", 5)

            this.view["RectBody"].setAttributeNS(null, "width", this.width + this.getSpaceBefore())
            this.view["RectBody"].setAttributeNS(null, "height", 5)
        }
        //--------------------------//
    }
 
    removeView() {

        document.getElementById(this.view["ID"]).remove()
        this.clearViews()
    }

    clearViews() {

        this.view["Rest"] = null
        this.view["Body"] = null
        this.view["Head"] = null
    }
}