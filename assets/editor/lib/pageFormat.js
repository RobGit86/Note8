export default class PageFormat {

    //--------------------//
    // PAGE VIEW MODES
    // 
    // 1. MultiPageView
    // 2. SinglePageView
    // 3. StripPageView
    //--------------------//

    static PAGE_VIEW = "MultiPageView"
    static PAGE_FORMAT = "A4"
    static PAGE_ORIENTATION = "Portrait"

    static PAGE_WIDTH = 210
    static PAGE_HEIGHT = 297

    static PAGES = 0

    static PAGE_GAP = 50

    static PAGE_FORMATS = {
        "A4": [210, 297],
        "A3": [297, 420],
        "USLetter": [216, 279],
        "USLegal": [216, 356],
        "USTabloid": [279, 432]
    }

    static setPageView(pageView) {

        let classes = document.getElementById("ScoreContainer").classList

        if(classes.length == 0) 
            classes.add(pageView)
        else {
            classes.remove(classes.value)
            classes.add(pageView)
        }
        PageFormat.PAGE_VIEW = pageView
    }

    static setPageFormat(format) {

        if(PageFormat.PAGE_VIEW == "MultiPageView") {

            let scoreContainer = document.getElementById("ScoreContainer")
            let width = Math.floor(window.screen.width * 60 / 100)
            let factor = width / 440

            let widthScaled = Math.floor(PageFormat.PAGE_FORMATS[format][0] * factor)
            let heightScaled = Math.floor(PageFormat.PAGE_FORMATS[format][1] * factor)

            if(PageFormat.PAGE_ORIENTATION == "Portrait") {
                scoreContainer.style.width = widthScaled + "px"
                scoreContainer.style.height = heightScaled + "px"
                PageFormat.PAGE_WIDTH = widthScaled
                PageFormat.PAGE_HEIGHT = heightScaled
            }

            if(PageFormat.PAGE_ORIENTATION == "Landscape") {
                scoreContainer.style.width = heightScaled + "px"
                scoreContainer.style.height = widthScaled + "px"
                PageFormat.PAGE_WIDTH = heightScaled
                PageFormat.PAGE_HEIGHT = widthScaled
            }
        }
    }

    static setPageOrientation(orientation) {

        let scoreContainer = document.getElementById("ScoreContainer")
        let tmp_width = PageFormat.PAGE_WIDTH
        let tmp_height = PageFormat.PAGE_HEIGHT

        if((PageFormat.PAGE_ORIENTATION == "Portrait" && orientation == "Landscape") ||
           (PageFormat.PAGE_ORIENTATION == "Landscape" && orientation == "Portrait")) {
            
            PageFormat.PAGE_WIDTH = tmp_height
            PageFormat.PAGE_HEIGHT = tmp_width

            scoreContainer.style.width = PageFormat.PAGE_WIDTH + "px"
            scoreContainer.style.height = PageFormat.PAGE_HEIGHT + "px"
        }

        PageFormat.PAGE_ORIENTATION = orientation
    }
}