import { createGlobalStyle } from "styled-components";
import { reset } from "./reset";
import { fillParent } from "@css/helper";

export const GlobalStyle = createGlobalStyle`
    ${reset};
    
    body {
        background-color: #000;
    }
    
    canvas {
        ${fillParent};
        position: fixed;
    }
`;
