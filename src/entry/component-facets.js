import { BaseElementWithoutShadowDOM } from '@/base/BaseElement'
import { ON_CHANGE_DEBOUNCE_TIMER, debounce } from '@/lib/debounce'
import HTMLUpdateUtility from '@/mixins/HTMLUpdateUtility'

export class FacetFiltersForm extends BaseElementWithoutShadowDOM {
  static get properties() {
    return {
      sectionId: { type: String, attribute: 'section-id' },
      params: { type: String },
      loading: { type: Boolean, reflect: true },
    }
  }
  $htmlUpdateUtility = new HTMLUpdateUtility(this)

  sectionId = ''
  params = ''
  loading = false

  constructor() {
    super()

    this.onChangeHandler = this.onChangeHandler.bind(this)
    this.onSubmitHandler = this.onSubmitHandler.bind(this)
    this._handleDebounceChange = debounce(
      this.onChangeHandler,
      ON_CHANGE_DEBOUNCE_TIMER
    )
  }

  connectedCallback() {
    super.connectedCallback()
    this.facetForm = this.querySelector('form')
    /**
     * Updates available filters and their counts on every selection
     *
     * If you're moving the filters outside the modal,
     * you might want to submit the form onChange to load the new results.
     */

    this.facetForm.addEventListener('change', this._handleDebounceChange)

    // Update the product grid when the form is submitted
    this.facetForm.addEventListener('submit', this.onSubmitHandler)

    this.$htmlUpdateUtility.addPostProcessCallback(() => {
      this.loading = false
      this.restoreCheckboxState()
    })

    this.restoreCheckboxState()

    const urlParams = new URLSearchParams(window.location.search)
    if (
      !urlParams.has('filter.v.price.gte') &&
      !urlParams.has('filter.v.price.lte')
    ) {
      this.querySelectorAll("input[type='checkbox'][data-price-min]").forEach(
        (checkbox) => {
          checkbox.checked = false
        }
      )
    }
  }

  updateURLHash(searchParams) {
    history.pushState(
      { searchParams },
      '',
      `${window.location.pathname}${searchParams && '?'.concat(searchParams)}`
    )
  }

  get paramsObjectFromString() {
    const params = new URLSearchParams(this.params)

    return [...params.entries()].reduce((acc, [key, value]) => {
      // Necessary hack to handle multiple values for the same key

      return {
        ...acc,
        [key]: [...(acc[key] || []), value],
      }
    }, {})
  }

  createSearchParams(form) {
    const formData = new FormData(form)
    return new URLSearchParams(formData).toString()
  }

  onChange(searchParams) {
    this.params = searchParams
    this.loading = true

    this.$htmlUpdateUtility
      .fetchAndReplaceSectionId({
        renderRoot: this,
        sectionId: this.sectionId,
        baseUrl: window.location.pathname,
        params: this.paramsObjectFromString,
        // Excluding existing params to avoid conflicts with the emptied values
        includeExistingParams: false,
        withCache: true,
      })
      .catch((error) => {
        if (error instanceof Error) {
          throw error
        } else {
          console.warn(error)
        }
      })
  }

  updatePriceInputsFromCheckboxes() {
    const checkedCheckboxes = Array.from(
      this.querySelectorAll("input[type='checkbox'][data-price-min]:checked")
    )
    const fromInput = this.querySelector("input[id$='GTE']")
    const toInput = this.querySelector("input[id$='LTE']")

    if (!fromInput || !toInput) return

    if (checkedCheckboxes.length === 0) {
      fromInput.value = 0
      const maxPrice =
        fromInput.getAttribute('data-max') ||
        toInput.getAttribute('data-max') ||
        ''
      toInput.value = maxPrice
      return
    }

    let minVal = Infinity
    let maxVal = -Infinity

    checkedCheckboxes.forEach((checkbox) => {
      const cbMin = Number(checkbox.getAttribute('data-price-min'))
      const cbMax = Number(checkbox.getAttribute('data-price-max'))
      if (cbMin < minVal) minVal = cbMin
      if (cbMax > maxVal) maxVal = cbMax
    })

    fromInput.value = minVal
    toInput.value = maxVal
  }

  restoreCheckboxState() {
    const fromInput = this.querySelector("input[id$='GTE']")
    const toInput = this.querySelector("input[id$='LTE']")
    if (!fromInput || !toInput) return

    const parseSanitizedValue = (value) => parseFloat(value.replace(/,/g, ''))
    const currentFrom = parseSanitizedValue(fromInput.value)
    const currentTo = parseSanitizedValue(toInput.value)

    const checkboxes = this.querySelectorAll(
      "input[type='checkbox'][data-price-min]"
    )

    if (isNaN(currentFrom) || isNaN(currentTo)) {
      checkboxes.forEach((checkbox) => (checkbox.checked = false))
      return
    }

    const defaultMax = parseFloat(
      fromInput.getAttribute('data-max') ||
        toInput.getAttribute('data-max') ||
        '0'
    )
    const urlParams = new URLSearchParams(window.location.search)
    const hasPriceFilter =
      urlParams.has('filter.v.price.gte') || urlParams.has('filter.v.price.lte')

    console.log({ currentFrom, currentTo, defaultMax, hasPriceFilter })

    if (!hasPriceFilter && currentFrom === 0 && currentTo === defaultMax) {
      checkboxes.forEach((checkbox) => (checkbox.checked = false))
      return
    }

    if (hasPriceFilter && currentFrom === 0 && currentTo >= defaultMax) {
      checkboxes.forEach((checkbox) => (checkbox.checked = true))
      return
    }

    checkboxes.forEach((checkbox) => {
      const cbMin = Number(checkbox.getAttribute('data-price-min'))
      const cbMax = Number(checkbox.getAttribute('data-price-max'))
      checkbox.checked = cbMin >= currentFrom && cbMax <= currentTo
    })
  }

  onChangeHandler(event) {
    event.preventDefault()

    if (event.target.matches("input[type='checkbox'][data-price-min]")) {
      this.updatePriceInputsFromCheckboxes()
    }

    this.onChange(this.createSearchParams(this.facetForm))
  }

  onSubmit() {
    this.updateURLHash(this.params)

    /**
     * Reloading the full section here since the filters are in a modal.
     * If you're moving the filters outside the modal, you might want to
     * update the product grid only.
     *
     * To do so, you need to remove the `sub-section-id` from the facets container,
     * currently added on the #main-collection-filters element.
     */

    const collectionSection = document.getElementById('collection')

    this.$htmlUpdateUtility
      .fetchAndReplaceSectionId({
        renderRoot: collectionSection,
        sectionId: collectionSection?.dataset.sectionId,
        baseUrl: window.location.pathname,
        params: this.paramsObjectFromString,
        includeExistingParams: false,
        withCache: true,
      })
      .catch((error) => {
        if (error instanceof Error) {
          throw error
        } else {
          console.warn(error)
        }
      })
  }

  onSubmitHandler(event) {
    event.preventDefault()

    this.onSubmit()
    this.$emit('modal-dialog::close', 'filter-drawer-dialog')
  }
}

window.customElements.define('facet-filters-form', FacetFiltersForm)
