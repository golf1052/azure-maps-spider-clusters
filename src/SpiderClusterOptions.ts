import * as azmaps from 'azure-maps-control';

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

    /** A boolean indicating if the expanded spider visualization should be displayed or not. Default: `true` */
    visible?: boolean;
}