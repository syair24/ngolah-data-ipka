declare module 'flowbite-datepicker/Datepicker' {
  interface DatepickerOptions {
    format?: string;
    autohide?: boolean;
    orientation?: string;
    minDate?: string | Date;
    maxDate?: string | Date;
  }

  class Datepicker {
    constructor(element: HTMLElement, options?: DatepickerOptions);

    destroy(): void;
    show(): void;
    hide(): void;
    setDate(date: Date | string): void;
    getDate(): Date | null;
  }

  export default Datepicker;
}
