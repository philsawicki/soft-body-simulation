import { Not, System } from 'ecsy';

import { Ball, BallInitialized, RigidBody } from '../components';


/**
 * Rigid body system.
 */
export class BallSystem extends System {

    /**
     * System queries.
     */
    static queries = {
        balls: {
            components: [ Ball, Not(BallInitialized) ],
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
        this.queries.balls.added.forEach(entity => this.initializeBall(entity));
    }

    /**
     * Initialize the physics properties of the given Entity with a Ball.
     *
     * @param {ecsy.Entity} entity The Entity with a `Ball` Component.
     */
    initializeBall(entity) {
        const { physicsBody } = entity.getComponent(RigidBody);
        const { velocityDirection } = entity.getComponent(Ball);

        velocityDirection.multiplyScalar(14);
        physicsBody.setLinearVelocity(new Ammo.btVector3(velocityDirection.x, velocityDirection.y, velocityDirection.z));
        physicsBody.setFriction(0.5);

        // Add a Component signaling that the Ball was initialized, so the
        // system can go to sleep and avoid calling `execute()` again until a
        // new Ball is added to the World.
        entity.addComponent(BallInitialized);
    }
}
