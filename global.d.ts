/// <reference types="next" />
/// <reference types="next/image-types/global" />

declare module '*.css' {
  const styles: { [className: string]: string };
  export default styles;
}
