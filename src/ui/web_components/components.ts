import * as InputField from "./input-field/main"
import * as CodeEditor from "./code-editor/main"
import * as NumberLine from "./number-line/main"
import * as ErrorLine from "./error-line/main"
import * as RobotComponets from "./robot-components/main"
import * as ComponentInfo from "./component-info/main"
import * as RobotStatus from "./robot-status/main"

customElements.define("input-field", InputField.CustomElement)
customElements.define("code-editor", CodeEditor.CustomElement)
customElements.define("number-line", NumberLine.CustomElement)
customElements.define("error-line", ErrorLine.CustomElement)
customElements.define("robot-components", RobotComponets.CustomElement)
customElements.define("component-info", ComponentInfo.CustomElement)
customElements.define("robot-status", RobotStatus.CustomElement)
