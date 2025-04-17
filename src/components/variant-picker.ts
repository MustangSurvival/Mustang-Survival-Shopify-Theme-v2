import { BaseElementWithoutShadowDOM } from '@/base/BaseElement'
import { CustomSelect } from '@/entry/core/core-custom-select'
import { customElement } from 'lit/decorators.js'

export const VARIANT_PICKER_CHANGE_EVENT = 'variant-picker:change'
export type VariantPickerChangeEvent = CustomEvent<{
  event: Event
  target: EventTarget
  variantId?: string
  productUrl?: string
  selectedOptionValues: string[]
  sellingPlan?: string
}>
@customElement('variant-picker')
export class VariantPicker extends BaseElementWithoutShadowDOM {
  connectedCallback(): void {
    super.connectedCallback()
    this._handleOptionChange = this._handleOptionChange.bind(this)
    this.addEventListener('change', this._handleOptionChange)
  }

  disconnectedCallback(): void {
    super.disconnectedCallback()
    this.removeEventListener('change', this._handleOptionChange)
  }

  getValueFromTarget(target: HTMLElement) {
    switch (target.tagName) {
      case 'SELECT':
        return (target as HTMLSelectElement).selectedOptions[0]
      case 'CUSTOM-SELECT':
        return (target as CustomSelect).getSelectedOptionByValue(
          (target as CustomSelect).value
        )?.el
      default:
        return target
    }
  }

  getVariantIdFromCustomSelect(target: HTMLElement) {
    const selectedOption = (target as CustomSelect).getSelectedOptionByValue(
      (target as CustomSelect).value
    )
    if (selectedOption) {
      return selectedOption.el.dataset.variantId
    }
    return
  }

  getProductUrlFromCustomSelect(target: HTMLElement) {
    const selectedOption = (target as CustomSelect).getSelectedOptionByValue(
      (target as CustomSelect).value
    )
    if (selectedOption) {
      return selectedOption.el.dataset.productUrl
    }
    return
  }

  _handleOptionChange(event: Event): void {
    event.stopPropagation()
    const target = event.target as HTMLElement
    const dataTarget = this.getValueFromTarget(target) || target

    const variantId =
      target.tagName === 'CUSTOM-SELECT'
        ? this.getVariantIdFromCustomSelect(target)
        : dataTarget.dataset.variantId
    const productUrl =
      target.tagName === 'CUSTOM-SELECT'
        ? this.getProductUrlFromCustomSelect(target)
        : dataTarget.dataset.productUrl

    target &&
      this.$emit(VARIANT_PICKER_CHANGE_EVENT, {
        event,
        target: dataTarget,
        variantId: variantId,
        productUrl: productUrl,
        selectedOptionValues: this.selectedOptionValues,
      })
  }

  get selectedOptionValues() {
    return Array.from(
      this.querySelectorAll(
        'select, fieldset input:checked'
      ) as NodeListOf<HTMLElement>
    )
      .map(({ dataset }) => dataset.optionValueId)
      .filter(Boolean) as string[]
  }
}
