Piano-Trainer [![Build Status](https://travis-ci.org/philippotto/Piano-Trainer.svg?branch=master)](https://travis-ci.org/philippotto/Piano-Trainer)
=============


Piano-Trainer is a web app which uses the [Web MIDI API](http://www.w3.org/TR/webmidi/) to train your sheet reading skills.
Connect your piano via MIDI to your computer and play the displayed notes.
The generated notes won't be typical chords in a typical combination.
So, you can't rely on intuition or experience.
Instead you must read the correct notes.
Learn piano the hard way!


Piano-Trainer is written in CoffeeScript, uses Vex for rendering the sheets and Chartist for rendering the graphs.
The tests are executed with Jasmine/Karma on Travis.


## How to use

Currently, the Web MIDI API has very limited browser support. Try Chrome 37 and [activate](chrome://flags/#enable-web-midi) the experimental ```enable-web-midi``` flag.
After connecting your MIDI device to your computer, it may be necessary to restart Chrome.
Additionally, make sure that no other software is reading from the device.
Finally: Just visit the GitHub hosted [Piano-Trainer](http://philippotto.github.io/Piano-Trainer/).

If you want to run Piano-Trainer locally, just checkout the repository and execute npm install and gulp watch.

## License

MIT © Philipp Otto 2014
