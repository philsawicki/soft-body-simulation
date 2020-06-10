import { Not, System } from 'ecsy';
import * as THREE from 'three';
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

import {
    PhysicsWorld,
    Scene,
    SoftBody,
    SoftBodyInitialized } from '../components';


/**
 * Soft body system.
 */
export class SoftBodySystem extends System {

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
        softBodies: {
            components: [ SoftBody, Not(SoftBodyInitialized) ],
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
        this.queries.softBodies.added.forEach(entity => this.initializeSoftBody(entity));
    }

    /**
     * Process the given buffer geometry to be deformed by the results of the
     * soft body physics simulation.
     *
     * @param {THREE.BufferGeometry} bufferGeometry The geometry to process.
     */
    processGeometry(bufferGeometry) {
        // Only consider the position values when merging the vertices:
        const positionOnlyBufferGeometry = new THREE.BufferGeometry();
        positionOnlyBufferGeometry.setAttribute('position', bufferGeometry.getAttribute('position'));
        positionOnlyBufferGeometry.setIndex(bufferGeometry.getIndex());

        // Merge the vertices so the triangle soup is converted to indexed triangles:
        const indexedBufferGeom = BufferGeometryUtils.mergeVertices(positionOnlyBufferGeometry);

        // Create index arrays mapping the indexed vertices to `bufferGeometry` vertices:
        return this.mapIndices(bufferGeometry, indexedBufferGeom);
    }

    /**
     * Check if the 2 given points are equal, based on the comparison of their
     * coordinates against an epsilon value.
     *
     * @param {number} x1 X coordinate of the frist point.
     * @param {number} y1 Y coordinate of the first point.
     * @param {number} z1 Z coordinate of the first point.
     * @param {number} x2 X coordinate of the second point.
     * @param {number} y2 Y coordinate of the second point.
     * @param {number} z2 Z coordinate of the second point.
     * @param {number} epsilon An arbitrary epsilon value.
     * @return {boolean} `true` if the 2 given points are considered equal,
     * `false` otherwise.
     */
    pointsAreEqual(x1, y1, z1, x2, y2, z2, epsilon = 0.000001) {
        return Math.abs(x2 - x1) < epsilon
            && Math.abs(y2 - y1) < epsilon
            && Math.abs(z2 - z1) < epsilon;
    }

    /**
     * Return a mapping of the given THREE buffer geometry to AMMO.js's physics
     * world properties, so the mesh can be deformed by the results of the
     * simulation.
     *
     * @param {THREE.BufferGeometry} bufferGeometry Original buffer geometry of
     * the Entity to deform.
     * @param {THREE.BufferGeometry} indexedBufferGeometry Merged vertices of
     * the Entity to deform.
     */
    mapIndices(bufferGeometry, indexedBufferGeometry) {
        const vertices = bufferGeometry.attributes.position.array;
        const indexedVertices = indexedBufferGeometry.attributes.position.array;
        const indices = indexedBufferGeometry.index.array;

        const indexedVerticesCount = indexedVertices.length / 3;
        const verticesCount = vertices.length / 3;

        const ammoVertices = indexedVertices;
        const ammoIndices = indices;
        /** @type {number[][]} */
        const ammoIndexAssociation = [];

        for (let i = 0; i < indexedVerticesCount; ++i) {
            const association = [];
            ammoIndexAssociation.push(association);

            const i3 = i * 3;
            for (let j = 0; j < verticesCount; ++j) {
                const j3 = j * 3;
                if (this.pointsAreEqual(
                        indexedVertices[i3], indexedVertices[i3 + 1], indexedVertices[i3 + 2],
                        vertices[j3], vertices[j3 + 1], vertices[j3 + 2])) {
                    association.push(j3);
                }
            }
        }

        return { ammoVertices, ammoIndices, ammoIndexAssociation };
    }

    /**
     * Initialize the given Entity with a `SoftBody` Component.
     *
     * @param {ecsy.Entity} entity Entity with a `SoftBody` Component to
     * initialize.
     */
    initializeSoftBody(entity) {
        const physicsWorldEntity = this.queries.physicsWorld.results[0];
        const { physicsWorld } = physicsWorldEntity.getComponent(PhysicsWorld);

        const { scene } = this.queries.scene.results[0].getComponent(Scene);

        const softBody = entity.getComponent(SoftBody);
        const { bufferGeometry, mass, pressure, margin, material } = softBody;

        const { ammoVertices, ammoIndices, ammoIndexAssociation } = this.processGeometry(bufferGeometry);

        const volume = new THREE.Mesh(bufferGeometry, material);
        volume.castShadow = true;
        volume.receiveShadow = true;
        volume.frustumCulled = false;
        scene.add(volume);

        // Create volume physic object:
        const softBodyHelpers = new Ammo.btSoftBodyHelpers();
        const volumeSoftBody = softBodyHelpers.CreateFromTriMesh(
            physicsWorld.getWorldInfo(),
            ammoVertices,
            ammoIndices,
            ammoIndices.length / 3,
            true);

        const softBodyConfig = volumeSoftBody.get_m_cfg();
        softBodyConfig.set_viterations(40);
        softBodyConfig.set_piterations(40);

        // Enable soft-soft body and soft-rigid body collisions:
        softBodyConfig.set_collisions(0x11);

        // Set friction, damping, pressure and stiffness:
        softBodyConfig.set_kDF(0.1);
        softBodyConfig.set_kDP(0.01);
        softBodyConfig.set_kPR(pressure);
        volumeSoftBody.get_m_materials().at(0).set_m_kLST(0.9);
        volumeSoftBody.get_m_materials().at(0).set_m_kAST(0.9);

        volumeSoftBody.setTotalMass(mass, false);
        Ammo.castObject(volumeSoftBody, Ammo.btCollisionObject).getCollisionShape().setMargin(margin);
        physicsWorld.addSoftBody(volumeSoftBody, 1, -1);
        softBody.physicsBody = volumeSoftBody;

        // Disable deactivation:
        volumeSoftBody.setActivationState(4);

        softBody.volume = volume;
        softBody.ammoVertices = ammoVertices;
        softBody.ammoIndices = ammoIndices;
        softBody.ammoIndexAssociation = ammoIndexAssociation;

        // Add a Component signaling that the Soft Body was initialized, so the
        // system can go to sleep and avoid calling `execute()` again until a
        // new Soft Body is added to the World.
        entity.addComponent(SoftBodyInitialized);
    }
}
