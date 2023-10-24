import * as Utils from "./utils.js"

export enum EntityStates {
    Idle,
    Dead,
    WindLeft,
    WindRight,
    Shooting,
    Running,
}
export interface Component {
    componentType: Components
    ownerUid: number
    componentUid: number
}

export enum Components {
    Health,
    Name,
    Position,
    SpriteDirection,
    EntityState,
}

interface Entity {
    entityType: Entities
    entityUid: number
}

export enum Entities {
    Human,
    Fox,
    Grass,
}

export enum Get {
    One,
    OneOfEach,
    All,
    AllOfEach,
    None,
}

export enum By {
    EntityType,
    EntityUid,
    ComponentUid,
    Everything,
    Random
}

export enum Commands {
    RunBeforeFoxHealth,
    GetFoxHealth,
    PrintEveryField,
    SyncGraphicEntity,
    SpawnGrass,
    MovePlayer
}

export interface Command {
    get: Get
    component: Components[] | null
    by: By | null
    byArgs: number | Entities | null
    commandtype: Commands

    run(arg: Component[]): void
}


export class RunBeforeFoxHealth implements Command {
    get: Get
    component: Components[] | null
    by: By | null
    byArgs: number | Entities | null
    commandtype: Commands

    constructor() {
        this.commandtype = Commands.RunBeforeFoxHealth
        this.component = null
        this.get = Get.None
        this.byArgs = null
        this.by = null

    }

    run(args: Component[]): void {
        console.log("before 'health'")
    }
}

export class GetFoxHealth implements Command {
    get: Get
    component: Components[] | null
    by: By | null
    byArgs: number | Entities | null
    commandtype: Commands

    constructor() {
        this.commandtype = Commands.GetFoxHealth
        this.get = Get.One
        this.component = [Components.Health]
        this.by = By.EntityType
        this.byArgs = Entities.Fox
    }

    found = false
    dead = false
    timesTried = 0

    run(args: Component[]): void {
        if (args.length == 0) {
            this.timesTried++
            console.log("wtf")
            return;
        }

        console.log((args[0] as Health).health, " health")
    }

}
export class PrintEveryField implements Command {
    get: Get
    component: Components[] | null
    by: By | null
    byArgs: number | Entities | null
    commandtype: Commands

    constructor() {
        this.commandtype = Commands.PrintEveryField
        this.get = Get.All
        this.component = null
        this.by = By.Everything
        this.byArgs = null
    }

    run(args: Component[]): void {
        for (var c of args) {
            if (c.componentType == Components.Health) {
                console.log((c as Health).health, " h")
            }
            if (c.componentType == Components.Name) {
                console.log((c as Name).name, " n")
            }
        }
    }

}

export class Grass implements Entity {
    entityType: Entities
    entityUid: number
    constructor() {
        this.entityType = Entities.Grass
        this.entityUid = Utils.newUid()
    }
}

export class Fox implements Entity {
    entityType: Entities
    entityUid: number
    constructor() {
        this.entityType = Entities.Fox
        this.entityUid = Utils.newUid()
    }
}

export class Human implements Entity {
    entityType: Entities
    entityUid: number
    constructor() {
        this.entityType = Entities.Human
        this.entityUid = Utils.newUid()
    }
}


export class SpriteDirection implements Component {
    isLookingRight: boolean
    componentType: Components
    ownerUid: number
    componentUid: number

    constructor(newOwnerUid: number) {
        this.isLookingRight = true
        this.ownerUid = newOwnerUid
        this.componentUid = Utils.newUid()
        this.componentType = Components.SpriteDirection
    }
}

export class EntityState implements Component {
    currentState: EntityStates
    componentType: Components
    ownerUid: number
    componentUid: number

    constructor(newCurrentState: EntityStates, newOwnerUid: number) {
        this.currentState = newCurrentState
        this.ownerUid = newOwnerUid
        this.componentUid = Utils.newUid()
        this.componentType = Components.EntityState
    }
}

export class Position implements Component {
    position: Utils.Vector2
    componentType: Components
    ownerUid: number
    componentUid: number

    constructor(newPosition: Utils.Vector2, newOwnerUid: number) {
        this.position = newPosition
        this.ownerUid = newOwnerUid
        this.componentUid = Utils.newUid()
        this.componentType = Components.Position
    }
}

export class Health implements Component {
    health: number
    componentType: Components
    ownerUid: number
    componentUid: number

    constructor(newHealth: number, newOwnerUid: number) {
        this.health = newHealth
        this.ownerUid = newOwnerUid
        this.componentUid = Utils.newUid()
        this.componentType = Components.Health
    }
}

export class Name implements Component {
    name: string
    componentType: Components
    ownerUid: number
    componentUid: number

    constructor(newName: string, newOwnerUid: number) {
        this.name = newName
        this.ownerUid = newOwnerUid
        this.componentUid = Utils.newUid()
        this.componentType = Components.Name
    }
}

export enum Frequency {
    EveryStep,
    Startup,
}

export enum Order {
    BeforeCommand,
    AfterCommand,
    AtPosition,
    Last,
    First,
}

class CommandWithFrequency {
    command: Command
    frecuency: Frequency
    constructor(newCommmand: Command, newFrecuency: Frequency) {
        this.command = newCommmand
        this.frecuency = newFrecuency
    }
}

export class EcsEngine {
    static components: Component[] = []
    static entities: Entity[] = []
    static commands: CommandWithFrequency[] = []

    static BindCommand(oldCommand: Command, frecuency: Frequency, order: Order, orderArg: number | Commands | null) {
        let newCommand = new CommandWithFrequency(oldCommand, frecuency)
        switch (order) {
            case Order.AfterCommand:
                var afterThis = (orderArg as Commands)
                for (var [i, c] of this.commands.entries()) {
                    if (c.command.commandtype == afterThis) {
                        this.commands.splice(i + 1, 0, newCommand)
                    }
                }
                break;

            case Order.AtPosition:
                this.commands.splice(orderArg as number, 0, newCommand)
                break;

            case Order.BeforeCommand:
                var beforeThis = (orderArg as Commands)
                var called = false
                for (var [i, c] of this.commands.entries()) {
                    if (c.command.commandtype == beforeThis) {
                        called = true
                        if (i == 0) {
                            console.log(0, newCommand)
                            this.commands.unshift(newCommand)
                            break;
                        }
                        console.log(i - 1, newCommand)
                        this.commands.splice(i - 1, 0, newCommand)
                        break;
                    }
                }
                if (!called) console.log("could not find commandType")
                break;

            case Order.First:
                this.commands.unshift(newCommand)
                break;

            case Order.Last:
                this.commands.push(newCommand)
                break;
        }
    }
    static UnbindCommand(commandType: Commands) {
        for (var [i, c] of this.commands.entries()) {
            if (c.command.commandtype == commandType) {
                this.commands.splice(i, 1)
            }
        }
    }

    step() {
        EcsEngine.commands =
            EcsEngine.commands.filter((c, i) => {
                let get = c.command.get;
                let by = c.command.by;
                let component = c.command.component;
                let byArg = c.command.byArgs;

                if (get == Get.None) {
                    c.command.run([])
                }
                if (get == Get.OneOfEach) {
                    let toFind = component!.length
                    let foundComponents: Component[] = []

                    switch (by) {
                        case By.EntityType:
                            for (var comp of EcsEngine.components) {
                                for (var qcomp of component!) {
                                    if (comp.componentType == qcomp) {
                                        for (var e of EcsEngine.entities) {
                                            if ((byArg as Entities) == e.entityType) {
                                                foundComponents.push(comp)
                                                toFind--
                                                if (toFind == 0)
                                                    c.command.run(foundComponents)
                                                break;
                                            }
                                        }
                                    }
                                    if (toFind == 0)
                                        break;
                                }
                                if (toFind == 0)
                                    break;
                            }
                            break;
                        case By.EntityUid:
                            for (var comp of EcsEngine.components) {
                                for (var e of EcsEngine.entities) {
                                    if ((byArg as number) == e.entityUid) {
                                        for (var qcomp of component!) {
                                            if (comp.componentType == qcomp) {
                                                foundComponents.push(comp)
                                                toFind--
                                                if (toFind == 0) {
                                                    c.command.run(foundComponents)
                                                    break;
                                                }
                                            }
                                        }
                                        if (toFind == 0)
                                            break;
                                    }
                                }
                                if (toFind == 0)
                                    break;
                            }
                            break;
                        case By.ComponentUid:
                            console.log("bad use of OneOfEach")
                            break;
                        case By.Everything:
                            console.log("bad use of OneOfEach")
                            break;

                        case By.Random:
                            console.log("bad use of OneOfEach")
                            break;
                    }
                }

                if (get == Get.One) {
                    switch (by) {
                        case By.ComponentUid:
                            for (var comp of EcsEngine.components) {
                                if (comp.componentUid == (byArg as number)) {
                                    c.command.run([comp])
                                    break;
                                }
                            }
                            break;
                        case By.EntityType:
                            if (component == null) {
                                console.log("component not supplied")
                                break;
                            }
                            let found = false
                            for (var comp of EcsEngine.components) {
                                if (comp.componentType == component![0]) {
                                    for (var e of EcsEngine.entities) {
                                        if ((byArg as Entities) == e.entityType) {
                                            found = true
                                            c.command.run([comp])
                                            break;
                                        }
                                    }
                                }
                                if (found)
                                    break;
                            }
                            break;
                        case By.EntityUid:
                            for (var comp of EcsEngine.components) {
                                if (comp.ownerUid == (byArg as number)) {
                                    c.command.run([comp])
                                    break;
                                }
                            }
                            break;
                        case By.Everything:
                            console.log("wrong use of everything")
                            break;

                        case By.Random:
                            if (EcsEngine.commands.length != 0)
                                c.command.run([EcsEngine.components[0]])
                            else
                                console.log("there are not components!")
                            break;
                    }
                }
                if (get == Get.AllOfEach) {
                    switch (by) {
                        case By.ComponentUid:
                            console.log("bad use of componentUid")
                            break;

                        case By.EntityType:
                            console.log("Entities only have one component of each type")
                            break;

                        case By.EntityUid:
                            console.log("bad use of entityuid")
                            break;

                        case By.Everything:
                            let collected: Component[] = []
                            if (component == null) {
                                console.log("components not supplied")
                                break;
                            }
                            for (var comp of EcsEngine.components) {
                                for (var qcomp of component!) {
                                    if (comp.componentType == qcomp) {
                                        collected.push(comp)

                                    }
                                }
                            }
                            c.command.run(collected)
                            break;

                        case By.Random:
                            console.log("bad use of random")
                            break;
                    }

                }
                if (get == Get.All) {
                    let collected: Component[] = []
                    switch (by) {
                        case By.ComponentUid:
                            console.log("bad use of componentUid")
                            break;

                        case By.EntityType:
                            if (component == null) {
                                console.log("component not supplied")
                                break;
                            }
                            for (var comp of EcsEngine.components) {
                                if (comp.componentType == component![0]) {
                                    for (var e of EcsEngine.entities) {
                                        if ((byArg as Entities) == e.entityType) {
                                            collected.push(comp)
                                        }
                                    }

                                }
                            }
                            break;

                        case By.EntityUid:
                            console.log("bad use of entityuid")
                            break;

                        case By.Everything:
                            collected = EcsEngine.components
                            break;

                        case By.Random:
                            console.log("bad use of random")
                            break;
                    }

                    c.command.run(collected)
                }

                if (c.frecuency == Frequency.Startup) {
                    return false
                }
                return true
            }
            )
    }
}
