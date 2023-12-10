/**
 * Интерфейс, который должны реализовывать все сторы, жизненный цикл которых включает
 * инициализацию (активацию) и деактивацию
 */

export interface ActivateDeactivate<Args extends any[] = any[]> {
  activate: (...args: Args) => void // вызывается перед использованием стора
  deactivate: () => void // вызывается после окончания использования стора

  isActivated: boolean
}
