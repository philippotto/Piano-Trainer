Piano-Trainer [![Build Status](https://travis-ci.org/philippotto/Piano-Trainer.svg?branch=master)](https://travis-ci.org/philippotto/Piano-Trainer)
=============


Piano-Trainer is a web app which uses the [Web MIDI API](http://www.w3.org/TR/webmidi/) to train your sheet reading skills.
Connect your piano via MIDI to your computer and play the displayed notes.
The generated notes won't be typical chords in a typical combination.
So, you can't rely on intuition or experience.
Instead you must read the correct notes.
Learn piano the hard way!


Currently, the Web MIDI API has very limited browser support.
Try Chrome 37 and [activate](chrome://flags/#enable-web-midi) the experimental ```enable-web-midi``` flag.

Piano-Trainer is written in CoffeeScript, uses Vex for rendering the sheets and Chartist for rendering the graphs.
The tests are executed with Jasmine/Karma on Travis.
