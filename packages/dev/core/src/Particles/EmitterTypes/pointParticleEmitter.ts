import { DeepCopier } from "../../Misc/deepCopier";
import type { Matrix } from "../../Maths/math.vector";
import { Vector3 } from "../../Maths/math.vector";
import { RandomRange } from "../../Maths/math.scalar.functions";
import type { Particle } from "../../Particles/particle";
import type { IParticleEmitterType } from "./IParticleEmitterType";
import type { UniformBufferEffectCommonAccessor } from "../../Materials/uniformBufferEffectCommonAccessor";
import type { UniformBuffer } from "../../Materials/uniformBuffer";
/**
 * Particle emitter emitting particles from a point.
 * It emits the particles randomly between 2 given directions.
 */
export class PointParticleEmitter implements IParticleEmitterType {
    /**
     * Random direction of each particle after it has been emitted, between direction1 and direction2 vectors.
     */
    public direction1 = new Vector3(0, 1.0, 0);
    /**
     * Random direction of each particle after it has been emitted, between direction1 and direction2 vectors.
     */
    public direction2 = new Vector3(0, 1.0, 0);

    /**
     * Creates a new instance PointParticleEmitter
     */
    constructor() {}

    /**
     * Called by the particle System when the direction is computed for the created particle.
     * @param worldMatrix is the world matrix of the particle system
     * @param directionToUpdate is the direction vector to update with the result
     * @param particle is the particle we are computed the direction for
     * @param isLocal defines if the direction should be set in local space
     */
    public startDirectionFunction(worldMatrix: Matrix, directionToUpdate: Vector3, particle: Particle, isLocal: boolean): void {
        const randX = RandomRange(this.direction1.x, this.direction2.x);
        const randY = RandomRange(this.direction1.y, this.direction2.y);
        const randZ = RandomRange(this.direction1.z, this.direction2.z);

        if (isLocal) {
            directionToUpdate.copyFromFloats(randX, randY, randZ);
            return;
        }

        Vector3.TransformNormalFromFloatsToRef(randX, randY, randZ, worldMatrix, directionToUpdate);
    }

    /**
     * Called by the particle System when the position is computed for the created particle.
     * @param worldMatrix is the world matrix of the particle system
     * @param positionToUpdate is the position vector to update with the result
     * @param particle is the particle we are computed the position for
     * @param isLocal defines if the position should be set in local space
     */
    public startPositionFunction(worldMatrix: Matrix, positionToUpdate: Vector3, particle: Particle, isLocal: boolean): void {
        if (isLocal) {
            positionToUpdate.copyFromFloats(0, 0, 0);
            return;
        }
        Vector3.TransformCoordinatesFromFloatsToRef(0, 0, 0, worldMatrix, positionToUpdate);
    }

    /**
     * Clones the current emitter and returns a copy of it
     * @returns the new emitter
     */
    public clone(): PointParticleEmitter {
        const newOne = new PointParticleEmitter();

        DeepCopier.DeepCopy(this, newOne);

        return newOne;
    }

    /**
     * Called by the GPUParticleSystem to setup the update shader
     * @param uboOrEffect defines the update shader
     */
    public applyToShader(uboOrEffect: UniformBufferEffectCommonAccessor): void {
        uboOrEffect.setVector3("direction1", this.direction1);
        uboOrEffect.setVector3("direction2", this.direction2);
    }

    /**
     * Creates the structure of the ubo for this particle emitter
     * @param ubo ubo to create the structure for
     */
    public buildUniformLayout(ubo: UniformBuffer): void {
        ubo.addUniform("direction1", 3);
        ubo.addUniform("direction2", 3);
    }

    /**
     * Returns a string to use to update the GPU particles update shader
     * @returns a string containing the defines string
     */
    public getEffectDefines(): string {
        return "#define POINTEMITTER";
    }

    /**
     * Returns the string "PointParticleEmitter"
     * @returns a string containing the class name
     */
    public getClassName(): string {
        return "PointParticleEmitter";
    }

    /**
     * Serializes the particle system to a JSON object.
     * @returns the JSON object
     */
    public serialize(): any {
        const serializationObject: any = {};

        serializationObject.type = this.getClassName();
        serializationObject.direction1 = this.direction1.asArray();
        serializationObject.direction2 = this.direction2.asArray();

        return serializationObject;
    }

    /**
     * Parse properties from a JSON object
     * @param serializationObject defines the JSON object
     */
    public parse(serializationObject: any): void {
        Vector3.FromArrayToRef(serializationObject.direction1, 0, this.direction1);
        Vector3.FromArrayToRef(serializationObject.direction2, 0, this.direction2);
    }
}
