import { Component } from 'ecsy';


/**
 * 3D Object Component.
 */
export class Object3D extends Component {

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
     * @param {Object3D} source Component from which to copy the properties.
     */
    copy(source) {
        this.object = source.object;
    }

    /**
     * Reset the Component.
     */
    reset() {
        /**
         * 3D Scene object.
         *
         * @type {THREE.Object3D}
         */
        this.object = null;
    }
}
