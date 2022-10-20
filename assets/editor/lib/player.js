import {Howl, Howler} from 'howler'
import piano from './../../sounds/piano.mp3'

export default class Player {

    static LOADED = false

    constructor() {

    }

    static init() {

        const sound = new Howl({
            src: [piano],
            html5: false
        });

        sound.on("load", ()=> {
            console.log("ZAŁADAOWNY")
            Player.LOADED = true

            document.getElementById("btnPlay").style.color = "#006400";
        })
    }

    static playAll(tempo, systems) {

        if(Player.LOADED) {
            Player.playAllReady(tempo, systems)
        } else {
            console.log("JESZCZE NIE TERAZ")
        }
    }

    static playAllReady(tempo, systems) {

        let staves = []

        for(let i = 0; i < systems.length; i++) {
            for(let j = 0; j < systems[i].stave.length; j++) {
                staves.push(systems[i].stave[j])
            }
        }

        let sprites = []

        let groupDuration
        let noteDuration
        // let accSharp
        // let accFlat
        // let accNatural
        let offset
        let elapsedTimeAccumulator = 0

        let mapNotes = {
            0: 0,
            1: 8000,
            2: 16000,
            3: 20000,
            4: 28000,
            5: 36000,
            6: 44000
        }

        let mapKeys = {
            // "#": [0, 0, 0, 4000, 0, 0, 0],

            "C": [0, 0, 0, 0, 0, 0, 0],
            "#": [0, 0, 0, 4000, 0, 0, 0],
            "##": [4000, 0, 0, 4000, 0, 0, 0],
            "bbb": [0, 0, -4000, 0, 0, -4000, -4000],
        }

        for(let i = 0; i < staves[0].track.length; i++) {
            for(let j = 0; j < staves.length; j++) {

                // accSharp = []
                // accFlat = []
                // accNatural = []

                let sharpSetVal = new Set()
                let sharpSetOct = new Set()
                let flatSetVal = new Set()
                let flatSetOct = new Set()
                let naturalSetVal = new Set()
                let naturalSetOct = new Set()

                for(let m = 0; m < staves[j].track[i].noteGroup.length; m++) {

                    groupDuration = staves[j].track[i].noteGroup[m].getRealDuration()

                    for(let n = 0; n < staves[j].track[i].noteGroup[m].note.length; n++) {

                        let note = staves[j].track[i].noteGroup[m].note[n]
                        noteDuration = groupDuration * 1000 * 60 * 4 / tempo

                        if(note.type == "REST") {
                            offset = 500
                        } else {

                            offset = mapNotes[note.value] + note.octave * 48000
                            offset += mapKeys[staves[j].track[i].key][note.value]

                            if(note.accidental == "#") {
                                if(mapKeys[staves[j].track[i].key][note.value] != 4000) {
                                    
                                    sharpSetVal.add(note.value)
                                    sharpSetOct.add(note.octave)

                                    flatSetVal.delete(note.value)
                                    flatSetOct.delete(note.octave)
                                }
                            }

                            if(note.accidental == "b") {
                                if(mapKeys[staves[j].track[i].key][note.value] != -4000) {

                                    flatSetVal.add(note.value)
                                    flatSetOct.add(note.octave)

                                    sharpSetVal.delete(note.value)
                                    sharpSetOct.delete(note.octave)
                                }
                            }

                            if(note.accidental == "d") {

                                naturalSetVal.add(note.value)
                                naturalSetOct.add(note.octave)

                                sharpSetVal.delete(note.value)
                                sharpSetOct.delete(note.octave)

                                flatSetVal.delete(note.value)
                                flatSetOct.delete(note.octave)
                            }

                            if(sharpSetVal.has(note.value) && sharpSetOct.has(note.octave)) {
                                offset += 4000
                            }

                            if(flatSetVal.has(note.value) && flatSetOct.has(note.octave)) {
                                offset -= 4000
                            }

                            if(mapKeys[staves[j].track[i].key][note.value] == 4000) {
                                console.log("NO NA MINUS")
                                console.log(naturalSetVal, naturalSetOct)

                                if(naturalSetVal.has(note.value) && naturalSetOct.has(note.octave)) {
                                    offset -= 4000
                                    console.log("NO NA MINUS")
                                }
                            }
                            if(mapKeys[staves[j].track[i].key][note.value] == -4000) {
                                if(naturalSetVal.has(note.value) && naturalSetOct.has(note.octave)) {
                                    offset += 4000
                                }
                            }




                            if(staves[j].track[i].noteGroup[m].note[n].dotted) {
                                // noteDuration *= 1.5
                            }

                            // for(let a = 0; a < accSharp.length; a++) {
                            //     if(note.value == accSharp[a][0] && note.octave == accSharp[a][1]) {
                            //         offset += 4000;
                            //         break;
                            //     }
                            // }
                            // for(let a = 0; a < accFlat.length; a++) {
                            //     if(note.value == accFlat[a][0] && note.octave == accFlat[a][1]) {
                            //         offset -= 4000
                            //         break;
                            //     }
                            // }




                        }
                        
                        if(noteDuration > 4000) {
                            noteDuration = 3925
                        }

                        const sprite = new Howl({
                            src: [piano],
                            html5: false,
                            sprite: {
                                note: [offset, noteDuration + 800]
                            }
                        });

                        sprites.push([sprite, elapsedTimeAccumulator])
                    }
                    elapsedTimeAccumulator += noteDuration
                }
            }
            elapsedTimeAccumulator = 0
        }

        window.tim = []

        for(let i = 0; i < sprites.length; i++) {
            window.tim[i] = setTimeout(function() {

                let fade = sprites[i][0]._sprite.note[1] - 10

                sprites[i][0].fade(1.0, 0.0, fade)
                sprites[i][0].play('note')

            }, sprites[i][1])
        }
    }

    static stopAll() {

        for(let i = 0; i < window.tim.length; i++) {
            window.clearTimeout(window.tim[i])
        }
    }
}