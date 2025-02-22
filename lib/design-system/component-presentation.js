import { ElementStyles } from '../element/styles/element-styles.js';
import { DI, Registration } from '../di/di.js';

function presentationKeyFromTag(tagName) {
  return `${tagName.toLowerCase()}:presentation`;
}

const presentationRegistry = new Map();

/**
 * An API gateway to component presentation features.
 * @public
 */
export const ComponentPresentation = Object.freeze({
  /**
   * Defines a component presentation for an element.
   * @param tagName - The element name to define the presentation for.
   * @param presentation - The presentation that will be applied to matching elements.
   * @param container - The dependency injection container to register the configuration in.
   * @public
   */
  define(tagName, presentation, container) {
    const key = presentationKeyFromTag(tagName);
    const existing = presentationRegistry.get(key);

    if (existing === void 0) {
      presentationRegistry.set(key, presentation);
    } else {
      // false indicates that we have more than one presentation
      // registered for a tagName and we must resolve through DI
      presentationRegistry.set(key, false);
    }

    container.register(Registration.instance(key, presentation));
  },
  /**
   * Finds a component presentation for the specified element name,
   * searching the DOM hierarchy starting from the provided element.
   * @param tagName - The name of the element to locate the presentation for.
   * @param element - The element to begin the search from.
   * @returns The component presentation or null if none is found.
   * @public
   */
  forTag(tagName, element) {
    const key = presentationKeyFromTag(tagName);
    const existing = presentationRegistry.get(key);

    if (existing === false) {
      const container = DI.findResponsibleContainer(element);

      return container.get(key);
    }

    return existing || null;
  }
});

/**
 * The default implementation of ComponentPresentation, used by FoundationElement.
 * @public
 */
export class DefaultComponentPresentation {
  /**
   * Creates an instance of DefaultComponentPresentation.
   * @param template - The template to apply to the element.
   * @param styles - The styles to apply to the element.
   * @public
   */
  constructor(template, styles) {
    this.template = template || null;
    this.styles =
      styles === void 0
        ? null
        : Array.isArray(styles)
        ? ElementStyles.create(styles)
        : styles instanceof ElementStyles
        ? styles
        : ElementStyles.create([styles]);
  }

  /**
   * Applies the presentation details to the specified element.
   * @param element - The element to apply the presentation details to.
   * @public
   */
  applyTo(element) {
    const controller = element.$pppController;

    if (controller.template === null) {
      controller.template = this.template;
    }

    if (controller.styles === null) {
      controller.styles = this.styles;
    }
  }
}
