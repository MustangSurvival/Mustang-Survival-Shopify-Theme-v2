import { FormElement } from '@/base/FormElement'
import firstFocusableElement from '@/lib/firstFocusableElement'
import { MediaQueryUtility } from '@/mixins/MediaQueryUtility'
import { autoUpdate, computePosition, flip, offset } from '@floating-ui/dom'
import { PropertyValueMap, css, html, nothing } from 'lit'
import { property, state } from 'lit/decorators.js'
import { map } from 'lit/directives/map.js'
import { type Ref, createRef, ref } from 'lit/directives/ref.js'

export type CustomSelectOptionType = {
  label: string
  value: string
  disabled?: boolean
  selected?: boolean
  icon?: string
  el: HTMLOptionElement
}

export class CustomSelect extends FormElement {
  static EVENTS = {
    OPEN: 'open',
    CLOSE: 'close',
  }

  static styles = [
    css`
      @starting-style {
        .custom-select__dropdown {
          opacity: 0 !important;
          transform: translateY(2rem) !important;
        }
      }
    `,
  ]

  static CUSTOM_SELECT_BREAKPOINT: string = '(min-width: 1024px)'
  mediaQueryUtility: MediaQueryUtility = new MediaQueryUtility(
    this,
    CustomSelect.CUSTOM_SELECT_BREAKPOINT
  )

  @property({ type: String })
  label: string = ''

  @property({ type: Boolean })
  inline: boolean = false

  @property({ type: String })
  icon: string = ''

  @property({ type: String })
  placeholder = 'Select an option'

  @property({ type: Boolean, attribute: 'always-show-placeholder' })
  alwaysShowPlaceholder = false

  @property({ type: Boolean })
  error: boolean = false

  @property({ type: Array, attribute: 'options' })
  _options: CustomSelectOptionType[] = []

  @property({ type: String })
  helpText: string = ''

  @property({ type: String })
  errorText: string = ''

  @state()
  _expanded: boolean = false

  toggleElement: Ref<HTMLButtonElement> = createRef()
  listboxElement: Ref<HTMLUListElement> = createRef()

  _cleanupWatcher: (() => void) | null = null

  constructor() {
    super()
    this._handleDocumentClick = this._handleDocumentClick.bind(this)
    this._handleDocumentKeyDown = this._handleDocumentKeyDown.bind(this)
    this._handleClick = this._handleClick.bind(this)
    this._collectionDataFromChildren()
    this.mediaQueryUtility.addOnChangeCallback(() => this._onMediaQueryChange())
    this._onMediaQueryChange()
  }

  _collectionDataFromChildren() {
    const $options = Array.from(this.querySelectorAll('option'))

    if ($options.length === 0) return
    this._options = $options.map((option) => ({
      label: option.textContent || '',
      value: option.value || '',
      icon: option.dataset.icon || '',
      el: option,
    }))
  }

  protected firstUpdated(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {
    super.firstUpdated(_changedProperties)
    document.addEventListener('click', this._handleDocumentClick)
    document.addEventListener('keydown', this._handleDocumentKeyDown)
  }

  disconnectedCallback(): void {
    super.disconnectedCallback()
    document.removeEventListener('click', this._handleDocumentClick)
    document.removeEventListener('keydown', this._handleDocumentKeyDown)
  }

  _handleDocumentClick(event: MouseEvent) {
    if (!this.contains(event.target as Node)) {
      this._expanded = false
      return
    }
  }

  _onMediaQueryChange() {
    const select = this.querySelector('select')
    if (this.mediaQueryUtility.active && !this.multiple) {
      select?.setAttribute('form', 'form-random' + Math.random())
    } else {
      select?.removeAttribute('form')
    }
  }

  _handleClick(event: MouseEvent) {
    if (!this._expanded) return
    const listbox = this.listboxElement.value
    const target: HTMLElement | null = event.target as HTMLElement
    if (!listbox || !target) return
    if (!listbox.contains(target)) return

    const selectedItem = (
      target.tagName === 'BUTTON' ? target : target.closest('button')
    ) as HTMLButtonElement | null

    if (!selectedItem) return
    if (selectedItem.disabled) return
    this.selectValue(selectedItem.value)

    if (!this.multiple) {
      this._expanded = false
    }
  }

  // Check if multiple is true, if so, add or remove the value from the array
  // If multiple is false, set the value to the selected value
  selectValue(value: string) {
    if (this.multiple) {
      const selectedValues = new Set(this.parsedValue as string[])
      if (selectedValues.has(value)) {
        selectedValues.delete(value)
      } else {
        selectedValues.add(value)
      }

      this.value = Array.from(selectedValues).filter(Boolean).join(',')
    } else {
      this.value = value
    }

    const innerSelect = this.querySelector('select')
    if (innerSelect) {
      innerSelect.value = value
    }
  }

  get currentActiveElement() {
    if (this.renderRoot instanceof ShadowRoot) {
      return this.renderRoot.activeElement
    }
    return document.activeElement
  }

  _handleDocumentKeyDown(event: KeyboardEvent) {
    if (!this._expanded) return
    if (event.key === 'Escape') {
      this._expanded = false
    }

    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault()
      const listbox = this.listboxElement.value
      if (!listbox) return
      const items = Array.from(listbox.querySelectorAll('button'))
      const activeElement = this.currentActiveElement
      const currentIndex = items.findIndex((item) => item === activeElement)

      if (currentIndex === -1) {
        items[0].focus()
        return
      }

      const nextIndex =
        event.key === 'ArrowUp' ? currentIndex - 1 : currentIndex + 1
      if (nextIndex < 0) {
        return items[items.length - 1].focus()
      } else if (nextIndex >= items.length) {
        return items[0].focus()
      } else {
        items[nextIndex].focus()
      }
    }
  }

  _handleToggleClick() {
    this._expanded = !this._expanded
  }

  protected updated(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {
    super.updated(_changedProperties)
    if (
      _changedProperties.has('_expanded') &&
      typeof _changedProperties.get('_expanded') === 'boolean'
    ) {
      this._handleExpandedStateChange()
    }
  }

  _positionListbox(toggleElement: HTMLElement, listboxElement: HTMLElement) {
    computePosition(toggleElement, listboxElement, {
      placement: 'bottom-start',
      strategy: 'absolute',
      middleware: [
        offset(5),
        flip({
          crossAxis: false,
          fallbackPlacements: ['top-start', 'bottom-start'],
          fallbackAxisSideDirection: 'start',
        }),
      ],
    }).then(({ x, y }) => {
      Object.assign(listboxElement.style, {
        left: `${x}px`,
        top: `${y}px`,
      })
    })
  }

  async _handleExpandedStateChange() {
    this._cleanupWatcher?.()
    await this.updateComplete
    if (!this._expanded) {
      return
    }
    const toggleElement = this.toggleElement.value
    const listboxElement = this.listboxElement.value

    if (!toggleElement || !listboxElement) return
    // Leveraging the floating-ui library to position the listbox
    // and update the position when the window is resized
    // or the listbox is scrolled
    // Anchoring Logic allows the listbox to be positioned relative to the toggle element
    // depending on the available space in the viewport
    this._cleanupWatcher = autoUpdate(toggleElement, listboxElement, () =>
      this._positionListbox(toggleElement, listboxElement)
    )

    this._onExpanded()
  }

  _onCollapsed() {
    this.toggleElement.value?.focus()
    this.$emit(CustomSelect.EVENTS.CLOSE, { value: this.value })
  }

  _onExpanded() {
    setTimeout(() => {
      this.listboxElement.value &&
        firstFocusableElement(this.listboxElement.value)?.focus()
    }, 100)

    this.$emit(CustomSelect.EVENTS.OPEN, { value: this.value })
  }

  get _processedOptions() {
    const options = this._options
    const value = this.parsedValue

    return options.map((option) => {
      return {
        ...option,
        selected:
          this.multiple && Array.isArray(value)
            ? value.includes(option.value)
            : option.value === value,
      }
    })
  }

  get parsedValue() {
    return this.multiple ? String(this.value).split(',') : this.value
  }

  get idForToggle() {
    return `${this.id}-toggle`
  }

  get idForListbox() {
    return `${this.id}-listbox`
  }

  get helpTextHTML() {
    if (!this.helpText) return nothing

    return html`
      <p id="${this.id}_text" class=${CLASSES_MAPPING.HELP_TEXT}>
        ${this.helpText}
      </p>
    `
  }

  get labelHTML() {
    return html`
      <label for="${this.idForToggle}" class=${CLASSES_MAPPING.LABEL}>
        ${this.label}
      </label>
    `
  }

  getDropdownItemHTML(option: CustomSelectOptionType) {
    console.log({ option })
    return html`
      <button
        type="button"
        class=${CLASSES_MAPPING.DROPDOWN_ITEM}
        role="option"
        aria-selected="${option.selected}"
        value="${option.value}"
        ?selected=${option.selected}
        ?disabled=${option.disabled}
      >
        <span class="group-focus:ring-u-focus group-focus-visible:ring-2 flex items-center gap-2">
          ${
            option.icon
              ? html`<img src="${option.icon}" class="size-[25px]"></img>`
              : nothing
          }
          ${this.renderOptionLabel(option.label, option)}
        </span>
      </button>
    `
  }

  /**
   * Renders the option label, can be overridden to render custom HTML
   * @param label - The label of the option
   * @param _option - The option object
   * @returns The rendered label
   */
  renderOptionLabel(
    label: CustomSelectOptionType['label'],
    _option: CustomSelectOptionType // eslint-disable-line
  ) {
    return label
  }

  get hasSelectedOption() {
    return this._processedOptions.some((option) => option.selected)
  }

  get _currentToggleLabel() {
    if (this.alwaysShowPlaceholder || !this.hasSelectedOption) {
      return this.placeholder
    }

    const processedOptions = this._processedOptions

    console.log({ processedOptions })
    if (this.multiple) {
      const selectedOptions = processedOptions.filter(
        (option) => option.selected
      )
      return selectedOptions.map((option) => option.label).join(', ')
    }

    const selectedOption = processedOptions.find((option) => option.selected)
    return selectedOption ? selectedOption.label : this.placeholder
  }

  get getCustomSelectHTML() {
    const selectedOption = this._processedOptions.find(
      (option) => option.selected
    )
    return html`
      <div
        class="group peer relative ${this.inline ? 'border-none' : 'w-full'}"
        ?error=${this.error}
        ?open=${this._expanded}
        @click=${this._handleClick}
      >
        <button
          ${ref(this.toggleElement)}
          type="button"
          role="combobox"
          @click=${this._handleToggleClick}
          aria-haspopup="listbox"
          class="relative"
          id="${this.idForToggle}"
          value="${this.value}"
          aria-controls="${this.idForListbox}"
          aria-expanded="${this._expanded}"
          aria-disabled="${this.disabled}"
          aria-label="${this.label}"
          ?disabled=${this.disabled}
          ${this.helpText ? `aria-describedby="${this.id}_text"` : ''}
          class=${this.inline ? CLASSES_MAPPING.TOGGLE_INLINE : CLASSES_MAPPING.TOGGLE}
        >
          <span class="block truncate pr-[5px]">
            ${
              selectedOption?.icon
                ? html`<img src="${selectedOption.icon}" class="size-[25px]"></img>`
                : nothing
            }
            ${this._currentToggleLabel}
          </span>
          <div class=${CLASSES_MAPPING.TOGGLE_ICON}>
            <svg-icon
              src="c-icon-caret"
              class="block rotate-180"
              style="font-size: 12px;"
            ></svg-icon>
          </div>
        </button>
        
        <div
          ${ref(this.listboxElement)}
          id="dropdown"
          role="listbox"
          id="${this.idForListbox}"
          ?inert=${!this._expanded}
          class=${CLASSES_MAPPING.DROPDOWN}
          ${this.multiple ? 'aria-multiselectable="true"' : ''}
        >
          ${map(this._processedOptions, (option) =>
            this.getDropdownItemHTML(option)
          )}
        </div>
        ${this.inline ? nothing : this.labelHTML}
      </div>
      ${this.helpTextHTML}
    `
  }

  get getNativeSelectHTML() {
    return html`<slot></slot>`
  }

  getSelectedOptionByValue(value: string | number) {
    return this._options.find((option) => option.value === value)
  }

  render() {
    // If there are no options, do not render anything
    if (!Array.isArray(this._options) || this._options.length === 0) {
      return html`${nothing}`
    }

    return this.mediaQueryUtility.active || this.multiple
      ? this.getCustomSelectHTML
      : this.getNativeSelectHTML
  }
}

if (!customElements.get('custom-select')) {
  customElements.define('custom-select', CustomSelect)
}

const CLASSES_MAPPING = {
  TOGGLE:
    'text-[16px] text-left bg-c-form-bg w-full border appearance-none text-t-foreground disabled:text-t-border px-[13px] py-[14px] text-body bg-gray-50 bg-t-background border-t-line-break disabled:border-t-border focus:outline-none focus:ring-0 focus:border-t-foreground peer group-[[error]]:ring-u-error group-[[error]]:border-[transparent] group-[[error]]:ring-2 focus-visible:ring-2 focus-visible:ring-u-focus flex items-center justify-between',
  TOGGLE_INLINE:
    'text-left items-center flex appearance-none text-[inherit] disabled:text-t-border px-sm-forms-padding lg:px-lg-forms-padding h-sm-forms-inputheight lg:h-lg-forms-inputheight text-body focus:outline-none focus:ring-0 peer group-[[error]]:ring-u-error group-[[error]]:ring-2 focus-visible:ring-2 focus-visible:ring-u-focus',
  TOGGLE_ICON:
    'flex items-center size-3 pointer-events-none text-[inherit] group-[[error]]:text-u-error w-[9.8px] h-[6px]',
  LABEL: 'sr-only',
  HELP_TEXT:
    'caption text-t-foreground-secondary start-sm-forms-padding lg:start-sm-forms-padding',
  DROPDOWN:
    'custom-select__dropdown min-w-max bg-c-form-bg max-h-[50vh] overflow-y-scroll overflow-x-clip scrollbar-thin scrollbar-track-[transparent] scrollbar-thumb-p-neutral absolute z-20 hidden top-full left-0 w-full border border-t-line-break bg-t-background drop-shadow-md group-[[open]]:grid translate-y-4 opacity-0 transition-[opacity,display,transform] [transition-behavior:allow-discrete] motion-reduce:transition-none duration-300 group-[[open]]:translate-y-0 group-[[open]]:opacity-100 !motion-reduce:group-[[open]]:transition-none',
  DROPDOWN_ITEM:
    'px-forms-padding group ring-0 focus:ring-0 appearance-none outline-none py-xs bg-t-background text-body disabled:text-t-disabled border-t-line-break [&[selected]]:text-t-foreground [&[selected]]:bg-t-line-break focus-visible:text-t-foreground hover:text-t-foreground [&:disabled]:hover:text-t-disabled text-left border-b border-t-line-break last:border-b-0 border-solid',
}
