import { SpiderClusterEventArg } from './SpiderClusterEventArg';

/** The events supported by the `SpiderClusterManager`. */
export interface SpiderClusterManagerEvents {
    /** Event fired when an individual point feature is clicked. If the point feature is part of a cluster, the cluster will also be returned in event arguments. */
    featureSelected: SpiderClusterEventArg;

    /** Event fired when a point feature is unselected or a spider cluster is collapsed. */
    featureUnselected: void;
}
