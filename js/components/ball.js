import { Component, TagComponent } from 'ecsy';


/**
 * Ball Component.
 */
export class Ball extends Component {

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
     * @param {Ball} source Component from which to copy the properties.
     */
    copy(source) {
        this.velocityDirection = source.velocityDirection;
    }

    /**
     * Reset the Component.
     */
    reset() {
        /**
         * Velocity vector of the ball.
         *
         * @type {THREE.Vector3}
         */
        this.velocityDirection = null;
    }
}


/**
 * Initialized Ball Component.
 */
export class BallInitialized extends TagComponent { };

