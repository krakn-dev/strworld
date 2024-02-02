(()=>{"use strict";var e,n,t={632:(e,n,t)=>{var o=t(687);const i=()=>{return e=1e8,Math.floor(Math.random()*e)+1;var e};new Map;class s{constructor(e,n){this.x=e,this.y=n}}class d{constructor(e,n,t){this.x=e,this.y=n,this.z=t}}function a(e){return new o.AO(e.x,e.y,e.z)}function r(e){return e*(3.1416/180)}var c;!function(e){e[e.Health=0]="Health",e[e.Camera=1]="Camera",e[e.Light=2]="Light",e[e.Velocity=3]="Velocity",e[e.Rotation=4]="Rotation",e[e.EntityState=5]="EntityState",e[e.Name=6]="Name",e[e.EntityType=7]="EntityType",e[e.Position=8]="Position",e[e.TargetLocation=9]="TargetLocation",e[e.Timer=10]="Timer",e[e.Shape=11]="Shape",e[e.Mass=12]="Mass",e[e.ShapeColor=13]="ShapeColor",e[e.Force=14]="Force",e[e.HardCodedId=15]="HardCodedId",e[e.Code=16]="Code",e[e.RigidBody=17]="RigidBody",e[e.Constraint=18]="Constraint",e[e.Vehicle=19]="Vehicle",e[e.Wheel=20]="Wheel",e[e.RobotComponent=21]="RobotComponent"}(c||(c={}));const m=(()=>{let e=0;for(let n=0;n<Object.keys(c).length/2;n++)e++;return e})();var p,l,h,y,u,C,f,w,g,b,v,T,U;!function(e){e[e.Animation=0]="Animation"}(p||(p={})),function(e){e[e.Stickman=0]="Stickman",e[e.Grass=1]="Grass",e[e.Dog=2]="Dog",e[e.Camera=3]="Camera",e[e.Light=4]="Light",e[e.GeometricShape=5]="GeometricShape",e[e.Robot=6]="Robot",e[e.RobotComponent=7]="RobotComponent"}(l||(l={})),function(e){e[e.Idle=0]="Idle",e[e.Run=1]="Run",e[e.Follow=2]="Follow",e[e.Attack=3]="Attack",e[e.Chase=4]="Chase"}(h||(h={})),function(e){e[e.AmbientLight=0]="AmbientLight",e[e.PointLight=1]="PointLight",e[e.DirectionalLight=2]="DirectionalLight",e[e.SpotLight=3]="SpotLight"}(y||(y={})),function(e){e[e.Box=0]="Box",e[e.Cylinder=1]="Cylinder"}(u||(u={})),function(e){e[e.PointToPoint=0]="PointToPoint",e[e.Lock=1]="Lock",e[e.Distance=2]="Distance",e[e.Hinge=3]="Hinge"}(C||(C={})),function(e){e[e.Dynamic=0]="Dynamic",e[e.Static=1]="Static",e[e.Kinematic=2]="Kinematic"}(f||(f={})),function(e){e[e.Default=0]="Default",e[e.Wheel=1]="Wheel"}(w||(w={})),function(e){e[e.Wheel=0]="Wheel",e[e.Processor=1]="Processor",e[e.SteelPlate=2]="SteelPlate",e[e.WoodenStick=3]="WoodenStick"}(g||(g={}));class x{constructor(e,n){this.componentUid=i(),this.entityUid=n,this.componentType=c.Vehicle,this.controller=new o._C({chassisBody:e})}}class S{constructor(e,n,t){this.componentUid=i(),this.entityUid=t,this.componentType=c.Wheel,this.velocity=0,this.isOn=!1,this.isLeft=e,this.entityUidAttachedTo=n}}class B{constructor(e,n,t){this.componentUid=i(),this.entityUid=t,this.componentType=c.Constraint,this.constraintType=n,this.entityUidConstrainedTo=e,this.constraint=void 0,this.distance=void 0,this.pivotA=void 0,this.pivotB=void 0,this.axisA=void 0,this.axisB=void 0}}class A{constructor(e,n){this.componentUid=i(),this.entityUid=n,this.componentType=c.RigidBody,this.body=new o.uT,this.disableCollisions=!1,this.bodyType=e,this.materialType=w.Default}}class R{constructor(e,n){this.componentUid=i(),this.entityUid=n,this.componentType=c.HardCodedId,this.id=e}}class E{constructor(e,n){this.componentUid=i(),this.entityUid=n,this.componentType=c.ShapeColor,this.color=e}}class z{constructor(e,n){this.componentUid=i(),this.entityUid=n,this.componentType=c.Shape,this.shapeType=e}}class O{constructor(e,n,t,o,s,d){this.componentUid=i(),this.entityUid=d,this.componentType=c.Light,this.lightType=e,this.intensity=n,this.color=t,this.distance=o,this.decay=s}}class k{constructor(e,n,t,o,s){this.componentUid=i(),this.entityUid=s,this.componentType=c.Camera,this.fov=e,this.near=n,this.far=t,this.aspect=o}}class P{constructor(e,n){this.componentUid=i(),this.entityUid=n,this.componentType=c.EntityType,this.entityType=e}}class D{constructor(e,n){this.componentUid=i(),this.entityUid=n,this.componentType=c.EntityState,this.states=e}}class G{constructor(e,n){this.componentUid=i(),this.entityUid=n,this.componentType=c.Position,this.x=e.x,this.y=e.y,this.z=e.z}}class M{constructor(e,n){this.componentUid=i(),this.entityUid=n,this.componentType=c.Health,this.health=e}}class F{constructor(e,n){this.x=e.x,this.y=e.y,this.z=e.z,this.componentUid=i(),this.entityUid=n,this.componentType=c.Velocity}}class L{constructor(e,n){this.x=e.x,this.y=e.y,this.z=e.z,this.xToApply=0,this.yToApply=0,this.zToApply=0,this.componentUid=i(),this.entityUid=n,this.componentType=c.Force}}class W{constructor(e,n){this.mass=e,this.componentUid=i(),this.entityUid=n,this.componentType=c.Mass}}class H{constructor(e,n){let t=(new o._f).setFromEuler(r(e.x),r(e.y),r(e.z));this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w,this.componentUid=i(),this.entityUid=n,this.componentType=c.Rotation}}class q{constructor(){this.changedComponents=[],this.addedEntitiesUid=[],this.removedEntitiesUid=[]}}class I{constructor(e,n){this.robotComponentTypes=e,this.quantity=n}}!function(e){e[e.Start=0]="Start",e[e.Input=1]="Input",e[e.Options=2]="Options",e[e.GraphicChanges=3]="GraphicChanges",e[e.GetAvailableRobotComponents=4]="GetAvailableRobotComponents",e[e.AvailableRobotComponents=5]="AvailableRobotComponents",e[e.RefreshGraphics=6]="RefreshGraphics",e[e.Stop=7]="Stop",e[e.Continue=8]="Continue",e[e.UpdateAvailableComponents=9]="UpdateAvailableComponents"}(b||(b={}));class V{constructor(e,n=null){this.message=e,this.data=n}}function N(e){switch(e){case v.TheFirst:return new j;case v.RunCode:return new K;case v.MoveVehicle:return new Y;case v.SyncPhysics:return new ee;case v.CameraFollowGeometry:return new $;case v.TorqueWheels:return new J;case v.SendGraphicComponentsToRender:return new Z;case v.CreateStickman:return new X;case v.MovePlayer:return new Q;case v.CreateScene:return new _}}!function(e){e[e.TheFirst=0]="TheFirst",e[e.CreateStickman=1]="CreateStickman",e[e.MovePlayer=2]="MovePlayer",e[e.MoveVehicle=3]="MoveVehicle",e[e.TorqueWheels=4]="TorqueWheels",e[e.CreateScene=5]="CreateScene",e[e.SendGraphicComponentsToRender=6]="SendGraphicComponentsToRender",e[e.RunCode=7]="RunCode",e[e.SyncPhysics=8]="SyncPhysics",e[e.CameraFollowGeometry=9]="CameraFollowGeometry"}(v||(v={}));class j{constructor(){this.commandType=v.TheFirst}run(e,n){e.addCommand(v.CreateScene),e.addCommand(v.SendGraphicComponentsToRender),e.addCommand(v.RunCode),e.addCommand(v.SyncPhysics),e.addCommand(v.TorqueWheels),e.removeCommand(v.TheFirst)}}class K{constructor(){this.commandType=v.RunCode}run(e,n){}}class ${constructor(){this.commandType=v.CameraFollowGeometry}run(e,n){let t=e.find([T.All,[c.HardCodedId],U.Any,null]);if(0==t[0].length)return void console.log("no hardcodedid found");let o=t[0][0].entityUid;for(let t of n.componentChanges.changedComponentsBuffer[c.Position]){if(t.entityUid!=o)continue;let n=e.find([T.All,[c.Position],U.EntityType,l.Camera]);if(0==n[0].length)return;let i=n[0][0],s=t,a=new d(0,13,13);i.x=s.x+a.x,i.y=s.y+a.y,i.z=s.z+a.z}}}class _{constructor(){this.commandType=v.CreateScene}run(e,n){{let t=i(),o=new k(45,.1,500,n.domState.windowWidth/n.domState.windowHeight,t),s=new G(new d(0,0,0),t),a=new H(new d(-45,0,0),t),r=new P(l.Camera,t);e.addComponent(o),e.addComponent(a),e.addComponent(s),e.addComponent(r),e.addCommand(v.CameraFollowGeometry)}{let n=i(),t=new O(y.PointLight,50,16777215,10,0,n),o=new G(new d(3,8,3),n),s=new P(l.Light,n);e.addComponent(t),e.addComponent(o),e.addComponent(s)}{let n=i(),t=new O(y.AmbientLight,.5,16777215,0,0,n),o=new P(l.Light,n);e.addComponent(t),e.addComponent(o)}{let n=i(),t=new A(f.Static,n),o=new z(u.Box,n);o.size=new d(25,.2,80);let s=new G(new d(0,-3,0),n),a=new H(new d(0,0,0),n),r=new W(0,n),c=new E(8978380,n),m=new P(l.GeometricShape,n);e.addComponent(o),e.addComponent(a),e.addComponent(r),e.addComponent(t),e.addComponent(s),e.addComponent(c),e.addComponent(m)}{let n=i(),t=new A(f.Dynamic,n),o=new z(u.Box,n);o.size=new d(1,10,1);let s=new G(new d(3,0,2),n),a=new H(new d(0,0,0),n),r=new L(new d(0,0,0),n),c=new F(new d(0,0,0),n),m=new W(1,n),p=new E(16777215,n),h=new P(l.GeometricShape,n);e.addComponent(c),e.addComponent(t),e.addComponent(r),e.addComponent(s),e.addComponent(a),e.addComponent(m),e.addComponent(o),e.addComponent(p),e.addComponent(h)}{let n=i(),t=new A(f.Dynamic,n),o=new z(u.Box,n);o.size=new d(1,2,1);let s=new G(new d(5,0,-5),n),a=new H(new d(0,0,0),n),r=new L(new d(0,0,0),n),c=new F(new d(0,0,0),n),m=new W(1,n),p=new E(16777215,n),h=new P(l.GeometricShape,n);e.addComponent(c),e.addComponent(t),e.addComponent(r),e.addComponent(s),e.addComponent(a),e.addComponent(m),e.addComponent(o),e.addComponent(p),e.addComponent(h)}{let n=i(),t=new A(f.Dynamic,n),o=new z(u.Box,n);o.size=new d(1,2,1);let s=new G(new d(-3,0,-8),n),a=new H(new d(0,90,0),n),r=new L(new d(0,0,0),n),c=new F(new d(0,0,0),n),m=new W(1,n),p=new E(16777215,n),h=new P(l.GeometricShape,n);e.addComponent(c),e.addComponent(t),e.addComponent(r),e.addComponent(s),e.addComponent(a),e.addComponent(m),e.addComponent(o),e.addComponent(p),e.addComponent(h)}{let n=i(),t=new A(f.Dynamic,n),o=new z(u.Box,n);o.size=new d(1,2,1);let s=new G(new d(-3,0,8),n),a=new H(new d(0,0,0),n),r=new L(new d(0,0,0),n),c=new F(new d(0,0,0),n),m=new W(1,n),p=new E(16777215,n),h=new P(l.GeometricShape,n);e.addComponent(c),e.addComponent(t),e.addComponent(r),e.addComponent(s),e.addComponent(a),e.addComponent(m),e.addComponent(o),e.addComponent(p),e.addComponent(h)}{let n=i();{let t=new A(f.Dynamic,n),o=new z(u.Box,n);o.size=new d(2,.5,1);let i=new G(new d(0,0,0),n),s=new H(new d(0,0,0),n),a=new L(new d(0,0,0),n),r=new F(new d(0,0,0),n),c=new W(100,n),m=new E(13773133,n),p=new P(l.Robot,n),h=new R(0,n),y=new x(t.body,n);e.addComponent(y),e.addComponent(r),e.addComponent(t),e.addComponent(a),e.addComponent(i),e.addComponent(s),e.addComponent(c),e.addComponent(o),e.addComponent(h),e.addComponent(m),e.addComponent(p)}{let t=i(),o=new A(f.Dynamic,t);o.materialType=w.Wheel;let s=new z(u.Cylinder,t);s.height=.5,s.numberOfSegments=12,s.radiusBottom=.5,s.radiusTop=.5;let a=new G(new d(1,0,-1),t),r=new W(1,t),c=new H(new d(90,0,0),t),m=new E(5592473,t),p=new P(l.RobotComponent,t),h=new B(n,C.Hinge,t);h.pivotA=new d(1,0,-1),h.pivotB=new d(0,0,0),h.axisA=new d(0,0,1),h.axisB=new d(0,1,0);let y=new S(!1,n,t);e.addComponent(y),e.addComponent(h),e.addComponent(r),e.addComponent(o),e.addComponent(a),e.addComponent(c),e.addComponent(s),e.addComponent(m),e.addComponent(p)}{let t=i(),o=new A(f.Dynamic,t);o.materialType=w.Wheel;let s=new z(u.Cylinder,t);s.height=.5,s.numberOfSegments=12,s.radiusBottom=.5,s.radiusTop=.5;let a=new G(new d(-1,0,1),t),r=new W(1,t),c=new H(new d(90,0,0),t),m=new E(5592473,t),p=new P(l.RobotComponent,t),h=new B(n,C.Hinge,t);h.pivotA=new d(-1,0,1),h.pivotB=new d(0,0,0),h.axisA=new d(0,0,1),h.axisB=new d(0,1,0);let y=new S(!0,n,t);e.addComponent(y),e.addComponent(h),e.addComponent(r),e.addComponent(o),e.addComponent(a),e.addComponent(c),e.addComponent(s),e.addComponent(m),e.addComponent(p)}{let t=i(),o=new A(f.Dynamic,t);o.materialType=w.Wheel;let s=new z(u.Cylinder,t);s.height=.5,s.numberOfSegments=12,s.radiusBottom=.5,s.radiusTop=.5;let a=new G(new d(-1,0,-1),t),r=new W(1,t),c=new H(new d(90,0,0),t),m=new E(5592473,t),p=new P(l.RobotComponent,t),h=new B(n,C.Hinge,t);h.pivotA=new d(-1,0,-1),h.pivotB=new d(0,0,0),h.axisA=new d(0,0,-1),h.axisB=new d(0,1,0);let y=new S(!1,n,t);e.addComponent(y),e.addComponent(h),e.addComponent(r),e.addComponent(o),e.addComponent(a),e.addComponent(c),e.addComponent(s),e.addComponent(m),e.addComponent(p)}{let t=i(),o=new A(f.Dynamic,t);o.materialType=w.Wheel;let s=new z(u.Cylinder,t);s.height=.5,s.numberOfSegments=12,s.radiusBottom=.5,s.radiusTop=.5;let a=new G(new d(1,0,1),t),r=new W(1,t),c=new H(new d(90,0,0),t),m=new E(5592473,t),p=new P(l.RobotComponent,t),h=new B(n,C.Hinge,t);h.pivotA=new d(1,0,1),h.pivotB=new d(0,0,0),h.axisA=new d(0,0,1),h.axisB=new d(0,1,0);let y=new S(!0,n,t);e.addComponent(y),e.addComponent(y),e.addComponent(h),e.addComponent(r),e.addComponent(o),e.addComponent(a),e.addComponent(c),e.addComponent(s),e.addComponent(m),e.addComponent(p)}e.addCommand(v.MoveVehicle)}e.removeCommand(v.CreateScene)}}class J{constructor(){this.commandType=v.TorqueWheels}run(e,n){for(let t of n.componentChanges.changedComponents[c.Wheel]){let n=t,o=e.find([T.All,[c.Constraint],U.EntityUid,n.entityUid]);if(0==o[0].length)return void console.log("no constraint component found");let i=o[0][0];if(null==i.constraint||i.constraintType!=C.Hinge)continue;let s=i.constraint;n.isOn?(s.enableMotor(),s.setMotorSpeed(n.velocity)):s.disableMotor()}}}class Y{constructor(){this.commandType=v.MoveVehicle}run(e,n){let t=e.find([T.All,[c.HardCodedId],U.Any,null]);if(0==t[0].length)return void console.log("no hardcodedid found");let o=t[0][0].entityUid,i=e.find([T.All,[c.Wheel],U.Any,null]);if(0!=i[0].length)for(let e of i[0]){let t=e;t.entityUidAttachedTo==o&&(1==n.input.movementDirection.y&&(t.isOn=!0,t.velocity=20),-1==n.input.movementDirection.y&&(t.isOn=!0,t.velocity=0),1==n.input.movementDirection.x&&(t.isLeft?(t.isOn=!0,t.velocity=-10):(t.isOn=!0,t.velocity=10)),-1==n.input.movementDirection.x&&(t.isLeft?(t.isOn=!0,t.velocity=10):(t.isOn=!0,t.velocity=-10)),0==n.input.movementDirection.x&&0==n.input.movementDirection.y&&(t.isOn=!1))}else console.log("no wheel components found")}}class X{constructor(){this.commandType=v.CreateStickman}run(e,n){for(let n=0;n<1;n++)for(let n=0;n<1;n++){let n=i(),t=new G(new d(0,0,0),n),o=new D([h.Idle],n),s=new P(l.Stickman,n),a=new M(10,n),r=new L(new d(0,0,0),n),c=new W(4,n),m=new z(u.Box,n);m.size=new d(40,90,30),e.addComponent(c),e.addComponent(m),e.addComponent(r),e.addComponent(a),e.addComponent(t),e.addComponent(o),e.addComponent(s)}e.addCommand(v.MovePlayer),e.removeCommand(v.CreateStickman)}}class Q{constructor(){this.commandType=v.MovePlayer}run(e,n){let t=.02,o=e.find([T.All,[c.EntityType],U.Any,null]);if(0==o[0].length)return void console.log("no entity types found");let i=null;for(let e of o[0]){let n=e;n.entityType==l.Stickman&&(i=n.entityUid)}if(null==i)return;if(0==n.input.movementDirection.x&&0==n.input.movementDirection.y){let n=e.find([T.All,[c.EntityState],U.EntityUid,o[0][0].entityUid]);if(0==n[0].length)return void console.log("entityState not found");for(let e of n[0]){let n=e;if(n.entityUid==i){let e=n.states.indexOf(h.Run);if(-1!=e){if(n.states.splice(e,1),n.states.includes(h.Idle))return;n.states.push(h.Idle)}return}}}let s=e.find([T.One,[c.Force],U.EntityUid,i]);if(0==s[0].length)return void console.log("no player force found found");let a=s[0][0],r=new d(0,0,0);r.x=a.x+.003*n.input.movementDirection.x,r.z=a.z+.003*-n.input.movementDirection.y,Math.abs(r.x)>t&&(r.x=t*(r.x<0?-1:1)),Math.abs(r.z)>t&&(r.z=t*(r.z<0?-1:1));let m=e.find([T.One,[c.EntityState],U.EntityUid,i]);if(0==m[0].length)return void console.log("player entityState not found");let p=m[0][0];p.states.includes(h.Run)||p.states.push(h.Run);let y=p.states.indexOf(h.Idle);-1!=y&&p.states.splice(y,1),0!=n.input.movementDirection.x&&(a.x=r.x),0!=n.input.movementDirection.y&&(a.z=r.z)}}class Z{constructor(){this.commandType=v.SendGraphicComponentsToRender}run(e,n){let t=new q;t.changedComponents.push(...n.componentChanges.changedComponents[c.Camera]),t.changedComponents.push(...n.componentChanges.changedComponents[c.Light]),t.changedComponents.push(...n.componentChanges.changedComponents[c.Position]),t.changedComponents.push(...n.componentChanges.changedComponents[c.EntityState]),t.changedComponents.push(...n.componentChanges.changedComponents[c.Rotation]),t.changedComponents.push(...n.componentChanges.changedComponents[c.Shape]),t.changedComponents.push(...n.componentChanges.changedComponents[c.ShapeColor]),t.changedComponents.push(...n.componentChanges.addedComponents[c.EntityType]),t.changedComponents.push(...n.componentChanges.addedComponents[c.Camera]),t.changedComponents.push(...n.componentChanges.addedComponents[c.Light]),t.changedComponents.push(...n.componentChanges.addedComponents[c.Position]),t.changedComponents.push(...n.componentChanges.addedComponents[c.EntityState]),t.changedComponents.push(...n.componentChanges.addedComponents[c.Rotation]),t.changedComponents.push(...n.componentChanges.addedComponents[c.Shape]),t.changedComponents.push(...n.componentChanges.addedComponents[c.ShapeColor]);for(let e of n.componentChanges.removedComponents[c.EntityType])t.removedEntitiesUid.push(e.entityUid);for(let e of n.componentChanges.addedComponents[c.EntityType])t.addedEntitiesUid.push(e.entityUid);0==t.changedComponents.length&&0==t.removedEntitiesUid.length||postMessage(new V(b.GraphicChanges,t))}}class ee{constructor(){this.commandType=v.SyncPhysics}run(e,n){n.physics.world.fixedStep();for(let t of n.componentChanges.addedComponentsBuffer[c.Mass]){let n=e.find([T.One,[c.RigidBody],U.EntityUid,t.entityUid]);if(0==n[0].length){console.log("entity does not have rigidbody(mass)");continue}let o=n[0][0],i=t;o.body.mass=i.mass,o.body.updateMassProperties()}for(let t of n.componentChanges.addedComponentsBuffer[c.Shape]){let n=e.find([T.One,[c.RigidBody],U.EntityUid,t.entityUid]);if(0==n[0].length){console.log("entity does not have rigidbody(shape)");continue}let i,s=n[0][0],d=t,a=!1;switch(d.shapeType){case u.Box:{let e=new o.AO(d.size.x/2,d.size.y/2,d.size.z/2);i=new o.xu(e)}break;case u.Cylinder:i=new o.Ab(d.radiusTop,d.radiusBottom,d.height,d.numberOfSegments),a=!0}s.body.addShape(i)}for(let t of n.componentChanges.addedComponentsBuffer[c.Rotation]){let i,s=e.find([T.One,[c.RigidBody],U.EntityUid,t.entityUid]);if(0!=s[0].length)i=s[0][0];else for(let e of n.componentChanges.addedComponentsBuffer[c.RigidBody])e.entityUid==t.entityUid&&(i=e);if(null==i)continue;let d=t,a=new o._f(d.x,d.y,d.z,d.w);i.body.quaternion=a}for(let t of n.componentChanges.addedComponentsBuffer[c.Velocity]){let n=e.find([T.One,[c.RigidBody],U.EntityUid,t.entityUid]);if(0==n[0].length){console.log("entity does not have rigidbody(velocity)");continue}let i=n[0][0],s=t,d=new o.AO(s.x,s.y,s.z);i.body.velocity=d}for(let t of n.componentChanges.addedComponentsBuffer[c.Force]){let n=e.find([T.One,[c.RigidBody],U.EntityUid,t.entityUid]);if(0==n[0].length){console.log("entity does not have rigidbody(force)");continue}let i=n[0][0],s=t,d=new o.AO(s.x,s.y,s.z);i.body.force=d}for(let t of n.componentChanges.addedComponentsBuffer[c.Position]){let o,i=e.find([T.One,[c.RigidBody],U.EntityUid,t.entityUid]);if(0!=i[0].length)o=i[0][0];else for(let e of n.componentChanges.addedComponentsBuffer[c.RigidBody])e.entityUid==t.entityUid&&(o=e);if(null==o)continue;let s=t;o.body.position.set(s.x,s.y,s.z)}for(let e of n.componentChanges.addedComponentsBuffer[c.RigidBody]){let t=e;switch(t.bodyType){case f.Dynamic:t.body.type=o.Hb.DYNAMIC;break;case f.Static:t.body.type=o.Hb.STATIC;break;case f.Kinematic:t.body.type=o.Hb.KINEMATIC}switch(t.materialType){case w.Wheel:t.body.material=n.physics.materials.wheel;break;case w.Default:t.body.material=n.physics.materials.default}t.disableCollisions&&(t.body.collisionFilterGroup=0),n.physics.world.addBody(t.body)}for(let t of n.componentChanges.addedComponentsBuffer[c.Constraint]){let i=e.find([T.One,[c.RigidBody],U.EntityUid,t.entityUid]);if(0==i[0].length){console.log("entity does not have rigidbody (constraint)");continue}let s,d,r=t,m=i[0][0],p=e.find([T.One,[c.RigidBody],U.EntityUid,r.entityUidConstrainedTo]);if(0==p[0].length)for(let e of n.componentChanges.addedComponentsBuffer[c.RigidBody]){if(e.entityUid!=r.entityUidConstrainedTo)continue;s=e.body}else s=p[0][0].body;if(null!=s){switch(r.constraintType){case C.Hinge:d=new o.XM(s,m.body,{pivotA:a(r.pivotA),pivotB:a(r.pivotB),axisA:a(r.axisA),axisB:a(r.axisB)});break;case C.PointToPoint:console.log("point to point constraint not implemented");break;case C.Lock:console.log("lock constraint not implemented");break;case C.Distance:d=new o.zN(m.body,s,r.distance)}null!=d&&(r.constraint=d,n.physics.world.addConstraint(d))}else console.log("constrained body wasn't found")}let t=e.find([T.All,[c.RigidBody],U.Any,null]);for(let e of n.componentChanges.changedComponentsBuffer[c.RigidBody]){let n=e;switch(n.bodyType){case f.Dynamic:n.body.type=o.Hb.DYNAMIC;break;case f.Static:n.body.type=o.Hb.STATIC;break;case f.Kinematic:n.body.type=o.Hb.KINEMATIC}n.disableCollisions?n.body.collisionFilterGroup=0:n.body.collisionFilterGroup=1}for(let e of n.componentChanges.changedComponentsBuffer[c.Mass]){let n=e;for(let e of t[0]){if(e.entityUid!=n.entityUid)continue;e.body.mass=n.mass}}for(let e of n.componentChanges.changedComponentsBuffer[c.Force]){let n=e;for(let e of t[0]){if(e.entityUid!=n.entityUid)continue;e.body.applyImpulse(new o.AO(n.xToApply,n.yToApply,n.zToApply)),n.xToApply=0,n.yToApply=0,n.zToApply=0}}for(let e of n.componentChanges.changedComponentsBuffer[c.Position]){let n=e;for(let e of t[0]){if(e.entityUid!=n.entityUid)continue;e.body.position=new o.AO(n.x,n.y,n.z)}}for(let e of n.componentChanges.changedComponentsBuffer[c.Rotation]){let n=e;for(let e of t[0]){if(e.entityUid!=n.entityUid)continue;e.body.quaternion=new o._f(n.x,n.y,n.z,n.w)}}for(let e of n.componentChanges.changedComponentsBuffer[c.Velocity]){let n=e;for(let e of t[0]){if(e.entityUid!=n.entityUid)continue;let t=e,i=new o.AO(n.x,n.y,n.z);t.body.velocity=i}}for(let e of n.componentChanges.changedComponentsBuffer[c.Shape]){let n=e;for(let e of t[0]){if(e.entityUid!=n.entityUid)continue;let t,i=e,s=i.body.position,d=i.body.quaternion,a=i.body.velocity;switch(n.shapeType){case u.Box:{let e=new o.AO(n.size.x/2,n.size.y/2,n.size.z/2);t=new o.xu(e)}break;case u.Cylinder:t=new o.Ab(n.radiusTop,n.radiusBottom,n.height,n.numberOfSegments)}let r=new o.uT({velocity:a,position:s,quaternion:d,shape:t});i.body=r}}let i=e.find([T.All,[c.Position,c.Rotation,c.Force,c.Velocity],U.Any,null]);for(let e of t[0]){let n=e;for(let e of i[0]){if(e.entityUid!=n.entityUid)continue;let t=e;n.body.position.x==t.x&&n.body.position.y==t.y&&n.body.position.z==t.z||(t.x=n.body.position.x,t.y=n.body.position.y,t.z=n.body.position.z)}for(let e of i[1]){if(e.entityUid!=n.entityUid)continue;let t=e;t.x==n.body.quaternion.x&&t.y==n.body.quaternion.y&&t.z==n.body.quaternion.z&&t.w==n.body.quaternion.w||(t.x=n.body.quaternion.x,t.y=n.body.quaternion.y,t.z=n.body.quaternion.z,t.w=n.body.quaternion.w)}for(let e of i[2]){if(e.entityUid!=n.entityUid)continue;let t=e;t.x==n.body.force.x&&t.y==n.body.force.y&&t.z==n.body.force.z||(t.x=n.body.force.x,t.y=n.body.force.y,t.z=n.body.force.z)}for(let e of i[3]){if(e.entityUid!=n.entityUid)continue;let t=e;n.body.velocity.x==t.x&&n.body.velocity.y==t.y&&n.body.velocity.z==t.z||(t.x=n.body.velocity.x,t.y=n.body.velocity.y,t.z=n.body.velocity.z)}}}}!function(e){e[e.One=0]="One",e[e.All=1]="All"}(T||(T={})),function(e){e[e.EntityUid=0]="EntityUid",e[e.EntityType=1]="EntityType",e[e.componentUid=2]="componentUid",e[e.Any=3]="Any"}(U||(U={}));class ne{constructor(){this.removedCommands=[],this.addedCommands=[]}clearChanges(){this.removedCommands=[],this.addedCommands=[]}}class te{constructor(){this.wheel=new o.F5,this.default=new o.F5}}class oe{constructor(){this.robotComponentTypes=[2,1,0],this.quantity=[8,4,1]}}class ie{constructor(){this.world=new o.q3({gravity:new o.AO(0,-9.82,0)}),this.materials=new te;let e=new o.kp(this.materials.default,this.materials.default,{}),n=new o.kp(this.materials.wheel,this.materials.default,{friction:1});this.world.addContactMaterial(e),this.world.addContactMaterial(n)}}class se{constructor(e,n){this.time=e,this.command=n}}class de{constructor(e){this.currentExecutingCommand=e,this.lastTimeCommandsWereRun=[]}get(){for(let e of this.lastTimeCommandsWereRun)if(e.command==this.currentExecutingCommand.command){let n=e.time;return e.time=performance.now(),performance.now()-n}return this.lastTimeCommandsWereRun.push(new se(performance.now(),this.currentExecutingCommand.command)),null}}class ae{constructor(e){this.currentExecutingCommand=e,this.state=new Map}removeCommandStates(e){for(let[n,t]of this.state)n[1]==e&&this.state.delete(n)}set(e,n){this.state.set([e,this.currentExecutingCommand.command],n)}get(e){console.log(this.state);let n=this.state.get([e,this.currentExecutingCommand.command]);return null==n?void 0:n[1]}}class re{constructor(e){this.currentExecutingCommand=e,this.commandsCheckedFirstTime=[]}get(){for(let e of this.commandsCheckedFirstTime)if(e==this.currentExecutingCommand.command)return!1;return this.commandsCheckedFirstTime.push(this.currentExecutingCommand.command),!0}}class ce{constructor(){this.isSetNight=void 0,this.isShadowsEnabled=void 0,this.isEnablePhysics=void 0,this.isEnableFreeCamera=void 0}}class me{constructor(){this.windowWidth=void 0,this.windowHeight=void 0}}class pe{constructor(){this.movementDirection=new s(0,0),this.code=void 0}}class le{constructor(){this.baseStructure=[];for(let e=0;e<m;e++)this.baseStructure.push([]);this.changedComponentsBuffer=structuredClone(this.baseStructure),this.removedComponentsBuffer=structuredClone(this.baseStructure),this.addedComponentsBuffer=structuredClone(this.baseStructure),this.changedComponents=[],this.removedComponents=[],this.addedComponents=[]}cycleChanges(){this.changedComponents=this.changedComponentsBuffer,this.removedComponents=this.removedComponentsBuffer,this.addedComponents=this.addedComponentsBuffer,this.changedComponentsBuffer=structuredClone(this.baseStructure),this.removedComponentsBuffer=structuredClone(this.baseStructure),this.addedComponentsBuffer=structuredClone(this.baseStructure)}}class he{constructor(){}}let ye,ue=new class{constructor(){this.command=null}},Ce=new class{constructor(e){this.domState=new me,this.delta=new de(e),this.isFirstTime=new re(e),this.commandState=new ae(e),this.componentChanges=new le,this.input=new pe,this.options=new ce,this.positionGrid=new he,this.physics=new ie,this.availableRobotComponents=new oe}}(ue),fe=new class{constructor(e,n){this.resources=e,this.currentExecutingCommand=n,this.commandChangesBuffer=new ne,this.commands=[],this.components=[];for(let e=0;e<m;e++)this.components.push([])}removeCommand(e){this.commandChangesBuffer.removedCommands.push(e)}addCommand(e){this.commandChangesBuffer.addedCommands.push(e)}addComponent(e){this.components[e.componentType].push(this.createProxy(e)),this.resources.componentChanges.addedComponentsBuffer[e.componentType].push(e)}removeComponent(e){for(let[n,t]of this.components[e.componentType].entries())t.componentUid==e.componentUid&&(this.resources.componentChanges.removedComponentsBuffer[e.componentType].push(e),this.components.splice(n,1))}createProxy(e){let n=this,t={set(e,t,o){let i=e,s=!1;for(let e of n.resources.componentChanges.changedComponentsBuffer[i.componentType])e.componentUid==i.componentUid&&(s=!0);return s||n.resources.componentChanges.changedComponentsBuffer[i.componentType].push(i),e[t]=o,!0},get:(e,n)=>e[n]};return new Proxy(e,t)}find(e){if(0==e[1].length)return console.log("no components expecified"),[];if(e[2]==U.EntityType&&null==e[3]||e[2]==U.componentUid&&"number"!=typeof e[3]||e[2]==U.EntityUid&&"number"!=typeof e[3])return console.log('argument does not match "By" enum'),[];if(e[0]==T.All&&e[2]==U.componentUid)return console.log("cannot get all by component id"),[];if(e[0]==T.One&&e[2]==U.EntityType)return console.log("query Get.One By.EntityType is not supported yet"),[];if(e[0]==T.One&&e[2]==U.Any)return console.log("query Get.One By.Any is not supported yet"),[];let n=[];for(let t=0;t<e[1].length;t++)n.push([]);for(let[t,o]of e[1].entries())if(e[0]==T.One){if(e[2]==U.componentUid){for(let i of this.components[o])if(e[3]==i.componentUid){n[t].push(i);break}continue}if(e[2]==U.EntityUid){for(let i of this.components[o])if(e[3]==i.entityUid){n[t].push(i);break}continue}}else if(e[0]==T.All){if(e[2]==U.EntityUid){for(let i of this.components[o])e[3]==i.entityUid&&n[t].push(i);continue}if(e[2]==U.Any){for(let e of this.components[o])n[t].push(e);continue}if(e[2]==U.EntityType){for(let i of this.components[c.EntityType]){let s=i;if(e[3]==s.entityType){for(let e of this.components[o])i.entityUid==e.entityUid&&n[t].push(e);break}}continue}}return n}updateCommands(){for(let e of this.commandChangesBuffer.addedCommands){let n=!1;for(let t of this.commands)e==t.commandType&&(console.log("$ command already exists"),n=!0);if(n)continue;let t=N(e),o=!1;for(let[n,i]of this.commands.entries())if(e<i.commandType){o=!0,this.commands.splice(n,0,t);break}o||this.commands.push(t)}for(let e of this.commandChangesBuffer.removedCommands){let n=!1;for(let t=this.commands.length-1;t>=0;t--)e==this.commands[t].commandType&&(n=!0,this.commands.splice(t,1),this.resources.commandState.removeCommandStates(e));n||console.log("$ command was not found")}}run(){for(let e of this.commands)this.currentExecutingCommand.command=e.commandType,e.run(this,this.resources);this.updateCommands(),this.commandChangesBuffer.clearChanges(),this.resources.componentChanges.cycleChanges()}}(Ce,ue);function we(){null==ye&&(ye=setInterval(fe.run.bind(fe),15))}onmessage=e=>{let n=e.data;switch(n.message){case b.Start:{let e=n.data;Ce.domState.windowHeight=e.windowHeight,Ce.domState.windowWidth=e.windowWidth,fe.addCommand(v.TheFirst),we()}break;case b.Input:{let e=n.data;Ce.input.movementDirection=e.movementDirection}break;case b.RefreshGraphics:{let e=new q,n=fe.find([T.All,[c.EntityType,c.Camera,c.Light,c.Position,c.EntityState,c.Rotation,c.Shape,c.ShapeColor],U.Any,null]);e.changedComponents.push(...n[0]),e.changedComponents.push(...n[1]),e.changedComponents.push(...n[2]),e.changedComponents.push(...n[3]),e.changedComponents.push(...n[4]),e.changedComponents.push(...n[5]),e.changedComponents.push(...n[6]),e.changedComponents.push(...n[7]);for(let t of n[0])e.addedEntitiesUid.push(t.entityUid);postMessage(new V(b.GraphicChanges,JSON.parse(JSON.stringify(e))))}break;case b.Stop:clearInterval(ye);break;case b.Continue:we();break;case b.UpdateAvailableComponents:{let e=n.data;Ce.availableRobotComponents.quantity=e.quantity,Ce.availableRobotComponents.robotComponentTypes=e.robotComponentTypes}break;case b.GetAvailableRobotComponents:postMessage(new V(b.AvailableRobotComponents,new I(Ce.availableRobotComponents.robotComponentTypes,Ce.availableRobotComponents.quantity)));break;case b.Options:n.data}}}},o={};function i(e){var n=o[e];if(void 0!==n)return n.exports;var s=o[e]={exports:{}};return t[e](s,s.exports,i),s.exports}i.m=t,i.x=()=>{var e=i.O(void 0,[687],(()=>i(632)));return e=i.O(e)},e=[],i.O=(n,t,o,s)=>{if(!t){var d=1/0;for(m=0;m<e.length;m++){for(var[t,o,s]=e[m],a=!0,r=0;r<t.length;r++)(!1&s||d>=s)&&Object.keys(i.O).every((e=>i.O[e](t[r])))?t.splice(r--,1):(a=!1,s<d&&(d=s));if(a){e.splice(m--,1);var c=o();void 0!==c&&(n=c)}}return n}s=s||0;for(var m=e.length;m>0&&e[m-1][2]>s;m--)e[m]=e[m-1];e[m]=[t,o,s]},i.d=(e,n)=>{for(var t in n)i.o(n,t)&&!i.o(e,t)&&Object.defineProperty(e,t,{enumerable:!0,get:n[t]})},i.f={},i.e=e=>Promise.all(Object.keys(i.f).reduce(((n,t)=>(i.f[t](e,n),n)),[])),i.u=e=>e+".bundle.js",i.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"==typeof window)return window}}(),i.o=(e,n)=>Object.prototype.hasOwnProperty.call(e,n),(()=>{var e;i.g.importScripts&&(e=i.g.location+"");var n=i.g.document;if(!e&&n&&(n.currentScript&&(e=n.currentScript.src),!e)){var t=n.getElementsByTagName("script");if(t.length)for(var o=t.length-1;o>-1&&!e;)e=t[o--].src}if(!e)throw new Error("Automatic publicPath is not supported in this browser");e=e.replace(/#.*$/,"").replace(/\?.*$/,"").replace(/\/[^\/]+$/,"/"),i.p=e})(),(()=>{var e={632:1};i.f.i=(n,t)=>{e[n]||importScripts(i.p+i.u(n))};var n=self.webpackChunkstrworld=self.webpackChunkstrworld||[],t=n.push.bind(n);n.push=n=>{var[o,s,d]=n;for(var a in s)i.o(s,a)&&(i.m[a]=s[a]);for(d&&d(i);o.length;)e[o.pop()]=1;t(n)}})(),n=i.x,i.x=()=>i.e(687).then(n);i.x()})();