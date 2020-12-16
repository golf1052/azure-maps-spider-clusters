import * as azmaps from 'azure-maps-control';

/** An object that contains all the layers within a spider cluster manager. */
export interface SpiderClusterLayers {
    /** The provided layer that renders clustered data. */
    clusterLayer: azmaps.layer.BubbleLayer | azmaps.layer.SymbolLayer;

    /** The provided layer that renders unclustered data. */
    unclustedLayer: azmaps.layer.BubbleLayer | azmaps.layer.SymbolLayer;

    /** An internal layer that renders features within a cluster. Grabs style options from the `unclustedLayer` when `SpiderClusterManager` initialized. */
    spiderFeatureLayer: azmaps.layer.BubbleLayer | azmaps.layer.SymbolLayer;

    /** An internal layer used to render connecting lines between preview features and their respective cluster. */
    spiderLineLayer: azmaps.layer.LineLayer;
}