import * as MainComponent from "./main-component/main"
import * as InputField from "./input-field/main"
import * as CodeEditor from "./code-editor/main"
import * as NumberLine from "./number-line/main"
import * as ErrorLine from "./error-line/main"
import * as RobotComponets from "./robot-components/main"
import * as ComponentInfo from "./component-info/main"
import * as RobotTerminal from "./robot-terminal/main"
import * as RobotMenu from "./robot-menu/main"
import * as SyntaxHighlight from "./syntax-highlight/main"
import * as CoolButton from "./cool-button/main"
import * as CoolMenu from "./cool-menu/main"
import * as GameGraphics from "./game-graphics/main"
import * as GameInput from "./game-input/main"
import * as ComponentEditor from "./component-editor/main"
import * as GraphicContext from "./graphic-context/main"
import * as RobotVisualizer from "./robot-visualizer/main"

customElements.define("input-field", InputField.CustomElement)
customElements.define("cool-menu", CoolMenu.CustomElement)
customElements.define("code-editor", CodeEditor.CustomElement)
customElements.define("number-line", NumberLine.CustomElement)
customElements.define("error-line", ErrorLine.CustomElement)
customElements.define("robot-components", RobotComponets.CustomElement)
customElements.define("component-info", ComponentInfo.CustomElement)
customElements.define("robot-terminal", RobotTerminal.CustomElement)
customElements.define("robot-menu", RobotMenu.CustomElement)
customElements.define("syntax-highlight", SyntaxHighlight.CustomElement)
customElements.define("cool-button", CoolButton.CustomElement)
customElements.define("game-graphics", GameGraphics.CustomElement)
customElements.define("game-input", GameInput.CustomElement)
customElements.define("component-editor", ComponentEditor.CustomElement)
customElements.define("graphic-context", GraphicContext.CustomElement)
customElements.define("robot-visualizer", RobotVisualizer.CustomElement)

// entry point for all
customElements.define("main-component", MainComponent.CustomElement)
