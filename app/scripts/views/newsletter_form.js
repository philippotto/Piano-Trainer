import React, { Component } from "react";

export default class NewsLetterForm extends Component {
  componentDidMount() {
    // This avoids that global keyhandlers for keyboard navigation are triggered
    // when email input is used.
    const dontPropagate = evt => evt.stopPropagation();
    const email = this.email;
    email.addEventListener("keypress", dontPropagate);
    email.addEventListener("keyup", dontPropagate);
    email.addEventListener("keydown", dontPropagate);
  }

  render() {
    return (
      <div id="mc_embed_signup">
        <form
          action="//github.us13.list-manage.com/subscribe/post?u=dffafd7c2c0f11a555541b5a4&amp;id=83959ba82c"
          method="post"
          id="mc-embedded-subscribe-form"
          name="mc-embedded-subscribe-form"
          className="validate"
          target="_blank"
          noValidate
        >
          <div id="mc_embed_signup_scroll">
            <div className="row">
              <div className="col-md-8 col-xs-8">
                <div className="form-group group-class">
                  <input
                    type="email"
                    name="EMAIL"
                    id="mce-EMAIL"
                    placeholder="your@email.com"
                    ref={c => {
                      this.email = c;
                    }}
                    className="form-control"
                  />
                </div>
              </div>
              <div className="col-md-4 col-xs-4">
                <div id="mce-responses" className="clear">
                  <div className="response" id="mce-error-response" style={{ display: "none" }} />
                  <div className="response" id="mce-success-response" style={{ display: "none" }} />
                </div>
                <div style={{ position: "absolute", left: -5000 }} aria-hidden="true">
                  <input
                    type="text"
                    name="b_dffafd7c2c0f11a555541b5a4_83959ba82c"
                    tabIndex="-1"
                    value=""
                  />
                </div>
                <div className="clear">
                  <input
                    type="submit"
                    value="Sign up"
                    name="subscribe"
                    id="mc-embedded-subscribe"
                    className="button btn btn-primary"
                    style={{ width: "100%" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  }
}
