import { Component, TagComponent } from 'ecsy';


/**
 * Soft Body Component.
 */
export class SoftBody extends Component {

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
     * @param {SoftBody} source Component from which to copy the properties.
     */
    copy(source) {
        this.mass = source.mass;
        this.pressure = source.pressure;
        this.volume = source.volume;
        this.bufferGeometry = source.bufferGeometry;
        this.margin = source.margin;
        this.ammoVertices = source.ammoVertices ? Array.from(source.ammoVertices) : [];
        this.ammoIndices = source.ammoIndices ? Array.from(source.ammoIndices) : [];
        this.ammoIndexAssociation = source.ammoIndexAssociation
            ? JSON.parse(JSON.stringify(source.ammoIndexAssociation))
            : [];
        this.material = source.material;
        this.physicsBody = source.physicsBody;
    }

    /**
     * Reset the Component.
     */
    reset() {
        /**
         * Mass of the soft body.
         *
         * @type {number}
         */
        this.mass = 0;
        /**
         * Pressure of the soft body.
         *
         * @type {number}
         */
        this.pressure = 0;

        /**
         * Volume of the soft body.
         *
         * @type {THREE.Mesh}
         */
        this.volume = null;
        /**
         * Buffer geometry of the collision shape.
         *
         * @type {THREE.BufferGeometry}
         */
        this.bufferGeometry = null;
        /**
         * Margin of the collision shape.
         *
         * @type {number}
         */
        this.margin = 0;

        /**
         * @type {ArrayLike<number>}
         */
        this.ammoVertices = [];
        /**
         * @type {ArrayLike<number>}
         */
        this.ammoIndices = [];
        /**
         * @type {number[][]}
         */
        this.ammoIndexAssociation = [];

        /**
         * Material of the soft body.
         *
         * @type {THREE.Material}
         */
        this.material = null;

        /**
         * Ammo.js representation of the soft body.
         *
         * @type {Ammo.btSoftBody}
         */
        this.physicsBody = null;
    }
}


/**
 * Initialized Soft Body Component.
 */
export class SoftBodyInitialized extends TagComponent { }
