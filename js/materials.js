import * as THREE from 'three';


/**
 * Cache of Materials that have already been loaded.
 *
 * @type {Map<string,THREE.MeshStandardMaterial>}
 */
const materialCache = new Map();

/**
 * THREE texture loader, caching and de-duping textures.
 *
 * @type {THREE.TextureLoader}
 */
const textureLoader = new THREE.TextureLoader();


/**
 * Asynchronously load a texture from the given map file path.
 *
 * @param {string} materialID Unique identifier of the material for which to
 * load the material texture.
 * @param {string} textureMapFile File name of the texture map.
 * @return {Promise<THREE.Texture>} A Promise to be fulfilled with the texture
 * loaded from the given map file path.
 */
function asyncLoader(materialID, textureMapFile) {
    const textureMapPath = `./${getMaterialPath(materialID)}/${textureMapFile}`;
    return new Promise(resolve => {
        textureLoader.load(textureMapPath, texture => {
            resolve(texture);
        });
    });
}

/**
 * Return the folder path for the given material ID.
 *
 * @param {string} materialID Unique identifier of the material for which to
 * return the folder path.
 * @return {string} Folder path for the given Mmterial ID.
 */
function getMaterialPath(materialID) {
    return `./textures/${materialID}`;
}


/**
 * Return the texture used for the environment map.
 *
 * @return {Promise<THREE.CubeTexture>} A Promise to be fulfilled with the
 * texture to be used for the environment map.
 */
export async function getEnvironmentMap() {
    const materialID = 'cube-map';
    if (materialCache.has(materialID)) {
        return materialCache.get(materialID);
    }

    const texture = await new Promise(resolve => {
        new THREE.CubeTextureLoader()
            .setPath('textures/cube-map/')
            .load(['px.jpg', 'nx.jpg', 'py.jpg', 'ny.jpg', 'pz.jpg', 'nz.jpg'], textureCube => {
                resolve(textureCube);
            });
    });

    materialCache.set(materialID, texture);
    return texture;
}

export async function getSkinPBRMaterial() {
    const materialID = 'skin';
    if (materialCache.has(materialID)) {
        return materialCache.get(materialID);
    }

    const [ map, aoMap, /*displacementMap,*/ normalMap, roughnessMap ] = await Promise.all([
        asyncLoader(materialID, 'Skin_Human_002_COLOR.png'),
        asyncLoader(materialID, 'Skin_Human_002_OCC.png'),
        // asyncLoader(materialID, 'Skin_Human_002_DISP.png'),
        asyncLoader(materialID, 'Skin_Human_002_NRM.png'),
        asyncLoader(materialID, 'Skin_Human_002_SPEC.png')
    ]);

    const material = new THREE.MeshStandardMaterial({
        map,
        // displacementMap,
        normalMap,
        normalScale: new THREE.Vector2(5.0, 5.0),
        aoMap,
        roughnessMap
    });
    materialCache.set(materialID, material);
    return material;
}

export async function getAbstractOrganic3PBRMaterial() {
    const materialID = 'abstract-organic-3';
    if (materialCache.has(materialID)) {
        return materialCache.get(materialID);
    }

    const [ map, normalMap, displacementMap, roughnessMap, aoMap ] = await Promise.all([
        asyncLoader(materialID, 'Abstract_Organic_003_basecolor.jpg'),
        asyncLoader(materialID, 'Abstract_Organic_003_normal.jpg'),
        asyncLoader(materialID, 'Abstract_Organic_003_height.png'),
        asyncLoader(materialID, 'Abstract_Organic_003_roughness.jpg'),
        asyncLoader(materialID, 'Abstract_Organic_003_ambientOcclusion.jpg')
    ]);

    const material = new THREE.MeshStandardMaterial({
        map,
        displacementMap,
        normalMap,
        aoMap,
        roughnessMap
    });
    materialCache.set(materialID, material);
    return material;
}

export async function getAbstractOrganic2PBRMaterial() {
    const materialID = 'abstract-organic-2';
    if (materialCache.has(materialID)) {
        return materialCache.get(materialID);
    }

    const [ map, normalMap, displacementMap, roughnessMap, aoMap ] = await Promise.all([
        asyncLoader(materialID, 'Abstract_Organic_002_COLOR.jpg'),
        asyncLoader(materialID, 'Abstract_Organic_002_NORM.jpg'),
        asyncLoader(materialID, 'Abstract_Organic_002_DISP.png'),
        asyncLoader(materialID, 'Abstract_Organic_002_ROUGH.jpg'),
        asyncLoader(materialID, 'Abstract_Organic_002_OCC.jpg')
    ]);

    const material = new THREE.MeshStandardMaterial({
        map,
        displacementMap,
        displacementScale: 0.1,
        normalMap,
        aoMap,
        roughnessMap
    });
    materialCache.set(materialID, material);
    return material;
}

export async function getAbstractOrganic1PBRMaterial() {
    const materialID = 'abstract-organic-1';
    if (materialCache.has(materialID)) {
        return materialCache.get(materialID);
    }

    const [ map, normalMap, displacementMap, roughnessMap, aoMap ] = await Promise.all([
        asyncLoader(materialID, 'Organic_matter_001_COLOR.jpg'),
        asyncLoader(materialID, 'Organic_matter_001_NORM.jpg'),
        asyncLoader(materialID, 'Organic_matter_001_DISP.png'),
        asyncLoader(materialID, 'Organic_matter_001_SPEC.jpg'),
        asyncLoader(materialID, 'Organic_matter_001_OCC.jpg')
    ]);

    const material = new THREE.MeshStandardMaterial({
        map,
        displacementMap,
        // displacementScale: 0.1,
        normalMap,
        aoMap,
        roughnessMap,
        roughness: 5.0
    });
    materialCache.set(materialID, material);
    return material;
}

export async function getAbstract3PBRMaterial() {
    const materialID = 'abstract-3';
    if (materialCache.has(materialID)) {
        return materialCache.get(materialID);
    }

    const [ map, normalMap, displacementMap, roughnessMap, aoMap ] = await Promise.all([
        asyncLoader(materialID, 'Abstract_003_COLOR.jpg'),
        asyncLoader(materialID, 'Abstract_003_NRM.jpg'),
        asyncLoader(materialID, 'Abstract_003_DISP.png'),
        asyncLoader(materialID, 'Abstract_003_SPEC.jpg'),
        asyncLoader(materialID, 'Abstract_003_OCC.jpg')
    ]);

    const material = new THREE.MeshStandardMaterial({
        map,
        displacementMap,
        displacementScale: 0.5,
        normalMap,
        aoMap,
        roughnessMap
    });
    materialCache.set(materialID, material);
    return material;
}

export async function getAbstract8PBRMaterial() {
    const materialID = 'abstract-8';
    if (materialCache.has(materialID)) {
        return materialCache.get(materialID);
    }

    const [ map, normalMap, displacementMap, roughnessMap, aoMap, metalnessMap ] = await Promise.all([
        asyncLoader(materialID, 'Abstract_008_basecolor.jpg'),
        asyncLoader(materialID, 'Abstract_008_normal.jpg'),
        asyncLoader(materialID, 'Abstract_008_height.png'),
        asyncLoader(materialID, 'Abstract_008_roughness.jpg'),
        asyncLoader(materialID, 'Abstract_008_ambientOcclusion.jpg'),
        asyncLoader(materialID, 'Abstract_008_metallic.jpg')
    ]);

    const material = new THREE.MeshStandardMaterial({
        map,
        displacementMap,
        normalMap,
        aoMap,
        roughnessMap,
        metalnessMap
    });
    materialCache.set(materialID, material);
    return material;
}

export async function getMetalPlate10PBRMaterial(type = 'A') {
    const materialID = 'metal-plate-10';
    if (materialCache.has(materialID)) {
        return materialCache.get(materialID);
    }

    const [ map, normalMap, displacementMap, roughnessMap, aoMap, metalnessMap ] = await Promise.all([
        asyncLoader(materialID, 'Metal_Plate_010_baseColor_${type}.jpg'),
        asyncLoader(materialID, 'Metal_Plate_010_normal.jpg'),
        asyncLoader(materialID, 'Metal_Plate_010_height.png'),
        asyncLoader(materialID, 'Metal_Plate_010_roughness_${type}.jpg'),
        asyncLoader(materialID, 'Metal_Plate_010_ambientOcclusion.jpg'),
        asyncLoader(materialID, 'Metal_Plate_010_metallic_${type}.jpg')
    ]);

    const material = new THREE.MeshStandardMaterial({
        map,
        displacementMap,
        normalMap,
        aoMap,
        roughnessMap,
        metalnessMap
    });
    materialCache.set(materialID, material);
    return material;
}

export async function getMetalGrill7PBRMaterial() {
    const materialID = 'metal-grill-7';
    if (materialCache.has(materialID)) {
        return materialCache.get(materialID);
    }

    const [ map, normalMap, displacementMap, roughnessMap, aoMap, metalnessMap ] = await Promise.all([
        asyncLoader(materialID, 'Metal_Grill_007_basecolor.jpg'),
        asyncLoader(materialID, 'Metal_Grill_007_normal.jpg'),
        asyncLoader(materialID, 'Metal_Grill_007_height.png'),
        asyncLoader(materialID, 'Metal_Grill_007_roughness.jpg'),
        asyncLoader(materialID, 'Metal_Grill_007_ambientOcclusion.jpg'),
        asyncLoader(materialID, 'Metal_Grill_007_Metallic.jpg')
    ]);

    const material = new THREE.MeshStandardMaterial({
        map,
        displacementMap,
        displacementScale: 0.1,
        normalMap,
        aoMap,
        roughnessMap,
        metalnessMap
    });
    materialCache.set(materialID, material);
    return material;
}

export async function getMetalGrunge4PBRMaterial() {
    const materialID = 'metal-grunge-4';
    if (materialCache.has(materialID)) {
        return materialCache.get(materialID);
    }

    const [ map, normalMap, displacementMap, roughnessMap, aoMap ] = await Promise.all([
        asyncLoader(materialID, 'Metal_Grunge_004_COLOR.jpg'),
        asyncLoader(materialID, 'Metal_Grunge_004_NORM.jpg'),
        asyncLoader(materialID, 'Metal_Grunge_004_DISP.png'),
        asyncLoader(materialID, 'Metal_Grunge_004_ROUGH.jpg'),
        asyncLoader(materialID, 'Metal_Grunge_004_OCC.jpg')
    ]);

    const envMap = await getEnvironmentMap();
    const material = new THREE.MeshStandardMaterial({
        map,
        displacementMap,
        displacementScale: 0.1,
        normalMap,
        aoMap,
        roughnessMap,
        envMap
    });
    materialCache.set(materialID, material);
    return material;
}

export async function getWoodFloor7BRMaterial(repeatS = 1, repeatT = 1) {
    const materialID = 'wood-floor-7';
    if (materialCache.has(materialID)) {
        return materialCache.get(materialID);
    }

    const maps = await Promise.all([
        asyncLoader(materialID, 'Wood_Floor_007_COLOR.jpg'),
        asyncLoader(materialID, 'Wood_Floor_007_NORM.jpg'),
        // asyncLoader(materialID, 'Wood_Floor_007_DISP.png'),
        asyncLoader(materialID, 'Wood_Floor_007_ROUGH.jpg'),
        asyncLoader(materialID, 'Wood_Floor_007_OCC.jpg')
    ]);

    if (repeatS > 1 || repeatT > 1) {
        for (const map of maps) {
            map.wrapS = THREE.RepeatWrapping;
            map.wrapT = THREE.RepeatWrapping;
            map.repeat.set(repeatS, repeatT);
        }
    }

    const envMap = await getEnvironmentMap();
    const [ map, normalMap, /*displacementMap,*/ roughnessMap, aoMap ] = maps;
    const material = new THREE.MeshStandardMaterial({
        map,
        // displacementMap,
        // displacementScale: 0.1,
        normalMap,
        aoMap,
        roughnessMap,
        envMap
    });
    materialCache.set(materialID, material);
    return material;
}

export async function getTilesSeamless1BRMaterial(repeatS = 1, repeatT = 1) {
    const materialID = 'tiles-seamless-1';
    if (materialCache.has(materialID)) {
        return materialCache.get(materialID);
    }

    const maps = await Promise.all([
        asyncLoader(materialID, 'Tiles_seamless_001_diffuse_COLOR.png'),
        asyncLoader(materialID, 'Tiles_seamless_001_diffuse_NRM.png'),
        asyncLoader(materialID, 'Tiles_seamless_001_diffuse_DISP.png'),
        asyncLoader(materialID, 'Tiles_seamless_001_diffuse_SPEC.png'),
        asyncLoader(materialID, 'Tiles_seamless_001_diffuse_OCC.png')
    ]);

    if (repeatS > 1 || repeatT > 1) {
        for (const map of maps) {
            map.wrapS = THREE.RepeatWrapping;
            map.wrapT = THREE.RepeatWrapping;
            map.repeat.set(repeatS, repeatT);
        }
    }

    const [ map, normalMap, displacementMap, roughnessMap, aoMap ] = maps;
    const material = new THREE.MeshStandardMaterial({
        map,
        displacementMap,
        displacementScale: 0.1,
        normalMap,
        aoMap,
        roughnessMap
    });
    materialCache.set(materialID, material);
    return material;
}

export async function getMarbleTiles1BRMaterial(repeatS = 4, repeatT = 4) {
    const materialID = 'marble-tiles-1';
    if (materialCache.has(materialID)) {
        return materialCache.get(materialID);
    }

    const maps = await Promise.all([
        asyncLoader(materialID, 'Marble_Tiles_001_basecolor.jpg'),
        asyncLoader(materialID, 'Marble_Tiles_001_normal.jpg'),
        asyncLoader(materialID, 'Marble_Tiles_001_height.png'),
        asyncLoader(materialID, 'Marble_Tiles_001_roughness.jpg'),
        asyncLoader(materialID, 'Marble_Tiles_001_ambientOcclusion.jpg')
    ]);

    if (repeatS > 1 || repeatT > 1) {
        for (const map of maps) {
            map.wrapS = THREE.RepeatWrapping;
            map.wrapT = THREE.RepeatWrapping;
            map.repeat.set(repeatS, repeatT);
        }
    }

    const envMap = await getEnvironmentMap();
    const [ map, normalMap, bumpMap, roughnessMap, aoMap ] = maps;
    const material = new THREE.MeshStandardMaterial({
        map,
        bumpMap,
        normalMap,
        aoMap,
        roughnessMap,
        envMap
    });
    materialCache.set(materialID, material);
    return material;
}
