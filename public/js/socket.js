var ws = new WebSocket('<%= websocketUrl %>');

ws.onopen = function () {
  console.log('Connected to server');

  // get id from cookie
  var id = document.cookie
    .split('; ')
    .find((row) => row.startsWith('id='))
    ?.split('=')[1];
  if (id) {
    ws.send(JSON.stringify({ id }));
  } else {
    ws.send(JSON.stringify({}));
  }
};

ws.onmessage = function (event) {
  var data = JSON.parse(event.data);
  console.log('%cdata:', 'color: lime; font-size: 1.125rem;', data);
  if (data.id) {
    document.cookie = 'id=' + data.id;
  }
  if (data.type === 'info') {
    var infoElement = document.getElementById('info');
    if (!data.message.endsWith('\n')) {
      data.message += '\n';
    }
    infoElement.textContent += data.message;
  } else if (data.type === 'error') {
    var errorElement = document.getElementById('error');
    if (!data.message.endsWith('\n')) {
      data.message += '\n';
    }
    errorElement.textContent += data.message;
  }
};

ws.onerror = function (error) {
  console.error('WebSocket Error: ' + error);
};
ws.onclose = function (event) {
  if (event.code !== 1006)
    console.error(
      'WebSocket is closed now. Code:',
      event.code,
      'Reason:',
      event.reason
    );
};

var resizeHandle = document.getElementById('resizeHandle');
var infoElement = document.getElementById('info');
var errorElement = document.getElementById('error');
var isResizing = false;

resizeHandle.addEventListener('mousedown', function (e) {
  isResizing = true;
  e.preventDefault();
});

window.addEventListener('mousemove', function (e) {
  if (!isResizing) return;
  var x = e.clientX;
  var totalWidth = document.body.offsetWidth;
  var padding = 10;
  var handleWidth = resizeHandle.offsetWidth;

  // Convert x to a percentage of the total width
  var xPercent = (x / totalWidth) * 100;

  if (xPercent < ((padding + handleWidth) / totalWidth) * 100) {
    xPercent = ((padding + handleWidth) / totalWidth) * 100;
  } else if (
    xPercent >
    ((totalWidth - padding - handleWidth) / totalWidth) * 100
  ) {
    xPercent = ((totalWidth - padding - handleWidth) / totalWidth) * 100;
  }

  infoElement.style.width =
    xPercent - ((padding + 2 * handleWidth) / totalWidth) * 100 + '%';
  errorElement.style.width =
    ((totalWidth - x - padding - 2 * handleWidth) / totalWidth) * 100 + '%';
  resizeHandle.style.left =
    xPercent - (handleWidth / 2 / totalWidth) * 100 + '%';
});

window.addEventListener('mouseup', function (e) {
  isResizing = false;
});
