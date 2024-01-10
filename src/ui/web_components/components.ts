import * as MainComponent from "./main-component/main"
import * as InputField from "./input-field/main"
import * as CodeEditor from "./code-editor/main"
import * as NumberLine from "./number-line/main"
import * as ErrorLine from "./error-line/main"
import * as RobotComponets from "./robot-components/main"
import * as ComponentInfo from "./component-info/main"
import * as RobotTerminal from "./robot-terminal/main"
import * as SyntaxHighlight from "./syntax-highlight/main"
import * as XButton from "./x-button/main"
import * as GameGraphics from "./game-graphics/main"
import * as GameInput from "./game-input/main"

customElements.define("input-field", InputField.CustomElement)
customElements.define("code-editor", CodeEditor.CustomElement)
customElements.define("number-line", NumberLine.CustomElement)
customElements.define("error-line", ErrorLine.CustomElement)
customElements.define("robot-components", RobotComponets.CustomElement)
customElements.define("component-info", ComponentInfo.CustomElement)
customElements.define("robot-terminal", RobotTerminal.CustomElement)
customElements.define("syntax-highlight", SyntaxHighlight.CustomElement)
customElements.define("x-button", XButton.CustomElement)
customElements.define("game-graphics", GameGraphics.CustomElement)
customElements.define("game-input", GameInput.CustomElement)

// entry point for all
customElements.define("main-component", MainComponent.CustomElement)
