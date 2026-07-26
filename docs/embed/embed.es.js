var xv = Object.defineProperty;
var wv = (a, o, i) => o in a ? xv(a, o, { enumerable: !0, configurable: !0, writable: !0, value: i }) : a[o] = i;
var q = (a, o, i) => wv(a, typeof o != "symbol" ? o + "" : o, i);
const Sv = '*,:before,:after{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }::backdrop{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}:before,:after{--tw-content: ""}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;-o-tab-size:4;tab-size:4;font-family:Inter,system-ui,sans-serif;font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){-webkit-text-decoration:underline dotted;text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;letter-spacing:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,input:where([type=button]),input:where([type=reset]),input:where([type=submit]){-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::-moz-placeholder,textarea::-moz-placeholder{opacity:1;color:#9ca3af}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}*,:before,:after{border-color:#e3e3e3}html,body,#root{min-height:100vh;overscroll-behavior:none;--tw-text-opacity: 1;color:rgb(0 25 48 / var(--tw-text-opacity, 1));background-color:#f7f6f4}body{font-family:Inter,system-ui,sans-serif;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}input::-moz-placeholder,textarea::-moz-placeholder{color:#00193066}input::placeholder,textarea::placeholder{color:#00193066}[data-embed-boundary] .container{width:100%}@media(min-width:640px){[data-embed-boundary] .container{max-width:640px}}@media(min-width:768px){[data-embed-boundary] .container{max-width:768px}}@media(min-width:1024px){[data-embed-boundary] .container{max-width:1024px}}@media(min-width:1280px){[data-embed-boundary] .container{max-width:1280px}}@media(min-width:1536px){[data-embed-boundary] .container{max-width:1536px}}[data-embed-boundary] .sr-only{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;white-space:nowrap!important;border-width:0!important}[data-embed-boundary] .pointer-events-none{pointer-events:none!important}[data-embed-boundary] .\\!visible,[data-embed-boundary] .visible{visibility:visible!important}[data-embed-boundary] .invisible{visibility:hidden!important}[data-embed-boundary] .static{position:static!important}[data-embed-boundary] .fixed{position:fixed!important}[data-embed-boundary] .absolute{position:absolute!important}[data-embed-boundary] .relative{position:relative!important}[data-embed-boundary] .sticky{position:sticky!important}[data-embed-boundary] .inset-0{top:0!important;right:0!important;bottom:0!important;left:0!important}[data-embed-boundary] .inset-x-0{left:0!important;right:0!important}[data-embed-boundary] .inset-y-0{top:0!important;bottom:0!important}[data-embed-boundary] .-top-2{top:-.5rem!important}[data-embed-boundary] .bottom-0{bottom:0!important}[data-embed-boundary] .bottom-3{bottom:.75rem!important}[data-embed-boundary] .left-0{left:0!important}[data-embed-boundary] .left-1\\/2{left:50%!important}[data-embed-boundary] .left-1\\/3{left:33.333333%!important}[data-embed-boundary] .left-2\\/3{left:66.666667%!important}[data-embed-boundary] .right-0{right:0!important}[data-embed-boundary] .right-3{right:.75rem!important}[data-embed-boundary] .right-section{right:24px!important}[data-embed-boundary] .top-0{top:0!important}[data-embed-boundary] .top-1\\/2{top:50%!important}[data-embed-boundary] .top-\\[25\\%\\]{top:25%!important}[data-embed-boundary] .top-\\[2px\\]{top:2px!important}[data-embed-boundary] .top-full{top:100%!important}[data-embed-boundary] .isolate{isolation:isolate!important}[data-embed-boundary] .z-0{z-index:0!important}[data-embed-boundary] .z-10{z-index:10!important}[data-embed-boundary] .z-20{z-index:20!important}[data-embed-boundary] .z-50{z-index:50!important}[data-embed-boundary] .order-1{order:1!important}[data-embed-boundary] .order-2{order:2!important}[data-embed-boundary] .col-span-2{grid-column:span 2 / span 2!important}[data-embed-boundary] .col-start-1{grid-column-start:1!important}[data-embed-boundary] .col-start-2{grid-column-start:2!important}[data-embed-boundary] .row-span-2{grid-row:span 2 / span 2!important}[data-embed-boundary] .row-start-1{grid-row-start:1!important}[data-embed-boundary] .row-start-2{grid-row-start:2!important}[data-embed-boundary] .row-start-3{grid-row-start:3!important}[data-embed-boundary] .row-start-4{grid-row-start:4!important}[data-embed-boundary] .m-0{margin:0!important}[data-embed-boundary] .mx-1\\.5{margin-left:.375rem!important;margin-right:.375rem!important}[data-embed-boundary] .mx-2{margin-left:.5rem!important;margin-right:.5rem!important}[data-embed-boundary] .mx-auto{margin-left:auto!important;margin-right:auto!important}[data-embed-boundary] .-mt-0\\.5{margin-top:-.125rem!important}[data-embed-boundary] .mb-5{margin-bottom:1.25rem!important}[data-embed-boundary] .ml-1{margin-left:.25rem!important}[data-embed-boundary] .ml-2{margin-left:.5rem!important}[data-embed-boundary] .mr-2{margin-right:.5rem!important}[data-embed-boundary] .mt-0\\.5{margin-top:.125rem!important}[data-embed-boundary] .mt-1{margin-top:.25rem!important}[data-embed-boundary] .mt-1\\.5{margin-top:.375rem!important}[data-embed-boundary] .mt-10{margin-top:2.5rem!important}[data-embed-boundary] .mt-2{margin-top:.5rem!important}[data-embed-boundary] .mt-3{margin-top:.75rem!important}[data-embed-boundary] .mt-4{margin-top:1rem!important}[data-embed-boundary] .mt-5{margin-top:1.25rem!important}[data-embed-boundary] .mt-6{margin-top:1.5rem!important}[data-embed-boundary] .mt-7{margin-top:1.75rem!important}[data-embed-boundary] .mt-8{margin-top:2rem!important}[data-embed-boundary] .mt-auto{margin-top:auto!important}[data-embed-boundary] .mt-px{margin-top:1px!important}[data-embed-boundary] .mt-section{margin-top:24px!important}[data-embed-boundary] .box-border{box-sizing:border-box!important}[data-embed-boundary] .block{display:block!important}[data-embed-boundary] .inline{display:inline!important}[data-embed-boundary] .flex{display:flex!important}[data-embed-boundary] .inline-flex{display:inline-flex!important}[data-embed-boundary] .table{display:table!important}[data-embed-boundary] .grid{display:grid!important}[data-embed-boundary] .hidden{display:none!important}[data-embed-boundary] .aspect-square{aspect-ratio:1 / 1!important}[data-embed-boundary] .aspect-video{aspect-ratio:16 / 9!important}[data-embed-boundary] .h-1\\/2{height:50%!important}[data-embed-boundary] .h-10{height:2.5rem!important}[data-embed-boundary] .h-11{height:2.75rem!important}[data-embed-boundary] .h-14{height:3.5rem!important}[data-embed-boundary] .h-16{height:4rem!important}[data-embed-boundary] .h-2{height:.5rem!important}[data-embed-boundary] .h-3\\.5{height:.875rem!important}[data-embed-boundary] .h-4{height:1rem!important}[data-embed-boundary] .h-5{height:1.25rem!important}[data-embed-boundary] .h-7{height:1.75rem!important}[data-embed-boundary] .h-8{height:2rem!important}[data-embed-boundary] .h-9{height:2.25rem!important}[data-embed-boundary] .h-\\[100px\\]{height:100px!important}[data-embed-boundary] .h-\\[1em\\]{height:1em!important}[data-embed-boundary] .h-\\[2px\\]{height:2px!important}[data-embed-boundary] .h-\\[33px\\]{height:33px!important}[data-embed-boundary] .h-\\[38px\\]{height:38px!important}[data-embed-boundary] .h-\\[3px\\]{height:3px!important}[data-embed-boundary] .h-\\[42px\\]{height:42px!important}[data-embed-boundary] .h-\\[50px\\]{height:50px!important}[data-embed-boundary] .h-\\[54px\\]{height:54px!important}[data-embed-boundary] .h-\\[60px\\]{height:60px!important}[data-embed-boundary] .h-\\[80px\\]{height:80px!important}[data-embed-boundary] .h-auto{height:auto!important}[data-embed-boundary] .h-chapter-spacing{height:30px!important}[data-embed-boundary] .h-chapter-title{height:60px!important}[data-embed-boundary] .h-faq-row{height:45px!important}[data-embed-boundary] .h-full{height:100%!important}[data-embed-boundary] .h-header{height:72px!important}[data-embed-boundary] .h-hero-image{height:584px!important}[data-embed-boundary] .h-px{height:1px!important}[data-embed-boundary] .h-screen{height:100vh!important}[data-embed-boundary] .h-social-proof{height:90px!important}[data-embed-boundary] .max-h-0{max-height:0px!important}[data-embed-boundary] .max-h-10{max-height:2.5rem!important}[data-embed-boundary] .max-h-\\[90vh\\]{max-height:90vh!important}[data-embed-boundary] .max-h-none{max-height:none!important}[data-embed-boundary] .min-h-0{min-height:0px!important}[data-embed-boundary] .min-h-\\[3\\.5rem\\]{min-height:3.5rem!important}[data-embed-boundary] .min-h-\\[36px\\]{min-height:36px!important}[data-embed-boundary] .min-h-\\[50px\\]{min-height:50px!important}[data-embed-boundary] .min-h-\\[50vh\\]{min-height:50vh!important}[data-embed-boundary] .min-h-\\[60px\\]{min-height:60px!important}[data-embed-boundary] .min-h-faq-ai{min-height:480px!important}[data-embed-boundary] .min-h-screen{min-height:100vh!important}[data-embed-boundary] .w-1\\/2{width:50%!important}[data-embed-boundary] .w-1\\/4{width:25%!important}[data-embed-boundary] .w-10{width:2.5rem!important}[data-embed-boundary] .w-11{width:2.75rem!important}[data-embed-boundary] .w-16{width:4rem!important}[data-embed-boundary] .w-2{width:.5rem!important}[data-embed-boundary] .w-3\\.5{width:.875rem!important}[data-embed-boundary] .w-4{width:1rem!important}[data-embed-boundary] .w-5{width:1.25rem!important}[data-embed-boundary] .w-56{width:14rem!important}[data-embed-boundary] .w-7{width:1.75rem!important}[data-embed-boundary] .w-8{width:2rem!important}[data-embed-boundary] .w-9{width:2.25rem!important}[data-embed-boundary] .w-\\[1em\\]{width:1em!important}[data-embed-boundary] .w-\\[38px\\]{width:38px!important}[data-embed-boundary] .w-\\[42px\\]{width:42px!important}[data-embed-boundary] .w-\\[580px\\]{width:580px!important}[data-embed-boundary] .w-\\[680px\\]{width:680px!important}[data-embed-boundary] .w-\\[682px\\]{width:682px!important}[data-embed-boundary] .w-\\[690px\\]{width:690px!important}[data-embed-boundary] .w-\\[min\\(90vw\\,calc\\(90vh\\*16\\/9\\)\\)\\]{width:min(90vw,160vh)!important}[data-embed-boundary] .w-auto{width:auto!important}[data-embed-boundary] .w-canvas{width:1432px!important}[data-embed-boundary] .w-full{width:100%!important}[data-embed-boundary] .w-px{width:1px!important}[data-embed-boundary] .w-sidebar{width:48px!important}[data-embed-boundary] .min-w-0{min-width:0px!important}[data-embed-boundary] .min-w-\\[580px\\]{min-width:580px!important}[data-embed-boundary] .min-w-canvas{min-width:1432px!important}[data-embed-boundary] .max-w-2xl{max-width:42rem!important}[data-embed-boundary] .max-w-5xl{max-width:64rem!important}[data-embed-boundary] .max-w-\\[20rem\\]{max-width:20rem!important}[data-embed-boundary] .max-w-\\[52\\.8rem\\]{max-width:52.8rem!important}[data-embed-boundary] .max-w-\\[580px\\]{max-width:580px!important}[data-embed-boundary] .max-w-\\[61\\.6rem\\]{max-width:61.6rem!important}[data-embed-boundary] .max-w-\\[680px\\]{max-width:680px!important}[data-embed-boundary] .max-w-\\[682px\\]{max-width:682px!important}[data-embed-boundary] .max-w-\\[685px\\]{max-width:685px!important}[data-embed-boundary] .max-w-\\[85\\%\\]{max-width:85%!important}[data-embed-boundary] .max-w-\\[90vw\\]{max-width:90vw!important}[data-embed-boundary] .max-w-\\[96px\\]{max-width:96px!important}[data-embed-boundary] .max-w-canvas{max-width:1432px!important}[data-embed-boundary] .max-w-full{max-width:100%!important}[data-embed-boundary] .max-w-md{max-width:28rem!important}[data-embed-boundary] .max-w-none{max-width:none!important}[data-embed-boundary] .max-w-xl{max-width:36rem!important}[data-embed-boundary] .flex-1{flex:1 1 0%!important}[data-embed-boundary] .shrink-0{flex-shrink:0!important}[data-embed-boundary] .grow-0{flex-grow:0!important}[data-embed-boundary] .-translate-x-1\\/2{--tw-translate-x: -50% !important;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))!important}[data-embed-boundary] .-translate-x-\\[10px\\]{--tw-translate-x: -10px !important;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))!important}[data-embed-boundary] .-translate-y-1\\/2{--tw-translate-y: -50% !important;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))!important}[data-embed-boundary] .translate-x-1\\/2{--tw-translate-x: 50% !important;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))!important}[data-embed-boundary] .translate-x-\\[10px\\]{--tw-translate-x: 10px !important;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))!important}[data-embed-boundary] .translate-y-0{--tw-translate-y: 0px !important;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))!important}[data-embed-boundary] .translate-y-1{--tw-translate-y: .25rem !important;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))!important}[data-embed-boundary] .translate-y-\\[2px\\]{--tw-translate-y: 2px !important;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))!important}[data-embed-boundary] .translate-y-\\[50px\\]{--tw-translate-y: 50px !important;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))!important}[data-embed-boundary] .rotate-0{--tw-rotate: 0deg !important;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))!important}[data-embed-boundary] .rotate-180{--tw-rotate: 180deg !important;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))!important}[data-embed-boundary] .scale-100{--tw-scale-x: 1 !important;--tw-scale-y: 1 !important;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))!important}[data-embed-boundary] .scale-\\[0\\.893\\]{--tw-scale-x: .893 !important;--tw-scale-y: .893 !important;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))!important}[data-embed-boundary] .scale-\\[1\\.12\\]{--tw-scale-x: 1.12 !important;--tw-scale-y: 1.12 !important;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))!important}[data-embed-boundary] .cursor-not-allowed{cursor:not-allowed!important}[data-embed-boundary] .cursor-pointer{cursor:pointer!important}[data-embed-boundary] .touch-none{touch-action:none!important}[data-embed-boundary] .touch-manipulation{touch-action:manipulation!important}[data-embed-boundary] .resize-none{resize:none!important}[data-embed-boundary] .resize{resize:both!important}[data-embed-boundary] .scroll-mt-header{scroll-margin-top:72px!important}[data-embed-boundary] .list-decimal{list-style-type:decimal!important}[data-embed-boundary] .list-disc{list-style-type:disc!important}[data-embed-boundary] .list-none{list-style-type:none!important}[data-embed-boundary] .grid-cols-1{grid-template-columns:repeat(1,minmax(0,1fr))!important}[data-embed-boundary] .grid-cols-2{grid-template-columns:repeat(2,minmax(0,1fr))!important}[data-embed-boundary] .grid-cols-3{grid-template-columns:repeat(3,minmax(0,1fr))!important}[data-embed-boundary] .grid-cols-4{grid-template-columns:repeat(4,minmax(0,1fr))!important}[data-embed-boundary] .grid-cols-5{grid-template-columns:repeat(5,minmax(0,1fr))!important}[data-embed-boundary] .grid-cols-\\[1fr_auto_1fr\\]{grid-template-columns:1fr auto 1fr!important}[data-embed-boundary] .grid-cols-\\[52fr_48fr\\]{grid-template-columns:52fr 48fr!important}[data-embed-boundary] .grid-cols-\\[690px_minmax\\(0\\,1fr\\)\\]{grid-template-columns:690px minmax(0,1fr)!important}[data-embed-boundary] .grid-cols-\\[minmax\\(0\\,1fr\\)_minmax\\(0\\,2fr\\)\\]{grid-template-columns:minmax(0,1fr) minmax(0,2fr)!important}[data-embed-boundary] .grid-rows-\\[auto_auto_auto_auto\\]{grid-template-rows:auto auto auto auto!important}[data-embed-boundary] .grid-rows-\\[auto_minmax\\(16rem\\,1fr\\)\\]{grid-template-rows:auto minmax(16rem,1fr)!important}[data-embed-boundary] .flex-col{flex-direction:column!important}[data-embed-boundary] .flex-wrap{flex-wrap:wrap!important}[data-embed-boundary] .place-items-center{place-items:center!important}[data-embed-boundary] .content-start{align-content:flex-start!important}[data-embed-boundary] .items-start{align-items:flex-start!important}[data-embed-boundary] .items-end{align-items:flex-end!important}[data-embed-boundary] .items-center{align-items:center!important}[data-embed-boundary] .items-baseline{align-items:baseline!important}[data-embed-boundary] .items-stretch{align-items:stretch!important}[data-embed-boundary] .justify-start{justify-content:flex-start!important}[data-embed-boundary] .justify-end{justify-content:flex-end!important}[data-embed-boundary] .justify-center{justify-content:center!important}[data-embed-boundary] .justify-between{justify-content:space-between!important}[data-embed-boundary] .justify-items-center{justify-items:center!important}[data-embed-boundary] .gap-0{gap:0px!important}[data-embed-boundary] .gap-0\\.5{gap:.125rem!important}[data-embed-boundary] .gap-1{gap:.25rem!important}[data-embed-boundary] .gap-1\\.5{gap:.375rem!important}[data-embed-boundary] .gap-14{gap:3.5rem!important}[data-embed-boundary] .gap-2{gap:.5rem!important}[data-embed-boundary] .gap-2\\.5{gap:.625rem!important}[data-embed-boundary] .gap-3{gap:.75rem!important}[data-embed-boundary] .gap-4{gap:1rem!important}[data-embed-boundary] .gap-5{gap:1.25rem!important}[data-embed-boundary] .gap-6{gap:1.5rem!important}[data-embed-boundary] .gap-\\[14px\\]{gap:14px!important}[data-embed-boundary] .gap-\\[30px\\]{gap:30px!important}[data-embed-boundary] .gap-section{gap:24px!important}[data-embed-boundary] .gap-x-10{-moz-column-gap:2.5rem!important;column-gap:2.5rem!important}[data-embed-boundary] .gap-x-4{-moz-column-gap:1rem!important;column-gap:1rem!important}[data-embed-boundary] .gap-x-6{-moz-column-gap:1.5rem!important;column-gap:1.5rem!important}[data-embed-boundary] .gap-x-8{-moz-column-gap:2rem!important;column-gap:2rem!important}[data-embed-boundary] .gap-x-section{-moz-column-gap:24px!important;column-gap:24px!important}[data-embed-boundary] .gap-y-1{row-gap:.25rem!important}[data-embed-boundary] .gap-y-3{row-gap:.75rem!important}[data-embed-boundary] .gap-y-4{row-gap:1rem!important}[data-embed-boundary] .space-y-1>:not([hidden])~:not([hidden]){--tw-space-y-reverse: 0 !important;margin-top:calc(.25rem * calc(1 - var(--tw-space-y-reverse)))!important;margin-bottom:calc(.25rem * var(--tw-space-y-reverse))!important}[data-embed-boundary] .space-y-1\\.5>:not([hidden])~:not([hidden]){--tw-space-y-reverse: 0 !important;margin-top:calc(.375rem * calc(1 - var(--tw-space-y-reverse)))!important;margin-bottom:calc(.375rem * var(--tw-space-y-reverse))!important}[data-embed-boundary] .space-y-2>:not([hidden])~:not([hidden]){--tw-space-y-reverse: 0 !important;margin-top:calc(.5rem * calc(1 - var(--tw-space-y-reverse)))!important;margin-bottom:calc(.5rem * var(--tw-space-y-reverse))!important}[data-embed-boundary] .space-y-3>:not([hidden])~:not([hidden]){--tw-space-y-reverse: 0 !important;margin-top:calc(.75rem * calc(1 - var(--tw-space-y-reverse)))!important;margin-bottom:calc(.75rem * var(--tw-space-y-reverse))!important}[data-embed-boundary] .space-y-section>:not([hidden])~:not([hidden]){--tw-space-y-reverse: 0 !important;margin-top:calc(24px * calc(1 - var(--tw-space-y-reverse)))!important;margin-bottom:calc(24px * var(--tw-space-y-reverse))!important}[data-embed-boundary] .divide-x>:not([hidden])~:not([hidden]){--tw-divide-x-reverse: 0 !important;border-right-width:calc(1px * var(--tw-divide-x-reverse))!important;border-left-width:calc(1px * calc(1 - var(--tw-divide-x-reverse)))!important}[data-embed-boundary] .divide-x-0>:not([hidden])~:not([hidden]){--tw-divide-x-reverse: 0 !important;border-right-width:calc(0px * var(--tw-divide-x-reverse))!important;border-left-width:calc(0px * calc(1 - var(--tw-divide-x-reverse)))!important}[data-embed-boundary] .divide-y>:not([hidden])~:not([hidden]){--tw-divide-y-reverse: 0 !important;border-top-width:calc(1px * calc(1 - var(--tw-divide-y-reverse)))!important;border-bottom-width:calc(1px * var(--tw-divide-y-reverse))!important}[data-embed-boundary] .divide-embed-border-default>:not([hidden])~:not([hidden]){--tw-divide-opacity: 1 !important;border-color:rgb(227 227 227 / var(--tw-divide-opacity, 1))!important}[data-embed-boundary] .self-start{align-self:flex-start!important}[data-embed-boundary] .self-stretch{align-self:stretch!important}[data-embed-boundary] .justify-self-start{justify-self:start!important}[data-embed-boundary] .justify-self-end{justify-self:end!important}[data-embed-boundary] .overflow-hidden{overflow:hidden!important}[data-embed-boundary] .overflow-visible{overflow:visible!important}[data-embed-boundary] .overflow-x-auto{overflow-x:auto!important}[data-embed-boundary] .overflow-y-auto{overflow-y:auto!important}[data-embed-boundary] .overflow-x-hidden{overflow-x:hidden!important}[data-embed-boundary] .overflow-y-hidden{overflow-y:hidden!important}[data-embed-boundary] .overscroll-x-contain{overscroll-behavior-x:contain!important}[data-embed-boundary] .truncate{overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important}[data-embed-boundary] .rounded{border-radius:.25rem!important}[data-embed-boundary] .rounded-\\[11px\\]{border-radius:11px!important}[data-embed-boundary] .rounded-\\[5px\\]{border-radius:5px!important}[data-embed-boundary] .rounded-\\[6px\\]{border-radius:6px!important}[data-embed-boundary] .rounded-\\[7px\\]{border-radius:7px!important}[data-embed-boundary] .rounded-\\[8px\\]{border-radius:8px!important}[data-embed-boundary] .rounded-full{border-radius:9999px!important}[data-embed-boundary] .rounded-md{border-radius:.375rem!important}[data-embed-boundary] .rounded-sm{border-radius:.125rem!important}[data-embed-boundary] .border{border-width:1px!important}[data-embed-boundary] .border-0{border-width:0px!important}[data-embed-boundary] .border-2{border-width:2px!important}[data-embed-boundary] .border-b{border-bottom-width:1px!important}[data-embed-boundary] .border-r{border-right-width:1px!important}[data-embed-boundary] .border-t{border-top-width:1px!important}[data-embed-boundary] .border-\\[\\#D4AF37\\]{--tw-border-opacity: 1 !important;border-color:rgb(212 175 55 / var(--tw-border-opacity, 1))!important}[data-embed-boundary] .border-embed-action-secondaryAccent{--tw-border-opacity: 1 !important;border-color:rgb(200 161 101 / var(--tw-border-opacity, 1))!important}[data-embed-boundary] .border-embed-border-default{--tw-border-opacity: 1 !important;border-color:rgb(227 227 227 / var(--tw-border-opacity, 1))!important}[data-embed-boundary] .border-embed-border-default\\/60{border-color:#e3e3e399!important}[data-embed-boundary] .border-embed-border-default\\/70{border-color:#e3e3e3b3!important}[data-embed-boundary] .border-embed-border-default\\/80{border-color:#e3e3e3cc!important}[data-embed-boundary] .border-embed-brand-gold{--tw-border-opacity: 1 !important;border-color:rgb(200 161 101 / var(--tw-border-opacity, 1))!important}[data-embed-boundary] .border-embed-brand-gold\\/50{border-color:#c8a16580!important}[data-embed-boundary] .border-embed-brand-gold\\/60{border-color:#c8a16599!important}[data-embed-boundary] .border-embed-foreground-primary\\/10{border-color:#0019301a!important}[data-embed-boundary] .border-embed-foreground-primary\\/15{border-color:#00193026!important}[data-embed-boundary] .border-transparent{border-color:transparent!important}[data-embed-boundary] .\\!bg-\\[\\#FFFFFF\\]{--tw-bg-opacity: 1 !important;background-color:rgb(255 255 255 / var(--tw-bg-opacity, 1))!important}[data-embed-boundary] .bg-\\[\\#001930\\]{--tw-bg-opacity: 1 !important;background-color:rgb(0 25 48 / var(--tw-bg-opacity, 1))!important}[data-embed-boundary] .bg-\\[\\#E3E3E3\\]{--tw-bg-opacity: 1 !important;background-color:rgb(227 227 227 / var(--tw-bg-opacity, 1))!important}[data-embed-boundary] .bg-\\[\\#E8E5E0\\]{--tw-bg-opacity: 1 !important;background-color:rgb(232 229 224 / var(--tw-bg-opacity, 1))!important}[data-embed-boundary] .bg-\\[\\#F4F3F1\\]{--tw-bg-opacity: 1 !important;background-color:rgb(244 243 241 / var(--tw-bg-opacity, 1))!important}[data-embed-boundary] .bg-\\[\\#F7F6F4\\]{--tw-bg-opacity: 1 !important;background-color:rgb(247 246 244 / var(--tw-bg-opacity, 1))!important}[data-embed-boundary] .bg-\\[\\#FFFFFF\\]{--tw-bg-opacity: 1 !important;background-color:rgb(255 255 255 / var(--tw-bg-opacity, 1))!important}[data-embed-boundary] .bg-embed-action-primary{--tw-bg-opacity: 1 !important;background-color:rgb(0 25 48 / var(--tw-bg-opacity, 1))!important}[data-embed-boundary] .bg-embed-action-secondary{--tw-bg-opacity: 1 !important;background-color:rgb(255 255 255 / var(--tw-bg-opacity, 1))!important}[data-embed-boundary] .bg-embed-background-primary{--tw-bg-opacity: 1 !important;background-color:rgb(247 246 244 / var(--tw-bg-opacity, 1))!important}[data-embed-boundary] .bg-embed-background-primary\\/15{background-color:#f7f6f426!important}[data-embed-boundary] .bg-embed-background-primary\\/50{background-color:#f7f6f480!important}[data-embed-boundary] .bg-embed-background-primary\\/90{background-color:#f7f6f4e6!important}[data-embed-boundary] .bg-embed-background-secondary{--tw-bg-opacity: 1 !important;background-color:rgb(247 246 244 / var(--tw-bg-opacity, 1))!important}[data-embed-boundary] .bg-embed-background-tertiary{--tw-bg-opacity: 1 !important;background-color:rgb(227 227 227 / var(--tw-bg-opacity, 1))!important}[data-embed-boundary] .bg-embed-background-tertiary\\/60{background-color:#e3e3e399!important}[data-embed-boundary] .bg-embed-background-tertiary\\/80{background-color:#e3e3e3cc!important}[data-embed-boundary] .bg-embed-border-default{--tw-bg-opacity: 1 !important;background-color:rgb(227 227 227 / var(--tw-bg-opacity, 1))!important}[data-embed-boundary] .bg-embed-brand-gold{--tw-bg-opacity: 1 !important;background-color:rgb(200 161 101 / var(--tw-bg-opacity, 1))!important}[data-embed-boundary] .bg-embed-brand-gold\\/10{background-color:#c8a1651a!important}[data-embed-boundary] .bg-embed-brand-gold\\/15{background-color:#c8a16526!important}[data-embed-boundary] .bg-embed-brand-navy{--tw-bg-opacity: 1 !important;background-color:rgb(0 25 48 / var(--tw-bg-opacity, 1))!important}[data-embed-boundary] .bg-embed-brand-navy\\/70{background-color:#001930b3!important}[data-embed-boundary] .bg-embed-foreground-primary\\/10{background-color:#0019301a!important}[data-embed-boundary] .bg-embed-surface-card{--tw-bg-opacity: 1 !important;background-color:rgb(247 246 244 / var(--tw-bg-opacity, 1))!important}[data-embed-boundary] .bg-embed-surface-elevated{--tw-bg-opacity: 1 !important;background-color:rgb(255 255 255 / var(--tw-bg-opacity, 1))!important}[data-embed-boundary] .bg-embed-surface-inset{--tw-bg-opacity: 1 !important;background-color:rgb(227 227 227 / var(--tw-bg-opacity, 1))!important}[data-embed-boundary] .bg-embed-surface-interactive{--tw-bg-opacity: 1 !important;background-color:rgb(232 229 224 / var(--tw-bg-opacity, 1))!important}[data-embed-boundary] .bg-embed-surface-placeholder{--tw-bg-opacity: 1 !important;background-color:rgb(227 227 227 / var(--tw-bg-opacity, 1))!important}[data-embed-boundary] .bg-transparent{background-color:transparent!important}[data-embed-boundary] .bg-white{--tw-bg-opacity: 1 !important;background-color:rgb(255 255 255 / var(--tw-bg-opacity, 1))!important}[data-embed-boundary] .bg-white\\/45{background-color:#ffffff73!important}[data-embed-boundary] .bg-white\\/65{background-color:#ffffffa6!important}[data-embed-boundary] .bg-white\\/90{background-color:#ffffffe6!important}[data-embed-boundary] .bg-cover{background-size:cover!important}[data-embed-boundary] .bg-\\[center_42\\%\\]{background-position:center 42%!important}[data-embed-boundary] .bg-no-repeat{background-repeat:no-repeat!important}[data-embed-boundary] .fill-embed-foreground-primary{fill:#001930!important}[data-embed-boundary] .object-contain{-o-object-fit:contain!important;object-fit:contain!important}[data-embed-boundary] .object-cover{-o-object-fit:cover!important;object-fit:cover!important}[data-embed-boundary] .p-0{padding:0!important}[data-embed-boundary] .p-0\\.5{padding:.125rem!important}[data-embed-boundary] .p-4{padding:1rem!important}[data-embed-boundary] .p-section{padding:24px!important}[data-embed-boundary] .px-0{padding-left:0!important;padding-right:0!important}[data-embed-boundary] .px-1\\.5{padding-left:.375rem!important;padding-right:.375rem!important}[data-embed-boundary] .px-2{padding-left:.5rem!important;padding-right:.5rem!important}[data-embed-boundary] .px-2\\.5{padding-left:.625rem!important;padding-right:.625rem!important}[data-embed-boundary] .px-3{padding-left:.75rem!important;padding-right:.75rem!important}[data-embed-boundary] .px-4{padding-left:1rem!important;padding-right:1rem!important}[data-embed-boundary] .px-6{padding-left:1.5rem!important;padding-right:1.5rem!important}[data-embed-boundary] .px-8{padding-left:2rem!important;padding-right:2rem!important}[data-embed-boundary] .px-\\[21px\\]{padding-left:21px!important;padding-right:21px!important}[data-embed-boundary] .px-section{padding-left:24px!important;padding-right:24px!important}[data-embed-boundary] .py-0{padding-top:0!important;padding-bottom:0!important}[data-embed-boundary] .py-0\\.5{padding-top:.125rem!important;padding-bottom:.125rem!important}[data-embed-boundary] .py-1{padding-top:.25rem!important;padding-bottom:.25rem!important}[data-embed-boundary] .py-1\\.5{padding-top:.375rem!important;padding-bottom:.375rem!important}[data-embed-boundary] .py-2{padding-top:.5rem!important;padding-bottom:.5rem!important}[data-embed-boundary] .py-2\\.5{padding-top:.625rem!important;padding-bottom:.625rem!important}[data-embed-boundary] .py-3{padding-top:.75rem!important;padding-bottom:.75rem!important}[data-embed-boundary] .py-4{padding-top:1rem!important;padding-bottom:1rem!important}[data-embed-boundary] .py-5{padding-top:1.25rem!important;padding-bottom:1.25rem!important}[data-embed-boundary] .py-8{padding-top:2rem!important;padding-bottom:2rem!important}[data-embed-boundary] .py-section{padding-top:24px!important;padding-bottom:24px!important}[data-embed-boundary] .pb-1{padding-bottom:.25rem!important}[data-embed-boundary] .pb-10{padding-bottom:2.5rem!important}[data-embed-boundary] .pb-2{padding-bottom:.5rem!important}[data-embed-boundary] .pb-3{padding-bottom:.75rem!important}[data-embed-boundary] .pb-5{padding-bottom:1.25rem!important}[data-embed-boundary] .pb-8{padding-bottom:2rem!important}[data-embed-boundary] .pb-section{padding-bottom:24px!important}[data-embed-boundary] .pl-10{padding-left:2.5rem!important}[data-embed-boundary] .pl-2\\.5{padding-left:.625rem!important}[data-embed-boundary] .pl-4{padding-left:1rem!important}[data-embed-boundary] .pl-5{padding-left:1.25rem!important}[data-embed-boundary] .pl-\\[14px\\]{padding-left:14px!important}[data-embed-boundary] .pl-\\[20px\\]{padding-left:20px!important}[data-embed-boundary] .pl-\\[40px\\]{padding-left:40px!important}[data-embed-boundary] .pl-section{padding-left:24px!important}[data-embed-boundary] .pr-0{padding-right:0!important}[data-embed-boundary] .pr-2{padding-right:.5rem!important}[data-embed-boundary] .pr-5{padding-right:1.25rem!important}[data-embed-boundary] .pr-\\[20px\\]{padding-right:20px!important}[data-embed-boundary] .pt-0{padding-top:0!important}[data-embed-boundary] .pt-14{padding-top:3.5rem!important}[data-embed-boundary] .pt-2{padding-top:.5rem!important}[data-embed-boundary] .pt-3{padding-top:.75rem!important}[data-embed-boundary] .pt-4{padding-top:1rem!important}[data-embed-boundary] .pt-6{padding-top:1.5rem!important}[data-embed-boundary] .pt-\\[20px\\]{padding-top:20px!important}[data-embed-boundary] .pt-section{padding-top:24px!important}[data-embed-boundary] .text-left{text-align:left!important}[data-embed-boundary] .text-center{text-align:center!important}[data-embed-boundary] .text-right{text-align:right!important}[data-embed-boundary] .font-sans{font-family:Inter,system-ui,sans-serif!important}[data-embed-boundary] .text-2xl{font-size:1.5rem!important;line-height:2rem!important}[data-embed-boundary] .text-5xl{font-size:3rem!important;line-height:1!important}[data-embed-boundary] .text-\\[10px\\]{font-size:10px!important}[data-embed-boundary] .text-\\[11px\\]{font-size:11px!important}[data-embed-boundary] .text-\\[13px\\]{font-size:13px!important}[data-embed-boundary] .text-\\[2\\.52rem\\]{font-size:2.52rem!important}[data-embed-boundary] .text-\\[22px\\]{font-size:22px!important}[data-embed-boundary] .text-\\[2rem\\]{font-size:2rem!important}[data-embed-boundary] .text-\\[9px\\]{font-size:9px!important}[data-embed-boundary] .text-base{font-size:1rem!important;line-height:1.5rem!important}[data-embed-boundary] .text-lg{font-size:1.125rem!important;line-height:1.75rem!important}[data-embed-boundary] .text-sm{font-size:.875rem!important;line-height:1.25rem!important}[data-embed-boundary] .text-xl{font-size:1.25rem!important;line-height:1.75rem!important}[data-embed-boundary] .text-xs{font-size:.75rem!important;line-height:1rem!important}[data-embed-boundary] .font-black{font-weight:900!important}[data-embed-boundary] .font-bold{font-weight:700!important}[data-embed-boundary] .font-medium{font-weight:500!important}[data-embed-boundary] .font-normal{font-weight:400!important}[data-embed-boundary] .font-semibold{font-weight:600!important}[data-embed-boundary] .uppercase{text-transform:uppercase!important}[data-embed-boundary] .tabular-nums{--tw-numeric-spacing: tabular-nums !important;font-variant-numeric:var(--tw-ordinal) var(--tw-slashed-zero) var(--tw-numeric-figure) var(--tw-numeric-spacing) var(--tw-numeric-fraction)!important}[data-embed-boundary] .leading-\\[1\\.15\\]{line-height:1.15!important}[data-embed-boundary] .leading-\\[1\\.1\\]{line-height:1.1!important}[data-embed-boundary] .leading-\\[50px\\]{line-height:50px!important}[data-embed-boundary] .leading-none{line-height:1!important}[data-embed-boundary] .leading-relaxed{line-height:1.625!important}[data-embed-boundary] .leading-snug{line-height:1.375!important}[data-embed-boundary] .leading-tight{line-height:1.25!important}[data-embed-boundary] .tracking-\\[0\\.18em\\]{letter-spacing:.18em!important}[data-embed-boundary] .tracking-brand{letter-spacing:.24em!important}[data-embed-boundary] .tracking-tight{letter-spacing:-.025em!important}[data-embed-boundary] .tracking-wide{letter-spacing:.05em!important}[data-embed-boundary] .text-\\[\\#001930\\]{--tw-text-opacity: 1 !important;color:rgb(0 25 48 / var(--tw-text-opacity, 1))!important}[data-embed-boundary] .text-\\[\\#001930\\]\\/70{color:#001930b3!important}[data-embed-boundary] .text-\\[\\#D4AF37\\]{--tw-text-opacity: 1 !important;color:rgb(212 175 55 / var(--tw-text-opacity, 1))!important}[data-embed-boundary] .text-\\[\\#FFFFFF\\],[data-embed-boundary] .text-embed-action-onPrimary{--tw-text-opacity: 1 !important;color:rgb(255 255 255 / var(--tw-text-opacity, 1))!important}[data-embed-boundary] .text-embed-action-onSecondary{--tw-text-opacity: 1 !important;color:rgb(0 25 48 / var(--tw-text-opacity, 1))!important}[data-embed-boundary] .text-embed-action-secondaryAccent{--tw-text-opacity: 1 !important;color:rgb(200 161 101 / var(--tw-text-opacity, 1))!important}[data-embed-boundary] .text-embed-background-primary{--tw-text-opacity: 1 !important;color:rgb(247 246 244 / var(--tw-text-opacity, 1))!important}[data-embed-boundary] .text-embed-background-primary\\/45{color:#f7f6f473!important}[data-embed-boundary] .text-embed-background-primary\\/55{color:#f7f6f48c!important}[data-embed-boundary] .text-embed-background-primary\\/70{color:#f7f6f4b3!important}[data-embed-boundary] .text-embed-background-primary\\/90{color:#f7f6f4e6!important}[data-embed-boundary] .text-embed-border-strong{--tw-text-opacity: 1 !important;color:rgb(227 227 227 / var(--tw-text-opacity, 1))!important}[data-embed-boundary] .text-embed-brand-gold{--tw-text-opacity: 1 !important;color:rgb(200 161 101 / var(--tw-text-opacity, 1))!important}[data-embed-boundary] .text-embed-foreground-primary{--tw-text-opacity: 1 !important;color:rgb(0 25 48 / var(--tw-text-opacity, 1))!important}[data-embed-boundary] .text-embed-foreground-primary\\/35{color:#00193059!important}[data-embed-boundary] .text-embed-foreground-primary\\/40{color:#00193066!important}[data-embed-boundary] .text-embed-foreground-primary\\/45{color:#00193073!important}[data-embed-boundary] .text-embed-foreground-primary\\/50{color:#00193080!important}[data-embed-boundary] .text-embed-foreground-primary\\/55{color:#0019308c!important}[data-embed-boundary] .text-embed-foreground-primary\\/60{color:#00193099!important}[data-embed-boundary] .text-embed-foreground-primary\\/65{color:#001930a6!important}[data-embed-boundary] .text-embed-foreground-primary\\/70{color:#001930b3!important}[data-embed-boundary] .text-embed-foreground-primary\\/75{color:#001930bf!important}[data-embed-boundary] .text-embed-foreground-primary\\/80{color:#001930cc!important}[data-embed-boundary] .text-embed-status-ready{--tw-text-opacity: 1 !important;color:rgb(200 161 101 / var(--tw-text-opacity, 1))!important}[data-embed-boundary] .text-white{--tw-text-opacity: 1 !important;color:rgb(255 255 255 / var(--tw-text-opacity, 1))!important}[data-embed-boundary] .text-white\\/90{color:#ffffffe6!important}[data-embed-boundary] .underline{text-decoration-line:underline!important}[data-embed-boundary] .decoration-embed-border-strong{text-decoration-color:#e3e3e3!important}[data-embed-boundary] .underline-offset-2{text-underline-offset:2px!important}[data-embed-boundary] .underline-offset-4{text-underline-offset:4px!important}[data-embed-boundary] .antialiased{-webkit-font-smoothing:antialiased!important;-moz-osx-font-smoothing:grayscale!important}[data-embed-boundary] .opacity-0{opacity:0!important}[data-embed-boundary] .opacity-100{opacity:1!important}[data-embed-boundary] .opacity-40{opacity:.4!important}[data-embed-boundary] .opacity-70{opacity:.7!important}[data-embed-boundary] .opacity-80{opacity:.8!important}[data-embed-boundary] .shadow-\\[0_1px_11px_rgba\\(0\\,25\\,48\\,0\\.044\\)\\]{--tw-shadow: 0 1px 11px rgba(0,25,48,.044) !important;--tw-shadow-colored: 0 1px 11px var(--tw-shadow-color) !important;box-shadow:var(--tw-ring-offset-shadow, 0 0 #0000),var(--tw-ring-shadow, 0 0 #0000),var(--tw-shadow)!important}[data-embed-boundary] .shadow-\\[0_1px_4px_rgba\\(0\\,30\\,58\\,0\\.12\\)\\]{--tw-shadow: 0 1px 4px rgba(0,30,58,.12) !important;--tw-shadow-colored: 0 1px 4px var(--tw-shadow-color) !important;box-shadow:var(--tw-ring-offset-shadow, 0 0 #0000),var(--tw-ring-shadow, 0 0 #0000),var(--tw-shadow)!important}[data-embed-boundary] .shadow-\\[0_8px_24px_rgba\\(0\\,25\\,48\\,0\\.08\\)\\]{--tw-shadow: 0 8px 24px rgba(0,25,48,.08) !important;--tw-shadow-colored: 0 8px 24px var(--tw-shadow-color) !important;box-shadow:var(--tw-ring-offset-shadow, 0 0 #0000),var(--tw-ring-shadow, 0 0 #0000),var(--tw-shadow)!important}[data-embed-boundary] .shadow-md{--tw-shadow: 0 4px 6px -1px rgb(0 0 0 / .1), 0 2px 4px -2px rgb(0 0 0 / .1) !important;--tw-shadow-colored: 0 4px 6px -1px var(--tw-shadow-color), 0 2px 4px -2px var(--tw-shadow-color) !important;box-shadow:var(--tw-ring-offset-shadow, 0 0 #0000),var(--tw-ring-shadow, 0 0 #0000),var(--tw-shadow)!important}[data-embed-boundary] .shadow-none{--tw-shadow: 0 0 #0000 !important;--tw-shadow-colored: 0 0 #0000 !important;box-shadow:var(--tw-ring-offset-shadow, 0 0 #0000),var(--tw-ring-shadow, 0 0 #0000),var(--tw-shadow)!important}[data-embed-boundary] .shadow-sm{--tw-shadow: 0 1px 2px 0 rgb(0 0 0 / .05) !important;--tw-shadow-colored: 0 1px 2px 0 var(--tw-shadow-color) !important;box-shadow:var(--tw-ring-offset-shadow, 0 0 #0000),var(--tw-ring-shadow, 0 0 #0000),var(--tw-shadow)!important}[data-embed-boundary] .outline{outline-style:solid!important}[data-embed-boundary] .ring-1{--tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color) !important;--tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(1px + var(--tw-ring-offset-width)) var(--tw-ring-color) !important;box-shadow:var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow, 0 0 #0000)!important}[data-embed-boundary] .ring-2{--tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color) !important;--tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color) !important;box-shadow:var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow, 0 0 #0000)!important}[data-embed-boundary] .ring-embed-brand-gold{--tw-ring-opacity: 1 !important;--tw-ring-color: rgb(200 161 101 / var(--tw-ring-opacity, 1)) !important}[data-embed-boundary] .ring-embed-brand-gold\\/40{--tw-ring-color: rgb(200 161 101 / .4) !important}[data-embed-boundary] .ring-offset-1{--tw-ring-offset-width: 1px !important}[data-embed-boundary] .ring-offset-2{--tw-ring-offset-width: 2px !important}[data-embed-boundary] .ring-offset-\\[\\#F4F3F1\\]{--tw-ring-offset-color: #F4F3F1 !important}[data-embed-boundary] .grayscale{--tw-grayscale: grayscale(100%) !important;filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)!important}[data-embed-boundary] .filter{filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)!important}[data-embed-boundary] .transition{transition-property:color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter!important;transition-timing-function:cubic-bezier(.4,0,.2,1)!important;transition-duration:.15s!important}[data-embed-boundary] .transition-\\[border-color\\]{transition-property:border-color!important;transition-timing-function:cubic-bezier(.4,0,.2,1)!important;transition-duration:.15s!important}[data-embed-boundary] .transition-\\[box-shadow\\,opacity\\]{transition-property:box-shadow,opacity!important;transition-timing-function:cubic-bezier(.4,0,.2,1)!important;transition-duration:.15s!important}[data-embed-boundary] .transition-\\[fill\\]{transition-property:fill!important;transition-timing-function:cubic-bezier(.4,0,.2,1)!important;transition-duration:.15s!important}[data-embed-boundary] .transition-\\[grid-template-rows\\]{transition-property:grid-template-rows!important;transition-timing-function:cubic-bezier(.4,0,.2,1)!important;transition-duration:.15s!important}[data-embed-boundary] .transition-\\[left\\]{transition-property:left!important;transition-timing-function:cubic-bezier(.4,0,.2,1)!important;transition-duration:.15s!important}[data-embed-boundary] .transition-\\[opacity\\,transform\\,max-height\\]{transition-property:opacity,transform,max-height!important;transition-timing-function:cubic-bezier(.4,0,.2,1)!important;transition-duration:.15s!important}[data-embed-boundary] .transition-\\[transform\\,box-shadow\\,border-color\\,border-width\\]{transition-property:transform,box-shadow,border-color,border-width!important;transition-timing-function:cubic-bezier(.4,0,.2,1)!important;transition-duration:.15s!important}[data-embed-boundary] .transition-\\[transform\\,opacity\\]{transition-property:transform,opacity!important;transition-timing-function:cubic-bezier(.4,0,.2,1)!important;transition-duration:.15s!important}[data-embed-boundary] .transition-\\[width\\]{transition-property:width!important;transition-timing-function:cubic-bezier(.4,0,.2,1)!important;transition-duration:.15s!important}[data-embed-boundary] .transition-colors{transition-property:color,background-color,border-color,text-decoration-color,fill,stroke!important;transition-timing-function:cubic-bezier(.4,0,.2,1)!important;transition-duration:.15s!important}[data-embed-boundary] .transition-opacity{transition-property:opacity!important;transition-timing-function:cubic-bezier(.4,0,.2,1)!important;transition-duration:.15s!important}[data-embed-boundary] .transition-shadow{transition-property:box-shadow!important;transition-timing-function:cubic-bezier(.4,0,.2,1)!important;transition-duration:.15s!important}[data-embed-boundary] .transition-transform{transition-property:transform!important;transition-timing-function:cubic-bezier(.4,0,.2,1)!important;transition-duration:.15s!important}[data-embed-boundary] .duration-150{transition-duration:.15s!important}[data-embed-boundary] .duration-200{transition-duration:.2s!important}[data-embed-boundary] .duration-500{transition-duration:.5s!important}[data-embed-boundary] .duration-\\[125ms\\]{transition-duration:125ms!important}[data-embed-boundary] .ease-out{transition-timing-function:cubic-bezier(0,0,.2,1)!important}[data-embed-boundary] .animate-hero-photo-veil{transform-origin:left center!important;animation:hero-photo-veil-cycle 14s linear 1s infinite!important}@media(prefers-reduced-motion:reduce){[data-embed-boundary] .animate-hero-photo-veil{animation:none!important}}[data-embed-boundary] .\\[-ms-overflow-style\\:none\\]{-ms-overflow-style:none!important}[data-embed-boundary] .\\[scrollbar-width\\:none\\]{scrollbar-width:none!important}[data-embed-boundary] .\\[translate\\:1px_-1px\\]{translate:1px -1px!important}@keyframes hero-photo-veil-cycle{0%{transform:scaleX(1)}14.2857%{transform:scaleX(0)}50%{transform:scaleX(0)}64.2857%{transform:scaleX(1)}to{transform:scaleX(1)}}[data-embed-boundary] .marker\\:content-none *::marker{--tw-content: none !important;content:var(--tw-content)!important}[data-embed-boundary] .marker\\:content-none::marker{--tw-content: none !important;content:var(--tw-content)!important}[data-embed-boundary] .placeholder\\:text-embed-foreground-primary\\/40::-moz-placeholder{color:#00193066!important}[data-embed-boundary] .placeholder\\:text-embed-foreground-primary\\/40::placeholder{color:#00193066!important}[data-embed-boundary] .first\\:pl-0:first-child{padding-left:0!important}[data-embed-boundary] .last\\:pr-0:last-child{padding-right:0!important}[data-embed-boundary] .hover\\:cursor-pointer:hover{cursor:pointer!important}[data-embed-boundary] .hover\\:border-\\[\\#D4AF37\\]:hover{--tw-border-opacity: 1 !important;border-color:rgb(212 175 55 / var(--tw-border-opacity, 1))!important}[data-embed-boundary] .hover\\:border-embed-brand-gold:hover{--tw-border-opacity: 1 !important;border-color:rgb(200 161 101 / var(--tw-border-opacity, 1))!important}[data-embed-boundary] .hover\\:border-embed-brand-gold\\/40:hover{border-color:#c8a16566!important}[data-embed-boundary] .hover\\:border-embed-brand-gold\\/50:hover{border-color:#c8a16580!important}[data-embed-boundary] .hover\\:bg-\\[\\#001930\\]:hover{--tw-bg-opacity: 1 !important;background-color:rgb(0 25 48 / var(--tw-bg-opacity, 1))!important}[data-embed-boundary] .hover\\:bg-embed-background-primary:hover{--tw-bg-opacity: 1 !important;background-color:rgb(247 246 244 / var(--tw-bg-opacity, 1))!important}[data-embed-boundary] .hover\\:bg-embed-background-primary\\/10:hover{background-color:#f7f6f41a!important}[data-embed-boundary] .hover\\:bg-embed-brand-gold\\/10:hover{background-color:#c8a1651a!important}[data-embed-boundary] .hover\\:bg-embed-brand-navy:hover{--tw-bg-opacity: 1 !important;background-color:rgb(0 25 48 / var(--tw-bg-opacity, 1))!important}[data-embed-boundary] .hover\\:text-\\[\\#FFFFFF\\]:hover,[data-embed-boundary] .hover\\:text-embed-action-onPrimary:hover{--tw-text-opacity: 1 !important;color:rgb(255 255 255 / var(--tw-text-opacity, 1))!important}[data-embed-boundary] .hover\\:text-embed-background-primary:hover{--tw-text-opacity: 1 !important;color:rgb(247 246 244 / var(--tw-text-opacity, 1))!important}[data-embed-boundary] .hover\\:text-embed-background-primary\\/70:hover{color:#f7f6f4b3!important}[data-embed-boundary] .hover\\:text-embed-brand-gold:hover{--tw-text-opacity: 1 !important;color:rgb(200 161 101 / var(--tw-text-opacity, 1))!important}[data-embed-boundary] .hover\\:text-embed-foreground-primary:hover{--tw-text-opacity: 1 !important;color:rgb(0 25 48 / var(--tw-text-opacity, 1))!important}[data-embed-boundary] .hover\\:underline:hover{text-decoration-line:underline!important}[data-embed-boundary] .hover\\:opacity-90:hover{opacity:.9!important}[data-embed-boundary] .hover\\:opacity-95:hover{opacity:.95!important}[data-embed-boundary] .hover\\:shadow-\\[0_4px_14px_rgba\\(0\\,25\\,48\\,0\\.06\\)\\]:hover{--tw-shadow: 0 4px 14px rgba(0,25,48,.06) !important;--tw-shadow-colored: 0 4px 14px var(--tw-shadow-color) !important;box-shadow:var(--tw-ring-offset-shadow, 0 0 #0000),var(--tw-ring-shadow, 0 0 #0000),var(--tw-shadow)!important}[data-embed-boundary] .focus-visible\\:outline-none:focus-visible{outline:2px solid transparent!important;outline-offset:2px!important}[data-embed-boundary] .focus-visible\\:outline:focus-visible{outline-style:solid!important}[data-embed-boundary] .focus-visible\\:outline-2:focus-visible{outline-width:2px!important}[data-embed-boundary] .focus-visible\\:outline-offset-2:focus-visible{outline-offset:2px!important}[data-embed-boundary] .focus-visible\\:outline-embed-action-primary:focus-visible{outline-color:#001930!important}[data-embed-boundary] .focus-visible\\:ring-2:focus-visible{--tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color) !important;--tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color) !important;box-shadow:var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow, 0 0 #0000)!important}[data-embed-boundary] .focus-visible\\:ring-embed-brand-gold\\/35:focus-visible{--tw-ring-color: rgb(200 161 101 / .35) !important}[data-embed-boundary] .focus-visible\\:ring-embed-brand-gold\\/40:focus-visible{--tw-ring-color: rgb(200 161 101 / .4) !important}[data-embed-boundary] .focus-visible\\:ring-offset-2:focus-visible{--tw-ring-offset-width: 2px !important}[data-embed-boundary] .focus-visible\\:ring-offset-\\[\\#001930\\]:focus-visible{--tw-ring-offset-color: #001930 !important}[data-embed-boundary] .disabled\\:opacity-50:disabled{opacity:.5!important}[data-embed-boundary] .disabled\\:opacity-60:disabled{opacity:.6!important}[data-embed-boundary] .group[open] .group-open\\:rotate-90{--tw-rotate: 90deg !important;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))!important}[data-embed-boundary] .group:hover .group-hover\\:scale-\\[1\\.04\\]{--tw-scale-x: 1.04 !important;--tw-scale-y: 1.04 !important;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))!important}[data-embed-boundary] .group:hover .group-hover\\:opacity-95{opacity:.95!important}[data-embed-boundary] .group:hover .group-hover\\:shadow-\\[0_2px_6px_rgba\\(0\\,30\\,58\\,0\\.16\\)\\]{--tw-shadow: 0 2px 6px rgba(0,30,58,.16) !important;--tw-shadow-colored: 0 2px 6px var(--tw-shadow-color) !important;box-shadow:var(--tw-ring-offset-shadow, 0 0 #0000),var(--tw-ring-shadow, 0 0 #0000),var(--tw-shadow)!important}@media(max-width:767px){[data-embed-boundary] .mobile\\:col-span-1{grid-column:span 1 / span 1!important}[data-embed-boundary] .mobile\\:row-auto{grid-row:auto!important}[data-embed-boundary] .mobile\\:row-span-1{grid-row:span 1 / span 1!important}[data-embed-boundary] .mobile\\:mt-5{margin-top:1.25rem!important}[data-embed-boundary] .mobile\\:mt-8{margin-top:2rem!important}[data-embed-boundary] .mobile\\:hidden{display:none!important}[data-embed-boundary] .mobile\\:h-auto{height:auto!important}[data-embed-boundary] .mobile\\:max-h-none{max-height:none!important}[data-embed-boundary] .mobile\\:min-h-0{min-height:0px!important}[data-embed-boundary] .mobile\\:w-full{width:100%!important}[data-embed-boundary] .mobile\\:min-w-0{min-width:0px!important}[data-embed-boundary] .mobile\\:max-w-none{max-width:none!important}[data-embed-boundary] .mobile\\:translate-x-0{--tw-translate-x: 0px !important;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))!important}[data-embed-boundary] .mobile\\:translate-y-0{--tw-translate-y: 0px !important;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))!important}[data-embed-boundary] .mobile\\:grid-cols-1{grid-template-columns:repeat(1,minmax(0,1fr))!important}[data-embed-boundary] .mobile\\:grid-cols-2{grid-template-columns:repeat(2,minmax(0,1fr))!important}[data-embed-boundary] .mobile\\:grid-rows-\\[auto_minmax\\(16rem\\,1fr\\)\\]{grid-template-rows:auto minmax(16rem,1fr)!important}[data-embed-boundary] .mobile\\:grid-rows-none{grid-template-rows:none!important}[data-embed-boundary] .mobile\\:justify-start{justify-content:flex-start!important}[data-embed-boundary] .mobile\\:gap-11{gap:2.75rem!important}[data-embed-boundary] .mobile\\:gap-3{gap:.75rem!important}[data-embed-boundary] .mobile\\:divide-x-0>:not([hidden])~:not([hidden]){--tw-divide-x-reverse: 0 !important;border-right-width:calc(0px * var(--tw-divide-x-reverse))!important;border-left-width:calc(0px * calc(1 - var(--tw-divide-x-reverse)))!important}[data-embed-boundary] .mobile\\:divide-y>:not([hidden])~:not([hidden]){--tw-divide-y-reverse: 0 !important;border-top-width:calc(1px * calc(1 - var(--tw-divide-y-reverse)))!important;border-bottom-width:calc(1px * var(--tw-divide-y-reverse))!important}[data-embed-boundary] .mobile\\:divide-embed-border-default>:not([hidden])~:not([hidden]){--tw-divide-opacity: 1 !important;border-color:rgb(227 227 227 / var(--tw-divide-opacity, 1))!important}[data-embed-boundary] .mobile\\:px-0{padding-left:0!important;padding-right:0!important}[data-embed-boundary] .mobile\\:px-section{padding-left:24px!important;padding-right:24px!important}[data-embed-boundary] .mobile\\:py-8{padding-top:2rem!important;padding-bottom:2rem!important}[data-embed-boundary] .mobile\\:pb-8{padding-bottom:2rem!important}[data-embed-boundary] .mobile\\:pt-12{padding-top:3rem!important}[data-embed-boundary] .mobile\\:text-center{text-align:center!important}[data-embed-boundary] .mobile\\:text-4xl{font-size:2.25rem!important;line-height:2.5rem!important}[data-embed-boundary] .mobile\\:text-\\[2rem\\]{font-size:2rem!important}[data-embed-boundary] .mobile\\:text-base{font-size:1rem!important;line-height:1.5rem!important}[data-embed-boundary] .mobile\\:text-lg{font-size:1.125rem!important;line-height:1.75rem!important}[data-embed-boundary] .mobile\\:text-xl{font-size:1.25rem!important;line-height:1.75rem!important}}@media(min-width:768px){[data-embed-boundary] .tablet\\:grid-cols-2{grid-template-columns:repeat(2,minmax(0,1fr))!important}[data-embed-boundary] .tablet\\:grid-cols-3{grid-template-columns:repeat(3,minmax(0,1fr))!important}}@media(min-width:1280px){[data-embed-boundary] .desktop\\:grid-cols-4{grid-template-columns:repeat(4,minmax(0,1fr))!important}}[data-embed-boundary] .\\[\\&\\:\\:-webkit-details-marker\\]\\:hidden::-webkit-details-marker{display:none!important}[data-embed-boundary] .\\[\\&\\:\\:-webkit-scrollbar\\]\\:hidden::-webkit-scrollbar{display:none!important}';
var Nc = { commit: "27d4e4d", builtAt: "2026-07-26T08:22:07Z", runtimeSource: "builder-package/projectBuilderImportToHousePackage", marker: "EMBED_RUNTIME_BUILD:27d4e4d@2026-07-26T08:22:07Z" };
const jv = Object.freeze({
  commit: "dev",
  builtAt: "dev",
  runtimeSource: "builder-package/projectBuilderImportToHousePackage",
  marker: "EMBED_RUNTIME_BUILD:dev@dev"
});
function Sb() {
  return typeof Nc < "u" && Nc ? Nc : jv;
}
function Ev(a = "Embed Runtime") {
  const o = Sb();
  console.info(a), console.info(`Build: ${o.commit}`), console.info(`Runtime: ${o.runtimeSource}`), console.info(`Built: ${o.builtAt}`);
}
const Av = {
  selectedPriorityIds: [],
  dominantPriorityId: ""
};
function Op(a) {
  return {
    object: a,
    stage: "Selection",
    selection: Av,
    confirmation: null,
    transitionMessage: null,
    interpretation: null,
    experience: null,
    houseMapping: null,
    followUps: null,
    completed: !1
  };
}
function jb(a) {
  return a.completed;
}
function Tc(a) {
  return a.selectedPriorityIds.length > 0 && a.dominantPriorityId.length > 0 && a.selectedPriorityIds.includes(a.dominantPriorityId);
}
function zp(a) {
  return a.confirmation !== null && a.confirmation.accepted;
}
function _v(a) {
  return a.experience !== null;
}
function Ov(a) {
  return a.houseMapping !== null && a.houseMapping.entries.length > 0;
}
function it(a, o, i, s) {
  return {
    ok: !1,
    state: a,
    error: {
      code: i,
      message: s,
      stage: a.stage,
      event: o
    }
  };
}
function Eb() {
  return {
    confirmation: null,
    transitionMessage: null,
    interpretation: null,
    experience: null,
    houseMapping: null,
    followUps: null,
    completed: !1
  };
}
function Np(a, o, i) {
  return {
    ok: !0,
    state: {
      ...a,
      ...Eb(),
      stage: o,
      selection: i
    },
    emitted: ["priority.context.invalidated"]
  };
}
function zv(a, o) {
  if (jb(a) && o.type !== "priority.selection.changed")
    return it(
      a,
      o.type,
      "JOURNEY_ALREADY_COMPLETED",
      "Journey is complete; only selection change (new run) or reset is allowed"
    );
  switch (o.type) {
    case "priority.selection.changed": {
      const i = o.selection, s = Tc(i) ? "Confirmation" : "Selection";
      return Np(a, s, i);
    }
    case "priority.confirmation.edit":
      return a.stage !== "Confirmation" && a.stage !== "Transition" ? it(
        a,
        o.type,
        "INVALID_TRANSITION",
        "confirmation.edit is only valid from Confirmation (or Transition before Interpretation)"
      ) : {
        ok: !0,
        state: {
          ...a,
          ...Eb(),
          stage: "Selection"
        },
        emitted: []
      };
    case "priority.confirmation.accepted": {
      if (a.stage !== "Confirmation")
        return it(
          a,
          o.type,
          "INVALID_TRANSITION",
          "confirmation.accepted requires Confirmation stage"
        );
      if (!Tc(a.selection))
        return it(
          a,
          o.type,
          "GUARD_FAILED",
          "confirmation.accepted requires a non-empty Priority Selection"
        );
      const i = {
        selectionSnapshot: a.selection,
        accepted: !0,
        presentationPayload: o.presentationPayload
      };
      return {
        ok: !0,
        state: {
          ...a,
          confirmation: i,
          stage: "Transition",
          completed: !1
        },
        emitted: []
      };
    }
    case "priority.transition.completed":
      return a.stage !== "Transition" ? it(
        a,
        o.type,
        "INVALID_TRANSITION",
        "transition.completed requires Transition stage"
      ) : zp(a) ? {
        ok: !0,
        state: {
          ...a,
          transitionMessage: o.transitionMessage ?? a.transitionMessage,
          stage: "Interpretation"
        },
        emitted: []
      } : it(
        a,
        o.type,
        "GUARD_FAILED",
        "transition.completed requires prior Confirmation"
      );
    case "priority.interpretation.ready":
      return a.stage !== "Interpretation" ? it(
        a,
        o.type,
        "INVALID_TRANSITION",
        "interpretation.ready requires Interpretation stage"
      ) : zp(a) ? {
        ok: !0,
        state: {
          ...a,
          interpretation: o.interpretation,
          experience: o.experience,
          houseMapping: null,
          followUps: null,
          stage: "Interpretation"
        },
        emitted: []
      } : it(
        a,
        o.type,
        "GUARD_FAILED",
        "interpretation.ready must not fire before confirmation.accepted"
      );
    case "priority.mapping.ready":
      return a.stage !== "Interpretation" && a.stage !== "HouseMapping" ? it(
        a,
        o.type,
        "INVALID_TRANSITION",
        "mapping.ready requires Interpretation (with Experience) or HouseMapping stage"
      ) : _v(a) ? o.houseMapping.entries.length === 0 ? it(
        a,
        o.type,
        "GUARD_FAILED",
        "mapping.ready requires a non-empty House Mapping set"
      ) : o.followUps.length === 0 ? it(
        a,
        o.type,
        "GUARD_FAILED",
        "Follow-up requires at least one handoff when Mapping completes"
      ) : {
        ok: !0,
        state: {
          ...a,
          houseMapping: o.houseMapping,
          followUps: o.followUps,
          stage: "HouseMapping"
        },
        emitted: []
      } : it(
        a,
        o.type,
        "GUARD_FAILED",
        "mapping.ready must not fire before interpretation.ready (Experience required)"
      );
    case "priority.followup.selected":
      return a.stage !== "HouseMapping" && a.stage !== "FollowUp" ? it(
        a,
        o.type,
        "INVALID_TRANSITION",
        "followup.selected requires HouseMapping or FollowUp stage"
      ) : Ov(a) ? (a.followUps ?? []).some((s) => s.targetId === o.targetId) ? {
        ok: !0,
        state: {
          ...a,
          stage: "FollowUp",
          completed: !0
        },
        emitted: []
      } : it(
        a,
        o.type,
        "GUARD_FAILED",
        "followup.selected targetId must be one of the exposed handoffs"
      ) : it(
        a,
        o.type,
        "GUARD_FAILED",
        "followup.selected requires House Mapping to be ready"
      );
    case "priority.context.invalidated": {
      const i = Tc(a.selection) ? "Confirmation" : "Selection";
      return Np(a, i, a.selection);
    }
    default:
      return it(
        a,
        o.type,
        "INVALID_TRANSITION",
        "Unknown event"
      );
  }
}
function Nv(a) {
  let o = Op({ objectId: a });
  return {
    getState() {
      return o;
    },
    isComplete() {
      return jb(o);
    },
    reset() {
      return o = Op(o.object), o;
    },
    dispatch(i) {
      const s = zv(o, i);
      return s.ok && (o = s.state), s;
    }
  };
}
const Pc = "garden", id = "house-modern-01", ld = {
  stageMicrocopy: {
    confirmation: {
      title: "Zahrada je pro vás podstatná",
      body: `Podle vašeho výběru budeme dům číst hlavně podle toho, jak se bydlí venku a jak je dům s venkovním prostorem propojený.

Ještě nehodnotíme, jestli je dům „ideální“.
Nejdřív potvrďte, že toto je opravdu váš důraz.`,
      primaryAction: "Potvrdit a pokračovat",
      secondaryAction: "Upravit priority"
    },
    transition: "Teď se podíváme na dům vaší optikou zahrady — co venkovní život v tomto objektu podporuje a na co si dát pozor."
  }
}, sd = {
  selectedPriorityIds: [Pc],
  dominantPriorityId: Pc
}, Ab = {
  id: "mock-interpretation-garden-house-modern-01",
  objectId: id,
  priorityIds: [Pc],
  strengths: [
    {
      id: "str-outdoor-daily",
      code: "OUTDOOR_DAILY_LIFE",
      weight: 0.82
    },
    {
      id: "str-day-zone-open",
      code: "DAY_ZONE_OUTDOOR_POTENTIAL",
      weight: 0.78
    },
    {
      id: "str-privacy-lot",
      code: "LOT_PRIVACY_POTENTIAL",
      weight: 0.7
    }
  ],
  frictions: [
    {
      id: "fri-garden-variability",
      code: "GARDEN_QUALITY_VARIABLE",
      weight: 0.55
    },
    {
      id: "fri-access-levels",
      code: "OUTDOOR_ACCESS_LEVEL_CHECK",
      weight: 0.5
    }
  ],
  opportunities: [
    {
      id: "opp-verify-threshold",
      code: "VERIFY_DAY_ZONE_THRESHOLD",
      weight: 0.75
    }
  ],
  tradeOffs: [
    {
      id: "to-garden-vs-layout",
      code: "GARDEN_VS_INTERNAL_LAYOUT",
      favors: "OUTDOOR_DAILY_LIFE",
      against: "INTERNAL_LAYOUT_INDEPENDENT"
    }
  ],
  confidenceInputs: [
    {
      id: "ci-priority",
      code: "PRIORITY_LENS_GARDEN",
      contribution: 0.4
    },
    {
      id: "ci-object-basics",
      code: "OBJECT_BASIC_FACTS",
      contribution: 0.35
    },
    {
      id: "ci-usage-unknown",
      code: "USAGE_PREFERENCE_UNKNOWN",
      contribution: -0.15
    }
  ],
  matchScore: 62,
  recommendedIntent: "VERIFY_HOUSE_GARDEN_THRESHOLD"
}, _b = {
  id: "mock-experience-garden-house-modern-01",
  title: "Čtení domu přes zahradu",
  summary: "Podle vaší priority Zahrada se tento dům čte jako objekt, kde venkovní prostor není jen „něco navíc“, ale součást každodenního bydlení — pokud sedí propojení denní zóny s venkem a charakter pozemku.",
  focus: [
    "vztah domu k venkovnímu prostoru",
    "propojení denní zóny ven",
    "soukromí na pozemku"
  ],
  evidence: [
    {
      id: "ev-outdoor-relation",
      title: "Vztah k venkovnímu prostoru",
      description: "Dům nabízí vztah k venkovnímu prostoru, který lze číst jako součást denního života."
    },
    {
      id: "ev-day-zone",
      title: "Denní zóna a východ ven",
      description: "Denní zóna má potenciál otevřít se ven — posezení a pohyb venku pak dávají smysl."
    },
    {
      id: "ev-privacy-lot",
      title: "Soukromí mimo ulici",
      description: "Zahrada / pozemek dává prostor soukromí mimo ulici — pokud to dispozice a okolí podporují."
    }
  ],
  concerns: [
    {
      id: "co-garden-not-equal",
      title: "Ne každá zahrada znamená stejný život venku",
      description: "Záleží na velikosti, soukromí a dostupnosti z domu.",
      severity: "medium"
    },
    {
      id: "co-verify-access",
      title: "Ověřit východ a výškové rozdíly",
      description: "Pokud je klíčové přímé propojení obývacího prostoru ven, ověřte konkrétní východ a výškové rozdíly.",
      severity: "medium"
    },
    {
      id: "co-layout-not-solved",
      title: "Zahrada neřeší dispozici uvnitř",
      description: "Zahrada jen mění, co je při prohlídce důležité — neřeší sama o sobě vnitřní uspořádání.",
      severity: "low"
    }
  ],
  confidence: {
    level: "medium",
    score: 62,
    explanation: "Střední — opírá se o vybranou prioritu a základní fakta domu; ještě neznáme vaši přesnou představu o velikosti a způsobu užívání zahrady."
  },
  recommendations: [
    "Prohlédněte místa, kde dům potkává zahradu — denní zónu a východ ven."
  ],
  actions: [
    {
      id: "act-map-threshold",
      label: "Podívat se na místa dům ↔ zahrada",
      type: "primary",
      intent: "explore"
    },
    {
      id: "act-review-reading",
      label: "Vrátit se k interpretační kartě",
      type: "secondary",
      intent: "explore"
    }
  ]
}, Ob = {
  text: ld.stageMicrocopy.transition
}, zb = {
  object: { objectId: id },
  entries: [
    {
      claimRef: { claimId: "ev-day-zone" },
      objectAnchor: { kind: "zone", id: "day-zone-outdoor-exit" },
      why: "Ukazuje, jestli je venkovní život součástí dne, nebo oddělený „na konci domu“."
    },
    {
      claimRef: { claimId: "ev-outdoor-relation" },
      objectAnchor: { kind: "element", id: "terrace-threshold" },
      why: "Posezení a prah mezi interiérem a zahradou — praktický střed zahradního bydlení."
    },
    {
      claimRef: { claimId: "ev-privacy-lot" },
      objectAnchor: { kind: "zone", id: "garden-lot" },
      why: "Dává měřítko: je venku kam jít, hrát si, sedět, mít klid."
    },
    {
      claimRef: { claimId: "co-garden-not-equal" },
      objectAnchor: { kind: "relation", id: "street-neighbor-privacy" },
      why: "Zahrada bez soukromí často nesplní motivaci „vlastní venku“."
    },
    {
      claimRef: { claimId: "ev-outdoor-relation" },
      objectAnchor: { kind: "medium", id: "interior-green-view" },
      why: "Posiluje čtení, že zahrada patří k atmosféře bydlení, ne jen k pozemku."
    }
  ]
}, Nb = [
  {
    targetId: "tour-day-zone",
    label: "Prohlídka denní zóny"
  },
  {
    targetId: "media-exterior-garden",
    label: "Média exteriér / zahrada"
  },
  {
    targetId: "decision-terminal",
    label: "Decision Terminal / Experience shrnutí"
  }
], Tv = "tour-day-zone";
function Rv() {
  return {
    selectionSnapshot: sd,
    accepted: !0,
    presentationPayload: ld.stageMicrocopy.confirmation
  };
}
function kv() {
  return {
    object: { objectId: id },
    stage: "FollowUp",
    selection: sd,
    confirmation: Rv(),
    transitionMessage: Ob,
    interpretation: Ab,
    experience: _b,
    houseMapping: zb,
    followUps: Nb
  };
}
function Cv() {
  return [
    {
      type: "priority.selection.changed",
      selection: sd
    },
    {
      type: "priority.confirmation.accepted",
      presentationPayload: ld.stageMicrocopy.confirmation
    },
    {
      type: "priority.transition.completed",
      transitionMessage: Ob
    },
    {
      type: "priority.interpretation.ready",
      interpretation: Ab,
      experience: _b
    },
    {
      type: "priority.mapping.ready",
      houseMapping: zb,
      followUps: Nb
    },
    {
      type: "priority.followup.selected",
      targetId: Tv
    }
  ];
}
function ze(a) {
  return a.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}
function Iv(a) {
  return ze(a).replaceAll(`
`, "<br />");
}
const Mv = {
  Selection: "Selection",
  Confirmation: "Confirmation",
  Transition: "Transition",
  Interpretation: "Interpretation",
  HouseMapping: "House Mapping",
  FollowUp: "Follow-up"
};
function Dv(a) {
  return `<ol class="stage-rail" aria-label="Journey stages">${[
    "Selection",
    "Confirmation",
    "Transition",
    "Interpretation",
    "HouseMapping",
    "FollowUp"
  ].map((s) => `<li class="stage-rail__item${s === a ? " is-active" : ""}">${ze(Mv[s])}</li>`).join("")}</ol>`;
}
function Uv(a) {
  const o = a.selection.dominantPriorityId;
  return `
    <section class="panel" data-stage="Selection">
      <p class="eyebrow">Priority Selection</p>
      <h2>Co je pro vás podstatné?</h2>
      <p class="lede">Zvolte čočku. Renderer nic nevyhodnocuje — jen předá výběr Runtime Engine.</p>
      <button type="button" class="btn btn-primary" data-action="select-garden">
        Zvolit prioritu: ${ze(o)}
      </button>
    </section>
  `;
}
function Lv(a) {
  var i;
  const o = (i = a.confirmation) == null ? void 0 : i.presentationPayload;
  return o ? `
    <section class="panel" data-stage="Confirmation">
      <p class="eyebrow">Confirmation</p>
      <h2>${ze(o.title)}</h2>
      <p class="body">${Iv(o.body)}</p>
      <div class="actions">
        <button type="button" class="btn btn-primary" data-action="confirm">
          ${ze(o.primaryAction)}
        </button>
        <button type="button" class="btn btn-ghost" data-action="edit-selection">
          ${ze(o.secondaryAction)}
        </button>
      </div>
    </section>
  ` : '<section class="panel"><p>Chybí Confirmation payload ve fixture.</p></section>';
}
function Hv(a) {
  var i;
  const o = ((i = a.transitionMessage) == null ? void 0 : i.text) ?? "Teď se podíváme na dům vaší optikou.";
  return `
    <section class="panel" data-stage="Transition">
      <p class="eyebrow">Transition</p>
      <h2>Připravujeme čtení</h2>
      <p class="lede">${ze(o)}</p>
      <button type="button" class="btn btn-primary" data-action="complete-transition">
        Pokračovat k interpretaci
      </button>
    </section>
  `;
}
function Bv(a) {
  const o = a.focus.map((f) => `<li>${ze(f)}</li>`).join(""), i = a.evidence.map(
    (f) => `
        <article class="claim">
          <h3>${ze(f.title)}</h3>
          <p>${ze(f.description)}</p>
        </article>
      `
  ).join(""), s = a.concerns.map(
    (f) => `
        <article class="claim claim--concern">
          <h3>${ze(f.title)}</h3>
          <p>${ze(f.description)}</p>
        </article>
      `
  ).join(""), u = a.recommendations.map((f) => `<li>${ze(f)}</li>`).join("");
  return `
    <header class="experience-header">
      <h2>${ze(a.title)}</h2>
      <p class="lede">${ze(a.summary)}</p>
      <p class="confidence">
        Jistota: ${ze(a.confidence.level)}
        (${a.confidence.score}) — ${ze(a.confidence.explanation)}
      </p>
    </header>
    <div class="experience-grid">
      <section>
        <h3>Focus</h3>
        <ul>${o}</ul>
      </section>
      <section>
        <h3>Proč toto čtení</h3>
        ${i}
      </section>
      <section>
        <h3>Na co si dát pozor</h3>
        ${s}
      </section>
      <section>
        <h3>Další porozumění</h3>
        <ul>${u}</ul>
      </section>
    </div>
  `;
}
function Yv(a, o) {
  if (!a.experience)
    return `
      <section class="panel" data-stage="Interpretation">
        <p class="eyebrow">Interpretation</p>
        <h2>Připravit Experience</h2>
        <p class="lede">Runtime je ve fázi Interpretation. Fixture dodá Experience — renderer ji nevymýšlí.</p>
        <button type="button" class="btn btn-primary" data-action="ready-interpretation">
          Načíst čtení z Garden fixture
        </button>
      </section>
    `;
  const i = a.experience ?? o.experience;
  return i ? `
    <section class="panel panel--wide" data-stage="Interpretation">
      <p class="eyebrow">Interpretation → Experience</p>
      ${Bv(i)}
      <div class="actions">
        <button type="button" class="btn btn-primary" data-action="ready-mapping">
          Pokračovat k House Mapping
        </button>
      </div>
    </section>
  ` : '<section class="panel"><p>Experience chybí.</p></section>';
}
function $v(a, o) {
  const i = a.entries.map(
    (u) => `
        <li class="mapping-item">
          <p class="mapping-item__anchor">
            <span class="tag">${ze(u.objectAnchor.kind)}</span>
            ${ze(u.objectAnchor.id)}
          </p>
          <p class="mapping-item__why">${ze(u.why)}</p>
          <p class="mapping-item__claim">claim: ${ze(u.claimRef.claimId)}</p>
        </li>
      `
  ).join(""), s = o.map(
    (u) => `
        <button
          type="button"
          class="btn btn-secondary"
          data-action="select-followup"
          data-target-id="${ze(u.targetId)}"
        >
          ${ze(u.label)}
        </button>
      `
  ).join("");
  return `
    <section class="panel panel--wide" data-stage="HouseMapping">
      <p class="eyebrow">House Mapping</p>
      <h2>Kde v domě ověřit zahradu</h2>
      <p class="lede">Kotvy pocházejí z fixture / Runtime state — renderer jen zobrazuje.</p>
      <ul class="mapping-list">${i}</ul>
      <h3>Follow-up</h3>
      <div class="actions actions--wrap">${s}</div>
    </section>
  `;
}
function Gv(a) {
  return `
    <section class="panel" data-stage="FollowUp">
      <p class="eyebrow">Follow-up</p>
      <h2>Journey dokončena</h2>
      <p class="lede">
        Runtime Engine označil Journey jako completed.
        Objekt: <code>${ze(a.object.objectId)}</code>
      </p>
      <button type="button" class="btn btn-ghost" data-action="reset">
        Spustit Journey znovu
      </button>
    </section>
  `;
}
function qv(a) {
  const { state: o, fixture: i } = a;
  switch (o.stage) {
    case "Selection":
      return Uv(i);
    case "Confirmation":
      return Lv(i);
    case "Transition":
      return Hv(i);
    case "Interpretation":
      return Yv(o, i);
    case "HouseMapping":
      return $v(
        o.houseMapping ?? i.houseMapping,
        o.followUps ?? i.followUps ?? []
      );
    case "FollowUp":
      return Gv(o);
    default: {
      const s = o.stage;
      return `<section class="panel"><p>Neznámá fáze: ${ze(String(s))}</p></section>`;
    }
  }
}
function Vv(a) {
  const o = a.errorMessage ? `<p class="banner banner--error" role="alert">${ze(a.errorMessage)}</p>` : "", i = a.state.completed ? '<p class="banner banner--ok">Stav: Completed</p>' : "";
  return `
    <header class="hero">
      <p class="brand">Priority Experience</p>
      <h1>Garden — HTML Renderer v0.1</h1>
      <p class="hero__sub">Vizualizace nad Runtime Engine. Data: createGardenJourneyRun().</p>
    </header>
    ${Dv(a.state.stage)}
    ${o}
    ${i}
    <main id="stage-root">
      ${qv(a)}
    </main>
  `;
}
function Fv() {
  return Object.freeze({
    now: () => Date.now()
  });
}
function Tb(a) {
  if (a.now !== void 0)
    return a.now;
  if (a.clock !== void 0)
    return a.clock.now();
  throw new Error(
    `${a.label} requires an injectable clock or explicit now (ED-DA-06).`
  );
}
function Rb(a) {
  return Object.freeze({
    objectId: a.objectId,
    runtimeState: Object.freeze({ ...a.runtimeState }),
    events: Object.freeze(a.events.map((o) => Object.freeze({ ...o }))),
    createdAt: a.createdAt,
    updatedAt: a.updatedAt
  });
}
function Xv() {
  return Object.freeze({
    activeRoomId: null,
    priorityIds: Object.freeze([]),
    variantId: null,
    scenarioId: null,
    version: 0
  });
}
function Pv(a) {
  const o = Tb({
    now: a.now,
    clock: a.clock,
    label: "createDecisionSession"
  });
  return Rb({
    objectId: a.housePackage.identity.id,
    runtimeState: Xv(),
    events: [],
    createdAt: o,
    updatedAt: o
  });
}
function Kv(a, o) {
  const i = a.runtimeState;
  let s = {
    ...i,
    version: i.version + 1
  };
  switch (o.type) {
    case "RoomSelected":
      s = {
        ...s,
        activeRoomId: o.roomId
      };
      break;
    case "PriorityChanged":
      s = {
        ...s,
        priorityIds: Object.freeze([...o.priorityIds])
      };
      break;
    case "VariantSelected":
      s = {
        ...s,
        variantId: o.variantId
      };
      break;
    case "ScenarioActivated":
      s = {
        ...s,
        scenarioId: o.scenarioId
      };
      break;
    case "QuestionAnswered":
      break;
    default: {
      const u = o;
      throw new Error(`Unsupported event: ${JSON.stringify(u)}`);
    }
  }
  return Rb({
    objectId: a.objectId,
    runtimeState: s,
    events: [...a.events, o],
    createdAt: a.createdAt,
    updatedAt: o.at
  });
}
function Rc(a) {
  return String(a);
}
function Zv(a) {
  const o = Object.freeze([
    ...new Set(a.house.rooms.map((s) => Rc(s.floor)))
  ]);
  let i = o[0] ?? null;
  if (a.activeRoom !== null)
    i = Rc(a.activeRoom.floor);
  else if (a.focusRoom !== null) {
    const s = a.house.rooms.find(
      (u) => u.id === a.focusRoom.id
    );
    s !== void 0 && (i = Rc(s.floor));
  }
  return Object.freeze({
    activeRoom: Object.freeze({
      id: a.activeRoomId,
      room: a.activeRoom,
      focusRoom: a.focusRoom
    }),
    object: Object.freeze({
      id: a.house.id,
      title: a.house.title,
      reference: a.house.reference,
      city: a.house.city,
      district: a.house.district,
      usableArea: a.house.usableArea,
      energyClass: a.house.energyClass,
      construction: a.house.construction
    }),
    navigation: Object.freeze({
      floors: o,
      currentFloor: i,
      rooms: a.house.rooms,
      roomImportanceRank: a.roomImportanceRank,
      canSelectRoom: a.house.rooms.length > 0,
      canSelectFloor: o.length > 0
    }),
    decision: Object.freeze({
      priorityIds: a.priorityIds,
      prioritySignals: a.prioritySignals,
      variantId: a.variantId,
      scenarioId: a.scenarioId,
      primaryReason: a.primaryReason,
      highlights: a.highlights,
      recommendedMedia: a.recommendedMedia,
      interpretationSummary: a.interpretationSummary,
      rulesetId: a.rulesetId,
      rulesetVersion: a.rulesetVersion,
      appliedRuleIds: a.appliedRuleIds,
      focus: a.decisionFocus,
      story: a.decisionStory,
      moves: a.decisionMoves,
      outcome: a.decisionOutcome,
      terminal: a.decisionTerminal,
      ai: a.aiContext
    })
  });
}
const Qv = 1;
function Jv(a) {
  return Object.freeze(a.map((o) => Object.freeze({ ...o })));
}
function Wv(a, o, i) {
  return [
    "story",
    a.objectId,
    a.focusRoomId ?? "none",
    a.focusPriorityId ?? "none",
    a.signalKinds.join("+") || "none",
    o,
    i,
    `r${a.rulesetId}@${a.rulesetVersion}`
  ].join(":");
}
function e0(a) {
  const o = [];
  let i = 1;
  o.push({
    id: `chapter-primary-${i}`,
    kind: "primary-explanation",
    key: a.primaryExplanation,
    order: i++
  });
  for (const s of a.supportingArguments)
    o.push({
      id: `chapter-argument-${i}`,
      kind: "supporting-argument",
      key: s,
      order: i++
    });
  for (const s of a.recommendationSequence)
    o.push({
      id: `chapter-recommendation-${i}`,
      kind: "recommendation",
      key: s,
      order: i++
    });
  for (const s of a.semanticTransitions)
    o.push({
      id: `chapter-transition-${i}`,
      kind: "semantic-transition",
      key: s,
      order: i++
    });
  return o.push({
    id: `chapter-next-${i}`,
    kind: "next-decision-step",
    key: a.nextDecisionStep,
    order: i
  }), Jv(o);
}
function t0(a) {
  const { decisionFocus: o, semantics: i, prioritySignals: s } = a, u = i.primaryReason, f = Object.freeze([...a.highlights]), p = Object.freeze([
    o.recommendedAction,
    ...a.recommendedMedia.map((O) => `media:${O.role}`)
  ]), h = [];
  o.focusRoomId !== null && h.push(`focus-room:${o.focusRoomId}`), o.focusSignalKind !== null && h.push(`focus-signal:${o.focusSignalKind}`), i.focusRoom !== null && o.focusRoomId !== null && i.focusRoom.id !== o.focusRoomId && h.push(
    `transition:${i.focusRoom.id}->${o.focusRoomId}`
  );
  const y = o.recommendedAction, g = Object.freeze({
    objectId: a.objectId,
    rulesetId: a.rulesetId,
    rulesetVersion: a.rulesetVersion,
    appliedRuleIds: Object.freeze([...i.appliedRuleIds]),
    signalKinds: Object.freeze(s.map((O) => O.kind)),
    focusRoomId: o.focusRoomId,
    focusPriorityId: o.focusPriorityId,
    focusAction: o.recommendedAction
  }), E = e0({
    primaryExplanation: u,
    supportingArguments: f,
    recommendationSequence: p,
    semanticTransitions: Object.freeze(h),
    nextDecisionStep: y
  });
  return Object.freeze({
    id: Wv(g, u, y),
    schemaVersion: Qv,
    primaryExplanation: u,
    supportingArguments: f,
    recommendationSequence: p,
    semanticTransitions: Object.freeze(h),
    nextDecisionStep: y,
    chapters: E,
    confidence: o.confidence,
    provenance: g
  });
}
const n0 = 1;
function a0(a, o, i) {
  return `move:${a}:${o}:${i}`;
}
function r0(a, o) {
  switch (a) {
    case "primary-explanation":
      return `explain:${o}`;
    case "supporting-argument":
      return `support:${o}`;
    case "recommendation":
      return `recommend:${o}`;
    case "semantic-transition":
      return `transition:${o}`;
    case "next-decision-step":
      return `advance:${o}`;
    default:
      return `progress:${o}`;
  }
}
function o0(a, o, i) {
  return a === "next-decision-step" ? i.nextDecisionStep : a === "recommendation" && !o.startsWith("media:") ? o : a === "primary-explanation" ? `acknowledge:${o}` : a === "supporting-argument" ? `consider:${o}` : a === "semantic-transition" ? `follow:${o}` : `inspect:${o}`;
}
function i0(a, o) {
  return `completed:${a}:${o}`;
}
function l0(a, o, i) {
  const s = [`story:${i.id}`, `chapter:${a}:${o}`];
  return i.provenance.focusRoomId !== null && s.push(`focus-room:${i.provenance.focusRoomId}`), i.provenance.focusPriorityId !== null && s.push(`focus-priority:${i.provenance.focusPriorityId}`), Object.freeze(s);
}
function s0(a) {
  var s;
  const o = [];
  for (const u of a.chapters)
    o.push({
      id: a0(a.id, u.order, u.key),
      storyId: a.id,
      order: u.order,
      objective: r0(u.kind, u.key),
      requiredContext: l0(u.kind, u.key, a),
      recommendedAction: o0(
        u.kind,
        u.key,
        a
      ),
      completionCriteria: i0(u.kind, u.key),
      chapterKind: u.kind,
      chapterKey: u.key
    });
  const i = o.map((u, f) => {
    const p = o[f + 1], h = f === 0 ? "active" : "pending";
    return Object.freeze({
      ...u,
      successorMoveId: (p == null ? void 0 : p.id) ?? null,
      status: h
    });
  });
  return Object.freeze({
    schemaVersion: n0,
    storyId: a.id,
    moves: Object.freeze(i),
    activeMoveId: ((s = i[0]) == null ? void 0 : s.id) ?? null
  });
}
const c0 = 1;
function d0(a) {
  return Math.round(Math.min(1, Math.max(0, a)) * 100) / 100;
}
function u0(a, o, i) {
  return a === 0 ? "weak-fit" : o === a ? "strong-fit" : o === 0 ? "in-progress" : i > 0 ? "conditional-fit" : "in-progress";
}
function m0(a, o) {
  return [
    "outcome",
    a.storyId,
    a.activeMoveId ?? "none",
    String(a.moves.length),
    a.moves.map((i) => `${i.order}:${i.status}`).join("+") || "empty",
    o
  ].join(":");
}
function f0(a) {
  const o = a.moves.filter((H) => H.status === "completed"), i = a.moves.filter(
    (H) => H.status === "pending" || H.status === "active" || H.status === "deferred"
  ), s = a.moves.find((H) => H.chapterKind === "next-decision-step") ?? null, u = a.moves.find((H) => H.id === a.activeMoveId) ?? a.moves[0] ?? null, f = a.moves[a.moves.length - 1] ?? null, p = (s == null ? void 0 : s.recommendedAction) ?? (u == null ? void 0 : u.recommendedAction) ?? (f == null ? void 0 : f.recommendedAction) ?? "continue-decision", h = (u == null ? void 0 : u.recommendedAction) ?? (s == null ? void 0 : s.recommendedAction) ?? p, y = Object.freeze(
    a.moves.map((H) => H.objective)
  ), g = Object.freeze(
    i.map((H) => H.objective)
  ), E = Object.freeze(o.map((H) => H.id)), O = Object.freeze(i.map((H) => H.id)), z = a.moves.length === 0 ? 0 : o.length / a.moves.length + (u !== null ? 0.15 / a.moves.length : 0), D = d0(
    a.moves.length === 0 ? 0 : Math.min(1, 0.35 + z * 0.65)
  ), R = u0(
    a.moves.length,
    o.length,
    i.length
  ), S = Object.freeze(a.moves.map((H) => H.id));
  return Object.freeze({
    id: m0(a, p),
    schemaVersion: c0,
    storyId: a.storyId,
    moveRef: Object.freeze({
      storyId: a.storyId,
      activeMoveId: a.activeMoveId,
      moveIds: S,
      moveCount: a.moves.length
    }),
    status: R,
    recommendation: p,
    confidence: D,
    rationale: y,
    completedMoveIds: E,
    unresolvedMoveIds: O,
    unresolvedQuestions: g,
    recommendedNextAction: h
  });
}
const p0 = 1;
function b0(a) {
  return Object.freeze({
    id: `terminal:${a.id}`,
    schemaVersion: p0,
    outcome: a
  });
}
const h0 = 1;
function y0(a) {
  return Object.freeze({
    id: `ai-context:${a.id}`,
    schemaVersion: h0,
    terminal: a,
    outcome: a.outcome
  });
}
function g0(a) {
  const { session: o, housePackage: i, command: s } = a, u = [];
  if (i.identity.id !== o.objectId)
    return u.push({
      code: "HP_OBJECT_MISMATCH",
      message: `HousePackage id "${i.identity.id}" does not match session objectId "${o.objectId}".`,
      path: "housePackage.identity.id"
    }), { ok: !1, errors: u };
  switch (s.type) {
    case "SelectRoom": {
      if (typeof s.roomId != "string" || s.roomId.length === 0) {
        u.push({
          code: "HP_UNKNOWN_ROOM",
          message: "roomId must be a non-empty string.",
          path: "command.roomId"
        });
        break;
      }
      i.rooms.find((p) => p.id === s.roomId) === void 0 && u.push({
        code: "HP_UNKNOWN_ROOM",
        message: `RoomId "${s.roomId}" is not in the Object Package Room Registry.`,
        path: "command.roomId"
      });
      break;
    }
    case "ChangePriority": {
      if (!Array.isArray(s.priorityIds) || s.priorityIds.length === 0) {
        u.push({
          code: "HP_INVALID_PRIORITY",
          message: "priorityIds must be a non-empty array.",
          path: "command.priorityIds"
        });
        break;
      }
      s.priorityIds.some((p) => typeof p != "string" || p.length === 0) && u.push({
        code: "HP_INVALID_PRIORITY",
        message: "Each priorityId must be a non-empty string.",
        path: "command.priorityIds"
      }), new Set(s.priorityIds).size !== s.priorityIds.length && u.push({
        code: "HP_INVALID_PRIORITY",
        message: "priorityIds must be unique.",
        path: "command.priorityIds"
      });
      break;
    }
    case "SelectVariant": {
      (typeof s.variantId != "string" || s.variantId.length === 0) && u.push({
        code: "HP_INVALID_VARIANT",
        message: "variantId must be a non-empty string.",
        path: "command.variantId"
      });
      break;
    }
    case "ActivateScenario": {
      (typeof s.scenarioId != "string" || s.scenarioId.length === 0) && u.push({
        code: "HP_INVALID_SCENARIO",
        message: "scenarioId must be a non-empty string.",
        path: "command.scenarioId"
      });
      break;
    }
    case "AnswerQuestion": {
      (typeof s.questionId != "string" || s.questionId.length === 0) && u.push({
        code: "HP_INVALID_ANSWER",
        message: "questionId must be a non-empty string.",
        path: "command.questionId"
      }), (typeof s.answerId != "string" || s.answerId.length === 0) && u.push({
        code: "HP_INVALID_ANSWER",
        message: "answerId must be a non-empty string.",
        path: "command.answerId"
      });
      break;
    }
    default: {
      const f = s;
      u.push({
        code: "HP_UNKNOWN_COMMAND",
        message: `Unsupported command: ${JSON.stringify(f)}`
      });
    }
  }
  return u.length > 0 ? { ok: !1, errors: u } : { ok: !0 };
}
function v0(a, o) {
  switch (a.type) {
    case "SelectRoom":
      return { type: "RoomSelected", roomId: a.roomId, at: o };
    case "ChangePriority":
      return {
        type: "PriorityChanged",
        priorityIds: [...a.priorityIds],
        at: o
      };
    case "SelectVariant":
      return { type: "VariantSelected", variantId: a.variantId, at: o };
    case "ActivateScenario":
      return { type: "ScenarioActivated", scenarioId: a.scenarioId, at: o };
    case "AnswerQuestion":
      return {
        type: "QuestionAnswered",
        questionId: a.questionId,
        answerId: a.answerId,
        at: o
      };
    default: {
      const i = a;
      throw new Error(`Unsupported command: ${JSON.stringify(i)}`);
    }
  }
}
const x0 = {
  "emphasize-value": "inspect-value-drivers",
  "emphasize-outdoor": "inspect-outdoor-connection",
  "emphasize-space": "inspect-spatial-volume",
  "emphasize-privacy": "inspect-privacy-zones",
  "priority-generic": "compare-priority-tradeoffs"
}, w0 = {
  "emphasize-value": "hero",
  "emphasize-outdoor": "gallery",
  "emphasize-space": "video",
  "emphasize-privacy": "hero",
  "priority-generic": "gallery"
};
function S0(a) {
  return Math.round(Math.min(1, Math.max(0, a)) * 100) / 100;
}
function j0(a) {
  const { activeRoomId: o, housePackage: i, semantics: s } = a;
  if (o !== null) {
    const p = i.rooms.find((h) => h.id === o);
    if (p !== void 0)
      return { id: p.id, name: p.name };
  }
  if (s.focusRoom !== null)
    return s.focusRoom;
  const u = s.roomImportanceRank[0];
  if (u === void 0)
    return null;
  const f = i.rooms.find((p) => p.id === u);
  return f === void 0 ? null : { id: f.id, name: f.name };
}
function E0(a, o) {
  var i;
  if (a !== void 0) {
    const s = w0[a.kind];
    if (s !== void 0)
      return s;
  }
  return ((i = o.recommendedMedia[0]) == null ? void 0 : i.role) ?? "hero";
}
function A0(a) {
  const o = a.prioritySignals[0], i = j0(a), s = a.semantics.primaryReason, u = o !== void 0 ? x0[o.kind] ?? "explore-primary-room" : "explore-house-structure", f = E0(
    o,
    a.semantics
  );
  let p = 0.35;
  return o !== void 0 && (p += 0.4 * o.strength), i !== null && (p += 0.1), i !== null && a.semantics.roomImportanceRank[0] === i.id && (p += 0.1), a.activeRoomId !== null && i !== null && a.activeRoomId === i.id && (p += 0.05), Object.freeze({
    focusRoomId: (i == null ? void 0 : i.id) ?? null,
    focusRoomName: (i == null ? void 0 : i.name) ?? null,
    focusReason: s,
    focusPriorityId: (o == null ? void 0 : o.priorityId) ?? null,
    focusSignalKind: (o == null ? void 0 : o.kind) ?? null,
    confidence: S0(p),
    recommendedAction: u,
    recommendedMediaRole: f
  });
}
function _0(a, o) {
  const i = o.recommendedMediaRole, s = a.filter((p) => p.role === i), u = a.filter((p) => p.role !== i), f = [...s, ...u].map(
    (p, h) => Object.freeze({
      ...p,
      rank: h + 1,
      reason: p.role === i ? `decision-focus:${o.recommendedAction}` : p.reason
    })
  );
  return Object.freeze(f);
}
function O0(a, o) {
  if (a.length === 0)
    return a;
  const i = [];
  o.focusSignalKind === "emphasize-value" && i.push("value-efficiency"), o.focusSignalKind === "emphasize-outdoor" && i.push("outdoor-connection"), o.focusSignalKind === "emphasize-space" && i.push("spatial-generosity"), o.focusSignalKind === "emphasize-privacy" && i.push("privacy");
  const s = i.filter((f) => a.includes(f)), u = a.filter((f) => !s.includes(f));
  return Object.freeze([...s, ...u]);
}
function z0(a) {
  return Object.freeze({
    housePackage: a.housePackage,
    runtimeState: a.runtimeState,
    rules: a.rules,
    prioritySignals: Object.freeze([...a.prioritySignals ?? []])
  });
}
function N0(a) {
  return Object.freeze({
    id: a.id,
    kind: a.kind,
    priority: a.priority,
    enabled: a.enabled,
    version: a.version,
    config: Object.freeze({ ...a.config })
  });
}
function T0(a) {
  return Object.freeze({
    id: a.id,
    version: a.version,
    rules: Object.freeze(a.rules.map(N0))
  });
}
const kb = T0({
  id: "house-session-default",
  version: 1,
  rules: [
    {
      id: "room-importance.default",
      kind: "room-importance",
      priority: 100,
      enabled: !0,
      version: 1,
      config: {
        order: [
          "living-room",
          "kitchen",
          "bedroom",
          "children-room",
          "bathroom",
          // Legacy Object Package ids (Runtime unit fixtures).
          "room-living",
          "room-kitchen",
          "room-bedroom",
          "room-children",
          "room-bath"
        ],
        boostBySignalKind: {
          "emphasize-space": [
            "living-room",
            "children-room",
            "room-living",
            "room-children"
          ],
          "emphasize-outdoor": [
            "living-room",
            "kitchen",
            "room-living",
            "room-kitchen"
          ],
          "emphasize-privacy": [
            "bedroom",
            "bathroom",
            "room-bedroom",
            "room-bath"
          ],
          "emphasize-value": [
            "kitchen",
            "living-room",
            "room-kitchen",
            "room-living"
          ]
        }
      }
    },
    {
      id: "hero-emphasis.default",
      kind: "hero-emphasis",
      priority: 100,
      enabled: !0,
      version: 1,
      config: {
        defaultReason: "explore-house-structure",
        reasonsByRoomId: {
          "living-room": "primary-living-volume",
          kitchen: "daily-workflow-core",
          bedroom: "private-rest-zone",
          bathroom: "service-wet-zone",
          "children-room": "flexible-secondary-space",
          "room-living": "primary-living-volume",
          "room-kitchen": "daily-workflow-core",
          "room-bedroom": "private-rest-zone",
          "room-bath": "service-wet-zone",
          "room-children": "flexible-secondary-space"
        },
        reasonBySignalKind: {
          "emphasize-value": "value-led-exploration",
          "emphasize-outdoor": "outdoor-led-exploration",
          "emphasize-space": "space-led-exploration",
          "emphasize-privacy": "privacy-led-exploration"
        }
      }
    },
    {
      id: "media-prioritization.default",
      kind: "media-prioritization",
      priority: 100,
      enabled: !0,
      version: 1,
      config: {
        roleOrder: ["hero", "gallery", "video", "thumbnail", "document"],
        roleOrderByRoomId: {
          "living-room": ["video", "hero", "gallery", "thumbnail", "document"],
          kitchen: ["hero", "gallery", "video", "thumbnail", "document"],
          "room-living": ["video", "hero", "gallery", "thumbnail", "document"],
          "room-kitchen": ["hero", "gallery", "video", "thumbnail", "document"]
        },
        roleOrderBySignalKind: {
          "emphasize-outdoor": [
            "gallery",
            "hero",
            "video",
            "thumbnail",
            "document"
          ],
          "emphasize-space": [
            "video",
            "gallery",
            "hero",
            "thumbnail",
            "document"
          ]
        }
      }
    },
    {
      id: "contextual-messaging.default",
      kind: "contextual-messaging",
      priority: 100,
      enabled: !0,
      version: 1,
      config: {
        defaultMessages: ["inspect-layout", "compare-rooms"],
        messagesByRoomId: {
          "living-room": ["day-zone-openness", "family-gathering"],
          kitchen: ["workflow-efficiency", "natural-light"],
          bedroom: ["privacy", "morning-light"],
          bathroom: ["finishes", "storage"],
          "children-room": ["flexibility", "growth"],
          "room-living": ["day-zone-openness", "family-gathering"],
          "room-kitchen": ["workflow-efficiency", "natural-light"],
          "room-bedroom": ["privacy", "morning-light"],
          "room-bath": ["finishes", "storage"],
          "room-children": ["flexibility", "growth"]
        },
        messagesBySignalKind: {
          "emphasize-value": "value-efficiency",
          "emphasize-outdoor": "outdoor-connection",
          "emphasize-space": "spatial-generosity",
          "emphasize-privacy": "privacy"
        }
      }
    },
    {
      id: "recommendation-ordering.default",
      kind: "recommendation-ordering",
      priority: 100,
      enabled: !0,
      version: 1,
      config: {
        highlightOrder: [
          "day-zone-openness",
          "family-gathering",
          "workflow-efficiency",
          "natural-light",
          "privacy",
          "morning-light",
          "finishes",
          "storage",
          "flexibility",
          "growth",
          "value-efficiency",
          "outdoor-connection",
          "spatial-generosity",
          "inspect-layout",
          "compare-rooms"
        ]
      }
    }
  ]
}), Tp = {
  "room-importance": 0,
  "hero-emphasis": 1,
  "media-prioritization": 2,
  "contextual-messaging": 3,
  "recommendation-ordering": 4
};
function R0(a, o) {
  if (a.priority !== o.priority)
    return a.priority - o.priority;
  const i = Tp[a.kind] - Tp[o.kind];
  return i !== 0 ? i : a.id.localeCompare(o.id);
}
function Rp(a, o) {
  var i;
  return ((i = a.rooms.find((s) => s.id === o)) == null ? void 0 : i.name) ?? null;
}
function k0(a, o, i) {
  const s = o.config, u = a.housePackage.rooms.map((z) => z.id), f = new Set(u);
  let p = s.order.filter((z) => f.has(z));
  const h = s.boostBySignalKind;
  if (h !== void 0) {
    const z = [];
    for (const D of a.prioritySignals) {
      const R = h[D.kind];
      if (R !== void 0)
        for (const S of R)
          f.has(S) && !z.includes(S) && z.push(S);
    }
    z.length > 0 && (p = [
      ...z,
      ...p.filter((D) => !z.includes(D))
    ]);
  }
  const y = u.filter(
    (z) => !p.includes(z)
  );
  i.roomImportanceRank = [...p, ...y];
  const g = a.runtimeState.activeRoomId;
  if (g !== null) {
    const z = Rp(a.housePackage, g);
    if (z !== null) {
      i.focusRoom = { id: g, name: z };
      return;
    }
  }
  const E = i.roomImportanceRank[0];
  if (E === void 0) {
    i.focusRoom = null;
    return;
  }
  const O = Rp(a.housePackage, E);
  i.focusRoom = O === null ? null : {
    id: E,
    name: O
  };
}
function C0(a, o, i) {
  var h;
  const s = o.config, u = ((h = i.focusRoom) == null ? void 0 : h.id) ?? a.runtimeState.activeRoomId;
  let f = u === null ? s.defaultReason : s.reasonsByRoomId[u] ?? s.defaultReason;
  const p = s.reasonBySignalKind;
  if (p !== void 0)
    for (const y of a.prioritySignals) {
      const g = p[y.kind];
      if (g !== void 0) {
        f = g;
        break;
      }
    }
  i.primaryReason = f;
}
function I0(a, o, i) {
  var h, y;
  const s = o.config, u = ((h = i.focusRoom) == null ? void 0 : h.id) ?? a.runtimeState.activeRoomId;
  let f = u !== null && ((y = s.roleOrderByRoomId) == null ? void 0 : y[u]) !== void 0 ? s.roleOrderByRoomId[u] : s.roleOrder;
  const p = s.roleOrderBySignalKind;
  if (p !== void 0)
    for (const g of a.prioritySignals) {
      const E = p[g.kind];
      if (E !== void 0) {
        f = E;
        break;
      }
    }
  i.recommendedMedia = f.map(
    (g, E) => Object.freeze({
      role: g,
      rank: E + 1,
      reason: `${o.id}:${g}`
    })
  );
}
function M0(a, o, i) {
  var g;
  const s = o.config, u = ((g = i.focusRoom) == null ? void 0 : g.id) ?? a.runtimeState.activeRoomId, f = u !== null ? s.messagesByRoomId[u] ?? s.defaultMessages : s.defaultMessages, p = [], h = s.messagesBySignalKind, y = s.messagesByPriorityId;
  for (const E of a.prioritySignals) {
    const O = h == null ? void 0 : h[E.kind];
    if (O !== void 0) {
      p.push(O);
      continue;
    }
    const z = y == null ? void 0 : y[E.priorityId];
    z !== void 0 && p.push(z);
  }
  i.highlights = [...f, ...p];
}
function D0(a, o, i) {
  const s = o.config, u = new Map(
    s.highlightOrder.map((f, p) => [f, p])
  );
  i.highlights = [...i.highlights].sort((f, p) => {
    const h = u.get(f) ?? Number.MAX_SAFE_INTEGER, y = u.get(p) ?? Number.MAX_SAFE_INTEGER;
    return h !== y ? h - y : f.localeCompare(p);
  });
}
function U0(a, o, i) {
  switch (o.kind) {
    case "room-importance":
      k0(a, o, i);
      break;
    case "hero-emphasis":
      C0(a, o, i);
      break;
    case "media-prioritization":
      I0(a, o, i);
      break;
    case "contextual-messaging":
      M0(a, o, i);
      break;
    case "recommendation-ordering":
      D0(a, o, i);
      break;
    default:
      o.kind;
  }
  i.applied.push(o);
}
function L0(a) {
  const o = {
    focusRoom: null,
    primaryReason: "uninterpreted",
    highlights: [],
    recommendedMedia: [],
    roomImportanceRank: a.housePackage.rooms.map((u) => u.id),
    applied: []
  }, i = a.rules.rules.filter((u) => u.enabled).slice().sort(R0);
  for (const u of i)
    U0(a, u, o);
  const s = o.applied.slice().sort((u, f) => f.priority !== u.priority ? f.priority - u.priority : u.id.localeCompare(f.id)).map((u) => u.id);
  return Object.freeze({
    focusRoom: o.focusRoom === null ? null : Object.freeze({ ...o.focusRoom }),
    primaryReason: o.primaryReason,
    highlights: Object.freeze([...o.highlights]),
    recommendedMedia: Object.freeze(
      o.recommendedMedia.map((u) => Object.freeze({ ...u }))
    ),
    roomImportanceRank: Object.freeze([...o.roomImportanceRank]),
    appliedRuleIds: Object.freeze(s)
  });
}
function H0(a) {
  const o = a.map(
    (i, s) => Object.freeze({
      priorityId: i,
      rank: s + 1
    })
  );
  return Object.freeze({
    entries: Object.freeze(o)
  });
}
const B0 = Object.freeze({
  price: "emphasize-value",
  garden: "emphasize-outdoor",
  space: "emphasize-space",
  privacy: "emphasize-privacy",
  // Pilot Priority Engine card ids → same signal vocabulary
  investment: "emphasize-value",
  "operating-costs": "emphasize-value",
  energy: "emphasize-value",
  maintenance: "emphasize-value",
  layout: "emphasize-space",
  flexibility: "emphasize-space",
  plot: "emphasize-outdoor",
  design: "priority-generic",
  quality: "priority-generic"
});
function Y0(a) {
  return B0[a] ?? "priority-generic";
}
function $0(a, o) {
  return o.strength !== a.strength ? o.strength - a.strength : a.rank !== o.rank ? a.rank - o.rank : a.id.localeCompare(o.id);
}
function G0(a) {
  const o = a.entries.length;
  if (o === 0)
    return Object.freeze([]);
  const i = a.entries.map((s) => {
    const u = Y0(s.priorityId), f = (o - s.rank + 1) / o;
    return Object.freeze({
      id: `${s.priorityId}@${s.rank}`,
      kind: u,
      priorityId: s.priorityId,
      rank: s.rank,
      strength: f
    });
  });
  return Object.freeze([...i].sort($0));
}
function q0(a) {
  return G0(H0(a));
}
function V0(a, o, i, s, u, f, p, h, y, g) {
  var E;
  return [
    `object:${a.objectId}`,
    `room:${a.runtimeState.activeRoomId ?? "none"}`,
    `focus:${((E = o.focusRoom) == null ? void 0 : E.id) ?? "none"}`,
    `decisionFocus:${u.focusRoomId ?? "none"}:${u.focusReason}:${u.confidence}`,
    `action:${u.recommendedAction}`,
    `story:${f.id}`,
    `moves:${p.activeMoveId ?? "none"}:${p.moves.length}`,
    `outcome:${h.id}`,
    `terminal:${y.id}`,
    `ai:${g.id}`,
    `reason:${o.primaryReason}`,
    `highlights:${o.highlights.join(",") || "none"}`,
    `media:${o.recommendedMedia.map((O) => O.role).join(",") || "none"}`,
    `priorities:${a.runtimeState.priorityIds.join(",") || "none"}`,
    `signals:${s.map((O) => `${O.kind}:${O.strength}`).join(",") || "none"}`,
    `variant:${a.runtimeState.variantId ?? "none"}`,
    `scenario:${a.runtimeState.scenarioId ?? "none"}`,
    `rules:${i.id}@${i.version}`,
    `applied:${o.appliedRuleIds.join(",") || "none"}`,
    `v:${a.runtimeState.version}`
  ].join("|");
}
function Cb(a, o, i) {
  var W;
  const s = (i == null ? void 0 : i.rules) ?? kb, u = q0(
    a.runtimeState.priorityIds
  ), f = z0({
    housePackage: o,
    runtimeState: a.runtimeState,
    rules: s,
    prioritySignals: u
  }), p = L0(f), h = A0({
    housePackage: o,
    activeRoomId: a.runtimeState.activeRoomId,
    prioritySignals: u,
    semantics: p
  }), y = O0(
    p.highlights,
    h
  ), g = _0(
    p.recommendedMedia,
    h
  ), E = t0({
    objectId: a.objectId,
    prioritySignals: u,
    semantics: { ...p, highlights: y, recommendedMedia: g },
    decisionFocus: h,
    highlights: y,
    recommendedMedia: g,
    rulesetId: s.id,
    rulesetVersion: s.version
  }), O = s0(E), z = f0(O), D = b0(z), R = y0(D), S = a.runtimeState.activeRoomId, H = S === null ? null : ((W = o.rooms.find((pe) => pe.id === S)) == null ? void 0 : W.name) ?? null;
  return Object.freeze({
    objectId: a.objectId,
    activeRoomId: S,
    activeRoomName: H,
    priorityIds: Object.freeze([...a.runtimeState.priorityIds]),
    prioritySignals: u,
    variantId: a.runtimeState.variantId,
    scenarioId: a.runtimeState.scenarioId,
    runtimeVersion: a.runtimeState.version,
    summary: V0(
      a,
      { ...p, highlights: y, recommendedMedia: g },
      s,
      u,
      h,
      E,
      O,
      z,
      D,
      R
    ),
    rulesetId: s.id,
    rulesetVersion: s.version,
    focusRoom: p.focusRoom,
    primaryReason: p.primaryReason,
    highlights: y,
    recommendedMedia: g,
    roomImportanceRank: p.roomImportanceRank,
    appliedRuleIds: p.appliedRuleIds,
    decisionFocus: h,
    decisionStory: E,
    decisionMoves: O,
    decisionOutcome: z,
    decisionTerminal: D,
    aiContext: R
  });
}
const Je = "/reference-house", F0 = {
  identity: {
    id: "house-modern-01",
    title: "Modern 01",
    reference: "ASTAV-M01"
  },
  overview: {
    price: 69e5,
    usableArea: 142,
    landArea: 620,
    rooms: 8,
    hasGarden: !0
  },
  media: [
    {
      id: "hero-image",
      type: "image",
      title: "Hero",
      url: `${Je}/assets/media/hero/hero.webp`
    },
    {
      id: "media-floorplan",
      type: "floorplan",
      title: "Půdorys",
      url: `${Je}/assets/floorplans/pudorys.webp`
    },
    {
      id: "intro-video",
      type: "video",
      title: "Intro video",
      url: "https://fast.wistia.net/embed/iframe/sxe3yw702e"
    },
    {
      id: "gallery-01",
      type: "image",
      title: "Galerie 01",
      url: `${Je}/assets/media/gallery/01.webp`
    },
    {
      id: "gallery-02",
      type: "image",
      title: "Galerie 02",
      url: `${Je}/assets/media/gallery/02.webp`
    },
    {
      id: "gallery-03",
      type: "image",
      title: "Galerie 03",
      url: `${Je}/assets/media/gallery/03.webp`
    },
    {
      id: "gallery-11",
      type: "image",
      title: "Galerie 11",
      url: `${Je}/assets/media/gallery/11.webp`
    },
    {
      id: "gallery-12",
      type: "image",
      title: "Galerie 12",
      url: `${Je}/assets/media/gallery/12.webp`
    },
    {
      id: "gallery-13",
      type: "image",
      title: "Galerie 13",
      url: `${Je}/assets/media/gallery/13.webp`
    },
    {
      id: "gallery-14",
      type: "image",
      title: "Galerie 14",
      url: `${Je}/assets/media/gallery/14.webp`
    },
    {
      id: "gallery-15",
      type: "image",
      title: "Galerie 15",
      url: `${Je}/assets/media/gallery/15.webp`
    },
    {
      id: "gallery-16",
      type: "image",
      title: "Galerie 16",
      url: `${Je}/assets/media/gallery/16.webp`
    },
    {
      id: "gallery-17",
      type: "image",
      title: "Galerie 17",
      url: `${Je}/assets/media/gallery/17.webp`
    },
    {
      id: "gallery-18",
      type: "image",
      title: "Galerie 18",
      url: `${Je}/assets/media/gallery/18.webp`
    },
    {
      id: "gallery-19",
      type: "image",
      title: "Galerie 19",
      url: `${Je}/assets/media/gallery/19.webp`
    },
    {
      id: "gallery-20",
      type: "image",
      title: "Galerie 20",
      url: `${Je}/assets/media/gallery/20.webp`
    },
    {
      id: "gallery-21",
      type: "image",
      title: "Galerie 21",
      url: `${Je}/assets/media/gallery/21.webp`
    },
    {
      id: "gallery-22",
      type: "image",
      title: "Galerie 22",
      url: `${Je}/assets/media/gallery/22.webp`
    }
  ],
  rooms: [
    { id: "room-living", name: "Obývací pokoj", area: 32, floor: 0 },
    { id: "room-kitchen", name: "Kuchyně", area: 14, floor: 0 },
    { id: "room-bedroom", name: "Ložnice", area: 18, floor: 0 },
    { id: "room-children", name: "Dětský pokoj", area: 16, floor: 0 },
    { id: "room-bath", name: "Koupelna", area: 8, floor: 0 },
    { id: "room-office", name: "Pracovna", area: 12, floor: 0 },
    { id: "room-toilet", name: "WC", area: 3, floor: 0 },
    {
      id: "room-hallway-entrance",
      name: "Vstupní chodba",
      area: 10,
      floor: 0
    }
  ],
  location: {
    city: "Praha",
    district: "Západ"
  },
  metadata: {
    energyClass: "B",
    construction: "Zděná"
  },
  documents: [
    {
      id: "technical-document",
      title: "Bungalov 4KK",
      url: `${Je}/assets/documents/Bungalov%204KK.pdf`
    }
  ]
};
function Ib(a) {
  return a === null ? null : {
    id: a.identity.id,
    title: a.identity.title,
    reference: a.identity.reference,
    price: a.overview.price,
    usableArea: a.overview.usableArea,
    landArea: a.overview.landArea,
    roomCount: a.overview.rooms,
    hasGarden: a.overview.hasGarden,
    city: a.location.city,
    district: a.location.district,
    energyClass: a.metadata.energyClass,
    construction: a.metadata.construction,
    media: a.media.map((o) => ({
      id: o.id,
      type: o.type,
      title: o.title,
      url: o.url
    })),
    rooms: a.rooms.map((o) => ({
      id: o.id,
      name: o.name,
      area: o.area,
      floor: o.floor
    })),
    ...a.documents !== void 0 ? {
      documents: a.documents.map((o) => ({
        id: o.id,
        title: o.title,
        url: o.url
      }))
    } : {}
  };
}
const X0 = "start", P0 = [
  {
    id: "start",
    question: "House Package",
    type: "text",
    next: "priority-focus"
  },
  {
    id: "priority-focus",
    question: "Co je pro vás důležitější?",
    type: "single-choice",
    previous: "start",
    next: "garden-importance",
    choices: [
      { id: "price", label: "Cena" },
      { id: "space", label: "Prostor" }
    ]
  },
  {
    id: "garden-importance",
    question: "Je pro vás důležitá zahrada?",
    type: "single-choice",
    previous: "priority-focus",
    next: "summary",
    choices: [
      { id: "yes", label: "Ano" },
      { id: "no", label: "Ne" }
    ]
  },
  {
    id: "summary",
    question: "Decision Summary",
    type: "text",
    previous: "garden-importance"
  }
], K0 = /* @__PURE__ */ new Set(["room-living"]), Z0 = /* @__PURE__ */ new Set(["room-children"]);
function Q0(a, o) {
  const i = [], s = [];
  if (a.preferPrice && i.push({
    target: "price",
    label: "Cena",
    reason: "Preferujete cenu"
  }), a.preferSpace) {
    i.push({
      target: "layout",
      label: "Dispozice",
      reason: "Preferujete prostor"
    });
    const u = o.rooms.find((p) => K0.has(p.id)), f = o.rooms.find((p) => Z0.has(p.id));
    u && s.push({
      id: u.id,
      name: u.name,
      area: u.area,
      floor: u.floor
    }), f && s.push({
      id: f.id,
      name: f.name,
      area: f.area,
      floor: f.floor
    });
  }
  return a.preferGarden && i.push({
    target: "garden",
    label: "Zahrada",
    reason: "Zahrada je pro vás důležitá"
  }), { highlights: i, recommendedRooms: s };
}
function Mb(a, o) {
  if (o.identity.id !== a.objectId)
    return {
      ok: !1,
      code: "HP_OBJECT_MISMATCH",
      message: `HousePackage id "${o.identity.id}" does not match interpretation objectId "${a.objectId}".`
    };
  const i = Ib(o);
  if (i === null)
    return {
      ok: !1,
      code: "HP_MISSING_HOUSE",
      message: "projectHouse returned null."
    };
  const s = a.activeRoomId, u = s === null ? null : i.rooms.find((p) => p.id === s) ?? null, f = Zv({
    house: i,
    activeRoomId: s,
    activeRoom: u,
    focusRoom: a.focusRoom,
    priorityIds: a.priorityIds,
    prioritySignals: a.prioritySignals,
    variantId: a.variantId,
    scenarioId: a.scenarioId,
    primaryReason: a.primaryReason,
    highlights: a.highlights,
    recommendedMedia: a.recommendedMedia,
    interpretationSummary: a.summary,
    roomImportanceRank: a.roomImportanceRank,
    appliedRuleIds: a.appliedRuleIds,
    rulesetId: a.rulesetId,
    rulesetVersion: a.rulesetVersion,
    decisionFocus: a.decisionFocus,
    decisionStory: a.decisionStory,
    decisionMoves: a.decisionMoves,
    decisionOutcome: a.decisionOutcome,
    decisionTerminal: a.decisionTerminal,
    aiContext: a.aiContext
  });
  return {
    ok: !0,
    experience: Object.freeze({
      house: i,
      context: f
    })
  };
}
function J0(a) {
  const { session: o, housePackage: i, command: s } = a, u = Tb({
    now: a.now,
    clock: a.clock,
    label: "dispatchCommand"
  }), f = g0({ session: o, housePackage: i, command: s });
  if (!f.ok)
    return {
      ok: !1,
      errors: f.errors,
      session: o
    };
  const p = v0(s, u), h = Kv(o, p), y = Cb(h, i, {
    rules: a.rules
  }), g = Mb(y, i);
  return g.ok ? {
    ok: !0,
    session: h,
    event: p,
    interpretation: y,
    experience: g.experience
  } : {
    ok: !1,
    errors: [
      {
        code: "HP_PROJECTION_FAILED",
        message: g.message
      }
    ],
    session: o
  };
}
class W0 {
  constructor(o) {
    q(this, "housePackage");
    q(this, "rules");
    q(this, "clock");
    q(this, "session");
    q(this, "interpretation", null);
    q(this, "experience", null);
    this.housePackage = o.housePackage, this.rules = o.rules ?? kb, this.clock = o.clock, this.session = o.session ?? Pv({
      housePackage: o.housePackage,
      now: o.now,
      clock: o.clock
    }), this.interpretation = Cb(
      this.session,
      this.housePackage,
      { rules: this.rules }
    );
    const i = Mb(
      this.interpretation,
      this.housePackage
    );
    this.experience = i.ok ? i.experience : null;
  }
  /**
   * Canonical entry point for all semantic mutations.
   * When `now` is omitted, uses the injected Runtime clock.
   */
  dispatch(o, i) {
    const s = J0({
      session: this.session,
      housePackage: this.housePackage,
      command: o,
      now: i,
      clock: this.clock,
      rules: this.rules
    });
    return s.ok && (this.session = s.session, this.interpretation = s.interpretation, this.experience = s.experience), s;
  }
  getSession() {
    return this.session;
  }
  getInterpretation() {
    return this.interpretation;
  }
  getExperience() {
    return this.experience;
  }
  getHousePackage() {
    return this.housePackage;
  }
  getRules() {
    return this.rules;
  }
  getClock() {
    return this.clock;
  }
}
function ex(a) {
  return new W0(a);
}
const tx = {
  energy: {
    headline: "Nejvyšší prioritu mají provozní náklady.",
    summary: "Během celé Experience budeme zvýrazňovat informace související s energetickou efektivitou.",
    recommendations: [
      "Energetický standard",
      "Technologie vytápění",
      "Roční provozní náklady"
    ]
  },
  "operating-costs": {
    headline: "Nejvyšší prioritu mají provozní náklady.",
    summary: "Během celé Experience budeme zvýrazňovat dlouhodobé náklady bydlení a provozní dopady.",
    recommendations: [
      "Roční provozní náklady",
      "Energetický standard",
      "Údržba a servis"
    ]
  },
  layout: {
    headline: "Nejvyšší prioritu má dispozice.",
    summary: "Během celé Experience budeme zvýrazňovat uspořádání místností a každodenní tok prostoru.",
    recommendations: [
      "Dispozice místností",
      "Denní zóny",
      "Flexibilita dispozice"
    ]
  },
  privacy: {
    headline: "Nejvyšší prioritu má soukromí.",
    summary: "Během celé Experience budeme zvýrazňovat klidové zóny a ochranu před okolím.",
    recommendations: [
      "Klidové zóny",
      "Oddělení od okolí",
      "Vztah k pozemku"
    ]
  },
  design: {
    headline: "Nejvyšší prioritu má design.",
    summary: "Během celé Experience budeme zvýrazňovat formu, materiály a vizuální charakter objektu.",
    recommendations: [
      "Materiály a povrchy",
      "Architektonický výraz",
      "Detail a kvalita provedení"
    ]
  },
  quality: {
    headline: "Nejvyšší prioritu má kvalita.",
    summary: "Během celé Experience budeme zvýrazňovat provedení, detaily a dlouhodobou hodnotu řešení.",
    recommendations: [
      "Kvalita provedení",
      "Detaily a materiály",
      "Dlouhodobá hodnota"
    ]
  },
  plot: {
    headline: "Nejvyšší prioritu má pozemek.",
    summary: "Během celé Experience budeme zvýrazňovat vztah domu k pozemku, orientaci a okolí.",
    recommendations: [
      "Orientace na pozemku",
      "Vztah k okolí",
      "Využití pozemku"
    ]
  },
  investment: {
    headline: "Nejvyšší prioritu má investice.",
    summary: "Během celé Experience budeme zvýrazňovat kapitálový rámec a obchodní dopady rozhodnutí.",
    recommendations: [
      "Investiční rámec",
      "Návratnost",
      "Provozní náklady"
    ]
  },
  maintenance: {
    headline: "Nejvyšší prioritu má údržba.",
    summary: "Během celé Experience budeme zvýrazňovat dlouhodobou správu a servisovatelnost.",
    recommendations: [
      "Údržba a servis",
      "Technologické systémy",
      "Provozní zátěž"
    ]
  },
  flexibility: {
    headline: "Nejvyšší prioritu má flexibilita.",
    summary: "Během celé Experience budeme zvýrazňovat přizpůsobitelnost domu v čase.",
    recommendations: [
      "Flexibilita dispozice",
      "Změna použití",
      "Rozšiřitelnost"
    ]
  }
}, nx = {
  headline: "Decision Context ještě neurčuje čočku Experience.",
  summary: "Vyberte priority — Decision Context se odvodí z Decision Story a řídí všechny moduly Experience.",
  recommendations: []
};
function ax(a) {
  const o = a.primaryPriority === null ? nx : tx[a.primaryPriority] ?? {
    headline: `Nejvyšší prioritu má ${a.primaryPriority}.`,
    summary: "Během celé Experience budeme zvýrazňovat informace související s vybranou prioritou.",
    recommendations: [a.primaryPriority]
  };
  return Object.freeze({
    headline: o.headline,
    summary: o.summary,
    focusPriority: a.primaryPriority,
    secondaryPriority: a.secondaryPriority,
    selectedPriorities: Object.freeze([...a.selectedPriorities]),
    recommendations: Object.freeze([...o.recommendations])
  });
}
function rx(a, o) {
  return Object.freeze({
    primaryPriority: a[0] ?? null,
    secondaryPriority: a[1] ?? null,
    selectedPriorities: Object.freeze([...a]),
    updatedAt: o
  });
}
function ox(a, o) {
  return rx(a, o);
}
const ix = `
.embed-root {
  --embed-bg: #e8f0ea;
  --embed-bg-deep: #d5e4da;
  --embed-ink: #1c2b22;
  --embed-muted: #4a5c52;
  --embed-panel: #f7fbf8;
  --embed-line: #b7c9be;
  --embed-accent: #2f6b4f;
  --embed-accent-ink: #f4faf6;
  --embed-warn: #8a3b2d;
  --embed-ok: #1f5c3d;
  --embed-shadow: 0 18px 50px rgba(28, 43, 34, 0.08);
  --embed-font-display: "Iowan Old Style", "Palatino Linotype", Palatino, "Book Antiqua", Georgia, serif;
  --embed-font-body: "Avenir Next", "Segoe UI", "Helvetica Neue", sans-serif;

  box-sizing: border-box;
  color: var(--embed-ink);
  font-family: var(--embed-font-body);
  width: min(920px, 100%);
  margin: 0 auto;
  padding: 1.5rem 1rem 2.5rem;
  background:
    radial-gradient(900px 480px at 10% -10%, #f4fff7 0%, transparent 55%),
    linear-gradient(160deg, var(--embed-bg) 0%, var(--embed-bg-deep) 100%);
  border-radius: 1.25rem;
}

.embed-root *,
.embed-root *::before,
.embed-root *::after {
  box-sizing: border-box;
}

.embed-root .hero { margin-bottom: 1.75rem; }
.embed-root .brand {
  margin: 0 0 0.35rem;
  font-size: 0.85rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--embed-accent);
  font-weight: 700;
}
.embed-root .hero h1 {
  margin: 0;
  font-family: var(--embed-font-display);
  font-size: clamp(1.8rem, 4vw, 2.6rem);
  line-height: 1.15;
  font-weight: 600;
}
.embed-root .hero__sub {
  margin: 0.75rem 0 0;
  color: var(--embed-muted);
  max-width: 38rem;
}
.embed-root .stage-rail {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  list-style: none;
  padding: 0;
  margin: 0 0 1.25rem;
}
.embed-root .stage-rail__item {
  padding: 0.35rem 0.7rem;
  border: 1px solid var(--embed-line);
  border-radius: 999px;
  font-size: 0.75rem;
  color: var(--embed-muted);
  background: rgba(247, 251, 248, 0.7);
}
.embed-root .stage-rail__item.is-active {
  color: var(--embed-accent-ink);
  background: var(--embed-accent);
  border-color: var(--embed-accent);
}
.embed-root .banner {
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  margin: 0 0 1rem;
}
.embed-root .banner--error {
  background: #f8e8e4;
  color: var(--embed-warn);
}
.embed-root .banner--ok {
  background: #dff0e6;
  color: var(--embed-ok);
}
.embed-root .panel {
  background: var(--embed-panel);
  border: 1px solid var(--embed-line);
  border-radius: 1.25rem;
  padding: 1.5rem 1.6rem 1.7rem;
  box-shadow: var(--embed-shadow);
}
.embed-root .panel--wide { padding-bottom: 1.9rem; }
.embed-root .eyebrow {
  margin: 0 0 0.4rem;
  font-size: 0.75rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--embed-accent);
  font-weight: 700;
}
.embed-root .panel h2,
.embed-root .experience-header h2 {
  margin: 0 0 0.65rem;
  font-family: var(--embed-font-display);
  font-size: clamp(1.45rem, 3vw, 2rem);
  font-weight: 600;
}
.embed-root .lede,
.embed-root .body {
  margin: 0 0 1.25rem;
  color: var(--embed-muted);
  line-height: 1.55;
  white-space: pre-wrap;
}
.embed-root .confidence {
  margin: 0 0 1.25rem;
  color: var(--embed-ink);
  line-height: 1.5;
  font-size: 0.95rem;
}
.embed-root .actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
}
.embed-root .actions--wrap { margin-top: 0.35rem; }
.embed-root .btn {
  appearance: none;
  border: 1px solid transparent;
  border-radius: 999px;
  padding: 0.7rem 1.15rem;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}
.embed-root .btn-primary {
  background: var(--embed-accent);
  color: var(--embed-accent-ink);
}
.embed-root .btn-secondary {
  background: #eef6f1;
  color: var(--embed-accent);
  border-color: var(--embed-line);
}
.embed-root .btn-ghost {
  background: transparent;
  color: var(--embed-muted);
  border-color: var(--embed-line);
}
.embed-root .btn:hover { filter: brightness(0.97); }
.embed-root .experience-grid {
  display: grid;
  gap: 1.1rem;
  margin-bottom: 1.35rem;
}
@media (min-width: 720px) {
  .embed-root .experience-grid { grid-template-columns: 1fr 1fr; }
}
.embed-root .experience-grid h3,
.embed-root .panel h3 {
  margin: 0 0 0.55rem;
  font-size: 0.95rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--embed-accent);
}
.embed-root .experience-grid ul {
  margin: 0;
  padding-left: 1.1rem;
  color: var(--embed-muted);
}
.embed-root .claim {
  margin: 0 0 0.75rem;
  padding: 0.75rem 0.85rem;
  border-radius: 0.85rem;
  background: #eef5f0;
}
.embed-root .claim--concern { background: #f4eee8; }
.embed-root .claim h3 {
  margin: 0 0 0.35rem;
  text-transform: none;
  letter-spacing: 0;
  font-size: 1rem;
  color: var(--embed-ink);
}
.embed-root .claim p {
  margin: 0;
  color: var(--embed-muted);
  line-height: 1.45;
}
.embed-root .mapping-list {
  list-style: none;
  margin: 0 0 1.4rem;
  padding: 0;
  display: grid;
  gap: 0.75rem;
}
.embed-root .mapping-item {
  padding: 0.9rem 1rem;
  border-radius: 0.9rem;
  background: #eef5f0;
  border: 1px solid var(--embed-line);
}
.embed-root .mapping-item__anchor {
  margin: 0 0 0.35rem;
  font-weight: 600;
}
.embed-root .mapping-item__why,
.embed-root .mapping-item__claim {
  margin: 0;
  color: var(--embed-muted);
  font-size: 0.92rem;
  line-height: 1.45;
}
.embed-root .mapping-item__claim {
  margin-top: 0.35rem;
  font-size: 0.8rem;
}
.embed-root .tag {
  display: inline-block;
  margin-right: 0.35rem;
  padding: 0.1rem 0.45rem;
  border-radius: 999px;
  background: var(--embed-accent);
  color: var(--embed-accent-ink);
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.embed-root code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.9em;
}
`;
function ao(a, o) {
  return a.find((i) => i.type === o);
}
function lx(a, o, i) {
  const s = document.createElement("style");
  s.setAttribute("data-embed-engine", "priority-styles"), s.textContent = ix, document.head.appendChild(s);
  const u = document.createElement("div");
  u.className = "embed-root", u.setAttribute("data-embed-root", ""), a.appendChild(u);
  const f = Nv(o.object.objectId);
  let p = null;
  const h = () => {
    u.innerHTML = Vv({
      state: f.getState(),
      fixture: o,
      errorMessage: p
    });
  }, y = (z) => {
    const D = f.dispatch(z);
    if (!D.ok) {
      p = `${D.error.code}: ${D.error.message}`;
      return;
    }
    p = null;
  }, g = (z, D) => {
    switch (z) {
      case "select-garden": {
        const R = ao(i, "priority.selection.changed");
        R && y(R);
        break;
      }
      case "confirm": {
        const R = ao(
          i,
          "priority.confirmation.accepted"
        );
        R && y(R);
        break;
      }
      case "edit-selection": {
        y({ type: "priority.confirmation.edit" });
        break;
      }
      case "complete-transition": {
        const R = ao(
          i,
          "priority.transition.completed"
        );
        R && y(R);
        break;
      }
      case "ready-interpretation": {
        const R = ao(
          i,
          "priority.interpretation.ready"
        );
        R && y(R);
        break;
      }
      case "ready-mapping": {
        const R = ao(i, "priority.mapping.ready");
        R && y(R);
        break;
      }
      case "select-followup": {
        if (!D) return;
        y({
          type: "priority.followup.selected",
          targetId: D
        });
        break;
      }
      case "reset": {
        f.reset(), p = null;
        break;
      }
    }
    h();
  }, E = (z) => {
    const D = z.target;
    if (!(D instanceof HTMLElement)) return;
    const R = D.closest("[data-action]");
    R instanceof HTMLElement && g(R.dataset.action ?? "", R.dataset.targetId ?? null);
  };
  return u.addEventListener("click", E), h(), { root: u, host: a, styleElement: s, dispose: () => {
    u.removeEventListener("click", E), u.remove(), s.remove();
  } };
}
var kc = { exports: {} }, ro = {};
/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var kp;
function sx() {
  if (kp) return ro;
  kp = 1;
  var a = Symbol.for("react.transitional.element"), o = Symbol.for("react.fragment");
  function i(s, u, f) {
    var p = null;
    if (f !== void 0 && (p = "" + f), u.key !== void 0 && (p = "" + u.key), "key" in u) {
      f = {};
      for (var h in u)
        h !== "key" && (f[h] = u[h]);
    } else f = u;
    return u = f.ref, {
      $$typeof: a,
      type: s,
      key: p,
      ref: u !== void 0 ? u : null,
      props: f
    };
  }
  return ro.Fragment = o, ro.jsx = i, ro.jsxs = i, ro;
}
var Cp;
function cx() {
  return Cp || (Cp = 1, kc.exports = sx()), kc.exports;
}
var d = cx(), Cc = { exports: {} }, ee = {};
/**
 * @license React
 * react.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Ip;
function dx() {
  if (Ip) return ee;
  Ip = 1;
  var a = Symbol.for("react.transitional.element"), o = Symbol.for("react.portal"), i = Symbol.for("react.fragment"), s = Symbol.for("react.strict_mode"), u = Symbol.for("react.profiler"), f = Symbol.for("react.consumer"), p = Symbol.for("react.context"), h = Symbol.for("react.forward_ref"), y = Symbol.for("react.suspense"), g = Symbol.for("react.memo"), E = Symbol.for("react.lazy"), O = Symbol.for("react.activity"), z = Symbol.iterator;
  function D(x) {
    return x === null || typeof x != "object" ? null : (x = z && x[z] || x["@@iterator"], typeof x == "function" ? x : null);
  }
  var R = {
    isMounted: function() {
      return !1;
    },
    enqueueForceUpdate: function() {
    },
    enqueueReplaceState: function() {
    },
    enqueueSetState: function() {
    }
  }, S = Object.assign, H = {};
  function W(x, T, Y) {
    this.props = x, this.context = T, this.refs = H, this.updater = Y || R;
  }
  W.prototype.isReactComponent = {}, W.prototype.setState = function(x, T) {
    if (typeof x != "object" && typeof x != "function" && x != null)
      throw Error(
        "takes an object of state variables to update or a function which returns an object of state variables."
      );
    this.updater.enqueueSetState(this, x, T, "setState");
  }, W.prototype.forceUpdate = function(x) {
    this.updater.enqueueForceUpdate(this, x, "forceUpdate");
  };
  function pe() {
  }
  pe.prototype = W.prototype;
  function $(x, T, Y) {
    this.props = x, this.context = T, this.refs = H, this.updater = Y || R;
  }
  var re = $.prototype = new pe();
  re.constructor = $, S(re, W.prototype), re.isPureReactComponent = !0;
  var ue = Array.isArray;
  function V() {
  }
  var P = { H: null, A: null, T: null, S: null }, _e = Object.prototype.hasOwnProperty;
  function ot(x, T, Y) {
    var F = Y.ref;
    return {
      $$typeof: a,
      type: x,
      key: T,
      ref: F !== void 0 ? F : null,
      props: Y
    };
  }
  function We(x, T) {
    return ot(x.type, T, x.props);
  }
  function Ye(x) {
    return typeof x == "object" && x !== null && x.$$typeof === a;
  }
  function Te(x) {
    var T = { "=": "=0", ":": "=2" };
    return "$" + x.replace(/[=:]/g, function(Y) {
      return T[Y];
    });
  }
  var dt = /\/+/g;
  function xt(x, T) {
    return typeof x == "object" && x !== null && x.key != null ? Te("" + x.key) : T.toString(36);
  }
  function Ke(x) {
    switch (x.status) {
      case "fulfilled":
        return x.value;
      case "rejected":
        throw x.reason;
      default:
        switch (typeof x.status == "string" ? x.then(V, V) : (x.status = "pending", x.then(
          function(T) {
            x.status === "pending" && (x.status = "fulfilled", x.value = T);
          },
          function(T) {
            x.status === "pending" && (x.status = "rejected", x.reason = T);
          }
        )), x.status) {
          case "fulfilled":
            return x.value;
          case "rejected":
            throw x.reason;
        }
    }
    throw x;
  }
  function C(x, T, Y, F, te) {
    var ie = typeof x;
    (ie === "undefined" || ie === "boolean") && (x = null);
    var xe = !1;
    if (x === null) xe = !0;
    else
      switch (ie) {
        case "bigint":
        case "string":
        case "number":
          xe = !0;
          break;
        case "object":
          switch (x.$$typeof) {
            case a:
            case o:
              xe = !0;
              break;
            case E:
              return xe = x._init, C(
                xe(x._payload),
                T,
                Y,
                F,
                te
              );
          }
      }
    if (xe)
      return te = te(x), xe = F === "" ? "." + xt(x, 0) : F, ue(te) ? (Y = "", xe != null && (Y = xe.replace(dt, "$&/") + "/"), C(te, T, Y, "", function(dr) {
        return dr;
      })) : te != null && (Ye(te) && (te = We(
        te,
        Y + (te.key == null || x && x.key === te.key ? "" : ("" + te.key).replace(
          dt,
          "$&/"
        ) + "/") + xe
      )), T.push(te)), 1;
    xe = 0;
    var ut = F === "" ? "." : F + ":";
    if (ue(x))
      for (var Le = 0; Le < x.length; Le++)
        F = x[Le], ie = ut + xt(F, Le), xe += C(
          F,
          T,
          Y,
          ie,
          te
        );
    else if (Le = D(x), typeof Le == "function")
      for (x = Le.call(x), Le = 0; !(F = x.next()).done; )
        F = F.value, ie = ut + xt(F, Le++), xe += C(
          F,
          T,
          Y,
          ie,
          te
        );
    else if (ie === "object") {
      if (typeof x.then == "function")
        return C(
          Ke(x),
          T,
          Y,
          F,
          te
        );
      throw T = String(x), Error(
        "Objects are not valid as a React child (found: " + (T === "[object Object]" ? "object with keys {" + Object.keys(x).join(", ") + "}" : T) + "). If you meant to render a collection of children, use an array instead."
      );
    }
    return xe;
  }
  function B(x, T, Y) {
    if (x == null) return x;
    var F = [], te = 0;
    return C(x, F, "", "", function(ie) {
      return T.call(Y, ie, te++);
    }), F;
  }
  function K(x) {
    if (x._status === -1) {
      var T = x._result;
      T = T(), T.then(
        function(Y) {
          (x._status === 0 || x._status === -1) && (x._status = 1, x._result = Y);
        },
        function(Y) {
          (x._status === 0 || x._status === -1) && (x._status = 2, x._result = Y);
        }
      ), x._status === -1 && (x._status = 0, x._result = T);
    }
    if (x._status === 1) return x._result.default;
    throw x._result;
  }
  var fe = typeof reportError == "function" ? reportError : function(x) {
    if (typeof window == "object" && typeof window.ErrorEvent == "function") {
      var T = new window.ErrorEvent("error", {
        bubbles: !0,
        cancelable: !0,
        message: typeof x == "object" && x !== null && typeof x.message == "string" ? String(x.message) : String(x),
        error: x
      });
      if (!window.dispatchEvent(T)) return;
    } else if (typeof process == "object" && typeof process.emit == "function") {
      process.emit("uncaughtException", x);
      return;
    }
    console.error(x);
  }, be = {
    map: B,
    forEach: function(x, T, Y) {
      B(
        x,
        function() {
          T.apply(this, arguments);
        },
        Y
      );
    },
    count: function(x) {
      var T = 0;
      return B(x, function() {
        T++;
      }), T;
    },
    toArray: function(x) {
      return B(x, function(T) {
        return T;
      }) || [];
    },
    only: function(x) {
      if (!Ye(x))
        throw Error(
          "React.Children.only expected to receive a single React element child."
        );
      return x;
    }
  };
  return ee.Activity = O, ee.Children = be, ee.Component = W, ee.Fragment = i, ee.Profiler = u, ee.PureComponent = $, ee.StrictMode = s, ee.Suspense = y, ee.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = P, ee.__COMPILER_RUNTIME = {
    __proto__: null,
    c: function(x) {
      return P.H.useMemoCache(x);
    }
  }, ee.cache = function(x) {
    return function() {
      return x.apply(null, arguments);
    };
  }, ee.cacheSignal = function() {
    return null;
  }, ee.cloneElement = function(x, T, Y) {
    if (x == null)
      throw Error(
        "The argument must be a React element, but you passed " + x + "."
      );
    var F = S({}, x.props), te = x.key;
    if (T != null)
      for (ie in T.key !== void 0 && (te = "" + T.key), T)
        !_e.call(T, ie) || ie === "key" || ie === "__self" || ie === "__source" || ie === "ref" && T.ref === void 0 || (F[ie] = T[ie]);
    var ie = arguments.length - 2;
    if (ie === 1) F.children = Y;
    else if (1 < ie) {
      for (var xe = Array(ie), ut = 0; ut < ie; ut++)
        xe[ut] = arguments[ut + 2];
      F.children = xe;
    }
    return ot(x.type, te, F);
  }, ee.createContext = function(x) {
    return x = {
      $$typeof: p,
      _currentValue: x,
      _currentValue2: x,
      _threadCount: 0,
      Provider: null,
      Consumer: null
    }, x.Provider = x, x.Consumer = {
      $$typeof: f,
      _context: x
    }, x;
  }, ee.createElement = function(x, T, Y) {
    var F, te = {}, ie = null;
    if (T != null)
      for (F in T.key !== void 0 && (ie = "" + T.key), T)
        _e.call(T, F) && F !== "key" && F !== "__self" && F !== "__source" && (te[F] = T[F]);
    var xe = arguments.length - 2;
    if (xe === 1) te.children = Y;
    else if (1 < xe) {
      for (var ut = Array(xe), Le = 0; Le < xe; Le++)
        ut[Le] = arguments[Le + 2];
      te.children = ut;
    }
    if (x && x.defaultProps)
      for (F in xe = x.defaultProps, xe)
        te[F] === void 0 && (te[F] = xe[F]);
    return ot(x, ie, te);
  }, ee.createRef = function() {
    return { current: null };
  }, ee.forwardRef = function(x) {
    return { $$typeof: h, render: x };
  }, ee.isValidElement = Ye, ee.lazy = function(x) {
    return {
      $$typeof: E,
      _payload: { _status: -1, _result: x },
      _init: K
    };
  }, ee.memo = function(x, T) {
    return {
      $$typeof: g,
      type: x,
      compare: T === void 0 ? null : T
    };
  }, ee.startTransition = function(x) {
    var T = P.T, Y = {};
    P.T = Y;
    try {
      var F = x(), te = P.S;
      te !== null && te(Y, F), typeof F == "object" && F !== null && typeof F.then == "function" && F.then(V, fe);
    } catch (ie) {
      fe(ie);
    } finally {
      T !== null && Y.types !== null && (T.types = Y.types), P.T = T;
    }
  }, ee.unstable_useCacheRefresh = function() {
    return P.H.useCacheRefresh();
  }, ee.use = function(x) {
    return P.H.use(x);
  }, ee.useActionState = function(x, T, Y) {
    return P.H.useActionState(x, T, Y);
  }, ee.useCallback = function(x, T) {
    return P.H.useCallback(x, T);
  }, ee.useContext = function(x) {
    return P.H.useContext(x);
  }, ee.useDebugValue = function() {
  }, ee.useDeferredValue = function(x, T) {
    return P.H.useDeferredValue(x, T);
  }, ee.useEffect = function(x, T) {
    return P.H.useEffect(x, T);
  }, ee.useEffectEvent = function(x) {
    return P.H.useEffectEvent(x);
  }, ee.useId = function() {
    return P.H.useId();
  }, ee.useImperativeHandle = function(x, T, Y) {
    return P.H.useImperativeHandle(x, T, Y);
  }, ee.useInsertionEffect = function(x, T) {
    return P.H.useInsertionEffect(x, T);
  }, ee.useLayoutEffect = function(x, T) {
    return P.H.useLayoutEffect(x, T);
  }, ee.useMemo = function(x, T) {
    return P.H.useMemo(x, T);
  }, ee.useOptimistic = function(x, T) {
    return P.H.useOptimistic(x, T);
  }, ee.useReducer = function(x, T, Y) {
    return P.H.useReducer(x, T, Y);
  }, ee.useRef = function(x) {
    return P.H.useRef(x);
  }, ee.useState = function(x) {
    return P.H.useState(x);
  }, ee.useSyncExternalStore = function(x, T, Y) {
    return P.H.useSyncExternalStore(
      x,
      T,
      Y
    );
  }, ee.useTransition = function() {
    return P.H.useTransition();
  }, ee.version = "19.2.7", ee;
}
var Mp;
function cd() {
  return Mp || (Mp = 1, Cc.exports = dx()), Cc.exports;
}
var U = cd(), Ic = { exports: {} }, oo = {}, Mc = { exports: {} }, Dc = {};
/**
 * @license React
 * scheduler.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Dp;
function ux() {
  return Dp || (Dp = 1, (function(a) {
    function o(C, B) {
      var K = C.length;
      C.push(B);
      e: for (; 0 < K; ) {
        var fe = K - 1 >>> 1, be = C[fe];
        if (0 < u(be, B))
          C[fe] = B, C[K] = be, K = fe;
        else break e;
      }
    }
    function i(C) {
      return C.length === 0 ? null : C[0];
    }
    function s(C) {
      if (C.length === 0) return null;
      var B = C[0], K = C.pop();
      if (K !== B) {
        C[0] = K;
        e: for (var fe = 0, be = C.length, x = be >>> 1; fe < x; ) {
          var T = 2 * (fe + 1) - 1, Y = C[T], F = T + 1, te = C[F];
          if (0 > u(Y, K))
            F < be && 0 > u(te, Y) ? (C[fe] = te, C[F] = K, fe = F) : (C[fe] = Y, C[T] = K, fe = T);
          else if (F < be && 0 > u(te, K))
            C[fe] = te, C[F] = K, fe = F;
          else break e;
        }
      }
      return B;
    }
    function u(C, B) {
      var K = C.sortIndex - B.sortIndex;
      return K !== 0 ? K : C.id - B.id;
    }
    if (a.unstable_now = void 0, typeof performance == "object" && typeof performance.now == "function") {
      var f = performance;
      a.unstable_now = function() {
        return f.now();
      };
    } else {
      var p = Date, h = p.now();
      a.unstable_now = function() {
        return p.now() - h;
      };
    }
    var y = [], g = [], E = 1, O = null, z = 3, D = !1, R = !1, S = !1, H = !1, W = typeof setTimeout == "function" ? setTimeout : null, pe = typeof clearTimeout == "function" ? clearTimeout : null, $ = typeof setImmediate < "u" ? setImmediate : null;
    function re(C) {
      for (var B = i(g); B !== null; ) {
        if (B.callback === null) s(g);
        else if (B.startTime <= C)
          s(g), B.sortIndex = B.expirationTime, o(y, B);
        else break;
        B = i(g);
      }
    }
    function ue(C) {
      if (S = !1, re(C), !R)
        if (i(y) !== null)
          R = !0, V || (V = !0, Te());
        else {
          var B = i(g);
          B !== null && Ke(ue, B.startTime - C);
        }
    }
    var V = !1, P = -1, _e = 5, ot = -1;
    function We() {
      return H ? !0 : !(a.unstable_now() - ot < _e);
    }
    function Ye() {
      if (H = !1, V) {
        var C = a.unstable_now();
        ot = C;
        var B = !0;
        try {
          e: {
            R = !1, S && (S = !1, pe(P), P = -1), D = !0;
            var K = z;
            try {
              t: {
                for (re(C), O = i(y); O !== null && !(O.expirationTime > C && We()); ) {
                  var fe = O.callback;
                  if (typeof fe == "function") {
                    O.callback = null, z = O.priorityLevel;
                    var be = fe(
                      O.expirationTime <= C
                    );
                    if (C = a.unstable_now(), typeof be == "function") {
                      O.callback = be, re(C), B = !0;
                      break t;
                    }
                    O === i(y) && s(y), re(C);
                  } else s(y);
                  O = i(y);
                }
                if (O !== null) B = !0;
                else {
                  var x = i(g);
                  x !== null && Ke(
                    ue,
                    x.startTime - C
                  ), B = !1;
                }
              }
              break e;
            } finally {
              O = null, z = K, D = !1;
            }
            B = void 0;
          }
        } finally {
          B ? Te() : V = !1;
        }
      }
    }
    var Te;
    if (typeof $ == "function")
      Te = function() {
        $(Ye);
      };
    else if (typeof MessageChannel < "u") {
      var dt = new MessageChannel(), xt = dt.port2;
      dt.port1.onmessage = Ye, Te = function() {
        xt.postMessage(null);
      };
    } else
      Te = function() {
        W(Ye, 0);
      };
    function Ke(C, B) {
      P = W(function() {
        C(a.unstable_now());
      }, B);
    }
    a.unstable_IdlePriority = 5, a.unstable_ImmediatePriority = 1, a.unstable_LowPriority = 4, a.unstable_NormalPriority = 3, a.unstable_Profiling = null, a.unstable_UserBlockingPriority = 2, a.unstable_cancelCallback = function(C) {
      C.callback = null;
    }, a.unstable_forceFrameRate = function(C) {
      0 > C || 125 < C ? console.error(
        "forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"
      ) : _e = 0 < C ? Math.floor(1e3 / C) : 5;
    }, a.unstable_getCurrentPriorityLevel = function() {
      return z;
    }, a.unstable_next = function(C) {
      switch (z) {
        case 1:
        case 2:
        case 3:
          var B = 3;
          break;
        default:
          B = z;
      }
      var K = z;
      z = B;
      try {
        return C();
      } finally {
        z = K;
      }
    }, a.unstable_requestPaint = function() {
      H = !0;
    }, a.unstable_runWithPriority = function(C, B) {
      switch (C) {
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
          break;
        default:
          C = 3;
      }
      var K = z;
      z = C;
      try {
        return B();
      } finally {
        z = K;
      }
    }, a.unstable_scheduleCallback = function(C, B, K) {
      var fe = a.unstable_now();
      switch (typeof K == "object" && K !== null ? (K = K.delay, K = typeof K == "number" && 0 < K ? fe + K : fe) : K = fe, C) {
        case 1:
          var be = -1;
          break;
        case 2:
          be = 250;
          break;
        case 5:
          be = 1073741823;
          break;
        case 4:
          be = 1e4;
          break;
        default:
          be = 5e3;
      }
      return be = K + be, C = {
        id: E++,
        callback: B,
        priorityLevel: C,
        startTime: K,
        expirationTime: be,
        sortIndex: -1
      }, K > fe ? (C.sortIndex = K, o(g, C), i(y) === null && C === i(g) && (S ? (pe(P), P = -1) : S = !0, Ke(ue, K - fe))) : (C.sortIndex = be, o(y, C), R || D || (R = !0, V || (V = !0, Te()))), C;
    }, a.unstable_shouldYield = We, a.unstable_wrapCallback = function(C) {
      var B = z;
      return function() {
        var K = z;
        z = B;
        try {
          return C.apply(this, arguments);
        } finally {
          z = K;
        }
      };
    };
  })(Dc)), Dc;
}
var Up;
function mx() {
  return Up || (Up = 1, Mc.exports = ux()), Mc.exports;
}
var Uc = { exports: {} }, lt = {};
/**
 * @license React
 * react-dom.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Lp;
function fx() {
  if (Lp) return lt;
  Lp = 1;
  var a = cd();
  function o(y) {
    var g = "https://react.dev/errors/" + y;
    if (1 < arguments.length) {
      g += "?args[]=" + encodeURIComponent(arguments[1]);
      for (var E = 2; E < arguments.length; E++)
        g += "&args[]=" + encodeURIComponent(arguments[E]);
    }
    return "Minified React error #" + y + "; visit " + g + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
  }
  function i() {
  }
  var s = {
    d: {
      f: i,
      r: function() {
        throw Error(o(522));
      },
      D: i,
      C: i,
      L: i,
      m: i,
      X: i,
      S: i,
      M: i
    },
    p: 0,
    findDOMNode: null
  }, u = Symbol.for("react.portal");
  function f(y, g, E) {
    var O = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
    return {
      $$typeof: u,
      key: O == null ? null : "" + O,
      children: y,
      containerInfo: g,
      implementation: E
    };
  }
  var p = a.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
  function h(y, g) {
    if (y === "font") return "";
    if (typeof g == "string")
      return g === "use-credentials" ? g : "";
  }
  return lt.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = s, lt.createPortal = function(y, g) {
    var E = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
    if (!g || g.nodeType !== 1 && g.nodeType !== 9 && g.nodeType !== 11)
      throw Error(o(299));
    return f(y, g, null, E);
  }, lt.flushSync = function(y) {
    var g = p.T, E = s.p;
    try {
      if (p.T = null, s.p = 2, y) return y();
    } finally {
      p.T = g, s.p = E, s.d.f();
    }
  }, lt.preconnect = function(y, g) {
    typeof y == "string" && (g ? (g = g.crossOrigin, g = typeof g == "string" ? g === "use-credentials" ? g : "" : void 0) : g = null, s.d.C(y, g));
  }, lt.prefetchDNS = function(y) {
    typeof y == "string" && s.d.D(y);
  }, lt.preinit = function(y, g) {
    if (typeof y == "string" && g && typeof g.as == "string") {
      var E = g.as, O = h(E, g.crossOrigin), z = typeof g.integrity == "string" ? g.integrity : void 0, D = typeof g.fetchPriority == "string" ? g.fetchPriority : void 0;
      E === "style" ? s.d.S(
        y,
        typeof g.precedence == "string" ? g.precedence : void 0,
        {
          crossOrigin: O,
          integrity: z,
          fetchPriority: D
        }
      ) : E === "script" && s.d.X(y, {
        crossOrigin: O,
        integrity: z,
        fetchPriority: D,
        nonce: typeof g.nonce == "string" ? g.nonce : void 0
      });
    }
  }, lt.preinitModule = function(y, g) {
    if (typeof y == "string")
      if (typeof g == "object" && g !== null) {
        if (g.as == null || g.as === "script") {
          var E = h(
            g.as,
            g.crossOrigin
          );
          s.d.M(y, {
            crossOrigin: E,
            integrity: typeof g.integrity == "string" ? g.integrity : void 0,
            nonce: typeof g.nonce == "string" ? g.nonce : void 0
          });
        }
      } else g == null && s.d.M(y);
  }, lt.preload = function(y, g) {
    if (typeof y == "string" && typeof g == "object" && g !== null && typeof g.as == "string") {
      var E = g.as, O = h(E, g.crossOrigin);
      s.d.L(y, E, {
        crossOrigin: O,
        integrity: typeof g.integrity == "string" ? g.integrity : void 0,
        nonce: typeof g.nonce == "string" ? g.nonce : void 0,
        type: typeof g.type == "string" ? g.type : void 0,
        fetchPriority: typeof g.fetchPriority == "string" ? g.fetchPriority : void 0,
        referrerPolicy: typeof g.referrerPolicy == "string" ? g.referrerPolicy : void 0,
        imageSrcSet: typeof g.imageSrcSet == "string" ? g.imageSrcSet : void 0,
        imageSizes: typeof g.imageSizes == "string" ? g.imageSizes : void 0,
        media: typeof g.media == "string" ? g.media : void 0
      });
    }
  }, lt.preloadModule = function(y, g) {
    if (typeof y == "string")
      if (g) {
        var E = h(g.as, g.crossOrigin);
        s.d.m(y, {
          as: typeof g.as == "string" && g.as !== "script" ? g.as : void 0,
          crossOrigin: E,
          integrity: typeof g.integrity == "string" ? g.integrity : void 0
        });
      } else s.d.m(y);
  }, lt.requestFormReset = function(y) {
    s.d.r(y);
  }, lt.unstable_batchedUpdates = function(y, g) {
    return y(g);
  }, lt.useFormState = function(y, g, E) {
    return p.H.useFormState(y, g, E);
  }, lt.useFormStatus = function() {
    return p.H.useHostTransitionStatus();
  }, lt.version = "19.2.7", lt;
}
var Hp;
function Db() {
  if (Hp) return Uc.exports;
  Hp = 1;
  function a() {
    if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"))
      try {
        __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(a);
      } catch (o) {
        console.error(o);
      }
  }
  return a(), Uc.exports = fx(), Uc.exports;
}
/**
 * @license React
 * react-dom-client.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Bp;
function px() {
  if (Bp) return oo;
  Bp = 1;
  var a = mx(), o = cd(), i = Db();
  function s(e) {
    var t = "https://react.dev/errors/" + e;
    if (1 < arguments.length) {
      t += "?args[]=" + encodeURIComponent(arguments[1]);
      for (var n = 2; n < arguments.length; n++)
        t += "&args[]=" + encodeURIComponent(arguments[n]);
    }
    return "Minified React error #" + e + "; visit " + t + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
  }
  function u(e) {
    return !(!e || e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11);
  }
  function f(e) {
    var t = e, n = e;
    if (e.alternate) for (; t.return; ) t = t.return;
    else {
      e = t;
      do
        t = e, (t.flags & 4098) !== 0 && (n = t.return), e = t.return;
      while (e);
    }
    return t.tag === 3 ? n : null;
  }
  function p(e) {
    if (e.tag === 13) {
      var t = e.memoizedState;
      if (t === null && (e = e.alternate, e !== null && (t = e.memoizedState)), t !== null) return t.dehydrated;
    }
    return null;
  }
  function h(e) {
    if (e.tag === 31) {
      var t = e.memoizedState;
      if (t === null && (e = e.alternate, e !== null && (t = e.memoizedState)), t !== null) return t.dehydrated;
    }
    return null;
  }
  function y(e) {
    if (f(e) !== e)
      throw Error(s(188));
  }
  function g(e) {
    var t = e.alternate;
    if (!t) {
      if (t = f(e), t === null) throw Error(s(188));
      return t !== e ? null : e;
    }
    for (var n = e, r = t; ; ) {
      var l = n.return;
      if (l === null) break;
      var c = l.alternate;
      if (c === null) {
        if (r = l.return, r !== null) {
          n = r;
          continue;
        }
        break;
      }
      if (l.child === c.child) {
        for (c = l.child; c; ) {
          if (c === n) return y(l), e;
          if (c === r) return y(l), t;
          c = c.sibling;
        }
        throw Error(s(188));
      }
      if (n.return !== r.return) n = l, r = c;
      else {
        for (var m = !1, b = l.child; b; ) {
          if (b === n) {
            m = !0, n = l, r = c;
            break;
          }
          if (b === r) {
            m = !0, r = l, n = c;
            break;
          }
          b = b.sibling;
        }
        if (!m) {
          for (b = c.child; b; ) {
            if (b === n) {
              m = !0, n = c, r = l;
              break;
            }
            if (b === r) {
              m = !0, r = c, n = l;
              break;
            }
            b = b.sibling;
          }
          if (!m) throw Error(s(189));
        }
      }
      if (n.alternate !== r) throw Error(s(190));
    }
    if (n.tag !== 3) throw Error(s(188));
    return n.stateNode.current === n ? e : t;
  }
  function E(e) {
    var t = e.tag;
    if (t === 5 || t === 26 || t === 27 || t === 6) return e;
    for (e = e.child; e !== null; ) {
      if (t = E(e), t !== null) return t;
      e = e.sibling;
    }
    return null;
  }
  var O = Object.assign, z = Symbol.for("react.element"), D = Symbol.for("react.transitional.element"), R = Symbol.for("react.portal"), S = Symbol.for("react.fragment"), H = Symbol.for("react.strict_mode"), W = Symbol.for("react.profiler"), pe = Symbol.for("react.consumer"), $ = Symbol.for("react.context"), re = Symbol.for("react.forward_ref"), ue = Symbol.for("react.suspense"), V = Symbol.for("react.suspense_list"), P = Symbol.for("react.memo"), _e = Symbol.for("react.lazy"), ot = Symbol.for("react.activity"), We = Symbol.for("react.memo_cache_sentinel"), Ye = Symbol.iterator;
  function Te(e) {
    return e === null || typeof e != "object" ? null : (e = Ye && e[Ye] || e["@@iterator"], typeof e == "function" ? e : null);
  }
  var dt = Symbol.for("react.client.reference");
  function xt(e) {
    if (e == null) return null;
    if (typeof e == "function")
      return e.$$typeof === dt ? null : e.displayName || e.name || null;
    if (typeof e == "string") return e;
    switch (e) {
      case S:
        return "Fragment";
      case W:
        return "Profiler";
      case H:
        return "StrictMode";
      case ue:
        return "Suspense";
      case V:
        return "SuspenseList";
      case ot:
        return "Activity";
    }
    if (typeof e == "object")
      switch (e.$$typeof) {
        case R:
          return "Portal";
        case $:
          return e.displayName || "Context";
        case pe:
          return (e._context.displayName || "Context") + ".Consumer";
        case re:
          var t = e.render;
          return e = e.displayName, e || (e = t.displayName || t.name || "", e = e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef"), e;
        case P:
          return t = e.displayName || null, t !== null ? t : xt(e.type) || "Memo";
        case _e:
          t = e._payload, e = e._init;
          try {
            return xt(e(t));
          } catch {
          }
      }
    return null;
  }
  var Ke = Array.isArray, C = o.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, B = i.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, K = {
    pending: !1,
    data: null,
    method: null,
    action: null
  }, fe = [], be = -1;
  function x(e) {
    return { current: e };
  }
  function T(e) {
    0 > be || (e.current = fe[be], fe[be] = null, be--);
  }
  function Y(e, t) {
    be++, fe[be] = e.current, e.current = t;
  }
  var F = x(null), te = x(null), ie = x(null), xe = x(null);
  function ut(e, t) {
    switch (Y(ie, t), Y(te, e), Y(F, null), t.nodeType) {
      case 9:
      case 11:
        e = (e = t.documentElement) && (e = e.namespaceURI) ? Zf(e) : 0;
        break;
      default:
        if (e = t.tagName, t = t.namespaceURI)
          t = Zf(t), e = Qf(t, e);
        else
          switch (e) {
            case "svg":
              e = 1;
              break;
            case "math":
              e = 2;
              break;
            default:
              e = 0;
          }
    }
    T(F), Y(F, e);
  }
  function Le() {
    T(F), T(te), T(ie);
  }
  function dr(e) {
    e.memoizedState !== null && Y(xe, e);
    var t = F.current, n = Qf(t, e.type);
    t !== n && (Y(te, e), Y(F, n));
  }
  function jo(e) {
    te.current === e && (T(F), T(te)), xe.current === e && (T(xe), Wr._currentValue = K);
  }
  var ul, Ad;
  function Wn(e) {
    if (ul === void 0)
      try {
        throw Error();
      } catch (n) {
        var t = n.stack.trim().match(/\n( *(at )?)/);
        ul = t && t[1] || "", Ad = -1 < n.stack.indexOf(`
    at`) ? " (<anonymous>)" : -1 < n.stack.indexOf("@") ? "@unknown:0:0" : "";
      }
    return `
` + ul + e + Ad;
  }
  var ml = !1;
  function fl(e, t) {
    if (!e || ml) return "";
    ml = !0;
    var n = Error.prepareStackTrace;
    Error.prepareStackTrace = void 0;
    try {
      var r = {
        DetermineComponentFrameRoot: function() {
          try {
            if (t) {
              var L = function() {
                throw Error();
              };
              if (Object.defineProperty(L.prototype, "props", {
                set: function() {
                  throw Error();
                }
              }), typeof Reflect == "object" && Reflect.construct) {
                try {
                  Reflect.construct(L, []);
                } catch (k) {
                  var N = k;
                }
                Reflect.construct(e, [], L);
              } else {
                try {
                  L.call();
                } catch (k) {
                  N = k;
                }
                e.call(L.prototype);
              }
            } else {
              try {
                throw Error();
              } catch (k) {
                N = k;
              }
              (L = e()) && typeof L.catch == "function" && L.catch(function() {
              });
            }
          } catch (k) {
            if (k && N && typeof k.stack == "string")
              return [k.stack, N.stack];
          }
          return [null, null];
        }
      };
      r.DetermineComponentFrameRoot.displayName = "DetermineComponentFrameRoot";
      var l = Object.getOwnPropertyDescriptor(
        r.DetermineComponentFrameRoot,
        "name"
      );
      l && l.configurable && Object.defineProperty(
        r.DetermineComponentFrameRoot,
        "name",
        { value: "DetermineComponentFrameRoot" }
      );
      var c = r.DetermineComponentFrameRoot(), m = c[0], b = c[1];
      if (m && b) {
        var v = m.split(`
`), _ = b.split(`
`);
        for (l = r = 0; r < v.length && !v[r].includes("DetermineComponentFrameRoot"); )
          r++;
        for (; l < _.length && !_[l].includes(
          "DetermineComponentFrameRoot"
        ); )
          l++;
        if (r === v.length || l === _.length)
          for (r = v.length - 1, l = _.length - 1; 1 <= r && 0 <= l && v[r] !== _[l]; )
            l--;
        for (; 1 <= r && 0 <= l; r--, l--)
          if (v[r] !== _[l]) {
            if (r !== 1 || l !== 1)
              do
                if (r--, l--, 0 > l || v[r] !== _[l]) {
                  var I = `
` + v[r].replace(" at new ", " at ");
                  return e.displayName && I.includes("<anonymous>") && (I = I.replace("<anonymous>", e.displayName)), I;
                }
              while (1 <= r && 0 <= l);
            break;
          }
      }
    } finally {
      ml = !1, Error.prepareStackTrace = n;
    }
    return (n = e ? e.displayName || e.name : "") ? Wn(n) : "";
  }
  function Qh(e, t) {
    switch (e.tag) {
      case 26:
      case 27:
      case 5:
        return Wn(e.type);
      case 16:
        return Wn("Lazy");
      case 13:
        return e.child !== t && t !== null ? Wn("Suspense Fallback") : Wn("Suspense");
      case 19:
        return Wn("SuspenseList");
      case 0:
      case 15:
        return fl(e.type, !1);
      case 11:
        return fl(e.type.render, !1);
      case 1:
        return fl(e.type, !0);
      case 31:
        return Wn("Activity");
      default:
        return "";
    }
  }
  function _d(e) {
    try {
      var t = "", n = null;
      do
        t += Qh(e, n), n = e, e = e.return;
      while (e);
      return t;
    } catch (r) {
      return `
Error generating stack: ` + r.message + `
` + r.stack;
    }
  }
  var pl = Object.prototype.hasOwnProperty, bl = a.unstable_scheduleCallback, hl = a.unstable_cancelCallback, Jh = a.unstable_shouldYield, Wh = a.unstable_requestPaint, wt = a.unstable_now, ey = a.unstable_getCurrentPriorityLevel, Od = a.unstable_ImmediatePriority, zd = a.unstable_UserBlockingPriority, Eo = a.unstable_NormalPriority, ty = a.unstable_LowPriority, Nd = a.unstable_IdlePriority, ny = a.log, ay = a.unstable_setDisableYieldValue, ur = null, St = null;
  function wn(e) {
    if (typeof ny == "function" && ay(e), St && typeof St.setStrictMode == "function")
      try {
        St.setStrictMode(ur, e);
      } catch {
      }
  }
  var jt = Math.clz32 ? Math.clz32 : iy, ry = Math.log, oy = Math.LN2;
  function iy(e) {
    return e >>>= 0, e === 0 ? 32 : 31 - (ry(e) / oy | 0) | 0;
  }
  var Ao = 256, _o = 262144, Oo = 4194304;
  function ea(e) {
    var t = e & 42;
    if (t !== 0) return t;
    switch (e & -e) {
      case 1:
        return 1;
      case 2:
        return 2;
      case 4:
        return 4;
      case 8:
        return 8;
      case 16:
        return 16;
      case 32:
        return 32;
      case 64:
        return 64;
      case 128:
        return 128;
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
        return e & 261888;
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
        return e & 3932160;
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
        return e & 62914560;
      case 67108864:
        return 67108864;
      case 134217728:
        return 134217728;
      case 268435456:
        return 268435456;
      case 536870912:
        return 536870912;
      case 1073741824:
        return 0;
      default:
        return e;
    }
  }
  function zo(e, t, n) {
    var r = e.pendingLanes;
    if (r === 0) return 0;
    var l = 0, c = e.suspendedLanes, m = e.pingedLanes;
    e = e.warmLanes;
    var b = r & 134217727;
    return b !== 0 ? (r = b & ~c, r !== 0 ? l = ea(r) : (m &= b, m !== 0 ? l = ea(m) : n || (n = b & ~e, n !== 0 && (l = ea(n))))) : (b = r & ~c, b !== 0 ? l = ea(b) : m !== 0 ? l = ea(m) : n || (n = r & ~e, n !== 0 && (l = ea(n)))), l === 0 ? 0 : t !== 0 && t !== l && (t & c) === 0 && (c = l & -l, n = t & -t, c >= n || c === 32 && (n & 4194048) !== 0) ? t : l;
  }
  function mr(e, t) {
    return (e.pendingLanes & ~(e.suspendedLanes & ~e.pingedLanes) & t) === 0;
  }
  function ly(e, t) {
    switch (e) {
      case 1:
      case 2:
      case 4:
      case 8:
      case 64:
        return t + 250;
      case 16:
      case 32:
      case 128:
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
        return t + 5e3;
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
        return -1;
      case 67108864:
      case 134217728:
      case 268435456:
      case 536870912:
      case 1073741824:
        return -1;
      default:
        return -1;
    }
  }
  function Td() {
    var e = Oo;
    return Oo <<= 1, (Oo & 62914560) === 0 && (Oo = 4194304), e;
  }
  function yl(e) {
    for (var t = [], n = 0; 31 > n; n++) t.push(e);
    return t;
  }
  function fr(e, t) {
    e.pendingLanes |= t, t !== 268435456 && (e.suspendedLanes = 0, e.pingedLanes = 0, e.warmLanes = 0);
  }
  function sy(e, t, n, r, l, c) {
    var m = e.pendingLanes;
    e.pendingLanes = n, e.suspendedLanes = 0, e.pingedLanes = 0, e.warmLanes = 0, e.expiredLanes &= n, e.entangledLanes &= n, e.errorRecoveryDisabledLanes &= n, e.shellSuspendCounter = 0;
    var b = e.entanglements, v = e.expirationTimes, _ = e.hiddenUpdates;
    for (n = m & ~n; 0 < n; ) {
      var I = 31 - jt(n), L = 1 << I;
      b[I] = 0, v[I] = -1;
      var N = _[I];
      if (N !== null)
        for (_[I] = null, I = 0; I < N.length; I++) {
          var k = N[I];
          k !== null && (k.lane &= -536870913);
        }
      n &= ~L;
    }
    r !== 0 && Rd(e, r, 0), c !== 0 && l === 0 && e.tag !== 0 && (e.suspendedLanes |= c & ~(m & ~t));
  }
  function Rd(e, t, n) {
    e.pendingLanes |= t, e.suspendedLanes &= ~t;
    var r = 31 - jt(t);
    e.entangledLanes |= t, e.entanglements[r] = e.entanglements[r] | 1073741824 | n & 261930;
  }
  function kd(e, t) {
    var n = e.entangledLanes |= t;
    for (e = e.entanglements; n; ) {
      var r = 31 - jt(n), l = 1 << r;
      l & t | e[r] & t && (e[r] |= t), n &= ~l;
    }
  }
  function Cd(e, t) {
    var n = t & -t;
    return n = (n & 42) !== 0 ? 1 : gl(n), (n & (e.suspendedLanes | t)) !== 0 ? 0 : n;
  }
  function gl(e) {
    switch (e) {
      case 2:
        e = 1;
        break;
      case 8:
        e = 4;
        break;
      case 32:
        e = 16;
        break;
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
        e = 128;
        break;
      case 268435456:
        e = 134217728;
        break;
      default:
        e = 0;
    }
    return e;
  }
  function vl(e) {
    return e &= -e, 2 < e ? 8 < e ? (e & 134217727) !== 0 ? 32 : 268435456 : 8 : 2;
  }
  function Id() {
    var e = B.p;
    return e !== 0 ? e : (e = window.event, e === void 0 ? 32 : xp(e.type));
  }
  function Md(e, t) {
    var n = B.p;
    try {
      return B.p = e, t();
    } finally {
      B.p = n;
    }
  }
  var Sn = Math.random().toString(36).slice(2), et = "__reactFiber$" + Sn, ft = "__reactProps$" + Sn, wa = "__reactContainer$" + Sn, xl = "__reactEvents$" + Sn, cy = "__reactListeners$" + Sn, dy = "__reactHandles$" + Sn, Dd = "__reactResources$" + Sn, pr = "__reactMarker$" + Sn;
  function wl(e) {
    delete e[et], delete e[ft], delete e[xl], delete e[cy], delete e[dy];
  }
  function Sa(e) {
    var t = e[et];
    if (t) return t;
    for (var n = e.parentNode; n; ) {
      if (t = n[wa] || n[et]) {
        if (n = t.alternate, t.child !== null || n !== null && n.child !== null)
          for (e = rp(e); e !== null; ) {
            if (n = e[et]) return n;
            e = rp(e);
          }
        return t;
      }
      e = n, n = e.parentNode;
    }
    return null;
  }
  function ja(e) {
    if (e = e[et] || e[wa]) {
      var t = e.tag;
      if (t === 5 || t === 6 || t === 13 || t === 31 || t === 26 || t === 27 || t === 3)
        return e;
    }
    return null;
  }
  function br(e) {
    var t = e.tag;
    if (t === 5 || t === 26 || t === 27 || t === 6) return e.stateNode;
    throw Error(s(33));
  }
  function Ea(e) {
    var t = e[Dd];
    return t || (t = e[Dd] = { hoistableStyles: /* @__PURE__ */ new Map(), hoistableScripts: /* @__PURE__ */ new Map() }), t;
  }
  function Ze(e) {
    e[pr] = !0;
  }
  var Ud = /* @__PURE__ */ new Set(), Ld = {};
  function ta(e, t) {
    Aa(e, t), Aa(e + "Capture", t);
  }
  function Aa(e, t) {
    for (Ld[e] = t, e = 0; e < t.length; e++)
      Ud.add(t[e]);
  }
  var uy = RegExp(
    "^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"
  ), Hd = {}, Bd = {};
  function my(e) {
    return pl.call(Bd, e) ? !0 : pl.call(Hd, e) ? !1 : uy.test(e) ? Bd[e] = !0 : (Hd[e] = !0, !1);
  }
  function No(e, t, n) {
    if (my(t))
      if (n === null) e.removeAttribute(t);
      else {
        switch (typeof n) {
          case "undefined":
          case "function":
          case "symbol":
            e.removeAttribute(t);
            return;
          case "boolean":
            var r = t.toLowerCase().slice(0, 5);
            if (r !== "data-" && r !== "aria-") {
              e.removeAttribute(t);
              return;
            }
        }
        e.setAttribute(t, "" + n);
      }
  }
  function To(e, t, n) {
    if (n === null) e.removeAttribute(t);
    else {
      switch (typeof n) {
        case "undefined":
        case "function":
        case "symbol":
        case "boolean":
          e.removeAttribute(t);
          return;
      }
      e.setAttribute(t, "" + n);
    }
  }
  function en(e, t, n, r) {
    if (r === null) e.removeAttribute(n);
    else {
      switch (typeof r) {
        case "undefined":
        case "function":
        case "symbol":
        case "boolean":
          e.removeAttribute(n);
          return;
      }
      e.setAttributeNS(t, n, "" + r);
    }
  }
  function Rt(e) {
    switch (typeof e) {
      case "bigint":
      case "boolean":
      case "number":
      case "string":
      case "undefined":
        return e;
      case "object":
        return e;
      default:
        return "";
    }
  }
  function Yd(e) {
    var t = e.type;
    return (e = e.nodeName) && e.toLowerCase() === "input" && (t === "checkbox" || t === "radio");
  }
  function fy(e, t, n) {
    var r = Object.getOwnPropertyDescriptor(
      e.constructor.prototype,
      t
    );
    if (!e.hasOwnProperty(t) && typeof r < "u" && typeof r.get == "function" && typeof r.set == "function") {
      var l = r.get, c = r.set;
      return Object.defineProperty(e, t, {
        configurable: !0,
        get: function() {
          return l.call(this);
        },
        set: function(m) {
          n = "" + m, c.call(this, m);
        }
      }), Object.defineProperty(e, t, {
        enumerable: r.enumerable
      }), {
        getValue: function() {
          return n;
        },
        setValue: function(m) {
          n = "" + m;
        },
        stopTracking: function() {
          e._valueTracker = null, delete e[t];
        }
      };
    }
  }
  function Sl(e) {
    if (!e._valueTracker) {
      var t = Yd(e) ? "checked" : "value";
      e._valueTracker = fy(
        e,
        t,
        "" + e[t]
      );
    }
  }
  function $d(e) {
    if (!e) return !1;
    var t = e._valueTracker;
    if (!t) return !0;
    var n = t.getValue(), r = "";
    return e && (r = Yd(e) ? e.checked ? "true" : "false" : e.value), e = r, e !== n ? (t.setValue(e), !0) : !1;
  }
  function Ro(e) {
    if (e = e || (typeof document < "u" ? document : void 0), typeof e > "u") return null;
    try {
      return e.activeElement || e.body;
    } catch {
      return e.body;
    }
  }
  var py = /[\n"\\]/g;
  function kt(e) {
    return e.replace(
      py,
      function(t) {
        return "\\" + t.charCodeAt(0).toString(16) + " ";
      }
    );
  }
  function jl(e, t, n, r, l, c, m, b) {
    e.name = "", m != null && typeof m != "function" && typeof m != "symbol" && typeof m != "boolean" ? e.type = m : e.removeAttribute("type"), t != null ? m === "number" ? (t === 0 && e.value === "" || e.value != t) && (e.value = "" + Rt(t)) : e.value !== "" + Rt(t) && (e.value = "" + Rt(t)) : m !== "submit" && m !== "reset" || e.removeAttribute("value"), t != null ? El(e, m, Rt(t)) : n != null ? El(e, m, Rt(n)) : r != null && e.removeAttribute("value"), l == null && c != null && (e.defaultChecked = !!c), l != null && (e.checked = l && typeof l != "function" && typeof l != "symbol"), b != null && typeof b != "function" && typeof b != "symbol" && typeof b != "boolean" ? e.name = "" + Rt(b) : e.removeAttribute("name");
  }
  function Gd(e, t, n, r, l, c, m, b) {
    if (c != null && typeof c != "function" && typeof c != "symbol" && typeof c != "boolean" && (e.type = c), t != null || n != null) {
      if (!(c !== "submit" && c !== "reset" || t != null)) {
        Sl(e);
        return;
      }
      n = n != null ? "" + Rt(n) : "", t = t != null ? "" + Rt(t) : n, b || t === e.value || (e.value = t), e.defaultValue = t;
    }
    r = r ?? l, r = typeof r != "function" && typeof r != "symbol" && !!r, e.checked = b ? e.checked : !!r, e.defaultChecked = !!r, m != null && typeof m != "function" && typeof m != "symbol" && typeof m != "boolean" && (e.name = m), Sl(e);
  }
  function El(e, t, n) {
    t === "number" && Ro(e.ownerDocument) === e || e.defaultValue === "" + n || (e.defaultValue = "" + n);
  }
  function _a(e, t, n, r) {
    if (e = e.options, t) {
      t = {};
      for (var l = 0; l < n.length; l++)
        t["$" + n[l]] = !0;
      for (n = 0; n < e.length; n++)
        l = t.hasOwnProperty("$" + e[n].value), e[n].selected !== l && (e[n].selected = l), l && r && (e[n].defaultSelected = !0);
    } else {
      for (n = "" + Rt(n), t = null, l = 0; l < e.length; l++) {
        if (e[l].value === n) {
          e[l].selected = !0, r && (e[l].defaultSelected = !0);
          return;
        }
        t !== null || e[l].disabled || (t = e[l]);
      }
      t !== null && (t.selected = !0);
    }
  }
  function qd(e, t, n) {
    if (t != null && (t = "" + Rt(t), t !== e.value && (e.value = t), n == null)) {
      e.defaultValue !== t && (e.defaultValue = t);
      return;
    }
    e.defaultValue = n != null ? "" + Rt(n) : "";
  }
  function Vd(e, t, n, r) {
    if (t == null) {
      if (r != null) {
        if (n != null) throw Error(s(92));
        if (Ke(r)) {
          if (1 < r.length) throw Error(s(93));
          r = r[0];
        }
        n = r;
      }
      n == null && (n = ""), t = n;
    }
    n = Rt(t), e.defaultValue = n, r = e.textContent, r === n && r !== "" && r !== null && (e.value = r), Sl(e);
  }
  function Oa(e, t) {
    if (t) {
      var n = e.firstChild;
      if (n && n === e.lastChild && n.nodeType === 3) {
        n.nodeValue = t;
        return;
      }
    }
    e.textContent = t;
  }
  var by = new Set(
    "animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(
      " "
    )
  );
  function Fd(e, t, n) {
    var r = t.indexOf("--") === 0;
    n == null || typeof n == "boolean" || n === "" ? r ? e.setProperty(t, "") : t === "float" ? e.cssFloat = "" : e[t] = "" : r ? e.setProperty(t, n) : typeof n != "number" || n === 0 || by.has(t) ? t === "float" ? e.cssFloat = n : e[t] = ("" + n).trim() : e[t] = n + "px";
  }
  function Xd(e, t, n) {
    if (t != null && typeof t != "object")
      throw Error(s(62));
    if (e = e.style, n != null) {
      for (var r in n)
        !n.hasOwnProperty(r) || t != null && t.hasOwnProperty(r) || (r.indexOf("--") === 0 ? e.setProperty(r, "") : r === "float" ? e.cssFloat = "" : e[r] = "");
      for (var l in t)
        r = t[l], t.hasOwnProperty(l) && n[l] !== r && Fd(e, l, r);
    } else
      for (var c in t)
        t.hasOwnProperty(c) && Fd(e, c, t[c]);
  }
  function Al(e) {
    if (e.indexOf("-") === -1) return !1;
    switch (e) {
      case "annotation-xml":
      case "color-profile":
      case "font-face":
      case "font-face-src":
      case "font-face-uri":
      case "font-face-format":
      case "font-face-name":
      case "missing-glyph":
        return !1;
      default:
        return !0;
    }
  }
  var hy = /* @__PURE__ */ new Map([
    ["acceptCharset", "accept-charset"],
    ["htmlFor", "for"],
    ["httpEquiv", "http-equiv"],
    ["crossOrigin", "crossorigin"],
    ["accentHeight", "accent-height"],
    ["alignmentBaseline", "alignment-baseline"],
    ["arabicForm", "arabic-form"],
    ["baselineShift", "baseline-shift"],
    ["capHeight", "cap-height"],
    ["clipPath", "clip-path"],
    ["clipRule", "clip-rule"],
    ["colorInterpolation", "color-interpolation"],
    ["colorInterpolationFilters", "color-interpolation-filters"],
    ["colorProfile", "color-profile"],
    ["colorRendering", "color-rendering"],
    ["dominantBaseline", "dominant-baseline"],
    ["enableBackground", "enable-background"],
    ["fillOpacity", "fill-opacity"],
    ["fillRule", "fill-rule"],
    ["floodColor", "flood-color"],
    ["floodOpacity", "flood-opacity"],
    ["fontFamily", "font-family"],
    ["fontSize", "font-size"],
    ["fontSizeAdjust", "font-size-adjust"],
    ["fontStretch", "font-stretch"],
    ["fontStyle", "font-style"],
    ["fontVariant", "font-variant"],
    ["fontWeight", "font-weight"],
    ["glyphName", "glyph-name"],
    ["glyphOrientationHorizontal", "glyph-orientation-horizontal"],
    ["glyphOrientationVertical", "glyph-orientation-vertical"],
    ["horizAdvX", "horiz-adv-x"],
    ["horizOriginX", "horiz-origin-x"],
    ["imageRendering", "image-rendering"],
    ["letterSpacing", "letter-spacing"],
    ["lightingColor", "lighting-color"],
    ["markerEnd", "marker-end"],
    ["markerMid", "marker-mid"],
    ["markerStart", "marker-start"],
    ["overlinePosition", "overline-position"],
    ["overlineThickness", "overline-thickness"],
    ["paintOrder", "paint-order"],
    ["panose-1", "panose-1"],
    ["pointerEvents", "pointer-events"],
    ["renderingIntent", "rendering-intent"],
    ["shapeRendering", "shape-rendering"],
    ["stopColor", "stop-color"],
    ["stopOpacity", "stop-opacity"],
    ["strikethroughPosition", "strikethrough-position"],
    ["strikethroughThickness", "strikethrough-thickness"],
    ["strokeDasharray", "stroke-dasharray"],
    ["strokeDashoffset", "stroke-dashoffset"],
    ["strokeLinecap", "stroke-linecap"],
    ["strokeLinejoin", "stroke-linejoin"],
    ["strokeMiterlimit", "stroke-miterlimit"],
    ["strokeOpacity", "stroke-opacity"],
    ["strokeWidth", "stroke-width"],
    ["textAnchor", "text-anchor"],
    ["textDecoration", "text-decoration"],
    ["textRendering", "text-rendering"],
    ["transformOrigin", "transform-origin"],
    ["underlinePosition", "underline-position"],
    ["underlineThickness", "underline-thickness"],
    ["unicodeBidi", "unicode-bidi"],
    ["unicodeRange", "unicode-range"],
    ["unitsPerEm", "units-per-em"],
    ["vAlphabetic", "v-alphabetic"],
    ["vHanging", "v-hanging"],
    ["vIdeographic", "v-ideographic"],
    ["vMathematical", "v-mathematical"],
    ["vectorEffect", "vector-effect"],
    ["vertAdvY", "vert-adv-y"],
    ["vertOriginX", "vert-origin-x"],
    ["vertOriginY", "vert-origin-y"],
    ["wordSpacing", "word-spacing"],
    ["writingMode", "writing-mode"],
    ["xmlnsXlink", "xmlns:xlink"],
    ["xHeight", "x-height"]
  ]), yy = /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;
  function ko(e) {
    return yy.test("" + e) ? "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')" : e;
  }
  function tn() {
  }
  var _l = null;
  function Ol(e) {
    return e = e.target || e.srcElement || window, e.correspondingUseElement && (e = e.correspondingUseElement), e.nodeType === 3 ? e.parentNode : e;
  }
  var za = null, Na = null;
  function Pd(e) {
    var t = ja(e);
    if (t && (e = t.stateNode)) {
      var n = e[ft] || null;
      e: switch (e = t.stateNode, t.type) {
        case "input":
          if (jl(
            e,
            n.value,
            n.defaultValue,
            n.defaultValue,
            n.checked,
            n.defaultChecked,
            n.type,
            n.name
          ), t = n.name, n.type === "radio" && t != null) {
            for (n = e; n.parentNode; ) n = n.parentNode;
            for (n = n.querySelectorAll(
              'input[name="' + kt(
                "" + t
              ) + '"][type="radio"]'
            ), t = 0; t < n.length; t++) {
              var r = n[t];
              if (r !== e && r.form === e.form) {
                var l = r[ft] || null;
                if (!l) throw Error(s(90));
                jl(
                  r,
                  l.value,
                  l.defaultValue,
                  l.defaultValue,
                  l.checked,
                  l.defaultChecked,
                  l.type,
                  l.name
                );
              }
            }
            for (t = 0; t < n.length; t++)
              r = n[t], r.form === e.form && $d(r);
          }
          break e;
        case "textarea":
          qd(e, n.value, n.defaultValue);
          break e;
        case "select":
          t = n.value, t != null && _a(e, !!n.multiple, t, !1);
      }
    }
  }
  var zl = !1;
  function Kd(e, t, n) {
    if (zl) return e(t, n);
    zl = !0;
    try {
      var r = e(t);
      return r;
    } finally {
      if (zl = !1, (za !== null || Na !== null) && (vi(), za && (t = za, e = Na, Na = za = null, Pd(t), e)))
        for (t = 0; t < e.length; t++) Pd(e[t]);
    }
  }
  function hr(e, t) {
    var n = e.stateNode;
    if (n === null) return null;
    var r = n[ft] || null;
    if (r === null) return null;
    n = r[t];
    e: switch (t) {
      case "onClick":
      case "onClickCapture":
      case "onDoubleClick":
      case "onDoubleClickCapture":
      case "onMouseDown":
      case "onMouseDownCapture":
      case "onMouseMove":
      case "onMouseMoveCapture":
      case "onMouseUp":
      case "onMouseUpCapture":
      case "onMouseEnter":
        (r = !r.disabled) || (e = e.type, r = !(e === "button" || e === "input" || e === "select" || e === "textarea")), e = !r;
        break e;
      default:
        e = !1;
    }
    if (e) return null;
    if (n && typeof n != "function")
      throw Error(
        s(231, t, typeof n)
      );
    return n;
  }
  var nn = !(typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u"), Nl = !1;
  if (nn)
    try {
      var yr = {};
      Object.defineProperty(yr, "passive", {
        get: function() {
          Nl = !0;
        }
      }), window.addEventListener("test", yr, yr), window.removeEventListener("test", yr, yr);
    } catch {
      Nl = !1;
    }
  var jn = null, Tl = null, Co = null;
  function Zd() {
    if (Co) return Co;
    var e, t = Tl, n = t.length, r, l = "value" in jn ? jn.value : jn.textContent, c = l.length;
    for (e = 0; e < n && t[e] === l[e]; e++) ;
    var m = n - e;
    for (r = 1; r <= m && t[n - r] === l[c - r]; r++) ;
    return Co = l.slice(e, 1 < r ? 1 - r : void 0);
  }
  function Io(e) {
    var t = e.keyCode;
    return "charCode" in e ? (e = e.charCode, e === 0 && t === 13 && (e = 13)) : e = t, e === 10 && (e = 13), 32 <= e || e === 13 ? e : 0;
  }
  function Mo() {
    return !0;
  }
  function Qd() {
    return !1;
  }
  function pt(e) {
    function t(n, r, l, c, m) {
      this._reactName = n, this._targetInst = l, this.type = r, this.nativeEvent = c, this.target = m, this.currentTarget = null;
      for (var b in e)
        e.hasOwnProperty(b) && (n = e[b], this[b] = n ? n(c) : c[b]);
      return this.isDefaultPrevented = (c.defaultPrevented != null ? c.defaultPrevented : c.returnValue === !1) ? Mo : Qd, this.isPropagationStopped = Qd, this;
    }
    return O(t.prototype, {
      preventDefault: function() {
        this.defaultPrevented = !0;
        var n = this.nativeEvent;
        n && (n.preventDefault ? n.preventDefault() : typeof n.returnValue != "unknown" && (n.returnValue = !1), this.isDefaultPrevented = Mo);
      },
      stopPropagation: function() {
        var n = this.nativeEvent;
        n && (n.stopPropagation ? n.stopPropagation() : typeof n.cancelBubble != "unknown" && (n.cancelBubble = !0), this.isPropagationStopped = Mo);
      },
      persist: function() {
      },
      isPersistent: Mo
    }), t;
  }
  var na = {
    eventPhase: 0,
    bubbles: 0,
    cancelable: 0,
    timeStamp: function(e) {
      return e.timeStamp || Date.now();
    },
    defaultPrevented: 0,
    isTrusted: 0
  }, Do = pt(na), gr = O({}, na, { view: 0, detail: 0 }), gy = pt(gr), Rl, kl, vr, Uo = O({}, gr, {
    screenX: 0,
    screenY: 0,
    clientX: 0,
    clientY: 0,
    pageX: 0,
    pageY: 0,
    ctrlKey: 0,
    shiftKey: 0,
    altKey: 0,
    metaKey: 0,
    getModifierState: Il,
    button: 0,
    buttons: 0,
    relatedTarget: function(e) {
      return e.relatedTarget === void 0 ? e.fromElement === e.srcElement ? e.toElement : e.fromElement : e.relatedTarget;
    },
    movementX: function(e) {
      return "movementX" in e ? e.movementX : (e !== vr && (vr && e.type === "mousemove" ? (Rl = e.screenX - vr.screenX, kl = e.screenY - vr.screenY) : kl = Rl = 0, vr = e), Rl);
    },
    movementY: function(e) {
      return "movementY" in e ? e.movementY : kl;
    }
  }), Jd = pt(Uo), vy = O({}, Uo, { dataTransfer: 0 }), xy = pt(vy), wy = O({}, gr, { relatedTarget: 0 }), Cl = pt(wy), Sy = O({}, na, {
    animationName: 0,
    elapsedTime: 0,
    pseudoElement: 0
  }), jy = pt(Sy), Ey = O({}, na, {
    clipboardData: function(e) {
      return "clipboardData" in e ? e.clipboardData : window.clipboardData;
    }
  }), Ay = pt(Ey), _y = O({}, na, { data: 0 }), Wd = pt(_y), Oy = {
    Esc: "Escape",
    Spacebar: " ",
    Left: "ArrowLeft",
    Up: "ArrowUp",
    Right: "ArrowRight",
    Down: "ArrowDown",
    Del: "Delete",
    Win: "OS",
    Menu: "ContextMenu",
    Apps: "ContextMenu",
    Scroll: "ScrollLock",
    MozPrintableKey: "Unidentified"
  }, zy = {
    8: "Backspace",
    9: "Tab",
    12: "Clear",
    13: "Enter",
    16: "Shift",
    17: "Control",
    18: "Alt",
    19: "Pause",
    20: "CapsLock",
    27: "Escape",
    32: " ",
    33: "PageUp",
    34: "PageDown",
    35: "End",
    36: "Home",
    37: "ArrowLeft",
    38: "ArrowUp",
    39: "ArrowRight",
    40: "ArrowDown",
    45: "Insert",
    46: "Delete",
    112: "F1",
    113: "F2",
    114: "F3",
    115: "F4",
    116: "F5",
    117: "F6",
    118: "F7",
    119: "F8",
    120: "F9",
    121: "F10",
    122: "F11",
    123: "F12",
    144: "NumLock",
    145: "ScrollLock",
    224: "Meta"
  }, Ny = {
    Alt: "altKey",
    Control: "ctrlKey",
    Meta: "metaKey",
    Shift: "shiftKey"
  };
  function Ty(e) {
    var t = this.nativeEvent;
    return t.getModifierState ? t.getModifierState(e) : (e = Ny[e]) ? !!t[e] : !1;
  }
  function Il() {
    return Ty;
  }
  var Ry = O({}, gr, {
    key: function(e) {
      if (e.key) {
        var t = Oy[e.key] || e.key;
        if (t !== "Unidentified") return t;
      }
      return e.type === "keypress" ? (e = Io(e), e === 13 ? "Enter" : String.fromCharCode(e)) : e.type === "keydown" || e.type === "keyup" ? zy[e.keyCode] || "Unidentified" : "";
    },
    code: 0,
    location: 0,
    ctrlKey: 0,
    shiftKey: 0,
    altKey: 0,
    metaKey: 0,
    repeat: 0,
    locale: 0,
    getModifierState: Il,
    charCode: function(e) {
      return e.type === "keypress" ? Io(e) : 0;
    },
    keyCode: function(e) {
      return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
    },
    which: function(e) {
      return e.type === "keypress" ? Io(e) : e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
    }
  }), ky = pt(Ry), Cy = O({}, Uo, {
    pointerId: 0,
    width: 0,
    height: 0,
    pressure: 0,
    tangentialPressure: 0,
    tiltX: 0,
    tiltY: 0,
    twist: 0,
    pointerType: 0,
    isPrimary: 0
  }), eu = pt(Cy), Iy = O({}, gr, {
    touches: 0,
    targetTouches: 0,
    changedTouches: 0,
    altKey: 0,
    metaKey: 0,
    ctrlKey: 0,
    shiftKey: 0,
    getModifierState: Il
  }), My = pt(Iy), Dy = O({}, na, {
    propertyName: 0,
    elapsedTime: 0,
    pseudoElement: 0
  }), Uy = pt(Dy), Ly = O({}, Uo, {
    deltaX: function(e) {
      return "deltaX" in e ? e.deltaX : "wheelDeltaX" in e ? -e.wheelDeltaX : 0;
    },
    deltaY: function(e) {
      return "deltaY" in e ? e.deltaY : "wheelDeltaY" in e ? -e.wheelDeltaY : "wheelDelta" in e ? -e.wheelDelta : 0;
    },
    deltaZ: 0,
    deltaMode: 0
  }), Hy = pt(Ly), By = O({}, na, {
    newState: 0,
    oldState: 0
  }), Yy = pt(By), $y = [9, 13, 27, 32], Ml = nn && "CompositionEvent" in window, xr = null;
  nn && "documentMode" in document && (xr = document.documentMode);
  var Gy = nn && "TextEvent" in window && !xr, tu = nn && (!Ml || xr && 8 < xr && 11 >= xr), nu = " ", au = !1;
  function ru(e, t) {
    switch (e) {
      case "keyup":
        return $y.indexOf(t.keyCode) !== -1;
      case "keydown":
        return t.keyCode !== 229;
      case "keypress":
      case "mousedown":
      case "focusout":
        return !0;
      default:
        return !1;
    }
  }
  function ou(e) {
    return e = e.detail, typeof e == "object" && "data" in e ? e.data : null;
  }
  var Ta = !1;
  function qy(e, t) {
    switch (e) {
      case "compositionend":
        return ou(t);
      case "keypress":
        return t.which !== 32 ? null : (au = !0, nu);
      case "textInput":
        return e = t.data, e === nu && au ? null : e;
      default:
        return null;
    }
  }
  function Vy(e, t) {
    if (Ta)
      return e === "compositionend" || !Ml && ru(e, t) ? (e = Zd(), Co = Tl = jn = null, Ta = !1, e) : null;
    switch (e) {
      case "paste":
        return null;
      case "keypress":
        if (!(t.ctrlKey || t.altKey || t.metaKey) || t.ctrlKey && t.altKey) {
          if (t.char && 1 < t.char.length)
            return t.char;
          if (t.which) return String.fromCharCode(t.which);
        }
        return null;
      case "compositionend":
        return tu && t.locale !== "ko" ? null : t.data;
      default:
        return null;
    }
  }
  var Fy = {
    color: !0,
    date: !0,
    datetime: !0,
    "datetime-local": !0,
    email: !0,
    month: !0,
    number: !0,
    password: !0,
    range: !0,
    search: !0,
    tel: !0,
    text: !0,
    time: !0,
    url: !0,
    week: !0
  };
  function iu(e) {
    var t = e && e.nodeName && e.nodeName.toLowerCase();
    return t === "input" ? !!Fy[e.type] : t === "textarea";
  }
  function lu(e, t, n, r) {
    za ? Na ? Na.push(r) : Na = [r] : za = r, t = _i(t, "onChange"), 0 < t.length && (n = new Do(
      "onChange",
      "change",
      null,
      n,
      r
    ), e.push({ event: n, listeners: t }));
  }
  var wr = null, Sr = null;
  function Xy(e) {
    qf(e, 0);
  }
  function Lo(e) {
    var t = br(e);
    if ($d(t)) return e;
  }
  function su(e, t) {
    if (e === "change") return t;
  }
  var cu = !1;
  if (nn) {
    var Dl;
    if (nn) {
      var Ul = "oninput" in document;
      if (!Ul) {
        var du = document.createElement("div");
        du.setAttribute("oninput", "return;"), Ul = typeof du.oninput == "function";
      }
      Dl = Ul;
    } else Dl = !1;
    cu = Dl && (!document.documentMode || 9 < document.documentMode);
  }
  function uu() {
    wr && (wr.detachEvent("onpropertychange", mu), Sr = wr = null);
  }
  function mu(e) {
    if (e.propertyName === "value" && Lo(Sr)) {
      var t = [];
      lu(
        t,
        Sr,
        e,
        Ol(e)
      ), Kd(Xy, t);
    }
  }
  function Py(e, t, n) {
    e === "focusin" ? (uu(), wr = t, Sr = n, wr.attachEvent("onpropertychange", mu)) : e === "focusout" && uu();
  }
  function Ky(e) {
    if (e === "selectionchange" || e === "keyup" || e === "keydown")
      return Lo(Sr);
  }
  function Zy(e, t) {
    if (e === "click") return Lo(t);
  }
  function Qy(e, t) {
    if (e === "input" || e === "change")
      return Lo(t);
  }
  function Jy(e, t) {
    return e === t && (e !== 0 || 1 / e === 1 / t) || e !== e && t !== t;
  }
  var Et = typeof Object.is == "function" ? Object.is : Jy;
  function jr(e, t) {
    if (Et(e, t)) return !0;
    if (typeof e != "object" || e === null || typeof t != "object" || t === null)
      return !1;
    var n = Object.keys(e), r = Object.keys(t);
    if (n.length !== r.length) return !1;
    for (r = 0; r < n.length; r++) {
      var l = n[r];
      if (!pl.call(t, l) || !Et(e[l], t[l]))
        return !1;
    }
    return !0;
  }
  function fu(e) {
    for (; e && e.firstChild; ) e = e.firstChild;
    return e;
  }
  function pu(e, t) {
    var n = fu(e);
    e = 0;
    for (var r; n; ) {
      if (n.nodeType === 3) {
        if (r = e + n.textContent.length, e <= t && r >= t)
          return { node: n, offset: t - e };
        e = r;
      }
      e: {
        for (; n; ) {
          if (n.nextSibling) {
            n = n.nextSibling;
            break e;
          }
          n = n.parentNode;
        }
        n = void 0;
      }
      n = fu(n);
    }
  }
  function bu(e, t) {
    return e && t ? e === t ? !0 : e && e.nodeType === 3 ? !1 : t && t.nodeType === 3 ? bu(e, t.parentNode) : "contains" in e ? e.contains(t) : e.compareDocumentPosition ? !!(e.compareDocumentPosition(t) & 16) : !1 : !1;
  }
  function hu(e) {
    e = e != null && e.ownerDocument != null && e.ownerDocument.defaultView != null ? e.ownerDocument.defaultView : window;
    for (var t = Ro(e.document); t instanceof e.HTMLIFrameElement; ) {
      try {
        var n = typeof t.contentWindow.location.href == "string";
      } catch {
        n = !1;
      }
      if (n) e = t.contentWindow;
      else break;
      t = Ro(e.document);
    }
    return t;
  }
  function Ll(e) {
    var t = e && e.nodeName && e.nodeName.toLowerCase();
    return t && (t === "input" && (e.type === "text" || e.type === "search" || e.type === "tel" || e.type === "url" || e.type === "password") || t === "textarea" || e.contentEditable === "true");
  }
  var Wy = nn && "documentMode" in document && 11 >= document.documentMode, Ra = null, Hl = null, Er = null, Bl = !1;
  function yu(e, t, n) {
    var r = n.window === n ? n.document : n.nodeType === 9 ? n : n.ownerDocument;
    Bl || Ra == null || Ra !== Ro(r) || (r = Ra, "selectionStart" in r && Ll(r) ? r = { start: r.selectionStart, end: r.selectionEnd } : (r = (r.ownerDocument && r.ownerDocument.defaultView || window).getSelection(), r = {
      anchorNode: r.anchorNode,
      anchorOffset: r.anchorOffset,
      focusNode: r.focusNode,
      focusOffset: r.focusOffset
    }), Er && jr(Er, r) || (Er = r, r = _i(Hl, "onSelect"), 0 < r.length && (t = new Do(
      "onSelect",
      "select",
      null,
      t,
      n
    ), e.push({ event: t, listeners: r }), t.target = Ra)));
  }
  function aa(e, t) {
    var n = {};
    return n[e.toLowerCase()] = t.toLowerCase(), n["Webkit" + e] = "webkit" + t, n["Moz" + e] = "moz" + t, n;
  }
  var ka = {
    animationend: aa("Animation", "AnimationEnd"),
    animationiteration: aa("Animation", "AnimationIteration"),
    animationstart: aa("Animation", "AnimationStart"),
    transitionrun: aa("Transition", "TransitionRun"),
    transitionstart: aa("Transition", "TransitionStart"),
    transitioncancel: aa("Transition", "TransitionCancel"),
    transitionend: aa("Transition", "TransitionEnd")
  }, Yl = {}, gu = {};
  nn && (gu = document.createElement("div").style, "AnimationEvent" in window || (delete ka.animationend.animation, delete ka.animationiteration.animation, delete ka.animationstart.animation), "TransitionEvent" in window || delete ka.transitionend.transition);
  function ra(e) {
    if (Yl[e]) return Yl[e];
    if (!ka[e]) return e;
    var t = ka[e], n;
    for (n in t)
      if (t.hasOwnProperty(n) && n in gu)
        return Yl[e] = t[n];
    return e;
  }
  var vu = ra("animationend"), xu = ra("animationiteration"), wu = ra("animationstart"), eg = ra("transitionrun"), tg = ra("transitionstart"), ng = ra("transitioncancel"), Su = ra("transitionend"), ju = /* @__PURE__ */ new Map(), $l = "abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(
    " "
  );
  $l.push("scrollEnd");
  function $t(e, t) {
    ju.set(e, t), ta(t, [e]);
  }
  var Ho = typeof reportError == "function" ? reportError : function(e) {
    if (typeof window == "object" && typeof window.ErrorEvent == "function") {
      var t = new window.ErrorEvent("error", {
        bubbles: !0,
        cancelable: !0,
        message: typeof e == "object" && e !== null && typeof e.message == "string" ? String(e.message) : String(e),
        error: e
      });
      if (!window.dispatchEvent(t)) return;
    } else if (typeof process == "object" && typeof process.emit == "function") {
      process.emit("uncaughtException", e);
      return;
    }
    console.error(e);
  }, Ct = [], Ca = 0, Gl = 0;
  function Bo() {
    for (var e = Ca, t = Gl = Ca = 0; t < e; ) {
      var n = Ct[t];
      Ct[t++] = null;
      var r = Ct[t];
      Ct[t++] = null;
      var l = Ct[t];
      Ct[t++] = null;
      var c = Ct[t];
      if (Ct[t++] = null, r !== null && l !== null) {
        var m = r.pending;
        m === null ? l.next = l : (l.next = m.next, m.next = l), r.pending = l;
      }
      c !== 0 && Eu(n, l, c);
    }
  }
  function Yo(e, t, n, r) {
    Ct[Ca++] = e, Ct[Ca++] = t, Ct[Ca++] = n, Ct[Ca++] = r, Gl |= r, e.lanes |= r, e = e.alternate, e !== null && (e.lanes |= r);
  }
  function ql(e, t, n, r) {
    return Yo(e, t, n, r), $o(e);
  }
  function oa(e, t) {
    return Yo(e, null, null, t), $o(e);
  }
  function Eu(e, t, n) {
    e.lanes |= n;
    var r = e.alternate;
    r !== null && (r.lanes |= n);
    for (var l = !1, c = e.return; c !== null; )
      c.childLanes |= n, r = c.alternate, r !== null && (r.childLanes |= n), c.tag === 22 && (e = c.stateNode, e === null || e._visibility & 1 || (l = !0)), e = c, c = c.return;
    return e.tag === 3 ? (c = e.stateNode, l && t !== null && (l = 31 - jt(n), e = c.hiddenUpdates, r = e[l], r === null ? e[l] = [t] : r.push(t), t.lane = n | 536870912), c) : null;
  }
  function $o(e) {
    if (50 < Fr)
      throw Fr = 0, Ws = null, Error(s(185));
    for (var t = e.return; t !== null; )
      e = t, t = e.return;
    return e.tag === 3 ? e.stateNode : null;
  }
  var Ia = {};
  function ag(e, t, n, r) {
    this.tag = e, this.key = n, this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null, this.index = 0, this.refCleanup = this.ref = null, this.pendingProps = t, this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null, this.mode = r, this.subtreeFlags = this.flags = 0, this.deletions = null, this.childLanes = this.lanes = 0, this.alternate = null;
  }
  function At(e, t, n, r) {
    return new ag(e, t, n, r);
  }
  function Vl(e) {
    return e = e.prototype, !(!e || !e.isReactComponent);
  }
  function an(e, t) {
    var n = e.alternate;
    return n === null ? (n = At(
      e.tag,
      t,
      e.key,
      e.mode
    ), n.elementType = e.elementType, n.type = e.type, n.stateNode = e.stateNode, n.alternate = e, e.alternate = n) : (n.pendingProps = t, n.type = e.type, n.flags = 0, n.subtreeFlags = 0, n.deletions = null), n.flags = e.flags & 65011712, n.childLanes = e.childLanes, n.lanes = e.lanes, n.child = e.child, n.memoizedProps = e.memoizedProps, n.memoizedState = e.memoizedState, n.updateQueue = e.updateQueue, t = e.dependencies, n.dependencies = t === null ? null : { lanes: t.lanes, firstContext: t.firstContext }, n.sibling = e.sibling, n.index = e.index, n.ref = e.ref, n.refCleanup = e.refCleanup, n;
  }
  function Au(e, t) {
    e.flags &= 65011714;
    var n = e.alternate;
    return n === null ? (e.childLanes = 0, e.lanes = t, e.child = null, e.subtreeFlags = 0, e.memoizedProps = null, e.memoizedState = null, e.updateQueue = null, e.dependencies = null, e.stateNode = null) : (e.childLanes = n.childLanes, e.lanes = n.lanes, e.child = n.child, e.subtreeFlags = 0, e.deletions = null, e.memoizedProps = n.memoizedProps, e.memoizedState = n.memoizedState, e.updateQueue = n.updateQueue, e.type = n.type, t = n.dependencies, e.dependencies = t === null ? null : {
      lanes: t.lanes,
      firstContext: t.firstContext
    }), e;
  }
  function Go(e, t, n, r, l, c) {
    var m = 0;
    if (r = e, typeof e == "function") Vl(e) && (m = 1);
    else if (typeof e == "string")
      m = sv(
        e,
        n,
        F.current
      ) ? 26 : e === "html" || e === "head" || e === "body" ? 27 : 5;
    else
      e: switch (e) {
        case ot:
          return e = At(31, n, t, l), e.elementType = ot, e.lanes = c, e;
        case S:
          return ia(n.children, l, c, t);
        case H:
          m = 8, l |= 24;
          break;
        case W:
          return e = At(12, n, t, l | 2), e.elementType = W, e.lanes = c, e;
        case ue:
          return e = At(13, n, t, l), e.elementType = ue, e.lanes = c, e;
        case V:
          return e = At(19, n, t, l), e.elementType = V, e.lanes = c, e;
        default:
          if (typeof e == "object" && e !== null)
            switch (e.$$typeof) {
              case $:
                m = 10;
                break e;
              case pe:
                m = 9;
                break e;
              case re:
                m = 11;
                break e;
              case P:
                m = 14;
                break e;
              case _e:
                m = 16, r = null;
                break e;
            }
          m = 29, n = Error(
            s(130, e === null ? "null" : typeof e, "")
          ), r = null;
      }
    return t = At(m, n, t, l), t.elementType = e, t.type = r, t.lanes = c, t;
  }
  function ia(e, t, n, r) {
    return e = At(7, e, r, t), e.lanes = n, e;
  }
  function Fl(e, t, n) {
    return e = At(6, e, null, t), e.lanes = n, e;
  }
  function _u(e) {
    var t = At(18, null, null, 0);
    return t.stateNode = e, t;
  }
  function Xl(e, t, n) {
    return t = At(
      4,
      e.children !== null ? e.children : [],
      e.key,
      t
    ), t.lanes = n, t.stateNode = {
      containerInfo: e.containerInfo,
      pendingChildren: null,
      implementation: e.implementation
    }, t;
  }
  var Ou = /* @__PURE__ */ new WeakMap();
  function It(e, t) {
    if (typeof e == "object" && e !== null) {
      var n = Ou.get(e);
      return n !== void 0 ? n : (t = {
        value: e,
        source: t,
        stack: _d(t)
      }, Ou.set(e, t), t);
    }
    return {
      value: e,
      source: t,
      stack: _d(t)
    };
  }
  var Ma = [], Da = 0, qo = null, Ar = 0, Mt = [], Dt = 0, En = null, Xt = 1, Pt = "";
  function rn(e, t) {
    Ma[Da++] = Ar, Ma[Da++] = qo, qo = e, Ar = t;
  }
  function zu(e, t, n) {
    Mt[Dt++] = Xt, Mt[Dt++] = Pt, Mt[Dt++] = En, En = e;
    var r = Xt;
    e = Pt;
    var l = 32 - jt(r) - 1;
    r &= ~(1 << l), n += 1;
    var c = 32 - jt(t) + l;
    if (30 < c) {
      var m = l - l % 5;
      c = (r & (1 << m) - 1).toString(32), r >>= m, l -= m, Xt = 1 << 32 - jt(t) + l | n << l | r, Pt = c + e;
    } else
      Xt = 1 << c | n << l | r, Pt = e;
  }
  function Pl(e) {
    e.return !== null && (rn(e, 1), zu(e, 1, 0));
  }
  function Kl(e) {
    for (; e === qo; )
      qo = Ma[--Da], Ma[Da] = null, Ar = Ma[--Da], Ma[Da] = null;
    for (; e === En; )
      En = Mt[--Dt], Mt[Dt] = null, Pt = Mt[--Dt], Mt[Dt] = null, Xt = Mt[--Dt], Mt[Dt] = null;
  }
  function Nu(e, t) {
    Mt[Dt++] = Xt, Mt[Dt++] = Pt, Mt[Dt++] = En, Xt = t.id, Pt = t.overflow, En = e;
  }
  var tt = null, Re = null, me = !1, An = null, Ut = !1, Zl = Error(s(519));
  function _n(e) {
    var t = Error(
      s(
        418,
        1 < arguments.length && arguments[1] !== void 0 && arguments[1] ? "text" : "HTML",
        ""
      )
    );
    throw _r(It(t, e)), Zl;
  }
  function Tu(e) {
    var t = e.stateNode, n = e.type, r = e.memoizedProps;
    switch (t[et] = e, t[ft] = r, n) {
      case "dialog":
        se("cancel", t), se("close", t);
        break;
      case "iframe":
      case "object":
      case "embed":
        se("load", t);
        break;
      case "video":
      case "audio":
        for (n = 0; n < Pr.length; n++)
          se(Pr[n], t);
        break;
      case "source":
        se("error", t);
        break;
      case "img":
      case "image":
      case "link":
        se("error", t), se("load", t);
        break;
      case "details":
        se("toggle", t);
        break;
      case "input":
        se("invalid", t), Gd(
          t,
          r.value,
          r.defaultValue,
          r.checked,
          r.defaultChecked,
          r.type,
          r.name,
          !0
        );
        break;
      case "select":
        se("invalid", t);
        break;
      case "textarea":
        se("invalid", t), Vd(t, r.value, r.defaultValue, r.children);
    }
    n = r.children, typeof n != "string" && typeof n != "number" && typeof n != "bigint" || t.textContent === "" + n || r.suppressHydrationWarning === !0 || Pf(t.textContent, n) ? (r.popover != null && (se("beforetoggle", t), se("toggle", t)), r.onScroll != null && se("scroll", t), r.onScrollEnd != null && se("scrollend", t), r.onClick != null && (t.onclick = tn), t = !0) : t = !1, t || _n(e, !0);
  }
  function Ru(e) {
    for (tt = e.return; tt; )
      switch (tt.tag) {
        case 5:
        case 31:
        case 13:
          Ut = !1;
          return;
        case 27:
        case 3:
          Ut = !0;
          return;
        default:
          tt = tt.return;
      }
  }
  function Ua(e) {
    if (e !== tt) return !1;
    if (!me) return Ru(e), me = !0, !1;
    var t = e.tag, n;
    if ((n = t !== 3 && t !== 27) && ((n = t === 5) && (n = e.type, n = !(n !== "form" && n !== "button") || pc(e.type, e.memoizedProps)), n = !n), n && Re && _n(e), Ru(e), t === 13) {
      if (e = e.memoizedState, e = e !== null ? e.dehydrated : null, !e) throw Error(s(317));
      Re = ap(e);
    } else if (t === 31) {
      if (e = e.memoizedState, e = e !== null ? e.dehydrated : null, !e) throw Error(s(317));
      Re = ap(e);
    } else
      t === 27 ? (t = Re, Bn(e.type) ? (e = vc, vc = null, Re = e) : Re = t) : Re = tt ? Ht(e.stateNode.nextSibling) : null;
    return !0;
  }
  function la() {
    Re = tt = null, me = !1;
  }
  function Ql() {
    var e = An;
    return e !== null && (gt === null ? gt = e : gt.push.apply(
      gt,
      e
    ), An = null), e;
  }
  function _r(e) {
    An === null ? An = [e] : An.push(e);
  }
  var Jl = x(null), sa = null, on = null;
  function On(e, t, n) {
    Y(Jl, t._currentValue), t._currentValue = n;
  }
  function ln(e) {
    e._currentValue = Jl.current, T(Jl);
  }
  function Wl(e, t, n) {
    for (; e !== null; ) {
      var r = e.alternate;
      if ((e.childLanes & t) !== t ? (e.childLanes |= t, r !== null && (r.childLanes |= t)) : r !== null && (r.childLanes & t) !== t && (r.childLanes |= t), e === n) break;
      e = e.return;
    }
  }
  function es(e, t, n, r) {
    var l = e.child;
    for (l !== null && (l.return = e); l !== null; ) {
      var c = l.dependencies;
      if (c !== null) {
        var m = l.child;
        c = c.firstContext;
        e: for (; c !== null; ) {
          var b = c;
          c = l;
          for (var v = 0; v < t.length; v++)
            if (b.context === t[v]) {
              c.lanes |= n, b = c.alternate, b !== null && (b.lanes |= n), Wl(
                c.return,
                n,
                e
              ), r || (m = null);
              break e;
            }
          c = b.next;
        }
      } else if (l.tag === 18) {
        if (m = l.return, m === null) throw Error(s(341));
        m.lanes |= n, c = m.alternate, c !== null && (c.lanes |= n), Wl(m, n, e), m = null;
      } else m = l.child;
      if (m !== null) m.return = l;
      else
        for (m = l; m !== null; ) {
          if (m === e) {
            m = null;
            break;
          }
          if (l = m.sibling, l !== null) {
            l.return = m.return, m = l;
            break;
          }
          m = m.return;
        }
      l = m;
    }
  }
  function La(e, t, n, r) {
    e = null;
    for (var l = t, c = !1; l !== null; ) {
      if (!c) {
        if ((l.flags & 524288) !== 0) c = !0;
        else if ((l.flags & 262144) !== 0) break;
      }
      if (l.tag === 10) {
        var m = l.alternate;
        if (m === null) throw Error(s(387));
        if (m = m.memoizedProps, m !== null) {
          var b = l.type;
          Et(l.pendingProps.value, m.value) || (e !== null ? e.push(b) : e = [b]);
        }
      } else if (l === xe.current) {
        if (m = l.alternate, m === null) throw Error(s(387));
        m.memoizedState.memoizedState !== l.memoizedState.memoizedState && (e !== null ? e.push(Wr) : e = [Wr]);
      }
      l = l.return;
    }
    e !== null && es(
      t,
      e,
      n,
      r
    ), t.flags |= 262144;
  }
  function Vo(e) {
    for (e = e.firstContext; e !== null; ) {
      if (!Et(
        e.context._currentValue,
        e.memoizedValue
      ))
        return !0;
      e = e.next;
    }
    return !1;
  }
  function ca(e) {
    sa = e, on = null, e = e.dependencies, e !== null && (e.firstContext = null);
  }
  function nt(e) {
    return ku(sa, e);
  }
  function Fo(e, t) {
    return sa === null && ca(e), ku(e, t);
  }
  function ku(e, t) {
    var n = t._currentValue;
    if (t = { context: t, memoizedValue: n, next: null }, on === null) {
      if (e === null) throw Error(s(308));
      on = t, e.dependencies = { lanes: 0, firstContext: t }, e.flags |= 524288;
    } else on = on.next = t;
    return n;
  }
  var rg = typeof AbortController < "u" ? AbortController : function() {
    var e = [], t = this.signal = {
      aborted: !1,
      addEventListener: function(n, r) {
        e.push(r);
      }
    };
    this.abort = function() {
      t.aborted = !0, e.forEach(function(n) {
        return n();
      });
    };
  }, og = a.unstable_scheduleCallback, ig = a.unstable_NormalPriority, $e = {
    $$typeof: $,
    Consumer: null,
    Provider: null,
    _currentValue: null,
    _currentValue2: null,
    _threadCount: 0
  };
  function ts() {
    return {
      controller: new rg(),
      data: /* @__PURE__ */ new Map(),
      refCount: 0
    };
  }
  function Or(e) {
    e.refCount--, e.refCount === 0 && og(ig, function() {
      e.controller.abort();
    });
  }
  var zr = null, ns = 0, Ha = 0, Ba = null;
  function lg(e, t) {
    if (zr === null) {
      var n = zr = [];
      ns = 0, Ha = oc(), Ba = {
        status: "pending",
        value: void 0,
        then: function(r) {
          n.push(r);
        }
      };
    }
    return ns++, t.then(Cu, Cu), t;
  }
  function Cu() {
    if (--ns === 0 && zr !== null) {
      Ba !== null && (Ba.status = "fulfilled");
      var e = zr;
      zr = null, Ha = 0, Ba = null;
      for (var t = 0; t < e.length; t++) (0, e[t])();
    }
  }
  function sg(e, t) {
    var n = [], r = {
      status: "pending",
      value: null,
      reason: null,
      then: function(l) {
        n.push(l);
      }
    };
    return e.then(
      function() {
        r.status = "fulfilled", r.value = t;
        for (var l = 0; l < n.length; l++) (0, n[l])(t);
      },
      function(l) {
        for (r.status = "rejected", r.reason = l, l = 0; l < n.length; l++)
          (0, n[l])(void 0);
      }
    ), r;
  }
  var Iu = C.S;
  C.S = function(e, t) {
    gf = wt(), typeof t == "object" && t !== null && typeof t.then == "function" && lg(e, t), Iu !== null && Iu(e, t);
  };
  var da = x(null);
  function as() {
    var e = da.current;
    return e !== null ? e : Oe.pooledCache;
  }
  function Xo(e, t) {
    t === null ? Y(da, da.current) : Y(da, t.pool);
  }
  function Mu() {
    var e = as();
    return e === null ? null : { parent: $e._currentValue, pool: e };
  }
  var Ya = Error(s(460)), rs = Error(s(474)), Po = Error(s(542)), Ko = { then: function() {
  } };
  function Du(e) {
    return e = e.status, e === "fulfilled" || e === "rejected";
  }
  function Uu(e, t, n) {
    switch (n = e[n], n === void 0 ? e.push(t) : n !== t && (t.then(tn, tn), t = n), t.status) {
      case "fulfilled":
        return t.value;
      case "rejected":
        throw e = t.reason, Hu(e), e;
      default:
        if (typeof t.status == "string") t.then(tn, tn);
        else {
          if (e = Oe, e !== null && 100 < e.shellSuspendCounter)
            throw Error(s(482));
          e = t, e.status = "pending", e.then(
            function(r) {
              if (t.status === "pending") {
                var l = t;
                l.status = "fulfilled", l.value = r;
              }
            },
            function(r) {
              if (t.status === "pending") {
                var l = t;
                l.status = "rejected", l.reason = r;
              }
            }
          );
        }
        switch (t.status) {
          case "fulfilled":
            return t.value;
          case "rejected":
            throw e = t.reason, Hu(e), e;
        }
        throw ma = t, Ya;
    }
  }
  function ua(e) {
    try {
      var t = e._init;
      return t(e._payload);
    } catch (n) {
      throw n !== null && typeof n == "object" && typeof n.then == "function" ? (ma = n, Ya) : n;
    }
  }
  var ma = null;
  function Lu() {
    if (ma === null) throw Error(s(459));
    var e = ma;
    return ma = null, e;
  }
  function Hu(e) {
    if (e === Ya || e === Po)
      throw Error(s(483));
  }
  var $a = null, Nr = 0;
  function Zo(e) {
    var t = Nr;
    return Nr += 1, $a === null && ($a = []), Uu($a, e, t);
  }
  function Tr(e, t) {
    t = t.props.ref, e.ref = t !== void 0 ? t : null;
  }
  function Qo(e, t) {
    throw t.$$typeof === z ? Error(s(525)) : (e = Object.prototype.toString.call(t), Error(
      s(
        31,
        e === "[object Object]" ? "object with keys {" + Object.keys(t).join(", ") + "}" : e
      )
    ));
  }
  function Bu(e) {
    function t(j, w) {
      if (e) {
        var A = j.deletions;
        A === null ? (j.deletions = [w], j.flags |= 16) : A.push(w);
      }
    }
    function n(j, w) {
      if (!e) return null;
      for (; w !== null; )
        t(j, w), w = w.sibling;
      return null;
    }
    function r(j) {
      for (var w = /* @__PURE__ */ new Map(); j !== null; )
        j.key !== null ? w.set(j.key, j) : w.set(j.index, j), j = j.sibling;
      return w;
    }
    function l(j, w) {
      return j = an(j, w), j.index = 0, j.sibling = null, j;
    }
    function c(j, w, A) {
      return j.index = A, e ? (A = j.alternate, A !== null ? (A = A.index, A < w ? (j.flags |= 67108866, w) : A) : (j.flags |= 67108866, w)) : (j.flags |= 1048576, w);
    }
    function m(j) {
      return e && j.alternate === null && (j.flags |= 67108866), j;
    }
    function b(j, w, A, M) {
      return w === null || w.tag !== 6 ? (w = Fl(A, j.mode, M), w.return = j, w) : (w = l(w, A), w.return = j, w);
    }
    function v(j, w, A, M) {
      var Z = A.type;
      return Z === S ? I(
        j,
        w,
        A.props.children,
        M,
        A.key
      ) : w !== null && (w.elementType === Z || typeof Z == "object" && Z !== null && Z.$$typeof === _e && ua(Z) === w.type) ? (w = l(w, A.props), Tr(w, A), w.return = j, w) : (w = Go(
        A.type,
        A.key,
        A.props,
        null,
        j.mode,
        M
      ), Tr(w, A), w.return = j, w);
    }
    function _(j, w, A, M) {
      return w === null || w.tag !== 4 || w.stateNode.containerInfo !== A.containerInfo || w.stateNode.implementation !== A.implementation ? (w = Xl(A, j.mode, M), w.return = j, w) : (w = l(w, A.children || []), w.return = j, w);
    }
    function I(j, w, A, M, Z) {
      return w === null || w.tag !== 7 ? (w = ia(
        A,
        j.mode,
        M,
        Z
      ), w.return = j, w) : (w = l(w, A), w.return = j, w);
    }
    function L(j, w, A) {
      if (typeof w == "string" && w !== "" || typeof w == "number" || typeof w == "bigint")
        return w = Fl(
          "" + w,
          j.mode,
          A
        ), w.return = j, w;
      if (typeof w == "object" && w !== null) {
        switch (w.$$typeof) {
          case D:
            return A = Go(
              w.type,
              w.key,
              w.props,
              null,
              j.mode,
              A
            ), Tr(A, w), A.return = j, A;
          case R:
            return w = Xl(
              w,
              j.mode,
              A
            ), w.return = j, w;
          case _e:
            return w = ua(w), L(j, w, A);
        }
        if (Ke(w) || Te(w))
          return w = ia(
            w,
            j.mode,
            A,
            null
          ), w.return = j, w;
        if (typeof w.then == "function")
          return L(j, Zo(w), A);
        if (w.$$typeof === $)
          return L(
            j,
            Fo(j, w),
            A
          );
        Qo(j, w);
      }
      return null;
    }
    function N(j, w, A, M) {
      var Z = w !== null ? w.key : null;
      if (typeof A == "string" && A !== "" || typeof A == "number" || typeof A == "bigint")
        return Z !== null ? null : b(j, w, "" + A, M);
      if (typeof A == "object" && A !== null) {
        switch (A.$$typeof) {
          case D:
            return A.key === Z ? v(j, w, A, M) : null;
          case R:
            return A.key === Z ? _(j, w, A, M) : null;
          case _e:
            return A = ua(A), N(j, w, A, M);
        }
        if (Ke(A) || Te(A))
          return Z !== null ? null : I(j, w, A, M, null);
        if (typeof A.then == "function")
          return N(
            j,
            w,
            Zo(A),
            M
          );
        if (A.$$typeof === $)
          return N(
            j,
            w,
            Fo(j, A),
            M
          );
        Qo(j, A);
      }
      return null;
    }
    function k(j, w, A, M, Z) {
      if (typeof M == "string" && M !== "" || typeof M == "number" || typeof M == "bigint")
        return j = j.get(A) || null, b(w, j, "" + M, Z);
      if (typeof M == "object" && M !== null) {
        switch (M.$$typeof) {
          case D:
            return j = j.get(
              M.key === null ? A : M.key
            ) || null, v(w, j, M, Z);
          case R:
            return j = j.get(
              M.key === null ? A : M.key
            ) || null, _(w, j, M, Z);
          case _e:
            return M = ua(M), k(
              j,
              w,
              A,
              M,
              Z
            );
        }
        if (Ke(M) || Te(M))
          return j = j.get(A) || null, I(w, j, M, Z, null);
        if (typeof M.then == "function")
          return k(
            j,
            w,
            A,
            Zo(M),
            Z
          );
        if (M.$$typeof === $)
          return k(
            j,
            w,
            A,
            Fo(w, M),
            Z
          );
        Qo(w, M);
      }
      return null;
    }
    function G(j, w, A, M) {
      for (var Z = null, he = null, X = w, ae = w = 0, de = null; X !== null && ae < A.length; ae++) {
        X.index > ae ? (de = X, X = null) : de = X.sibling;
        var ye = N(
          j,
          X,
          A[ae],
          M
        );
        if (ye === null) {
          X === null && (X = de);
          break;
        }
        e && X && ye.alternate === null && t(j, X), w = c(ye, w, ae), he === null ? Z = ye : he.sibling = ye, he = ye, X = de;
      }
      if (ae === A.length)
        return n(j, X), me && rn(j, ae), Z;
      if (X === null) {
        for (; ae < A.length; ae++)
          X = L(j, A[ae], M), X !== null && (w = c(
            X,
            w,
            ae
          ), he === null ? Z = X : he.sibling = X, he = X);
        return me && rn(j, ae), Z;
      }
      for (X = r(X); ae < A.length; ae++)
        de = k(
          X,
          j,
          ae,
          A[ae],
          M
        ), de !== null && (e && de.alternate !== null && X.delete(
          de.key === null ? ae : de.key
        ), w = c(
          de,
          w,
          ae
        ), he === null ? Z = de : he.sibling = de, he = de);
      return e && X.forEach(function(Vn) {
        return t(j, Vn);
      }), me && rn(j, ae), Z;
    }
    function Q(j, w, A, M) {
      if (A == null) throw Error(s(151));
      for (var Z = null, he = null, X = w, ae = w = 0, de = null, ye = A.next(); X !== null && !ye.done; ae++, ye = A.next()) {
        X.index > ae ? (de = X, X = null) : de = X.sibling;
        var Vn = N(j, X, ye.value, M);
        if (Vn === null) {
          X === null && (X = de);
          break;
        }
        e && X && Vn.alternate === null && t(j, X), w = c(Vn, w, ae), he === null ? Z = Vn : he.sibling = Vn, he = Vn, X = de;
      }
      if (ye.done)
        return n(j, X), me && rn(j, ae), Z;
      if (X === null) {
        for (; !ye.done; ae++, ye = A.next())
          ye = L(j, ye.value, M), ye !== null && (w = c(ye, w, ae), he === null ? Z = ye : he.sibling = ye, he = ye);
        return me && rn(j, ae), Z;
      }
      for (X = r(X); !ye.done; ae++, ye = A.next())
        ye = k(X, j, ae, ye.value, M), ye !== null && (e && ye.alternate !== null && X.delete(ye.key === null ? ae : ye.key), w = c(ye, w, ae), he === null ? Z = ye : he.sibling = ye, he = ye);
      return e && X.forEach(function(vv) {
        return t(j, vv);
      }), me && rn(j, ae), Z;
    }
    function Ae(j, w, A, M) {
      if (typeof A == "object" && A !== null && A.type === S && A.key === null && (A = A.props.children), typeof A == "object" && A !== null) {
        switch (A.$$typeof) {
          case D:
            e: {
              for (var Z = A.key; w !== null; ) {
                if (w.key === Z) {
                  if (Z = A.type, Z === S) {
                    if (w.tag === 7) {
                      n(
                        j,
                        w.sibling
                      ), M = l(
                        w,
                        A.props.children
                      ), M.return = j, j = M;
                      break e;
                    }
                  } else if (w.elementType === Z || typeof Z == "object" && Z !== null && Z.$$typeof === _e && ua(Z) === w.type) {
                    n(
                      j,
                      w.sibling
                    ), M = l(w, A.props), Tr(M, A), M.return = j, j = M;
                    break e;
                  }
                  n(j, w);
                  break;
                } else t(j, w);
                w = w.sibling;
              }
              A.type === S ? (M = ia(
                A.props.children,
                j.mode,
                M,
                A.key
              ), M.return = j, j = M) : (M = Go(
                A.type,
                A.key,
                A.props,
                null,
                j.mode,
                M
              ), Tr(M, A), M.return = j, j = M);
            }
            return m(j);
          case R:
            e: {
              for (Z = A.key; w !== null; ) {
                if (w.key === Z)
                  if (w.tag === 4 && w.stateNode.containerInfo === A.containerInfo && w.stateNode.implementation === A.implementation) {
                    n(
                      j,
                      w.sibling
                    ), M = l(w, A.children || []), M.return = j, j = M;
                    break e;
                  } else {
                    n(j, w);
                    break;
                  }
                else t(j, w);
                w = w.sibling;
              }
              M = Xl(A, j.mode, M), M.return = j, j = M;
            }
            return m(j);
          case _e:
            return A = ua(A), Ae(
              j,
              w,
              A,
              M
            );
        }
        if (Ke(A))
          return G(
            j,
            w,
            A,
            M
          );
        if (Te(A)) {
          if (Z = Te(A), typeof Z != "function") throw Error(s(150));
          return A = Z.call(A), Q(
            j,
            w,
            A,
            M
          );
        }
        if (typeof A.then == "function")
          return Ae(
            j,
            w,
            Zo(A),
            M
          );
        if (A.$$typeof === $)
          return Ae(
            j,
            w,
            Fo(j, A),
            M
          );
        Qo(j, A);
      }
      return typeof A == "string" && A !== "" || typeof A == "number" || typeof A == "bigint" ? (A = "" + A, w !== null && w.tag === 6 ? (n(j, w.sibling), M = l(w, A), M.return = j, j = M) : (n(j, w), M = Fl(A, j.mode, M), M.return = j, j = M), m(j)) : n(j, w);
    }
    return function(j, w, A, M) {
      try {
        Nr = 0;
        var Z = Ae(
          j,
          w,
          A,
          M
        );
        return $a = null, Z;
      } catch (X) {
        if (X === Ya || X === Po) throw X;
        var he = At(29, X, null, j.mode);
        return he.lanes = M, he.return = j, he;
      } finally {
      }
    };
  }
  var fa = Bu(!0), Yu = Bu(!1), zn = !1;
  function os(e) {
    e.updateQueue = {
      baseState: e.memoizedState,
      firstBaseUpdate: null,
      lastBaseUpdate: null,
      shared: { pending: null, lanes: 0, hiddenCallbacks: null },
      callbacks: null
    };
  }
  function is(e, t) {
    e = e.updateQueue, t.updateQueue === e && (t.updateQueue = {
      baseState: e.baseState,
      firstBaseUpdate: e.firstBaseUpdate,
      lastBaseUpdate: e.lastBaseUpdate,
      shared: e.shared,
      callbacks: null
    });
  }
  function Nn(e) {
    return { lane: e, tag: 0, payload: null, callback: null, next: null };
  }
  function Tn(e, t, n) {
    var r = e.updateQueue;
    if (r === null) return null;
    if (r = r.shared, (ve & 2) !== 0) {
      var l = r.pending;
      return l === null ? t.next = t : (t.next = l.next, l.next = t), r.pending = t, t = $o(e), Eu(e, null, n), t;
    }
    return Yo(e, r, t, n), $o(e);
  }
  function Rr(e, t, n) {
    if (t = t.updateQueue, t !== null && (t = t.shared, (n & 4194048) !== 0)) {
      var r = t.lanes;
      r &= e.pendingLanes, n |= r, t.lanes = n, kd(e, n);
    }
  }
  function ls(e, t) {
    var n = e.updateQueue, r = e.alternate;
    if (r !== null && (r = r.updateQueue, n === r)) {
      var l = null, c = null;
      if (n = n.firstBaseUpdate, n !== null) {
        do {
          var m = {
            lane: n.lane,
            tag: n.tag,
            payload: n.payload,
            callback: null,
            next: null
          };
          c === null ? l = c = m : c = c.next = m, n = n.next;
        } while (n !== null);
        c === null ? l = c = t : c = c.next = t;
      } else l = c = t;
      n = {
        baseState: r.baseState,
        firstBaseUpdate: l,
        lastBaseUpdate: c,
        shared: r.shared,
        callbacks: r.callbacks
      }, e.updateQueue = n;
      return;
    }
    e = n.lastBaseUpdate, e === null ? n.firstBaseUpdate = t : e.next = t, n.lastBaseUpdate = t;
  }
  var ss = !1;
  function kr() {
    if (ss) {
      var e = Ba;
      if (e !== null) throw e;
    }
  }
  function Cr(e, t, n, r) {
    ss = !1;
    var l = e.updateQueue;
    zn = !1;
    var c = l.firstBaseUpdate, m = l.lastBaseUpdate, b = l.shared.pending;
    if (b !== null) {
      l.shared.pending = null;
      var v = b, _ = v.next;
      v.next = null, m === null ? c = _ : m.next = _, m = v;
      var I = e.alternate;
      I !== null && (I = I.updateQueue, b = I.lastBaseUpdate, b !== m && (b === null ? I.firstBaseUpdate = _ : b.next = _, I.lastBaseUpdate = v));
    }
    if (c !== null) {
      var L = l.baseState;
      m = 0, I = _ = v = null, b = c;
      do {
        var N = b.lane & -536870913, k = N !== b.lane;
        if (k ? (ce & N) === N : (r & N) === N) {
          N !== 0 && N === Ha && (ss = !0), I !== null && (I = I.next = {
            lane: 0,
            tag: b.tag,
            payload: b.payload,
            callback: null,
            next: null
          });
          e: {
            var G = e, Q = b;
            N = t;
            var Ae = n;
            switch (Q.tag) {
              case 1:
                if (G = Q.payload, typeof G == "function") {
                  L = G.call(Ae, L, N);
                  break e;
                }
                L = G;
                break e;
              case 3:
                G.flags = G.flags & -65537 | 128;
              case 0:
                if (G = Q.payload, N = typeof G == "function" ? G.call(Ae, L, N) : G, N == null) break e;
                L = O({}, L, N);
                break e;
              case 2:
                zn = !0;
            }
          }
          N = b.callback, N !== null && (e.flags |= 64, k && (e.flags |= 8192), k = l.callbacks, k === null ? l.callbacks = [N] : k.push(N));
        } else
          k = {
            lane: N,
            tag: b.tag,
            payload: b.payload,
            callback: b.callback,
            next: null
          }, I === null ? (_ = I = k, v = L) : I = I.next = k, m |= N;
        if (b = b.next, b === null) {
          if (b = l.shared.pending, b === null)
            break;
          k = b, b = k.next, k.next = null, l.lastBaseUpdate = k, l.shared.pending = null;
        }
      } while (!0);
      I === null && (v = L), l.baseState = v, l.firstBaseUpdate = _, l.lastBaseUpdate = I, c === null && (l.shared.lanes = 0), Mn |= m, e.lanes = m, e.memoizedState = L;
    }
  }
  function $u(e, t) {
    if (typeof e != "function")
      throw Error(s(191, e));
    e.call(t);
  }
  function Gu(e, t) {
    var n = e.callbacks;
    if (n !== null)
      for (e.callbacks = null, e = 0; e < n.length; e++)
        $u(n[e], t);
  }
  var Ga = x(null), Jo = x(0);
  function qu(e, t) {
    e = hn, Y(Jo, e), Y(Ga, t), hn = e | t.baseLanes;
  }
  function cs() {
    Y(Jo, hn), Y(Ga, Ga.current);
  }
  function ds() {
    hn = Jo.current, T(Ga), T(Jo);
  }
  var _t = x(null), Lt = null;
  function Rn(e) {
    var t = e.alternate;
    Y(He, He.current & 1), Y(_t, e), Lt === null && (t === null || Ga.current !== null || t.memoizedState !== null) && (Lt = e);
  }
  function us(e) {
    Y(He, He.current), Y(_t, e), Lt === null && (Lt = e);
  }
  function Vu(e) {
    e.tag === 22 ? (Y(He, He.current), Y(_t, e), Lt === null && (Lt = e)) : kn();
  }
  function kn() {
    Y(He, He.current), Y(_t, _t.current);
  }
  function Ot(e) {
    T(_t), Lt === e && (Lt = null), T(He);
  }
  var He = x(0);
  function Wo(e) {
    for (var t = e; t !== null; ) {
      if (t.tag === 13) {
        var n = t.memoizedState;
        if (n !== null && (n = n.dehydrated, n === null || yc(n) || gc(n)))
          return t;
      } else if (t.tag === 19 && (t.memoizedProps.revealOrder === "forwards" || t.memoizedProps.revealOrder === "backwards" || t.memoizedProps.revealOrder === "unstable_legacy-backwards" || t.memoizedProps.revealOrder === "together")) {
        if ((t.flags & 128) !== 0) return t;
      } else if (t.child !== null) {
        t.child.return = t, t = t.child;
        continue;
      }
      if (t === e) break;
      for (; t.sibling === null; ) {
        if (t.return === null || t.return === e) return null;
        t = t.return;
      }
      t.sibling.return = t.return, t = t.sibling;
    }
    return null;
  }
  var sn = 0, ne = null, je = null, Ge = null, ei = !1, qa = !1, pa = !1, ti = 0, Ir = 0, Va = null, cg = 0;
  function Me() {
    throw Error(s(321));
  }
  function ms(e, t) {
    if (t === null) return !1;
    for (var n = 0; n < t.length && n < e.length; n++)
      if (!Et(e[n], t[n])) return !1;
    return !0;
  }
  function fs(e, t, n, r, l, c) {
    return sn = c, ne = t, t.memoizedState = null, t.updateQueue = null, t.lanes = 0, C.H = e === null || e.memoizedState === null ? zm : zs, pa = !1, c = n(r, l), pa = !1, qa && (c = Xu(
      t,
      n,
      r,
      l
    )), Fu(e), c;
  }
  function Fu(e) {
    C.H = Ur;
    var t = je !== null && je.next !== null;
    if (sn = 0, Ge = je = ne = null, ei = !1, Ir = 0, Va = null, t) throw Error(s(300));
    e === null || qe || (e = e.dependencies, e !== null && Vo(e) && (qe = !0));
  }
  function Xu(e, t, n, r) {
    ne = e;
    var l = 0;
    do {
      if (qa && (Va = null), Ir = 0, qa = !1, 25 <= l) throw Error(s(301));
      if (l += 1, Ge = je = null, e.updateQueue != null) {
        var c = e.updateQueue;
        c.lastEffect = null, c.events = null, c.stores = null, c.memoCache != null && (c.memoCache.index = 0);
      }
      C.H = Nm, c = t(n, r);
    } while (qa);
    return c;
  }
  function dg() {
    var e = C.H, t = e.useState()[0];
    return t = typeof t.then == "function" ? Mr(t) : t, e = e.useState()[0], (je !== null ? je.memoizedState : null) !== e && (ne.flags |= 1024), t;
  }
  function ps() {
    var e = ti !== 0;
    return ti = 0, e;
  }
  function bs(e, t, n) {
    t.updateQueue = e.updateQueue, t.flags &= -2053, e.lanes &= ~n;
  }
  function hs(e) {
    if (ei) {
      for (e = e.memoizedState; e !== null; ) {
        var t = e.queue;
        t !== null && (t.pending = null), e = e.next;
      }
      ei = !1;
    }
    sn = 0, Ge = je = ne = null, qa = !1, Ir = ti = 0, Va = null;
  }
  function mt() {
    var e = {
      memoizedState: null,
      baseState: null,
      baseQueue: null,
      queue: null,
      next: null
    };
    return Ge === null ? ne.memoizedState = Ge = e : Ge = Ge.next = e, Ge;
  }
  function Be() {
    if (je === null) {
      var e = ne.alternate;
      e = e !== null ? e.memoizedState : null;
    } else e = je.next;
    var t = Ge === null ? ne.memoizedState : Ge.next;
    if (t !== null)
      Ge = t, je = e;
    else {
      if (e === null)
        throw ne.alternate === null ? Error(s(467)) : Error(s(310));
      je = e, e = {
        memoizedState: je.memoizedState,
        baseState: je.baseState,
        baseQueue: je.baseQueue,
        queue: je.queue,
        next: null
      }, Ge === null ? ne.memoizedState = Ge = e : Ge = Ge.next = e;
    }
    return Ge;
  }
  function ni() {
    return { lastEffect: null, events: null, stores: null, memoCache: null };
  }
  function Mr(e) {
    var t = Ir;
    return Ir += 1, Va === null && (Va = []), e = Uu(Va, e, t), t = ne, (Ge === null ? t.memoizedState : Ge.next) === null && (t = t.alternate, C.H = t === null || t.memoizedState === null ? zm : zs), e;
  }
  function ai(e) {
    if (e !== null && typeof e == "object") {
      if (typeof e.then == "function") return Mr(e);
      if (e.$$typeof === $) return nt(e);
    }
    throw Error(s(438, String(e)));
  }
  function ys(e) {
    var t = null, n = ne.updateQueue;
    if (n !== null && (t = n.memoCache), t == null) {
      var r = ne.alternate;
      r !== null && (r = r.updateQueue, r !== null && (r = r.memoCache, r != null && (t = {
        data: r.data.map(function(l) {
          return l.slice();
        }),
        index: 0
      })));
    }
    if (t == null && (t = { data: [], index: 0 }), n === null && (n = ni(), ne.updateQueue = n), n.memoCache = t, n = t.data[t.index], n === void 0)
      for (n = t.data[t.index] = Array(e), r = 0; r < e; r++)
        n[r] = We;
    return t.index++, n;
  }
  function cn(e, t) {
    return typeof t == "function" ? t(e) : t;
  }
  function ri(e) {
    var t = Be();
    return gs(t, je, e);
  }
  function gs(e, t, n) {
    var r = e.queue;
    if (r === null) throw Error(s(311));
    r.lastRenderedReducer = n;
    var l = e.baseQueue, c = r.pending;
    if (c !== null) {
      if (l !== null) {
        var m = l.next;
        l.next = c.next, c.next = m;
      }
      t.baseQueue = l = c, r.pending = null;
    }
    if (c = e.baseState, l === null) e.memoizedState = c;
    else {
      t = l.next;
      var b = m = null, v = null, _ = t, I = !1;
      do {
        var L = _.lane & -536870913;
        if (L !== _.lane ? (ce & L) === L : (sn & L) === L) {
          var N = _.revertLane;
          if (N === 0)
            v !== null && (v = v.next = {
              lane: 0,
              revertLane: 0,
              gesture: null,
              action: _.action,
              hasEagerState: _.hasEagerState,
              eagerState: _.eagerState,
              next: null
            }), L === Ha && (I = !0);
          else if ((sn & N) === N) {
            _ = _.next, N === Ha && (I = !0);
            continue;
          } else
            L = {
              lane: 0,
              revertLane: _.revertLane,
              gesture: null,
              action: _.action,
              hasEagerState: _.hasEagerState,
              eagerState: _.eagerState,
              next: null
            }, v === null ? (b = v = L, m = c) : v = v.next = L, ne.lanes |= N, Mn |= N;
          L = _.action, pa && n(c, L), c = _.hasEagerState ? _.eagerState : n(c, L);
        } else
          N = {
            lane: L,
            revertLane: _.revertLane,
            gesture: _.gesture,
            action: _.action,
            hasEagerState: _.hasEagerState,
            eagerState: _.eagerState,
            next: null
          }, v === null ? (b = v = N, m = c) : v = v.next = N, ne.lanes |= L, Mn |= L;
        _ = _.next;
      } while (_ !== null && _ !== t);
      if (v === null ? m = c : v.next = b, !Et(c, e.memoizedState) && (qe = !0, I && (n = Ba, n !== null)))
        throw n;
      e.memoizedState = c, e.baseState = m, e.baseQueue = v, r.lastRenderedState = c;
    }
    return l === null && (r.lanes = 0), [e.memoizedState, r.dispatch];
  }
  function vs(e) {
    var t = Be(), n = t.queue;
    if (n === null) throw Error(s(311));
    n.lastRenderedReducer = e;
    var r = n.dispatch, l = n.pending, c = t.memoizedState;
    if (l !== null) {
      n.pending = null;
      var m = l = l.next;
      do
        c = e(c, m.action), m = m.next;
      while (m !== l);
      Et(c, t.memoizedState) || (qe = !0), t.memoizedState = c, t.baseQueue === null && (t.baseState = c), n.lastRenderedState = c;
    }
    return [c, r];
  }
  function Pu(e, t, n) {
    var r = ne, l = Be(), c = me;
    if (c) {
      if (n === void 0) throw Error(s(407));
      n = n();
    } else n = t();
    var m = !Et(
      (je || l).memoizedState,
      n
    );
    if (m && (l.memoizedState = n, qe = !0), l = l.queue, Ss(Qu.bind(null, r, l, e), [
      e
    ]), l.getSnapshot !== t || m || Ge !== null && Ge.memoizedState.tag & 1) {
      if (r.flags |= 2048, Fa(
        9,
        { destroy: void 0 },
        Zu.bind(
          null,
          r,
          l,
          n,
          t
        ),
        null
      ), Oe === null) throw Error(s(349));
      c || (sn & 127) !== 0 || Ku(r, t, n);
    }
    return n;
  }
  function Ku(e, t, n) {
    e.flags |= 16384, e = { getSnapshot: t, value: n }, t = ne.updateQueue, t === null ? (t = ni(), ne.updateQueue = t, t.stores = [e]) : (n = t.stores, n === null ? t.stores = [e] : n.push(e));
  }
  function Zu(e, t, n, r) {
    t.value = n, t.getSnapshot = r, Ju(t) && Wu(e);
  }
  function Qu(e, t, n) {
    return n(function() {
      Ju(t) && Wu(e);
    });
  }
  function Ju(e) {
    var t = e.getSnapshot;
    e = e.value;
    try {
      var n = t();
      return !Et(e, n);
    } catch {
      return !0;
    }
  }
  function Wu(e) {
    var t = oa(e, 2);
    t !== null && vt(t, e, 2);
  }
  function xs(e) {
    var t = mt();
    if (typeof e == "function") {
      var n = e;
      if (e = n(), pa) {
        wn(!0);
        try {
          n();
        } finally {
          wn(!1);
        }
      }
    }
    return t.memoizedState = t.baseState = e, t.queue = {
      pending: null,
      lanes: 0,
      dispatch: null,
      lastRenderedReducer: cn,
      lastRenderedState: e
    }, t;
  }
  function em(e, t, n, r) {
    return e.baseState = n, gs(
      e,
      je,
      typeof r == "function" ? r : cn
    );
  }
  function ug(e, t, n, r, l) {
    if (li(e)) throw Error(s(485));
    if (e = t.action, e !== null) {
      var c = {
        payload: l,
        action: e,
        next: null,
        isTransition: !0,
        status: "pending",
        value: null,
        reason: null,
        listeners: [],
        then: function(m) {
          c.listeners.push(m);
        }
      };
      C.T !== null ? n(!0) : c.isTransition = !1, r(c), n = t.pending, n === null ? (c.next = t.pending = c, tm(t, c)) : (c.next = n.next, t.pending = n.next = c);
    }
  }
  function tm(e, t) {
    var n = t.action, r = t.payload, l = e.state;
    if (t.isTransition) {
      var c = C.T, m = {};
      C.T = m;
      try {
        var b = n(l, r), v = C.S;
        v !== null && v(m, b), nm(e, t, b);
      } catch (_) {
        ws(e, t, _);
      } finally {
        c !== null && m.types !== null && (c.types = m.types), C.T = c;
      }
    } else
      try {
        c = n(l, r), nm(e, t, c);
      } catch (_) {
        ws(e, t, _);
      }
  }
  function nm(e, t, n) {
    n !== null && typeof n == "object" && typeof n.then == "function" ? n.then(
      function(r) {
        am(e, t, r);
      },
      function(r) {
        return ws(e, t, r);
      }
    ) : am(e, t, n);
  }
  function am(e, t, n) {
    t.status = "fulfilled", t.value = n, rm(t), e.state = n, t = e.pending, t !== null && (n = t.next, n === t ? e.pending = null : (n = n.next, t.next = n, tm(e, n)));
  }
  function ws(e, t, n) {
    var r = e.pending;
    if (e.pending = null, r !== null) {
      r = r.next;
      do
        t.status = "rejected", t.reason = n, rm(t), t = t.next;
      while (t !== r);
    }
    e.action = null;
  }
  function rm(e) {
    e = e.listeners;
    for (var t = 0; t < e.length; t++) (0, e[t])();
  }
  function om(e, t) {
    return t;
  }
  function im(e, t) {
    if (me) {
      var n = Oe.formState;
      if (n !== null) {
        e: {
          var r = ne;
          if (me) {
            if (Re) {
              t: {
                for (var l = Re, c = Ut; l.nodeType !== 8; ) {
                  if (!c) {
                    l = null;
                    break t;
                  }
                  if (l = Ht(
                    l.nextSibling
                  ), l === null) {
                    l = null;
                    break t;
                  }
                }
                c = l.data, l = c === "F!" || c === "F" ? l : null;
              }
              if (l) {
                Re = Ht(
                  l.nextSibling
                ), r = l.data === "F!";
                break e;
              }
            }
            _n(r);
          }
          r = !1;
        }
        r && (t = n[0]);
      }
    }
    return n = mt(), n.memoizedState = n.baseState = t, r = {
      pending: null,
      lanes: 0,
      dispatch: null,
      lastRenderedReducer: om,
      lastRenderedState: t
    }, n.queue = r, n = Am.bind(
      null,
      ne,
      r
    ), r.dispatch = n, r = xs(!1), c = Os.bind(
      null,
      ne,
      !1,
      r.queue
    ), r = mt(), l = {
      state: t,
      dispatch: null,
      action: e,
      pending: null
    }, r.queue = l, n = ug.bind(
      null,
      ne,
      l,
      c,
      n
    ), l.dispatch = n, r.memoizedState = e, [t, n, !1];
  }
  function lm(e) {
    var t = Be();
    return sm(t, je, e);
  }
  function sm(e, t, n) {
    if (t = gs(
      e,
      t,
      om
    )[0], e = ri(cn)[0], typeof t == "object" && t !== null && typeof t.then == "function")
      try {
        var r = Mr(t);
      } catch (m) {
        throw m === Ya ? Po : m;
      }
    else r = t;
    t = Be();
    var l = t.queue, c = l.dispatch;
    return n !== t.memoizedState && (ne.flags |= 2048, Fa(
      9,
      { destroy: void 0 },
      mg.bind(null, l, n),
      null
    )), [r, c, e];
  }
  function mg(e, t) {
    e.action = t;
  }
  function cm(e) {
    var t = Be(), n = je;
    if (n !== null)
      return sm(t, n, e);
    Be(), t = t.memoizedState, n = Be();
    var r = n.queue.dispatch;
    return n.memoizedState = e, [t, r, !1];
  }
  function Fa(e, t, n, r) {
    return e = { tag: e, create: n, deps: r, inst: t, next: null }, t = ne.updateQueue, t === null && (t = ni(), ne.updateQueue = t), n = t.lastEffect, n === null ? t.lastEffect = e.next = e : (r = n.next, n.next = e, e.next = r, t.lastEffect = e), e;
  }
  function dm() {
    return Be().memoizedState;
  }
  function oi(e, t, n, r) {
    var l = mt();
    ne.flags |= e, l.memoizedState = Fa(
      1 | t,
      { destroy: void 0 },
      n,
      r === void 0 ? null : r
    );
  }
  function ii(e, t, n, r) {
    var l = Be();
    r = r === void 0 ? null : r;
    var c = l.memoizedState.inst;
    je !== null && r !== null && ms(r, je.memoizedState.deps) ? l.memoizedState = Fa(t, c, n, r) : (ne.flags |= e, l.memoizedState = Fa(
      1 | t,
      c,
      n,
      r
    ));
  }
  function um(e, t) {
    oi(8390656, 8, e, t);
  }
  function Ss(e, t) {
    ii(2048, 8, e, t);
  }
  function fg(e) {
    ne.flags |= 4;
    var t = ne.updateQueue;
    if (t === null)
      t = ni(), ne.updateQueue = t, t.events = [e];
    else {
      var n = t.events;
      n === null ? t.events = [e] : n.push(e);
    }
  }
  function mm(e) {
    var t = Be().memoizedState;
    return fg({ ref: t, nextImpl: e }), function() {
      if ((ve & 2) !== 0) throw Error(s(440));
      return t.impl.apply(void 0, arguments);
    };
  }
  function fm(e, t) {
    return ii(4, 2, e, t);
  }
  function pm(e, t) {
    return ii(4, 4, e, t);
  }
  function bm(e, t) {
    if (typeof t == "function") {
      e = e();
      var n = t(e);
      return function() {
        typeof n == "function" ? n() : t(null);
      };
    }
    if (t != null)
      return e = e(), t.current = e, function() {
        t.current = null;
      };
  }
  function hm(e, t, n) {
    n = n != null ? n.concat([e]) : null, ii(4, 4, bm.bind(null, t, e), n);
  }
  function js() {
  }
  function ym(e, t) {
    var n = Be();
    t = t === void 0 ? null : t;
    var r = n.memoizedState;
    return t !== null && ms(t, r[1]) ? r[0] : (n.memoizedState = [e, t], e);
  }
  function gm(e, t) {
    var n = Be();
    t = t === void 0 ? null : t;
    var r = n.memoizedState;
    if (t !== null && ms(t, r[1]))
      return r[0];
    if (r = e(), pa) {
      wn(!0);
      try {
        e();
      } finally {
        wn(!1);
      }
    }
    return n.memoizedState = [r, t], r;
  }
  function Es(e, t, n) {
    return n === void 0 || (sn & 1073741824) !== 0 && (ce & 261930) === 0 ? e.memoizedState = t : (e.memoizedState = n, e = xf(), ne.lanes |= e, Mn |= e, n);
  }
  function vm(e, t, n, r) {
    return Et(n, t) ? n : Ga.current !== null ? (e = Es(e, n, r), Et(e, t) || (qe = !0), e) : (sn & 42) === 0 || (sn & 1073741824) !== 0 && (ce & 261930) === 0 ? (qe = !0, e.memoizedState = n) : (e = xf(), ne.lanes |= e, Mn |= e, t);
  }
  function xm(e, t, n, r, l) {
    var c = B.p;
    B.p = c !== 0 && 8 > c ? c : 8;
    var m = C.T, b = {};
    C.T = b, Os(e, !1, t, n);
    try {
      var v = l(), _ = C.S;
      if (_ !== null && _(b, v), v !== null && typeof v == "object" && typeof v.then == "function") {
        var I = sg(
          v,
          r
        );
        Dr(
          e,
          t,
          I,
          Tt(e)
        );
      } else
        Dr(
          e,
          t,
          r,
          Tt(e)
        );
    } catch (L) {
      Dr(
        e,
        t,
        { then: function() {
        }, status: "rejected", reason: L },
        Tt()
      );
    } finally {
      B.p = c, m !== null && b.types !== null && (m.types = b.types), C.T = m;
    }
  }
  function pg() {
  }
  function As(e, t, n, r) {
    if (e.tag !== 5) throw Error(s(476));
    var l = wm(e).queue;
    xm(
      e,
      l,
      t,
      K,
      n === null ? pg : function() {
        return Sm(e), n(r);
      }
    );
  }
  function wm(e) {
    var t = e.memoizedState;
    if (t !== null) return t;
    t = {
      memoizedState: K,
      baseState: K,
      baseQueue: null,
      queue: {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: cn,
        lastRenderedState: K
      },
      next: null
    };
    var n = {};
    return t.next = {
      memoizedState: n,
      baseState: n,
      baseQueue: null,
      queue: {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: cn,
        lastRenderedState: n
      },
      next: null
    }, e.memoizedState = t, e = e.alternate, e !== null && (e.memoizedState = t), t;
  }
  function Sm(e) {
    var t = wm(e);
    t.next === null && (t = e.alternate.memoizedState), Dr(
      e,
      t.next.queue,
      {},
      Tt()
    );
  }
  function _s() {
    return nt(Wr);
  }
  function jm() {
    return Be().memoizedState;
  }
  function Em() {
    return Be().memoizedState;
  }
  function bg(e) {
    for (var t = e.return; t !== null; ) {
      switch (t.tag) {
        case 24:
        case 3:
          var n = Tt();
          e = Nn(n);
          var r = Tn(t, e, n);
          r !== null && (vt(r, t, n), Rr(r, t, n)), t = { cache: ts() }, e.payload = t;
          return;
      }
      t = t.return;
    }
  }
  function hg(e, t, n) {
    var r = Tt();
    n = {
      lane: r,
      revertLane: 0,
      gesture: null,
      action: n,
      hasEagerState: !1,
      eagerState: null,
      next: null
    }, li(e) ? _m(t, n) : (n = ql(e, t, n, r), n !== null && (vt(n, e, r), Om(n, t, r)));
  }
  function Am(e, t, n) {
    var r = Tt();
    Dr(e, t, n, r);
  }
  function Dr(e, t, n, r) {
    var l = {
      lane: r,
      revertLane: 0,
      gesture: null,
      action: n,
      hasEagerState: !1,
      eagerState: null,
      next: null
    };
    if (li(e)) _m(t, l);
    else {
      var c = e.alternate;
      if (e.lanes === 0 && (c === null || c.lanes === 0) && (c = t.lastRenderedReducer, c !== null))
        try {
          var m = t.lastRenderedState, b = c(m, n);
          if (l.hasEagerState = !0, l.eagerState = b, Et(b, m))
            return Yo(e, t, l, 0), Oe === null && Bo(), !1;
        } catch {
        } finally {
        }
      if (n = ql(e, t, l, r), n !== null)
        return vt(n, e, r), Om(n, t, r), !0;
    }
    return !1;
  }
  function Os(e, t, n, r) {
    if (r = {
      lane: 2,
      revertLane: oc(),
      gesture: null,
      action: r,
      hasEagerState: !1,
      eagerState: null,
      next: null
    }, li(e)) {
      if (t) throw Error(s(479));
    } else
      t = ql(
        e,
        n,
        r,
        2
      ), t !== null && vt(t, e, 2);
  }
  function li(e) {
    var t = e.alternate;
    return e === ne || t !== null && t === ne;
  }
  function _m(e, t) {
    qa = ei = !0;
    var n = e.pending;
    n === null ? t.next = t : (t.next = n.next, n.next = t), e.pending = t;
  }
  function Om(e, t, n) {
    if ((n & 4194048) !== 0) {
      var r = t.lanes;
      r &= e.pendingLanes, n |= r, t.lanes = n, kd(e, n);
    }
  }
  var Ur = {
    readContext: nt,
    use: ai,
    useCallback: Me,
    useContext: Me,
    useEffect: Me,
    useImperativeHandle: Me,
    useLayoutEffect: Me,
    useInsertionEffect: Me,
    useMemo: Me,
    useReducer: Me,
    useRef: Me,
    useState: Me,
    useDebugValue: Me,
    useDeferredValue: Me,
    useTransition: Me,
    useSyncExternalStore: Me,
    useId: Me,
    useHostTransitionStatus: Me,
    useFormState: Me,
    useActionState: Me,
    useOptimistic: Me,
    useMemoCache: Me,
    useCacheRefresh: Me
  };
  Ur.useEffectEvent = Me;
  var zm = {
    readContext: nt,
    use: ai,
    useCallback: function(e, t) {
      return mt().memoizedState = [
        e,
        t === void 0 ? null : t
      ], e;
    },
    useContext: nt,
    useEffect: um,
    useImperativeHandle: function(e, t, n) {
      n = n != null ? n.concat([e]) : null, oi(
        4194308,
        4,
        bm.bind(null, t, e),
        n
      );
    },
    useLayoutEffect: function(e, t) {
      return oi(4194308, 4, e, t);
    },
    useInsertionEffect: function(e, t) {
      oi(4, 2, e, t);
    },
    useMemo: function(e, t) {
      var n = mt();
      t = t === void 0 ? null : t;
      var r = e();
      if (pa) {
        wn(!0);
        try {
          e();
        } finally {
          wn(!1);
        }
      }
      return n.memoizedState = [r, t], r;
    },
    useReducer: function(e, t, n) {
      var r = mt();
      if (n !== void 0) {
        var l = n(t);
        if (pa) {
          wn(!0);
          try {
            n(t);
          } finally {
            wn(!1);
          }
        }
      } else l = t;
      return r.memoizedState = r.baseState = l, e = {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: e,
        lastRenderedState: l
      }, r.queue = e, e = e.dispatch = hg.bind(
        null,
        ne,
        e
      ), [r.memoizedState, e];
    },
    useRef: function(e) {
      var t = mt();
      return e = { current: e }, t.memoizedState = e;
    },
    useState: function(e) {
      e = xs(e);
      var t = e.queue, n = Am.bind(null, ne, t);
      return t.dispatch = n, [e.memoizedState, n];
    },
    useDebugValue: js,
    useDeferredValue: function(e, t) {
      var n = mt();
      return Es(n, e, t);
    },
    useTransition: function() {
      var e = xs(!1);
      return e = xm.bind(
        null,
        ne,
        e.queue,
        !0,
        !1
      ), mt().memoizedState = e, [!1, e];
    },
    useSyncExternalStore: function(e, t, n) {
      var r = ne, l = mt();
      if (me) {
        if (n === void 0)
          throw Error(s(407));
        n = n();
      } else {
        if (n = t(), Oe === null)
          throw Error(s(349));
        (ce & 127) !== 0 || Ku(r, t, n);
      }
      l.memoizedState = n;
      var c = { value: n, getSnapshot: t };
      return l.queue = c, um(Qu.bind(null, r, c, e), [
        e
      ]), r.flags |= 2048, Fa(
        9,
        { destroy: void 0 },
        Zu.bind(
          null,
          r,
          c,
          n,
          t
        ),
        null
      ), n;
    },
    useId: function() {
      var e = mt(), t = Oe.identifierPrefix;
      if (me) {
        var n = Pt, r = Xt;
        n = (r & ~(1 << 32 - jt(r) - 1)).toString(32) + n, t = "_" + t + "R_" + n, n = ti++, 0 < n && (t += "H" + n.toString(32)), t += "_";
      } else
        n = cg++, t = "_" + t + "r_" + n.toString(32) + "_";
      return e.memoizedState = t;
    },
    useHostTransitionStatus: _s,
    useFormState: im,
    useActionState: im,
    useOptimistic: function(e) {
      var t = mt();
      t.memoizedState = t.baseState = e;
      var n = {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: null,
        lastRenderedState: null
      };
      return t.queue = n, t = Os.bind(
        null,
        ne,
        !0,
        n
      ), n.dispatch = t, [e, t];
    },
    useMemoCache: ys,
    useCacheRefresh: function() {
      return mt().memoizedState = bg.bind(
        null,
        ne
      );
    },
    useEffectEvent: function(e) {
      var t = mt(), n = { impl: e };
      return t.memoizedState = n, function() {
        if ((ve & 2) !== 0)
          throw Error(s(440));
        return n.impl.apply(void 0, arguments);
      };
    }
  }, zs = {
    readContext: nt,
    use: ai,
    useCallback: ym,
    useContext: nt,
    useEffect: Ss,
    useImperativeHandle: hm,
    useInsertionEffect: fm,
    useLayoutEffect: pm,
    useMemo: gm,
    useReducer: ri,
    useRef: dm,
    useState: function() {
      return ri(cn);
    },
    useDebugValue: js,
    useDeferredValue: function(e, t) {
      var n = Be();
      return vm(
        n,
        je.memoizedState,
        e,
        t
      );
    },
    useTransition: function() {
      var e = ri(cn)[0], t = Be().memoizedState;
      return [
        typeof e == "boolean" ? e : Mr(e),
        t
      ];
    },
    useSyncExternalStore: Pu,
    useId: jm,
    useHostTransitionStatus: _s,
    useFormState: lm,
    useActionState: lm,
    useOptimistic: function(e, t) {
      var n = Be();
      return em(n, je, e, t);
    },
    useMemoCache: ys,
    useCacheRefresh: Em
  };
  zs.useEffectEvent = mm;
  var Nm = {
    readContext: nt,
    use: ai,
    useCallback: ym,
    useContext: nt,
    useEffect: Ss,
    useImperativeHandle: hm,
    useInsertionEffect: fm,
    useLayoutEffect: pm,
    useMemo: gm,
    useReducer: vs,
    useRef: dm,
    useState: function() {
      return vs(cn);
    },
    useDebugValue: js,
    useDeferredValue: function(e, t) {
      var n = Be();
      return je === null ? Es(n, e, t) : vm(
        n,
        je.memoizedState,
        e,
        t
      );
    },
    useTransition: function() {
      var e = vs(cn)[0], t = Be().memoizedState;
      return [
        typeof e == "boolean" ? e : Mr(e),
        t
      ];
    },
    useSyncExternalStore: Pu,
    useId: jm,
    useHostTransitionStatus: _s,
    useFormState: cm,
    useActionState: cm,
    useOptimistic: function(e, t) {
      var n = Be();
      return je !== null ? em(n, je, e, t) : (n.baseState = e, [e, n.queue.dispatch]);
    },
    useMemoCache: ys,
    useCacheRefresh: Em
  };
  Nm.useEffectEvent = mm;
  function Ns(e, t, n, r) {
    t = e.memoizedState, n = n(r, t), n = n == null ? t : O({}, t, n), e.memoizedState = n, e.lanes === 0 && (e.updateQueue.baseState = n);
  }
  var Ts = {
    enqueueSetState: function(e, t, n) {
      e = e._reactInternals;
      var r = Tt(), l = Nn(r);
      l.payload = t, n != null && (l.callback = n), t = Tn(e, l, r), t !== null && (vt(t, e, r), Rr(t, e, r));
    },
    enqueueReplaceState: function(e, t, n) {
      e = e._reactInternals;
      var r = Tt(), l = Nn(r);
      l.tag = 1, l.payload = t, n != null && (l.callback = n), t = Tn(e, l, r), t !== null && (vt(t, e, r), Rr(t, e, r));
    },
    enqueueForceUpdate: function(e, t) {
      e = e._reactInternals;
      var n = Tt(), r = Nn(n);
      r.tag = 2, t != null && (r.callback = t), t = Tn(e, r, n), t !== null && (vt(t, e, n), Rr(t, e, n));
    }
  };
  function Tm(e, t, n, r, l, c, m) {
    return e = e.stateNode, typeof e.shouldComponentUpdate == "function" ? e.shouldComponentUpdate(r, c, m) : t.prototype && t.prototype.isPureReactComponent ? !jr(n, r) || !jr(l, c) : !0;
  }
  function Rm(e, t, n, r) {
    e = t.state, typeof t.componentWillReceiveProps == "function" && t.componentWillReceiveProps(n, r), typeof t.UNSAFE_componentWillReceiveProps == "function" && t.UNSAFE_componentWillReceiveProps(n, r), t.state !== e && Ts.enqueueReplaceState(t, t.state, null);
  }
  function ba(e, t) {
    var n = t;
    if ("ref" in t) {
      n = {};
      for (var r in t)
        r !== "ref" && (n[r] = t[r]);
    }
    if (e = e.defaultProps) {
      n === t && (n = O({}, n));
      for (var l in e)
        n[l] === void 0 && (n[l] = e[l]);
    }
    return n;
  }
  function km(e) {
    Ho(e);
  }
  function Cm(e) {
    console.error(e);
  }
  function Im(e) {
    Ho(e);
  }
  function si(e, t) {
    try {
      var n = e.onUncaughtError;
      n(t.value, { componentStack: t.stack });
    } catch (r) {
      setTimeout(function() {
        throw r;
      });
    }
  }
  function Mm(e, t, n) {
    try {
      var r = e.onCaughtError;
      r(n.value, {
        componentStack: n.stack,
        errorBoundary: t.tag === 1 ? t.stateNode : null
      });
    } catch (l) {
      setTimeout(function() {
        throw l;
      });
    }
  }
  function Rs(e, t, n) {
    return n = Nn(n), n.tag = 3, n.payload = { element: null }, n.callback = function() {
      si(e, t);
    }, n;
  }
  function Dm(e) {
    return e = Nn(e), e.tag = 3, e;
  }
  function Um(e, t, n, r) {
    var l = n.type.getDerivedStateFromError;
    if (typeof l == "function") {
      var c = r.value;
      e.payload = function() {
        return l(c);
      }, e.callback = function() {
        Mm(t, n, r);
      };
    }
    var m = n.stateNode;
    m !== null && typeof m.componentDidCatch == "function" && (e.callback = function() {
      Mm(t, n, r), typeof l != "function" && (Dn === null ? Dn = /* @__PURE__ */ new Set([this]) : Dn.add(this));
      var b = r.stack;
      this.componentDidCatch(r.value, {
        componentStack: b !== null ? b : ""
      });
    });
  }
  function yg(e, t, n, r, l) {
    if (n.flags |= 32768, r !== null && typeof r == "object" && typeof r.then == "function") {
      if (t = n.alternate, t !== null && La(
        t,
        n,
        l,
        !0
      ), n = _t.current, n !== null) {
        switch (n.tag) {
          case 31:
          case 13:
            return Lt === null ? xi() : n.alternate === null && De === 0 && (De = 3), n.flags &= -257, n.flags |= 65536, n.lanes = l, r === Ko ? n.flags |= 16384 : (t = n.updateQueue, t === null ? n.updateQueue = /* @__PURE__ */ new Set([r]) : t.add(r), nc(e, r, l)), !1;
          case 22:
            return n.flags |= 65536, r === Ko ? n.flags |= 16384 : (t = n.updateQueue, t === null ? (t = {
              transitions: null,
              markerInstances: null,
              retryQueue: /* @__PURE__ */ new Set([r])
            }, n.updateQueue = t) : (n = t.retryQueue, n === null ? t.retryQueue = /* @__PURE__ */ new Set([r]) : n.add(r)), nc(e, r, l)), !1;
        }
        throw Error(s(435, n.tag));
      }
      return nc(e, r, l), xi(), !1;
    }
    if (me)
      return t = _t.current, t !== null ? ((t.flags & 65536) === 0 && (t.flags |= 256), t.flags |= 65536, t.lanes = l, r !== Zl && (e = Error(s(422), { cause: r }), _r(It(e, n)))) : (r !== Zl && (t = Error(s(423), {
        cause: r
      }), _r(
        It(t, n)
      )), e = e.current.alternate, e.flags |= 65536, l &= -l, e.lanes |= l, r = It(r, n), l = Rs(
        e.stateNode,
        r,
        l
      ), ls(e, l), De !== 4 && (De = 2)), !1;
    var c = Error(s(520), { cause: r });
    if (c = It(c, n), Vr === null ? Vr = [c] : Vr.push(c), De !== 4 && (De = 2), t === null) return !0;
    r = It(r, n), n = t;
    do {
      switch (n.tag) {
        case 3:
          return n.flags |= 65536, e = l & -l, n.lanes |= e, e = Rs(n.stateNode, r, e), ls(n, e), !1;
        case 1:
          if (t = n.type, c = n.stateNode, (n.flags & 128) === 0 && (typeof t.getDerivedStateFromError == "function" || c !== null && typeof c.componentDidCatch == "function" && (Dn === null || !Dn.has(c))))
            return n.flags |= 65536, l &= -l, n.lanes |= l, l = Dm(l), Um(
              l,
              e,
              n,
              r
            ), ls(n, l), !1;
      }
      n = n.return;
    } while (n !== null);
    return !1;
  }
  var ks = Error(s(461)), qe = !1;
  function at(e, t, n, r) {
    t.child = e === null ? Yu(t, null, n, r) : fa(
      t,
      e.child,
      n,
      r
    );
  }
  function Lm(e, t, n, r, l) {
    n = n.render;
    var c = t.ref;
    if ("ref" in r) {
      var m = {};
      for (var b in r)
        b !== "ref" && (m[b] = r[b]);
    } else m = r;
    return ca(t), r = fs(
      e,
      t,
      n,
      m,
      c,
      l
    ), b = ps(), e !== null && !qe ? (bs(e, t, l), dn(e, t, l)) : (me && b && Pl(t), t.flags |= 1, at(e, t, r, l), t.child);
  }
  function Hm(e, t, n, r, l) {
    if (e === null) {
      var c = n.type;
      return typeof c == "function" && !Vl(c) && c.defaultProps === void 0 && n.compare === null ? (t.tag = 15, t.type = c, Bm(
        e,
        t,
        c,
        r,
        l
      )) : (e = Go(
        n.type,
        null,
        r,
        t,
        t.mode,
        l
      ), e.ref = t.ref, e.return = t, t.child = e);
    }
    if (c = e.child, !Bs(e, l)) {
      var m = c.memoizedProps;
      if (n = n.compare, n = n !== null ? n : jr, n(m, r) && e.ref === t.ref)
        return dn(e, t, l);
    }
    return t.flags |= 1, e = an(c, r), e.ref = t.ref, e.return = t, t.child = e;
  }
  function Bm(e, t, n, r, l) {
    if (e !== null) {
      var c = e.memoizedProps;
      if (jr(c, r) && e.ref === t.ref)
        if (qe = !1, t.pendingProps = r = c, Bs(e, l))
          (e.flags & 131072) !== 0 && (qe = !0);
        else
          return t.lanes = e.lanes, dn(e, t, l);
    }
    return Cs(
      e,
      t,
      n,
      r,
      l
    );
  }
  function Ym(e, t, n, r) {
    var l = r.children, c = e !== null ? e.memoizedState : null;
    if (e === null && t.stateNode === null && (t.stateNode = {
      _visibility: 1,
      _pendingMarkers: null,
      _retryCache: null,
      _transitions: null
    }), r.mode === "hidden") {
      if ((t.flags & 128) !== 0) {
        if (c = c !== null ? c.baseLanes | n : n, e !== null) {
          for (r = t.child = e.child, l = 0; r !== null; )
            l = l | r.lanes | r.childLanes, r = r.sibling;
          r = l & ~c;
        } else r = 0, t.child = null;
        return $m(
          e,
          t,
          c,
          n,
          r
        );
      }
      if ((n & 536870912) !== 0)
        t.memoizedState = { baseLanes: 0, cachePool: null }, e !== null && Xo(
          t,
          c !== null ? c.cachePool : null
        ), c !== null ? qu(t, c) : cs(), Vu(t);
      else
        return r = t.lanes = 536870912, $m(
          e,
          t,
          c !== null ? c.baseLanes | n : n,
          n,
          r
        );
    } else
      c !== null ? (Xo(t, c.cachePool), qu(t, c), kn(), t.memoizedState = null) : (e !== null && Xo(t, null), cs(), kn());
    return at(e, t, l, n), t.child;
  }
  function Lr(e, t) {
    return e !== null && e.tag === 22 || t.stateNode !== null || (t.stateNode = {
      _visibility: 1,
      _pendingMarkers: null,
      _retryCache: null,
      _transitions: null
    }), t.sibling;
  }
  function $m(e, t, n, r, l) {
    var c = as();
    return c = c === null ? null : { parent: $e._currentValue, pool: c }, t.memoizedState = {
      baseLanes: n,
      cachePool: c
    }, e !== null && Xo(t, null), cs(), Vu(t), e !== null && La(e, t, r, !0), t.childLanes = l, null;
  }
  function ci(e, t) {
    return t = ui(
      { mode: t.mode, children: t.children },
      e.mode
    ), t.ref = e.ref, e.child = t, t.return = e, t;
  }
  function Gm(e, t, n) {
    return fa(t, e.child, null, n), e = ci(t, t.pendingProps), e.flags |= 2, Ot(t), t.memoizedState = null, e;
  }
  function gg(e, t, n) {
    var r = t.pendingProps, l = (t.flags & 128) !== 0;
    if (t.flags &= -129, e === null) {
      if (me) {
        if (r.mode === "hidden")
          return e = ci(t, r), t.lanes = 536870912, Lr(null, e);
        if (us(t), (e = Re) ? (e = np(
          e,
          Ut
        ), e = e !== null && e.data === "&" ? e : null, e !== null && (t.memoizedState = {
          dehydrated: e,
          treeContext: En !== null ? { id: Xt, overflow: Pt } : null,
          retryLane: 536870912,
          hydrationErrors: null
        }, n = _u(e), n.return = t, t.child = n, tt = t, Re = null)) : e = null, e === null) throw _n(t);
        return t.lanes = 536870912, null;
      }
      return ci(t, r);
    }
    var c = e.memoizedState;
    if (c !== null) {
      var m = c.dehydrated;
      if (us(t), l)
        if (t.flags & 256)
          t.flags &= -257, t = Gm(
            e,
            t,
            n
          );
        else if (t.memoizedState !== null)
          t.child = e.child, t.flags |= 128, t = null;
        else throw Error(s(558));
      else if (qe || La(e, t, n, !1), l = (n & e.childLanes) !== 0, qe || l) {
        if (r = Oe, r !== null && (m = Cd(r, n), m !== 0 && m !== c.retryLane))
          throw c.retryLane = m, oa(e, m), vt(r, e, m), ks;
        xi(), t = Gm(
          e,
          t,
          n
        );
      } else
        e = c.treeContext, Re = Ht(m.nextSibling), tt = t, me = !0, An = null, Ut = !1, e !== null && Nu(t, e), t = ci(t, r), t.flags |= 4096;
      return t;
    }
    return e = an(e.child, {
      mode: r.mode,
      children: r.children
    }), e.ref = t.ref, t.child = e, e.return = t, e;
  }
  function di(e, t) {
    var n = t.ref;
    if (n === null)
      e !== null && e.ref !== null && (t.flags |= 4194816);
    else {
      if (typeof n != "function" && typeof n != "object")
        throw Error(s(284));
      (e === null || e.ref !== n) && (t.flags |= 4194816);
    }
  }
  function Cs(e, t, n, r, l) {
    return ca(t), n = fs(
      e,
      t,
      n,
      r,
      void 0,
      l
    ), r = ps(), e !== null && !qe ? (bs(e, t, l), dn(e, t, l)) : (me && r && Pl(t), t.flags |= 1, at(e, t, n, l), t.child);
  }
  function qm(e, t, n, r, l, c) {
    return ca(t), t.updateQueue = null, n = Xu(
      t,
      r,
      n,
      l
    ), Fu(e), r = ps(), e !== null && !qe ? (bs(e, t, c), dn(e, t, c)) : (me && r && Pl(t), t.flags |= 1, at(e, t, n, c), t.child);
  }
  function Vm(e, t, n, r, l) {
    if (ca(t), t.stateNode === null) {
      var c = Ia, m = n.contextType;
      typeof m == "object" && m !== null && (c = nt(m)), c = new n(r, c), t.memoizedState = c.state !== null && c.state !== void 0 ? c.state : null, c.updater = Ts, t.stateNode = c, c._reactInternals = t, c = t.stateNode, c.props = r, c.state = t.memoizedState, c.refs = {}, os(t), m = n.contextType, c.context = typeof m == "object" && m !== null ? nt(m) : Ia, c.state = t.memoizedState, m = n.getDerivedStateFromProps, typeof m == "function" && (Ns(
        t,
        n,
        m,
        r
      ), c.state = t.memoizedState), typeof n.getDerivedStateFromProps == "function" || typeof c.getSnapshotBeforeUpdate == "function" || typeof c.UNSAFE_componentWillMount != "function" && typeof c.componentWillMount != "function" || (m = c.state, typeof c.componentWillMount == "function" && c.componentWillMount(), typeof c.UNSAFE_componentWillMount == "function" && c.UNSAFE_componentWillMount(), m !== c.state && Ts.enqueueReplaceState(c, c.state, null), Cr(t, r, c, l), kr(), c.state = t.memoizedState), typeof c.componentDidMount == "function" && (t.flags |= 4194308), r = !0;
    } else if (e === null) {
      c = t.stateNode;
      var b = t.memoizedProps, v = ba(n, b);
      c.props = v;
      var _ = c.context, I = n.contextType;
      m = Ia, typeof I == "object" && I !== null && (m = nt(I));
      var L = n.getDerivedStateFromProps;
      I = typeof L == "function" || typeof c.getSnapshotBeforeUpdate == "function", b = t.pendingProps !== b, I || typeof c.UNSAFE_componentWillReceiveProps != "function" && typeof c.componentWillReceiveProps != "function" || (b || _ !== m) && Rm(
        t,
        c,
        r,
        m
      ), zn = !1;
      var N = t.memoizedState;
      c.state = N, Cr(t, r, c, l), kr(), _ = t.memoizedState, b || N !== _ || zn ? (typeof L == "function" && (Ns(
        t,
        n,
        L,
        r
      ), _ = t.memoizedState), (v = zn || Tm(
        t,
        n,
        v,
        r,
        N,
        _,
        m
      )) ? (I || typeof c.UNSAFE_componentWillMount != "function" && typeof c.componentWillMount != "function" || (typeof c.componentWillMount == "function" && c.componentWillMount(), typeof c.UNSAFE_componentWillMount == "function" && c.UNSAFE_componentWillMount()), typeof c.componentDidMount == "function" && (t.flags |= 4194308)) : (typeof c.componentDidMount == "function" && (t.flags |= 4194308), t.memoizedProps = r, t.memoizedState = _), c.props = r, c.state = _, c.context = m, r = v) : (typeof c.componentDidMount == "function" && (t.flags |= 4194308), r = !1);
    } else {
      c = t.stateNode, is(e, t), m = t.memoizedProps, I = ba(n, m), c.props = I, L = t.pendingProps, N = c.context, _ = n.contextType, v = Ia, typeof _ == "object" && _ !== null && (v = nt(_)), b = n.getDerivedStateFromProps, (_ = typeof b == "function" || typeof c.getSnapshotBeforeUpdate == "function") || typeof c.UNSAFE_componentWillReceiveProps != "function" && typeof c.componentWillReceiveProps != "function" || (m !== L || N !== v) && Rm(
        t,
        c,
        r,
        v
      ), zn = !1, N = t.memoizedState, c.state = N, Cr(t, r, c, l), kr();
      var k = t.memoizedState;
      m !== L || N !== k || zn || e !== null && e.dependencies !== null && Vo(e.dependencies) ? (typeof b == "function" && (Ns(
        t,
        n,
        b,
        r
      ), k = t.memoizedState), (I = zn || Tm(
        t,
        n,
        I,
        r,
        N,
        k,
        v
      ) || e !== null && e.dependencies !== null && Vo(e.dependencies)) ? (_ || typeof c.UNSAFE_componentWillUpdate != "function" && typeof c.componentWillUpdate != "function" || (typeof c.componentWillUpdate == "function" && c.componentWillUpdate(r, k, v), typeof c.UNSAFE_componentWillUpdate == "function" && c.UNSAFE_componentWillUpdate(
        r,
        k,
        v
      )), typeof c.componentDidUpdate == "function" && (t.flags |= 4), typeof c.getSnapshotBeforeUpdate == "function" && (t.flags |= 1024)) : (typeof c.componentDidUpdate != "function" || m === e.memoizedProps && N === e.memoizedState || (t.flags |= 4), typeof c.getSnapshotBeforeUpdate != "function" || m === e.memoizedProps && N === e.memoizedState || (t.flags |= 1024), t.memoizedProps = r, t.memoizedState = k), c.props = r, c.state = k, c.context = v, r = I) : (typeof c.componentDidUpdate != "function" || m === e.memoizedProps && N === e.memoizedState || (t.flags |= 4), typeof c.getSnapshotBeforeUpdate != "function" || m === e.memoizedProps && N === e.memoizedState || (t.flags |= 1024), r = !1);
    }
    return c = r, di(e, t), r = (t.flags & 128) !== 0, c || r ? (c = t.stateNode, n = r && typeof n.getDerivedStateFromError != "function" ? null : c.render(), t.flags |= 1, e !== null && r ? (t.child = fa(
      t,
      e.child,
      null,
      l
    ), t.child = fa(
      t,
      null,
      n,
      l
    )) : at(e, t, n, l), t.memoizedState = c.state, e = t.child) : e = dn(
      e,
      t,
      l
    ), e;
  }
  function Fm(e, t, n, r) {
    return la(), t.flags |= 256, at(e, t, n, r), t.child;
  }
  var Is = {
    dehydrated: null,
    treeContext: null,
    retryLane: 0,
    hydrationErrors: null
  };
  function Ms(e) {
    return { baseLanes: e, cachePool: Mu() };
  }
  function Ds(e, t, n) {
    return e = e !== null ? e.childLanes & ~n : 0, t && (e |= Nt), e;
  }
  function Xm(e, t, n) {
    var r = t.pendingProps, l = !1, c = (t.flags & 128) !== 0, m;
    if ((m = c) || (m = e !== null && e.memoizedState === null ? !1 : (He.current & 2) !== 0), m && (l = !0, t.flags &= -129), m = (t.flags & 32) !== 0, t.flags &= -33, e === null) {
      if (me) {
        if (l ? Rn(t) : kn(), (e = Re) ? (e = np(
          e,
          Ut
        ), e = e !== null && e.data !== "&" ? e : null, e !== null && (t.memoizedState = {
          dehydrated: e,
          treeContext: En !== null ? { id: Xt, overflow: Pt } : null,
          retryLane: 536870912,
          hydrationErrors: null
        }, n = _u(e), n.return = t, t.child = n, tt = t, Re = null)) : e = null, e === null) throw _n(t);
        return gc(e) ? t.lanes = 32 : t.lanes = 536870912, null;
      }
      var b = r.children;
      return r = r.fallback, l ? (kn(), l = t.mode, b = ui(
        { mode: "hidden", children: b },
        l
      ), r = ia(
        r,
        l,
        n,
        null
      ), b.return = t, r.return = t, b.sibling = r, t.child = b, r = t.child, r.memoizedState = Ms(n), r.childLanes = Ds(
        e,
        m,
        n
      ), t.memoizedState = Is, Lr(null, r)) : (Rn(t), Us(t, b));
    }
    var v = e.memoizedState;
    if (v !== null && (b = v.dehydrated, b !== null)) {
      if (c)
        t.flags & 256 ? (Rn(t), t.flags &= -257, t = Ls(
          e,
          t,
          n
        )) : t.memoizedState !== null ? (kn(), t.child = e.child, t.flags |= 128, t = null) : (kn(), b = r.fallback, l = t.mode, r = ui(
          { mode: "visible", children: r.children },
          l
        ), b = ia(
          b,
          l,
          n,
          null
        ), b.flags |= 2, r.return = t, b.return = t, r.sibling = b, t.child = r, fa(
          t,
          e.child,
          null,
          n
        ), r = t.child, r.memoizedState = Ms(n), r.childLanes = Ds(
          e,
          m,
          n
        ), t.memoizedState = Is, t = Lr(null, r));
      else if (Rn(t), gc(b)) {
        if (m = b.nextSibling && b.nextSibling.dataset, m) var _ = m.dgst;
        m = _, r = Error(s(419)), r.stack = "", r.digest = m, _r({ value: r, source: null, stack: null }), t = Ls(
          e,
          t,
          n
        );
      } else if (qe || La(e, t, n, !1), m = (n & e.childLanes) !== 0, qe || m) {
        if (m = Oe, m !== null && (r = Cd(m, n), r !== 0 && r !== v.retryLane))
          throw v.retryLane = r, oa(e, r), vt(m, e, r), ks;
        yc(b) || xi(), t = Ls(
          e,
          t,
          n
        );
      } else
        yc(b) ? (t.flags |= 192, t.child = e.child, t = null) : (e = v.treeContext, Re = Ht(
          b.nextSibling
        ), tt = t, me = !0, An = null, Ut = !1, e !== null && Nu(t, e), t = Us(
          t,
          r.children
        ), t.flags |= 4096);
      return t;
    }
    return l ? (kn(), b = r.fallback, l = t.mode, v = e.child, _ = v.sibling, r = an(v, {
      mode: "hidden",
      children: r.children
    }), r.subtreeFlags = v.subtreeFlags & 65011712, _ !== null ? b = an(
      _,
      b
    ) : (b = ia(
      b,
      l,
      n,
      null
    ), b.flags |= 2), b.return = t, r.return = t, r.sibling = b, t.child = r, Lr(null, r), r = t.child, b = e.child.memoizedState, b === null ? b = Ms(n) : (l = b.cachePool, l !== null ? (v = $e._currentValue, l = l.parent !== v ? { parent: v, pool: v } : l) : l = Mu(), b = {
      baseLanes: b.baseLanes | n,
      cachePool: l
    }), r.memoizedState = b, r.childLanes = Ds(
      e,
      m,
      n
    ), t.memoizedState = Is, Lr(e.child, r)) : (Rn(t), n = e.child, e = n.sibling, n = an(n, {
      mode: "visible",
      children: r.children
    }), n.return = t, n.sibling = null, e !== null && (m = t.deletions, m === null ? (t.deletions = [e], t.flags |= 16) : m.push(e)), t.child = n, t.memoizedState = null, n);
  }
  function Us(e, t) {
    return t = ui(
      { mode: "visible", children: t },
      e.mode
    ), t.return = e, e.child = t;
  }
  function ui(e, t) {
    return e = At(22, e, null, t), e.lanes = 0, e;
  }
  function Ls(e, t, n) {
    return fa(t, e.child, null, n), e = Us(
      t,
      t.pendingProps.children
    ), e.flags |= 2, t.memoizedState = null, e;
  }
  function Pm(e, t, n) {
    e.lanes |= t;
    var r = e.alternate;
    r !== null && (r.lanes |= t), Wl(e.return, t, n);
  }
  function Hs(e, t, n, r, l, c) {
    var m = e.memoizedState;
    m === null ? e.memoizedState = {
      isBackwards: t,
      rendering: null,
      renderingStartTime: 0,
      last: r,
      tail: n,
      tailMode: l,
      treeForkCount: c
    } : (m.isBackwards = t, m.rendering = null, m.renderingStartTime = 0, m.last = r, m.tail = n, m.tailMode = l, m.treeForkCount = c);
  }
  function Km(e, t, n) {
    var r = t.pendingProps, l = r.revealOrder, c = r.tail;
    r = r.children;
    var m = He.current, b = (m & 2) !== 0;
    if (b ? (m = m & 1 | 2, t.flags |= 128) : m &= 1, Y(He, m), at(e, t, r, n), r = me ? Ar : 0, !b && e !== null && (e.flags & 128) !== 0)
      e: for (e = t.child; e !== null; ) {
        if (e.tag === 13)
          e.memoizedState !== null && Pm(e, n, t);
        else if (e.tag === 19)
          Pm(e, n, t);
        else if (e.child !== null) {
          e.child.return = e, e = e.child;
          continue;
        }
        if (e === t) break e;
        for (; e.sibling === null; ) {
          if (e.return === null || e.return === t)
            break e;
          e = e.return;
        }
        e.sibling.return = e.return, e = e.sibling;
      }
    switch (l) {
      case "forwards":
        for (n = t.child, l = null; n !== null; )
          e = n.alternate, e !== null && Wo(e) === null && (l = n), n = n.sibling;
        n = l, n === null ? (l = t.child, t.child = null) : (l = n.sibling, n.sibling = null), Hs(
          t,
          !1,
          l,
          n,
          c,
          r
        );
        break;
      case "backwards":
      case "unstable_legacy-backwards":
        for (n = null, l = t.child, t.child = null; l !== null; ) {
          if (e = l.alternate, e !== null && Wo(e) === null) {
            t.child = l;
            break;
          }
          e = l.sibling, l.sibling = n, n = l, l = e;
        }
        Hs(
          t,
          !0,
          n,
          null,
          c,
          r
        );
        break;
      case "together":
        Hs(
          t,
          !1,
          null,
          null,
          void 0,
          r
        );
        break;
      default:
        t.memoizedState = null;
    }
    return t.child;
  }
  function dn(e, t, n) {
    if (e !== null && (t.dependencies = e.dependencies), Mn |= t.lanes, (n & t.childLanes) === 0)
      if (e !== null) {
        if (La(
          e,
          t,
          n,
          !1
        ), (n & t.childLanes) === 0)
          return null;
      } else return null;
    if (e !== null && t.child !== e.child)
      throw Error(s(153));
    if (t.child !== null) {
      for (e = t.child, n = an(e, e.pendingProps), t.child = n, n.return = t; e.sibling !== null; )
        e = e.sibling, n = n.sibling = an(e, e.pendingProps), n.return = t;
      n.sibling = null;
    }
    return t.child;
  }
  function Bs(e, t) {
    return (e.lanes & t) !== 0 ? !0 : (e = e.dependencies, !!(e !== null && Vo(e)));
  }
  function vg(e, t, n) {
    switch (t.tag) {
      case 3:
        ut(t, t.stateNode.containerInfo), On(t, $e, e.memoizedState.cache), la();
        break;
      case 27:
      case 5:
        dr(t);
        break;
      case 4:
        ut(t, t.stateNode.containerInfo);
        break;
      case 10:
        On(
          t,
          t.type,
          t.memoizedProps.value
        );
        break;
      case 31:
        if (t.memoizedState !== null)
          return t.flags |= 128, us(t), null;
        break;
      case 13:
        var r = t.memoizedState;
        if (r !== null)
          return r.dehydrated !== null ? (Rn(t), t.flags |= 128, null) : (n & t.child.childLanes) !== 0 ? Xm(e, t, n) : (Rn(t), e = dn(
            e,
            t,
            n
          ), e !== null ? e.sibling : null);
        Rn(t);
        break;
      case 19:
        var l = (e.flags & 128) !== 0;
        if (r = (n & t.childLanes) !== 0, r || (La(
          e,
          t,
          n,
          !1
        ), r = (n & t.childLanes) !== 0), l) {
          if (r)
            return Km(
              e,
              t,
              n
            );
          t.flags |= 128;
        }
        if (l = t.memoizedState, l !== null && (l.rendering = null, l.tail = null, l.lastEffect = null), Y(He, He.current), r) break;
        return null;
      case 22:
        return t.lanes = 0, Ym(
          e,
          t,
          n,
          t.pendingProps
        );
      case 24:
        On(t, $e, e.memoizedState.cache);
    }
    return dn(e, t, n);
  }
  function Zm(e, t, n) {
    if (e !== null)
      if (e.memoizedProps !== t.pendingProps)
        qe = !0;
      else {
        if (!Bs(e, n) && (t.flags & 128) === 0)
          return qe = !1, vg(
            e,
            t,
            n
          );
        qe = (e.flags & 131072) !== 0;
      }
    else
      qe = !1, me && (t.flags & 1048576) !== 0 && zu(t, Ar, t.index);
    switch (t.lanes = 0, t.tag) {
      case 16:
        e: {
          var r = t.pendingProps;
          if (e = ua(t.elementType), t.type = e, typeof e == "function")
            Vl(e) ? (r = ba(e, r), t.tag = 1, t = Vm(
              null,
              t,
              e,
              r,
              n
            )) : (t.tag = 0, t = Cs(
              null,
              t,
              e,
              r,
              n
            ));
          else {
            if (e != null) {
              var l = e.$$typeof;
              if (l === re) {
                t.tag = 11, t = Lm(
                  null,
                  t,
                  e,
                  r,
                  n
                );
                break e;
              } else if (l === P) {
                t.tag = 14, t = Hm(
                  null,
                  t,
                  e,
                  r,
                  n
                );
                break e;
              }
            }
            throw t = xt(e) || e, Error(s(306, t, ""));
          }
        }
        return t;
      case 0:
        return Cs(
          e,
          t,
          t.type,
          t.pendingProps,
          n
        );
      case 1:
        return r = t.type, l = ba(
          r,
          t.pendingProps
        ), Vm(
          e,
          t,
          r,
          l,
          n
        );
      case 3:
        e: {
          if (ut(
            t,
            t.stateNode.containerInfo
          ), e === null) throw Error(s(387));
          r = t.pendingProps;
          var c = t.memoizedState;
          l = c.element, is(e, t), Cr(t, r, null, n);
          var m = t.memoizedState;
          if (r = m.cache, On(t, $e, r), r !== c.cache && es(
            t,
            [$e],
            n,
            !0
          ), kr(), r = m.element, c.isDehydrated)
            if (c = {
              element: r,
              isDehydrated: !1,
              cache: m.cache
            }, t.updateQueue.baseState = c, t.memoizedState = c, t.flags & 256) {
              t = Fm(
                e,
                t,
                r,
                n
              );
              break e;
            } else if (r !== l) {
              l = It(
                Error(s(424)),
                t
              ), _r(l), t = Fm(
                e,
                t,
                r,
                n
              );
              break e;
            } else {
              switch (e = t.stateNode.containerInfo, e.nodeType) {
                case 9:
                  e = e.body;
                  break;
                default:
                  e = e.nodeName === "HTML" ? e.ownerDocument.body : e;
              }
              for (Re = Ht(e.firstChild), tt = t, me = !0, An = null, Ut = !0, n = Yu(
                t,
                null,
                r,
                n
              ), t.child = n; n; )
                n.flags = n.flags & -3 | 4096, n = n.sibling;
            }
          else {
            if (la(), r === l) {
              t = dn(
                e,
                t,
                n
              );
              break e;
            }
            at(e, t, r, n);
          }
          t = t.child;
        }
        return t;
      case 26:
        return di(e, t), e === null ? (n = sp(
          t.type,
          null,
          t.pendingProps,
          null
        )) ? t.memoizedState = n : me || (n = t.type, e = t.pendingProps, r = Oi(
          ie.current
        ).createElement(n), r[et] = t, r[ft] = e, rt(r, n, e), Ze(r), t.stateNode = r) : t.memoizedState = sp(
          t.type,
          e.memoizedProps,
          t.pendingProps,
          e.memoizedState
        ), null;
      case 27:
        return dr(t), e === null && me && (r = t.stateNode = op(
          t.type,
          t.pendingProps,
          ie.current
        ), tt = t, Ut = !0, l = Re, Bn(t.type) ? (vc = l, Re = Ht(r.firstChild)) : Re = l), at(
          e,
          t,
          t.pendingProps.children,
          n
        ), di(e, t), e === null && (t.flags |= 4194304), t.child;
      case 5:
        return e === null && me && ((l = r = Re) && (r = Kg(
          r,
          t.type,
          t.pendingProps,
          Ut
        ), r !== null ? (t.stateNode = r, tt = t, Re = Ht(r.firstChild), Ut = !1, l = !0) : l = !1), l || _n(t)), dr(t), l = t.type, c = t.pendingProps, m = e !== null ? e.memoizedProps : null, r = c.children, pc(l, c) ? r = null : m !== null && pc(l, m) && (t.flags |= 32), t.memoizedState !== null && (l = fs(
          e,
          t,
          dg,
          null,
          null,
          n
        ), Wr._currentValue = l), di(e, t), at(e, t, r, n), t.child;
      case 6:
        return e === null && me && ((e = n = Re) && (n = Zg(
          n,
          t.pendingProps,
          Ut
        ), n !== null ? (t.stateNode = n, tt = t, Re = null, e = !0) : e = !1), e || _n(t)), null;
      case 13:
        return Xm(e, t, n);
      case 4:
        return ut(
          t,
          t.stateNode.containerInfo
        ), r = t.pendingProps, e === null ? t.child = fa(
          t,
          null,
          r,
          n
        ) : at(e, t, r, n), t.child;
      case 11:
        return Lm(
          e,
          t,
          t.type,
          t.pendingProps,
          n
        );
      case 7:
        return at(
          e,
          t,
          t.pendingProps,
          n
        ), t.child;
      case 8:
        return at(
          e,
          t,
          t.pendingProps.children,
          n
        ), t.child;
      case 12:
        return at(
          e,
          t,
          t.pendingProps.children,
          n
        ), t.child;
      case 10:
        return r = t.pendingProps, On(t, t.type, r.value), at(e, t, r.children, n), t.child;
      case 9:
        return l = t.type._context, r = t.pendingProps.children, ca(t), l = nt(l), r = r(l), t.flags |= 1, at(e, t, r, n), t.child;
      case 14:
        return Hm(
          e,
          t,
          t.type,
          t.pendingProps,
          n
        );
      case 15:
        return Bm(
          e,
          t,
          t.type,
          t.pendingProps,
          n
        );
      case 19:
        return Km(e, t, n);
      case 31:
        return gg(e, t, n);
      case 22:
        return Ym(
          e,
          t,
          n,
          t.pendingProps
        );
      case 24:
        return ca(t), r = nt($e), e === null ? (l = as(), l === null && (l = Oe, c = ts(), l.pooledCache = c, c.refCount++, c !== null && (l.pooledCacheLanes |= n), l = c), t.memoizedState = { parent: r, cache: l }, os(t), On(t, $e, l)) : ((e.lanes & n) !== 0 && (is(e, t), Cr(t, null, null, n), kr()), l = e.memoizedState, c = t.memoizedState, l.parent !== r ? (l = { parent: r, cache: r }, t.memoizedState = l, t.lanes === 0 && (t.memoizedState = t.updateQueue.baseState = l), On(t, $e, r)) : (r = c.cache, On(t, $e, r), r !== l.cache && es(
          t,
          [$e],
          n,
          !0
        ))), at(
          e,
          t,
          t.pendingProps.children,
          n
        ), t.child;
      case 29:
        throw t.pendingProps;
    }
    throw Error(s(156, t.tag));
  }
  function un(e) {
    e.flags |= 4;
  }
  function Ys(e, t, n, r, l) {
    if ((t = (e.mode & 32) !== 0) && (t = !1), t) {
      if (e.flags |= 16777216, (l & 335544128) === l)
        if (e.stateNode.complete) e.flags |= 8192;
        else if (Ef()) e.flags |= 8192;
        else
          throw ma = Ko, rs;
    } else e.flags &= -16777217;
  }
  function Qm(e, t) {
    if (t.type !== "stylesheet" || (t.state.loading & 4) !== 0)
      e.flags &= -16777217;
    else if (e.flags |= 16777216, !fp(t))
      if (Ef()) e.flags |= 8192;
      else
        throw ma = Ko, rs;
  }
  function mi(e, t) {
    t !== null && (e.flags |= 4), e.flags & 16384 && (t = e.tag !== 22 ? Td() : 536870912, e.lanes |= t, Za |= t);
  }
  function Hr(e, t) {
    if (!me)
      switch (e.tailMode) {
        case "hidden":
          t = e.tail;
          for (var n = null; t !== null; )
            t.alternate !== null && (n = t), t = t.sibling;
          n === null ? e.tail = null : n.sibling = null;
          break;
        case "collapsed":
          n = e.tail;
          for (var r = null; n !== null; )
            n.alternate !== null && (r = n), n = n.sibling;
          r === null ? t || e.tail === null ? e.tail = null : e.tail.sibling = null : r.sibling = null;
      }
  }
  function ke(e) {
    var t = e.alternate !== null && e.alternate.child === e.child, n = 0, r = 0;
    if (t)
      for (var l = e.child; l !== null; )
        n |= l.lanes | l.childLanes, r |= l.subtreeFlags & 65011712, r |= l.flags & 65011712, l.return = e, l = l.sibling;
    else
      for (l = e.child; l !== null; )
        n |= l.lanes | l.childLanes, r |= l.subtreeFlags, r |= l.flags, l.return = e, l = l.sibling;
    return e.subtreeFlags |= r, e.childLanes = n, t;
  }
  function xg(e, t, n) {
    var r = t.pendingProps;
    switch (Kl(t), t.tag) {
      case 16:
      case 15:
      case 0:
      case 11:
      case 7:
      case 8:
      case 12:
      case 9:
      case 14:
        return ke(t), null;
      case 1:
        return ke(t), null;
      case 3:
        return n = t.stateNode, r = null, e !== null && (r = e.memoizedState.cache), t.memoizedState.cache !== r && (t.flags |= 2048), ln($e), Le(), n.pendingContext && (n.context = n.pendingContext, n.pendingContext = null), (e === null || e.child === null) && (Ua(t) ? un(t) : e === null || e.memoizedState.isDehydrated && (t.flags & 256) === 0 || (t.flags |= 1024, Ql())), ke(t), null;
      case 26:
        var l = t.type, c = t.memoizedState;
        return e === null ? (un(t), c !== null ? (ke(t), Qm(t, c)) : (ke(t), Ys(
          t,
          l,
          null,
          r,
          n
        ))) : c ? c !== e.memoizedState ? (un(t), ke(t), Qm(t, c)) : (ke(t), t.flags &= -16777217) : (e = e.memoizedProps, e !== r && un(t), ke(t), Ys(
          t,
          l,
          e,
          r,
          n
        )), null;
      case 27:
        if (jo(t), n = ie.current, l = t.type, e !== null && t.stateNode != null)
          e.memoizedProps !== r && un(t);
        else {
          if (!r) {
            if (t.stateNode === null)
              throw Error(s(166));
            return ke(t), null;
          }
          e = F.current, Ua(t) ? Tu(t) : (e = op(l, r, n), t.stateNode = e, un(t));
        }
        return ke(t), null;
      case 5:
        if (jo(t), l = t.type, e !== null && t.stateNode != null)
          e.memoizedProps !== r && un(t);
        else {
          if (!r) {
            if (t.stateNode === null)
              throw Error(s(166));
            return ke(t), null;
          }
          if (c = F.current, Ua(t))
            Tu(t);
          else {
            var m = Oi(
              ie.current
            );
            switch (c) {
              case 1:
                c = m.createElementNS(
                  "http://www.w3.org/2000/svg",
                  l
                );
                break;
              case 2:
                c = m.createElementNS(
                  "http://www.w3.org/1998/Math/MathML",
                  l
                );
                break;
              default:
                switch (l) {
                  case "svg":
                    c = m.createElementNS(
                      "http://www.w3.org/2000/svg",
                      l
                    );
                    break;
                  case "math":
                    c = m.createElementNS(
                      "http://www.w3.org/1998/Math/MathML",
                      l
                    );
                    break;
                  case "script":
                    c = m.createElement("div"), c.innerHTML = "<script><\/script>", c = c.removeChild(
                      c.firstChild
                    );
                    break;
                  case "select":
                    c = typeof r.is == "string" ? m.createElement("select", {
                      is: r.is
                    }) : m.createElement("select"), r.multiple ? c.multiple = !0 : r.size && (c.size = r.size);
                    break;
                  default:
                    c = typeof r.is == "string" ? m.createElement(l, { is: r.is }) : m.createElement(l);
                }
            }
            c[et] = t, c[ft] = r;
            e: for (m = t.child; m !== null; ) {
              if (m.tag === 5 || m.tag === 6)
                c.appendChild(m.stateNode);
              else if (m.tag !== 4 && m.tag !== 27 && m.child !== null) {
                m.child.return = m, m = m.child;
                continue;
              }
              if (m === t) break e;
              for (; m.sibling === null; ) {
                if (m.return === null || m.return === t)
                  break e;
                m = m.return;
              }
              m.sibling.return = m.return, m = m.sibling;
            }
            t.stateNode = c;
            e: switch (rt(c, l, r), l) {
              case "button":
              case "input":
              case "select":
              case "textarea":
                r = !!r.autoFocus;
                break e;
              case "img":
                r = !0;
                break e;
              default:
                r = !1;
            }
            r && un(t);
          }
        }
        return ke(t), Ys(
          t,
          t.type,
          e === null ? null : e.memoizedProps,
          t.pendingProps,
          n
        ), null;
      case 6:
        if (e && t.stateNode != null)
          e.memoizedProps !== r && un(t);
        else {
          if (typeof r != "string" && t.stateNode === null)
            throw Error(s(166));
          if (e = ie.current, Ua(t)) {
            if (e = t.stateNode, n = t.memoizedProps, r = null, l = tt, l !== null)
              switch (l.tag) {
                case 27:
                case 5:
                  r = l.memoizedProps;
              }
            e[et] = t, e = !!(e.nodeValue === n || r !== null && r.suppressHydrationWarning === !0 || Pf(e.nodeValue, n)), e || _n(t, !0);
          } else
            e = Oi(e).createTextNode(
              r
            ), e[et] = t, t.stateNode = e;
        }
        return ke(t), null;
      case 31:
        if (n = t.memoizedState, e === null || e.memoizedState !== null) {
          if (r = Ua(t), n !== null) {
            if (e === null) {
              if (!r) throw Error(s(318));
              if (e = t.memoizedState, e = e !== null ? e.dehydrated : null, !e) throw Error(s(557));
              e[et] = t;
            } else
              la(), (t.flags & 128) === 0 && (t.memoizedState = null), t.flags |= 4;
            ke(t), e = !1;
          } else
            n = Ql(), e !== null && e.memoizedState !== null && (e.memoizedState.hydrationErrors = n), e = !0;
          if (!e)
            return t.flags & 256 ? (Ot(t), t) : (Ot(t), null);
          if ((t.flags & 128) !== 0)
            throw Error(s(558));
        }
        return ke(t), null;
      case 13:
        if (r = t.memoizedState, e === null || e.memoizedState !== null && e.memoizedState.dehydrated !== null) {
          if (l = Ua(t), r !== null && r.dehydrated !== null) {
            if (e === null) {
              if (!l) throw Error(s(318));
              if (l = t.memoizedState, l = l !== null ? l.dehydrated : null, !l) throw Error(s(317));
              l[et] = t;
            } else
              la(), (t.flags & 128) === 0 && (t.memoizedState = null), t.flags |= 4;
            ke(t), l = !1;
          } else
            l = Ql(), e !== null && e.memoizedState !== null && (e.memoizedState.hydrationErrors = l), l = !0;
          if (!l)
            return t.flags & 256 ? (Ot(t), t) : (Ot(t), null);
        }
        return Ot(t), (t.flags & 128) !== 0 ? (t.lanes = n, t) : (n = r !== null, e = e !== null && e.memoizedState !== null, n && (r = t.child, l = null, r.alternate !== null && r.alternate.memoizedState !== null && r.alternate.memoizedState.cachePool !== null && (l = r.alternate.memoizedState.cachePool.pool), c = null, r.memoizedState !== null && r.memoizedState.cachePool !== null && (c = r.memoizedState.cachePool.pool), c !== l && (r.flags |= 2048)), n !== e && n && (t.child.flags |= 8192), mi(t, t.updateQueue), ke(t), null);
      case 4:
        return Le(), e === null && cc(t.stateNode.containerInfo), ke(t), null;
      case 10:
        return ln(t.type), ke(t), null;
      case 19:
        if (T(He), r = t.memoizedState, r === null) return ke(t), null;
        if (l = (t.flags & 128) !== 0, c = r.rendering, c === null)
          if (l) Hr(r, !1);
          else {
            if (De !== 0 || e !== null && (e.flags & 128) !== 0)
              for (e = t.child; e !== null; ) {
                if (c = Wo(e), c !== null) {
                  for (t.flags |= 128, Hr(r, !1), e = c.updateQueue, t.updateQueue = e, mi(t, e), t.subtreeFlags = 0, e = n, n = t.child; n !== null; )
                    Au(n, e), n = n.sibling;
                  return Y(
                    He,
                    He.current & 1 | 2
                  ), me && rn(t, r.treeForkCount), t.child;
                }
                e = e.sibling;
              }
            r.tail !== null && wt() > yi && (t.flags |= 128, l = !0, Hr(r, !1), t.lanes = 4194304);
          }
        else {
          if (!l)
            if (e = Wo(c), e !== null) {
              if (t.flags |= 128, l = !0, e = e.updateQueue, t.updateQueue = e, mi(t, e), Hr(r, !0), r.tail === null && r.tailMode === "hidden" && !c.alternate && !me)
                return ke(t), null;
            } else
              2 * wt() - r.renderingStartTime > yi && n !== 536870912 && (t.flags |= 128, l = !0, Hr(r, !1), t.lanes = 4194304);
          r.isBackwards ? (c.sibling = t.child, t.child = c) : (e = r.last, e !== null ? e.sibling = c : t.child = c, r.last = c);
        }
        return r.tail !== null ? (e = r.tail, r.rendering = e, r.tail = e.sibling, r.renderingStartTime = wt(), e.sibling = null, n = He.current, Y(
          He,
          l ? n & 1 | 2 : n & 1
        ), me && rn(t, r.treeForkCount), e) : (ke(t), null);
      case 22:
      case 23:
        return Ot(t), ds(), r = t.memoizedState !== null, e !== null ? e.memoizedState !== null !== r && (t.flags |= 8192) : r && (t.flags |= 8192), r ? (n & 536870912) !== 0 && (t.flags & 128) === 0 && (ke(t), t.subtreeFlags & 6 && (t.flags |= 8192)) : ke(t), n = t.updateQueue, n !== null && mi(t, n.retryQueue), n = null, e !== null && e.memoizedState !== null && e.memoizedState.cachePool !== null && (n = e.memoizedState.cachePool.pool), r = null, t.memoizedState !== null && t.memoizedState.cachePool !== null && (r = t.memoizedState.cachePool.pool), r !== n && (t.flags |= 2048), e !== null && T(da), null;
      case 24:
        return n = null, e !== null && (n = e.memoizedState.cache), t.memoizedState.cache !== n && (t.flags |= 2048), ln($e), ke(t), null;
      case 25:
        return null;
      case 30:
        return null;
    }
    throw Error(s(156, t.tag));
  }
  function wg(e, t) {
    switch (Kl(t), t.tag) {
      case 1:
        return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
      case 3:
        return ln($e), Le(), e = t.flags, (e & 65536) !== 0 && (e & 128) === 0 ? (t.flags = e & -65537 | 128, t) : null;
      case 26:
      case 27:
      case 5:
        return jo(t), null;
      case 31:
        if (t.memoizedState !== null) {
          if (Ot(t), t.alternate === null)
            throw Error(s(340));
          la();
        }
        return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
      case 13:
        if (Ot(t), e = t.memoizedState, e !== null && e.dehydrated !== null) {
          if (t.alternate === null)
            throw Error(s(340));
          la();
        }
        return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
      case 19:
        return T(He), null;
      case 4:
        return Le(), null;
      case 10:
        return ln(t.type), null;
      case 22:
      case 23:
        return Ot(t), ds(), e !== null && T(da), e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
      case 24:
        return ln($e), null;
      case 25:
        return null;
      default:
        return null;
    }
  }
  function Jm(e, t) {
    switch (Kl(t), t.tag) {
      case 3:
        ln($e), Le();
        break;
      case 26:
      case 27:
      case 5:
        jo(t);
        break;
      case 4:
        Le();
        break;
      case 31:
        t.memoizedState !== null && Ot(t);
        break;
      case 13:
        Ot(t);
        break;
      case 19:
        T(He);
        break;
      case 10:
        ln(t.type);
        break;
      case 22:
      case 23:
        Ot(t), ds(), e !== null && T(da);
        break;
      case 24:
        ln($e);
    }
  }
  function Br(e, t) {
    try {
      var n = t.updateQueue, r = n !== null ? n.lastEffect : null;
      if (r !== null) {
        var l = r.next;
        n = l;
        do {
          if ((n.tag & e) === e) {
            r = void 0;
            var c = n.create, m = n.inst;
            r = c(), m.destroy = r;
          }
          n = n.next;
        } while (n !== l);
      }
    } catch (b) {
      Se(t, t.return, b);
    }
  }
  function Cn(e, t, n) {
    try {
      var r = t.updateQueue, l = r !== null ? r.lastEffect : null;
      if (l !== null) {
        var c = l.next;
        r = c;
        do {
          if ((r.tag & e) === e) {
            var m = r.inst, b = m.destroy;
            if (b !== void 0) {
              m.destroy = void 0, l = t;
              var v = n, _ = b;
              try {
                _();
              } catch (I) {
                Se(
                  l,
                  v,
                  I
                );
              }
            }
          }
          r = r.next;
        } while (r !== c);
      }
    } catch (I) {
      Se(t, t.return, I);
    }
  }
  function Wm(e) {
    var t = e.updateQueue;
    if (t !== null) {
      var n = e.stateNode;
      try {
        Gu(t, n);
      } catch (r) {
        Se(e, e.return, r);
      }
    }
  }
  function ef(e, t, n) {
    n.props = ba(
      e.type,
      e.memoizedProps
    ), n.state = e.memoizedState;
    try {
      n.componentWillUnmount();
    } catch (r) {
      Se(e, t, r);
    }
  }
  function Yr(e, t) {
    try {
      var n = e.ref;
      if (n !== null) {
        switch (e.tag) {
          case 26:
          case 27:
          case 5:
            var r = e.stateNode;
            break;
          case 30:
            r = e.stateNode;
            break;
          default:
            r = e.stateNode;
        }
        typeof n == "function" ? e.refCleanup = n(r) : n.current = r;
      }
    } catch (l) {
      Se(e, t, l);
    }
  }
  function Kt(e, t) {
    var n = e.ref, r = e.refCleanup;
    if (n !== null)
      if (typeof r == "function")
        try {
          r();
        } catch (l) {
          Se(e, t, l);
        } finally {
          e.refCleanup = null, e = e.alternate, e != null && (e.refCleanup = null);
        }
      else if (typeof n == "function")
        try {
          n(null);
        } catch (l) {
          Se(e, t, l);
        }
      else n.current = null;
  }
  function tf(e) {
    var t = e.type, n = e.memoizedProps, r = e.stateNode;
    try {
      e: switch (t) {
        case "button":
        case "input":
        case "select":
        case "textarea":
          n.autoFocus && r.focus();
          break e;
        case "img":
          n.src ? r.src = n.src : n.srcSet && (r.srcset = n.srcSet);
      }
    } catch (l) {
      Se(e, e.return, l);
    }
  }
  function $s(e, t, n) {
    try {
      var r = e.stateNode;
      Gg(r, e.type, n, t), r[ft] = t;
    } catch (l) {
      Se(e, e.return, l);
    }
  }
  function nf(e) {
    return e.tag === 5 || e.tag === 3 || e.tag === 26 || e.tag === 27 && Bn(e.type) || e.tag === 4;
  }
  function Gs(e) {
    e: for (; ; ) {
      for (; e.sibling === null; ) {
        if (e.return === null || nf(e.return)) return null;
        e = e.return;
      }
      for (e.sibling.return = e.return, e = e.sibling; e.tag !== 5 && e.tag !== 6 && e.tag !== 18; ) {
        if (e.tag === 27 && Bn(e.type) || e.flags & 2 || e.child === null || e.tag === 4) continue e;
        e.child.return = e, e = e.child;
      }
      if (!(e.flags & 2)) return e.stateNode;
    }
  }
  function qs(e, t, n) {
    var r = e.tag;
    if (r === 5 || r === 6)
      e = e.stateNode, t ? (n.nodeType === 9 ? n.body : n.nodeName === "HTML" ? n.ownerDocument.body : n).insertBefore(e, t) : (t = n.nodeType === 9 ? n.body : n.nodeName === "HTML" ? n.ownerDocument.body : n, t.appendChild(e), n = n._reactRootContainer, n != null || t.onclick !== null || (t.onclick = tn));
    else if (r !== 4 && (r === 27 && Bn(e.type) && (n = e.stateNode, t = null), e = e.child, e !== null))
      for (qs(e, t, n), e = e.sibling; e !== null; )
        qs(e, t, n), e = e.sibling;
  }
  function fi(e, t, n) {
    var r = e.tag;
    if (r === 5 || r === 6)
      e = e.stateNode, t ? n.insertBefore(e, t) : n.appendChild(e);
    else if (r !== 4 && (r === 27 && Bn(e.type) && (n = e.stateNode), e = e.child, e !== null))
      for (fi(e, t, n), e = e.sibling; e !== null; )
        fi(e, t, n), e = e.sibling;
  }
  function af(e) {
    var t = e.stateNode, n = e.memoizedProps;
    try {
      for (var r = e.type, l = t.attributes; l.length; )
        t.removeAttributeNode(l[0]);
      rt(t, r, n), t[et] = e, t[ft] = n;
    } catch (c) {
      Se(e, e.return, c);
    }
  }
  var mn = !1, Ve = !1, Vs = !1, rf = typeof WeakSet == "function" ? WeakSet : Set, Qe = null;
  function Sg(e, t) {
    if (e = e.containerInfo, mc = Ii, e = hu(e), Ll(e)) {
      if ("selectionStart" in e)
        var n = {
          start: e.selectionStart,
          end: e.selectionEnd
        };
      else
        e: {
          n = (n = e.ownerDocument) && n.defaultView || window;
          var r = n.getSelection && n.getSelection();
          if (r && r.rangeCount !== 0) {
            n = r.anchorNode;
            var l = r.anchorOffset, c = r.focusNode;
            r = r.focusOffset;
            try {
              n.nodeType, c.nodeType;
            } catch {
              n = null;
              break e;
            }
            var m = 0, b = -1, v = -1, _ = 0, I = 0, L = e, N = null;
            t: for (; ; ) {
              for (var k; L !== n || l !== 0 && L.nodeType !== 3 || (b = m + l), L !== c || r !== 0 && L.nodeType !== 3 || (v = m + r), L.nodeType === 3 && (m += L.nodeValue.length), (k = L.firstChild) !== null; )
                N = L, L = k;
              for (; ; ) {
                if (L === e) break t;
                if (N === n && ++_ === l && (b = m), N === c && ++I === r && (v = m), (k = L.nextSibling) !== null) break;
                L = N, N = L.parentNode;
              }
              L = k;
            }
            n = b === -1 || v === -1 ? null : { start: b, end: v };
          } else n = null;
        }
      n = n || { start: 0, end: 0 };
    } else n = null;
    for (fc = { focusedElem: e, selectionRange: n }, Ii = !1, Qe = t; Qe !== null; )
      if (t = Qe, e = t.child, (t.subtreeFlags & 1028) !== 0 && e !== null)
        e.return = t, Qe = e;
      else
        for (; Qe !== null; ) {
          switch (t = Qe, c = t.alternate, e = t.flags, t.tag) {
            case 0:
              if ((e & 4) !== 0 && (e = t.updateQueue, e = e !== null ? e.events : null, e !== null))
                for (n = 0; n < e.length; n++)
                  l = e[n], l.ref.impl = l.nextImpl;
              break;
            case 11:
            case 15:
              break;
            case 1:
              if ((e & 1024) !== 0 && c !== null) {
                e = void 0, n = t, l = c.memoizedProps, c = c.memoizedState, r = n.stateNode;
                try {
                  var G = ba(
                    n.type,
                    l
                  );
                  e = r.getSnapshotBeforeUpdate(
                    G,
                    c
                  ), r.__reactInternalSnapshotBeforeUpdate = e;
                } catch (Q) {
                  Se(
                    n,
                    n.return,
                    Q
                  );
                }
              }
              break;
            case 3:
              if ((e & 1024) !== 0) {
                if (e = t.stateNode.containerInfo, n = e.nodeType, n === 9)
                  hc(e);
                else if (n === 1)
                  switch (e.nodeName) {
                    case "HEAD":
                    case "HTML":
                    case "BODY":
                      hc(e);
                      break;
                    default:
                      e.textContent = "";
                  }
              }
              break;
            case 5:
            case 26:
            case 27:
            case 6:
            case 4:
            case 17:
              break;
            default:
              if ((e & 1024) !== 0) throw Error(s(163));
          }
          if (e = t.sibling, e !== null) {
            e.return = t.return, Qe = e;
            break;
          }
          Qe = t.return;
        }
  }
  function of(e, t, n) {
    var r = n.flags;
    switch (n.tag) {
      case 0:
      case 11:
      case 15:
        pn(e, n), r & 4 && Br(5, n);
        break;
      case 1:
        if (pn(e, n), r & 4)
          if (e = n.stateNode, t === null)
            try {
              e.componentDidMount();
            } catch (m) {
              Se(n, n.return, m);
            }
          else {
            var l = ba(
              n.type,
              t.memoizedProps
            );
            t = t.memoizedState;
            try {
              e.componentDidUpdate(
                l,
                t,
                e.__reactInternalSnapshotBeforeUpdate
              );
            } catch (m) {
              Se(
                n,
                n.return,
                m
              );
            }
          }
        r & 64 && Wm(n), r & 512 && Yr(n, n.return);
        break;
      case 3:
        if (pn(e, n), r & 64 && (e = n.updateQueue, e !== null)) {
          if (t = null, n.child !== null)
            switch (n.child.tag) {
              case 27:
              case 5:
                t = n.child.stateNode;
                break;
              case 1:
                t = n.child.stateNode;
            }
          try {
            Gu(e, t);
          } catch (m) {
            Se(n, n.return, m);
          }
        }
        break;
      case 27:
        t === null && r & 4 && af(n);
      case 26:
      case 5:
        pn(e, n), t === null && r & 4 && tf(n), r & 512 && Yr(n, n.return);
        break;
      case 12:
        pn(e, n);
        break;
      case 31:
        pn(e, n), r & 4 && cf(e, n);
        break;
      case 13:
        pn(e, n), r & 4 && df(e, n), r & 64 && (e = n.memoizedState, e !== null && (e = e.dehydrated, e !== null && (n = Rg.bind(
          null,
          n
        ), Qg(e, n))));
        break;
      case 22:
        if (r = n.memoizedState !== null || mn, !r) {
          t = t !== null && t.memoizedState !== null || Ve, l = mn;
          var c = Ve;
          mn = r, (Ve = t) && !c ? bn(
            e,
            n,
            (n.subtreeFlags & 8772) !== 0
          ) : pn(e, n), mn = l, Ve = c;
        }
        break;
      case 30:
        break;
      default:
        pn(e, n);
    }
  }
  function lf(e) {
    var t = e.alternate;
    t !== null && (e.alternate = null, lf(t)), e.child = null, e.deletions = null, e.sibling = null, e.tag === 5 && (t = e.stateNode, t !== null && wl(t)), e.stateNode = null, e.return = null, e.dependencies = null, e.memoizedProps = null, e.memoizedState = null, e.pendingProps = null, e.stateNode = null, e.updateQueue = null;
  }
  var Ce = null, bt = !1;
  function fn(e, t, n) {
    for (n = n.child; n !== null; )
      sf(e, t, n), n = n.sibling;
  }
  function sf(e, t, n) {
    if (St && typeof St.onCommitFiberUnmount == "function")
      try {
        St.onCommitFiberUnmount(ur, n);
      } catch {
      }
    switch (n.tag) {
      case 26:
        Ve || Kt(n, t), fn(
          e,
          t,
          n
        ), n.memoizedState ? n.memoizedState.count-- : n.stateNode && (n = n.stateNode, n.parentNode.removeChild(n));
        break;
      case 27:
        Ve || Kt(n, t);
        var r = Ce, l = bt;
        Bn(n.type) && (Ce = n.stateNode, bt = !1), fn(
          e,
          t,
          n
        ), Zr(n.stateNode), Ce = r, bt = l;
        break;
      case 5:
        Ve || Kt(n, t);
      case 6:
        if (r = Ce, l = bt, Ce = null, fn(
          e,
          t,
          n
        ), Ce = r, bt = l, Ce !== null)
          if (bt)
            try {
              (Ce.nodeType === 9 ? Ce.body : Ce.nodeName === "HTML" ? Ce.ownerDocument.body : Ce).removeChild(n.stateNode);
            } catch (c) {
              Se(
                n,
                t,
                c
              );
            }
          else
            try {
              Ce.removeChild(n.stateNode);
            } catch (c) {
              Se(
                n,
                t,
                c
              );
            }
        break;
      case 18:
        Ce !== null && (bt ? (e = Ce, ep(
          e.nodeType === 9 ? e.body : e.nodeName === "HTML" ? e.ownerDocument.body : e,
          n.stateNode
        ), rr(e)) : ep(Ce, n.stateNode));
        break;
      case 4:
        r = Ce, l = bt, Ce = n.stateNode.containerInfo, bt = !0, fn(
          e,
          t,
          n
        ), Ce = r, bt = l;
        break;
      case 0:
      case 11:
      case 14:
      case 15:
        Cn(2, n, t), Ve || Cn(4, n, t), fn(
          e,
          t,
          n
        );
        break;
      case 1:
        Ve || (Kt(n, t), r = n.stateNode, typeof r.componentWillUnmount == "function" && ef(
          n,
          t,
          r
        )), fn(
          e,
          t,
          n
        );
        break;
      case 21:
        fn(
          e,
          t,
          n
        );
        break;
      case 22:
        Ve = (r = Ve) || n.memoizedState !== null, fn(
          e,
          t,
          n
        ), Ve = r;
        break;
      default:
        fn(
          e,
          t,
          n
        );
    }
  }
  function cf(e, t) {
    if (t.memoizedState === null && (e = t.alternate, e !== null && (e = e.memoizedState, e !== null))) {
      e = e.dehydrated;
      try {
        rr(e);
      } catch (n) {
        Se(t, t.return, n);
      }
    }
  }
  function df(e, t) {
    if (t.memoizedState === null && (e = t.alternate, e !== null && (e = e.memoizedState, e !== null && (e = e.dehydrated, e !== null))))
      try {
        rr(e);
      } catch (n) {
        Se(t, t.return, n);
      }
  }
  function jg(e) {
    switch (e.tag) {
      case 31:
      case 13:
      case 19:
        var t = e.stateNode;
        return t === null && (t = e.stateNode = new rf()), t;
      case 22:
        return e = e.stateNode, t = e._retryCache, t === null && (t = e._retryCache = new rf()), t;
      default:
        throw Error(s(435, e.tag));
    }
  }
  function pi(e, t) {
    var n = jg(e);
    t.forEach(function(r) {
      if (!n.has(r)) {
        n.add(r);
        var l = kg.bind(null, e, r);
        r.then(l, l);
      }
    });
  }
  function ht(e, t) {
    var n = t.deletions;
    if (n !== null)
      for (var r = 0; r < n.length; r++) {
        var l = n[r], c = e, m = t, b = m;
        e: for (; b !== null; ) {
          switch (b.tag) {
            case 27:
              if (Bn(b.type)) {
                Ce = b.stateNode, bt = !1;
                break e;
              }
              break;
            case 5:
              Ce = b.stateNode, bt = !1;
              break e;
            case 3:
            case 4:
              Ce = b.stateNode.containerInfo, bt = !0;
              break e;
          }
          b = b.return;
        }
        if (Ce === null) throw Error(s(160));
        sf(c, m, l), Ce = null, bt = !1, c = l.alternate, c !== null && (c.return = null), l.return = null;
      }
    if (t.subtreeFlags & 13886)
      for (t = t.child; t !== null; )
        uf(t, e), t = t.sibling;
  }
  var Gt = null;
  function uf(e, t) {
    var n = e.alternate, r = e.flags;
    switch (e.tag) {
      case 0:
      case 11:
      case 14:
      case 15:
        ht(t, e), yt(e), r & 4 && (Cn(3, e, e.return), Br(3, e), Cn(5, e, e.return));
        break;
      case 1:
        ht(t, e), yt(e), r & 512 && (Ve || n === null || Kt(n, n.return)), r & 64 && mn && (e = e.updateQueue, e !== null && (r = e.callbacks, r !== null && (n = e.shared.hiddenCallbacks, e.shared.hiddenCallbacks = n === null ? r : n.concat(r))));
        break;
      case 26:
        var l = Gt;
        if (ht(t, e), yt(e), r & 512 && (Ve || n === null || Kt(n, n.return)), r & 4) {
          var c = n !== null ? n.memoizedState : null;
          if (r = e.memoizedState, n === null)
            if (r === null)
              if (e.stateNode === null) {
                e: {
                  r = e.type, n = e.memoizedProps, l = l.ownerDocument || l;
                  t: switch (r) {
                    case "title":
                      c = l.getElementsByTagName("title")[0], (!c || c[pr] || c[et] || c.namespaceURI === "http://www.w3.org/2000/svg" || c.hasAttribute("itemprop")) && (c = l.createElement(r), l.head.insertBefore(
                        c,
                        l.querySelector("head > title")
                      )), rt(c, r, n), c[et] = e, Ze(c), r = c;
                      break e;
                    case "link":
                      var m = up(
                        "link",
                        "href",
                        l
                      ).get(r + (n.href || ""));
                      if (m) {
                        for (var b = 0; b < m.length; b++)
                          if (c = m[b], c.getAttribute("href") === (n.href == null || n.href === "" ? null : n.href) && c.getAttribute("rel") === (n.rel == null ? null : n.rel) && c.getAttribute("title") === (n.title == null ? null : n.title) && c.getAttribute("crossorigin") === (n.crossOrigin == null ? null : n.crossOrigin)) {
                            m.splice(b, 1);
                            break t;
                          }
                      }
                      c = l.createElement(r), rt(c, r, n), l.head.appendChild(c);
                      break;
                    case "meta":
                      if (m = up(
                        "meta",
                        "content",
                        l
                      ).get(r + (n.content || ""))) {
                        for (b = 0; b < m.length; b++)
                          if (c = m[b], c.getAttribute("content") === (n.content == null ? null : "" + n.content) && c.getAttribute("name") === (n.name == null ? null : n.name) && c.getAttribute("property") === (n.property == null ? null : n.property) && c.getAttribute("http-equiv") === (n.httpEquiv == null ? null : n.httpEquiv) && c.getAttribute("charset") === (n.charSet == null ? null : n.charSet)) {
                            m.splice(b, 1);
                            break t;
                          }
                      }
                      c = l.createElement(r), rt(c, r, n), l.head.appendChild(c);
                      break;
                    default:
                      throw Error(s(468, r));
                  }
                  c[et] = e, Ze(c), r = c;
                }
                e.stateNode = r;
              } else
                mp(
                  l,
                  e.type,
                  e.stateNode
                );
            else
              e.stateNode = dp(
                l,
                r,
                e.memoizedProps
              );
          else
            c !== r ? (c === null ? n.stateNode !== null && (n = n.stateNode, n.parentNode.removeChild(n)) : c.count--, r === null ? mp(
              l,
              e.type,
              e.stateNode
            ) : dp(
              l,
              r,
              e.memoizedProps
            )) : r === null && e.stateNode !== null && $s(
              e,
              e.memoizedProps,
              n.memoizedProps
            );
        }
        break;
      case 27:
        ht(t, e), yt(e), r & 512 && (Ve || n === null || Kt(n, n.return)), n !== null && r & 4 && $s(
          e,
          e.memoizedProps,
          n.memoizedProps
        );
        break;
      case 5:
        if (ht(t, e), yt(e), r & 512 && (Ve || n === null || Kt(n, n.return)), e.flags & 32) {
          l = e.stateNode;
          try {
            Oa(l, "");
          } catch (G) {
            Se(e, e.return, G);
          }
        }
        r & 4 && e.stateNode != null && (l = e.memoizedProps, $s(
          e,
          l,
          n !== null ? n.memoizedProps : l
        )), r & 1024 && (Vs = !0);
        break;
      case 6:
        if (ht(t, e), yt(e), r & 4) {
          if (e.stateNode === null)
            throw Error(s(162));
          r = e.memoizedProps, n = e.stateNode;
          try {
            n.nodeValue = r;
          } catch (G) {
            Se(e, e.return, G);
          }
        }
        break;
      case 3:
        if (Ti = null, l = Gt, Gt = zi(t.containerInfo), ht(t, e), Gt = l, yt(e), r & 4 && n !== null && n.memoizedState.isDehydrated)
          try {
            rr(t.containerInfo);
          } catch (G) {
            Se(e, e.return, G);
          }
        Vs && (Vs = !1, mf(e));
        break;
      case 4:
        r = Gt, Gt = zi(
          e.stateNode.containerInfo
        ), ht(t, e), yt(e), Gt = r;
        break;
      case 12:
        ht(t, e), yt(e);
        break;
      case 31:
        ht(t, e), yt(e), r & 4 && (r = e.updateQueue, r !== null && (e.updateQueue = null, pi(e, r)));
        break;
      case 13:
        ht(t, e), yt(e), e.child.flags & 8192 && e.memoizedState !== null != (n !== null && n.memoizedState !== null) && (hi = wt()), r & 4 && (r = e.updateQueue, r !== null && (e.updateQueue = null, pi(e, r)));
        break;
      case 22:
        l = e.memoizedState !== null;
        var v = n !== null && n.memoizedState !== null, _ = mn, I = Ve;
        if (mn = _ || l, Ve = I || v, ht(t, e), Ve = I, mn = _, yt(e), r & 8192)
          e: for (t = e.stateNode, t._visibility = l ? t._visibility & -2 : t._visibility | 1, l && (n === null || v || mn || Ve || ha(e)), n = null, t = e; ; ) {
            if (t.tag === 5 || t.tag === 26) {
              if (n === null) {
                v = n = t;
                try {
                  if (c = v.stateNode, l)
                    m = c.style, typeof m.setProperty == "function" ? m.setProperty("display", "none", "important") : m.display = "none";
                  else {
                    b = v.stateNode;
                    var L = v.memoizedProps.style, N = L != null && L.hasOwnProperty("display") ? L.display : null;
                    b.style.display = N == null || typeof N == "boolean" ? "" : ("" + N).trim();
                  }
                } catch (G) {
                  Se(v, v.return, G);
                }
              }
            } else if (t.tag === 6) {
              if (n === null) {
                v = t;
                try {
                  v.stateNode.nodeValue = l ? "" : v.memoizedProps;
                } catch (G) {
                  Se(v, v.return, G);
                }
              }
            } else if (t.tag === 18) {
              if (n === null) {
                v = t;
                try {
                  var k = v.stateNode;
                  l ? tp(k, !0) : tp(v.stateNode, !1);
                } catch (G) {
                  Se(v, v.return, G);
                }
              }
            } else if ((t.tag !== 22 && t.tag !== 23 || t.memoizedState === null || t === e) && t.child !== null) {
              t.child.return = t, t = t.child;
              continue;
            }
            if (t === e) break e;
            for (; t.sibling === null; ) {
              if (t.return === null || t.return === e) break e;
              n === t && (n = null), t = t.return;
            }
            n === t && (n = null), t.sibling.return = t.return, t = t.sibling;
          }
        r & 4 && (r = e.updateQueue, r !== null && (n = r.retryQueue, n !== null && (r.retryQueue = null, pi(e, n))));
        break;
      case 19:
        ht(t, e), yt(e), r & 4 && (r = e.updateQueue, r !== null && (e.updateQueue = null, pi(e, r)));
        break;
      case 30:
        break;
      case 21:
        break;
      default:
        ht(t, e), yt(e);
    }
  }
  function yt(e) {
    var t = e.flags;
    if (t & 2) {
      try {
        for (var n, r = e.return; r !== null; ) {
          if (nf(r)) {
            n = r;
            break;
          }
          r = r.return;
        }
        if (n == null) throw Error(s(160));
        switch (n.tag) {
          case 27:
            var l = n.stateNode, c = Gs(e);
            fi(e, c, l);
            break;
          case 5:
            var m = n.stateNode;
            n.flags & 32 && (Oa(m, ""), n.flags &= -33);
            var b = Gs(e);
            fi(e, b, m);
            break;
          case 3:
          case 4:
            var v = n.stateNode.containerInfo, _ = Gs(e);
            qs(
              e,
              _,
              v
            );
            break;
          default:
            throw Error(s(161));
        }
      } catch (I) {
        Se(e, e.return, I);
      }
      e.flags &= -3;
    }
    t & 4096 && (e.flags &= -4097);
  }
  function mf(e) {
    if (e.subtreeFlags & 1024)
      for (e = e.child; e !== null; ) {
        var t = e;
        mf(t), t.tag === 5 && t.flags & 1024 && t.stateNode.reset(), e = e.sibling;
      }
  }
  function pn(e, t) {
    if (t.subtreeFlags & 8772)
      for (t = t.child; t !== null; )
        of(e, t.alternate, t), t = t.sibling;
  }
  function ha(e) {
    for (e = e.child; e !== null; ) {
      var t = e;
      switch (t.tag) {
        case 0:
        case 11:
        case 14:
        case 15:
          Cn(4, t, t.return), ha(t);
          break;
        case 1:
          Kt(t, t.return);
          var n = t.stateNode;
          typeof n.componentWillUnmount == "function" && ef(
            t,
            t.return,
            n
          ), ha(t);
          break;
        case 27:
          Zr(t.stateNode);
        case 26:
        case 5:
          Kt(t, t.return), ha(t);
          break;
        case 22:
          t.memoizedState === null && ha(t);
          break;
        case 30:
          ha(t);
          break;
        default:
          ha(t);
      }
      e = e.sibling;
    }
  }
  function bn(e, t, n) {
    for (n = n && (t.subtreeFlags & 8772) !== 0, t = t.child; t !== null; ) {
      var r = t.alternate, l = e, c = t, m = c.flags;
      switch (c.tag) {
        case 0:
        case 11:
        case 15:
          bn(
            l,
            c,
            n
          ), Br(4, c);
          break;
        case 1:
          if (bn(
            l,
            c,
            n
          ), r = c, l = r.stateNode, typeof l.componentDidMount == "function")
            try {
              l.componentDidMount();
            } catch (_) {
              Se(r, r.return, _);
            }
          if (r = c, l = r.updateQueue, l !== null) {
            var b = r.stateNode;
            try {
              var v = l.shared.hiddenCallbacks;
              if (v !== null)
                for (l.shared.hiddenCallbacks = null, l = 0; l < v.length; l++)
                  $u(v[l], b);
            } catch (_) {
              Se(r, r.return, _);
            }
          }
          n && m & 64 && Wm(c), Yr(c, c.return);
          break;
        case 27:
          af(c);
        case 26:
        case 5:
          bn(
            l,
            c,
            n
          ), n && r === null && m & 4 && tf(c), Yr(c, c.return);
          break;
        case 12:
          bn(
            l,
            c,
            n
          );
          break;
        case 31:
          bn(
            l,
            c,
            n
          ), n && m & 4 && cf(l, c);
          break;
        case 13:
          bn(
            l,
            c,
            n
          ), n && m & 4 && df(l, c);
          break;
        case 22:
          c.memoizedState === null && bn(
            l,
            c,
            n
          ), Yr(c, c.return);
          break;
        case 30:
          break;
        default:
          bn(
            l,
            c,
            n
          );
      }
      t = t.sibling;
    }
  }
  function Fs(e, t) {
    var n = null;
    e !== null && e.memoizedState !== null && e.memoizedState.cachePool !== null && (n = e.memoizedState.cachePool.pool), e = null, t.memoizedState !== null && t.memoizedState.cachePool !== null && (e = t.memoizedState.cachePool.pool), e !== n && (e != null && e.refCount++, n != null && Or(n));
  }
  function Xs(e, t) {
    e = null, t.alternate !== null && (e = t.alternate.memoizedState.cache), t = t.memoizedState.cache, t !== e && (t.refCount++, e != null && Or(e));
  }
  function qt(e, t, n, r) {
    if (t.subtreeFlags & 10256)
      for (t = t.child; t !== null; )
        ff(
          e,
          t,
          n,
          r
        ), t = t.sibling;
  }
  function ff(e, t, n, r) {
    var l = t.flags;
    switch (t.tag) {
      case 0:
      case 11:
      case 15:
        qt(
          e,
          t,
          n,
          r
        ), l & 2048 && Br(9, t);
        break;
      case 1:
        qt(
          e,
          t,
          n,
          r
        );
        break;
      case 3:
        qt(
          e,
          t,
          n,
          r
        ), l & 2048 && (e = null, t.alternate !== null && (e = t.alternate.memoizedState.cache), t = t.memoizedState.cache, t !== e && (t.refCount++, e != null && Or(e)));
        break;
      case 12:
        if (l & 2048) {
          qt(
            e,
            t,
            n,
            r
          ), e = t.stateNode;
          try {
            var c = t.memoizedProps, m = c.id, b = c.onPostCommit;
            typeof b == "function" && b(
              m,
              t.alternate === null ? "mount" : "update",
              e.passiveEffectDuration,
              -0
            );
          } catch (v) {
            Se(t, t.return, v);
          }
        } else
          qt(
            e,
            t,
            n,
            r
          );
        break;
      case 31:
        qt(
          e,
          t,
          n,
          r
        );
        break;
      case 13:
        qt(
          e,
          t,
          n,
          r
        );
        break;
      case 23:
        break;
      case 22:
        c = t.stateNode, m = t.alternate, t.memoizedState !== null ? c._visibility & 2 ? qt(
          e,
          t,
          n,
          r
        ) : $r(e, t) : c._visibility & 2 ? qt(
          e,
          t,
          n,
          r
        ) : (c._visibility |= 2, Xa(
          e,
          t,
          n,
          r,
          (t.subtreeFlags & 10256) !== 0 || !1
        )), l & 2048 && Fs(m, t);
        break;
      case 24:
        qt(
          e,
          t,
          n,
          r
        ), l & 2048 && Xs(t.alternate, t);
        break;
      default:
        qt(
          e,
          t,
          n,
          r
        );
    }
  }
  function Xa(e, t, n, r, l) {
    for (l = l && ((t.subtreeFlags & 10256) !== 0 || !1), t = t.child; t !== null; ) {
      var c = e, m = t, b = n, v = r, _ = m.flags;
      switch (m.tag) {
        case 0:
        case 11:
        case 15:
          Xa(
            c,
            m,
            b,
            v,
            l
          ), Br(8, m);
          break;
        case 23:
          break;
        case 22:
          var I = m.stateNode;
          m.memoizedState !== null ? I._visibility & 2 ? Xa(
            c,
            m,
            b,
            v,
            l
          ) : $r(
            c,
            m
          ) : (I._visibility |= 2, Xa(
            c,
            m,
            b,
            v,
            l
          )), l && _ & 2048 && Fs(
            m.alternate,
            m
          );
          break;
        case 24:
          Xa(
            c,
            m,
            b,
            v,
            l
          ), l && _ & 2048 && Xs(m.alternate, m);
          break;
        default:
          Xa(
            c,
            m,
            b,
            v,
            l
          );
      }
      t = t.sibling;
    }
  }
  function $r(e, t) {
    if (t.subtreeFlags & 10256)
      for (t = t.child; t !== null; ) {
        var n = e, r = t, l = r.flags;
        switch (r.tag) {
          case 22:
            $r(n, r), l & 2048 && Fs(
              r.alternate,
              r
            );
            break;
          case 24:
            $r(n, r), l & 2048 && Xs(r.alternate, r);
            break;
          default:
            $r(n, r);
        }
        t = t.sibling;
      }
  }
  var Gr = 8192;
  function Pa(e, t, n) {
    if (e.subtreeFlags & Gr)
      for (e = e.child; e !== null; )
        pf(
          e,
          t,
          n
        ), e = e.sibling;
  }
  function pf(e, t, n) {
    switch (e.tag) {
      case 26:
        Pa(
          e,
          t,
          n
        ), e.flags & Gr && e.memoizedState !== null && cv(
          n,
          Gt,
          e.memoizedState,
          e.memoizedProps
        );
        break;
      case 5:
        Pa(
          e,
          t,
          n
        );
        break;
      case 3:
      case 4:
        var r = Gt;
        Gt = zi(e.stateNode.containerInfo), Pa(
          e,
          t,
          n
        ), Gt = r;
        break;
      case 22:
        e.memoizedState === null && (r = e.alternate, r !== null && r.memoizedState !== null ? (r = Gr, Gr = 16777216, Pa(
          e,
          t,
          n
        ), Gr = r) : Pa(
          e,
          t,
          n
        ));
        break;
      default:
        Pa(
          e,
          t,
          n
        );
    }
  }
  function bf(e) {
    var t = e.alternate;
    if (t !== null && (e = t.child, e !== null)) {
      t.child = null;
      do
        t = e.sibling, e.sibling = null, e = t;
      while (e !== null);
    }
  }
  function qr(e) {
    var t = e.deletions;
    if ((e.flags & 16) !== 0) {
      if (t !== null)
        for (var n = 0; n < t.length; n++) {
          var r = t[n];
          Qe = r, yf(
            r,
            e
          );
        }
      bf(e);
    }
    if (e.subtreeFlags & 10256)
      for (e = e.child; e !== null; )
        hf(e), e = e.sibling;
  }
  function hf(e) {
    switch (e.tag) {
      case 0:
      case 11:
      case 15:
        qr(e), e.flags & 2048 && Cn(9, e, e.return);
        break;
      case 3:
        qr(e);
        break;
      case 12:
        qr(e);
        break;
      case 22:
        var t = e.stateNode;
        e.memoizedState !== null && t._visibility & 2 && (e.return === null || e.return.tag !== 13) ? (t._visibility &= -3, bi(e)) : qr(e);
        break;
      default:
        qr(e);
    }
  }
  function bi(e) {
    var t = e.deletions;
    if ((e.flags & 16) !== 0) {
      if (t !== null)
        for (var n = 0; n < t.length; n++) {
          var r = t[n];
          Qe = r, yf(
            r,
            e
          );
        }
      bf(e);
    }
    for (e = e.child; e !== null; ) {
      switch (t = e, t.tag) {
        case 0:
        case 11:
        case 15:
          Cn(8, t, t.return), bi(t);
          break;
        case 22:
          n = t.stateNode, n._visibility & 2 && (n._visibility &= -3, bi(t));
          break;
        default:
          bi(t);
      }
      e = e.sibling;
    }
  }
  function yf(e, t) {
    for (; Qe !== null; ) {
      var n = Qe;
      switch (n.tag) {
        case 0:
        case 11:
        case 15:
          Cn(8, n, t);
          break;
        case 23:
        case 22:
          if (n.memoizedState !== null && n.memoizedState.cachePool !== null) {
            var r = n.memoizedState.cachePool.pool;
            r != null && r.refCount++;
          }
          break;
        case 24:
          Or(n.memoizedState.cache);
      }
      if (r = n.child, r !== null) r.return = n, Qe = r;
      else
        e: for (n = e; Qe !== null; ) {
          r = Qe;
          var l = r.sibling, c = r.return;
          if (lf(r), r === n) {
            Qe = null;
            break e;
          }
          if (l !== null) {
            l.return = c, Qe = l;
            break e;
          }
          Qe = c;
        }
    }
  }
  var Eg = {
    getCacheForType: function(e) {
      var t = nt($e), n = t.data.get(e);
      return n === void 0 && (n = e(), t.data.set(e, n)), n;
    },
    cacheSignal: function() {
      return nt($e).controller.signal;
    }
  }, Ag = typeof WeakMap == "function" ? WeakMap : Map, ve = 0, Oe = null, le = null, ce = 0, we = 0, zt = null, In = !1, Ka = !1, Ps = !1, hn = 0, De = 0, Mn = 0, ya = 0, Ks = 0, Nt = 0, Za = 0, Vr = null, gt = null, Zs = !1, hi = 0, gf = 0, yi = 1 / 0, gi = null, Dn = null, Fe = 0, Un = null, Qa = null, yn = 0, Qs = 0, Js = null, vf = null, Fr = 0, Ws = null;
  function Tt() {
    return (ve & 2) !== 0 && ce !== 0 ? ce & -ce : C.T !== null ? oc() : Id();
  }
  function xf() {
    if (Nt === 0)
      if ((ce & 536870912) === 0 || me) {
        var e = _o;
        _o <<= 1, (_o & 3932160) === 0 && (_o = 262144), Nt = e;
      } else Nt = 536870912;
    return e = _t.current, e !== null && (e.flags |= 32), Nt;
  }
  function vt(e, t, n) {
    (e === Oe && (we === 2 || we === 9) || e.cancelPendingCommit !== null) && (Ja(e, 0), Ln(
      e,
      ce,
      Nt,
      !1
    )), fr(e, n), ((ve & 2) === 0 || e !== Oe) && (e === Oe && ((ve & 2) === 0 && (ya |= n), De === 4 && Ln(
      e,
      ce,
      Nt,
      !1
    )), Zt(e));
  }
  function wf(e, t, n) {
    if ((ve & 6) !== 0) throw Error(s(327));
    var r = !n && (t & 127) === 0 && (t & e.expiredLanes) === 0 || mr(e, t), l = r ? zg(e, t) : tc(e, t, !0), c = r;
    do {
      if (l === 0) {
        Ka && !r && Ln(e, t, 0, !1);
        break;
      } else {
        if (n = e.current.alternate, c && !_g(n)) {
          l = tc(e, t, !1), c = !1;
          continue;
        }
        if (l === 2) {
          if (c = t, e.errorRecoveryDisabledLanes & c)
            var m = 0;
          else
            m = e.pendingLanes & -536870913, m = m !== 0 ? m : m & 536870912 ? 536870912 : 0;
          if (m !== 0) {
            t = m;
            e: {
              var b = e;
              l = Vr;
              var v = b.current.memoizedState.isDehydrated;
              if (v && (Ja(b, m).flags |= 256), m = tc(
                b,
                m,
                !1
              ), m !== 2) {
                if (Ps && !v) {
                  b.errorRecoveryDisabledLanes |= c, ya |= c, l = 4;
                  break e;
                }
                c = gt, gt = l, c !== null && (gt === null ? gt = c : gt.push.apply(
                  gt,
                  c
                ));
              }
              l = m;
            }
            if (c = !1, l !== 2) continue;
          }
        }
        if (l === 1) {
          Ja(e, 0), Ln(e, t, 0, !0);
          break;
        }
        e: {
          switch (r = e, c = l, c) {
            case 0:
            case 1:
              throw Error(s(345));
            case 4:
              if ((t & 4194048) !== t) break;
            case 6:
              Ln(
                r,
                t,
                Nt,
                !In
              );
              break e;
            case 2:
              gt = null;
              break;
            case 3:
            case 5:
              break;
            default:
              throw Error(s(329));
          }
          if ((t & 62914560) === t && (l = hi + 300 - wt(), 10 < l)) {
            if (Ln(
              r,
              t,
              Nt,
              !In
            ), zo(r, 0, !0) !== 0) break e;
            yn = t, r.timeoutHandle = Jf(
              Sf.bind(
                null,
                r,
                n,
                gt,
                gi,
                Zs,
                t,
                Nt,
                ya,
                Za,
                In,
                c,
                "Throttled",
                -0,
                0
              ),
              l
            );
            break e;
          }
          Sf(
            r,
            n,
            gt,
            gi,
            Zs,
            t,
            Nt,
            ya,
            Za,
            In,
            c,
            null,
            -0,
            0
          );
        }
      }
      break;
    } while (!0);
    Zt(e);
  }
  function Sf(e, t, n, r, l, c, m, b, v, _, I, L, N, k) {
    if (e.timeoutHandle = -1, L = t.subtreeFlags, L & 8192 || (L & 16785408) === 16785408) {
      L = {
        stylesheets: null,
        count: 0,
        imgCount: 0,
        imgBytes: 0,
        suspenseyImages: [],
        waitingForImages: !0,
        waitingForViewTransition: !1,
        unsuspend: tn
      }, pf(
        t,
        c,
        L
      );
      var G = (c & 62914560) === c ? hi - wt() : (c & 4194048) === c ? gf - wt() : 0;
      if (G = dv(
        L,
        G
      ), G !== null) {
        yn = c, e.cancelPendingCommit = G(
          Tf.bind(
            null,
            e,
            t,
            c,
            n,
            r,
            l,
            m,
            b,
            v,
            I,
            L,
            null,
            N,
            k
          )
        ), Ln(e, c, m, !_);
        return;
      }
    }
    Tf(
      e,
      t,
      c,
      n,
      r,
      l,
      m,
      b,
      v
    );
  }
  function _g(e) {
    for (var t = e; ; ) {
      var n = t.tag;
      if ((n === 0 || n === 11 || n === 15) && t.flags & 16384 && (n = t.updateQueue, n !== null && (n = n.stores, n !== null)))
        for (var r = 0; r < n.length; r++) {
          var l = n[r], c = l.getSnapshot;
          l = l.value;
          try {
            if (!Et(c(), l)) return !1;
          } catch {
            return !1;
          }
        }
      if (n = t.child, t.subtreeFlags & 16384 && n !== null)
        n.return = t, t = n;
      else {
        if (t === e) break;
        for (; t.sibling === null; ) {
          if (t.return === null || t.return === e) return !0;
          t = t.return;
        }
        t.sibling.return = t.return, t = t.sibling;
      }
    }
    return !0;
  }
  function Ln(e, t, n, r) {
    t &= ~Ks, t &= ~ya, e.suspendedLanes |= t, e.pingedLanes &= ~t, r && (e.warmLanes |= t), r = e.expirationTimes;
    for (var l = t; 0 < l; ) {
      var c = 31 - jt(l), m = 1 << c;
      r[c] = -1, l &= ~m;
    }
    n !== 0 && Rd(e, n, t);
  }
  function vi() {
    return (ve & 6) === 0 ? (Xr(0), !1) : !0;
  }
  function ec() {
    if (le !== null) {
      if (we === 0)
        var e = le.return;
      else
        e = le, on = sa = null, hs(e), $a = null, Nr = 0, e = le;
      for (; e !== null; )
        Jm(e.alternate, e), e = e.return;
      le = null;
    }
  }
  function Ja(e, t) {
    var n = e.timeoutHandle;
    n !== -1 && (e.timeoutHandle = -1, Fg(n)), n = e.cancelPendingCommit, n !== null && (e.cancelPendingCommit = null, n()), yn = 0, ec(), Oe = e, le = n = an(e.current, null), ce = t, we = 0, zt = null, In = !1, Ka = mr(e, t), Ps = !1, Za = Nt = Ks = ya = Mn = De = 0, gt = Vr = null, Zs = !1, (t & 8) !== 0 && (t |= t & 32);
    var r = e.entangledLanes;
    if (r !== 0)
      for (e = e.entanglements, r &= t; 0 < r; ) {
        var l = 31 - jt(r), c = 1 << l;
        t |= e[l], r &= ~c;
      }
    return hn = t, Bo(), n;
  }
  function jf(e, t) {
    ne = null, C.H = Ur, t === Ya || t === Po ? (t = Lu(), we = 3) : t === rs ? (t = Lu(), we = 4) : we = t === ks ? 8 : t !== null && typeof t == "object" && typeof t.then == "function" ? 6 : 1, zt = t, le === null && (De = 1, si(
      e,
      It(t, e.current)
    ));
  }
  function Ef() {
    var e = _t.current;
    return e === null ? !0 : (ce & 4194048) === ce ? Lt === null : (ce & 62914560) === ce || (ce & 536870912) !== 0 ? e === Lt : !1;
  }
  function Af() {
    var e = C.H;
    return C.H = Ur, e === null ? Ur : e;
  }
  function _f() {
    var e = C.A;
    return C.A = Eg, e;
  }
  function xi() {
    De = 4, In || (ce & 4194048) !== ce && _t.current !== null || (Ka = !0), (Mn & 134217727) === 0 && (ya & 134217727) === 0 || Oe === null || Ln(
      Oe,
      ce,
      Nt,
      !1
    );
  }
  function tc(e, t, n) {
    var r = ve;
    ve |= 2;
    var l = Af(), c = _f();
    (Oe !== e || ce !== t) && (gi = null, Ja(e, t)), t = !1;
    var m = De;
    e: do
      try {
        if (we !== 0 && le !== null) {
          var b = le, v = zt;
          switch (we) {
            case 8:
              ec(), m = 6;
              break e;
            case 3:
            case 2:
            case 9:
            case 6:
              _t.current === null && (t = !0);
              var _ = we;
              if (we = 0, zt = null, Wa(e, b, v, _), n && Ka) {
                m = 0;
                break e;
              }
              break;
            default:
              _ = we, we = 0, zt = null, Wa(e, b, v, _);
          }
        }
        Og(), m = De;
        break;
      } catch (I) {
        jf(e, I);
      }
    while (!0);
    return t && e.shellSuspendCounter++, on = sa = null, ve = r, C.H = l, C.A = c, le === null && (Oe = null, ce = 0, Bo()), m;
  }
  function Og() {
    for (; le !== null; ) Of(le);
  }
  function zg(e, t) {
    var n = ve;
    ve |= 2;
    var r = Af(), l = _f();
    Oe !== e || ce !== t ? (gi = null, yi = wt() + 500, Ja(e, t)) : Ka = mr(
      e,
      t
    );
    e: do
      try {
        if (we !== 0 && le !== null) {
          t = le;
          var c = zt;
          t: switch (we) {
            case 1:
              we = 0, zt = null, Wa(e, t, c, 1);
              break;
            case 2:
            case 9:
              if (Du(c)) {
                we = 0, zt = null, zf(t);
                break;
              }
              t = function() {
                we !== 2 && we !== 9 || Oe !== e || (we = 7), Zt(e);
              }, c.then(t, t);
              break e;
            case 3:
              we = 7;
              break e;
            case 4:
              we = 5;
              break e;
            case 7:
              Du(c) ? (we = 0, zt = null, zf(t)) : (we = 0, zt = null, Wa(e, t, c, 7));
              break;
            case 5:
              var m = null;
              switch (le.tag) {
                case 26:
                  m = le.memoizedState;
                case 5:
                case 27:
                  var b = le;
                  if (m ? fp(m) : b.stateNode.complete) {
                    we = 0, zt = null;
                    var v = b.sibling;
                    if (v !== null) le = v;
                    else {
                      var _ = b.return;
                      _ !== null ? (le = _, wi(_)) : le = null;
                    }
                    break t;
                  }
              }
              we = 0, zt = null, Wa(e, t, c, 5);
              break;
            case 6:
              we = 0, zt = null, Wa(e, t, c, 6);
              break;
            case 8:
              ec(), De = 6;
              break e;
            default:
              throw Error(s(462));
          }
        }
        Ng();
        break;
      } catch (I) {
        jf(e, I);
      }
    while (!0);
    return on = sa = null, C.H = r, C.A = l, ve = n, le !== null ? 0 : (Oe = null, ce = 0, Bo(), De);
  }
  function Ng() {
    for (; le !== null && !Jh(); )
      Of(le);
  }
  function Of(e) {
    var t = Zm(e.alternate, e, hn);
    e.memoizedProps = e.pendingProps, t === null ? wi(e) : le = t;
  }
  function zf(e) {
    var t = e, n = t.alternate;
    switch (t.tag) {
      case 15:
      case 0:
        t = qm(
          n,
          t,
          t.pendingProps,
          t.type,
          void 0,
          ce
        );
        break;
      case 11:
        t = qm(
          n,
          t,
          t.pendingProps,
          t.type.render,
          t.ref,
          ce
        );
        break;
      case 5:
        hs(t);
      default:
        Jm(n, t), t = le = Au(t, hn), t = Zm(n, t, hn);
    }
    e.memoizedProps = e.pendingProps, t === null ? wi(e) : le = t;
  }
  function Wa(e, t, n, r) {
    on = sa = null, hs(t), $a = null, Nr = 0;
    var l = t.return;
    try {
      if (yg(
        e,
        l,
        t,
        n,
        ce
      )) {
        De = 1, si(
          e,
          It(n, e.current)
        ), le = null;
        return;
      }
    } catch (c) {
      if (l !== null) throw le = l, c;
      De = 1, si(
        e,
        It(n, e.current)
      ), le = null;
      return;
    }
    t.flags & 32768 ? (me || r === 1 ? e = !0 : Ka || (ce & 536870912) !== 0 ? e = !1 : (In = e = !0, (r === 2 || r === 9 || r === 3 || r === 6) && (r = _t.current, r !== null && r.tag === 13 && (r.flags |= 16384))), Nf(t, e)) : wi(t);
  }
  function wi(e) {
    var t = e;
    do {
      if ((t.flags & 32768) !== 0) {
        Nf(
          t,
          In
        );
        return;
      }
      e = t.return;
      var n = xg(
        t.alternate,
        t,
        hn
      );
      if (n !== null) {
        le = n;
        return;
      }
      if (t = t.sibling, t !== null) {
        le = t;
        return;
      }
      le = t = e;
    } while (t !== null);
    De === 0 && (De = 5);
  }
  function Nf(e, t) {
    do {
      var n = wg(e.alternate, e);
      if (n !== null) {
        n.flags &= 32767, le = n;
        return;
      }
      if (n = e.return, n !== null && (n.flags |= 32768, n.subtreeFlags = 0, n.deletions = null), !t && (e = e.sibling, e !== null)) {
        le = e;
        return;
      }
      le = e = n;
    } while (e !== null);
    De = 6, le = null;
  }
  function Tf(e, t, n, r, l, c, m, b, v) {
    e.cancelPendingCommit = null;
    do
      Si();
    while (Fe !== 0);
    if ((ve & 6) !== 0) throw Error(s(327));
    if (t !== null) {
      if (t === e.current) throw Error(s(177));
      if (c = t.lanes | t.childLanes, c |= Gl, sy(
        e,
        n,
        c,
        m,
        b,
        v
      ), e === Oe && (le = Oe = null, ce = 0), Qa = t, Un = e, yn = n, Qs = c, Js = l, vf = r, (t.subtreeFlags & 10256) !== 0 || (t.flags & 10256) !== 0 ? (e.callbackNode = null, e.callbackPriority = 0, Cg(Eo, function() {
        return Mf(), null;
      })) : (e.callbackNode = null, e.callbackPriority = 0), r = (t.flags & 13878) !== 0, (t.subtreeFlags & 13878) !== 0 || r) {
        r = C.T, C.T = null, l = B.p, B.p = 2, m = ve, ve |= 4;
        try {
          Sg(e, t, n);
        } finally {
          ve = m, B.p = l, C.T = r;
        }
      }
      Fe = 1, Rf(), kf(), Cf();
    }
  }
  function Rf() {
    if (Fe === 1) {
      Fe = 0;
      var e = Un, t = Qa, n = (t.flags & 13878) !== 0;
      if ((t.subtreeFlags & 13878) !== 0 || n) {
        n = C.T, C.T = null;
        var r = B.p;
        B.p = 2;
        var l = ve;
        ve |= 4;
        try {
          uf(t, e);
          var c = fc, m = hu(e.containerInfo), b = c.focusedElem, v = c.selectionRange;
          if (m !== b && b && b.ownerDocument && bu(
            b.ownerDocument.documentElement,
            b
          )) {
            if (v !== null && Ll(b)) {
              var _ = v.start, I = v.end;
              if (I === void 0 && (I = _), "selectionStart" in b)
                b.selectionStart = _, b.selectionEnd = Math.min(
                  I,
                  b.value.length
                );
              else {
                var L = b.ownerDocument || document, N = L && L.defaultView || window;
                if (N.getSelection) {
                  var k = N.getSelection(), G = b.textContent.length, Q = Math.min(v.start, G), Ae = v.end === void 0 ? Q : Math.min(v.end, G);
                  !k.extend && Q > Ae && (m = Ae, Ae = Q, Q = m);
                  var j = pu(
                    b,
                    Q
                  ), w = pu(
                    b,
                    Ae
                  );
                  if (j && w && (k.rangeCount !== 1 || k.anchorNode !== j.node || k.anchorOffset !== j.offset || k.focusNode !== w.node || k.focusOffset !== w.offset)) {
                    var A = L.createRange();
                    A.setStart(j.node, j.offset), k.removeAllRanges(), Q > Ae ? (k.addRange(A), k.extend(w.node, w.offset)) : (A.setEnd(w.node, w.offset), k.addRange(A));
                  }
                }
              }
            }
            for (L = [], k = b; k = k.parentNode; )
              k.nodeType === 1 && L.push({
                element: k,
                left: k.scrollLeft,
                top: k.scrollTop
              });
            for (typeof b.focus == "function" && b.focus(), b = 0; b < L.length; b++) {
              var M = L[b];
              M.element.scrollLeft = M.left, M.element.scrollTop = M.top;
            }
          }
          Ii = !!mc, fc = mc = null;
        } finally {
          ve = l, B.p = r, C.T = n;
        }
      }
      e.current = t, Fe = 2;
    }
  }
  function kf() {
    if (Fe === 2) {
      Fe = 0;
      var e = Un, t = Qa, n = (t.flags & 8772) !== 0;
      if ((t.subtreeFlags & 8772) !== 0 || n) {
        n = C.T, C.T = null;
        var r = B.p;
        B.p = 2;
        var l = ve;
        ve |= 4;
        try {
          of(e, t.alternate, t);
        } finally {
          ve = l, B.p = r, C.T = n;
        }
      }
      Fe = 3;
    }
  }
  function Cf() {
    if (Fe === 4 || Fe === 3) {
      Fe = 0, Wh();
      var e = Un, t = Qa, n = yn, r = vf;
      (t.subtreeFlags & 10256) !== 0 || (t.flags & 10256) !== 0 ? Fe = 5 : (Fe = 0, Qa = Un = null, If(e, e.pendingLanes));
      var l = e.pendingLanes;
      if (l === 0 && (Dn = null), vl(n), t = t.stateNode, St && typeof St.onCommitFiberRoot == "function")
        try {
          St.onCommitFiberRoot(
            ur,
            t,
            void 0,
            (t.current.flags & 128) === 128
          );
        } catch {
        }
      if (r !== null) {
        t = C.T, l = B.p, B.p = 2, C.T = null;
        try {
          for (var c = e.onRecoverableError, m = 0; m < r.length; m++) {
            var b = r[m];
            c(b.value, {
              componentStack: b.stack
            });
          }
        } finally {
          C.T = t, B.p = l;
        }
      }
      (yn & 3) !== 0 && Si(), Zt(e), l = e.pendingLanes, (n & 261930) !== 0 && (l & 42) !== 0 ? e === Ws ? Fr++ : (Fr = 0, Ws = e) : Fr = 0, Xr(0);
    }
  }
  function If(e, t) {
    (e.pooledCacheLanes &= t) === 0 && (t = e.pooledCache, t != null && (e.pooledCache = null, Or(t)));
  }
  function Si() {
    return Rf(), kf(), Cf(), Mf();
  }
  function Mf() {
    if (Fe !== 5) return !1;
    var e = Un, t = Qs;
    Qs = 0;
    var n = vl(yn), r = C.T, l = B.p;
    try {
      B.p = 32 > n ? 32 : n, C.T = null, n = Js, Js = null;
      var c = Un, m = yn;
      if (Fe = 0, Qa = Un = null, yn = 0, (ve & 6) !== 0) throw Error(s(331));
      var b = ve;
      if (ve |= 4, hf(c.current), ff(
        c,
        c.current,
        m,
        n
      ), ve = b, Xr(0, !1), St && typeof St.onPostCommitFiberRoot == "function")
        try {
          St.onPostCommitFiberRoot(ur, c);
        } catch {
        }
      return !0;
    } finally {
      B.p = l, C.T = r, If(e, t);
    }
  }
  function Df(e, t, n) {
    t = It(n, t), t = Rs(e.stateNode, t, 2), e = Tn(e, t, 2), e !== null && (fr(e, 2), Zt(e));
  }
  function Se(e, t, n) {
    if (e.tag === 3)
      Df(e, e, n);
    else
      for (; t !== null; ) {
        if (t.tag === 3) {
          Df(
            t,
            e,
            n
          );
          break;
        } else if (t.tag === 1) {
          var r = t.stateNode;
          if (typeof t.type.getDerivedStateFromError == "function" || typeof r.componentDidCatch == "function" && (Dn === null || !Dn.has(r))) {
            e = It(n, e), n = Dm(2), r = Tn(t, n, 2), r !== null && (Um(
              n,
              r,
              t,
              e
            ), fr(r, 2), Zt(r));
            break;
          }
        }
        t = t.return;
      }
  }
  function nc(e, t, n) {
    var r = e.pingCache;
    if (r === null) {
      r = e.pingCache = new Ag();
      var l = /* @__PURE__ */ new Set();
      r.set(t, l);
    } else
      l = r.get(t), l === void 0 && (l = /* @__PURE__ */ new Set(), r.set(t, l));
    l.has(n) || (Ps = !0, l.add(n), e = Tg.bind(null, e, t, n), t.then(e, e));
  }
  function Tg(e, t, n) {
    var r = e.pingCache;
    r !== null && r.delete(t), e.pingedLanes |= e.suspendedLanes & n, e.warmLanes &= ~n, Oe === e && (ce & n) === n && (De === 4 || De === 3 && (ce & 62914560) === ce && 300 > wt() - hi ? (ve & 2) === 0 && Ja(e, 0) : Ks |= n, Za === ce && (Za = 0)), Zt(e);
  }
  function Uf(e, t) {
    t === 0 && (t = Td()), e = oa(e, t), e !== null && (fr(e, t), Zt(e));
  }
  function Rg(e) {
    var t = e.memoizedState, n = 0;
    t !== null && (n = t.retryLane), Uf(e, n);
  }
  function kg(e, t) {
    var n = 0;
    switch (e.tag) {
      case 31:
      case 13:
        var r = e.stateNode, l = e.memoizedState;
        l !== null && (n = l.retryLane);
        break;
      case 19:
        r = e.stateNode;
        break;
      case 22:
        r = e.stateNode._retryCache;
        break;
      default:
        throw Error(s(314));
    }
    r !== null && r.delete(t), Uf(e, n);
  }
  function Cg(e, t) {
    return bl(e, t);
  }
  var ji = null, er = null, ac = !1, Ei = !1, rc = !1, Hn = 0;
  function Zt(e) {
    e !== er && e.next === null && (er === null ? ji = er = e : er = er.next = e), Ei = !0, ac || (ac = !0, Mg());
  }
  function Xr(e, t) {
    if (!rc && Ei) {
      rc = !0;
      do
        for (var n = !1, r = ji; r !== null; ) {
          if (e !== 0) {
            var l = r.pendingLanes;
            if (l === 0) var c = 0;
            else {
              var m = r.suspendedLanes, b = r.pingedLanes;
              c = (1 << 31 - jt(42 | e) + 1) - 1, c &= l & ~(m & ~b), c = c & 201326741 ? c & 201326741 | 1 : c ? c | 2 : 0;
            }
            c !== 0 && (n = !0, Yf(r, c));
          } else
            c = ce, c = zo(
              r,
              r === Oe ? c : 0,
              r.cancelPendingCommit !== null || r.timeoutHandle !== -1
            ), (c & 3) === 0 || mr(r, c) || (n = !0, Yf(r, c));
          r = r.next;
        }
      while (n);
      rc = !1;
    }
  }
  function Ig() {
    Lf();
  }
  function Lf() {
    Ei = ac = !1;
    var e = 0;
    Hn !== 0 && Vg() && (e = Hn);
    for (var t = wt(), n = null, r = ji; r !== null; ) {
      var l = r.next, c = Hf(r, t);
      c === 0 ? (r.next = null, n === null ? ji = l : n.next = l, l === null && (er = n)) : (n = r, (e !== 0 || (c & 3) !== 0) && (Ei = !0)), r = l;
    }
    Fe !== 0 && Fe !== 5 || Xr(e), Hn !== 0 && (Hn = 0);
  }
  function Hf(e, t) {
    for (var n = e.suspendedLanes, r = e.pingedLanes, l = e.expirationTimes, c = e.pendingLanes & -62914561; 0 < c; ) {
      var m = 31 - jt(c), b = 1 << m, v = l[m];
      v === -1 ? ((b & n) === 0 || (b & r) !== 0) && (l[m] = ly(b, t)) : v <= t && (e.expiredLanes |= b), c &= ~b;
    }
    if (t = Oe, n = ce, n = zo(
      e,
      e === t ? n : 0,
      e.cancelPendingCommit !== null || e.timeoutHandle !== -1
    ), r = e.callbackNode, n === 0 || e === t && (we === 2 || we === 9) || e.cancelPendingCommit !== null)
      return r !== null && r !== null && hl(r), e.callbackNode = null, e.callbackPriority = 0;
    if ((n & 3) === 0 || mr(e, n)) {
      if (t = n & -n, t === e.callbackPriority) return t;
      switch (r !== null && hl(r), vl(n)) {
        case 2:
        case 8:
          n = zd;
          break;
        case 32:
          n = Eo;
          break;
        case 268435456:
          n = Nd;
          break;
        default:
          n = Eo;
      }
      return r = Bf.bind(null, e), n = bl(n, r), e.callbackPriority = t, e.callbackNode = n, t;
    }
    return r !== null && r !== null && hl(r), e.callbackPriority = 2, e.callbackNode = null, 2;
  }
  function Bf(e, t) {
    if (Fe !== 0 && Fe !== 5)
      return e.callbackNode = null, e.callbackPriority = 0, null;
    var n = e.callbackNode;
    if (Si() && e.callbackNode !== n)
      return null;
    var r = ce;
    return r = zo(
      e,
      e === Oe ? r : 0,
      e.cancelPendingCommit !== null || e.timeoutHandle !== -1
    ), r === 0 ? null : (wf(e, r, t), Hf(e, wt()), e.callbackNode != null && e.callbackNode === n ? Bf.bind(null, e) : null);
  }
  function Yf(e, t) {
    if (Si()) return null;
    wf(e, t, !0);
  }
  function Mg() {
    Xg(function() {
      (ve & 6) !== 0 ? bl(
        Od,
        Ig
      ) : Lf();
    });
  }
  function oc() {
    if (Hn === 0) {
      var e = Ha;
      e === 0 && (e = Ao, Ao <<= 1, (Ao & 261888) === 0 && (Ao = 256)), Hn = e;
    }
    return Hn;
  }
  function $f(e) {
    return e == null || typeof e == "symbol" || typeof e == "boolean" ? null : typeof e == "function" ? e : ko("" + e);
  }
  function Gf(e, t) {
    var n = t.ownerDocument.createElement("input");
    return n.name = t.name, n.value = t.value, e.id && n.setAttribute("form", e.id), t.parentNode.insertBefore(n, t), e = new FormData(e), n.parentNode.removeChild(n), e;
  }
  function Dg(e, t, n, r, l) {
    if (t === "submit" && n && n.stateNode === l) {
      var c = $f(
        (l[ft] || null).action
      ), m = r.submitter;
      m && (t = (t = m[ft] || null) ? $f(t.formAction) : m.getAttribute("formAction"), t !== null && (c = t, m = null));
      var b = new Do(
        "action",
        "action",
        null,
        r,
        l
      );
      e.push({
        event: b,
        listeners: [
          {
            instance: null,
            listener: function() {
              if (r.defaultPrevented) {
                if (Hn !== 0) {
                  var v = m ? Gf(l, m) : new FormData(l);
                  As(
                    n,
                    {
                      pending: !0,
                      data: v,
                      method: l.method,
                      action: c
                    },
                    null,
                    v
                  );
                }
              } else
                typeof c == "function" && (b.preventDefault(), v = m ? Gf(l, m) : new FormData(l), As(
                  n,
                  {
                    pending: !0,
                    data: v,
                    method: l.method,
                    action: c
                  },
                  c,
                  v
                ));
            },
            currentTarget: l
          }
        ]
      });
    }
  }
  for (var ic = 0; ic < $l.length; ic++) {
    var lc = $l[ic], Ug = lc.toLowerCase(), Lg = lc[0].toUpperCase() + lc.slice(1);
    $t(
      Ug,
      "on" + Lg
    );
  }
  $t(vu, "onAnimationEnd"), $t(xu, "onAnimationIteration"), $t(wu, "onAnimationStart"), $t("dblclick", "onDoubleClick"), $t("focusin", "onFocus"), $t("focusout", "onBlur"), $t(eg, "onTransitionRun"), $t(tg, "onTransitionStart"), $t(ng, "onTransitionCancel"), $t(Su, "onTransitionEnd"), Aa("onMouseEnter", ["mouseout", "mouseover"]), Aa("onMouseLeave", ["mouseout", "mouseover"]), Aa("onPointerEnter", ["pointerout", "pointerover"]), Aa("onPointerLeave", ["pointerout", "pointerover"]), ta(
    "onChange",
    "change click focusin focusout input keydown keyup selectionchange".split(" ")
  ), ta(
    "onSelect",
    "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(
      " "
    )
  ), ta("onBeforeInput", [
    "compositionend",
    "keypress",
    "textInput",
    "paste"
  ]), ta(
    "onCompositionEnd",
    "compositionend focusout keydown keypress keyup mousedown".split(" ")
  ), ta(
    "onCompositionStart",
    "compositionstart focusout keydown keypress keyup mousedown".split(" ")
  ), ta(
    "onCompositionUpdate",
    "compositionupdate focusout keydown keypress keyup mousedown".split(" ")
  );
  var Pr = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(
    " "
  ), Hg = new Set(
    "beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(Pr)
  );
  function qf(e, t) {
    t = (t & 4) !== 0;
    for (var n = 0; n < e.length; n++) {
      var r = e[n], l = r.event;
      r = r.listeners;
      e: {
        var c = void 0;
        if (t)
          for (var m = r.length - 1; 0 <= m; m--) {
            var b = r[m], v = b.instance, _ = b.currentTarget;
            if (b = b.listener, v !== c && l.isPropagationStopped())
              break e;
            c = b, l.currentTarget = _;
            try {
              c(l);
            } catch (I) {
              Ho(I);
            }
            l.currentTarget = null, c = v;
          }
        else
          for (m = 0; m < r.length; m++) {
            if (b = r[m], v = b.instance, _ = b.currentTarget, b = b.listener, v !== c && l.isPropagationStopped())
              break e;
            c = b, l.currentTarget = _;
            try {
              c(l);
            } catch (I) {
              Ho(I);
            }
            l.currentTarget = null, c = v;
          }
      }
    }
  }
  function se(e, t) {
    var n = t[xl];
    n === void 0 && (n = t[xl] = /* @__PURE__ */ new Set());
    var r = e + "__bubble";
    n.has(r) || (Vf(t, e, 2, !1), n.add(r));
  }
  function sc(e, t, n) {
    var r = 0;
    t && (r |= 4), Vf(
      n,
      e,
      r,
      t
    );
  }
  var Ai = "_reactListening" + Math.random().toString(36).slice(2);
  function cc(e) {
    if (!e[Ai]) {
      e[Ai] = !0, Ud.forEach(function(n) {
        n !== "selectionchange" && (Hg.has(n) || sc(n, !1, e), sc(n, !0, e));
      });
      var t = e.nodeType === 9 ? e : e.ownerDocument;
      t === null || t[Ai] || (t[Ai] = !0, sc("selectionchange", !1, t));
    }
  }
  function Vf(e, t, n, r) {
    switch (xp(t)) {
      case 2:
        var l = fv;
        break;
      case 8:
        l = pv;
        break;
      default:
        l = Ec;
    }
    n = l.bind(
      null,
      t,
      n,
      e
    ), l = void 0, !Nl || t !== "touchstart" && t !== "touchmove" && t !== "wheel" || (l = !0), r ? l !== void 0 ? e.addEventListener(t, n, {
      capture: !0,
      passive: l
    }) : e.addEventListener(t, n, !0) : l !== void 0 ? e.addEventListener(t, n, {
      passive: l
    }) : e.addEventListener(t, n, !1);
  }
  function dc(e, t, n, r, l) {
    var c = r;
    if ((t & 1) === 0 && (t & 2) === 0 && r !== null)
      e: for (; ; ) {
        if (r === null) return;
        var m = r.tag;
        if (m === 3 || m === 4) {
          var b = r.stateNode.containerInfo;
          if (b === l) break;
          if (m === 4)
            for (m = r.return; m !== null; ) {
              var v = m.tag;
              if ((v === 3 || v === 4) && m.stateNode.containerInfo === l)
                return;
              m = m.return;
            }
          for (; b !== null; ) {
            if (m = Sa(b), m === null) return;
            if (v = m.tag, v === 5 || v === 6 || v === 26 || v === 27) {
              r = c = m;
              continue e;
            }
            b = b.parentNode;
          }
        }
        r = r.return;
      }
    Kd(function() {
      var _ = c, I = Ol(n), L = [];
      e: {
        var N = ju.get(e);
        if (N !== void 0) {
          var k = Do, G = e;
          switch (e) {
            case "keypress":
              if (Io(n) === 0) break e;
            case "keydown":
            case "keyup":
              k = ky;
              break;
            case "focusin":
              G = "focus", k = Cl;
              break;
            case "focusout":
              G = "blur", k = Cl;
              break;
            case "beforeblur":
            case "afterblur":
              k = Cl;
              break;
            case "click":
              if (n.button === 2) break e;
            case "auxclick":
            case "dblclick":
            case "mousedown":
            case "mousemove":
            case "mouseup":
            case "mouseout":
            case "mouseover":
            case "contextmenu":
              k = Jd;
              break;
            case "drag":
            case "dragend":
            case "dragenter":
            case "dragexit":
            case "dragleave":
            case "dragover":
            case "dragstart":
            case "drop":
              k = xy;
              break;
            case "touchcancel":
            case "touchend":
            case "touchmove":
            case "touchstart":
              k = My;
              break;
            case vu:
            case xu:
            case wu:
              k = jy;
              break;
            case Su:
              k = Uy;
              break;
            case "scroll":
            case "scrollend":
              k = gy;
              break;
            case "wheel":
              k = Hy;
              break;
            case "copy":
            case "cut":
            case "paste":
              k = Ay;
              break;
            case "gotpointercapture":
            case "lostpointercapture":
            case "pointercancel":
            case "pointerdown":
            case "pointermove":
            case "pointerout":
            case "pointerover":
            case "pointerup":
              k = eu;
              break;
            case "toggle":
            case "beforetoggle":
              k = Yy;
          }
          var Q = (t & 4) !== 0, Ae = !Q && (e === "scroll" || e === "scrollend"), j = Q ? N !== null ? N + "Capture" : null : N;
          Q = [];
          for (var w = _, A; w !== null; ) {
            var M = w;
            if (A = M.stateNode, M = M.tag, M !== 5 && M !== 26 && M !== 27 || A === null || j === null || (M = hr(w, j), M != null && Q.push(
              Kr(w, M, A)
            )), Ae) break;
            w = w.return;
          }
          0 < Q.length && (N = new k(
            N,
            G,
            null,
            n,
            I
          ), L.push({ event: N, listeners: Q }));
        }
      }
      if ((t & 7) === 0) {
        e: {
          if (N = e === "mouseover" || e === "pointerover", k = e === "mouseout" || e === "pointerout", N && n !== _l && (G = n.relatedTarget || n.fromElement) && (Sa(G) || G[wa]))
            break e;
          if ((k || N) && (N = I.window === I ? I : (N = I.ownerDocument) ? N.defaultView || N.parentWindow : window, k ? (G = n.relatedTarget || n.toElement, k = _, G = G ? Sa(G) : null, G !== null && (Ae = f(G), Q = G.tag, G !== Ae || Q !== 5 && Q !== 27 && Q !== 6) && (G = null)) : (k = null, G = _), k !== G)) {
            if (Q = Jd, M = "onMouseLeave", j = "onMouseEnter", w = "mouse", (e === "pointerout" || e === "pointerover") && (Q = eu, M = "onPointerLeave", j = "onPointerEnter", w = "pointer"), Ae = k == null ? N : br(k), A = G == null ? N : br(G), N = new Q(
              M,
              w + "leave",
              k,
              n,
              I
            ), N.target = Ae, N.relatedTarget = A, M = null, Sa(I) === _ && (Q = new Q(
              j,
              w + "enter",
              G,
              n,
              I
            ), Q.target = A, Q.relatedTarget = Ae, M = Q), Ae = M, k && G)
              t: {
                for (Q = Bg, j = k, w = G, A = 0, M = j; M; M = Q(M))
                  A++;
                M = 0;
                for (var Z = w; Z; Z = Q(Z))
                  M++;
                for (; 0 < A - M; )
                  j = Q(j), A--;
                for (; 0 < M - A; )
                  w = Q(w), M--;
                for (; A--; ) {
                  if (j === w || w !== null && j === w.alternate) {
                    Q = j;
                    break t;
                  }
                  j = Q(j), w = Q(w);
                }
                Q = null;
              }
            else Q = null;
            k !== null && Ff(
              L,
              N,
              k,
              Q,
              !1
            ), G !== null && Ae !== null && Ff(
              L,
              Ae,
              G,
              Q,
              !0
            );
          }
        }
        e: {
          if (N = _ ? br(_) : window, k = N.nodeName && N.nodeName.toLowerCase(), k === "select" || k === "input" && N.type === "file")
            var he = su;
          else if (iu(N))
            if (cu)
              he = Qy;
            else {
              he = Ky;
              var X = Py;
            }
          else
            k = N.nodeName, !k || k.toLowerCase() !== "input" || N.type !== "checkbox" && N.type !== "radio" ? _ && Al(_.elementType) && (he = su) : he = Zy;
          if (he && (he = he(e, _))) {
            lu(
              L,
              he,
              n,
              I
            );
            break e;
          }
          X && X(e, N, _), e === "focusout" && _ && N.type === "number" && _.memoizedProps.value != null && El(N, "number", N.value);
        }
        switch (X = _ ? br(_) : window, e) {
          case "focusin":
            (iu(X) || X.contentEditable === "true") && (Ra = X, Hl = _, Er = null);
            break;
          case "focusout":
            Er = Hl = Ra = null;
            break;
          case "mousedown":
            Bl = !0;
            break;
          case "contextmenu":
          case "mouseup":
          case "dragend":
            Bl = !1, yu(L, n, I);
            break;
          case "selectionchange":
            if (Wy) break;
          case "keydown":
          case "keyup":
            yu(L, n, I);
        }
        var ae;
        if (Ml)
          e: {
            switch (e) {
              case "compositionstart":
                var de = "onCompositionStart";
                break e;
              case "compositionend":
                de = "onCompositionEnd";
                break e;
              case "compositionupdate":
                de = "onCompositionUpdate";
                break e;
            }
            de = void 0;
          }
        else
          Ta ? ru(e, n) && (de = "onCompositionEnd") : e === "keydown" && n.keyCode === 229 && (de = "onCompositionStart");
        de && (tu && n.locale !== "ko" && (Ta || de !== "onCompositionStart" ? de === "onCompositionEnd" && Ta && (ae = Zd()) : (jn = I, Tl = "value" in jn ? jn.value : jn.textContent, Ta = !0)), X = _i(_, de), 0 < X.length && (de = new Wd(
          de,
          e,
          null,
          n,
          I
        ), L.push({ event: de, listeners: X }), ae ? de.data = ae : (ae = ou(n), ae !== null && (de.data = ae)))), (ae = Gy ? qy(e, n) : Vy(e, n)) && (de = _i(_, "onBeforeInput"), 0 < de.length && (X = new Wd(
          "onBeforeInput",
          "beforeinput",
          null,
          n,
          I
        ), L.push({
          event: X,
          listeners: de
        }), X.data = ae)), Dg(
          L,
          e,
          _,
          n,
          I
        );
      }
      qf(L, t);
    });
  }
  function Kr(e, t, n) {
    return {
      instance: e,
      listener: t,
      currentTarget: n
    };
  }
  function _i(e, t) {
    for (var n = t + "Capture", r = []; e !== null; ) {
      var l = e, c = l.stateNode;
      if (l = l.tag, l !== 5 && l !== 26 && l !== 27 || c === null || (l = hr(e, n), l != null && r.unshift(
        Kr(e, l, c)
      ), l = hr(e, t), l != null && r.push(
        Kr(e, l, c)
      )), e.tag === 3) return r;
      e = e.return;
    }
    return [];
  }
  function Bg(e) {
    if (e === null) return null;
    do
      e = e.return;
    while (e && e.tag !== 5 && e.tag !== 27);
    return e || null;
  }
  function Ff(e, t, n, r, l) {
    for (var c = t._reactName, m = []; n !== null && n !== r; ) {
      var b = n, v = b.alternate, _ = b.stateNode;
      if (b = b.tag, v !== null && v === r) break;
      b !== 5 && b !== 26 && b !== 27 || _ === null || (v = _, l ? (_ = hr(n, c), _ != null && m.unshift(
        Kr(n, _, v)
      )) : l || (_ = hr(n, c), _ != null && m.push(
        Kr(n, _, v)
      ))), n = n.return;
    }
    m.length !== 0 && e.push({ event: t, listeners: m });
  }
  var Yg = /\r\n?/g, $g = /\u0000|\uFFFD/g;
  function Xf(e) {
    return (typeof e == "string" ? e : "" + e).replace(Yg, `
`).replace($g, "");
  }
  function Pf(e, t) {
    return t = Xf(t), Xf(e) === t;
  }
  function Ee(e, t, n, r, l, c) {
    switch (n) {
      case "children":
        typeof r == "string" ? t === "body" || t === "textarea" && r === "" || Oa(e, r) : (typeof r == "number" || typeof r == "bigint") && t !== "body" && Oa(e, "" + r);
        break;
      case "className":
        To(e, "class", r);
        break;
      case "tabIndex":
        To(e, "tabindex", r);
        break;
      case "dir":
      case "role":
      case "viewBox":
      case "width":
      case "height":
        To(e, n, r);
        break;
      case "style":
        Xd(e, r, c);
        break;
      case "data":
        if (t !== "object") {
          To(e, "data", r);
          break;
        }
      case "src":
      case "href":
        if (r === "" && (t !== "a" || n !== "href")) {
          e.removeAttribute(n);
          break;
        }
        if (r == null || typeof r == "function" || typeof r == "symbol" || typeof r == "boolean") {
          e.removeAttribute(n);
          break;
        }
        r = ko("" + r), e.setAttribute(n, r);
        break;
      case "action":
      case "formAction":
        if (typeof r == "function") {
          e.setAttribute(
            n,
            "javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')"
          );
          break;
        } else
          typeof c == "function" && (n === "formAction" ? (t !== "input" && Ee(e, t, "name", l.name, l, null), Ee(
            e,
            t,
            "formEncType",
            l.formEncType,
            l,
            null
          ), Ee(
            e,
            t,
            "formMethod",
            l.formMethod,
            l,
            null
          ), Ee(
            e,
            t,
            "formTarget",
            l.formTarget,
            l,
            null
          )) : (Ee(e, t, "encType", l.encType, l, null), Ee(e, t, "method", l.method, l, null), Ee(e, t, "target", l.target, l, null)));
        if (r == null || typeof r == "symbol" || typeof r == "boolean") {
          e.removeAttribute(n);
          break;
        }
        r = ko("" + r), e.setAttribute(n, r);
        break;
      case "onClick":
        r != null && (e.onclick = tn);
        break;
      case "onScroll":
        r != null && se("scroll", e);
        break;
      case "onScrollEnd":
        r != null && se("scrollend", e);
        break;
      case "dangerouslySetInnerHTML":
        if (r != null) {
          if (typeof r != "object" || !("__html" in r))
            throw Error(s(61));
          if (n = r.__html, n != null) {
            if (l.children != null) throw Error(s(60));
            e.innerHTML = n;
          }
        }
        break;
      case "multiple":
        e.multiple = r && typeof r != "function" && typeof r != "symbol";
        break;
      case "muted":
        e.muted = r && typeof r != "function" && typeof r != "symbol";
        break;
      case "suppressContentEditableWarning":
      case "suppressHydrationWarning":
      case "defaultValue":
      case "defaultChecked":
      case "innerHTML":
      case "ref":
        break;
      case "autoFocus":
        break;
      case "xlinkHref":
        if (r == null || typeof r == "function" || typeof r == "boolean" || typeof r == "symbol") {
          e.removeAttribute("xlink:href");
          break;
        }
        n = ko("" + r), e.setAttributeNS(
          "http://www.w3.org/1999/xlink",
          "xlink:href",
          n
        );
        break;
      case "contentEditable":
      case "spellCheck":
      case "draggable":
      case "value":
      case "autoReverse":
      case "externalResourcesRequired":
      case "focusable":
      case "preserveAlpha":
        r != null && typeof r != "function" && typeof r != "symbol" ? e.setAttribute(n, "" + r) : e.removeAttribute(n);
        break;
      case "inert":
      case "allowFullScreen":
      case "async":
      case "autoPlay":
      case "controls":
      case "default":
      case "defer":
      case "disabled":
      case "disablePictureInPicture":
      case "disableRemotePlayback":
      case "formNoValidate":
      case "hidden":
      case "loop":
      case "noModule":
      case "noValidate":
      case "open":
      case "playsInline":
      case "readOnly":
      case "required":
      case "reversed":
      case "scoped":
      case "seamless":
      case "itemScope":
        r && typeof r != "function" && typeof r != "symbol" ? e.setAttribute(n, "") : e.removeAttribute(n);
        break;
      case "capture":
      case "download":
        r === !0 ? e.setAttribute(n, "") : r !== !1 && r != null && typeof r != "function" && typeof r != "symbol" ? e.setAttribute(n, r) : e.removeAttribute(n);
        break;
      case "cols":
      case "rows":
      case "size":
      case "span":
        r != null && typeof r != "function" && typeof r != "symbol" && !isNaN(r) && 1 <= r ? e.setAttribute(n, r) : e.removeAttribute(n);
        break;
      case "rowSpan":
      case "start":
        r == null || typeof r == "function" || typeof r == "symbol" || isNaN(r) ? e.removeAttribute(n) : e.setAttribute(n, r);
        break;
      case "popover":
        se("beforetoggle", e), se("toggle", e), No(e, "popover", r);
        break;
      case "xlinkActuate":
        en(
          e,
          "http://www.w3.org/1999/xlink",
          "xlink:actuate",
          r
        );
        break;
      case "xlinkArcrole":
        en(
          e,
          "http://www.w3.org/1999/xlink",
          "xlink:arcrole",
          r
        );
        break;
      case "xlinkRole":
        en(
          e,
          "http://www.w3.org/1999/xlink",
          "xlink:role",
          r
        );
        break;
      case "xlinkShow":
        en(
          e,
          "http://www.w3.org/1999/xlink",
          "xlink:show",
          r
        );
        break;
      case "xlinkTitle":
        en(
          e,
          "http://www.w3.org/1999/xlink",
          "xlink:title",
          r
        );
        break;
      case "xlinkType":
        en(
          e,
          "http://www.w3.org/1999/xlink",
          "xlink:type",
          r
        );
        break;
      case "xmlBase":
        en(
          e,
          "http://www.w3.org/XML/1998/namespace",
          "xml:base",
          r
        );
        break;
      case "xmlLang":
        en(
          e,
          "http://www.w3.org/XML/1998/namespace",
          "xml:lang",
          r
        );
        break;
      case "xmlSpace":
        en(
          e,
          "http://www.w3.org/XML/1998/namespace",
          "xml:space",
          r
        );
        break;
      case "is":
        No(e, "is", r);
        break;
      case "innerText":
      case "textContent":
        break;
      default:
        (!(2 < n.length) || n[0] !== "o" && n[0] !== "O" || n[1] !== "n" && n[1] !== "N") && (n = hy.get(n) || n, No(e, n, r));
    }
  }
  function uc(e, t, n, r, l, c) {
    switch (n) {
      case "style":
        Xd(e, r, c);
        break;
      case "dangerouslySetInnerHTML":
        if (r != null) {
          if (typeof r != "object" || !("__html" in r))
            throw Error(s(61));
          if (n = r.__html, n != null) {
            if (l.children != null) throw Error(s(60));
            e.innerHTML = n;
          }
        }
        break;
      case "children":
        typeof r == "string" ? Oa(e, r) : (typeof r == "number" || typeof r == "bigint") && Oa(e, "" + r);
        break;
      case "onScroll":
        r != null && se("scroll", e);
        break;
      case "onScrollEnd":
        r != null && se("scrollend", e);
        break;
      case "onClick":
        r != null && (e.onclick = tn);
        break;
      case "suppressContentEditableWarning":
      case "suppressHydrationWarning":
      case "innerHTML":
      case "ref":
        break;
      case "innerText":
      case "textContent":
        break;
      default:
        if (!Ld.hasOwnProperty(n))
          e: {
            if (n[0] === "o" && n[1] === "n" && (l = n.endsWith("Capture"), t = n.slice(2, l ? n.length - 7 : void 0), c = e[ft] || null, c = c != null ? c[n] : null, typeof c == "function" && e.removeEventListener(t, c, l), typeof r == "function")) {
              typeof c != "function" && c !== null && (n in e ? e[n] = null : e.hasAttribute(n) && e.removeAttribute(n)), e.addEventListener(t, r, l);
              break e;
            }
            n in e ? e[n] = r : r === !0 ? e.setAttribute(n, "") : No(e, n, r);
          }
    }
  }
  function rt(e, t, n) {
    switch (t) {
      case "div":
      case "span":
      case "svg":
      case "path":
      case "a":
      case "g":
      case "p":
      case "li":
        break;
      case "img":
        se("error", e), se("load", e);
        var r = !1, l = !1, c;
        for (c in n)
          if (n.hasOwnProperty(c)) {
            var m = n[c];
            if (m != null)
              switch (c) {
                case "src":
                  r = !0;
                  break;
                case "srcSet":
                  l = !0;
                  break;
                case "children":
                case "dangerouslySetInnerHTML":
                  throw Error(s(137, t));
                default:
                  Ee(e, t, c, m, n, null);
              }
          }
        l && Ee(e, t, "srcSet", n.srcSet, n, null), r && Ee(e, t, "src", n.src, n, null);
        return;
      case "input":
        se("invalid", e);
        var b = c = m = l = null, v = null, _ = null;
        for (r in n)
          if (n.hasOwnProperty(r)) {
            var I = n[r];
            if (I != null)
              switch (r) {
                case "name":
                  l = I;
                  break;
                case "type":
                  m = I;
                  break;
                case "checked":
                  v = I;
                  break;
                case "defaultChecked":
                  _ = I;
                  break;
                case "value":
                  c = I;
                  break;
                case "defaultValue":
                  b = I;
                  break;
                case "children":
                case "dangerouslySetInnerHTML":
                  if (I != null)
                    throw Error(s(137, t));
                  break;
                default:
                  Ee(e, t, r, I, n, null);
              }
          }
        Gd(
          e,
          c,
          b,
          v,
          _,
          m,
          l,
          !1
        );
        return;
      case "select":
        se("invalid", e), r = m = c = null;
        for (l in n)
          if (n.hasOwnProperty(l) && (b = n[l], b != null))
            switch (l) {
              case "value":
                c = b;
                break;
              case "defaultValue":
                m = b;
                break;
              case "multiple":
                r = b;
              default:
                Ee(e, t, l, b, n, null);
            }
        t = c, n = m, e.multiple = !!r, t != null ? _a(e, !!r, t, !1) : n != null && _a(e, !!r, n, !0);
        return;
      case "textarea":
        se("invalid", e), c = l = r = null;
        for (m in n)
          if (n.hasOwnProperty(m) && (b = n[m], b != null))
            switch (m) {
              case "value":
                r = b;
                break;
              case "defaultValue":
                l = b;
                break;
              case "children":
                c = b;
                break;
              case "dangerouslySetInnerHTML":
                if (b != null) throw Error(s(91));
                break;
              default:
                Ee(e, t, m, b, n, null);
            }
        Vd(e, r, l, c);
        return;
      case "option":
        for (v in n)
          if (n.hasOwnProperty(v) && (r = n[v], r != null))
            switch (v) {
              case "selected":
                e.selected = r && typeof r != "function" && typeof r != "symbol";
                break;
              default:
                Ee(e, t, v, r, n, null);
            }
        return;
      case "dialog":
        se("beforetoggle", e), se("toggle", e), se("cancel", e), se("close", e);
        break;
      case "iframe":
      case "object":
        se("load", e);
        break;
      case "video":
      case "audio":
        for (r = 0; r < Pr.length; r++)
          se(Pr[r], e);
        break;
      case "image":
        se("error", e), se("load", e);
        break;
      case "details":
        se("toggle", e);
        break;
      case "embed":
      case "source":
      case "link":
        se("error", e), se("load", e);
      case "area":
      case "base":
      case "br":
      case "col":
      case "hr":
      case "keygen":
      case "meta":
      case "param":
      case "track":
      case "wbr":
      case "menuitem":
        for (_ in n)
          if (n.hasOwnProperty(_) && (r = n[_], r != null))
            switch (_) {
              case "children":
              case "dangerouslySetInnerHTML":
                throw Error(s(137, t));
              default:
                Ee(e, t, _, r, n, null);
            }
        return;
      default:
        if (Al(t)) {
          for (I in n)
            n.hasOwnProperty(I) && (r = n[I], r !== void 0 && uc(
              e,
              t,
              I,
              r,
              n,
              void 0
            ));
          return;
        }
    }
    for (b in n)
      n.hasOwnProperty(b) && (r = n[b], r != null && Ee(e, t, b, r, n, null));
  }
  function Gg(e, t, n, r) {
    switch (t) {
      case "div":
      case "span":
      case "svg":
      case "path":
      case "a":
      case "g":
      case "p":
      case "li":
        break;
      case "input":
        var l = null, c = null, m = null, b = null, v = null, _ = null, I = null;
        for (k in n) {
          var L = n[k];
          if (n.hasOwnProperty(k) && L != null)
            switch (k) {
              case "checked":
                break;
              case "value":
                break;
              case "defaultValue":
                v = L;
              default:
                r.hasOwnProperty(k) || Ee(e, t, k, null, r, L);
            }
        }
        for (var N in r) {
          var k = r[N];
          if (L = n[N], r.hasOwnProperty(N) && (k != null || L != null))
            switch (N) {
              case "type":
                c = k;
                break;
              case "name":
                l = k;
                break;
              case "checked":
                _ = k;
                break;
              case "defaultChecked":
                I = k;
                break;
              case "value":
                m = k;
                break;
              case "defaultValue":
                b = k;
                break;
              case "children":
              case "dangerouslySetInnerHTML":
                if (k != null)
                  throw Error(s(137, t));
                break;
              default:
                k !== L && Ee(
                  e,
                  t,
                  N,
                  k,
                  r,
                  L
                );
            }
        }
        jl(
          e,
          m,
          b,
          v,
          _,
          I,
          c,
          l
        );
        return;
      case "select":
        k = m = b = N = null;
        for (c in n)
          if (v = n[c], n.hasOwnProperty(c) && v != null)
            switch (c) {
              case "value":
                break;
              case "multiple":
                k = v;
              default:
                r.hasOwnProperty(c) || Ee(
                  e,
                  t,
                  c,
                  null,
                  r,
                  v
                );
            }
        for (l in r)
          if (c = r[l], v = n[l], r.hasOwnProperty(l) && (c != null || v != null))
            switch (l) {
              case "value":
                N = c;
                break;
              case "defaultValue":
                b = c;
                break;
              case "multiple":
                m = c;
              default:
                c !== v && Ee(
                  e,
                  t,
                  l,
                  c,
                  r,
                  v
                );
            }
        t = b, n = m, r = k, N != null ? _a(e, !!n, N, !1) : !!r != !!n && (t != null ? _a(e, !!n, t, !0) : _a(e, !!n, n ? [] : "", !1));
        return;
      case "textarea":
        k = N = null;
        for (b in n)
          if (l = n[b], n.hasOwnProperty(b) && l != null && !r.hasOwnProperty(b))
            switch (b) {
              case "value":
                break;
              case "children":
                break;
              default:
                Ee(e, t, b, null, r, l);
            }
        for (m in r)
          if (l = r[m], c = n[m], r.hasOwnProperty(m) && (l != null || c != null))
            switch (m) {
              case "value":
                N = l;
                break;
              case "defaultValue":
                k = l;
                break;
              case "children":
                break;
              case "dangerouslySetInnerHTML":
                if (l != null) throw Error(s(91));
                break;
              default:
                l !== c && Ee(e, t, m, l, r, c);
            }
        qd(e, N, k);
        return;
      case "option":
        for (var G in n)
          if (N = n[G], n.hasOwnProperty(G) && N != null && !r.hasOwnProperty(G))
            switch (G) {
              case "selected":
                e.selected = !1;
                break;
              default:
                Ee(
                  e,
                  t,
                  G,
                  null,
                  r,
                  N
                );
            }
        for (v in r)
          if (N = r[v], k = n[v], r.hasOwnProperty(v) && N !== k && (N != null || k != null))
            switch (v) {
              case "selected":
                e.selected = N && typeof N != "function" && typeof N != "symbol";
                break;
              default:
                Ee(
                  e,
                  t,
                  v,
                  N,
                  r,
                  k
                );
            }
        return;
      case "img":
      case "link":
      case "area":
      case "base":
      case "br":
      case "col":
      case "embed":
      case "hr":
      case "keygen":
      case "meta":
      case "param":
      case "source":
      case "track":
      case "wbr":
      case "menuitem":
        for (var Q in n)
          N = n[Q], n.hasOwnProperty(Q) && N != null && !r.hasOwnProperty(Q) && Ee(e, t, Q, null, r, N);
        for (_ in r)
          if (N = r[_], k = n[_], r.hasOwnProperty(_) && N !== k && (N != null || k != null))
            switch (_) {
              case "children":
              case "dangerouslySetInnerHTML":
                if (N != null)
                  throw Error(s(137, t));
                break;
              default:
                Ee(
                  e,
                  t,
                  _,
                  N,
                  r,
                  k
                );
            }
        return;
      default:
        if (Al(t)) {
          for (var Ae in n)
            N = n[Ae], n.hasOwnProperty(Ae) && N !== void 0 && !r.hasOwnProperty(Ae) && uc(
              e,
              t,
              Ae,
              void 0,
              r,
              N
            );
          for (I in r)
            N = r[I], k = n[I], !r.hasOwnProperty(I) || N === k || N === void 0 && k === void 0 || uc(
              e,
              t,
              I,
              N,
              r,
              k
            );
          return;
        }
    }
    for (var j in n)
      N = n[j], n.hasOwnProperty(j) && N != null && !r.hasOwnProperty(j) && Ee(e, t, j, null, r, N);
    for (L in r)
      N = r[L], k = n[L], !r.hasOwnProperty(L) || N === k || N == null && k == null || Ee(e, t, L, N, r, k);
  }
  function Kf(e) {
    switch (e) {
      case "css":
      case "script":
      case "font":
      case "img":
      case "image":
      case "input":
      case "link":
        return !0;
      default:
        return !1;
    }
  }
  function qg() {
    if (typeof performance.getEntriesByType == "function") {
      for (var e = 0, t = 0, n = performance.getEntriesByType("resource"), r = 0; r < n.length; r++) {
        var l = n[r], c = l.transferSize, m = l.initiatorType, b = l.duration;
        if (c && b && Kf(m)) {
          for (m = 0, b = l.responseEnd, r += 1; r < n.length; r++) {
            var v = n[r], _ = v.startTime;
            if (_ > b) break;
            var I = v.transferSize, L = v.initiatorType;
            I && Kf(L) && (v = v.responseEnd, m += I * (v < b ? 1 : (b - _) / (v - _)));
          }
          if (--r, t += 8 * (c + m) / (l.duration / 1e3), e++, 10 < e) break;
        }
      }
      if (0 < e) return t / e / 1e6;
    }
    return navigator.connection && (e = navigator.connection.downlink, typeof e == "number") ? e : 5;
  }
  var mc = null, fc = null;
  function Oi(e) {
    return e.nodeType === 9 ? e : e.ownerDocument;
  }
  function Zf(e) {
    switch (e) {
      case "http://www.w3.org/2000/svg":
        return 1;
      case "http://www.w3.org/1998/Math/MathML":
        return 2;
      default:
        return 0;
    }
  }
  function Qf(e, t) {
    if (e === 0)
      switch (t) {
        case "svg":
          return 1;
        case "math":
          return 2;
        default:
          return 0;
      }
    return e === 1 && t === "foreignObject" ? 0 : e;
  }
  function pc(e, t) {
    return e === "textarea" || e === "noscript" || typeof t.children == "string" || typeof t.children == "number" || typeof t.children == "bigint" || typeof t.dangerouslySetInnerHTML == "object" && t.dangerouslySetInnerHTML !== null && t.dangerouslySetInnerHTML.__html != null;
  }
  var bc = null;
  function Vg() {
    var e = window.event;
    return e && e.type === "popstate" ? e === bc ? !1 : (bc = e, !0) : (bc = null, !1);
  }
  var Jf = typeof setTimeout == "function" ? setTimeout : void 0, Fg = typeof clearTimeout == "function" ? clearTimeout : void 0, Wf = typeof Promise == "function" ? Promise : void 0, Xg = typeof queueMicrotask == "function" ? queueMicrotask : typeof Wf < "u" ? function(e) {
    return Wf.resolve(null).then(e).catch(Pg);
  } : Jf;
  function Pg(e) {
    setTimeout(function() {
      throw e;
    });
  }
  function Bn(e) {
    return e === "head";
  }
  function ep(e, t) {
    var n = t, r = 0;
    do {
      var l = n.nextSibling;
      if (e.removeChild(n), l && l.nodeType === 8)
        if (n = l.data, n === "/$" || n === "/&") {
          if (r === 0) {
            e.removeChild(l), rr(t);
            return;
          }
          r--;
        } else if (n === "$" || n === "$?" || n === "$~" || n === "$!" || n === "&")
          r++;
        else if (n === "html")
          Zr(e.ownerDocument.documentElement);
        else if (n === "head") {
          n = e.ownerDocument.head, Zr(n);
          for (var c = n.firstChild; c; ) {
            var m = c.nextSibling, b = c.nodeName;
            c[pr] || b === "SCRIPT" || b === "STYLE" || b === "LINK" && c.rel.toLowerCase() === "stylesheet" || n.removeChild(c), c = m;
          }
        } else
          n === "body" && Zr(e.ownerDocument.body);
      n = l;
    } while (n);
    rr(t);
  }
  function tp(e, t) {
    var n = e;
    e = 0;
    do {
      var r = n.nextSibling;
      if (n.nodeType === 1 ? t ? (n._stashedDisplay = n.style.display, n.style.display = "none") : (n.style.display = n._stashedDisplay || "", n.getAttribute("style") === "" && n.removeAttribute("style")) : n.nodeType === 3 && (t ? (n._stashedText = n.nodeValue, n.nodeValue = "") : n.nodeValue = n._stashedText || ""), r && r.nodeType === 8)
        if (n = r.data, n === "/$") {
          if (e === 0) break;
          e--;
        } else
          n !== "$" && n !== "$?" && n !== "$~" && n !== "$!" || e++;
      n = r;
    } while (n);
  }
  function hc(e) {
    var t = e.firstChild;
    for (t && t.nodeType === 10 && (t = t.nextSibling); t; ) {
      var n = t;
      switch (t = t.nextSibling, n.nodeName) {
        case "HTML":
        case "HEAD":
        case "BODY":
          hc(n), wl(n);
          continue;
        case "SCRIPT":
        case "STYLE":
          continue;
        case "LINK":
          if (n.rel.toLowerCase() === "stylesheet") continue;
      }
      e.removeChild(n);
    }
  }
  function Kg(e, t, n, r) {
    for (; e.nodeType === 1; ) {
      var l = n;
      if (e.nodeName.toLowerCase() !== t.toLowerCase()) {
        if (!r && (e.nodeName !== "INPUT" || e.type !== "hidden"))
          break;
      } else if (r) {
        if (!e[pr])
          switch (t) {
            case "meta":
              if (!e.hasAttribute("itemprop")) break;
              return e;
            case "link":
              if (c = e.getAttribute("rel"), c === "stylesheet" && e.hasAttribute("data-precedence"))
                break;
              if (c !== l.rel || e.getAttribute("href") !== (l.href == null || l.href === "" ? null : l.href) || e.getAttribute("crossorigin") !== (l.crossOrigin == null ? null : l.crossOrigin) || e.getAttribute("title") !== (l.title == null ? null : l.title))
                break;
              return e;
            case "style":
              if (e.hasAttribute("data-precedence")) break;
              return e;
            case "script":
              if (c = e.getAttribute("src"), (c !== (l.src == null ? null : l.src) || e.getAttribute("type") !== (l.type == null ? null : l.type) || e.getAttribute("crossorigin") !== (l.crossOrigin == null ? null : l.crossOrigin)) && c && e.hasAttribute("async") && !e.hasAttribute("itemprop"))
                break;
              return e;
            default:
              return e;
          }
      } else if (t === "input" && e.type === "hidden") {
        var c = l.name == null ? null : "" + l.name;
        if (l.type === "hidden" && e.getAttribute("name") === c)
          return e;
      } else return e;
      if (e = Ht(e.nextSibling), e === null) break;
    }
    return null;
  }
  function Zg(e, t, n) {
    if (t === "") return null;
    for (; e.nodeType !== 3; )
      if ((e.nodeType !== 1 || e.nodeName !== "INPUT" || e.type !== "hidden") && !n || (e = Ht(e.nextSibling), e === null)) return null;
    return e;
  }
  function np(e, t) {
    for (; e.nodeType !== 8; )
      if ((e.nodeType !== 1 || e.nodeName !== "INPUT" || e.type !== "hidden") && !t || (e = Ht(e.nextSibling), e === null)) return null;
    return e;
  }
  function yc(e) {
    return e.data === "$?" || e.data === "$~";
  }
  function gc(e) {
    return e.data === "$!" || e.data === "$?" && e.ownerDocument.readyState !== "loading";
  }
  function Qg(e, t) {
    var n = e.ownerDocument;
    if (e.data === "$~") e._reactRetry = t;
    else if (e.data !== "$?" || n.readyState !== "loading")
      t();
    else {
      var r = function() {
        t(), n.removeEventListener("DOMContentLoaded", r);
      };
      n.addEventListener("DOMContentLoaded", r), e._reactRetry = r;
    }
  }
  function Ht(e) {
    for (; e != null; e = e.nextSibling) {
      var t = e.nodeType;
      if (t === 1 || t === 3) break;
      if (t === 8) {
        if (t = e.data, t === "$" || t === "$!" || t === "$?" || t === "$~" || t === "&" || t === "F!" || t === "F")
          break;
        if (t === "/$" || t === "/&") return null;
      }
    }
    return e;
  }
  var vc = null;
  function ap(e) {
    e = e.nextSibling;
    for (var t = 0; e; ) {
      if (e.nodeType === 8) {
        var n = e.data;
        if (n === "/$" || n === "/&") {
          if (t === 0)
            return Ht(e.nextSibling);
          t--;
        } else
          n !== "$" && n !== "$!" && n !== "$?" && n !== "$~" && n !== "&" || t++;
      }
      e = e.nextSibling;
    }
    return null;
  }
  function rp(e) {
    e = e.previousSibling;
    for (var t = 0; e; ) {
      if (e.nodeType === 8) {
        var n = e.data;
        if (n === "$" || n === "$!" || n === "$?" || n === "$~" || n === "&") {
          if (t === 0) return e;
          t--;
        } else n !== "/$" && n !== "/&" || t++;
      }
      e = e.previousSibling;
    }
    return null;
  }
  function op(e, t, n) {
    switch (t = Oi(n), e) {
      case "html":
        if (e = t.documentElement, !e) throw Error(s(452));
        return e;
      case "head":
        if (e = t.head, !e) throw Error(s(453));
        return e;
      case "body":
        if (e = t.body, !e) throw Error(s(454));
        return e;
      default:
        throw Error(s(451));
    }
  }
  function Zr(e) {
    for (var t = e.attributes; t.length; )
      e.removeAttributeNode(t[0]);
    wl(e);
  }
  var Bt = /* @__PURE__ */ new Map(), ip = /* @__PURE__ */ new Set();
  function zi(e) {
    return typeof e.getRootNode == "function" ? e.getRootNode() : e.nodeType === 9 ? e : e.ownerDocument;
  }
  var gn = B.d;
  B.d = {
    f: Jg,
    r: Wg,
    D: ev,
    C: tv,
    L: nv,
    m: av,
    X: ov,
    S: rv,
    M: iv
  };
  function Jg() {
    var e = gn.f(), t = vi();
    return e || t;
  }
  function Wg(e) {
    var t = ja(e);
    t !== null && t.tag === 5 && t.type === "form" ? Sm(t) : gn.r(e);
  }
  var tr = typeof document > "u" ? null : document;
  function lp(e, t, n) {
    var r = tr;
    if (r && typeof t == "string" && t) {
      var l = kt(t);
      l = 'link[rel="' + e + '"][href="' + l + '"]', typeof n == "string" && (l += '[crossorigin="' + n + '"]'), ip.has(l) || (ip.add(l), e = { rel: e, crossOrigin: n, href: t }, r.querySelector(l) === null && (t = r.createElement("link"), rt(t, "link", e), Ze(t), r.head.appendChild(t)));
    }
  }
  function ev(e) {
    gn.D(e), lp("dns-prefetch", e, null);
  }
  function tv(e, t) {
    gn.C(e, t), lp("preconnect", e, t);
  }
  function nv(e, t, n) {
    gn.L(e, t, n);
    var r = tr;
    if (r && e && t) {
      var l = 'link[rel="preload"][as="' + kt(t) + '"]';
      t === "image" && n && n.imageSrcSet ? (l += '[imagesrcset="' + kt(
        n.imageSrcSet
      ) + '"]', typeof n.imageSizes == "string" && (l += '[imagesizes="' + kt(
        n.imageSizes
      ) + '"]')) : l += '[href="' + kt(e) + '"]';
      var c = l;
      switch (t) {
        case "style":
          c = nr(e);
          break;
        case "script":
          c = ar(e);
      }
      Bt.has(c) || (e = O(
        {
          rel: "preload",
          href: t === "image" && n && n.imageSrcSet ? void 0 : e,
          as: t
        },
        n
      ), Bt.set(c, e), r.querySelector(l) !== null || t === "style" && r.querySelector(Qr(c)) || t === "script" && r.querySelector(Jr(c)) || (t = r.createElement("link"), rt(t, "link", e), Ze(t), r.head.appendChild(t)));
    }
  }
  function av(e, t) {
    gn.m(e, t);
    var n = tr;
    if (n && e) {
      var r = t && typeof t.as == "string" ? t.as : "script", l = 'link[rel="modulepreload"][as="' + kt(r) + '"][href="' + kt(e) + '"]', c = l;
      switch (r) {
        case "audioworklet":
        case "paintworklet":
        case "serviceworker":
        case "sharedworker":
        case "worker":
        case "script":
          c = ar(e);
      }
      if (!Bt.has(c) && (e = O({ rel: "modulepreload", href: e }, t), Bt.set(c, e), n.querySelector(l) === null)) {
        switch (r) {
          case "audioworklet":
          case "paintworklet":
          case "serviceworker":
          case "sharedworker":
          case "worker":
          case "script":
            if (n.querySelector(Jr(c)))
              return;
        }
        r = n.createElement("link"), rt(r, "link", e), Ze(r), n.head.appendChild(r);
      }
    }
  }
  function rv(e, t, n) {
    gn.S(e, t, n);
    var r = tr;
    if (r && e) {
      var l = Ea(r).hoistableStyles, c = nr(e);
      t = t || "default";
      var m = l.get(c);
      if (!m) {
        var b = { loading: 0, preload: null };
        if (m = r.querySelector(
          Qr(c)
        ))
          b.loading = 5;
        else {
          e = O(
            { rel: "stylesheet", href: e, "data-precedence": t },
            n
          ), (n = Bt.get(c)) && xc(e, n);
          var v = m = r.createElement("link");
          Ze(v), rt(v, "link", e), v._p = new Promise(function(_, I) {
            v.onload = _, v.onerror = I;
          }), v.addEventListener("load", function() {
            b.loading |= 1;
          }), v.addEventListener("error", function() {
            b.loading |= 2;
          }), b.loading |= 4, Ni(m, t, r);
        }
        m = {
          type: "stylesheet",
          instance: m,
          count: 1,
          state: b
        }, l.set(c, m);
      }
    }
  }
  function ov(e, t) {
    gn.X(e, t);
    var n = tr;
    if (n && e) {
      var r = Ea(n).hoistableScripts, l = ar(e), c = r.get(l);
      c || (c = n.querySelector(Jr(l)), c || (e = O({ src: e, async: !0 }, t), (t = Bt.get(l)) && wc(e, t), c = n.createElement("script"), Ze(c), rt(c, "link", e), n.head.appendChild(c)), c = {
        type: "script",
        instance: c,
        count: 1,
        state: null
      }, r.set(l, c));
    }
  }
  function iv(e, t) {
    gn.M(e, t);
    var n = tr;
    if (n && e) {
      var r = Ea(n).hoistableScripts, l = ar(e), c = r.get(l);
      c || (c = n.querySelector(Jr(l)), c || (e = O({ src: e, async: !0, type: "module" }, t), (t = Bt.get(l)) && wc(e, t), c = n.createElement("script"), Ze(c), rt(c, "link", e), n.head.appendChild(c)), c = {
        type: "script",
        instance: c,
        count: 1,
        state: null
      }, r.set(l, c));
    }
  }
  function sp(e, t, n, r) {
    var l = (l = ie.current) ? zi(l) : null;
    if (!l) throw Error(s(446));
    switch (e) {
      case "meta":
      case "title":
        return null;
      case "style":
        return typeof n.precedence == "string" && typeof n.href == "string" ? (t = nr(n.href), n = Ea(
          l
        ).hoistableStyles, r = n.get(t), r || (r = {
          type: "style",
          instance: null,
          count: 0,
          state: null
        }, n.set(t, r)), r) : { type: "void", instance: null, count: 0, state: null };
      case "link":
        if (n.rel === "stylesheet" && typeof n.href == "string" && typeof n.precedence == "string") {
          e = nr(n.href);
          var c = Ea(
            l
          ).hoistableStyles, m = c.get(e);
          if (m || (l = l.ownerDocument || l, m = {
            type: "stylesheet",
            instance: null,
            count: 0,
            state: { loading: 0, preload: null }
          }, c.set(e, m), (c = l.querySelector(
            Qr(e)
          )) && !c._p && (m.instance = c, m.state.loading = 5), Bt.has(e) || (n = {
            rel: "preload",
            as: "style",
            href: n.href,
            crossOrigin: n.crossOrigin,
            integrity: n.integrity,
            media: n.media,
            hrefLang: n.hrefLang,
            referrerPolicy: n.referrerPolicy
          }, Bt.set(e, n), c || lv(
            l,
            e,
            n,
            m.state
          ))), t && r === null)
            throw Error(s(528, ""));
          return m;
        }
        if (t && r !== null)
          throw Error(s(529, ""));
        return null;
      case "script":
        return t = n.async, n = n.src, typeof n == "string" && t && typeof t != "function" && typeof t != "symbol" ? (t = ar(n), n = Ea(
          l
        ).hoistableScripts, r = n.get(t), r || (r = {
          type: "script",
          instance: null,
          count: 0,
          state: null
        }, n.set(t, r)), r) : { type: "void", instance: null, count: 0, state: null };
      default:
        throw Error(s(444, e));
    }
  }
  function nr(e) {
    return 'href="' + kt(e) + '"';
  }
  function Qr(e) {
    return 'link[rel="stylesheet"][' + e + "]";
  }
  function cp(e) {
    return O({}, e, {
      "data-precedence": e.precedence,
      precedence: null
    });
  }
  function lv(e, t, n, r) {
    e.querySelector('link[rel="preload"][as="style"][' + t + "]") ? r.loading = 1 : (t = e.createElement("link"), r.preload = t, t.addEventListener("load", function() {
      return r.loading |= 1;
    }), t.addEventListener("error", function() {
      return r.loading |= 2;
    }), rt(t, "link", n), Ze(t), e.head.appendChild(t));
  }
  function ar(e) {
    return '[src="' + kt(e) + '"]';
  }
  function Jr(e) {
    return "script[async]" + e;
  }
  function dp(e, t, n) {
    if (t.count++, t.instance === null)
      switch (t.type) {
        case "style":
          var r = e.querySelector(
            'style[data-href~="' + kt(n.href) + '"]'
          );
          if (r)
            return t.instance = r, Ze(r), r;
          var l = O({}, n, {
            "data-href": n.href,
            "data-precedence": n.precedence,
            href: null,
            precedence: null
          });
          return r = (e.ownerDocument || e).createElement(
            "style"
          ), Ze(r), rt(r, "style", l), Ni(r, n.precedence, e), t.instance = r;
        case "stylesheet":
          l = nr(n.href);
          var c = e.querySelector(
            Qr(l)
          );
          if (c)
            return t.state.loading |= 4, t.instance = c, Ze(c), c;
          r = cp(n), (l = Bt.get(l)) && xc(r, l), c = (e.ownerDocument || e).createElement("link"), Ze(c);
          var m = c;
          return m._p = new Promise(function(b, v) {
            m.onload = b, m.onerror = v;
          }), rt(c, "link", r), t.state.loading |= 4, Ni(c, n.precedence, e), t.instance = c;
        case "script":
          return c = ar(n.src), (l = e.querySelector(
            Jr(c)
          )) ? (t.instance = l, Ze(l), l) : (r = n, (l = Bt.get(c)) && (r = O({}, n), wc(r, l)), e = e.ownerDocument || e, l = e.createElement("script"), Ze(l), rt(l, "link", r), e.head.appendChild(l), t.instance = l);
        case "void":
          return null;
        default:
          throw Error(s(443, t.type));
      }
    else
      t.type === "stylesheet" && (t.state.loading & 4) === 0 && (r = t.instance, t.state.loading |= 4, Ni(r, n.precedence, e));
    return t.instance;
  }
  function Ni(e, t, n) {
    for (var r = n.querySelectorAll(
      'link[rel="stylesheet"][data-precedence],style[data-precedence]'
    ), l = r.length ? r[r.length - 1] : null, c = l, m = 0; m < r.length; m++) {
      var b = r[m];
      if (b.dataset.precedence === t) c = b;
      else if (c !== l) break;
    }
    c ? c.parentNode.insertBefore(e, c.nextSibling) : (t = n.nodeType === 9 ? n.head : n, t.insertBefore(e, t.firstChild));
  }
  function xc(e, t) {
    e.crossOrigin == null && (e.crossOrigin = t.crossOrigin), e.referrerPolicy == null && (e.referrerPolicy = t.referrerPolicy), e.title == null && (e.title = t.title);
  }
  function wc(e, t) {
    e.crossOrigin == null && (e.crossOrigin = t.crossOrigin), e.referrerPolicy == null && (e.referrerPolicy = t.referrerPolicy), e.integrity == null && (e.integrity = t.integrity);
  }
  var Ti = null;
  function up(e, t, n) {
    if (Ti === null) {
      var r = /* @__PURE__ */ new Map(), l = Ti = /* @__PURE__ */ new Map();
      l.set(n, r);
    } else
      l = Ti, r = l.get(n), r || (r = /* @__PURE__ */ new Map(), l.set(n, r));
    if (r.has(e)) return r;
    for (r.set(e, null), n = n.getElementsByTagName(e), l = 0; l < n.length; l++) {
      var c = n[l];
      if (!(c[pr] || c[et] || e === "link" && c.getAttribute("rel") === "stylesheet") && c.namespaceURI !== "http://www.w3.org/2000/svg") {
        var m = c.getAttribute(t) || "";
        m = e + m;
        var b = r.get(m);
        b ? b.push(c) : r.set(m, [c]);
      }
    }
    return r;
  }
  function mp(e, t, n) {
    e = e.ownerDocument || e, e.head.insertBefore(
      n,
      t === "title" ? e.querySelector("head > title") : null
    );
  }
  function sv(e, t, n) {
    if (n === 1 || t.itemProp != null) return !1;
    switch (e) {
      case "meta":
      case "title":
        return !0;
      case "style":
        if (typeof t.precedence != "string" || typeof t.href != "string" || t.href === "")
          break;
        return !0;
      case "link":
        if (typeof t.rel != "string" || typeof t.href != "string" || t.href === "" || t.onLoad || t.onError)
          break;
        switch (t.rel) {
          case "stylesheet":
            return e = t.disabled, typeof t.precedence == "string" && e == null;
          default:
            return !0;
        }
      case "script":
        if (t.async && typeof t.async != "function" && typeof t.async != "symbol" && !t.onLoad && !t.onError && t.src && typeof t.src == "string")
          return !0;
    }
    return !1;
  }
  function fp(e) {
    return !(e.type === "stylesheet" && (e.state.loading & 3) === 0);
  }
  function cv(e, t, n, r) {
    if (n.type === "stylesheet" && (typeof r.media != "string" || matchMedia(r.media).matches !== !1) && (n.state.loading & 4) === 0) {
      if (n.instance === null) {
        var l = nr(r.href), c = t.querySelector(
          Qr(l)
        );
        if (c) {
          t = c._p, t !== null && typeof t == "object" && typeof t.then == "function" && (e.count++, e = Ri.bind(e), t.then(e, e)), n.state.loading |= 4, n.instance = c, Ze(c);
          return;
        }
        c = t.ownerDocument || t, r = cp(r), (l = Bt.get(l)) && xc(r, l), c = c.createElement("link"), Ze(c);
        var m = c;
        m._p = new Promise(function(b, v) {
          m.onload = b, m.onerror = v;
        }), rt(c, "link", r), n.instance = c;
      }
      e.stylesheets === null && (e.stylesheets = /* @__PURE__ */ new Map()), e.stylesheets.set(n, t), (t = n.state.preload) && (n.state.loading & 3) === 0 && (e.count++, n = Ri.bind(e), t.addEventListener("load", n), t.addEventListener("error", n));
    }
  }
  var Sc = 0;
  function dv(e, t) {
    return e.stylesheets && e.count === 0 && Ci(e, e.stylesheets), 0 < e.count || 0 < e.imgCount ? function(n) {
      var r = setTimeout(function() {
        if (e.stylesheets && Ci(e, e.stylesheets), e.unsuspend) {
          var c = e.unsuspend;
          e.unsuspend = null, c();
        }
      }, 6e4 + t);
      0 < e.imgBytes && Sc === 0 && (Sc = 62500 * qg());
      var l = setTimeout(
        function() {
          if (e.waitingForImages = !1, e.count === 0 && (e.stylesheets && Ci(e, e.stylesheets), e.unsuspend)) {
            var c = e.unsuspend;
            e.unsuspend = null, c();
          }
        },
        (e.imgBytes > Sc ? 50 : 800) + t
      );
      return e.unsuspend = n, function() {
        e.unsuspend = null, clearTimeout(r), clearTimeout(l);
      };
    } : null;
  }
  function Ri() {
    if (this.count--, this.count === 0 && (this.imgCount === 0 || !this.waitingForImages)) {
      if (this.stylesheets) Ci(this, this.stylesheets);
      else if (this.unsuspend) {
        var e = this.unsuspend;
        this.unsuspend = null, e();
      }
    }
  }
  var ki = null;
  function Ci(e, t) {
    e.stylesheets = null, e.unsuspend !== null && (e.count++, ki = /* @__PURE__ */ new Map(), t.forEach(uv, e), ki = null, Ri.call(e));
  }
  function uv(e, t) {
    if (!(t.state.loading & 4)) {
      var n = ki.get(e);
      if (n) var r = n.get(null);
      else {
        n = /* @__PURE__ */ new Map(), ki.set(e, n);
        for (var l = e.querySelectorAll(
          "link[data-precedence],style[data-precedence]"
        ), c = 0; c < l.length; c++) {
          var m = l[c];
          (m.nodeName === "LINK" || m.getAttribute("media") !== "not all") && (n.set(m.dataset.precedence, m), r = m);
        }
        r && n.set(null, r);
      }
      l = t.instance, m = l.getAttribute("data-precedence"), c = n.get(m) || r, c === r && n.set(null, l), n.set(m, l), this.count++, r = Ri.bind(this), l.addEventListener("load", r), l.addEventListener("error", r), c ? c.parentNode.insertBefore(l, c.nextSibling) : (e = e.nodeType === 9 ? e.head : e, e.insertBefore(l, e.firstChild)), t.state.loading |= 4;
    }
  }
  var Wr = {
    $$typeof: $,
    Provider: null,
    Consumer: null,
    _currentValue: K,
    _currentValue2: K,
    _threadCount: 0
  };
  function mv(e, t, n, r, l, c, m, b, v) {
    this.tag = 1, this.containerInfo = e, this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = -1, this.callbackNode = this.next = this.pendingContext = this.context = this.cancelPendingCommit = null, this.callbackPriority = 0, this.expirationTimes = yl(-1), this.entangledLanes = this.shellSuspendCounter = this.errorRecoveryDisabledLanes = this.expiredLanes = this.warmLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = yl(0), this.hiddenUpdates = yl(null), this.identifierPrefix = r, this.onUncaughtError = l, this.onCaughtError = c, this.onRecoverableError = m, this.pooledCache = null, this.pooledCacheLanes = 0, this.formState = v, this.incompleteTransitions = /* @__PURE__ */ new Map();
  }
  function pp(e, t, n, r, l, c, m, b, v, _, I, L) {
    return e = new mv(
      e,
      t,
      n,
      m,
      v,
      _,
      I,
      L,
      b
    ), t = 1, c === !0 && (t |= 24), c = At(3, null, null, t), e.current = c, c.stateNode = e, t = ts(), t.refCount++, e.pooledCache = t, t.refCount++, c.memoizedState = {
      element: r,
      isDehydrated: n,
      cache: t
    }, os(c), e;
  }
  function bp(e) {
    return e ? (e = Ia, e) : Ia;
  }
  function hp(e, t, n, r, l, c) {
    l = bp(l), r.context === null ? r.context = l : r.pendingContext = l, r = Nn(t), r.payload = { element: n }, c = c === void 0 ? null : c, c !== null && (r.callback = c), n = Tn(e, r, t), n !== null && (vt(n, e, t), Rr(n, e, t));
  }
  function yp(e, t) {
    if (e = e.memoizedState, e !== null && e.dehydrated !== null) {
      var n = e.retryLane;
      e.retryLane = n !== 0 && n < t ? n : t;
    }
  }
  function jc(e, t) {
    yp(e, t), (e = e.alternate) && yp(e, t);
  }
  function gp(e) {
    if (e.tag === 13 || e.tag === 31) {
      var t = oa(e, 67108864);
      t !== null && vt(t, e, 67108864), jc(e, 67108864);
    }
  }
  function vp(e) {
    if (e.tag === 13 || e.tag === 31) {
      var t = Tt();
      t = gl(t);
      var n = oa(e, t);
      n !== null && vt(n, e, t), jc(e, t);
    }
  }
  var Ii = !0;
  function fv(e, t, n, r) {
    var l = C.T;
    C.T = null;
    var c = B.p;
    try {
      B.p = 2, Ec(e, t, n, r);
    } finally {
      B.p = c, C.T = l;
    }
  }
  function pv(e, t, n, r) {
    var l = C.T;
    C.T = null;
    var c = B.p;
    try {
      B.p = 8, Ec(e, t, n, r);
    } finally {
      B.p = c, C.T = l;
    }
  }
  function Ec(e, t, n, r) {
    if (Ii) {
      var l = Ac(r);
      if (l === null)
        dc(
          e,
          t,
          r,
          Mi,
          n
        ), wp(e, r);
      else if (hv(
        l,
        e,
        t,
        n,
        r
      ))
        r.stopPropagation();
      else if (wp(e, r), t & 4 && -1 < bv.indexOf(e)) {
        for (; l !== null; ) {
          var c = ja(l);
          if (c !== null)
            switch (c.tag) {
              case 3:
                if (c = c.stateNode, c.current.memoizedState.isDehydrated) {
                  var m = ea(c.pendingLanes);
                  if (m !== 0) {
                    var b = c;
                    for (b.pendingLanes |= 2, b.entangledLanes |= 2; m; ) {
                      var v = 1 << 31 - jt(m);
                      b.entanglements[1] |= v, m &= ~v;
                    }
                    Zt(c), (ve & 6) === 0 && (yi = wt() + 500, Xr(0));
                  }
                }
                break;
              case 31:
              case 13:
                b = oa(c, 2), b !== null && vt(b, c, 2), vi(), jc(c, 2);
            }
          if (c = Ac(r), c === null && dc(
            e,
            t,
            r,
            Mi,
            n
          ), c === l) break;
          l = c;
        }
        l !== null && r.stopPropagation();
      } else
        dc(
          e,
          t,
          r,
          null,
          n
        );
    }
  }
  function Ac(e) {
    return e = Ol(e), _c(e);
  }
  var Mi = null;
  function _c(e) {
    if (Mi = null, e = Sa(e), e !== null) {
      var t = f(e);
      if (t === null) e = null;
      else {
        var n = t.tag;
        if (n === 13) {
          if (e = p(t), e !== null) return e;
          e = null;
        } else if (n === 31) {
          if (e = h(t), e !== null) return e;
          e = null;
        } else if (n === 3) {
          if (t.stateNode.current.memoizedState.isDehydrated)
            return t.tag === 3 ? t.stateNode.containerInfo : null;
          e = null;
        } else t !== e && (e = null);
      }
    }
    return Mi = e, null;
  }
  function xp(e) {
    switch (e) {
      case "beforetoggle":
      case "cancel":
      case "click":
      case "close":
      case "contextmenu":
      case "copy":
      case "cut":
      case "auxclick":
      case "dblclick":
      case "dragend":
      case "dragstart":
      case "drop":
      case "focusin":
      case "focusout":
      case "input":
      case "invalid":
      case "keydown":
      case "keypress":
      case "keyup":
      case "mousedown":
      case "mouseup":
      case "paste":
      case "pause":
      case "play":
      case "pointercancel":
      case "pointerdown":
      case "pointerup":
      case "ratechange":
      case "reset":
      case "resize":
      case "seeked":
      case "submit":
      case "toggle":
      case "touchcancel":
      case "touchend":
      case "touchstart":
      case "volumechange":
      case "change":
      case "selectionchange":
      case "textInput":
      case "compositionstart":
      case "compositionend":
      case "compositionupdate":
      case "beforeblur":
      case "afterblur":
      case "beforeinput":
      case "blur":
      case "fullscreenchange":
      case "focus":
      case "hashchange":
      case "popstate":
      case "select":
      case "selectstart":
        return 2;
      case "drag":
      case "dragenter":
      case "dragexit":
      case "dragleave":
      case "dragover":
      case "mousemove":
      case "mouseout":
      case "mouseover":
      case "pointermove":
      case "pointerout":
      case "pointerover":
      case "scroll":
      case "touchmove":
      case "wheel":
      case "mouseenter":
      case "mouseleave":
      case "pointerenter":
      case "pointerleave":
        return 8;
      case "message":
        switch (ey()) {
          case Od:
            return 2;
          case zd:
            return 8;
          case Eo:
          case ty:
            return 32;
          case Nd:
            return 268435456;
          default:
            return 32;
        }
      default:
        return 32;
    }
  }
  var Oc = !1, Yn = null, $n = null, Gn = null, eo = /* @__PURE__ */ new Map(), to = /* @__PURE__ */ new Map(), qn = [], bv = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(
    " "
  );
  function wp(e, t) {
    switch (e) {
      case "focusin":
      case "focusout":
        Yn = null;
        break;
      case "dragenter":
      case "dragleave":
        $n = null;
        break;
      case "mouseover":
      case "mouseout":
        Gn = null;
        break;
      case "pointerover":
      case "pointerout":
        eo.delete(t.pointerId);
        break;
      case "gotpointercapture":
      case "lostpointercapture":
        to.delete(t.pointerId);
    }
  }
  function no(e, t, n, r, l, c) {
    return e === null || e.nativeEvent !== c ? (e = {
      blockedOn: t,
      domEventName: n,
      eventSystemFlags: r,
      nativeEvent: c,
      targetContainers: [l]
    }, t !== null && (t = ja(t), t !== null && gp(t)), e) : (e.eventSystemFlags |= r, t = e.targetContainers, l !== null && t.indexOf(l) === -1 && t.push(l), e);
  }
  function hv(e, t, n, r, l) {
    switch (t) {
      case "focusin":
        return Yn = no(
          Yn,
          e,
          t,
          n,
          r,
          l
        ), !0;
      case "dragenter":
        return $n = no(
          $n,
          e,
          t,
          n,
          r,
          l
        ), !0;
      case "mouseover":
        return Gn = no(
          Gn,
          e,
          t,
          n,
          r,
          l
        ), !0;
      case "pointerover":
        var c = l.pointerId;
        return eo.set(
          c,
          no(
            eo.get(c) || null,
            e,
            t,
            n,
            r,
            l
          )
        ), !0;
      case "gotpointercapture":
        return c = l.pointerId, to.set(
          c,
          no(
            to.get(c) || null,
            e,
            t,
            n,
            r,
            l
          )
        ), !0;
    }
    return !1;
  }
  function Sp(e) {
    var t = Sa(e.target);
    if (t !== null) {
      var n = f(t);
      if (n !== null) {
        if (t = n.tag, t === 13) {
          if (t = p(n), t !== null) {
            e.blockedOn = t, Md(e.priority, function() {
              vp(n);
            });
            return;
          }
        } else if (t === 31) {
          if (t = h(n), t !== null) {
            e.blockedOn = t, Md(e.priority, function() {
              vp(n);
            });
            return;
          }
        } else if (t === 3 && n.stateNode.current.memoizedState.isDehydrated) {
          e.blockedOn = n.tag === 3 ? n.stateNode.containerInfo : null;
          return;
        }
      }
    }
    e.blockedOn = null;
  }
  function Di(e) {
    if (e.blockedOn !== null) return !1;
    for (var t = e.targetContainers; 0 < t.length; ) {
      var n = Ac(e.nativeEvent);
      if (n === null) {
        n = e.nativeEvent;
        var r = new n.constructor(
          n.type,
          n
        );
        _l = r, n.target.dispatchEvent(r), _l = null;
      } else
        return t = ja(n), t !== null && gp(t), e.blockedOn = n, !1;
      t.shift();
    }
    return !0;
  }
  function jp(e, t, n) {
    Di(e) && n.delete(t);
  }
  function yv() {
    Oc = !1, Yn !== null && Di(Yn) && (Yn = null), $n !== null && Di($n) && ($n = null), Gn !== null && Di(Gn) && (Gn = null), eo.forEach(jp), to.forEach(jp);
  }
  function Ui(e, t) {
    e.blockedOn === t && (e.blockedOn = null, Oc || (Oc = !0, a.unstable_scheduleCallback(
      a.unstable_NormalPriority,
      yv
    )));
  }
  var Li = null;
  function Ep(e) {
    Li !== e && (Li = e, a.unstable_scheduleCallback(
      a.unstable_NormalPriority,
      function() {
        Li === e && (Li = null);
        for (var t = 0; t < e.length; t += 3) {
          var n = e[t], r = e[t + 1], l = e[t + 2];
          if (typeof r != "function") {
            if (_c(r || n) === null)
              continue;
            break;
          }
          var c = ja(n);
          c !== null && (e.splice(t, 3), t -= 3, As(
            c,
            {
              pending: !0,
              data: l,
              method: n.method,
              action: r
            },
            r,
            l
          ));
        }
      }
    ));
  }
  function rr(e) {
    function t(v) {
      return Ui(v, e);
    }
    Yn !== null && Ui(Yn, e), $n !== null && Ui($n, e), Gn !== null && Ui(Gn, e), eo.forEach(t), to.forEach(t);
    for (var n = 0; n < qn.length; n++) {
      var r = qn[n];
      r.blockedOn === e && (r.blockedOn = null);
    }
    for (; 0 < qn.length && (n = qn[0], n.blockedOn === null); )
      Sp(n), n.blockedOn === null && qn.shift();
    if (n = (e.ownerDocument || e).$$reactFormReplay, n != null)
      for (r = 0; r < n.length; r += 3) {
        var l = n[r], c = n[r + 1], m = l[ft] || null;
        if (typeof c == "function")
          m || Ep(n);
        else if (m) {
          var b = null;
          if (c && c.hasAttribute("formAction")) {
            if (l = c, m = c[ft] || null)
              b = m.formAction;
            else if (_c(l) !== null) continue;
          } else b = m.action;
          typeof b == "function" ? n[r + 1] = b : (n.splice(r, 3), r -= 3), Ep(n);
        }
      }
  }
  function Ap() {
    function e(c) {
      c.canIntercept && c.info === "react-transition" && c.intercept({
        handler: function() {
          return new Promise(function(m) {
            return l = m;
          });
        },
        focusReset: "manual",
        scroll: "manual"
      });
    }
    function t() {
      l !== null && (l(), l = null), r || setTimeout(n, 20);
    }
    function n() {
      if (!r && !navigation.transition) {
        var c = navigation.currentEntry;
        c && c.url != null && navigation.navigate(c.url, {
          state: c.getState(),
          info: "react-transition",
          history: "replace"
        });
      }
    }
    if (typeof navigation == "object") {
      var r = !1, l = null;
      return navigation.addEventListener("navigate", e), navigation.addEventListener("navigatesuccess", t), navigation.addEventListener("navigateerror", t), setTimeout(n, 100), function() {
        r = !0, navigation.removeEventListener("navigate", e), navigation.removeEventListener("navigatesuccess", t), navigation.removeEventListener("navigateerror", t), l !== null && (l(), l = null);
      };
    }
  }
  function zc(e) {
    this._internalRoot = e;
  }
  Hi.prototype.render = zc.prototype.render = function(e) {
    var t = this._internalRoot;
    if (t === null) throw Error(s(409));
    var n = t.current, r = Tt();
    hp(n, r, e, t, null, null);
  }, Hi.prototype.unmount = zc.prototype.unmount = function() {
    var e = this._internalRoot;
    if (e !== null) {
      this._internalRoot = null;
      var t = e.containerInfo;
      hp(e.current, 2, null, e, null, null), vi(), t[wa] = null;
    }
  };
  function Hi(e) {
    this._internalRoot = e;
  }
  Hi.prototype.unstable_scheduleHydration = function(e) {
    if (e) {
      var t = Id();
      e = { blockedOn: null, target: e, priority: t };
      for (var n = 0; n < qn.length && t !== 0 && t < qn[n].priority; n++) ;
      qn.splice(n, 0, e), n === 0 && Sp(e);
    }
  };
  var _p = o.version;
  if (_p !== "19.2.7")
    throw Error(
      s(
        527,
        _p,
        "19.2.7"
      )
    );
  B.findDOMNode = function(e) {
    var t = e._reactInternals;
    if (t === void 0)
      throw typeof e.render == "function" ? Error(s(188)) : (e = Object.keys(e).join(","), Error(s(268, e)));
    return e = g(t), e = e !== null ? E(e) : null, e = e === null ? null : e.stateNode, e;
  };
  var gv = {
    bundleType: 0,
    version: "19.2.7",
    rendererPackageName: "react-dom",
    currentDispatcherRef: C,
    reconcilerVersion: "19.2.7"
  };
  if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
    var Bi = __REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (!Bi.isDisabled && Bi.supportsFiber)
      try {
        ur = Bi.inject(
          gv
        ), St = Bi;
      } catch {
      }
  }
  return oo.createRoot = function(e, t) {
    if (!u(e)) throw Error(s(299));
    var n = !1, r = "", l = km, c = Cm, m = Im;
    return t != null && (t.unstable_strictMode === !0 && (n = !0), t.identifierPrefix !== void 0 && (r = t.identifierPrefix), t.onUncaughtError !== void 0 && (l = t.onUncaughtError), t.onCaughtError !== void 0 && (c = t.onCaughtError), t.onRecoverableError !== void 0 && (m = t.onRecoverableError)), t = pp(
      e,
      1,
      !1,
      null,
      null,
      n,
      r,
      null,
      l,
      c,
      m,
      Ap
    ), e[wa] = t.current, cc(e), new zc(t);
  }, oo.hydrateRoot = function(e, t, n) {
    if (!u(e)) throw Error(s(299));
    var r = !1, l = "", c = km, m = Cm, b = Im, v = null;
    return n != null && (n.unstable_strictMode === !0 && (r = !0), n.identifierPrefix !== void 0 && (l = n.identifierPrefix), n.onUncaughtError !== void 0 && (c = n.onUncaughtError), n.onCaughtError !== void 0 && (m = n.onCaughtError), n.onRecoverableError !== void 0 && (b = n.onRecoverableError), n.formState !== void 0 && (v = n.formState)), t = pp(
      e,
      1,
      !0,
      t,
      n ?? null,
      r,
      l,
      v,
      c,
      m,
      b,
      Ap
    ), t.context = bp(null), n = t.current, r = Tt(), r = gl(r), l = Nn(r), l.callback = null, Tn(n, l, r), n = r, t.current.lanes = n, fr(t, n), Zt(t), e[wa] = t.current, cc(e), new Hi(t);
  }, oo.version = "19.2.7", oo;
}
var Yp;
function bx() {
  if (Yp) return Ic.exports;
  Yp = 1;
  function a() {
    if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"))
      try {
        __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(a);
      } catch (o) {
        console.error(o);
      }
  }
  return a(), Ic.exports = px(), Ic.exports;
}
var Ub = bx();
const hx = {
  /**
   * FAQ + AI Chat section visibility (approved Client Studio baseline).
   */
  showAiAdvisor: !0
}, Kc = "kontakt@astav.cz", yx = {
  priority: "Priorita"
}, Ne = {
  hero: "hero",
  walkthrough: "walkthrough",
  floorPlan: "floor-plan",
  priority: "priority-experience",
  aiAdvisor: "ai-advisor",
  audit: "audit-lead-capture"
}, gx = [
  { id: Ne.hero, label: "Úvod", short: "Ú" },
  { id: Ne.walkthrough, label: "Prohlídka", short: "D" },
  { id: Ne.priority, label: "Priority", short: "P" },
  { id: Ne.aiAdvisor, label: "AI poradce", short: "A" },
  { id: Ne.audit, label: "Kontakt", short: "K" }
];
function lr(a) {
  switch (a) {
    case "strong-fit":
      return "Silná shoda";
    case "conditional-fit":
      return "Podmíněná shoda";
    case "weak-fit":
      return "Slabá shoda";
    case "in-progress":
      return "Probíhá";
    default:
      return a.replace(/-/g, " ");
  }
}
const Kn = {
  /** Package version — injected at build time when available. */
  version: "0.1.0",
  /** Product label for support / diagnostics (not Runtime semantics). */
  product: "Client Studio",
  generation: "1"
};
class vx extends U.Component {
  constructor() {
    super(...arguments);
    q(this, "state", { error: null });
  }
  static getDerivedStateFromError(i) {
    return { error: i };
  }
  componentDidCatch(i, s) {
    console.error("[ClientStudio] Uncaught render error", {
      version: Kn.version,
      product: Kn.product,
      message: i.message,
      componentStack: s.componentStack
    });
  }
  render() {
    return this.state.error !== null ? /* @__PURE__ */ d.jsxs(
      "div",
      {
        role: "alert",
        className: "flex min-h-screen flex-col items-center justify-center gap-4 bg-embed-background-primary px-section text-embed-foreground-primary",
        children: [
          /* @__PURE__ */ d.jsx("h1", { className: "text-lg font-medium", children: "Client Studio se nepodařilo načíst" }),
          /* @__PURE__ */ d.jsx("p", { className: "max-w-md text-center text-sm text-embed-foreground-primary/70", children: "Obnovte stránku. Pokud problém přetrvá, kontaktujte podporu." }),
          /* @__PURE__ */ d.jsx(
            "button",
            {
              type: "button",
              className: "rounded-sm bg-embed-brand-navy px-4 py-2 text-sm text-embed-background-primary",
              onClick: () => {
                this.setState({ error: null }), window.location.reload();
              },
              children: "Obnovit stránku"
            }
          ),
          /* @__PURE__ */ d.jsxs("p", { className: "text-xs text-embed-foreground-primary/40", children: [
            Kn.product,
            " v",
            Kn.version
          ] })
        ]
      }
    ) : this.props.children;
  }
}
function xx({ studioTitle: a }) {
  return /* @__PURE__ */ d.jsxs("header", { className: "flex h-14 shrink-0 items-center justify-between border-b border-embed-border-default px-6", children: [
    /* @__PURE__ */ d.jsxs("div", { className: "flex items-center gap-6", children: [
      /* @__PURE__ */ d.jsx("span", { className: "text-sm font-medium tracking-brand text-embed-foreground-primary", children: "EMBED" }),
      /* @__PURE__ */ d.jsx("span", { className: "text-sm text-embed-foreground-primary/70", children: a })
    ] }),
    /* @__PURE__ */ d.jsx("div", { "aria-hidden": "true" })
  ] });
}
const wx = [
  "Dashboard",
  "Projects",
  "Properties",
  "Clients",
  "Settings"
];
function Sx({ items: a = wx }) {
  return /* @__PURE__ */ d.jsx("aside", { className: "flex w-56 shrink-0 flex-col border-r border-embed-border-default bg-embed-background-secondary", children: /* @__PURE__ */ d.jsx("nav", { className: "flex flex-col gap-1 p-4", children: a.map((o) => /* @__PURE__ */ d.jsx(
    "span",
    {
      className: "rounded-md px-3 py-2 text-sm text-embed-foreground-primary/70",
      children: o
    },
    o
  )) }) });
}
function jx({ status: a = "READY" }) {
  return /* @__PURE__ */ d.jsx("footer", { className: "flex h-8 shrink-0 items-center border-t border-embed-border-default bg-embed-background-secondary px-6", children: /* @__PURE__ */ d.jsxs("span", { className: "flex items-center gap-1.5 text-xs uppercase tracking-wide text-embed-foreground-primary/45", children: [
    /* @__PURE__ */ d.jsx("span", { className: "text-embed-status-ready", children: "●" }),
    a
  ] }) });
}
function Ex({ children: a }) {
  return /* @__PURE__ */ d.jsx("main", { className: "flex flex-1 justify-center bg-embed-background-secondary", children: a ?? /* @__PURE__ */ d.jsx("div", { className: "flex flex-1 items-center justify-center", children: /* @__PURE__ */ d.jsx("p", { className: "text-sm text-embed-foreground-primary/45", children: "Workspace" }) }) });
}
function Lb({
  studioTitle: a = "Studio",
  sidebarItems: o,
  status: i,
  header: s,
  sidebar: u,
  showStatusBar: f = !0,
  children: p
}) {
  return /* @__PURE__ */ d.jsxs("div", { className: "flex min-h-screen", children: [
    /* @__PURE__ */ d.jsx("div", { className: "sticky top-0 h-screen shrink-0 self-start overflow-y-auto", children: u ?? /* @__PURE__ */ d.jsx(Sx, { items: o }) }),
    /* @__PURE__ */ d.jsxs("div", { className: "flex min-w-0 flex-1 flex-col", children: [
      s ?? /* @__PURE__ */ d.jsx(xx, { studioTitle: a }),
      /* @__PURE__ */ d.jsx(Ex, { children: p }),
      f ? /* @__PURE__ */ d.jsx(jx, { status: i }) : null
    ] })
  ] });
}
const Fn = {
  navy: "#001930",
  warmWhite: "#F7F6F4",
  /** Interactive secondary surfaces (FAQ rows, segment track, idle segments). */
  warmGray: "#E8E5E0",
  lightGray: "#E3E3E3",
  /** Muted bronze accent — single Audit / action gold (CTA, workflow, panels). */
  goldIntense: "#B8922D",
  pureWhite: "#FFFFFF"
}, Ie = {
  border: {
    default: Fn.lightGray
  },
  brand: {
    navy: Fn.navy
  },
  /** Interactive action surfaces — consumed by @embed-engine/ui */
  action: {
    onPrimary: Fn.pureWhite,
    onSecondary: Fn.navy,
    accent: Fn.goldIntense,
    onAccent: Fn.navy
  },
  surface: {
    card: Fn.warmWhite,
    /** Shared interactive fill — FAQ items, SegmentedControl track/idle */
    interactive: Fn.warmGray
  }
}, $p = 43, Ax = 14;
function _x() {
  return /* @__PURE__ */ d.jsxs(
    "div",
    {
      className: "flex items-center",
      style: { gap: Ax },
      "aria-label": "ASTAV",
      children: [
        /* @__PURE__ */ d.jsxs(
          "svg",
          {
            viewBox: "0 0 32 32",
            width: $p,
            height: $p,
            "aria-hidden": "true",
            className: "shrink-0",
            children: [
              /* @__PURE__ */ d.jsx(
                "rect",
                {
                  x: "1",
                  y: "1",
                  width: "30",
                  height: "30",
                  rx: "6",
                  fill: Ie.brand.navy
                }
              ),
              /* @__PURE__ */ d.jsx(
                "path",
                {
                  d: "M16 7.5 24 24h-3.4l-1.5-3.4h-5.2L12.4 24H9L16 7.5zm0 6.2-1.9 4.3h3.8L16 13.7z",
                  fill: Ie.action.accent
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ d.jsx(
          "span",
          {
            className: "text-[22px] font-bold leading-none tracking-[0.18em]",
            style: { color: Ie.brand.navy },
            children: "ASTAV"
          }
        )
      ]
    }
  );
}
function Ox(a) {
  const o = (a == null ? void 0 : a.trim()) ?? "";
  if (o.length === 0)
    return "Client Studio";
  const s = o.replace(/^house-/i, "").split(/[-_]+/).filter(Boolean);
  return s.length === 0 ? "Client Studio" : `Client Studio / ${s.map((f) => /^\d+$/.test(f) ? f : f.charAt(0).toUpperCase() + f.slice(1).toLowerCase()).join(" ")}`;
}
function Zc(a) {
  const o = document.getElementById(a);
  if (o === null)
    return;
  const i = document.querySelector("[data-experience-header]"), s = i ? Math.ceil(i.getBoundingClientRect().height) : 0, u = document.querySelector(
    "[data-embed-overlay-mount]"
  );
  if (u) {
    const f = u.getBoundingClientRect(), p = o.getBoundingClientRect(), h = u.scrollTop + (p.top - f.top) - s;
    u.scrollTo({
      top: Math.max(0, h),
      left: 0,
      behavior: "smooth"
    });
  } else {
    const f = window.scrollY + o.getBoundingClientRect().top - s;
    window.scrollTo({ top: Math.max(0, f), left: 0, behavior: "smooth" });
  }
  typeof o.focus == "function" && o.focus({ preventScroll: !0 });
}
function zx() {
  const [a, o] = U.useState("Client Studio"), [i, s] = U.useState(
    () => typeof document < "u" && document.querySelector("[data-embed-overlay]") !== null
  );
  return U.useEffect(() => {
    const u = document.querySelector("[data-client-studio-root]");
    o(Ox(u == null ? void 0 : u.dataset.objectId)), s(document.querySelector("[data-embed-overlay]") !== null);
  }, []), /* @__PURE__ */ d.jsxs(
    "header",
    {
      "data-experience-header": "",
      className: "relative sticky top-0 z-50 h-header shrink-0 border-b border-embed-border-default bg-embed-background-primary",
      children: [
        /* @__PURE__ */ d.jsxs(
          "div",
          {
            className: [
              "mx-auto grid h-full w-canvas min-w-0 max-w-canvas grid-cols-[1fr_auto_1fr] items-center px-section mobile:w-full mobile:max-w-none mobile:min-w-0",
              // Clear absolute Close when the canvas spans near the header edge.
              i ? "max-[1499px]:pr-16" : ""
            ].join(" "),
            children: [
              /* @__PURE__ */ d.jsx("div", { className: "justify-self-start", children: /* @__PURE__ */ d.jsx(_x, {}) }),
              /* @__PURE__ */ d.jsx("p", { className: "max-w-[20rem] truncate text-center text-base text-embed-foreground-primary/70", children: a }),
              /* @__PURE__ */ d.jsxs("div", { className: "flex items-center justify-end gap-section justify-self-end", children: [
                /* @__PURE__ */ d.jsx(
                  "button",
                  {
                    type: "button",
                    className: "text-sm text-embed-foreground-primary underline decoration-embed-border-strong underline-offset-4",
                    onClick: () => {
                      Zc(Ne.audit);
                    },
                    children: "Zavolat"
                  }
                ),
                /* @__PURE__ */ d.jsx(
                  "button",
                  {
                    type: "button",
                    className: "text-sm text-embed-foreground-primary underline decoration-embed-border-strong underline-offset-4",
                    onClick: () => {
                      Zc(Ne.priority);
                    },
                    children: "Uložit"
                  }
                )
              ] })
            ]
          }
        ),
        i ? /* @__PURE__ */ d.jsx(
          "button",
          {
            type: "button",
            "data-embed-close": "",
            "aria-label": "Zavřít Client Studio",
            className: "absolute right-section top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-transparent p-0 transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-embed-action-primary",
            children: /* @__PURE__ */ d.jsx(
              "span",
              {
                "aria-hidden": "true",
                className: "grid h-8 w-8 place-items-center overflow-hidden rounded-full bg-embed-action-primary text-embed-action-onPrimary shadow-embed-soft",
                children: /* @__PURE__ */ d.jsx("span", { className: "flex h-[1em] w-[1em] items-center justify-center text-[2rem] font-bold leading-none text-embed-action-onPrimary [translate:1px_-1px]", children: "×" })
              }
            )
          }
        ) : null
      ]
    }
  );
}
function Nx() {
  const a = [];
  return {
    name: "memory",
    events: a,
    exportEvent(o) {
      a.push(o);
    },
    clear() {
      a.length = 0;
    },
    flush() {
    }
  };
}
function Tx(a = "[decision-analytics]") {
  return {
    name: "console",
    exportEvent(o) {
      try {
        console.info(a, o.type, o);
      } catch {
      }
    }
  };
}
function Rx(a) {
  return {
    name: "composite",
    exportEvent(o) {
      for (const i of a)
        try {
          i.exportEvent(o);
        } catch {
        }
    },
    flush() {
      var o;
      for (const i of a)
        try {
          (o = i.flush) == null || o.call(i);
        } catch {
        }
    }
  };
}
function kx(a, o) {
  let i = null, s = null, u = "";
  const f = {}, p = {}, h = {};
  let y = 0, g = 0, E = 0, O = 0, z = 0, D = 0, R = !1, S = !1;
  for (const H of o)
    if (H.sessionId === a)
      switch (u = H.decisionSessionId, s = H.at, H.type) {
        case "journey.started":
          i = H.at;
          break;
        case "journey.completed":
          R = !0;
          break;
        case "journey.abandoned":
          S = !0;
          break;
        case "surface.entered":
          f[H.surfaceId] = (f[H.surfaceId] ?? 0) + 1;
          break;
        case "surface.exited":
          p[H.surfaceId] = (p[H.surfaceId] ?? 0) + H.dwellMs;
          break;
        case "runtime.signal":
          h[H.runtimeEventType] = (h[H.runtimeEventType] ?? 0) + 1;
          break;
        case "terminal.viewed":
          y += 1;
          break;
        case "story.viewed":
          g += 1;
          break;
        case "ai.session.opened":
          E += 1;
          break;
        case "ai.interaction":
          O += 1;
          break;
        case "conversion.started":
          z += 1;
          break;
        case "conversion.completed":
          D += 1;
          break;
      }
  return Object.freeze({
    sessionId: a,
    decisionSessionId: u,
    startedAt: i,
    endedAt: s,
    durationMs: i !== null && s !== null ? Math.max(0, s - i) : null,
    surfaceEnterCounts: Object.freeze({ ...f }),
    surfaceDwellMs: Object.freeze({ ...p }),
    runtimeSignalCounts: Object.freeze({ ...h }),
    terminalViewCount: y,
    storyViewCount: g,
    aiSessionOpenCount: E,
    aiInteractionCount: O,
    conversionStartedCount: z,
    conversionCompletedCount: D,
    journeyCompleted: R,
    journeyAbandoned: S,
    eventCount: o.filter((H) => H.sessionId === a).length
  });
}
function Cx(a) {
  const { sessionId: o, adapter: i } = a, s = a.now ?? (() => Date.now()), u = [], f = /* @__PURE__ */ new Map();
  let p = a.decisionSessionId ?? "decision-session:pending", h = null, y = null, g = !1, E = !1, O = !1, z = !1;
  const D = (S) => Object.freeze({
    sessionId: o,
    decisionSessionId: p,
    at: S,
    surfaceId: y,
    runtimeContextRef: h
  }), R = (S) => {
    u.push(S);
    try {
      i.exportEvent(S);
    } catch {
    }
  };
  return {
    sessionId: o,
    getDecisionSessionId: () => p,
    getEvents: () => u.slice(),
    getMetrics: () => kx(o, u),
    bindDecisionSession(S) {
      p = S.decisionSessionId, S.runtimeContextRef !== void 0 && (h = S.runtimeContextRef);
    },
    setActiveSurface(S) {
      y = S;
    },
    startJourney(S = s()) {
      g || (g = !0, R({ ...D(S), type: "journey.started" }));
    },
    resumeJourney(S = s()) {
      !g || E || R({ ...D(S), type: "journey.resumed" });
    },
    completeJourney(S = s()) {
      E = !0, R({ ...D(S), type: "journey.completed" });
    },
    abandonJourney(S = s()) {
      !g || E || R({ ...D(S), type: "journey.abandoned" });
    },
    enterSurface(S, H = s()) {
      f.has(S) || (f.set(S, H), y = S, R({ ...D(H), type: "surface.entered", surfaceId: S }));
    },
    exitSurface(S, H = s()) {
      const W = f.get(S);
      W !== void 0 && (f.delete(S), y === S && (y = null), R({
        ...D(H),
        type: "surface.exited",
        surfaceId: S,
        dwellMs: Math.max(0, H - W)
      }));
    },
    observeDispatch(S, H = s()) {
      if (!S.ok)
        return;
      const W = S.experience.context.decision, pe = S.experience.context.object.id;
      p = `${pe}:${S.session.createdAt}`, h = Object.freeze({
        terminalId: W.terminal.id,
        storyId: W.story.id,
        activeRoomId: S.experience.context.activeRoom.id,
        objectId: pe
      });
      const $ = {
        ...Ix(S.event),
        floor: S.experience.context.navigation.currentFloor ?? (S.experience.context.activeRoom.room !== null ? String(S.experience.context.activeRoom.room.floor) : null)
      };
      R({
        ...D(H),
        type: "runtime.signal",
        runtimeEventType: S.event.type,
        payload: Object.freeze($)
      }), O || (O = !0, R({
        ...D(H),
        type: "terminal.viewed",
        surfaceId: "decision-terminal",
        terminalId: W.terminal.id,
        recommendationKey: W.terminal.outcome.recommendation
      })), z || (z = !0, R({
        ...D(H),
        type: "story.viewed",
        surfaceId: "decision-terminal",
        storyId: W.story.id
      }));
    },
    terminalViewed(S) {
      R({
        ...D(S.at ?? s()),
        type: "terminal.viewed",
        surfaceId: "decision-terminal",
        terminalId: S.terminalId,
        recommendationKey: S.recommendationKey
      });
    },
    storyViewed(S, H = s()) {
      R({
        ...D(H),
        type: "story.viewed",
        surfaceId: "decision-terminal",
        storyId: S
      });
    },
    aiSessionOpened(S, H = s()) {
      R({
        ...D(H),
        type: "ai.session.opened",
        surfaceId: "ai-advisor",
        aiContextId: S
      });
    },
    aiInteraction(S) {
      R({
        ...D(S.at ?? s()),
        type: "ai.interaction",
        surfaceId: "ai-advisor",
        questionCategory: S.questionCategory,
        responseGenerated: S.responseGenerated,
        clarificationRequested: S.clarificationRequested,
        conversationLength: S.conversationLength
      });
    },
    aiSessionEnded(S, H = s()) {
      R({
        ...D(H),
        type: "ai.session.ended",
        surfaceId: "ai-advisor",
        conversationLength: S
      });
    },
    conversionStarted(S, H = s()) {
      R({
        ...D(H),
        type: "conversion.started",
        surfaceId: "audit-lead-capture",
        ctaId: S
      });
    },
    conversionFormOpened(S, H = s()) {
      R({
        ...D(H),
        type: "conversion.form.opened",
        surfaceId: "audit-lead-capture",
        ctaId: S
      });
    },
    conversionConsentAccepted(S, H = s()) {
      R({
        ...D(H),
        type: "conversion.consent.accepted",
        surfaceId: "audit-lead-capture",
        ctaId: S
      });
    },
    conversionCompleted(S, H = s()) {
      R({
        ...D(H),
        type: "conversion.completed",
        surfaceId: "audit-lead-capture",
        ctaId: S
      }), E = !0, R({ ...D(H), type: "journey.completed" });
    },
    conversionCancelled(S, H = s()) {
      R({
        ...D(H),
        type: "conversion.cancelled",
        surfaceId: "audit-lead-capture",
        ctaId: S
      });
    },
    flush() {
      var S;
      (S = i.flush) == null || S.call(i);
    }
  };
}
function Ix(a) {
  switch (a.type) {
    case "RoomSelected":
      return { roomId: a.roomId };
    case "PriorityChanged":
      return {
        priorityCount: a.priorityIds.length,
        priorityIds: a.priorityIds.join(",")
      };
    case "VariantSelected":
      return { variantId: a.variantId };
    case "ScenarioActivated":
      return { scenarioId: a.scenarioId };
    case "QuestionAnswered":
      return {
        questionId: a.questionId,
        answerId: a.answerId
      };
    default:
      return {};
  }
}
function Gp(a) {
  const o = a.trim().toLowerCase();
  return o.length === 0 ? "empty" : /proč|why|důvod/.test(o) ? "why-recommendation" : /priorit|ovlivn|driver|vliv/.test(o) ? "drivers" : /pokoj|room|místnost|fokus/.test(o) ? "room-focus" : /story|příběh|shrň|summ/.test(o) ? "story-summary" : /další|next|krok/.test(o) ? "next-step" : "general";
}
const dd = U.createContext(null);
function Mx() {
  const a = Nx(), i = typeof window < "u" && !1 ? Rx([a, Tx()]) : a;
  return Cx({
    sessionId: `analytics-${Date.now().toString(36)}`,
    adapter: i
  });
}
function Dx({
  children: a,
  collector: o
}) {
  const i = U.useRef(o ?? null);
  i.current === null && (i.current = Mx());
  const s = i.current;
  U.useEffect(() => {
    s.startJourney();
    const f = () => {
      document.visibilityState === "hidden" ? s.abandonJourney() : s.resumeJourney();
    }, p = () => {
      s.abandonJourney(), s.flush();
    };
    return document.addEventListener("visibilitychange", f), window.addEventListener("pagehide", p), () => {
      document.removeEventListener("visibilitychange", f), window.removeEventListener("pagehide", p), s.flush();
    };
  }, [s]);
  const u = U.useMemo(() => s, [s]);
  return /* @__PURE__ */ d.jsx(dd.Provider, { value: u, children: a });
}
function Ux() {
  const a = U.useContext(dd);
  if (a === null)
    throw new Error(
      "useDecisionAnalytics must be used within DecisionAnalyticsProvider"
    );
  return a;
}
function ol() {
  return U.useContext(dd);
}
const qp = [
  Ne.hero,
  Ne.walkthrough,
  Ne.priority,
  Ne.aiAdvisor,
  Ne.audit
];
function Lx() {
  const a = Ux();
  return U.useEffect(() => {
    if (typeof IntersectionObserver > "u")
      return;
    const o = /* @__PURE__ */ new Set(), i = new IntersectionObserver(
      (s) => {
        for (const u of s) {
          const f = u.target.id;
          qp.includes(f) && (u.isIntersecting ? o.has(f) || (o.add(f), a.enterSurface(f), f === Ne.priority && a.enterSurface("decision-terminal")) : o.has(f) && (o.delete(f), f === Ne.priority && a.exitSurface("decision-terminal"), a.exitSurface(f)));
        }
      },
      { threshold: 0.35 }
    );
    for (const s of qp) {
      const u = document.getElementById(s);
      u !== null && i.observe(u);
    }
    return () => {
      i.disconnect();
      for (const s of [...o])
        a.exitSurface(s);
    };
  }, [a]), null;
}
function Xe(a, o, i) {
  return i === void 0 ? { code: a, message: o } : { code: a, message: o, path: i };
}
function Vp(a) {
  const o = [];
  let i = "", s = !1;
  for (let u = 0; u < a.length; u += 1) {
    const f = a[u];
    if (s) {
      f === '"' ? a[u + 1] === '"' ? (i += '"', u += 1) : s = !1 : i += f;
      continue;
    }
    if (f === '"') {
      s = !0;
      continue;
    }
    if (f === ",") {
      o.push(i.trim()), i = "";
      continue;
    }
    i += f;
  }
  return o.push(i.trim()), o;
}
function il(a) {
  const i = a.replace(/^\uFEFF/, "").replace(/\r\n/g, `
`).replace(/\r/g, `
`).split(`
`).map((f) => f.trim()).filter((f) => f.length > 0);
  if (i.length === 0)
    return { headers: [], rows: [] };
  const s = Vp(i[0]).map((f) => f.trim()), u = [];
  for (let f = 1; f < i.length; f += 1) {
    const p = Vp(i[f]), h = {};
    for (let y = 0; y < s.length; y += 1)
      h[s[y]] = (p[y] ?? "").trim();
    u.push(h);
  }
  return { headers: s, rows: u };
}
function ud(a, o, i) {
  for (const s of o)
    if (!a.headers.includes(s))
      return `Missing required CSV header "${s}" in ${i}`;
}
function Hb(a, o, i) {
  if (!/^-?\d+$/.test(a))
    return `Invalid integer for "${o}" in ${i}: ${a}`;
  const s = Number(a);
  return Number.isSafeInteger(s) ? s : `Integer out of range for "${o}" in ${i}: ${a}`;
}
function Hx(a, o, i) {
  const s = a.replace(",", ".");
  if (!/^\d+(\.\d+)?$/.test(s))
    return `Invalid number for "${o}" in ${i}: ${a}`;
  const u = Number(s);
  return !Number.isFinite(u) || u < 0 ? `Number out of range for "${o}" in ${i}: ${a}` : u;
}
const Bx = "builder-house-package", Yx = "1.0";
function $x(a, o, i) {
  const s = il(a), u = ud(s, ["order", "room", "file"], o);
  if (u)
    return i.push(Xe("BP_INVALID_CSV", u, o)), [];
  const f = /* @__PURE__ */ new Set(), p = [];
  for (let h = 0; h < s.rows.length; h += 1) {
    const y = s.rows[h], g = y.order ?? "", E = y.room ?? "", O = y.file ?? "", z = `${o}:row ${h + 2}`;
    if (!g || !E || !O) {
      i.push(Xe("BP_MISSING_FIELD", "Missing order, room, or file.", z));
      continue;
    }
    const D = Hb(g, "order", z);
    if (typeof D == "string") {
      i.push(Xe("BP_INVALID_TYPE", D, z));
      continue;
    }
    if (f.has(D)) {
      i.push(Xe("BP_DUPLICATE_ORDER", `Duplicate gallery order ${D}.`, z));
      continue;
    }
    f.add(D), p.push({ order: D, room: E, file: O });
  }
  return p.sort((h, y) => h.order - y.order), p;
}
function Gx(a, o, i) {
  const s = il(a), u = ud(
    s,
    ["floor", "room", "name", "area"],
    o
  );
  if (u)
    return i.push(Xe("BP_INVALID_CSV", u, o)), [];
  const f = /* @__PURE__ */ new Set(), p = [];
  for (let h = 0; h < s.rows.length; h += 1) {
    const y = s.rows[h], g = y.floor ?? "", E = y.room ?? "", O = y.name ?? "", z = y.area ?? "", D = `${o}:row ${h + 2}`;
    if (!g || !E || !O || !z) {
      i.push(
        Xe("BP_MISSING_FIELD", "Missing floor, room, name, or area.", D)
      );
      continue;
    }
    const R = Hx(z, "area", D);
    if (typeof R == "string") {
      i.push(Xe("BP_INVALID_TYPE", R, D));
      continue;
    }
    if (f.has(E)) {
      i.push(Xe("BP_DUPLICATE_ROOM", `Duplicate room id "${E}".`, D));
      continue;
    }
    f.add(E), p.push({ floor: g, room: E, name: O, area: R });
  }
  return p;
}
function qx(a, o, i) {
  const s = il(a), u = ud(s, ["order", "room", "provider"], o);
  if (u)
    return i.push(Xe("BP_INVALID_CSV", u, o)), [];
  if (!(s.headers.includes("mediaId") || s.headers.includes("media-id")))
    return i.push(
      Xe(
        "BP_INVALID_CSV",
        `Missing required CSV header "mediaId" in ${o}`,
        o
      )
    ), [];
  const p = /* @__PURE__ */ new Set(), h = [];
  for (let y = 0; y < s.rows.length; y += 1) {
    const g = s.rows[y], E = g.order ?? "", O = g.room ?? "", z = g.provider ?? "", D = (g.mediaId ?? g["media-id"] ?? "").trim(), R = `${o}:row ${y + 2}`;
    if (!E || !O || !z || !D) {
      i.push(
        Xe("BP_MISSING_FIELD", "Missing order, room, provider, or mediaId.", R)
      );
      continue;
    }
    const S = Hb(E, "order", R);
    if (typeof S == "string") {
      i.push(Xe("BP_INVALID_TYPE", S, R));
      continue;
    }
    if (p.has(S)) {
      i.push(Xe("BP_DUPLICATE_ORDER", `Duplicate video order ${S}.`, R));
      continue;
    }
    p.add(S), h.push({ order: S, room: O, provider: z, mediaId: D });
  }
  return h.sort((y, g) => y.order - g.order), h;
}
function Yi(a, o, i) {
  o !== void 0 && (o.has(a) || i.push(
    Xe("BP_ASSET_MISSING", `Referenced asset is missing: ${a}`, a)
  ));
}
function Vx(a) {
  const o = [], i = Gx(a.roomsCsv, "rooms.csv", o), s = $x(a.galleryCsv, "gallery.csv", o), u = qx(a.videosCsv, "videos.csv", o);
  a.heroPath.trim() ? Yi(a.heroPath, a.existingRelativePaths, o) : o.push(
    Xe("BP_MISSING_FILE", "Hero asset path is required (media/hero/…).", "media/hero/")
  );
  const f = {
    floors: a.planPairs.map((S) => ({
      floorId: S.floorId,
      planPng: S.rasterRelativePath,
      planSvg: S.svgRelativePath
    }))
  };
  for (const S of a.planPairs)
    Yi(S.rasterRelativePath, a.existingRelativePaths, o), Yi(S.svgRelativePath, a.existingRelativePaths, o);
  const p = new Set(f.floors.map((S) => S.floorId)), h = new Set(i.map((S) => S.room));
  for (const S of i)
    p.has(S.floor) || o.push(
      Xe(
        "BP_UNKNOWN_FLOOR",
        `Room "${S.room}" references unknown floor "${S.floor}".`,
        "rooms.csv"
      )
    );
  for (const S of s)
    h.has(S.room) || o.push(
      Xe(
        "BP_UNKNOWN_ROOM",
        `Gallery entry references unknown room "${S.room}".`,
        "gallery.csv"
      )
    ), Yi(
      `media/gallery/${S.file}`,
      a.existingRelativePaths,
      o
    );
  for (const S of u)
    h.has(S.room) || o.push(
      Xe(
        "BP_UNKNOWN_ROOM",
        `Video entry references unknown room "${S.room}".`,
        "videos.csv"
      )
    );
  if (f.floors.length === 0 && o.push(
    Xe("BP_PLAN_INCOMPLETE", "No floor plan pairs provided under media/plans/.", "media/plans/")
  ), o.length > 0)
    return { ok: !1, errors: o };
  const y = {
    entries: [
      {
        id: "hero-1",
        file: a.heroPath.split("/").pop() ?? a.heroPath,
        path: a.heroPath,
        ...a.heroTitle !== void 0 ? { title: a.heroTitle } : {}
      }
    ]
  }, g = {
    entries: s.map((S) => ({
      order: S.order,
      roomId: S.room,
      file: S.file,
      path: `media/gallery/${S.file}`
    }))
  }, E = {
    rooms: i.map((S) => ({
      floorId: S.floor,
      roomId: S.room,
      name: S.name,
      area: S.area
    }))
  }, O = {
    entries: f.floors.map((S) => ({
      floorId: S.floorId,
      path: S.planSvg
    }))
  }, z = {
    entries: u.map((S) => ({
      order: S.order,
      roomId: S.room,
      provider: S.provider,
      mediaId: S.mediaId
    }))
  };
  return { ok: !0, result: {
    manifest: {
      packageFormat: Bx,
      schemaVersion: Yx,
      packageRoot: a.packageRoot,
      hero: y,
      gallery: g,
      rooms: E,
      floors: f,
      svg: O,
      videos: z
    },
    hero: y,
    gallery: g,
    rooms: E,
    floors: f,
    svg: O,
    videos: z
  } };
}
function Fx(a, o) {
  switch (a) {
    case "wistia":
      return `https://fast.wistia.net/embed/iframe/${o}`;
    case "youtube":
      return `https://www.youtube.com/embed/${o}`;
    case "vimeo":
      return `https://player.vimeo.com/video/${o}`;
    case "mux":
      return o.startsWith("http") ? o : `https://stream.mux.com/${o}.m3u8`;
    case "local":
      return o.startsWith("/") ? o : `/house-package/media/videos/${o}`;
    default:
      return o;
  }
}
const Xx = "builder-package/projectBuilderImportToHousePackage", Bb = "hero", Qc = "gallery:", Jc = "video:", Px = "floorplan:";
function Lc(a, o) {
  const i = a.replace(/\/+$/, ""), s = o.replace(/^\/+/, "");
  return `${i}/${s}`;
}
function Kx(a) {
  const o = /^p(\d+)$/i.exec(a.trim());
  if (o === null)
    return 0;
  const i = Number.parseInt(o[1], 10);
  return !Number.isFinite(i) || i < 1 ? 0 : i - 1;
}
function Zx(a, o) {
  return `${Qc}${a}:${o}`;
}
function Qx(a, o) {
  return `${Jc}${a}:${o}`;
}
function Jx(a) {
  return `${Px}${a}`;
}
function Wx(a) {
  if (!a.startsWith(Qc))
    return null;
  const o = a.slice(Qc.length), i = o.lastIndexOf(":");
  if (i <= 0)
    return null;
  const s = o.slice(0, i), u = Number.parseInt(o.slice(i + 1), 10);
  return s.length === 0 || !Number.isFinite(u) ? null : { roomId: s, order: u };
}
function e1(a) {
  if (!a.startsWith(Jc))
    return null;
  const o = a.slice(Jc.length), i = o.lastIndexOf(":");
  if (i <= 0)
    return null;
  const s = o.slice(0, i), u = Number.parseInt(o.slice(i + 1), 10);
  return s.length === 0 || !Number.isFinite(u) ? null : { roomId: s, order: u };
}
function t1(a, o) {
  const i = o.packagePublicRoot ?? "/house-package", s = a.rooms.rooms.map(
    (p) => Object.freeze({
      id: p.roomId,
      name: p.name,
      area: p.area,
      floor: Kx(p.floorId)
    })
  ), u = [], f = a.hero.entries[0];
  f !== void 0 && u.push(
    Object.freeze({
      id: Bb,
      type: "image",
      title: f.title ?? "Hero",
      url: Lc(i, f.path)
    })
  );
  for (const p of a.gallery.entries)
    u.push(
      Object.freeze({
        id: Zx(p.roomId, p.order),
        type: "image",
        title: p.roomId,
        url: Lc(i, p.path)
      })
    );
  for (const p of a.videos.entries)
    u.push(
      Object.freeze({
        id: Qx(p.roomId, p.order),
        type: "video",
        title: p.roomId,
        url: Fx(p.provider, p.mediaId)
      })
    );
  for (const p of a.floors.floors)
    u.push(
      Object.freeze({
        id: Jx(p.floorId),
        type: "floorplan",
        title: p.floorId,
        url: Lc(i, p.planPng)
      })
    );
  return Object.freeze({
    identity: o.identity,
    overview: Object.freeze({
      ...o.overview,
      rooms: s.length
    }),
    media: Object.freeze(u),
    rooms: Object.freeze(s),
    location: o.location,
    metadata: o.metadata,
    ...o.documents !== void 0 ? { documents: Object.freeze([...o.documents]) } : {}
  });
}
function Yb({ label: a = "Načítání Client Studia…" }) {
  return /* @__PURE__ */ d.jsx(
    "div",
    {
      role: "status",
      "aria-live": "polite",
      "data-studio-loading": "",
      className: "flex min-h-[50vh] w-full items-center justify-center bg-embed-background-primary px-section",
      children: /* @__PURE__ */ d.jsx("p", { className: "text-sm text-embed-foreground-primary/60", children: a })
    }
  );
}
const n1 = /* @__PURE__ */ new Set([
  "BOOTSTRAP_STARTED",
  "BOOTSTRAP_LOADING",
  "RUNTIME_READY",
  "EXPERIENCE_READY",
  "REVEAL_READY"
]);
function a1() {
  const a = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Set();
  function i(u) {
    let f = a.get(u);
    return f === void 0 && (f = /* @__PURE__ */ new Set(), a.set(u, f)), f;
  }
  const s = {
    /**
     * Emit a lifecycle event. Once-per-session events are ignored if already emitted.
     */
    emit(u) {
      if (n1.has(u) && o.has(u))
        return;
      o.add(u);
      const f = a.get(u);
      if (!(f === void 0 || f.size === 0))
        for (const p of [...f])
          p();
    },
    /** Subscribe; returns unsubscribe. */
    on(u, f) {
      return i(u).add(f), () => {
        var p;
        (p = a.get(u)) == null || p.delete(f);
      };
    },
    /**
     * Subscribe for a single delivery. If the event already fired this session,
     * invokes `listener` synchronously.
     */
    once(u, f) {
      if (o.has(u))
        return f(), () => {
        };
      const p = i(u), h = () => {
        p.delete(h), f();
      };
      return p.add(h), () => {
        p.delete(h);
      };
    },
    /** True if this session has already emitted `event`. */
    hasEmitted(u) {
      return o.has(u);
    },
    /**
     * Resolve when `event` has fired (or already did). Rejects on abort.
     * Uses listener registration only — never polls.
     */
    waitFor(u, f) {
      return o.has(u) ? Promise.resolve() : f != null && f.aborted ? Promise.reject(
        new DOMException("Bootstrap wait aborted", "AbortError")
      ) : new Promise((p, h) => {
        let y = !1, g = () => {
        };
        const E = () => {
          g(), f == null || f.removeEventListener("abort", z);
        }, O = () => {
          y || (y = !0, E(), p());
        }, z = () => {
          y || (y = !0, E(), h(new DOMException("Bootstrap wait aborted", "AbortError")));
        };
        g = s.once(u, O), f == null || f.addEventListener("abort", z);
      });
    },
    /** Clear session state — call at the start of each Experience launch. */
    reset() {
      o.clear(), a.clear();
    }
  };
  return s;
}
const Wt = a1(), r1 = Object.freeze({
  identity: Object.freeze({
    id: "house-modern-01",
    title: "Modern 01",
    reference: "ASTAV-M01"
  }),
  overview: Object.freeze({
    price: 69e5,
    usableArea: 142,
    landArea: 620,
    hasGarden: !0
  }),
  location: Object.freeze({
    city: "Praha",
    district: "Západ"
  }),
  metadata: Object.freeze({
    energyClass: "B",
    construction: "Zděná"
  }),
  documents: Object.freeze([
    Object.freeze({
      id: "technical-document",
      title: "Bungalov 4KK",
      url: "/reference-house/assets/documents/technical.pdf"
    })
  ])
});
let Ji = null;
function Fp(a) {
  if (a === void 0 || a.trim().length === 0) {
    Ji = null;
    return;
  }
  Ji = a.replace(/\/+$/, "");
}
function o1() {
  return Ji;
}
function Jn(a) {
  const o = Ji;
  return o === null || a.startsWith("https://") || a.startsWith("http://") || a.startsWith("data:") || a.startsWith("blob:") ? a : a.startsWith("/") ? `${o}${a}` : a;
}
const i1 = "[PT-RUNTIME-EVIDENCE-01]";
function $b() {
  if (typeof window > "u")
    return !1;
  try {
    if (new URLSearchParams(window.location.search).get("runtimeEvidence") === "1" || window.localStorage.getItem("runtimeEvidence") === "1")
      return !0;
  } catch {
  }
  return !1;
}
function vn(a, o) {
  $b() && console.info(i1, a, o);
}
function Hc(a) {
  let o = 2166136261;
  for (let i = 0; i < a.length; i += 1)
    o ^= a.charCodeAt(i), o = Math.imul(o, 16777619);
  return `fnv1a-${(o >>> 0).toString(16).padStart(8, "0")}-len${a.length}`;
}
function io(a) {
  return a.length === 0 ? { count: 0, first: null, last: null } : {
    count: a.length,
    first: a[0] ?? null,
    last: a[a.length - 1] ?? null
  };
}
const Gb = "/house-package", l1 = "media/hero/hero.webp", qb = "/house-package/gallery.csv", Vb = "/house-package/rooms.csv", Fb = "/house-package/videos.csv", s1 = "/house-package/media/hero/hero.webp";
function c1(a) {
  var s;
  const o = il(a), i = /* @__PURE__ */ new Set();
  for (const u of o.rows) {
    const f = (s = u.floor) == null ? void 0 : s.trim();
    f && i.add(f);
  }
  return [...i].sort((u, f) => u.localeCompare(f, "en")).map((u) => ({
    floorId: u,
    rasterRelativePath: `media/plans/${u}.webp`,
    svgRelativePath: `media/plans/${u}.svg`
  }));
}
function d1(a) {
  const o = o1();
  return o === null || o.length === 0 || a.startsWith("https://") || a.startsWith("http://") || a.startsWith("data:") || a.startsWith("blob:") ? a : a.startsWith("/") ? `${o}${a}` : a;
}
async function Bc(a) {
  const o = d1(a), i = await fetch(o, { cache: "no-store" });
  if (!i.ok)
    throw new Error(
      `Failed to load Builder Package CSV ${o}: HTTP ${i.status}`
    );
  return i.text();
}
async function u1() {
  const [a, o, i] = await Promise.all([
    Bc(qb),
    Bc(Vb),
    Bc(Fb)
  ]);
  return { galleryCsv: a, roomsCsv: o, videosCsv: i };
}
function m1(a) {
  const o = Vx({
    packageRoot: Gb,
    galleryCsv: a.galleryCsv,
    roomsCsv: a.roomsCsv,
    videosCsv: a.videosCsv,
    heroPath: l1,
    planPairs: c1(a.roomsCsv)
  });
  if (!o.ok) {
    const i = o.errors.map((s) => `${s.code}: ${s.message}`).join("; ");
    throw new Error(`Builder House Package bootstrap failed: ${i}`);
  }
  return o.result;
}
function f1(a, o) {
  $b() && (vn("1.BuilderPackage", {
    packageRoot: Gb,
    galleryCsvPath: qb,
    roomsCsvPath: Vb,
    videosCsvPath: Fb,
    heroPath: s1,
    galleryCsvSource: "HTTP fetch of public/house-package/*.csv (Vite 7 compatible)",
    galleryCsvFingerprint: Hc(o.galleryCsv),
    galleryItemCount: a.gallery.entries.length,
    galleryFirst: a.gallery.entries[0] ?? null,
    galleryLast: a.gallery.entries[a.gallery.entries.length - 1] ?? null,
    roomsCsvFingerprint: Hc(o.roomsCsv),
    videosCsvFingerprint: Hc(o.videosCsv)
  }), vn("2.RuntimeRegistry", {
    gallery: io(a.gallery.entries),
    hero: io(a.hero.entries),
    rooms: io(a.rooms.rooms),
    videos: io(a.videos.entries),
    floors: io(a.floors.floors)
  }), vn("6.RuntimeSource", {
    usesBuilderPackageRegistry: !0,
    usesRuntimeHousePackageFromBuilder: !0,
    usesManifestJson: !1,
    usesReferenceHousePackage: !1,
    csvLoadMode: "http-fetch-public-house-package"
  }));
}
let yo = null, Wc = null, lo = null;
function Xb(a) {
  const o = t1(a, {
    ...r1,
    packagePublicRoot: "/house-package"
  });
  return Wc = o, o;
}
async function p1() {
  if (yo !== null)
    return yo;
  if (lo !== null)
    return lo;
  lo = (async () => {
    const a = await u1(), o = m1(a);
    return yo = o, Xb(o), f1(o, a), o;
  })();
  try {
    return await lo;
  } catch (a) {
    throw lo = null, a;
  }
}
function b1() {
  if (yo === null)
    throw new Error(
      "Builder House Package registries are not ready. Await ensureBuilderPackageBootstrapped() first."
    );
  return yo;
}
function h1() {
  return Wc !== null ? Wc : Xb(b1());
}
const y1 = {
  vestibule: "vestibule-corridor"
};
function g1(a) {
  const o = a.media.find((i) => i.id === Bb);
  return o !== void 0 ? Jn(o.url) : "";
}
function ll(a) {
  const o = a.media.map((i) => {
    const s = Wx(i.id);
    return s === null ? null : {
      order: s.order,
      roomId: s.roomId,
      url: Jn(i.url)
    };
  }).filter((i) => i !== null).sort((i, s) => i.order - s.order);
  return Object.freeze(o);
}
function md(a) {
  const o = /* @__PURE__ */ new Set(), i = [], s = a.media.map((u) => {
    const f = e1(u.id);
    return f === null ? null : {
      order: f.order,
      roomId: f.roomId,
      url: Jn(u.url)
    };
  }).filter((u) => u !== null).sort((u, f) => u.order - f.order);
  for (const u of s)
    o.has(u.url) || (o.add(u.url), i.push(u));
  return Object.freeze(i);
}
function v1(a, o) {
  const i = md(a), u = ll(a).findIndex((f) => f.roomId === o);
  return u < 0 ? null : i.length + u;
}
function x1(a, o) {
  return Object.freeze(
    ll(a).filter((i) => i.roomId === o).map((i) => i.url)
  );
}
function Pb(a) {
  const o = a.media.find((i) => i.type === "floorplan");
  return o !== void 0 ? Jn(o.url) : "";
}
function w1(a, o) {
  const i = Number.parseInt(o, 10), s = Number.isFinite(i) ? `p${i + 1}` : `p${o}`, u = a.media.find(
    (f) => f.id === `floorplan:${s}`
  );
  return u !== void 0 ? Jn(u.url) : Pb(a);
}
function Xp(a, o) {
  const i = md(a);
  if (o < i.length)
    return null;
  const s = ll(a)[o - i.length];
  return (s == null ? void 0 : s.roomId) ?? null;
}
function S1(a) {
  const o = y1[a] ?? a;
  return Jn(`/house-package/decision-canvas/${o}.svg`);
}
const j1 = 2790, E1 = 1938, A1 = {
  bedroom: { x: 388, y: 360, width: 421, height: 720 },
  "children-room": { x: 825, y: 360, width: 388, height: 720 },
  bathroom: { x: 1229, y: 620, width: 340, height: 460 },
  "living-room": { x: 1601, y: 340, width: 793, height: 520 },
  kitchen: { x: 1601, y: 880, width: 793, height: 280 }
};
function fd(a) {
  const o = g1(a);
  return o.length === 0 ? null : Object.freeze({
    id: "builder-package-hero",
    kind: "image",
    url: o,
    thumbnailUrl: o,
    title: "Hero"
  });
}
function Kb(a) {
  const o = a.house.documents ?? [];
  return Object.freeze(
    o.map((i) => {
      const s = Jn(i.url);
      return Object.freeze({
        id: i.id,
        kind: "document",
        url: s,
        thumbnailUrl: s,
        title: i.title
      });
    })
  );
}
function _1(a) {
  var h;
  const o = ll(a), i = md(a), s = (h = o[0]) == null ? void 0 : h.url, u = Object.freeze(
    o.map(
      (y, g) => Object.freeze({
        id: `gallery-photo-${y.order}-${g}`,
        kind: "image",
        url: y.url,
        thumbnailUrl: y.url,
        title: y.roomId
      })
    )
  ), f = Object.freeze(
    i.map(
      (y, g) => Object.freeze({
        id: `tour-video-${y.order}-${g}`,
        kind: "video",
        url: y.url,
        thumbnailUrl: s ?? y.url,
        title: "Tour"
      })
    )
  ), p = Object.freeze([
    ...f.map((y) => ({
      kind: "video",
      src: y.url,
      thumbnailSrc: y.thumbnailUrl
    })),
    ...u.map((y) => ({
      kind: "photo",
      src: y.url,
      thumbnailSrc: y.thumbnailUrl
    }))
  ]);
  return { gallery: u, videos: f, thumbnails: p };
}
function O1(a, o, i) {
  const s = fd(o.house), u = Kb(o), p = x1(o.house, a.id)[0], h = p !== void 0 ? Object.freeze({
    id: `${a.id}-hero`,
    kind: "image",
    url: p,
    thumbnailUrl: p,
    title: a.name
  }) : s;
  return Object.freeze({
    ...a,
    description: `${a.name} · ${a.area} m² · patro ${a.floor}`,
    heroMedia: h,
    gallery: i.gallery,
    videos: i.videos,
    documents: u,
    thumbnails: i.thumbnails,
    metrics: Object.freeze([
      { label: "Plocha", value: `${a.area} m²` },
      {
        label: "Patro",
        value: a.floor === 0 ? "Přízemí" : `Patro ${a.floor}`
      },
      {
        label: "Média",
        value: String(i.gallery.length + i.videos.length)
      }
    ])
  });
}
function z1(a, o, i) {
  var f, p, h;
  const s = (a == null ? void 0 : a.documents) ?? Kb(o), u = fd(o.house);
  return Object.freeze(a === null ? {
    roomId: null,
    title: (u == null ? void 0 : u.title) ?? o.house.title,
    heroMedia: u,
    gallery: i.gallery,
    videos: i.videos,
    documents: s,
    thumbnails: i.thumbnails,
    heroUrl: (u == null ? void 0 : u.url) ?? null,
    videoUrl: ((f = i.videos[0]) == null ? void 0 : f.url) ?? null
  } : {
    roomId: a.id,
    title: a.name,
    heroMedia: a.heroMedia,
    gallery: i.gallery,
    videos: i.videos,
    documents: s,
    thumbnails: i.thumbnails,
    heroUrl: ((p = a.heroMedia) == null ? void 0 : p.url) ?? null,
    videoUrl: ((h = i.videos[0]) == null ? void 0 : h.url) ?? null
  });
}
function Pp(a) {
  return `${a} m²`;
}
function N1(a) {
  return `${a.toLocaleString("cs-CZ")} Kč`;
}
function T1(a, o) {
  const { house: i } = a, s = a.context.object, { highlights: u, focus: f } = a.context.decision, p = fd(i);
  return Object.freeze({
    eyebrow: `${s.reference} · ${s.construction}`,
    title: s.title,
    description: i.hasGarden ? `${i.roomCount} místností · se zahradou` : `${i.roomCount} místností`,
    metrics: Object.freeze([
      { label: "Užitná plocha", value: Pp(s.usableArea) },
      { label: "Pozemek", value: Pp(i.landArea) },
      { label: "Cena", value: N1(i.price) }
    ]),
    heroMedia: p,
    primaryMediaUrl: (p == null ? void 0 : p.url) ?? null,
    primaryReason: f.focusReason,
    highlights: u,
    focusConfidence: f.confidence,
    recommendedAction: f.recommendedAction,
    focusRoomName: f.focusRoomName
  });
}
function R1(a) {
  const o = a.context.navigation.currentFloor ?? a.context.navigation.floors[0] ?? "0", i = w1(a.house, o) || Pb(a.house), s = i.length > 0, u = s ? j1 : 400, f = s ? E1 : 400, p = a.house.rooms.map((h) => {
    const y = A1[h.id] ?? null;
    return Object.freeze({
      id: h.id,
      title: h.name,
      floor: String(h.floor),
      decisionCanvasSrc: S1(h.id),
      floorPlanRegion: y
    });
  });
  return Object.freeze({
    src: i,
    viewBoxWidth: u,
    viewBoxHeight: f,
    viewBox: u,
    rooms: Object.freeze(p)
  });
}
function k1(a, o, i) {
  const { context: s } = a;
  return Object.freeze({
    ...s,
    activeRoom: Object.freeze({
      id: s.activeRoom.id,
      room: o,
      focusRoom: s.activeRoom.focusRoom
    }),
    roomMedia: z1(o, a, i),
    hero: T1(a),
    floorPlan: R1(a)
  });
}
function C1(a) {
  const o = _1(a.house), i = a.context.activeRoom.room, s = a.context.activeRoom.id, u = i === null || s === null ? null : O1(i, a, o);
  return Object.freeze({
    house: a.house,
    context: k1(a, u, o)
  });
}
const Zb = U.createContext(null);
function I1() {
  return U.useEffect(() => {
    Wt.emit("EXPERIENCE_READY");
  }, []), null;
}
function M1({
  children: a,
  runtime: o
}) {
  const i = U.useRef(o ?? null), [s, u] = U.useState(0), [f, p] = U.useState(o !== void 0), [h, y] = U.useState(null), g = ol();
  U.useEffect(() => {
    if (o !== void 0) {
      i.current = o, p(!0), y(null), Wt.emit("RUNTIME_READY");
      return;
    }
    Wt.emit("BOOTSTRAP_LOADING");
    let z = !1;
    return p1().then(() => {
      z || (i.current = ex({
        housePackage: h1(),
        clock: Fv(),
        now: 1
      }), p(!0), y(null), u((D) => D + 1), Wt.emit("RUNTIME_READY"));
    }).catch((D) => {
      z || (y(D instanceof Error ? D.message : String(D)), p(!1));
    }), () => {
      z = !0;
    };
  }, [o]);
  const E = U.useCallback(
    (z, D) => {
      const R = i.current;
      if (R === null)
        throw new Error("Decision Session Runtime is not ready.");
      const S = R.dispatch(z, D);
      return S.ok && (g == null || g.observeDispatch(S), u((H) => H + 1)), S;
    },
    [g]
  ), O = U.useMemo(() => {
    if (!f || i.current === null)
      return null;
    const z = i.current.getExperience();
    if (z === null)
      throw new Error("DecisionSessionRuntime produced no Experience projection.");
    return {
      experience: C1(z),
      ready: !0,
      dispatch: E
    };
  }, [E, f, s]);
  return U.useEffect(() => {
    if (O === null)
      return;
    const { experience: z } = O, D = typeof document < "u" && document.querySelector("[data-embed-root]") !== null, R = D ? "Embed " : "", S = [
      ...new Set(
        z.house.media.map(($) => {
          const re = /^gallery:([^:]+):/.exec($.id);
          return (re == null ? void 0 : re[1]) ?? null;
        }).filter(($) => $ !== null)
      )
    ], H = z.context.activeRoom.id, W = z.house.media.filter(
      ($) => $.id.startsWith("gallery:")
    ), pe = z.house.media.filter(
      ($) => $.id.startsWith("video:")
    );
    console.log(
      `${R}Runtime source:`,
      Xx
    ), console.log(
      `${R}rooms:`,
      z.house.rooms.map(($) => $.id)
    ), console.log(
      `${R}navigation:`,
      z.context.navigation.rooms.map(($) => $.id)
    ), console.log(`${R}room count:`, z.house.rooms.length), console.log(
      `${R}navigation room count:`,
      z.context.navigation.rooms.length
    ), console.log("Gallery rooms:", S), console.log(
      `${R}global Media Timeline:`,
      {
        videoCount: pe.length,
        photoCount: W.length,
        thumbnails: z.context.roomMedia.thumbnails.map(
          ($, re) => ({ index: re, kind: $.kind, src: $.src })
        )
      }
    ), D && (console.log("Embed active room id:", H), console.log(
      "Embed gallery assets (global):",
      W.map(($) => ({
        id: $.id,
        url: $.url,
        type: $.type
      }))
    ));
  }, [O]), h !== null ? /* @__PURE__ */ d.jsxs("div", { role: "alert", "data-builder-package-bootstrap-error": "", children: [
    "Builder House Package bootstrap failed: ",
    h
  ] }) : O === null ? /* @__PURE__ */ d.jsx(Yb, { label: "Připravuji Decision Session…" }) : /* @__PURE__ */ d.jsxs(Zb.Provider, { value: O, children: [
    /* @__PURE__ */ d.jsx(I1, {}),
    a
  ] });
}
function ct() {
  const a = U.useContext(Zb);
  if (a === null)
    throw new Error(
      "useDecisionSessionRuntime must be used within DecisionSessionRuntimeProvider"
    );
  return a;
}
function D1({ children: a }) {
  return /* @__PURE__ */ d.jsx(
    "div",
    {
      "data-desktop-canvas": !0,
      className: "box-border w-canvas min-w-canvas max-w-canvas shrink-0 grow-0 self-start bg-embed-background-primary pt-0 mobile:max-w-none mobile:min-w-0 mobile:w-full",
      children: a
    }
  );
}
function $i() {
  return /* @__PURE__ */ d.jsx(
    "div",
    {
      "aria-hidden": "true",
      className: "h-chapter-spacing w-full shrink-0 bg-embed-background-primary"
    }
  );
}
function U1({ children: a }) {
  const { ready: o } = ct();
  return o ? a : /* @__PURE__ */ d.jsx(Yb, { label: "Připravuji Decision Session…" });
}
function L1(a) {
  const [o, i] = U.useState(
    a[0] ?? null
  );
  return U.useEffect(() => {
    if (a.length === 0 || typeof IntersectionObserver > "u")
      return;
    const s = a.map((p) => document.getElementById(p)).filter((p) => p !== null);
    if (s.length === 0)
      return;
    const u = /* @__PURE__ */ new Map(), f = new IntersectionObserver(
      (p) => {
        for (const g of p)
          u.set(g.target.id, g.intersectionRatio);
        let h = null, y = 0;
        for (const g of a) {
          const E = u.get(g) ?? 0;
          E > y && (y = E, h = g);
        }
        h !== null && i(h);
      },
      {
        root: null,
        // Account for sticky header so active state tracks the reading frame.
        rootMargin: "-20% 0px -55% 0px",
        threshold: [0, 0.25, 0.5, 0.75, 1]
      }
    );
    for (const p of s)
      f.observe(p);
    return () => {
      f.disconnect();
    };
  }, [a]), o;
}
const sr = "overflow-hidden rounded-[11px] border border-embed-border-default bg-[#FFFFFF] shadow-[0_1px_11px_rgba(0,25,48,0.044)]";
function H1({
  experience: a,
  onSelectChoice: o,
  onContinue: i
}) {
  const s = a.house, u = a.currentDecision, f = new Set(
    a.highlights.map((p) => p.target)
  );
  return /* @__PURE__ */ d.jsxs(
    "section",
    {
      "aria-label": "House Decision Experience",
      className: `${sr} px-section pb-section`,
      children: [
        /* @__PURE__ */ d.jsx("h2", { className: "text-base font-bold tracking-wide text-embed-foreground-primary", children: "House Experience" }),
        /* @__PURE__ */ d.jsx("p", { className: "mt-2 text-sm text-embed-foreground-primary/70", children: "House → Highlights → Recommended Order → Summary" }),
        s ? /* @__PURE__ */ d.jsxs("div", { className: "mt-section grid gap-section tablet:grid-cols-2", children: [
          /* @__PURE__ */ d.jsxs("div", { className: "space-y-section", children: [
            /* @__PURE__ */ d.jsxs("article", { className: "rounded-md border border-embed-border-default bg-embed-background-primary p-section", children: [
              /* @__PURE__ */ d.jsx("h3", { className: "text-sm font-semibold tracking-wide text-embed-foreground-primary", children: "House" }),
              /* @__PURE__ */ d.jsx("p", { className: "mt-2 text-lg font-bold text-embed-foreground-primary", children: s.title }),
              /* @__PURE__ */ d.jsxs("p", { className: "mt-1 text-xs text-embed-foreground-primary/45", children: [
                s.reference,
                " · ",
                s.city,
                ", ",
                s.district
              ] }),
              /* @__PURE__ */ d.jsxs("dl", { className: "mt-4 space-y-2 text-sm", children: [
                /* @__PURE__ */ d.jsxs(
                  "div",
                  {
                    className: f.has("price") ? "rounded-md bg-embed-brand-gold/15 px-2 py-1.5" : "",
                    children: [
                      /* @__PURE__ */ d.jsx("dt", { className: "text-embed-foreground-primary/45", children: "Cena" }),
                      /* @__PURE__ */ d.jsxs("dd", { className: "font-medium text-embed-foreground-primary", children: [
                        s.price.toLocaleString("cs-CZ"),
                        " Kč"
                      ] })
                    ]
                  }
                ),
                /* @__PURE__ */ d.jsxs(
                  "div",
                  {
                    className: f.has("layout") ? "rounded-md bg-embed-brand-gold/15 px-2 py-1.5" : "",
                    children: [
                      /* @__PURE__ */ d.jsx("dt", { className: "text-embed-foreground-primary/45", children: "Dispozice" }),
                      /* @__PURE__ */ d.jsxs("dd", { className: "font-medium text-embed-foreground-primary", children: [
                        s.roomCount,
                        " pokojů · ",
                        s.usableArea,
                        " m²"
                      ] })
                    ]
                  }
                ),
                /* @__PURE__ */ d.jsxs(
                  "div",
                  {
                    className: f.has("garden") ? "rounded-md bg-embed-brand-gold/15 px-2 py-1.5" : "",
                    children: [
                      /* @__PURE__ */ d.jsx("dt", { className: "text-embed-foreground-primary/45", children: "Zahrada" }),
                      /* @__PURE__ */ d.jsxs("dd", { className: "font-medium text-embed-foreground-primary", children: [
                        s.hasGarden ? "Ano" : "Ne",
                        " · pozemek",
                        " ",
                        s.landArea,
                        " m²"
                      ] })
                    ]
                  }
                ),
                /* @__PURE__ */ d.jsxs("div", { children: [
                  /* @__PURE__ */ d.jsx("dt", { className: "text-embed-foreground-primary/45", children: "Stavba / energie" }),
                  /* @__PURE__ */ d.jsxs("dd", { className: "font-medium text-embed-foreground-primary", children: [
                    s.construction,
                    " · třída ",
                    s.energyClass
                  ] })
                ] })
              ] })
            ] }),
            a.highlights.length > 0 ? /* @__PURE__ */ d.jsxs("article", { className: "rounded-md border border-embed-border-default bg-embed-background-primary p-section", children: [
              /* @__PURE__ */ d.jsx("h3", { className: "text-sm font-semibold tracking-wide text-embed-foreground-primary", children: "Highlights" }),
              /* @__PURE__ */ d.jsx("ul", { className: "mt-4 space-y-2 text-sm text-embed-foreground-primary", children: a.highlights.map((p) => /* @__PURE__ */ d.jsxs("li", { children: [
                /* @__PURE__ */ d.jsx("span", { className: "font-medium text-embed-brand-gold", children: p.label }),
                /* @__PURE__ */ d.jsxs("span", { className: "text-embed-foreground-primary/70", children: [
                  " ",
                  "— ",
                  p.reason
                ] })
              ] }, p.target)) })
            ] }) : null,
            a.recommendedRooms.length > 0 ? /* @__PURE__ */ d.jsxs("article", { className: "rounded-md border border-embed-border-default bg-embed-background-primary p-section", children: [
              /* @__PURE__ */ d.jsx("h3", { className: "text-sm font-semibold tracking-wide text-embed-foreground-primary", children: "Recommended Order" }),
              /* @__PURE__ */ d.jsx("ol", { className: "mt-4 list-decimal space-y-2 pl-5 text-sm text-embed-foreground-primary", children: a.recommendedRooms.map((p) => /* @__PURE__ */ d.jsxs("li", { children: [
                /* @__PURE__ */ d.jsx("span", { className: "font-medium", children: p.name }),
                /* @__PURE__ */ d.jsxs("span", { className: "text-embed-foreground-primary/70", children: [
                  " ",
                  "— ",
                  p.area,
                  " m² · patro ",
                  p.floor
                ] })
              ] }, p.id)) })
            ] }) : null
          ] }),
          /* @__PURE__ */ d.jsx("div", { className: "rounded-md border border-embed-border-default bg-embed-background-primary p-section", children: a.summaryReady ? /* @__PURE__ */ d.jsxs("div", { children: [
            /* @__PURE__ */ d.jsx("h3", { className: "text-sm font-semibold tracking-wide text-embed-foreground-primary", children: "Summary" }),
            /* @__PURE__ */ d.jsx("ul", { className: "mt-4 space-y-2 text-sm text-embed-foreground-primary", children: a.highlights.map((p) => /* @__PURE__ */ d.jsxs("li", { children: [
              /* @__PURE__ */ d.jsx("span", { className: "font-medium text-embed-brand-gold", children: p.label }),
              /* @__PURE__ */ d.jsxs("span", { className: "text-embed-foreground-primary/70", children: [
                " ",
                "— ",
                p.reason
              ] })
            ] }, p.target)) }),
            a.recommendedRooms.length > 0 ? /* @__PURE__ */ d.jsxs("div", { className: "mt-6", children: [
              /* @__PURE__ */ d.jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-embed-foreground-primary/45", children: "Doporučené pořadí místností" }),
              /* @__PURE__ */ d.jsx("ol", { className: "mt-2 list-decimal space-y-1 pl-5 text-sm", children: a.recommendedRooms.map((p) => /* @__PURE__ */ d.jsx("li", { children: p.name }, p.id)) })
            ] }) : null,
            a.highlights.length === 0 ? /* @__PURE__ */ d.jsx("p", { className: "mt-4 text-sm text-embed-foreground-primary/70", children: "Zatím žádné zvýrazněné preference." }) : null
          ] }) : /* @__PURE__ */ d.jsxs("div", { children: [
            /* @__PURE__ */ d.jsx("h3", { className: "text-sm font-semibold tracking-wide text-embed-foreground-primary", children: (u == null ? void 0 : u.title) ?? "Decision" }),
            u != null && u.choices && u.choices.length > 0 ? /* @__PURE__ */ d.jsx("div", { className: "mt-4 flex flex-col gap-2", children: u.choices.map((p) => /* @__PURE__ */ d.jsx(
              "button",
              {
                type: "button",
                onClick: () => o(u.id, p.id),
                className: "rounded-md border border-embed-border-default px-4 py-3 text-left text-sm font-medium text-embed-foreground-primary transition-colors duration-150 ease-out hover:border-embed-brand-gold hover:bg-embed-brand-gold/10",
                children: p.label
              },
              p.id
            )) }) : /* @__PURE__ */ d.jsx(
              "button",
              {
                type: "button",
                onClick: i,
                className: "mt-4 rounded-md bg-embed-brand-navy px-4 py-3 text-sm font-medium text-embed-background-primary transition-opacity duration-150 ease-out hover:opacity-90",
                children: "Pokračovat"
              }
            )
          ] }) })
        ] }) : null
      ]
    }
  );
}
function B1({
  experience: a,
  onSelectChoice: o,
  onContinue: i
}) {
  return a === null ? null : /* @__PURE__ */ d.jsxs(d.Fragment, { children: [
    /* @__PURE__ */ d.jsx(
      "div",
      {
        "data-legacy-experience": "command-runtime",
        "data-testid": "legacy-command-experience",
        children: /* @__PURE__ */ d.jsx(
          H1,
          {
            experience: a,
            onSelectChoice: o,
            onContinue: i
          }
        )
      }
    ),
    /* @__PURE__ */ d.jsx(
      "div",
      {
        "aria-hidden": "true",
        className: "h-chapter-spacing w-full shrink-0 bg-[#F7F6F4]"
      }
    )
  ] });
}
function pd(a) {
  return Object.freeze({ content: a });
}
class Pe extends Error {
  constructor(i, s, u) {
    super(
      s,
      (u == null ? void 0 : u.cause) !== void 0 ? { cause: u.cause } : void 0
    );
    q(this, "code");
    /**
     * Optional user-facing diagnostic from the Adapter (e.g. Czech OpenAI status text).
     * When set, Runtime surfaces it as ConversationError.userMessage.
     */
    q(this, "diagnostic");
    this.name = "AdapterFailure", this.code = i, this.diagnostic = (u == null ? void 0 : u.diagnostic) === void 0 ? null : u.diagnostic;
  }
}
function Y1(a) {
  return a instanceof Pe;
}
const $1 = "OpenAIProvider: missing API key. Set OPENAI_API_KEY or pass apiKey.";
function G1() {
  return new Pe(
    "missing_api_key",
    $1
  );
}
function q1(a) {
  const o = a instanceof Error ? a.message : String(a);
  if ((a instanceof Error ? a.name : "") === "AbortError" || /timeout|timed out|aborted/i.test(o)) {
    const u = "Spojení s OpenAI vypršelo (timeout). Zkuste to prosím znovu.";
    return new Pe("timeout", u, {
      diagnostic: u,
      cause: a
    });
  }
  if (/Failed to fetch|NetworkError|fetch failed|ECONNREFUSED|ENOTFOUND|ECONNRESET|network/i.test(
    o
  )) {
    const u = "Síťové spojení s OpenAI selhalo (network error). Zkontrolujte připojení.";
    return new Pe("http_error", u, {
      diagnostic: u,
      cause: a
    });
  }
  const s = a instanceof Error ? a.message : `OpenAI požadavek selhal: ${o}`;
  return new Pe("provider_error", s, {
    diagnostic: s,
    cause: a
  });
}
function V1(a, o, i) {
  var h, y;
  const s = K1(o), u = ((y = (h = o == null ? void 0 : o.error) == null ? void 0 : h.message) == null ? void 0 : y.trim()) ?? "", f = P1(
    a,
    s,
    u,
    i
  ), p = (a >= 500 || a === 401 || a === 403 || a === 404 || a === 429, "http_error");
  return new Pe(p, f, { diagnostic: f });
}
function F1() {
  const a = "OpenAI vrátila neplatnou JSON odpověď (invalid_response).";
  return new Pe("invalid_response", a, { diagnostic: a });
}
function X1() {
  return new Pe(
    "provider_error",
    "OpenAIProvider: fetch is not available in this environment."
  );
}
function P1(a, o, i, s) {
  return a === 401 ? "OpenAI autentizace selhala (401 unauthorized). Zkontrolujte API klíč." : a === 403 ? "OpenAI přístup byl odepřen (403 forbidden)." : a === 404 ? `OpenAI model nebyl nalezen (404). Zkontrolujte model „${s}".` : a === 429 ? Z1(o, i) ? "OpenAI účet nemá dostupnou kvótu (429 insufficient_quota)." : "OpenAI rate limit byl překročen (429 rate_limit). Zkuste to za chvíli znovu." : a >= 500 && a <= 599 ? `OpenAI služba je dočasně nedostupná (${a}). Zkuste to prosím znovu.` : `OpenAI požadavek selhal (HTTP ${a}): ${i || o || "unknown error"}`;
}
function K1(a) {
  var s, u;
  const o = (s = a == null ? void 0 : a.error) == null ? void 0 : s.code;
  if (typeof o == "string" && o.trim().length > 0)
    return o.trim();
  const i = (u = a == null ? void 0 : a.error) == null ? void 0 : u.type;
  return typeof i == "string" && i.trim().length > 0 ? i.trim() : "";
}
function Z1(a, o) {
  return /insufficient_quota/i.test(a) || /insufficient_quota|exceeded your current quota/i.test(o);
}
const Q1 = "openai", J1 = Q1, W1 = "gpt-4o-mini", ew = "https://api.openai.com/v1";
class tw {
  constructor(o = {}) {
    q(this, "id", J1);
    q(this, "apiKey");
    q(this, "model");
    q(this, "baseUrl");
    /** Test inject only — never store unbound window.fetch. */
    q(this, "fetchOverride");
    const i = o.apiKey ?? Kp("OPENAI_API_KEY") ?? "";
    if (i.length === 0)
      throw G1();
    this.apiKey = i, this.model = o.model ?? Kp("OPENAI_MODEL") ?? W1, this.baseUrl = (o.baseUrl ?? ew).replace(/\/$/, ""), this.fetchOverride = o.fetch ?? null;
  }
  async chat(o) {
    const i = {
      model: this.model,
      messages: rw(o),
      temperature: 0,
      seed: 42
    };
    let s;
    try {
      s = await this.request(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(i)
      });
    } catch (p) {
      throw q1(p);
    }
    const u = await s.text(), f = nw(u);
    if (!s.ok)
      throw aw(u, f), V1(s.status, f, this.model);
    if (f === null)
      throw F1();
    return iw(f);
  }
  /**
   * Call platform fetch without detaching it from its receiver.
   *
   * Browser `window.fetch` is a method: extracting `const f = fetch` and calling
   * `f(...)` throws TypeError: Illegal invocation because `this` is undefined.
   * Production path therefore always calls `globalThis.fetch(...)` as a method.
   */
  request(o, i) {
    return this.fetchOverride !== null ? this.fetchOverride(o, i) : typeof globalThis.fetch != "function" ? Promise.reject(X1()) : globalThis.fetch(o, i);
  }
}
function Kp(a) {
  const o = process.env[a];
  if (!(o === void 0 || o.trim().length === 0))
    return o.trim();
}
function nw(a) {
  if (a.trim().length === 0)
    return null;
  try {
    return JSON.parse(a);
  } catch {
    return null;
  }
}
function aw(a, o) {
  if (o !== null) {
    console.error("OpenAIProvider: error response JSON", o);
    return;
  }
  console.error("OpenAIProvider: error response body", a);
}
function rw(a) {
  const o = [
    {
      role: "system",
      content: a.systemPrompt.content
    }
  ];
  for (const i of a.messages) {
    const s = ow(i);
    s !== null && o.push({ role: s, content: i.content });
  }
  return o;
}
function ow(a) {
  return a.role === "system" || a.role === "user" || a.role === "assistant" ? a.role : null;
}
function iw(a) {
  var h, y, g, E, O;
  const o = (h = a.choices) == null ? void 0 : h[0], i = ((y = o == null ? void 0 : o.message) == null ? void 0 : y.content) ?? "", s = lw(o == null ? void 0 : o.finish_reason), u = ((g = a.usage) == null ? void 0 : g.prompt_tokens) ?? 0, f = ((E = a.usage) == null ? void 0 : E.completion_tokens) ?? 0, p = ((O = a.usage) == null ? void 0 : O.total_tokens) ?? u + f;
  return Object.freeze({
    content: i,
    usage: Object.freeze({
      promptTokens: u,
      completionTokens: f,
      totalTokens: p
    }),
    finishReason: s
  });
}
function lw(a) {
  switch (a) {
    case "stop":
      return "stop";
    case "length":
      return "length";
    case "content_filter":
      return "content_filter";
    default:
      return a == null ? "stop" : "error";
  }
}
class Qb {
  constructor(o) {
    q(this, "id");
    q(this, "model");
    this.adapter = o;
    const i = o;
    this.id = typeof i.id == "string" ? i.id : "direct-adapter", this.model = typeof i.model == "string" ? i.model : null;
  }
  chat(o) {
    return this.adapter.chat(o);
  }
}
function bd(a) {
  return new Qb(a);
}
function sw(a) {
  return a instanceof Qb;
}
function cw() {
  const a = Jb() ?? ed("OPENAI_API_KEY") ?? "";
  if (a.length === 0)
    return null;
  const o = uw() ?? ed("OPENAI_MODEL");
  return bd(
    new tw({
      apiKey: a,
      ...o !== void 0 && o.length > 0 ? { model: o } : {}
    })
  );
}
function dw() {
  return {
    viteApiKey: Jb() !== void 0 ? "present" : "missing",
    processApiKey: ed("OPENAI_API_KEY") !== void 0 ? "present" : "missing"
  };
}
function ed(a) {
  const o = process.env[a];
  if (!(o === void 0 || o.trim().length === 0))
    return o.trim();
}
function Jb() {
  try {
    return "".trim().length === 0 ? void 0 : "".trim();
  } catch {
    return;
  }
}
function uw() {
  try {
    return;
  } catch {
    return;
  }
}
class mw {
  constructor(o) {
    q(this, "provider");
    this.provider = o.provider;
  }
  analyze(o) {
    return this.provider.analyze(o);
  }
}
function Zp(a) {
  return new mw({ provider: a });
}
function Wi() {
  return Object.freeze({
    entries: Object.freeze([])
  });
}
function fw() {
  return Object.freeze({
    facts: Object.freeze([]),
    preferences: Object.freeze([]),
    constraints: Object.freeze([]),
    goals: Object.freeze([]),
    concerns: Object.freeze([]),
    acceptedOptions: Object.freeze([]),
    rejectedOptions: Object.freeze([])
  });
}
function Wb() {
  return Object.freeze({
    recommendedOptions: Object.freeze([]),
    avoidedOptions: Object.freeze([]),
    reasoning: Object.freeze([]),
    matchedPreferences: Object.freeze([]),
    violatedConstraints: Object.freeze([])
  });
}
const pw = 0.72;
function so(a, o) {
  return Object.freeze({ key: a, value: o });
}
function Qp(a) {
  const o = a.trim(), i = o.toLowerCase(), s = [], u = [], f = [], p = [], h = [], y = [], g = [];
  (/\b(dvě|dve|2)\s+dět/i.test(o) || /\b(two|2)\s+(kids|children)\b/i.test(i)) && s.push(so("familySize", 4));
  const E = o.match(/(\d+[.,]\d+)\s*milion/i), O = o.match(
    /\b(rozpočet|budget)\b[^0-9]{0,24}(\d[\d\s.,]{3,})\b/i
  );
  if (E) {
    const S = E[1].replace(",", "."), H = Number.parseFloat(S);
    Number.isFinite(H) && f.push(so("budget", Math.round(H * 1e6)));
  } else if (O) {
    const S = O[2].replace(/[\s.]/g, "").replace(",", ""), H = Number.parseInt(S, 10);
    Number.isFinite(H) && f.push(so("budget", H));
  }
  const z = /(vlastně|už|now|actually)[\s\S]{0,48}(nevadí|nevadilo|ok|souhlas)/i.test(
    o
  ) || /(nevadí|nevadilo|akceptujeme|souhlasíme)[\s\S]{0,40}(tepelné\s+čerpadlo|tepelne\s+cerpadlo|heat[\s-]?pump)/i.test(
    o
  ) || /(tepelné\s+čerpadlo|tepelne\s+cerpadlo|heat[\s-]?pump)[\s\S]{0,40}(nevadí|ok|accept)/i.test(
    o
  ), D = /(nechceme|nechci|nechce|without|don't want|do not want|no)\b[\s\S]{0,40}(tepelné\s+čerpadlo|tepelne\s+cerpadlo|heat[\s-]?pump)/i.test(
    o
  ) || /(tepelné\s+čerpadlo|tepelne\s+cerpadlo|heat[\s-]?pump)\b[\s\S]{0,40}(nechceme|nechci|ne)/i.test(
    o
  );
  z ? g.push(so("heating", "heat-pump")) : D && y.push(so("heating", "heat-pump"));
  const R = s.length + u.length + f.length + p.length + h.length + y.length + g.length > 0;
  return Object.freeze({
    facts: Object.freeze(s),
    preferences: Object.freeze(u),
    constraints: Object.freeze(f),
    goals: Object.freeze(p),
    concerns: Object.freeze(h),
    rejectedOptions: Object.freeze(y),
    acceptedOptions: Object.freeze(g),
    confidence: R ? pw : 0
  });
}
function bw(a = 0) {
  return Object.freeze({
    facts: Object.freeze([]),
    preferences: Object.freeze([]),
    constraints: Object.freeze([]),
    goals: Object.freeze([]),
    concerns: Object.freeze([]),
    acceptedOptions: Object.freeze([]),
    rejectedOptions: Object.freeze([]),
    confidence: a
  });
}
const hw = [
  "Extrahuj pouze informace důležité pro budoucí rozhodování.",
  "Nevysvětluj.",
  "Neodpovídej.",
  "Vrať pouze strukturovaná data.",
  "JSON objekt s poli: facts, preferences, constraints, goals, concerns, rejectedOptions, acceptedOptions, confidence.",
  'Každá položka je { "key": string, "value": string | number | boolean }.',
  "confidence je číslo 0..1."
].join(" ");
class yw {
  constructor(o) {
    q(this, "llm");
    q(this, "deterministicOnly");
    this.llm = o.llm, this.deterministicOnly = o.deterministicOnly ?? !1;
  }
  async analyze(o) {
    if (this.deterministicOnly)
      return Qp(o.message);
    try {
      const i = await this.llm.chat(gw(o)), s = xw(i.content);
      if (s !== null)
        return s;
    } catch {
    }
    return Qp(o.message);
  }
}
function Jp(a) {
  return new yw(a);
}
function gw(a) {
  const o = a.recentMessages ?? [], i = {
    decision: {
      headline: "",
      summary: "",
      focusPriority: null,
      secondaryPriority: null,
      selectedPriorities: Object.freeze([]),
      recommendations: Object.freeze([])
    },
    object: {
      objectId: null,
      reference: null,
      title: null,
      attributes: {},
      knowledge: Wi(),
      mediaReferences: []
    },
    conversation: {
      sessionId: "analyzer",
      turnCount: o.length + 1,
      recentMessages: o
    },
    memory: fw(),
    recommendation: Wb(),
    knowledge: Wi()
  };
  return {
    sessionId: `analyze:${vw(a.message)}`,
    systemPrompt: pd(hw),
    context: i,
    messages: [
      ...o.map(
        (s) => Object.freeze({ role: s.role, content: s.content })
      ),
      Object.freeze({
        role: "user",
        content: a.message
      })
    ]
  };
}
function vw(a) {
  let o = 0;
  for (let i = 0; i < a.length; i += 1)
    o = o * 31 + a.charCodeAt(i) >>> 0;
  return o.toString(16);
}
function xw(a) {
  const o = ww(a);
  if (o === null)
    return null;
  try {
    const i = JSON.parse(o);
    return Sw(i);
  } catch {
    return null;
  }
}
function ww(a) {
  const o = a.trim();
  if (o.startsWith("{") && o.endsWith("}"))
    return o;
  const i = o.indexOf("{"), s = o.lastIndexOf("}");
  return i >= 0 && s > i ? o.slice(i, s + 1) : null;
}
function Sw(a) {
  const o = a.confidence, i = typeof o == "number" && Number.isFinite(o) ? Math.min(1, Math.max(0, o)) : 0.5, s = Object.freeze({
    facts: Object.freeze(ga(a.facts)),
    preferences: Object.freeze(ga(a.preferences)),
    constraints: Object.freeze(ga(a.constraints)),
    goals: Object.freeze(ga(a.goals)),
    concerns: Object.freeze(ga(a.concerns)),
    rejectedOptions: Object.freeze(ga(a.rejectedOptions)),
    acceptedOptions: Object.freeze(ga(a.acceptedOptions)),
    confidence: i
  });
  return s.facts.length + s.preferences.length + s.constraints.length + s.goals.length + s.concerns.length + s.rejectedOptions.length + s.acceptedOptions.length === 0 && i === 0 ? bw(0) : s;
}
function ga(a) {
  if (!Array.isArray(a))
    return [];
  const o = [];
  for (const i of a) {
    if (i === null || typeof i != "object")
      continue;
    const s = i, u = s.key, f = s.value;
    typeof u != "string" || u.length === 0 || jw(f) && o.push(Object.freeze({ key: u, value: f }));
  }
  return o;
}
function jw(a) {
  return typeof a == "string" || typeof a == "number" || typeof a == "boolean";
}
class eh {
  constructor(o = {}) {
    q(this, "enabled");
    q(this, "listener");
    q(this, "useConsole");
    q(this, "turns", []);
    this.enabled = o.enabled ?? !0, this.listener = o.listener, this.useConsole = o.console ?? !1;
  }
  isEnabled() {
    return this.enabled;
  }
  emit(o) {
    var i;
    this.enabled && (o.kind === "turn" ? (this.turns.push(o.trace), this.useConsole && zw(o.trace)) : this.useConsole && o.kind, (i = this.listener) == null || i.call(this, o));
  }
  emitPhase(o, i, s) {
    this.emit({
      kind: "phase",
      conversation: o,
      phase: i,
      durationMs: s,
      at: Date.now()
    });
  }
  emitTurn(o) {
    this.emit({ kind: "turn", trace: o });
  }
  /** In-memory traces for the current process / page (pilot). */
  getTraces() {
    return this.turns;
  }
  getLastTrace() {
    return this.turns[this.turns.length - 1] ?? null;
  }
  clear() {
    this.turns.length = 0;
  }
}
function th(a) {
  return new eh(a);
}
function Ew() {
  return new eh({ enabled: !1 });
}
function Aw(a) {
  return Object.freeze({ ...a });
}
function Yc(a) {
  return Object.freeze({ ...a });
}
function _w(a) {
  return Object.freeze({ ...a });
}
function Ow(a) {
  return Object.freeze({ ...a });
}
function zw(a) {
  var u;
  const { conversation: o, latency: i } = a, s = [
    `[ai.trace] session=${o.sessionId} conversation=${o.conversationId} message=${o.messageId} ok=${a.ok}`,
    `  Analyzer ${i.analyzerMs} ms`,
    `  Memory ${i.memoryMs} ms`,
    `  Resolution ${i.resolutionMs} ms`,
    `  PromptBuilder ${i.promptBuilderMs} ms`,
    `  Provider ${i.providerMs} ms`,
    `  Total ${i.totalMs} ms`
  ];
  a.prompt !== null && s.push(
    `  Prompt sections=${a.prompt.sectionCount} chars=${a.prompt.packageChars} memoryChars=${a.prompt.memoryContextChars}`
  ), a.tokens !== null && s.push(
    `  Tokens prompt=${a.tokens.promptTokens} completion=${a.tokens.completionTokens} total=${a.tokens.totalTokens}`
  ), a.memory !== null && s.push(
    `  Memory facts=${a.memory.facts} preferences=${a.memory.preferences} constraints=${a.memory.constraints} active=${a.memory.activeItems}`
  ), ((u = a.provider) == null ? void 0 : u.errorCode) !== null && a.provider !== null ? s.push(`  ProviderError ${a.provider.errorCode}`) : a.errorCode !== null && s.push(`  Error ${a.errorCode}`), console.info(s.join(`
`));
}
function Nw(a) {
  let o = 0, i = 0;
  for (const s of a.sections)
    o += s.content.length, s.id === "decision-memory" && (i = s.content.length);
  return Object.freeze({
    packageChars: o,
    sectionCount: a.sections.length,
    memoryContextChars: i
  });
}
function Tw(a) {
  return Object.freeze({
    facts: a.facts.length,
    preferences: a.preferences.length,
    constraints: a.constraints.length,
    goals: a.goals.length,
    concerns: a.concerns.length,
    acceptedOptions: a.acceptedOptions.length,
    rejectedOptions: a.rejectedOptions.length
  });
}
function Rw(a) {
  return a.facts.length + a.preferences.length + a.constraints.length + a.goals.length + a.concerns.length + a.acceptedOptions.length + a.rejectedOptions.length;
}
class nh {
  constructor(o = {}) {
    q(this, "enabled");
    q(this, "sessionId");
    q(this, "conversationId");
    q(this, "records", []);
    this.enabled = o.enabled ?? !0, this.sessionId = o.sessionId ?? "unknown", this.conversationId = o.conversationId ?? this.sessionId;
  }
  isEnabled() {
    return this.enabled;
  }
  record(o) {
    this.enabled && this.records.push(Object.freeze({ ...o }));
  }
  getRecords() {
    return this.records;
  }
  getLastRecord() {
    return this.records[this.records.length - 1] ?? null;
  }
  clear() {
    this.records.length = 0;
  }
  /** One conversation = one exportable JSON document. */
  toExport() {
    return Object.freeze({
      sessionId: this.sessionId,
      conversationId: this.conversationId,
      exportedAt: Date.now(),
      messageCount: this.records.length,
      records: Object.freeze([...this.records])
    });
  }
  /** Deterministic JSON for replay / regression / anonymized sharing. */
  exportJSON(o = !0) {
    return JSON.stringify(this.toExport(), null, o ? 2 : void 0);
  }
}
function ah(a) {
  return new nh(a);
}
function kw(a = {}) {
  return new nh({ ...a, enabled: !1 });
}
function el(a, o, i) {
  var s;
  return (s = a[o].find((u) => u.key === i)) == null ? void 0 : s.value;
}
function rh(a) {
  if (typeof a == "number" && Number.isFinite(a))
    return a;
  if (typeof a == "string") {
    const o = Number.parseFloat(a.replace(/\s/g, "").replace(",", "."));
    return Number.isFinite(o) ? o : null;
  }
  return null;
}
function Wp(a) {
  return typeof a == "string" && a.length > 0 ? a : typeof a == "number" || typeof a == "boolean" ? String(a) : null;
}
function td(a, o) {
  const i = a[o];
  if (typeof i == "number" && Number.isFinite(i))
    return i;
  if (typeof i == "string") {
    const s = Number.parseFloat(i.replace(/\s/g, "").replace(",", "."));
    return Number.isFinite(s) ? s : null;
  }
  return null;
}
function Cw(a, o) {
  const i = a[o];
  return typeof i == "string" && i.length > 0 ? i : null;
}
const Iw = {
  id: "budget-conflict",
  apply(a) {
    const o = rh(el(a.memory, "constraints", "budget")), i = td(a.object.attributes, "price");
    return o === null || i === null ? {} : o < i ? {
      violatedConstraints: [
        `budget:${o}<price:${i}`
      ],
      reasoning: [
        "Rozpočet uživatele je nižší než cena objektu — označeno jako konflikt."
      ],
      avoidedOptions: [
        {
          id: "purchase-at-listed-price",
          label: "Koupě za uvedenou cenu bez úpravy"
        }
      ]
    } : {
      matchedPreferences: [`budget-fits-price:${o}>=${i}`],
      reasoning: [
        "Rozpočet uživatele pokrývá cenu objektu."
      ]
    };
  }
}, eb = /* @__PURE__ */ new Set([
  "energy",
  "operating-costs",
  "provozni-naklady"
]), Mw = {
  id: "energy-priority",
  apply(a) {
    const o = a.decision.focusPriority, i = a.decision.selectedPriorities;
    if (!(o !== null && eb.has(o) || i.some((h) => eb.has(h))))
      return {};
    const u = Cw(
      a.object.attributes,
      "energyClass"
    ), f = [
      {
        id: "energy:efficiency",
        label: "Energetická efektivita"
      },
      {
        id: "energy:operating-costs",
        label: "Nízké provozní náklady"
      }
    ], p = [
      "Priorita provozních nákladů / energie — zvýšit váhu energetické efektivity."
    ];
    return u !== null && p.push(`Objekt má energetickou třídu ${u}.`), {
      recommendedOptions: f,
      matchedPreferences: ["priority:energy"],
      reasoning: p
    };
  }
}, Dw = {
  id: "family-size",
  apply(a) {
    const o = rh(
      el(a.memory, "facts", "familySize")
    );
    if (o === null || o < 3)
      return {};
    const i = td(a.object.attributes, "rooms"), s = td(
      a.object.attributes,
      "usableArea"
    ), u = [
      {
        id: "layout:family",
        label: "Dispozice vhodná pro rodinu"
      }
    ], f = [
      `Domácnost má ${o} osob — preferovat rodinnou dispozici.`
    ];
    return i !== null && i < 4 && o >= 4 && f.push(
      `Objekt má jen ${i} pokojů při velikosti domácnosti ${o}.`
    ), s !== null && s < 100 && o >= 4 && f.push(
      `Užitná plocha ${s} m² může být pro ${o} osob těsná.`
    ), {
      recommendedOptions: u,
      matchedPreferences: [`familySize:${o}`],
      reasoning: f
    };
  }
}, tb = "heat-pump", Uw = {
  id: "heating-preference",
  apply(a) {
    const o = Wp(
      el(a.memory, "rejectedOptions", "heating")
    );
    return Wp(
      el(a.memory, "acceptedOptions", "heating")
    ) === tb ? {
      recommendedOptions: [
        {
          id: "heating:heat-pump",
          label: "Tepelné čerpadlo"
        }
      ],
      matchedPreferences: ["heating:heat-pump:accepted"],
      reasoning: [
        "Uživatel akceptoval tepelné čerpadlo — lze jej zahrnout do doporučení."
      ]
    } : o === tb ? {
      avoidedOptions: [
        {
          id: "heating:heat-pump",
          label: "Tepelné čerpadlo"
        }
      ],
      matchedPreferences: ["heating:heat-pump:rejected"],
      reasoning: [
        "Uživatel odmítl tepelné čerpadlo — neargumentovat jeho výhodami."
      ]
    } : {};
  }
}, Lw = Object.freeze([
  Iw,
  Uw,
  Mw,
  Dw
]);
class Hw {
  constructor(o = {}) {
    q(this, "rules");
    this.rules = o.rules ?? Lw;
  }
  recommend(o) {
    const i = {
      memory: o.memory,
      object: o.object,
      decision: o.decision
    }, s = [], u = [], f = [], p = [], h = [], y = /* @__PURE__ */ new Set(), g = /* @__PURE__ */ new Set();
    for (const E of this.rules) {
      const O = E.apply(i);
      for (const z of O.recommendedOptions ?? [])
        !y.has(z.id) && !g.has(z.id) && (y.add(z.id), s.push(z));
      for (const z of O.avoidedOptions ?? [])
        if (!g.has(z.id)) {
          g.add(z.id), u.push(z);
          const D = s.findIndex((R) => R.id === z.id);
          D >= 0 && (s.splice(D, 1), y.delete(z.id));
        }
      for (const z of O.reasoning ?? [])
        f.includes(z) || f.push(z);
      for (const z of O.matchedPreferences ?? [])
        p.includes(z) || p.push(z);
      for (const z of O.violatedConstraints ?? [])
        h.includes(z) || h.push(z);
    }
    return Object.freeze({
      recommendedOptions: Object.freeze([...s]),
      avoidedOptions: Object.freeze([...u]),
      reasoning: Object.freeze([...f]),
      matchedPreferences: Object.freeze([...p]),
      violatedConstraints: Object.freeze([...h])
    });
  }
}
function Bw(a) {
  return new Hw(a);
}
function oh(a = {}) {
  const o = a.attributes ?? {}, i = Object.keys(o).sort(), s = {};
  for (const u of i)
    s[u] = o[u] ?? null;
  return Object.freeze({
    objectId: a.objectId ?? null,
    reference: a.reference ?? null,
    title: a.title ?? null,
    attributes: Object.freeze(s),
    knowledge: a.knowledge ?? Wi(),
    mediaReferences: Object.freeze([...a.mediaReferences ?? []])
  });
}
function Yw(a) {
  const o = [
    "Object Context",
    `objectId: ${a.objectId ?? "null"}`,
    `reference: ${a.reference ?? "null"}`,
    `title: ${a.title ?? "null"}`
  ], i = Object.keys(a.attributes);
  if (i.length === 0)
    o.push("attributes: (none)");
  else {
    o.push("attributes:");
    for (const s of i)
      o.push(`  ${s}: ${String(a.attributes[s])}`);
  }
  if (a.knowledge.entries.length === 0)
    o.push("knowledge: (none)");
  else {
    o.push("knowledge:");
    for (const s of a.knowledge.entries)
      o.push(`  - [${s.id}] ${s.text}`);
  }
  if (a.mediaReferences.length === 0)
    o.push("mediaReferences: (none)");
  else {
    o.push("mediaReferences:");
    for (const s of a.mediaReferences)
      o.push(`  - ${s}`);
  }
  return o.join(`
`);
}
function ih() {
  return Object.freeze({
    facts: Object.freeze([]),
    preferences: Object.freeze([]),
    constraints: Object.freeze([]),
    goals: Object.freeze([]),
    concerns: Object.freeze([]),
    acceptedOptions: Object.freeze([]),
    rejectedOptions: Object.freeze([])
  });
}
const lh = [
  "facts",
  "preferences",
  "constraints",
  "goals",
  "concerns",
  "acceptedOptions",
  "rejectedOptions"
];
class $w {
  constructor(o = {}) {
    q(this, "memory");
    q(this, "seq");
    this.memory = o.initial ?? ih(), this.seq = qw(this.memory);
  }
  /** Read-only historical snapshot. */
  getMemory() {
    return this.memory;
  }
  /**
   * Append AnalysisResult into history.
   * Never deletes. Never overwrites prior rows. Same key may reappear.
   */
  update(o) {
    const i = o.analysis;
    let s = 0, u = 0, f = 0;
    const p = {
      facts: [...this.memory.facts],
      preferences: [...this.memory.preferences],
      constraints: [...this.memory.constraints],
      goals: [...this.memory.goals],
      concerns: [...this.memory.concerns],
      acceptedOptions: [...this.memory.acceptedOptions],
      rejectedOptions: [...this.memory.rejectedOptions]
    };
    for (const h of lh) {
      const y = new Set(
        p[h].map((g) => g.key)
      );
      for (const g of i[h]) {
        const E = Vw(g, () => (this.seq += 1, this.seq));
        if (E === null) {
          u += 1;
          continue;
        }
        y.has(E.key) && (f += 1), p[h].push(E), y.add(E.key), s += 1;
      }
    }
    return this.memory = Object.freeze({
      facts: Object.freeze(p.facts),
      preferences: Object.freeze(p.preferences),
      constraints: Object.freeze(p.constraints),
      goals: Object.freeze(p.goals),
      concerns: Object.freeze(p.concerns),
      acceptedOptions: Object.freeze(p.acceptedOptions),
      rejectedOptions: Object.freeze(p.rejectedOptions)
    }), Object.freeze({ added: s, skipped: u, duplicated: f });
  }
}
function Gw(a) {
  return new $w(a);
}
function qw(a) {
  let o = 0;
  for (const i of lh)
    for (const s of a[i])
      s.at > o && (o = s.at);
  return o;
}
function Vw(a, o) {
  return typeof a.key != "string" || a.key.trim().length === 0 || !Fw(a.value) ? null : Object.freeze({
    key: a.key.trim(),
    value: a.value,
    at: o()
  });
}
function Fw(a) {
  return typeof a == "string" || typeof a == "number" || typeof a == "boolean";
}
class Xw {
  resolve(o) {
    const i = Pw(
      o.acceptedOptions,
      o.rejectedOptions
    );
    return Object.freeze({
      facts: Object.freeze(co(o.facts)),
      preferences: Object.freeze(co(o.preferences)),
      constraints: Object.freeze(co(o.constraints)),
      goals: Object.freeze(co(o.goals)),
      concerns: Object.freeze(co(o.concerns)),
      acceptedOptions: Object.freeze(i.accepted),
      rejectedOptions: Object.freeze(i.rejected)
    });
  }
}
function co(a) {
  const o = /* @__PURE__ */ new Map();
  for (const i of a) {
    const s = o.get(i.key);
    (s === void 0 || i.at >= s.at) && o.set(i.key, i);
  }
  return [...o.values()].sort((i, s) => i.key < s.key ? -1 : i.key > s.key ? 1 : 0).map((i) => Object.freeze({ key: i.key, value: i.value }));
}
function Pw(a, o) {
  const i = [
    ...a.map((p) => ({ ...p, side: "accepted" })),
    ...o.map((p) => ({ ...p, side: "rejected" }))
  ].sort((p, h) => p.at - h.at || (p.key < h.key ? -1 : p.key > h.key ? 1 : 0)), s = /* @__PURE__ */ new Map();
  for (const p of i)
    s.set(p.key, p);
  const u = [], f = [];
  for (const p of [...s.values()].sort(
    (h, y) => h.key < y.key ? -1 : h.key > y.key ? 1 : 0
  )) {
    const h = Object.freeze({ key: p.key, value: p.value });
    p.side === "accepted" ? u.push(h) : f.push(h);
  }
  return { accepted: u, rejected: f };
}
class Kw {
  constructor(o = {}) {
    q(this, "strategy");
    this.strategy = o.strategy ?? new Xw();
  }
  resolve(o) {
    return this.strategy.resolve(o);
  }
}
function Zw(a) {
  return new Kw(a);
}
function Qi(a) {
  return Zw().resolve(a);
}
const sh = 10;
function Qw(a) {
  const o = a.maxMessages ?? sh, i = o <= 0 ? [] : a.messages.slice(Math.max(0, a.messages.length - o));
  return Object.freeze({
    sessionId: a.sessionId,
    turnCount: a.messages.length,
    recentMessages: Object.freeze(
      i.map(
        (s) => Object.freeze({
          role: s.role,
          content: s.content
        })
      )
    )
  });
}
function Jw(a) {
  const o = [
    "Conversation Context",
    `sessionId: ${a.sessionId}`,
    `turnCount: ${a.turnCount}`
  ];
  if (a.recentMessages.length === 0)
    o.push("recentMessages: (none)");
  else {
    o.push("recentMessages:");
    for (const i of a.recentMessages)
      o.push(`  - ${i.role}: ${i.content}`);
  }
  return o.join(`
`);
}
const Ww = [
  "facts",
  "preferences",
  "constraints",
  "goals",
  "concerns",
  "acceptedOptions",
  "rejectedOptions"
], eS = {
  facts: "Facts",
  preferences: "Preferences",
  constraints: "Constraints",
  goals: "Goals",
  concerns: "Concerns",
  acceptedOptions: "Accepted Options",
  rejectedOptions: "Rejected Options"
};
function ch(a) {
  return Qi(a);
}
function tS(a) {
  const o = nS(a) ? a : ch(a), i = ["Decision Memory"];
  for (const s of Ww) {
    const u = eS[s], f = o[s];
    if (f.length === 0)
      i.push(`${u}: (none)`);
    else {
      i.push(`${u}:`);
      for (const p of f)
        i.push(`  ${p.key}: ${aS(p.value)}`);
    }
  }
  return i.join(`
`);
}
function nS(a) {
  const o = a.facts[0] ?? a.preferences[0] ?? a.constraints[0] ?? a.goals[0] ?? a.concerns[0] ?? a.acceptedOptions[0] ?? a.rejectedOptions[0];
  return o === void 0 ? !0 : !("at" in o);
}
function aS(a) {
  return typeof a == "number" ? Number.isFinite(a) ? String(a) : "null" : String(a);
}
function rS(a) {
  const o = ["Recommendation Context"];
  return o.push(
    uo(
      "recommendedOptions",
      a.recommendedOptions.map((i) => `${i.id}: ${i.label}`)
    )
  ), o.push(
    uo(
      "avoidedOptions",
      a.avoidedOptions.map((i) => `${i.id}: ${i.label}`)
    )
  ), o.push(uo("reasoning", [...a.reasoning])), o.push(
    uo("matchedPreferences", [...a.matchedPreferences])
  ), o.push(
    uo("violatedConstraints", [...a.violatedConstraints])
  ), o.join(`
`);
}
function uo(a, o) {
  return o.length === 0 ? `${a}: (none)` : `${a}:
${o.map((i) => `  - ${i}`).join(`
`)}`;
}
const Gi = [
  "system",
  "partner-identity",
  "object-context",
  "decision-context",
  "decision-memory",
  "recommendation-context",
  "conversation-context",
  "user-message"
];
function oS(a) {
  return [
    "Decision Context",
    `headline: ${a.headline}`,
    `summary: ${a.summary}`,
    `focusPriority: ${a.focusPriority ?? "null"}`,
    `secondaryPriority: ${a.secondaryPriority ?? "null"}`,
    `selectedPriorities: ${a.selectedPriorities.length === 0 ? "(none)" : a.selectedPriorities.join(", ")}`,
    `recommendations: ${a.recommendations.length === 0 ? "(none)" : a.recommendations.join(" | ")}`
  ].join(`
`);
}
function iS(a) {
  return tS(a);
}
function lS(a) {
  return ["Partner Identity", a].join(`
`);
}
function sS(a) {
  return rS(a);
}
function cS(a) {
  const o = [
    {
      id: "system",
      content: a.systemPrompt.content
    },
    {
      id: "partner-identity",
      content: lS(a.partnerIdentity)
    },
    {
      id: "object-context",
      content: Yw(a.context.object)
    },
    {
      id: "decision-context",
      content: oS(a.context.decision)
    },
    {
      id: "decision-memory",
      content: iS(a.context.memory)
    },
    {
      id: "recommendation-context",
      content: sS(a.context.recommendation)
    },
    {
      id: "conversation-context",
      content: Jw(a.context.conversation)
    },
    {
      id: "user-message",
      content: a.currentUserMessage
    }
  ];
  dS(o);
  const i = [
    ...a.historyMessages.map(
      (s) => Object.freeze({ role: s.role, content: s.content })
    ),
    Object.freeze({
      role: "user",
      content: a.currentUserMessage
    })
  ];
  return Object.freeze({
    systemPrompt: a.systemPrompt,
    context: a.context,
    messages: Object.freeze(i),
    sections: Object.freeze(o)
  });
}
function dS(a) {
  var o, i;
  if (a.length !== Gi.length)
    throw new Error("PromptAssembler: unexpected section count.");
  for (let s = 0; s < Gi.length; s += 1)
    if (((o = a[s]) == null ? void 0 : o.id) !== Gi[s])
      throw new Error(
        `PromptAssembler: section order violation at ${s}: expected ${Gi[s]}, got ${(i = a[s]) == null ? void 0 : i.id}`
      );
}
const uS = [
  "Jsi AI poradce partnera.",
  "Nevymýšlej informace.",
  "Odpovídej pouze z poskytnutého kontextu.",
  "Doporučení ber pouze z Recommendation Context — nevymýšlej nové možnosti.",
  "Vysvětluj a formuluj; nerozhoduj mimo Recommendation Context.",
  "Pokud odpověď neznáš, přiznej to."
];
function mS(a = {}) {
  const o = a.lines ?? uS;
  return pd(o.join(`
`));
}
const fS = "Partner: EMBED / Conis Decision Experience.";
class pS {
  constructor(o = {}) {
    q(this, "partnerIdentity");
    q(this, "maxConversationMessages");
    this.partnerIdentity = o.partnerIdentity ?? fS, this.maxConversationMessages = o.maxConversationMessages ?? sh;
  }
  build(o) {
    const i = o.conversationMessages ?? [], s = o.maxConversationMessages ?? this.maxConversationMessages, u = oh(o.object), f = Qw({
      sessionId: o.sessionId,
      messages: i,
      maxMessages: s
    }), p = ch(o.memory ?? ih()), h = o.recommendation ?? Wb(), y = Wi(), g = Object.freeze({
      decision: o.decision,
      object: u,
      conversation: f,
      memory: p,
      recommendation: h,
      knowledge: y
    }), E = mS({
      lines: o.systemPromptLines
    });
    return cS({
      systemPrompt: E,
      partnerIdentity: o.partnerIdentity ?? this.partnerIdentity,
      context: g,
      currentUserMessage: o.currentUserMessage,
      historyMessages: f.recentMessages
    });
  }
}
function bS(a) {
  return new pS(a);
}
function hS(a, o) {
  const i = o.sections.filter((s) => s.id !== "user-message").map((s) => s.content).join(`

`);
  return Object.freeze({
    sessionId: a,
    systemPrompt: pd(i),
    context: o.context,
    messages: o.messages
  });
}
function bo(a) {
  const o = a;
  return {
    deliveryId: typeof o.id == "string" ? o.id : "unknown",
    model: typeof o.model == "string" ? o.model : null
  };
}
class Vt extends Error {
  constructor(i, s, u) {
    super(s, (u == null ? void 0 : u.cause) !== void 0 ? { cause: u.cause } : void 0);
    q(this, "code");
    q(this, "userMessage");
    this.name = "ConversationError", this.code = i, this.userMessage = s;
  }
}
const yS = {
  missing_api_key: "AI není připravená — chybí API klíč. Kontaktujte provozovatele.",
  timeout: "Odpověď trvala příliš dlouho. Zkuste to prosím znovu.",
  http_error: "Nepodařilo se spojit s AI službou. Zkuste to prosím znovu.",
  invalid_response: "AI vrátila neplatnou odpověď. Zkuste otázku položit znovu.",
  provider_error: "Došlo k chybě při generování odpovědi. Zkuste to prosím znovu.",
  empty_message: "Zpráva je prázdná."
};
function Jt(a) {
  return yS[a];
}
function nb(a) {
  if (a instanceof Vt)
    return a;
  if (Y1(a)) {
    const i = a.code, s = a.diagnostic ?? (i === "missing_api_key" ? Jt(i) : a.message.trim().length > 0 ? a.message : Jt(i));
    return new Vt(i, s, { cause: a });
  }
  const o = gS(a).trim();
  return /missing api key|pass apiKey/i.test(o) ? new Vt(
    "missing_api_key",
    Jt("missing_api_key"),
    { cause: a }
  ) : /timeout|timed out|aborted|vypršelo \(timeout\)/i.test(o) ? new Vt(
    "timeout",
    o.length > 0 ? o : Jt("timeout"),
    { cause: a }
  ) : /invalid_response|empty content|neplatn/i.test(o) ? new Vt(
    "invalid_response",
    o.length > 0 ? o : Jt("invalid_response"),
    { cause: a }
  ) : /network error|Failed to fetch|fetch failed|Síťové spojení|HTTP\s*\d{3}|401 unauthorized|403 forbidden|404|429|insufficient_quota|rate_limit|5\d\d/i.test(
    o
  ) ? new Vt(
    "http_error",
    o.length > 0 ? o : Jt("http_error"),
    { cause: a }
  ) : new Vt(
    "provider_error",
    o.length > 0 ? o : Jt("provider_error"),
    { cause: a }
  );
}
function gS(a) {
  return a instanceof Error ? a.message : typeof a == "string" ? a : String(a);
}
const vS = 3e4;
class xS {
  constructor(o) {
    q(this, "delivery");
    q(this, "analyzer");
    q(this, "memoryService");
    q(this, "promptBuilder");
    q(this, "requestTimeoutMs");
    q(this, "sessionId");
    q(this, "conversationId");
    q(this, "diagnostics");
    q(this, "recorder");
    q(this, "recommendationEngine");
    /** Prior turns only (excludes in-flight user message). */
    q(this, "history", []);
    this.delivery = o.delivery, this.sessionId = o.sessionId ?? SS(), this.conversationId = this.sessionId, this.requestTimeoutMs = o.requestTimeoutMs ?? vS, this.memoryService = o.memoryService ?? Gw(), this.promptBuilder = o.promptBuilder ?? bS(), this.recommendationEngine = o.recommendationEngine ?? Bw(), this.analyzer = o.analyzer ?? Zp(
      Jp({
        llm: { chat: (i) => this.delivery.chat(i) }
      })
    ), this.diagnostics = o.diagnostics === !1 ? Ew() : o.diagnostics ?? th({ enabled: !0 }), this.recorder = o.recorder === !1 ? kw({
      sessionId: this.sessionId,
      conversationId: this.conversationId
    }) : o.recorder ?? ah({
      sessionId: this.sessionId,
      conversationId: this.conversationId,
      enabled: !0
    });
  }
  /** Current Delivery Port. */
  getDelivery() {
    return this.delivery;
  }
  /** Swap Delivery without changing callers. */
  setDelivery(o) {
    this.delivery = o, this.analyzer = Zp(
      Jp({
        llm: { chat: (i) => this.delivery.chat(i) }
      })
    );
  }
  /**
   * Compat: unwrap Direct Adapter Delivery to Adapter port (tests / PT-004).
   * Prefer getDelivery().
   */
  getProvider() {
    return sw(this.delivery) ? this.delivery.adapter : {
      chat: (o) => this.delivery.chat(o)
    };
  }
  /**
   * Compat: wrap Adapter as Direct Adapter Delivery.
   * Prefer setDelivery().
   */
  setProvider(o) {
    this.setDelivery(bd(o));
  }
  getSessionId() {
    return this.sessionId;
  }
  getDiagnostics() {
    return this.diagnostics;
  }
  getRecorder() {
    return this.recorder;
  }
  /** Export full conversation audit JSON (empty when recorder disabled). */
  exportConversationJSON(o = !0) {
    return this.recorder.exportJSON(o);
  }
  getHistory() {
    return this.history;
  }
  getMemory() {
    return this.memoryService.getMemory();
  }
  getResolvedMemory() {
    return Qi(this.memoryService.getMemory());
  }
  chat(o) {
    return this.delivery.chat(o);
  }
  /**
   * Transport a PromptPackage assembled by PromptBuilder.
   * Delivery/Adapter never compose prompts — only receive ChatRequest.
   */
  chatWithPackage(o, i) {
    return this.chat(hS(o, i));
  }
  /**
   * PT-011 — Full conversation turn:
   * Analyzer → DecisionMemoryService → PromptBuilder (ResolvedMemory) → Delivery.
   * PT-012 — Observes latencies / tokens / memory counts without changing results.
   * PT-012 Recorder — optional full audit snapshots for debug / replay.
   */
  async sendMessage(o) {
    var re;
    const i = o.message.trim();
    if (i.length === 0)
      throw new Vt(
        "empty_message",
        Jt("empty_message")
      );
    const s = this.createConversationTrace(), u = va(), f = bo(this.delivery);
    let p = 0, h = 0, y = 0, g = 0, E = 0, O = null, z = null, D = null, R = null, S = null, H = null, W = null, pe = !1;
    const $ = (ue) => {
      pe || !this.recorder.isEnabled() || (pe = !0, this.recorder.record({
        sessionId: s.sessionId,
        messageId: s.messageId,
        timestamp: Date.now(),
        userMessage: i,
        analysis: S,
        resolvedMemory: H,
        promptPackage: W,
        provider: ue.providerId,
        model: ue.model,
        promptTokens: ue.promptTokens,
        completionTokens: ue.completionTokens,
        latency: Xn(u),
        response: ue.response,
        error: ue.error
      }));
    };
    try {
      const ue = va(), V = await this.analyzer.analyze({
        message: i,
        recentMessages: this.history
      });
      S = V, p = Xn(ue), this.diagnostics.emitPhase(s, "analyzer", p);
      const P = va();
      this.memoryService.update({ analysis: V }), h = Xn(P), this.diagnostics.emitPhase(s, "memory", h);
      const _e = this.memoryService.getMemory(), ot = va(), We = Qi(_e);
      H = We, y = Xn(ot), this.diagnostics.emitPhase(s, "resolution", y);
      const Ye = Tw(_e);
      z = Ow({
        ...Ye,
        activeItems: Rw(We),
        resolutionMs: y
      });
      const Te = va(), dt = oh(o.object), xt = this.recommendationEngine.recommend({
        memory: We,
        object: dt,
        decision: o.decision
      }), Ke = this.promptBuilder.build({
        sessionId: this.sessionId,
        decision: o.decision,
        object: o.object,
        memory: _e,
        recommendation: xt,
        conversationMessages: this.history,
        currentUserMessage: i
      });
      W = Ke, g = Xn(Te), this.diagnostics.emitPhase(s, "prompt", g), O = Nw(Ke);
      const C = va();
      let B;
      try {
        B = await ES(
          this.chatWithPackage(this.sessionId, Ke),
          this.requestTimeoutMs
        );
      } catch (x) {
        console.error("AIService: provider error", x), E = Xn(C);
        const T = nb(x);
        throw D = Yc({
          providerId: f.deliveryId,
          model: f.model,
          requestDurationMs: E,
          responseDurationMs: E,
          errorCode: T.code
        }), this.diagnostics.emitPhase(s, "provider", E), this.diagnostics.emitPhase(s, "error", 0), this.finishTurnTrace({
          conversation: s,
          totalStart: u,
          analyzerMs: p,
          memoryMs: h,
          resolutionMs: y,
          promptBuilderMs: g,
          providerMs: E,
          promptTrace: O,
          memoryTrace: z,
          providerTrace: D,
          tokenTrace: null,
          ok: !1,
          errorCode: T.code
        }), $({
          response: null,
          error: T.code,
          promptTokens: null,
          completionTokens: null,
          providerId: f.deliveryId,
          model: f.model
        }), T;
      }
      E = Xn(C), this.diagnostics.emitPhase(s, "provider", E), D = Yc({
        providerId: f.deliveryId,
        model: f.model,
        requestDurationMs: E,
        responseDurationMs: E,
        errorCode: null
      }), R = _w({
        promptTokens: B.usage.promptTokens,
        completionTokens: B.usage.completionTokens,
        totalTokens: B.usage.totalTokens
      });
      const K = B.content.trim();
      if (K.length === 0) {
        const x = new Vt(
          "invalid_response",
          Jt("invalid_response")
        );
        throw this.diagnostics.emitPhase(s, "error", 0), this.finishTurnTrace({
          conversation: s,
          totalStart: u,
          analyzerMs: p,
          memoryMs: h,
          resolutionMs: y,
          promptBuilderMs: g,
          providerMs: E,
          promptTrace: O,
          memoryTrace: z,
          providerTrace: Yc({
            ...D,
            errorCode: x.code
          }),
          tokenTrace: R,
          ok: !1,
          errorCode: x.code
        }), $({
          response: null,
          error: x.code,
          promptTokens: B.usage.promptTokens,
          completionTokens: B.usage.completionTokens,
          providerId: f.deliveryId,
          model: f.model
        }), x;
      }
      this.history = [
        ...this.history,
        Object.freeze({ role: "user", content: i }),
        Object.freeze({ role: "assistant", content: K })
      ];
      const fe = this.memoryService.getMemory(), be = Qi(fe);
      return this.diagnostics.emitPhase(s, "response", 0), this.finishTurnTrace({
        conversation: s,
        totalStart: u,
        analyzerMs: p,
        memoryMs: h,
        resolutionMs: y,
        promptBuilderMs: g,
        providerMs: E,
        promptTrace: O,
        memoryTrace: z,
        providerTrace: D,
        tokenTrace: R,
        ok: !0,
        errorCode: null
      }), $({
        response: K,
        error: null,
        promptTokens: B.usage.promptTokens,
        completionTokens: B.usage.completionTokens,
        providerId: f.deliveryId,
        model: f.model
      }), Object.freeze({
        content: K,
        memory: fe,
        resolvedMemory: be,
        messageId: s.messageId
      });
    } catch (ue) {
      const V = nb(ue);
      throw this.diagnostics.isEnabled() && ((re = this.diagnostics.getLastTrace()) == null ? void 0 : re.conversation.messageId) !== s.messageId && this.finishTurnTrace({
        conversation: s,
        totalStart: u,
        analyzerMs: p,
        memoryMs: h,
        resolutionMs: y,
        promptBuilderMs: g,
        providerMs: E,
        promptTrace: O,
        memoryTrace: z,
        providerTrace: D,
        tokenTrace: R,
        ok: !1,
        errorCode: V.code
      }), $({
        response: null,
        error: V.code,
        promptTokens: (R == null ? void 0 : R.promptTokens) ?? null,
        completionTokens: (R == null ? void 0 : R.completionTokens) ?? null,
        providerId: f.deliveryId,
        model: f.model
      }), V;
    }
  }
  createConversationTrace() {
    return Object.freeze({
      sessionId: this.sessionId,
      conversationId: this.conversationId,
      messageId: jS()
    });
  }
  finishTurnTrace(o) {
    const i = Object.freeze({
      conversation: o.conversation,
      latency: Aw({
        analyzerMs: o.analyzerMs,
        memoryMs: o.memoryMs,
        resolutionMs: o.resolutionMs,
        promptBuilderMs: o.promptBuilderMs,
        providerMs: o.providerMs,
        totalMs: Xn(o.totalStart)
      }),
      prompt: o.promptTrace,
      provider: o.providerTrace,
      tokens: o.tokenTrace,
      memory: o.memoryTrace,
      ok: o.ok,
      errorCode: o.errorCode,
      at: Date.now()
    });
    this.diagnostics.emitTurn(i);
  }
}
function wS(a, o = {}) {
  return new xS({ delivery: a, ...o });
}
function SS() {
  return typeof crypto < "u" && "randomUUID" in crypto ? `embed-${crypto.randomUUID()}` : `embed-${Date.now().toString(36)}`;
}
function jS() {
  return typeof crypto < "u" && "randomUUID" in crypto ? `msg-${crypto.randomUUID()}` : `msg-${Date.now().toString(36)}`;
}
function va() {
  return typeof performance < "u" && typeof performance.now == "function" ? performance.now() : Date.now();
}
function Xn(a) {
  return Math.max(0, Math.round(va() - a));
}
function ES(a, o) {
  return new Promise((i, s) => {
    const u = setTimeout(() => {
      s(
        new Vt(
          "timeout",
          Jt("timeout")
        )
      );
    }, o);
    a.then(
      (f) => {
        clearTimeout(u), i(f);
      },
      (f) => {
        clearTimeout(u), s(f);
      }
    );
  });
}
class AS {
  constructor(o) {
    q(this, "id");
    q(this, "model", null);
    q(this, "deliveryUrl");
    q(this, "fetchImpl");
    const i = o.deliveryUrl.trim().replace(/\/$/, "");
    if (i.length === 0)
      throw new Pe(
        "missing_api_key",
        "RemoteDelivery: deliveryUrl is required for published mode."
      );
    this.deliveryUrl = i, this.id = o.id ?? "published-remote", this.fetchImpl = o.fetch ?? null;
  }
  async chat(o) {
    let i;
    try {
      i = await this.request(`${this.deliveryUrl}/v1/chat`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          accept: "application/json"
        },
        body: JSON.stringify(o)
      });
    } catch (f) {
      throw zS(f);
    }
    const s = await i.text();
    if (!i.ok)
      throw NS(i.status, s);
    const u = OS(s);
    if (u === null)
      throw new Pe(
        "invalid_response",
        "AI Delivery edge returned an invalid response.",
        {
          diagnostic: "AI Delivery edge returned an invalid response (invalid_response)."
        }
      );
    return u;
  }
  request(o, i) {
    return this.fetchImpl !== null ? this.fetchImpl(o, i) : typeof globalThis.fetch != "function" ? Promise.reject(
      new Pe(
        "provider_error",
        "RemoteDelivery: fetch is not available in this environment."
      )
    ) : globalThis.fetch(o, i);
  }
}
function _S(a) {
  return new AS(a);
}
function OS(a) {
  if (a.trim().length === 0)
    return null;
  try {
    const o = JSON.parse(a);
    return typeof o.content != "string" || o.usage === void 0 || typeof o.usage.promptTokens != "number" || typeof o.usage.completionTokens != "number" || typeof o.usage.totalTokens != "number" || typeof o.finishReason != "string" ? null : Object.freeze({
      content: o.content,
      usage: Object.freeze({
        promptTokens: o.usage.promptTokens,
        completionTokens: o.usage.completionTokens,
        totalTokens: o.usage.totalTokens
      }),
      finishReason: o.finishReason
    });
  } catch {
    return null;
  }
}
function zS(a) {
  const o = a instanceof Error ? a.message : String(a);
  return (a instanceof Error ? a.name : "") === "AbortError" || /timeout|timed out|aborted/i.test(o) ? new Pe(
    "timeout",
    "AI Delivery edge request timed out.",
    {
      diagnostic: "Spojení s AI službou vypršelo (timeout). Zkuste to prosím znovu.",
      cause: a
    }
  ) : /Failed to fetch|NetworkError|fetch failed|network/i.test(o) ? new Pe(
    "http_error",
    "AI Delivery edge network error.",
    {
      diagnostic: "Nepodařilo se spojit s AI službou (network error). Zkuste to prosím znovu.",
      cause: a
    }
  ) : new Pe(
    "provider_error",
    o.length > 0 ? o : "AI Delivery edge request failed.",
    { cause: a }
  );
}
function NS(a, o) {
  if (a === 401 || a === 403)
    return new Pe(
      "http_error",
      `AI Delivery edge refused the request (${a}).`,
      {
        diagnostic: "AI služba odmítla požadavek. Kontaktujte provozovatele."
      }
    );
  if (a === 404)
    return new Pe(
      "missing_api_key",
      "AI Delivery edge is not configured (404)."
    );
  if (a === 503 || a === 501)
    return new Pe(
      "missing_api_key",
      "AI Delivery edge is not configured."
    );
  const i = o.trim().slice(0, 200);
  return new Pe(
    "http_error",
    `AI Delivery edge failed (HTTP ${a}).`,
    {
      diagnostic: i.length > 0 ? `Nepodařilo se spojit s AI službou (HTTP ${a}).` : void 0
    }
  );
}
const TS = "AI Delivery není nakonfigurovaná. Kontaktujte provozovatele.";
function ab(a = "disabled") {
  const o = a === "missing_local_credentials" ? null : TS;
  return bd({
    id: "not-configured",
    async chat(s) {
      throw new Pe(
        "missing_api_key",
        "AI Delivery is not configured for this host.",
        o !== null ? { diagnostic: o } : void 0
      );
    }
  });
}
function RS(a = {}) {
  const o = CS(a), i = a.mode ?? "auto";
  return i === "published" ? {
    mode: o.length > 0 ? "published" : "disabled",
    deliveryUrl: o.length > 0 ? o : null
  } : i === "local" ? { mode: "local", deliveryUrl: null } : i === "disabled" ? { mode: "disabled", deliveryUrl: null } : o.length > 0 ? { mode: "published", deliveryUrl: o } : DS() ? { mode: "disabled", deliveryUrl: null } : { mode: "local", deliveryUrl: null };
}
function kS(a = {}) {
  const o = RS(a), i = dw();
  if (o.mode === "published" && o.deliveryUrl !== null) {
    const f = _S({
      deliveryUrl: o.deliveryUrl,
      id: "published-remote"
    });
    return qi({
      mode: o.mode,
      implementation: bo(f).deliveryId,
      reason: "public deliveryUrl resolved",
      deliveryUrl: o.deliveryUrl,
      credentials: i
    }), f;
  }
  if (o.mode === "local") {
    const f = cw();
    if (f !== null)
      return qi({
        mode: o.mode,
        implementation: bo(f).deliveryId,
        reason: "local credentials present",
        deliveryUrl: null,
        credentials: i
      }), f;
    const p = ab(
      "missing_local_credentials"
    );
    return qi({
      mode: o.mode,
      implementation: bo(p).deliveryId,
      reason: "local credentials missing",
      deliveryUrl: null,
      credentials: i
    }), p;
  }
  const s = a.mode === "disabled" ? "disabled" : "missing_delivery_url", u = ab(s);
  return qi({
    mode: o.mode,
    implementation: bo(u).deliveryId,
    reason: s === "missing_delivery_url" ? "published host without deliveryUrl" : "delivery explicitly disabled",
    deliveryUrl: o.deliveryUrl,
    credentials: i
  }), u;
}
function CS(a) {
  var u;
  const o = ((u = a.deliveryUrl) == null ? void 0 : u.trim()) ?? "";
  if (o.length > 0)
    return o.replace(/\/$/, "");
  const i = IS();
  if (i.length > 0)
    return i;
  const s = MS();
  return s.length > 0 ? s.replace(/\/$/, "") : "";
}
function IS() {
  var i, s;
  if (typeof globalThis > "u")
    return "";
  const o = (s = (i = globalThis.window) == null ? void 0 : i.__EMBED_AI_DELIVERY__) == null ? void 0 : s.deliveryUrl;
  return typeof o != "string" || o.trim().length === 0 ? "" : o.trim().replace(/\/$/, "");
}
function MS() {
  try {
    const a = "https://embed-ai-delivery.northern-paste.workers.dev";
    return typeof a != "string" || a.trim().length === 0 ? "" : a.trim();
  } catch {
    return "";
  }
}
function DS() {
  try {
    return !0;
  } catch {
    return !1;
  }
}
function US() {
  try {
    return !1;
  } catch {
    return !1;
  }
}
function qi(a) {
  US() && console.info(
    [
      "[AI Delivery]",
      `mode=${a.mode}`,
      `deliveryUrl=${a.deliveryUrl ?? "<missing>"}`,
      `implementation=${a.implementation}`,
      `reason=${a.reason}`,
      `viteOpenAiKey=${a.credentials.viteApiKey}`,
      `processOpenAiKey=${a.credentials.processApiKey}`
    ].join(" ")
  );
}
function cr() {
  const { experience: a } = ct(), o = ox(
    a.context.decision.priorityIds,
    0
  );
  return ax(o);
}
const LS = "w-[690px]", dh = "w-[680px]", HS = "grid min-h-faq-ai grid-cols-[690px_minmax(0,1fr)] grid-rows-[auto_auto_auto_auto] items-start gap-x-section content-start mobile:grid-cols-1 mobile:grid-rows-none", BS = "col-start-1 row-start-1 row-span-2 box-border flex flex-col gap-[30px] pt-section pl-section pr-0 mobile:col-span-1 mobile:row-auto mobile:row-span-1", YS = "relative z-20 col-start-2 row-start-1 box-border overflow-visible bg-[#FFFFFF] pt-section pl-[14px] pr-[20px] mobile:col-span-1 mobile:row-auto", $S = "col-start-2 row-start-2 box-border flex min-h-0 flex-col overflow-hidden self-stretch pl-[14px] pr-[20px] mobile:col-span-1 mobile:row-auto", GS = "col-start-2 row-start-3 box-border pl-[14px] pr-[20px] mobile:col-span-1 mobile:row-auto", qS = "col-start-2 row-start-4 box-border pb-section pl-[14px] pr-[20px] mobile:col-span-1 mobile:row-auto", VS = "box-border flex h-full min-h-0 w-[682px] max-w-[682px] min-w-0 shrink-0 flex-col overflow-hidden", FS = "shrink-0";
function xo(...a) {
  return a.filter(Boolean).join(" ");
}
const uh = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-embed-brand-gold/35 focus-visible:ring-offset-2", XS = "duration-200 ease-out", PS = {
  md: "rounded-[8px] px-8 py-4 text-base",
  sm: "rounded-[8px] px-6 py-3 text-sm",
  full: "w-full rounded-[8px] px-6 py-3 text-sm"
};
function sl(a) {
  const o = a.size ?? "md", i = a.state ?? "default";
  return xo(
    "inline-flex items-center justify-center text-center font-sans font-medium",
    XS,
    uh,
    PS[o],
    "bg-[#001930] text-[#FFFFFF]",
    i === "disabled" && "cursor-not-allowed",
    a.className
  );
}
function KS({
  children: a,
  size: o = "md",
  className: i,
  disabled: s,
  type: u = "button",
  ...f
}) {
  return /* @__PURE__ */ d.jsx(
    "button",
    {
      type: u,
      disabled: s,
      className: sl({
        size: o,
        state: s ? "disabled" : "default",
        className: i
      }),
      ...f,
      children: a
    }
  );
}
function mh({
  children: a,
  size: o = "md",
  className: i,
  href: s,
  ...u
}) {
  return /* @__PURE__ */ d.jsx(
    "a",
    {
      href: s,
      className: sl({ size: o, state: "default", className: i }),
      ...u,
      children: a
    }
  );
}
const ZS = {
  default: "h-[50px] rounded-[8px] bg-[#F7F6F4]",
  framed: "h-[50px] rounded-[8px] border border-embed-border-default bg-[#F7F6F4]"
};
function hd(a) {
  const o = a.variant ?? "default";
  return xo(
    "box-border w-full px-4 text-sm text-embed-foreground-primary placeholder:text-embed-foreground-primary/40",
    ZS[o],
    a.className
  );
}
function QS(a) {
  return xo(
    hd({ variant: "framed", className: "px-3" }),
    uh,
    a == null ? void 0 : a.className
  );
}
const $c = U.forwardRef(function({ variant: o = "default", className: i, ...s }, u) {
  return /* @__PURE__ */ d.jsx("input", { ref: u, className: hd({ variant: o, className: i }), ...s });
}), JS = U.forwardRef(function({ variant: o = "default", className: i, ...s }, u) {
  return /* @__PURE__ */ d.jsx("textarea", { ref: u, className: hd({ variant: o, className: i }), ...s });
});
U.forwardRef(
  function({ className: o, ...i }, s) {
    return /* @__PURE__ */ d.jsx("input", { ref: s, className: QS({ className: o }), ...i });
  }
);
const WS = {
  user: "rounded-[8px] border border-embed-border-default",
  assistant: "rounded-[8px] border border-embed-border-default"
};
function ej(a, o) {
  return xo(
    "max-w-[85%] px-4 py-3 text-sm text-embed-foreground-primary",
    WS[a],
    o
  );
}
const tj = {
  /** Client query — light gray */
  user: { backgroundColor: Ie.surface.card },
  /** AI reply — dark gray */
  assistant: { backgroundColor: Ie.surface.interactive }
};
function nj({ role: a, children: o, time: i, className: s }) {
  const u = a === "user";
  return /* @__PURE__ */ d.jsxs("div", { className: u ? "flex flex-col items-end" : "flex flex-col items-start", children: [
    /* @__PURE__ */ d.jsx("div", { className: ej(a, s), style: tj[a], children: o }),
    i ? /* @__PURE__ */ d.jsx("span", { className: "mt-1 text-xs text-embed-foreground-primary/40", children: i }) : null
  ] });
}
const aj = {
  elevated: "bg-embed-surface-elevated",
  cream: "bg-embed-surface-card",
  inset: "rounded-[8px] border border-embed-border-default bg-embed-surface-inset px-section py-5",
  row: "bg-embed-surface-card"
};
function rj(a) {
  const o = a.variant ?? "cream";
  return xo(aj[o], a.className);
}
function oj({
  children: a,
  variant: o = "cream",
  className: i,
  as: s = "div",
  ...u
}) {
  return /* @__PURE__ */ d.jsx(s, { className: rj({ variant: o, className: i }), ...u, children: a });
}
function ij({ role: a, text: o, time: i }) {
  return /* @__PURE__ */ d.jsx(nj, { role: a, time: i, children: o });
}
function lj({ messages: a }) {
  const o = U.useRef(null);
  return U.useEffect(() => {
    const i = o.current;
    i !== null && (i.scrollTop = i.scrollHeight);
  }, [a]), /* @__PURE__ */ d.jsx(
    "div",
    {
      ref: o,
      className: "flex min-h-0 flex-1 flex-col space-y-section overflow-x-hidden overflow-y-auto",
      children: a.map((i) => /* @__PURE__ */ d.jsx(
        ij,
        {
          role: i.role,
          text: i.text,
          time: i.time
        },
        i.id
      ))
    }
  );
}
function sj() {
  return /* @__PURE__ */ d.jsx("p", { className: "mt-section text-xs leading-relaxed text-embed-foreground-primary/45", children: "AI průvodce poskytuje obecné informace. Pro závazné odpovědi kontaktujte našeho specialistu." });
}
const cj = { BASE_URL: "/", DEV: !1, MODE: "production", PROD: !0, SSR: !1, VITE_AI_DELIVERY_URL: "https://embed-ai-delivery.northern-paste.workers.dev", VITE_OPENAI_API_KEY: "" };
let Vi = null;
function dj() {
  if (Vi !== null)
    return Vi;
  const a = rb("VITE_AI_DIAGNOSTICS") !== "0", o = rb("VITE_AI_RECORDER") !== "0", i = typeof crypto < "u" && "randomUUID" in crypto ? `embed-${crypto.randomUUID()}` : `embed-${Date.now().toString(36)}`;
  return Vi = wS(kS(), {
    sessionId: i,
    diagnostics: th({
      enabled: a,
      console: a
    }),
    recorder: ah({
      sessionId: i,
      conversationId: i,
      enabled: o
    })
  }), Vi;
}
function rb(a) {
  const o = cj[a];
  if (!(typeof o != "string" || o.trim().length === 0))
    return o.trim();
}
const wo = [
  { id: "energy", title: "Energie" },
  { id: "operating-costs", title: "Provozní náklady" },
  { id: "layout", title: "Dispozice" },
  { id: "privacy", title: "Soukromí" },
  { id: "design", title: "Design" },
  { id: "quality", title: "Kvalita" },
  { id: "plot", title: "Pozemek" },
  { id: "investment", title: "Investice" },
  { id: "maintenance", title: "Údržba" },
  { id: "flexibility", title: "Flexibilita" }
], ob = 3, uj = 0.5, fh = Object.freeze(
  Object.fromEntries(wo.map((a) => [a.id, a.title]))
), ph = Object.freeze({
  "primary-explanation": "Hlavní vysvětlení",
  "supporting-argument": "Podpůrný argument",
  recommendation: "Doporučení",
  "semantic-transition": "Přechod",
  "next-decision-step": "Další krok"
}), mj = Object.freeze({
  active: "Aktivní",
  pending: "Čeká",
  completed: "Hotovo"
}), fj = Object.freeze({
  explain: "Vysvětlení",
  acknowledge: "Potvrzení",
  support: "Podpora",
  recommend: "Doporučení",
  consider: "Ke zvážení",
  follow: "Navazující krok",
  transition: "Přechod",
  advance: "Pokračování",
  inspect: "Prohlédnout",
  media: "Médium"
}), pj = Object.freeze({
  "explore-house-structure": "Prozkoumejte strukturu domu",
  "primary-living-volume": "Obývací prostor je jádrem denního života",
  "daily-workflow-core": "Kuchyně jako centrum denního provozu",
  "private-rest-zone": "Klidová zóna pro odpočinek",
  "service-wet-zone": "Servisní mokrá zóna",
  "flexible-secondary-space": "Flexibilní vedlejší prostor",
  "value-led-exploration": "Orientace podle hodnoty a efektivity",
  "outdoor-led-exploration": "Orientace podle kontaktu s exteriérem",
  "space-led-exploration": "Orientace podle prostoru",
  "privacy-led-exploration": "Orientace podle soukromí",
  "day-zone-openness": "Otevřenost denní zóny",
  "family-gathering": "Prostor pro rodinné setkávání",
  "workflow-efficiency": "Efektivita denního provozu",
  "natural-light": "Přirozené světlo",
  privacy: "Soukromí",
  "morning-light": "Ranní světlo",
  finishes: "Povrchy a detaily",
  storage: "Úložný prostor",
  flexibility: "Flexibilita",
  growth: "Prostor pro růst",
  "value-efficiency": "Poměr hodnoty a nákladů",
  "outdoor-connection": "Propojení s exteriérem",
  "spatial-generosity": "Prostorová velkorysost",
  "inspect-layout": "Prozkoumejte dispozici",
  "compare-rooms": "Porovnejte místnosti",
  "inspect-value-drivers": "Prohlédněte si, co tvoří hodnotu domu",
  "inspect-outdoor-connection": "Podívejte se na propojení s exteriérem",
  "inspect-spatial-volume": "Prozkoumejte prostorovou nabídku",
  "inspect-privacy-zones": "Prozkoumejte zóny soukromí",
  "compare-priority-tradeoffs": "Porovnejte kompromisy priorit",
  "emphasize-value": "Důraz na hodnotu",
  "emphasize-outdoor": "Důraz na exteriér",
  "emphasize-space": "Důraz na prostor",
  "emphasize-privacy": "Důraz na soukromí",
  "priority-generic": "Obecné priority",
  "media:hero": "Hlavní pohled",
  "media:video": "Video",
  "media:gallery": "Galerie",
  "media:thumbnail": "Náhledy",
  "media:document": "Dokumenty",
  hero: "Hlavní pohled",
  video: "Video",
  gallery: "Galerie",
  thumbnail: "Náhledy",
  document: "Dokumenty"
}), Ue = Object.freeze({
  title: "Rozhodovací terminál",
  story: "Příběh rozhodnutí",
  moves: "Kroky rozhodnutí",
  drivers: "Co rozhodnutí ovlivňuje",
  selectedPriorities: "Vybrané priority",
  noPriorities: "Zatím bez priorit",
  strongInfluence: "Silný vliv",
  supportingArguments: "Podpůrné argumenty",
  rationale: "Odůvodnění",
  outcomes: "Výsledek a kompromisy",
  outcomeStatus: "Výsledek",
  recommendation: "Doporučení",
  strengths: "Silné stránky",
  considerations: "Na co si dát pozor",
  confidence: "Jistota",
  focus: "Fokus",
  nextStep: "Další krok",
  storyNext: "Další krok příběhu",
  detailToggle: "Podrobný průběh rozhodnutí"
});
function tl(a) {
  return a.replace(/[_:]+/g, " ").replace(/-/g, " ").trim();
}
function ge(a) {
  const o = a.trim();
  if (o.length === 0)
    return o;
  const i = pj[o];
  if (i !== void 0)
    return i;
  const s = fh[o];
  if (s !== void 0)
    return s;
  const u = ph[o];
  if (u !== void 0)
    return u;
  if (o.startsWith("focus-room:"))
    return "Přechod k místnosti";
  if (o.startsWith("focus-signal:")) {
    const p = o.slice(13);
    return `Přechod: ${ge(p)}`;
  }
  const f = o.indexOf(":");
  if (f > 0) {
    const p = o.slice(0, f), h = o.slice(f + 1), y = fj[p], g = ge(h);
    return y !== void 0 ? `${y}: ${g}` : `${tl(p)}: ${g}`;
  }
  return tl(o);
}
function bj(a) {
  return ph[a] ?? tl(a);
}
function hj(a) {
  return mj[a] ?? tl(a);
}
function xn(a) {
  return fh[a] ?? ge(a);
}
function yj(a) {
  const { outcome: o } = a;
  return Object.freeze({
    id: a.id,
    recommendation: o.recommendation,
    status: o.status,
    confidence: o.confidence,
    rationale: o.rationale,
    unresolvedQuestions: o.unresolvedQuestions,
    recommendedNextAction: o.recommendedNextAction,
    completedMoveIds: o.completedMoveIds,
    unresolvedMoveIds: o.unresolvedMoveIds
  });
}
function bh(a) {
  const { outcome: o } = a;
  return Object.freeze({
    id: a.id,
    intro: o.recommendation,
    faqItems: Object.freeze(
      o.rationale.map(
        (i, s) => Object.freeze({
          id: `${a.id}:rationale:${s}`,
          question: i,
          answer: o.status
        })
      )
    )
  });
}
function gj(a) {
  return bh(a).faqItems.map(
    (o) => Object.freeze({
      id: o.id,
      question: ge(o.question),
      answer: lr(o.answer)
    })
  );
}
function ib(a) {
  return ge(bh(a).intro);
}
function vj({ disabled: a = !1, onClick: o }) {
  return /* @__PURE__ */ d.jsx(
    KS,
    {
      disabled: a,
      onClick: o,
      size: "sm",
      className: "h-[50px] shrink-0 border-0 px-6 py-0 shadow-none",
      children: "Odeslat"
    }
  );
}
function xj({ value: a, onChange: o, onSend: i, disabled: s = !1 }) {
  const u = !s && a.trim().length > 0;
  return /* @__PURE__ */ d.jsxs("div", { className: `${FS} ${dh} flex items-stretch gap-3`, children: [
    /* @__PURE__ */ d.jsx(
      "div",
      {
        className: "flex h-[50px] min-w-0 flex-1 items-center overflow-hidden rounded-[8px] border bg-transparent px-section",
        style: { borderColor: Ie.action.accent },
        children: /* @__PURE__ */ d.jsx(
          JS,
          {
            rows: 1,
            value: a,
            placeholder: "Zadejte svůj dotaz",
            disabled: s,
            onChange: (f) => o(f.target.value),
            onKeyDown: (f) => {
              f.key === "Enter" && !f.shiftKey && u && (f.preventDefault(), i());
            },
            className: "h-[50px] min-h-[50px] w-full min-w-0 resize-none border-0 bg-transparent px-0 py-0 leading-[50px]"
          }
        )
      }
    ),
    /* @__PURE__ */ d.jsx(vj, { disabled: !u, onClick: i })
  ] });
}
const lb = "w-[690px] max-w-full";
function wj() {
  return /* @__PURE__ */ d.jsxs("div", { className: "relative z-20 bg-[#FFFFFF]", children: [
    /* @__PURE__ */ d.jsx("h2", { className: "pb-section text-base font-bold tracking-wide text-embed-foreground-primary", children: "AI PRŮVODCE – ZEPTEJTE SE NA COKOLI" }),
    /* @__PURE__ */ d.jsx(
      "div",
      {
        "aria-hidden": "true",
        className: `h-px ${lb}`,
        style: { backgroundColor: Ie.action.accent }
      }
    ),
    /* @__PURE__ */ d.jsx(
      "div",
      {
        "aria-hidden": "true",
        className: `pointer-events-none absolute left-0 top-full z-20 h-[60px] ${lb}`,
        style: {
          backgroundImage: "linear-gradient(to bottom, #FFFFFF 0%, rgba(255,255,255,0) 100%)"
        }
      }
    )
  ] });
}
const Pn = { width: 18, height: 8 };
function Sj({ expanded: a }) {
  return /* @__PURE__ */ d.jsx(
    "span",
    {
      "aria-hidden": "true",
      className: `inline-flex shrink-0 grow-0 items-center justify-center transition-transform duration-500 ease-out ${a ? "rotate-180" : "rotate-0"}`,
      style: {
        width: Pn.width,
        height: Pn.height,
        minWidth: Pn.width,
        minHeight: Pn.height
      },
      children: /* @__PURE__ */ d.jsx(
        "svg",
        {
          viewBox: "0 0 12 8",
          width: Pn.width,
          height: Pn.height,
          preserveAspectRatio: "none",
          className: "block max-h-none max-w-none",
          style: {
            width: Pn.width,
            height: Pn.height,
            flexShrink: 0
          },
          fill: Ie.action.accent,
          children: /* @__PURE__ */ d.jsx("path", { d: "M1 1h10L6 7 1 1z" })
        }
      )
    }
  );
}
function jj() {
  return /* @__PURE__ */ d.jsx(
    "h2",
    {
      className: `${LS} relative z-10 m-0 shrink-0 text-base font-bold leading-none tracking-wide text-embed-foreground-primary`,
      children: "CO NAŠE KLIENTY NEJVÍCE ZAJÍMÁ:"
    }
  );
}
function Ej({ question: a, answer: o, onQuestionSelect: i }) {
  const [s, u] = U.useState(!1);
  return /* @__PURE__ */ d.jsxs(
    "li",
    {
      className: "shrink-0 overflow-hidden rounded-[8px] border border-embed-border-default",
      style: { backgroundColor: Ie.surface.card },
      children: [
        /* @__PURE__ */ d.jsxs("div", { className: "flex h-faq-row items-center gap-3 px-section", children: [
          /* @__PURE__ */ d.jsx(
            "button",
            {
              type: "button",
              onClick: () => i(a),
              className: "min-w-0 flex-1 cursor-pointer truncate text-left text-sm text-embed-foreground-primary",
              children: a
            }
          ),
          /* @__PURE__ */ d.jsx(
            "button",
            {
              type: "button",
              "aria-label": s ? "Sbalit odpověď" : "Rozbalit odpověď",
              "aria-expanded": s,
              onClick: () => u((f) => !f),
              className: "flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-[6px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-embed-brand-gold/35 focus-visible:ring-offset-2",
              children: /* @__PURE__ */ d.jsx(Sj, { expanded: s })
            }
          )
        ] }),
        /* @__PURE__ */ d.jsx(
          "div",
          {
            className: "grid transition-[grid-template-rows] duration-500 ease-out",
            style: { gridTemplateRows: s ? "1fr" : "0fr" },
            children: /* @__PURE__ */ d.jsx("div", { className: "min-h-0 overflow-hidden", children: /* @__PURE__ */ d.jsx("p", { className: "border-t border-embed-border-default px-section py-3 text-sm leading-relaxed text-embed-foreground-primary/80", children: o }) })
          }
        )
      ]
    }
  );
}
function Aj({ items: a, onQuestionSelect: o }) {
  return /* @__PURE__ */ d.jsx(
    "ul",
    {
      className: `${dh} flex shrink-0 flex-col gap-[14px]`,
      children: a.map((i) => /* @__PURE__ */ d.jsx(
        Ej,
        {
          question: i.question,
          answer: i.answer,
          onQuestionSelect: o
        },
        i.id
      ))
    }
  );
}
const _j = "Přemýšlím…";
function mo(a) {
  const o = a.getHours().toString().padStart(2, "0"), i = a.getMinutes().toString().padStart(2, "0");
  return `${o}:${i}`;
}
function Fi() {
  return crypto.randomUUID();
}
function Oj() {
  const { experience: a } = ct(), o = cr(), i = ol(), s = a.context.decision.ai, u = U.useMemo(() => gj(s), [s]), [f, p] = U.useState(""), [h, y] = U.useState(() => [
    {
      id: Fi(),
      role: "assistant",
      text: ib(s),
      time: mo(/* @__PURE__ */ new Date())
    }
  ]), [g, E] = U.useState(!1), O = U.useRef(1);
  O.current = h.length;
  const z = U.useRef(!1);
  U.useEffect(() => (i == null || i.aiSessionOpened(s.id), () => {
    i == null || i.aiSessionEnded(O.current);
  }), [s.id, i]), U.useEffect(() => {
    y([
      {
        id: Fi(),
        role: "assistant",
        text: ib(s),
        time: mo(/* @__PURE__ */ new Date())
      }
    ]);
  }, [s.id]);
  const D = (S) => {
    p(S);
  }, R = () => {
    const S = f.trim();
    if (!S || z.current || g)
      return;
    z.current = !0, E(!0), p("");
    const W = mo(/* @__PURE__ */ new Date()), pe = Fi(), $ = Fi();
    y((re) => [
      ...re,
      { id: pe, role: "user", text: S, time: W },
      {
        id: $,
        role: "assistant",
        text: _j,
        time: W
      }
    ]), (async () => {
      try {
        const re = await dj().sendMessage({
          message: S,
          decision: o
        });
        y(
          (ue) => ue.map(
            (V) => V.id === $ ? {
              ...V,
              text: re.content,
              time: mo(/* @__PURE__ */ new Date())
            } : V
          )
        ), i == null || i.aiInteraction({
          questionCategory: Gp(S),
          responseGenerated: !0,
          clarificationRequested: !1,
          conversationLength: O.current
        });
      } catch (re) {
        const ue = re instanceof Vt ? re.userMessage : "Došlo k chybě při generování odpovědi. Zkuste to prosím znovu.";
        y(
          (V) => V.map(
            (P) => P.id === $ ? {
              ...P,
              text: ue,
              time: mo(/* @__PURE__ */ new Date())
            } : P
          )
        ), i == null || i.aiInteraction({
          questionCategory: Gp(S),
          responseGenerated: !1,
          clarificationRequested: !1,
          conversationLength: O.current
        });
      } finally {
        z.current = !1, E(!1);
      }
    })();
  };
  return /* @__PURE__ */ d.jsx(
    "section",
    {
      id: Ne.aiAdvisor,
      tabIndex: -1,
      "aria-label": "AI Advisor",
      className: `scroll-mt-header ${sr}`,
      "data-ai-context-id": s.id,
      children: /* @__PURE__ */ d.jsxs("div", { className: HS, children: [
        /* @__PURE__ */ d.jsxs("div", { className: BS, children: [
          /* @__PURE__ */ d.jsx(jj, {}),
          /* @__PURE__ */ d.jsx(Aj, { items: u, onQuestionSelect: D })
        ] }),
        /* @__PURE__ */ d.jsx("div", { className: YS, children: /* @__PURE__ */ d.jsx(wj, {}) }),
        /* @__PURE__ */ d.jsx("div", { className: $S, children: /* @__PURE__ */ d.jsx("div", { className: VS, children: /* @__PURE__ */ d.jsx(lj, { messages: h }) }) }),
        /* @__PURE__ */ d.jsx("div", { className: GS, children: /* @__PURE__ */ d.jsx(
          xj,
          {
            value: f,
            onChange: p,
            onSend: R,
            disabled: g
          }
        ) }),
        /* @__PURE__ */ d.jsx("div", { className: qS, children: /* @__PURE__ */ d.jsx(sj, {}) })
      ] })
    }
  );
}
function zj() {
  const a = (o) => {
    o.preventDefault();
    const i = document.getElementById(Ne.walkthrough);
    if (i === null)
      return;
    const s = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    i.scrollIntoView({
      behavior: s ? "auto" : "smooth",
      block: "start"
    }), i.focus({ preventScroll: !0 }), window.history.pushState(null, "", `#${Ne.walkthrough}`);
  };
  return /* @__PURE__ */ d.jsx(
    mh,
    {
      href: `#${Ne.walkthrough}`,
      onClick: a,
      children: "Podívat se dovnitř – video →"
    }
  );
}
const Nj = [
  { value: "124 m2", label: "Užitná plocha" },
  { value: "A ++", label: "Energetická třída" },
  { value: "Dřevostavba", label: "Difuzně otevřená" }
], Tj = {
  backgroundImage: `linear-gradient(to top, color-mix(in srgb, ${Ie.border.default} 30%, #FFFFFF), #FFFFFF)`
};
function Rj() {
  return /* @__PURE__ */ d.jsxs(
    "section",
    {
      "aria-label": "Hero Content",
      className: "relative flex h-full min-h-0 w-full flex-col justify-center bg-white px-section py-section mobile:py-8",
      children: [
        /* @__PURE__ */ d.jsxs("div", { className: "translate-x-[10px] mobile:translate-x-0", children: [
          /* @__PURE__ */ d.jsx("p", { className: "text-sm font-bold uppercase tracking-wide text-[#D4AF37]", children: "MODERN A01 – 4+kk" }),
          /* @__PURE__ */ d.jsx("h1", { className: "mt-3 font-sans text-[2.52rem] font-black leading-[1.15] tracking-tight text-embed-foreground-primary mobile:text-[2rem]", children: "Rodinný dům, kde to dýchá štěstím" }),
          /* @__PURE__ */ d.jsx("dl", { className: "mt-8 grid grid-cols-3 divide-x divide-embed-border-default mobile:grid-cols-1 mobile:gap-3 mobile:divide-x-0", children: Nj.map((a) => /* @__PURE__ */ d.jsxs(
            "div",
            {
              className: "flex flex-col px-3 first:pl-0 last:pr-0 mobile:px-0",
              children: [
                /* @__PURE__ */ d.jsx("dd", { className: "order-1 text-base font-bold leading-tight text-[#D4AF37]", children: a.value }),
                /* @__PURE__ */ d.jsx("dt", { className: "order-2 mt-1 text-xs leading-snug text-embed-foreground-primary", children: a.label })
              ]
            },
            a.label
          )) }),
          /* @__PURE__ */ d.jsx("div", { className: "mt-10 flex -translate-x-[10px] translate-y-[50px] justify-center mobile:translate-x-0 mobile:translate-y-0 mobile:justify-start", children: /* @__PURE__ */ d.jsx(zj, {}) })
        ] }),
        /* @__PURE__ */ d.jsx(
          "div",
          {
            "aria-hidden": "true",
            className: "pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[33px] mobile:hidden",
            style: Tj
          }
        )
      ]
    }
  );
}
function kj() {
  var i;
  const { experience: a } = ct(), o = Jn(
    a.context.hero.primaryMediaUrl ?? ((i = a.context.hero.heroMedia) == null ? void 0 : i.url) ?? ""
  );
  return U.useEffect(() => {
    var s, u;
    vn("4.HeroRuntime.beforeHeroImage", {
      resolvedHeroAsset: o,
      source: "experience.context.hero.primaryMediaUrl | heroMedia.url",
      absoluteRuntimePath: o,
      heroMediaId: ((s = a.context.hero.heroMedia) == null ? void 0 : s.id) ?? null,
      primaryMediaUrl: a.context.hero.primaryMediaUrl,
      heroMediaUrl: ((u = a.context.hero.heroMedia) == null ? void 0 : u.url) ?? null
    }), vn("5.ComponentEvidence.HeroImage", {
      backgroundImageUrl: o,
      title: a.context.hero.title,
      eyebrow: a.context.hero.eyebrow
    });
  }, [a.context.hero, o]), /* @__PURE__ */ d.jsx(
    "section",
    {
      role: "img",
      "aria-label": "Rodinný dům MODERN A01",
      className: "relative h-full min-h-0 w-full bg-cover bg-[center_42%] bg-no-repeat",
      style: o ? { backgroundImage: `url('${o}')` } : void 0,
      children: /* @__PURE__ */ d.jsxs(
        "div",
        {
          "aria-hidden": "true",
          className: "animate-hero-photo-veil pointer-events-none absolute inset-y-0 left-0 z-10 w-1/4 mobile:hidden",
          children: [
            /* @__PURE__ */ d.jsx("div", { className: "absolute inset-y-0 left-0 w-1/2 bg-white/65" }),
            /* @__PURE__ */ d.jsx("div", { className: "absolute inset-y-0 left-1/2 w-1/2 bg-white/45" })
          ]
        }
      )
    }
  );
}
function Cj({ children: a }) {
  return /* @__PURE__ */ d.jsx("div", { className: "relative h-hero-image w-full overflow-hidden mobile:h-auto mobile:min-h-0", children: a });
}
const Ij = "#D4AF37", Mj = "h-8 w-8";
function Dj({ name: a }) {
  const o = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: Ij,
    strokeWidth: 1.5,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className: Mj,
    "aria-hidden": !0
  };
  switch (a) {
    case "viewing":
      return /* @__PURE__ */ d.jsxs("svg", { ...o, children: [
        /* @__PURE__ */ d.jsx("circle", { cx: "9", cy: "8", r: "2.5" }),
        /* @__PURE__ */ d.jsx("circle", { cx: "16", cy: "9", r: "2" }),
        /* @__PURE__ */ d.jsx("path", { d: "M3.5 18.5c.4-2.8 2.6-4.5 5.5-4.5s5.1 1.7 5.5 4.5" }),
        /* @__PURE__ */ d.jsx("path", { d: "M14 14.2c1.1-.7 2.5-1.1 4-1.1 2.3 0 4.1 1.2 4.5 3.4" })
      ] });
    case "saved":
      return /* @__PURE__ */ d.jsx("svg", { ...o, children: /* @__PURE__ */ d.jsx("path", { d: "M7 4.5h10a1.5 1.5 0 0 1 1.5 1.5v14l-6.5-3.5L5.5 20V6A1.5 1.5 0 0 1 7 4.5z" }) });
    case "inquiry":
      return /* @__PURE__ */ d.jsxs("svg", { ...o, children: [
        /* @__PURE__ */ d.jsx("rect", { x: "3.5", y: "8", width: "12", height: "10", rx: "1" }),
        /* @__PURE__ */ d.jsx("path", { d: "M3.5 11.5h12M7.5 8v10" }),
        /* @__PURE__ */ d.jsx("circle", { cx: "17.5", cy: "7", r: "3.5" }),
        /* @__PURE__ */ d.jsx("path", { d: "M16.3 6.2c.2-.6.8-1 1.4-1 .8 0 1.4.5 1.4 1.2 0 .7-.4 1-1 1.3-.5.2-.8.5-.8 1.1M17.5 10.2h.01" })
      ] });
    default:
      return null;
  }
}
const sb = {
  backgroundColor: Ie.action.accent
};
function Gc({ icon: a, value: o, label: i }) {
  return /* @__PURE__ */ d.jsx("div", { className: "flex h-social-proof items-center justify-center px-section", children: /* @__PURE__ */ d.jsxs("div", { className: "flex max-w-full items-center gap-3", children: [
    /* @__PURE__ */ d.jsx(Dj, { name: a }),
    /* @__PURE__ */ d.jsxs("p", { className: "text-left text-sm leading-snug text-[#001930]", children: [
      /* @__PURE__ */ d.jsx("span", { className: "text-2xl font-bold tracking-tight", children: o }),
      /* @__PURE__ */ d.jsx("span", { className: "ml-2 text-[#001930]/70", children: i })
    ] })
  ] }) });
}
function Uj() {
  return /* @__PURE__ */ d.jsxs(d.Fragment, { children: [
    /* @__PURE__ */ d.jsx(
      "div",
      {
        "aria-hidden": "true",
        className: "pointer-events-none absolute left-1/3 top-[25%] z-10 h-1/2 w-px -translate-x-1/2 mobile:hidden",
        style: sb
      }
    ),
    /* @__PURE__ */ d.jsx(
      "div",
      {
        "aria-hidden": "true",
        className: "pointer-events-none absolute left-2/3 top-[25%] z-10 h-1/2 w-px -translate-x-1/2 mobile:hidden",
        style: sb
      }
    )
  ] });
}
function Lj() {
  return /* @__PURE__ */ d.jsxs(
    oj,
    {
      as: "section",
      id: "social-proof",
      tabIndex: -1,
      "aria-label": "Social Proof",
      "data-landing-anchor": "social-proof",
      variant: "elevated",
      className: "relative grid scroll-mt-header grid-cols-3 !bg-[#FFFFFF] text-[#001930] mobile:grid-cols-1",
      children: [
        /* @__PURE__ */ d.jsx(
          "div",
          {
            "aria-hidden": "true",
            className: "pointer-events-none absolute inset-x-0 top-0 z-10 h-[2px] bg-white"
          }
        ),
        /* @__PURE__ */ d.jsx(
          "div",
          {
            "aria-hidden": "true",
            className: "pointer-events-none absolute inset-x-0 top-[2px] z-10 h-px",
            style: { backgroundColor: Ie.action.accent }
          }
        ),
        /* @__PURE__ */ d.jsx(Uj, {}),
        /* @__PURE__ */ d.jsx(Gc, { icon: "viewing", value: "1", label: "rodina si právě prohlíží tento dům" }),
        /* @__PURE__ */ d.jsx(
          Gc,
          {
            icon: "saved",
            value: "18",
            label: "zájemců si uložilo tento dům v minulém měsíci"
          }
        ),
        /* @__PURE__ */ d.jsx(
          Gc,
          {
            icon: "inquiry",
            value: "21 %",
            label: "zájemců se dotazuje na velikost pozemku"
          }
        )
      ]
    }
  );
}
function Hj() {
  return /* @__PURE__ */ d.jsxs(
    "section",
    {
      id: Ne.hero,
      tabIndex: -1,
      "aria-label": "Object Discovery",
      className: `scroll-mt-header ${sr}`,
      children: [
        /* @__PURE__ */ d.jsx(Cj, { children: /* @__PURE__ */ d.jsxs("div", { className: "grid h-full min-h-0 grid-cols-[minmax(0,1fr)_minmax(0,2fr)] mobile:grid-cols-1 mobile:grid-rows-[auto_minmax(16rem,1fr)]", children: [
          /* @__PURE__ */ d.jsx(Rj, {}),
          /* @__PURE__ */ d.jsx(kj, {})
        ] }) }),
        /* @__PURE__ */ d.jsx(Lj, {})
      ]
    }
  );
}
const hh = Object.freeze([
  {
    id: "request-consultation",
    labelCs: "Domluvit konzultaci",
    descriptionCs: "Probereme doporučení a další kroky s odborníkem.",
    mailtoSubject: "Poptávka — konzultace",
    successNextStepCs: "Ozveme se vám s termíny konzultace.",
    enabled: !0
  },
  {
    id: "request-offer",
    labelCs: "Vyžádat nabídku",
    descriptionCs: "Připravíme nezávaznou nabídku na základě vašeho rozhodnutí.",
    mailtoSubject: "Poptávka — nabídka",
    successNextStepCs: "Připravíme nabídku a pošleme ji na váš e-mail.",
    enabled: !0
  },
  {
    id: "book-meeting",
    labelCs: "Rezervovat schůzku",
    descriptionCs: "Domluvíme osobní nebo online schůzku.",
    mailtoSubject: "Poptávka — schůzka",
    successNextStepCs: "Navrhneme termíny schůzky.",
    enabled: !0
  },
  {
    id: "contact-specialist",
    labelCs: "Kontaktovat specialistu",
    descriptionCs: "Specialista se vám ozve s odpovědí na vaše otázky.",
    mailtoSubject: "Poptávka — kontakt specialisty",
    successNextStepCs: "Specialista se vám ozve zpět.",
    enabled: !0
  }
]), cb = Object.freeze([
  { id: "email", labelCs: "E-mail" },
  { id: "phone", labelCs: "Telefon" },
  { id: "either", labelCs: "Jakékoli" }
]), Bj = "Souhlasím se zpracováním kontaktních údajů za účelem vyřízení mé poptávky. Údaje nebudou sdíleny s třetími stranami pro marketing bez dalšího souhlasu.";
function yh() {
  return hh.filter((a) => a.enabled);
}
function Yj(a) {
  return a === null ? null : hh.find((o) => o.id === a) ?? null;
}
const yd = "mx-auto w-full max-w-5xl", $j = "mx-auto w-full max-w-2xl", Gj = {
  backgroundColor: Ie.brand.navy
}, st = Ie.action.accent, gh = Ie.action.onAccent, Ft = Ie.action.onPrimary, Yt = Ie.border.default, fo = 54, Xi = "h-[54px] border", po = {
  backgroundColor: Ie.surface.interactive,
  borderColor: Ie.action.accent,
  color: Ie.action.onSecondary
};
function qj() {
  return /* @__PURE__ */ d.jsxs("div", { className: "mx-auto w-full max-w-[61.6rem] px-section pb-10 pt-14 text-center mobile:pb-8 mobile:pt-12", children: [
    /* @__PURE__ */ d.jsx(
      "h1",
      {
        className: "font-sans text-5xl font-bold leading-[1.1] tracking-tight mobile:text-4xl",
        style: { color: Ft },
        children: "Připraveni na další krok?"
      }
    ),
    /* @__PURE__ */ d.jsx("p", { className: "mx-auto mt-7 max-w-[52.8rem] font-sans text-xl font-normal leading-snug text-white/90 mobile:mt-5 mobile:text-lg", children: "Máte za sebou prohlídku, priority i doporučení. Teď můžete pokračovat konzultací, nabídkou nebo schůzkou — podle toho, co vám dává smysl." }),
    /* @__PURE__ */ d.jsx(
      "p",
      {
        className: "mx-auto mt-5 max-w-[52.8rem] font-sans text-xl font-semibold leading-snug mobile:text-lg",
        style: { color: st },
        children: "Bez nátlaku. Jedna poptávka, jeden další krok."
      }
    )
  ] });
}
function Vj() {
  return /* @__PURE__ */ d.jsx(
    "div",
    {
      className: `${yd} mt-10 border-t px-section pt-6 mobile:mt-8`,
      style: { borderColor: `${st}55` },
      children: /* @__PURE__ */ d.jsxs("div", { className: "grid grid-cols-2 gap-section text-sm leading-relaxed mobile:grid-cols-1 mobile:text-center", children: [
        /* @__PURE__ */ d.jsxs("div", { style: { color: Yt }, children: [
          /* @__PURE__ */ d.jsx("p", { style: { color: Ft }, children: "Asrav s.r.o." }),
          /* @__PURE__ */ d.jsx("p", { children: "Budějická 765, Lierec" }),
          /* @__PURE__ */ d.jsx("p", { children: "IČ: 123 456 88" })
        ] }),
        /* @__PURE__ */ d.jsxs("div", { className: "text-right mobile:text-center", style: { color: Yt }, children: [
          /* @__PURE__ */ d.jsx("p", { style: { color: Ft }, children: "+420 987 654 321" }),
          /* @__PURE__ */ d.jsx("p", { children: "kontakt@astav.cz" })
        ] })
      ] })
    }
  );
}
function Fj(a) {
  return Object.freeze({
    recommendation: a.recommendation,
    status: a.status,
    focusRoomName: a.focusRoomName,
    focusReason: a.focusReason,
    priorityIds: Object.freeze([...a.priorityIds]),
    recommendedNextAction: a.recommendedNextAction,
    terminalId: a.terminalId
  });
}
function vh() {
  const { experience: a } = ct(), o = a.context.decision, i = o.terminal.outcome;
  return Fj({
    recommendation: i.recommendation,
    status: i.status,
    focusRoomName: o.focus.focusRoomName,
    focusReason: o.focus.focusReason,
    priorityIds: o.priorityIds,
    recommendedNextAction: i.recommendedNextAction,
    terminalId: o.terminal.id
  });
}
function Xj(a) {
  const o = a.priorityIds.length === 0 ? "—" : a.priorityIds.map(xn).join(", "), i = a.focusRoomName !== null ? `${a.focusRoomName} · ${ge(a.focusReason)}` : ge(a.focusReason);
  return [
    "--- Kontext rozhodnutí (Runtime) ---",
    `Doporučení: ${ge(a.recommendation)}`,
    `Stav: ${lr(a.status)}`,
    `Fokus: ${i}`,
    `Priority: ${o}`,
    `Další krok: ${ge(a.recommendedNextAction)}`,
    `Terminal: ${a.terminalId}`
  ].join(`
`);
}
function Pj() {
  const a = vh(), o = a.priorityIds.length === 0 ? "Zatím bez priorit" : a.priorityIds.map(xn).join(" · ");
  return /* @__PURE__ */ d.jsxs(
    "div",
    {
      className: `${yd} px-section`,
      "data-testid": "conversion-context",
      "data-terminal-id": a.terminalId,
      children: [
        /* @__PURE__ */ d.jsx(
          "p",
          {
            className: "text-center text-[11px] font-semibold uppercase tracking-wide",
            style: { color: st },
            children: "Na základě vašeho rozhodnutí"
          }
        ),
        /* @__PURE__ */ d.jsx(
          "p",
          {
            className: "mt-2 text-center text-lg font-semibold leading-snug",
            style: { color: Ft },
            children: ge(a.recommendation)
          }
        ),
        /* @__PURE__ */ d.jsxs("p", { className: "mt-2 text-center text-sm", style: { color: Yt }, children: [
          lr(a.status),
          a.focusRoomName !== null ? /* @__PURE__ */ d.jsxs(d.Fragment, { children: [
            /* @__PURE__ */ d.jsx("span", { className: "mx-2", "aria-hidden": "true", children: "·" }),
            "Fokus: ",
            a.focusRoomName
          ] }) : null
        ] }),
        /* @__PURE__ */ d.jsxs("p", { className: "mt-1 text-center text-xs", style: { color: Yt }, children: [
          "Priority: ",
          o
        ] }),
        /* @__PURE__ */ d.jsxs("p", { className: "mt-3 text-center text-sm font-medium", style: { color: Ft }, children: [
          "Další krok: ",
          ge(a.recommendedNextAction)
        ] })
      ]
    }
  );
}
function Kj({
  selectedCtaId: a,
  onSelect: o,
  primaryCtaId: i
}) {
  const s = Zj(yh(), i);
  return /* @__PURE__ */ d.jsxs(
    "div",
    {
      className: `${yd} px-section`,
      "data-testid": "conversion-cta-select",
      children: [
        /* @__PURE__ */ d.jsxs("h2", { className: "text-center text-base font-semibold tracking-wide", children: [
          /* @__PURE__ */ d.jsx("span", { style: { color: st }, children: "1. " }),
          /* @__PURE__ */ d.jsx("span", { style: { color: Ft }, children: "Jak chcete pokračovat?" })
        ] }),
        /* @__PURE__ */ d.jsx(
          "p",
          {
            className: "mx-auto mt-3 max-w-xl text-center text-sm leading-snug",
            style: { color: Yt },
            children: "Vyberte akci. Formulář se zobrazí až poté — bez přerušení vašeho rozhodování."
          }
        ),
        /* @__PURE__ */ d.jsx("ul", { className: "mt-6 grid grid-cols-2 gap-3 mobile:grid-cols-1", children: s.map((u) => {
          const f = u.id === a, p = u.id === i;
          return /* @__PURE__ */ d.jsx("li", { children: /* @__PURE__ */ d.jsxs(
            "button",
            {
              type: "button",
              "data-cta-id": u.id,
              "data-primary": p ? "true" : "false",
              "aria-pressed": f,
              className: "flex h-full w-full flex-col rounded-[8px] border px-4 py-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-embed-brand-gold/35",
              style: {
                borderColor: f ? st : `${Yt}66`,
                backgroundColor: f ? `${st}22` : "transparent"
              },
              onClick: () => o(u.id),
              children: [
                p ? /* @__PURE__ */ d.jsx(
                  "span",
                  {
                    className: "text-[10px] font-semibold uppercase tracking-wide",
                    style: { color: st },
                    children: "Doporučený další krok"
                  }
                ) : null,
                /* @__PURE__ */ d.jsx(
                  "span",
                  {
                    className: "mt-1 text-sm font-semibold",
                    style: { color: f ? st : Ft },
                    children: u.labelCs
                  }
                ),
                /* @__PURE__ */ d.jsx("span", { className: "mt-1 text-xs leading-snug", style: { color: Yt }, children: u.descriptionCs })
              ]
            }
          ) }, u.id);
        }) })
      ]
    }
  );
}
function Zj(a, o) {
  const i = a.find((s) => s.id === o);
  return i === void 0 ? a : [i, ...a.filter((s) => s.id !== o)];
}
function Qj(a) {
  return a === "onAccent" ? gh : st;
}
function xh({
  tone: a = "gold",
  className: o = "h-8 w-8",
  children: i
}) {
  return /* @__PURE__ */ d.jsx(
    "svg",
    {
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: Qj(a),
      strokeWidth: 1.6,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      className: o,
      "aria-hidden": "true",
      children: i
    }
  );
}
function Jj({ tone: a, className: o }) {
  return /* @__PURE__ */ d.jsxs(xh, { tone: a, className: o, children: [
    /* @__PURE__ */ d.jsx("rect", { x: "5", y: "11", width: "14", height: "10", rx: "2" }),
    /* @__PURE__ */ d.jsx("path", { d: "M8 11V8a4 4 0 0 1 8 0v3" })
  ] });
}
function Wj({ tone: a, className: o }) {
  return /* @__PURE__ */ d.jsxs(xh, { tone: a, className: o, children: [
    /* @__PURE__ */ d.jsx("circle", { cx: "12", cy: "8", r: "3.5" }),
    /* @__PURE__ */ d.jsx("path", { d: "M5 19c1.8-3 4-4.5 7-4.5S17.2 16 19 19" })
  ] });
}
function e2({ nextStep: a }) {
  return /* @__PURE__ */ d.jsxs(
    "div",
    {
      className: "rounded-[8px] border px-6 py-8 text-center",
      style: { borderColor: `${st}66` },
      "data-testid": "lead-capture-success",
      children: [
        /* @__PURE__ */ d.jsx("p", { className: "text-xl font-semibold", style: { color: Ft }, children: "E-mail je připraven." }),
        /* @__PURE__ */ d.jsxs("p", { className: "mt-2 text-sm leading-relaxed", style: { color: Yt }, children: [
          "Dokončete odeslání ve svém e-mailovém klientovi. Pokud se neotevřel, napište na ",
          Kc,
          "."
        ] }),
        a ? /* @__PURE__ */ d.jsxs("p", { className: "mt-4 text-sm font-medium", style: { color: st }, children: [
          "Další krok: ",
          a
        ] }) : null
      ]
    }
  );
}
function t2({ ctaId: a, snapshot: o }) {
  const i = Yj(a), s = ol(), [u, f] = U.useState("idle"), [p, h] = U.useState(""), [y, g] = U.useState(""), [E, O] = U.useState(""), [z, D] = U.useState(""), [R, S] = U.useState("email"), [H, W] = U.useState(!1), [pe, $] = U.useState(null), re = U.useRef(!1);
  U.useEffect(() => (s == null || s.conversionFormOpened(a), re.current = !1, () => {
    re.current || s == null || s.conversionCancelled(a);
  }), [s, a]);
  const ue = (V) => {
    var Te;
    if (V.preventDefault(), $(null), i === null) {
      f("error"), $("Vyberte akci pokračování.");
      return;
    }
    const P = p.trim(), _e = y.trim();
    if (!P || !_e) {
      f("error"), $("Vyplňte jméno a e-mail.");
      return;
    }
    if (!H) {
      f("error"), $("Pro odeslání je potřeba souhlas se zpracováním údajů.");
      return;
    }
    f("loading");
    const ot = ((Te = cb.find((dt) => dt.id === R)) == null ? void 0 : Te.labelCs) ?? R, We = encodeURIComponent(i.mailtoSubject), Ye = encodeURIComponent(
      [
        `Akce: ${i.labelCs} (${i.id})`,
        `Jméno: ${P}`,
        `E-mail: ${_e}`,
        E.trim() ? `Telefon: ${E.trim()}` : null,
        `Preferovaný kontakt: ${ot}`,
        z.trim() ? `Zpráva: ${z.trim()}` : null,
        "Souhlas: ano",
        "",
        Xj(o),
        "",
        "Zdroj: Client Studio — Commercial Conversion"
      ].filter((dt) => dt !== null).join(`
`)
    );
    try {
      window.location.href = `mailto:${Kc}?subject=${We}&body=${Ye}`, window.setTimeout(() => {
        re.current = !0, s == null || s.conversionCompleted(i.id), f("success");
      }, 400);
    } catch {
      f("error"), $(
        `Nepodařilo se otevřít e-mail. Napište nám na ${Kc}.`
      );
    }
  };
  return i === null ? null : /* @__PURE__ */ d.jsxs(
    "div",
    {
      className: `${$j} px-section`,
      "data-testid": "conversion-lead-form",
      "data-cta-id": i.id,
      children: [
        /* @__PURE__ */ d.jsxs("h2", { className: "text-center text-base font-semibold tracking-wide", children: [
          /* @__PURE__ */ d.jsx("span", { style: { color: st }, children: "2. " }),
          /* @__PURE__ */ d.jsx("span", { style: { color: Ft }, children: i.labelCs })
        ] }),
        /* @__PURE__ */ d.jsxs(
          "p",
          {
            className: "mx-auto mt-3 max-w-xl text-center text-sm leading-snug",
            style: { color: Yt },
            children: [
              i.descriptionCs,
              " Poptávku otevřete ve svém e-mailu — odeslání potvrďte tam."
            ]
          }
        ),
        u === "success" ? /* @__PURE__ */ d.jsx("div", { className: "mt-5", children: /* @__PURE__ */ d.jsx(e2, { nextStep: i.successNextStepCs }) }) : /* @__PURE__ */ d.jsxs(
          "form",
          {
            className: "mt-5 grid grid-cols-2 gap-3 mobile:grid-cols-1",
            onSubmit: ue,
            children: [
              /* @__PURE__ */ d.jsx("label", { className: "sr-only", htmlFor: "conversion-contact-name", children: "Jméno a příjmení" }),
              /* @__PURE__ */ d.jsx(
                $c,
                {
                  id: "conversion-contact-name",
                  type: "text",
                  required: !0,
                  value: p,
                  placeholder: "Jméno a příjmení",
                  disabled: u === "loading",
                  className: Xi,
                  style: { ...po, height: fo },
                  onChange: (V) => h(V.target.value)
                }
              ),
              /* @__PURE__ */ d.jsx("label", { className: "sr-only", htmlFor: "conversion-contact-email", children: "E-mail" }),
              /* @__PURE__ */ d.jsx(
                $c,
                {
                  id: "conversion-contact-email",
                  type: "email",
                  required: !0,
                  value: y,
                  placeholder: "E-mail",
                  disabled: u === "loading",
                  className: Xi,
                  style: { ...po, height: fo },
                  onChange: (V) => g(V.target.value)
                }
              ),
              /* @__PURE__ */ d.jsx("label", { className: "sr-only", htmlFor: "conversion-contact-phone", children: "Telefon (volitelné)" }),
              /* @__PURE__ */ d.jsx(
                $c,
                {
                  id: "conversion-contact-phone",
                  type: "tel",
                  value: E,
                  placeholder: "Telefon (volitelné)",
                  disabled: u === "loading",
                  className: Xi,
                  style: { ...po, height: fo },
                  onChange: (V) => O(V.target.value)
                }
              ),
              /* @__PURE__ */ d.jsx("label", { className: "sr-only", htmlFor: "conversion-contact-method", children: "Preferovaný kontakt" }),
              /* @__PURE__ */ d.jsx(
                "select",
                {
                  id: "conversion-contact-method",
                  value: R,
                  disabled: u === "loading",
                  className: `${Xi} rounded-[8px] px-3 text-sm`,
                  style: { ...po, height: fo },
                  onChange: (V) => S(V.target.value),
                  children: cb.map((V) => /* @__PURE__ */ d.jsx("option", { value: V.id, children: V.labelCs }, V.id))
                }
              ),
              /* @__PURE__ */ d.jsx("label", { className: "sr-only", htmlFor: "conversion-contact-message", children: "Zpráva (volitelné)" }),
              /* @__PURE__ */ d.jsx(
                "textarea",
                {
                  id: "conversion-contact-message",
                  value: z,
                  placeholder: "Zpráva (volitelné)",
                  disabled: u === "loading",
                  rows: 3,
                  className: "col-span-2 rounded-[8px] border px-3 py-3 text-sm mobile:col-span-1",
                  style: po,
                  onChange: (V) => D(V.target.value)
                }
              ),
              /* @__PURE__ */ d.jsxs(
                "label",
                {
                  className: "col-span-2 flex items-start gap-3 text-left text-xs leading-snug mobile:col-span-1",
                  style: { color: Yt },
                  children: [
                    /* @__PURE__ */ d.jsx(
                      "input",
                      {
                        type: "checkbox",
                        checked: H,
                        disabled: u === "loading",
                        className: "mt-0.5 h-4 w-4 shrink-0",
                        "data-testid": "conversion-consent",
                        onChange: (V) => {
                          const P = V.target.checked;
                          W(P), P && (s == null || s.conversionConsentAccepted(i.id));
                        }
                      }
                    ),
                    /* @__PURE__ */ d.jsx("span", { children: Bj })
                  ]
                }
              ),
              /* @__PURE__ */ d.jsx(
                "button",
                {
                  type: "submit",
                  disabled: u === "loading",
                  "data-testid": "conversion-submit",
                  className: "col-span-2 flex w-full items-center justify-center rounded-[8px] px-4 text-center text-sm font-semibold tracking-wide focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-embed-brand-gold/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#001930] disabled:opacity-60 mobile:col-span-1",
                  style: {
                    height: fo,
                    backgroundColor: st,
                    color: gh
                  },
                  children: u === "loading" ? "Otevírám e-mail…" : "ODESLAT POPTÁVKU →"
                }
              )
            ]
          }
        ),
        u === "error" && pe ? /* @__PURE__ */ d.jsx(
          "p",
          {
            className: "mt-3 text-center text-sm",
            style: { color: st },
            role: "alert",
            "data-testid": "lead-capture-error",
            children: pe
          }
        ) : null,
        /* @__PURE__ */ d.jsxs("div", { className: "mt-5 grid grid-cols-2 gap-6 mobile:grid-cols-1", children: [
          /* @__PURE__ */ d.jsxs("div", { className: "flex gap-3", children: [
            /* @__PURE__ */ d.jsx(
              "div",
              {
                className: "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border",
                style: { borderColor: st },
                children: /* @__PURE__ */ d.jsx(Jj, { className: "h-5 w-5" })
              }
            ),
            /* @__PURE__ */ d.jsxs("div", { children: [
              /* @__PURE__ */ d.jsx("p", { className: "text-sm font-semibold", style: { color: Ft }, children: "Vaše údaje jsou v bezpečí." }),
              /* @__PURE__ */ d.jsx("p", { className: "mt-1 text-xs leading-snug", style: { color: Yt }, children: "Informace použijeme pouze pro vyřízení poptávky." })
            ] })
          ] }),
          /* @__PURE__ */ d.jsxs("div", { className: "flex gap-3", children: [
            /* @__PURE__ */ d.jsx(
              "div",
              {
                className: "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border",
                style: { borderColor: st },
                children: /* @__PURE__ */ d.jsx(Wj, { className: "h-5 w-5" })
              }
            ),
            /* @__PURE__ */ d.jsxs("div", { children: [
              /* @__PURE__ */ d.jsx("p", { className: "text-sm font-semibold", style: { color: Ft }, children: "Nezávazný další krok." }),
              /* @__PURE__ */ d.jsx("p", { className: "mt-1 text-xs leading-snug", style: { color: Yt }, children: "Rozhodnutí zůstává na vás. Runtime doporučení neměníme." })
            ] })
          ] })
        ] })
      ]
    }
  );
}
function n2() {
  var p;
  const a = vh(), o = ol(), i = ((p = yh()[0]) == null ? void 0 : p.id) ?? "request-consultation", [s, u] = U.useState(
    null
  ), f = (h) => {
    u(h), o == null || o.conversionStarted(h);
  };
  return /* @__PURE__ */ d.jsx(
    "section",
    {
      "aria-label": "Commercial Conversion",
      id: Ne.audit,
      className: "scroll-mt-header",
      "data-testid": "commercial-conversion",
      children: /* @__PURE__ */ d.jsxs(
        "div",
        {
          className: "overflow-hidden rounded-[11px] pb-8 shadow-[0_1px_11px_rgba(0,25,48,0.044)]",
          style: Gj,
          children: [
            /* @__PURE__ */ d.jsx(qj, {}),
            /* @__PURE__ */ d.jsxs("div", { className: "flex flex-col gap-14 mobile:gap-11", children: [
              /* @__PURE__ */ d.jsx(Pj, {}),
              /* @__PURE__ */ d.jsx(
                Kj,
                {
                  selectedCtaId: s,
                  primaryCtaId: i,
                  onSelect: f
                }
              ),
              s !== null ? /* @__PURE__ */ d.jsx(t2, { ctaId: s, snapshot: a }) : null
            ] }),
            /* @__PURE__ */ d.jsx(Vj, {})
          ]
        }
      )
    }
  );
}
const a2 = 1432, r2 = 20, nl = 580, wh = r2 + nl, Sh = 240, o2 = a2 - wh - Sh, i2 = 80, l2 = Math.round(
  i2 * 16 / 9
), s2 = "duration-200 ease-out", nd = 119, jh = 22, c2 = nd * 2 + jh, al = s2, d2 = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-embed-brand-gold/35 focus-visible:ring-offset-2", u2 = "border border-[#D4AF37] bg-[#F4F3F1] shadow-none", m2 = "hover:cursor-pointer hover:border-[#D4AF37] hover:shadow-[0_4px_14px_rgba(0,25,48,0.06)]", f2 = "z-10 scale-[1.12] border-2 border-[#D4AF37] shadow-[0_8px_24px_rgba(0,25,48,0.08)]", p2 = "ring-2 ring-embed-brand-gold ring-offset-2 ring-offset-[#F4F3F1]", b2 = "ring-1 ring-embed-brand-gold/40 ring-offset-1 ring-offset-[#F4F3F1]";
sl({ size: "md" });
sl({ size: "md", state: "disabled" });
const h2 = "pb-5", y2 = "box-border flex min-h-[60px] shrink-0 grow-0 items-end overflow-visible pb-2", g2 = "m-0 p-0 text-base font-bold leading-none tracking-wide text-embed-foreground-primary", v2 = c2, x2 = "px-[21px]", w2 = "box-border relative z-0 flex w-full max-w-[680px] flex-col self-stretch overflow-y-auto p-section", S2 = 350;
function j2() {
  const { experience: a } = ct(), o = yj(a.context.decision.terminal), i = ge(o.recommendation), s = lr(o.status), u = ge(o.recommendedNextAction);
  return /* @__PURE__ */ d.jsxs(
    "article",
    {
      className: `mt-section overflow-y-auto ${sr} p-section`,
      style: { maxHeight: S2 },
      "data-terminal-id": o.id,
      "data-testid": "decision-report",
      "aria-label": "Report rozhodnutí",
      children: [
        /* @__PURE__ */ d.jsxs("header", { className: "border-b border-embed-foreground-primary/10 pb-section", children: [
          /* @__PURE__ */ d.jsx("p", { className: "text-[11px] font-semibold uppercase tracking-wide text-embed-brand-gold", children: "Report rozhodnutí" }),
          /* @__PURE__ */ d.jsx("h2", { className: "mt-2 text-base font-semibold text-embed-foreground-primary", children: i }),
          /* @__PURE__ */ d.jsx("p", { className: "mt-2 text-sm leading-relaxed text-embed-foreground-primary/80", children: s })
        ] }),
        /* @__PURE__ */ d.jsxs("section", { className: "mt-section", "aria-labelledby": "decision-report-focus", children: [
          /* @__PURE__ */ d.jsx(
            "h3",
            {
              id: "decision-report-focus",
              className: "text-[11px] font-semibold uppercase tracking-wide text-embed-foreground-primary/45",
              children: "Dokončené kroky"
            }
          ),
          /* @__PURE__ */ d.jsx("ol", { className: "mt-2 list-decimal space-y-1 pl-5 text-sm text-embed-foreground-primary/70", children: o.completedMoveIds.map((f) => /* @__PURE__ */ d.jsx("li", { children: ge(f) }, f)) })
        ] }),
        /* @__PURE__ */ d.jsxs("section", { className: "mt-section", "aria-labelledby": "decision-report-evidence", children: [
          /* @__PURE__ */ d.jsx(
            "h3",
            {
              id: "decision-report-evidence",
              className: "text-[11px] font-semibold uppercase tracking-wide text-embed-foreground-primary/45",
              children: "Proč toto doporučení"
            }
          ),
          /* @__PURE__ */ d.jsx(
            "dl",
            {
              className: "mt-2 space-y-3 text-sm",
              "data-testid": "decision-report-evidence",
              children: o.rationale.map((f) => /* @__PURE__ */ d.jsx("div", { children: /* @__PURE__ */ d.jsx("dt", { className: "font-medium text-embed-foreground-primary", children: ge(f) }) }, f))
            }
          )
        ] }),
        /* @__PURE__ */ d.jsxs("section", { className: "mt-section", "aria-labelledby": "decision-report-concerns", children: [
          /* @__PURE__ */ d.jsx(
            "h3",
            {
              id: "decision-report-concerns",
              className: "text-[11px] font-semibold uppercase tracking-wide text-embed-foreground-primary/45",
              children: "Na co si dát pozor"
            }
          ),
          /* @__PURE__ */ d.jsx(
            "dl",
            {
              className: "mt-2 space-y-3 text-sm",
              "data-testid": "decision-report-concerns",
              children: o.unresolvedQuestions.map((f) => /* @__PURE__ */ d.jsx("div", { children: /* @__PURE__ */ d.jsx("dt", { className: "font-medium text-embed-foreground-primary", children: ge(f) }) }, f))
            }
          )
        ] }),
        /* @__PURE__ */ d.jsxs(
          "section",
          {
            className: "mt-section",
            "aria-labelledby": "decision-report-recommendations",
            children: [
              /* @__PURE__ */ d.jsx(
                "h3",
                {
                  id: "decision-report-recommendations",
                  className: "text-[11px] font-semibold uppercase tracking-wide text-embed-foreground-primary/45",
                  children: "Doporučení"
                }
              ),
              /* @__PURE__ */ d.jsx("ul", { className: "mt-2 list-disc space-y-1 pl-5 text-sm text-embed-foreground-primary/70", children: /* @__PURE__ */ d.jsx("li", { children: i }) })
            ]
          }
        ),
        /* @__PURE__ */ d.jsxs(
          "section",
          {
            className: "mt-section",
            "aria-labelledby": "decision-report-confidence",
            children: [
              /* @__PURE__ */ d.jsx(
                "h3",
                {
                  id: "decision-report-confidence",
                  className: "text-[11px] font-semibold uppercase tracking-wide text-embed-foreground-primary/45",
                  children: "Míra jistoty doporučení"
                }
              ),
              /* @__PURE__ */ d.jsx(
                "div",
                {
                  className: "mt-2 space-y-1 text-sm text-embed-foreground-primary/70",
                  "data-testid": "decision-report-confidence",
                  children: /* @__PURE__ */ d.jsxs("p", { className: "font-medium text-embed-foreground-primary", children: [
                    Math.round(o.confidence * 100),
                    " %"
                  ] })
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ d.jsxs("section", { className: "mt-section", "aria-labelledby": "decision-report-actions", children: [
          /* @__PURE__ */ d.jsx(
            "h3",
            {
              id: "decision-report-actions",
              className: "text-[11px] font-semibold uppercase tracking-wide text-embed-foreground-primary/45",
              children: "Doporučené další kroky"
            }
          ),
          /* @__PURE__ */ d.jsx(
            "ul",
            {
              className: "mt-2 list-disc space-y-2 pl-5 text-sm text-embed-foreground-primary/70",
              "data-testid": "decision-report-actions",
              children: /* @__PURE__ */ d.jsx("li", { children: /* @__PURE__ */ d.jsx("span", { className: "font-medium text-embed-foreground-primary", children: u }) })
            }
          )
        ] })
      ]
    }
  );
}
const gd = "flex h-chapter-title shrink-0 items-center overflow-hidden text-base font-bold leading-none tracking-wide text-embed-foreground-primary", E2 = "pt-[20px]", A2 = "w-full", _2 = "w-full", O2 = "box-border flex h-full w-full min-w-0 flex-col content-start items-start gap-0 overflow-x-hidden pb-section pl-[20px] mobile:px-section", z2 = "grid w-[580px] min-w-[580px] max-w-[580px] shrink-0 content-start items-start gap-0 mobile:w-full mobile:min-w-0 mobile:max-w-none", N2 = "relative z-0 flex h-full w-full min-w-0 flex-col items-stretch overflow-x-hidden pl-[40px] pr-[20px] pb-section", T2 = "relative box-border aspect-video w-[580px] min-w-[580px] max-w-[580px] shrink-0 overflow-hidden rounded-[8px] bg-embed-surface-placeholder", Eh = "relative flex w-full shrink-0 items-end", R2 = "min-h-[50px] flex-1";
function k2(a) {
  const { terminal: o, story: i, moves: s, focus: u, priorityIds: f } = a, p = o.outcome;
  return Object.freeze({
    terminalId: o.id,
    summary: Object.freeze({
      recommendation: p.recommendation,
      status: p.status,
      confidence: p.confidence,
      primaryExplanation: i.primaryExplanation,
      focusRoomName: u.focusRoomName,
      focusReason: u.focusReason,
      recommendedNextAction: p.recommendedNextAction
    }),
    story: Object.freeze({
      id: i.id,
      chapters: Object.freeze(
        i.chapters.map(
          (h) => Object.freeze({
            id: h.id,
            kind: h.kind,
            key: h.key,
            order: h.order
          })
        )
      ),
      nextDecisionStep: i.nextDecisionStep
    }),
    moves: Object.freeze({
      storyId: s.storyId,
      activeMoveId: s.activeMoveId,
      moves: Object.freeze(
        s.moves.map(
          (h) => Object.freeze({
            id: h.id,
            order: h.order,
            objective: h.objective,
            status: h.status,
            recommendedAction: h.recommendedAction
          })
        )
      )
    }),
    drivers: Object.freeze({
      priorityIds: Object.freeze([...f]),
      focusPriorityId: u.focusPriorityId,
      focusSignalKind: u.focusSignalKind,
      supportingArguments: Object.freeze([...i.supportingArguments]),
      rationale: Object.freeze([...p.rationale])
    }),
    outcome: Object.freeze({
      id: p.id,
      status: p.status,
      confidence: p.confidence,
      recommendation: p.recommendation,
      strengths: Object.freeze([...p.rationale]),
      considerations: Object.freeze([...p.unresolvedQuestions]),
      unresolvedMoveIds: Object.freeze([...p.unresolvedMoveIds]),
      completedMoveIds: Object.freeze([...p.completedMoveIds]),
      recommendedNextAction: p.recommendedNextAction
    })
  });
}
function C2() {
  const a = cr();
  return /* @__PURE__ */ d.jsxs(
    "section",
    {
      "aria-label": "Decision Story — interpretační panel",
      "data-testid": "priority-decision-story",
      "data-pt002-surface": "interpretation",
      "data-pt003-context": "true",
      "data-pt001-primary": a.focusPriority ?? "",
      "data-pt001-secondary": a.secondaryPriority ?? "",
      "data-pt001-priorities": a.selectedPriorities.join(","),
      "data-pt001-count": String(a.selectedPriorities.length),
      "data-pt002-primary": a.focusPriority ?? "",
      "data-pt003-focus": a.focusPriority ?? "",
      className: "mb-5 rounded-[8px] border border-embed-border-default bg-embed-surface-elevated p-4",
      children: [
        /* @__PURE__ */ d.jsx("p", { className: "text-[11px] font-semibold uppercase tracking-wide text-embed-brand-gold", children: "Decision Context" }),
        /* @__PURE__ */ d.jsx("h3", { className: "mt-2 text-base font-semibold text-embed-foreground-primary", children: a.headline }),
        /* @__PURE__ */ d.jsx("p", { className: "mt-2 text-sm leading-relaxed text-embed-foreground-primary/80", children: a.summary }),
        a.focusPriority !== null ? /* @__PURE__ */ d.jsxs("dl", { className: "mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-embed-foreground-primary/65", children: [
          /* @__PURE__ */ d.jsxs("div", { className: "flex gap-1.5", children: [
            /* @__PURE__ */ d.jsx("dt", { className: "font-semibold uppercase tracking-wide text-embed-brand-gold", children: "Focus" }),
            /* @__PURE__ */ d.jsx("dd", { children: xn(a.focusPriority) })
          ] }),
          a.secondaryPriority !== null ? /* @__PURE__ */ d.jsxs("div", { className: "flex gap-1.5", children: [
            /* @__PURE__ */ d.jsx("dt", { className: "font-semibold uppercase tracking-wide text-embed-foreground-primary/45", children: "Secondary" }),
            /* @__PURE__ */ d.jsx("dd", { children: xn(a.secondaryPriority) })
          ] }) : null
        ] }) : null,
        a.selectedPriorities.length > 0 ? /* @__PURE__ */ d.jsx(
          "ol",
          {
            className: "mt-3 space-y-1.5 border-t border-embed-border-default/60 pt-3",
            "aria-label": "Vybrané priority",
            children: a.selectedPriorities.map((o, i) => /* @__PURE__ */ d.jsxs(
              "li",
              {
                "data-priority-id": o,
                "data-priority-role": i === 0 ? "primary" : i === 1 ? "secondary" : `rank-${i + 1}`,
                className: `text-sm ${i === 0 ? "font-bold text-embed-foreground-primary" : i === 1 ? "font-semibold text-embed-foreground-primary" : "text-embed-foreground-primary/75"}`,
                children: [
                  /* @__PURE__ */ d.jsxs("span", { className: "mr-2 tabular-nums text-embed-foreground-primary/45", children: [
                    i + 1,
                    "."
                  ] }),
                  xn(o)
                ]
              },
              o
            ))
          }
        ) : null
      ]
    }
  );
}
function I2({ drivers: a }) {
  const o = a.supportingArguments.slice(0, 5);
  return /* @__PURE__ */ d.jsxs("section", { "aria-label": Ue.drivers, className: "mt-5 space-y-3", children: [
    /* @__PURE__ */ d.jsx("h4", { className: "text-[11px] font-semibold uppercase tracking-wide text-embed-foreground-primary/45", children: Ue.drivers }),
    /* @__PURE__ */ d.jsxs("div", { children: [
      /* @__PURE__ */ d.jsx("p", { className: "text-xs text-embed-foreground-primary/55", children: Ue.selectedPriorities }),
      a.priorityIds.length === 0 ? /* @__PURE__ */ d.jsx("p", { className: "mt-1 text-sm text-embed-foreground-primary/60", children: Ue.noPriorities }) : /* @__PURE__ */ d.jsx("ul", { className: "mt-1 flex flex-wrap gap-2", children: a.priorityIds.map((i) => /* @__PURE__ */ d.jsx(
        "li",
        {
          className: "rounded-full bg-embed-background-primary px-2.5 py-1 text-xs font-medium text-embed-foreground-primary",
          children: xn(i)
        },
        i
      )) })
    ] }),
    (a.focusPriorityId !== null || a.focusSignalKind !== null) && /* @__PURE__ */ d.jsxs("p", { className: "text-sm text-embed-foreground-primary/75", children: [
      Ue.strongInfluence,
      ":",
      " ",
      /* @__PURE__ */ d.jsx("span", { className: "font-medium text-embed-foreground-primary", children: a.focusPriorityId !== null ? xn(a.focusPriorityId) : ge(a.focusSignalKind) }),
      a.focusSignalKind !== null && a.focusPriorityId !== null ? /* @__PURE__ */ d.jsxs("span", { className: "text-embed-foreground-primary/55", children: [
        " ",
        "(",
        ge(a.focusSignalKind),
        ")"
      ] }) : null
    ] }),
    o.length > 0 ? /* @__PURE__ */ d.jsxs("div", { children: [
      /* @__PURE__ */ d.jsx("p", { className: "text-xs text-embed-foreground-primary/55", children: Ue.supportingArguments }),
      /* @__PURE__ */ d.jsx("ul", { className: "mt-1 list-disc space-y-1 pl-4 text-sm text-embed-foreground-primary/70", children: o.map((i) => /* @__PURE__ */ d.jsx("li", { children: ge(i) }, i)) })
    ] }) : null
  ] });
}
function M2({ story: a, moves: o }) {
  return /* @__PURE__ */ d.jsxs("details", { className: "mt-5 group", children: [
    /* @__PURE__ */ d.jsx("summary", { className: "cursor-pointer list-none text-[11px] font-semibold uppercase tracking-wide text-embed-foreground-primary/55 marker:content-none [&::-webkit-details-marker]:hidden", children: /* @__PURE__ */ d.jsxs("span", { className: "inline-flex items-center gap-2", children: [
      /* @__PURE__ */ d.jsx("span", { "aria-hidden": "true", className: "text-embed-brand-gold group-open:rotate-90 transition-transform", children: "›" }),
      Ue.detailToggle
    ] }) }),
    /* @__PURE__ */ d.jsxs("section", { "aria-label": Ue.story, className: "mt-3 space-y-3", children: [
      /* @__PURE__ */ d.jsx("h4", { className: "text-[11px] font-semibold uppercase tracking-wide text-embed-foreground-primary/45", children: Ue.story }),
      /* @__PURE__ */ d.jsx("ol", { className: "space-y-2", children: a.chapters.map((i) => /* @__PURE__ */ d.jsxs(
        "li",
        {
          "data-chapter-order": i.order,
          className: "rounded-[8px] border border-embed-border-default/80 px-3 py-2",
          children: [
            /* @__PURE__ */ d.jsx("p", { className: "text-[10px] uppercase tracking-wide text-embed-foreground-primary/45", children: bj(i.kind) }),
            /* @__PURE__ */ d.jsx("p", { className: "mt-0.5 text-sm text-embed-foreground-primary", children: ge(i.key) })
          ]
        },
        i.id
      )) }),
      /* @__PURE__ */ d.jsx("h4", { className: "pt-2 text-[11px] font-semibold uppercase tracking-wide text-embed-foreground-primary/45", children: Ue.moves }),
      /* @__PURE__ */ d.jsx("ol", { className: "space-y-2", children: o.moves.map((i) => {
        const s = i.id === o.activeMoveId;
        return /* @__PURE__ */ d.jsxs(
          "li",
          {
            "data-move-order": i.order,
            "data-move-status": i.status,
            "aria-current": s ? "step" : void 0,
            className: `rounded-[8px] px-3 py-2 text-sm ${s ? "border border-embed-brand-gold/60 bg-embed-background-primary" : "border border-transparent bg-embed-background-primary/50"}`,
            children: [
              /* @__PURE__ */ d.jsxs("div", { className: "flex items-baseline justify-between gap-2", children: [
                /* @__PURE__ */ d.jsxs("span", { className: "font-medium text-embed-foreground-primary", children: [
                  i.order + 1,
                  ". ",
                  ge(i.objective)
                ] }),
                /* @__PURE__ */ d.jsx("span", { className: "shrink-0 text-[10px] uppercase tracking-wide text-embed-foreground-primary/50", children: hj(i.status) })
              ] }),
              /* @__PURE__ */ d.jsx("p", { className: "mt-1 text-xs text-embed-foreground-primary/60", children: ge(i.recommendedAction) })
            ]
          },
          i.id
        );
      }) }),
      /* @__PURE__ */ d.jsxs("p", { className: "text-xs text-embed-foreground-primary/55", children: [
        Ue.storyNext,
        ":",
        " ",
        ge(a.nextDecisionStep)
      ] })
    ] })
  ] });
}
function D2({ summary: a }) {
  return /* @__PURE__ */ d.jsxs("header", { "aria-label": "Shrnutí rozhodnutí", className: "space-y-2", children: [
    /* @__PURE__ */ d.jsx("p", { className: "text-[11px] font-semibold uppercase tracking-wide text-embed-brand-gold", children: Ue.title }),
    /* @__PURE__ */ d.jsx("h3", { className: "text-base font-semibold text-embed-foreground-primary", children: ge(a.recommendation) }),
    /* @__PURE__ */ d.jsxs("p", { className: "text-sm text-embed-foreground-primary/75", children: [
      lr(a.status),
      /* @__PURE__ */ d.jsx("span", { className: "mx-2 text-embed-border-strong", "aria-hidden": "true", children: "·" }),
      Ue.confidence,
      " ",
      Math.round(a.confidence * 100),
      " %"
    ] }),
    /* @__PURE__ */ d.jsx("p", { className: "text-sm leading-relaxed text-embed-foreground-primary/80", children: ge(a.primaryExplanation) }),
    a.focusRoomName !== null ? /* @__PURE__ */ d.jsxs("p", { className: "text-xs text-embed-foreground-primary/55", children: [
      Ue.focus,
      ": ",
      a.focusRoomName,
      /* @__PURE__ */ d.jsx("span", { className: "mx-1.5", "aria-hidden": "true", children: "·" }),
      ge(a.focusReason)
    ] }) : /* @__PURE__ */ d.jsx("p", { className: "text-xs text-embed-foreground-primary/55", children: ge(a.focusReason) }),
    /* @__PURE__ */ d.jsxs("p", { className: "text-sm font-medium text-embed-foreground-primary", children: [
      Ue.nextStep,
      ":",
      " ",
      ge(a.recommendedNextAction)
    ] })
  ] });
}
function Pi({ title: a, children: o }) {
  return /* @__PURE__ */ d.jsxs("article", { className: "rounded-[8px] border border-embed-border-default bg-embed-background-primary px-3 py-3", children: [
    /* @__PURE__ */ d.jsx("h5", { className: "text-[11px] font-semibold uppercase tracking-wide text-embed-foreground-primary/45", children: a }),
    /* @__PURE__ */ d.jsx("div", { className: "mt-2 text-sm text-embed-foreground-primary/80", children: o })
  ] });
}
function U2({ outcome: a }) {
  const o = a.strengths.slice(0, 5).map(ge), i = a.considerations.slice(0, 5).map(ge);
  return /* @__PURE__ */ d.jsxs(
    "section",
    {
      "aria-label": Ue.outcomes,
      className: "mt-5 grid grid-cols-2 gap-3 mobile:grid-cols-1",
      children: [
        /* @__PURE__ */ d.jsxs(Pi, { title: Ue.outcomeStatus, children: [
          /* @__PURE__ */ d.jsx("p", { className: "font-medium text-embed-foreground-primary", children: lr(a.status) }),
          /* @__PURE__ */ d.jsxs("p", { className: "mt-1 text-xs", children: [
            Ue.confidence,
            " ",
            Math.round(a.confidence * 100),
            " %"
          ] })
        ] }),
        /* @__PURE__ */ d.jsxs(Pi, { title: Ue.recommendation, children: [
          /* @__PURE__ */ d.jsx("p", { className: "font-medium text-embed-foreground-primary", children: ge(a.recommendation) }),
          /* @__PURE__ */ d.jsxs("p", { className: "mt-1 text-xs", children: [
            Ue.nextStep,
            ":",
            " ",
            ge(a.recommendedNextAction)
          ] })
        ] }),
        /* @__PURE__ */ d.jsx(Pi, { title: Ue.strengths, children: o.length === 0 ? /* @__PURE__ */ d.jsx("p", { className: "text-xs text-embed-foreground-primary/55", children: "—" }) : /* @__PURE__ */ d.jsx("ul", { className: "list-disc space-y-1 pl-4", children: o.map((s) => /* @__PURE__ */ d.jsx("li", { children: s }, s)) }) }),
        /* @__PURE__ */ d.jsx(Pi, { title: Ue.considerations, children: i.length === 0 ? /* @__PURE__ */ d.jsx("p", { className: "text-xs text-embed-foreground-primary/55", children: "—" }) : /* @__PURE__ */ d.jsx("ul", { className: "list-disc space-y-1 pl-4", children: i.map((s) => /* @__PURE__ */ d.jsx("li", { children: s }, s)) }) })
      ]
    }
  );
}
function L2() {
  const { experience: a } = ct(), o = a.context.decision, i = k2({
    terminal: o.terminal,
    story: o.story,
    moves: o.moves,
    focus: o.focus,
    priorityIds: o.priorityIds
  });
  return /* @__PURE__ */ d.jsxs(
    "aside",
    {
      className: `${w2} mobile:h-auto mobile:max-h-none`,
      style: { height: v2 },
      "data-terminal-id": i.terminalId,
      "data-testid": "decision-terminal",
      "data-priority-ids": o.priorityIds.join(","),
      "aria-label": "Rozhodovací terminál",
      children: [
        /* @__PURE__ */ d.jsx(C2, {}),
        /* @__PURE__ */ d.jsx(D2, { summary: i.summary }),
        /* @__PURE__ */ d.jsx(I2, { drivers: i.drivers }),
        /* @__PURE__ */ d.jsx(U2, { outcome: i.outcome }),
        /* @__PURE__ */ d.jsx(M2, { story: i.story, moves: i.moves })
      ]
    }
  );
}
function H2() {
  const a = cr();
  return a.focusPriority === null ? null : /* @__PURE__ */ d.jsxs(
    "aside",
    {
      "aria-label": "Recommendation banner",
      "data-testid": "pt002-recommendation-banner",
      "data-pt002-surface": "recommendation-banner",
      "data-pt003-context": "true",
      "data-pt002-primary": a.focusPriority,
      "data-pt003-focus": a.focusPriority,
      className: "mb-5 rounded-[8px] border-2 border-embed-brand-gold/50 bg-embed-brand-gold/10 px-4 py-3",
      children: [
        /* @__PURE__ */ d.jsx("p", { className: "text-[11px] font-semibold uppercase tracking-wide text-embed-brand-gold", children: "Experience lens" }),
        /* @__PURE__ */ d.jsx("p", { className: "mt-1 text-sm font-semibold text-embed-foreground-primary", children: a.headline }),
        /* @__PURE__ */ d.jsx("p", { className: "mt-1 text-sm leading-snug text-embed-foreground-primary/75", children: a.summary })
      ]
    }
  );
}
const qc = [
  { id: "ai-advisor", href: `#${Ne.aiAdvisor}` },
  { id: "spatial", href: `#${Ne.walkthrough}` },
  { id: "audit", href: `#${Ne.audit}` }
];
function B2(a) {
  const o = {
    headline: a.headline,
    body: a.summary,
    primaryLabel: a.focusPriority === null ? null : xn(a.focusPriority),
    secondaryLabel: a.secondaryPriority === null ? null : xn(a.secondaryPriority)
  }, i = a.recommendations.length === 0 ? qc.map((s) => ({
    ...s,
    label: s.id
  })) : a.recommendations.map((s, u) => {
    const f = qc[u % qc.length];
    return {
      id: `recommendation-${u}`,
      href: f.href,
      label: s
    };
  });
  return Object.freeze({
    context: a,
    interpretation: Object.freeze(o),
    recommendedSectionOrder: Object.freeze(i),
    highlight: Object.freeze({
      primaryPriorityId: a.focusPriority,
      relatedPriorityIds: Object.freeze(
        a.selectedPriorities.filter((s) => s !== a.focusPriority)
      )
    })
  });
}
function Ah() {
  return B2(cr());
}
const Y2 = "#D4AF37", $2 = "h-8 w-8";
function G2({ categoryId: a }) {
  const o = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: Y2,
    strokeWidth: 1.5,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className: $2,
    "aria-hidden": !0
  };
  switch (a) {
    case "energy":
      return /* @__PURE__ */ d.jsx("svg", { ...o, children: /* @__PURE__ */ d.jsx("path", { d: "M13 2 4.5 13.5H12l-.5 8.5L20.5 10H13l0-8z" }) });
    case "operating-costs":
      return /* @__PURE__ */ d.jsxs("svg", { ...o, children: [
        /* @__PURE__ */ d.jsx("circle", { cx: "12", cy: "12", r: "8" }),
        /* @__PURE__ */ d.jsx("path", { d: "M12 7v10M9.5 9.5c.8-1 2.2-1.5 3.5-1 1.5.6 2 2 1.2 3.2-.6.9-1.7 1.3-2.7 1.8-1 .5-2.1.9-2.7 1.8-.8 1.2-.3 2.6 1.2 3.2 1.3.5 2.7 0 3.5-1" })
      ] });
    case "layout":
      return /* @__PURE__ */ d.jsxs("svg", { ...o, children: [
        /* @__PURE__ */ d.jsx("rect", { x: "3.5", y: "3.5", width: "17", height: "17", rx: "1.5" }),
        /* @__PURE__ */ d.jsx("path", { d: "M3.5 10h17M10 10v10.5" })
      ] });
    case "privacy":
      return /* @__PURE__ */ d.jsxs("svg", { ...o, children: [
        /* @__PURE__ */ d.jsx("rect", { x: "5", y: "11", width: "14", height: "10", rx: "1.5" }),
        /* @__PURE__ */ d.jsx("path", { d: "M8 11V8a4 4 0 0 1 8 0v3" })
      ] });
    case "design":
      return /* @__PURE__ */ d.jsxs("svg", { ...o, children: [
        /* @__PURE__ */ d.jsx("path", { d: "M5 19 12 4l7 15" }),
        /* @__PURE__ */ d.jsx("path", { d: "M8.5 13h7" })
      ] });
    case "quality":
      return /* @__PURE__ */ d.jsx("svg", { ...o, children: /* @__PURE__ */ d.jsx("path", { d: "M12 3.5 14.2 9h5.8l-4.7 3.5 1.8 5.5L12 14.8 6.9 18l1.8-5.5L4 9h5.8L12 3.5z" }) });
    case "plot":
      return /* @__PURE__ */ d.jsxs("svg", { ...o, children: [
        /* @__PURE__ */ d.jsx("path", { d: "M4 20h16M6 20V10l6-5 6 5v10" }),
        /* @__PURE__ */ d.jsx("path", { d: "M10 20v-5h4v5" })
      ] });
    case "investment":
      return /* @__PURE__ */ d.jsxs("svg", { ...o, children: [
        /* @__PURE__ */ d.jsx("path", { d: "M4 18V6M4 18h16" }),
        /* @__PURE__ */ d.jsx("path", { d: "M7 14l4-4 3 3 5-6" })
      ] });
    case "maintenance":
      return /* @__PURE__ */ d.jsx("svg", { ...o, children: /* @__PURE__ */ d.jsx("path", { d: "M14.7 6.3a4.5 4.5 0 0 0-6.1 6.1L4 17l3 3 4.6-4.6a4.5 4.5 0 0 0 6.1-6.1l-2.5 2.5-2.5-2.5 2.5-2.5z" }) });
    case "flexibility":
      return /* @__PURE__ */ d.jsxs("svg", { ...o, children: [
        /* @__PURE__ */ d.jsx("path", { d: "M7 7h7a3 3 0 0 1 0 6H9" }),
        /* @__PURE__ */ d.jsx("path", { d: "M10 4 7 7l3 3" }),
        /* @__PURE__ */ d.jsx("path", { d: "M17 17H10a3 3 0 0 1 0-6h5" }),
        /* @__PURE__ */ d.jsx("path", { d: "M14 20 17 17l-3-3" })
      ] });
    default:
      return /* @__PURE__ */ d.jsx("svg", { ...o, children: /* @__PURE__ */ d.jsx("circle", { cx: "12", cy: "12", r: "8" }) });
  }
}
function Vc(a) {
  return Math.min(1, Math.max(0, a));
}
function q2({ value: a, onChange: o }) {
  const i = U.useRef(null), s = U.useCallback(
    (u) => {
      const f = i.current;
      if (f === null)
        return;
      const { left: p, width: h } = f.getBoundingClientRect();
      h !== 0 && o(Vc((u - p) / h));
    },
    [o]
  );
  return /* @__PURE__ */ d.jsx(
    "div",
    {
      className: "relative h-7 w-full shrink-0",
      onPointerDown: (u) => u.stopPropagation(),
      children: /* @__PURE__ */ d.jsxs(
        "div",
        {
          ref: i,
          role: "slider",
          "aria-valuemin": 0,
          "aria-valuemax": 100,
          "aria-valuenow": Math.round(a * 100),
          "aria-label": "Decision importance",
          tabIndex: 0,
          className: "group relative flex h-7 w-full cursor-pointer touch-none items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-embed-brand-gold/35 focus-visible:ring-offset-2",
          onKeyDown: (u) => {
            u.key === "ArrowLeft" && (u.preventDefault(), o(Vc(a - 0.05))), u.key === "ArrowRight" && (u.preventDefault(), o(Vc(a + 0.05)));
          },
          onPointerDown: (u) => {
            u.currentTarget.setPointerCapture(u.pointerId), s(u.clientX);
          },
          onPointerMove: (u) => {
            u.currentTarget.hasPointerCapture(u.pointerId) && s(u.clientX);
          },
          onPointerUp: (u) => {
            u.currentTarget.releasePointerCapture(u.pointerId);
          },
          children: [
            /* @__PURE__ */ d.jsx("div", { className: "absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-embed-border-default" }),
            /* @__PURE__ */ d.jsx(
              "div",
              {
                className: `absolute top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-embed-brand-gold ${al} transition-[width]`,
                style: { width: `${a * 100}%` }
              }
            ),
            /* @__PURE__ */ d.jsx(
              "div",
              {
                className: `absolute top-1/2 -translate-x-1/2 -translate-y-1/2 ${al} transition-[left]`,
                style: { left: `${a * 100}%` },
                children: /* @__PURE__ */ d.jsx("div", { className: "flex h-7 w-7 items-center justify-center", children: /* @__PURE__ */ d.jsx("div", { className: "h-3.5 w-3.5 rounded-full border-2 border-embed-brand-gold bg-embed-background-primary shadow-[0_1px_4px_rgba(0,30,58,0.12)] transition-shadow group-hover:shadow-[0_2px_6px_rgba(0,30,58,0.16)]" }) })
              }
            )
          ]
        }
      )
    }
  );
}
const V2 = "scale-[0.893]";
function F2({
  category: a,
  importance: o,
  isActive: i,
  isPrimary: s = !1,
  isRelated: u = !1,
  onImportanceChange: f,
  onToggle: p
}) {
  const h = s ? p2 : u ? b2 : "";
  return /* @__PURE__ */ d.jsxs(
    "div",
    {
      className: "relative shrink-0",
      style: { height: nd, width: nd },
      "data-pt002-highlight": s ? "primary" : u ? "related" : void 0,
      children: [
        s ? /* @__PURE__ */ d.jsx(
          "span",
          {
            className: "pointer-events-none absolute -top-2 left-1/2 z-20 -translate-x-1/2 rounded-sm bg-embed-brand-gold px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-[#001930]",
            "aria-hidden": "true",
            children: "Hlavní"
          }
        ) : null,
        /* @__PURE__ */ d.jsxs(
          "button",
          {
            type: "button",
            "aria-pressed": i,
            "aria-label": `${a.title} decision category${s ? ", hlavní priorita" : ""}`,
            onClick: p,
            className: `absolute inset-0 flex flex-col items-center overflow-hidden rounded-[8px] px-2.5 touch-manipulation transition-[transform,box-shadow,border-color,border-width] ${al} ${d2} ${h} ${i ? `${f2} justify-between py-2.5` : `${u2} ${m2} z-0 scale-100 justify-center py-3`}`,
            style: { transformOrigin: "center center" },
            children: [
              /* @__PURE__ */ d.jsxs("div", { className: "flex flex-col items-center gap-2.5", children: [
                /* @__PURE__ */ d.jsx(
                  "span",
                  {
                    className: `-mt-0.5 flex items-center justify-center leading-none ${i ? V2 : ""}`,
                    "aria-hidden": "true",
                    children: /* @__PURE__ */ d.jsx(G2, { categoryId: a.id })
                  }
                ),
                /* @__PURE__ */ d.jsx(
                  "span",
                  {
                    className: `max-w-[96px] text-center font-medium leading-snug tracking-wide ${i ? "text-[10px] text-embed-foreground-primary" : "text-[13px] text-embed-foreground-primary/70"}`,
                    children: a.title
                  }
                )
              ] }),
              /* @__PURE__ */ d.jsx(
                "div",
                {
                  className: `w-full transition-[opacity,transform,max-height] ${al} ${i ? "max-h-10 translate-y-0 pt-2 opacity-100" : "pointer-events-none max-h-0 translate-y-1 opacity-0"}`,
                  onClick: (y) => y.stopPropagation(),
                  onKeyDown: (y) => y.stopPropagation(),
                  children: i ? /* @__PURE__ */ d.jsx(q2, { value: o, onChange: f }) : null
                }
              )
            ]
          }
        )
      ]
    }
  );
}
function X2({
  cards: a,
  categories: o,
  setImportance: i,
  toggleCard: s
}) {
  const { highlight: u } = Ah(), f = new Set(u.relatedPriorityIds);
  return /* @__PURE__ */ d.jsx("div", { className: "flex min-w-0 flex-col self-start", children: /* @__PURE__ */ d.jsx(
    "div",
    {
      "aria-label": "Katalog priorit",
      "data-pt002-primary": u.primaryPriorityId ?? "",
      "data-pt002-related": u.relatedPriorityIds.join(","),
      className: "grid w-full max-w-[685px] grid-cols-5 justify-items-center overflow-visible mobile:grid-cols-2",
      style: { gap: jh },
      children: o.map((p) => {
        const h = a[p.id];
        if (h === void 0)
          return null;
        const y = u.primaryPriorityId === p.id, g = !y && f.has(p.id);
        return /* @__PURE__ */ d.jsx(
          F2,
          {
            category: p,
            importance: h.importance,
            isActive: h.selected,
            isPrimary: y,
            isRelated: g,
            onImportanceChange: (E) => i(p.id, E),
            onToggle: () => s(p.id)
          },
          p.id
        );
      })
    }
  ) });
}
function P2() {
  return Object.freeze({
    selected: Object.freeze([])
  });
}
function K2(a) {
  return Object.freeze({
    id: a.id,
    version: a.version,
    meaning: a.meaning,
    domain: a.domain
  });
}
function J(a, o, i, s = 1) {
  return K2({ id: a, version: s, meaning: o, domain: i });
}
const _h = Object.freeze([
  // Lens selection
  J("LENS_001", "lens.layout", "lens"),
  J("LENS_002", "lens.investment", "lens"),
  J("LENS_003", "lens.design", "lens"),
  J("LENS_004", "lens.energy", "lens"),
  J("LENS_005", "lens.baseline", "lens"),
  // Layout / family
  J("LAYOUT_001", "family.bedrooms", "layout"),
  J("LAYOUT_002", "family.garden", "layout"),
  J("LAYOUT_003", "family.bathrooms", "layout"),
  J("LAYOUT_004", "family.upper-floor", "layout"),
  J("LAYOUT_005", "family.storage", "layout"),
  J("LAYOUT_006", "family.household-fit", "layout"),
  J("LAYOUT_007", "family.privacy-vs-openness", "layout"),
  // Investment / price
  J("INVESTMENT_001", "investment.opex", "investment"),
  J("INVESTMENT_002", "investment.rental", "investment"),
  J("INVESTMENT_003", "investment.location", "investment"),
  J("PRICE_001", "investment.price", "investment"),
  J("INVESTMENT_004", "investment.roi", "investment"),
  J("INVESTMENT_005", "investment.yield-stability", "investment"),
  J("INVESTMENT_006", "investment.entry-cost-vs-yield", "investment"),
  J("INVESTMENT_007", "investment.indicators", "investment"),
  // Design / space / sunlight
  J("DESIGN_001", "design.materials", "design"),
  J("SPACE_001", "design.open-living", "design"),
  J("DESIGN_002", "design.details", "design"),
  J("DESIGN_003", "design.storage", "design"),
  J("SUNLIGHT_001", "design.glazing", "design"),
  J("DESIGN_004", "design.coherence", "design"),
  J("DESIGN_005", "design.clarity-vs-storage", "design"),
  J("DESIGN_006", "design.architectural-quality", "design"),
  // Energy / sustainability
  J("ENERGY_001", "sustainability.envelope", "energy"),
  J("ENERGY_002", "sustainability.heat-pump", "energy"),
  J("ENERGY_003", "sustainability.solar", "energy"),
  J("ENERGY_004", "sustainability.solar-not-included", "energy"),
  J("ENERGY_005", "sustainability.rainwater", "energy"),
  J("ENERGY_006", "sustainability.future-generation", "energy"),
  J("ENERGY_007", "sustainability.scope-vs-efficiency", "energy"),
  J("ENERGY_008", "sustainability.energy-features", "energy"),
  // Baseline
  J("BASELINE_001", "baseline.open-lens", "baseline"),
  J("BASELINE_002", "baseline.select-priority", "baseline"),
  J("BASELINE_003", "baseline.inactive-lens", "baseline"),
  // Confidence
  J("CONFIDENCE_001", "priority.coverage", "confidence"),
  // Intent
  J("INTENT_001", "intent.explore-layout", "intent"),
  J("INTENT_002", "intent.calculate-roi", "intent"),
  J("INTENT_003", "intent.explore-design", "intent"),
  J("INTENT_004", "intent.review-energy", "intent"),
  J("INTENT_005", "intent.select-priority", "intent")
]);
new Map(
  _h.map((a) => [a.id, a])
);
new Map(
  _h.map((a) => [a.meaning, a])
);
const Z2 = U.createContext(
  P2()
), Q2 = Z2.Provider;
function J2(a) {
  const o = Object.fromEntries(
    wo.map((s) => [
      s.id,
      { selected: !1, importance: uj }
    ])
  ), i = a.length;
  return a.forEach((s, u) => {
    o[s] !== void 0 && (o[s] = {
      selected: !0,
      importance: i <= 1 ? 1 : Number(((i - u) / i).toFixed(3))
    });
  }), o;
}
function W2() {
  const { experience: a } = ct(), [o, i] = U.useState(
    () => J2(a.context.decision.priorityIds)
  ), s = U.useCallback((h) => {
    i((y) => {
      const g = y[h];
      return g === void 0 ? y : {
        ...y,
        [h]: {
          ...g,
          selected: !g.selected
        }
      };
    });
  }, []), u = U.useCallback((h, y) => {
    const g = Math.min(1, Math.max(0, y));
    i((E) => {
      const O = E[h];
      return O === void 0 ? E : {
        ...E,
        [h]: {
          ...O,
          importance: g
        }
      };
    });
  }, []), f = U.useMemo(
    () => Object.values(o).filter((h) => h.selected).length,
    [o]
  ), p = f >= ob;
  return {
    cards: o,
    categories: wo,
    minimumMet: p,
    minimumSelection: ob,
    selectedCount: f,
    setImportance: u,
    toggleCard: s
  };
}
function eE(a) {
  const { dispatch: o, experience: i } = ct(), s = U.useRef(""), u = U.useMemo(() => wo.map((f) => f.id).filter((f) => {
    var p;
    return ((p = a[f]) == null ? void 0 : p.selected) === !0;
  }).sort((f, p) => {
    var y, g;
    const h = (((y = a[p]) == null ? void 0 : y.importance) ?? 0) - (((g = a[f]) == null ? void 0 : g.importance) ?? 0);
    return h !== 0 ? h : f.localeCompare(p);
  }), [a]);
  U.useEffect(() => {
    if (u.length === 0)
      return;
    const f = u.join(",");
    if (f === s.current)
      return;
    const p = i.context.decision.priorityIds.join(",");
    if (f === p) {
      s.current = f;
      return;
    }
    o({
      type: "ChangePriority",
      priorityIds: u
    }).ok && (s.current = f);
  }, [o, i.context.decision.priorityIds, u]);
}
const Oh = U.createContext(
  null
);
function tE({
  children: a
}) {
  const {
    cards: o,
    categories: i,
    setImportance: s,
    toggleCard: u,
    selectedCount: f,
    minimumSelection: p,
    minimumMet: h
  } = W2();
  eE(o);
  const y = U.useMemo(() => {
    const E = wo.map((O) => O.id).filter((O) => {
      var z;
      return (z = o[O]) == null ? void 0 : z.selected;
    }).map((O) => O);
    return Object.freeze({
      selected: Object.freeze(E)
    });
  }, [o]), g = {
    cards: o,
    categories: i,
    setImportance: s,
    toggleCard: u,
    priorities: y,
    selectedCount: f,
    minimumSelection: p,
    minimumMet: h
  };
  return /* @__PURE__ */ d.jsx(Oh.Provider, { value: g, children: /* @__PURE__ */ d.jsx(Q2, { value: y, children: a }) });
}
function zh() {
  const a = U.useContext(Oh);
  if (a === null)
    throw new Error(
      "usePriorityExperience must be used within PriorityExperienceProvider"
    );
  return a;
}
function nE() {
  const a = cr(), { recommendedSectionOrder: o } = Ah();
  return /* @__PURE__ */ d.jsxs(
    "section",
    {
      "aria-label": "Doporučené pořadí",
      "data-testid": "pt002-section-order",
      "data-pt002-surface": "section-order",
      "data-pt003-context": "true",
      "data-pt002-primary": a.focusPriority ?? "",
      "data-pt003-recommendations": a.recommendations.join("|"),
      "data-pt002-section-order": o.map((i) => i.id).join(","),
      className: "mt-5 rounded-[8px] border border-embed-border-default bg-embed-surface-elevated p-4",
      children: [
        /* @__PURE__ */ d.jsx("p", { className: "text-[11px] font-semibold uppercase tracking-wide text-embed-brand-gold", children: "Recommendations" }),
        /* @__PURE__ */ d.jsx("p", { className: "mt-1 text-xs text-embed-foreground-primary/55", children: "Decision Context — doporučená témata Experience" }),
        a.recommendations.length === 0 ? /* @__PURE__ */ d.jsx("p", { className: "mt-3 text-sm text-embed-foreground-primary/60", children: "Po výběru priorit se zde objeví doporučení z Decision Context." }) : /* @__PURE__ */ d.jsx("ol", { className: "mt-3 space-y-2", children: o.map((i, s) => /* @__PURE__ */ d.jsx("li", { children: /* @__PURE__ */ d.jsxs(
          "a",
          {
            href: i.href,
            "data-section-id": i.id,
            "data-section-rank": String(s + 1),
            className: "flex items-baseline gap-2 text-sm text-embed-foreground-primary transition-colors hover:text-embed-brand-gold",
            children: [
              /* @__PURE__ */ d.jsxs("span", { className: "tabular-nums text-embed-foreground-primary/45", children: [
                s + 1,
                "."
              ] }),
              /* @__PURE__ */ d.jsx("span", { className: s === 0 ? "font-semibold" : void 0, children: i.label })
            ]
          }
        ) }, `${i.id}-${i.label}`)) })
      ]
    }
  );
}
function aE() {
  const { minimumSelection: a } = zh();
  return /* @__PURE__ */ d.jsx("div", { className: y2, children: /* @__PURE__ */ d.jsxs("h2", { className: g2, children: [
    "CO JE PRO VÁS PODSTATNÉ? VYBERTE ",
    a,
    " PRIORITY."
  ] }) });
}
function rE() {
  const {
    cards: a,
    categories: o,
    setImportance: i,
    toggleCard: s,
    minimumMet: u
  } = zh(), { experience: f } = ct(), p = cr(), h = f.context.decision.terminal.id;
  return /* @__PURE__ */ d.jsxs(
    "section",
    {
      id: Ne.priority,
      tabIndex: -1,
      "aria-label": `${yx.priority} Experience`,
      "data-testid": "priority-experience",
      "data-terminal-id": h,
      "data-minimum-met": u ? "true" : "false",
      "data-pt002-primary": p.focusPriority ?? "",
      "data-pt003-focus": p.focusPriority ?? "",
      "data-pt003-recommendations": p.recommendations.join("|"),
      className: `relative scroll-mt-header ${sr} ${x2} ${h2}`,
      children: [
        /* @__PURE__ */ d.jsx(aE, {}),
        /* @__PURE__ */ d.jsx(H2, {}),
        /* @__PURE__ */ d.jsxs("div", { className: "grid grid-cols-[52fr_48fr] items-stretch gap-section mobile:grid-cols-1", children: [
          /* @__PURE__ */ d.jsx(
            X2,
            {
              cards: a,
              categories: o,
              setImportance: i,
              toggleCard: s
            }
          ),
          /* @__PURE__ */ d.jsx(L2, {})
        ] }),
        /* @__PURE__ */ d.jsx(nE, {}),
        /* @__PURE__ */ d.jsx(j2, {}),
        null,
        null
      ]
    }
  );
}
const Nh = U.createContext(null);
function db(a) {
  const o = a.findIndex((i) => i.kind === "photo");
  return o >= 0 ? o : 0;
}
function oE({ children: a }) {
  const { experience: o, dispatch: i } = ct(), { context: s } = o, u = s.activeRoom.id, f = s.roomMedia.thumbnails, p = s.floorPlan.rooms, h = s.navigation.floors, y = s.navigation.currentFloor ?? h[0] ?? "0", [g, E] = U.useState("video"), [O, z] = U.useState(0), [D, R] = U.useState("ready"), S = U.useRef(u), H = U.useRef(O);
  H.current = O, U.useEffect(() => {
    if (u === null || S.current === u) {
      S.current = u;
      return;
    }
    if (S.current = u, E("photo"), R("ready"), Xp(
      o.house,
      H.current
    ) === u)
      return;
    const $ = v1(
      o.house,
      u
    );
    z(
      $ ?? db(f)
    );
  }, [u, o.house, f]);
  const W = U.useMemo(() => {
    const pe = f, $ = pe[O] ?? null, re = ($ == null ? void 0 : $.src) ?? null, ue = u === null ? null : p.find((V) => V.id === u) ?? null;
    return {
      mode: D,
      mediaMode: g,
      activeRoomId: u,
      activeRoom: ue,
      activeMediaIndex: O,
      activeMediaItem: $,
      activeMediaSrc: re,
      roomMediaItems: pe,
      rooms: p,
      selectedFloor: y,
      isRoomActive: (V) => u === V,
      isMediaActive: (V) => O === V,
      play: () => R("playing"),
      onVideoEnded: () => R("ready"),
      selectRoom: (V) => {
        i({ type: "SelectRoom", roomId: V });
      },
      selectMediaIndex: (V) => {
        z(V);
        const P = pe[V];
        if ((P == null ? void 0 : P.kind) === "video")
          E("video");
        else if ((P == null ? void 0 : P.kind) === "photo") {
          E("photo");
          const _e = Xp(o.house, V);
          _e !== null && _e !== u && i({ type: "SelectRoom", roomId: _e });
        }
        R("ready");
      },
      setMediaMode: (V) => {
        if (E(V), R("ready"), V === "video") {
          z(0);
          return;
        }
        z(db(pe));
      }
    };
  }, [
    O,
    u,
    i,
    o.house,
    g,
    D,
    f,
    p,
    y
  ]);
  return /* @__PURE__ */ d.jsx(Nh.Provider, { value: W, children: a });
}
function So() {
  const a = U.useContext(Nh);
  if (a === null)
    throw new Error("useWalkthrough must be used within WalkthroughProvider");
  return a;
}
function Th(a) {
  return String(a);
}
function iE(a) {
  const { navigation: o, activeRoom: i } = a;
  return Object.freeze({
    rooms: o.rooms,
    activeRoom: i.room,
    activeRoomId: i.id,
    selectedFloor: o.currentFloor ?? o.floors[0] ?? "0",
    floors: o.floors
  });
}
function lE(a, o) {
  return a.activeRoomId === o;
}
function Rh(a, o) {
  return Object.freeze(
    a.rooms.filter((i) => Th(i.floor) === o)
  );
}
function sE(a, o) {
  return Rh(a, o)[0];
}
function vd() {
  const { experience: a, dispatch: o } = ct(), i = U.useMemo(
    () => iE(a.context),
    [a.context]
  ), s = U.useMemo(
    () => Rh(i, i.selectedFloor),
    [i]
  );
  U.useEffect(() => {
    vn("5.ComponentEvidence.Navigator", {
      activeRoomId: i.activeRoomId,
      selectedFloor: i.selectedFloor,
      floors: i.floors,
      roomIds: i.rooms.map((h) => h.id),
      roomNames: i.rooms.map((h) => h.name),
      floorRoomIds: s.map((h) => h.id)
    });
  }, [s, i]);
  const u = U.useCallback(
    (h) => {
      o({ type: "SelectRoom", roomId: h });
    },
    [o]
  ), f = U.useCallback(
    (h) => {
      const y = sE(i, h);
      y !== void 0 && o({ type: "SelectRoom", roomId: y.id });
    },
    [o, i]
  ), p = U.useCallback(
    (h) => lE(i, h),
    [i]
  );
  return {
    ...i,
    floorRooms: s,
    selectRoom: u,
    selectFloor: f,
    isRoomActive: p
  };
}
var cE = Db();
function kh({
  children: a,
  frameClassName: o,
  frameStyle: i,
  isOpen: s,
  label: u,
  onClose: f
}) {
  return U.useEffect(() => {
    if (!s)
      return;
    const p = (h) => {
      h.key === "Escape" && f();
    };
    return window.addEventListener("keydown", p), () => {
      window.removeEventListener("keydown", p);
    };
  }, [s, f]), s ? cE.createPortal(
    /* @__PURE__ */ d.jsx(
      "div",
      {
        "aria-label": u,
        "aria-modal": "true",
        className: "fixed inset-0 z-50 flex items-center justify-center bg-embed-brand-navy/70",
        role: "dialog",
        onClick: f,
        children: /* @__PURE__ */ d.jsxs(
          "div",
          {
            className: `relative ${o}`,
            style: i,
            "data-lightbox-frame": "",
            onClick: (p) => p.stopPropagation(),
            children: [
              /* @__PURE__ */ d.jsx(
                "button",
                {
                  type: "button",
                  "aria-label": "Zavřít",
                  className: "absolute right-0 top-0 z-20 flex h-10 w-10 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#001930] text-xl leading-none text-white shadow-sm transition-opacity duration-150 ease-out hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-embed-brand-gold/35 focus-visible:ring-offset-2",
                  onClick: f,
                  children: "×"
                }
              ),
              /* @__PURE__ */ d.jsx("div", { className: "h-full w-full", children: a })
            ]
          }
        )
      }
    ),
    document.querySelector("[data-client-studio-root]") ?? document.body
  ) : null;
}
function dE({
  children: a,
  isOpen: o,
  onClose: i,
  aspectRatio: s
}) {
  const u = s > 0 ? s : 1, f = {
    width: `min(90vw, calc(90vh * ${u}))`,
    height: `min(90vh, calc(90vw / ${u}))`,
    aspectRatio: String(u)
  };
  return /* @__PURE__ */ d.jsx(
    kh,
    {
      frameClassName: "overflow-hidden",
      frameStyle: f,
      isOpen: o,
      label: "Zvětšený půdorys",
      onClose: i,
      children: a
    }
  );
}
function Ch({
  onClick: a,
  label: o = "Zvětšit náhled",
  className: i = "absolute bottom-3 right-3 z-10",
  style: s
}) {
  return /* @__PURE__ */ d.jsx(
    "button",
    {
      type: "button",
      "aria-label": o,
      className: `flex h-[42px] w-[42px] cursor-pointer items-center justify-center rounded-[8px] border border-[#D4AF37] bg-white/90 transition-opacity duration-150 ease-out hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-embed-brand-gold/35 focus-visible:ring-offset-2 ${i}`,
      style: s,
      onClick: (u) => {
        u.stopPropagation(), a();
      },
      children: /* @__PURE__ */ d.jsxs(
        "svg",
        {
          viewBox: "0 0 24 24",
          "aria-hidden": "true",
          className: "h-[38px] w-[38px]",
          fill: "none",
          stroke: "#D4AF37",
          strokeWidth: "1.5",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          children: [
            /* @__PURE__ */ d.jsx("circle", { cx: "10.5", cy: "10.5", r: "5.75" }),
            /* @__PURE__ */ d.jsx("path", { d: "M15 15l4.25 4.25" })
          ]
        }
      )
    }
  );
}
function uE({
  onClick: a,
  className: o = "relative z-10",
  style: i
}) {
  return /* @__PURE__ */ d.jsx(
    Ch,
    {
      label: "Zvětšit půdorys",
      className: o,
      style: i,
      onClick: a
    }
  );
}
const mE = "#f5b90040", fE = "#f5b9007f", pE = 20;
function ub({ interactive: a, className: o }) {
  const { experience: i } = ct(), { selectedFloor: s, isRoomActive: u, activeRoomId: f } = vd(), { selectRoom: p } = So(), h = i.context.floorPlan, y = h.viewBoxWidth, g = h.viewBoxHeight, [E, O] = U.useState(null), z = h.rooms.filter(
    (R) => R.floorPlanRegion !== null && Th(R.floor) === s
  ), D = f === null ? null : z.find((R) => R.id === f) ?? null;
  return /* @__PURE__ */ d.jsxs(
    "svg",
    {
      viewBox: `0 0 ${y} ${g}`,
      preserveAspectRatio: "xMidYMid meet",
      "aria-label": `Půdorys · patro ${s}`,
      className: o,
      role: "img",
      "data-floorplan-src": h.src,
      "data-floor": s,
      children: [
        /* @__PURE__ */ d.jsx(
          "image",
          {
            href: h.src,
            width: y,
            height: g,
            preserveAspectRatio: "xMidYMid meet"
          },
          h.src
        ),
        D !== null && D.decisionCanvasSrc !== "" ? /* @__PURE__ */ d.jsx(
          "image",
          {
            href: D.decisionCanvasSrc,
            width: y,
            height: g,
            preserveAspectRatio: "xMidYMid meet",
            className: "transition-opacity duration-[125ms] ease-out"
          },
          `overlay-${D.id}`
        ) : null,
        z.map((R) => {
          const S = R.floorPlanRegion;
          if (S === null)
            return null;
          const { x: H, y: W, width: pe, height: $ } = S, re = u(R.id), ue = a && E === R.id;
          return /* @__PURE__ */ d.jsx(
            "rect",
            {
              x: H,
              y: W,
              width: pe,
              height: $,
              "aria-label": R.title,
              fill: re ? fE : ue ? mE : "transparent",
              stroke: "none",
              className: a ? "cursor-pointer touch-manipulation transition-[fill] duration-125 ease-out" : void 0,
              onClick: a ? () => p(R.id) : void 0,
              onPointerEnter: a ? () => {
                O(R.id);
              } : void 0,
              onPointerLeave: a ? () => {
                O(null);
              } : void 0
            },
            R.id
          );
        })
      ]
    }
  );
}
function bE() {
  const { experience: a } = ct(), { viewBoxWidth: o, viewBoxHeight: i } = a.context.floorPlan, [s, u] = U.useState(!1), f = i > 0 ? o / i : 1, p = `${o} / ${i}`;
  return U.useEffect(() => {
    const h = a.context.floorPlan;
    vn("5.ComponentEvidence.FloorPlan", {
      src: h.src,
      viewBoxWidth: h.viewBoxWidth,
      viewBoxHeight: h.viewBoxHeight,
      roomCount: h.rooms.length,
      firstRoom: h.rooms[0] ?? null,
      lastRoom: h.rooms[h.rooms.length - 1] ?? null,
      roomsWithRegions: h.rooms.filter((y) => y.floorPlanRegion !== null).map((y) => y.id)
    });
  }, [a.context.floorPlan]), /* @__PURE__ */ d.jsxs("div", { className: "relative flex w-full min-w-0 max-w-none shrink-0 flex-col", children: [
    /* @__PURE__ */ d.jsx(
      "div",
      {
        className: "relative w-full min-w-0 max-w-none",
        style: { aspectRatio: p },
        "data-floorplan-aspect": f.toFixed(4),
        children: /* @__PURE__ */ d.jsx(ub, { interactive: !0, className: "block h-full w-full" })
      }
    ),
    /* @__PURE__ */ d.jsx(
      "div",
      {
        className: "flex w-full shrink-0 justify-end",
        style: { marginTop: pE },
        children: /* @__PURE__ */ d.jsx(uE, { onClick: () => u(!0) })
      }
    ),
    /* @__PURE__ */ d.jsx(
      dE,
      {
        aspectRatio: f,
        isOpen: s,
        onClose: () => u(!1),
        children: /* @__PURE__ */ d.jsx(ub, { interactive: !1, className: "block h-full w-full" })
      }
    )
  ] });
}
const hE = [
  { value: "video", label: "VIDEO" },
  { value: "photo", label: "FOTKY" }
], Ih = "inline-flex w-full min-w-0 shrink-0 gap-0.5 rounded-[8px] border border-embed-border-default bg-[#E3E3E3] p-0.5";
function Mh(a) {
  return `flex-1 rounded-[6px] py-2 text-xs font-medium tracking-wide transition-colors duration-[125ms] ease-out touch-manipulation ${a ? "bg-[#E8E5E0] font-semibold text-[#001930]" : "bg-white font-normal text-[#001930] hover:bg-[#001930] hover:text-[#FFFFFF]"}`;
}
function yE() {
  const { mediaMode: a, setMediaMode: o } = So();
  return /* @__PURE__ */ d.jsx("div", { "aria-label": "Režim média", className: Ih, children: hE.map((i) => {
    const s = i.value === a;
    return /* @__PURE__ */ d.jsx(
      "button",
      {
        type: "button",
        "aria-pressed": s,
        className: Mh(s),
        onClick: () => o(i.value),
        children: i.label
      },
      i.value
    );
  }) });
}
function gE(a) {
  return a === "0" ? "PŘÍZEMÍ" : "PATRO";
}
function vE() {
  const { floors: a, selectedFloor: o, selectFloor: i } = vd();
  if (a.length < 2)
    return null;
  const s = o || a[0];
  return /* @__PURE__ */ d.jsx("div", { "aria-label": "Výběr patra", className: Ih, children: a.map((u) => {
    const f = u === s;
    return /* @__PURE__ */ d.jsx(
      "button",
      {
        type: "button",
        "aria-pressed": f,
        className: Mh(f),
        onClick: () => i(u),
        children: gE(u)
      },
      u
    );
  }) });
}
function xE() {
  return /* @__PURE__ */ d.jsxs(
    "section",
    {
      id: Ne.floorPlan,
      tabIndex: -1,
      "aria-label": "Půdorys",
      className: `scroll-mt-header ${N2}`,
      children: [
        /* @__PURE__ */ d.jsx("div", { className: gd, "aria-hidden": "true", children: /* @__PURE__ */ d.jsx("span", { className: "invisible", children: "." }) }),
        /* @__PURE__ */ d.jsx(bE, {}),
        /* @__PURE__ */ d.jsx("div", { className: R2, "aria-hidden": "true" }),
        /* @__PURE__ */ d.jsx("div", { className: `${Eh} justify-center pb-1`, children: /* @__PURE__ */ d.jsx("div", { className: A2, children: /* @__PURE__ */ d.jsx(vE, {}) }) })
      ]
    }
  );
}
const mb = 62, wE = "ease-out";
function SE(a) {
  const [o, i] = U.useState(a), [s, u] = U.useState(1), f = U.useRef(!0);
  return U.useEffect(() => {
    if (f.current) {
      f.current = !1;
      return;
    }
    if (a === o)
      return;
    u(0);
    const p = window.setTimeout(() => {
      i(a), u(1);
    }, mb);
    return () => {
      window.clearTimeout(p);
    };
  }, [o, a]), { displayKey: o, opacity: s, phaseMs: mb };
}
const jE = "aspect-video w-[min(90vw,calc(90vh*16/9))] max-h-[90vh] max-w-[90vw]";
function EE({
  alt: a,
  isOpen: o,
  kind: i,
  onClose: s,
  poster: u,
  src: f
}) {
  return /* @__PURE__ */ d.jsx(
    kh,
    {
      frameClassName: jE,
      isOpen: o,
      label: "Zvětšený náhled",
      onClose: s,
      children: i === "photo" ? /* @__PURE__ */ d.jsx("img", { alt: a, className: "h-full w-full object-contain", src: f }) : /* @__PURE__ */ d.jsx(
        "video",
        {
          src: f,
          poster: u,
          controls: !0,
          playsInline: !0,
          autoPlay: !0,
          className: "h-full w-full object-contain"
        },
        f
      )
    }
  );
}
function AE({ onClick: a }) {
  return /* @__PURE__ */ d.jsx(Ch, { label: "Zvětšit náhled", onClick: a });
}
function _E({ onPlay: a }) {
  return /* @__PURE__ */ d.jsx(
    "button",
    {
      type: "button",
      "aria-label": "Přehrát video",
      className: "group absolute inset-0 flex cursor-pointer items-center justify-center border-0 bg-transparent p-0",
      onClick: a,
      children: /* @__PURE__ */ d.jsx("span", { className: "flex h-16 w-16 items-center justify-center rounded-full bg-embed-background-primary/90 shadow-md transition-[transform,opacity] duration-150 ease-out group-hover:scale-[1.04] group-hover:opacity-95", children: /* @__PURE__ */ d.jsx(
        "svg",
        {
          viewBox: "0 0 24 24",
          "aria-hidden": "true",
          className: "ml-1 h-7 w-7 fill-embed-foreground-primary",
          children: /* @__PURE__ */ d.jsx("path", { d: "M8 5.14v13.72L19 12 8 5.14z" })
        }
      ) })
    }
  );
}
function OE(a, o, i) {
  return a === "photo" && i !== null && i.length > 0 ? `photo|${i}` : a === "video" && i !== null && i.length > 0 ? `video|${i}` : `video|intro|${o}`;
}
function zE(a) {
  if (!a.startsWith("photo|"))
    return null;
  const o = a.slice(6);
  return o.length === 0 || o === "null" || o === "undefined" ? null : o;
}
function NE(a) {
  return a.includes("fast.wistia.net/embed") || a.includes("wistia.com/embed");
}
function TE() {
  var fe, be, x;
  const { experience: a } = ct(), o = a.context.roomMedia, {
    mode: i,
    mediaMode: s,
    activeMediaIndex: u,
    play: f,
    onVideoEnded: p
  } = So(), h = U.useRef(null), [y, g] = U.useState(!1), [E, O] = U.useState(!1), [z, D] = U.useState(!1), [R, S] = U.useState(!0);
  U.useEffect(() => {
    vn("3.GalleryRuntime.beforeMainMedia", {
      activeRoomId: o.roomId,
      roomMediaTitle: o.title,
      heroUrl: o.heroUrl,
      videoUrl: o.videoUrl,
      thumbnails: o.thumbnails.map((T, Y) => ({
        index: Y,
        kind: T.kind,
        src: T.src
      })),
      houseMediaIds: a.house.media.map((T) => T.id),
      globalGalleryPhotos: o.gallery.map((T) => ({
        id: T.id,
        url: T.url
      }))
    }), vn("5.ComponentEvidence.MainMedia", {
      roomId: o.roomId,
      title: o.title,
      heroUrl: o.heroUrl,
      videoUrl: o.videoUrl,
      photoCount: o.gallery.length,
      videoCount: o.videos.length,
      thumbnailCount: o.thumbnails.length,
      firstThumbnail: o.thumbnails[0] ?? null,
      lastThumbnail: o.thumbnails[o.thumbnails.length - 1] ?? null
    });
  }, [a.house.media, o]);
  const H = (() => {
    const T = o.thumbnails[u] ?? null;
    return s !== "photo" || T !== null && T.kind === "photo" ? T : o.thumbnails.find((Y) => Y.kind === "photo") ?? T;
  })(), W = (H == null ? void 0 : H.src) ?? null, pe = o.roomId, $ = ((fe = o.thumbnails.find((T) => T.kind === "video")) == null ? void 0 : fe.src) ?? o.videoUrl ?? ((be = o.videos[0]) == null ? void 0 : be.url) ?? "", re = ((x = o.thumbnails.find((T) => T.kind === "photo")) == null ? void 0 : x.thumbnailSrc) ?? "", ue = `${$}|${s}`, V = OE(s, i, W), { displayKey: P, opacity: _e, phaseMs: ot } = SE(V);
  U.useEffect(() => {
    g(!1), D(!1), S(!0);
  }, [s, $, i, W]), U.useEffect(() => {
    const T = h.current;
    T === null || s !== "video" || (T.pause(), T.currentTime = 0, T.load(), i === "playing" && T.play());
  }, [s, i, ue, $]);
  const We = zE(P) ?? (s === "photo" ? W : null), Ye = s === "photo" && We !== null && We.length > 0, Te = s === "video" && !Ye && NE($), dt = s === "video" && !y && !Te, xt = s === "video" && y && !Te, Ke = Ye ? o.title ?? "Fotografie místnosti" : "Náhled procházky domem", C = () => {
    if (i === "ready") {
      f();
      return;
    }
    const T = h.current;
    T !== null && T.play();
  }, B = () => {
    g(!0);
  }, K = () => {
    i === "playing" && p();
  };
  return /* @__PURE__ */ d.jsxs("div", { className: T2, children: [
    /* @__PURE__ */ d.jsxs(
      "div",
      {
        className: "absolute inset-0 transition-opacity",
        style: {
          opacity: _e,
          transitionDuration: `${ot}ms`,
          transitionTimingFunction: wE
        },
        "data-room-id": pe ?? void 0,
        children: [
          z ? /* @__PURE__ */ d.jsx(
            "div",
            {
              className: "flex h-full w-full items-center justify-center bg-embed-surface-muted px-4 text-center text-sm text-embed-foreground-primary/55",
              role: "status",
              "aria-live": "polite",
              children: "Médium se nepodařilo načíst"
            }
          ) : Ye ? /* @__PURE__ */ d.jsx(
            "img",
            {
              src: We,
              alt: Ke,
              className: "h-full w-full object-cover",
              "data-walkthrough-mode": i,
              "data-media-mode": s,
              onLoad: () => S(!1),
              onError: () => {
                S(!1), D(!0);
              }
            }
          ) : Te ? /* @__PURE__ */ d.jsx(
            "iframe",
            {
              src: $,
              title: o.title ?? "Video prohlídka",
              className: "h-full w-full border-0",
              allow: "autoplay; fullscreen",
              allowFullScreen: !0,
              onLoad: () => {
                S(!1), g(!0);
              },
              "data-walkthrough-mode": i,
              "data-media-mode": s
            },
            ue
          ) : /* @__PURE__ */ d.jsxs(d.Fragment, { children: [
            /* @__PURE__ */ d.jsx(
              "video",
              {
                ref: h,
                src: $,
                poster: re,
                controls: xt,
                className: "h-full w-full object-cover",
                playsInline: !0,
                preload: "metadata",
                onPlay: B,
                onEnded: K,
                onLoadedData: () => S(!1),
                onError: () => {
                  S(!1), D(!0);
                },
                "data-walkthrough-mode": i,
                "data-media-mode": s
              },
              ue
            ),
            dt ? /* @__PURE__ */ d.jsx(_E, { onPlay: C }) : null
          ] }),
          R && !z ? /* @__PURE__ */ d.jsx(
            "div",
            {
              className: "pointer-events-none absolute inset-0 flex items-center justify-center bg-embed-surface-muted/80 text-sm text-embed-foreground-primary/55",
              role: "status",
              "aria-live": "polite",
              children: "Načítám médium…"
            }
          ) : null
        ]
      }
    ),
    !z && !Te ? /* @__PURE__ */ d.jsx(AE, { onClick: () => O(!0) }) : null,
    /* @__PURE__ */ d.jsx(
      EE,
      {
        alt: Ke,
        isOpen: E && !z && !Te,
        kind: Ye ? "photo" : "video",
        poster: re,
        src: Ye ? We : $,
        onClose: () => O(!1)
      }
    )
  ] });
}
function RE({ title: a }) {
  return /* @__PURE__ */ d.jsx("h2", { className: gd, children: a });
}
const Zn = 4, xd = 330, Ki = /* @__PURE__ */ new WeakMap();
function kE(a) {
  return a < 0.5 ? 4 * a * a * a : 1 - Math.pow(-2 * a + 2, 3) / 2;
}
function ad(a, o, i) {
  const s = a.scrollLeft, u = o - s;
  if (Math.abs(u) < 0.5 || i <= 0) {
    a.scrollLeft = o;
    return;
  }
  const f = Ki.get(a);
  f !== void 0 && window.cancelAnimationFrame(f);
  const p = performance.now(), h = (y) => {
    const g = y - p, E = Math.min(1, g / i);
    if (a.scrollLeft = s + u * kE(E), E < 1) {
      Ki.set(a, window.requestAnimationFrame(h));
      return;
    }
    Ki.delete(a);
  };
  Ki.set(a, window.requestAnimationFrame(h));
}
function CE(a, o, i = xd) {
  const s = o.offsetLeft, u = s + o.offsetWidth, f = a.scrollLeft, p = f + a.clientWidth;
  if (s < f) {
    ad(a, s, i);
    return;
  }
  u > p && ad(
    a,
    u - a.clientWidth,
    i
  );
}
function IE(a) {
  U.useEffect(() => {
    const o = a.current;
    if (o === null)
      return;
    const i = (s) => {
      if (o.scrollWidth <= o.clientWidth)
        return;
      Math.abs(s.deltaY) > Math.abs(s.deltaX) && (s.preventDefault(), o.scrollLeft += s.deltaY);
    };
    return o.addEventListener("wheel", i, { passive: !1 }), () => {
      o.removeEventListener("wheel", i);
    };
  }, [a]);
}
function ME(a, o, i, s) {
  const u = U.useRef(i);
  U.useEffect(() => {
    const f = a.current, p = o.current.get(i);
    if (f === null || p === void 0)
      return;
    const h = u.current === i;
    u.current = i, CE(
      f,
      p,
      h ? 0 : xd
    );
  }, [i, a, s, o]);
}
function DE(a, o, i) {
  const s = Math.max(0, o - Zn), [u, f] = U.useState(0);
  U.useEffect(() => {
    f(0);
    const y = a.current;
    y !== null && (y.scrollLeft = 0);
  }, [a, o]), U.useEffect(() => {
    const y = a.current;
    if (y === null || i <= 0)
      return;
    const g = () => {
      const E = Math.round(y.scrollLeft / i);
      f(Math.min(s, Math.max(0, E)));
    };
    return y.addEventListener("scroll", g, { passive: !0 }), () => {
      y.removeEventListener("scroll", g);
    };
  }, [a, s, i]);
  const p = U.useCallback(
    (y, g = "smooth") => {
      const E = a.current, O = Math.min(s, Math.max(0, y));
      f(O), E !== null && ad(E, O * i, xd);
    },
    [a, s, i]
  ), h = U.useCallback(
    (y) => {
      p(u + y);
    },
    [p, u]
  );
  return {
    canScrollLeft: u > 0,
    canScrollRight: u < s,
    scrollGroup: h,
    scrollToSlot: p
  };
}
const xa = 16, wd = 48, UE = nl - wd * 2, or = Math.floor(
  (Math.min(
    Zn * l2 + (Zn - 1) * xa,
    UE
  ) - (Zn - 1) * xa) / Zn
), fb = Zn * or + (Zn - 1) * xa, LE = or + xa, HE = "#D4AF37", pb = `box-border w-full min-w-0 shrink-0 ${E2}`, BE = "h-[80px] shrink-0 overflow-hidden rounded-[8px] border-2 transition-[border-color] duration-[125ms] ease-out";
function YE({ direction: a }) {
  return /* @__PURE__ */ d.jsx(
    "svg",
    {
      viewBox: "0 0 24 24",
      "aria-hidden": "true",
      width: 40,
      height: 40,
      fill: "none",
      stroke: HE,
      strokeWidth: "1.75",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: a === "left" ? /* @__PURE__ */ d.jsx("path", { d: "M15 6l-6 6 6 6" }) : /* @__PURE__ */ d.jsx("path", { d: "M9 6l6 6-6 6" })
    }
  );
}
function bb({ direction: a, onClick: o }) {
  return /* @__PURE__ */ d.jsx(
    "button",
    {
      type: "button",
      "aria-label": a === "left" ? "Předchozí náhledy" : "Další náhledy",
      className: "flex shrink-0 cursor-pointer items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-embed-brand-gold/35 focus-visible:ring-offset-2",
      style: { width: wd, height: 80 },
      onClick: o,
      children: /* @__PURE__ */ d.jsx(YE, { direction: a })
    }
  );
}
function Zi() {
  return /* @__PURE__ */ d.jsx("div", { "aria-hidden": "true", className: "shrink-0", style: { width: wd } });
}
function $E() {
  const { experience: a } = ct(), o = a.context.roomMedia, {
    activeMediaIndex: i,
    isMediaActive: s,
    selectMediaIndex: u
  } = So(), f = U.useRef(null), p = U.useRef(/* @__PURE__ */ new Map()), h = o.thumbnails, y = h.length;
  IE(f), ME(f, p, i, y);
  const { canScrollLeft: g, canScrollRight: E, scrollGroup: O } = DE(
    f,
    y,
    LE
  ), z = U.useCallback((R) => (S) => {
    if (S === null) {
      p.current.delete(R);
      return;
    }
    p.current.set(R, S);
  }, []);
  if (y === 0)
    return /* @__PURE__ */ d.jsx(
      "div",
      {
        className: pb,
        style: { maxWidth: nl },
        children: /* @__PURE__ */ d.jsxs("div", { className: "flex items-center justify-center", children: [
          /* @__PURE__ */ d.jsx(Zi, {}),
          /* @__PURE__ */ d.jsx(
            "div",
            {
              className: "flex h-[80px] items-stretch",
              style: { width: fb, gap: xa },
              children: Array.from({ length: Zn }, (R, S) => /* @__PURE__ */ d.jsx(
                "div",
                {
                  className: "rounded-[8px] border border-embed-border-default bg-embed-background-tertiary/60",
                  style: { width: or, height: 80 }
                },
                S
              ))
            }
          ),
          /* @__PURE__ */ d.jsx(Zi, {})
        ] })
      }
    );
  const D = y * or + Math.max(0, y - 1) * xa;
  return /* @__PURE__ */ d.jsx(
    "div",
    {
      className: pb,
      style: { maxWidth: nl },
      children: /* @__PURE__ */ d.jsxs("div", { className: "flex items-center justify-center", children: [
        g ? /* @__PURE__ */ d.jsx(bb, { direction: "left", onClick: () => O(-1) }) : /* @__PURE__ */ d.jsx(Zi, {}),
        /* @__PURE__ */ d.jsx(
          "div",
          {
            ref: f,
            "aria-label": "Náhledy médií",
            className: "h-[80px] overflow-x-auto overflow-y-hidden overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
            role: "region",
            style: { width: fb },
            children: /* @__PURE__ */ d.jsx(
              "div",
              {
                className: "flex h-full",
                style: {
                  gap: xa,
                  width: D,
                  minWidth: D
                },
                children: h.map((R, S) => {
                  const H = s(S);
                  return /* @__PURE__ */ d.jsx(
                    "button",
                    {
                      ref: z(S),
                      type: "button",
                      "aria-label": R.kind === "video" ? "Video prohlídky" : "Fotografie",
                      "aria-pressed": H,
                      className: `${BE} ${H ? "border-embed-brand-gold" : "border-embed-border-default hover:border-embed-brand-gold/50"}`,
                      style: {
                        width: or,
                        minWidth: or
                      },
                      onClick: () => u(S),
                      children: R.kind === "video" ? /* @__PURE__ */ d.jsxs("div", { className: "relative h-full w-full bg-embed-background-tertiary", children: [
                        /* @__PURE__ */ d.jsx("img", { src: R.thumbnailSrc, alt: "", className: "h-full w-full object-cover" }),
                        /* @__PURE__ */ d.jsx("span", { className: "absolute inset-0 flex items-center justify-center bg-embed-foreground-primary/10", children: /* @__PURE__ */ d.jsx(
                          "svg",
                          {
                            viewBox: "0 0 24 24",
                            "aria-hidden": "true",
                            className: "h-5 w-5 fill-embed-foreground-primary",
                            children: /* @__PURE__ */ d.jsx("path", { d: "M8 5.14v13.72L19 12 8 5.14z" })
                          }
                        ) })
                      ] }) : /* @__PURE__ */ d.jsx("img", { src: R.thumbnailSrc, alt: "", className: "h-full w-full object-cover" })
                    },
                    S
                  );
                })
              }
            )
          }
        ),
        E ? /* @__PURE__ */ d.jsx(bb, { direction: "right", onClick: () => O(1) }) : /* @__PURE__ */ d.jsx(Zi, {})
      ] })
    }
  );
}
function GE() {
  return /* @__PURE__ */ d.jsx(
    "section",
    {
      "aria-label": "Media Explorer",
      className: O2,
      children: /* @__PURE__ */ d.jsxs(
        "div",
        {
          className: `${z2} flex min-h-0 flex-1 flex-col content-start`,
          children: [
            /* @__PURE__ */ d.jsx(RE, { title: "PROCHÁZKA DOMEM" }),
            /* @__PURE__ */ d.jsx(TE, {}),
            /* @__PURE__ */ d.jsx("div", { className: "mt-auto w-full shrink-0", children: /* @__PURE__ */ d.jsx($E, {}) })
          ]
        }
      )
    }
  );
}
function qE(a) {
  return `${a.toLocaleString("cs-CZ")} m²`;
}
function VE() {
  const { floorRooms: a, isRoomActive: o, selectedFloor: i } = vd(), { selectRoom: s } = So();
  return /* @__PURE__ */ d.jsx(
    "nav",
    {
      "aria-label": "Místnosti",
      "data-floor": i,
      className: "flex min-h-0 min-w-0 w-full flex-col justify-start overflow-hidden overflow-y-auto rounded-[8px] border border-embed-border-default divide-y divide-embed-border-default shadow-none mobile:w-full",
      children: a.map((u) => {
        const f = o(u.id);
        return /* @__PURE__ */ d.jsxs(
          "button",
          {
            type: "button",
            "aria-pressed": f,
            "data-room-id": u.id,
            "data-active": f ? "true" : "false",
            className: `flex min-h-[36px] w-full items-baseline justify-between gap-2 border-0 py-1.5 pl-2.5 pr-2 text-left text-[13px] leading-snug tracking-wide shadow-none transition-colors duration-[125ms] ease-out touch-manipulation ${f ? "bg-embed-surface-interactive font-semibold text-embed-foreground-primary" : "bg-transparent font-normal text-embed-foreground-primary hover:bg-embed-brand-navy hover:text-embed-action-onPrimary"}`,
            onClick: () => s(u.id),
            children: [
              /* @__PURE__ */ d.jsx("span", { className: "min-w-0 translate-y-[2px] truncate", children: u.name }),
              u.area > 0 ? /* @__PURE__ */ d.jsx("span", { className: "shrink-0 translate-y-[2px] tabular-nums opacity-80", children: qE(u.area) }) : null
            ]
          },
          u.id
        );
      })
    }
  );
}
function FE() {
  return /* @__PURE__ */ d.jsxs(
    "section",
    {
      "aria-label": "Seznam místností",
      className: "relative z-20 flex h-full min-w-0 shrink-0 flex-col content-start items-stretch gap-0 overflow-x-hidden pb-section pl-10 pr-5",
      children: [
        /* @__PURE__ */ d.jsx("div", { className: gd, "aria-hidden": "true", children: /* @__PURE__ */ d.jsx("span", { className: "invisible", children: "." }) }),
        /* @__PURE__ */ d.jsx("div", { className: "flex min-h-0 flex-1 flex-col justify-start pt-0", children: /* @__PURE__ */ d.jsx(VE, {}) }),
        /* @__PURE__ */ d.jsx("div", { className: `${Eh} pb-1`, children: /* @__PURE__ */ d.jsx("div", { className: `${_2} z-20`, children: /* @__PURE__ */ d.jsx(yE, {}) }) })
      ]
    }
  );
}
function XE() {
  return /* @__PURE__ */ d.jsxs(
    "div",
    {
      id: Ne.walkthrough,
      tabIndex: -1,
      className: `scroll-mt-header grid w-full min-w-0 items-stretch gap-0 ${sr} max-[1279px]:grid-cols-1 max-[1279px]:divide-y max-[1279px]:divide-embed-border-default mobile:grid-cols-1 mobile:divide-y mobile:divide-embed-border-default [&>[aria-label='Seznam místností']]:border-r [&>[aria-label='Seznam místností']]:border-embed-border-default max-[1279px]:[&>[aria-label='Seznam místností']]:border-r-0 mobile:[&>[aria-label='Seznam místností']]:border-r-0`,
      style: {
        gridTemplateColumns: `${wh}px ${Sh}px ${o2}px`
      },
      children: [
        /* @__PURE__ */ d.jsx(GE, {}),
        /* @__PURE__ */ d.jsx(FE, {}),
        /* @__PURE__ */ d.jsx(xE, {})
      ]
    }
  );
}
function Dh({
  legacyExperience: a = null,
  onLegacySelectChoice: o,
  onLegacyContinue: i,
  runtime: s
}) {
  return /* @__PURE__ */ d.jsx(Dx, { children: /* @__PURE__ */ d.jsx(M1, { runtime: s, children: /* @__PURE__ */ d.jsx(U1, { children: /* @__PURE__ */ d.jsxs(oE, { children: [
    /* @__PURE__ */ d.jsx(Lx, {}),
    /* @__PURE__ */ d.jsxs(D1, { children: [
      a !== null && o !== void 0 && i !== void 0 ? /* @__PURE__ */ d.jsx(
        B1,
        {
          experience: a,
          onSelectChoice: o,
          onContinue: i
        }
      ) : null,
      /* @__PURE__ */ d.jsx(Hj, {}),
      /* @__PURE__ */ d.jsx($i, {}),
      /* @__PURE__ */ d.jsx(XE, {}),
      /* @__PURE__ */ d.jsx($i, {}),
      /* @__PURE__ */ d.jsxs(tE, { children: [
        /* @__PURE__ */ d.jsx(rE, {}),
        /* @__PURE__ */ d.jsxs(d.Fragment, { children: [
          /* @__PURE__ */ d.jsx($i, {}),
          /* @__PURE__ */ d.jsx(Oj, {})
        ] })
      ] }),
      /* @__PURE__ */ d.jsx($i, {}),
      /* @__PURE__ */ d.jsx(n2, {})
    ] })
  ] }) }) }) });
}
function PE(a) {
  return a.current ? "●" : a.visited ? "✓" : "○";
}
function KE({ decision: a, onSelect: o }) {
  const i = PE(a);
  return /* @__PURE__ */ d.jsxs(
    "button",
    {
      type: "button",
      onClick: () => o(a.id),
      "aria-current": a.current ? "step" : void 0,
      className: [
        "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm tracking-wide transition-opacity duration-150 ease-out",
        a.current ? "bg-embed-background-primary/15 font-medium text-embed-brand-gold" : a.visited ? "text-embed-background-primary/90 hover:bg-embed-background-primary/10" : "text-embed-background-primary/45 hover:bg-embed-background-primary/10 hover:text-embed-background-primary/70"
      ].join(" "),
      children: [
        /* @__PURE__ */ d.jsx("span", { className: "w-4 shrink-0 text-center", "aria-hidden": "true", children: i }),
        /* @__PURE__ */ d.jsx("span", { children: a.title })
      ]
    }
  );
}
function ZE({ decisions: a, onSelect: o }) {
  return /* @__PURE__ */ d.jsx("ul", { className: "flex flex-col gap-0.5", children: a.map((i) => /* @__PURE__ */ d.jsx("li", { children: /* @__PURE__ */ d.jsx(KE, { decision: i, onSelect: o }) }, i.id)) });
}
function QE({
  experience: a,
  onSelectDecision: o
}) {
  return /* @__PURE__ */ d.jsxs("nav", { "aria-label": "Decision Flow", className: "flex flex-col px-2", children: [
    /* @__PURE__ */ d.jsx("h2", { className: "px-3 pb-3 text-xs font-medium uppercase tracking-wide text-embed-background-primary/55", children: "Decision Flow" }),
    /* @__PURE__ */ d.jsx(
      ZE,
      {
        decisions: a.decisionFlow,
        onSelect: o
      }
    )
  ] });
}
const JE = 48;
function Uh({
  legacyExperience: a = null,
  onSelectDecision: o
}) {
  const i = a !== null && o !== void 0, s = U.useMemo(
    () => gx.filter(
      (p) => p.id !== "ai-advisor" || hx.showAiAdvisor
    ),
    []
  ), u = U.useMemo(
    () => s.map((p) => p.id),
    [s]
  ), f = L1(u);
  return /* @__PURE__ */ d.jsxs(
    "aside",
    {
      className: "flex h-full min-h-screen w-sidebar shrink-0 flex-col bg-embed-brand-navy",
      style: { width: JE },
      "data-studio-shell": "sidebar",
      "aria-label": "Navigace Client Studia",
      children: [
        /* @__PURE__ */ d.jsx("div", { className: "flex h-header shrink-0 items-center justify-center", children: /* @__PURE__ */ d.jsx(
          "span",
          {
            className: "block h-2 w-2 rounded-full bg-embed-brand-gold",
            "aria-hidden": "true"
          }
        ) }),
        i ? /* @__PURE__ */ d.jsx(
          "div",
          {
            className: "mt-section overflow-y-auto",
            "data-legacy-experience": "command-runtime-sidebar",
            children: /* @__PURE__ */ d.jsx(
              QE,
              {
                experience: a,
                onSelectDecision: o
              }
            )
          }
        ) : /* @__PURE__ */ d.jsx(
          "nav",
          {
            className: "mt-section flex flex-1 flex-col items-center gap-2",
            "aria-label": "Sekce Decision Journey",
            children: s.map((p) => {
              const h = f === p.id;
              return /* @__PURE__ */ d.jsx(
                "button",
                {
                  type: "button",
                  title: p.label,
                  "aria-label": p.label,
                  "aria-current": h ? "true" : void 0,
                  onClick: () => {
                    Zc(p.id);
                  },
                  className: [
                    "flex h-9 w-9 items-center justify-center text-xs font-medium transition-colors",
                    h ? "bg-embed-background-primary/15 text-embed-brand-gold" : "text-embed-background-primary/70 hover:bg-embed-background-primary/10 hover:text-embed-background-primary"
                  ].join(" "),
                  children: p.short
                },
                p.id
              );
            })
          }
        )
      ]
    }
  );
}
class go extends Error {
  constructor(o) {
    super(o), this.name = "InvalidDecisionGraphError";
  }
}
class WE {
  constructor(o = []) {
    q(this, "definitions");
    q(this, "ordered");
    this.ordered = [...o], this.definitions = new Map(
      o.map((i) => [i.id, i])
    );
    for (const i of this.definitions.values()) {
      if (i.next !== void 0 && !this.definitions.has(i.next))
        throw new go(
          `Decision "${i.id}" has next "${i.next}" which is not registered`
        );
      if (i.previous !== void 0 && !this.definitions.has(i.previous))
        throw new go(
          `Decision "${i.id}" has previous "${i.previous}" which is not registered`
        );
    }
  }
  get(o) {
    return this.definitions.get(o);
  }
  getNext(o) {
    var i;
    return (i = this.definitions.get(o)) == null ? void 0 : i.next;
  }
  getPrevious(o) {
    var i;
    return (i = this.definitions.get(o)) == null ? void 0 : i.previous;
  }
  list() {
    return this.ordered;
  }
}
const eA = "priority-focus", tA = "garden-importance", nA = "price", aA = "space", rA = "yes";
function oA(a) {
  const o = (u) => a instanceof Map ? a.get(u) : a[u], i = o(eA), s = o(tA);
  return {
    preferPrice: i === nA,
    preferSpace: i === aA,
    preferGarden: s === rA
  };
}
function iA(a) {
  const o = a.answers.has("priority-focus"), i = a.answers.has("garden-importance");
  return {
    decisionFilter: o || i ? oA(a.answers) : null
  };
}
function lA(a) {
  return Ib(a);
}
function sA(a) {
  const o = a.list();
  if (o.length === 0)
    return [];
  const i = o.find((p) => p.previous === void 0) ?? o.find(
    (p) => !o.some((h) => h.next === p.id)
  ) ?? o[0], s = [], u = /* @__PURE__ */ new Set();
  let f = i.id;
  for (; f !== void 0 && !u.has(f); )
    u.add(f), s.push(f), f = a.getNext(f);
  for (const p of o)
    u.has(p.id) || s.push(p.id);
  return s;
}
function cA(a, o) {
  const i = new Set(o.history);
  return sA(a).flatMap((s) => {
    var f;
    const u = a.get(s);
    return u ? [
      {
        id: u.id,
        title: u.question,
        visited: i.has(s),
        current: o.currentDecisionId === s,
        choices: (f = u.choices) == null ? void 0 : f.map((p) => ({
          id: p.id,
          label: p.label
        }))
      }
    ] : [];
  });
}
function dA(a, o, i, s, u) {
  const f = Object.fromEntries(
    o.answers.entries()
  ), p = cA(a, o), h = p.find((E) => E.current) ?? null, y = [...o.answers.keys()].flatMap((E) => {
    var D;
    const O = p.find((R) => R.id === E);
    if (O)
      return [O];
    const z = a.get(E);
    return z ? [
      {
        id: z.id,
        title: z.question,
        visited: o.history.includes(E),
        current: o.currentDecisionId === E,
        choices: (D = z.choices) == null ? void 0 : D.map((R) => ({
          id: R.id,
          label: R.label
        }))
      }
    ] : [];
  }), g = i.decisionFilter === null || u === null ? { highlights: [], recommendedRooms: [] } : Q0(i.decisionFilter, u);
  return {
    currentSceneId: s,
    answers: f,
    decisions: y,
    currentDecisionId: o.currentDecisionId,
    history: [...o.history],
    currentDecision: h,
    decisionFlow: p,
    house: lA(u),
    decisionFilter: i.decisionFilter,
    highlights: g.highlights,
    recommendedRooms: g.recommendedRooms,
    summaryReady: o.currentDecisionId === "summary"
  };
}
function uA(a, o, i, s = null) {
  const u = iA(o);
  return dA(
    a,
    o,
    u,
    i,
    s
  );
}
class mA {
  constructor(o, i = null) {
    q(this, "registry");
    q(this, "house");
    this.registry = o, this.house = i;
  }
  interpret(o) {
    return uA(
      this.registry,
      o.state,
      o.currentSceneId,
      this.house
    );
  }
}
const fA = "set-answer";
class pA {
  execute(o, i) {
    const { decisionId: s, value: u } = o;
    i.state.answers.set(s, u);
  }
}
class Sd extends Error {
  constructor(o) {
    super(`No decision registered for id "${o}"`), this.name = "UnknownDecisionError";
  }
}
const bA = "start-decision-flow";
class hA {
  constructor(o) {
    q(this, "registry");
    this.registry = o;
  }
  execute(o, i) {
    const { decisionId: s } = o;
    if (!this.registry.get(s))
      throw new Sd(s);
    const u = i.state;
    u.history = [], u.currentDecisionId = s;
  }
}
function Lh(a, o) {
  a.currentDecisionId !== o && (a.currentDecisionId !== null && a.history.push(a.currentDecisionId), a.currentDecisionId = o);
}
const yA = "go-to-decision";
class gA {
  constructor(o) {
    q(this, "registry");
    this.registry = o;
  }
  execute(o, i) {
    const { decisionId: s } = o;
    if (!this.registry.get(s))
      throw new Sd(s);
    Lh(i.state, s);
  }
}
const vA = "go-next";
class xA {
  constructor(o) {
    q(this, "registry");
    this.registry = o;
  }
  execute(o, i) {
    const s = i.state, u = s.currentDecisionId;
    if (u === null)
      throw new go(
        "Cannot go next without a current decision"
      );
    if (!this.registry.get(u))
      throw new Sd(u);
    const f = this.registry.getNext(u);
    if (f === void 0)
      throw new go(
        `Decision "${u}" has no next edge`
      );
    if (!this.registry.get(f))
      throw new go(
        `Decision "${u}" has next "${f}" which is not registered`
      );
    Lh(s, f);
  }
}
const wA = "go-back";
class SA {
  execute(o, i) {
    const s = i.state;
    if (s.history.length === 0)
      return;
    const u = s.history.pop();
    s.currentDecisionId = u ?? null;
  }
}
const jA = X0;
class EA {
  constructor() {
    q(this, "handlers", /* @__PURE__ */ new Map());
  }
  register(o, i) {
    this.handlers.set(o, i);
  }
  resolve(o) {
    return this.handlers.get(o.type);
  }
}
class AA extends Error {
  constructor(o) {
    super(`No handler registered for command "${o}"`), this.name = "UnknownCommandError";
  }
}
class _A extends Error {
  constructor(o) {
    super(o), this.name = "InvalidCommandError";
  }
}
function OA(a) {
  if (typeof (a == null ? void 0 : a.type) != "string" || a.type.length === 0)
    throw new _A("Command.type is required");
  return a;
}
class zA {
  constructor(o, i) {
    q(this, "executionContext");
    q(this, "interpreter");
    q(this, "resolver");
    this.executionContext = o, this.interpreter = i.interpreter, this.resolver = i.resolver;
  }
  run(o) {
    OA(o);
    const i = this.resolver.resolve(o);
    if (!i)
      throw new AA(o.type);
    return i.execute(o, this.executionContext), this.interpreter.interpret(this.executionContext);
  }
}
class NA {
  constructor(o, i) {
    q(this, "sceneGraph");
    q(this, "executionContext");
    q(this, "workflow");
    this.sceneGraph = o, this.executionContext = i.executionContext, this.workflow = new zA(this.executionContext, {
      resolver: i.resolver,
      interpreter: i.interpreter
    });
  }
  get context() {
    return this.executionContext;
  }
  dispatch(o) {
    return this.workflow.run(o);
  }
  /** @deprecated Legacy scene API — retained until Workflow replaces it. */
  start() {
    this.executionContext.currentSceneId = this.sceneGraph.start;
  }
  /** @deprecated Legacy scene API — retained until Workflow replaces it. */
  next() {
    const o = this.sceneGraph.scenes[this.executionContext.currentSceneId];
    o != null && o.next && (this.executionContext.currentSceneId = o.next);
  }
  /**
   * @deprecated Legacy scene API — use dispatch with a domain command instead.
   * Domain answers are owned by DecisionState outside Core.
   */
  answer(o, i) {
  }
}
function TA(a) {
  const o = new WE(P0), i = {
    answers: /* @__PURE__ */ new Map(),
    currentDecisionId: null,
    history: []
  }, s = {
    currentSceneId: a.start,
    state: i
  }, u = new EA();
  return u.register(fA, new pA()), u.register(
    bA,
    new hA(o)
  ), u.register(
    yA,
    new gA(o)
  ), u.register(
    vA,
    new xA(o)
  ), u.register(wA, new SA()), new NA(a, {
    executionContext: s,
    resolver: u,
    interpreter: new mA(
      o,
      F0
    )
  });
}
const RA = {
  start: "start",
  scenes: {
    start: { id: "start" }
  }
};
function kA() {
  const a = U.useRef(null), [o, i] = U.useState(null);
  a.current === null && (a.current = TA(RA));
  const s = a.current;
  U.useEffect(() => {
    const h = {
      type: "start-decision-flow",
      decisionId: jA
    };
    i(s.dispatch(h));
  }, [s]);
  const u = (h) => {
    const y = {
      type: "go-to-decision",
      decisionId: h
    };
    i(s.dispatch(y));
  }, f = (h, y) => {
    const g = {
      type: "set-answer",
      decisionId: h,
      value: y
    };
    s.dispatch(g);
    const E = { type: "go-next" };
    i(s.dispatch(E));
  }, p = () => {
    const h = { type: "go-next" };
    i(s.dispatch(h));
  };
  return /* @__PURE__ */ d.jsx(
    Lb,
    {
      sidebar: /* @__PURE__ */ d.jsx(
        Uh,
        {
          legacyExperience: o,
          onSelectDecision: u
        }
      ),
      showStatusBar: !1,
      header: /* @__PURE__ */ d.jsx(d.Fragment, {}),
      children: /* @__PURE__ */ d.jsx(
        Dh,
        {
          legacyExperience: o,
          onLegacySelectChoice: f,
          onLegacyContinue: p
        }
      )
    }
  );
}
function CA() {
  if (typeof window < "u")
    try {
      if (new URLSearchParams(window.location.search).get("legacyCommandRuntime") === "1" || window.localStorage.getItem("embed.enableLegacyCommandRuntime") === "1")
        return !0;
    } catch {
    }
  return !1;
}
function IA({ runtime: a } = {}) {
  const [o] = U.useState(() => CA());
  return o ? /* @__PURE__ */ d.jsx(kA, {}) : /* @__PURE__ */ d.jsx(
    Lb,
    {
      sidebar: /* @__PURE__ */ d.jsx(Uh, {}),
      header: /* @__PURE__ */ d.jsx(zx, {}),
      showStatusBar: !1,
      children: /* @__PURE__ */ d.jsx(Dh, { runtime: a })
    }
  );
}
function MA(a) {
  if (a == null || typeof a.setAttribute != "function")
    throw new Error(
      "Embed: Client Studio mount target is missing — Delivery Layer must provide a mount container"
    );
  return a;
}
function Hh(a) {
  const { runtime: o, assetBase: i, objectId: s } = a, u = MA(a.target);
  Fp(i), u.setAttribute("data-embed-root", ""), u.setAttribute("data-client-studio-root", ""), u.setAttribute("data-embed-boundary", ""), u.dataset.clientStudioVersion = Kn.version, u.dataset.clientStudioGeneration = Kn.generation, s != null && s.trim().length > 0 && (u.dataset.objectId = s.trim()), document.documentElement.dataset.clientStudioVersion = Kn.version, document.documentElement.dataset.clientStudioGeneration = Kn.generation;
  const f = Ub.createRoot(u);
  return f.render(
    /* @__PURE__ */ d.jsx(U.StrictMode, { children: /* @__PURE__ */ d.jsx(vx, { children: /* @__PURE__ */ d.jsx(IA, { runtime: o }) }) })
  ), {
    rootElement: u,
    dispose: () => {
      f.unmount(), Fp(void 0), u.removeAttribute("data-embed-root"), u.removeAttribute("data-client-studio-root"), u.removeAttribute("data-embed-boundary"), delete u.dataset.clientStudioVersion, delete u.dataset.clientStudioGeneration, delete u.dataset.objectId, u.replaceChildren();
    }
  };
}
const Bh = "data-embed-boundary", oe = Bh, DA = `
/* ── Boundary inheritance root (no reliance on host html/body) ── */
[${oe}] {
  color: rgb(0 25 48);
  font-family: Inter, system-ui, sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.5;
  letter-spacing: normal;
  text-decoration: none;
  text-transform: none;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  isolation: isolate;
  box-sizing: border-box;
}

[${oe}],
[${oe}] *,
[${oe}] *::before,
[${oe}] *::after {
  box-sizing: border-box;
  border-color: #e3e3e3;
}

/*
 * Reclaim interactive elements from host tag selectors.
 * Color / background / font use high-specificity boundary rules WITHOUT
 * !important so scoped Tailwind utilities can still express design tokens.
 * text-decoration / appearance use !important — common host link attacks.
 * Pseudo-class rules must NOT reset color (would beat attribute CTA hooks).
 */
[${oe}] a {
  color: inherit;
  background-color: transparent;
  background-image: none;
  font-family: inherit;
  font-size: inherit;
  font-weight: inherit;
  line-height: inherit;
  letter-spacing: inherit;
  text-decoration: none !important;
  text-transform: none;
  border-style: none;
  border-width: 0;
  border-radius: 0;
  outline: none;
  box-shadow: none;
  appearance: none !important;
  -webkit-appearance: none !important;
  cursor: pointer;
  transition: none;
}

[${oe}] a:link,
[${oe}] a:visited,
[${oe}] a:hover,
[${oe}] a:active,
[${oe}] a:focus,
[${oe}] a:focus-visible {
  text-decoration: none !important;
  background-image: none;
  outline: none;
  box-shadow: none;
}

[${oe}] button {
  color: inherit;
  background-color: transparent;
  background-image: none;
  font-family: inherit;
  font-size: inherit;
  font-weight: inherit;
  line-height: inherit;
  letter-spacing: inherit;
  text-decoration: none !important;
  text-transform: none;
  border-style: none;
  border-width: 0;
  border-radius: 0;
  outline: none;
  box-shadow: none;
  appearance: none !important;
  -webkit-appearance: none !important;
  cursor: pointer;
  transition: none;
}

[${oe}] button:hover,
[${oe}] button:active,
[${oe}] button:focus,
[${oe}] button:focus-visible {
  outline: none;
  box-shadow: none;
}

[${oe}] input,
[${oe}] textarea,
[${oe}] select {
  color: inherit;
  background-color: transparent;
  background-image: none;
  font-family: inherit;
  font-size: inherit;
  font-weight: inherit;
  line-height: inherit;
  letter-spacing: inherit;
  text-decoration: none;
  border-style: solid;
  border-width: 1px;
  border-radius: 0;
  outline: none;
  box-shadow: none;
  appearance: none !important;
  -webkit-appearance: none !important;
  cursor: text;
  transition: none;
}

[${oe}] img,
[${oe}] svg,
[${oe}] video,
[${oe}] canvas {
  display: block;
  max-width: 100%;
  vertical-align: middle;
  border-style: none !important;
}

[${oe}] svg {
  max-width: none;
}

/*
 * Public CTA hook — specificity must beat [${oe}] a and host a:link/a:visited.
 * Restates PrimaryLink md identity (does not change reference look).
 */
[${oe}] a[data-embed-hero-cta],
[${oe}] a[data-embed-hero-cta]:link,
[${oe}] a[data-embed-hero-cta]:visited,
[${oe}] a[data-embed-hero-cta]:hover,
[${oe}] a[data-embed-hero-cta]:active,
[${oe}] a[data-embed-hero-cta]:focus,
[${oe}] a[data-embed-hero-cta]:focus-visible {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  color: #ffffff !important;
  background-color: #001930 !important;
  background-image: none !important;
  font-family: Inter, system-ui, sans-serif !important;
  font-size: 1rem !important;
  font-weight: 500 !important;
  line-height: 1.5 !important;
  letter-spacing: normal !important;
  text-align: center !important;
  text-decoration: none !important;
  text-transform: none !important;
  border-style: none !important;
  border-width: 0 !important;
  border-radius: 8px !important;
  outline: none !important;
  box-shadow: none !important;
  appearance: none !important;
  -webkit-appearance: none !important;
  cursor: pointer !important;
  opacity: 1 !important;
  padding: 1rem 2rem !important;
  margin: 0 !important;
  transition: none !important;
}

[${oe}] button[data-embed-close],
[${oe}] button[data-embed-close]:hover,
[${oe}] button[data-embed-close]:active,
[${oe}] button[data-embed-close]:focus,
[${oe}] button[data-embed-close]:focus-visible {
  color: inherit !important;
  background-color: transparent !important;
  background-image: none !important;
  font-family: Inter, system-ui, sans-serif !important;
  text-decoration: none !important;
  border-style: none !important;
  border-width: 0 !important;
  appearance: none !important;
  -webkit-appearance: none !important;
  cursor: pointer !important;
  outline: none !important;
  box-shadow: none !important;
}
`;
function Yh() {
  const a = document.body;
  if (a)
    return a;
  const o = document.documentElement;
  if (o)
    return o;
  throw new Error(
    "Embed: cannot attach Experience — document body is unavailable"
  );
}
function $h() {
  const a = document.head;
  return a || Yh();
}
function Gh(a, ...o) {
  for (const i of o)
    a.appendChild(i);
}
let rd = null;
const hb = "embed-client-studio-fonts", UA = "embed-client-studio-css", LA = "embed-client-studio-shell-css", HA = "embed-css-isolation", BA = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;900&display=swap", YA = `
html {
  overscroll-behavior: auto;
}
body {
  overscroll-behavior: auto;
}
[data-client-studio-root] {
  display: block;
  min-height: 100vh;
  width: 100%;
  overflow-x: auto;
  overflow-y: clip;
  overscroll-behavior: auto;
  color: rgb(0 25 48);
  background-color: #f7f6f4;
  font-family: Inter, system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  isolation: isolate;
  box-sizing: border-box;
  line-height: 1.5;
  text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
}
[data-embed-overlay] {
  position: fixed;
  inset: 0;
  z-index: 2147483000;
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  height: 100dvh;
  background: #f7f6f4;
  color: rgb(0 25 48);
  isolation: isolate;
}
/* Close lives on Delivery overlay ([data-embed-close]), not Client Studio header. */
[data-embed-overlay-mount] {
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
}
[data-experience-header] {
  position: sticky;
  top: 0;
  z-index: 40;
}
[data-embed-overlay-mount][data-client-studio-root],
[data-embed-overlay] [data-client-studio-root] {
  min-height: 100%;
  height: auto;
  overflow-x: auto;
  overflow-y: visible;
}
`;
function $A(a) {
  rd = a;
}
function GA() {
  if (typeof document > "u" || document.getElementById(hb))
    return;
  const a = document.createElement("link");
  a.rel = "preconnect", a.href = "https://fonts.googleapis.com";
  const o = document.createElement("link");
  o.rel = "preconnect", o.href = "https://fonts.gstatic.com", o.crossOrigin = "anonymous";
  const i = document.createElement("link");
  i.id = hb, i.rel = "stylesheet", i.href = BA, Gh(
    $h(),
    a,
    o,
    i
  );
}
function Fc(a, o) {
  const i = $h();
  let s = document.getElementById(a);
  s || (s = document.createElement("style"), s.id = a, i.appendChild(s)), s.textContent = o, i.appendChild(s);
}
function od(a) {
  a.setAttribute(Bh, "");
}
function jd() {
  typeof document > "u" || (GA(), rd !== null && Fc(UA, rd), Fc(LA, YA), Fc(HA, DA));
}
const ir = "house-modern-01";
function qA(a) {
  const o = a === void 0 || a.trim().length === 0 ? ir : a.trim();
  if (o !== ir)
    throw new Error(
      `Embed.mount: unknown objectId "${o}". Known: ${ir}`
    );
  return o;
}
async function VA(a, o) {
  jd();
  const i = qA(o.objectId), s = Hh({
    target: a,
    objectId: i,
    assetBase: o.assetBase
  });
  return {
    kind: "client-studio",
    host: a,
    root: s.rootElement,
    styleElement: document.createElement("style"),
    objectId: i,
    dispose: () => {
      s.dispose();
    }
  };
}
function qh(a) {
  return "fixture" in a && a.fixture === "garden";
}
function Vh(a) {
  return "experience" in a && a.experience !== void 0;
}
function FA(a) {
  return !qh(a) && !Vh(a);
}
function XA(a) {
  return a.mode ? a.mode : a.launcher !== void 0 ? "launcher" : "inline";
}
function PA(a) {
  return {
    hostId: a.hostId,
    entryPoint: a.entryPoint,
    launcherId: a.launcherId,
    referrer: a.referrer,
    campaign: a.campaign
  };
}
function KA(a) {
  if ("fixture" in a && a.fixture === "garden")
    return kv();
  if ("experience" in a && a.experience)
    return a.experience;
  throw new Error(
    'Embed legacy mount requires either { fixture: "garden" } or { experience: PriorityJourneyRun }'
  );
}
function ZA(a) {
  var o;
  if (!((o = a.confirmation) != null && o.presentationPayload))
    throw new Error(
      "Embed.mount experience requires confirmation.presentationPayload"
    );
  if (!a.interpretation || !a.experience)
    throw new Error(
      "Embed.mount experience requires interpretation and experience artifacts"
    );
  if (!a.houseMapping || !a.followUps || a.followUps.length === 0)
    throw new Error(
      "Embed.mount experience requires houseMapping and at least one followUp"
    );
  return [
    {
      type: "priority.selection.changed",
      selection: a.selection
    },
    {
      type: "priority.confirmation.accepted",
      presentationPayload: a.confirmation.presentationPayload
    },
    {
      type: "priority.transition.completed",
      transitionMessage: a.transitionMessage ?? void 0
    },
    {
      type: "priority.interpretation.ready",
      interpretation: a.interpretation,
      experience: a.experience
    },
    {
      type: "priority.mapping.ready",
      houseMapping: a.houseMapping,
      followUps: a.followUps
    }
  ];
}
function QA(a, o) {
  return "fixture" in a && a.fixture === "garden" ? Cv().filter(
    (i) => i.type !== "priority.followup.selected"
  ) : ZA(o);
}
const JA = Object.freeze([
  "social-proof",
  "hero",
  "property-explorer",
  "walkthrough",
  "floor-plan",
  "priority-experience",
  "ai-advisor",
  "audit-lead-capture"
]), Fh = "social-proof", yb = new Set(JA);
function WA(a) {
  var s;
  const o = ((s = a.configuredId) == null ? void 0 : s.trim()) ?? "";
  return o.length > 0 && yb.has(o) ? { elementId: o, usedDefault: !1 } : { elementId: yb.has(a.modeDefaultId) ? a.modeDefaultId : Fh, usedDefault: !0 };
}
function e_(a) {
  return `#${a.replace(/[^a-zA-Z0-9_-]/g, "")}`;
}
function Ed() {
  const a = document.documentElement, o = document.body ?? a;
  if (!o || !a)
    throw new Error("Embed: cannot lock host scroll — document is unavailable");
  return { body: o, html: a };
}
function t_() {
  const { body: a, html: o } = Ed();
  return {
    scrollX: window.scrollX,
    scrollY: window.scrollY,
    bodyOverflow: a.style.overflow,
    htmlOverflow: o.style.overflow
  };
}
function n_(a) {
  const { body: o, html: i } = Ed();
  i.style.overflow = "hidden", o.style.overflow = "hidden", o.style.position = "fixed", o.style.top = `-${a.scrollY}px`, o.style.left = `-${a.scrollX}px`, o.style.right = "0", o.style.width = "100%";
}
function gb(a) {
  const { body: o, html: i } = Ed();
  o.style.position = "", o.style.top = "", o.style.left = "", o.style.right = "", o.style.width = "", o.style.overflow = a.bodyOverflow, i.style.overflow = a.htmlOverflow, window.scrollTo(a.scrollX, a.scrollY);
}
const a_ = "data-embed-overlay", r_ = "data-embed-overlay-mount", vb = "data-embed-close";
function o_(a) {
  const o = Yh(), i = t_();
  n_(i);
  const s = document.createElement("div");
  s.setAttribute(a_, ""), od(s), s.setAttribute("role", "dialog"), s.setAttribute("aria-modal", "true"), s.setAttribute("aria-label", "Client Studio"), s.style.position = "fixed", s.style.inset = "0", s.style.zIndex = "2147483000";
  const u = document.createElement("div");
  u.setAttribute(r_, ""), od(u), u.style.position = "absolute", u.style.inset = "0";
  const f = document.createElement("button");
  f.type = "button", f.setAttribute(vb, ""), f.setAttribute("aria-label", "Zavřít Client Studio"), f.style.position = "absolute", f.style.top = "0.75rem", f.style.right = "0.75rem", f.style.zIndex = "1", f.style.display = "flex", f.style.height = "2.75rem", f.style.width = "2.75rem", f.style.alignItems = "center", f.style.justifyContent = "center", f.style.border = "0", f.style.borderRadius = "9999px", f.style.background = "transparent", f.style.padding = "0", f.style.cursor = "pointer", f.innerHTML = '<span aria-hidden="true" style="display:grid;height:2rem;width:2rem;place-items:center;overflow:hidden;border-radius:9999px;background:#001930;color:#fff;box-shadow:0 1px 2px rgba(0,0,0,.12)"><span style="display:flex;height:1em;width:1em;align-items:center;justify-content:center;font-size:2rem;font-weight:700;line-height:1;translate:1px -1px">×</span></span>';
  const p = (h) => {
    const y = h.target;
    y == null || typeof y.closest != "function" || !y.closest(`[${vb}]`) || (h.preventDefault(), a.onClose());
  };
  if (s.addEventListener("click", p), Gh(s, u, f), o.appendChild(s), typeof u.setAttribute != "function")
    throw s.parentNode && s.parentNode.removeChild(s), gb(i), new Error("Embed: launcher mount container failed to initialize");
  return {
    root: s,
    mountTarget: u,
    scrollSnapshot: i,
    dispose: () => {
      s.removeEventListener("click", p), s.parentNode && s.parentNode.removeChild(s), gb(i);
    }
  };
}
const Xh = 1125;
function Qt(a, o) {
  var i;
  (i = a.onStateChange) == null || i.call(a, o), a.scrollContainer.dataset.embedRevealState = o;
}
function ho(a) {
  return a.aborted;
}
function i_() {
  return new Promise((a) => {
    if (typeof requestAnimationFrame != "function") {
      a();
      return;
    }
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        a();
      });
    });
  });
}
function l_(a) {
  const o = a.querySelector(
    "[data-experience-header]"
  );
  return o ? Math.ceil(o.getBoundingClientRect().height) : 0;
}
function s_(a) {
  return a < 0.5 ? 4 * a * a * a : 1 - Math.pow(-2 * a + 2, 3) / 2;
}
function c_(a, o, i, s) {
  const u = a.scrollTop, f = Math.max(0, o);
  return i <= 0 || Math.abs(f - u) < 1 ? (a.scrollTo({ top: f, left: 0, behavior: "auto" }), Promise.resolve()) : typeof requestAnimationFrame != "function" ? (a.scrollTo({ top: f, left: 0, behavior: "auto" }), Promise.resolve()) : new Promise((p) => {
    const h = typeof performance < "u" && typeof performance.now == "function" ? performance.now() : Date.now(), y = (g) => {
      if (s.aborted) {
        p();
        return;
      }
      const E = g - h, O = Math.min(1, E / i);
      if (a.scrollTop = u + (f - u) * s_(O), O < 1) {
        requestAnimationFrame(y);
        return;
      }
      a.scrollTop = f, p();
    };
    requestAnimationFrame(y);
  });
}
async function d_(a, o, i = {}) {
  const s = i.signal ?? new AbortController().signal, u = i.durationMs ?? Xh;
  if (i.fromTop !== !1 && (a.scrollTo({ top: 0, left: 0, behavior: "auto" }), await i_()), ho(s))
    return;
  const p = l_(a), h = a.getBoundingClientRect(), y = o.getBoundingClientRect(), g = a.scrollTop + (y.top - h.top) - p;
  if (await c_(a, g, u, s), typeof o.focus == "function")
    try {
      o.focus({ preventScroll: !0 });
    } catch {
    }
}
function u_(a, o, i) {
  const s = WA({
    configuredId: o,
    modeDefaultId: i
  }), u = a.querySelector(
    e_(s.elementId)
  );
  if (u instanceof HTMLElement)
    return {
      element: u,
      anchorId: u.id || s.elementId,
      usedDefault: s.usedDefault
    };
  const f = a.querySelector("#hero");
  return f instanceof HTMLElement ? {
    element: f,
    anchorId: s.elementId,
    usedDefault: !0
  } : {
    element: null,
    anchorId: s.elementId,
    usedDefault: !0
  };
}
async function m_(a) {
  if (ho(a.signal))
    return Qt(a, "aborted"), {
      state: "aborted",
      anchorId: a.modeDefaultLandingAnchorId,
      degraded: !0
    };
  Qt(a, "waiting-ready");
  try {
    await Wt.waitFor("EXPERIENCE_READY", a.signal);
  } catch {
    return Qt(a, "aborted"), {
      state: "aborted",
      anchorId: a.modeDefaultLandingAnchorId,
      degraded: !0
    };
  }
  if (ho(a.signal))
    return Qt(a, "aborted"), {
      state: "aborted",
      anchorId: a.modeDefaultLandingAnchorId,
      degraded: !0
    };
  Qt(a, "resolving-anchor");
  const o = u_(
    a.studioRoot,
    a.configuredLandingAnchorId,
    a.modeDefaultLandingAnchorId
  );
  if (o.element === null)
    return Qt(a, "degraded"), a.scrollContainer.scrollTo({ top: 0, left: 0, behavior: "auto" }), Wt.emit("REVEAL_READY"), a.scrollContainer.dataset.viewportReady = "true", a.scrollContainer.dataset.landingAnchorId = o.anchorId, {
      state: "degraded",
      anchorId: o.anchorId,
      degraded: !0
    };
  if (ho(a.signal))
    return Qt(a, "aborted"), {
      state: "aborted",
      anchorId: o.anchorId,
      degraded: !0
    };
  if (Qt(a, "revealing"), await d_(a.scrollContainer, o.element, {
    signal: a.signal,
    durationMs: Xh,
    fromTop: !0
  }), ho(a.signal))
    return Qt(a, "aborted"), {
      state: "aborted",
      anchorId: o.anchorId,
      degraded: !0
    };
  const i = o.usedDefault || o.element.id !== o.anchorId;
  return Qt(a, i ? "degraded" : "active"), a.scrollContainer.dataset.landingAnchorId = o.anchorId, a.scrollContainer.dataset.viewportReady = "true", Wt.emit("REVEAL_READY"), {
    state: i ? "degraded" : "active",
    anchorId: o.anchorId,
    degraded: i
  };
}
function xb(a, o, i) {
  try {
    i == null || i.abort();
  } catch {
  }
  try {
    o == null || o();
  } catch {
  }
  try {
    a == null || a.dispose();
  } catch {
  }
}
function f_(a) {
  const o = a === void 0 || a.trim().length === 0 ? ir : a.trim();
  if (o !== ir)
    throw new Error(
      `Embed.mount: unknown objectId "${o}". Known: ${ir}`
    );
  return o;
}
async function p_(a, o) {
  let i = null, s;
  const u = new AbortController();
  try {
    Wt.reset(), Wt.emit("BOOTSTRAP_STARTED"), jd();
    const f = f_(a.objectId);
    i = o_({ onClose: o.onClose });
    const p = i.mountTarget;
    if (p == null || typeof p.setAttribute != "function")
      throw new Error(
        "Embed: launcher mount container is unavailable after overlay initialization"
      );
    Wt.emit("BOOTSTRAP_LOADING");
    const h = Hh({
      target: p,
      objectId: f,
      assetBase: a.assetBase
    });
    s = h.dispose, p.dataset.experienceMode = a.presentation.mode, p.dataset.landingAnchorId = a.presentation.landingAnchorId, i.root.setAttribute("data-embed-reveal-pending", "");
    const y = a.restoreFocusTo ?? null, g = i;
    return m_({
      studioRoot: p,
      scrollContainer: p,
      configuredLandingAnchorId: a.presentation.landingAnchorId,
      modeDefaultLandingAnchorId: Fh,
      signal: u.signal,
      onStateChange: (E) => {
        g.root.dataset.embedRevealState = E;
      }
    }).then((E) => {
      u.signal.aborted || (g.root.removeAttribute("data-embed-reveal-pending"), g.root.setAttribute("data-embed-experience-active", ""), E.degraded && g.root.setAttribute("data-embed-reveal-degraded", ""), g.root.dataset.landingAnchorId = E.anchorId);
    }).catch(() => {
    }), {
      kind: "client-studio-launcher",
      host: y ?? i.root,
      root: h.rootElement,
      styleElement: document.createElement("style"),
      objectId: f,
      overlay: i,
      dispose: () => {
        if (xb(i, s, u), y && typeof y.focus == "function")
          try {
            y.focus();
          } catch {
          }
      }
    };
  } catch (f) {
    throw xb(i, s, u), f;
  }
}
const b_ = Object.freeze({
  mode: "launcher",
  landingAnchorId: "social-proof",
  showCloseAction: !0
});
let Ph = null, Kh = null;
function cl() {
  return Ph;
}
function Qn(a) {
  Ph = a;
}
function rl() {
  return Kh;
}
function vo(a) {
  Kh = a;
}
function h_(a) {
  var o;
  return a === void 0 ? ((o = cl()) == null ? void 0 : o.host) ?? null : typeof a == "string" ? document.querySelector(a) : a;
}
function y_(a) {
  return "kind" in a ? String(a.kind) : void 0;
}
function Zh(a) {
  const o = cl();
  if (!o) {
    const u = rl();
    u && (u.dispose(), vo(null));
    return;
  }
  const i = h_(a);
  if (i && i !== o.host)
    return;
  const s = y_(o);
  if (s === "client-studio-launcher") {
    o.dispose(), Qn(rl());
    return;
  }
  if (s === "launcher-armed") {
    o.dispose(), vo(null), Qn(null);
    return;
  }
  o.dispose(), Qn(null);
}
const g_ = "overflow-hidden rounded-[11px] border border-embed-border-default bg-[#FFFFFF] shadow-[0_1px_11px_rgba(0,25,48,0.044)]", v_ = [
  { value: "124 m2", label: "Užitná plocha" },
  { value: "A ++", label: "Energetická třída" },
  { value: "Dřevostavba", label: "Difuzně otevřená" }
], x_ = {
  backgroundImage: `linear-gradient(to top, color-mix(in srgb, ${Ie.border.default} 30%, #FFFFFF), #FFFFFF)`
}, wb = {
  backgroundColor: Ie.action.accent
}, w_ = "/media/house-modern-01/exterior.webp", S_ = 767;
function j_(a, o) {
  if (/^https?:\/\//i.test(a) || a.startsWith("//"))
    return a;
  const i = a.startsWith("/") ? a : `/${a}`;
  return o === void 0 || o.trim().length === 0 ? i : `${o.replace(/\/$/, "")}${i}`;
}
function E_({ name: a }) {
  const o = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "#D4AF37",
    strokeWidth: 1.5,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className: "h-8 w-8",
    "aria-hidden": !0
  };
  switch (a) {
    case "viewing":
      return /* @__PURE__ */ d.jsxs("svg", { ...o, children: [
        /* @__PURE__ */ d.jsx("circle", { cx: "9", cy: "8", r: "2.5" }),
        /* @__PURE__ */ d.jsx("circle", { cx: "16", cy: "9", r: "2" }),
        /* @__PURE__ */ d.jsx("path", { d: "M3.5 18.5c.4-2.8 2.6-4.5 5.5-4.5s5.1 1.7 5.5 4.5" }),
        /* @__PURE__ */ d.jsx("path", { d: "M14 14.2c1.1-.7 2.5-1.1 4-1.1 2.3 0 4.1 1.2 4.5 3.4" })
      ] });
    case "saved":
      return /* @__PURE__ */ d.jsx("svg", { ...o, children: /* @__PURE__ */ d.jsx("path", { d: "M7 4.5h10a1.5 1.5 0 0 1 1.5 1.5v14l-6.5-3.5L5.5 20V6A1.5 1.5 0 0 1 7 4.5z" }) });
    case "inquiry":
      return /* @__PURE__ */ d.jsxs("svg", { ...o, children: [
        /* @__PURE__ */ d.jsx("rect", { x: "3.5", y: "8", width: "12", height: "10", rx: "1" }),
        /* @__PURE__ */ d.jsx("path", { d: "M3.5 11.5h12M7.5 8v10" }),
        /* @__PURE__ */ d.jsx("circle", { cx: "17.5", cy: "7", r: "3.5" }),
        /* @__PURE__ */ d.jsx("path", { d: "M16.3 6.2c.2-.6.8-1 1.4-1 .8 0 1.4.5 1.4 1.2 0 .7-.4 1-1 1.3-.5.2-.8.5-.8 1.1M17.5 10.2h.01" })
      ] });
    default:
      return null;
  }
}
function Xc({
  icon: a,
  value: o,
  label: i
}) {
  return /* @__PURE__ */ d.jsx("div", { className: "flex h-social-proof items-center justify-center px-section", children: /* @__PURE__ */ d.jsxs("div", { className: "flex max-w-full items-center gap-3", children: [
    /* @__PURE__ */ d.jsx(E_, { name: a }),
    /* @__PURE__ */ d.jsxs("p", { className: "text-left text-sm leading-snug text-[#001930]", children: [
      /* @__PURE__ */ d.jsx("span", { className: "text-2xl font-bold tracking-tight", children: o }),
      /* @__PURE__ */ d.jsx("span", { className: "ml-2 text-[#001930]/70", children: i })
    ] })
  ] }) });
}
function A_({
  compact: a,
  onOpenExperience: o
}) {
  return /* @__PURE__ */ d.jsxs(
    "section",
    {
      "aria-label": "Hero Content",
      className: [
        "relative flex h-full min-h-0 w-full flex-col justify-center bg-white px-section py-section",
        a ? "py-8" : ""
      ].join(" "),
      children: [
        /* @__PURE__ */ d.jsxs("div", { className: a ? "" : "translate-x-[10px]", children: [
          /* @__PURE__ */ d.jsx("p", { className: "text-sm font-bold uppercase tracking-wide text-[#D4AF37]", children: "MODERN A01 – 4+kk" }),
          /* @__PURE__ */ d.jsx(
            "h1",
            {
              className: [
                "mt-3 font-sans font-black leading-[1.15] tracking-tight text-embed-foreground-primary",
                a ? "text-[2rem]" : "text-[2.52rem]"
              ].join(" "),
              children: "Rodinný dům, kde to dýchá štěstím"
            }
          ),
          /* @__PURE__ */ d.jsx(
            "dl",
            {
              className: [
                "mt-8 grid divide-x divide-embed-border-default",
                a ? "grid-cols-1 gap-3 divide-x-0" : "grid-cols-3"
              ].join(" "),
              children: v_.map((i) => /* @__PURE__ */ d.jsxs(
                "div",
                {
                  className: [
                    "flex flex-col",
                    a ? "px-0" : "px-3 first:pl-0 last:pr-0"
                  ].join(" "),
                  children: [
                    /* @__PURE__ */ d.jsx("dd", { className: "order-1 text-base font-bold leading-tight text-[#D4AF37]", children: i.value }),
                    /* @__PURE__ */ d.jsx("dt", { className: "order-2 mt-1 text-xs leading-snug text-embed-foreground-primary", children: i.label })
                  ]
                },
                i.label
              ))
            }
          ),
          /* @__PURE__ */ d.jsx(
            "div",
            {
              className: [
                "mt-10 flex",
                a ? "justify-start" : "-translate-x-[10px] translate-y-[50px] justify-center"
              ].join(" "),
              children: /* @__PURE__ */ d.jsx(
                mh,
                {
                  href: "#embed-experience",
                  "data-embed-hero-cta": "",
                  onClick: (i) => {
                    i.preventDefault(), o();
                  },
                  children: "Podívat se dovnitř – video →"
                }
              )
            }
          )
        ] }),
        a ? null : /* @__PURE__ */ d.jsx(
          "div",
          {
            "aria-hidden": "true",
            className: "pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[33px]",
            style: x_
          }
        )
      ]
    }
  );
}
function __({
  assetBase: a,
  compact: o
}) {
  const i = j_(w_, a);
  return /* @__PURE__ */ d.jsx(
    "section",
    {
      role: "img",
      "aria-label": "Rodinný dům MODERN A01",
      className: "relative h-full min-h-0 w-full bg-cover bg-[center_42%] bg-no-repeat",
      style: { backgroundImage: `url('${i}')` },
      children: o ? null : /* @__PURE__ */ d.jsxs(
        "div",
        {
          "aria-hidden": "true",
          className: "animate-hero-photo-veil pointer-events-none absolute inset-y-0 left-0 z-10 w-1/4",
          children: [
            /* @__PURE__ */ d.jsx("div", { className: "absolute inset-y-0 left-0 w-1/2 bg-white/65" }),
            /* @__PURE__ */ d.jsx("div", { className: "absolute inset-y-0 left-1/2 w-1/2 bg-white/45" })
          ]
        }
      )
    }
  );
}
function O_({ compact: a }) {
  return /* @__PURE__ */ d.jsxs(
    "section",
    {
      "aria-label": "Social Proof",
      className: [
        "relative grid bg-[#FFFFFF] text-[#001930]",
        a ? "grid-cols-1" : "grid-cols-3"
      ].join(" "),
      children: [
        /* @__PURE__ */ d.jsx(
          "div",
          {
            "aria-hidden": "true",
            className: "pointer-events-none absolute inset-x-0 top-0 z-10 h-[2px] bg-white"
          }
        ),
        /* @__PURE__ */ d.jsx(
          "div",
          {
            "aria-hidden": "true",
            className: "pointer-events-none absolute inset-x-0 top-[2px] z-10 h-px",
            style: { backgroundColor: Ie.action.accent }
          }
        ),
        a ? null : /* @__PURE__ */ d.jsxs(d.Fragment, { children: [
          /* @__PURE__ */ d.jsx(
            "div",
            {
              "aria-hidden": "true",
              className: "pointer-events-none absolute left-1/3 top-[25%] z-10 h-1/2 w-px -translate-x-1/2",
              style: wb
            }
          ),
          /* @__PURE__ */ d.jsx(
            "div",
            {
              "aria-hidden": "true",
              className: "pointer-events-none absolute left-2/3 top-[25%] z-10 h-1/2 w-px -translate-x-1/2",
              style: wb
            }
          )
        ] }),
        /* @__PURE__ */ d.jsx(
          Xc,
          {
            icon: "viewing",
            value: "1",
            label: "rodina si právě prohlíží tento dům"
          }
        ),
        /* @__PURE__ */ d.jsx(
          Xc,
          {
            icon: "saved",
            value: "18",
            label: "zájemců si uložilo tento dům v minulém měsíci"
          }
        ),
        /* @__PURE__ */ d.jsx(
          Xc,
          {
            icon: "inquiry",
            value: "21 %",
            label: "zájemců se dotazuje na velikost pozemku"
          }
        )
      ]
    }
  );
}
function z_(a) {
  const [o, i] = U.useState(!1);
  return U.useEffect(() => {
    if (a === null)
      return;
    const s = () => {
      i(a.getBoundingClientRect().width <= S_);
    };
    if (s(), typeof ResizeObserver > "u")
      return window.addEventListener("resize", s), () => window.removeEventListener("resize", s);
    const u = new ResizeObserver(s);
    return u.observe(a), () => u.disconnect();
  }, [a]), o;
}
function N_({ assetBase: a, onOpenExperience: o }) {
  const [i, s] = U.useState(null), u = z_(i);
  return /* @__PURE__ */ d.jsx(
    "div",
    {
      ref: s,
      "data-embed-hero": "",
      className: "w-full font-sans text-embed-foreground-primary antialiased",
      children: /* @__PURE__ */ d.jsxs(
        "section",
        {
          "aria-label": "Embed Hero",
          className: g_,
          children: [
            /* @__PURE__ */ d.jsx(
              "div",
              {
                className: [
                  "relative w-full overflow-hidden",
                  u ? "h-auto min-h-0" : "h-hero-image"
                ].join(" "),
                children: /* @__PURE__ */ d.jsxs(
                  "div",
                  {
                    className: [
                      "grid h-full min-h-0",
                      u ? "grid-cols-1 grid-rows-[auto_minmax(16rem,1fr)]" : "grid-cols-[minmax(0,1fr)_minmax(0,2fr)]"
                    ].join(" "),
                    children: [
                      /* @__PURE__ */ d.jsx(
                        A_,
                        {
                          compact: u,
                          onOpenExperience: o
                        }
                      ),
                      /* @__PURE__ */ d.jsx(__, { assetBase: a, compact: u })
                    ]
                  }
                )
              }
            ),
            /* @__PURE__ */ d.jsx(O_, { compact: u })
          ]
        }
      )
    }
  );
}
function T_(a) {
  jd();
  const { host: o, assetBase: i, onOpenExperience: s } = a;
  o.setAttribute("data-embed-hero-host", ""), od(o), o.replaceChildren();
  const u = document.createElement("div");
  u.setAttribute("data-embed-hero-root", ""), o.appendChild(u);
  const f = Ub.createRoot(u);
  return f.render(
    U.createElement(N_, {
      assetBase: i,
      onOpenExperience: s
    })
  ), {
    host: o,
    dispose: () => {
      f.unmount(), u.remove(), o.removeAttribute("data-embed-hero-host"), o.removeAttribute("data-embed-boundary"), o.replaceChildren();
    }
  };
}
function R_(a, o) {
  return {
    presentation: b_,
    launchContext: {
      hostKind: "partner-website",
      entryPoint: "launcher",
      ...a.launchContext
    },
    objectId: a.objectId,
    assetBase: a.assetBase,
    restoreFocusTo: o
  };
}
function k_(a) {
  return a !== null && "kind" in a && a.kind === "client-studio-launcher";
}
function C_(a) {
  const o = a.trigger ?? a.heroHost;
  if (o === void 0)
    throw new Error(
      "Embed.mount: Launcher Mode requires `launcher` and/or `target` (Embed Hero host)"
    );
  let i;
  const s = () => {
    if (k_(cl()))
      return;
    const y = R_(a, o);
    p_(y, {
      onClose: () => {
        Zh();
      }
    }).then((g) => {
      Qn(g);
    }).catch((g) => {
      console.error("Embed.launch: failed to open Experience", g);
    });
  };
  a.heroHost !== void 0 && (i = T_({
    host: a.heroHost,
    assetBase: a.assetBase,
    onOpenExperience: s
  }));
  const u = (y) => {
    y.preventDefault(), s();
  }, f = a.trigger;
  f !== void 0 && (f.addEventListener("click", u), f.setAttribute("data-embed-launcher", ""), f.setAttribute("aria-haspopup", "dialog"));
  const p = () => {
    f !== void 0 && (f.removeEventListener("click", u), f.removeAttribute("data-embed-launcher"), f.removeAttribute("aria-haspopup")), i == null || i.dispose(), i = void 0;
  }, h = {
    kind: "launcher-armed",
    host: o,
    root: a.heroHost ?? f ?? o,
    styleElement: document.createElement("style"),
    unbind: p,
    dispose: () => {
      p(), rl() === h && vo(null);
    }
  };
  return vo(h), h;
}
function I_() {
  const a = cl();
  a && a.dispose();
  const o = rl();
  o && a !== o && o.dispose(), vo(null), Qn(null);
}
function dl(a, o) {
  if (a == null)
    throw new Error(`Embed.mount: ${o} is required`);
  if (typeof a != "string")
    return a;
  const i = document.querySelector(a);
  if (!i)
    throw new Error(`Embed.mount: ${o} not found: ${a}`);
  return i;
}
function M_(a) {
  if (a.launcher !== void 0)
    return dl(a.launcher, "launcher");
}
function D_(a) {
  if (a.target !== void 0)
    return dl(a.target, "target");
}
function U_(a) {
  if (a.target === void 0)
    throw new Error("Embed.mount: inline/standalone mode requires `target`");
  return dl(a.target, "target");
}
function L_(a) {
  if (I_(), Ev("Embed Runtime"), qh(a) || Vh(a)) {
    const o = dl(a.target, "target"), i = KA(a), s = QA(a, i), u = lx(o, i, s);
    Qn(u);
    return;
  }
  if (FA(a)) {
    if (XA(a) === "launcher") {
      const s = M_(a), u = D_(a);
      if (s === void 0 && u === void 0)
        throw new Error(
          "Embed.mount: Launcher Mode requires `launcher` and/or `target` (Embed Hero host)"
        );
      const f = C_({
        trigger: s,
        heroHost: u,
        objectId: a.objectId,
        assetBase: a.assetBase,
        launchContext: PA(a)
      });
      Qn(f);
      return;
    }
    const i = U_(a);
    VA(i, {
      objectId: a.objectId,
      assetBase: a.assetBase
    }).then((s) => {
      Qn(s);
    }).catch((s) => {
      console.error("Embed.mount: Client Studio delivery failed", s);
    });
    return;
  }
  throw new Error("Embed.mount: unsupported mount options");
}
const H_ = "0.1.0", Y_ = {
  mount: L_,
  unmount: Zh,
  version: H_,
  /** PT-DEPLOY-EMBED-01 — automatic Runtime build fingerprint. */
  build: Sb()
};
$A(Sv);
export {
  Y_ as Embed,
  Y_ as default
};
//# sourceMappingURL=embed.es.js.map
