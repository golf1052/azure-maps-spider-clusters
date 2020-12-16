import * as azmaps from 'azure-maps-control';

/** Event argument for when a feature in a spider cluster is selected. */
export interface SpiderClusterEventArg {
    /** The cluster the selected feature belongs to. */
    cluster: azmaps.data.Feature<azmaps.data.Point, any>;

    /** The shape feature that was selected. */
    shape: azmaps.Shape;
}