export default {
  sendEvent: function(eventCategory, eventAction) {
    if (window.location.hostname === "localhost" || typeof ga === "undefined") {
      return;
    }

    ga('send', {
      hitType: 'event',
      eventCategory,
      eventAction
    });
  }
}
