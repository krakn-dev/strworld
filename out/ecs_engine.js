import * as Utils from "./utils.js";
export var EntityStates;
(function (EntityStates) {
    EntityStates[EntityStates["Idle"] = 0] = "Idle";
    EntityStates[EntityStates["Dead"] = 1] = "Dead";
    EntityStates[EntityStates["WindLeft"] = 2] = "WindLeft";
    EntityStates[EntityStates["WindRight"] = 3] = "WindRight";
    EntityStates[EntityStates["Shooting"] = 4] = "Shooting";
    EntityStates[EntityStates["Running"] = 5] = "Running";
})(EntityStates || (EntityStates = {}));
export var Components;
(function (Components) {
    Components[Components["Health"] = 0] = "Health";
    Components[Components["Name"] = 1] = "Name";
    Components[Components["Position"] = 2] = "Position";
    Components[Components["SpriteDirection"] = 3] = "SpriteDirection";
    Components[Components["EntityState"] = 4] = "EntityState";
})(Components || (Components = {}));
export var Entities;
(function (Entities) {
    Entities[Entities["Human"] = 0] = "Human";
    Entities[Entities["Fox"] = 1] = "Fox";
    Entities[Entities["Grass"] = 2] = "Grass";
})(Entities || (Entities = {}));
export var Get;
(function (Get) {
    Get[Get["One"] = 0] = "One";
    Get[Get["OneOfEach"] = 1] = "OneOfEach";
    Get[Get["All"] = 2] = "All";
    Get[Get["AllOfEach"] = 3] = "AllOfEach";
    Get[Get["None"] = 4] = "None";
})(Get || (Get = {}));
export var By;
(function (By) {
    By[By["EntityType"] = 0] = "EntityType";
    By[By["EntityUid"] = 1] = "EntityUid";
    By[By["ComponentUid"] = 2] = "ComponentUid";
    By[By["Everything"] = 3] = "Everything";
    By[By["Random"] = 4] = "Random";
})(By || (By = {}));
export var Commands;
(function (Commands) {
    Commands[Commands["RunBeforeFoxHealth"] = 0] = "RunBeforeFoxHealth";
    Commands[Commands["GetFoxHealth"] = 1] = "GetFoxHealth";
    Commands[Commands["PrintEveryField"] = 2] = "PrintEveryField";
    Commands[Commands["SyncGraphicEntity"] = 3] = "SyncGraphicEntity";
    Commands[Commands["SpawnGrass"] = 4] = "SpawnGrass";
    Commands[Commands["MovePlayer"] = 5] = "MovePlayer";
})(Commands || (Commands = {}));
export class RunBeforeFoxHealth {
    constructor() {
        this.commandtype = Commands.RunBeforeFoxHealth;
        this.component = null;
        this.get = Get.None;
        this.byArgs = null;
        this.by = null;
    }
    run(args) {
        console.log("before 'health'");
    }
}
export class GetFoxHealth {
    constructor() {
        this.found = false;
        this.dead = false;
        this.timesTried = 0;
        this.commandtype = Commands.GetFoxHealth;
        this.get = Get.One;
        this.component = [Components.Health];
        this.by = By.EntityType;
        this.byArgs = Entities.Fox;
    }
    run(args) {
        if (args.length == 0) {
            this.timesTried++;
            console.log("wtf");
            return;
        }
        console.log(args[0].health, " health");
    }
}
export class PrintEveryField {
    constructor() {
        this.commandtype = Commands.PrintEveryField;
        this.get = Get.All;
        this.component = null;
        this.by = By.Everything;
        this.byArgs = null;
    }
    run(args) {
        for (var c of args) {
            if (c.componentType == Components.Health) {
                console.log(c.health, " h");
            }
            if (c.componentType == Components.Name) {
                console.log(c.name, " n");
            }
        }
    }
}
export class Grass {
    constructor() {
        this.entityType = Entities.Grass;
        this.entityUid = Utils.newUid();
    }
}
export class Fox {
    constructor() {
        this.entityType = Entities.Fox;
        this.entityUid = Utils.newUid();
    }
}
export class Human {
    constructor() {
        this.entityType = Entities.Human;
        this.entityUid = Utils.newUid();
    }
}
export class SpriteDirection {
    constructor(newOwnerUid) {
        this.isLookingRight = true;
        this.ownerUid = newOwnerUid;
        this.componentUid = Utils.newUid();
        this.componentType = Components.SpriteDirection;
    }
}
export class EntityState {
    constructor(newCurrentState, newOwnerUid) {
        this.currentState = newCurrentState;
        this.ownerUid = newOwnerUid;
        this.componentUid = Utils.newUid();
        this.componentType = Components.EntityState;
    }
}
export class Position {
    constructor(newPosition, newOwnerUid) {
        this.position = newPosition;
        this.ownerUid = newOwnerUid;
        this.componentUid = Utils.newUid();
        this.componentType = Components.Position;
    }
}
export class Health {
    constructor(newHealth, newOwnerUid) {
        this.health = newHealth;
        this.ownerUid = newOwnerUid;
        this.componentUid = Utils.newUid();
        this.componentType = Components.Health;
    }
}
export class Name {
    constructor(newName, newOwnerUid) {
        this.name = newName;
        this.ownerUid = newOwnerUid;
        this.componentUid = Utils.newUid();
        this.componentType = Components.Name;
    }
}
export var Frequency;
(function (Frequency) {
    Frequency[Frequency["EveryStep"] = 0] = "EveryStep";
    Frequency[Frequency["Startup"] = 1] = "Startup";
})(Frequency || (Frequency = {}));
export var Order;
(function (Order) {
    Order[Order["BeforeCommand"] = 0] = "BeforeCommand";
    Order[Order["AfterCommand"] = 1] = "AfterCommand";
    Order[Order["AtPosition"] = 2] = "AtPosition";
    Order[Order["Last"] = 3] = "Last";
    Order[Order["First"] = 4] = "First";
})(Order || (Order = {}));
class CommandWithFrequency {
    constructor(newCommmand, newFrecuency) {
        this.command = newCommmand;
        this.frecuency = newFrecuency;
    }
}
export class EcsEngine {
    static BindCommand(oldCommand, frecuency, order, orderArg) {
        let newCommand = new CommandWithFrequency(oldCommand, frecuency);
        switch (order) {
            case Order.AfterCommand:
                var afterThis = orderArg;
                for (var [i, c] of this.commands.entries()) {
                    if (c.command.commandtype == afterThis) {
                        this.commands.splice(i + 1, 0, newCommand);
                    }
                }
                break;
            case Order.AtPosition:
                this.commands.splice(orderArg, 0, newCommand);
                break;
            case Order.BeforeCommand:
                var beforeThis = orderArg;
                var called = false;
                for (var [i, c] of this.commands.entries()) {
                    if (c.command.commandtype == beforeThis) {
                        called = true;
                        if (i == 0) {
                            console.log(0, newCommand);
                            this.commands.unshift(newCommand);
                            break;
                        }
                        console.log(i - 1, newCommand);
                        this.commands.splice(i - 1, 0, newCommand);
                        break;
                    }
                }
                if (!called)
                    console.log("could not find commandType");
                break;
            case Order.First:
                this.commands.unshift(newCommand);
                break;
            case Order.Last:
                this.commands.push(newCommand);
                break;
        }
    }
    static UnbindCommand(commandType) {
        for (var [i, c] of this.commands.entries()) {
            if (c.command.commandtype == commandType) {
                this.commands.splice(i, 1);
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
                    c.command.run([]);
                }
                if (get == Get.OneOfEach) {
                    let toFind = component.length;
                    let foundComponents = [];
                    switch (by) {
                        case By.EntityType:
                            for (var comp of EcsEngine.components) {
                                for (var qcomp of component) {
                                    if (comp.componentType == qcomp) {
                                        for (var e of EcsEngine.entities) {
                                            if (byArg == e.entityType) {
                                                foundComponents.push(comp);
                                                toFind--;
                                                if (toFind == 0)
                                                    c.command.run(foundComponents);
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
                                    if (byArg == e.entityUid) {
                                        for (var qcomp of component) {
                                            if (comp.componentType == qcomp) {
                                                foundComponents.push(comp);
                                                toFind--;
                                                if (toFind == 0) {
                                                    c.command.run(foundComponents);
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
                            console.log("bad use of OneOfEach");
                            break;
                        case By.Everything:
                            console.log("bad use of OneOfEach");
                            break;
                        case By.Random:
                            console.log("bad use of OneOfEach");
                            break;
                    }
                }
                if (get == Get.One) {
                    switch (by) {
                        case By.ComponentUid:
                            for (var comp of EcsEngine.components) {
                                if (comp.componentUid == byArg) {
                                    c.command.run([comp]);
                                    break;
                                }
                            }
                            break;
                        case By.EntityType:
                            if (component == null) {
                                console.log("component not supplied");
                                break;
                            }
                            let found = false;
                            for (var comp of EcsEngine.components) {
                                if (comp.componentType == component[0]) {
                                    for (var e of EcsEngine.entities) {
                                        if (byArg == e.entityType) {
                                            found = true;
                                            c.command.run([comp]);
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
                                if (comp.ownerUid == byArg) {
                                    c.command.run([comp]);
                                    break;
                                }
                            }
                            break;
                        case By.Everything:
                            console.log("wrong use of everything");
                            break;
                        case By.Random:
                            if (EcsEngine.commands.length != 0)
                                c.command.run([EcsEngine.components[0]]);
                            else
                                console.log("there are not components!");
                            break;
                    }
                }
                if (get == Get.AllOfEach) {
                    switch (by) {
                        case By.ComponentUid:
                            console.log("bad use of componentUid");
                            break;
                        case By.EntityType:
                            console.log("Entities only have one component of each type");
                            break;
                        case By.EntityUid:
                            console.log("bad use of entityuid");
                            break;
                        case By.Everything:
                            let collected = [];
                            if (component == null) {
                                console.log("components not supplied");
                                break;
                            }
                            for (var comp of EcsEngine.components) {
                                for (var qcomp of component) {
                                    if (comp.componentType == qcomp) {
                                        collected.push(comp);
                                    }
                                }
                            }
                            c.command.run(collected);
                            break;
                        case By.Random:
                            console.log("bad use of random");
                            break;
                    }
                }
                if (get == Get.All) {
                    let collected = [];
                    switch (by) {
                        case By.ComponentUid:
                            console.log("bad use of componentUid");
                            break;
                        case By.EntityType:
                            if (component == null) {
                                console.log("component not supplied");
                                break;
                            }
                            for (var comp of EcsEngine.components) {
                                if (comp.componentType == component[0]) {
                                    for (var e of EcsEngine.entities) {
                                        if (byArg == e.entityType) {
                                            collected.push(comp);
                                        }
                                    }
                                }
                            }
                            break;
                        case By.EntityUid:
                            console.log("bad use of entityuid");
                            break;
                        case By.Everything:
                            collected = EcsEngine.components;
                            break;
                        case By.Random:
                            console.log("bad use of random");
                            break;
                    }
                    c.command.run(collected);
                }
                if (c.frecuency == Frequency.Startup) {
                    return false;
                }
                return true;
            });
    }
}
EcsEngine.components = [];
EcsEngine.entities = [];
EcsEngine.commands = [];
