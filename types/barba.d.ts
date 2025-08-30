declare module '@barba/core' {
  interface ITransitionData {
    current: {
      container: HTMLElement;
      namespace: string;
      url: {
        href: string;
        pathname: string;
      };
    };
    next: {
      container: HTMLElement;
      namespace: string;
      url: {
        href: string;
        pathname: string;
      };
    };
    trigger: string;
  }

  interface ITransition {
    name?: string;
    from?: {
      namespace?: string[];
    };
    to?: {
      namespace?: string[];
    };
    leave?(data: ITransitionData): Promise<void> | void | any;
    enter?(data: ITransitionData): Promise<void> | void | any;
    beforeLeave?(data: ITransitionData): Promise<void> | void;
    afterLeave?(data: ITransitionData): Promise<void> | void;
    beforeEnter?(data: ITransitionData): Promise<void> | void;
    afterEnter?(data: ITransitionData): Promise<void> | void;
  }

  interface IView {
    namespace: string;
    beforeEnter?(): void;
    afterEnter?(): void;
    beforeLeave?(): void;
    afterLeave?(): void;
  }

  interface IBarbaOptions {
    debug?: boolean;
    transitions?: ITransition[];
    views?: IView[];
  }

  interface IBarba {
    init(options: IBarbaOptions): void;
    go(url: string): Promise<void>;
    destroy(): void;
    isRunning: boolean;
  }

  const barba: IBarba;
  export default barba;
}

declare module 'gsap' {
  interface GSAPTimeline {
    to(target: any, duration: number | object, delay?: number): GSAPTimeline;
    set(target: any, vars: object): GSAPTimeline;
  }

  interface GSAP {
    to(target: any, vars: object): any;
    set(target: any, vars: object): void;
    timeline(): GSAPTimeline;
  }

  const gsap: GSAP;
  export { gsap };
}
