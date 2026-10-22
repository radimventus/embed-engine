(function () {
  "use strict";
  const config = window.REALIVIDEO_LANDING_CONFIG || {};

  document.querySelectorAll("[data-year]").forEach((node) => {
    node.textContent = new Date().getFullYear();
  });

  document.querySelectorAll("[data-menu-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const nav = document.querySelector("[data-mobile-nav]");
      if (!nav) return;
      const open = nav.classList.toggle("is-open");
      button.setAttribute("aria-expanded", String(open));
    });
  });

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const target = document.querySelector(link.getAttribute("href"));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      document.querySelector("[data-mobile-nav]")?.classList.remove("is-open");
    });
  });

  document.querySelectorAll("[data-compare]").forEach((comparison) => {
    const range = comparison.querySelector("input[type=range]");
    const after = comparison.querySelector(".compare-after");
    const divider = comparison.querySelector(".compare-divider");
    if (!range || !after || !divider) return;
    const update = () => {
      const value = Number(range.value);
      after.style.clipPath = `inset(0 ${100 - value}% 0 0)`;
      divider.style.left = `${value}%`;
      range.setAttribute("aria-valuetext", `${value} % upravené fotografie`);
    };
    range.addEventListener("input", update);
    update();
  });

  const grid = document.querySelector("[data-construction-packages]");
  if (grid && Array.isArray(config.constructionPackages)) {
    const display = (value) => value || "Bude doplněno";
    grid.innerHTML = config.constructionPackages.map((pkg, index) => `
      <article class="package-card${pkg.featured ? " is-featured" : ""}" data-package="${pkg.id}">
        ${pkg.featured ? '<div class="package-badge">Nejčastější výchozí situace</div>' : ""}
        <div class="package-number">0${index + 1}</div>
        <p class="package-situation">${pkg.situation}</p>
        <h3>${pkg.name}</h3>
        <p class="package-product">${pkg.product}</p>
        <ul>${pkg.features.map((item) => `<li>${item}</li>`).join("")}</ul>
        <dl class="package-specs">
          <div><dt>Cena</dt><dd>${pkg.price || "Cena bude doplněna"}</dd></div>
          <div><dt>Vstupní fotografie</dt><dd>${display(pkg.inputPhotos)}</dd></div>
          <div><dt>Délka videa</dt><dd>${display(pkg.videoLength)}</dd></div>
          <div><dt>Revize</dt><dd>${display(pkg.revisions)}</dd></div>
          <div><dt>Rozsah úprav</dt><dd>${display(pkg.edits)}</dd></div>
          <div><dt>Dodání</dt><dd>${display(pkg.delivery)}</dd></div>
        </dl>
        <button class="button button-secondary package-select" type="button" data-package-select="${pkg.id}">Vybrat ${pkg.name}</button>
      </article>
    `).join("");
  }

  const selection = document.querySelector("[data-package-selection]");
  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-package-select]");
    if (!button || !selection) return;
    const pkg = config.constructionPackages?.find((item) => item.id === button.dataset.packageSelect);
    if (!pkg) return;
    document.querySelectorAll(".package-card").forEach((card) => card.classList.remove("is-selected"));
    button.closest(".package-card")?.classList.add("is-selected");
    selection.hidden = false;
    selection.querySelector("[data-selected-name]").textContent = pkg.name;
    const mail = selection.querySelector("[data-selected-mail]");
    mail.href = `mailto:kontakt@realivideo.cz?subject=${encodeURIComponent(`RealiVideo – zájem o ${pkg.name}`)}`;
    selection.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  const checkoutShell = document.querySelector("[data-broker-checkout]");
  const checkoutFrame = document.querySelector("[data-checkout-frame]");
  let pendingBrokerProduct = "tip";

  function labelPremium(root) {
    if (!root) return;
    const replace = (node) => {
      if (node.nodeType === Node.TEXT_NODE && /BALÍČEK TOP|^TOP\b/.test(node.nodeValue || "")) {
        node.nodeValue = node.nodeValue.replace("BALÍČEK TOP", "BALÍČEK PREMIUM").replace(/^TOP\b/, "PREMIUM");
      }
    };
    const walker = root.ownerDocument.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) replace(walker.currentNode);
  }

  function selectBrokerProduct(productId) {
    const win = checkoutFrame?.contentWindow;
    const order = win?.realivideoOrder;
    if (!order) return false;
    ["basic", "tip", "top"].forEach((id) => {
      if (id !== productId) order.removeProduct(id);
    });
    order.addProduct(productId);
    labelPremium(checkoutFrame.contentDocument?.getElementById("order-module"));
    document.querySelectorAll("[data-broker-card]").forEach((card) => {
      card.classList.toggle("is-selected", card.dataset.brokerCard === productId);
    });
    return true;
  }

  function openBrokerCheckout(productId) {
    if (!checkoutShell || !checkoutFrame) return;
    pendingBrokerProduct = productId;
    checkoutShell.hidden = false;
    selectBrokerProduct(productId);
    checkoutShell.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  document.querySelectorAll("[data-broker-product]").forEach((button) => {
    button.addEventListener("click", () => openBrokerCheckout(button.dataset.brokerProduct));
  });

  checkoutFrame?.addEventListener("load", () => {
    const doc = checkoutFrame.contentDocument;
    const orderModule = doc?.getElementById("order-module");
    if (!doc || !orderModule) return;

    const style = doc.createElement("style");
    style.textContent = `
      html,body{margin:0!important;background:#fff!important;overflow-x:hidden!important}
      body>:not(main){display:none!important}
      main>:not(#balicky){display:none!important}
      #balicky{display:block!important;padding:0!important;border:0!important}
      #balicky>.container{width:100%!important;max-width:none!important;margin:0!important;padding:0!important}
      #balicky>.container>*:not(#order-module){display:none!important}
      #order-module{display:block!important;margin:0!important;padding:0!important}
      #rv-order{margin:0!important;padding:28px!important}
      #rv-order .rv-mode{display:none!important}
      @media(max-width:650px){#rv-order{padding:18px 12px!important}#rv-order .rv-order-head h2{font-size:27px!important}}
    `;
    doc.head.appendChild(style);

    const orderHeadCopy = orderModule.querySelector(".rv-order-head p");
    if (orderHeadCopy) orderHeadCopy.textContent = "Zvolený balíček můžete změnit níže. Poté doplňte údaje a pokračujte podle pokynů.";

    const select = doc.getElementById("rvProductSelect");
    if (select) {
      [...select.options].forEach((option) => {
        if (option.value && !["basic", "tip", "top"].includes(option.value)) option.remove();
      });
    }

    doc.getElementById("rvAddProduct")?.addEventListener("click", (event) => {
      const next = select?.value;
      if (!["basic", "tip", "top"].includes(next)) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      ["basic", "tip", "top"].forEach((id) => {
        if (id !== next) checkoutFrame.contentWindow.realivideoOrder?.removeProduct(id);
      });
      checkoutFrame.contentWindow.realivideoOrder?.addProduct(next);
      select.value = "";
      pendingBrokerProduct = next;
      labelPremium(orderModule);
      document.querySelectorAll("[data-broker-card]").forEach((card) => card.classList.toggle("is-selected", card.dataset.brokerCard === next));
    }, true);

    new doc.defaultView.MutationObserver(() => labelPremium(orderModule)).observe(orderModule, { childList: true, subtree: true });
    new doc.defaultView.ResizeObserver(() => {
      checkoutFrame.style.height = `${Math.ceil(orderModule.getBoundingClientRect().height + 4)}px`;
    }).observe(orderModule);

    checkoutShell.classList.add("is-ready");
    selectBrokerProduct(pendingBrokerProduct);
  });
})();
