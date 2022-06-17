import * as azmaps from 'azure-maps-control';

declare namespace atlas {

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

    /** Event argument for when a feature in a spider cluster is selected. */
    export interface SpiderClusterEventArg {
        /** The cluster the selected feature belongs to. */
        cluster: azmaps.data.Feature<azmaps.data.Point, any>;

        /** The shape feature that was selected. */
        shape: azmaps.Shape;
    }

    /** The events supported by the `SpiderClusterManager`. */
    export interface SpiderClusterManagerEvents {
        /** Event fired when an individual point feature is clicked. If the point feature is part of a cluster, the cluster will also be returned in event arguments. */
        featureSelected: SpiderClusterEventArg;

        /** Event fired when a point feature is unselected or a spider cluster is collapsed. */
        featureUnselected: void;
    }

    /**
    * Options used to customize how the SpiderClusterManager renders clusters.
    */
    export interface SpiderClusterOptions {
        /** Minimium number of point features in cluster before switching from circle to spiral spider layout. Default: `6` */
        circleSpiralSwitchover?: number;

        /** The minimum pixel distance between point features and the cluster, when rendering spider layout as a circle. Default: `30` */
        minCircleLength?: number;

        /** The minimum angle between point features in the spiral. Default: `25` */
        minSpiralAngleSeperation?: number;

        /** The maximum number of features that can be rendered in the spider layout. When the cluster is bigger than this value, it will zoom until the cluster starts to break apart. Default: `100` */
        maxFeaturesInWeb?: number;

        /** A factor that is used to grow the pixel distance of each point feature from the center in the spiral. Default: `5` */
        spiralDistanceFactor?: number;

        /** Layer options used to style the stick connecting the individual point feature to the cluster. */
        stickLayerOptions?: azmaps.LineLayerOptions;

        /** A boolean indicating if the expanded spider visualization should be displayed or not. Default: `true`  */
        visible?: boolean;
    }

    /**
    * Adds a visualization to the map which expands clusters into a spiral spider layout.
    */
    export class SpiderClusterManager extends azmaps.internal.EventEmitter<SpiderClusterManagerEvents> {

        /**********************
        * Constructor
        ***********************/

        /**
        * @constructor
        * A cluster manager that expands clusters when selectd into a spiral layout.
        * @param map A map instance to add the cluster layer to.
        * @param clusterLayer The layer used for rendering the clusters.
        * @param unclustedLayer The rendering layer used for displaying unclustered data (individual features).
        * @param options A combination of SpiderClusterManager and Cluster options.
        */
        constructor(map: azmaps.Map, clusterLayer: azmaps.layer.BubbleLayer | azmaps.layer.SymbolLayer,
            unclustedLayer: azmaps.layer.BubbleLayer | azmaps.layer.SymbolLayer, options?: SpiderClusterOptions);

        /**********************
        * Public Functions
        ***********************/

        /**
        * Disposes the SpiderClusterManager and releases it's resources.
        */
        public dispose(): void;

        /**
         * Gets all layers managed by the spider cluster manager.
         */
         public getLayers(): SpiderClusterLayers;

        /**
         * Gets the options of the SpiderClusterManager.
         */
         public getOptions(): SpiderClusterOptions;

        /**
        * Collapses any open/expanded spider clusters.
        */
         public hideSpiderCluster();

        /**
        * Sets the options used to customize how the SpiderClusterManager renders clusters.
        * @param options The options used to customize how the SpiderClusterManager renders clusters.
        */
        public setOptions(options: SpiderClusterOptions): void;

        /**
        * Expands a cluster into it's open spider layout.
        * @param cluster The cluster to show in it's open spider layout.
        */
        public showSpiderCluster(cluster: azmaps.data.Feature<azmaps.data.Point, azmaps.ClusteredProperties>): void;
    }
}

/**
 * This module partially defines the map control.
 * This definition only includes the features added by using the drawing tools.
 * For the base definition see:
 * https://docs.microsoft.com/javascript/api/azure-maps-control/?view=azure-maps-typescript-latest
 */
declare module "azure-maps-control" {
    /**
     * This interface partially defines the map control's `EventManager`.
     * This definition only includes the method added by using the drawing tools.
     * For the base definition see:
     * https://docs.microsoft.com/javascript/api/azure-maps-control/atlas.eventmanager?view=azure-maps-typescript-latest
     */
    export interface EventManager {
        /**
         * Adds an event to the `SpiderClusterManager`.
         * @param eventType The event name.
         * @param target The `SpiderClusterManager` to add the event for.
         * @param callback The event handler callback.
         */
        add(eventType: "featureSelected", target: atlas.SpiderClusterManager, callback: (e: atlas.SpiderClusterEventArg) => void): void;

        /**
         * Adds an event to the `SpiderClusterManager`.
         * @param eventType The event name.
         * @param target The `SpiderClusterManager` to add the event for.
         * @param callback The event handler callback.
         */
        add(eventType: "featureUnselected", target: atlas.SpiderClusterManager, callback: () => void): void;

        /**
         * Adds an event to the `SpiderClusterManager` once.
         * @param eventType The event name.
         * @param target The `SpiderClusterManager` to add the event for.
         * @param callback The event handler callback.
         */
        addOnce(eventType: "featureSelected", target: atlas.SpiderClusterManager, callback: (e: atlas.SpiderClusterEventArg) => void): void;

        /**
         * Adds an event to the `SpiderClusterManager` once.
         * @param eventType The event name.
         * @param target The `SpiderClusterManager` to add the event for.
         * @param callback The event handler callback.
         */
        addOnce(eventType: "featureUnselected", target: atlas.SpiderClusterManager, callback: () => void): void;

        /**
         * Removes an event listener from the `SpiderClusterManager`.
         * @param eventType The event name.
         * @param target The `SpiderClusterManager` to remove the event for.
         * @param callback The event handler callback.
         */
        remove(eventType: string, target: atlas.SpiderClusterManager, callback: (e?: any) => void): void;
    }
}

export = atlas;