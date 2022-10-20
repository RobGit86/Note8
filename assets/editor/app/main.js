import './../../styles/editor.scss'

import Score from "./../lib/score.js"
import Page from "./../lib/page.js"
import Note from "./../lib/note.js"
import Rest from "./../lib/rest.js"
import NoteGroup from '../lib/noteGroup'
import System from '../lib/system'
import Stave from '../lib/stave'
import Track from '../lib/track'
import Player from '../lib/player.js'

window.score
getScoreParams(initScore)

function initScore(response) {

    let scoreArgs = JSON.parse(response)

    if(scoreArgs[0] < 0) {

        let meterUp = scoreArgs[1]
        let meterDown = scoreArgs[2]
        let composer = scoreArgs[3]
        let title = scoreArgs[4]
        let key = scoreArgs[5]
        let tempo = scoreArgs[6]
        let tabTrack = scoreArgs[7]
        let idScore = scoreArgs[8]
        
        initNewScore(meterUp, meterDown, composer, title, key, tempo, tabTrack, idScore)

    } else {

        initLoadedScore(scoreArgs[1], scoreArgs[2])
    }
}

function getScoreParams(callback) {

    const xhttp = new XMLHttpRequest();

    xhttp.onload = function() {
        callback(this.response)
    }
    xhttp.open("GET", "/ajax");
    xhttp.setRequestHeader("X-Requested-With","XMLHttpRequest");
    xhttp.send();
}

function initNewScore(meterUp, meterDown, composer, title, key, tempo, tabTrack, idScore) {

    let tracks = []

    for(let i = 0; i < tabTrack.length; i++) {
        tracks.push(tabTrack[i])
    }

    window.score = new Score(idScore, tempo, composer, title)
    
    Player.init()

    window.score.initPage()
    Page.setPageView("MultiPageView")
    Page.setPageFormat("A4", window.score.page, Score.ZOOM)
    Page.setPageOrientation("Portrait", window.score.page, Score.ZOOM)
    window.score.page[0].renderView()

    window.score.zoom(1.2)

    window.score.initSystem(meterUp, meterDown, tracks, key)
    window.score.initPointer()

    window.score.fitMultiHorizontal()
    window.score.render()

    window.score.save()
}

function initLoadedScore(scoreJSON, scoreParamsJSON) {

    let scoreParsed = scoreJSON

    let id = scoreParsed.id
    let tempo = scoreParsed.tempo
    let composer = scoreParsed.composer
    let title = scoreParsed.title

    Page.PAGES = 0

    window.score = new Score(id, tempo, composer, title)

    Player.init()

    window.score.initPage()
    Page.setPageView("MultiPageView")
    Page.setPageFormat("A4", window.score.page, Score.ZOOM)
    Page.setPageOrientation("Portrait", window.score.page, Score.ZOOM)
    Page.updateMargins()
    window.score.page[0].renderView()

    window.score.zoom(1)

    let loaded = scoreParsed

    // 1. LOADING PAGES
    for(let i = 0; i < scoreParsed.page.length - 1; i++) {
        window.score.addPage()
    }

    window.score.system = []

    for(let i = 0; i < loaded.system.length; i++) {

        let system = new System(window.score)

        system.x = loaded.system[i].x
        // system.x = Page.MARGIN_PX["LEFT"]
        system.y = loaded.system[i].y
        system.width = loaded.system[i].width
        // system.width = Page.MARGIN_PX["RIGHT"] - Page.MARGIN_PX["LEFT"]
        system.height = loaded.system[i].height
        system.page = loaded.system[i].page

        system.initView()
        window.score.system.push(system)
    }

    // 3. LOADING STAVES

    for(let i = 0; i < loaded.system.length; i++) {
        for(let j = 0; j < loaded.system[i].stave.length; j++) {

            let stave = new Stave(loaded.system[i].stave[j].meterUp, loaded.system[i].stave[j].meterDown, window.score.system[i])

            stave.x = loaded.system[i].stave[j].x
            stave.y = loaded.system[i].stave[j].y
            stave.width = loaded.system[i].stave[j].width
            stave.height = loaded.system[i].stave[j].height

            stave.initView()
            window.score.system[i].stave.push(stave)
        }
    }

    // 4. LOADING TRACKS

    for(let i = 0; i < loaded.system.length; i++) {
        for(let j = 0; j < loaded.system[i].stave.length; j++) {
            for(let k = 0; k < loaded.system[i].stave[j].track.length; k++) {

                let track = new Track(loaded.system[i].stave[j].track[k].clef, 
                    loaded.system[i].stave[j].track[k].meterUp,
                    loaded.system[i].stave[j].track[k].meterDown,
                    loaded.system[i].stave[j].track[k].key,
                    window.score.system[i].stave[j]
                    )

                track.offset = loaded.system[i].stave[j].track[k].offset

                track.x = loaded.system[i].stave[j].track[k].x
                track.y = loaded.system[i].stave[j].track[k].y
                
                track.width = loaded.system[i].stave[j].track[k].width
                track.paddingTopHeight = loaded.system[i].stave[j].track[k].paddingTopHeight
                track.staffLinesHeight = loaded.system[i].stave[j].track[k].staffLinesHeight
                track.paddingBottomHeight = loaded.system[i].stave[j].track[k].paddingBottomHeight
                track.height = loaded.system[i].stave[j].track[k].height

                track.xMeasure = loaded.system[i].stave[j].track[k].xMeasure
                track.yMeasure = loaded.system[i].stave[j].track[k].yMeasure

                track.initView()
                window.score.system[i].stave[j].track.push(track)
            }
        }
    }
    
    // 5. LOADING NOTEGROUPS

    for(let i = 0; i < loaded.system.length; i++) {
        for(let j = 0; j < loaded.system[i].stave.length; j++) {
            for(let k = 0; k < loaded.system[i].stave[j].track.length; k++) {
                for(let l = 0; l < loaded.system[i].stave[j].track[k].noteGroup.length; l++) {
                    
                    let noteGroup = new NoteGroup(window.score.system[i].stave[j].track[k])

                    noteGroup.x = loaded.system[i].stave[j].track[k].noteGroup[l].x
                    noteGroup.y = loaded.system[i].stave[j].track[k].noteGroup[l].y
                    noteGroup.width = loaded.system[i].stave[j].track[k].noteGroup[l].width
                    noteGroup.height = loaded.system[i].stave[j].track[k].noteGroup[l].height

                    noteGroup.duration = loaded.system[i].stave[j].track[k].noteGroup[l].duration

                    noteGroup.initView()
                    window.score.system[i].stave[j].track[k].noteGroup.push(noteGroup)
                }
            }
        }
    }

    // 6. LOADING NOTES

    for(let i = 0; i < loaded.system.length; i++) {
        for(let j = 0; j < loaded.system[i].stave.length; j++) {
            for(let k = 0; k < loaded.system[i].stave[j].track.length; k++) {
                for(let l = 0; l < loaded.system[i].stave[j].track[k].noteGroup.length; l++) {
                    for(let m = 0; m < loaded.system[i].stave[j].track[k].noteGroup[l].note.length; m++) {
                    
                        let note

                        if(loaded.system[i].stave[j].track[k].noteGroup[l].note[m].type == "NOTE") {

                            note = new Note(loaded.system[i].stave[j].track[k].noteGroup[l].note[m].duration,
                            loaded.system[i].stave[j].track[k].noteGroup[l].note[m].value,
                            loaded.system[i].stave[j].track[k].noteGroup[l].note[m].octave,
                            window.score.system[i].stave[j].track[k].noteGroup[l])
                        }

                        if(loaded.system[i].stave[j].track[k].noteGroup[l].note[m].type == "REST") {

                            note = new Rest(loaded.system[i].stave[j].track[k].noteGroup[l].note[m].duration,
                            window.score.system[i].stave[j].track[k].noteGroup[l])
                        }
                            
                        note.type = loaded.system[i].stave[j].track[k].noteGroup[l].note[m].type
                        note.spaceBefore = loaded.system[i].stave[j].track[k].noteGroup[l].note[m].spaceBefore
                        note.spaceBody = loaded.system[i].stave[j].track[k].noteGroup[l].note[m].spaceBody
                        note.spaceAfter = loaded.system[i].stave[j].track[k].noteGroup[l].note[m].spaceAfter

                        note.x = loaded.system[i].stave[j].track[k].noteGroup[l].note[m].x
                        note.y = loaded.system[i].stave[j].track[k].noteGroup[l].note[m].y
                        note.width = loaded.system[i].stave[j].track[k].noteGroup[l].note[m].width
                        note.height = loaded.system[i].stave[j].track[k].noteGroup[l].note[m].height

                        note.xHead = loaded.system[i].stave[j].track[k].noteGroup[l].note[m].xHead
                        note.yHead = loaded.system[i].stave[j].track[k].noteGroup[l].note[m].yHead
                        
                        note.stem = loaded.system[i].stave[j].track[k].noteGroup[l].note[m].stem
                        note.xStem = loaded.system[i].stave[j].track[k].noteGroup[l].note[m].xStem
                        note.yStem = loaded.system[i].stave[j].track[k].noteGroup[l].note[m].yStem
                        note.stemHeight = loaded.system[i].stave[j].track[k].noteGroup[l].note[m].stemHeight
                        note.stemDirection = loaded.system[i].stave[j].track[k].noteGroup[l].note[m].stemDirection

                        note.flag = loaded.system[i].stave[j].track[k].noteGroup[l].note[m].flag
                        note.xFlag = loaded.system[i].stave[j].track[k].noteGroup[l].note[m].xFlag
                        note.yFlag = loaded.system[i].stave[j].track[k].noteGroup[l].note[m].yFlag

                        note.flipped = loaded.system[i].stave[j].track[k].noteGroup[l].note[m].flipped
                        note.flipSpaced = loaded.system[i].stave[j].track[k].noteGroup[l].note[m].flipSpaced

                        note.accidental = loaded.system[i].stave[j].track[k].noteGroup[l].note[m].accidental
                        note.accidentalPosition = loaded.system[i].stave[j].track[k].noteGroup[l].note[m].accidentalPosition
                        note.accidentalX = loaded.system[i].stave[j].track[k].noteGroup[l].note[m].accidentalX

                        note.initView()
                        window.score.system[i].stave[j].track[k].noteGroup[l].note.push(note)
                    }
                }
            }
        }
    }

    window.score.initPointer()
    window.score.fitMultiHorizontal()
    window.score.fitMultiVertical()
    window.score.render()
}

document.addEventListener('keydown', movePointer, false)
document.addEventListener('keydown', addStave, false)
document.addEventListener('keydown', addNote, false)
document.addEventListener('keydown', addAccidental, false)
// document.addEventListener('keydown', addDot, false)
document.addEventListener('keydown', changeDuration, false)
// document.addEventListener('keydown', addTuplet, false)
document.addEventListener('keydown', changeTrack, false)

function movePointer(e) {

    if(e.keyCode === 68) {
        window.score.pointer.moveRight()
    }

    if(e.keyCode === 65) {
        window.score.pointer.moveLeft()
    }

    if(e.keyCode === 87) {
        window.score.pointer.moveUp()
    }

    if(e.keyCode === 83) {
        window.score.pointer.moveDown()
    }
}

function addStave(e) {

    let system = window.score.system[window.score.pointer.system]

    if(e.keyCode === 74) {
        system.addStaveBefore()
    }

    if(e.keyCode === 75) {
        system.addStaveAfter()
    }

    if(e.keyCode === 76) {
        system.removeStave()
    }
}

function addNote(e) {

    let system = window.score.system
    let stave = window.score.pointer.stave
    let value = window.score.pointer.value
    let octave = window.score.pointer.octave
    let clef = system[window.score.pointer.system].stave[window.score.pointer.stave].track[window.score.pointer.track].clef

    if(e.keyCode === 70) {
        window.score.pointer.getGroup(stave).addNote(value, octave, clef)
    }

    if(e.keyCode === 71) {
        window.score.pointer.getGroup(stave).removeNote(value, octave)
    }
}

function changeDuration(e) {

    let system = window.score.pointer.system
    let stave = window.score.pointer.stave
    let track = window.score.pointer.track
    let group = window.score.pointer.group

    if(e.keyCode === 81) {
        window.score.system[system].stave[stave].track[track].noteGroup[group].decreaseDuration()
    }

    if(e.keyCode === 69) {
        window.score.system[system].stave[stave].track[track].noteGroup[group].increaseDuration()
    }
}

function addAccidental(e) {

    let value = window.score.pointer.value
    let octave = window.score.pointer.octave
    let group = window.score.pointer.getGroup()

    let noteIdx = group.noteExists(value, octave)

    if(noteIdx != null) {
    
        if(e.keyCode === 90) {
            group.addAccidental(noteIdx, "#")
        }

        if(e.keyCode === 88) {
            group.addAccidental(noteIdx, "b")
        }

        if(e.keyCode === 67) {
            group.addAccidental(noteIdx, "d")
        }

        if(e.keyCode === 86) {
            group.removeAccidental(noteIdx)
        }
    }
}

function changeTrack(e) {

    if(e.keyCode === 82) {
        window.score.pointer.changeTrack()
    }
}

// document.getElementById("ButtonPad").addEventListener("click", changePadding)

// function changePadding() {

//     let track = parseInt(document.getElementById("trackNum").value)
//     let padNum = parseInt(document.getElementById("padNum").value)
//     let padVal = parseInt(document.getElementById("padVal").value)

//     window.score.changePaddingTracks(track, padNum, padVal)
//     window.score.render()
// }

document.getElementById("ButtonTempo").addEventListener("click", changeTempo)

function changeTempo() {

    let tempo = parseInt(document.getElementById("tempo").value)

    window.score.setTempo(tempo)
    window.score.render()
}

document.getElementById("btnPlay").addEventListener("click", playAll)

function playAll() {

    window.score.playAll();
}

document.getElementById("btnStop").addEventListener("click", stopAll)

function stopAll() {

    window.score.stopAll();
}

document.getElementById("btnSave").addEventListener("click", saveScore)

function saveScore() {

    window.score.save();
}