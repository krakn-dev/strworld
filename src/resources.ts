import * as ECS from "./ecs"
import * as Cmds from "./commands"
import * as Comps from "./components"
import * as Utils from "./utils"


export class Resources {
    delta: DeltaResource
    isFirstTime: IsFirstTimeResource
    commandState: CommandStateResource
    componentChanges: ComponentChanges
    input: InputResource
    configuration: ConfigurationResource
    constructor(newCurrentExecutingCommand: ECS.CurrentExecutingCommand) {
        this.delta = new DeltaResource(newCurrentExecutingCommand)
        this.isFirstTime = new IsFirstTimeResource(newCurrentExecutingCommand)
        this.commandState = new CommandStateResource(newCurrentExecutingCommand)
        this.componentChanges = new ComponentChanges()
        this.input = new InputResource()
        this.configuration = new ConfigurationResource()
    }
}

class LastTimeCommandWasRun {
    command: Cmds.Commands
    time: number
    constructor(newTime: number, newCommand: Cmds.Commands) {
        this.time = newTime
        this.command = newCommand
    }
}

export class DeltaResource {
    private currentExecutingCommand: ECS.CurrentExecutingCommand

    private lastTimeCommandsWereRun: LastTimeCommandWasRun[]

    constructor(newCurrentExecutingCommand: ECS.CurrentExecutingCommand) {
        this.currentExecutingCommand = newCurrentExecutingCommand
        this.lastTimeCommandsWereRun = []
    }

    get(): number | null {
        for (let d of this.lastTimeCommandsWereRun) {
            if (d.command == this.currentExecutingCommand.command!) {
                let oldTime = d.time
                d.time = performance.now()

                return performance.now() - oldTime
            }
        }

        this.lastTimeCommandsWereRun.push(
            new LastTimeCommandWasRun(
                performance.now(),
                this.currentExecutingCommand.command!)
        )
        return null
    }
}

export class CommandStateResource {
    private currentExecutingCommand: ECS.CurrentExecutingCommand

    private state: Map<[string, Cmds.Commands], [Cmds.Commands, any]>

    constructor(newCurrentExecutingCommand: ECS.CurrentExecutingCommand) {
        this.currentExecutingCommand = newCurrentExecutingCommand
        this.state = new Map()
    }
    removeCommandStates(command: Cmds.Commands) {
        for (let [k, _] of this.state) {
            if (k[1] == command) {
                this.state.delete(k)
            }
        }
    }
    set(key: string, value: any) {
        this.state.set(
            [key, this.currentExecutingCommand.command!],
            value
        )
    }

    get(key: string): any | null {
        console.log(this.state)
        let value = this.state.get([key, this.currentExecutingCommand.command!])
        if (value == undefined) {
            return null
        }
        else {
            return value[1]
        }
    }
}

export class IsFirstTimeResource {
    private currentExecutingCommand: ECS.CurrentExecutingCommand

    private commandsCheckedFirstTime: number[]

    constructor(newCurrentExecutingCommand: ECS.CurrentExecutingCommand) {
        this.currentExecutingCommand = newCurrentExecutingCommand
        this.commandsCheckedFirstTime = []
    }
    get() {
        for (let cFT of this.commandsCheckedFirstTime) {
            if (cFT == this.currentExecutingCommand.command!) {
                return false
            }
        }
        this.commandsCheckedFirstTime.push(
            this.currentExecutingCommand.command!
        )
        return true
    }
}

export class ConfigurationResource {
    isShadowsEnabled: boolean | null
    isSetNight: boolean | null
    isEnablePhysics: boolean | null
    isEnableFreeCamera: boolean | null
    constructor() {
        this.isSetNight = null
        this.isShadowsEnabled = null
        this.isEnablePhysics = null
        this.isEnableFreeCamera = null
    }
}
export class InputResource {
    movementDirection: Utils.Vector2
    constructor() {
        this.movementDirection = new Utils.Vector2(0, 0)
    }
}

export class ComponentChanges {
    changedComponents: ECS.Component[][]
    removedComponents: ECS.Component[][]
    addedComponents: ECS.Component[][]

    changedComponentsBuffer: ECS.Component[][]
    removedComponentsBuffer: ECS.Component[][]
    addedComponentsBuffer: ECS.Component[][]

    private baseStructure: ECS.Component[][]

    constructor() {
        this.baseStructure = []
        for (let i = 0; i < Comps.NUMBER_OF_COMPONENTS; i++) {
            this.baseStructure.push([])
        }

        this.changedComponentsBuffer = structuredClone(this.baseStructure)
        this.removedComponentsBuffer = structuredClone(this.baseStructure)
        this.addedComponentsBuffer = structuredClone(this.baseStructure)

        this.changedComponents = []
        this.removedComponents = []
        this.addedComponents = []
    }
    cycleChanges() {
        this.changedComponents = this.changedComponentsBuffer
        this.removedComponents = this.removedComponentsBuffer
        this.addedComponents = this.addedComponentsBuffer

        this.changedComponentsBuffer = structuredClone(this.baseStructure)
        this.removedComponentsBuffer = structuredClone(this.baseStructure)
        this.addedComponentsBuffer = structuredClone(this.baseStructure)
    }
}
