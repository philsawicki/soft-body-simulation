import { Component } from 'ecsy';


/**
 * Physics Wold Component.
 */
export class PhysicsWorld extends Component {

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
     * @param {PhysicsWorld} source Component from which to copy the properties.
     */
    copy(source) {
        this.physicsWorld = source.physicsWorld;
    }

    /**
     * Reset the Component.
     */
    reset() {
        /**
         * Ammo.js physics world.
         *
         * @type {Ammo.btSoftRigidDynamicsWorld}
         */
        this.physicsWorld = null;
    }
}
