import Utils from './utils.js'

export default class Page {

    //--------------------//
    // PAGE VIEW MODES
    // 
    // 1. MultiPageView
    // 2. SinglePageView
    // 3. StripPageView
    //--------------------//

    static PAGE_FORMATS = {
        "A4": [210, 297],
        "A3": [297, 420],
        "USLetter": [216, 279],
        "USLegal": [216, 356],
        "USTabloid": [279, 432]
    }

    static PAGES = 0

    static VIEW = "MultiPageView"
    static FORMAT = "A4"
    static ORIENTATION = "Portrait"

    static WIDTH = 210
    static HEIGHT = 297

    static SPACE_FIRST = 20
    static SPACE = 40

    static MARGIN_RENDER = false

    static MARGIN = {
        "TOP_FIRST": 20,
        "TOP": 5,
        "BOTTOM": 5,
        "LEFT": 5,
        "RIGHT": 5
    }

    static MARGIN_PX = {
        "TOP_FIRST": Math.floor(Page.MARGIN["TOP_FIRST"] * Page.HEIGHT / 100),
        "TOP": Math.floor(Page.MARGIN["TOP"] * Page.HEIGHT / 100),
        "BOTTOM": Page.HEIGHT - (Math.floor(Page.MARGIN["BOTTOM"] * Page.HEIGHT / 100)),
        "LEFT": Math.floor(Page.MARGIN["LEFT"] * Page.WIDTH / 100),
        "RIGHT": Page.WIDTH - (Math.floor(Page.MARGIN["RIGHT"] * Page.WIDTH / 100))
    }

    constructor(refScore) {

        this.refScore = refScore

        this.x = 0
        this.y = 0

        this.first = true
        if(Page.PAGES > 0) this.first = false
        
        this.view = {
            ID: "Page-" + Utils.idPop(),
            Page: null,
            System: null,
            Margins: null,
            Tempo: null
        }
    }
    
    static setMargins(topFirst, top, bottom, left, right) {

        Page.MARGIN["TOP_FIRST"] = topFirst
        Page.MARGIN["TOP"] = top
        Page.MARGIN["BOTTOM"] = bottom
        Page.MARGIN["LEFT"] = left
        Page.MARGIN["RIGHT"] = right
        Page.updateMargins()
    }

    static updateMargins() {

        Page.MARGIN_PX["TOP_FIRST"] = Math.floor(Page.MARGIN["TOP_FIRST"] * Page.HEIGHT / 100)
        Page.MARGIN_PX["TOP"] = Math.floor(Page.MARGIN["TOP"] * Page.HEIGHT / 100)
        Page.MARGIN_PX["BOTTOM"] = Page.HEIGHT - (Math.floor(Page.MARGIN["BOTTOM"] * Page.HEIGHT / 100))
        Page.MARGIN_PX["LEFT"] = Math.floor(Page.MARGIN["LEFT"] * Page.WIDTH / 100)
        Page.MARGIN_PX["RIGHT"] = Page.WIDTH - (Math.floor(Page.MARGIN["RIGHT"] * Page.WIDTH / 100))
    }

    static setPageSize(width, height) {

        Page.WIDTH = width
        Page.HEIGHT = height
    }

    static setContainerSize(pages, zoom) {

        let scoreContainer = document.getElementById("ScoreContainer")
        scoreContainer.style.width = (zoom * Page.WIDTH) + "px"
        scoreContainer.style.height = (zoom * (pages.length * (Page.HEIGHT + Page.SPACE))) + "px"
    }

    static setPageView(pageView) {

        let classes = document.getElementById("ScoreContainer").classList

        if(classes.length == 0) 
            classes.add(pageView)
        else {
            classes.remove(classes.value)
            classes.add(pageView)
        }
        Page.VIEW = pageView

        //--TO DO FOR STRIP AND SINGLE VIEW
    }

    static setPageFormat(format, pages, zoom) {

        if(Page.VIEW == "MultiPageView") {

            let factor = (window.screen.width * 80 / 100 ) / 300

            let widthScaled = Math.floor(Page.PAGE_FORMATS[format][0] * factor)
            let heightScaled = Math.floor(Page.PAGE_FORMATS[format][1] * factor)

            if(Page.ORIENTATION == "Portrait") this.setPageSize(widthScaled, heightScaled)
            if(Page.ORIENTATION == "Landscape") this.setPageSize(heightScaled, widthScaled)
            this.setContainerSize(pages, zoom)

            let y   

            for(let i = 0; i < pages.length; i++) {
                pages[i].setWidth(Page.WIDTH)
                pages[i].setHeight(Page.HEIGHT)

                if(i == 0)
                    y = Page.SPACE_FIRST
                else
                    y = Page.SPACE_FIRST + Page.HEIGHT + Page.SPACE + ((Page.HEIGHT + Page.SPACE) * (i-1))
                pages[i].setY(y)
                Page.updateMargins()
            }
        }

        Page.FORMAT = format
        //---TO DO FOR STRIP AND SINGLE
    }

    static setPageOrientation(orientation, pages, zoom) {

        let tmp_width = Page.WIDTH
        let tmp_height = Page.HEIGHT

        if((Page.ORIENTATION == "Portrait" && orientation == "Landscape") ||
           (Page.ORIENTATION == "Landscape" && orientation == "Portrait")) {
            this.setPageSize(tmp_height, tmp_width)
        }
        this.setContainerSize(pages, zoom)
        
        let y

        for(let i = 0; i < pages.length; i++) {
            pages[i].setWidth(Page.WIDTH)
            pages[i].setHeight(Page.HEIGHT)

            if(i == 0)
                y = Page.SPACE_FIRST
            else
                y = Page.SPACE_FIRST + Page.HEIGHT + Page.SPACE + ((Page.HEIGHT + Page.SPACE) * (i-1))
            pages[i].setY(y)
            Page.updateMargins()
        }
        Page.ORIENTATION = orientation
    }

    setX(x) { this.x = x }
    setY(y) { this.y = y }
    setWidth(width) { Page.WIDTH = width }
    setHeight(height) { Page.HEIGHT = height }

    initView() {

        let page = Utils.createGroup(this.view["ID"])
        this.view["Page"] = page

        let rect = Utils.createRect(0, 0, Page.WIDTH, Page.HEIGHT, 230, 230, 230)
        page.appendChild(rect)

        let systems = Utils.createGroup(this.view["ID"] + "-Systems")
        page.appendChild(systems)

        let margins = Utils.createGroup(this.view["ID"] + "-Margins")

        let rectMarginTopFirst = Utils.createRect(0, 0, 0, 1, 255, 0, 0)
        let rectMarginTop = Utils.createRect(0, 0, 0, 1, 255, 0, 0)
        let rectMarginBottom = Utils.createRect(0, 0, 0, 1, 255, 0, 0)
        let rectMarginLeft = Utils.createRect(0, 0, 1, 0, 255, 0, 0)
        let rectMarginRight = Utils.createRect(0, 0, 1, 0, 255, 0, 0)

        if(this.first)
            margins.appendChild(rectMarginTopFirst)
        else
            margins.appendChild(rectMarginTop)
        margins.appendChild(rectMarginBottom)
        margins.appendChild(rectMarginLeft)
        margins.appendChild(rectMarginRight)

        page.appendChild(margins)
        document.getElementById("Pages").appendChild(page)

        if(this.first) {

            let tempo = Utils.createGroup(this.view["ID"] + "-Tempo")
            // let tempoRect = Utils.createRect(-10, 0, 100, 10, 255, 255, 255, 255)

            function clickTxt(e) {
                console.log("KLIK")
            }

            // tempoRect.addEventListener("click", clickTxt)

            // tempo.appendChild(tempoRect)

            let tempoGroup = Utils.createGroup(this.view["ID"] + "-Tempo-Group")

            let tempoImg = document.getElementById("T-Tempo").cloneNode(true)
            tempoImg.id = "TempoImg"

            let tempoTxt = document.createElementNS(Utils.SVG_NS, "text")
            tempoTxt.id = this.view["ID"] + "-Tempo-Group" + "-TXT"
            tempoTxt.textContent = this.refScore.tempo

            tempoGroup.appendChild(tempoImg)
            tempoGroup.appendChild(tempoTxt)
            tempoTxt.setAttributeNS(null, "x", 25)
            tempoTxt.setAttributeNS(null, "y", 9)

            tempo.append(tempoGroup)
            page.appendChild(tempo)

            this.view["Tempo"] = tempo
        }

        this.view["System"] = systems
        this.view["Margins"] = margins

        this.renderMargins()
    }

    renderMargins() {

        let margins = this.view["Margins"].children

        if(Page.MARGIN_RENDER) {

            if(this.first) {
                margins.item(0).setAttributeNS(null, "y", Math.floor(Page.MARGIN["TOP_FIRST"] * Page.HEIGHT / 100))
                margins.item(0).setAttributeNS(null, "width", Math.floor(Page.WIDTH))
            } else {
                margins.item(0).setAttributeNS(null, "y", Math.floor(Page.MARGIN["TOP"] * Page.HEIGHT / 100))
                margins.item(0).setAttributeNS(null, "width", Math.floor(Page.WIDTH))
            }
            margins.item(1).setAttributeNS(null, "y", Page.HEIGHT - (Math.floor(Page.MARGIN["BOTTOM"] * Page.HEIGHT / 100)))
            margins.item(1).setAttributeNS(null, "width", Math.floor(Page.WIDTH))
            margins.item(2).setAttributeNS(null, "x", Page.MARGIN_PX["LEFT"])
            margins.item(2).setAttributeNS(null, "height", Math.floor(Page.HEIGHT))
            margins.item(3).setAttributeNS(null, "x", Page.WIDTH - (Math.floor(Page.MARGIN["RIGHT"] * Page.WIDTH / 100)))
            margins.item(3).setAttributeNS(null, "height", Math.floor(Page.HEIGHT))
        }
    }

    renderView() {

        this.view["Page"].setAttributeNS(null, "transform", "translate(" + this.x + "," + this.y + ")")
        this.view["Page"].firstChild.setAttributeNS(null, "width", Page.WIDTH)
        this.view["Page"].firstChild.setAttributeNS(null, "height", Page.HEIGHT)

        if(this.first) {
            this.view["Tempo"].setAttributeNS(null, "transform", "translate(" + (Page.MARGIN_PX["LEFT"] + 50) + "," + (Page.MARGIN_PX["TOP_FIRST"] - 50) + ")")
            document.getElementById(this.view["ID"] + "-Tempo-Group" + "-TXT").textContent = this.refScore.tempo
        }
        this.renderMargins()
    }

    removeView() {

        this.view["Page"].remove()
    }
}