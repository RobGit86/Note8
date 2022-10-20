import Utils from "./utils.js"

import Page from "./page.js"

import System from "./system.js"
import Stave from "./stave.js"
import Track from "./track.js"
import Pointer from "./pointer.js"
import Player from "./player.js"

export default class Score {

    static ZOOM = 1

    constructor(id, tempo = 120, composer = "Composer", title = "Title", arrange = "Arrange") {

        this.id = id

        this.tempo = tempo
        this.title = title
        this.composer = composer
        this.arrange = arrange

        this.page = []
        this.system = []

        this.pointer = null
    }

    setTempo(tempo) {

        this.tempo = tempo
        this.page[0].renderView()
    }

    initPage() {

        let pages = Utils.createGroup("Pages")

        document.getElementById("SvgScore").appendChild(pages)
        this.page.push(new Page(this))
        this.page[0].initView()
        Page.PAGES++
    }

    initSystem(meterUp, meterDown, tracks, key) {

        let system = new System(this)
        this.system.push(system)
        system.initView()

        let stave = new Stave(meterUp, meterDown, system)
        system.stave.push(stave)
        stave.initView()

        let trackFirst = new Track(tracks[0], meterUp, meterDown, key, this.system[0].stave[0])
        this.system[0].stave[0].track.push(trackFirst)
        trackFirst.initView()
        trackFirst.fillEmpty()
        trackFirst.setWidth()

        for(let i = 1; i < tracks.length; i++) {
            let track = new Track(tracks[i], meterUp, meterDown, key, this.system[0].stave[0])
            this.system[0].stave[0].track.push(track)
            track.initView()
            track.fillEmpty()
            track.setWidth()
        }

        this.system[0].stave[0].orderTracksVertical()

        this.system[0].stave[0].setWidth()
        this.system[0].stave[0].setHeight()

        this.system[0].setHeight()
    }

    initPointer() {

        let clef = this.system[0].stave[0].track[0].clef
        this.pointer = new Pointer(0, 0, clef, this)
        this.pointer.setBasePosition()
        this.pointer.initView()
    }

    setMargins(topFirst, top, bottom, left, right) { 

        Page.setMargins(topFirst, top, bottom, left, right)
    }

    addPage() {

        if(Page.VIEW == "MultiPageView") {
            
            let y = Page.SPACE_FIRST + Page.HEIGHT + Page.SPACE + ((Page.HEIGHT + Page.SPACE) * (Page.PAGES - 1))
            let page = new Page(this)
            page.setY(y)
            this.page.push(page)
            this.page[this.page.length - 1].initView()    
            Page.PAGES++
            Page.setContainerSize(this.page, Score.ZOOM)

            page.renderView()
        }
    }

    removePage() {

        if(this.page.length > 1) {
            this.page[this.page.length - 1].removeView()
            this.page.pop()
            Page.PAGES--
            Page.setContainerSize(this.page, Score.ZOOM)
        }
    }
    
    zoom(scale) {

        let pages = document.getElementById("Pages")
        pages.setAttributeNS(null, "transform", "scale(" + scale + ")")
        let scoreContainer = document.getElementById("ScoreContainer")
        let width = Page.WIDTH * scale
        let height = Page.HEIGHT * scale
        scoreContainer.style.width = width + "px"
        scoreContainer.style.height = height + "px"
        Score.ZOOM = scale
        Page.setContainerSize(this.page, Score.ZOOM)
    }

    addSystem() {

        let system = new System(this)
        system.initView()
        this.system.push(system)
    }

    scaleStavesHorizontal() {

        let scale

        for(let i = 0; i < this.system.length - 1; i++) {

            let x2 = (this.system[i].stave[this.system[i].stave.length-1].x + this.system[i].stave[this.system[i].stave.length - 1].width)
            let gap = this.system[i].width - x2

            gap = gap / this.system[i].stave.length

            if(gap > 0) {

                for(let j = 0; j < this.system[i].stave.length; j++) {

                    scale = ( (this.system[i].stave[j].track[0].width - this.system[i].stave[j].track[0].getOffset()) + gap ) / 
                    (this.system[i].stave[j].track[0].width - this.system[i].stave[j].track[0].getOffset())

                    for(let k = 0; k < this.system[i].stave[j].track.length; k++) {
                        this.system[i].stave[j].track[k].scaleXMeasure(scale)
                    }
                    this.system[i].stave[j].setWidth()
                }

                for(let j = 0; j < this.system[i].stave.length; j++) {

                    if(j == 0) {
                        this.system[i].stave[j].setX(0)
                    } else {
                        this.system[i].stave[j].setX(this.system[i].stave[j-1].x + this.system[i].stave[j-1].width)
                    }
                }
            }
        }
    }

    fitMultiHorizontal() {

        let refStave = this.pointer.getStave()

        let staves = []
        let firstInRow = [0]
        let lastInRow = []

        for(let i = 0; i < this.system.length; i++) {
            for(let j = 0; j < this.system[i].stave.length; j++) {
                staves.push(this.system[i].stave[j])
            }
        }

        for(let i = 0; i < this.system.length; i++) {
            for(let j = 0; j < this.system[i].stave.length; j++) {
                this.system[i].stave[j].fitNotesHorizontalAll()
            }
        }

        for(let i = 0; i < staves.length; i++) {

            if(i == 0) {
                
                staves[i].setX(0)
                staves[i].setY(0)

                staves[i].showClefs()
                staves[i].showKeys()
                staves[i].showMeters()
                staves[i].setWidth()

            } else {

                staves[i].setX(staves[i-1].x + staves[i-1].width)
                staves[i].setY(staves[i-1].y)

                staves[i].showClefs(false)
                staves[i].showKeys(false)
                staves[i].showMeters(false)
                staves[i].setWidth()

                if(staves[i].x + staves[i].width > this.system[0].width) {

                    staves[i].setX(0)
                    staves[i].setY(0)

                    staves[i].showClefs()
                    staves[i].showKeys()
                    staves[i].showMeters(false)
                    staves[i].setWidth()

                    firstInRow.push(i)
                    lastInRow.push(i-1)
                }
            }
        }

        let systemCounter = 0
        let position = 0

        for(let k = 0; k < lastInRow.length; k++) {

            position = 0
            for(let w = firstInRow[k]; w <= lastInRow[k]; w++) {
                staves[w].moveToSystem(systemCounter, position)
                position++
            }
            systemCounter++
        }

        position = 0
        for(let i = firstInRow[firstInRow.length - 1]; i < staves.length; i++) {
            staves[i].moveToSystem(systemCounter, position)
            position++
        }
        
       
        for(let i = this.system.length - 1; i >=0; i--) {
            if(this.system[i].stave.length == 0) {
                this.system[i].removeView()
                this.system.pop()
            } else {
                break;
            }
        }

        this.scaleStavesHorizontal()

        // POINTER UPDATING
        this.pointer.system = refStave.refSystem.getIndex()
        this.pointer.stave = refStave.getIndex()
        this.pointer.setPosition()
    }

    fitMultiVertical() {

        for(let i = 0; i < this.system.length; i++) {
            this.system[i].setHeight()
        }

        let counterPage = 0

        this.system[0].setY(Page.MARGIN_PX["TOP_FIRST"])

        for(let i = 1; i < this.system.length; i++) {

            this.system[i].setY(this.system[i-1].y + this.system[i-1].height + System.SPACE)

            if(this.system[i].y + this.system[i].height > Page.MARGIN_PX["BOTTOM"]) {

                counterPage++

                if(this.page[counterPage] == undefined) {
                    this.addPage()
                }

                this.system[i].setY(Page.MARGIN_PX["TOP"])

                if(this.system[i].page != counterPage) {
                    this.system[i].moveToPage(counterPage)
                }
            } else {

                this.system[i].setY(this.system[i-1].y + this.system[i-1].height + System.SPACE)
            }
        }

        let lastPage = this.system[this.system.length - 1].page
        while((this.page.length - 1) > lastPage) {
            this.removePage()
        }

        let trackNumber = this.system[0].stave[0].track.length

        for(let i = 0; i < this.system.length; i++) {

            let stavesNumber = this.system[i].stave.length

            for(let j = 0; j < trackNumber; j++) {

                let paddingTop = 0
                let paddingBottom = 0

                for(let k = 0; k < stavesNumber; k++) {

                    if(this.system[i].stave[k].track[j].paddingTopHeight > paddingTop) {
                        paddingTop = this.system[i].stave[k].track[j].paddingTopHeight
                    }
                    if(this.system[i].stave[k].track[j].paddingBottomHeight > paddingBottom) {
                        paddingBottom = this.system[i].stave[k].track[j].paddingBottomHeight
                    }
                }

                for(let l = 0; l < stavesNumber; l++) {

                    // this.system[i].stave[l].track[j].setPadding(0, paddingTop)
                    // this.system[i].stave[l].track[j].setPadding(1, paddingBottom)
                    // this.system[i].stave[l].track[j].setHeight()

                    // if(this.system[i].stave[k].track[j].paddingTopHeight > paddingTop) {
                    //     paddingTop = this.system[i].stave[k].track[j].paddingTopHeight
                    // }
                    // if(this.system[i].stave[k].track[j].paddingBottomHeight > paddingBottom) {
                    //     paddingBottom = this.system[i].stave[k].track[j].paddingBottomHeight
                    // }
                }

                for(let k = 0; k < stavesNumber; k++) {

                    // this.system[i].stave[k].setHeight()
                }

                // console.log(paddingTop)
                // console.log(paddingBottom)
                // console.log("--------------------")
            }

            this.system[i].setHeight()
        }
    }

    changePaddingTracks(track, padding, dp) {

        for(let i = 0; i < this.system.length; i++) {
            for(let j = 0; j < this.system[i].stave.length; j++) {

                this.system[i].stave[j].track[track].addPadding(padding, dp)
                this.system[i].stave[j].setHeight()
            }
            this.system[i].setHeight()
        }
        this.fitMultiVertical()
    }


    beamStaves() {

        for(let i = 0; i < this.system.length; i++) {
            for(let j = 0; j < this.system[i].stave.length; j++) {
                for(let k = 0; k < this.system[i].stave[j].track.length; k++) {
                    this.system[i].stave[j].track[k].beamTrack()
                }
            }
        }
    }

    render() {

        this.beamStaves()

        this.pointer.render()

        for(let i = 0; i < this.system.length; i++) {
            this.system[i].render()
        }
    }

    playAll() {

        Player.playAll(this.tempo, this.system)
    }

    stopAll() {

        Player.stopAll();
    }

    save() {

        this.saveScore()
        this.saveParams()
    }

    saveScore() {

        const getCircularReplacer = () => {
            const seen = new WeakSet();
            return (key, value) => {
                if (typeof value === "object" && value !== null) {
                    if (seen.has(value)) {
                        return;
                    }
                    seen.add(value);
                }
                return value;
            };
        };

        let savedScore = JSON.stringify(this, getCircularReplacer())

        const xhrScore = new XMLHttpRequest()

        xhrScore.open("POST", "/ajaxSave")
        xhrScore.setRequestHeader("Content-type", "application/json")
        xhrScore.send(savedScore)
    }

    saveParams() {

        let params = {
            pages: this.page.length,
            zoom: Score.ZOOM
        }

        let savedParams = JSON.stringify(params)

        const xhrParams = new XMLHttpRequest() 

        xhrParams.open("POST", "/ajaxSaveParams")
        xhrParams.setRequestHeader("Content-type", "application/json")
        xhrParams.send(savedParams)
    }
}