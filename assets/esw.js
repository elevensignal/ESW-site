/*
 * ESW Beauty theme components. Vanilla web components, loaded deferred after
 * Dawn's constants.js, pubsub.js and global.js.
 */

(() => {
  function formatMoney(cents, format = window.eswSettings?.moneyFormat || '${{amount}}') {
    const value = Number(cents) / 100;
    const withSeparators = (number, decimals, thousands, decimal) =>
      number
        .toFixed(decimals)
        .replace('.', decimal)
        .replace(/\B(?=(\d{3})+(?!\d))/g, thousands);

    return format.replace(/\{\{\s*(\w+)\s*\}\}/, (_, key) => {
      switch (key) {
        case 'amount_no_decimals':
          return withSeparators(value, 0, ',', '.');
        case 'amount_with_comma_separator':
          return withSeparators(value, 2, '.', ',');
        case 'amount_no_decimals_with_comma_separator':
          return withSeparators(value, 0, '.', ',');
        default:
          return withSeparators(value, 2, ',', '.');
      }
    });
  }

  window.eswFormatMoney = formatMoney;

  /*
   * <free-shipping-bar data-threshold="3500">
   * Server-rendered by snippets/esw-free-shipping-bar.liquid. Outside the cart
   * drawer (which re-renders itself) it refetches the cart after every update.
   */
  if (!customElements.get('free-shipping-bar')) {
    customElements.define(
      'free-shipping-bar',
      class FreeShippingBar extends HTMLElement {
        connectedCallback() {
          if (this.hasAttribute('data-static') || typeof subscribe !== 'function') return;
          this.unsubscribe = subscribe(PUB_SUB_EVENTS.cartUpdate, () => this.refresh());
        }

        disconnectedCallback() {
          this.unsubscribe?.();
        }

        async refresh() {
          try {
            const cart = await fetch(`${window.routes.cart_url}.js`).then((response) => response.json());
            this.update(cart.total_price);
          } catch (e) {
            console.error(e);
          }
        }

        update(totalCents) {
          const threshold = Number(this.dataset.threshold);
          const remaining = Math.max(threshold - totalCents, 0);
          const progress = threshold > 0 ? Math.min(totalCents / threshold, 1) : 1;

          const message = this.querySelector('[data-message]');
          message.textContent =
            remaining > 0
              ? this.dataset.messageAway.replace('[amount]', formatMoney(remaining))
              : this.dataset.messageUnlocked;

          const bar = this.querySelector('[role="progressbar"]');
          bar.setAttribute('aria-valuenow', Math.round(progress * 100));
          bar.style.setProperty('--progress', progress);
          this.classList.toggle('is-unlocked', remaining === 0);
        }
      }
    );
  }

  /*
   * <sticky-atc data-target="ProductSubmitButton-{{ section.id }}" data-section="{{ section.id }}">
   * Mobile sticky add-to-cart. Shows once the main button has scrolled above the
   * viewport and forwards clicks to it, so Dawn's product-form keeps handling
   * variants, errors and the cart drawer.
   */
  if (!customElements.get('sticky-atc')) {
    customElements.define(
      'sticky-atc',
      class StickyAtc extends HTMLElement {
        connectedCallback() {
          this.target = document.getElementById(this.dataset.target);
          this.button = this.querySelector('button');
          if (!this.target || !this.button) return;

          this.button.addEventListener('click', () => this.target.click());

          this.observer = new IntersectionObserver(([entry]) => {
            const scrolledPast = !entry.isIntersecting && entry.boundingClientRect.top < 0;
            this.classList.toggle('is-visible', scrolledPast);
            this.toggleAttribute('inert', !scrolledPast);
          });
          this.observer.observe(this.target);
          this.toggleAttribute('inert', true);

          if (typeof subscribe === 'function') {
            this.unsubscribe = subscribe(PUB_SUB_EVENTS.variantChange, ({ data }) => {
              if (data.sectionId !== this.dataset.section || !data.variant) return;
              this.querySelector('[data-price]').textContent = formatMoney(data.variant.price);
              this.button.disabled = !data.variant.available;
              this.button.querySelector('span').textContent = data.variant.available
                ? window.variantStrings.addToCart
                : window.variantStrings.soldOut;
            });
          }
        }

        disconnectedCallback() {
          this.observer?.disconnect();
          this.unsubscribe?.();
        }
      }
    );
  }

  /*
   * <add-items-button data-items='[{"id":1,"quantity":1}]'>
   * Adds several variants in one request ("Complete the routine: Add both").
   */
  if (!customElements.get('add-items-button')) {
    customElements.define(
      'add-items-button',
      class AddItemsButton extends HTMLElement {
        connectedCallback() {
          this.button = this.querySelector('button');
          this.error = this.querySelector('[role="alert"]');
          this.button?.addEventListener('click', this.onClick.bind(this));
        }

        async onClick() {
          if (this.button.getAttribute('aria-disabled') === 'true') return;
          const cart = document.querySelector('cart-drawer');
          const items = JSON.parse(this.dataset.items);

          this.button.setAttribute('aria-disabled', 'true');
          this.button.classList.add('loading');
          this.querySelector('.loading__spinner')?.classList.remove('hidden');
          if (this.error) this.error.hidden = true;

          const body = { items };
          if (cart) {
            body.sections = cart.getSectionsToRender().map((section) => section.id);
            body.sections_url = window.location.pathname;
            cart.setActiveElement(this.button);
          }

          try {
            const response = await fetch(`${window.routes.cart_add_url}`, {
              ...fetchConfig('javascript'),
              body: JSON.stringify(body),
            }).then((res) => res.json());

            if (response.status) throw new Error(response.description || response.message);

            publish(PUB_SUB_EVENTS.cartUpdate, { source: 'add-items-button', cartData: response });

            if (cart) {
              cart.classList.remove('is-empty');
              cart.renderContents(response);
            } else {
              window.location = window.routes.cart_url;
            }
          } catch (e) {
            if (this.error) {
              this.error.textContent = e.message || window.cartStrings.error;
              this.error.hidden = false;
            }
          } finally {
            this.button.removeAttribute('aria-disabled');
            this.button.classList.remove('loading');
            this.querySelector('.loading__spinner')?.classList.add('hidden');
          }
        }
      }
    );
  }
  /*
   * <variant-refresh id="..." data-section="{{ section.id }}">
   * Re-renders its contents from the section HTML that Dawn's product-info
   * fetches on every variant change, keeping any choices the shopper made.
   */
  if (!customElements.get('variant-refresh')) {
    customElements.define(
      'variant-refresh',
      class VariantRefresh extends HTMLElement {
        connectedCallback() {
          if (typeof subscribe !== 'function') return;
          this.unsubscribe = subscribe(PUB_SUB_EVENTS.variantChange, ({ data }) => {
            if (data.sectionId !== this.dataset.section) return;
            const fresh = data.html.getElementById(this.id);
            if (!fresh) return;

            const choices = [...this.querySelectorAll('input:checked, select')].map((el) => [el.name, el.value]);
            this.innerHTML = fresh.innerHTML;
            choices.forEach(([name, value]) => {
              const field = this.querySelector(`[name="${name}"]`);
              if (field?.tagName === 'SELECT') field.value = value;
              const radio = this.querySelector(`input[name="${name}"][value="${CSS.escape(value)}"]`);
              if (radio) radio.checked = true;
            });
            this.dispatchEvent(new Event('change', { bubbles: true }));
          });
        }

        disconnectedCallback() {
          this.unsubscribe?.();
        }
      }
    );
  }

  /*
   * <purchase-options>
   * Subscribe-and-save vs one-time. Writes the chosen plan into a hidden
   * selling_plan input that belongs to the product form (form="...").
   */
  if (!customElements.get('purchase-options')) {
    customElements.define(
      'purchase-options',
      class PurchaseOptions extends HTMLElement {
        connectedCallback() {
          this.addEventListener('change', () => this.sync());
          this.sync();
        }

        sync() {
          const input = this.querySelector('input[name="selling_plan"]');
          const subscribe = this.querySelector('input[name="purchase_type"][value="subscribe"]');
          const frequency = this.querySelector('[data-frequency]');
          if (!input || !subscribe) return;

          const isSubscription = subscribe.checked;
          input.disabled = !isSubscription;
          input.value = isSubscription ? frequency?.value || input.value : '';
          if (frequency) frequency.disabled = !isSubscription;
        }
      }
    );
  }
})();
