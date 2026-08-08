declare module "react-flagkit" {
  import { ComponentType } from "react";

  interface FlagProps {
    country: string;
    size?: number;
    className?: string;
  }

  const Flag: ComponentType<FlagProps>;
  export default Flag;
}
