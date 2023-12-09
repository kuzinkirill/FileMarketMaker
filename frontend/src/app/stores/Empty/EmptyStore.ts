import { type ActivateDeactivate } from '../../utils/store/activate-deactivate/activate-deactivate.ts'

/**
 * Стор нужен, чтобы проект сбилдился.
 * Удалить, когда в проекте появятся сторы
 */
export class EmptyStore implements ActivateDeactivate {
  isActivated = false
  activate(): void {
  }

  deactivate(): void {
  }
}
