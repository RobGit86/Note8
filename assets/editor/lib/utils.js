export default class Utils {

    static ID_POOL = 0
    static SVG_NS = "http://www.w3.org/2000/svg"

    static idPop() {

        Utils.ID_POOL++
        return (Utils.ID_POOL - 1)
    }

    static createGroup(id) {

        let group = document.createElementNS(Utils.SVG_NS, "g")
        group.setAttributeNS(null, "id", id)

        return group
    }

    static createRect(x, y, width, height, r, g, b, a = 255) {

        let color = "rgba(" + r + ", " + g + ", " + b + "," + a + ")"

        let rect = document.createElementNS(Utils.SVG_NS, "rect")
        rect.setAttributeNS(null, "x", x)
        rect.setAttributeNS(null, "y", y)
        rect.setAttributeNS(null, "width", width)
        rect.setAttributeNS(null, "height", height)
        rect.setAttributeNS(null, "fill", color)

        return rect
    }
}