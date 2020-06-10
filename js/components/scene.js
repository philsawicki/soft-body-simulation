import { Component } from 'ecsy';


/**
 * Scene Component.
 */
export class Scene extends Component {

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
     * @param {Scene} source Component from which to copy the properties.
     */
    copy(source) {
        this.scene = source.scene;
    }

    /**
     * Reset the Component.
     */
    reset() {
        /**
         * 3D World scene.
         *
         * @type {THREE.Scene}
         */
        this.scene = null;
    }
}
