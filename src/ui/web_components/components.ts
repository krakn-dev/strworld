import * as MainComponent from "./main"
import * as InputField from "./code-editor/input-field/main"
import * as CodeEditor from "./code-editor/main"
import * as NumberLine from "./code-editor/number-line/main"
import * as ErrorLine from "./code-editor/error-line/main"
import * as RobotComponentsGrid from "./code-editor/robot-components-grid/main"
import * as ComponentInfo from "./code-editor/component-info/main"
import * as Terminal from "./code-editor/terminal/main"
import * as RobotMenu from "./robot-menu/main"
import * as SyntaxHighlight from "./code-editor/syntax-highlight/main"
import * as CoolButton from "./shared/cool-button/main"
import * as CoolMenu from "./shared/cool-menu/main"
import * as GameGraphics from "./game/game-graphics/main"
import * as GameInput from "./game/game-input/main"
import * as ComponentEditor from "./component-editor/main"
import * as GraphicContext from "./shared/graphic-context/main"
import * as RobotVisualizer from "./component-editor/robot-visualizer/main"
import * as ComponentSelector from "./component-editor/component-selector/main"
import * as ComponentSelectorItem from "./component-editor/component-selector-item/main"
import * as Toolbar from "./component-editor/toolbar/main"
import * as HelpMenu from "./component-editor/help-menu/main"
import * as QuitMenu from "./component-editor/quit-menu/main"
import * as ToolbarItem from "./component-editor/toolbar-item/main"
import * as ConfirmPlacementMenu from "./component-editor/confirm-placement-menu/main"

customElements.define("input-field", InputField.CustomElement)
customElements.define("cool-menu", CoolMenu.CustomElement)
customElements.define("code-editor", CodeEditor.CustomElement)
customElements.define("number-line", NumberLine.CustomElement)
customElements.define("error-line", ErrorLine.CustomElement)
customElements.define("robot-components-grid", RobotComponentsGrid.CustomElement)
customElements.define("component-info", ComponentInfo.CustomElement)
customElements.define("terminal-", Terminal.CustomElement)
customElements.define("robot-menu", RobotMenu.CustomElement)
customElements.define("syntax-highlight", SyntaxHighlight.CustomElement)
customElements.define("cool-button", CoolButton.CustomElement)
customElements.define("game-graphics", GameGraphics.CustomElement)
customElements.define("game-input", GameInput.CustomElement)
customElements.define("component-editor", ComponentEditor.CustomElement)
customElements.define("graphic-context", GraphicContext.CustomElement)
customElements.define("robot-visualizer", RobotVisualizer.CustomElement)
customElements.define("component-selector", ComponentSelector.CustomElement)
customElements.define("component-selector-item", ComponentSelectorItem.CustomElement)
customElements.define("toolbar-", Toolbar.CustomElement)
customElements.define("toolbar-item", ToolbarItem.CustomElement)
customElements.define("help-menu", HelpMenu.CustomElement)
customElements.define("quit-menu", QuitMenu.CustomElement)
customElements.define("confirm-placement-menu", ConfirmPlacementMenu.CustomElement)

// entry point
customElements.define("main-component", MainComponent.CustomElement)
