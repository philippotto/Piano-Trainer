export default {
  sendEvent: function(eventCategory, eventAction, eventValue) {
    if (window.location.hostname === "localhost" || typeof ga === "undefined") {
      return;
    }

    ga("send", {
      hitType: "event",
      eventCategory,
      eventAction,
      eventValue
    });
  }
};
