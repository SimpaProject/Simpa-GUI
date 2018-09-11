(() => {
  'use strict';

  const QRCode = require('qrcode');

  /**
   * @desc custome qr-code drawer
   * @example <dag-qr-code></dag-qr-code>
   */
  angular
    .module('copayApp.directives')
    .directive('dagQrCode', dagQrCode);

  dagQrCode.$inject = ['sharedService'];

  function dagQrCode(sharedService) {
    return {
      restrict: 'E',
      scope: {},
      link: ($scope, element, attrs) => {
        function drawLogo(logoPath, canvas, callback) {
          const img = new Image();
          console.log(img.width, img.height);
          img.onload = () => {
            const ctx = canvas.getContext('2d');
            const x = -500;
            const y = -500;
            ctx.drawImage(img, x, y, img.width, img.height);
            callback(null, canvas);
          };
          img.src = logoPath;
        }

        function changeColor(r, g, b, canvas) {
          const ctx = canvas.getContext('2d');
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          for (let i = 0, ii = imgData.data.length; i < ii; i += 4) {
            imgData.data[i] |= r;
            imgData.data[i + 1] = g | imgData.data[i + 1];
            imgData.data[i + 2] = b | imgData.data[i + 2];
          }
          ctx.putImageData(imgData, 0, 0);
          return canvas;
        }

        function perform(text, options, nextStep) {
          let canvas = document.createElement('canvas');

          QRCode.toCanvas(canvas, text, {
            errorCorrectionLevel: 'H'
          }, (err) => {
            if (err) {
              nextStep(err, null);
              return false;
            }
            if (options.r || options.g || options.b) {
              canvas = changeColor(options.r, options.g, options.b, canvas);
            }
            if (options.logoPath) {
              drawLogo(options.logoPath, canvas, nextStep);
            } else {
              nextStep(null, canvas);
            }
          });
        }

        const imageDivId = attrs.imageDivId;
        attrs.$observe('url', (url) => {
          if (url && url.length > 20) {
            const cacheData = sharedService.getCachedData(url);
            if (cacheData) {
              if (imageDivId) {
                document.getElementById(imageDivId).src = `${cacheData}`;
              } else {
                element.html(`<img width="220" src="${cacheData}">`);
              }
              return;
            }
            perform(url, {
              r: 94,
              g: 54,
              b: 124,
              logoPath: 'img/qr_logo.png'
            }, (err, canvas) => {
              if (err) {
                alert(err);
              } else {
                const src = canvas.toDataURL();
                sharedService.addCachedData(url, src);
                if (imageDivId) {
                  document.getElementById(imageDivId).src = `${src}`;
                } else {
                  element.html(`<img width="220" src="${src}">`);
                }
              }
            });
          }
        });
      }
    };
  }
})();
