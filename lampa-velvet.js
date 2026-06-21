(function () {
    'use strict';

    if (window.lampa_velvet_ready) return;
    window.lampa_velvet_ready = true;

    var PLUGIN_CLASS = 'lampa-velvet';
    var TMDB = 'https://image.tmdb.org/t/p/';
    var currentUrl = '';
    var activeLayer = 0;
    var bg;
    var layers = [];
    var scanTimer;
    var mutationObserver;
    var initialized = false;

    var css = `
body.${PLUGIN_CLASS}{
    background:
        radial-gradient(circle at 18% 15%, rgba(138, 57, 18, 0.32), transparent 34%),
        radial-gradient(circle at 82% 2%, rgba(110, 18, 28, 0.2), transparent 26%),
        #070604 !important;
}

body.${PLUGIN_CLASS} .background{
    opacity: 0 !important;
}

.velvet-bg{
    position: fixed;
    inset: 0;
    z-index: 0;
    overflow: hidden;
    pointer-events: none;
    background: #080604;
}

.velvet-bg__image{
    position: absolute;
    inset: -5%;
    opacity: 0;
    background-position: center;
    background-size: cover;
    transform: scale(1.06);
    filter: blur(18px) saturate(1.18) brightness(0.68);
    transition: opacity 620ms ease, transform 5200ms ease;
    will-change: opacity, transform;
}

.velvet-bg__image.active{
    opacity: 1;
    transform: scale(1.02);
}

.velvet-bg__shade,
.velvet-bg__grain,
.velvet-bg__glow{
    position: absolute;
    inset: 0;
}

.velvet-bg__shade{
    background:
        linear-gradient(90deg, rgba(5, 4, 3, 0.96) 0%, rgba(5, 4, 3, 0.58) 42%, rgba(5, 4, 3, 0.9) 100%),
        linear-gradient(180deg, rgba(5, 4, 3, 0.78) 0%, rgba(5, 4, 3, 0.28) 42%, rgba(5, 4, 3, 0.96) 100%);
}

.velvet-bg__glow{
    background:
        radial-gradient(circle at 50% 18%, rgba(229, 74, 35, 0.18), transparent 44%),
        radial-gradient(circle at 12% 82%, rgba(246, 165, 82, 0.12), transparent 34%);
    mix-blend-mode: screen;
}

.velvet-bg__grain{
    opacity: 0.13;
    background-image:
        linear-gradient(115deg, rgba(255,255,255,0.06), rgba(255,255,255,0) 44%),
        repeating-radial-gradient(circle at 24% 36%, rgba(255,255,255,0.05) 0 1px, rgba(255,255,255,0) 1px 4px);
}

body.${PLUGIN_CLASS} .head{
    top: 1.8em;
    left: 5.8vw;
    right: 5.8vw;
    width: auto;
    z-index: 25;
}

body.${PLUGIN_CLASS} .head__body{
    min-height: 4.6em;
    padding: 0.7em 1.6em;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 1.45em;
    background: rgba(74, 26, 10, 0.42);
    box-shadow: 0 1.8em 5em rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.08);
}

body.platform--browser.${PLUGIN_CLASS} .head__body{
    backdrop-filter: blur(22px) saturate(1.22);
}

body.${PLUGIN_CLASS} .head__logo-icon{
    width: 2.45em;
    height: 2.45em;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 1.3em;
    border-radius: 0.72em;
    background: linear-gradient(135deg, #ff3434, #c90012);
    box-shadow: 0 0.7em 1.6em rgba(255, 24, 24, 0.3);
    overflow: hidden;
}

body.${PLUGIN_CLASS} .head__logo-icon img{
    width: 68%;
    height: 68%;
    object-fit: contain;
}

body.${PLUGIN_CLASS} .head__title{
    font-weight: 600;
    letter-spacing: 0;
    color: rgba(255,255,255,0.96);
}

body.${PLUGIN_CLASS} .head__action{
    width: 2.8em;
    height: 2.8em;
    margin-left: 0.8em;
    border-radius: 999px;
    color: rgba(255,255,255,0.84);
    background: rgba(255,255,255,0.04);
    transition: transform 160ms ease, background-color 160ms ease, color 160ms ease;
}

body.${PLUGIN_CLASS} .head__action.focus,
body.${PLUGIN_CLASS} .head__action.hover{
    color: #16100d;
    background: #fff;
    transform: translateY(-0.08em) scale(1.04);
}

body.${PLUGIN_CLASS} .wrap{
    z-index: 10;
}

body.${PLUGIN_CLASS} .wrap__content{
    padding-top: 8em;
}

body.${PLUGIN_CLASS} .items-line{
    padding-bottom: 2.5em;
}

body.${PLUGIN_CLASS} .items-line__head{
    padding-left: 5.8vw;
    padding-right: 5.8vw;
    margin-bottom: 1.15em;
}

body.${PLUGIN_CLASS} .items-line__title{
    font-size: 1.42em;
    font-weight: 700;
    color: rgba(255,255,255,0.76);
}

body.${PLUGIN_CLASS} .items-line__more{
    background: rgba(255,255,255,0.08);
    color: rgba(255,255,255,0.72);
    border-radius: 999px;
}

body.${PLUGIN_CLASS} .items-line__more.focus{
    background: #fff;
    color: #15100c;
}

body.${PLUGIN_CLASS} .scroll__content{
    padding-left: 5.8vw !important;
    padding-right: 5.8vw !important;
}

body.${PLUGIN_CLASS} .card{
    transition: transform 180ms ease, opacity 180ms ease, filter 180ms ease;
}

body.${PLUGIN_CLASS} .card__view{
    margin-bottom: 0.82em;
}

body.${PLUGIN_CLASS} .card__img{
    border-radius: 0.72em;
    background-color: rgba(255,255,255,0.08);
    box-shadow: 0 1em 2.5em rgba(0,0,0,0.28);
    transition: transform 200ms ease, box-shadow 200ms ease, filter 200ms ease;
}

body.${PLUGIN_CLASS} .card__title{
    font-size: 1.05em;
    font-weight: 600;
    line-height: 1.22;
    color: rgba(255,255,255,0.82);
}

body.${PLUGIN_CLASS} .card__age{
    color: rgba(255,255,255,0.46);
}

body.${PLUGIN_CLASS} .card.focus,
body.${PLUGIN_CLASS} .card.hover{
    transform: translate3d(0, -0.42em, 0) scale(1.035);
    z-index: 5;
}

body.${PLUGIN_CLASS} .card.focus .card__img,
body.${PLUGIN_CLASS} .card.hover .card__img{
    box-shadow: 0 1.4em 3.4em rgba(0,0,0,0.44), 0 0 0 0.16em rgba(255,255,255,0.92);
    filter: saturate(1.08) brightness(1.03);
}

body.${PLUGIN_CLASS} .card.focus .card__view::after,
body.${PLUGIN_CLASS} .card.hover .card__view::after{
    display: none !important;
}

body.${PLUGIN_CLASS} .card__vote{
    right: 0.45em;
    bottom: 0.45em;
    border-radius: 999px;
    background: rgba(9, 7, 5, 0.72);
    color: #fff;
}

body.${PLUGIN_CLASS} .card__quality,
body.${PLUGIN_CLASS} .card__type{
    border-radius: 999px;
    box-shadow: 0 0.7em 1.5em rgba(0,0,0,0.28);
}

body.${PLUGIN_CLASS} .card--wide .card__img{
    border-radius: 1.15em;
}

body.${PLUGIN_CLASS} .selectbox__content,
body.${PLUGIN_CLASS} .modal__content,
body.${PLUGIN_CLASS} .settings__content{
    background-color: rgba(17, 12, 9, 0.94) !important;
}

@media screen and (max-width: 790px){
    body.${PLUGIN_CLASS} .head{
        top: 0.8em;
        left: 0.8em;
        right: 0.8em;
    }

    body.${PLUGIN_CLASS} .head__body{
        min-height: 3.8em;
        padding: 0.5em 0.9em;
        border-radius: 1em;
    }

    body.${PLUGIN_CLASS} .wrap__content{
        padding-top: 5.7em;
    }

    body.${PLUGIN_CLASS} .items-line__head,
    body.${PLUGIN_CLASS} .scroll__content{
        padding-left: 1em !important;
        padding-right: 1em !important;
    }
}

body.no--animation .velvet-bg__image,
body.no--animation.${PLUGIN_CLASS} .card,
body.no--animation.${PLUGIN_CLASS} .card__img,
body.no--animation.${PLUGIN_CLASS} .head__action{
    transition: none !important;
}
`;

    function addStyle() {
        if (document.getElementById('lampa-velvet-style')) return;

        var style = document.createElement('style');
        style.id = 'lampa-velvet-style';
        style.textContent = css;
        document.head.appendChild(style);
    }

    function addBackground() {
        if (document.querySelector('.velvet-bg')) {
            bg = document.querySelector('.velvet-bg');
            layers = Array.prototype.slice.call(bg.querySelectorAll('.velvet-bg__image'));
            return;
        }

        bg = document.createElement('div');
        bg.className = 'velvet-bg';
        bg.innerHTML = [
            '<div class="velvet-bg__image active"></div>',
            '<div class="velvet-bg__image"></div>',
            '<div class="velvet-bg__shade"></div>',
            '<div class="velvet-bg__glow"></div>',
            '<div class="velvet-bg__grain"></div>'
        ].join('');

        document.body.insertBefore(bg, document.body.firstChild);
        layers = Array.prototype.slice.call(bg.querySelectorAll('.velvet-bg__image'));
    }

    function absoluteUrl(url) {
        if (!url || typeof url !== 'string') return '';
        if (url.indexOf('data:') === 0) return '';
        if (url.indexOf('./img/') === 0 || url.indexOf('img_load') >= 0 || url.indexOf('img_broken') >= 0) return '';

        var anchor = document.createElement('a');
        anchor.href = url;

        return anchor.href || url;
    }

    function tmdb(path, size) {
        if (!path || typeof path !== 'string') return '';
        if (path.indexOf('http') === 0) return path;
        if (path.charAt(0) === '/') return TMDB + size + path;
        return path;
    }

    function dataFromCard(card) {
        if (!card) return null;
        if (card.card_data) return card.card_data;

        try {
            if (window.$) {
                return $(card).data('card') || $(card).data('data') || null;
            }
        }
        catch (e) {}

        return null;
    }

    function imageFromData(data) {
        if (!data) return '';

        if (data.backdrop_path) return tmdb(data.backdrop_path, 'w1280');
        if (data.background_image) return absoluteUrl(data.background_image);
        if (data.cover) return absoluteUrl(data.cover);
        if (data.poster_path) return tmdb(data.poster_path, 'w780');
        if (data.profile_path) return tmdb(data.profile_path, 'w780');
        if (data.poster) return absoluteUrl(data.poster);
        if (data.img) return absoluteUrl(data.img);

        return '';
    }

    function imageFromElement(card) {
        if (!card) return '';

        var img = card.querySelector('.card__img, img');
        if (img && img.src) return absoluteUrl(img.src);

        var view = card.querySelector('.card__view') || card;
        var bgImage = window.getComputedStyle(view).backgroundImage;
        var match = bgImage && bgImage.match(/url\(["']?(.+?)["']?\)/);

        return match ? absoluteUrl(match[1]) : '';
    }

    function setBackground(url) {
        url = absoluteUrl(url);
        if (!url || url === currentUrl || !layers.length) return;

        currentUrl = url;
        activeLayer = activeLayer ? 0 : 1;

        var next = layers[activeLayer];
        var prev = layers[activeLayer ? 0 : 1];

        next.style.backgroundImage = 'url("' + url.replace(/"/g, '\\"') + '")';
        next.classList.add('active');
        prev.classList.remove('active');
    }

    function updateFromCard(card) {
        if (!card || !card.classList || !card.classList.contains('card')) return;

        var dataUrl = imageFromData(dataFromCard(card));
        var elemUrl = imageFromElement(card);

        setBackground(dataUrl || elemUrl);
    }

    function findFocusedCard() {
        return document.querySelector('.card.focus, .card.hover, .card.enter');
    }

    function scanFocus() {
        updateFromCard(findFocusedCard());
    }

    function bindEvents() {
        document.addEventListener('hover:focus', function (event) {
            updateFromCard(event.target && event.target.closest ? event.target.closest('.card') : null);
        }, true);

        document.addEventListener('hover:hover', function (event) {
            updateFromCard(event.target && event.target.closest ? event.target.closest('.card') : null);
        }, true);

        document.addEventListener('focusin', function (event) {
            updateFromCard(event.target && event.target.closest ? event.target.closest('.card') : null);
        }, true);

        document.addEventListener('mouseover', function (event) {
            updateFromCard(event.target && event.target.closest ? event.target.closest('.card') : null);
        }, true);

        if (window.MutationObserver) {
            mutationObserver = new MutationObserver(function (mutations) {
                for (var i = 0; i < mutations.length; i++) {
                    var target = mutations[i].target;
                    if (target && target.classList && target.classList.contains('card') && (target.classList.contains('focus') || target.classList.contains('hover'))) {
                        updateFromCard(target);
                        return;
                    }
                }
            });

            mutationObserver.observe(document.body, {
                subtree: true,
                attributes: true,
                attributeFilter: ['class']
            });
        }

        scanTimer = setInterval(scanFocus, 700);
    }

    function init() {
        if (initialized) return;
        initialized = true;

        addStyle();
        addBackground();
        document.body.classList.add(PLUGIN_CLASS);
        bindEvents();
        scanFocus();
    }

    function ready() {
        if (document.body) init();
        else setTimeout(ready, 50);
    }

    if (window.appready) ready();
    else if (window.Lampa && Lampa.Listener) {
        Lampa.Listener.follow('app', function (event) {
            if (event.type === 'ready') ready();
        });

        ready();
    }
    else ready();

    window.lampa_velvet_destroy = function () {
        document.body.classList.remove(PLUGIN_CLASS);
        if (bg) bg.remove();
        if (mutationObserver) mutationObserver.disconnect();
        if (scanTimer) clearInterval(scanTimer);
        initialized = false;
        window.lampa_velvet_ready = false;
    };
})();
