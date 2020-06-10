import { Not, System } from 'ecsy';

import {
    Object3D,
    PhysicsWorld,
    RigidBody,
    RigidBodyInitialized,
    Scene } from '../components';


/**
 * Rigid body system.
 */
export class RigidBodySystem extends System {

    /**
     * System queries.
     */
    static queries = {
        scene: {
            components: [ Scene ]
        },
        physicsWorld: {
            components: [ PhysicsWorld ]
        },
        rigidBodies: {
            components: [ RigidBody, Not(RigidBodyInitialized) ],
            mandatory: true,
            listen: {
                added: true
            }
        }
    };


    /**
     * Update the system.
     */
    execute() {
        this.queries.rigidBodies.added.forEach(entity => this.initializeRigidBody(entity));
    }

    /**
     * Initialize the physics properties of the given Entity with a Rigid Body.
     *
     * @param {ecsy.Entity} entity The Entity with a `RigidBody` Component.
     */
    initializeRigidBody(entity) {
        const { physicsWorld } = this.queries.physicsWorld.results[0].getComponent(PhysicsWorld);
        const { scene } = this.queries.scene.results[0].getComponent(Scene);
        const { position, quaternion, physicsShape, mass } = entity.getComponent(RigidBody);
        const { object } = entity.getComponent(Object3D);

        object.position.copy(position);
        object.quaternion.copy(quaternion);
        scene.add(object);

        const transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin(new Ammo.btVector3(position.x, position.y, position.z));
        transform.setRotation(new Ammo.btQuaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w));
        const motionState = new Ammo.btDefaultMotionState(transform);

        const localInertia = new Ammo.btVector3(0, 0, 0);
        physicsShape.calculateLocalInertia(mass, localInertia);

        const rigidBodyInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, physicsShape, localInertia);
        const physicsBody = new Ammo.btRigidBody(rigidBodyInfo);

        if (mass > 0) {
            // Prevent deactivation:
            physicsBody.setActivationState(4);
        }

        physicsWorld.addRigidBody(physicsBody);

        entity.getComponent(RigidBody).physicsBody = physicsBody;

        // Add a Component signaling that the Rigid Body was initialized, so the
        // system can go to sleep and avoid calling `execute()` again until a
        // new Rigid Body is added to the World.
        entity.addComponent(RigidBodyInitialized);
    }
}
