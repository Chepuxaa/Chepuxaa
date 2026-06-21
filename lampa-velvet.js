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

    var css = [
        'body.%CLASS%{background:radial-gradient(circle at 18% 15%,rgba(138,57,18,.32),transparent 34%),radial-gradient(circle at 82% 2%,rgba(110,18,28,.2),transparent 26%),#070604!important;}',
        'body.%CLASS% .background{opacity:0!important;}',
        '.velvet-bg{position:fixed;top:0;left:0;right:0;bottom:0;z-index:0;overflow:hidden;pointer-events:none;background:#080604;}',
        '.velvet-bg__image{position:absolute;top:-5%;left:-5%;right:-5%;bottom:-5%;opacity:0;background-position:center;background-size:cover;transform:scale(1.06);filter:blur(18px) saturate(1.18) brightness(.68);transition:opacity 620ms ease,transform 5200ms ease;will-change:opacity,transform;}',
        '.velvet-bg__image.active{opacity:1;transform:scale(1.02);}',
        '.velvet-bg__shade,.velvet-bg__grain,.velvet-bg__glow{position:absolute;top:0;left:0;right:0;bottom:0;}',
        '.velvet-bg__shade{background:linear-gradient(90deg,rgba(5,4,3,.96) 0%,rgba(5,4,3,.58) 42%,rgba(5,4,3,.9) 100%),linear-gradient(180deg,rgba(5,4,3,.78) 0%,rgba(5,4,3,.28) 42%,rgba(5,4,3,.96) 100%);}',
        '.velvet-bg__glow{background:radial-gradient(circle at 50% 18%,rgba(229,74,35,.18),transparent 44%),radial-gradient(circle at 12% 82%,rgba(246,165,82,.12),transparent 34%);mix-blend-mode:screen;}',
        '.velvet-bg__grain{opacity:.13;background-image:linear-gradient(115deg,rgba(255,255,255,.06),rgba(255,255,255,0) 44%),repeating-radial-gradient(circle at 24% 36%,rgba(255,255,255,.05) 0 1px,rgba(255,255,255,0) 1px 4px);}',
        'body.%CLASS% .head{top:1.8em;left:5.8vw;right:5.8vw;width:auto;z-index:25;}',
        'body.%CLASS% .head__body{min-height:4.6em;padding:.7em 1.6em;border:1px solid rgba(255,255,255,.08);border-radius:1.45em;background:rgba(74,26,10,.42);box-shadow:0 1.8em 5em rgba(0,0,0,.34),inset 0 1px 0 rgba(255,255,255,.08);}',
        'body.platform--browser.%CLASS% .head__body{backdrop-filter:blur(22px) saturate(1.22);}',
        'body.%CLASS% .head__logo-icon{width:2.45em;height:2.45em;display:flex;align-items:center;justify-content:center;margin-right:1.3em;border-radius:.72em;background:linear-gradient(135deg,#ff3434,#c90012);box-shadow:0 .7em 1.6em rgba(255,24,24,.3);overflow:hidden;}',
        'body.%CLASS% .head__logo-icon img{width:68%;height:68%;object-fit:contain;}',
        'body.%CLASS% .head__title{font-weight:600;letter-spacing:0;color:rgba(255,255,255,.96);}',
        'body.%CLASS% .head__action{width:2.8em;height:2.8em;margin-left:.8em;border-radius:999px;color:rgba(255,255,255,.84);background:rgba(255,255,255,.04);transition:transform 160ms ease,background-color 160ms ease,color 160ms ease;}',
        'body.%CLASS% .head__action.focus,body.%CLASS% .head__action.hover{color:#16100d;background:#fff;transform:translateY(-.08em) scale(1.04);}',
        'body.%CLASS% .wrap{z-index:10;}',
        'body.%CLASS% .wrap__content{padding-top:8em;}',
        'body.%CLASS% .items-line{padding-bottom:2.5em;}',
        'body.%CLASS% .items-line__head{padding-left:5.8vw;padding-right:5.8vw;margin-bottom:1.15em;}',
        'body.%CLASS% .items-line__title{font-size:1.42em;font-weight:700;color:rgba(255,255,255,.76);}',
        'body.%CLASS% .items-line__more{background:rgba(255,255,255,.08);color:rgba(255,255,255,.72);border-radius:999px;}',
        'body.%CLASS% .items-line__more.focus{background:#fff;color:#15100c;}',
        'body.%CLASS% .scroll__content{padding-left:5.8vw!important;padding-right:5.8vw!important;}',
        'body.%CLASS% .card{transition:transform 180ms ease,opacity 180ms ease,filter 180ms ease;}',
        'body.%CLASS% .card__view{margin-bottom:.82em;}',
        'body.%CLASS% .card__img{border-radius:.72em;background-color:rgba(255,255,255,.08);box-shadow:0 1em 2.5em rgba(0,0,0,.28);transition:transform 200ms ease,box-shadow 200ms ease,filter 200ms ease;}',
        'body.%CLASS% .card__title{font-size:1.05em;font-weight:600;line-height:1.22;color:rgba(255,255,255,.82);}',
        'body.%CLASS% .card__age{color:rgba(255,255,255,.46);}',
        'body.%CLASS% .card.focus,body.%CLASS% .card.hover{transform:translate3d(0,-.42em,0) scale(1.035);z-index:5;}',
        'body.%CLASS% .card.focus .card__img,body.%CLASS% .card.hover .card__img{box-shadow:0 1.4em 3.4em rgba(0,0,0,.44),0 0 0 .16em rgba(255,255,255,.92);filter:saturate(1.08) brightness(1.03);}',
        'body.%CLASS% .card.focus .card__view::after,body.%CLASS% .card.hover .card__view::after{display:none!important;}',
        'body.%CLASS% .card__vote{right:.45em;bottom:.45em;border-radius:999px;background:rgba(9,7,5,.72);color:#fff;}',
        'body.%CLASS% .card__quality,body.%CLASS% .card__type{border-radius:999px;box-shadow:0 .7em 1.5em rgba(0,0,0,.28);}',
        'body.%CLASS% .card--wide .card__img{border-radius:1.15em;}',
        'body.%CLASS% .selectbox__content,body.%CLASS% .modal__content,body.%CLASS% .settings__content{background-color:rgba(17,12,9,.94)!important;}',
        '@media screen and (max-width:790px){body.%CLASS% .head{top:.8em;left:.8em;right:.8em;}body.%CLASS% .head__body{min-height:3.8em;padding:.5em .9em;border-radius:1em;}body.%CLASS% .wrap__content{padding-top:5.7em;}body.%CLASS% .items-line__head,body.%CLASS% .scroll__content{padding-left:1em!important;padding-right:1em!important;}}',
        'body.no--animation .velvet-bg__image,body.no--animation.%CLASS% .card,body.no--animation.%CLASS% .card__img,body.no--animation.%CLASS% .head__action{transition:none!important;}'
    ].join('').replace(/%CLASS%/g, PLUGIN_CLASS);

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
