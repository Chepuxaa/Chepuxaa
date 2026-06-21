(function () {
    'use strict';

    if (window.lampa_velvet_ready) return;
    window.lampa_velvet_ready = true;

    var THEME = 'lampa-velvet';
    var TMDB = 'https://image.tmdb.org/t/p/';
    var currentUrl = '';
    var activeLayer = 0;
    var bg;
    var layers = [];
    var hero;
    var heroTitle;
    var heroMeta;
    var heroRating;
    var scanTimer;
    var mutationObserver;
    var initialized = false;

    var css = [
        'body.%THEME%{background:#07090d!important;color:#f6f7fb!important;}',
        'body.%THEME% .background{opacity:0!important;}',
        '.atv-bg{position:fixed;top:0;left:0;right:0;bottom:0;z-index:0;overflow:hidden;pointer-events:none;background:#07090d;}',
        '.atv-bg__image{position:absolute;top:-4%;left:-4%;right:-4%;bottom:-4%;opacity:0;background-position:center;background-size:cover;transform:scale(1.035);filter:blur(28px) saturate(1.05) brightness(.56);transition:opacity .7s ease,transform 7s ease;}',
        '.atv-bg__image.active{opacity:1;transform:scale(1.01);}',
        '.atv-bg__vignette{position:absolute;top:0;left:0;right:0;bottom:0;background:linear-gradient(90deg,rgba(7,9,13,.96),rgba(7,9,13,.62) 42%,rgba(7,9,13,.9)),linear-gradient(180deg,rgba(7,9,13,.68),rgba(7,9,13,.18) 38%,rgba(7,9,13,.94));}',
        '.atv-bg__wash{position:absolute;top:0;left:0;right:0;bottom:0;background:radial-gradient(circle at 18% 18%,rgba(255,255,255,.14),transparent 28%),radial-gradient(circle at 78% 20%,rgba(132,173,255,.1),transparent 32%),radial-gradient(circle at 44% 88%,rgba(255,255,255,.08),transparent 38%);mix-blend-mode:screen;}',
        '.atv-bg__grain{position:absolute;top:0;left:0;right:0;bottom:0;opacity:.08;background-image:repeating-radial-gradient(circle at 18% 22%,rgba(255,255,255,.06) 0 1px,rgba(255,255,255,0) 1px 4px);}',

        'body.%THEME% .head{top:1.9em;left:4.8vw;right:4.8vw;width:auto;z-index:30;}',
        'body.%THEME% .head__body{min-height:3.7em;padding:.48em .85em;border-radius:1.55em;background:rgba(19,22,28,.42);border:1px solid rgba(255,255,255,.12);box-shadow:0 1.4em 4.5em rgba(0,0,0,.34),inset 0 1px 0 rgba(255,255,255,.12);}',
        'body.platform--browser.%THEME% .head__body{backdrop-filter:blur(26px) saturate(1.18);}',
        'body.%THEME% .head__title{font-size:1.24em;font-weight:700;color:rgba(255,255,255,.92);letter-spacing:0;}',
        'body.%THEME% .head__logo-icon{width:2em;height:2em;margin-right:.8em;border-radius:.72em;background:rgba(255,255,255,.1);box-shadow:inset 0 1px 0 rgba(255,255,255,.14);display:flex;align-items:center;justify-content:center;overflow:hidden;}',
        'body.%THEME% .head__logo-icon img{width:68%;height:68%;object-fit:contain;}',
        'body.%THEME% .head__menu-icon,body.%THEME% .head__backward{margin-right:.78em;color:#fff;position:relative;z-index:4;cursor:pointer;}',
        'body.%THEME% .head__menu-icon svg,body.%THEME% .head__backward svg{width:1.75em!important;height:1.75em!important;}',
        'body.%THEME% .head__action{width:2.38em;height:2.38em;margin-left:.42em;padding:.49em;border-radius:50%;color:rgba(255,255,255,.9);background:rgba(255,255,255,.085);box-shadow:inset 0 1px 0 rgba(255,255,255,.09);transition:transform .18s ease,background-color .18s ease,color .18s ease;}',
        'body.%THEME% .head__action.focus,body.%THEME% .head__action.hover{background:rgba(255,255,255,.94);color:#11151c;transform:scale(1.08);}',
        'body.%THEME% .head__time{align-items:center;margin-left:.6em;}',
        'body.%THEME% .head__time-now{font-size:1.58em;color:#fff;}',
        'body.%THEME% .head__time-date,body.%THEME% .head__time-week{color:rgba(255,255,255,.74);}',
        'body.%THEME% .head__markers{margin:0 .75em;}',

        '.atv-hero{position:fixed;left:4.9vw;right:4.9vw;top:6.25em;height:9.1em;z-index:8;pointer-events:none;display:flex;align-items:flex-end;}',
        '.atv-hero__body{max-width:40em;padding-bottom:.95em;transition:opacity .22s ease,transform .22s ease;}',
        '.atv-hero__label{font-size:.72em;font-weight:800;letter-spacing:.22em;text-transform:uppercase;color:rgba(255,255,255,.44);margin-bottom:.72em;}',
        '.atv-hero__title{font-size:2.72em;line-height:.98;font-weight:800;color:#fff;text-shadow:0 .25em 1.25em rgba(0,0,0,.45);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%;}',
        '.atv-hero__meta{display:flex;align-items:center;margin-top:.8em;font-size:.98em;font-weight:700;color:rgba(255,255,255,.68);}',
        '.atv-hero__rating{display:none;margin-right:.72em;padding:.28em .66em;border-radius:999px;background:rgba(255,255,255,.94);color:#11151c;font-weight:900;box-shadow:0 .6em 1.4em rgba(0,0,0,.18);}',
        '.atv-hero__rating.visible{display:inline-flex;}',
        '.atv-hero__meta-text{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',

        'body.%THEME% .wrap{z-index:12;}',
        'body.%THEME% .wrap__content{padding-top:14.7em;}',
        'body.%THEME% .items-line{padding-bottom:3.2em;}',
        'body.%THEME% .items-line__head{padding-left:4.9vw;padding-right:4.9vw;margin-bottom:.95em;}',
        'body.%THEME% .items-line__title{font-size:1.22em;font-weight:800;color:rgba(255,255,255,.82);text-shadow:0 .4em 1.4em rgba(0,0,0,.36);}',
        'body.%THEME% .items-line__more{padding:.42em .92em;border-radius:999px;background:rgba(255,255,255,.1);color:rgba(255,255,255,.72);box-shadow:inset 0 1px 0 rgba(255,255,255,.08);}',
        'body.%THEME% .items-line__more.focus,body.%THEME% .items-line__more.hover{background:rgba(255,255,255,.94);color:#11151c;}',
        'body.%THEME% .scroll__content{padding-left:4.9vw!important;padding-right:4.9vw!important;}',

        'body.%THEME% .card{width:11.65em;opacity:.74;transition:transform .22s ease,opacity .22s ease,filter .22s ease;}',
        'body.%THEME% .card__view{margin-bottom:.8em;}',
        'body.%THEME% .card__img{border-radius:1.05em;background:#151923;box-shadow:0 1.2em 2.9em rgba(0,0,0,.28),inset 0 0 0 1px rgba(255,255,255,.05);transition:box-shadow .22s ease,filter .22s ease;}',
        'body.%THEME% .card__view:before{content:"";position:absolute;left:0;right:0;bottom:0;height:38%;z-index:1;border-radius:0 0 1.05em 1.05em;background:linear-gradient(180deg,rgba(0,0,0,0),rgba(0,0,0,.52));pointer-events:none;}',
        'body.%THEME% .card__title{font-size:.98em;line-height:1.18;font-weight:800;color:rgba(255,255,255,.86);}',
        'body.%THEME% .card__age{font-size:.84em;color:rgba(255,255,255,.42);margin-top:.48em;}',
        'body.%THEME% .card.focus,body.%THEME% .card.hover{opacity:1;transform:translate3d(0,-.74em,0) scale(1.075);z-index:8;}',
        'body.%THEME% .card.focus .card__img,body.%THEME% .card.hover .card__img{box-shadow:0 1.8em 4em rgba(0,0,0,.45),0 0 0 .16em rgba(255,255,255,.95),0 0 2.6em rgba(172,202,255,.22);filter:saturate(1.08) brightness(1.05);}',
        'body.%THEME% .card.focus .card__view::after,body.%THEME% .card.hover .card__view::after{display:none!important;}',
        'body.%THEME% .card.focus .card__title,body.%THEME% .card.hover .card__title{color:#fff;}',
        'body.%THEME% .card__vote{z-index:2;right:.55em;bottom:.55em;border-radius:999px;background:rgba(7,9,13,.7);color:#fff;box-shadow:0 .55em 1.2em rgba(0,0,0,.32);}',
        'body.%THEME% .card__type{left:.55em;top:.55em;border-radius:999px;background:rgba(255,255,255,.92);color:#11151c;font-weight:900;}',
        'body.%THEME% .card__quality{left:.55em;bottom:.62em;border-radius:999px;background:rgba(255,255,255,.92);color:#11151c;font-weight:900;z-index:2;}',

        'body.%THEME% .wrap__left{z-index:70;}',
        'body.%THEME% .menu{padding:.55em;background:rgba(15,18,24,.58);border:1px solid rgba(255,255,255,.1);border-radius:1.35em;box-shadow:0 1.4em 3.6em rgba(0,0,0,.34);}',
        'body.platform--browser.%THEME% .menu{backdrop-filter:blur(24px) saturate(1.12);}',
        'body.%THEME% .menu__item{border-radius:1em;color:rgba(255,255,255,.82);}',
        'body.%THEME% .menu__item.focus,body.%THEME% .menu__item.hover{background:rgba(255,255,255,.95);color:#11151c;}',
        'body.%THEME% .wrap__left{z-index:80;}',
        'body.%THEME%.menu--open:not(.light--version) .wrap__left{visibility:visible!important;transform:translate3d(15em,0,0)!important;}',
        'body.%THEME%.menu--open:not(.light--version) .wrap__content{transform:translate3d(15em,0,0)!important;}',
        'body.%THEME%.menu--open:not(.light--version) .atv-hero{opacity:.3;transform:translate3d(15em,0,0);}',

        'body.%THEME% .selectbox__content,body.%THEME% .modal__content,body.%THEME% .settings__content{background:rgba(14,17,23,.96)!important;}',
        '@media screen and (max-width:790px){.atv-hero{display:none;}body.%THEME% .head{top:.8em;left:.8em;right:.8em;}body.%THEME% .head__body{border-radius:1.05em;}body.%THEME% .wrap__content{padding-top:5.8em;}body.%THEME% .items-line__head,body.%THEME% .scroll__content{padding-left:1em!important;padding-right:1em!important;}body.%THEME% .card{width:10.75em;}}'
    ].join('').replace(/%THEME%/g, THEME);

    function addStyle() {
        if (document.getElementById('lampa-velvet-style')) return;

        var style = document.createElement('style');
        style.id = 'lampa-velvet-style';
        style.textContent = css;
        document.head.appendChild(style);
    }

    function addBackground() {
        if (document.querySelector('.atv-bg')) {
            bg = document.querySelector('.atv-bg');
            layers = Array.prototype.slice.call(bg.querySelectorAll('.atv-bg__image'));
            return;
        }

        bg = document.createElement('div');
        bg.className = 'atv-bg';
        bg.innerHTML = [
            '<div class="atv-bg__image active"></div>',
            '<div class="atv-bg__image"></div>',
            '<div class="atv-bg__vignette"></div>',
            '<div class="atv-bg__wash"></div>',
            '<div class="atv-bg__grain"></div>'
        ].join('');

        document.body.insertBefore(bg, document.body.firstChild);
        layers = Array.prototype.slice.call(bg.querySelectorAll('.atv-bg__image'));
    }

    function addHero() {
        if (document.querySelector('.atv-hero')) {
            hero = document.querySelector('.atv-hero');
        }
        else {
            hero = document.createElement('div');
            hero.className = 'atv-hero';
            hero.innerHTML = [
                '<div class="atv-hero__body">',
                '<div class="atv-hero__label">Lampa TV</div>',
                '<div class="atv-hero__title">Выберите фильм</div>',
                '<div class="atv-hero__meta">',
                '<span class="atv-hero__rating"></span>',
                '<span class="atv-hero__meta-text">Фон адаптируется к выбранной карточке</span>',
                '</div>',
                '</div>'
            ].join('');

            document.body.insertBefore(hero, document.body.firstChild);
        }

        heroTitle = hero.querySelector('.atv-hero__title');
        heroMeta = hero.querySelector('.atv-hero__meta-text');
        heroRating = hero.querySelector('.atv-hero__rating');
    }

    function closestByClass(node, className) {
        while (node && node !== document) {
            if (node.classList && node.classList.contains(className)) return node;
            node = node.parentNode;
        }

        return null;
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
            if (window.$) return $(card).data('card') || $(card).data('data') || null;
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
        var img;
        var view;
        var bgImage;
        var match;

        if (!card) return '';

        img = card.querySelector('.card__img, img');
        if (img && img.src) return absoluteUrl(img.src);

        view = card.querySelector('.card__view') || card;
        bgImage = window.getComputedStyle ? window.getComputedStyle(view).backgroundImage : '';
        match = bgImage && bgImage.match(/url\(["']?(.+?)["']?\)/);

        return match ? absoluteUrl(match[1]) : '';
    }

    function textFromCard(card, selector) {
        var node = card && card.querySelector ? card.querySelector(selector) : null;
        return node ? (node.textContent || node.innerText || '').replace(/^\s+|\s+$/g, '') : '';
    }

    function yearFromData(data) {
        var date = data && (data.release_date || data.first_air_date || data.birthday || data.release_year);
        return date ? String(date).slice(0, 4) : '';
    }

    function ratingFromData(data, card) {
        var value = data && (data.cub_hundred_rating || data.vote_average || data.rating);
        var rating = value ? String(parseFloat(value).toFixed(1)) : textFromCard(card, '.card__vote');
        return rating && rating !== '0.0' ? rating : '';
    }

    function updateHero(data, card) {
        var title;
        var year;
        var type;
        var rating;

        if (!heroTitle || !heroMeta || !heroRating) return;

        title = data && (data.title || data.name || data.original_title || data.original_name);
        year = yearFromData(data) || textFromCard(card, '.card__age');
        type = data && data.original_name ? 'Сериал' : 'Фильм';
        rating = ratingFromData(data, card);
        title = title || textFromCard(card, '.card__title') || 'Lampa';

        heroTitle.innerText = title;
        heroMeta.innerText = [type, year].filter(function (item) { return item; }).join('  •  ') || 'В фокусе';

        if (rating) {
            heroRating.innerText = rating;
            heroRating.classList.add('visible');
        }
        else {
            heroRating.innerText = '';
            heroRating.classList.remove('visible');
        }
    }

    function setBackground(url) {
        var next;
        var prev;

        url = absoluteUrl(url);
        if (!url || url === currentUrl || !layers.length) return;

        currentUrl = url;
        activeLayer = activeLayer ? 0 : 1;
        next = layers[activeLayer];
        prev = layers[activeLayer ? 0 : 1];

        next.style.backgroundImage = 'url("' + url.replace(/"/g, '\\"') + '")';
        next.classList.add('active');
        prev.classList.remove('active');
    }

    function updateFromCard(card) {
        var data;
        var dataUrl;
        var elemUrl;

        if (!card || !card.classList || !card.classList.contains('card')) return;

        data = dataFromCard(card);
        dataUrl = imageFromData(data);
        elemUrl = imageFromElement(card);

        updateHero(data, card);
        setBackground(dataUrl || elemUrl);
    }

    function findFocusedCard() {
        return document.querySelector('.card.focus, .card.hover, .card.enter');
    }

    function scanFocus() {
        updateFromCard(findFocusedCard());
    }

    function toggleMenu() {
        try {
            if (window.Lampa && Lampa.Menu && Lampa.Menu.toggle) {
                Lampa.Menu.toggle();
                return;
            }
        }
        catch (e) {}

        try {
            if (window.Lampa && Lampa.Controller && Lampa.Controller.toggle) {
                Lampa.Controller.toggle('menu');
                document.body.classList.add('menu--open');
                return;
            }
        }
        catch (e2) {}

        document.body.classList.toggle('menu--open');
    }

    function bindEvents() {
        document.addEventListener('hover:focus', function (event) {
            updateFromCard(closestByClass(event.target, 'card'));
        }, true);

        document.addEventListener('hover:hover', function (event) {
            updateFromCard(closestByClass(event.target, 'card'));
        }, true);

        document.addEventListener('focusin', function (event) {
            updateFromCard(closestByClass(event.target, 'card'));
        }, true);

        document.addEventListener('mouseover', function (event) {
            updateFromCard(closestByClass(event.target, 'card'));
        }, true);

        document.addEventListener('mousedown', function (event) {
            if (!closestByClass(event.target, 'head__menu-icon')) return;

            event.preventDefault();
            event.stopPropagation();
            if (event.stopImmediatePropagation) event.stopImmediatePropagation();

            toggleMenu();
        }, true);

        document.addEventListener('click', function (event) {
            if (!closestByClass(event.target, 'head__menu-icon')) return;

            event.preventDefault();
            event.stopPropagation();
            if (event.stopImmediatePropagation) event.stopImmediatePropagation();
        }, true);

        if (window.MutationObserver) {
            mutationObserver = new MutationObserver(function (mutations) {
                var i;
                var target;

                for (i = 0; i < mutations.length; i++) {
                    target = mutations[i].target;

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

        scanTimer = setInterval(scanFocus, 650);
    }

    function init() {
        if (initialized) return;
        initialized = true;

        addStyle();
        addBackground();
        addHero();
        document.body.classList.add(THEME);
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
        document.body.classList.remove(THEME);
        if (hero) hero.remove();
        if (bg) bg.remove();
        if (mutationObserver) mutationObserver.disconnect();
        if (scanTimer) clearInterval(scanTimer);
        initialized = false;
        window.lampa_velvet_ready = false;
    };
})();
