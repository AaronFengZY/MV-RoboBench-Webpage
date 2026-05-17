window.HELP_IMPROVE_VIDEOJS = false;

var INTERP_BASE = "./static/interpolation/stacked";
var NUM_INTERP_FRAMES = 240;

var interp_images = [];
function preloadInterpolationImages() {
  for (var i = 0; i < NUM_INTERP_FRAMES; i++) {
    var path = INTERP_BASE + '/' + String(i).padStart(6, '0') + '.jpg';
    interp_images[i] = new Image();
    interp_images[i].src = path;
  }
}

function setInterpolationImage(i) {
  var image = interp_images[i];
  image.ondragstart = function() { return false; };
  image.oncontextmenu = function() { return false; };
  $('#interpolation-image-wrapper').empty().append(image);
}


$(document).ready(function() {
    // Check for click events on the navbar burger icon
    $(".navbar-burger").click(function() {
      // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
      $(".navbar-burger").toggleClass("is-active");
      $(".navbar-menu").toggleClass("is-active");

    });

    var options = {
			slidesToScroll: 1,
			slidesToShow: 3,
			loop: true,
			infinite: true,
			autoplay: false,
			autoplaySpeed: 3000,
    }

		// Initialize all div with carousel class
    var carousels = bulmaCarousel.attach('.carousel', options);

    // Loop on each carousel initialized
    for(var i = 0; i < carousels.length; i++) {
    	// Add listener to  event
    	carousels[i].on('before:show', state => {
    		console.log(state);
    	});
    }

    // Access to bulmaCarousel instance of an element
    var element = document.querySelector('#my-element');
    if (element && element.bulmaCarousel) {
    	// bulmaCarousel instance is available as element.bulmaCarousel
    	element.bulmaCarousel.on('before-show', function(state) {
    		console.log(state);
    	});
    }

    /*var player = document.getElementById('interpolation-video');
    player.addEventListener('loadedmetadata', function() {
      $('#interpolation-slider').on('input', function(event) {
        console.log(this.value, player.duration);
        player.currentTime = player.duration / 100 * this.value;
      })
    }, false);*/
    preloadInterpolationImages();

    $('#interpolation-slider').on('input', function(event) {
      setInterpolationImage(this.value);
    });
    setInterpolationImage(0);
    $('#interpolation-slider').prop('max', NUM_INTERP_FRAMES - 1);

    bulmaSlider.attach();

    var copyBtn = document.getElementById('bibtex-copy-btn');
    var bibtexCode = document.getElementById('bibtex-content');
    if (copyBtn && bibtexCode) {
      copyBtn.addEventListener('click', function() {
        var text = bibtexCode.textContent.trim();
        var originalLabel = copyBtn.textContent;

        function showCopied() {
          copyBtn.textContent = 'Copied';
          copyBtn.disabled = true;
          setTimeout(function() {
            copyBtn.textContent = originalLabel;
            copyBtn.disabled = false;
          }, 1400);
        }

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(showCopied).catch(function() {
            fallbackCopy(text);
          });
        } else {
          fallbackCopy(text);
        }
      });
    }

    function fallbackCopy(text) {
      var textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'absolute';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
      } catch (err) {
        // ignore
      }
      document.body.removeChild(textarea);
      if (copyBtn) {
        copyBtn.textContent = 'Copied';
        copyBtn.disabled = true;
        setTimeout(function() {
          copyBtn.textContent = 'Copy';
          copyBtn.disabled = false;
        }, 1400);
      }
    }

    // ---------- Leaderboard heatmap shading ----------
    // For each numeric column (avg + per-metric), compute min/max across body
    // rows and assign a normalized intensity (0..1) so cells reveal a soft
    // indigo gradient — higher = stronger.
    (function applyLeaderboardHeatmap() {
      var table = document.querySelector('.leaderboard-table');
      if (!table) return;
      var rows = table.querySelectorAll('tbody tr');
      if (!rows.length) return;

      // Collect columns to shade: .avg-col and .metric-col
      var sampleRow = rows[0];
      var cells = sampleRow.children;
      var columnIndices = [];
      for (var i = 0; i < cells.length; i++) {
        if (cells[i].classList.contains('avg-col') ||
            cells[i].classList.contains('metric-col')) {
          columnIndices.push(i);
        }
      }

      columnIndices.forEach(function(colIdx) {
        var values = [];
        rows.forEach(function(row) {
          var cell = row.children[colIdx];
          if (!cell) return;
          var v = parseFloat((cell.textContent || '').trim());
          values.push(isNaN(v) ? null : v);
        });
        var nums = values.filter(function(v) { return v !== null; });
        if (nums.length < 2) return;
        var min = Math.min.apply(null, nums);
        var max = Math.max.apply(null, nums);
        var range = max - min;
        if (range <= 0) return;

        rows.forEach(function(row, rIdx) {
          var cell = row.children[colIdx];
          if (!cell) return;
          var v = values[rIdx];
          if (v === null) return;
          var t = (v - min) / range; // 0..1
          // Gentle curve so mid values still get some color
          t = Math.pow(t, 0.85);
          cell.style.setProperty('--t', t.toFixed(3));
          cell.setAttribute('data-heat', '');
        });
      });
    })();

})
