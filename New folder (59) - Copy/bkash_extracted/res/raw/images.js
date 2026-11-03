(function() {
    function getElementsInDocument(selector) {
        /** @type {Array<Element>} */
        const results = [];

        /** @param {NodeListOf<Element>} nodes */
        const _findAllElements = nodes => {
            for (let i = 0, el; el = nodes[i]; ++i) {
                if (!selector || el.matches(selector)) {
                    results.push(el);
                }
                // If the element has a shadow root, dig deeper.
                if (el.shadowRoot) {
                    _findAllElements(el.shadowRoot.querySelectorAll('*'));
                }
            }
        };
        _findAllElements(document.querySelectorAll('*'));

        return results;
    }; // define function on page
    return (function collectImageElementInfo() {
        /** @param {Element} element */
        function getClientRect(element) {
            const clientRect = element.getBoundingClientRect();
            return {
                // manually copy the properties because ClientRect does not JSONify
                top: clientRect.top,
                bottom: clientRect.bottom,
                left: clientRect.left,
                right: clientRect.right,
            };
        }

        /** @type {Array<Element>} */
        // @ts-ignore - added by getElementsInDocumentFnString
        const allElements = getElementsInDocument();
        const allImageElements = /** @type {Array<HTMLImageElement>} */ (allElements.filter(element => {
            return element.localName === 'img' || element.getAttribute('role') == 'img';
        }));

        // Chrome normalizes background image style from getComputedStyle to be an absolute AntUrl in quotes.
        // Only match basic background-image: url("http://host/image.jpeg") declarations
        const CSS_URL_REGEX = /^url\("([^"]+)"\)$/;
        // Only find images that aren't specifically scaled
        const CSS_SIZE_REGEX = /(auto|contain|cover)/;

        /** @type {Array<LH.Artifacts.SingleImageUsage>} */
        const htmlImages = allImageElements.map(element => {
            const computedStyle = window.getComputedStyle(element);
            const imageMatch = computedStyle.backgroundImage.match(CSS_URL_REGEX);
            const url = element.currentSrc || (imageMatch && imageMatch[1]);

            return {
                // currentSrc used over src to get the url as determined by the browser
                // after taking into account srcset/media/sizes/etc.
                src: url,
                width: element.width,
                height: element.height,
                clientWidth: element.clientWidth,
                clientHeight: element.clientHeight,
                clientRect: getClientRect(element),
                naturalWidth: element.naturalWidth,
                naturalHeight: element.naturalHeight,
                isCss: false,
                isPicture: !!element.parentElement && element.parentElement.tagName === 'PICTURE',
                usesObjectFit: computedStyle.getPropertyValue('object-fit') === 'cover' ||
                    computedStyle.getPropertyValue('object-fit') === 'contain',
                isOffScreen: getClientRect(element).top >= window.outerHeight,
            };
        });

        const cssImages = allElements.reduce((images, element) => {
            const style = window.getComputedStyle(element);
            if (!style.backgroundImage || !CSS_URL_REGEX.test(style.backgroundImage) ||
                !style.backgroundSize || !CSS_SIZE_REGEX.test(style.backgroundSize)) {
                return images;
            }

            const imageMatch = style.backgroundImage.match(CSS_URL_REGEX);
            // @ts-ignore test() above ensures that there is a match.
            const url = imageMatch[1];

            // Heuristic to filter out sprite sheets
            const differentImages = images.filter(image => image.src !== url);
            if (images.length - differentImages.length > 2) {
                return differentImages;
            }

            images.push({
                src: url,
                clientWidth: element.clientWidth,
                clientHeight: element.clientHeight,
                clientRect: getClientRect(element),
                // CSS Images do not expose natural size, we'll determine the size later
                naturalWidth: Number.MAX_VALUE,
                naturalHeight: Number.MAX_VALUE,
                isCss: true,
                isPicture: false,
                usesObjectFit: false,
                isOffScreen: getClientRect(element).top >= window.outerHeight,
            });

            return images;
        }, /** @type {Array<LH.Artifacts.SingleImageUsage>} */ ([]));

        return htmlImages.concat(cssImages).filter(element => {
            return element.clientWidth > 0 && element.clientHeight > 0;
        });
    })();
})()