import * as InputField from "./input-field/main"
import * as CodeEditor from "./code-editor/main"
import * as NumberLine from "./number-line/main"
import * as ErrorLine from "./error-line/main"

customElements.define("input-field", InputField.CustomElement)
customElements.define("code-editor", CodeEditor.CustomElement)
customElements.define("number-line", NumberLine.CustomElement)
customElements.define("error-line", ErrorLine.CustomElement)
