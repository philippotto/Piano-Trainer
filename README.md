[Piano-Trainer](http://philippotto.github.io/Piano-Trainer/) [![Build Status](https://travis-ci.org/philippotto/Piano-Trainer.svg?branch=master)](https://travis-ci.org/philippotto/Piano-Trainer)
=============


Piano-Trainer is a web app which uses the [Web MIDI API](http://www.w3.org/TR/webmidi/) to train your sheet reading skills.
Connect your piano via MIDI to your computer and play the displayed notes.
The generated notes won't be typical chords in a typical combination.
So, you can't rely on intuition or experience.
Instead you must read the correct notes.
Learn piano the hard way!


Piano-Trainer is written in CoffeeScript, uses [Vex](https://github.com/0xfe/vexflow) for rendering the sheets and [Chartist](https://github.com/gionkunz/chartist-js) for rendering the graphs.
The tests are executed with Jasmine/Karma on Travis.


## How to use

Currently, the Web MIDI API has very limited browser support.
Try Chrome (at least version 39) and activate the experimental `enable-web-midi` flag (`chrome://flags/#enable-web-midi`).
After connecting your MIDI device to your computer, it may be necessary to restart Chrome.
Additionally, make sure that no other software is reading from the device.
Finally: Just visit the GitHub hosted [Piano-Trainer](http://philippotto.github.io/Piano-Trainer/).

If you want to run Piano-Trainer locally, checkout the repository and execute npm install and gulp watch within the folder.

## License

MIT © Philipp Otto
