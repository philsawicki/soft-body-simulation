import { System } from 'ecsy';

import {
    Ball,
    Object3D,
    PhysicsWorld,
    RigidBody,
    SoftBody } from '../components';


/**
 * Simulation system, binding entities to Ammo.js (Bullet's port to WASM).
 */
export class SimulationSystem extends System {

    /**
     * System queries.
     */
    static queries = {
        physicsWorld: {
            components: [ PhysicsWorld ],
            mandatory: true
        },
        softBodies: {
            components: [ SoftBody ]
        },
        balls: {
            components: [ Ball ]
        }
    };

    /**
     * Initialize the system.
     */
    init() {
        // Physics configuration:
        const gravityConstant = -9.8;
        const collisionConfiguration = new Ammo.btSoftBodyRigidBodyCollisionConfiguration();
        const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
        const broadphase = new Ammo.btDbvtBroadphase();
        const solver = new Ammo.btSequentialImpulseConstraintSolver();
        const softBodySolver = new Ammo.btDefaultSoftBodySolver();
        const physicsWorld = new Ammo.btSoftRigidDynamicsWorld(dispatcher, broadphase, solver, collisionConfiguration, softBodySolver);
        physicsWorld.setGravity(new Ammo.btVector3(0, gravityConstant, 0));
        physicsWorld.getWorldInfo().set_m_gravity(new Ammo.btVector3(0, gravityConstant, 0));

        this.world
            .createEntity()
            .addComponent(PhysicsWorld, { physicsWorld });
    }

    /**
     * Update the system.
     *
     * @param {number} delta Time elapsed since the last call (in seconds).
     */
    execute(delta) {
        // Step world:
        const { physicsWorld } = this.queries.physicsWorld.results[0]
            .getComponent(PhysicsWorld);
        const maxSubSteps = 10;
        physicsWorld.stepSimulation(delta, maxSubSteps);

        // Update soft bodies and balls:
        this.queries.softBodies.results.forEach(entity => this.updateSoftBody(entity));
        this.queries.balls.results.forEach(entity => this.updateBall(entity));
    }

    /**
     * Update the given entity with a `SoftBody` Component.
     *
     * @param {ecsy.Entity} entity Entity with a `SoftBody` Component to update.
     */
    updateSoftBody(entity) {
        const { volume, physicsBody, ammoIndexAssociation } = entity.getComponent(SoftBody);

        const geometry = volume.geometry || volume.children[0].geometry;
        const volumePositions = geometry.attributes.position.array;
        const volumeNormals = geometry.attributes.normal.array;
        const numVerts = ammoIndexAssociation.length;
        const nodes = physicsBody.get_m_nodes();

        for (let j = 0; j < numVerts; ++j) {
            const node = nodes.at(j);
            const nodePosition = node.get_m_x();
            const nodeNormal = node.get_m_n();
            const [x, y, z] = [nodePosition.x(), nodePosition.y(), nodePosition.z()];
            const [nx, ny, nz] = [nodeNormal.x(), nodeNormal.y(), nodeNormal.z()];

            const associatedVertex = ammoIndexAssociation[j];
            for (let indexVertex of associatedVertex) {
                volumePositions[indexVertex] = x;
                volumeNormals[indexVertex] = nx;

                ++indexVertex;
                volumePositions[indexVertex] = y;
                volumeNormals[indexVertex] = ny;

                ++indexVertex;
                volumePositions[indexVertex] = z;
                volumeNormals[indexVertex] = nz;
            }
        }

        geometry.attributes.position.needsUpdate = true;
        geometry.attributes.normal.needsUpdate = true;
    }

    /**
     * Update the given entity with a `Ball` Component.
     *
     * @param {ecsy.Entity} entity Entity with a `Ball` Component to update.
     */
    updateBall(entity) {
        const { physicsBody } = entity.getComponent(RigidBody);
        const motionState = physicsBody.getMotionState();
        if (motionState) {
            const { object } = entity.getComponent(Object3D);

            const transformAux1 = new Ammo.btTransform();
            motionState.getWorldTransform(transformAux1);
            const ballPosition = transformAux1.getOrigin();
            const ballRotation = transformAux1.getRotation();

            object.position.set(ballPosition.x(), ballPosition.y(), ballPosition.z());
            object.quaternion.set(ballRotation.x(), ballRotation.y(), ballRotation.z(), ballRotation.w());
        }
    }
}
