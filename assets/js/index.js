(function () {
  var tl = gsap.timeline();
  tl.pause();
  tl.to('.index-intro', {
    opacity: 1,
    duration: 0.5,
    delay: 1
  }).to('.index-intro>div>p', {
    opacity: 1,
    y: 0,
    duration: 1.5,
    delay: .5,
    stagger: 1.5,
    ease: 'power1.out',
    onComplete: () => {
      setTimeout(() => {
        window.location.href = './list.html';
      }, 1000);
    }
  });
  $(window).on('allLoaded', function () {
    if ($('body').hasClass('-wrongBrowser')) {
      return;
    }
    tl.play();
  });
})();