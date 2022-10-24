# NOTE8 - [Click to run](http://179.61.219.147)

#### Test access account
~~~
$ Login: test@gmail.com
$ Password: test
~~~

## Table of contents
* [About Note8](#general-info)
* [Features](#features)
* [How to use](#how-to-use)
* [Technologies](#technologies)
* [Plans](#future-plans)

## General info
Note8 is web application which let you create, publish, edit and playback sheet music.

## Features

#### PUBLIC SCORES (PUBLICZNE UTWORY)
- View public music scores, created and published by registered users.
- Search music score by title.

#### PRIVATE SCORES (MOJE UTWORY)
- Create new score.
- Make score private (no access for logged users) or public.
- Remove your score.

#### In addition:
- Playback score (start and stop).
- Change tempo.
- Save score in any moment.
- Zoom without loss of image quality.

## How to use
- Zoom, playback, tempo and save options are avalaible on top navbar.
- Moving pointer (red square):
  + A - move left
  + D - move right
  + W - move up
  + S - move down
- Tracks:
  + R - move pointer to next track
- Staves:
  + J - add new empty stave before current
  + K - add new empty stave after current
  + L - remove current stave
- Notes:
  + F - add new note in current position
  + G - remove current note
  + E - increase length of current note
  + Q - decrease length of current note
  + Z - add # accidental
  + X - add b accidental
  + C - add natural accidental

## Technologies
- PHP 8.1.9
- Symfony 6.1.5
- HTML, CSS
- JavaScript + Ajax
- MySQL

## Future Plans
- Fix some bugs (like score made on some screen, doesn't display correct on another).
- Export/Import scores to MusicXML format.
- Export score as image.
- Add rest symbols of music notation.