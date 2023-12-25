import * as Utils from "./utils"

export class KeyboardInput {
    up = false
    down = false
    left = false
    right = false

    movementDirection: Utils.Vector2

    constructor() {
        let outer = this
        document.addEventListener(
            "keyup",
            (event: any) => {
                outer.onKeyUp(event)
            },
        );
        document.addEventListener(
            "keydown",
            (event: any) => {
                outer.onKeyDown(event)
            }
        );
        this.movementDirection = new Utils.Vector2(0, 0)
    }
    onKeyDown(event: any) {
        if (event.key == "w" || event.key == "ArrowUp")
            this.up = true

        if (event.key == "s" || event.key == "ArrowDown")
            this.down = true

        if (event.key == "a" || event.key == "ArrowLeft")
            this.left = true

        if (event.key == "d" || event.key == "ArrowRight")
            this.right = true

        this.setPlayerInput()
    }
    onKeyUp(event: any) {

        if (event.key == "w" || event.key == "ArrowUp")
            this.up = false

        if (event.key == "s" || event.key == "ArrowDown")
            this.down = false

        if (event.key == "a" || event.key == "ArrowLeft")
            this.left = false

        if (event.key == "d" || event.key == "ArrowRight")
            this.right = false

        this.setPlayerInput()
    }

    setPlayerInput() {
        this.movementDirection.x = 0
        this.movementDirection.y = 0

        if (this.down)
            this.movementDirection.y--

        if (this.up)
            this.movementDirection.y++

        if (this.left)
            this.movementDirection.x--

        if (this.right)
            this.movementDirection.x++
    }
}

