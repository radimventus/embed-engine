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

  const compareSequences = new Map();

  function updateComparison(comparison, value, animate = false) {
    const range = comparison.querySelector("input[type=range]");
    const after = comparison.querySelector(".compare-after");
    const divider = comparison.querySelector(".compare-divider");
    if (!range || !after || !divider) return;
    const transition = animate ? "left .8s ease-in-out, clip-path .8s ease-in-out" : "none";
    after.style.transition = transition;
    divider.style.transition = transition;
    after.style.clipPath = `inset(0 ${100 - value}% 0 0)`;
    divider.style.left = `${value}%`;
    range.value = String(value);
    range.setAttribute("aria-valuetext", `${value} % upravené fotografie`);
  }

  function stopComparison(comparison) {
    const sequence = compareSequences.get(comparison);
    if (!sequence) return;
    window.clearInterval(sequence.interval);
    sequence.timeouts.forEach((timeout) => window.clearTimeout(timeout));
    compareSequences.delete(comparison);
    updateComparison(comparison, Number(comparison.querySelector("input[type=range]")?.value || 50), false);
  }

  function startComparison(comparison) {
    stopComparison(comparison);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const sequence = { interval: 0, timeouts: [] };
    const run = () => {
      sequence.timeouts.forEach((timeout) => window.clearTimeout(timeout));
      sequence.timeouts = [
        window.setTimeout(() => updateComparison(comparison, 100, true), 1000),
        window.setTimeout(() => updateComparison(comparison, 0, true), 2300),
        window.setTimeout(() => updateComparison(comparison, 50, true), 3600),
        window.setTimeout(() => updateComparison(comparison, 50, false), 5000)
      ];
    };
    run();
    sequence.interval = window.setInterval(run, 8000);
    compareSequences.set(comparison, sequence);
  }

  document.querySelectorAll("[data-compare]").forEach((comparison) => {
    const range = comparison.querySelector("input[type=range]");
    if (!range) return;
    const update = () => updateComparison(comparison, Number(range.value), false);
    range.addEventListener("pointerdown", () => stopComparison(comparison));
    range.addEventListener("touchstart", () => stopComparison(comparison), { passive: true });
    range.addEventListener("input", update);
    update();
  });

  document.querySelectorAll(".compare-item").forEach((item) => {
    item.addEventListener("toggle", () => {
      if (!item.open) {
        item.querySelectorAll("[data-compare]").forEach(stopComparison);
        return;
      }
      document.querySelectorAll(".compare-item").forEach((other) => {
        if (other !== item) other.open = false;
      });
      document.querySelectorAll("[data-compare]").forEach(stopComparison);
      item.querySelectorAll("[data-compare]").forEach(startComparison);
    });
  });
  document.querySelectorAll(".compare-item[open] [data-compare]").forEach(startComparison);

  const grid = document.querySelector("[data-construction-packages]");
  if (grid && Array.isArray(config.constructionPackages)) {
    grid.innerHTML = config.constructionPackages.map((pkg, index) => `
      <article class="package-card${pkg.featured ? " is-featured" : ""}" data-package="${pkg.id}">
        ${pkg.featured ? '<div class="package-badge">DOPORUČUJEME</div>' : ""}
        <div class="package-number">0${index + 1}</div>
        <p class="package-situation">${pkg.situation}</p>
        <h3>${pkg.name}</h3>
        <p class="package-product">${pkg.product}</p>
        <ul>${pkg.features.map((item) => `<li>${item}</li>`).join("")}</ul>
        <div class="broker-price">${pkg.price || "Cena dle rozsahu"}</div>
        <button class="button button-secondary package-select" type="button" data-construction-product="${pkg.id}">Objednat ${pkg.name}</button>
      </article>
    `).join("");
  }

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
    const brokerProducts = ["basic", "tip", "top", "photo", "viz1", "viz3", "viz5"];
    const brokerBases = ["basic", "tip", "top"];
    const visualizationAddons = ["viz1", "viz3", "viz5"];
    if (select) {
      [...select.options].forEach((option) => {
        if (option.value && !brokerProducts.includes(option.value)) option.remove();
      });
      [...select.querySelectorAll("optgroup")].forEach((group) => {
        if (!group.querySelector("option")) group.remove();
      });
    }

    doc.getElementById("rvAddProduct")?.addEventListener("click", (event) => {
      const next = select?.value;
      if (!brokerProducts.includes(next)) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      if (brokerBases.includes(next)) {
        brokerBases.forEach((id) => {
          if (id !== next) checkoutFrame.contentWindow.realivideoOrder?.removeProduct(id);
        });
      }
      if (visualizationAddons.includes(next)) {
        visualizationAddons.forEach((id) => {
          if (id !== next) checkoutFrame.contentWindow.realivideoOrder?.removeProduct(id);
        });
      }
      checkoutFrame.contentWindow.realivideoOrder?.addProduct(next);
      select.value = "";
      if (brokerBases.includes(next)) pendingBrokerProduct = next;
      labelPremium(orderModule);
      if (brokerBases.includes(next)) {
        document.querySelectorAll("[data-broker-card]").forEach((card) => card.classList.toggle("is-selected", card.dataset.brokerCard === next));
      }
    }, true);

    new doc.defaultView.ResizeObserver(() => {
      checkoutFrame.style.height = `${Math.ceil(orderModule.getBoundingClientRect().height + 4)}px`;
    }).observe(orderModule);

    checkoutShell.classList.add("is-ready");
    selectBrokerProduct(pendingBrokerProduct);
  });

  const constructionCheckoutShell = document.querySelector("[data-construction-checkout]");
  const constructionCheckoutFrame = document.querySelector("[data-construction-frame]");
  const constructionBases = ["construction-basic", "construction-tip", "construction-premium"];
  const sharedAddons = ["photo", "viz1", "viz3", "viz5"];
  const constructionProducts = [...constructionBases, ...sharedAddons];
  let pendingConstructionProduct = "construction-tip";

  function selectConstructionProduct(productId) {
    const order = constructionCheckoutFrame?.contentWindow?.realivideoOrder;
    if (!order || !constructionBases.includes(productId)) return false;
    constructionBases.forEach((id) => {
      if (id !== productId) order.removeProduct(id);
    });
    order.addProduct(productId);
    document.querySelectorAll("[data-package]").forEach((card) => {
      card.classList.toggle("is-selected", card.dataset.package === productId);
    });
    return true;
  }

  function openConstructionCheckout(productId) {
    if (!constructionCheckoutShell || !constructionCheckoutFrame) return;
    pendingConstructionProduct = productId;
    constructionCheckoutShell.hidden = false;
    selectConstructionProduct(productId);
    constructionCheckoutShell.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  document.querySelectorAll("[data-construction-product]").forEach((button) => {
    button.addEventListener("click", () => openConstructionCheckout(button.dataset.constructionProduct));
  });

  constructionCheckoutFrame?.addEventListener("load", () => {
    const doc = constructionCheckoutFrame.contentDocument;
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
    if (orderHeadCopy) orderHeadCopy.textContent = "Zvolený stavební balíček můžete změnit níže. Doplňkové služby jsou společné pro obě nabídky.";

    const select = doc.getElementById("rvProductSelect");
    const visualizationAddons = ["viz1", "viz3", "viz5"];
    if (select) {
      [...select.options].forEach((option) => {
        if (option.value && !constructionProducts.includes(option.value)) option.remove();
      });
      [...select.querySelectorAll("optgroup")].forEach((group) => {
        if (!group.querySelector("option")) group.remove();
      });
    }

    doc.getElementById("rvAddProduct")?.addEventListener("click", (event) => {
      const next = select?.value;
      if (!constructionProducts.includes(next)) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      if (constructionBases.includes(next)) {
        constructionBases.forEach((id) => {
          if (id !== next) constructionCheckoutFrame.contentWindow.realivideoOrder?.removeProduct(id);
        });
      }
      if (visualizationAddons.includes(next)) {
        visualizationAddons.forEach((id) => {
          if (id !== next) constructionCheckoutFrame.contentWindow.realivideoOrder?.removeProduct(id);
        });
      }
      constructionCheckoutFrame.contentWindow.realivideoOrder?.addProduct(next);
      select.value = "";
      if (constructionBases.includes(next)) {
        pendingConstructionProduct = next;
        document.querySelectorAll("[data-package]").forEach((card) => {
          card.classList.toggle("is-selected", card.dataset.package === next);
        });
      }
    }, true);

    new doc.defaultView.ResizeObserver(() => {
      constructionCheckoutFrame.style.height = `${Math.ceil(orderModule.getBoundingClientRect().height + 4)}px`;
    }).observe(orderModule);

    constructionCheckoutShell.classList.add("is-ready");
    selectConstructionProduct(pendingConstructionProduct);
  });
})();
