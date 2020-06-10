import { Component, TagComponent } from 'ecsy';


/**
 * Rigid Body Component.
 */
export class RigidBody extends Component {

    /**
     * Constructor.
     */
    constructor() {
        super();
        this.reset();
    }

    /**
     * Clear the Component.
     */
    clear() {
        this.reset();
    }

    /**
     * Copy the Component from the given source.
     *
     * @param {RigidBody} source Component from which to copy the properties.
     */
    copy(source) {
        this.mass = source.mass;
        this.physicsShape = source.physicsShape;
        this.position = source.position;
        this.quaternion = source.quaternion;
        this.physicsBody = source.physicsBody;
    }

    /**
     * Reset the Component.
     */
    reset() {
        /**
         * Mass of the rigid body (can be `0` if the Object is considered
         * static, like ground or other Scene objects).
         *
         * @type {number}
         */
        this.mass = 0;
        /**
         * Physics shape of the rigid body.
         *
         * @type {btBoxShape|Ammo.btSphereShape}
         */
        this.physicsShape = null;

        /**
         * Position of the rigid body within the physics world.
         *
         * @type {THREE.Vector3}
         */
        this.position = null;
        /**
         * Orientation of the rigid body within the physics world.
         *
         * @type {THREE.Quaternion}
         */
        this.quaternion = null;

        /**
         * Ammo.js representation of the rigid body.
         *
         * @type {Ammo.btRigidBody}
         */
        this.physicsBody = null;
    }
}


/**
 * Initialized Rigid Body Component.
 */
export class RigidBodyInitialized extends TagComponent { };
