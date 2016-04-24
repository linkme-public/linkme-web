export default function throttledEventListener(obj, type, callback, ctx) {
  var running = false;
  var func = function() {
    if (running) { return; }
    running = true;
    requestAnimationFrame(function() {
      callback.call(ctx);
      running = false;
    });
  };
  obj.addEventListener(type, func);

  return () => {
    obj.removeEventListener(type, func);
  };
};
