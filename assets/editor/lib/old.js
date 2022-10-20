// beamNotes(idxFirst, idxLast) {

//     for(let i = idxFirst; i <= idxLast; i++) {
//         if(this.noteGroup[i].note[0].type == "NOTE") {
//             this.noteGroup[i].note[0].removeStem()
//         }
//     }

//     let midDistance = 0
//     let tmp = 0

//     for(let i = idxFirst; i<=idxLast; i++) {
//         for(let j = 0; j < this.noteGroup[i].note.length; j++) {
//             tmp = this.distanceFromMid(i, j)
//             if(Math.abs(tmp) > Math.abs(midDistance)) {
//                 midDistance = tmp
//             }
//         }
//     }

//     let stemDirection

//     if(midDistance < 0) stemDirection = "down"
//     else stemDirection = "up"

//     let dy
//     let alpha = this.noteGroup[idxLast].note[0].y - this.noteGroup[idxFirst].note[0].y

//     if(alpha == 0) {
//         dy = 0
//     } else if(alpha == Note.HEAD_HEIGHT / 2 || alpha == -Note.HEAD_HEIGHT / 2) {
//         dy = -alpha
//     } else {
//         if(alpha > 0) {
//             dy = -Note.HEAD_HEIGHT
//         } else {
//             dy = Note.HEAD_HEIGHT
//         }
//     }

//     let tmpHeight

//     for(let i = idxFirst; i <= idxLast; i++) {

//         if(i == idxFirst) {
//             this.noteGroup[idxFirst].note[0].addStem(stemDirection)
//         } else {

//             if(stemDirection == "up") {
//                 tmpHeight = this.noteGroup[idxFirst].note[0].stemHeight +
//                 (this.noteGroup[i].note[0].y - this.noteGroup[idxFirst].note[0].y)
//             }
//             if(stemDirection == "down") {
//                 tmpHeight = this.noteGroup[idxFirst].note[0].stemHeight -
//                 (this.noteGroup[i].note[0].y - this.noteGroup[idxFirst].note[0].y)
//             }
//             this.noteGroup[i].note[0].addStem(stemDirection, tmpHeight)
//         }
//     }            

//     if(stemDirection == "up") {
//         this.noteGroup[idxLast].note[0].setStemHeight(this.noteGroup[idxLast].note[0].stemHeight + dy)
//     }
//     if(stemDirection == "down") {
//         this.noteGroup[idxLast].note[0].setStemHeight(this.noteGroup[idxLast].note[0].stemHeight - dy)
//     }
    
//     this.noteGroup[idxFirst].note[0].beam(this.noteGroup[idxLast].note[0], 0)

//     // >4 DURATION BEAMS
//     let cFirst, cLast, groupFirst, groupLast
//     for(let i=5; i<=7; i++) {

//         for(let k = idxFirst; k < idxLast; k++) {

//             cFirst = cLast = k

//             if(this.noteGroup[k].duration >= i) {
//                 while(cLast < idxLast && this.noteGroup[cLast + 1].duration >= i) {
//                     cLast++
//                 }
//                 k = cLast

//                 if(cLast > cFirst) {
//                     groupFirst = this.noteGroup[cFirst]
//                     groupLast = this.noteGroup[cLast]
    
//                     console.log(cFirst)
//                     console.log(cLast)

//                     this.noteGroup[cFirst].note[0].beam(this.noteGroup[cLast].note[0], (i-4))
//                     // this.noteGroups[cFirst].notes[0].addBeam(xStemFirst, xStemSecond, stemDirection, alpha, (i-4), false, null)
//                 }
//             }
//         }
//     }

//     // SINGLE BEAMS
//     // if(idxLast > idxFirst) {
        
//     //     for(let i = idxFirst; i <= idxLast; i++) {

//     //         if(i == idxFirst) {
//     //             if(this.noteGroups[i].duration > 4 && this.noteGroups[i+1].duration < this.noteGroups[i].duration) {
//     //                 groupFirst = this.noteGroups[i]
//     //                 groupLast = this.noteGroups[i+1]
//     //                 for(let d = this.noteGroups[i+1].duration + 1; d <= this.noteGroups[i].duration; d++) {
//     //                     this.noteGroups[i].notes[0].addBeam(groupFirst, groupLast, stemDirection, alpha, (d-4), true, "right")
//     //                 }
//     //             }
//     //         } else if(i == idxLast) {
//     //             if(this.noteGroups[i].duration > 4 && this.noteGroups[i].duration > this.noteGroups[i-1].duration) {
//     //                 groupFirst = this.noteGroups[i-1]
//     //                 groupLast = this.noteGroups[i]
//     //                 for(let d = this.noteGroups[i-1].duration + 1; d <= this.noteGroups[i].duration; d++) {
//     //                     this.noteGroups[i].notes[0].addBeam(groupFirst, groupLast, stemDirection, alpha, (d-4), true, "left")
//     //                 }
//     //             }
//     //         } else {
//     //             if(this.noteGroups[i].duration != this.noteGroups[i-1].duration && this.noteGroups[i].duration != this.noteGroups[i+1].duration) {
//     //                 groupFirst = this.noteGroups[i-1]
//     //                 groupLast = this.noteGroups[i]
//     //                 for(let d = 1; d <= this.noteGroups[i].duration - 4; d++) {
//     //                     this.noteGroups[i].notes[0].addBeam(groupFirst, groupLast, stemDirection, alpha, d, true, "left")
//     //                 }
//     //             }
//     //         }
//     //     }
//     // }
// }