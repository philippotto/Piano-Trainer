[SheetMusicTutor](http://philippotto.github.io/Piano-Trainer/) [![Build Status](https://travis-ci.org/philippotto/Piano-Trainer.svg?branch=master)](https://travis-ci.org/philippotto/Piano-Trainer)
=============


SheetMusicTutor is a web app which allows practicing sheet reading skills right in your browser.
Currently, there are two different modes:

- Pitch reading training
- Rhythm training

The **pitch reading training** mode uses the [Web MIDI API](http://www.w3.org/TR/webmidi/). Connect your piano via MIDI to your computer and play the displayed notes.
The generated notes won't be typical chords in a typical combination.
So, you can't rely on intuition or experience.
Instead you must read the correct notes.

Read more in this [blog post](http://scm.io/blog/hack/2015/07/piano-trainer/).

On the contrary, the **rhythm training** mode can be used without a keyboard. Just tap the given rhythm with your space button or on your touch screen.

SheetMusicTutor is written in ES6 and React, uses [Vex](https://github.com/0xfe/vexflow) for rendering the sheets and [Chartist](https://github.com/gionkunz/chartist-js) for rendering the graphs.
The tests are executed with Jasmine/Karma on Travis.


## How to use the pitch reading training

Currently, the Web MIDI API has very limited browser support.
Try Chrome (at least version 39) and activate the experimental `enable-web-midi` flag (`chrome://flags/#enable-web-midi`).
After connecting your MIDI device to your computer, it may be necessary to restart Chrome.
Additionally, make sure that no other software is reading from the device.
Finally: Just visit the GitHub hosted [Piano-Trainer](http://philippotto.github.io/Piano-Trainer/).

## How to contribute

If you want to run SheetMusicTutor locally, checkout the repository and execute `npm install` and `npm start` within the folder.

## License

MIT © Philipp Otto, Google LLC
